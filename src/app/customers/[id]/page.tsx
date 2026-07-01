"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { customers, bookings, vehicleById } from "@/lib/data";
import { contractsForCustomer, type Contract } from "@/lib/contract";
import { fmtDate } from "@/lib/dates";
import { ArrowLeft, FileText } from "lucide-react";

const STATUS = {
  sent: { label: "wysłana", cls: "bg-blue-100 text-blue-700" },
  signed: { label: "podpisana", cls: "bg-green-100 text-green-700" },
  draft: { label: "szkic", cls: "bg-zinc-100 text-zinc-600" },
} as const;

export default function CustomerProfile() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const customer = customers.find((c) => c.id === id);
  const custBookings = bookings.filter((b) => b.customerId === id);
  const [contracts, setContracts] = useState<Contract[]>([]);

  useEffect(() => {
    setContracts(contractsForCustomer(id));
  }, [id]);

  if (!customer) {
    return (
      <div className="p-6">
        <p className="mb-2 text-sm text-zinc-500">Nie znaleziono klienta.</p>
        <Link href="/customers" className="text-sm text-blue-600 underline">← Klienci</Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Link
        href="/customers"
        className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800"
      >
        <ArrowLeft className="size-4" /> Klienci
      </Link>
      <h1 className="text-xl font-semibold tracking-tight">{customer.name}</h1>
      <div className="mt-1 text-sm text-zinc-500">
        {customer.phone ?? "—"} · {customer.email ?? "—"} · źródło: {customer.source}
      </div>

      <h2 className="mb-2 mt-8 text-sm font-semibold text-zinc-700">
        Podpięte umowy ({contracts.length})
      </h2>
      {contracts.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-200 px-4 py-6 text-center text-sm text-zinc-400">
          Brak umów. Wygeneruj w zakładce{" "}
          <Link href="/contracts" className="underline">Kontrakt</Link>.
        </p>
      ) : (
        <div className="space-y-2">
          {contracts.map((k) => (
            <details key={k.id} className="rounded-xl border border-zinc-200 bg-white">
              <summary className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm">
                <FileText className="size-4 text-zinc-400" />
                <span className="font-medium text-zinc-900">{k.number}</span>
                <span className="text-zinc-500">{k.templateName}</span>
                <span className={`ml-auto rounded px-1.5 py-0.5 text-xs ${STATUS[k.status].cls}`}>
                  {STATUS[k.status].label}
                </span>
                <span className="text-xs text-zinc-400">{fmtDate(k.createdAt.slice(0, 10))}</span>
              </summary>
              <pre className="whitespace-pre-wrap border-t border-zinc-100 px-4 py-3 font-sans text-[12px] leading-relaxed text-zinc-700">
                {k.content}
              </pre>
            </details>
          ))}
        </div>
      )}

      <h2 className="mb-2 mt-8 text-sm font-semibold text-zinc-700">
        Rezerwacje ({custBookings.length})
      </h2>
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-zinc-100">
            {custBookings.length === 0 ? (
              <tr>
                <td className="px-4 py-3 text-zinc-400">Brak rezerwacji.</td>
              </tr>
            ) : (
              custBookings.map((b) => (
                <tr key={b.id}>
                  <td className="px-4 py-3 font-medium text-zinc-900">{vehicleById(b.vehicleId)?.name}</td>
                  <td className="px-4 py-3 text-zinc-600">{fmtDate(b.start)} — {fmtDate(b.end)}</td>
                  <td className="px-4 py-3 text-zinc-600">{b.total != null ? `${b.total} zł` : "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
