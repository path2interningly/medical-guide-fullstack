import { createContext, useContext, useState, useEffect } from 'react';

const SpecialtiesContext = createContext();

export const useSpecialties = () => {
  const context = useContext(SpecialtiesContext);
  if (!context) throw new Error('useSpecialties must be within SpecialtiesProvider');
  return context;
};

const DEFAULT_SPECIALTIES = {
  gynecology: {
    name: 'Gynecology',
    sections: ['consultations', 'prescriptions', 'investigations', 'procedures', 'templates', 'calculators', 'urgences'],
    links: [
      { name: 'SOGC Guidelines', url: 'https://www.sogc.org/guidelines' },
      { name: 'UpToDate Gynecology', url: 'https://www.uptodate.com/contents/gynecology' }
    ]
  },
  obstetrics: {
    name: 'Obstetrics',
    sections: ['consultations', 'prescriptions', 'investigations', 'procedures', 'templates', 'calculators', 'urgences'],
    links: [
      { name: 'SOGC Obstetrics', url: 'https://www.sogc.org/guidelines' },
      { name: 'UpToDate Obstetrics', url: 'https://www.uptodate.com/contents/obstetrics' }
    ]
  },
  surgery: {
    name: 'Surgery',
    sections: ['consultations', 'prescriptions', 'investigations', 'procedures', 'templates', 'calculators', 'urgences'],
    links: [
      { name: 'ACS Surgery Guidelines', url: 'https://www.facs.org/education/patient-education/patient-resources/surgery-guidelines/' },
      { name: 'UpToDate Surgery', url: 'https://www.uptodate.com/contents/surgery' }
    ]
  }
};

export function SpecialtiesProvider({ children }) {
  const [specialties, setSpecialties] = useState(() => {
    const saved = localStorage.getItem('specialties');
    return saved ? JSON.parse(saved) : DEFAULT_SPECIALTIES;
  });
  const [history, setHistory] = useState([]);

  useEffect(() => {
    localStorage.setItem('specialties', JSON.stringify(specialties));
  }, [specialties]);

  const setWithHistory = (updater) => {
    setSpecialties(prev => {
      setHistory(h => [...h, prev]);
      return typeof updater === 'function' ? updater(prev) : updater;
    });
  };

  const undoSpecialtyChanges = () => {
    setHistory(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setSpecialties(last);
      return prev.slice(0, -1);
    });
  };

  const addSpecialty = (id, name) => {
    setWithHistory(prev => ({
      ...prev,
      [id]: {
        name,
        sections: ['consultations', 'prescriptions', 'investigations', 'procedures', 'templates', 'calculators', 'urgences'],
        links: []
      }
    }));
  };

  const deleteSpecialty = (id) => {
    setWithHistory(prev => {
      const newSpecialties = { ...prev };
      delete newSpecialties[id];
      return newSpecialties;
    });
  };

  const updateSpecialtyName = (id, newName) => {
    setWithHistory(prev => ({
      ...prev,
      [id]: { ...prev[id], name: newName }
    }));
  };

  const updateSpecialtySections = (id, sections) => {
    setWithHistory(prev => ({
      ...prev,
      [id]: { ...prev[id], sections }
    }));
  };

  const updateSpecialtyLinks = (id, links) => {
    setWithHistory(prev => ({
      ...prev,
      [id]: { ...prev[id], links }
    }));
  };

  const getSpecialty = (id) => specialties[id];

  const getAllSpecialties = () => specialties;

  return (
    <SpecialtiesContext.Provider
      value={{
        specialties,
        addSpecialty,
        deleteSpecialty,
        updateSpecialtyName,
        updateSpecialtySections,
        updateSpecialtyLinks,
        undoSpecialtyChanges,
        getSpecialty,
        getAllSpecialties
      }}
    >
      {children}
    </SpecialtiesContext.Provider>
  );
}
