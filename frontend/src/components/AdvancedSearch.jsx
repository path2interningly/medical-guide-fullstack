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
    // Fuzzy search
    if (searchText.trim()) {
      filtered = fuzzyFilter(filtered, searchText);
    }
    // Tab filter
    if (selectedTabs.length > 0) {
      filtered = filtered.filter(card => {
        const cardTabs = Array.isArray(card.section) ? card.section : [card.section];
        return selectedTabs.some(tab => cardTabs.includes(tab));
      });
    }
    // Tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(card => selectedTags.some(tag => card.tags?.includes(tag)));
    }
    // AI filter
    if (filterAIGenerated !== null) {
      filtered = filtered.filter(card => card.aiGenerated === filterAIGenerated);
    }
    // Favorites filter
    if (filterFavorites) {
      filtered = filtered.filter(card => card.isFavorite);
    }
    // Specialty filter
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
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-2">⭐ Favorites</label>
        <input
          type="checkbox"
          checked={filterFavorites}
          onChange={e => setFilterFavorites(e.target.checked)}
          className="mr-2"
        />
        Show only favorites
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
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-2">✨ Source</label>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterAIGenerated(filterAIGenerated === true ? null : true)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              filterAIGenerated === true
                ? 'bg-purple-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            AI Generated
          </button>
          <button
            onClick={() => setFilterAIGenerated(filterAIGenerated === false ? null : false)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              filterAIGenerated === false
                ? 'bg-green-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Manual
          </button>
        </div>
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
