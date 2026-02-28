          <div className="mb-6">
            <label className="block font-semibold mb-2">Background Style</label>
            <select className="w-full p-2 rounded border mb-2" onChange={e => onUpdate({ ...settings, backgroundStyle: e.target.value })} value={settings?.backgroundStyle || 'bg-solid'}>
              <option value="bg-solid">Solid</option>
              <option value="bg-gradient-ombre">Ombre Gradient</option>
              <option value="bg-gradient-dark">Dark Gradient</option>
              <option value="bg-animated-gradient">Animated Gradient</option>
              <option value="bg-pattern-dots">Dots Pattern</option>
              <option value="bg-pattern-stripes">Stripes Pattern</option>
              <option value="bg-texture-paper">Paper Texture</option>
              <option value="bg-texture-fabric">Fabric Texture</option>
              <option value="bg-custom-image">Custom Image</option>
            </select>
            {settings?.backgroundStyle === 'bg-custom-image' && (
              <input
                type="text"
                className="w-full p-2 rounded border mt-2"
                placeholder="Enter image URL..."
                value={settings?.backgroundImage || ''}
                onChange={e => onUpdate({ ...settings, backgroundImage: e.target.value })}
              />
            )}
            {/* Preview */}
            <div className={`mt-4 h-16 w-full rounded border ${settings?.backgroundStyle || 'bg-solid'}`}
              style={settings?.backgroundStyle === 'bg-custom-image' && settings?.backgroundImage ? { backgroundImage: `url(${settings.backgroundImage})` } : {}}>
              <span className="block text-xs text-gray-700 text-center pt-5">Preview</span>
            </div>
          </div>
import { useState } from 'react';
import TrashModal from './TrashModal';

