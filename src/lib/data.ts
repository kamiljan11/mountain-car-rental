import type { Vehicle, Customer, Booking, Payment } from "./types";

// Dane seed — pochodzą ze scrape'a RentHelp (do wymiany na import z Supabase). Kwoty w ISK.
export const vehicles: Vehicle[] = [
  { id: "v1", name: "VW California", plate: "ROB 4521G", year: 2021, mileage: 78200, dailyRate: 34000, color: "#2563eb", status: "active", ocExpiry: "2026-11-20", acExpiry: "2026-11-20", inspectionExpiry: "2026-07-15" },
  { id: "v2", name: "VW Caddy California", plate: "ROB 8830K", year: 2022, mileage: 54100, dailyRate: 29000, color: "#0ea5e9", status: "active", ocExpiry: "2027-01-10", inspectionExpiry: "2026-10-02" },
  { id: "v3", name: "Renault Trafic", plate: "ROB64", vin: "VF1JL000859948", year: 2020, mileage: 268482, dailyRate: 25000, color: "#14b8a6", status: "active", ocExpiry: "2026-07-22", inspectionExpiry: "2026-12-01" },
  { id: "v4", name: "Renault Trafic II", plate: "ROB 91055", year: 2021, mileage: 98700, dailyRate: 25000, color: "#10b981", status: "active", ocExpiry: "2026-09-05", inspectionExpiry: "2027-02-01" },
  { id: "v5", name: "Mercedes Vito", plate: "ROB 2207T", year: 2019, mileage: 143000, dailyRate: 31000, color: "#6366f1", status: "active", ocExpiry: "2026-12-15", inspectionExpiry: "2026-08-20" },
  { id: "v6", name: "Mitsubishi Pajero", plate: "ROB 7714P", year: 2018, mileage: 176500, dailyRate: 27000, color: "#f59e0b", status: "active", ocExpiry: "2027-03-01", inspectionExpiry: "2026-11-11" },
  { id: "v7", name: "Dacia Duster", plate: "ROB 3390D", year: 2023, mileage: 34200, dailyRate: 22000, color: "#84cc16", status: "active", ocExpiry: "2027-05-20", inspectionExpiry: "2027-05-20" },
  { id: "v8", name: "Ford Nugget", plate: "ROB 5561N", year: 2022, mileage: 61800, dailyRate: 35000, color: "#ec4899", status: "active", ocExpiry: "2026-10-30", inspectionExpiry: "2026-07-28" },
  { id: "v9", name: "Fiat Ducato Camper", plate: "ROB 1188C", year: 2020, mileage: 88900, dailyRate: 33000, color: "#ef4444", status: "active", ocExpiry: "2026-12-01", inspectionExpiry: "2026-09-15" },
  { id: "v10", name: "Peugeot Traveller", plate: "ROB 6642V", year: 2021, mileage: 72400, dailyRate: 28000, color: "#8b5cf6", status: "active", ocExpiry: "2027-01-05", inspectionExpiry: "2026-10-20" },
  { id: "v11", name: "Toyota Proace", plate: "ROB 9903X", year: 2022, mileage: 45600, dailyRate: 28000, color: "#06b6d4", status: "active", ocExpiry: "2027-02-14", inspectionExpiry: "2027-01-09" },
  { id: "v12", name: "Citroën SpaceTourer", plate: "ROB 4470S", year: 2021, mileage: 69100, dailyRate: 27000, color: "#22c55e", status: "active", ocExpiry: "2026-08-08", inspectionExpiry: "2026-12-20" },
  { id: "v13", name: "VW Multivan", plate: "ROB 2255M", year: 2023, mileage: 28900, dailyRate: 32000, color: "#3b82f6", status: "active", ocExpiry: "2027-04-01", inspectionExpiry: "2027-03-15" },
];

export const customers: Customer[] = [
  { id: "c1", name: "[klient 109]", phone: "+48 506 354 604", email: "[e-mail klienta usuniety]", id_number: "97111410691", license: "01418/15/1417", address: "PL 05-410 Józefów, Piaskowa 17", source: "renthelp" },
  { id: "c2", name: "Paweł Witek", phone: "+48 512 300 400", email: "pawel.witek@example.com", source: "renthelp" },
  { id: "c3", name: "[klient 176]", phone: "+48 698 741 200", email: "m.cyran@example.com", source: "renthelp" },
  { id: "c4", name: "Ewelina Starejki", phone: "+48 501 902 803", source: "olx" },
  { id: "c5", name: "[klient 429] Tunia", phone: "+48 660 112 233", source: "booking" },
  { id: "c6", name: "Krzysztof Nowak", phone: "+48 604 555 666", email: "knowak@example.com", source: "manual" },
  { id: "c7", name: "[klient 016] Kowalczyk", phone: "+48 723 884 991", source: "manual" },
  { id: "c8", name: "[klient 539] Lewandowski", phone: "+48 517 220 945", source: "manual" },
  { id: "c9", name: "Marek Zając", phone: "+48 606 773 311", source: "manual" },
  { id: "c10", name: "Katarzyna Wójcik", phone: "+48 692 110 455", email: "k.wojcik@example.com", source: "renthelp" },
];

