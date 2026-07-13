import "server-only";
import { supabaseAdmin as supabase } from "./supabase-admin";
import { requireSession } from "./auth";
import {
  vehicles as seedVehicles,
  customers as seedCustomers,
  bookings as seedBookings,
} from "./data";
import type { Vehicle, Customer, Booking, CustomerDocument, BookingLink } from "./types";
import type { Contract } from "./contract";
import { randomBytes } from "crypto";
import { sendEmail, emailConfirmed, emailChanges, emailRejected } from "./email";

/* eslint-disable @typescript-eslint/no-explicit-any */
function toVehicle(r: any): Vehicle {
  return {
    id: r.id,
    name: r.name,
    plate: r.registration ?? "",
    vin: r.vin ?? undefined,
    year: r.year ?? undefined,
    mileage: r.mileage ?? undefined,
    dailyRate: r.daily_rate != null ? Number(r.daily_rate) : undefined,
    color: r.color ?? "#378ADD",
    status: r.status ?? "active",
    ocExpiry: r.insurance_oc_expiry ?? undefined,
    inspectionExpiry: r.inspection_expiry ?? undefined,
    notes: r.notes ?? undefined,
  };
}
function toCustomer(r: any): Customer {
  return {
    id: r.id,
    name: r.full_name,
    phone: r.phone ?? undefined,
    email: r.email ?? undefined,
    license: r.license_number ?? undefined,
    id_number: r.id_number ?? undefined,
    address: r.address ?? undefined,
    source: r.source ?? undefined,
    companyName: r.company_name ?? undefined,
    nip: r.nip ?? undefined,
    companyAddress: r.company_address ?? undefined,
    companyEmail: r.company_email ?? undefined,
    companyPhone: r.company_phone ?? undefined,
    notes: r.notes ?? undefined,
    suspect: r.is_suspect ?? false,
  };
}
function toCustomerDocument(r: any): CustomerDocument {
  return {
    id: r.id,
    customerId: r.customer_id,
    docType: r.doc_type,
    docNumber: r.doc_number ?? undefined,
    issuedAt: r.issued_at ?? undefined,
    expiresAt: r.expires_at ?? undefined,
  };
}
function toBooking(r: any): Booking {
  return {
    id: r.id,
    vehicleId: r.vehicle_id,
    customerId: r.customer_id ?? null,
    type: r.type,
    status: r.status,
    start: String(r.start_at).slice(0, 10),
    end: String(r.end_at).slice(0, 10),
    pickupTime: r.pickup_time ?? undefined,
    returnTime: r.return_time ?? undefined,
    dailyRate: r.daily_rate != null ? Number(r.daily_rate) : undefined,
    total: r.total_price != null ? Number(r.total_price) : undefined,
    deposit: r.deposit != null ? Number(r.deposit) : undefined,
    odometerStart: r.odometer_start != null ? Number(r.odometer_start) : undefined,
    odometerEnd: r.odometer_end != null ? Number(r.odometer_end) : undefined,
    platform: r.platform ?? undefined,
    external_ref: r.external_ref ?? undefined,
    notes: r.notes ?? undefined,
  };
}
function toContract(r: any): Contract {
  return {
    id: r.id,
    number: r.number,
    templateId: r.template_id,
    templateName: r.template_name,
    customerId: r.customer_id,
    vehicleId: r.vehicle_id ?? undefined,
    bookingId: r.booking_id ?? undefined,
    createdAt: r.created_at,
    status: r.status,
    content: r.content ?? "",
  };
}

export async function fetchAll(): Promise<{
  vehicles: Vehicle[];
  customers: Customer[];
  bookings: Booking[];
}> {
  await requireSession();
  const fallback = {
    vehicles: seedVehicles,
    customers: seedCustomers,
    bookings: seedBookings,
  };
  if (!supabase) return fallback;
  const [v, c, b] = await Promise.all([
    supabase.from("vehicles").select("*").order("name"),
    supabase.from("customers").select("*").order("full_name"),
    supabase.from("bookings").select("*"),
  ]);
  if (v.error || c.error || b.error) {
    console.error("Supabase fetch error", v.error || c.error || b.error);
    return fallback;
  }
  return {
    vehicles: (v.data ?? []).map(toVehicle),
    customers: (c.data ?? []).map(toCustomer),
    bookings: (b.data ?? []).map(toBooking),
  };
}

