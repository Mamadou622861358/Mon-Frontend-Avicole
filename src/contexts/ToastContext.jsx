import React, { createContext, useCallback, useContext, useState } from "react";
import Toast from "../components/Toast";

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast doit être utilisé dans un ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(
    ({ type = "info", title, message, duration = 5000 }) => {
      const id = Date.now() + Math.random();
      const newToast = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      // Auto-remove toast after duration
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    []
  );

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = useCallback(
    (title, message, duration) => {
      return addToast({ type: "success", title, message, duration });
    },
    [addToast]
  );

  const showError = useCallback(
    (title, message, duration) => {
      return addToast({ type: "error", title, message, duration });
    },
    [addToast]
  );

  const showWarning = useCallback(
    (title, message, duration) => {
      return addToast({ type: "warning", title, message, duration });
    },
    [addToast]
  );

  const showInfo = useCallback(
    (title, message, duration) => {
      return addToast({ type: "info", title, message, duration });
    },
    [addToast]
  );

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const value = {
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAllToasts,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Render all toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast, index) => (
          <Toast
            key={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={0} // We handle duration manually
            onClose={() => removeToast(toast.id)}
            show={true}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};


