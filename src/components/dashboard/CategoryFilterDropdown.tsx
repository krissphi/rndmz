import React, { useRef, useState, useEffect } from 'react';
import { Filter, ChevronDown, Check } from 'lucide-react';

interface CategoryFilterDropdownProps {
  categories: string[];
  currentCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryFilterDropdown: React.FC<CategoryFilterDropdownProps> = React.memo(({
  categories,
  currentCategory,
  onSelectCategory,
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

  if (categories.length === 0) return null;

  const isFiltered = currentCategory !== 'ALL';

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-7 px-2.5 rounded-lg flex items-center space-x-1.5 text-xs font-medium transition border ${
          isFiltered
            ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-semibold'
            : 'bg-white dark:bg-slate-800/90 border-slate-200/90 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
        }`}
      >
        <Filter className="w-3 h-3 shrink-0" />
        <span className="max-w-[85px] sm:max-w-[110px] truncate">
          {currentCategory === 'ALL' ? 'Category' : currentCategory}
        </span>
        <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-40 animate-popIn text-xs">
          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Filter Category
          </div>
          <button
            type="button"
            onClick={() => {
              onSelectCategory('ALL');
              setIsOpen(false);
            }}
            className={`w-full px-3 py-1.5 text-left flex items-center justify-between transition ${
              currentCategory === 'ALL'
                ? 'font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span>All Categories</span>
            {currentCategory === 'ALL' && <Check className="w-3.5 h-3.5" />}
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                onSelectCategory(cat);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-1.5 text-left flex items-center justify-between transition ${
                currentCategory === cat
                  ? 'font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span className="truncate pr-2">{cat}</span>
              {currentCategory === cat && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

CategoryFilterDropdown.displayName = 'CategoryFilterDropdown';
