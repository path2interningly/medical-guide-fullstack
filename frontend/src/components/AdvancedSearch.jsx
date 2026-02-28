import React, { useState } from 'react';
import { fuzzyFilter } from '../utils/fuzzyFilter';

/**
 * AdvancedSearch - Filter cards by multiple criteria
 */
export default function AdvancedSearch({ onFilter, cards }) {
    // Active filter chips
    const filterChips = [];
    if (filterFavorites) filterChips.push({ label: 'Favorites', key: 'favorites' });
    if (filterAIGenerated !== null) filterChips.push({ label: filterAIGenerated ? 'AI Generated' : 'Manual', key: 'source' });
    if (selectedTags.length) filterChips.push(...selectedTags.map(tag => ({ label: tag, key: 'tag' })));
    if (selectedTabs.length) filterChips.push(...selectedTabs.map(tab => ({ label: tab, key: 'tab' })));
    if (selectedSpecialty) filterChips.push({ label: selectedSpecialty, key: 'specialty' });
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
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      {/* Active filter chips */}
      {filterChips.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {filterChips.map((chip, idx) => (
            <span key={idx} className="filter-chip px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1">
              {chip.label}
              <button
                className="ml-1 text-blue-500 hover:text-blue-700"
                onClick={() => {
                  if (chip.key === 'favorites') setFilterFavorites(false);
                  if (chip.key === 'source') setFilterAIGenerated(null);
                  if (chip.key === 'tag') setSelectedTags(selectedTags.filter(t => t !== chip.label));
                  if (chip.key === 'tab') setSelectedTabs(selectedTabs.filter(t => t !== chip.label));
                  if (chip.key === 'specialty') setSelectedSpecialty('');
                }}
                aria-label={`Remove ${chip.label} filter`}
              >✕</button>
            </span>
          ))}
        </div>
      )}
      {/* Tab Filter */}
      {allTabs.length > 0 && (
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">🗂️ Tabs ({selectedTabs.length})</label>
          <div className="flex flex-wrap gap-2">
            {allTabs.map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedTabs(prev => prev.includes(tab) ? prev.filter(t => t !== tab) : [...prev, tab])}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedTabs.includes(tab) ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Specialty Filter */}
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
      {/* Favorites Filter */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-semibold text-gray-700">⭐ Favorites</label>
        <button
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${filterFavorites ? 'bg-yellow-400 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          onClick={() => setFilterFavorites(!filterFavorites)}
          aria-pressed={filterFavorites}
        >{filterFavorites ? 'Active' : 'Show only favorites'}</button>
      </div>
      {/* Search Input */}
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-2">🔍 Search</label>
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search by title or content..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tags Filter */}
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

      {/* AI Generated Filter */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-semibold text-gray-700">✨ Source</label>
        <button
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filterAIGenerated === true ? 'bg-purple-500 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          onClick={() => setFilterAIGenerated(filterAIGenerated === true ? null : true)}
          aria-pressed={filterAIGenerated === true}
        >AI Generated</button>
        <button
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filterAIGenerated === false ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          onClick={() => setFilterAIGenerated(filterAIGenerated === false ? null : false)}
          aria-pressed={filterAIGenerated === false}
        >Manual</button>
      </div>

      {/* Sort */}
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-2">↕️ Sort By</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="title">Title (A-Z)</option>
          <option value="date">Date (Newest)</option>
          <option value="ai">AI Generated First</option>
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
