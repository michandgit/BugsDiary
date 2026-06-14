import React, { useState, useEffect } from 'react';
import { X, Save, Tag } from 'lucide-react';

const BugForm = ({ bug, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    errorMessage: '',
    solution: '',
    reason: '',
    tags: [],
    status: 'Unsolved'
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (bug) {
      setFormData({
        title: bug.title || '',
        description: bug.description || '',
        errorMessage: bug.errorMessage || '',
        solution: bug.solution || '',
        reason: bug.reason || '',
        tags: bug.tags || [],
        status: bug.status || 'Unsolved'
      });
    }
  }, [bug]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Title and description are required');
      return;
    }
    onSave(formData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddTag(e);
    } else if (e.key === ',' && tagInput.trim()) {
      handleAddTag(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-200 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            {bug ? 'Edit Bug' : 'Add New Bug'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-dark-300 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="input-field w-full"
                placeholder="Brief description of the bug"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="textarea-field w-full h-24"
                placeholder="Detailed description of the issue"
                required
              />
            </div>

            {/* Error Message */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Error Message / Code
              </label>
              <textarea
                name="errorMessage"
                value={formData.errorMessage}
                onChange={handleInputChange}
                className="textarea-field w-full h-32 font-mono text-sm"
                placeholder="Paste error message or problematic code here"
              />
            </div>

            {/* Solution */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Solution / Fix
              </label>
              <textarea
                name="solution"
                value={formData.solution}
                onChange={handleInputChange}
                className="textarea-field w-full h-32 font-mono text-sm"
                placeholder="Solution or fix for the bug"
              />
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Reason / Fix Details
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                className="textarea-field w-full h-40"
                placeholder="Explain why the bug happened, root cause analysis, how it was fixed, and prevention notes for future debugging..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Include: Root cause • Why it happened • How it was fixed • Prevention tips
              </p>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="input-field w-full"
              >
                <option value="Unsolved">Unsolved</option>
                <option value="Solved">Solved</option>
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyPress}
                  className="input-field flex-1"
                  placeholder="Add tags (press Enter or comma to add)"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="btn-secondary px-3"
                  disabled={!tagInput.trim()}
                >
                  <Tag size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-900/30 text-blue-300 text-sm px-3 py-1 rounded-full border border-blue-700/30 flex items-center gap-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-blue-400 hover:text-blue-200"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-700">
            <button
              type="submit"
              className="btn-primary flex items-center gap-2 flex-1"
            >
              <Save size={16} />
              {bug ? 'Update Bug' : 'Save Bug'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary px-6"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BugForm;