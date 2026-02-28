import React, { useState } from 'react';
import { fuzzyFilter } from '../utils/fuzzyFilter';

/**
 * AdvancedSearch - Filter cards by multiple criteria
 */
export default function AdvancedSearch({ onFilter, cards }) {
  const [searchText, setSearchText] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [filterAIGenerated, setFilterAIGenerated] = useState(null);
  const [sortBy, setSortBy] = useState('title');
  const [selectedTabs, setSelectedTabs] = useState([]);
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  // Extract unique tags from all cards
  const allTags = [...new Set(cards.flatMap(card => card.tags || []))].sort();
  const allTabs = [...new Set(cards.flatMap(card => Array.isArray(card.section) ? card.section : [card.section]))].filter(Boolean).sort();
  const allSpecialties = [...new Set(cards.map(card => card.specialty).filter(Boolean))].sort();

  const handleTagToggle = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleFilter = () => {
    let filtered = cards;
    // Fuzzy search (applied first, if present)
    if (searchText.trim()) {
      filtered = fuzzyFilter(filtered, searchText);
    }
    // Discrete tab filter
    if (selectedTabs.length > 0) {
      filtered = filtered.filter(card => {
        const cardTabs = Array.isArray(card.section) ? card.section : [card.section];
        return selectedTabs.every(tab => cardTabs.includes(tab));
      });
    }
    // Discrete tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(card => selectedTags.every(tag => card.tags?.includes(tag)));
    }
    // Discrete AI filter
    if (filterAIGenerated !== null) {
      filtered = filtered.filter(card => card.aiGenerated === filterAIGenerated);
    }
    // Discrete favorites filter
    if (filterFavorites) {
      filtered = filtered.filter(card => card.isFavorite);
    }
    // Discrete specialty filter
    if (selectedSpecialty) {
      filtered = filtered.filter(card => card.specialty === selectedSpecialty);
    }
    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'date':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'ai':
          return (b.aiGenerated ? 1 : 0) - (a.aiGenerated ? 1 : 0);
        default:
          return 0;
      }
    });
    onFilter(sorted);
  };

  React.useEffect(() => {
    handleFilter();
  }, [searchText, selectedTags, filterAIGenerated, sortBy, cards]);

  const activeFilters = selectedTags.length + (filterAIGenerated !== null ? 1 : 0);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-6">
      {/* Filter Group: Favorites & Source */}
      <div className="flex flex-wrap gap-8 items-end mb-4">
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">⭐ Favorites</label>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filterFavorites}
              onChange={e => setFilterFavorites(e.target.checked)}
              className="mr-2"
            />
            <span>Show only favorites</span>
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">✨ Source</label>
          <div className="flex gap-2">
            <button
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterAIGenerated === true
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setFilterAIGenerated(true)}
            >
              AI Generated
            </button>
            <button
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterAIGenerated === false
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setFilterAIGenerated(false)}
            >
              Manual
            </button>
            <button
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterAIGenerated === null
                  ? 'bg-gray-300 text-gray-700 shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setFilterAIGenerated(null)}
            >
              Any
            </button>
          </div>
        </div>
      </div>
      {/* Filter Group: Tabs & Specialty */}
      <div className="flex flex-wrap gap-8 items-end mb-4">
        {allTabs.length > 0 && (
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">🗂️ Tabs ({selectedTabs.length})</label>
            <div className="flex flex-wrap gap-2">
              {allTabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setSelectedTabs(prev => prev.includes(tab) ? prev.filter(t => t !== tab) : [...prev, tab])}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedTabs.includes(tab)
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        )}
        {allSpecialties.length > 0 && (
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">🩺 Specialty</label>
            <select
              value={selectedSpecialty}
              onChange={e => setSelectedSpecialty(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              {allSpecialties.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      {/* Filter Group: Search & Tags */}
      <div className="flex flex-wrap gap-8 items-end mb-4">
        <div className="flex-1 min-w-[220px]">
          <label className="text-sm font-semibold text-gray-700 block mb-2">🔍 Search</label>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by title or content..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {allTags.length > 0 && (
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">🏷️ Tags ({selectedTags.length})</label>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Sort By */}
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-2">🧩 Sort By</label>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="title">Title (A-Z)</option>
          <option value="date">Date Added</option>
          <option value="ai">AI First</option>
        </select>
      </div>
      {/* Active Filters Display */}
      {activeFilters > 0 && (
        <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded-lg">
          {activeFilters} active filter{activeFilters > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
