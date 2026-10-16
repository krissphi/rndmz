import React, { useState, useRef } from 'react';
import { Plus, Tag } from 'lucide-react';
import { Item } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';

interface QuickAddItemProps {
  items: Item[];
  onUpdateItems: (items: Item[]) => void;
  categories: string[];
  currentCategory: string;
}

export const QuickAddItem: React.FC<QuickAddItemProps> = React.memo(({
  items,
  onUpdateItems,
  categories,
  currentCategory,
}) => {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [selectedCat, setSelectedCat] = useState(() =>
    currentCategory !== 'ALL' ? currentCategory : 'General'
  );
  const [weight, setWeight] = useState(1);
  const [isCustomCat, setIsCustomCat] = useState(false);
  const [customCatName, setCustomCatName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync category default when active filter category changes
  React.useEffect(() => {
    if (currentCategory !== 'ALL') {
      setSelectedCat(currentCategory);
      setIsCustomCat(false);
    }
  }, [currentCategory]);

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanText = text.trim();
    if (!cleanText) return;

    const assignedCategory = isCustomCat && customCatName.trim()
      ? customCatName.trim()
      : (selectedCat || 'General');

    const newItem: Item = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text: cleanText,
      category: assignedCategory,
      weight: Math.max(1, weight),
    };

    onUpdateItems([...items, newItem]);
    setText('');
    inputRef.current?.focus();
  };

  return (
    <form
      onSubmit={handleAdd}
      className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-2.5 transition-all focus-within:border-slate-900 dark:focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-slate-900/10"
    >
      <div className="flex items-center space-x-2">
        {/* Main Text Input */}
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('quickAddPlaceholder')}
          className="flex-1 min-w-[140px] bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 px-2 py-1.5 focus:outline-none"
        />

        {/* Category Picker Pill / Selector */}
        <div className="flex items-center shrink-0">
          {isCustomCat ? (
            <input
              type="text"
              value={customCatName}
              onChange={(e) => setCustomCatName(e.target.value)}
              placeholder="Category..."
              autoFocus
              className="h-8 w-24 px-2 text-[11px] bg-white dark:bg-slate-800 border border-indigo-400 dark:border-indigo-500 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none font-medium"
              onKeyDown={(e) => {
                if (e.key === 'Escape') setIsCustomCat(false);
              }}
            />
          ) : (
            <div className="relative flex items-center">
              <select
                value={selectedCat}
                onChange={(e) => {
                  if (e.target.value === '__NEW__') {
                    setIsCustomCat(true);
                    setCustomCatName('');
                  } else {
                    setSelectedCat(e.target.value);
                  }
                }}
                className="h-8 pl-6 pr-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-semibold text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="General">{t('categoryGeneral')}</option>
                {categories
                  .filter((c) => c !== 'General')
                  .map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                <option value="__NEW__">+ {t('createCategory', { name: '...' })}</option>
              </select>
              <Tag className="w-3 h-3 text-slate-400 absolute left-2 pointer-events-none" />
            </div>
          )}
        </div>

        {/* Odds Stepper (Quick cycle 1x -> 2x -> 3x -> 5x) */}
        <button
          type="button"
          onClick={() => {
            const weights = [1, 2, 3, 5, 10];
            const nextIdx = (weights.indexOf(weight) + 1) % weights.length;
            setWeight(weights[nextIdx]);
          }}
          title={t('oddsMultiplierTooltip')}
          className="h-8 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shrink-0 shadow-xs transition"
        >
          {weight}x
        </button>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!text.trim()}
          className="h-8 w-8 flex items-center justify-center bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 disabled:opacity-30 disabled:pointer-events-none text-white rounded-lg shadow-xs transition active:scale-95 shrink-0 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-indigo-500"
          aria-label={t('addItemButton')}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
});

QuickAddItem.displayName = 'QuickAddItem';
