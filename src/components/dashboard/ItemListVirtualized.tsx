import React, { useState, useMemo, useRef, useEffect, UIEvent } from 'react';
import { Minus, Plus, Check, Trash2 } from 'lucide-react';
import { Item } from '../../types';

interface ItemListVirtualizedProps {
  items: Item[];
  drawnIds: string[];
  onToggleDrawnItem: (id: string) => void;
  onAdjustWeight: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
}

export const ItemListVirtualized: React.FC<ItemListVirtualizedProps> = React.memo(({
  items,
  drawnIds,
  onToggleDrawnItem,
  onAdjustWeight,
  onRemoveItem,
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(360);
  const itemHeight = 44; // sleek checklist row height

  useEffect(() => {
    if (!containerRef.current) return;
    const updateHeight = () => {
      if (containerRef.current) {
        const h = containerRef.current.clientHeight;
        if (h > 0) {
          setContainerHeight(h);
        }
      }
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const drawnSet = useMemo(() => new Set(drawnIds), [drawnIds]);

  const totalItemsCount = items.length;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 2);
  const visibleCount = Math.ceil(containerHeight / itemHeight) + 4;
  const endIndex = Math.min(totalItemsCount, startIndex + visibleCount);
  const virtualizedItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div className="relative flex-1 min-h-0 flex flex-col">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-[160px] overflow-y-auto custom-scrollbar px-0.5"
      >
        {totalItemsCount === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-xs text-slate-400 dark:text-slate-500 text-center py-8">
            <p className="font-medium">No items found</p>
            <p className="text-[11px] text-slate-400 mt-1">Add items above or clear search</p>
          </div>
        ) : (
          <div style={{ height: totalItemsCount * itemHeight, position: 'relative' }}>
            <div style={{ transform: `translateY(${offsetY}px)`, position: 'absolute', width: '100%' }}>
              {virtualizedItems.map((item) => {
                const isDrawn = drawnSet.has(item.id);
                const weightVal = Math.max(1, Number(item.weight) || 1);

                return (
                  <div
                    key={item.id}
                    style={{ height: itemHeight }}
                    onClick={() => onToggleDrawnItem(item.id)}
                    className={`flex items-center justify-between px-2.5 rounded-xl cursor-pointer select-none transition-all group ${
                      isDrawn
                        ? 'bg-slate-50/60 dark:bg-slate-900/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                        : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    {/* Left: Modern Checklist Checkbox & Title */}
                    <div className="flex items-center space-x-2.5 flex-1 min-w-0 pr-2">
                      <div
                        className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center shrink-0 ${
                          isDrawn
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs'
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 group-hover:border-indigo-500'
                        }`}
                        title={isDrawn ? 'Mark as active' : 'Mark as drawn/done'}
                      >
                        {isDrawn && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                      </div>

                      {/* Item text & Category Tag */}
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <span
                          className={`text-xs sm:text-[13px] truncate transition-colors ${
                            isDrawn
                              ? 'line-through text-slate-400 dark:text-slate-500 font-normal'
                              : 'text-slate-800 dark:text-slate-100 font-medium'
                          }`}
                          title={item.text}
                        >
                          {item.text}
                        </span>

                        {item.category && item.category !== 'General' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400 font-medium shrink-0 max-w-[85px] truncate">
                            {item.category}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Odds Stepper & Direct Delete */}
                    <div
                      className="flex items-center space-x-1 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Odds Stepper */}
                      <div
                        className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-lg p-0.5 text-[10px]"
                        title="Odds multiplier"
                      >
                        <button
                          type="button"
                          onClick={() => onAdjustWeight(item.id, -1)}
                          disabled={weightVal <= 1}
                          title="Decrease odds"
                          className="w-4 h-4 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 transition"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>

                        <span className="px-1 font-mono font-bold text-slate-700 dark:text-slate-200 select-none min-w-[16px] text-center">
                          {weightVal}x
                        </span>

                        <button
                          type="button"
                          onClick={() => onAdjustWeight(item.id, 1)}
                          title="Increase odds"
                          className="w-4 h-4 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-700 transition"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      {/* Direct Delete button */}
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        title="Delete item"
                        className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition opacity-80 sm:opacity-0 sm:group-hover:opacity-100"
                        aria-label="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

ItemListVirtualized.displayName = 'ItemListVirtualized';
