"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useData } from "@/components/DataProvider";
import { TEMPLATES, COMPANIES, buildFilled, makeNumber, type Contract } from "@/lib/contract";
import {
  insertContractAction as insertContract,
  sendContractForSignatureAction as sendContractForSignature,
  fetchCustomerDocumentsAction as fetchCustomerDocuments,
  fetchContractsAction as fetchContracts,
} from "@/lib/actions";
import { fmtDate, todayISO } from "@/lib/dates";
import type { Customer, CustomerDocument } from "@/lib/types";
import { isCompanyCustomer, DOC_TYPES, customerLabel } from "@/lib/types";
import { useToast } from "@/components/Toast";
import ConfirmDialog from "@/components/ConfirmDialog";
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
  const showToast = useToast();
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id);
  const [companyKey, setCompanyKey] = useState<string>(COMPANIES[0].key);
  const [customerId, setCustomerId] = useState(searchParams.get("customerId") ?? "");
  const [bookingId, setBookingId] = useState(searchParams.get("bookingId") ?? "");
  const [employee, setEmployee] = useState("");
  const [sentTo, setSentTo] = useState<{ name: string; id: string; signUrl?: string } | null>(null);
  const [confirmSend, setConfirmSend] = useState(false);
  const [documents, setDocuments] = useState<CustomerDocument[]>([]);
  // Wszystkie umowy z bazy — do auto-numeracji + do listy „Wysłane umowy".
  const [allContracts, setAllContracts] = useState<Contract[]>([]);
  const [previewContract, setPreviewContract] = useState<Contract | null>(null);

  useEffect(() => {
    let alive = true;
    fetchContracts().then((list) => {
      if (alive) setAllContracts(list);
    });
    return () => {
      alive = false;
    };
  }, []);

  const template = TEMPLATES.find((t) => t.id === templateId)!;
  const company = COMPANIES.find((c) => c.key === companyKey) ?? COMPANIES[0];
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

  // Numer i data zawarcia nadają się same: kolejny numer w miesiącu + dzisiejsza
  // data wg czasu islandzkiego (widoczne już w podglądzie, przed wysłaniem).
  const nextNumber = makeNumber(allContracts);
  const today = fmtDate(todayISO());
  const preview = buildFilled(template, {
    number: nextNumber,
    customer,
    vehicle,
    booking,
    employee,
    date: today,
    documents: activeDocuments,
    company,
  });

  const send = async () => {
    if (!customer) return;
    // `nextNumber` to tylko PODPOWIEDŹ do podglądu — ostateczny, unikalny numer nadaje
    // serwer atomowo w insertContract (UNIQUE + retry). Do listy dopisujemy `saved`
    // z autorytatywnym numerem z bazy, więc kolejna sugestia liczy się poprawnie.
    const number = nextNumber;
    const content = buildFilled(template, {
      number,
      customer,
      vehicle,
      booking,
      employee,
      date: today,
      documents: activeDocuments,
      company,
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
      showToast("error", "Nie udało się zapisać umowy. Spróbuj ponownie.");
      return;
    }
    // Dopisz do lokalnej listy, żeby następny numer od razu się przesunął.
    setAllContracts((prev) => [saved, ...prev]);

    // Umowa zapisana → wyślij ją klientowi DO PODPISU ONLINE (link /sign/[token]).
    const res = await sendContractForSignature({
      contractId: saved.id,
      origin: window.location.origin,
    });
    if (!res.ok) {
      showToast("error", res.message ?? "Umowa zapisana, ale nie udało się wysłać do podpisu.");
      setSentTo({ name: customer.name, id: customer.id });
      return;
    }
    showToast(
      res.emailSent ? "success" : "error",
      res.emailSent
        ? `Umowa wysłana do ${customer.name} — dostał link do podpisu na e-mail.`
        : "Umowa zapisana, ale mail z linkiem NIE wyszedł (sprawdź konfigurację Resend). Link możesz skopiować niżej.",
    );
    setSentTo({ name: customer.name, id: customer.id, signUrl: res.signUrl });
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
          <Field label="Firma na umowie (Wynajmujący)">
            <div className="flex gap-2">
              {COMPANIES.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setCompanyKey(c.key)}
                  className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                    companyKey === c.key
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            {!company.kennitala && (
              <p className="mt-1.5 flex items-start gap-1.5 text-xs text-amber-600">
                <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
                {company.label}: kennitala i VSK-nr do uzupełnienia — na umowie będą
                puste linie do wpisania.
              </p>
            )}
          </Field>
          <Field label="Klient">
            <select
              value={customerId}
              onChange={(e) => { setCustomerId(e.target.value); setBookingId(""); }}
              className={inputCls}
            >
              <option value="">— wybierz klienta —</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{customerLabel(c)}</option>
              ))}
            </select>
          </Field>
          <Field label="Rezerwacja (autouzupełnia auto, daty, kwoty)">
            <select value={bookingId} onChange={(e) => setBookingId(e.target.value)} className={inputCls} disabled={!customerId}>
              <option value="">— bez powiązania —</option>
              {custBookings.map((b) => {
                const v = vehicleById(b.vehicleId);
                const veh = v ? (v.plate ? `${v.name} ${v.plate}` : v.name) : "—";
                return (
                  <option key={b.id} value={b.id}>
                    {veh} · {fmtDate(b.start)}
                  </option>
                );
              })}
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
              onClick={() => setConfirmSend(true)}
              disabled={!customer}
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-40"
            >
              <Send className="size-4" /> Wyślij do klienta (do podpisu)
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-3 text-sm text-zinc-600 hover:bg-zinc-50"
            >
              <Printer className="size-4" /> Drukuj / PDF
            </button>
          </div>

          {sentTo && (
            <div className="space-y-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-700">
              <div className="flex flex-wrap items-center gap-1.5">
                <Check className="size-4" /> Umowa wysłana do {sentTo.name} do podpisu.
                <Link href={`/customers/${sentTo.id}`} className="font-medium underline">Zobacz profil</Link>
              </div>
              {sentTo.signUrl && (
                <div className="flex items-center gap-1.5">
                  <input
                    readOnly
                    value={sentTo.signUrl}
                    onFocus={(e) => e.currentTarget.select()}
                    className="min-w-0 flex-1 rounded-md border border-green-300 bg-white px-2 py-1.5 text-xs text-zinc-700"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(sentTo.signUrl!);
                      showToast("success", "Link do podpisu skopiowany.");
                    }}
                    className="shrink-0 rounded-md border border-green-300 bg-white px-2.5 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100"
                  >
                    Kopiuj
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div id="contract-print" className="max-h-[70vh] overflow-y-auto rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="contract" dangerouslySetInnerHTML={{ __html: preview }} />
        </div>
      </div>

      {/* Kontener wysłanych/podpisanych umów — klik = podgląd. */}
      <div className="mt-8">
        <h2 className="mb-2 text-sm font-semibold text-zinc-900">Wysłane umowy ({allContracts.length})</h2>
        {allContracts.length === 0 ? (
          <p className="text-sm text-zinc-400">Brak wysłanych umów.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
            {allContracts.map((c) => {
              const cust = customers.find((x) => x.id === c.customerId);
              const signed = !!c.signedAt;
              return (
                <button
                  key={c.id}
                  onClick={() => setPreviewContract(c)}
                  className="flex w-full items-center justify-between gap-3 border-b border-zinc-100 px-4 py-3 text-left text-sm last:border-b-0 hover:bg-zinc-50"
                >
                  <span className="min-w-0 flex-1 truncate">
                    <span className="font-medium text-zinc-800">nr {c.number}</span>
                    <span className="text-zinc-500"> · {customerLabel(cust)}</span>
                    <span className="text-zinc-400"> · {fmtDate(c.createdAt)}</span>
                    {signed && c.signerName && (
                      <span className="text-green-600"> · podpisał(a) {c.signerName}</span>
                    )}
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      signed
                        ? "bg-green-100 text-green-700"
                        : c.status === "sent"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {signed ? "Podpisana ✓" : c.status === "sent" ? "Wysłana" : "Szkic"}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {previewContract && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4"
          onClick={() => setPreviewContract(null)}
        >
          <div
            className="my-8 w-full max-w-3xl rounded-xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-5 py-3">
              <div className="text-sm">
                <span className="font-semibold">Umowa nr {previewContract.number}</span>{" "}
                {previewContract.signedAt ? (
                  <span className="text-green-600">
                    · Podpisana {previewContract.signerName ? `przez ${previewContract.signerName}` : ""}{" "}
                    ({fmtDate(previewContract.signedAt)})
                  </span>
                ) : (
                  <span className="text-blue-600">· Wysłana — czeka na podpis</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {previewContract.signToken && !previewContract.signedAt && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(
                        `${window.location.origin}/sign/${previewContract.signToken}`,
                      );
                      showToast("success", "Link do podpisu skopiowany.");
                    }}
                    className="rounded-md border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
                  >
                    Kopiuj link
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewContract(null)}
                  className="rounded-md px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100"
                >
                  Zamknij
                </button>
              </div>
            </div>
            <div className="max-h-[75vh] overflow-y-auto p-6">
              <div
                className="contract"
                dangerouslySetInnerHTML={{ __html: previewContract.content }}
              />
            </div>
          </div>
        </div>
      )}

      {confirmSend && customer && (
        <ConfirmDialog
          title="Wysłać umowę do klienta?"
          description={
            missing.length > 0
              ? "Uwaga: część danych klienta jest niekompletna — sprawdź podgląd. Umowa i tak zostanie zapisana i podpięta na profilu klienta."
              : "Umowa zostanie zapisana i podpięta na profilu klienta."
          }
          summary={[
            { label: "Klient", value: customer.name },
            { label: "Szablon", value: template.name },
            { label: "Firma (Wynajmujący)", value: company.label },
            { label: "Numer umowy", value: nextNumber },
            ...(booking
              ? [
                  {
                    label: "Rezerwacja",
                    value: `${vehicle ? (vehicle.plate ? `${vehicle.name} ${vehicle.plate}` : vehicle.name) : "—"} · ${fmtDate(booking.start)}`,
                  },
                ]
              : []),
          ]}
          confirmLabel="Wyślij umowę"
          onConfirm={send}
          onClose={() => setConfirmSend(false)}
        />
      )}
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
