export type BookingType = "reservation" | "block" | "service";
export type BookingStatus =
  | "tentative"
  | "confirmed"
  | "active"
  | "completed"
  | "cancelled";

export interface Vehicle {
  id: string;
  name: string;
  plate: string;
  vin?: string;
  year?: number;
  mileage?: number;
  dailyRate?: number;
  color: string;
  status: "active" | "inactive" | "service";
  ocExpiry?: string;
  acExpiry?: string;
  inspectionExpiry?: string;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  license?: string;
  id_number?: string;
  address?: string;
  source?: string;
  companyName?: string;
  nip?: string;
  companyAddress?: string;
  companyEmail?: string;
  companyPhone?: string;
  notes?: string;
  suspect?: boolean;
}

export const DOC_TYPES = ["Dowód osobisty", "Prawo jazdy", "Paszport", "Inny"] as const;
export type DocType = (typeof DOC_TYPES)[number];

export interface CustomerDocument {
  id: string;
  customerId: string;
  docType: DocType;
  docNumber?: string;
  issuedAt?: string;
  expiresAt?: string;
}

// Klient firmowy wg RentHelp = ma wypełnioną nazwę firmy; ta sama reguła
// używana wszędzie (profil klienta, generator umów), żeby nie rozjeżdżały się
// osobne kopie tego samego warunku. Type predicate — zawęża do "companyName
// na pewno jest" w gałęzi if, bez rzutowań w miejscach użycia.
export function isCompanyCustomer(
  customer?: Customer,
): customer is Customer & { companyName: string } {
  return !!customer?.companyName;
}

export interface Booking {
  id: string;
  vehicleId: string;
  customerId?: string | null;
  type: BookingType;
  status: BookingStatus;
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  dailyRate?: number;
  total?: number;
  deposit?: number;
  platform?: string;
  external_ref?: string;
  notes?: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  method?: "cash" | "card" | "transfer";
  kind?: "deposit" | "rental" | "refund";
  status?: "paid" | "pending";
  paidAt?: string;
}
