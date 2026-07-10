"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useData } from "@/components/DataProvider";
import { useToast } from "@/components/Toast";
import { matchesQuery } from "@/lib/search";
import { CHECKLIST, CHECKLIST_COUNT, CHECKLIST_ITEMS } from "@/lib/checklist";
import RevolutPay from "@/components/RevolutPay";
import {
  fetchCustomerChecklistAction as fetchChecklist,
  setChecklistItemAction as setItem,
} from "@/lib/actions";
import {
  Search,
  X,
  Check,
  Car,
  Phone,
  FileSignature,
  User,
  RotateCcw,
} from "lucide-react";

export default function ChecklistPage() {
  const { customers, vehicles, bookings } = useData();
  const showToast = useToast();

  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [state, setState] = useState<Record<string, boolean>>({});
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  const vById = useMemo(() => new Map(vehicles.map((v) => [v.id, v])), [vehicles]);

  // Tekst pojazdów klienta do wyszukiwarki (jak w /customers).
  const custVehicleText = useMemo(() => {
    const m = new Map<string, string>();
    for (const b of bookings) {
      if (!b.customerId) continue;
      const v = vById.get(b.vehicleId);
      if (!v) continue;
      m.set(b.customerId, `${m.get(b.customerId) ?? ""} ${v.name} ${v.plate ?? ""}`);
    }
    return m;
  }, [bookings, vById]);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return customers
      .filter((c) =>
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
            custVehicleText.get(c.id),
          ]
            .filter(Boolean)
            .join(" "),
          q,
        ),
      )
      .slice(0, 12);
  }, [customers, query, custVehicleText]);

  const selected = selectedId
    ? customers.find((c) => c.id === selectedId) ?? null
    : null;

  // deep-link ?customerId= (jednorazowa synchronizacja z URL przy wejściu)
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("customerId");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (id) setSelectedId(id);
  }, []);

  // stan checklisty pobierany po wyborze klienta — setState tylko w callbacku,
  // a „ładowanie" liczymy pochodnie (loadedFor), żeby nie pokazywać cudzych zaznaczeń.
  useEffect(() => {
    if (!selectedId) return;
    fetchChecklist(selectedId).then((s) => {
      setState(s);
      setLoadedFor(selectedId);
    });
  }, [selectedId]);

  const loading = !!selectedId && loadedFor !== selectedId;
  const view = loading ? {} : state;

  const custBooking = useMemo(() => {
    if (!selectedId) return null;
    const bs = bookings
      .filter((b) => b.customerId === selectedId)
      .sort((a, b) => (a.start < b.start ? 1 : -1));
    return bs[0] ?? null;
  }, [selectedId, bookings]);
  const custVehicle = custBooking ? vById.get(custBooking.vehicleId) ?? null : null;

  const doneCount = CHECKLIST_ITEMS.filter((i) => view[i.key]).length;
  const allDone = doneCount === CHECKLIST_COUNT;

  const pick = (id: string) => {
    setSelectedId(id);
    setQuery("");
  };

  const toggle = async (key: string) => {
    if (!selectedId) return;
    const next = !state[key];
    setState((s) => ({ ...s, [key]: next })); // optymistycznie
    const ok = await setItem(selectedId, key, next);
    if (!ok) {
      setState((s) => ({ ...s, [key]: !next })); // rollback
      showToast("error", "Nie udało się zapisać. Spróbuj ponownie.");
    }
  };

  const resetAll = async () => {
    if (!selectedId) return;
    const prev = state;
    setState({});
    const oks = await Promise.all(
      CHECKLIST_ITEMS.filter((i) => prev[i.key]).map((i) =>
        setItem(selectedId, i.key, false),
      ),
    );
    if (oks.some((r) => !r)) {
      setState(prev);
      showToast("error", "Nie udało się wyczyścić. Spróbuj ponownie.");
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6">
      <div className="mb-4">
        <h1 className="text-xl font-semibold tracking-tight">Checklista wydania</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Wyszukaj klienta i odhaczaj punkty — stan zapisuje się dla tego klienta.
        </p>
      </div>

      {/* Szeroka wyszukiwarka klientów */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Szukaj klienta: imię, nazwisko, telefon, pojazd, rejestracja…"
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

      {/* Wyniki wyszukiwania */}
      {query.trim() && (
        <div className="mt-2 overflow-hidden rounded-lg border border-zinc-200 bg-white">
          {results.length === 0 ? (
            <p className="px-4 py-4 text-sm text-zinc-400">
              Brak klientów pasujących do „{query}”.
            </p>
          ) : (
            results.map((c) => (
              <button
                key={c.id}
                onClick={() => pick(c.id)}
                className="flex w-full items-center justify-between gap-3 border-b border-zinc-100 px-4 py-3 text-left last:border-0 hover:bg-zinc-50"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-zinc-900">
                    {c.name}
                  </span>
                  <span className="block truncate text-xs text-zinc-500">
                    {c.phone ?? c.email ?? "—"}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-zinc-400">wybierz</span>
              </button>
            ))
          )}
        </div>
      )}

      {/* Checklista wybranego klienta */}
      {selected ? (
        <div className="mt-4">
          {/* Nagłówek klienta */}
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-base font-semibold text-zinc-900">
                  <User className="size-4 text-zinc-400" />
                  <span className="truncate">{selected.name}</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                  {selected.phone && (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="size-3.5" /> {selected.phone}
                    </span>
                  )}
                  {custVehicle && (
                    <span className="inline-flex items-center gap-1">
                      <Car className="size-3.5" /> {custVehicle.name}
                      {custVehicle.plate ? ` · ${custVehicle.plate}` : ""}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                aria-label="Zmień klienta"
                className="grid size-9 shrink-0 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Postęp */}
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className={allDone ? "font-medium text-emerald-600" : "text-zinc-500"}>
                  {allDone ? "Wszystko odhaczone ✓" : `${doneCount} / ${CHECKLIST_COUNT} odhaczone`}
                </span>
                {doneCount > 0 && (
                  <button
                    onClick={resetAll}
                    className="inline-flex items-center gap-1 text-zinc-400 hover:text-zinc-600"
                  >
                    <RotateCcw className="size-3.5" /> Odznacz wszystko
                  </button>
                )}
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                <div
                  className={`h-full rounded-full transition-all ${allDone ? "bg-emerald-500" : "bg-zinc-900"}`}
                  style={{ width: `${(doneCount / CHECKLIST_COUNT) * 100}%` }}
                />
              </div>
            </div>

            {/* Skróty */}
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={`/contracts?customerId=${selected.id}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
              >
                <FileSignature className="size-3.5" /> Przygotuj umowę
              </Link>
              <Link
                href={`/customers/${selected.id}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
              >
                <User className="size-3.5" /> Profil klienta
              </Link>
            </div>
          </div>

          {/* Płatność Revolut — łatwo podać klientowi przy wydaniu */}
          <div className="mt-4">
            <RevolutPay
              amount={custBooking?.total}
              phone={selected.phone}
              customerName={selected.name}
            />
          </div>

          {/* Grupy punktów */}
          {loading ? (
            <p className="mt-4 text-center text-sm text-zinc-400">Wczytywanie…</p>
          ) : (
            <div className="mt-4 space-y-4">
              {CHECKLIST.map((group) => (
                <div key={group.title}>
                  <h2 className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    {group.title}
                  </h2>
                  <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
                    {group.items.map((item) => {
                      const done = !!view[item.key];
                      return (
                        <button
                          key={item.key}
                          onClick={() => toggle(item.key)}
                          className="flex w-full items-center gap-3 border-b border-zinc-100 px-4 py-3.5 text-left last:border-0 hover:bg-zinc-50"
                        >
                          <span
                            className={`grid size-6 shrink-0 place-items-center rounded-md border transition-colors ${
                              done
                                ? "border-emerald-500 bg-emerald-500 text-white"
                                : "border-zinc-300 bg-white text-transparent"
                            }`}
                          >
                            <Check className="size-4" strokeWidth={3} />
                          </span>
                          <span
                            className={`text-sm ${done ? "text-zinc-400 line-through" : "text-zinc-800"}`}
                          >
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        !query.trim() && (
          <div className="mt-4 rounded-xl border border-dashed border-zinc-200 bg-white px-4 py-10 text-center text-sm text-zinc-400">
            Wyszukaj i wybierz klienta, aby otworzyć jego checklistę wydania.
          </div>
        )
      )}
    </div>
  );
}
