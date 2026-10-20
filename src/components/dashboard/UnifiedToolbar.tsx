import React, { useState, useRef, useEffect } from 'react';
import { Search, ClipboardPaste, X } from 'lucide-react';
import { Item, Batch, SortOption, AppSettings, DrawLogEntry, WorkspaceBackup } from '../../types';
import { CategoryFilterDropdown } from './CategoryFilterDropdown';
import { SortDropdown } from './SortDropdown';
import { DataActionsMenu } from './DataActionsMenu';

interface UnifiedToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onToggleBulkInput: () => void;
  items: Item[];
  activeBatch: Batch;
  batches: Batch[];
  settings: AppSettings;
  drawLogs: DrawLogEntry[];
  onUpdateItems: (items: Item[]) => void;
  onRestoreWorkspace: (backup: WorkspaceBackup) => void;
  categories: string[];
  currentCategory: string;
  onSelectCategory: (cat: string) => void;
  drawnCount: number;
  onResetDrawn: () => void;
}

export const UnifiedToolbar: React.FC<UnifiedToolbarProps> = React.memo(({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  onToggleBulkInput,
  items,
  activeBatch,
  batches,
  settings,
  drawLogs,
  onUpdateItems,
  onRestoreWorkspace,
  categories,
  currentCategory,
  onSelectCategory,
  drawnCount,
  onResetDrawn,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(() => searchQuery.length > 0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  return (
    <div className="space-y-2">
      {/* 1. Streamlined Controls Row: Category Filter & Sort (Left) + Search Toggle, Bulk Paste & Data Actions (Right) */}
      <div className="flex items-center justify-between text-xs gap-1.5">
        <div className="flex items-center space-x-1.5 flex-1 min-w-0">
          <CategoryFilterDropdown
            categories={categories}
            currentCategory={currentCategory}
            onSelectCategory={onSelectCategory}
          />
          <SortDropdown
            sortBy={sortBy}
            onSortChange={onSortChange}
          />
        </div>

        <div className="flex items-center space-x-1 shrink-0">
          {/* Collapsible Search Toggle Button */}
          <button
            type="button"
            onClick={() => {
              if (isSearchOpen && searchQuery) {
                onSearchChange('');
              }
              setIsSearchOpen(!isSearchOpen);
            }}
            title={isSearchOpen ? 'Hide search' : 'Search items'}
            className={`h-7 px-2 rounded-lg flex items-center space-x-1 transition border ${
              isSearchOpen || searchQuery
                ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium hidden sm:inline">Search</span>
          </button>

          <button
            type="button"
            onClick={onToggleBulkInput}
            title="Bulk Paste Items"
            className="h-7 px-2 rounded-lg flex items-center space-x-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium hidden sm:inline">Bulk</span>
          </button>

          <DataActionsMenu
            items={items}
            activeBatch={activeBatch}
            batches={batches}
            settings={settings}
            drawLogs={drawLogs}
            drawnCount={drawnCount}
            onResetDrawn={onResetDrawn}
            onUpdateItems={onUpdateItems}
            onRestoreWorkspace={onRestoreWorkspace}
          />
        </div>
      </div>

      {/* 2. Collapsible Search Input (Appears only when search is toggled open or query exists) */}
      {(isSearchOpen || searchQuery.length > 0) && (
        <div className="relative w-full animate-fadeIn">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search items by name or category..."
            className="w-full h-8 pl-8 pr-8 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-100/90 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 focus:border-indigo-500/60 focus:bg-white dark:focus:bg-slate-900 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition shadow-2xs"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                onSearchChange('');
                setIsSearchOpen(false);
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              onSearchChange('');
              setIsSearchOpen(false);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
            title="Close search"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
});

UnifiedToolbar.displayName = 'UnifiedToolbar';
