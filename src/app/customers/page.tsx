"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useData } from "@/components/DataProvider";
import CustomerFormModal from "@/components/CustomerFormModal";
import { Plus, ShieldAlert } from "lucide-react";

export default function CustomersPage() {
  const { customers, bookings, addCustomer } = useData();
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const count = (id: string) => bookings.filter((b) => b.customerId === id).length;
  return (
    <div className="p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="mb-1 text-xl font-semibold tracking-tight">Klienci</h1>
          <p className="text-sm text-zinc-500">
            {customers.length} klientów. Kliknij, aby otworzyć profil.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          <Plus className="size-4" /> Nowy klient
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Klient</th>
              <th className="px-4 py-3 font-medium">Telefon</th>
              <th className="px-4 py-3 font-medium">E-mail</th>
              <th className="px-4 py-3 font-medium">Źródło</th>
              <th className="px-4 py-3 font-medium">Rezerwacje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-zinc-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/customers/${c.id}`}
                    className="inline-flex items-center gap-1.5 font-medium text-zinc-900 hover:underline"
                  >
                    {c.name}
                    {c.suspect && (
                      <span title="Oznaczony jako podejrzany">
                        <ShieldAlert className="size-3.5 text-red-500" />
                      </span>
                    )}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-600">{c.phone ?? "—"}</td>
                <td className="px-4 py-3 text-zinc-600">{c.email ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600">{c.source}</span>
                </td>
                <td className="px-4 py-3 text-zinc-600">{count(c.id)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <CustomerFormModal
          title="Nowy klient"
          submitLabel="Dodaj klienta"
          onClose={() => setShowAdd(false)}
          onSubmit={async (patch) => {
            const c = await addCustomer(patch);
            setShowAdd(false);
            router.push(`/customers/${c.id}`);
          }}
        />
      )}
    </div>
  );
}
