import { useEffect, useRef, useState } from 'react';
import AdvancedSearch from '../components/AdvancedSearch.jsx';
import { useCards } from '../context/CardsContext';
import MedicalCard from '../components/cards/MedicalCard';
import CreateCardModal from '../components/modals/CreateCardModal';
import ManualEditorModal from '../components/modals/ManualEditorModal';
import MassGenerateModal from '../components/modals/MassGenerateModal';
import ContextMenu from '../components/modals/ContextMenu';
import { exportCardsToPDF } from '../services/pdfExport';

export default function SectionView({ specialty, section, showContextHints }) {
    // Move Card Modal state (must be top-level)
    const [moveCardModal, setMoveCardModal] = useState({ open: false, card: null });
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const sectionTitles = {
    consultations: 'Consultations by Symptom',
    prescriptions: 'Prescriptions & Orders',
    investigations: 'Investigations & Interpretations',
    procedures: 'Technical Procedures',
    templates: 'Templates & Forms',
    calculators: 'Calculators & Scores',
    urgences: 'Emergencies & Algorithms'
  };

  const { getCardsBySection, addCard, updateCard, deleteCard, searchCards, getFavoriteCards } = useCards();
  const [editingCard, setEditingCard] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showManualEditor, setShowManualEditor] = useState(false);
  const [showMassGenerateModal, setShowMassGenerateModal] = useState(false);
  const [createMode, setCreateMode] = useState('select');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('section');
  const [sortOrder, setSortOrder] = useState('alphabetical');
  const [contextMenu, setContextMenu] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      const isTyping = tag === 'input' || tag === 'textarea' || document.activeElement?.isContentEditable;
      if (isTyping) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setEditingCard(null);
        setCreateMode('select');
        setShowCreateModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const sectionCards = getCardsBySection(specialty, section);
  const favoriteCards = getFavoriteCards();
  const [filteredCards, setFilteredCards] = useState(sectionCards);
  let displayCards = filteredCards;
  let pageTitle = sectionTitles[section];
  if (viewMode === 'favorites') {
    displayCards = favoriteCards;
    pageTitle = 'Favorites';
  }

  // Apply sorting
  displayCards = [...displayCards].sort((a, b) => {
    if (sortOrder === 'alphabetical') {
      // Handle both string titles and object titles with en/fr properties
      const titleA = typeof a.title === 'string' ? a.title : (a.title?.en || a.title?.fr || '');
      const titleB = typeof b.title === 'string' ? b.title : (b.title?.en || b.title?.fr || '');
      return titleA.toLowerCase().localeCompare(titleB.toLowerCase());
    } else if (sortOrder === 'recentlyAdded') {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    } else if (sortOrder === 'recentlyModified') {
      return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
    }
    return 0;
  });

  const paginatedCards = displayCards.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(displayCards.length / pageSize));

  const handleEdit = (card, mode = 'manual') => {
    setEditingCard(card);
    if (mode === 'manual') {
      setShowManualEditor(true);
    } else {
      setCreateMode('ai');
      setShowCreateModal(true);
    }
  };

  const handleCreate = (cardData) => {
    if (editingCard?.id) {
      updateCard(editingCard.id, cardData);
    } else {
      addCard(cardData);
    }
    setShowCreateModal(false);
    setEditingCard(null);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      setViewMode('search');
    } else {
      setViewMode('section');
    }
  };

  const handleCardContextMenu = (e, card) => {
    e.preventDefault();
    const handleCopy = async () => {
      const text = `${card.title?.en || card.title?.fr || ''}\n\n${card.content?.en || card.content?.fr || ''}`;
      try {
        await navigator.clipboard.writeText(text);
      } catch (err) {
        console.error('Copy error:', err);
      }
    };

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      items: [
        {
          label: '📋 Copy',
          action: () => handleCopy()
        },
        {
          label: '✏️ Edit',
          action: () => handleEdit(card, 'manual')
        },
        {
          label: '🗑️ Delete',
          action: () => deleteCard(card.id)
        },
        {
          label: '🔀 Move Card',
          action: () => setMoveCardModal({ open: true, card })
        }
      ]
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          {pageTitle}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingCard(null);
              setCreateMode('select');
              setShowCreateModal(true);
            }}
            className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-2xl shadow-lg transition group relative"
            title="Create Card (N)"
          >
            ➕
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
              Create Card {showContextHints && '(N)'}
            </span>
          </button>
          <button
            onClick={() => setShowMassGenerateModal(true)}
            className="px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 text-2xl shadow-lg transition group relative"
            title="Mass Generate"
          >
            📚
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
              Mass Generate
            </span>
          </button>
          <button
            onClick={async () => {
              if (displayCards.length === 0) {
                alert('No cards to export');
                return;
              }
              setIsExporting(true);
              try {
                await exportCardsToPDF(displayCards, `${pageTitle}-cards.pdf`);
              } catch (error) {
                alert('Export failed: ' + error.message);
              } finally {
                setIsExporting(false);
              }
            }}
            disabled={isExporting}
            className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-2xl shadow-lg transition group relative"
            title="Export to PDF"
          >
            {isExporting ? '⏳' : '📄'}
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
              Export PDF
            </span>
          </button>
        </div>
      </div>
      {/* AdvancedSearch for filtering and sorting */}
      <div className="mb-6">
        <AdvancedSearch
          cards={sectionCards}
          onFilter={(results) => {
            setFilteredCards(results);
            setPage(1);
          }}
        />
      </div>
      {/* Move Card Modal */}
      {moveCardModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h2 className="text-lg font-bold mb-4">Move Card to Tab(s)</h2>
              <div className="mb-4">
                <div className="text-sm mb-2">Select tabs for this card:</div>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(sectionTitles).concat('unclassified').map((key) => (
                    <button
                      key={key}
                      className={`px-2 py-1 rounded-full border ${moveCardModal.card.section?.includes(key) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                      onClick={() => {
                        let newTabs = moveCardModal.card.section ? [...moveCardModal.card.section] : [];
                        if (newTabs.includes(key)) {
                          newTabs = newTabs.filter(t => t !== key);
                        } else {
                          newTabs.push(key);
                        }
                        setMoveCardModal({ ...moveCardModal, card: { ...moveCardModal.card, section: newTabs } });
                      }}
                    >
                      {sectionTitles[key] || 'Unclassified'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setMoveCardModal({ open: false, card: null })}>Cancel</button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => {
          updateCard(moveCardModal.card.id, { section: moveCardModal.card.section });
          setMoveCardModal({ open: false, card: null });
        }}>Confirm</button>
              </div>
            </div>
          </div>
        )}
      {displayCards.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4"></div>
          <p className="text-gray-500 text-xl mb-2 font-semibold">
            {viewMode === 'search' ? 'No results' : 'No content'}
          </p>
          <p className="text-gray-400 text-sm">
            {viewMode === 'search' 
              ? 'Try another search'
              : 'Click + Create Card to add your first entry'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedCards.map((card) => (
              <div
                key={card.id}
                onContextMenu={(e) => handleCardContextMenu(e, card)}
              >
                <MedicalCard
                  card={card}
                  onEdit={(cardData, mode) => handleEdit(cardData, mode)}
                  onDelete={deleteCard}
                  onMenu={(e) => handleCardContextMenu(e, card)}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-6 gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 transition"
              title="Previous page"
            >
              ← Previous
            </button>
            <span className="px-3 py-1 text-gray-600 font-semibold">Page {page} of {totalPages}</span>
            <button
              disabled={page * pageSize >= displayCards.length}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 transition"
              title="Next page"
            >
              Next →
            </button>
          </div>
        </>
      )}
      {/* Create Card Modal (AI) */}
      {showCreateModal && (
        <CreateCardModal
          specialty={specialty}
          section={section}
          onCreateCard={handleCreate}
          onClose={() => setShowCreateModal(false)}
          editingCard={editingCard}
          mode={createMode}
        />
      )}
      {/* Manual Editor Modal */}
      {showManualEditor && (
        <ManualEditorModal
          specialty={specialty}
          section={section}
          onCreateCard={handleCreate}
          onClose={() => setShowManualEditor(false)}
          editingCard={editingCard}
        />
      )}
      {/* Mass Generate Modal */}
      {showMassGenerateModal && (
        <MassGenerateModal
          isOpen={showMassGenerateModal}
          onClose={() => setShowMassGenerateModal(false)}
          currentSpecialty={specialty}
        />
      )}
      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.items}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