export async function updateVehicle(
  id: string,
  v: Partial<Omit<Vehicle, "id">>,
): Promise<Vehicle | null> {
  await requireSession();
  if (!supabase) return null;
  const row: Record<string, unknown> = {};
  if (v.name !== undefined) row.name = v.name;
  if (v.plate !== undefined) row.registration = v.plate;
  if (v.vin !== undefined) row.vin = v.vin ?? null;
  if (v.year !== undefined) row.year = v.year ?? null;
  if (v.mileage !== undefined) row.mileage = v.mileage ?? null;
  if (v.dailyRate !== undefined) row.daily_rate = v.dailyRate ?? null;
  if (v.color !== undefined) row.color = v.color;
  if (v.status !== undefined) row.status = v.status;
  if (v.ocExpiry !== undefined) row.insurance_oc_expiry = v.ocExpiry ?? null;
  if (v.inspectionExpiry !== undefined) row.inspection_expiry = v.inspectionExpiry ?? null;
  if (v.notes !== undefined) row.notes = v.notes ?? null;
  const { data, error } = await supabase
    .from("vehicles")
    .update(row)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    console.error(error);
    return null;
  }
  return toVehicle(data);
}

export async function insertBooking(b: Omit<Booking, "id">): Promise<Booking> {
  await requireSession();
  if (!supabase) return { ...b, id: `local-${Math.round(Math.random() * 1e9)}` };
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      vehicle_id: b.vehicleId,
      customer_id: b.customerId ?? null,
      type: b.type,
      status: b.status,
      start_at: b.start,
      end_at: b.end,
      pickup_time: b.pickupTime ?? null,
      return_time: b.returnTime ?? null,
      daily_rate: b.dailyRate ?? null,
      total_price: b.total ?? null,
      deposit: b.deposit ?? null,
      odometer_start: b.odometerStart ?? null,
      odometer_end: b.odometerEnd ?? null,
      notes: b.notes ?? null,
    })
    .select()
    .single();
  if (error) {
    console.error(error);
    throw new Error("Nie udało się zapisać rezerwacji.");
  }
  return toBooking(data);
}

export async function updateBooking(
  id: string,
  b: Partial<Omit<Booking, "id">>,
): Promise<Booking | null> {
  await requireSession();
  if (!supabase) return null;
  const row: Record<string, unknown> = {};
  if (b.vehicleId !== undefined) row.vehicle_id = b.vehicleId;
  if (b.customerId !== undefined) row.customer_id = b.customerId ?? null;
  if (b.type !== undefined) row.type = b.type;
  if (b.status !== undefined) row.status = b.status;
  if (b.start !== undefined) row.start_at = b.start;
  if (b.end !== undefined) row.end_at = b.end;
  if (b.pickupTime !== undefined) row.pickup_time = b.pickupTime ?? null;
  if (b.returnTime !== undefined) row.return_time = b.returnTime ?? null;
  if (b.dailyRate !== undefined) row.daily_rate = b.dailyRate ?? null;
  if (b.total !== undefined) row.total_price = b.total ?? null;
  if (b.deposit !== undefined) row.deposit = b.deposit ?? null;
  if (b.odometerStart !== undefined) row.odometer_start = b.odometerStart ?? null;
  if (b.odometerEnd !== undefined) row.odometer_end = b.odometerEnd ?? null;
  if (b.notes !== undefined) row.notes = b.notes ?? null;
  const { data, error } = await supabase
    .from("bookings")
    .update(row)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    console.error(error);
    return null;
  }
  return toBooking(data);
}

export async function deleteBookingDb(id: string): Promise<void> {
  await requireSession();
  if (!supabase) return;
  const { error } = await supabase.from("bookings").delete().eq("id", id);
  if (error) {
    console.error(error);
    throw new Error("Nie udało się usunąć wpisu.");
  }
}

function customerRow(c: Partial<Omit<Customer, "id">>) {
  return {
    ...(c.name !== undefined && { full_name: c.name }),
    ...(c.phone !== undefined && { phone: c.phone ?? null }),
    ...(c.email !== undefined && { email: c.email ?? null }),
    ...(c.license !== undefined && { license_number: c.license ?? null }),
    ...(c.id_number !== undefined && { id_number: c.id_number ?? null }),
    ...(c.address !== undefined && { address: c.address ?? null }),
    ...(c.source !== undefined && { source: c.source ?? "Panel" }),
    ...(c.companyName !== undefined && { company_name: c.companyName ?? null }),
    ...(c.nip !== undefined && { nip: c.nip ?? null }),
    ...(c.companyAddress !== undefined && { company_address: c.companyAddress ?? null }),
    ...(c.companyEmail !== undefined && { company_email: c.companyEmail ?? null }),
    ...(c.companyPhone !== undefined && { company_phone: c.companyPhone ?? null }),
    ...(c.notes !== undefined && { notes: c.notes ?? null }),
    ...(c.suspect !== undefined && { is_suspect: c.suspect }),
  };
}

