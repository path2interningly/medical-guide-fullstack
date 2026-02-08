import React, { useState } from 'react';
import { exportCardToPDF } from '../../services/pdfExport';

/**
 * CardDetailModal - Shows full card content with formatting
 */
export default function CardDetailModal({ card, isOpen, onClose, onContinueWithAI, onManualEdit }) {
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !card) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportCardToPDF(card, `${card.title}.pdf`);
    } catch (error) {
      alert('Failed to export PDF: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex-1 pr-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {card.title?.en || card.title?.fr || card.title}
            </h2>
            <div className="mt-2 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onContinueWithAI?.();
                }}
                className="text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1.5 rounded-md hover:from-purple-600 hover:to-blue-600 transition-all shadow-sm font-medium"
                title="Continue editing with AI"
              >
                ✨ Continue with AI
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onManualEdit?.();
                }}
                className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 transition-all shadow-sm font-medium"
                title="Edit manually with rich text editor"
              >
                📝 Manual Edit
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl font-light leading-none flex-shrink-0"
            title="Close (click outside or Esc)"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tags */}
          {card.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {card.tags.map((tag, idx) => (
                <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Main Content */}
          <div className="prose prose-sm max-w-none">
            <div 
              className="text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: card.content?.en || card.content?.fr || card.content || '' 
              }}
            />
          </div>

          {/* Sources/References */}
          {(card.aiSources?.length > 0 || card.references?.length > 0) && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-bold text-gray-600 mb-3">📚 Sources & References:</h3>
              <ul className="space-y-1">
                {(card.aiSources || card.references || []).map((source, idx) => (
                  <li key={idx} className="text-sm text-gray-600">
                    • {typeof source === 'string' ? source : (source.name || source.type || source)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-2"
            title="Export card to PDF"
          >
            {isExporting ? '⏳ Exporting...' : '📄 Export PDF'}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
