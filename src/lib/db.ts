import "server-only";
import { supabaseAdmin as supabase } from "./supabase-admin";
import { requireSession } from "./auth";
import {
  vehicles as seedVehicles,
  customers as seedCustomers,
  bookings as seedBookings,
} from "./data";
import type { Vehicle, Customer, Booking, CustomerDocument } from "./types";
import type { Contract } from "./contract";

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
    dailyRate: r.daily_rate != null ? Number(r.daily_rate) : undefined,
    total: r.total_price != null ? Number(r.total_price) : undefined,
    deposit: r.deposit != null ? Number(r.deposit) : undefined,
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
      daily_rate: b.dailyRate ?? null,
      total_price: b.total ?? null,
      deposit: b.deposit ?? null,
      notes: b.notes ?? null,
    })
    .select()
    .single();
  if (error) {
    console.error(error);
    return { ...b, id: `local-${Math.round(Math.random() * 1e9)}` };
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
  if (b.dailyRate !== undefined) row.daily_rate = b.dailyRate ?? null;
  if (b.total !== undefined) row.total_price = b.total ?? null;
  if (b.deposit !== undefined) row.deposit = b.deposit ?? null;
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
  if (error) console.error(error);
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
    return { ...c, id: `local-${Math.round(Math.random() * 1e9)}` };
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
  if (error) console.error(error);
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
