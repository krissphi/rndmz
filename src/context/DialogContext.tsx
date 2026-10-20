import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  DialogOverlays,
  ToastType,
  ToastItem,
  ToastAction,
  ConfirmDialogOptions,
  PromptDialogOptions,
  AlertDialogOptions,
} from '../components/common/DialogOverlays';

export type { ToastType, ToastItem, ToastAction, ConfirmDialogOptions, PromptDialogOptions, AlertDialogOptions };

export interface ToastOptions {
  action?: ToastAction;
  duration?: number;
}

interface DialogContextType {
  toast: (message: string, type?: ToastType, options?: ToastOptions) => void;
  showConfirm: (options: ConfirmDialogOptions) => void;
  showPrompt: (options: PromptDialogOptions) => void;
  showAlert: (options: AlertDialogOptions) => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogOptions | null>(null);
  const [promptDialog, setPromptDialog] = useState<PromptDialogOptions | null>(null);
  const [promptValue, setPromptValue] = useState('');
  const [alertDialog, setAlertDialog] = useState<AlertDialogOptions | null>(null);

  // Toast handler
  const toast = useCallback((message: string, type: ToastType = 'info', options?: ToastOptions) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const duration = options?.duration ?? 4000;
    setToasts((prev) => [...prev, { id, message, type, action: options?.action }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Show Confirm dialog
  const showConfirm = useCallback((options: ConfirmDialogOptions) => {
    setConfirmDialog(options);
  }, []);

  // Show Prompt dialog
  const showPrompt = useCallback((options: PromptDialogOptions) => {
    setPromptValue(options.defaultValue || '');
    setPromptDialog(options);
  }, []);

  // Show Alert dialog
  const showAlert = useCallback((options: AlertDialogOptions) => {
    setAlertDialog(options);
  }, []);

  const handleConfirmSubmit = useCallback(() => {
    if (confirmDialog) {
      confirmDialog.onConfirm();
      setConfirmDialog(null);
    }
  }, [confirmDialog]);

  const handleConfirmCancel = useCallback(() => {
    if (confirmDialog) {
      confirmDialog.onCancel?.();
      setConfirmDialog(null);
    }
  }, [confirmDialog]);

  const handlePromptSubmit = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (promptDialog) {
      promptDialog.onConfirm(promptValue);
      setPromptDialog(null);
    }
  }, [promptDialog, promptValue]);

  const handlePromptCancel = useCallback(() => {
    if (promptDialog) {
      promptDialog.onCancel?.();
      setPromptDialog(null);
    }
  }, [promptDialog]);

  const handleAlertClose = useCallback(() => {
    if (alertDialog) {
      alertDialog.onClose?.();
      setAlertDialog(null);
    }
  }, [alertDialog]);

  return (
    <DialogContext.Provider value={{ toast, showConfirm, showPrompt, showAlert }}>
      {children}
      <DialogOverlays
        toasts={toasts}
        onRemoveToast={removeToast}
        confirmDialog={confirmDialog}
        onConfirmSubmit={handleConfirmSubmit}
        onConfirmCancel={handleConfirmCancel}
        promptDialog={promptDialog}
        promptValue={promptValue}
        onPromptChange={setPromptValue}
        onPromptSubmit={handlePromptSubmit}
        onPromptCancel={handlePromptCancel}
        alertDialog={alertDialog}
        onAlertClose={handleAlertClose}
      />
    </DialogContext.Provider>
  );
};

export const useDialog = (): DialogContextType => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};
