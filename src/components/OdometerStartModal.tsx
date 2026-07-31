"use client";

import { useState } from "react";
import { useData } from "@/components/DataProvider";
import { useToast } from "@/components/Toast";
import { useModalChrome } from "@/lib/useModalChrome";
import type { Booking } from "@/lib/types";
import { X, Gauge, Check, Loader2 } from "lucide-react";

const inputCls =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-base outline-none transition-colors focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 md:text-sm";
const labelCls = "mb-1.5 block text-xs font-medium text-zinc-600";

// Licznik: liczba całkowita km ≥ 0 albo undefined (pole puste / nie-liczba).
function toKm(v: string): number | undefined {
  const n = Math.round(Number(v.replace(/\s/g, "").replace(",", ".")));
  return v.trim() && Number.isFinite(n) && n >= 0 ? n : undefined;
}

// Szybkie spisanie stanu licznika PRZY WYDANIU (jedno pole, bez ruszania statusu).
// Rozliczenie zwrotu (licznik PO + kwota za km + zamknięcie) robi KmSettlementModal.
export default function OdometerStartModal({
  booking,
  onClose,
  onDone,
}: {
  booking: Booking;
  onClose: () => void;
  onDone?: (odometerStart: number) => void;
}) {
  useModalChrome(onClose);
  const { updateBooking } = useData();
  const showToast = useToast();

  const [odoStart, setOdoStart] = useState(
    booking.odometerStart != null ? String(booking.odometerStart) : "",
  );
  const [saving, setSaving] = useState(false);

  const s = toKm(odoStart);
  const invalid = odoStart.trim() !== "" && s == null;

  const save = async () => {
    if (s == null) return; // zapisujemy tylko poprawną liczbę km
    setSaving(true);
    const ok = await updateBooking(booking.id, { odometerStart: s });
    setSaving(false);
    if (ok) {
      showToast("success", "Stan licznika przy wydaniu zapisany.");
      onDone?.(s);
      onClose();
    }
    // błąd → DataProvider pokazał już toast + rollback; modal zostaje otwarty
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-zinc-900/40 px-4 py-6 md:items-center">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900">
            <Gauge className="size-4 text-zinc-400" /> Stan licznika przy wydaniu
          </h2>
          <button
            onClick={onClose}
            aria-label="Zamknij"
            className="grid size-11 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-3 px-5 py-5">
          <div>
            <label className={labelCls}>Licznik przy wydaniu (km)</label>
            <input
              type="text"
              inputMode="numeric"
              value={odoStart}
              onChange={(ev) => setOdoStart(ev.target.value)}
              placeholder="np. 266634"
              autoFocus
              className={inputCls}
            />
          </div>
          <p className="text-xs text-zinc-400">
            Stan spisany przy wydaniu auta. Od niego liczą się kilometry przy zwrocie
            („Rozlicz km i zakończ&rdquo;).
          </p>
          {invalid && (
            <p className="text-xs text-red-600">Wpisz liczbę kilometrów (albo zostaw puste).</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-zinc-100 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-zinc-200 px-3 py-3 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
          >
            Anuluj
          </button>
          <button
            onClick={save}
            disabled={saving || s == null}
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-40"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            Zapisz
          </button>
        </div>
      </div>
    </div>
  );
}
