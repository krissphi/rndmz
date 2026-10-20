import React from 'react';
import { Plus, Check } from 'lucide-react';
import { Batch } from '../../types';

interface BatchDropdownMenuProps {
  isOpen: boolean;
  batches: Batch[];
  activeBatchId: string;
  onSelectBatch: (id: string) => void;
  onCreateNew: () => void;
}

export const BatchDropdownMenu: React.FC<BatchDropdownMenuProps> = React.memo(({
  isOpen,
  batches,
  activeBatchId,
  onSelectBatch,
  onCreateNew,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute left-0 top-full mt-1.5 w-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-50 animate-popIn text-xs">
      <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        Batches
      </div>

      <div className="max-h-52 overflow-y-auto custom-scrollbar">
        {batches.map((b) => {
          const isActive = b.id === activeBatchId;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => onSelectBatch(b.id)}
              className={`w-full px-3 py-2 text-left flex items-center justify-between transition ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium'
              }`}
            >
              <span className="truncate pr-2">{b.name}</span>
              <div className="flex items-center space-x-1.5 shrink-0">
                <span className="text-[10px] text-slate-400 font-mono">
                  {b.items.length} items
                </span>
                {isActive && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

      <button
        type="button"
        onClick={onCreateNew}
        className="w-full px-3 py-2 text-left font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center space-x-2 transition"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Create New Batch</span>
      </button>
    </div>
  );
});

BatchDropdownMenu.displayName = 'BatchDropdownMenu';
