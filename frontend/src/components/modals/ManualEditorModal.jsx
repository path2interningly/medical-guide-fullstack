import { useState } from 'react';
import RichTextEditor from '../editor/RichTextEditor';

export default function ManualEditorModal({ specialty, section, onCreateCard, onClose, editingCard }) {
  const [title, setTitle] = useState(editingCard?.title?.en || editingCard?.title || '');
  const [content, setContent] = useState(editingCard?.content?.en || editingCard?.content || '');
  const [references, setReferences] = useState(editingCard?.references || editingCard?.aiSources || []);
  const [referenceInput, setReferenceInput] = useState('');

  const handleAddReference = () => {
    if (referenceInput.trim()) {
      setReferences([...references, referenceInput.trim()]);
      setReferenceInput('');
    }
  };

  const handleRemoveReference = (idx) => {
    setReferences(references.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }
    if (!content.trim()) {
      alert('Please enter some content');
      return;
    }

    const card = {
      id: editingCard?.id,
      title: title.trim(),
      content: content.trim(),
      references: references,
      aiGenerated: false,
      aiSources: [],
      specialty,
      section
    };

    onCreateCard(card);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-green-50 to-emerald-50">
          <div>
            <h2 className="text-2xl font-bold">📝 {editingCard ? 'Edit Card' : 'Create Card Manually'}</h2>
            <p className="text-xs text-gray-500 mt-1">Direct editing with TinyMCE editor</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter card title..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
            />
          </div>

          {/* Content Editor */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Content
            </label>
            <div className="border rounded-lg overflow-hidden">
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Write your card content here..."
              />
            </div>
          </div>

          {/* References */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              References
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={referenceInput}
                onChange={(e) => setReferenceInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddReference();
                  }
                }}
                placeholder="Add a reference..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
              />
              <button
                onClick={handleAddReference}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Add
              </button>
            </div>
            {references.length > 0 && (
              <div className="space-y-2">
                {references.map((ref, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm text-gray-700">{ref}</span>
                    <button
                      onClick={() => handleRemoveReference(idx)}
                      className="text-red-600 hover:text-red-700 font-semibold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t bg-gray-50 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
          >
            ✓ Save Card
          </button>
        </div>
      </div>
    </div>
  );
}
