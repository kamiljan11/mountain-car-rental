"use client";

import { useMemo, useState } from "react";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { useData } from "@/components/DataProvider";
import { fmtDate, toISODate } from "@/lib/dates";
import type { Booking, BookingType } from "@/lib/types";
import {
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Search,
  UserPlus,
  Car,
  CircleAlert,
} from "lucide-react";

const STEPS = ["Termin i pojazd", "Oferta", "Klient", "Podsumowanie"];

const LOCATIONS = [
  "Biuro — Reykjavik, Skogarhlid 10",
  "Lotnisko Keflavik — Keflavikurflugvollur",
];

const TYPE_LABEL: Record<BookingType, string> = {
  reservation: "Rezerwacja",
  block: "Blokada",
  service: "Serwis",
};

function addDays(iso: string, n: number) {
  const d = parseISO(iso);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

const inputCls =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-base outline-none transition-colors focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 md:text-sm";
const labelCls = "mb-1.5 block text-xs font-medium text-zinc-600";

export default function NewReservationWizard({
  initialVehicleId,
  initialDate,
  editBooking,
  onClose,
}: {
  initialVehicleId?: string;
  initialDate?: string;
  editBooking?: Booking;
  onClose: () => void;
}) {
  const { vehicles, customers, bookings, addBooking, updateBooking, addCustomer } = useData();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const today = toISODate(new Date());
  const [vehicleId, setVehicleId] = useState(
    editBooking?.vehicleId ?? initialVehicleId ?? vehicles[0]?.id ?? "",
  );
  const [type, setType] = useState<BookingType>(editBooking?.type ?? "reservation");
  const [start, setStart] = useState(editBooking?.start ?? initialDate ?? today);
  const [end, setEnd] = useState(
    editBooking?.end ?? addDays(initialDate ?? today, 2),
  );
  const [location, setLocation] = useState(LOCATIONS[0]);

  // Trzymane jako tekst (nie number) — pole jest type="text", żeby dało się
  // wpisać przecinek/kropkę dziesiętną; parsowanie dopiero przy użyciu wartości.
  const [dailyRate, setDailyRate] = useState(String(editBooking?.dailyRate ?? 0));
  const [deposit, setDeposit] = useState(String(editBooking?.deposit ?? 0));

  const [customerId, setCustomerId] = useState<string | null>(editBooking?.customerId ?? null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "", email: "", phone: "" });

  const [notes, setNotes] = useState(editBooking?.notes ?? "");

  const vehicle = vehicles.find((v) => v.id === vehicleId);
  const days = Math.max(
    1,
    differenceInCalendarDays(parseISO(end || start), parseISO(start)) + 1,
  );
  const rateNum = Number(dailyRate.replace(",", ".")) || 0;
  const depositNum = Number(deposit.replace(",", ".")) || 0;
  const total = rateNum * days;

  const conflicts = useMemo(() => {
    if (!vehicleId || !start || !end) return [];
    return bookings.filter(
      (b) =>
        b.id !== editBooking?.id &&
        b.vehicleId === vehicleId &&
        b.status !== "cancelled" &&
        parseISO(b.start) <= parseISO(end) &&
        parseISO(b.end) >= parseISO(start),
    );
  }, [bookings, vehicleId, start, end, editBooking?.id]);

  const customerMatches = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    const list = !q
      ? customers
      : customers.filter(
          (c) =>
            c.name.toLowerCase().includes(q) || c.phone?.toLowerCase().includes(q),
        );
    return list.slice(0, 8);
  }, [customers, customerSearch]);

  const selectedCustomer = customers.find((c) => c.id === customerId);

  const dateOrderOk = !!start && !!end && parseISO(end) >= parseISO(start);
  const canNext =
    step === 0
      ? !!vehicleId && dateOrderOk
      : step === 2
        ? type !== "reservation" || !!customerId
        : true;

  const next = () => canNext && setStep((s) => Math.min(3, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const submit = async () => {
    setSubmitting(true);
    const payload = {
      vehicleId,
      customerId: type === "reservation" ? customerId : null,
      type,
      start,
      end,
      dailyRate: rateNum || undefined,
      total: total || undefined,
      deposit: depositNum || undefined,
      notes: notes || undefined,
    };
    if (editBooking) {
      await updateBooking(editBooking.id, payload);
    } else {
      await addBooking({ ...payload, status: "confirmed" });
    }
    setSubmitting(false);
    setDone(true);
  };

  const createCustomer = async () => {
    if (!newCustomer.name.trim()) return;
    const c = await addCustomer({
      name: newCustomer.name.trim(),
      email: newCustomer.email.trim() || undefined,
      phone: newCustomer.phone.trim() || undefined,
      source: "Panel",
    });
    setCustomerId(c.id);
    setShowNewCustomer(false);
    setNewCustomer({ name: "", email: "", phone: "" });
    setCustomerSearch("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-zinc-900/30 px-4 py-6 md:items-center">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
        {/* header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <h2 className="text-base font-semibold text-zinc-900">
            {done ? "Gotowe" : editBooking ? "Edytuj wpis" : "Nowa pozycja w kalendarzu"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Zamknij"
            className="grid size-11 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
          >
            <X className="size-4" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center px-6 py-10 text-center">
            <div className="mb-4 grid size-16 place-items-center rounded-full bg-green-100 text-green-600">
              <Check className="size-8" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900">
              {TYPE_LABEL[type]} {editBooking ? "zapisana" : "dodana"}
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              {vehicle?.name} · {fmtDate(start)} – {fmtDate(end)}
            </p>
            <button
              onClick={onClose}
              className="mt-6 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Wróć do kalendarza
            </button>
          </div>
        ) : (
          <>
            {/* stepper */}
            <div className="flex items-center justify-between px-5 pt-4">
              {STEPS.map((label, i) => (
                <div key={label} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold ${
                        i < step
                          ? "bg-zinc-900 text-white"
                          : i === step
                            ? "bg-blue-600 text-white"
                            : "bg-zinc-100 text-zinc-400"
                      }`}
                    >
                      {i < step ? <Check className="size-4" /> : i + 1}
                    </div>
                    <span
                      className={`hidden text-[11px] sm:block ${
                        i <= step ? "text-zinc-700" : "text-zinc-400"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`mx-2 h-px flex-1 ${i < step ? "bg-zinc-900" : "bg-zinc-200"}`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* body */}
            <div className="max-h-[65vh] overflow-y-auto px-5 py-5">
              {step === 0 && (
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Typ wpisu</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["reservation", "block", "service"] as BookingType[]).map(
                        (t) => (
                          <button
                            key={t}
                            onClick={() => setType(t)}
                            className={`rounded-lg border px-2 py-3 text-sm font-medium transition-colors ${
                              type === t
                                ? "border-zinc-900 bg-zinc-900 text-white"
                                : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                            }`}
                          >
                            {TYPE_LABEL[t]}
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Pojazd</label>
                    <select
                      value={vehicleId}
                      onChange={(e) => setVehicleId(e.target.value)}
                      className={inputCls}
                    >
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} {v.plate ? `— ${v.plate}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Data od</label>
                      <input
                        type="date"
                        value={start}
                        onChange={(e) => {
                          setStart(e.target.value);
                          if (e.target.value > end) setEnd(e.target.value);
                        }}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Data do</label>
                      <input
                        type="date"
                        value={end}
                        min={start}
                        onChange={(e) => setEnd(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  {!dateOrderOk && (
                    <p className="text-xs text-red-600">
                      Data zakończenia nie może być wcześniejsza niż data rozpoczęcia.
                    </p>
                  )}

                  {conflicts.length > 0 && (
                    <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
                      <CircleAlert className="mt-0.5 size-4 shrink-0" />
                      <span>
                        {vehicle?.name} ma już {conflicts.length}{" "}
                        {conflicts.length === 1 ? "wpis" : "wpisy"} nakładając się na
                        te daty. Sprawdź kalendarz przed zapisaniem.
                      </span>
                    </div>
                  )}

                  {type === "reservation" && (
                    <div>
                      <label className={labelCls}>Miejsce wydania i odbioru</label>
                      <select
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className={inputCls}
                      >
                        {LOCATIONS.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2.5 text-sm text-zinc-600">
                    <Car className="size-4 shrink-0 text-zinc-400" />
                    {vehicle?.name} na {days} {days === 1 ? "dzień" : "dni"} (
                    {fmtDate(start)} – {fmtDate(end)})
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Cena za dzień (ISK)</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={dailyRate}
                        onChange={(e) => setDailyRate(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Kaucja (ISK)</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={deposit}
                        onChange={(e) => setDeposit(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border border-zinc-200 p-4">
                    <div className="flex items-center justify-between text-sm text-zinc-500">
                      <span>Kwota wynajmu ({rateNum.toLocaleString("pl-PL")} × {days})</span>
                      <span>{total.toLocaleString("pl-PL")} ISK</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between border-t border-zinc-100 pt-2 text-sm font-semibold text-zinc-900">
                      <span>Suma całkowita</span>
                      <span>{total.toLocaleString("pl-PL")} ISK</span>
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Notatka (opcjonalnie)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      placeholder="np. dodatkowe ustalenia, kontakt klienta"
                      className={inputCls}
                    />
                  </div>
                </div>
              )}

              {step === 2 &&
                (type !== "reservation" ? (
                  <p className="rounded-lg border border-dashed border-zinc-200 px-4 py-6 text-center text-sm text-zinc-400">
                    {TYPE_LABEL[type]} nie wymaga przypisania klienta.
                  </p>
                ) : showNewCustomer ? (
                  <div className="space-y-3">
                    <div>
                      <label className={labelCls}>Imię i nazwisko</label>
                      <input
                        autoFocus
                        autoComplete="name"
                        value={newCustomer.name}
                        onChange={(e) =>
                          setNewCustomer({ ...newCustomer, name: e.target.value })
                        }
                        placeholder="np. Jan Kowalski"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Telefon</label>
                      <input
                        type="tel"
                        autoComplete="tel"
                        value={newCustomer.phone}
                        onChange={(e) =>
                          setNewCustomer({ ...newCustomer, phone: e.target.value })
                        }
                        placeholder="+48 ..."
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>E-mail</label>
                      <input
                        type="email"
                        autoComplete="email"
                        value={newCustomer.email}
                        onChange={(e) =>
                          setNewCustomer({ ...newCustomer, email: e.target.value })
                        }
                        placeholder="jan@przyklad.pl"
                        className={inputCls}
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={createCustomer}
                        disabled={!newCustomer.name.trim()}
                        className="flex-1 rounded-lg bg-zinc-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-40"
                      >
                        Zapisz i wybierz klienta
                      </button>
                      <button
                        onClick={() => setShowNewCustomer(false)}
                        className="rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50"
                      >
                        Anuluj
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                      <input
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        placeholder="Szukaj po nazwisku lub telefonie…"
                        className={`${inputCls} pl-9`}
                      />
                    </div>

                    <div className="max-h-64 space-y-1 overflow-y-auto">
                      {customerMatches.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setCustomerId(c.id)}
                          className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                            customerId === c.id
                              ? "border-zinc-900 bg-zinc-50"
                              : "border-transparent hover:bg-zinc-50"
                          }`}
                        >
                          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-500">
                            {c.name.slice(0, 2).toUpperCase()}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium text-zinc-800">
                              {c.name}
                            </span>
                            {c.phone && (
                              <span className="block truncate text-xs text-zinc-400">
                                {c.phone}
                              </span>
                            )}
                          </span>
                          {customerId === c.id && (
                            <Check className="size-4 shrink-0 text-zinc-900" />
                          )}
                        </button>
                      ))}
                      {customerMatches.length === 0 && (
                        <p className="px-3 py-4 text-center text-sm text-zinc-400">
                          Brak wyników.
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setShowNewCustomer(true);
                        setNewCustomer((n) => ({ ...n, name: customerSearch }));
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 px-3 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
                    >
                      <UserPlus className="size-4" /> Nowy klient
                    </button>
                  </div>
                ))}

              {step === 3 && (
                <div className="space-y-3">
                  <div className="rounded-lg border border-zinc-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-zinc-400">Termin</div>
                        <div className="text-sm font-medium text-zinc-900">
                          {fmtDate(start)} – {fmtDate(end)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-zinc-400">Czas trwania</div>
                        <div className="text-sm font-medium text-zinc-900">
                          {days} {days === 1 ? "dzień" : "dni"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg border border-zinc-200 p-4">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ background: vehicle?.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-zinc-900">
                        {vehicle?.name}
                      </div>
                      {vehicle?.plate && (
                        <div className="text-xs text-zinc-400">{vehicle.plate}</div>
                      )}
                    </div>
                    <span className="rounded bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600">
                      {TYPE_LABEL[type]}
                    </span>
                  </div>

                  {type === "reservation" && (
                    <div className="rounded-lg border border-zinc-200 p-4">
                      {selectedCustomer ? (
                        <div className="flex items-center gap-3">
                          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-500">
                            {selectedCustomer.name.slice(0, 2).toUpperCase()}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-zinc-900">
                              {selectedCustomer.name}
                            </div>
                            {selectedCustomer.phone && (
                              <div className="text-xs text-zinc-400">
                                {selectedCustomer.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-zinc-400">Brak wybranego klienta.</p>
                      )}
                      <div className="mt-3 text-xs text-zinc-400">
                        Miejsce wydania / odbioru
                      </div>
                      <div className="text-sm text-zinc-700">{location}</div>
                    </div>
                  )}

                  <div className="rounded-lg border border-zinc-200 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-500">Cena za dzień</span>
                      <span className="text-zinc-800">
                        {rateNum.toLocaleString("pl-PL")} ISK
                      </span>
                    </div>
                    {depositNum > 0 && (
                      <div className="mt-1.5 flex items-center justify-between text-sm">
                        <span className="text-zinc-500">Kaucja</span>
                        <span className="text-zinc-800">
                          {depositNum.toLocaleString("pl-PL")} ISK
                        </span>
                      </div>
                    )}
                    <div className="mt-2 flex items-center justify-between border-t border-zinc-100 pt-2 text-sm font-semibold text-zinc-900">
                      <span>Suma całkowita</span>
                      <span>{total.toLocaleString("pl-PL")} ISK</span>
                    </div>
                  </div>

                  {notes && (
                    <div className="rounded-lg bg-zinc-50 px-3 py-2.5 text-sm text-zinc-600">
                      {notes}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* footer */}
            <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-4">
              <button
                onClick={back}
                disabled={step === 0}
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-3 text-sm text-zinc-600 hover:bg-zinc-50 disabled:opacity-0"
              >
                <ChevronLeft className="size-4" /> Wstecz
              </button>
              {step < 3 ? (
                <button
                  onClick={next}
                  disabled={!canNext}
                  className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-40"
                >
                  Dalej <ChevronRight className="size-4" />
                </button>
              ) : (
                <button
                  onClick={submit}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
                >
                  <Check className="size-4" />
                  {submitting ? "Zapisywanie…" : editBooking ? "Zapisz zmiany" : "Potwierdź"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
