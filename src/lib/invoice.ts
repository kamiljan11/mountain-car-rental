import type { Customer, Vehicle, Booking } from "./types";
import { isCompanyCustomer } from "./types";
import { isk } from "./contract";
import { COMPANIES, type Company } from "./company";
import { fmtDate, todayISO } from "./dates";
import { REVOLUT_URL } from "./payment";
import { differenceInCalendarDays, parseISO } from "date-fns";

// Dane bankowe Sprzedawcy do przelewu na fakturze.
//
// Trzymane w env, NIE w repo: repozytorium jest publiczne, a to numery kont i dane
// osoby prywatnej (odbiorca konta PL). Na samej fakturze pojawiają się jawnie wobec
// klienta, dlatego prefiks NEXT_PUBLIC_ (komponent /invoices renderuje je w przeglądarce)
// — ale w kodzie źródłowym ma być tylko odwołanie do env, nigdy wartość.
//
// Wartości ustawia się w Vercel → Project → Settings → Environment Variables.
// Brak env => na fakturze widać jawny placeholder (a nie ciche puste pole).
const PLACEHOLDER = "(skonfiguruj w env)";
const env = (k: string) =>
  (process.env[`NEXT_PUBLIC_${k}`] ?? "").trim();

// ISK per Sprzedawca (klucz = company.key). Tylko Mountain ma zweryfikowane konto.
export const COMPANY_BANK: Record<string, string> = {
  mountain: env("BANK_ISK_MOUNTAIN"),
};

// Alternatywne konto polskie (dla klientów wolących przelew w PLN/EU).
export const BANK_PL = {
  owner: env("BANK_PL_OWNER") || PLACEHOLDER,
  iban: env("BANK_PL_IBAN") || PLACEHOLDER,
  bank: env("BANK_PL_BANK") || PLACEHOLDER,
  address: env("BANK_PL_ADDRESS") || PLACEHOLDER,
};

// Metody płatności do wyboru na fakturze.
export type PaymentMethod = "revolut" | "bank_isk" | "bank_pl" | "cash";
export const PAYMENT_METHODS: { key: PaymentMethod; label: string }[] = [
  { key: "revolut", label: "Revolut" },
  { key: "bank_isk", label: "Przelew (konto ISK)" },
  { key: "bank_pl", label: "Przelew (konto PL)" },
  { key: "cash", label: "Gotówka" },
];

// Termin płatności — powiązany z datami rezerwacji.
export type PaymentTerm = "pickup" | "return";
export const PAYMENT_TERMS: { key: PaymentTerm; label: string }[] = [
  { key: "pickup", label: "Przed wydaniem pojazdu" },
  { key: "return", label: "Przy zwrocie pojazdu" },
];

// Waluty do przelicznika (równowartość obok kwoty ISK). ISK zostaje walutą
// faktury (VSK w ISK) — to tylko informacyjny przelicznik po kursie z dnia.
export const CURRENCIES = ["EUR", "PLN", "USD", "GBP"] as const;
export type DisplayCurrency = (typeof CURRENCIES)[number];

