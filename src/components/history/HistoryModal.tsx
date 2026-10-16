import React, { useEffect } from 'react';
import { X, Clock, Trash2 } from 'lucide-react';
import { DrawLogEntry } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';
import { useDialog } from '../../context/DialogContext';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  drawLogs: DrawLogEntry[];
  onClearLogs: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = React.memo(({
  isOpen,
  onClose,
  drawLogs,
  onClearLogs,
}) => {
  const { t, language } = useTranslation();
  const { showConfirm } = useDialog();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
      title: t('clearLogsConfirmTitle'),
      message: t('clearLogsConfirmMsg'),
      isDanger: true,
      confirmText: t('clearAllLogs'),
      cancelText: t('cancel'),
      onConfirm: onClearLogs,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden animate-popIn"
        role="dialog"
        aria-modal="true"
        aria-label={t('drawLogsTitle')}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                {t('drawLogsTitle')}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {t('drawLogsCount', { count: drawLogs.length })}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-indigo-500"
            aria-label={t('close')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 text-xs">
          {drawLogs.length === 0 ? (
            <div className="py-14 text-center text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              {t('noLogsYet')}
            </div>
          ) : (
            <div className="space-y-2">
              {drawLogs.map((log, index) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-800 transition"
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

                    {log.batchName && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium shrink-0 hidden sm:inline">
                        {log.batchName}
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 shrink-0">
                    {formatTime(log.drawnAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          {drawLogs.length > 0 ? (
            <button
              type="button"
              onClick={handleClearLogsClick}
              className="flex items-center space-x-1.5 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 font-semibold transition px-2.5 py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('clearAllLogs')}</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 rounded-xl bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
});

HistoryModal.displayName = 'HistoryModal';
