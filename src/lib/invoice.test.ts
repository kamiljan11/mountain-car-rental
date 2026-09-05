import { describe, it, expect } from "vitest";
import { invoiceAmounts, rentalDays } from "./invoice";
import type { Booking } from "./types";

// Fixture minimalna — tylko pola, ktore invoiceAmounts/rentalDays czytaja.
function booking(overrides: Partial<Booking>): Booking {
  return {
    id: "b1",
    vehicleId: "v1",
    type: "reservation",
    status: "confirmed",
    start: "2026-08-16",
    end: "2026-08-26",
    ...overrides,
  };
}

describe("rentalDays", () => {
  it("liczy dni po datach, BEZ +1 (dzien zwrotu nie wliczony) — realny bug rozliczeniowy", () => {
    // Regresja: 16 -> 26 sierpnia to 10 dob, nie 11. Zle policzone kiedys
    // zawyzalo faktury o jeden dzien najmu.
    expect(rentalDays(booking({ start: "2026-08-16", end: "2026-08-26" }))).toBe(10);
  });

  it("zwraca 0, gdy wydanie i zwrot tego samego dnia", () => {
    expect(rentalDays(booking({ start: "2026-09-01", end: "2026-09-01" }))).toBe(0);
  });

  it("zwraca null bez rezerwacji", () => {
    expect(rentalDays(undefined)).toBeNull();
  });
});

describe("invoiceAmounts", () => {
  it("bez kwoty (total=undefined) zwraca same null, ale przekazuje vatRate", () => {
    expect(invoiceAmounts(booking({ total: undefined, vatRate: 24 }))).toEqual({
      net: null,
      vat: null,
      gross: null,
      vatRate: 24,
    });
  });

  it("VAT domyslnie 0% (brak vatRate w rezerwacji) — net = brutto, zero rozbicia", () => {
    // Regresja: stare wpisy / rezerwacje bez pola vatRate NIE moga dostac
    // zmyslonej stawki VAT — maja isc jako 0%, net=brutto.
    expect(invoiceAmounts(booking({ total: 225_000, vatRate: undefined }))).toEqual({
      net: 225_000,
      vat: 0,
      gross: 225_000,
      vatRate: 0,
    });
  });

  it("vatRate=0 jawne — identycznie jak brak stawki", () => {
    expect(invoiceAmounts(booking({ total: 100_000, vatRate: 0 }))).toEqual({
      net: 100_000,
      vat: 0,
      gross: 100_000,
      vatRate: 0,
    });
  });

  it("VAT > 0 liczy netto z brutto (24%) i dopelnia do calosci", () => {
    const r = invoiceAmounts(booking({ total: 124_000, vatRate: 24 }));
    expect(r.vatRate).toBe(24);
    expect(r.gross).toBe(124_000);
    expect(r.net).toBe(100_000);
    expect(r.vat).toBe(24_000);
    // netto + VAT musi zawsze dac z powrotem brutto (zero grosza zgubionego na zaokragleniu).
    expect((r.net ?? 0) + (r.vat ?? 0)).toBe(r.gross);
  });
});
