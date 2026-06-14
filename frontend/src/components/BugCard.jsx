import React from 'react';
import { Edit, Trash2, Clock, CheckCircle } from 'lucide-react';

const BugCard = ({ bug, onClick, onEdit, onDelete, isSelected }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit();
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div
      className={`card cursor-pointer transition-all duration-200 min-w-0 overflow-hidden ${
        isSelected ? 'ring-2 ring-blue-500 bg-dark-100' : 'hover:bg-dark-100'
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4 min-w-0">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 break-words overflow-wrap-anywhere">
            {bug.title}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <div className={`flex items-center gap-1 text-sm ${
              bug.status === 'Solved' ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {bug.status === 'Solved' ? (
                <CheckCircle size={16} />
              ) : (
                <Clock size={16} />
              )}
              {bug.status}
            </div>
            <span className="text-gray-500">•</span>
            <span className="text-gray-400 text-sm">
              {formatDate(bug.date)}
            </span>
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={handleEdit}
            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-dark-300 rounded-lg transition-colors"
            title="Edit bug"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-dark-300 rounded-lg transition-colors"
            title="Delete bug"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <p className="text-gray-300 text-sm mb-4 line-clamp-2">
        {bug.description}
      </p>

      {bug.errorMessage && (
        <div className="mb-4">
          <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-3">
            <h4 className="text-red-400 text-xs font-semibold mb-2 uppercase">Error</h4>
            <code className="text-red-300 text-sm font-mono block overflow-hidden text-ellipsis whitespace-nowrap">
              {bug.errorMessage.split('\n')[0]}
              {bug.errorMessage.split('\n').length > 1 && '...'}
            </code>
          </div>
        </div>
      )}

      {bug.solution && (
        <div className="mb-4">
          <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-3">
            <h4 className="text-green-400 text-xs font-semibold mb-2 uppercase">Solution</h4>
            <code className="text-green-300 text-sm font-mono block overflow-hidden text-ellipsis whitespace-nowrap">
              {bug.solution.split('\n')[0]}
              {bug.solution.split('\n').length > 1 && '...'}
            </code>
          </div>
        </div>
      )}

      {bug.reason && (
        <div className="mb-4">
          <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3 overflow-hidden">
            <h4 className="text-blue-400 text-xs font-semibold mb-2 uppercase">Reason</h4>
            <p className="text-blue-300 text-sm block overflow-hidden text-ellipsis whitespace-nowrap break-all">
              {bug.reason.split('\n')[0]}
              {bug.reason.split('\n').length > 1 && '...'}
            </p>
          </div>
        </div>
      )}

      {bug.tags && bug.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {bug.tags.map((tag, index) => (
            <span
              key={index}
              className="bg-blue-900/30 text-blue-300 text-xs px-2 py-1 rounded-full border border-blue-700/30"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default BugCard;