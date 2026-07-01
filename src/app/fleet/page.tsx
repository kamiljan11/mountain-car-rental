"use client";

import { useData } from "@/components/DataProvider";
import { fmtDate } from "@/lib/dates";
import { differenceInCalendarDays, parseISO } from "date-fns";

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

export default function FleetPage() {
  const { vehicles } = useData();
  return (
    <div className="p-6">
      <h1 className="mb-1 text-xl font-semibold tracking-tight">Flota</h1>
      <p className="mb-5 text-sm text-zinc-500">
        {vehicles.length} pojazdów. Ostrzeżenie gdy OC lub przegląd wygasa w ciągu 30 dni.
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
