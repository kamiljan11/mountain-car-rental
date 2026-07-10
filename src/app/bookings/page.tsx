"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useData } from "@/components/DataProvider";
import { fmtDate, monthLabel, nowIceland } from "@/lib/dates";
import { isk } from "@/lib/contract";
import { useSort } from "@/lib/useSort";
import SortableTh from "@/components/SortableTh";
import { differenceInCalendarDays, parseISO } from "date-fns";
import type { Booking, BookingType, BookingStatus } from "@/lib/types";
import NewReservationWizard from "@/components/NewReservationWizard";
import { Plus, X, Pencil, ChevronLeft, ChevronRight } from "lucide-react";

const TYPE_LABEL: Record<BookingType, string> = {
  reservation: "Rezerwacja",
  block: "Blokada",
  service: "Serwis",
};
const TYPE_CLS: Record<BookingType, string> = {
  reservation: "bg-blue-100 text-blue-700",
  block: "bg-amber-100 text-amber-700",
  service: "bg-zinc-200 text-zinc-700",
};
const STATUS_LABEL: Record<BookingStatus, string> = {
  tentative: "wstępna",
  confirmed: "potwierdzona",
  active: "w trakcie",
  completed: "zakończona",
  cancelled: "anulowana",
};

type MonthKey = { y: number; m: number };

function overlapsMonth(b: Booking, { y, m }: MonthKey) {
  const monthStart = new Date(y, m, 1);
  const monthEnd = new Date(y, m + 1, 0, 23, 59, 59, 999);
  return parseISO(b.end) >= monthStart && parseISO(b.start) <= monthEnd;
}

function BookingsContent() {
  const { bookings, vehicleById, customerById } = useData();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId");
  const filterCustomer = customerId ? customerById(customerId) : undefined;
  const [showWizard, setShowWizard] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [monthFilter, setMonthFilter] = useState<MonthKey | null>(null);

  const today = nowIceland();
  const shownMonth = monthFilter ?? { y: today.getFullYear(), m: today.getMonth() };
  const moveMonth = (delta: number) => {
    setMonthFilter((prev) => {
      const base = prev ?? { y: today.getFullYear(), m: today.getMonth() };
      const d = new Date(base.y, base.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  };

  const filtered = bookings
    .filter((b) => !customerId || b.customerId === customerId)
    .filter((b) => !monthFilter || overlapsMonth(b, monthFilter));

  const { sorted: rows, sortKey, sortDir, toggleSort } = useSort(
    filtered,
    {
      vehicle: (b) => vehicleById(b.vehicleId)?.name ?? "",
      customer: (b) => customerById(b.customerId)?.name ?? b.notes ?? "",
      type: (b) => TYPE_LABEL[b.type],
      start: (b) => b.start,
      end: (b) => b.end,
      days: (b) => differenceInCalendarDays(parseISO(b.end), parseISO(b.start)),
      total: (b) => b.total ?? -1,
      status: (b) => STATUS_LABEL[b.status],
    },
    "start",
    "desc",
  );

  return (
    <div className="p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="mb-1 text-xl font-semibold tracking-tight">Rezerwacje</h1>
          <p className="text-sm text-zinc-500">
            Wszystkie wpisy — rezerwacje, blokady i serwis w jednym miejscu ({rows.length}).
          </p>
        </div>
        <button
          onClick={() => setShowWizard(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-3 text-sm font-medium text-white hover:bg-zinc-800"
        >
          <Plus className="size-4" /> Nowa rezerwacja
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setMonthFilter(null)}
          className={`rounded-lg border px-3 py-3 text-sm font-medium sm:py-2 ${
            monthFilter === null
              ? "border-zinc-900 bg-zinc-900 text-white"
              : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
          }`}
        >
          Wszystkie miesiące
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={() => moveMonth(-1)}
            aria-label="Poprzedni miesiąc"
            className="grid size-11 shrink-0 place-items-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 sm:size-9"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={() => setMonthFilter(shownMonth)}
            className={`min-w-[9.5rem] rounded-lg border px-3 py-3 text-center text-sm font-medium capitalize sm:py-2 ${
              monthFilter
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            {monthLabel(shownMonth.y, shownMonth.m)}
          </button>
          <button
            onClick={() => moveMonth(1)}
            aria-label="Następny miesiąc"
            className="grid size-11 shrink-0 place-items-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 sm:size-9"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {customerId && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
          <span>
            Filtr: rezerwacje klienta <strong>{filterCustomer?.name ?? customerId}</strong>
          </span>
          <Link href="/bookings" className="inline-flex items-center gap-1 font-medium hover:underline">
            <X className="size-3.5" /> Wyczyść filtr
          </Link>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <SortableTh label="Pojazd" sortKey="vehicle" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Klient / opis" sortKey="customer" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Typ" sortKey="type" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Od" sortKey="start" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Do" sortKey="end" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Dni" sortKey="days" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Kwota" sortKey="total" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Status" sortKey="status" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-zinc-400">
                  Brak rezerwacji spełniających kryteria.
                </td>
              </tr>
            ) : (
              rows.map((b) => {
                const days =
                  differenceInCalendarDays(parseISO(b.end), parseISO(b.start)) + 1;
                return (
                  <tr key={b.id} className="hover:bg-zinc-50">
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {vehicleById(b.vehicleId)?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {customerById(b.customerId)?.name ?? b.notes ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-1.5 py-0.5 text-xs ${TYPE_CLS[b.type]}`}>
                        {TYPE_LABEL[b.type]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{fmtDate(b.start)}</td>
                    <td className="px-4 py-3 text-zinc-600">{fmtDate(b.end)}</td>
                    <td className="px-4 py-3 text-zinc-600">{days}</td>
                    <td className="px-4 py-3 text-zinc-600">{isk(b.total)}</td>
                    <td className="px-4 py-3 text-zinc-500">{STATUS_LABEL[b.status]}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setEditingBooking(b)}
                        aria-label="Edytuj"
                        className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                      >
                        <Pencil className="size-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showWizard && <NewReservationWizard onClose={() => setShowWizard(false)} />}
      {editingBooking && (
        <NewReservationWizard
          editBooking={editingBooking}
          onClose={() => setEditingBooking(null)}
        />
      )}
    </div>
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-zinc-400">Ładowanie…</div>}>
      <BookingsContent />
    </Suspense>
  );
}
