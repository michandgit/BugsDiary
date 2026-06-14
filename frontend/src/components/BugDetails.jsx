import React from 'react';
import { X, Edit, Trash2, Clock, CheckCircle, Calendar, Tags } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const BugDetails = ({ bug, onClose, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const detectLanguage = (code) => {
    if (!code) return 'text';

    // Simple language detection based on common patterns
    if (code.includes('def ') || code.includes('import ') || code.includes('print(')) return 'python';
    if (code.includes('function ') || code.includes('const ') || code.includes('let ') || code.includes('=>')) return 'javascript';
    if (code.includes('class ') && code.includes('{')) return 'java';
    if (code.includes('#include') || code.includes('int main')) return 'cpp';
    if (code.includes('<div') || code.includes('</div>')) return 'jsx';
    if (code.includes('display:') || code.includes('color:')) return 'css';
    if (code.includes('SELECT') || code.includes('FROM')) return 'sql';

    return 'text';
  };

  return (
    <div className="bg-dark-200 rounded-lg border border-gray-700 max-h-[80vh] overflow-hidden flex flex-col min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-700 min-w-0">
        <h2 className="text-lg font-semibold text-white break-words">Bug Details</h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-200 hover:bg-dark-300 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 min-w-0">
        {/* Title */}
        <h3 className="text-xl font-semibold text-white mb-4 break-words overflow-wrap-anywhere">{bug.title}</h3>

        {/* Status and Date */}
        <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
          <div className={`flex items-center gap-2 ${
            bug.status === 'Solved' ? 'text-green-400' : 'text-yellow-400'
          }`}>
            {bug.status === 'Solved' ? (
              <CheckCircle size={16} />
            ) : (
              <Clock size={16} />
            )}
            {bug.status}
          </div>

          <div className="flex items-center gap-2 text-gray-400">
            <Calendar size={16} />
            {formatDate(bug.date)}
          </div>
        </div>

        {/* Tags */}
        {bug.tags && bug.tags.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3 text-sm text-gray-300">
              <Tags size={16} />
              <span className="font-medium">Tags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {bug.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-900/30 text-blue-300 text-sm px-3 py-1 rounded-full border border-blue-700/30"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
            Description
          </h4>
          <p className="text-gray-300 leading-relaxed break-words overflow-wrap-anywhere">{bug.description}</p>
        </div>

        {/* Error Message */}
        {bug.errorMessage && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-red-400 mb-3 uppercase tracking-wide">
              Error Message / Code
            </h4>
            <div className="bg-red-900/20 border border-red-700/30 rounded-lg overflow-hidden">
              <SyntaxHighlighter
                language={detectLanguage(bug.errorMessage)}
                style={oneDark}
                customStyle={{
                  margin: 0,
                  background: 'transparent',
                  fontSize: '14px',
                  overflow: 'auto',
                  maxWidth: '100%'
                }}
                wrapLongLines={false}
              >
                {bug.errorMessage}
              </SyntaxHighlighter>
            </div>
          </div>
        )}

        {/* Solution */}
        {bug.solution && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-green-400 mb-3 uppercase tracking-wide">
              Solution / Fix
            </h4>
            <div className="bg-green-900/20 border border-green-700/30 rounded-lg overflow-hidden">
              <SyntaxHighlighter
                language={detectLanguage(bug.solution)}
                style={oneDark}
                customStyle={{
                  margin: 0,
                  background: 'transparent',
                  fontSize: '14px',
                  overflow: 'auto',
                  maxWidth: '100%'
                }}
                wrapLongLines={false}
              >
                {bug.solution}
              </SyntaxHighlighter>
            </div>
          </div>
        )}

        {/* Reason */}
        {bug.reason && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-blue-400 mb-3 uppercase tracking-wide">
              Reason / Fix Details
            </h4>
            <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4 overflow-hidden">
              <div className="text-gray-300 whitespace-pre-wrap leading-relaxed text-sm break-words overflow-wrap-anywhere overflow-x-auto">
                {bug.reason}
              </div>
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="text-xs text-gray-500 space-y-1 border-t border-gray-700 pt-4">
          <div>Created: {formatDate(bug.createdAt)}</div>
          {bug.updatedAt && bug.updatedAt !== bug.createdAt && (
            <div>Updated: {formatDate(bug.updatedAt)}</div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 p-6 border-t border-gray-700">
        <button
          onClick={onEdit}
          className="btn-primary flex items-center gap-2 flex-1"
        >
          <Edit size={16} />
          Edit
        </button>
        <button
          onClick={onDelete}
          className="btn-danger px-4"
          title="Delete bug"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default BugDetails;