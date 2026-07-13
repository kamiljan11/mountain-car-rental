"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";

// Reużywalne okno potwierdzenia. Dla akcji nieodwracalnych (usuwanie) użyj
// danger; dla zapisów podaj `summary` (wiersze do sprawdzenia przed potwierdzeniem).
// onConfirm może być async — okno pilnuje stanu „w toku" i zamyka się po sukcesie.
export default function ConfirmDialog({
  title,
  description,
  summary,
  confirmLabel = "Potwierdź",
  cancelLabel = "Anuluj",
  danger = false,
  onConfirm,
  onClose,
}: {
  title: string;
  description?: string;
  summary?: { label: string; value: string }[];
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, busy]);

  const run = async () => {
    setBusy(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      setBusy(false); // zostaw okno otwarte, gdy akcja rzuci błąd
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-zinc-900/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-zinc-100 px-5 py-4">
          <div className="flex items-center gap-2.5">
            {danger && (
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-red-100 text-red-600">
                <AlertTriangle className="size-5" />
              </span>
            )}
            <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
          </div>
          <button
            onClick={() => !busy && onClose()}
            aria-label="Zamknij"
            className="grid size-9 shrink-0 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-3 px-5 py-4">
          {description && <p className="text-sm text-zinc-600">{description}</p>}
          {summary && summary.length > 0 && (
            <dl className="divide-y divide-zinc-100 rounded-lg border border-zinc-200">
              {summary.map((row) => (
                <div key={row.label} className="flex justify-between gap-4 px-3 py-2 text-sm">
                  <dt className="shrink-0 text-zinc-500">{row.label}</dt>
                  <dd className="text-right font-medium text-zinc-800">{row.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-zinc-100 px-5 py-4">
          <button
            onClick={() => !busy && onClose()}
            disabled={busy}
            className="rounded-lg border border-zinc-200 px-3 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-40"
          >
            {cancelLabel}
          </button>
          <button
            onClick={run}
            disabled={busy}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60 ${
              danger ? "bg-red-600 hover:bg-red-700" : "bg-zinc-900 hover:bg-zinc-800"
            }`}
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
