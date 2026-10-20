import React, { useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle, RotateCcw } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  action?: ToastAction;
}

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

export interface PromptDialogOptions {
  title: string;
  message: string;
  defaultValue?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: (value: string) => void;
  onCancel?: () => void;
}

export interface AlertDialogOptions {
  title: string;
  message: string;
  buttonText?: string;
  onClose?: () => void;
}

interface DialogOverlaysProps {
  toasts: ToastItem[];
  onRemoveToast: (id: string) => void;
  confirmDialog: ConfirmDialogOptions | null;
  onConfirmSubmit: () => void;
  onConfirmCancel: () => void;
  promptDialog: PromptDialogOptions | null;
  promptValue: string;
  onPromptChange: (val: string) => void;
  onPromptSubmit: (e?: React.FormEvent) => void;
  onPromptCancel: () => void;
  alertDialog: AlertDialogOptions | null;
  onAlertClose: () => void;
}

export const DialogOverlays: React.FC<DialogOverlaysProps> = ({
  toasts,
  onRemoveToast,
  confirmDialog,
  onConfirmSubmit,
  onConfirmCancel,
  promptDialog,
  promptValue,
  onPromptChange,
  onPromptSubmit,
  onPromptCancel,
  alertDialog,
  onAlertClose,
}) => {
  const promptInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      {/* Floating Toasts */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex flex-col space-y-2 pointer-events-none w-full max-w-sm px-4">
        {toasts.map((t) => {
          const isSuccess = t.type === 'success';
          const isError = t.type === 'error';

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-2xl shadow-xl border backdrop-blur-md animate-slideDown transition-all ${
                isSuccess
                  ? 'bg-emerald-500/90 text-white border-emerald-400/40 shadow-emerald-500/20'
                  : isError
                  ? 'bg-rose-500/90 text-white border-rose-400/40 shadow-rose-500/20'
                  : 'bg-slate-900/90 text-white border-slate-700/60 shadow-slate-900/25 dark:bg-slate-800/95'
              }`}
            >
              <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                {isSuccess && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-100" />}
                {isError && <AlertCircle className="w-4 h-4 shrink-0 text-rose-100" />}
                {!isSuccess && !isError && <Info className="w-4 h-4 shrink-0 text-sky-200" />}
                <p className="text-xs font-semibold leading-snug break-words">{t.message}</p>
              </div>
              <div className="flex items-center space-x-1.5 shrink-0">
                {t.action && (
                  <button
                    type="button"
                    onClick={() => {
                      t.action?.onClick();
                      onRemoveToast(t.id);
                    }}
                    className="h-7 px-2.5 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition active:scale-95 flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{t.action.label}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onRemoveToast(t.id)}
                  className="p-1 rounded-lg hover:bg-white/20 transition shrink-0 opacity-80 hover:opacity-100 focus:outline-none"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirm Modal */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-popIn">
            <div className="flex items-start space-x-3.5">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  confirmDialog.isDanger
                    ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                    : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
                }`}
              >
                {confirmDialog.isDanger ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <Info className="w-5 h-5" />
                )}
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  {confirmDialog.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {confirmDialog.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2.5 pt-2">
              <button
                type="button"
                onClick={onConfirmCancel}
                className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                {confirmDialog.cancelText || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={onConfirmSubmit}
                autoFocus
                className={`h-10 px-5 rounded-xl text-xs font-bold text-white shadow-md transition active:scale-95 focus:outline-none focus:ring-2 ${
                  confirmDialog.isDanger
                    ? 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500 shadow-rose-600/20'
                    : 'bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 focus:ring-slate-900 shadow-slate-900/20'
                }`}
              >
                {confirmDialog.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prompt Modal */}
      {promptDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-fadeIn">
          <form
            onSubmit={onPromptSubmit}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-popIn"
          >
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {promptDialog.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {promptDialog.message}
              </p>
            </div>

            <input
              ref={promptInputRef}
              type="text"
              value={promptValue}
              onChange={(e) => onPromptChange(e.target.value)}
              placeholder={promptDialog.placeholder || ''}
              autoFocus
              className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-indigo-500 focus:ring-2 focus:ring-slate-900/10 transition"
              onKeyDown={(e) => {
                if (e.key === 'Escape') onPromptCancel();
              }}
            />

            <div className="flex items-center justify-end space-x-2.5 pt-1">
              <button
                type="button"
                onClick={onPromptCancel}
                className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                {promptDialog.cancelText || 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={!promptValue.trim()}
                className="h-10 px-5 rounded-xl bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold shadow-md transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                {promptDialog.confirmText || 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Alert Modal */}
      {alertDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-popIn">
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  {alertDialog.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {alertDialog.message}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onAlertClose}
                autoFocus
                className="h-10 px-5 rounded-xl bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                {alertDialog.buttonText || 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
