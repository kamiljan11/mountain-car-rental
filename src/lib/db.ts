import { supabase } from "./supabase";
import {
  vehicles as seedVehicles,
  customers as seedCustomers,
  bookings as seedBookings,
} from "./data";
import type { Vehicle, Customer, Booking } from "./types";
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

export async function insertBooking(b: Omit<Booking, "id">): Promise<Booking> {
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

export async function deleteBookingDb(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("bookings").delete().eq("id", id);
  if (error) console.error(error);
}

export async function insertCustomer(c: Omit<Customer, "id">): Promise<Customer> {
  if (!supabase) return { ...c, id: `local-${Math.round(Math.random() * 1e9)}` };
  const { data, error } = await supabase
    .from("customers")
    .insert({
      full_name: c.name,
      phone: c.phone ?? null,
      email: c.email ?? null,
      license_number: c.license ?? null,
      id_number: c.id_number ?? null,
      address: c.address ?? null,
      source: c.source ?? "Panel",
    })
    .select()
    .single();
  if (error) {
    console.error(error);
    return { ...c, id: `local-${Math.round(Math.random() * 1e9)}` };
  }
  return toCustomer(data);
}

export async function fetchContracts(customerId?: string): Promise<Contract[]> {
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
