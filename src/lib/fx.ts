import "server-only";

// Kursy walut do informacyjnego przelicznika na fakturze. Źródło: open.er-api.com
// (darmowe, bez klucza, aktualizacja dzienna, ma bazę ISK). Faktura zostaje w ISK
// — to tylko równowartość „kurs z dnia". Zwraca ile jednostek waluty = 1 ISK.
const FX_ENDPOINT = "https://open.er-api.com/v6/latest/ISK";
const WANTED = ["EUR", "PLN", "USD", "GBP"] as const;

export type FxRates = { base: "ISK"; date: string; rates: Record<string, number> };

export async function getFxRates(): Promise<FxRates | null> {
  try {
    // Cache 6h — kursy dzienne, nie ma sensu bić przy każdej fakturze.
    const r = await fetch(FX_ENDPOINT, {
      headers: { "User-Agent": "mountain-car-rental/1.0" },
      next: { revalidate: 21600 },
    });
    if (!r.ok) return null;
    const d = await r.json();
    const src = d?.rates ?? {};
    const rates: Record<string, number> = {};
    for (const c of WANTED) if (typeof src[c] === "number") rates[c] = src[c];
    if (Object.keys(rates).length === 0) return null;
    return { base: "ISK", date: d?.time_last_update_utc || d?.time_last_update || "", rates };
  } catch {
    return null;
  }
}

// Pojedynczy kurs (1 ISK = X currency); null gdy niedostępny.
export async function getFxRate(currency: string): Promise<number | null> {
  const fx = await getFxRates();
  return fx?.rates?.[currency] ?? null;
}
