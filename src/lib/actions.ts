"use server";

// Cienka warstwa Server Actions — wywoływana z komponentów klienckich
// (DataProvider, strony kontraktów/klientów). Cała logika i bramka sesji
// żyje w db.ts (server-only); to tylko granica RPC.

import * as db from "./db";
import type { Vehicle, Customer, Booking, CustomerDocument } from "./types";
import type { Contract } from "./contract";

export async function fetchAllAction() {
  return db.fetchAll();
}

export async function updateVehicleAction(id: string, patch: Partial<Omit<Vehicle, "id">>) {
  return db.updateVehicle(id, patch);
}

export async function insertBookingAction(b: Omit<Booking, "id">) {
  return db.insertBooking(b);
}

export async function updateBookingAction(id: string, patch: Partial<Omit<Booking, "id">>) {
  return db.updateBooking(id, patch);
}

export async function deleteBookingAction(id: string) {
  return db.deleteBookingDb(id);
}

export async function insertCustomerAction(c: Omit<Customer, "id">) {
  return db.insertCustomer(c);
}

export async function updateCustomerAction(id: string, patch: Partial<Omit<Customer, "id">>) {
  return db.updateCustomer(id, patch);
}

export async function deleteCustomerAction(id: string) {
  return db.deleteCustomerDb(id);
}

export async function fetchCustomerDocumentsAction(customerId: string) {
  return db.fetchCustomerDocuments(customerId);
}

export async function insertCustomerDocumentAction(d: Omit<CustomerDocument, "id">) {
  return db.insertCustomerDocument(d);
}

export async function deleteCustomerDocumentAction(id: string) {
  return db.deleteCustomerDocument(id);
}

export async function fetchContractsAction(customerId?: string) {
  return db.fetchContracts(customerId);
}

export async function insertContractAction(c: Omit<Contract, "id" | "createdAt">) {
  return db.insertContract(c);
}

/* ---------- Self-service booking links ---------- */

export async function createBookingLinkAction(input: {
  vehicleId: string;
  suggestedStart?: string;
  suggestedEnd?: string;
  suggestedDailyRate?: number;
  suggestedDeposit?: number;
  noteToClient?: string;
}) {
  return db.createBookingLink(input);
}

export async function fetchBookingLinksAction() {
  return db.fetchBookingLinks();
}

export async function decideBookingRequestAction(input: {
  id: string;
  decision: "confirm" | "request_changes" | "reject";
  adminNote?: string;
  origin: string;
}) {
  return db.decideBookingRequest(input);
}
