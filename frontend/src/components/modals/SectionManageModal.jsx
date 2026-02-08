import { useState } from 'react';

const ALL_SECTION_OPTIONS = [
  { id: 'consultations', label: 'Consultations' },
  { id: 'prescriptions', label: 'Prescriptions' },
  { id: 'investigations', label: 'Investigations' },
  { id: 'procedures', label: 'Procedures' },
  { id: 'templates', label: 'Templates' },
  { id: 'calculators', label: 'Calculators' },
  { id: 'urgences', label: 'Emergencies' }
];

export default function SectionManageModal({ specialty, sections, onUpdateSections, onClose }) {
  const [selectedSections, setSelectedSections] = useState(sections);
  const [draggedItem, setDraggedItem] = useState(null);

  const toggleSection = (sectionId) => {
    setSelectedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(s => s !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;

    const newSections = [...selectedSections];
    const [dragged] = newSections.splice(draggedItem, 1);
    newSections.splice(index, 0, dragged);

    setSelectedSections(newSections);
    setDraggedItem(null);
  };

  const handleSave = () => {
    onUpdateSections(selectedSections);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Manage {specialty} Sections</h2>

        <div className="grid grid-cols-2 gap-6">
          {/* Available Sections */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Available Sections</h3>
            <div className="space-y-2">
              {ALL_SECTION_OPTIONS.map(option => (
                <label key={option.id} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSections.includes(option.id)}
                    onChange={() => toggleSection(option.id)}
                    className="w-4 h-4"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Active Sections (Draggable) */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Active Sections (Drag to reorder)</h3>
            <div className="space-y-2 bg-gray-50 p-3 rounded min-h-[300px]">
              {selectedSections.length === 0 ? (
                <p className="text-gray-400 text-sm">No sections selected</p>
              ) : (
                selectedSections.map((sectionId, index) => {
                  const sectionLabel = ALL_SECTION_OPTIONS.find(s => s.id === sectionId)?.label || sectionId;
                  return (
                    <div
                      key={index}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      className="p-2 bg-blue-100 rounded border-2 border-blue-300 cursor-move hover:bg-blue-200 transition"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">⋮⋮</span>
                        <span>{sectionLabel}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end mt-6">
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
