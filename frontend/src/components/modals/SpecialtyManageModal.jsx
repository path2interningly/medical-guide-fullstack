import { useState } from 'react';

export default function SpecialtyManageModal({ specialty, specialtyId, links, onUpdateLinks, onClose }) {
  const [editingLinks, setEditingLinks] = useState(links);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const handleAddLink = () => {
    if (newName.trim() && newUrl.trim()) {
      setEditingLinks([...editingLinks, { name: newName, url: newUrl }]);
      setNewName('');
      setNewUrl('');
    }
  };

  const handleEditLink = (index) => {
    setEditingIndex(index);
    setNewName(editingLinks[index].name);
    setNewUrl(editingLinks[index].url);
  };

  const handleSaveLink = (index) => {
    const updated = [...editingLinks];
    updated[index] = { name: newName, url: newUrl };
    setEditingLinks(updated);
    setEditingIndex(null);
    setNewName('');
    setNewUrl('');
  };

  const handleDeleteLink = (index) => {
    setEditingLinks(editingLinks.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onUpdateLinks(editingLinks);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Manage {specialty} Links</h2>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Current Links</h3>
          <div className="space-y-2">
            {editingLinks.map((link, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 bg-gray-100 rounded"
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleEditLink(idx);
                }}
                title="Right-click to edit"
              >
                {editingIndex === idx ? (
                  <>
                    <input
                      type="text"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      placeholder="Link name"
                      className="flex-1 px-2 py-1 border rounded text-sm"
                    />
                    <input
                      type="text"
                      value={newUrl}
                      onChange={e => setNewUrl(e.target.value)}
                      placeholder="URL"
                      className="flex-1 px-2 py-1 border rounded text-sm"
                    />
                    <button
                      onClick={() => handleSaveLink(idx)}
                      className="px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingIndex(null);
                        setNewName('');
                        setNewUrl('');
                      }}
                      className="px-2 py-1 bg-gray-400 text-white rounded text-sm hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex-1">
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        {link.name}
                      </a>
                    </div>
                    <button
                      onClick={() => handleEditLink(idx)}
                      className="px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteLink(idx)}
                      className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6 p-4 bg-blue-50 rounded">
          <h3 className="text-lg font-semibold mb-3">Add New Link</h3>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Link name"
              className="flex-1 px-3 py-2 border rounded"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              placeholder="URL (https://...)"
              className="flex-1 px-3 py-2 border rounded"
            />
            <button
              onClick={handleAddLink}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold"
            >
              Add
            </button>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
