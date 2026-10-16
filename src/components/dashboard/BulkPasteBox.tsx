import React, { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';

interface BulkPasteBoxProps {
  currentCategory: string;
  onImport: (itemsText: string, category: string, weight: number) => void;
  onClose: () => void;
}

export const BulkPasteBox: React.FC<BulkPasteBoxProps> = React.memo(({
  currentCategory,
  onImport,
  onClose,
}) => {
  const { t } = useTranslation();
  const [bulkText, setBulkText] = useState('');
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkWeight, setBulkWeight] = useState('1');

  const handleSubmit = () => {
    if (!bulkText.trim()) return;
    const cat = bulkCategory.trim() || (currentCategory !== 'ALL' ? currentCategory : t('categoryGeneral'));
    const weight = Math.max(1, parseInt(bulkWeight) || 1);
    onImport(bulkText, cat, weight);
    setBulkText('');
    onClose();
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 space-y-3 animate-popIn">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {t('categoryForImported')}
          </span>
          <input
            type="text"
            value={bulkCategory}
            onChange={(e) => setBulkCategory(e.target.value)}
            placeholder={currentCategory !== 'ALL' ? currentCategory : t('categoryGeneral')}
            className="w-full h-10 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:border-slate-900 dark:focus:border-indigo-500 focus:ring-2 focus:ring-slate-900/10"
          />
        </div>
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {t('defaultOdds')}
          </span>
          <input
            type="number"
            min="1"
            max="50"
            value={bulkWeight}
            onChange={(e) => setBulkWeight(e.target.value)}
            className="w-full h-10 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:border-slate-900 dark:focus:border-indigo-500 focus:ring-2 focus:ring-slate-900/10"
          />
        </div>
      </div>

      <textarea
        rows={4}
        value={bulkText}
        onChange={(e) => setBulkText(e.target.value)}
        placeholder={t('bulkTextareaPlaceholder')}
        className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-slate-900 dark:focus:border-indigo-500 focus:ring-2 focus:ring-slate-900/10 font-sans"
      />

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="h-10 px-4 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold rounded-xl transition"
        >
          {t('cancel')}
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!bulkText.trim()}
          className="h-10 px-4 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-indigo-500"
        >
          {t('importItemsButton')}
        </button>
      </div>
    </div>
  );
});

BulkPasteBox.displayName = 'BulkPasteBox';
