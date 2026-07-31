// Pojazdy ukryte z widoków PRZEGLĄDOWYCH (dashboard).
// UWAGA: to tylko filtr wyświetlania — pojazdów NIE kasujemy, a ich rezerwacje
// i blokady nadal żyją w kalendarzu i flocie (inaczej ryzyko podwójnej rezerwacji).
// Dopasowanie: nazwa ("Pajero *", "Vito") albo konkretna rejestracja.
const HIDDEN_PLATES = new Set(["PYL41"]); // VW Caddy California — ukryty z pulpitu na prośbę

export function isHiddenVehicleName(name?: string | null, plate?: string | null): boolean {
  const n = (name ?? "").trim().toLowerCase();
  if (n.startsWith("pajero") || n === "vito") return true;
  return plate != null && HIDDEN_PLATES.has(plate.trim().toUpperCase());
}