export async function insertCustomer(c: Omit<Customer, "id">): Promise<Customer> {
  await requireSession();
  if (!supabase) return { ...c, id: `local-${Math.round(Math.random() * 1e9)}` };
  const { data, error } = await supabase
    .from("customers")
    .insert({ source: "Panel", ...customerRow(c) })
    .select()
    .single();
  if (error) {
    console.error(error);
    throw new Error("Nie udało się dodać klienta.");
  }
  return toCustomer(data);
}

export async function updateCustomer(
  id: string,
  patch: Partial<Omit<Customer, "id">>,
): Promise<Customer | null> {
  await requireSession();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("customers")
    .update(customerRow(patch))
    .eq("id", id)
    .select()
    .single();
  if (error) {
    console.error(error);
    return null;
  }
  return toCustomer(data);
}

export async function deleteCustomerDb(id: string): Promise<void> {
  await requireSession();
  if (!supabase) return;
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) {
    console.error(error);
    throw new Error("Nie udało się usunąć klienta.");
  }
}

export async function fetchCustomerDocuments(customerId: string): Promise<CustomerDocument[]> {
  await requireSession();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("customer_documents")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at");
  if (error) {
    console.error(error);
    return [];
  }
  return (data ?? []).map(toCustomerDocument);
}

export async function insertCustomerDocument(
  d: Omit<CustomerDocument, "id">,
): Promise<CustomerDocument | null> {
  await requireSession();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("customer_documents")
    .insert({
      customer_id: d.customerId,
      doc_type: d.docType,
      doc_number: d.docNumber ?? null,
      issued_at: d.issuedAt ?? null,
      expires_at: d.expiresAt ?? null,
    })
    .select()
    .single();
  if (error) {
    console.error(error);
    return null;
  }
  return toCustomerDocument(data);
}

export async function deleteCustomerDocument(id: string): Promise<void> {
  await requireSession();
  if (!supabase) return;
  const { error } = await supabase.from("customer_documents").delete().eq("id", id);
  if (error) console.error(error);
}

export async function fetchContracts(customerId?: string): Promise<Contract[]> {
  await requireSession();
  if (!supabase) return [];
  let qb = supabase
    .from("contracts")
    .select("*")
    .order("created_at", { ascending: false });
  if (customerId) qb = qb.eq("customer_id", customerId);
  const { data, error } = await qb;
  if (error) {
    console.error(error);
    return [];
  }
  return (data ?? []).map(toContract);
}

export async function insertContract(
  c: Omit<Contract, "id" | "createdAt">,
): Promise<Contract | null> {
  await requireSession();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("contracts")
    .insert({
      number: c.number,
      template_id: c.templateId,
      template_name: c.templateName,
      customer_id: c.customerId,
      vehicle_id: c.vehicleId ?? null,
      booking_id: c.bookingId ?? null,
      status: c.status,
      content: c.content,
    })
    .select()
    .single();
  if (error) {
    console.error(error);
    return null;
  }
  return toContract(data);
}

/* ---------- Checklista wydania auta (per klient) ---------- */

export async function fetchCustomerChecklist(
  customerId: string,
): Promise<Record<string, boolean>> {
  await requireSession();
  if (!supabase) return {};
  const { data, error } = await supabase
    .from("customer_checklists")
    .select("item_key,done")
    .eq("customer_id", customerId);
  if (error) {
    console.error(error);
    return {};
  }
  const out: Record<string, boolean> = {};
  for (const r of data ?? []) out[(r as any).item_key] = !!(r as any).done;
  return out;
}

export async function setChecklistItem(
  customerId: string,
  itemKey: string,
  done: boolean,
): Promise<boolean> {
  await requireSession();
  if (!supabase) return false;
  const { error } = await supabase.from("customer_checklists").upsert(
    {
      customer_id: customerId,
      item_key: itemKey,
      done,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "customer_id,item_key" },
  );
  if (error) {
    console.error(error);
    return false;
  }
  return true;
}

/* ---------- Self-service booking links (kolejka wniosków) ---------- */

function newToken(): string {
  return randomBytes(24).toString("base64url");
}

