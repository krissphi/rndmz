import React, { useState, useRef, useEffect } from 'react';
import {
  Layers,
  ChevronDown,
  Plus,
  Check,
  X,
  PanelRightClose,
} from 'lucide-react';
import { Batch } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';
import { useDialog } from '../../context/DialogContext';
import { BatchDropdownMenu } from './BatchDropdownMenu';
import { BatchOptionsMenu } from './BatchOptionsMenu';

interface BatchHeaderProps {
  batches: Batch[];
  activeBatch: Batch;
  onSelectBatch: (batchId: string) => void;
  onCreateBatch: (name: string) => void;
  onRenameBatch: (batchId: string, newName: string) => void;
  onDuplicateBatch: (batchId: string) => void;
  onDeleteBatch: (batchId: string) => void;
  onCloseSidebar?: () => void;
}

export const BatchHeader: React.FC<BatchHeaderProps> = React.memo(({
  batches,
  activeBatch,
  onSelectBatch,
  onCreateBatch,
  onRenameBatch,
  onDuplicateBatch,
  onDeleteBatch,
  onCloseSidebar,
}) => {
  const { t } = useTranslation();
  const { showConfirm, showPrompt } = useDialog();

  const [isEditingBatchName, setIsEditingBatchName] = useState(false);
  const [editBatchNameValue, setEditBatchNameValue] = useState('');
  const [showBatchDropdown, setShowBatchDropdown] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowBatchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStartRename = () => {
    setEditBatchNameValue(activeBatch.name);
    setIsEditingBatchName(true);
  };

  const handleSaveRename = () => {
    if (editBatchNameValue.trim()) {
      onRenameBatch(activeBatch.id, editBatchNameValue.trim());
    }
    setIsEditingBatchName(false);
  };

  const handleCreateNew = () => {
    setShowBatchDropdown(false);
    showPrompt({
      title: t('newBatchPromptTitle'),
      message: t('newBatchPromptMsg'),
      defaultValue: t('newBatchDefaultName', { number: batches.length + 1 }),
      confirmText: t('save'),
      cancelText: t('cancel'),
      onConfirm: (name: string) => {
        if (name && name.trim()) {
          onCreateBatch(name.trim());
        }
      },
    });
  };

  const handleDeleteActiveBatch = () => {
    showConfirm({
      title: t('deleteBatchTitle'),
      message: t('deleteBatchConfirm', { name: activeBatch.name }),
      confirmText: t('delete'),
      cancelText: t('cancel'),
      isDanger: true,
      onConfirm: () => {
        onDeleteBatch(activeBatch.id);
      },
    });
  };

  const handleDuplicate = () => {
    onDuplicateBatch(activeBatch.id);
  };

  return (
    <div className="h-14 px-4 sm:px-5 border-b border-slate-200/90 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900 z-20">
      {/* Left: Active Batch Switcher or Inline Rename */}
      {isEditingBatchName ? (
        <div className="flex items-center space-x-1.5 flex-1 min-w-0 pr-2">
          <input
            type="text"
            value={editBatchNameValue}
            onChange={(e) => setEditBatchNameValue(e.target.value)}
            className="h-8.5 w-full px-2.5 text-xs font-semibold border border-indigo-500 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveRename();
              if (e.key === 'Escape') setIsEditingBatchName(false);
            }}
          />
          <button
            type="button"
            onClick={handleSaveRename}
            className="h-8.5 w-8.5 flex items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition shrink-0"
            title={t('save')}
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsEditingBatchName(false)}
            className="h-8.5 w-8.5 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 transition shrink-0"
            title={t('cancel')}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="relative flex-1 min-w-0 pr-2" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowBatchDropdown(!showBatchDropdown)}
            className="flex items-center space-x-2.5 py-1 px-1.5 -ml-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition text-left group max-w-full"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex items-center space-x-2">
              <span className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[130px] sm:max-w-[170px]">
                {activeBatch.name}
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-mono font-bold shrink-0">
                {activeBatch.items.length}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition shrink-0" />
          </button>

          <BatchDropdownMenu
            isOpen={showBatchDropdown}
            batches={batches}
            activeBatchId={activeBatch.id}
            onSelectBatch={(id) => {
              onSelectBatch(id);
              setShowBatchDropdown(false);
            }}
            onCreateNew={handleCreateNew}
          />
        </div>
      )}

      {/* Right Controls: Quick Add Batch, ⋯ Batch Options & Close Sidebar */}
      <div className="flex items-center space-x-0.5 shrink-0">
        <button
          type="button"
          onClick={handleCreateNew}
          title="Create new batch"
          className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Create new batch"
        >
          <Plus className="w-4 h-4" />
        </button>

        <BatchOptionsMenu
          hasMultipleBatches={batches.length > 1}
          onStartRename={handleStartRename}
          onDuplicate={handleDuplicate}
          onDelete={handleDeleteActiveBatch}
        />

        {onCloseSidebar && (
          <button
            type="button"
            onClick={onCloseSidebar}
            title="Close sidebar"
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition ml-0.5"
            aria-label="Close sidebar"
          >
            <PanelRightClose className="w-4 h-4 hidden lg:block" />
            <X className="w-4 h-4 lg:hidden" />
          </button>
        )}
      </div>
    </div>
  );
});

BatchHeader.displayName = 'BatchHeader';
