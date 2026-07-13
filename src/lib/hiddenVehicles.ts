// Pojazdy ukryte z widoków PRZEGLĄDOWYCH (dashboard).
// UWAGA: to tylko filtr wyświetlania — pojazdów NIE kasujemy, a ich rezerwacje
// i blokady nadal żyją w kalendarzu (inaczej ryzyko podwójnej rezerwacji).
// Dopasowanie po nazwie: wszystkie "Pajero *" oraz "Vito".
export function isHiddenVehicleName(name?: string | null): boolean {
  const n = (name ?? "").trim().toLowerCase();
  return n.startsWith("pajero") || n === "vito";
}
