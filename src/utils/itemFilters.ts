import { Item, SortOption } from '../types';

export function filterAndSortItems(
  items: Item[],
  currentCategory: string,
  searchQuery: string,
  sortBy: SortOption
): Item[] {
  let result = [...items];

  // 1. Filter by category
  if (currentCategory !== 'ALL') {
    result = result.filter(
      (it) => (it.category || 'General').toLowerCase() === currentCategory.toLowerCase()
    );
  }

  // 2. Filter by search query
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    result = result.filter(
      (it) => it.text.toLowerCase().includes(q) || (it.category || '').toLowerCase().includes(q)
    );
  }

  // 3. Sorting logic
  switch (sortBy) {
    case 'name-asc':
      result.sort((a, b) => a.text.localeCompare(b.text));
      break;
    case 'name-desc':
      result.sort((a, b) => b.text.localeCompare(a.text));
      break;
    case 'weight-desc':
      result.sort((a, b) => (Number(b.weight) || 1) - (Number(a.weight) || 1));
      break;
    case 'weight-asc':
      result.sort((a, b) => (Number(a.weight) || 1) - (Number(b.weight) || 1));
      break;
    case 'category-asc':
      result.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
      break;
    case 'default':
    default:
      break;
  }

  return result;
}
