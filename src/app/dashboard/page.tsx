"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { parseISO, differenceInCalendarDays } from "date-fns";
import { useData } from "@/components/DataProvider";
import { fmtDate, toISODate } from "@/lib/dates";
import type { Booking, BookingType } from "@/lib/types";
import NewReservationWizard from "@/components/NewReservationWizard";
import {
  Plus,
  ArrowDownToLine,
  ArrowUpFromLine,
  CircleAlert,
  Car,
  Users,
  CalendarCheck,
  Wallet,
} from "lucide-react";

const TYPE_LABEL: Record<BookingType, string> = {
  reservation: "Rezerwacja",
  block: "Blokada",
  service: "Serwis",
};

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="mb-2 flex items-center gap-2 text-zinc-400">
        <Icon className="size-4" />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-2xl font-semibold tracking-tight text-zinc-900">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-zinc-500">{sub}</div>}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-6 text-center text-sm text-zinc-400">{text}</p>;
}

function BookingRow({
  b,
  vehicleName,
  customerName,
}: {
  b: Booking;
  vehicleName: string;
  customerName: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-zinc-100 py-2.5 last:border-0">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-zinc-900">{vehicleName}</div>
        <div className="truncate text-xs text-zinc-500">{customerName}</div>
      </div>
      <span className="shrink-0 rounded px-1.5 py-0.5 text-xs text-zinc-500">
        {TYPE_LABEL[b.type]}
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const { vehicles, bookings, customers, vehicleById, customerById } = useData();
  const [showWizard, setShowWizard] = useState(false);

  const today = toISODate(new Date());

  const stats = useMemo(() => {
    const live = bookings.filter((b) => b.status !== "cancelled");
    const busyToday = new Set(
      live.filter((b) => b.start <= today && b.end >= today).map((b) => b.vehicleId),
    );
    const thisMonth = today.slice(0, 7);
    const monthReservations = live.filter(
      (b) => b.type === "reservation" && b.start.slice(0, 7) === thisMonth,
    );
    const revenue = monthReservations.reduce((sum, b) => sum + (b.total ?? 0), 0);
    return {
      busyToday: busyToday.size,
      fleetSize: vehicles.length,
      monthReservations: monthReservations.length,
      revenue,
    };
  }, [bookings, vehicles.length, today]);

  const pickups = bookings
    .filter((b) => b.status !== "cancelled" && b.start === today)
    .sort((a, b) => (vehicleById(a.vehicleId)?.name ?? "").localeCompare(vehicleById(b.vehicleId)?.name ?? ""));

  const returns = bookings
    .filter((b) => b.status !== "cancelled" && b.end === today)
    .sort((a, b) => (vehicleById(a.vehicleId)?.name ?? "").localeCompare(vehicleById(b.vehicleId)?.name ?? ""));

  const tentative = [...bookings]
    .filter((b) => b.status === "tentative")
    .sort((a, b) => (a.start < b.start ? -1 : 1));

  const upcoming = [...bookings]
    .filter((b) => {
      if (b.status === "cancelled" || b.start <= today) return false;
      return differenceInCalendarDays(parseISO(b.start), parseISO(today)) <= 7;
    })
    .sort((a, b) => (a.start < b.start ? -1 : 1));

  return (
    <div className="p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="mb-1 text-xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-zinc-500">Przegląd dnia — {fmtDate(today)}.</p>
        </div>
        <button
          onClick={() => setShowWizard(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-3 text-sm font-medium text-white hover:bg-zinc-800"
        >
          <Plus className="size-4" /> Nowa rezerwacja
        </button>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={Car}
          label="Zajęte dziś"
          value={`${stats.busyToday} / ${stats.fleetSize}`}
          sub="pojazdów w użyciu"
        />
        <StatCard
          icon={CalendarCheck}
          label="Rezerwacje w tym miesiącu"
          value={String(stats.monthReservations)}
        />
        <StatCard
          icon={Wallet}
          label="Przychód w tym miesiącu"
          value={`${stats.revenue.toLocaleString("pl-PL")} ISK`}
        />
        <StatCard icon={Users} label="Klienci łącznie" value={String(customers.length)} />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <h2 className="mb-1 text-sm font-semibold text-zinc-900">Dziś — wydania i zwroty</h2>
          <div className="mb-3 flex items-center gap-1.5 text-xs text-zinc-400">
            <ArrowUpFromLine className="size-3.5" /> wydanie
            <span className="mx-1">·</span>
            <ArrowDownToLine className="size-3.5" /> zwrot
          </div>
          {pickups.length === 0 && returns.length === 0 ? (
            <Empty text="Brak wydań i zwrotów dziś." />
          ) : (
            <div>
              {pickups.map((b) => (
                <div key={b.id} className="flex items-center gap-2.5">
                  <ArrowUpFromLine className="size-3.5 shrink-0 text-blue-600" />
                  <div className="flex-1">
                    <BookingRow
                      b={b}
                      vehicleName={vehicleById(b.vehicleId)?.name ?? "—"}
                      customerName={customerById(b.customerId)?.name ?? b.notes ?? "—"}
                    />
                  </div>
                </div>
              ))}
              {returns.map((b) => (
                <div key={b.id} className="flex items-center gap-2.5">
                  <ArrowDownToLine className="size-3.5 shrink-0 text-emerald-600" />
                  <div className="flex-1">
                    <BookingRow
                      b={b}
                      vehicleName={vehicleById(b.vehicleId)?.name ?? "—"}
                      customerName={customerById(b.customerId)?.name ?? b.notes ?? "—"}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-zinc-900">
            <CircleAlert className="size-4 text-amber-500" /> Do potwierdzenia
          </h2>
          {tentative.length === 0 ? (
            <Empty text="Brak rezerwacji czekających na potwierdzenie." />
          ) : (
            tentative.map((b) => (
              <BookingRow
                key={b.id}
                b={b}
                vehicleName={vehicleById(b.vehicleId)?.name ?? "—"}
                customerName={`${customerById(b.customerId)?.name ?? b.notes ?? "—"} · od ${fmtDate(b.start)}`}
              />
            ))
          )}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900">Najbliższe 7 dni</h2>
          <Link
            href="/bookings"
            className="-mr-2 rounded-lg px-2 py-3 text-xs font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
          >
            Zobacz wszystkie rezerwacje →
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <Empty text="Brak rezerwacji rozpoczynających się w najbliższych 7 dniach." />
        ) : (
          upcoming.map((b) => (
            <BookingRow
              key={b.id}
              b={b}
              vehicleName={vehicleById(b.vehicleId)?.name ?? "—"}
              customerName={`${customerById(b.customerId)?.name ?? b.notes ?? "—"} · ${fmtDate(b.start)} → ${fmtDate(b.end)}`}
            />
          ))
        )}
      </div>

      {showWizard && <NewReservationWizard onClose={() => setShowWizard(false)} />}
    </div>
  );
}
