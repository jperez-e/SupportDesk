import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

export type ToastType =
  | "success"
  | "error"
  | "warning"
  | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (
    message: string,
    type?: ToastType
  ) => void;
}

interface ToastProviderProps {
  children: ReactNode;
}

const ToastContext =
  createContext<ToastContextType | undefined>(
    undefined
  );

export function ToastProvider({
  children,
}: ToastProviderProps) {
  const [toasts, setToasts] =
    useState<Toast[]>([]);

  const removeToast = useCallback(
    (id: number) => {
      setToasts((current) =>
        current.filter(
          (toast) =>
            toast.id !== id
        )
      );
    },
    []
  );

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = "info"
    ) => {
      const id =
        Date.now() +
        Math.floor(
          Math.random() * 1000
        );

      const toast: Toast = {
        id,
        message,
        type,
      };

      setToasts((current) => [
        ...current,
        toast,
      ]);

      window.setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider
      value={{
        showToast,
      }}
    >
      {children}

      <div className="toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type}`}
            role="status"
          >
            <div className="toast-content">

              <span className="toast-icon">
                {toast.type === "success" &&
                  "✓"}

                {toast.type === "error" &&
                  "!"}

                {toast.type === "warning" &&
                  "⚠"}

                {toast.type === "info" &&
                  "i"}
              </span>

              <span className="toast-message">
                {toast.message}
              </span>

            </div>

            <button
              type="button"
              className="toast-close"
              onClick={() =>
                removeToast(
                  toast.id
                )
              }
              aria-label="Cerrar notificación"
            >
              ×
            </button>
          </div>
        ))}
      </div>

    </ToastContext.Provider>
  );
}

export function useToast() {
  const context =
    useContext(ToastContext);

  if (context === undefined) {
    throw new Error(
      "useToast debe utilizarse dentro de ToastProvider."
    );
  }

  return context;
}