"use client";

import { useState } from "react";
import type { Customer } from "@/lib/types";
import { X } from "lucide-react";

const inputCls =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10";
const labelCls = "mb-1 block text-xs font-medium text-zinc-600";

export type CustomerFormValues = Omit<Customer, "id" | "notes" | "suspect" | "source">;

// Dane dokumentów (dowód: numer+daty; prawko: daty — numer żyje w patch.license).
// Trzymane w dokumentach klienta, nie w rekordzie klienta, więc wchodzą/wychodzą
// z modala osobnym kanałem niż patch.
export interface CustomerDocValues {
  idNumber?: string;
  idIssued?: string;
  idExpires?: string;
  licIssued?: string;
  licExpires?: string;
}

export default function CustomerFormModal({
  title,
  submitLabel,
  initial,
  initialDocs,
  onClose,
  onSubmit,
}: {
  title: string;
  submitLabel: string;
  initial?: Partial<CustomerFormValues>;
  initialDocs?: CustomerDocValues;
  onClose: () => void;
  onSubmit: (patch: CustomerFormValues, docs: CustomerDocValues) => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    phone: initial?.phone ?? "",
    email: initial?.email ?? "",
    address: initial?.address ?? "",
    id_number: initial?.id_number ?? "",
    license: initial?.license ?? "",
    idDoc: initialDocs?.idNumber ?? "",
    idIssued: initialDocs?.idIssued ?? "",
    idExpires: initialDocs?.idExpires ?? "",
    licIssued: initialDocs?.licIssued ?? "",
    licExpires: initialDocs?.licExpires ?? "",
    companyName: initial?.companyName ?? "",
    nip: initial?.nip ?? "",
    companyAddress: initial?.companyAddress ?? "",
    companyEmail: initial?.companyEmail ?? "",
    companyPhone: initial?.companyPhone ?? "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    await onSubmit(
      {
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
        id_number: form.id_number.trim() || undefined,
        license: form.license.trim() || undefined,
        companyName: form.companyName.trim() || undefined,
        nip: form.nip.trim() || undefined,
        companyAddress: form.companyAddress.trim() || undefined,
        companyEmail: form.companyEmail.trim() || undefined,
        companyPhone: form.companyPhone.trim() || undefined,
      },
      {
        idNumber: form.idDoc.trim() || undefined,
        idIssued: form.idIssued || undefined,
        idExpires: form.idExpires || undefined,
        licIssued: form.licIssued || undefined,
        licExpires: form.licExpires || undefined,
      },
    );
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-zinc-900/30 px-4 py-6 md:items-center">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Zamknij"
            className="grid size-11 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto px-5 py-4">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-zinc-700">Dane korzystającego</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelCls}>Imię i nazwisko</label>
                <input
                  value={form.name}
                  onChange={set("name")}
                  className={inputCls}
                  autoFocus
                  autoComplete="name"
                />
              </div>
              <div>
                <label className={labelCls}>Telefon</label>
                <input
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={set("phone")}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>E-mail</label>
                <input
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={set("email")}
                  className={inputCls}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Adres</label>
                <input
                  value={form.address}
                  onChange={set("address")}
                  className={inputCls}
                  autoComplete="street-address"
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>PESEL</label>
                <input value={form.id_number} onChange={set("id_number")} className={inputCls} />
              </div>
              <div className="rounded-lg border border-zinc-100 bg-zinc-50/50 p-2.5 sm:col-span-2">
                <p className="mb-2 text-xs font-medium text-zinc-600">
                  Dowód osobisty{" "}
                  <span className="font-normal text-zinc-400">
                    (zapisuje się w dokumentach klienta i podstawia na umowie)
                  </span>
                </p>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  <div>
                    <label className={labelCls}>Numer</label>
                    <input
                      value={form.idDoc}
                      onChange={set("idDoc")}
                      className={inputCls}
                      placeholder="np. ABC 123456"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Data wydania</label>
                    <input type="date" value={form.idIssued} onChange={set("idIssued")} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Ważny do</label>
                    <input type="date" value={form.idExpires} onChange={set("idExpires")} className={inputCls} />
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-zinc-100 bg-zinc-50/50 p-2.5 sm:col-span-2">
                <p className="mb-2 text-xs font-medium text-zinc-600">Prawo jazdy</p>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  <div>
                    <label className={labelCls}>Numer</label>
                    <input value={form.license} onChange={set("license")} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Data wydania</label>
                    <input type="date" value={form.licIssued} onChange={set("licIssued")} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Ważne do</label>
                    <input type="date" value={form.licExpires} onChange={set("licExpires")} className={inputCls} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-zinc-700">
              Dane firmy <span className="font-normal text-zinc-400">(opcjonalnie — klient firmowy)</span>
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelCls}>Nazwa firmy</label>
                <input value={form.companyName} onChange={set("companyName")} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>NIP</label>
                <input value={form.nip} onChange={set("nip")} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Telefon firmy</label>
                <input
                  type="tel"
                  value={form.companyPhone}
                  onChange={set("companyPhone")}
                  className={inputCls}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Adres firmy</label>
                <input value={form.companyAddress} onChange={set("companyAddress")} className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>E-mail firmy</label>
                <input
                  type="email"
                  value={form.companyEmail}
                  onChange={set("companyEmail")}
                  className={inputCls}
                />
              </div>
            </div>
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
            disabled={saving || !form.name.trim()}
            className="rounded-lg bg-zinc-900 px-3 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-40"
          >
            {saving ? "Zapisywanie…" : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
