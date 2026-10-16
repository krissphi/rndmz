import React, { useState, useMemo, useCallback } from 'react';
import { AppSettings, Batch, DrawLogEntry, Item, SortOption, WorkspaceBackup } from '../types';
import { BatchHeader } from './dashboard/BatchHeader';
import { UnifiedToolbar } from './dashboard/UnifiedToolbar';
import { QuickAddItem } from './dashboard/QuickAddItem';
import { BulkPasteBox } from './dashboard/BulkPasteBox';
import { ItemListVirtualized } from './dashboard/ItemListVirtualized';

interface ItemsManagerProps {
  batches: Batch[];
  activeBatch: Batch;
  onSelectBatch: (batchId: string) => void;
  onCreateBatch: (name: string) => void;
  onRenameBatch: (batchId: string, newName: string) => void;
  onDuplicateBatch: (batchId: string) => void;
  onDeleteBatch: (batchId: string) => void;
  items: Item[];
  onUpdateItems: (items: Item[]) => void;
  settings: AppSettings;
  drawLogs: DrawLogEntry[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  drawnIds: string[];
  onResetDrawn: () => void;
  onToggleDrawnItem: (id: string) => void;
  onRestoreWorkspace: (backup: WorkspaceBackup) => void;
}

export const ItemsManager: React.FC<ItemsManagerProps> = React.memo(({
  batches,
  activeBatch,
  onSelectBatch,
  onCreateBatch,
  onRenameBatch,
  onDuplicateBatch,
  onDeleteBatch,
  items,
  onUpdateItems,
  settings,
  drawLogs,
  selectedCategory,
  onSelectCategory,
  drawnIds,
  onResetDrawn,
  onToggleDrawnItem,
  onRestoreWorkspace,
}) => {
  const currentCategory = selectedCategory || 'ALL';

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [showBulkInput, setShowBulkInput] = useState(false);

  // Extract unique categories and their item counts
  const categoryStats = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((it) => {
      const cat = (it.category || 'General').trim();
      const key = cat.length > 0 ? cat : 'General';
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [items]);

  const categories = useMemo(() => categoryStats.map((c) => c.name), [categoryStats]);

  // Adjust odds / weight helper
  const handleAdjustWeight = useCallback(
    (id: string, delta: number) => {
      onUpdateItems(
        items.map((it) => {
          if (it.id === id) {
            const current = Math.max(1, Number(it.weight) || 1);
            return { ...it, weight: Math.max(1, current + delta) };
          }
          return it;
        })
      );
    },
    [items, onUpdateItems]
  );

  // Remove single item helper
  const handleRemoveItem = useCallback(
    (id: string) => {
      onUpdateItems(items.filter((it) => it.id !== id));
    },
    [items, onUpdateItems]
  );

  // Bulk Import helper
  const handleBulkImport = useCallback(
    (bulkText: string, category: string, weight: number) => {
      const lines = bulkText
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      if (lines.length > 0) {
        const imported: Item[] = lines.map((text, idx) => ({
          id: `${Date.now()}-${idx}`,
          text,
          category,
          weight,
        }));
        onUpdateItems([...items, ...imported]);
      }
    },
    [items, onUpdateItems]
  );

  // Filtered & Sorted items
  const processedItems = useMemo(() => {
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
        // maintain original array index order
        break;
    }

    return result;
  }, [items, currentCategory, searchQuery, sortBy]);

  return (
    <div className="w-full max-w-2xl mx-auto mt-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-5 sm:p-7 space-y-4 transition-colors">
      {/* 1. BATCH HEADER */}
      <BatchHeader
        batches={batches}
        activeBatch={activeBatch}
        onSelectBatch={onSelectBatch}
        onCreateBatch={onCreateBatch}
        onRenameBatch={onRenameBatch}
        onDuplicateBatch={onDuplicateBatch}
        onDeleteBatch={onDeleteBatch}
      />

      <div className="h-px bg-slate-100 dark:bg-slate-800/80 my-1" />

      {/* 2. UNIFIED TOOLBAR: SEARCH, CATEGORY, SORT & ALL DATA ACTIONS */}
      <UnifiedToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onToggleBulkInput={() => setShowBulkInput(!showBulkInput)}
        items={items}
        activeBatch={activeBatch}
        batches={batches}
        settings={settings}
        drawLogs={drawLogs}
        onUpdateItems={onUpdateItems}
        onRestoreWorkspace={onRestoreWorkspace}
        categories={categories}
        currentCategory={currentCategory}
        onSelectCategory={onSelectCategory}
        drawnCount={drawnIds.length}
        onResetDrawn={onResetDrawn}
      />

      {/* 3. BULK PASTE DRAWER (if toggled) */}
      {showBulkInput && (
        <BulkPasteBox
          currentCategory={currentCategory}
          onImport={handleBulkImport}
          onClose={() => setShowBulkInput(false)}
        />
      )}

      {/* 4. FAST INLINE ADD ITEM */}
      <QuickAddItem
        items={items}
        onUpdateItems={onUpdateItems}
        categories={categories}
        currentCategory={currentCategory}
      />

      {/* 5. VIRTUALIZED ITEM LIST */}
      <ItemListVirtualized
        items={processedItems}
        drawnIds={drawnIds}
        onToggleDrawnItem={onToggleDrawnItem}
        onAdjustWeight={handleAdjustWeight}
        onRemoveItem={handleRemoveItem}
      />
    </div>
  );
});

ItemsManager.displayName = 'ItemsManager';
