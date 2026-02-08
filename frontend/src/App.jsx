import React, { useState } from "react";
import { CardsProvider } from "./context/CardsContext";
import { SpecialtiesProvider, useSpecialties } from "./context/SpecialtiesContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import SectionView from "./pages/SectionView";
import { useEffect } from "react";
import SpecialtyManageModal from "./components/modals/SpecialtyManageModal";
import SectionManageModal from "./components/modals/SectionManageModal";
import SettingsModal from "./components/modals/SettingsModal";
import ContextMenu from "./components/modals/ContextMenu";
import AuthModal from "./components/modals/AuthModal";
import { useTranslation } from 'react-i18next';
import '../src/i18n';

// Simple error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <div style={{ padding: '20px', color: 'red' }}>Error: {this.state.error?.message}</div>;
    }
    return this.props.children;
  }
}


function AppContent() {
  const { specialties, addSpecialty, deleteSpecialty, updateSpecialtyName, updateSpecialtyLinks, updateSpecialtySections, undoSpecialtyChanges } = useSpecialties();
  const { isAuthenticated, loading: authLoading, user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLinksModal, setShowLinksModal] = useState(false);
  const [showSectionsModal, setShowSectionsModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [specialty, setSpecialty] = useState("gynecology");
  const [section, setSection] = useState("consultations");
  const [contextMenu, setContextMenu] = useState(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [customTitle, setCustomTitle] = useState(() => {
    const saved = localStorage.getItem('appTitle');
    return saved || 'Med in a Pocket';
  });
  const { t, i18n } = useTranslation();
  const requireAuth = import.meta.env.VITE_REQUIRE_AUTH !== 'false';
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('appSettings');
    return saved
      ? JSON.parse(saved)
      : { showContextHints: true };
  });

  // Show auth modal if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated && requireAuth) {
      setShowAuthModal(true);
    }
  }, [authLoading, isAuthenticated, requireAuth]);


  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('appTitle', customTitle);
  }, [customTitle]);

  const handleEditLinks = (specId) => {
    setSelectedSpecialty(specId);
    setShowLinksModal(true);
  };

  const handleEditSections = (specId) => {
    setSelectedSpecialty(specId);
    setShowSectionsModal(true);
  };

  const handleAddSpecialty = (nameParam) => {
    const name = nameParam || prompt('New specialty name:');
    if (!name?.trim()) return;
    const idBase = name.trim().toLowerCase().replace(/\s+/g, '-');
    let id = idBase;
    let counter = 1;
    while (specialties[id]) {
      id = `${idBase}-${counter}`;
      counter += 1;
    }
    addSpecialty(id, name.trim());
    setSpecialty(id);
  };

  const handleRenameSpecialty = (specId, newName) => {
    const idToRename = specId || specialty;
    const currentName = specialties[idToRename]?.name || '';
    const name = newName || prompt('Rename specialty:', currentName);
    if (!name?.trim()) return;
    updateSpecialtyName(idToRename, name.trim());
  };

  const handleSaveLinks = (links) => {
    updateSpecialtyLinks(selectedSpecialty, links);
  };

  const handleSaveSections = (sections) => {
    updateSpecialtySections(selectedSpecialty, sections);
  };

  const currentSpecialtyData = specialties[specialty];
  const currentSections = currentSpecialtyData?.sections || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {isEditingTitle ? (
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setIsEditingTitle(false);
                  if (e.key === 'Escape') {
                    setCustomTitle(localStorage.getItem('appTitle') || 'Med in a Pocket');
                    setIsEditingTitle(false);
                  }
                }}
                autoFocus
                className="text-3xl font-bold text-indigo-600 border-b-2 border-indigo-600 outline-none"
              />
            ) : (
              <h1 
                className="text-3xl font-bold text-indigo-600 cursor-pointer hover:text-indigo-700 transition"
                onDoubleClick={() => setIsEditingTitle(true)}
                title="Double-click to edit"
              >
                {customTitle}
              </h1>
            )}
            <div className="flex gap-2 items-center">
              <div className="text-sm text-gray-600">
                👤 {user?.name || user?.email}
              </div>
              <button
                onClick={logout}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                title="Logout"
              >
                Logout
              </button>
              <select
                value={i18n.language}
                onChange={e => i18n.changeLanguage(e.target.value)}
                className="ml-4 px-2 py-1 border rounded"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
              </select>
              <button
                onClick={() => setShowSettings(true)}
                className="ml-2 px-3 py-2 text-2xl hover:text-pink-500 transition"
                title="Settings"
              >
                ⚙️
              </button>
            </div>
          </div>

          {/* Specialty Selector & Links */}
          <div className="mt-4 flex gap-3 items-center">
            <select
              value={specialty}
              onChange={e => setSpecialty(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white font-semibold text-gray-700"
              title="Select specialty"
            >
              {Object.entries(specialties)
                  .map(([key, data]) => (
                    <option key={key} value={key}>{data.name}</option>
                  ))}
              </select>
            <button
              onClick={() => handleEditLinks(specialty)}
              className="px-3 py-2 rounded bg-blue-200 hover:bg-blue-300 text-sm font-semibold transition"
              title="Edit specialty links"
            >
              🔗 Links
            </button>
          </div>
        </div>
      </header>

      {/* Sections Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2">
            {currentSections.map((sectionId) => {
              const sectionLabel = {
                consultations: t('sections.consultations'),
                prescriptions: t('sections.prescriptions'),
                investigations: t('sections.investigations'),
                procedures: t('sections.procedures'),
                templates: t('sections.templates'),
                calculators: t('sections.calculators'),
                urgences: t('sections.urgences')
              }[sectionId];

              return (
                <button
                  key={sectionId}
                  onClick={() => setSection(sectionId)}
                  className={`px-4 py-2 rounded-t-lg whitespace-nowrap transition font-semibold ${
                    section === sectionId
                      ? "bg-gradient-to-br from-blue-50 to-indigo-100 text-indigo-700 border-b-2 border-indigo-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {sectionLabel}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto">
        <SectionView
          specialty={specialty}
          section={section}
          showContextHints={settings.showContextHints}
        />
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-gray-600 text-sm">
          <p>Medical Guide</p>
        </div>
      </footer>

      {/* Modals */}
      {showLinksModal && selectedSpecialty && (
        <SpecialtyManageModal
          specialty={specialties[selectedSpecialty]?.name}
          specialtyId={selectedSpecialty}
          links={specialties[selectedSpecialty]?.links || []}
          onUpdateLinks={handleSaveLinks}
          onClose={() => setShowLinksModal(false)}
        />
      )}

      {showSectionsModal && selectedSpecialty && (
        <SectionManageModal
          specialty={specialties[selectedSpecialty]?.name}
          sections={specialties[selectedSpecialty]?.sections || []}
          onUpdateSections={handleSaveSections}
          onClose={() => setShowSectionsModal(false)}
        />
      )}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdate={setSettings}
        currentSpecialty={specialty}
        specialties={specialties}
        onAddSpecialty={handleAddSpecialty}
        onRenameSpecialty={handleRenameSpecialty}
        onDeleteSpecialty={deleteSpecialty}
        onUndoSpecialty={undoSpecialtyChanges}
      />
      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.items}
          onClose={() => setContextMenu(null)}
        />
      )}      
      {/* Auth Modal */}
      {showAuthModal && !isAuthenticated && (
        <AuthModal onClose={() => {}} />
      )}    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SpecialtiesProvider>
          <CardsProvider>
            <AppContent />
          </CardsProvider>
        </SpecialtiesProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
