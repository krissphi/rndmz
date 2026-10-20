import React, { useRef, useState, useEffect, useMemo } from 'react';
import { ArrowUpDown, ChevronDown, Check } from 'lucide-react';
import { SortOption } from '../../types';

interface SortDropdownProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'default', label: 'Default order' },
  { value: 'name-asc', label: 'Name (A to Z)' },
  { value: 'name-desc', label: 'Name (Z to A)' },
  { value: 'weight-desc', label: 'Highest Odds' },
  { value: 'weight-asc', label: 'Lowest Odds' },
  { value: 'category-asc', label: 'Category' },
];

export const SortDropdown: React.FC<SortDropdownProps> = React.memo(({
  sortBy,
  onSortChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isSorted = sortBy !== 'default';

  const activeLabel = useMemo(() => {
    switch (sortBy) {
      case 'name-asc':
        return 'Name (A-Z)';
      case 'name-desc':
        return 'Name (Z-A)';
      case 'weight-desc':
        return 'High Odds';
      case 'weight-asc':
        return 'Low Odds';
      case 'category-asc':
        return 'Category';
      case 'default':
      default:
        return 'Sort';
    }
  }, [sortBy]);

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-7 px-2.5 rounded-lg flex items-center space-x-1.5 text-xs font-medium transition border ${
          isSorted
            ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-semibold'
            : 'bg-white dark:bg-slate-800/90 border-slate-200/90 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
        }`}
      >
        <ArrowUpDown className="w-3 h-3 shrink-0" />
        <span className="max-w-[70px] sm:max-w-[90px] truncate">{activeLabel}</span>
        <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-44 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-40 animate-popIn text-xs">
          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Sort Order
          </div>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onSortChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-1.5 text-left flex items-center justify-between transition ${
                sortBy === opt.value
                  ? 'font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>{opt.label}</span>
              {sortBy === opt.value && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

SortDropdown.displayName = 'SortDropdown';
