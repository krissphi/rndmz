import React, { useState, useMemo, UIEvent } from 'react';
import { Minus, Plus, CheckCircle2, X } from 'lucide-react';
import { Item } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';

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
  const { t } = useTranslation();
  const [scrollTop, setScrollTop] = useState(0);
  const scrollContainerHeight = 320;
  const itemHeight = 48; // row height in px

  const drawnSet = useMemo(() => new Set(drawnIds), [drawnIds]);

  const totalItemsCount = items.length;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 3);
  const visibleCount = Math.ceil(scrollContainerHeight / itemHeight) + 6;
  const endIndex = Math.min(totalItemsCount, startIndex + visibleCount);
  const virtualizedItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div className="relative">
      <div
        onScroll={handleScroll}
        style={{ height: scrollContainerHeight }}
        className="overflow-y-auto border border-slate-200/80 dark:border-slate-800 rounded-2xl p-2 relative bg-slate-50/40 dark:bg-slate-900/40 custom-scrollbar"
      >
        {totalItemsCount === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400 dark:text-slate-500 text-center px-4">
            {t('noItemsFound')}
          </div>
        ) : (
          <div style={{ height: totalItemsCount * itemHeight, position: 'relative' }}>
            <div style={{ transform: `translateY(${offsetY}px)`, position: 'absolute', width: '100%' }}>
              {virtualizedItems.map((item, idx) => {
                const actualIndex = startIndex + idx;
                const isDrawn = drawnSet.has(item.id);
                const weightVal = Math.max(1, Number(item.weight) || 1);

                return (
                  <div
                    key={item.id}
                    style={{ height: itemHeight }}
                    className="flex items-center justify-between px-3 text-xs group hover:bg-slate-100/70 dark:hover:bg-slate-800/60 rounded-xl transition"
                  >
                    {/* Category badge before the name */}
                    <div className="flex items-center space-x-2.5 flex-1 min-w-0 mr-3">
                      <span className="text-slate-400 dark:text-slate-500 text-[10px] w-6 text-right select-none font-mono">
                        {actualIndex + 1}.
                      </span>

                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold select-none shrink-0 shadow-xs">
                        {item.category || t('categoryGeneral')}
                      </span>

                      <span
                        className={`truncate font-medium ${
                          isDrawn
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-800 dark:text-slate-100'
                        }`}
                      >
                        {item.text}
                      </span>
                    </div>

                    {/* Controls: Stepper (~88px fixed width) + Drawn toggle + Delete */}
                    <div className="flex items-center space-x-2 shrink-0">
                      {/* Fixed width ~88px Stepper with centered number */}
                      <div
                        className="flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden text-[11px] w-[88px] h-7 shadow-xs"
                        title={t('oddsTitle')}
                      >
                        <button
                          type="button"
                          onClick={() => onAdjustWeight(item.id, -1)}
                          disabled={weightVal <= 1}
                          title={t('decreaseOdds')}
                          className="w-6 h-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition shrink-0"
                        >
                          <Minus className="w-3 h-3" />
                        </button>

                        <span className="flex-1 font-bold font-mono text-slate-700 dark:text-slate-200 text-center select-none">
                          {weightVal}x
                        </span>

                        <button
                          type="button"
                          onClick={() => onAdjustWeight(item.id, 1)}
                          title={t('increaseOdds')}
                          className="w-6 h-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition shrink-0"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Toggle Drawn status */}
                      <button
                        type="button"
                        onClick={() => onToggleDrawnItem(item.id)}
                        title={isDrawn ? t('unmarkDrawn') : t('markDrawn')}
                        className={`p-1.5 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-indigo-500 ${
                          isDrawn
                            ? 'text-amber-600 dark:text-amber-400 hover:text-emerald-600 bg-amber-50/60 dark:bg-amber-950/40'
                            : 'text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        aria-label={isDrawn ? t('unmarkDrawn') : t('markDrawn')}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete item button */}
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        title={t('deleteItem')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                        aria-label={t('deleteItem')}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Subtle bottom fade gradient */}
      {totalItemsCount > 6 && (
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white/80 dark:from-slate-900/80 to-transparent pointer-events-none rounded-b-2xl" />
      )}
    </div>
  );
});

ItemListVirtualized.displayName = 'ItemListVirtualized';
