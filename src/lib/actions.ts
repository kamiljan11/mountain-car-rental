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

export async function insertVehicleAction(v: Omit<Vehicle, "id">) {
  return db.insertVehicle(v);
}

export async function insertBookingAction(b: Omit<Booking, "id">, force = false) {
  return db.insertBooking(b, force);
}

export async function updateBookingAction(
  id: string,
  patch: Partial<Omit<Booking, "id">>,
  force = false,
) {
  return db.updateBooking(id, patch, force);
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

/* ---------- Checklista wydania auta (per klient) ---------- */

export async function fetchCustomerChecklistAction(customerId: string) {
  return db.fetchCustomerChecklist(customerId);
}

export async function setChecklistItemAction(
  customerId: string,
  itemKey: string,
  done: boolean,
) {
  return db.setChecklistItem(customerId, itemKey, done);
}

export async function sendPaymentEmailAction(input: { bookingId: string; origin: string }) {
  return db.sendPaymentEmail(input);
}

export async function prepareBookingConfirmationAction(input: { bookingId: string; origin: string }) {
  return db.prepareBookingConfirmation(input);
}

export async function sendBookingConfirmationAction(input: {
  bookingId: string;
  origin: string;
  to?: string;
}) {
  return db.sendBookingConfirmation(input);
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
