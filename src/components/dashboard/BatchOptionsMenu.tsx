import React, { useRef, useState, useEffect } from 'react';
import { MoreHorizontal, Edit2, Copy, Trash2 } from 'lucide-react';

interface BatchOptionsMenuProps {
  hasMultipleBatches: boolean;
  onStartRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export const BatchOptionsMenu: React.FC<BatchOptionsMenuProps> = React.memo(({
  hasMultipleBatches,
  onStartRename,
  onDuplicate,
  onDelete,
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

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Batch options"
        className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        aria-label="Batch options"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-50 animate-popIn text-xs">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onStartRename();
            }}
            className="w-full px-3 py-2 text-left font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2.5 transition"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Rename Batch</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onDuplicate();
            }}
            className="w-full px-3 py-2 text-left font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2.5 transition"
          >
            <Copy className="w-3.5 h-3.5 text-slate-400" />
            <span>Duplicate Batch</span>
          </button>

          {hasMultipleBatches && (
            <>
              <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onDelete();
                }}
                className="w-full px-3 py-2 text-left font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center space-x-2.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Batch</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
});

BatchOptionsMenu.displayName = 'BatchOptionsMenu';
