import React from 'react';
import { Search, Filter } from 'lucide-react';

const SearchFilter = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  totalBugs,
  filteredCount
}) => {
  return (
    <div className="bg-dark-200 rounded-lg p-6 mb-8 border border-gray-700">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, tags, or reason..."
            className="input-field w-full pl-10"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="text-gray-400" size={20} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field min-w-[140px]"
          >
            <option value="All">All Status</option>
            <option value="Solved">Solved</option>
            <option value="Unsolved">Unsolved</option>
          </select>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-400 whitespace-nowrap">
          {filteredCount === totalBugs ? (
            `${totalBugs} ${totalBugs === 1 ? 'bug' : 'bugs'}`
          ) : (
            `${filteredCount} of ${totalBugs} ${totalBugs === 1 ? 'bug' : 'bugs'}`
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchFilter;