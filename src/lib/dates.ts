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