export const bookings: Booking[] = [
  { id: "b1", vehicleId: "v3", customerId: "c1", type: "reservation", status: "confirmed", start: "2026-09-01", end: "2026-09-28", dailyRate: 25000, total: 675000, deposit: 150000, external_ref: "1097", notes: "[klient 109] — długi najem" },
  { id: "b2", vehicleId: "v2", customerId: "c2", type: "reservation", status: "confirmed", start: "2026-09-18", end: "2026-09-28", dailyRate: 29000, total: 290000, deposit: 150000, external_ref: "1101", notes: "Paweł Witek" },
  { id: "b3", vehicleId: "v4", customerId: "c3", type: "reservation", status: "confirmed", start: "2026-09-19", end: "2026-09-27", dailyRate: 25000, total: 200000, deposit: 150000, external_ref: "1102", notes: "[klient 176]" },
  { id: "b4", vehicleId: "v1", customerId: "c4", type: "block", status: "confirmed", start: "2026-09-16", end: "2026-09-19", platform: "olx", notes: "Ewelina Starejki · tel 501 902 803 · OLX · 90 000 ISK" },
  { id: "b5", vehicleId: "v6", customerId: "c5", type: "block", status: "confirmed", start: "2026-09-21", end: "2026-09-25", platform: "booking", notes: "[klient 429] Tunia · Booking · 120 000 ISK" },
  { id: "b6", vehicleId: "v5", customerId: "c6", type: "reservation", status: "confirmed", start: "2026-09-17", end: "2026-09-19", dailyRate: 31000, total: 62000, deposit: 150000, external_ref: "1099", notes: "Krzysztof Nowak" },
  { id: "b7", vehicleId: "v7", customerId: null, type: "service", status: "confirmed", start: "2026-09-23", end: "2026-09-26", notes: "Serwis — wymiana oleju + przegląd" },
  { id: "b8", vehicleId: "v10", customerId: "c7", type: "reservation", status: "active", start: "2026-09-20", end: "2026-09-25", dailyRate: 28000, total: 140000, deposit: 150000, external_ref: "1100", notes: "[klient 016] Kowalczyk" },
  { id: "b9", vehicleId: "v9", customerId: null, type: "block", status: "confirmed", start: "2026-09-24", end: "2026-09-28", platform: "olx", notes: "Rezerwacja OLX — czeka na dane klienta" },
  { id: "b10", vehicleId: "v12", customerId: "c9", type: "reservation", status: "completed", start: "2026-09-15", end: "2026-09-17", dailyRate: 27000, total: 54000, deposit: 150000, external_ref: "1095", notes: "Marek Zając" },
  { id: "b11", vehicleId: "v13", customerId: null, type: "block", status: "confirmed", start: "2026-09-25", end: "2026-09-28", platform: "booking", notes: "Booking.com — 4 doby" },
  { id: "b12", vehicleId: "v8", customerId: "c8", type: "reservation", status: "confirmed", start: "2026-09-22", end: "2026-09-24", dailyRate: 35000, total: 70000, deposit: 150000, external_ref: "1103", notes: "[klient 539] Lewandowski" },
  { id: "b13", vehicleId: "v11", customerId: "c10", type: "reservation", status: "completed", start: "2026-08-10", end: "2026-08-17", dailyRate: 28000, total: 196000, deposit: 150000, external_ref: "1088", notes: "Katarzyna Wójcik" },
  { id: "b14", vehicleId: "v1", customerId: "c6", type: "reservation", status: "tentative", start: "2026-10-02", end: "2026-10-06", dailyRate: 34000, total: 136000, deposit: 150000, notes: "Krzysztof Nowak — wstępna" },
];

export const payments: Payment[] = [];

const vMap = new Map(vehicles.map((v) => [v.id, v]));
const cMap = new Map(customers.map((c) => [c.id, c]));

export function vehicleById(id: string) {
  return vMap.get(id);
}
export function customerById(id?: string | null) {
  return id ? cMap.get(id) : undefined;
}
