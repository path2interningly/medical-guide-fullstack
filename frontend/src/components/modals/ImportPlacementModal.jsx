import { useState } from 'react';

export default function ImportPlacementModal({ card, specialties, sections, onPlace, onClose }) {
  const [selectedSpecialty, setSelectedSpecialty] = useState(specialties[0] || '');
  const [selectedSection, setSelectedSection] = useState(sections[0] || '');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4 text-blue-700">Choose Placement</h2>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-semibold">Specialty</label>
          <select
            value={selectedSpecialty}
            onChange={e => setSelectedSpecialty(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {specialties.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-semibold">Section</label>
          <select
            value={selectedSection}
            onChange={e => setSelectedSection(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sections.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={() => onPlace(selectedSpecialty, selectedSection)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition font-semibold"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
}
