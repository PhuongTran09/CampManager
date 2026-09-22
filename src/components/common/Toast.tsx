import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Standalone listener for calling toast outside React tree
type ToastListener = (toast: { message: string; type: ToastType; duration?: number }) => void;
let globalToastListener: ToastListener | null = null;

export const toast = {
  show: (message: string, type: ToastType = 'info', duration = 3500) => {
    if (globalToastListener) {
      globalToastListener({ message, type, duration });
    }
  },
  success: (message: string, duration = 3500) => toast.show(message, 'success', duration),
  error: (message: string, duration = 4000) => toast.show(message, 'error', duration),
  warning: (message: string, duration = 3500) => toast.show(message, 'warning', duration),
  info: (message: string, duration = 3500) => toast.show(message, 'info', duration)
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info', duration = 3500) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastItem = { id, type, message };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  // Connect global toast listener
  useEffect(() => {
    globalToastListener = ({ message, type, duration }) => {
      addToast(message, type, duration);
    };
    return () => {
      globalToastListener = null;
    };
  }, [addToast]);

  const contextValue: ToastContextType = {
    showToast: addToast,
    toast: {
      success: (msg, dur) => addToast(msg, 'success', dur),
      error: (msg, dur) => addToast(msg, 'error', dur),
      warning: (msg, dur) => addToast(msg, 'warning', dur),
      info: (msg, dur) => addToast(msg, 'info', dur)
    }
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '!';
      case 'info':
      default:
        return 'i';
    }
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {toasts.length > 0 && (
        <div className="toast-container" aria-live="polite">
          {toasts.map((t) => (
            <div key={t.id} className={`toast-item toast-${t.type}`}>
              <span className="toast-icon">{getIcon(t.type)}</span>
              <span className="toast-content">{t.message}</span>
              <button
                type="button"
                className="toast-close"
                onClick={() => removeToast(t.id)}
                aria-label="Đóng thông báo"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Return fallback to standalone toast if outside provider
    return {
      showToast: toast.show,
      toast
    };
  }
  return context;
};
