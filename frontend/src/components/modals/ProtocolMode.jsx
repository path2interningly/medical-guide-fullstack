import { useState } from 'react';

const protocolTemplates = [
  {
    id: 'gynec-emergency',
    name: 'Urgence Gynécologique',
    sections: [
      {
        title: 'Évaluation Initiale',
        items: ['Vitaux complets', 'Anamnèse rapide', 'Examen abdominal', 'Spéculum/toucher']
      },
      {
        title: 'Investigations',
        items: ['Bêta-hCG urinaire', 'Hémoglobine', 'Groupe sanguin', 'Écographie TV']
      },
      {
        title: 'Traitement Empirique',
        items: ['Accès veineux', 'Solutés si choc', 'Antibiotiques si infection']
      }
    ]
  },
  {
    id: 'eclampsia',
    name: 'Protocole Prééclampsie/Éclampsie',
    sections: [
      {
        title: 'Reconnaissance',
        items: ['TA ≥160/110 mmHg', 'Protéinurie ≥1+ ou céphalée', 'Épigastralgie']
      },
      {
        title: 'Stabilisation Immédiate',
        items: ['Transfert en milieu intensif', 'Monitoring continu', 'IV héparine/Mg']
      },
      {
        title: 'Prophylaxie',
        items: ['Sulfate de Mg 4g IV', 'Puis 1g/h jusqu\'à 24h post-partum']
      }
    ]
  },
  {
    id: 'sepsis',
    name: 'Protocole Sepsis',
    sections: [
      {
        title: '1ère Heure',
        items: ['2 hémocultures', 'Lactate veineux', 'Cristalloïdes 30 mL/kg', 'Antibiotiques larges']
      },
      {
        title: 'Evaluation Choc',
        items: ['Hypotension persistante', 'Lactatémie >2 mmol/L', 'Débuter vasopresseurs']
      },
      {
        title: 'Source',
        items: ['Imagerie urgente', 'Drainage si abcès', 'Débridement si nécrose']
      }
    ]
  }
];

export default function ProtocolMode({ isOpen, onClose }) {
  const [selectedProtocol, setSelectedProtocol] = useState(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">📋 Protocoles Cliniques</h2>
          <button
            onClick={onClose}
            className="text-2xl font-bold text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {!selectedProtocol ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {protocolTemplates.map(protocol => (
              <button
                key={protocol.id}
                onClick={() => setSelectedProtocol(protocol)}
                className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition text-left font-semibold"
              >
                {protocol.name}
              </button>
            ))}
          </div>
        ) : (
          <div>
            <button
              onClick={() => setSelectedProtocol(null)}
              className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold"
            >
              ← Retour
            </button>
            <h3 className="text-2xl font-bold mb-4">{selectedProtocol.name}</h3>
            <div className="space-y-6">
              {selectedProtocol.sections.map((section, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                  <h4 className="font-bold text-lg mb-3">{section.title}</h4>
                  <ul className="space-y-2">
                    {section.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                const protocolText = selectedProtocol.sections
                  .map(s => `${s.title}\n${s.items.map(i => `• ${i}`).join('\n')}`)
                  .join('\n\n');
                navigator.clipboard.writeText(`${selectedProtocol.name}\n\n${protocolText}`);
                alert('Protocole copié!');
              }}
              className="w-full mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
            >
              📋 Copier le protocole complet
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-4 px-4 py-2 border rounded-lg hover:bg-gray-50 font-semibold"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
