"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ToastKind = "success" | "error";
type Toast = { id: number; message: string; kind: ToastKind };
const ToastContext = createContext<((message: string, kind?: ToastKind) => void) | null>(null);

function ToastItem({ toast, dismiss }: { toast: Toast; dismiss: (id: number) => void }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (hovered || focused) return;
    const timer = window.setTimeout(() => dismiss(toast.id), toast.kind === "error" ? 8000 : 5000);
    return () => window.clearTimeout(timer);
  }, [toast.id, toast.kind, hovered, focused, dismiss]);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
      className="pointer-events-auto flex items-start gap-3 rounded border border-zinc-200 bg-white p-4 text-zinc-900 shadow-lg"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className={`mt-0.5 h-5 w-5 shrink-0 ${toast.kind === "success" ? "text-emerald-600" : "text-rose-600"}`}
      >
        <circle cx="12" cy="12" r="9" />
        {toast.kind === "success" ? <path d="m8 12 3 3 5-6" /> : <path d="M12 7v6m0 3v1" />}
      </svg>
      <p role={toast.kind === "error" ? "alert" : "status"} className="flex-1 text-sm leading-5">
        {toast.message}
      </p>
      <button
        type="button"
        aria-label="Tutup pemberitahuan"
        onClick={() => dismiss(toast.id)}
        className="-m-1 cursor-pointer rounded p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-5 w-5"
        >
          <path d="m6 6 12 12M6 18 18 6" />
        </svg>
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);
  const dismiss = useCallback(
    (id: number) => setToasts((previous) => previous.filter((toast) => toast.id !== id)),
    [],
  );
  const notify = useCallback((message: string, kind: ToastKind = "success") => {
    const toast = { id: ++nextId.current, message, kind };
    setToasts((previous) => [...previous.slice(-2), toast]);
  }, []);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <section
        aria-label="Pemberitahuan"
        className="pointer-events-none fixed right-4 bottom-4 left-4 z-70 flex flex-col gap-3 sm:left-auto sm:w-96"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} dismiss={dismiss} />
        ))}
      </section>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const notify = useContext(ToastContext);
  if (!notify) throw new Error("useToast must be used within ToastProvider");
  return notify;
}
