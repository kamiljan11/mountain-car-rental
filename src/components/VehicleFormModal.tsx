"use client";

import { useState } from "react";
import type { Vehicle } from "@/lib/types";
import { X } from "lucide-react";

const inputCls =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10";
const labelCls = "mb-1 block text-xs font-medium text-zinc-600";

const STATUS_OPTIONS: { value: Vehicle["status"]; label: string }[] = [
  { value: "active", label: "Aktywny" },
  { value: "service", label: "W serwisie" },
  { value: "inactive", label: "Nieaktywny" },
];

export default function VehicleFormModal({
  vehicle,
  onClose,
  onSubmit,
}: {
  vehicle: Vehicle;
  onClose: () => void;
  onSubmit: (patch: Partial<Omit<Vehicle, "id">>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: vehicle.name,
    plate: vehicle.plate,
    vin: vehicle.vin ?? "",
    year: vehicle.year != null ? String(vehicle.year) : "",
    mileage: vehicle.mileage != null ? String(vehicle.mileage) : "",
    dailyRate: vehicle.dailyRate != null ? String(vehicle.dailyRate) : "",
    color: vehicle.color,
    status: vehicle.status,
    ocExpiry: vehicle.ocExpiry ?? "",
    acExpiry: vehicle.acExpiry ?? "",
    inspectionExpiry: vehicle.inspectionExpiry ?? "",
    notes: vehicle.notes ?? "",
  });
  const [saving, setSaving] = useState(false);

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!form.name.trim() || !form.plate.trim()) return;
    setSaving(true);
    await onSubmit({
      name: form.name.trim(),
      plate: form.plate.trim(),
      vin: form.vin.trim() || undefined,
      year: form.year ? Number(form.year) : undefined,
      mileage: form.mileage ? Number(form.mileage.replace(",", ".")) : undefined,
      dailyRate: form.dailyRate ? Number(form.dailyRate.replace(",", ".")) : undefined,
      color: form.color,
      status: form.status,
      ocExpiry: form.ocExpiry || undefined,
      acExpiry: form.acExpiry || undefined,
      inspectionExpiry: form.inspectionExpiry || undefined,
      notes: form.notes.trim() || undefined,
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-zinc-900/30 px-4 py-6 md:items-center">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <h2 className="text-base font-semibold text-zinc-900">Edytuj pojazd</h2>
          <button
            onClick={onClose}
            aria-label="Zamknij"
            className="grid size-11 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-3 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Nazwa</label>
              <input value={form.name} onChange={set("name")} className={inputCls} autoFocus />
            </div>
            <div>
              <label className={labelCls}>Nr rejestracyjny</label>
              <input value={form.plate} onChange={set("plate")} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>VIN</label>
              <input value={form.vin} onChange={set("vin")} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Rok</label>
              <input
                type="text"
                inputMode="numeric"
                value={form.year}
                onChange={set("year")}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Przebieg (km)</label>
              <input
                type="text"
                inputMode="decimal"
                value={form.mileage}
                onChange={set("mileage")}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Stawka/doba (ISK)</label>
              <input
                type="text"
                inputMode="decimal"
                value={form.dailyRate}
                onChange={set("dailyRate")}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Kolor (oznaczenie w kalendarzu)</label>
              <input type="color" value={form.color} onChange={set("color")} className={`${inputCls} h-11 p-1`} />
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select value={form.status} onChange={set("status")} className={inputCls}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Ważność OC</label>
              <input type="date" value={form.ocExpiry} onChange={set("ocExpiry")} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Ważność AC</label>
              <input type="date" value={form.acExpiry} onChange={set("acExpiry")} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Ważność przeglądu</label>
              <input
                type="date"
                value={form.inspectionExpiry}
                onChange={set("inspectionExpiry")}
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Notatki</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              className={inputCls}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-zinc-100 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-zinc-200 px-3 py-3 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
          >
            Anuluj
          </button>
          <button
            onClick={save}
            disabled={saving || !form.name.trim() || !form.plate.trim()}
            className="rounded-lg bg-zinc-900 px-3 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-40"
          >
            {saving ? "Zapisywanie…" : "Zapisz"}
          </button>
        </div>
      </div>
    </div>
  );
}