export default function SettingsModal({ isOpen, onClose, settings = {}, onUpdate, currentSpecialty, specialties, onAddSpecialty, onRenameSpecialty, onDeleteSpecialty, onUndoSpecialty }) {
  const [showTrash, setShowTrash] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newSpecialtyName, setNewSpecialtyName] = useState('');

  if (!isOpen) return null;

  const handleEditClick = (id, name) => {
    setEditingId(id);
    setEditingName(name);
    setIsAddingNew(false);
  };

  const handleSaveEdit = (id) => {
    if (editingName.trim() && editingName !== specialties[id].name) {
      onRenameSpecialty(id, editingName.trim());
    }
    setEditingId(null);
    setEditingName('');
  };

  const handleDeleteClick = (id) => {
    if (confirm(`Delete specialty "${specialties[id].name}"?`)) {
      onDeleteSpecialty(id);
    }
  };

  const handleAddNewClick = () => {
    setIsAddingNew(true);
    setNewSpecialtyName('');
    setEditingId(null);
  };

  const handleSaveNew = () => {
    if (newSpecialtyName.trim()) {
      onAddSpecialty(newSpecialtyName.trim());
      setIsAddingNew(false);
      setNewSpecialtyName('');
    }
  };

  const handleCancelAdd = () => {
    setIsAddingNew(false);
    setNewSpecialtyName('');
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4">Settings</h2>

          {/* Personalization Controls */}
          <div className="mb-6">
            <label className="block font-semibold mb-2">Theme</label>
            <select className="w-full p-2 rounded border" onChange={e => onUpdate({ ...settings, theme: e.target.value })} value={settings?.theme || 'light'}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <div className="mb-6">
            <label className="block font-semibold mb-2">Font</label>
            <select className="w-full p-2 rounded border" onChange={e => onUpdate({ ...settings, font: e.target.value })} value={settings?.font || 'sans'}>
              <option value="sans">Sans</option>
              <option value="serif">Serif</option>
              <option value="mono">Mono</option>
            </select>
          </div>
          <div className="mb-6">
            <label className="block font-semibold mb-2">Accent Color</label>
            <select className="w-full p-2 rounded border" onChange={e => onUpdate({ ...settings, color: e.target.value })} value={settings?.color || 'blue'}>
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="purple">Purple</option>
            </select>
          </div>

          <div className="space-y-4">
            {/* Specialty Management Section */}
            <div className="p-4 bg-blue-50 rounded border border-blue-200">
              <div className="font-semibold mb-4 text-blue-900 flex items-center justify-between">
                <span>Specialty Management</span>
                <button
                  onClick={handleAddNewClick}
                  className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded transition font-semibold"
                  title="Add a new specialty"
                >
                  ➕ Add
                </button>
              </div>

              {/* Add New Specialty Form */}
              {isAddingNew && (
                <div className="p-3 rounded border-2 border-green-400 bg-green-50 flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={newSpecialtyName}
                    onChange={(e) => setNewSpecialtyName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveNew();
                      if (e.key === 'Escape') handleCancelAdd();
                    }}
                    placeholder="Enter specialty name..."
                    autoFocus
                    className="flex-1 px-2 py-1 border rounded outline-none focus:border-green-500"
                  />
                  <button
                    onClick={handleSaveNew}
                    className="px-2 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded transition"
                    title="Save"
                  >
                    ✓
                  </button>
                  <button
                    onClick={handleCancelAdd}
                    className="px-2 py-1 text-sm bg-gray-400 hover:bg-gray-500 text-white rounded transition"
                    title="Cancel"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Specialty Tabs List */}
              <div className="space-y-2">
                {Object.entries(specialties).length === 0 ? (
                  <div className="text-sm text-gray-500 italic py-4">No specialties yet</div>
                ) : (
                  Object.entries(specialties).map(([id, data]) => (
                    <div
                      key={id}
                      className={`p-3 rounded border-2 flex items-center justify-between transition ${
                        currentSpecialty === id
                          ? 'bg-white border-blue-400 shadow'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {editingId === id ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          autoFocus
                          className="flex-1 px-2 py-1 border rounded outline-none focus:border-blue-500"
                        />
                      ) : (
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">{data.name}</div>
                          {currentSpecialty === id && (
                            <div className="text-xs text-blue-600 font-medium">Currently selected</div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2 ml-2">
                        {editingId === id ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(id)}
                              className="px-2 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded transition"
                              title="Save"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-2 py-1 text-sm bg-gray-400 hover:bg-gray-500 text-white rounded transition"
                              title="Cancel"
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditClick(id, data.name)}
                              className="px-2 py-1 text-sm bg-yellow-100 hover:bg-yellow-200 text-gray-800 rounded transition font-semibold"
                              title="Edit name"
                            >
                              ✏️
                            </button>
                            {Object.keys(specialties).length > 1 && (
                              <button
                                onClick={() => handleDeleteClick(id)}
                                className="px-2 py-1 text-sm bg-red-100 hover:bg-red-200 text-gray-800 rounded transition font-semibold"
                                title="Delete"
                              >
                                🗑️
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Undo Button */}
              {Object.keys(specialties).length > 0 && (
                <button
                  onClick={onUndoSpecialty}
                  className="w-full mt-3 p-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-semibold transition"
                  title="Undo last change"
                >
                  ↩️ Undo Last Change
                </button>
              )}
            </div>

            <button
              onClick={() => setShowTrash(true)}
              className="w-full p-3 bg-red-50 rounded border border-red-200 hover:bg-red-100 transition text-left"
            >
              <div className="font-semibold">🗑️ Trash</div>
              <div className="text-sm text-gray-500">View and manage deleted cards</div>
            </button>

            {/* AI Configuration */}
            <div className="p-3 bg-purple-50 rounded border border-purple-200">
              <div className="font-semibold mb-2 text-purple-900">🤖 AI Configuration</div>
              <div className="space-y-2">
                <label className="block">
                  <div className="text-sm text-gray-700 mb-1">OpenRouter API Key (optional)</div>
                  <input
                    type="password"
                    value={settings?.openRouterApiKey || ''}
                    onChange={(e) => onUpdate({ ...settings, openRouterApiKey: e.target.value })}
                    placeholder="Leave empty to use server key"
                    className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:border-purple-500"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Optional. Use your own key from <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">openrouter.ai/keys</a>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <div className="font-semibold">Show Context Menu Hints</div>
                <div className="text-sm text-gray-500">Display visible affordances for right-click actions</div>
              </div>
              <input
                type="checkbox"
                checked={settings?.showContextHints ?? true}
                onChange={(e) => onUpdate({ ...settings, showContextHints: e.target.checked })}
                className="w-5 h-5"
              />
            </div>

            <div className="p-3 bg-gray-50 rounded">
              <div className="font-semibold mb-2">Keyboard Shortcuts</div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Ctrl+K / : Focus search</li>
                <li>N : Create new card</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Close
            </button>
          </div>
        </div>
      </div>
      {showTrash && <TrashModal onClose={() => setShowTrash(false)} />}
    </>
  );
}
