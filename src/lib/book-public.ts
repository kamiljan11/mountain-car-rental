import "server-only";
import { supabaseAdmin as supabase } from "./supabase-admin";
import type { PublicBookingView, BookingLinkStatus } from "./types";

// Raw PostgREST row shape for the narrow `start_at,end_at,status` selects below
// (this client has no generated `Database` generic, so `.data` is untyped).
interface BookingRangeRow {
  start_at: string;
  end_at: string;
  status: string;
}

// ⚠️ ŚCIEŻKA PUBLICZNA — te funkcje są celowo BEZ requireSession() i wołane
// wyłącznie z /api/book/[token]. Każde zapytanie jest scoped po tokenie linku;
// na zewnątrz wychodzi absolutne minimum (jedno auto + jego zajęte zakresy).
// Nie wolno ich eksportować przez actions.ts ani wołać z zalogowanej części.

function iso(d: unknown): string {
  return String(d).slice(0, 10);
}

export type PublicResult =
  | { ok: true; view: PublicBookingView }
  | { ok: false };

export async function getPublicBookingLink(token: string): Promise<PublicResult> {
  if (!supabase || !token) return { ok: false };

  const { data: link, error } = await supabase
    .from("booking_links")
    .select("*")
    .eq("token", token)
    .maybeSingle();
  if (error || !link) return { ok: false };

  const expired =
    link.status === "awaiting_client" &&
    new Date(link.expires_at).getTime() < Date.now();
  const status: BookingLinkStatus = expired ? "expired" : link.status;

  // Zajęte zakresy TYLKO tego jednego auta; z rekordów bierzemy jedynie daty.
  const { data: bk } = await supabase
    .from("bookings")
    .select("start_at,end_at,status")
    .eq("vehicle_id", link.vehicle_id);
  const bookedRanges = ((bk ?? []) as BookingRangeRow[])
    .filter((b) => b.status !== "cancelled")
    .map((b) => ({ start: iso(b.start_at), end: iso(b.end_at) }));

  const { data: veh } = await supabase
    .from("vehicles")
    .select("name,registration,color")
    .eq("id", link.vehicle_id)
    .maybeSingle();

  const view: PublicBookingView = {
    status,
    vehicle: {
      name: veh?.name ?? "Pojazd",
      plate: veh?.registration ?? undefined,
      color: veh?.color ?? "#378ADD",
    },
    bookedRanges,
    suggestedStart: link.suggested_start ?? undefined,
    suggestedEnd: link.suggested_end ?? undefined,
    noteToClient: link.note_to_client ?? undefined,
    // Prefill TYLKO dla wciąż aktywnego (niewygasłego) linku — inaczej wyciekły
    // token dawałby trwały dostęp do danych klienta. Numer dokumentu i prawa
    // jazdy (rządowe ID) celowo NIE wychodzą na zewnątrz — klient wpisze je sam.
    prefill:
      status === "awaiting_client"
        ? {
            name: link.client_name ?? undefined,
            email: link.client_email ?? undefined,
            phone: link.client_phone ?? undefined,
            address: link.client_address ?? undefined,
            idIssued: link.client_id_issued ? iso(link.client_id_issued) : undefined,
            idExpires: link.client_id_expires ? iso(link.client_id_expires) : undefined,
            licenseIssued: link.client_license_issued
              ? iso(link.client_license_issued)
              : undefined,
            licenseExpires: link.client_license_expires
              ? iso(link.client_license_expires)
              : undefined,
          }
        : undefined,
  };
  return { ok: true, view };
}

export interface PublicSubmitData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  // Dokumenty są OBOWIĄZKOWE (potrzebne do umowy najmu) — walidowane niżej.
  idNumber?: string;
  idIssued?: string;
  idExpires?: string;
  license?: string;
  licenseIssued?: string;
  licenseExpires?: string;
  note?: string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function submitBookingRequest(
  token: string,
  data: PublicSubmitData,
  start: string,
  end: string,
): Promise<{ ok: boolean; message?: string }> {
  if (!supabase) return { ok: false, message: "Serwer chwilowo niedostępny." };
  if (!token) return { ok: false, message: "Nieprawidłowy link." };
  if (!data.name?.trim() || !data.email?.trim())
    return { ok: false, message: "Imię i nazwisko oraz e-mail są wymagane." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()))
    return { ok: false, message: "Podaj poprawny adres e-mail." };
  // Dokumenty pod umowę najmu — obowiązkowe (numer + daty wydania i ważności).
  if (!data.idNumber?.trim() || !data.license?.trim())
    return {
      ok: false,
      message: "Numer dokumentu tożsamości i numer prawa jazdy są wymagane.",
    };
  for (const d of [data.idIssued, data.idExpires, data.licenseIssued, data.licenseExpires]) {
    if (!d || !ISO_DATE.test(d))
      return {
        ok: false,
        message: "Podaj daty wydania i ważności dokumentu tożsamości oraz prawa jazdy.",
      };
  }
  if (!start || !end || end < start)
    return { ok: false, message: "Nieprawidłowy zakres dat." };

  const { data: link } = await supabase
    .from("booking_links")
    .select("id,status,expires_at,vehicle_id")
    .eq("token", token)
    .maybeSingle();
  if (!link) return { ok: false, message: "Nieprawidłowy link." };
  if (link.status !== "awaiting_client")
    return { ok: false, message: "Ten link został już wykorzystany." };
  if (new Date(link.expires_at).getTime() < Date.now())
    return { ok: false, message: "Link wygasł. Poproś zespół o nowy." };

  // Serwerowa re-walidacja dostępności — klient mógł ominąć UI kalendarza.
  // Half-open [start,end): dzień zwrotu poprzedniego najmu NIE koliduje z odbiorem tego
  // samego dnia — identycznie jak hasOverlap w db.ts i constraint bookings_no_overlap w DB.
  const { data: bk } = await supabase
    .from("bookings")
    .select("start_at,end_at,status")
    .eq("vehicle_id", link.vehicle_id);
  const conflict = ((bk ?? []) as BookingRangeRow[]).some(
    (b) =>
      b.status !== "cancelled" && iso(b.start_at) < end && iso(b.end_at) > start,
  );
  if (conflict)
    return { ok: false, message: "Te daty są już zajęte. Wybierz inny termin." };

  const { error } = await supabase
    .from("booking_links")
    .update({
      client_name: data.name.trim(),
      client_email: data.email.trim(),
      client_phone: data.phone?.trim() || null,
      client_address: data.address?.trim() || null,
      client_id_number: data.idNumber?.trim() || null,
      client_id_issued: data.idIssued || null,
      client_id_expires: data.idExpires || null,
      client_license: data.license?.trim() || null,
      client_license_issued: data.licenseIssued || null,
      client_license_expires: data.licenseExpires || null,
      req_start: start,
      req_end: end,
      client_note: data.note?.trim() || null,
      status: "submitted",
      submitted_at: new Date().toISOString(),
    })
    .eq("token", token)
    .eq("status", "awaiting_client"); // strażnik przed podwójnym submitem
  if (error) {
    console.error(error);
    return { ok: false, message: "Nie udało się zapisać. Spróbuj ponownie." };
  }
  return { ok: true };
}
