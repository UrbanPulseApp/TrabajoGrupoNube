import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const notify = useCallback((message, type = "ok") => {
    const id = nextId.current++;
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3600);
  }, []);

  const value = useMemo(() => notify, [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type === "error" ? "is-error" : ""}`}>
            {toast.type === "error" ? <CircleAlert aria-hidden="true" /> : <CircleCheck aria-hidden="true" />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
