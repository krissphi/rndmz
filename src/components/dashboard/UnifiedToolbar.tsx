import React, { useRef, useState, useEffect } from 'react';
import {
  Search,
  ArrowUpDown,
  MoreVertical,
  ClipboardPaste,
  Upload,
  FileCode,
  FileSpreadsheet,
  RotateCcw,
  Sparkles,
  Trash2,
  X,
  Filter,
  Archive,
  FolderArchive,
} from 'lucide-react';
import { Item, Batch, SortOption, AppSettings, DrawLogEntry, WorkspaceBackup } from '../../types';
import { DataExportImport } from '../../services/exportImport';
import { DEFAULT_ITEMS } from '../../constants/presets';
import { useTranslation } from '../../i18n/LanguageContext';
import { useDialog } from '../../context/DialogContext';

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
  const { t } = useTranslation();
  const { toast, showConfirm } = useDialog();

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workspaceInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imported = await DataExportImport.parseImportedFile(file);
      if (imported.length > 0) {
        onUpdateItems([...items, ...imported]);
        toast(t('importSuccessMsg', { count: imported.length, filename: file.name }), 'success');
      } else {
        toast(t('importEmptyMsg'), 'info');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error reading file';
      toast(t('importFailedMsg', { error: msg }), 'error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleWorkspaceBackupUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const backup = await DataExportImport.parseWorkspaceBackup(file);
      showConfirm({
        title: t('restoreWorkspaceTitle'),
        message: t('restoreWorkspaceConfirm', { count: backup.batches.length }),
        isDanger: true,
        confirmText: t('restoreButton'),
        cancelText: t('cancel'),
        onConfirm: () => {
          onRestoreWorkspace(backup);
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('invalidBackupFile');
      toast(msg, 'error');
    } finally {
      if (workspaceInputRef.current) workspaceInputRef.current.value = '';
    }
  };

  const handleClearBatch = () => {
    showConfirm({
      title: t('clearBatchConfirmTitle'),
      message: t('clearBatchConfirmMsg'),
      isDanger: true,
      confirmText: t('delete'),
      cancelText: t('cancel'),
      onConfirm: () => {
        onUpdateItems([]);
      },
    });
  };

  return (
    <div className="space-y-2.5">
      {/* Main Single Row Toolbar */}
      <div className="flex items-center gap-2">
        {/* Search Input with Clear Button */}
        <div className="relative flex-1 min-w-[150px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full h-9 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-8 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-slate-900 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Category Filter Selector (Compact Dropdown) */}
        {categories.length > 0 && (
          <div className="relative shrink-0">
            <div className="flex items-center h-9 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 space-x-1.5 focus-within:border-slate-900 dark:focus-within:border-indigo-500 transition">
              <Filter className="w-3 h-3 text-slate-400 shrink-0" />
              <select
                value={currentCategory}
                onChange={(e) => onSelectCategory(e.target.value)}
                className="bg-transparent border-none text-[11px] text-slate-700 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer max-w-[100px] truncate"
              >
                <option value="ALL" className="dark:bg-slate-800 dark:text-slate-100">
                  {t('allCategories')}
                </option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="dark:bg-slate-800 dark:text-slate-100">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Sort Dropdown */}
        <div className="relative shrink-0 hidden xs:block">
          <div className="flex items-center h-9 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 space-x-1.5 focus-within:border-slate-900 dark:focus-within:border-indigo-500 transition">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="bg-transparent border-none text-[11px] text-slate-700 dark:text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="default" className="dark:bg-slate-800 dark:text-slate-100">{t('sortDefault')}</option>
              <option value="name-asc" className="dark:bg-slate-800 dark:text-slate-100">{t('sortNameAsc')}</option>
              <option value="name-desc" className="dark:bg-slate-800 dark:text-slate-100">{t('sortNameDesc')}</option>
              <option value="weight-desc" className="dark:bg-slate-800 dark:text-slate-100">{t('sortWeightDesc')}</option>
              <option value="weight-asc" className="dark:bg-slate-800 dark:text-slate-100">{t('sortWeightAsc')}</option>
              <option value="category-asc" className="dark:bg-slate-800 dark:text-slate-100">{t('sortCategoryAsc')}</option>
            </select>
          </div>
        </div>

        {/* Actions Dropdown Menu Button */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            title={t('importExportButton')}
            className={`h-9 px-2.5 rounded-xl border flex items-center space-x-1 text-xs font-semibold transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-indigo-500 ${
              showMenu
                ? 'bg-slate-900 dark:bg-indigo-600 border-slate-900 dark:border-indigo-600 text-white'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
            aria-label={t('importExportButton')}
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-40 animate-popIn text-xs">
              {/* Bulk Paste */}
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  onToggleBulkInput();
                }}
                className="w-full px-3.5 py-2 text-left font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2.5 transition"
              >
                <ClipboardPaste className="w-4 h-4 text-slate-400" />
                <span>{t('bulkPasteButton')}</span>
              </button>

              <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

              {/* Import current batch items */}
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  fileInputRef.current?.click();
                }}
                className="w-full px-3.5 py-2 text-left font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2.5 transition"
              >
                <Upload className="w-4 h-4 text-slate-400" />
                <span>{t('importJsonCsv')}</span>
              </button>

              {/* Export JSON (current batch) */}
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  DataExportImport.exportToJSON(
                    items,
                    `${activeBatch.name.toLowerCase().replace(/\s+/g, '-')}-items.json`
                  );
                }}
                className="w-full px-3.5 py-2 text-left font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2.5 transition"
              >
                <FileCode className="w-4 h-4 text-slate-400" />
                <span>{t('exportJson')}</span>
              </button>

              {/* Export CSV (current batch) */}
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  DataExportImport.exportToCSV(
                    items,
                    `${activeBatch.name.toLowerCase().replace(/\s+/g, '-')}-items.csv`
                  );
                }}
                className="w-full px-3.5 py-2 text-left font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2.5 transition"
              >
                <FileSpreadsheet className="w-4 h-4 text-slate-400" />
                <span>{t('exportCsv')}</span>
              </button>

              <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

              {/* Backup Entire Workspace */}
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  DataExportImport.exportWorkspace(batches, settings, drawLogs);
                  toast(t('backupWorkspace'), 'success');
                }}
                className="w-full px-3.5 py-2 text-left font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center space-x-2.5 transition"
              >
                <Archive className="w-4 h-4" />
                <span>{t('backupWorkspace')}</span>
              </button>

              {/* Restore Entire Workspace */}
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  workspaceInputRef.current?.click();
                }}
                className="w-full px-3.5 py-2 text-left font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2.5 transition"
              >
                <FolderArchive className="w-4 h-4 text-slate-400" />
                <span>{t('restoreWorkspace')}</span>
              </button>

              <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

              {/* Reset Drawn */}
              {drawnCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onResetDrawn();
                  }}
                  className="w-full px-3.5 py-2 text-left font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2.5 transition"
                >
                  <RotateCcw className="w-4 h-4 text-slate-400" />
                  <span>{t('resetDrawnInBatch', { count: drawnCount })}</span>
                </button>
              )}

              {/* Load Defaults */}
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  onUpdateItems(DEFAULT_ITEMS);
                }}
                className="w-full px-3.5 py-2 text-left font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2.5 transition"
              >
                <Sparkles className="w-4 h-4 text-slate-400" />
                <span>{t('loadDefaults')}</span>
              </button>

              {/* Clear Batch */}
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  handleClearBatch();
                }}
                className="w-full px-3.5 py-2 text-left font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center space-x-2.5 transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t('clearBatchItems')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Hidden File Input for Single Batch Items Import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.csv,text/csv,application/json"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Hidden File Input for Full Workspace Backup Restore */}
        <input
          ref={workspaceInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleWorkspaceBackupUpload}
          className="hidden"
        />
      </div>
    </div>
  );
});

UnifiedToolbar.displayName = 'UnifiedToolbar';
