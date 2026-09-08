import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "default";
}

interface ConfirmContextType {
  confirm: (
    options: ConfirmOptions
  ) => Promise<boolean>;
}

interface ConfirmProviderProps {
  children: ReactNode;
}

const ConfirmContext =
  createContext<ConfirmContextType | undefined>(
    undefined
  );

export function ConfirmProvider({
  children,
}: ConfirmProviderProps) {
  const [
    options,
    setOptions,
  ] = useState<ConfirmOptions | null>(
    null
  );

  const resolverRef =
    useRef<
      ((value: boolean) => void) | null
    >(null);

  const confirm = useCallback(
    (
      newOptions: ConfirmOptions
    ): Promise<boolean> => {
      setOptions(newOptions);

      return new Promise<boolean>(
        (resolve) => {
          resolverRef.current =
            resolve;
        }
      );
    },
    []
  );

  const closeModal = useCallback(
    (result: boolean) => {
      resolverRef.current?.(
        result
      );

      resolverRef.current =
        null;

      setOptions(null);
    },
    []
  );

  return (
    <ConfirmContext.Provider
      value={{
        confirm,
      }}
    >
      {children}

      {options && (
        <div
          className="confirm-overlay"
          role="presentation"
          onMouseDown={() =>
            closeModal(false)
          }
        >
          <div
            className="confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-message"
            onMouseDown={(
              event
            ) =>
              event.stopPropagation()
            }
          >
            <div
              className={`confirm-modal-icon confirm-modal-icon-${options.variant ?? "default"}`}
            >
              {options.variant ===
              "danger"
                ? "!"
                : options.variant ===
                    "warning"
                  ? "⚠"
                  : "?"}
            </div>

            <div className="confirm-modal-content">
              <h2 id="confirm-title">
                {options.title ??
                  "Confirmar acción"}
              </h2>

              <p id="confirm-message">
                {options.message}
              </p>
            </div>

            <div className="confirm-modal-actions">
              <button
                type="button"
                className="confirm-button-secondary"
                onClick={() =>
                  closeModal(false)
                }
              >
                {options.cancelText ??
                  "Cancelar"}
              </button>

              <button
                type="button"
                className={`confirm-button-primary confirm-button-${options.variant ?? "default"}`}
                onClick={() =>
                  closeModal(true)
                }
                autoFocus
              >
                {options.confirmText ??
                  "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context =
    useContext(
      ConfirmContext
    );

  if (context === undefined) {
    throw new Error(
      "useConfirm debe utilizarse dentro de ConfirmProvider."
    );
  }

  return context;
}
