// Podpowiedzi wyciągane z NOTATKI blokady/importu przy zamianie na rezerwację:
// imię klienta (po usunięciu liczb i słów typu „messenger/isk/doba") i stawka
// (pierwsza liczba ≥ 3 cyfr). Używane w kalendarzu („Przypisz klienta") ORAZ w
// kreatorze przy edycji blokady → rezerwacji (z dashboardu / listy / kalendarza),
// żeby konwersja działała wszędzie tak samo. Użytkownik może to poprawić w kreatorze.

export function suggestName(notes?: string): string | undefined {
  if (!notes) return undefined;
  const n = notes
    .replace(/\b\d[\d ]*\b/g, " ")
    .replace(/\b(messenger|whatsapp|isk|kr|doba|dni|dzień|bez|namiotu?|zł|zl)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return n || undefined;
}

export function suggestAmount(notes?: string): number | undefined {
  if (!notes) return undefined;
  const m = notes.match(/\d[\d ]{2,}/);
  if (!m) return undefined;
  const n = parseInt(m[0].replace(/\s/g, ""), 10);
  return Number.isFinite(n) ? n : undefined;
}