function toBookingLink(r: any): BookingLink {
  return {
    id: r.id,
    token: r.token,
    vehicleId: r.vehicle_id,
    status: r.status,
    expiresAt: r.expires_at,
    suggestedStart: r.suggested_start ?? undefined,
    suggestedEnd: r.suggested_end ?? undefined,
    suggestedDailyRate: r.suggested_daily_rate != null ? Number(r.suggested_daily_rate) : undefined,
    suggestedDeposit: r.suggested_deposit != null ? Number(r.suggested_deposit) : undefined,
    noteToClient: r.note_to_client ?? undefined,
    clientName: r.client_name ?? undefined,
    clientEmail: r.client_email ?? undefined,
    clientPhone: r.client_phone ?? undefined,
    clientAddress: r.client_address ?? undefined,
    clientIdNumber: r.client_id_number ?? undefined,
    clientIdIssued: r.client_id_issued ? String(r.client_id_issued).slice(0, 10) : undefined,
    clientIdExpires: r.client_id_expires ? String(r.client_id_expires).slice(0, 10) : undefined,
    clientLicense: r.client_license ?? undefined,
    clientLicenseIssued: r.client_license_issued
      ? String(r.client_license_issued).slice(0, 10)
      : undefined,
    clientLicenseExpires: r.client_license_expires
      ? String(r.client_license_expires).slice(0, 10)
      : undefined,
    reqStart: r.req_start ? String(r.req_start).slice(0, 10) : undefined,
    reqEnd: r.req_end ? String(r.req_end).slice(0, 10) : undefined,
    clientNote: r.client_note ?? undefined,
    adminNote: r.admin_note ?? undefined,
    decidedAt: r.decided_at ?? undefined,
    createdBookingId: r.created_booking_id ?? undefined,
    createdCustomerId: r.created_customer_id ?? undefined,
    supersedesId: r.supersedes_id ?? undefined,
    createdBy: r.created_by ?? undefined,
    submittedAt: r.submitted_at ?? undefined,
    createdAt: r.created_at ?? undefined,
  };
}

export async function createBookingLink(input: {
  vehicleId: string;
  suggestedStart?: string;
  suggestedEnd?: string;
  suggestedDailyRate?: number;
  suggestedDeposit?: number;
  noteToClient?: string;
}): Promise<{ ok: boolean; token?: string; message?: string }> {
  const session = await requireSession();
  if (!supabase) return { ok: false, message: "Baza niedostępna." };
  if (!input.vehicleId) return { ok: false, message: "Wybierz pojazd." };
  const token = newToken();
  const { error } = await supabase.from("booking_links").insert({
    token,
    vehicle_id: input.vehicleId,
    status: "awaiting_client",
    expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    suggested_start: input.suggestedStart || null,
    suggested_end: input.suggestedEnd || null,
    suggested_daily_rate: input.suggestedDailyRate ?? null,
    suggested_deposit: input.suggestedDeposit ?? null,
    note_to_client: input.noteToClient?.trim() || null,
    created_by: session.u,
  });
  if (error) {
    console.error(error);
    return { ok: false, message: "Nie udało się utworzyć linku." };
  }
  return { ok: true, token };
}

export async function fetchBookingLinks(): Promise<BookingLink[]> {
  await requireSession();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("booking_links")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error(error);
    return [];
  }
  return (data ?? []).map(toBookingLink);
}

