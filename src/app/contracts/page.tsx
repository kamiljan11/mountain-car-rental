"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { customers, bookings, vehicleById } from "@/lib/data";
import { TEMPLATES, buildFilled, saveContract, makeNumber } from "@/lib/contract";
import { fmtDate } from "@/lib/dates";
import { Send, Printer, Check } from "lucide-react";

const inputCls =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-base outline-none focus:border-zinc-400 md:text-sm";

export default function ContractsPage() {
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id);
  const [customerId, setCustomerId] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [employee, setEmployee] = useState("");
  const [sentTo, setSentTo] = useState<{ name: string; id: string } | null>(null);

  const template = TEMPLATES.find((t) => t.id === templateId)!;
  const customer = customers.find((c) => c.id === customerId);
  const custBookings = bookings.filter((b) => b.customerId === customerId);
  const booking = custBookings.find((b) => b.id === bookingId);
  const vehicle = booking ? vehicleById(booking.vehicleId) : undefined;

  const today = new Date().toLocaleDateString("pl-PL");
  const preview = useMemo(
    () => buildFilled(template, { number: "RT/2026/____", customer, vehicle, booking, employee, date: today }),
    [template, customer, vehicle, booking, employee, today],
  );

  const send = () => {
    if (!customer) return;
    const number = makeNumber();
    const content = buildFilled(template, { number, customer, vehicle, booking, employee, date: today });
    saveContract({
      id: `k-${Date.now()}`,
      number,
      templateId: template.id,
      templateName: template.name,
      customerId: customer.id,
      vehicleId: vehicle?.id,
      bookingId: booking?.id,
      createdAt: new Date().toISOString(),
      status: "sent",
      content,
    });
    setSentTo({ name: customer.name, id: customer.id });
  };

  return (
    <div className="p-6">
      <h1 className="mb-1 text-xl font-semibold tracking-tight">Kontrakt</h1>
      <p className="mb-5 text-sm text-zinc-500">
        Wybierz szablon i klienta, a następnie wyślij dokument. Wysłane umowy podpinają się na profilu klienta.
      </p>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <div className="space-y-4">
          <Field label="Szablon">
            <select value={templateId} onChange={(e) => setTemplateId(e.target.value)} className={inputCls}>
              {TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Klient">
            <select
              value={customerId}
              onChange={(e) => { setCustomerId(e.target.value); setBookingId(""); }}
              className={inputCls}
            >
              <option value="">— wybierz klienta —</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Rezerwacja (autouzupełnia auto, daty, kwoty)">
            <select value={bookingId} onChange={(e) => setBookingId(e.target.value)} className={inputCls} disabled={!customerId}>
              <option value="">— bez powiązania —</option>
              {custBookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {vehicleById(b.vehicleId)?.name} · {fmtDate(b.start)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Pracownik wydający">
            <input value={employee} onChange={(e) => setEmployee(e.target.value)} placeholder="np. Gosia" className={inputCls} />
          </Field>

          <div className="flex gap-2 pt-1">
            <button
              onClick={send}
              disabled={!customer}
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-40"
            >
              <Send className="size-4" /> Wyślij do klienta
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
            >
              <Printer className="size-4" /> Drukuj / PDF
            </button>
          </div>

          {sentTo && (
            <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              <Check className="size-4" /> Wysłano do {sentTo.name}.
              <Link href={`/customers/${sentTo.id}`} className="font-medium underline">Zobacz profil</Link>
            </div>
          )}
        </div>

        <div id="contract-print" className="max-h-[70vh] overflow-y-auto rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="contract" dangerouslySetInnerHTML={{ __html: preview }} />
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-zinc-500">{label}</span>
      {children}
    </label>
  );
}
