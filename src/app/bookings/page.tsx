"use client";

import { useState } from "react";
import { useData } from "@/components/DataProvider";
import { fmtDate } from "@/lib/dates";
import { differenceInCalendarDays, parseISO } from "date-fns";
import type { BookingType, BookingStatus } from "@/lib/types";
import NewReservationWizard from "@/components/NewReservationWizard";
import { Plus } from "lucide-react";

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

export default function BookingsPage() {
  const { bookings, vehicleById, customerById } = useData();
  const rows = [...bookings].sort((a, b) => (a.start < b.start ? 1 : -1));
  const [showWizard, setShowWizard] = useState(false);
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
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          <Plus className="size-4" /> Nowa rezerwacja
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Pojazd</th>
              <th className="px-4 py-3 font-medium">Klient / opis</th>
              <th className="px-4 py-3 font-medium">Typ</th>
              <th className="px-4 py-3 font-medium">Od</th>
              <th className="px-4 py-3 font-medium">Do</th>
              <th className="px-4 py-3 font-medium">Dni</th>
              <th className="px-4 py-3 font-medium">Kwota</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map((b) => {
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
                  <td className="px-4 py-3 text-zinc-600">
                    {b.total != null ? `${b.total.toLocaleString("pl-PL")} ISK` : "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{STATUS_LABEL[b.status]}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showWizard && <NewReservationWizard onClose={() => setShowWizard(false)} />}
    </div>
  );
}
