import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren
} from "react";
import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from "lucide-react";

export type ToastVariant = "success" | "error" | "warning" | "info";

type ToastItem = {
  id: string;
  message: string;
  variant: ToastVariant;
};

type ToastInput = {
  message: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type ToastContextValue = {
  toast: (input: ToastInput) => void;
  success: (message: string, durationMs?: number) => void;
  error: (message: string, durationMs?: number) => void;
  warning: (message: string, durationMs?: number) => void;
  info: (message: string, durationMs?: number) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION_MS = 5000;
const MAX_TOASTS = 5;

const variantStyles: Record<
  ToastVariant,
  { icon: typeof CheckCircle2; border: string; iconClass: string }
> = {
  success: {
    icon: CheckCircle2,
    border: "border-l-umerco-success",
    iconClass: "text-umerco-success"
  },
  error: {
    icon: AlertCircle,
    border: "border-l-umerco-danger",
    iconClass: "text-umerco-danger"
  },
  warning: {
    icon: AlertTriangle,
    border: "border-l-amber-500",
    iconClass: "text-amber-600"
  },
  info: {
    icon: Info,
    border: "border-l-umerco-primary",
    iconClass: "text-umerco-primary"
  }
};

function ToastCard({
  item,
  onDismiss
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const { icon: Icon, border, iconClass } = variantStyles[item.variant];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`toast-item flex items-start gap-3 border-l-4 ${border} px-4 py-3`}
    >
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconClass}`} strokeWidth={1.75} aria-hidden />
      <p className="min-w-0 flex-1 text-sm text-umerco-dark">{item.message}</p>
      <button
        type="button"
        className="shrink-0 rounded-md p-1 text-umerco-muted transition-colors hover:bg-umerco-beige hover:text-umerco-dark"
        onClick={() => onDismiss(item.id)}
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" strokeWidth={1.75} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    ({ message, variant = "info", durationMs = DEFAULT_DURATION_MS }: ToastInput) => {
      const trimmed = message.trim();
      if (!trimmed) return;

      const id = crypto.randomUUID();
      setToasts((current) => [...current.slice(-(MAX_TOASTS - 1)), { id, message: trimmed, variant }]);

      const timer = setTimeout(() => dismiss(id), durationMs);
      timersRef.current.set(id, timer);
    },
    [dismiss]
  );

  const success = useCallback(
    (message: string, durationMs?: number) => toast({ message, variant: "success", durationMs }),
    [toast]
  );
  const error = useCallback(
    (message: string, durationMs?: number) => toast({ message, variant: "error", durationMs }),
    [toast]
  );
  const warning = useCallback(
    (message: string, durationMs?: number) => toast({ message, variant: "warning", durationMs }),
    [toast]
  );
  const info = useCallback(
    (message: string, durationMs?: number) => toast({ message, variant: "info", durationMs }),
    [toast]
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const value = useMemo(
    () => ({ toast, success, error, warning, info, dismiss }),
    [toast, success, error, warning, info, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-viewport pointer-events-none fixed end-4 top-20 z-[100] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((item) => (
          <div key={item.id} className="pointer-events-auto animate-detail-in">
            <ToastCard item={item} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
