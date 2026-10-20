import React, { useRef, useState, useEffect } from 'react';
import {
  MoreVertical,
  Upload,
  FileCode,
  FileSpreadsheet,
  Archive,
  FolderArchive,
  Sparkles,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { Item, Batch, AppSettings, DrawLogEntry, WorkspaceBackup } from '../../types';
import { DataExportImport } from '../../services/exportImport';
import { DEFAULT_ITEMS } from '../../constants/presets';
import { useTranslation } from '../../i18n/LanguageContext';
import { useDialog } from '../../context/DialogContext';

interface DataActionsMenuProps {
  items: Item[];
  activeBatch: Batch;
  batches: Batch[];
  settings: AppSettings;
  drawLogs: DrawLogEntry[];
  drawnCount?: number;
  onResetDrawn?: () => void;
  onUpdateItems: (items: Item[]) => void;
  onRestoreWorkspace: (backup: WorkspaceBackup) => void;
}

export const DataActionsMenu: React.FC<DataActionsMenuProps> = React.memo(({
  items,
  activeBatch,
  batches,
  settings,
  drawLogs,
  drawnCount = 0,
  onResetDrawn,
  onUpdateItems,
  onRestoreWorkspace,
}) => {
  const { t } = useTranslation();
  const { toast, showConfirm } = useDialog();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workspaceInputRef = useRef<HTMLInputElement>(null);

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
    setShowMenu(false);
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
    <div className="relative shrink-0" ref={menuRef}>
      <button
        type="button"
        onClick={() => setShowMenu(!showMenu)}
        title="More data actions"
        className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>

      {showMenu && (
        <div className="absolute right-0 top-full mt-1.5 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-40 animate-popIn text-xs">
          <button
            type="button"
            onClick={() => {
              setShowMenu(false);
              fileInputRef.current?.click();
            }}
            className="w-full px-3 py-1.5 text-left font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2 transition"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span>Import (JSON / CSV)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowMenu(false);
              DataExportImport.exportToJSON(
                items,
                `${activeBatch.name.toLowerCase().replace(/\s+/g, '-')}-items.json`
              );
            }}
            className="w-full px-3 py-1.5 text-left font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2 transition"
          >
            <FileCode className="w-3.5 h-3.5 text-slate-400" />
            <span>Export as JSON</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowMenu(false);
              DataExportImport.exportToCSV(
                items,
                `${activeBatch.name.toLowerCase().replace(/\s+/g, '-')}-items.csv`
              );
            }}
            className="w-full px-3 py-1.5 text-left font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
            <span>Export as CSV</span>
          </button>

          <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

          <button
            type="button"
            onClick={() => {
              setShowMenu(false);
              DataExportImport.exportWorkspace(batches, settings, drawLogs);
              toast(t('backupWorkspace'), 'success');
            }}
            className="w-full px-3 py-1.5 text-left font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center space-x-2 transition"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Backup Workspace</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowMenu(false);
              workspaceInputRef.current?.click();
            }}
            className="w-full px-3 py-1.5 text-left font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2 transition"
          >
            <FolderArchive className="w-3.5 h-3.5 text-slate-400" />
            <span>Restore Workspace</span>
          </button>

          <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

          {drawnCount > 0 && onResetDrawn && (
            <button
              type="button"
              onClick={() => {
                setShowMenu(false);
                showConfirm({
                  title: t('resetDrawnConfirmTitle'),
                  message: t('resetDrawnConfirmMsg'),
                  confirmText: 'Reset',
                  cancelText: t('cancel'),
                  onConfirm: onResetDrawn,
                });
              }}
              className="w-full px-3 py-1.5 text-left font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2 transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Drawn ({drawnCount})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setShowMenu(false);
              onUpdateItems(DEFAULT_ITEMS);
            }}
            className="w-full px-3 py-1.5 text-left font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-400" />
            <span>Load Default Items</span>
          </button>

          <button
            type="button"
            onClick={handleClearBatch}
            className="w-full px-3 py-1.5 text-left font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center space-x-2 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Items</span>
          </button>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.csv,text/csv,application/json"
        onChange={handleFileUpload}
        className="hidden"
      />
      <input
        ref={workspaceInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleWorkspaceBackupUpload}
        className="hidden"
      />
    </div>
  );
});

DataActionsMenu.displayName = 'DataActionsMenu';
