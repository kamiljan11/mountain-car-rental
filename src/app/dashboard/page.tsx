"use client";

import { useState } from "react";
import Link from "next/link";
import { parseISO, differenceInCalendarDays, addDays } from "date-fns";
import { useData } from "@/components/DataProvider";
import { fmtDate, todayISO, toISODate } from "@/lib/dates";
import { isk } from "@/lib/contract";
import { isHiddenVehicleName } from "@/lib/hiddenVehicles";
import type { Booking, BookingType, Vehicle, Customer } from "@/lib/types";
import NewReservationWizard from "@/components/NewReservationWizard";
import SendConfirmationModal from "@/components/SendConfirmationModal";
import {
  Plus,
  ArrowDownToLine,
  ArrowUpFromLine,
  CircleAlert,
  Car,
  Users,
  CalendarCheck,
  Wallet,
  ShieldAlert,
  AlertTriangle,
  Mail,
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
  onClick,
}: {
  b: Booking;
  vehicleName: string;
  customerName: string;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-zinc-900">{vehicleName}</div>
        <div className="truncate text-xs text-zinc-500">{customerName}</div>
      </div>
      <span className="shrink-0 rounded px-1.5 py-0.5 text-xs text-zinc-500">
        {TYPE_LABEL[b.type]}
      </span>
    </>
  );
  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 border-b border-zinc-100 py-2.5 text-left last:border-0 hover:bg-zinc-50"
    >
      {inner}
    </button>
  ) : (
    <div className="flex items-center justify-between gap-3 border-b border-zinc-100 py-2.5 last:border-0">
      {inner}
    </div>
  );
}

