"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useData } from "@/components/DataProvider";
import { COMPANIES } from "@/lib/company";
import {
  buildInvoice,
  makeInvoiceNumber,
  PAYMENT_METHODS,
  PAYMENT_TERMS,
  CURRENCIES,
  type Invoice,
  type PaymentMethod,
  type PaymentTerm,
} from "@/lib/invoice";
import {
  fetchInvoicesAction as fetchInvoices,
  insertInvoiceAction as insertInvoice,
  sendInvoiceEmailAction as sendInvoiceEmail,
} from "@/lib/actions";
import { fmtDate, todayISO } from "@/lib/dates";
import { customerLabel } from "@/lib/types";
import { useToast } from "@/components/Toast";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Send, Printer, Check, TriangleAlert } from "lucide-react";

const inputCls =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-3 text-base outline-none focus:border-zinc-400 md:text-sm md:py-2.5";

function InvoicesContent() {
  const { customers, bookings, vehicleById } = useData();
  const searchParams = useSearchParams();
  const showToast = useToast();
  const [companyKey, setCompanyKey] = useState<string>(COMPANIES[0].key);
  const [customerId, setCustomerId] = useState(searchParams.get("customerId") ?? "");
  const [bookingId, setBookingId] = useState(searchParams.get("bookingId") ?? "");
  const [confirmSend, setConfirmSend] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<{ name: string; id: string } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_isk");
  const [paymentTerm, setPaymentTerm] = useState<PaymentTerm>("pickup");
  const [displayCurrency, setDisplayCurrency] = useState<string>(""); // "" = tylko ISK
  const [fxRates, setFxRates] = useState<Record<string, number> | null>(null);
  // Wszystkie faktury z bazy — do auto-numeracji (kolejny numer w bieżącym roku).
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    let alive = true;
    fetchInvoices().then((list) => {
      if (alive) setAllInvoices(list);
    });
    // Kursy do żywego przelicznika (self /api/fx → serwer bije w zewnętrzne API).
    fetch("/api/fx")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d?.ok) setFxRates(d.rates ?? null);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const fxRate = displayCurrency ? (fxRates?.[displayCurrency] ?? null) : null;

  const company = COMPANIES.find((c) => c.key === companyKey) ?? COMPANIES[0];
  const customer = customers.find((c) => c.id === customerId);
  const custBookings = bookings.filter((b) => b.customerId === customerId);
  const booking = custBookings.find((b) => b.id === bookingId);
  const vehicle = booking ? vehicleById(booking.vehicleId) : undefined;
  const noEmail = customer != null && !customer.email && !customer.companyEmail;

  const nextNumber = makeInvoiceNumber(allInvoices);
  const today = fmtDate(todayISO());
  const preview = buildInvoice({
    number: nextNumber,
    customer,
    vehicle,
    booking,
    date: today,
    company,
    paymentMethod,
    paymentTerm,
    displayCurrency: displayCurrency || undefined,
    fxRate,
  });

  const send = async () => {
    if (!customer || busy) return;
    setBusy(true);
    try {
      const saved = await insertInvoice({
        number: nextNumber,
        customerId: customer.id,
        vehicleId: vehicle?.id,
        bookingId: booking?.id,
        companyKey: company.key,
        paymentMethod,
        paymentTerm,
        displayCurrency: displayCurrency || undefined,
      });
      if (!saved) {
        showToast("error", "Nie udało się wystawić faktury. Spróbuj ponownie.");
        return;
      }
      setAllInvoices((prev) => [saved, ...prev]);
      const res = await sendInvoiceEmail({ invoiceId: saved.id, origin: window.location.origin });
      showToast(
        res.ok && res.emailSent ? "success" : "error",
        res.ok && res.emailSent
          ? `Faktura ${saved.number} wysłana na e-mail ${customer.name}.`
          : res.message ??
              "Faktura wystawiona, ale mail NIE wyszedł (sprawdź konfigurację Resend). Możesz ją wydrukować/PDF.",
      );
      setSentTo({ name: customer.name, id: customer.id });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="mb-1 text-xl font-semibold tracking-tight">Faktury</h1>
      <p className="mb-5 text-sm text-zinc-500">
        Wybierz klienta i rezerwację — faktura wypełni się realnymi danymi z kalendarza. Numer nadaje
        się sam (kolejny w roku).
      </p>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <div className="space-y-4">
          <Field label="Sprzedawca">
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
          </Field>
          <Field label="Klient (nabywca)">
            <select
              value={customerId}
              onChange={(e) => {
                setCustomerId(e.target.value);
                setBookingId("");
              }}
              className={inputCls}
            >
              <option value="">— wybierz klienta —</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {customerLabel(c)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Rezerwacja (auto, daty, kwoty, VAT)">
            <select
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              className={inputCls}
              disabled={!customerId}
            >
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
          <Field label="Metoda płatności">
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className={inputCls}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Termin płatności">
            <select
              value={paymentTerm}
              onChange={(e) => setPaymentTerm(e.target.value as PaymentTerm)}
              className={inputCls}
            >
              {PAYMENT_TERMS.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Równowartość w walucie (kurs z dnia, informacyjnie)">
            <select
              value={displayCurrency}
              onChange={(e) => setDisplayCurrency(e.target.value)}
              className={inputCls}
            >
              <option value="">— tylko ISK —</option>
              {CURRENCIES.map((c) => (
                <option key={c} value={c} disabled={!fxRates}>
                  {c}
                  {fxRates?.[c] ? ` (1 ISK ≈ ${fxRates[c].toFixed(5)} ${c})` : ""}
                </option>
              ))}
            </select>
            {displayCurrency && fxRate == null && (
              <p className="mt-1 text-xs text-amber-600">Kurs chwilowo niedostępny — na fakturze pojawi się tylko ISK.</p>
            )}
          </Field>

          {noEmail && (
            <div className="flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              <span>
                Klient nie ma adresu e-mail — fakturę wystawisz, ale mail nie wyjdzie.{" "}
                <Link href={`/customers/${customer!.id}`} className="font-medium underline">
                  Uzupełnij profil
                </Link>
                .
              </span>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setConfirmSend(true)}
              disabled={!customer || busy}
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-40"
            >
              <Send className="size-4" /> {busy ? "Wysyłanie…" : "Wystaw i wyślij fakturę"}
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-3 text-sm text-zinc-600 hover:bg-zinc-50"
            >
              <Printer className="size-4" /> Drukuj / PDF
            </button>
          </div>

          {sentTo && (
            <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-700">
              <Check className="size-4" /> Faktura wystawiona dla {sentTo.name}.
              <Link href={`/customers/${sentTo.id}`} className="font-medium underline">
                Zobacz profil
              </Link>
            </div>
          )}
        </div>

        <div
          id="invoice-print"
          className="max-h-[70vh] overflow-y-auto rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
        >
          <div className="contract" dangerouslySetInnerHTML={{ __html: preview }} />
        </div>
      </div>

      {confirmSend && customer && (
        <ConfirmDialog
          title="Wystawić i wysłać fakturę?"
          description={
            noEmail
              ? "Klient nie ma e-maila — faktura zostanie zapisana, ale mail nie wyjdzie. Możesz ją wydrukować/PDF."
              : "Faktura zostanie zapisana z kolejnym numerem i wysłana na e-mail klienta."
          }
          summary={[
            { label: "Nabywca", value: customer.name },
            { label: "Sprzedawca", value: company.label },
            { label: "Numer faktury", value: nextNumber },
            ...(booking
              ? [
                  {
                    label: "Rezerwacja",
                    value: `${vehicle ? (vehicle.plate ? `${vehicle.name} ${vehicle.plate}` : vehicle.name) : "—"} · ${fmtDate(booking.start)}`,
                  },
                ]
              : []),
          ]}
          confirmLabel="Wystaw i wyślij"
          onConfirm={send}
          onClose={() => setConfirmSend(false)}
        />
      )}
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-zinc-400">Ładowanie…</div>}>
      <InvoicesContent />
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
