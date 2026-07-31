import { parseISO } from "date-fns";

export const PL_MONTHS = [
  "styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec",
  "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień",
];

// getDay(): 0 = niedziela
export const PL_WD = ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "So"];

export function monthLabel(y: number, m: number) {
  return `${PL_MONTHS[m]} ${y}`;
}

export function fmtDate(iso: string) {
  return parseISO(iso).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

// „Teraz" i „dzisiaj" liczone po ISLANDZKU. Islandia używa UTC przez cały rok
// (nie ma czasu letniego), więc czas islandzki = czas UTC. Cała apka ma liczyć
// bieżący dzień/miesiąc od tych helperów, NIE od new Date() — czas lokalny
// przeglądarki (np. Polska, UTC+1/+2) wieczorem pokazuje już „jutrzejszą" datę
// względem Keflavíku, co przesuwa „dzisiaj" w kalendarzu, dashboardzie i umowach.
export function nowIceland(): Date {
  const d = new Date();
  // Przesuwamy chwilę tak, żeby lokalne komponenty (getFullYear/getMonth/getDate)
  // tego obiektu odpowiadały komponentom UTC — bezpieczne dla date-fns.
  return new Date(d.getTime() + d.getTimezoneOffset() * 60000);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
