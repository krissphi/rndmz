import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Check } from 'lucide-react';
import { Item } from '../../types';

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [text, setText] = useState('');
  const [selectedCat, setSelectedCat] = useState(() =>
    currentCategory !== 'ALL' ? currentCategory : 'General'
  );
  const [weight, setWeight] = useState(1);
  const [isCustomCat, setIsCustomCat] = useState(false);
  const [customCatName, setCustomCatName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync category default when active filter category changes
  useEffect(() => {
    if (currentCategory !== 'ALL') {
      setSelectedCat(currentCategory);
      setIsCustomCat(false);
    }
  }, [currentCategory]);

  useEffect(() => {
    if (isExpanded) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isExpanded]);

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

  const cycleWeight = () => {
    const weights = [1, 2, 3, 5, 10];
    const nextIdx = (weights.indexOf(weight) + 1) % weights.length;
    setWeight(weights[nextIdx]);
  };

  const handleClose = () => {
    setText('');
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <button
        type="button"
        onClick={() => setIsExpanded(true)}
        className="w-full h-8 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-white/60 dark:bg-slate-900/60 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 text-xs font-semibold flex items-center justify-center space-x-1.5 transition active:scale-[0.99] shadow-2xs"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add new item</span>
      </button>
    );
  }

  return (
    <form
      onSubmit={handleAdd}
      className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-2.5 shadow-2xs focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition animate-fadeIn"
    >
      {/* 1. Full-Width Item Text Input */}
      <div className="flex items-center space-x-2">
        <Plus className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add new item... (Press Enter to add)"
          className="w-full bg-transparent text-xs sm:text-[13px] text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none min-w-0 font-medium"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              handleClose();
            }
          }}
        />
        <button
          type="button"
          onClick={handleClose}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition"
          title="Close input"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Secondary Row: Category, Odds & Add Action */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 gap-2">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {/* Category Selector */}
          {isCustomCat ? (
            <div className="flex items-center space-x-1 shrink-0">
              <input
                type="text"
                value={customCatName}
                onChange={(e) => setCustomCatName(e.target.value)}
                placeholder="Category name..."
                autoFocus
                className="h-6.5 w-28 px-2 text-[11px] bg-slate-100 dark:bg-slate-800 border border-indigo-400 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none font-semibold"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setIsCustomCat(false);
                  if (e.key === 'Enter') handleAdd(e);
                }}
              />
              <button
                type="button"
                onClick={() => setIsCustomCat(false)}
                className="p-0.5 text-slate-400 hover:text-slate-600"
                title="Cancel category"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
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
              className="h-6.5 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 text-[11px] font-semibold text-slate-600 dark:text-slate-300 rounded-md border-none focus:outline-none cursor-pointer max-w-[130px] truncate transition"
            >
              <option value="General">Category: General</option>
              {categories
                .filter((c) => c !== 'General')
                .map((c) => (
                  <option key={c} value={c}>
                    Category: {c}
                  </option>
                ))}
              <option value="__NEW__">+ New Category</option>
            </select>
          )}

          {/* Odds Stepper */}
          <button
            type="button"
            onClick={cycleWeight}
            title="Odds multiplier (click to cycle: 1x, 2x, 3x, 5x, 10x)"
            className={`h-6.5 px-2 rounded-md text-[11px] font-mono font-bold transition shrink-0 ${
              weight > 1
                ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200/60'
            }`}
          >
            Odds: {weight}x
          </button>
        </div>

        {/* Action Buttons: Done & Add */}
        <div className="flex items-center space-x-1.5 shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="h-6.5 px-2 rounded-md text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-[11px] font-medium transition"
          >
            Done
          </button>
          <button
            type="submit"
            disabled={!text.trim()}
            className="h-6.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:pointer-events-none text-white text-[11px] font-semibold transition active:scale-95 shrink-0 flex items-center space-x-1 shadow-2xs"
          >
            <Check className="w-3 h-3" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </form>
  );
});

QuickAddItem.displayName = 'QuickAddItem';
