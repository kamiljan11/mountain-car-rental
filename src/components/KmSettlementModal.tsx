"use client";

import { useState } from "react";
import { useData } from "@/components/DataProvider";
import { useToast } from "@/components/Toast";
import { useModalChrome } from "@/lib/useModalChrome";
import RevolutPay from "@/components/RevolutPay";
import { isk } from "@/lib/contract";
import type { Booking, Customer } from "@/lib/types";
import { X, Gauge, Check, Loader2 } from "lucide-react";

// Stawka za kilometr przy rozliczeniu zwrotu (ISK/km). Jedno miejsce prawdy.
export const KM_RATE_ISK = 7;

const inputCls =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-base outline-none transition-colors focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 md:text-sm";
const labelCls = "mb-1.5 block text-xs font-medium text-zinc-600";

// Licznik: liczba całkowita km ≥ 0 albo undefined (pole puste / nie-liczba).
function toKm(v: string): number | undefined {
  const n = Math.round(Number(v.replace(/\s/g, "").replace(",", ".")));
  return v.trim() && Number.isFinite(n) && n >= 0 ? n : undefined;
}

// Rozliczenie kilometrów przy zwrocie: wpisz licznik PO, policz (PO − PRZED) × stawka,
// pokaż QR/link Revolut, a po odebraniu płatności zapisz stan licznika i zamknij
// rezerwację jako „Zakończona".
export default function KmSettlementModal({
  booking,
  customer,
  onClose,
  onDone,
}: {
  booking: Booking;
  customer?: Customer;
  onClose: () => void;
  onDone: () => void;
}) {
  useModalChrome(onClose);
  const { updateBooking } = useData();
  const showToast = useToast();

  const [odoStart, setOdoStart] = useState(
    booking.odometerStart != null ? String(booking.odometerStart) : "",
  );
  const [odoEnd, setOdoEnd] = useState(
    booking.odometerEnd != null ? String(booking.odometerEnd) : "",
  );
  const [saving, setSaving] = useState(false);

  const s = toKm(odoStart);
  const e = toKm(odoEnd);
  const distance = s != null && e != null && e >= s ? e - s : null;
  const charge = distance != null ? distance * KM_RATE_ISK : null;
  const badOrder = s != null && e != null && e < s;

  const finish = async () => {
    if (e == null) return; // do zakończenia wymagamy licznika PO
    setSaving(true);
    const ok = await updateBooking(booking.id, {
      odometerStart: s,
      odometerEnd: e,
      status: "completed",
    });
    setSaving(false);
    if (ok) {
      showToast("success", "Rezerwacja rozliczona i zakończona.");
      onDone();
    }
    // błąd → DataProvider pokazał już toast + rollback; modal zostaje otwarty
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-zinc-900/40 px-4 py-6 md:items-center">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900">
            <Gauge className="size-4 text-zinc-400" /> Rozlicz kilometry i zakończ
          </h2>
          <button
            onClick={onClose}
            aria-label="Zamknij"
            className="grid size-11 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="max-h-[75vh] space-y-4 overflow-y-auto px-5 py-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Licznik przy wydaniu (km)</label>
              <input
                type="text"
                inputMode="numeric"
                value={odoStart}
                onChange={(ev) => setOdoStart(ev.target.value)}
                placeholder="stan PRZED"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Licznik przy zwrocie (km)</label>
              <input
                type="text"
                inputMode="numeric"
                value={odoEnd}
                onChange={(ev) => setOdoEnd(ev.target.value)}
                placeholder="stan PO"
                autoFocus
                className={inputCls}
              />
            </div>
          </div>

          {badOrder && (
            <p className="text-xs text-red-600">
              Licznik przy zwrocie nie może być mniejszy niż przy wydaniu.
            </p>
          )}

          <div className="rounded-lg border border-zinc-200 p-4">
            <div className="flex items-center justify-between text-sm text-zinc-500">
              <span>
                Przejechane{distance != null ? ` (${distance.toLocaleString("pl-PL")} km × ${KM_RATE_ISK} ISK)` : ""}
              </span>
              <span>{distance != null ? `${distance.toLocaleString("pl-PL")} km` : "—"}</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-zinc-100 pt-2 text-sm font-semibold text-zinc-900">
              <span>Do zapłaty za kilometry</span>
              <span>{charge != null ? isk(charge) : "—"}</span>
            </div>
            {s == null && (
              <p className="mt-2 text-xs text-zinc-400">
                Brak stanu licznika przy wydaniu — uzupełnij oba pola, aby policzyć kwotę.
              </p>
            )}
          </div>

          {/* QR + link Revolut na policzoną kwotę za kilometry */}
          {charge != null && charge > 0 && (
            <RevolutPay amount={charge} phone={customer?.phone} customerName={customer?.name} />
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
            onClick={finish}
            disabled={saving || e == null || badOrder}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-40"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            Zapłacono → zakończ
          </button>
        </div>
      </div>
    </div>
  );
}
