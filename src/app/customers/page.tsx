"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useData } from "@/components/DataProvider";
import CustomerFormModal from "@/components/CustomerFormModal";
import { insertCustomerDocumentAction as insertCustomerDocument } from "@/lib/actions";
import { DOC_TYPES } from "@/lib/types";
import { useSort } from "@/lib/useSort";
import SortableTh from "@/components/SortableTh";
import { matchesQuery } from "@/lib/search";
import { Plus, ShieldAlert, Search, X } from "lucide-react";

export default function CustomersPage() {
  const { customers, vehicles, bookings, addCustomer } = useData();
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [query, setQuery] = useState("");
  const count = (id: string) => bookings.filter((b) => b.customerId === id).length;

  // Tekst pojazdów (nazwa + rejestracja) z rezerwacji danego klienta — żeby
  // szukać klienta też po aucie/rejestracji, którymi jeździł.
  const custVehicleText = useMemo(() => {
    const vById = new Map(vehicles.map((v) => [v.id, v]));
    const m = new Map<string, string>();
    for (const b of bookings) {
      if (!b.customerId) continue;
      const v = vById.get(b.vehicleId);
      if (!v) continue;
      m.set(b.customerId, `${m.get(b.customerId) ?? ""} ${v.name} ${v.plate ?? ""}`);
    }
    return m;
  }, [bookings, vehicles]);

  const filtered = useMemo(() => {
    if (!query.trim()) return customers;
    return customers.filter((c) =>
      matchesQuery(
        [
          c.name,
          c.phone,
          c.email,
          c.source,
          c.id_number,
          c.license,
          c.address,
          c.companyName,
          c.nip,
          c.notes,
          custVehicleText.get(c.id),
        ]
          .filter(Boolean)
          .join(" "),
        query,
      ),
    );
  }, [customers, query, custVehicleText]);

  const { sorted: rows, sortKey, sortDir, toggleSort } = useSort(
    filtered,
    {
      name: (c) => c.name,
      phone: (c) => c.phone ?? "",
      email: (c) => c.email ?? "",
      source: (c) => c.source ?? "",
      bookings: (c) => count(c.id),
    },
    "name",
  );

  return (
    <div className="p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="mb-1 text-xl font-semibold tracking-tight">Klienci</h1>
          <p className="text-sm text-zinc-500">
            {query.trim()
              ? `${filtered.length} z ${customers.length} klientów`
              : `${customers.length} klientów. Kliknij, aby otworzyć profil.`}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-3 text-sm font-medium text-white hover:bg-zinc-800"
        >
          <Plus className="size-4" /> Nowy klient
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Szukaj: imię, nazwisko, telefon, e-mail, pojazd, rejestracja, nr dokumentu…"
          className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-9 pr-9 text-sm outline-none transition-colors focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            aria-label="Wyczyść"
            className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <SortableTh label="Klient" sortKey="name" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Telefon" sortKey="phone" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="E-mail" sortKey="email" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Źródło" sortKey="source" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Rezerwacje" sortKey="bookings" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map((c) => (
              <tr key={c.id} className="hover:bg-zinc-50">
                <td className="p-0">
                  <Link
                    href={`/customers/${c.id}`}
                    className="flex items-center gap-1.5 px-4 py-3 font-medium text-zinc-900 hover:underline"
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
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-zinc-400">
                  Brak klientów pasujących do „{query}”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <CustomerFormModal
          title="Nowy klient"
          submitLabel="Dodaj klienta"
          onClose={() => setShowAdd(false)}
          onSubmit={async (patch, idDocNumber) => {
            const c = await addCustomer(patch);
            if (!c) return;
            if (idDocNumber) {
              await insertCustomerDocument({
                customerId: c.id,
                docType: DOC_TYPES[0],
                docNumber: idDocNumber,
              });
            }
            setShowAdd(false);
            router.push(`/customers/${c.id}`);
          }}
        />
      )}
    </div>
  );
}
