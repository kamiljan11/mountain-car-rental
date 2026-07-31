export type BookingType = "reservation" | "block" | "service";
export type BookingStatus =
  | "tentative"
  | "confirmed"
  | "active"
  | "completed"
  | "cancelled";

export interface Vehicle {
  id: string;
  name: string;
  plate: string;
  vin?: string;
  year?: number;
  mileage?: number;
  dailyRate?: number;
  color: string;
  status: "active" | "inactive" | "service";
  ocExpiry?: string;
  acExpiry?: string;
  inspectionExpiry?: string;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  license?: string;
  id_number?: string;
  address?: string;
  source?: string;
  companyName?: string;
  nip?: string;
  companyAddress?: string;
  companyEmail?: string;
  companyPhone?: string;
  notes?: string;
  suspect?: boolean;
}

export const DOC_TYPES = ["Dowód osobisty", "Prawo jazdy", "Paszport", "Inny"] as const;
export type DocType = (typeof DOC_TYPES)[number];

export interface CustomerDocument {
  id: string;
  customerId: string;
  docType: DocType;
  docNumber?: string;
  issuedAt?: string;
  expiresAt?: string;
}

// Klient firmowy wg RentHelp = ma wypełnioną nazwę firmy; ta sama reguła
// używana wszędzie (profil klienta, generator umów), żeby nie rozjeżdżały się
// osobne kopie tego samego warunku. Type predicate — zawęża do "companyName
// na pewno jest" w gałęzi if, bez rzutowań w miejscach użycia.
export function isCompanyCustomer(
  customer?: Customer,
): customer is Customer & { companyName: string } {
  return !!customer?.companyName;
}

// Etykieta klienta do LIST / KALENDARZA / DROPDOWNÓW. Przy kliencie firmowym
// najemcą (płatnikiem) jest FIRMA, a `name` to osoba korzystająca/kierowca (np. pilot
// wycieczki), więc prowadzi nazwa firmy z kierowcą po myślniku — dzięki temu rezerwacje
// firmowe znajdziesz i zobaczysz po nazwie firmy, nie po nazwisku korzystającego.
// Pełny rozkład (osobno firma / korzystający) zostaje na profilu i na umowie.
export function customerLabel(
  c?: { name?: string; companyName?: string | null } | null,
): string {
  if (!c) return "—";
  const name = c.name ?? "";
  return c.companyName ? (name ? `${c.companyName} — ${name}` : c.companyName) : name;
}

export interface Booking {
  id: string;
  vehicleId: string;
  customerId?: string | null;
  type: BookingType;
  status: BookingStatus;
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  // Godzina wydania/odbioru ("HH:MM") — osobno od dat, żeby logika kolizji
  // i kalendarz dalej działały na samych datach.
  pickupTime?: string;
  returnTime?: string;
  dailyRate?: number; // cena netto za dobę (ISK)
  total?: number; // suma brutto (netto × dni + VAT)
  // Stawka VAT (%) rezerwacji: 24 (standard) albo 0 (zw./eksport). NULL/undefined =
  // wpisy sprzed pola (traktowane jak bez VAT — total = netto). Kwota netto = total/(1+vat).
  // null (nie undefined) przy zapisie = świadome wyczyszczenie kolumny (np. zamiana
  // rezerwacji na blokadę — inaczej zostawałaby nieaktualna stawka przy zerowym total).
  vatRate?: number | null;
  deposit?: number;
  // Stan licznika przy wydaniu/zwrocie (km) — potrzebny do rozliczenia
  // kilometrów z urzędem w Islandii (kílómetragjald).
  odometerStart?: number;
  odometerEnd?: number;
  // Miejsce wydania/odbioru auta (biuro vs lotnisko) — wybierane w kreatorze,
  // trafia na umowę. Opcjonalne (wsteczna zgodność: stare wpisy go nie mają).
  location?: string;
  platform?: string;
  external_ref?: string;
  notes?: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  method?: "cash" | "card" | "transfer";
  kind?: "deposit" | "rental" | "refund";
  status?: "paid" | "pending";
  paidAt?: string;
}

export type BookingLinkStatus =
  | "awaiting_client" // link wygenerowany, klient jeszcze nie wysłał
  | "submitted" // klient wypełnił — czeka na decyzję zespołu
  | "confirmed" // zespół potwierdził → powstał booking + klient
  | "changes_requested" // zespół poprosił o poprawki → wystawiono nowy link
  | "rejected"
  | "expired";

// Self-service booking link = jednorazowy, wygasający (60 min) link, którym klient
// sam wypełnia rezerwację WSKAZANEGO auta. Jeden wiersz = jeden link = jedna próba.
export interface BookingLink {
  id: string;
  token: string;
  vehicleId: string;
  status: BookingLinkStatus;
  expiresAt: string;
  suggestedStart?: string;
  suggestedEnd?: string;
  suggestedDailyRate?: number;
  suggestedDeposit?: number;
  noteToClient?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  clientIdNumber?: string;
  clientIdIssued?: string;
  clientIdExpires?: string;
  clientLicense?: string;
  clientLicenseIssued?: string;
  clientLicenseExpires?: string;
  reqStart?: string;
  reqEnd?: string;
  clientNote?: string;
  adminNote?: string;
  decidedAt?: string;
  createdBookingId?: string;
  createdCustomerId?: string;
  supersedesId?: string;
  createdBy?: string;
  submittedAt?: string;
  createdAt?: string;
}

// Co widzi PUBLICZNY kreator (GET /api/book/[token]) — absolutne minimum, żeby
// klient wybrał daty. Zero danych innych klientów, innych aut czy cen — tylko to
// jedno auto i jego zajęte zakresy dat.
export interface PublicBookingView {
  status: BookingLinkStatus;
  vehicle: { name: string; plate?: string; color: string };
  bookedRanges: { start: string; end: string }[];
  suggestedStart?: string;
  suggestedEnd?: string;
  noteToClient?: string;
  prefill?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    idNumber?: string;
    idIssued?: string;
    idExpires?: string;
    license?: string;
    licenseIssued?: string;
    licenseExpires?: string;
  };
}
