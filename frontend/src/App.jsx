import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus } from 'lucide-react';
import BugCard from './components/BugCard';
import BugForm from './components/BugForm';
import SearchFilter from './components/SearchFilter';
import BugDetails from './components/BugDetails';
import UserMenu from './components/UserMenu';
import AuthProvider from './context/AuthContext';
import AuthWrapper from './components/AuthWrapper';
import { useAuth } from './context/AuthContext';

const API_BASE_URL = '/api';

// Main Bug Management Component (protected)
function BugDiary() {
  const { user } = useAuth();
  const [bugs, setBugs] = useState([]);
  const [filteredBugs, setFilteredBugs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBug, setEditingBug] = useState(null);
  const [selectedBug, setSelectedBug] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Fetch bugs from API (now user-specific)
  const fetchBugs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/bugs`);
      setBugs(response.data);
      setFilteredBugs(response.data);
    } catch (error) {
      console.error('Error fetching bugs:', error);

      // Handle authentication errors
      if (error.response?.status === 401) {
        console.log('Authentication required - redirecting to login');
        return;
      }

      // Fallback to empty array on other errors
      setBugs([]);
      setFilteredBugs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBugs();
    }
  }, [user]);

  // Filter bugs based on search term and status
  useEffect(() => {
    let filtered = bugs;

    // Filter by status
    if (statusFilter !== 'All') {
      filtered = filtered.filter(bug => bug.status === statusFilter);
    }

    // Filter by search term (title, tags, and reason)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(bug =>
        bug.title.toLowerCase().includes(term) ||
        bug.tags.some(tag => tag.toLowerCase().includes(term)) ||
        (bug.reason && bug.reason.toLowerCase().includes(term))
      );
    }

    setFilteredBugs(filtered);
  }, [bugs, searchTerm, statusFilter]);

  // Create new bug
  const handleCreateBug = async (bugData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/bugs`, bugData);
      setBugs(prev => [response.data, ...prev]);
      setShowForm(false);
    } catch (error) {
      console.error('Error creating bug:', error);

      if (error.response?.status === 401) {
        alert('Your session has expired. Please log in again.');
        return;
      }

      alert('Error creating bug. Please try again.');
    }
  };

  // Update existing bug
  const handleUpdateBug = async (bugData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/bugs/${editingBug.id}`, bugData);
      setBugs(prev => prev.map(bug =>
        bug.id === editingBug.id ? response.data : bug
      ));
      setEditingBug(null);
      setShowForm(false);
      if (selectedBug && selectedBug.id === editingBug.id) {
        setSelectedBug(response.data);
      }
    } catch (error) {
      console.error('Error updating bug:', error);

      if (error.response?.status === 401) {
        alert('Your session has expired. Please log in again.');
        return;
      }

      if (error.response?.status === 404) {
        alert('Bug not found or access denied.');
        fetchBugs(); // Refresh the list
        return;
      }

      alert('Error updating bug. Please try again.');
    }
  };

  // Delete bug
  const handleDeleteBug = async (bugId) => {
    if (!window.confirm('Are you sure you want to delete this bug?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/bugs/${bugId}`);
      setBugs(prev => prev.filter(bug => bug.id !== bugId));
      if (selectedBug && selectedBug.id === bugId) {
        setSelectedBug(null);
      }
    } catch (error) {
      console.error('Error deleting bug:', error);

      if (error.response?.status === 401) {
        alert('Your session has expired. Please log in again.');
        return;
      }

      if (error.response?.status === 404) {
        alert('Bug not found or access denied.');
        fetchBugs(); // Refresh the list
        return;
      }

      alert('Error deleting bug. Please try again.');
    }
  };

  const handleEditBug = (bug) => {
    setEditingBug(bug);
    setShowForm(true);
    setSelectedBug(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingBug(null);
  };

  const handleCardClick = (bug) => {
    setSelectedBug(bug);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-dark-300 overflow-x-hidden">
      <div className="container mx-auto px-4 py-8 max-w-7xl min-w-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">🐛 Bug Diary</h1>
            <p className="text-gray-400">
              Track and solve your coding bugs • Welcome back, {user.name}!
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary flex items-center gap-2 whitespace-nowrap"
            >
              <Plus size={20} />
              Add Bug
            </button>
            <UserMenu />
          </div>
        </div>

        {/* Search and Filter */}
        <SearchFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          totalBugs={bugs.length}
          filteredCount={filteredBugs.length}
        />

        {/* Main Content */}
        <div className="flex gap-8 overflow-hidden min-w-0">
          {/* Bug List */}
          <div className="flex-1 min-w-0 overflow-hidden">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="text-gray-400 mt-4">Loading your bugs...</p>
              </div>
            ) : filteredBugs.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">
                  {bugs.length === 0 ? 'No bugs yet!' : 'No bugs found'}
                </h3>
                <p className="text-gray-400">
                  {bugs.length === 0
                    ? 'Add your first bug to get started.'
                    : 'Try adjusting your search or filter.'
                  }
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredBugs.map(bug => (
                  <BugCard
                    key={bug.id}
                    bug={bug}
                    onClick={() => handleCardClick(bug)}
                    onEdit={() => handleEditBug(bug)}
                    onDelete={() => handleDeleteBug(bug.id)}
                    isSelected={selectedBug?.id === bug.id}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Bug Details Sidebar */}
          {selectedBug && (
            <div className="w-96 max-w-[40vw] flex-shrink-0 min-w-0">
              <BugDetails
                bug={selectedBug}
                onClose={() => setSelectedBug(null)}
                onEdit={() => handleEditBug(selectedBug)}
                onDelete={() => handleDeleteBug(selectedBug.id)}
              />
            </div>
          )}
        </div>

        {/* Bug Form Modal */}
        {showForm && (
          <BugForm
            bug={editingBug}
            onSave={editingBug ? handleUpdateBug : handleCreateBug}
            onClose={handleCloseForm}
          />
        )}
      </div>
    </div>
  );
}

// Main App Component with Authentication
function App() {
  return (
    <AuthProvider>
      <AuthWrapper>
        <BugDiary />
      </AuthWrapper>
    </AuthProvider>
  );
}

export default App;