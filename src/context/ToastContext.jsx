import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = 'info', message, title, duration = 3500 }) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 9);
      const newToast = { id, type, message, title, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const toast = {
    success: (message, title) => addToast({ type: 'success', message, title }),
    error: (message, title) => addToast({ type: 'error', message, title }),
    info: (message, title) => addToast({ type: 'info', message, title }),
    warning: (message, title) => addToast({ type: 'warning', message, title }),
    custom: addToast,
    remove: removeToast,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Portal / Container */}
      <div
        id="toast-notification-container"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0 pointer-events-none"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((item) => {
          const icons = {
            success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
            error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
            warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
            info: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
          };

          const borderColors = {
            success: 'border-emerald-200 bg-white shadow-emerald-100',
            error: 'border-rose-200 bg-white shadow-rose-100',
            warning: 'border-amber-200 bg-white shadow-amber-100',
            info: 'border-blue-200 bg-white shadow-blue-100',
          };

          return (
            <div
              key={item.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all transform translate-y-0 opacity-100 ${
                borderColors[item.type] || 'border-gray-200 bg-white'
              }`}
            >
              {icons[item.type] || icons.info}
              <div className="flex-1 min-w-0">
                {item.title && (
                  <h4 className="text-sm font-semibold text-gray-900 leading-none mb-1">
                    {item.title}
                  </h4>
                )}
                <p className="text-sm text-gray-700 leading-snug">{item.message}</p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(item.id)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg transition hover:bg-gray-100 -mr-1 -mt-1"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
