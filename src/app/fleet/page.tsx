"use client";

import { useMemo } from "react";
import { useData } from "@/components/DataProvider";
import { PL_MONTHS, fmtDate } from "@/lib/dates";
import { differenceInCalendarDays, parseISO } from "date-fns";
import type { Booking } from "@/lib/types";

function Expiry({ iso }: { iso?: string }) {
  if (!iso) return <span className="text-zinc-400">—</span>;
  const d = differenceInCalendarDays(parseISO(iso), new Date());
  const cls =
    d < 0
      ? "bg-red-100 text-red-700"
      : d < 30
        ? "bg-amber-100 text-amber-700"
        : "bg-zinc-100 text-zinc-600";
  const txt = d < 0 ? "po terminie" : d < 30 ? `za ${d} dni` : fmtDate(iso);
  return <span className={`rounded px-1.5 py-0.5 text-xs ${cls}`}>{txt}</span>;
}

function monthUtilization(vehicleId: string, bookings: Booking[], monthStart: Date, monthEnd: Date) {
  const daysInMonth = monthEnd.getDate();
  const occupied = new Array(daysInMonth).fill(false);
  for (const b of bookings) {
    if (b.vehicleId !== vehicleId || b.status === "cancelled") continue;
    const s = parseISO(b.start);
    const e = parseISO(b.end);
    if (e < monthStart || s > monthEnd) continue;
    const from = s < monthStart ? 1 : s.getDate();
    const to = e > monthEnd ? daysInMonth : e.getDate();
    for (let d = from; d <= to; d++) occupied[d - 1] = true;
  }
  return Math.round((occupied.filter(Boolean).length / daysInMonth) * 100);
}

function UtilizationRing({ percent }: { percent: number }) {
  const size = 40;
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - percent / 100);
  const color = percent >= 70 ? "#059669" : percent >= 40 ? "#d97706" : "#a1a1aa";
  return (
    <div className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f4f4f5" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-[10px] font-semibold text-zinc-700">{percent}%</span>
    </div>
  );
}

export default function FleetPage() {
  const { vehicles, bookings } = useData();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const utilization = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of vehicles) map.set(v.id, monthUtilization(v.id, bookings, monthStart, monthEnd));
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicles, bookings]);

  return (
    <div className="p-6">
      <h1 className="mb-1 text-xl font-semibold tracking-tight">Flota</h1>
      <p className="mb-5 text-sm text-zinc-500">
        {vehicles.length} pojazdów. Ostrzeżenie gdy OC lub przegląd wygasa w ciągu 30 dni. Wykorzystanie
        liczone dla {PL_MONTHS[now.getMonth()]} {now.getFullYear()}.
      </p>
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Pojazd</th>
              <th className="px-4 py-3 font-medium">Rok</th>
              <th className="px-4 py-3 font-medium">Przebieg</th>
              <th className="px-4 py-3 font-medium">Stawka/doba</th>
              <th className="px-4 py-3 font-medium">OC</th>
              <th className="px-4 py-3 font-medium">Przegląd</th>
              <th className="px-4 py-3 font-medium">Wykorzystanie</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {vehicles.map((v) => (
              <tr key={v.id} className="hover:bg-zinc-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ background: v.color }}
                    />
                    <div>
                      <div className="font-medium text-zinc-900">{v.name}</div>
                      <div className="text-xs text-zinc-500">{v.plate}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-zinc-600">{v.year ?? "—"}</td>
                <td className="px-4 py-3 text-zinc-600">
                  {v.mileage ? `${v.mileage.toLocaleString("pl-PL")} km` : "—"}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {v.dailyRate != null ? `${v.dailyRate.toLocaleString("pl-PL")} ISK` : "—"}
                </td>
                <td className="px-4 py-3">
                  <Expiry iso={v.ocExpiry} />
                </td>
                <td className="px-4 py-3">
                  <Expiry iso={v.inspectionExpiry} />
                </td>
                <td className="px-4 py-3">
                  <UtilizationRing percent={utilization.get(v.id) ?? 0} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
