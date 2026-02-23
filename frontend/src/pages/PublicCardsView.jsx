import { useEffect, useState } from 'react';
import MedicalCard from '../components/cards/MedicalCard';
import { useCards } from '../context/CardsContext';
import ImportPlacementModal from '../components/modals/ImportPlacementModal';

// Dummy fetchPublicCards function (replace with real API call)
const fetchPublicCards = async () => {
  // TODO: Replace with backend fetch
  const local = localStorage.getItem('publicCards');
  return local ? JSON.parse(local) : [];
};

export default function PublicCardsView() {
  const [publicCards, setPublicCards] = useState([]);
  const { addCard } = useCards();
  const [importingCard, setImportingCard] = useState(null);
  const specialties = [
    'consultations',
    'prescriptions',
    'investigations',
    'procedures',
    'templates',
    'calculators',
    'urgences'
  ];
  const sections = [
    'General',
    'Emergency',
    'Algorithm',
    'Management',
    'Diagnosis',
    'Monitoring',
    'Follow-up'
  ];

  useEffect(() => {
    fetchPublicCards().then(setPublicCards);
  }, []);

  const handleImport = (card) => {
    setImportingCard(card);
  };

  const handlePlace = (specialty, section) => {
    addCard({ ...importingCard, isPublic: false, specialty, section });
    setImportingCard(null);
    alert('Card imported to your collection!');
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-blue-700">🌐 Public Cards</h2>
      {publicCards.length === 0 ? (
        <div className="text-gray-500 text-lg">No public cards available.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {publicCards.map((card) => (
            <div key={card.id} className="relative">
              <MedicalCard card={card} />
              <button
                onClick={() => handleImport(card)}
                className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition"
                title="Import this card"
              >
                ➕ Import
              </button>
            </div>
          ))}
        </div>
      )}
      {importingCard && (
        <ImportPlacementModal
          card={importingCard}
          specialties={specialties}
          sections={sections}
          onPlace={handlePlace}
          onClose={() => setImportingCard(null)}
        />
      )}
    </div>
  );
}
