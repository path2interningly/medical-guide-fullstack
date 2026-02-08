import { useState } from 'react';

export default function DosageCalculator({ isOpen, onClose }) {
  const [patientWeight, setPatientWeight] = useState('');
  const [selectedDrug, setSelectedDrug] = useState('amoxicilline');
  const [dosageResult, setDosageResult] = useState(null);

  const drugs = {
    amoxicillin: {
      name: 'Amoxicillin',
      dosage: 25, // mg/kg
      unit: 'mg',
      frequency: '3x/day',
      guideline: 'https://www.uptodate.com/contents/amoxicillin-dosing'
    },
    ibuprofen: {
      name: 'Ibuprofen',
      dosage: 10,
      unit: 'mg/kg',
      frequency: '3-4x/day',
      guideline: 'https://www.uptodate.com/contents/ibuprofen-dosing'
    },
    paracetamol: {
      name: 'Paracetamol',
      dosage: 15,
      unit: 'mg/kg',
      frequency: '4-6x/day',
      guideline: 'https://www.uptodate.com/contents/paracetamol-dosing'
    },
    metformin: {
      name: 'Metformin',
      dosage: 10,
      unit: 'mg/kg',
      frequency: '2x/day',
      guideline: 'https://www.uptodate.com/contents/metformin-dosing'
    },
    lisinopril: {
      name: 'Lisinopril',
      dosage: 0.1,
      unit: 'mg/kg',
      frequency: '1x/day',
      maxDose: 40,
      guideline: 'https://www.uptodate.com/contents/lisinopril-dosing'
    }
  };

  const handleCalculate = () => {
    if (!patientWeight || patientWeight <= 0) return;
    
    const drug = drugs[selectedDrug];
    const totalDose = parseFloat(patientWeight) * drug.dosage;
    const maxDose = drug.maxDose ? Math.min(totalDose, drug.maxDose) : totalDose;
    const singleDose = maxDose / (drug.frequency.split('x')[0]);

    setDosageResult({
      drugName: drug.name,
      totalDailyDose: maxDose.toFixed(1),
      singleDose: singleDose.toFixed(1),
      frequency: drug.frequency,
      unit: drug.unit
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">🧮 Calculateur de Dosage</h2>
          <button
            onClick={onClose}
            className="text-2xl font-bold text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Poids du Patient (kg)</label>
            <input
              type="number"
              value={patientWeight}
              onChange={(e) => setPatientWeight(e.target.value)}
              placeholder="Ex: 70"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Médicament</label>
            <select
              value={selectedDrug}
              onChange={(e) => setSelectedDrug(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(drugs).map(([key, drug]) => (
                <option key={key} value={key}>
                  {drug.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleCalculate}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Calculer
          </button>

          {dosageResult && (
            <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
              <h3 className="font-bold text-lg mb-2">{dosageResult.drugName}</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold">Single dose:</span> {dosageResult.singleDose} {dosageResult.unit}
                </div>
                <div>
                  <span className="font-semibold">Total daily dose:</span> {dosageResult.totalDailyDose} {dosageResult.unit}
                </div>
                <div>
                  <span className="font-semibold">Frequency:</span> {dosageResult.frequency}
                </div>
                <div>
                  <span className="font-semibold">Guideline:</span> <a href={drugs[selectedDrug].guideline} target="_blank" rel="noopener noreferrer" className="underline">View guideline</a>
                </div>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(
                  `${dosageResult.drugName}: ${dosageResult.singleDose} ${dosageResult.unit} ${dosageResult.frequency}`
                )}
                className="w-full mt-3 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-semibold text-sm"
              >
                📋 Copy result
              </button>
            </div>
          )}
        </div>

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
