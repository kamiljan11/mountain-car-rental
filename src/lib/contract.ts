import type { Customer, Vehicle, Booking } from "./types";
import { fmtDate } from "./dates";
import { differenceInCalendarDays, parseISO } from "date-fns";

export interface ContractTemplate {
  id: string;
  name: string;
  body: string;
}

export interface Contract {
  id: string;
  number: string;
  templateId: string;
  templateName: string;
  customerId: string;
  vehicleId?: string;
  bookingId?: string;
  createdAt: string;
  status: "draft" | "sent" | "signed";
  content: string;
}

const UMOWA = `UMOWA NAJMU POJAZDU nr {{NUMER}}
zawarta dnia {{DATA_ZAWARCIA}}

WYNAJMUJĄCY: {{FIRMA}}, {{FIRMA_ADRES}}, NIP {{FIRMA_NIP}}
NAJEMCA: {{NAJEMCA}}
tel. {{NAJEMCA_TEL}} · e-mail {{NAJEMCA_EMAIL}} · prawo jazdy {{NAJEMCA_PJ}}

§1 PRZEDMIOT NAJMU
Wynajmujący oddaje w najem pojazd: {{POJAZD}}, nr rej. {{NR_REJ}}, VIN {{VIN}}.

§2 OKRES NAJMU
Wydanie: {{DATA_WYDANIA}} — Zwrot: {{DATA_ZWROTU}} ({{DNI}} dni).
Miejsce wydania i zwrotu: {{MIEJSCE}}.

§3 OPŁATY
Stawka za dobę: {{STAWKA}} zł · Łączny czynsz najmu: {{KWOTA}} zł.
Kaucja: {{KAUCJA}} zł — zwrotna po bezusterkowym zwrocie pojazdu.

§4 OBOWIĄZKI NAJEMCY
Najemca używa pojazd zgodnie z przeznaczeniem, nie oddaje go osobom trzecim,
zwraca z tym samym poziomem paliwa i w stanie niepogorszonym.

§5 POSTANOWIENIA KOŃCOWE
W sprawach nieuregulowanych stosuje się Ogólne Warunki Najmu oraz Kodeks cywilny.
Umowę sporządzono w dwóch jednobrzmiących egzemplarzach.

Wynajmujący: {{PRACOWNIK}}                    Najemca: {{NAJEMCA}}`;

const WYDANIE = `PROTOKÓŁ WYDANIA POJAZDU
do umowy nr {{NUMER}} · data wydania: {{DATA_WYDANIA}}

Pojazd: {{POJAZD}}, nr rej. {{NR_REJ}}
Najemca: {{NAJEMCA}}

Stan licznika: ______________ km        Poziom paliwa: ______________
Stan zewnętrzny / uszkodzenia: ..........................................
Wyposażenie: apteczka · trójkąt · gaśnica · koło zapasowe · dokumenty · 2× kluczyk

Podpis wydającego: {{PRACOWNIK}}          Podpis najemcy: {{NAJEMCA}}`;

const ZWROT = `PROTOKÓŁ ZWROTU POJAZDU
do umowy nr {{NUMER}} · data zwrotu: {{DATA_ZWROTU}}

Pojazd: {{POJAZD}}, nr rej. {{NR_REJ}}
Najemca: {{NAJEMCA}}

Stan licznika: ______________ km        Poziom paliwa: ______________
Uwagi / nowe uszkodzenia: ...............................................
Rozliczenie kaucji {{KAUCJA}} zł:  [ ] zwrócona w całości   [ ] potrącenie ________ zł

Podpis przyjmującego: {{PRACOWNIK}}       Podpis najemcy: {{NAJEMCA}}`;

export const TEMPLATES: ContractTemplate[] = [
  { id: "umowa", name: "Umowa najmu pojazdu", body: UMOWA },
  { id: "wydanie", name: "Protokół wydania", body: WYDANIE },
  { id: "zwrot", name: "Protokół zwrotu", body: ZWROT },
];

const DASH = "————";

export function buildFilled(
  template: ContractTemplate,
  ctx: {
    number: string;
    customer?: Customer;
    vehicle?: Vehicle;
    booking?: Booking;
    employee?: string;
    date: string;
  },
) {
  const { customer, vehicle, booking } = ctx;
  const dni =
    booking != null
      ? String(differenceInCalendarDays(parseISO(booking.end), parseISO(booking.start)) + 1)
      : DASH;
  const map: Record<string, string> = {
    NUMER: ctx.number,
    DATA_ZAWARCIA: ctx.date,
    FIRMA: "Mountain Car Rental",
    FIRMA_ADRES: "———",
    FIRMA_NIP: "———",
    NAJEMCA: customer?.name ?? DASH,
    NAJEMCA_TEL: customer?.phone ?? DASH,
    NAJEMCA_EMAIL: customer?.email ?? DASH,
    NAJEMCA_PJ: customer?.license ?? DASH,
    POJAZD: vehicle?.name ?? DASH,
    NR_REJ: vehicle?.plate ?? DASH,
    VIN: vehicle?.vin ?? DASH,
    DATA_WYDANIA: booking ? fmtDate(booking.start) : DASH,
    DATA_ZWROTU: booking ? fmtDate(booking.end) : DASH,
    DNI: dni,
    MIEJSCE: "biuro Mountain Car Rental",
    STAWKA: String(booking?.dailyRate ?? vehicle?.dailyRate ?? DASH),
    KWOTA: booking?.total != null ? String(booking.total) : DASH,
    KAUCJA: booking?.deposit != null ? String(booking.deposit) : DASH,
    PRACOWNIK: ctx.employee || DASH,
  };
  return template.body.replace(/\{\{(\w+)\}\}/g, (_, k) => map[k] ?? DASH);
}

const KEY = "rebel_contracts_v1";

export function getContracts(): Contract[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveContract(c: Contract) {
  const all = getContracts();
  all.unshift(c);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function contractsForCustomer(id: string) {
  return getContracts().filter((c) => c.customerId === id);
}

export function makeNumber() {
  return `RT/2026/${1104 + getContracts().length}`;
}
