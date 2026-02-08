import { useState } from 'react';
import { useCards } from '../../context/CardsContext';

export default function TrashModal({ onClose }) {
  const { trashedCards, restoreCard, permanentlyDeleteCard, emptyTrash } = useCards();
  const [confirmEmptyTrash, setConfirmEmptyTrash] = useState(false);

  if (trashedCards.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Trash</h2>
            <button onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-700">×</button>
          </div>
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">Trash is empty</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Trash ({trashedCards.length})</h2>
          <button onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-700">×</button>
        </div>

        <div className="space-y-3 mb-6">
          {trashedCards.map((card) => (
            <div key={card.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 truncate">{card.title?.en || card.title?.fr}</h3>
                <p className="text-xs text-gray-500">
                  Deleted {new Date(card.trashedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2 ml-3">
                <button
                  onClick={() => restoreCard(card.id)}
                  className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition"
                >
                  Restore
                </button>
                <button
                  onClick={() => permanentlyDeleteCard(card.id)}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <button
            onClick={() => setConfirmEmptyTrash(true)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition font-semibold"
          >
            Empty Trash
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition font-semibold"
          >
            Close
          </button>
        </div>

        {confirmEmptyTrash && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-lg p-6 max-w-sm">
              <h3 className="text-lg font-bold mb-4">Permanently delete all items?</h3>
              <p className="text-gray-600 mb-6">This action cannot be undone.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    emptyTrash();
                    setConfirmEmptyTrash(false);
                    onClose();
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition font-semibold"
                >
                  Delete All
                </button>
                <button
                  onClick={() => setConfirmEmptyTrash(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
