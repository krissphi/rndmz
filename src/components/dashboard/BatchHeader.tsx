import React, { useState } from 'react';
import { Layers, Plus, Check, X, Edit2, Copy, Trash2 } from 'lucide-react';
import { Batch } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';
import { useDialog } from '../../context/DialogContext';

interface BatchHeaderProps {
  batches: Batch[];
  activeBatch: Batch;
  onSelectBatch: (batchId: string) => void;
  onCreateBatch: (name: string) => void;
  onRenameBatch: (batchId: string, newName: string) => void;
  onDuplicateBatch: (batchId: string) => void;
  onDeleteBatch: (batchId: string) => void;
}

export const BatchHeader: React.FC<BatchHeaderProps> = React.memo(({
  batches,
  activeBatch,
  onSelectBatch,
  onCreateBatch,
  onRenameBatch,
  onDuplicateBatch,
  onDeleteBatch,
}) => {
  const { t } = useTranslation();
  const { showConfirm, showPrompt } = useDialog();

  const [isEditingBatchName, setIsEditingBatchName] = useState(false);
  const [editBatchNameValue, setEditBatchNameValue] = useState('');

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

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center space-x-2">
        <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 shrink-0">
          {t('batch')}:
        </span>

        {isEditingBatchName ? (
          <div className="flex items-center space-x-1.5">
            <input
              type="text"
              value={editBatchNameValue}
              onChange={(e) => setEditBatchNameValue(e.target.value)}
              className="h-10 px-3 text-xs border border-indigo-500 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveRename();
                if (e.key === 'Escape') setIsEditingBatchName(false);
              }}
            />
            <button
              type="button"
              onClick={handleSaveRename}
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
              title={t('save')}
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsEditingBatchName(false)}
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition focus:outline-none focus:ring-2 focus:ring-slate-400"
              title={t('cancel')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-1.5">
            <select
              value={activeBatch.id}
              onChange={(e) => onSelectBatch(e.target.value)}
              className="h-10 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 border-none rounded-xl px-3.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-indigo-500 cursor-pointer transition"
            >
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({t('itemsCount', { count: b.items.length })})
                </option>
              ))}
            </select>

            {/* Rename Batch */}
            <button
              type="button"
              onClick={handleStartRename}
              title={t('renameBatch')}
              className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-indigo-500"
              aria-label={t('renameBatch')}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            {/* Duplicate Batch */}
            <button
              type="button"
              onClick={() => onDuplicateBatch(activeBatch.id)}
              title={t('duplicateBatch')}
              className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label={t('duplicateBatch')}
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            {/* Delete Batch */}
            {batches.length > 1 && (
              <button
                type="button"
                onClick={handleDeleteActiveBatch}
                title={t('deleteBatchTitle')}
                className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition focus:outline-none focus:ring-2 focus:ring-rose-500"
                aria-label={t('deleteBatchTitle')}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleCreateNew}
        className="h-10 flex items-center space-x-1.5 text-xs font-semibold px-4 rounded-xl bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white transition active:scale-95 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-indigo-500"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>{t('newBatch')}</span>
      </button>
    </div>
  );
});

BatchHeader.displayName = 'BatchHeader';
