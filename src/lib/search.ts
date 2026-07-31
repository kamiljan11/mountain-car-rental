// Wspólna „szeroka" wyszukiwarka używana w kalendarzu i na liście klientów.
// - fold(): spłaszcza polskie znaki i diakrytyki, żeby "kozlowski" trafiał w
//   "[klient 031]", a "asa" w "Ása". ł/Ł nie rozkłada NFD, więc mapujemy je ręcznie;
//   \p{M} usuwa znaki łączące (ogonki/akcenty) po dekompozycji NFD.
// - matchesQuery(): dopasowanie token-AND — każde słowo zapytania musi wystąpić
//   gdziekolwiek w tekście, więc "kozlowski szymon" trafia tak samo jak "szymon".

export function fold(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/ł/g, "l")
    .replace(/Ł/g, "L")
    .toLowerCase();
}

export function matchesQuery(haystack: string, query: string): boolean {
  const q = fold(query).trim();
  if (!q) return true;
  const h = fold(haystack);
  return q.split(/\s+/).every((t) => h.includes(t));
}
