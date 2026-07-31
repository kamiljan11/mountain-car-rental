"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { Check, TriangleAlert, X } from "lucide-react";

type ToastKind = "success" | "error";
type ToastItem = { id: number; kind: ToastKind; message: string };

const ToastCtx = createContext<((kind: ToastKind, message: string) => void) | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

let nextId = 1;

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const show = useCallback((kind: ToastKind, message: string) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, kind, message }]);
    setTimeout(() => dismiss(id), 4000);
  }, []);

  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex w-full max-w-sm items-center gap-2 rounded-lg border px-3 py-2.5 text-sm shadow-lg ${
              t.kind === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {t.kind === "success" ? (
              <Check className="size-4 shrink-0" />
            ) : (
              <TriangleAlert className="size-4 shrink-0" />
            )}
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Zamknij"
              className="shrink-0 rounded p-1 hover:bg-black/5"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
