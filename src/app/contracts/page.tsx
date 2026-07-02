"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useData } from "@/components/DataProvider";
import { TEMPLATES, buildFilled, makeNumber } from "@/lib/contract";
import { insertContract, fetchCustomerDocuments } from "@/lib/db";
import { fmtDate } from "@/lib/dates";
import type { Customer, CustomerDocument } from "@/lib/types";
import { isCompanyCustomer, DOC_TYPES } from "@/lib/types";
import { Send, Printer, Check, TriangleAlert } from "lucide-react";

const inputCls =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-3 text-base outline-none focus:border-zinc-400 md:text-sm md:py-2.5";

// Zawsze wymagane od osoby faktycznie odbierającej/prowadzącej pojazd —
// niezależnie od tego, czy rezerwuje jako firma czy prywatnie.
const REQUIRED_FIELDS: { key: keyof Customer; label: string }[] = [
  { key: "email", label: "Adres email" },
  { key: "phone", label: "Numer telefonu" },
  { key: "address", label: "Adres" },
  { key: "id_number", label: "PESEL" },
  { key: "license", label: "Prawo jazdy" },
];

function missingCustomerFields(customer: Customer | undefined, hasIdentityDoc: boolean) {
  if (!customer) return [];
  const missing = REQUIRED_FIELDS.filter((f) => !customer[f.key]).map((f) => f.label);
  if (isCompanyCustomer(customer) && !customer.nip) missing.push("NIP firmy");
  if (!hasIdentityDoc) missing.push("Dokument tożsamości (dowód osobisty)");
  return missing;
}

function ContractsContent() {
  const { customers, bookings, vehicleById } = useData();
  const searchParams = useSearchParams();
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id);
  const [customerId, setCustomerId] = useState(searchParams.get("customerId") ?? "");
  const [bookingId, setBookingId] = useState(searchParams.get("bookingId") ?? "");
  const [employee, setEmployee] = useState("");
  const [sentTo, setSentTo] = useState<{ name: string; id: string } | null>(null);
  const [sendError, setSendError] = useState("");
  const [documents, setDocuments] = useState<CustomerDocument[]>([]);

  const template = TEMPLATES.find((t) => t.id === templateId)!;
  const customer = customers.find((c) => c.id === customerId);
  const custBookings = bookings.filter((b) => b.customerId === customerId);
  const booking = custBookings.find((b) => b.id === bookingId);
  const vehicle = booking ? vehicleById(booking.vehicleId) : undefined;

  useEffect(() => {
    if (!customerId) return;
    let alive = true;
    fetchCustomerDocuments(customerId).then((docs) => {
      if (alive) setDocuments(docs);
    });
    return () => {
      alive = false;
    };
  }, [customerId]);

  const activeDocuments = customerId ? documents : [];
  const missing = missingCustomerFields(
    customer,
    activeDocuments.some((d) => d.docType === DOC_TYPES[0]),
  );

  const today = new Date().toLocaleDateString("pl-PL");
  const preview = buildFilled(template, {
    number: "RT/2026/____",
    customer,
    vehicle,
    booking,
    employee,
    date: today,
    documents: activeDocuments,
  });

  const send = async () => {
    if (!customer) return;
    setSendError("");
    const number = makeNumber();
    const content = buildFilled(template, {
      number,
      customer,
      vehicle,
      booking,
      employee,
      date: today,
      documents: activeDocuments,
    });
    const saved = await insertContract({
      number,
      templateId: template.id,
      templateName: template.name,
      customerId: customer.id,
      vehicleId: vehicle?.id,
      bookingId: booking?.id,
      status: "sent",
      content,
    });
    if (!saved) {
      setSendError("Nie udało się zapisać umowy. Spróbuj ponownie.");
      return;
    }
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

          {customer && missing.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
              <div className="flex items-center gap-1.5 font-medium">
                <TriangleAlert className="size-4" /> Brakujące dane klienta
              </div>
              <ul className="mt-1 list-inside list-disc text-xs text-amber-700">
                {missing.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
              <Link href={`/customers/${customer.id}`} className="mt-1 inline-block text-xs font-medium underline">
                Uzupełnij w profilu klienta
              </Link>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={send}
              disabled={!customer}
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-40"
            >
              <Send className="size-4" /> Wyślij do klienta
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-3 text-sm text-zinc-600 hover:bg-zinc-50"
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
          {sendError && (
            <div className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <TriangleAlert className="size-4" /> {sendError}
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

export default function ContractsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-zinc-400">Ładowanie…</div>}>
      <ContractsContent />
    </Suspense>
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
