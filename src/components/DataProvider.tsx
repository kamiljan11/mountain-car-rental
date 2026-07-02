"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  vehicles as seedVehicles,
  customers as seedCustomers,
  bookings as seedBookings,
} from "@/lib/data";
import {
  fetchAllAction as fetchAll,
  insertBookingAction as insertBooking,
  updateBookingAction as updateBookingDb,
  deleteBookingAction as deleteBookingDb,
  insertCustomerAction as insertCustomer,
  updateCustomerAction as updateCustomerDb,
  deleteCustomerAction as deleteCustomerDb,
  updateVehicleAction as updateVehicleDb,
} from "@/lib/actions";
import type { Vehicle, Customer, Booking } from "@/lib/types";

type Ctx = {
  vehicles: Vehicle[];
  customers: Customer[];
  bookings: Booking[];
  loaded: boolean;
  addBooking: (b: Omit<Booking, "id">) => Promise<void>;
  updateBooking: (id: string, patch: Partial<Omit<Booking, "id">>) => Promise<void>;
  removeBooking: (id: string) => Promise<void>;
  addCustomer: (c: Omit<Customer, "id">) => Promise<Customer>;
  updateCustomer: (id: string, patch: Partial<Omit<Customer, "id">>) => Promise<void>;
  removeCustomer: (id: string) => Promise<void>;
  updateVehicle: (id: string, patch: Partial<Omit<Vehicle, "id">>) => Promise<void>;
  vehicleById: (id: string) => Vehicle | undefined;
  customerById: (id?: string | null) => Customer | undefined;
};

const DataCtx = createContext<Ctx | null>(null);

export function useData(): Ctx {
  const c = useContext(DataCtx);
  if (!c) throw new Error("useData must be used inside DataProvider");
  return c;
}

export default function DataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(seedVehicles);
  const [customers, setCustomers] = useState<Customer[]>(seedCustomers);
  const [bookings, setBookings] = useState<Booking[]>(seedBookings);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchAll().then((d) => {
      if (!alive) return;
      setVehicles(d.vehicles);
      setCustomers(d.customers);
      setBookings(d.bookings);
      setLoaded(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  const maps = useMemo(
    () => ({
      v: new Map(vehicles.map((x) => [x.id, x])),
      c: new Map(customers.map((x) => [x.id, x])),
    }),
    [vehicles, customers],
  );

  const value: Ctx = {
    vehicles,
    customers,
    bookings,
    loaded,
    addBooking: async (b) => {
      const nb = await insertBooking(b);
      setBookings((prev) => [...prev, nb]);
    },
    updateBooking: async (id, patch) => {
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
      await updateBookingDb(id, patch);
    },
    removeBooking: async (id) => {
      setBookings((prev) => prev.filter((x) => x.id !== id));
      await deleteBookingDb(id);
    },
    addCustomer: async (c) => {
      const nc = await insertCustomer(c);
      setCustomers((prev) => [...prev, nc]);
      return nc;
    },
    updateCustomer: async (id, patch) => {
      setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
      await updateCustomerDb(id, patch);
    },
    removeCustomer: async (id) => {
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      await deleteCustomerDb(id);
    },
    updateVehicle: async (id, patch) => {
      setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
      await updateVehicleDb(id, patch);
    },
    vehicleById: (id) => maps.v.get(id),
    customerById: (id) => (id ? maps.c.get(id) : undefined),
  };

  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>;
}
