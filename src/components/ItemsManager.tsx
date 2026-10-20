import React, { useState, useMemo, useCallback } from 'react';
import { Check, Minus } from 'lucide-react';
import { AppSettings, Batch, DrawLogEntry, Item, SortOption, WorkspaceBackup } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import { useDialog } from '../context/DialogContext';
import { BatchHeader } from './dashboard/BatchHeader';
import { UnifiedToolbar } from './dashboard/UnifiedToolbar';
import { QuickAddItem } from './dashboard/QuickAddItem';
import { BulkPasteBox } from './dashboard/BulkPasteBox';
import { ItemListVirtualized } from './dashboard/ItemListVirtualized';
import { filterAndSortItems } from '../utils/itemFilters';

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
  onCloseSidebar?: () => void;
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
  onCloseSidebar,
}) => {
  const currentCategory = selectedCategory || 'ALL';
  const { t } = useTranslation();
  const { showConfirm, toast } = useDialog();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [showBulkInput, setShowBulkInput] = useState(false);

  const handleResetAllClick = useCallback(() => {
    if (drawnIds.length === 0) return;
    showConfirm({
      title: t('resetDrawnConfirmTitle'),
      message: t('resetDrawnConfirmMsg'),
      confirmText: 'Reset',
      cancelText: t('cancel'),
      onConfirm: onResetDrawn,
    });
  }, [drawnIds.length, showConfirm, t, onResetDrawn]);

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

  // Remove single item helper with Undo Toast
  const handleRemoveItem = useCallback(
    (id: string) => {
      const itemToRemove = items.find((it) => it.id === id);
      if (!itemToRemove) return;

      const itemIndex = items.findIndex((it) => it.id === id);
      const wasDrawn = drawnIds.includes(id);

      // Remove from active batch items
      const newItems = items.filter((it) => it.id !== id);
      onUpdateItems(newItems);

      // Trigger Undo Toast
      toast(
        t('itemDeletedMsg', { name: itemToRemove.text }),
        'info',
        {
          action: {
            label: t('undo'),
            onClick: () => {
              const restored = [...newItems];
              restored.splice(itemIndex, 0, itemToRemove);
              onUpdateItems(restored);

              if (wasDrawn && !drawnIds.includes(itemToRemove.id)) {
                onToggleDrawnItem(itemToRemove.id);
              }

              toast(t('itemRestoredMsg', { name: itemToRemove.text }), 'success');
            },
          },
          duration: 5000,
        }
      );
    },
    [items, drawnIds, onUpdateItems, onToggleDrawnItem, toast, t]
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
    return filterAndSortItems(items, currentCategory, searchQuery, sortBy);
  }, [items, currentCategory, searchQuery, sortBy]);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white dark:bg-slate-900">
      {/* 1. BATCH HEADER (Edge-to-edge top bar) */}
      <BatchHeader
        batches={batches}
        activeBatch={activeBatch}
        onSelectBatch={onSelectBatch}
        onCreateBatch={onCreateBatch}
        onRenameBatch={onRenameBatch}
        onDuplicateBatch={onDuplicateBatch}
        onDeleteBatch={onDeleteBatch}
        onCloseSidebar={onCloseSidebar}
      />

      {/* 2. BODY CONTENT */}
      <div className="flex-1 min-h-0 flex flex-col px-4 py-3 sm:px-5 space-y-3 overflow-hidden">
        {/* UNIFIED TOOLBAR: SEARCH & STREAMLINED FILTER/SORT/ACTIONS */}
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

        {/* BULK PASTE DRAWER (if toggled) */}
        {showBulkInput && (
          <div className="shrink-0 max-h-56 overflow-y-auto">
            <BulkPasteBox
              currentCategory={currentCategory}
              onImport={handleBulkImport}
              onClose={() => setShowBulkInput(false)}
            />
          </div>
        )}

        {/* FAST 2-TIER INLINE ADD ITEM */}
        <div className="shrink-0">
          <QuickAddItem
            items={items}
            onUpdateItems={onUpdateItems}
            categories={categories}
            currentCategory={currentCategory}
          />
        </div>

        {/* CHECKLIST CONTROLLER & STATUS */}
        <div className="flex items-center justify-between px-1 text-xs text-slate-500 font-medium shrink-0 pt-0.5 select-none">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleResetAllClick}
              title={drawnIds.length > 0 ? 'Click to reset all checked items' : 'All items active'}
              className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              <div
                className={`w-4 h-4 rounded-md border-2 transition flex items-center justify-center shrink-0 ${
                  drawnIds.length === items.length && items.length > 0
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs'
                    : drawnIds.length > 0
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                }`}
              >
                {drawnIds.length === items.length && items.length > 0 ? (
                  <Check className="w-3 h-3 stroke-[3]" />
                ) : drawnIds.length > 0 ? (
                  <Minus className="w-2.5 h-2.5 stroke-[3]" />
                ) : null}
              </div>
              <span className="font-semibold text-[11px] text-slate-700 dark:text-slate-300">
                {drawnIds.length === 0
                  ? `All ${items.length} items active`
                  : `${items.length - drawnIds.length} active (${drawnIds.length} checked)`}
              </span>
            </button>
          </div>

          {drawnIds.length > 0 && (
            <button
              type="button"
              onClick={handleResetAllClick}
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline transition"
            >
              Reset all
            </button>
          )}
        </div>

        {/* VIRTUALIZED ITEM LIST */}
        <div className="flex-1 min-h-0 flex flex-col">
          <ItemListVirtualized
            items={processedItems}
            drawnIds={drawnIds}
            onToggleDrawnItem={onToggleDrawnItem}
            onAdjustWeight={handleAdjustWeight}
            onRemoveItem={handleRemoveItem}
          />
        </div>
      </div>
    </div>
  );
});

ItemsManager.displayName = 'ItemsManager';