export async function decideBookingRequest(input: {
  id: string;
  decision: "confirm" | "request_changes" | "reject";
  adminNote?: string;
  origin: string;
}): Promise<{ ok: boolean; message?: string }> {
  const session = await requireSession();
  if (!supabase) return { ok: false, message: "Baza niedostępna." };

  const { data: link } = await supabase
    .from("booking_links")
    .select("*")
    .eq("id", input.id)
    .maybeSingle();
  if (!link) return { ok: false, message: "Nie znaleziono wniosku." };
  if (link.status !== "submitted")
    return { ok: false, message: "Ten wniosek został już rozstrzygnięty." };

  const nowIso = new Date().toISOString();
  const note = input.adminNote?.trim() || null;

  if (input.decision === "confirm") {
    // Dedup klienta po e-mailu; inaczej nowy rekord z pełnymi danymi pod umowę.
    let customerId: string | null = null;
    if (link.client_email) {
      const { data: existing } = await supabase
        .from("customers")
        .select("id")
        .eq("email", link.client_email)
        .maybeSingle();
      customerId = existing?.id ?? null;
    }
    if (!customerId) {
      const { data: cust, error: ce } = await supabase
        .from("customers")
        .insert({
          full_name: link.client_name,
          email: link.client_email,
          phone: link.client_phone,
          address: link.client_address,
          id_number: link.client_id_number,
          license_number: link.client_license,
          source: "Self-service",
        })
        .select("id")
        .single();
      if (ce) {
        console.error(ce);
        return { ok: false, message: "Nie udało się zapisać klienta." };
      }
      customerId = cust.id;
      // Dokumenty z wniosku (numer + daty wydania/ważności) → od razu na profil,
      // żeby umowa miała komplet bez przepisywania. Tylko dla nowego klienta —
      // istniejącemu nie dublujemy wpisów.
      const docs = [
        link.client_id_number && {
          customer_id: customerId,
          doc_type: "Dowód osobisty",
          doc_number: link.client_id_number,
          issued_at: link.client_id_issued ?? null,
          expires_at: link.client_id_expires ?? null,
        },
        link.client_license && {
          customer_id: customerId,
          doc_type: "Prawo jazdy",
          doc_number: link.client_license,
          issued_at: link.client_license_issued ?? null,
          expires_at: link.client_license_expires ?? null,
        },
      ].filter(Boolean);
      if (docs.length) {
        const { error: de } = await supabase.from("customer_documents").insert(docs);
        if (de) console.error(de); // nie blokuje potwierdzenia rezerwacji
      }
    }
    const { data: bk, error: be } = await supabase
      .from("bookings")
      .insert({
        vehicle_id: link.vehicle_id,
        customer_id: customerId,
        type: "reservation",
        status: "confirmed",
        start_at: link.req_start,
        end_at: link.req_end,
        daily_rate: link.suggested_daily_rate,
        deposit: link.suggested_deposit,
        notes: link.client_note,
      })
      .select("id")
      .single();
    if (be) {
      console.error(be);
      return { ok: false, message: "Nie udało się utworzyć rezerwacji." };
    }
    await supabase
      .from("booking_links")
      .update({
        status: "confirmed",
        decided_at: nowIso,
        created_booking_id: bk.id,
        created_customer_id: customerId,
        admin_note: note,
      })
      .eq("id", input.id);
    if (link.client_email) {
      const { data: veh } = await supabase
        .from("vehicles")
        .select("name")
        .eq("id", link.vehicle_id)
        .maybeSingle();
      const { subject, html } = emailConfirmed({
        vehicleName: veh?.name ?? "Pojazd",
        start: String(link.req_start).slice(0, 10),
        end: String(link.req_end).slice(0, 10),
      });
      await sendEmail({ to: link.client_email, subject, html });
    }
    return { ok: true };
  }

  if (input.decision === "request_changes") {
    // Nowy link kopiujący dane klienta jako prefill; świeży token + 60 min.
    const token = newToken();
    const { error: ne } = await supabase.from("booking_links").insert({
      token,
      vehicle_id: link.vehicle_id,
      status: "awaiting_client",
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      suggested_start: link.req_start,
      suggested_end: link.req_end,
      suggested_daily_rate: link.suggested_daily_rate,
      suggested_deposit: link.suggested_deposit,
      note_to_client: note || link.note_to_client,
      client_name: link.client_name,
      client_email: link.client_email,
      client_phone: link.client_phone,
      client_address: link.client_address,
      client_id_number: link.client_id_number,
      client_id_issued: link.client_id_issued,
      client_id_expires: link.client_id_expires,
      client_license: link.client_license,
      client_license_issued: link.client_license_issued,
      client_license_expires: link.client_license_expires,
      supersedes_id: link.id,
      created_by: session.u,
    });
    if (ne) {
      console.error(ne);
      return { ok: false, message: "Nie udało się utworzyć nowego linku." };
    }
    await supabase
      .from("booking_links")
      .update({ status: "changes_requested", decided_at: nowIso, admin_note: note })
      .eq("id", input.id);
    if (link.client_email) {
      const { subject, html } = emailChanges({
        reason: note || "",
        link: `${input.origin}/book/${token}`,
      });
      await sendEmail({ to: link.client_email, subject, html });
    }
    return { ok: true };
  }

  // reject
  await supabase
    .from("booking_links")
    .update({ status: "rejected", decided_at: nowIso, admin_note: note })
    .eq("id", input.id);
  if (link.client_email) {
    const { subject, html } = emailRejected({ reason: note || "" });
    await sendEmail({ to: link.client_email, subject, html });
  }
  return { ok: true };
}
