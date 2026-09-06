"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import AppSkeleton from "@/components/AppSkeleton";
import {
  fetchAllAction as fetchAll,
  insertBookingAction as insertBooking,
  updateBookingAction as updateBookingDb,
  deleteBookingAction as deleteBookingDb,
  insertCustomerAction as insertCustomer,
  updateCustomerAction as updateCustomerDb,
  deleteCustomerAction as deleteCustomerDb,
  updateVehicleAction as updateVehicleDb,
  insertVehicleAction as insertVehicleDb,
} from "@/lib/actions";
import { useToast } from "@/components/Toast";
import type { Vehicle, Customer, Booking } from "@/lib/types";

type Ctx = {
  vehicles: Vehicle[];
  customers: Customer[];
  bookings: Booking[];
  loaded: boolean;
  refresh: () => Promise<void>;
  addBooking: (b: Omit<Booking, "id">, force?: boolean) => Promise<Booking | null>;
  updateBooking: (
    id: string,
    patch: Partial<Omit<Booking, "id">>,
    force?: boolean,
  ) => Promise<boolean>;
  removeBooking: (id: string) => Promise<void>;
  addCustomer: (c: Omit<Customer, "id">) => Promise<Customer | null>;
  updateCustomer: (id: string, patch: Partial<Omit<Customer, "id">>) => Promise<boolean>;
  removeCustomer: (id: string) => Promise<void>;
  updateVehicle: (id: string, patch: Partial<Omit<Vehicle, "id">>) => Promise<boolean>;
  addVehicle: (v: Omit<Vehicle, "id">) => Promise<Vehicle | null>;
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
  // Start od PUSTYCH danych + ekran ładowania — NIE od wbudowanego seeda.
  // Seed renderowany przed fetchem powodował „flash" nieaktualnych danych przy
  // każdym odświeżeniu (stare wpisy pojawiały się i znikały), a przy okazji
  // wysyłał dane klientów w bundlu JS. Seed żyje już tylko server-side (dev).
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loaded, setLoaded] = useState(false);
  // Stan błędu wczytania: gdy fetchAll padnie, pokazujemy jasny ekran błędu/retry
  // zamiast po cichu renderować nieaktualny seed jako dane produkcyjne.
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const showToast = useToast();

  useEffect(() => {
    let alive = true;
    fetchAll()
      .then((d) => {
        if (!alive) return;
        setVehicles(d.vehicles);
        setCustomers(d.customers);
        setBookings(d.bookings);
        setLoaded(true);
        setLoadError(false); // udany retry czyści ekran błędu
      })
      .catch((e) => {
        // Baza niedostępna / błąd zapytania — nie serwuj cicho seeda, zgłoś błąd.
        console.error("DataProvider: fetchAll failed", e);
        if (alive) setLoadError(true);
      });
    return () => {
      alive = false;
    };
  }, [reloadKey]);

  const maps = useMemo(
    () => ({
      v: new Map(vehicles.map((x) => [x.id, x])),
      c: new Map(customers.map((x) => [x.id, x])),
    }),
    [vehicles, customers],
  );

  // Ekran ładowania do pierwszego fetcha — dzięki temu przy odświeżeniu nie ma
  // żadnego „przebłysku" innych danych. (Po wszystkich hookach, reguły hooków.)
  if (!loaded && !loadError) {
    return <AppSkeleton />;
  }

  // Twardy stan błędu — nie renderuj aplikacji na nieaktualnym seedzie.
  if (loadError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
          Nie udało się pobrać danych z bazy. Aby uniknąć pokazywania nieaktualnych
          informacji, panel został wstrzymany.
        </p>
        <button
          type="button"
          onClick={() => setReloadKey((k) => k + 1)}
          className="rounded-lg bg-[#378ADD] px-4 py-2 text-sm font-medium text-white"
        >
          Spróbuj ponownie
        </button>
      </div>
    );
  }

  const value: Ctx = {
    vehicles,
    customers,
    bookings,
    loaded,
    refresh: async () => {
      const d = await fetchAll();
      setVehicles(d.vehicles);
      setCustomers(d.customers);
      setBookings(d.bookings);
    },
    addBooking: async (b, force = false) => {
      try {
        const nb = await insertBooking(b, force);
        setBookings((prev) => [...prev, nb]);
        return nb;
      } catch (e) {
        console.error("DataProvider: addBooking failed", e);
        showToast(
          "error",
          e instanceof Error && /zaj/i.test(e.message)
            ? "Termin zajęty — wpis nakłada się na istniejący. Wybierz inny termin."
            : "Nie udało się zapisać rezerwacji. Spróbuj ponownie.",
        );
        return null;
      }
    },
    updateBooking: async (id, patch, force = false) => {
      const prevBooking = bookings.find((b) => b.id === id);
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
      const result = await updateBookingDb(id, patch, force);
      if (!result) {
        if (prevBooking) {
          setBookings((prev) => prev.map((b) => (b.id === id ? prevBooking : b)));
        }
        showToast("error", "Nie udało się zapisać zmian. Spróbuj ponownie.");
        return false;
      }
      return true;
    },
    removeBooking: async (id) => {
      const prevBooking = bookings.find((b) => b.id === id);
      setBookings((prev) => prev.filter((x) => x.id !== id));
      try {
        await deleteBookingDb(id);
      } catch (e) {
        console.error("DataProvider: removeBooking failed", e);
        if (prevBooking) setBookings((prev) => [...prev, prevBooking]);
        showToast("error", "Nie udało się usunąć wpisu. Spróbuj ponownie.");
      }
    },
    addCustomer: async (c) => {
      try {
        const nc = await insertCustomer(c);
        setCustomers((prev) => [...prev, nc]);
        return nc;
      } catch (e) {
        console.error("DataProvider: addCustomer failed", e);
        showToast("error", "Nie udało się dodać klienta. Spróbuj ponownie.");
        return null;
      }
    },
    updateCustomer: async (id, patch) => {
      const prevCustomer = customers.find((c) => c.id === id);
      setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
      const result = await updateCustomerDb(id, patch);
      if (!result) {
        if (prevCustomer) {
          setCustomers((prev) => prev.map((c) => (c.id === id ? prevCustomer : c)));
        }
        showToast("error", "Nie udało się zapisać zmian. Spróbuj ponownie.");
        return false;
      }
      return true;
    },
    removeCustomer: async (id) => {
      const prevCustomer = customers.find((c) => c.id === id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      try {
        await deleteCustomerDb(id);
      } catch (e) {
        console.error("DataProvider: removeCustomer failed", e);
        if (prevCustomer) setCustomers((prev) => [...prev, prevCustomer]);
        showToast("error", "Nie udało się usunąć klienta. Spróbuj ponownie.");
      }
    },
    updateVehicle: async (id, patch) => {
      const prevVehicle = vehicles.find((v) => v.id === id);
      setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
      const result = await updateVehicleDb(id, patch);
      if (!result) {
        if (prevVehicle) {
          setVehicles((prev) => prev.map((v) => (v.id === id ? prevVehicle : v)));
        }
        showToast("error", "Nie udało się zapisać zmian pojazdu. Spróbuj ponownie.");
        return false;
      }
      return true;
    },
    addVehicle: async (v) => {
      const nv = await insertVehicleDb(v);
      if (!nv) {
        showToast("error", "Nie udało się dodać pojazdu. Spróbuj ponownie.");
        return null;
      }
      setVehicles((prev) => [...prev, nv]);
      return nv;
    },
    vehicleById: (id) => maps.v.get(id),
    customerById: (id) => (id ? maps.c.get(id) : undefined),
  };

  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>;
}