// Wydania i zwroty jednego dnia (Dziś / Jutro).
function DayFlows({
  label,
  pickups,
  returns,
  vehicleById,
  customerById,
  onSelect,
}: {
  label: string;
  pickups: Booking[];
  returns: Booking[];
  vehicleById: (id: string) => Vehicle | undefined;
  customerById: (id?: string | null) => Customer | undefined;
  onSelect?: (b: Booking) => void;
}) {
  const empty = pickups.length === 0 && returns.length === 0;
  return (
    <div className="mt-3 first:mt-0">
      <div className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-zinc-400">
        {label}
      </div>
      {empty ? (
        <p className="py-2 text-sm text-zinc-400">Brak wydań i zwrotów.</p>
      ) : (
        <div>
          {pickups.map((b) => (
            <div key={b.id} className="flex items-center gap-2.5">
              <ArrowUpFromLine className="size-3.5 shrink-0 text-blue-600" />
              <div className="flex-1">
                <BookingRow
                  b={b}
                  vehicleName={`${vehicleById(b.vehicleId)?.name ?? "—"}${b.pickupTime ? ` · ${b.pickupTime}` : ""}`}
                  customerName={customerById(b.customerId)?.name ?? b.notes ?? "—"}
                  onClick={onSelect ? () => onSelect(b) : undefined}
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
                  vehicleName={`${vehicleById(b.vehicleId)?.name ?? "—"}${b.returnTime ? ` · ${b.returnTime}` : ""}`}
                  customerName={customerById(b.customerId)?.name ?? b.notes ?? "—"}
                  onClick={onSelect ? () => onSelect(b) : undefined}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { vehicles, bookings, customers, vehicleById, customerById, updateBooking } = useData();
  const [showWizard, setShowWizard] = useState(false);
  // Klik wpisu na dashboardzie otwiera edycję (jak w Rezerwacjach).
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  // Szybkie „Potwierdź" w kaflu Do potwierdzenia → okno wysyłki maila potwierdzenia
  // (po wysłaniu serwer podnosi status wstępna→potwierdzona i wpis znika z kafla).
  const [confirmEmailId, setConfirmEmailId] = useState<string | null>(null);

  const today = todayISO(); // „dzisiaj" po islandzku (UTC)
  const tomorrow = toISODate(addDays(parseISO(today), 1));

  // Pajero i Vito ukryte z pulpitu (patrz hiddenVehicles.ts). Filtr wyłącznie
  // wizualny — rezerwacje tych aut nadal są w kalendarzu. Bez ręcznego useMemo:
  // React Compiler (Next 16) sam memoizuje te wyliczenia render-owe.
  const hiddenVehicleIds = new Set(
    vehicles.filter((v) => isHiddenVehicleName(v.name)).map((v) => v.id),
  );
  const visibleVehicles = vehicles.filter((v) => !hiddenVehicleIds.has(v.id));

  const live = bookings.filter(
    (b) => b.status !== "cancelled" && !hiddenVehicleIds.has(b.vehicleId),
  );
  const thisMonth = today.slice(0, 7);
  const monthReservations = live.filter(
    (b) => b.type === "reservation" && b.start.slice(0, 7) === thisMonth,
  );
  // Przychód: tylko realne najmy (bez spekulacyjnych „wstępnych"). UWAGA: większość
  // zaimportowanych rezerwacji nie ma wpisanej ceny (import z RentHelp bez cen),
  // więc pokazujemy ile z nich jest faktycznie wycenionych — inaczej ta liczba
  // wprowadza w błąd (sumuje tylko te z ceną).
  const revenueRes = monthReservations.filter((b) => b.status !== "tentative");
  const stats = {
    busyToday: new Set(
      live.filter((b) => b.start <= today && b.end >= today).map((b) => b.vehicleId),
    ).size,
    monthReservations: monthReservations.length,
    revenue: revenueRes.reduce((sum, b) => sum + (b.total ?? 0), 0),
    pricedCount: revenueRes.filter((b) => b.total != null).length,
    revenueResCount: revenueRes.length,
  };

  const byVehName = (a: Booking, b: Booking) =>
    (vehicleById(a.vehicleId)?.name ?? "").localeCompare(vehicleById(b.vehicleId)?.name ?? "");

  const flowsFor = (date: string) => ({
    pickups: bookings
      .filter((b) => b.status !== "cancelled" && !hiddenVehicleIds.has(b.vehicleId) && b.start === date)
      .sort(byVehName),
    returns: bookings
      .filter((b) => b.status !== "cancelled" && !hiddenVehicleIds.has(b.vehicleId) && b.end === date)
      .sort(byVehName),
  });
  const todayFlows = flowsFor(today);
  const tomorrowFlows = flowsFor(tomorrow);

  const tentative = [...bookings]
    .filter((b) => b.status === "tentative" && !hiddenVehicleIds.has(b.vehicleId))
    .sort((a, b) => (a.start < b.start ? -1 : 1));

  const upcoming = [...bookings]
    .filter((b) => {
      if (b.status === "cancelled" || hiddenVehicleIds.has(b.vehicleId) || b.start <= today)
        return false;
      return differenceInCalendarDays(parseISO(b.start), parseISO(today)) <= 7;
    })
    .sort((a, b) => (a.start < b.start ? -1 : 1));

  // OC/AC/przegląd wygasające ≤30 dni lub już wygasłe — nie wolno wydać auta bez OC.
  const expiring: { vehicle: string; kind: string; date: string; days: number }[] = [];
  for (const v of visibleVehicles) {
    (
      [
        ["OC", v.ocExpiry],
        ["AC", v.acExpiry],
        ["Przegląd", v.inspectionExpiry],
      ] as const
    ).forEach(([kind, date]) => {
      if (!date) return;
      const days = differenceInCalendarDays(parseISO(date), parseISO(today));
      if (days <= 30) expiring.push({ vehicle: v.name, kind, date, days });
    });
  }
  expiring.sort((a, b) => a.days - b.days);

  // Zaległe zwroty: najmy, których dzień zwrotu (end) już minął, a wpis wciąż jest
  // „na drodze" (status inny niż completed/cancelled). Blokady i serwisy pomijamy —
  // interesują nas tylko realne rezerwacje z autem u klienta. `live` już odsiewa
  // anulowane i ukryte pojazdy. Bez ręcznego useMemo (React Compiler sam memoizuje).
  const overdue = live
    .filter((b) => b.type === "reservation" && b.status !== "completed" && b.end < today)
    .map((b) => ({ b, days: differenceInCalendarDays(parseISO(today), parseISO(b.end)) }))
    .sort((a, b) => b.days - a.days);

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
          value={`${stats.busyToday} / ${visibleVehicles.length}`}
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
          value={isk(stats.revenue)}
          sub={
            stats.pricedCount < stats.revenueResCount
              ? `tylko ${stats.pricedCount} z ${stats.revenueResCount} rezerwacji ma wpisaną cenę`
              : undefined
          }
        />
        <StatCard icon={Users} label="Klienci łącznie" value={String(customers.length)} />
      </div>

      {overdue.length > 0 && (
        <div className="mb-5 rounded-xl border border-red-300 bg-red-50/70 p-4">
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-red-700">
            <AlertTriangle className="size-4 text-red-600" /> Zaległe zwroty
          </h2>
          <div className="space-y-1.5">
            {overdue.map(({ b, days }) => (
              <div
                key={b.id}
                className="flex items-center justify-between gap-3 border-b border-red-100 py-2 last:border-0"
              >
                <button
                  type="button"
                  onClick={() => setEditingBooking(b)}
                  className="min-w-0 flex-1 rounded-md text-left hover:opacity-70"
                >
                  <div className="truncate text-sm font-medium text-zinc-900">
                    {vehicleById(b.vehicleId)?.name ?? "—"}
                  </div>
                  <div className="truncate text-xs text-zinc-500">
                    {customerById(b.customerId)?.name ?? b.notes ?? "—"} · zwrot {fmtDate(b.end)}
                  </div>
                </button>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">
                    {days === 1 ? "1 dzień po terminie" : `${days} dni po terminie`}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateBooking(b.id, { status: "completed" })}
                    className="rounded-lg bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-zinc-800"
                  >
                    Oznacz jako zwrócone
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <h2 className="mb-1 text-sm font-semibold text-zinc-900">Wydania i zwroty</h2>
          <div className="mb-1 flex items-center gap-1.5 text-xs text-zinc-400">
            <ArrowUpFromLine className="size-3.5" /> wydanie
            <span className="mx-1">·</span>
            <ArrowDownToLine className="size-3.5" /> zwrot
          </div>
          <DayFlows
            label="Dziś"
            pickups={todayFlows.pickups}
            returns={todayFlows.returns}
            vehicleById={vehicleById}
            customerById={customerById}
            onSelect={setEditingBooking}
          />
          <DayFlows
            label={`Jutro · ${fmtDate(tomorrow)}`}
            pickups={tomorrowFlows.pickups}
            returns={tomorrowFlows.returns}
            vehicleById={vehicleById}
            customerById={customerById}
            onSelect={setEditingBooking}
          />
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-zinc-900">
            <CircleAlert className="size-4 text-amber-500" /> Do potwierdzenia
          </h2>
          {tentative.length === 0 ? (
            <Empty text="Brak rezerwacji czekających na potwierdzenie." />
          ) : (
            tentative.map((b) => (
              <div key={b.id} className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <BookingRow
                    b={b}
                    vehicleName={vehicleById(b.vehicleId)?.name ?? "—"}
                    customerName={`${customerById(b.customerId)?.name ?? b.notes ?? "—"} · od ${fmtDate(b.start)}`}
                    onClick={() => setEditingBooking(b)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmEmailId(b.id)}
                  title="Wyślij potwierdzenie e-mail"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-zinc-800"
                >
                  <Mail className="size-3.5" /> Potwierdź
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {expiring.length > 0 && (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-zinc-900">
            <ShieldAlert className="size-4 text-amber-500" /> Ubezpieczenia i przeglądy — uwaga
          </h2>
          <div className="space-y-1.5">
            {expiring.map((e, i) => (
              <div key={i} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-zinc-700">
                  <strong>{e.vehicle}</strong> · {e.kind}
                </span>
                <span
                  className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-medium ${
                    e.days < 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {e.days < 0
                    ? `wygasło ${fmtDate(e.date)}`
                    : e.days === 0
                      ? "wygasa dziś"
                      : `za ${e.days} dni · ${fmtDate(e.date)}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

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
              onClick={() => setEditingBooking(b)}
            />
          ))
        )}
      </div>

      {showWizard && <NewReservationWizard onClose={() => setShowWizard(false)} />}
      {editingBooking && (
        <NewReservationWizard
          editBooking={editingBooking}
          onClose={() => setEditingBooking(null)}
        />
      )}
      {confirmEmailId && (
        <SendConfirmationModal
          bookingId={confirmEmailId}
          onClose={() => setConfirmEmailId(null)}
        />
      )}
    </div>
  );
}
