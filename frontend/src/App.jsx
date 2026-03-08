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
import { Editor } from '@tinymce/tinymce-react';

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
      : { showContextHints: true, theme: 'light', font: 'sans', color: 'blue' };
  });
  const [content, setContent] = useState("");

  // Apply theme, font, and color to body
  useEffect(() => {
    document.body.classList.remove('theme-light', 'theme-dark', 'font-sans', 'font-serif', 'font-mono', 'accent-blue', 'accent-green', 'accent-purple');
    document.body.classList.add(
      `theme-${settings.theme || 'light'}`,
      `font-${settings.font || 'sans'}`,
      `accent-${settings.color || 'blue'}`
    );
  }, [settings.theme, settings.font, settings.color]);

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

  const handleEditorChange = (newContent) => {
    setContent(newContent);
  };

  return (
    <div className="min-h-screen bg-[#f6f7f4] font-poppins">
      {/* Hero/Header Section */}
      <header className="max-w-5xl mx-auto mt-8 mb-6 p-8 rounded-3xl shadow-xl bg-gradient-to-br from-[#e3e9e2] to-[#f6f7f4] flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="flex-1 z-10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
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
                className="text-5xl font-extrabold text-[#3d4c3d] cursor-pointer hover:text-green-700 transition drop-shadow-lg tracking-tight"
                onDoubleClick={() => setIsEditingTitle(true)}
                title="Double-click to edit"
              >
                {customTitle} 🚑
              </h1>
            )}
            <div className="flex gap-3 items-center mt-2 sm:mt-0">
              <div className="text-sm text-gray-600">
                👤 {user?.name || user?.email}
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 bg-[#e3e9e2] text-[#3d4c3d] rounded-full shadow hover:bg-green-200 text-base font-semibold border border-[#b7c2b1] transition-all"
                title="Logout"
              >
                Logout
              </button>
              <select
                value={i18n.language}
                onChange={e => i18n.changeLanguage(e.target.value)}
                className="ml-2 px-3 py-2 border-2 border-[#b7c2b1] rounded-full bg-white text-[#3d4c3d] font-semibold shadow-sm focus:ring-2 focus:ring-green-200"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
              </select>
              <button
                onClick={() => setShowSettings(true)}
                className="ml-2 px-3 py-2 text-2xl bg-[#e3e9e2] rounded-full hover:bg-green-100 transition shadow border border-[#b7c2b1]"
                title="Settings"
              >
                ⚙️
              </button>
            </div>
          </div>

          {/* Specialty Selector & Links */}
          <div className="mt-8 flex gap-4 items-center">
            <select
              value={specialty}
              onChange={e => setSpecialty(e.target.value)}
              className="px-4 py-2 border-2 border-[#b7c2b1] rounded-full bg-white font-semibold text-[#3d4c3d] shadow-sm focus:ring-2 focus:ring-green-200"
              title="Select specialty"
            >
              {Object.entries(specialties)
                  .map(([key, data]) => (
                    <option key={key} value={key}>{data.name}</option>
                  ))}
            </select>
            <button
              onClick={() => handleEditLinks(specialty)}
              className="px-4 py-2 rounded-full bg-[#e3e9e2] hover:bg-green-100 text-base font-semibold text-[#3d4c3d] shadow border border-[#b7c2b1] transition-all"
              title="Edit specialty links"
            >
              🔗 Links
            </button>
          </div>
        </div>
      </header>

      {/* Sections Navigation */}
      <div className="bg-white/80 border-b rounded-2xl shadow max-w-5xl mx-auto mb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-3 overflow-x-auto py-4">
            {currentSections.map((sectionId) => {
              const sectionLabel = {
                consultations: '💬 ' + t('sections.consultations'),
                prescriptions: '💊 ' + t('sections.prescriptions'),
                investigations: '🔬 ' + t('sections.investigations'),
                procedures: '🩺 ' + t('sections.procedures'),
                templates: '📄 ' + t('sections.templates'),
                calculators: '🧮 ' + t('sections.calculators'),
                urgences: '🚨 ' + t('sections.urgences')
              }[sectionId];

              const colorMap = {
                consultations: 'bg-pink-200 text-pink-700',
                prescriptions: 'bg-purple-200 text-purple-700',
                investigations: 'bg-blue-200 text-blue-700',
                procedures: 'bg-green-200 text-green-700',
                templates: 'bg-yellow-200 text-yellow-700',
                calculators: 'bg-cyan-200 text-cyan-700',
                urgences: 'bg-red-200 text-red-700',
              };

              return (
                <button
                  key={sectionId}
                  onClick={() => setSection(sectionId)}
                  className={`px-5 py-2 rounded-full font-bold shadow transition-all border-2 border-white whitespace-nowrap text-base focus:outline-none focus:ring-2 focus:ring-pink-300 ${
                    section === sectionId
                      ? `${colorMap[sectionId]} scale-105 ring-2 ring-pink-300`
                      : `${colorMap[sectionId]} opacity-80 hover:opacity-100 hover:scale-105`
                  }`}
                  style={{ minWidth: 140 }}
                >
                  {sectionLabel}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-1 gap-8">
        <div className="rounded-3xl shadow-xl bg-white/90 p-8">
          <SectionView
            specialty={specialty}
            section={section}
            showContextHints={settings.showContextHints}
          />
        </div>
      </main>

      <footer className="bg-white/80 border-t mt-12 rounded-t-2xl shadow max-w-5xl mx-auto">
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
