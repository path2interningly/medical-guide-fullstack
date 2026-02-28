// Fuzzy search utility using fuse.js
import Fuse from 'fuse.js';

export function fuzzyFilter(cards, searchText, options = {}) {
  if (!searchText.trim()) return cards;
  const fuse = new Fuse(cards, {
    keys: [
      'title',
      'content',
      'tags',
      ...(options.keys || [])
    ],
    threshold: options.threshold || 0.4,
    includeScore: true,
    ignoreLocation: true,
    minMatchCharLength: 2
  });
  return fuse.search(searchText).map(result => result.item);
}
