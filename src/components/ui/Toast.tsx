'use client';

import { createContext, useContext, ReactNode } from 'react';

/**
 * Toast API kept for call-site compatibility, but UI is intentionally silent.
 * Pop-up notifications are removed product-wide. Feedback belongs inline on the
 * control the user just used (button status text, dialogs they opened, etc.).
 */
type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastContextValue {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const noop = () => {};

const silent: ToastContextValue = {
  toast: noop,
  success: noop,
  error: noop,
  info: noop,
  warning: noop,
};

const ToastContext = createContext<ToastContextValue>(silent);

export function useToast() {
  return useContext(ToastContext) ?? silent;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <ToastContext.Provider value={silent}>
      {children}
    </ToastContext.Provider>
  );
}
