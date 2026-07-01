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
  source?: string;
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