// Sformatuj równowartość: kwota_ISK × kurs (1 ISK = rate CUR). Zwraca np. "≈ 523,40 EUR".
export function fxEquiv(iskAmount: number, currency: string, rate: number): string {
  const v = iskAmount * rate;
  return `≈ ${v.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

export interface Invoice {
  id: string;
  number: string;
  customerId?: string;
  vehicleId?: string;
  bookingId?: string;
  companyKey?: string;
  status: "sent" | "paid" | "void";
  total?: number;
  net?: number;
  vatRate?: number;
  currency: string;
  paymentMethod?: PaymentMethod;
  paymentTerm?: PaymentTerm;
  displayCurrency?: string;
  fxRate?: number | null;
  content: string;
  issuedAt?: string;
  createdAt: string;
}

// Escape HTML — dane najemcy pochodzą z PUBLICZNEGO formularza (/api/book), a
// faktura renderuje się przez dangerouslySetInnerHTML w sesji admina. Bez tego
// nazwisko/firma typu `<img onerror=…>` = stored XSS w panelu. (jak contract.ts)
function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const DASH = "————";

// Rozbicie kwot: total zapisany jest jako BRUTTO. Gdy znamy stawkę VAT (>0),
// liczymy netto = brutto/(1+vat) i VAT = brutto − netto. Przy 0%/braku stawki
// (stare wpisy, eksport) traktujemy total jako netto = brutto, VAT 0 — nie
// deklarujemy fałszywego rozbicia na dokumencie księgowym.
export function invoiceAmounts(booking?: Booking): {
  net: number | null;
  vat: number | null;
  gross: number | null;
  vatRate: number;
} {
  const gross = booking?.total ?? null;
  const vatRate = booking?.vatRate ?? 0;
  if (gross == null) return { net: null, vat: null, gross: null, vatRate };
  if (vatRate > 0) {
    const net = Math.round(gross / (1 + vatRate / 100));
    return { net, vat: gross - net, gross, vatRate };
  }
  return { net: gross, vat: 0, gross, vatRate };
}

// Liczba dni = różnica dat (dzień zwrotu NIE wliczony) — spójnie z umową i
// kreatorem: 16→26 to 10 dni. Godziny wydania/odbioru nie wpływają na liczbę dni.
// Eksportowana (nie tylko lokalna) — to reguła biznesowa z realnym incydentem
// rozliczeniowym w historii, więc ma własny test (invoice.test.ts).
export function rentalDays(booking?: Booking): number | null {
  if (!booking) return null;
  return differenceInCalendarDays(parseISO(booking.end), parseISO(booking.start));
}

function buyerBlock(customer?: Customer): string {
  if (!customer) return `<p>${DASH}</p>`;
  const persona = `${esc(customer.name ?? DASH)}<br/>${esc(customer.address ?? DASH)}<br/>${esc(customer.email ?? DASH)}${
    customer.phone ? ` · ${esc(customer.phone)}` : ""
  }`;
  if (!isCompanyCustomer(customer)) return `<p>${persona}</p>`;
  return `<p><strong>${esc(customer.companyName)}</strong><br/>Kennitala/NIP: ${esc(customer.nip ?? DASH)}<br/>${esc(
    customer.companyAddress ?? DASH,
  )}<br/>${esc(customer.companyEmail ?? customer.email ?? DASH)}</p>
    <p class="muted">Osoba korzystająca: ${esc(customer.name ?? DASH)}</p>`;
}

// Etykieta terminu płatności powiązana z datami rezerwacji.
export function termLabel(term: PaymentTerm, booking?: { start: string; end: string }): string {
  if (term === "return") {
    return booking ? `przy zwrocie pojazdu (${fmtDate(booking.end)})` : "przy zwrocie pojazdu";
  }
  return booking ? `przed wydaniem pojazdu (${fmtDate(booking.start)})` : "przed wydaniem pojazdu";
}

// Strukturalne wiersze bloku „Płatność" zależne od metody — jedno źródło prawdy
// dla HTML (buildInvoice), maila (emailInvoice) i PDF (buildInvoicePdf).
export function paymentInfoRows(
  method: PaymentMethod,
  company: Company,
  number: string,
): { label: string; value: string }[] {
  const bankIsk = COMPANY_BANK[company.key] || "______________";
  const tytul = { label: "Tytuł przelewu", value: `Faktura ${number}` };
  switch (method) {
    case "revolut":
      return [
        { label: "Metoda", value: "Revolut" },
        { label: "Link do zapłaty", value: REVOLUT_URL },
        tytul,
      ];
    case "bank_pl":
      return [
        { label: "Metoda", value: "Przelew (konto PL)" },
        { label: "Odbiorca", value: BANK_PL.owner },
        { label: "IBAN", value: BANK_PL.iban },
        { label: "Bank", value: `${BANK_PL.bank}, ${BANK_PL.address}` },
        tytul,
      ];
    case "cash":
      return [{ label: "Metoda", value: "Gotówka" }];
    case "bank_isk":
    default:
      return [
        { label: "Metoda", value: "Przelew (konto ISK)" },
        { label: "Numer konta", value: bankIsk },
        tytul,
      ];
  }
}

export function buildInvoice(ctx: {
  number: string;
  customer?: Customer;
  vehicle?: Vehicle;
  booking?: Booking;
  date: string; // data wystawienia (fmtDate)
  company?: Company;
  paymentMethod?: PaymentMethod;
  paymentTerm?: PaymentTerm;
  // Waluta informacyjnego przelicznika + kurs (1 ISK = fxRate CUR). Gdy brak —
  // faktura pozostaje wyłącznie w ISK, bez wiersza równowartości.
  displayCurrency?: string;
  fxRate?: number | null;
}): string {
  const { customer, vehicle, booking } = ctx;
  const company = ctx.company ?? COMPANIES[0];
  const method = ctx.paymentMethod ?? "bank_isk";
  const term = ctx.paymentTerm ?? "pickup";
  const { net, vat, gross, vatRate } = invoiceAmounts(booking);
  const days = rentalDays(booking);

  // Opis pozycji: wynajem auta + okres. Stawkę za dobę pokazujemy tylko gdy jest.
  const period =
    booking != null ? `${fmtDate(booking.start)} – ${fmtDate(booking.end)}` : DASH;
  const perDay = booking?.dailyRate ?? vehicle?.dailyRate;
  const descParts = [
    `Wynajem pojazdu ${vehicle?.name ?? DASH}${vehicle?.plate ? ` (${vehicle.plate})` : ""}`,
    `okres ${period}${days != null ? ` · ${days} dób` : ""}`,
    perDay != null ? `${isk(perDay)} / doba` : null,
  ].filter(Boolean);

  const netCell = net != null ? isk(net) : DASH;
  const vatLabel = `VAT (VSK) ${vatRate}%`;
  const rez = booking?.external_ref ? ` · rezerwacja ${esc(booking.external_ref)}` : "";

  // Równowartość w wybranej walucie (informacyjnie, kurs z dnia). Faktura zostaje w ISK.
  const equivRow =
    ctx.displayCurrency && ctx.fxRate != null && gross != null
      ? `<tr><td>Równowartość (kurs z dnia)</td><td>${esc(fxEquiv(gross, ctx.displayCurrency, ctx.fxRate))}</td></tr>`
      : "";

  return `
<h1>Faktura / Reikningur</h1>
<div class="muted">nr ${esc(ctx.number)} · wystawiona ${esc(ctx.date)}${rez}</div>
<div class="parties">
  <div>
    <h3>Sprzedawca</h3>
    <p><strong>${esc(company.legalName)}</strong> — ${esc(company.brand)}<br/>${esc(company.address)}<br/>Kennitala: ${esc(
      company.kennitala || "______________",
    )} · VSK-nr: ${esc(company.vat || "______________")}<br/>${esc(company.email)}<br/>${esc(company.web)}</p>
  </div>
  <div>
    <h3>Nabywca</h3>
    ${buyerBlock(customer)}
  </div>
</div>
<h2>Pozycje</h2>
<table class="kv">
  <tr><td>Opis</td><td>${esc(descParts.join(" · "))}</td></tr>
  <tr><td>Wartość netto</td><td>${esc(netCell)}</td></tr>
  <tr><td>${esc(vatLabel)}</td><td>${esc(vat != null ? isk(vat) : DASH)}</td></tr>
  <tr><td>Waluta</td><td>ISK</td></tr>
</table>
<p class="total">Do zapłaty (brutto): ${esc(gross != null ? isk(gross) : DASH)}</p>
<h2>Płatność</h2>
<table class="kv">
  <tr><td>Termin</td><td>${esc(termLabel(term, booking))}</td></tr>
  ${paymentInfoRows(method, company, ctx.number)
    .map((r) => `<tr><td>${esc(r.label)}</td><td>${esc(r.value)}</td></tr>`)
    .join("\n  ")}
  ${equivRow}
</table>
<p class="muted footer">Wygenerowano w systemie ${esc(company.brand)} · ${esc(company.web)}</p>`;
}

// Numer faktury: sekwencyjny, bezluki w obrębie ROKU, format RRRR/NNNN (np.
// 2026/0001). Liczony z już zapisanych faktur bieżącego roku; ostateczny numer
// nadaje atomowo serwer (UNIQUE + retry), to tylko podpowiedź do podglądu.
export function makeInvoiceNumber(existing: { number: string }[], isoDate = todayISO()) {
  const year = isoDate.slice(0, 4);
  const prefix = `${year}/`;
  const used = existing
    .map((c) => c.number)
    .filter((n) => n.startsWith(prefix))
    .map((n) => parseInt(n.slice(prefix.length), 10))
    .filter(Number.isFinite);
  const next = (used.length ? Math.max(...used) : 0) + 1;
  return `${prefix}${String(next).padStart(4, "0")}`;
}
