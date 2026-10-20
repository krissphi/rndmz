import React from 'react';
import { Clock, Trash2, PanelRightClose, X } from 'lucide-react';
import { DrawLogEntry } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';
import { useDialog } from '../../context/DialogContext';

interface HistoryPanelProps {
  drawLogs: DrawLogEntry[];
  activeBatchName?: string;
  onClearLogs: () => void;
  onClose: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = React.memo(({
  drawLogs,
  activeBatchName,
  onClearLogs,
  onClose,
}) => {
  const { t, language } = useTranslation();
  const { showConfirm } = useDialog();

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleString(language === 'id' ? 'id-ID' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const handleClearLogsClick = () => {
    showConfirm({
      title: activeBatchName ? `Clear History: ${activeBatchName}` : t('clearLogsConfirmTitle'),
      message: activeBatchName
        ? `Are you sure you want to clear draw history for "${activeBatchName}"? This action cannot be undone.`
        : t('clearLogsConfirmMsg'),
      isDanger: true,
      confirmText: t('clearAllLogs'),
      cancelText: t('cancel'),
      onConfirm: onClearLogs,
    });
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 overflow-hidden">
      {/* Panel Header */}
      <div className="h-14 px-4 sm:px-5 border-b border-slate-200/90 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900 z-20">
        <div className="flex items-center space-x-2.5 min-w-0 pr-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex items-center space-x-2">
            <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
              {t('history')}
            </span>
            {activeBatchName && (
              <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-mono font-bold shrink-0 truncate max-w-[120px]">
                {activeBatchName}
              </span>
            )}
            <span className="px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[11px] font-mono font-bold shrink-0">
              {drawLogs.length}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1 shrink-0">
          {drawLogs.length > 0 && (
            <button
              type="button"
              onClick={handleClearLogsClick}
              title="Clear draw history"
              className="w-8 h-8 flex items-center justify-center rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
              aria-label="Clear history"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            title="Close sidebar"
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Close sidebar"
          >
            <PanelRightClose className="w-4 h-4 hidden lg:block" />
            <X className="w-4 h-4 lg:hidden" />
          </button>
        </div>
      </div>

      {/* Logs Scrollable Content */}
      <div className="p-4 sm:p-5 overflow-y-auto custom-scrollbar flex-1 text-xs">
        {drawLogs.length === 0 ? (
          <div className="py-14 px-4 text-center text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="font-semibold text-slate-600 dark:text-slate-300 text-xs">
              {activeBatchName ? `No draw history in "${activeBatchName}"` : t('noLogsYet')}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Start shuffling to see recorded timestamps for this batch.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {drawLogs.map((log, index) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-800 transition shadow-2xs"
              >
                <div className="flex items-center space-x-2.5 min-w-0 flex-1 mr-2">
                  <span className="font-mono text-slate-400 dark:text-slate-500 text-[11px] w-6 text-right shrink-0">
                    #{drawLogs.length - index}
                  </span>

                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold shrink-0">
                    {log.category || t('categoryGeneral')}
                  </span>

                  <span className="font-bold text-slate-900 dark:text-slate-100 truncate">
                    {log.itemText}
                  </span>
                </div>

                <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 shrink-0">
                  {formatTime(log.drawnAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

HistoryPanel.displayName = 'HistoryPanel';
