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
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="searchFilter" className="text-sm font-semibold text-gray-700 block mb-2">🔎 Search & Filter</label>
          <select
            id="searchFilter"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
          >
            <option value="title">Title (A-Z)</option>
            <option value="date">Date Added</option>
            <option value="ai">AI First</option>
            <option value="favorites">Favorites Only</option>
            <option value="ai-generated">AI Generated</option>
            <option value="manual">Manual</option>
            <option value="tags">Tags</option>
            <option value="specialty">Specialty</option>
            <option value="tabs">Tabs</option>
          </select>
          <input
            type="text"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder="Search by title or content..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
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
