"use client";

import { Fragment, useState } from "react";
import { parseISO, differenceInCalendarDays } from "date-fns";
import { vehicles, bookings as seedBookings, customerById } from "@/lib/data";
import { PL_MONTHS, PL_WD, fmtDate, toISODate } from "@/lib/dates";
import type { Booking, BookingType } from "@/lib/types";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Trash2,
} from "lucide-react";

const TYPE_STYLES: Record<
  BookingType,
  { bar: string; dot: string; label: string }
> = {
  reservation: {
    bar: "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200",
    dot: "bg-blue-500",
    label: "Rezerwacja",
  },
  block: {
    bar: "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200",
    dot: "bg-amber-500",
    label: "Blokada",
  },
  service: {
    bar: "bg-zinc-200 text-zinc-700 border-zinc-300 hover:bg-zinc-300",
    dot: "bg-zinc-500",
    label: "Serwis",
  },
};

export default function Timeline() {
  const [ym, setYm] = useState({ y: 2026, m: 8 }); // wrzesień 2026 — tam są dane
  const [bookings, setBookings] = useState<Booking[]>(seedBookings);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [draft, setDraft] = useState<{ vehicleId: string; date: string } | null>(
    null,
  );
  const [form, setForm] = useState({ name: "", type: "reservation" as BookingType, days: 3 });

  const { y, m } = ym;
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => new Date(y, m, i + 1));
  const first = new Date(y, m, 1);
  const last = new Date(y, m, daysInMonth);

  const move = (delta: number) => {
    const d = new Date(y, m + delta, 1);
    setYm({ y: d.getFullYear(), m: d.getMonth() });
  };
  const goToday = () => {
    const d = new Date();
    setYm({ y: d.getFullYear(), m: d.getMonth() });
  };
  const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

  const visible = bookings.filter(
    (b) => parseISO(b.start) <= last && parseISO(b.end) >= first,
  );

  const openDraft = (vehicleId: string, date: Date) => {
    setSelected(null);
    setForm({ name: "", type: "reservation", days: 3 });
    setDraft({ vehicleId, date: toISODate(date) });
  };

  const addDraft = () => {
    if (!draft) return;
    const startD = parseISO(draft.date);
    const end = new Date(startD);
    end.setDate(startD.getDate() + Math.max(0, form.days - 1));
    setBookings((prev) => [
      ...prev,
      {
        id: `local-${prev.length + 1}`,
        vehicleId: draft.vehicleId,
        customerId: null,
        type: form.type,
        status: "confirmed",
        start: draft.date,
        end: toISODate(end),
        notes: form.name || TYPE_STYLES[form.type].label,
      },
    ]);
    setDraft(null);
  };

  const removeBooking = (id: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
    setSelected(null);
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => move(-1)}
            aria-label="Poprzedni miesiąc"
            className="grid size-9 place-items-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={() => move(1)}
            aria-label="Następny miesiąc"
            className="grid size-9 place-items-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
          >
            <ChevronRight className="size-4" />
          </button>
          <div className="ml-1 text-base font-semibold capitalize">
            {PL_MONTHS[m]} {y}
          </div>
          <button
            onClick={goToday}
            className="ml-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50"
          >
            Dziś
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-3 text-xs text-zinc-500 sm:flex">
            {(["reservation", "block", "service"] as BookingType[]).map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <span className={`size-2.5 rounded-sm ${TYPE_STYLES[t].dot}`} />
                {TYPE_STYLES[t].label}
              </span>
            ))}
          </div>
          <button
            onClick={() => openDraft(vehicles[0].id, first)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            <Plus className="size-4" /> Nowa rezerwacja
          </button>
        </div>
      </div>

      {/* Timeline grid */}
      <div className="tl-scroll overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <div
          className="grid min-w-max"
          style={{
            gridTemplateColumns: `200px repeat(${daysInMonth}, minmax(38px, 1fr))`,
          }}
        >
          {/* corner */}
          <div
            style={{ gridColumn: 1, gridRow: 1 }}
            className="sticky left-0 z-30 flex items-center border-b border-r border-zinc-200 bg-zinc-50 px-4 py-2 text-xs font-medium text-zinc-500"
          >
            Pojazd
          </div>
          {/* day headers */}
          {days.map((d, di) => (
            <div
              key={`h${di}`}
              style={{ gridColumn: 2 + di, gridRow: 1 }}
              className={`border-b border-r border-zinc-200 py-1.5 text-center ${
                isWeekend(d) ? "bg-zinc-100" : "bg-zinc-50"
              }`}
            >
              <div className="text-[10px] leading-tight text-zinc-400">
                {PL_WD[d.getDay()]}
              </div>
              <div className="text-xs font-medium leading-tight text-zinc-700">
                {d.getDate()}
              </div>
            </div>
          ))}

          {/* rows */}
          {vehicles.map((v, vi) => (
            <Fragment key={v.id}>
              <div
                style={{ gridColumn: 1, gridRow: 2 + vi }}
                className="sticky left-0 z-20 flex flex-col justify-center border-b border-r border-zinc-200 bg-white px-4 py-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ background: v.color }}
                  />
                  <span className="truncate text-sm font-medium text-zinc-800">
                    {v.name}
                  </span>
                </div>
                <span className="pl-4 text-[11px] text-zinc-400">{v.plate}</span>
              </div>
              {days.map((d, di) => (
                <button
                  key={`${v.id}-${di}`}
                  onClick={() => openDraft(v.id, d)}
                  style={{ gridColumn: 2 + di, gridRow: 2 + vi }}
                  className={`h-12 border-b border-r border-zinc-100 ${
                    isWeekend(d) ? "bg-zinc-50" : "bg-white"
                  } hover:bg-blue-50/60`}
                />
              ))}
              {visible
                .filter((b) => b.vehicleId === v.id)
                .map((b) => {
                  const bStart = parseISO(b.start);
                  const bEnd = parseISO(b.end);
                  const startClamped = bStart < first ? first : bStart;
                  const endClamped = bEnd > last ? last : bEnd;
                  const offset = differenceInCalendarDays(startClamped, first);
                  const span = differenceInCalendarDays(endClamped, startClamped) + 1;
                  const clipL = bStart < first;
                  const clipR = bEnd > last;
                  const s = TYPE_STYLES[b.type];
                  return (
                    <button
                      key={b.id}
                      onClick={() => {
                        setDraft(null);
                        setSelected(b);
                      }}
                      style={{ gridColumn: `${2 + offset} / span ${span}`, gridRow: 2 + vi }}
                      className={`relative z-10 m-1 flex h-10 items-center self-center overflow-hidden text-ellipsis whitespace-nowrap rounded-md border px-2 text-xs font-medium ${s.bar} ${
                        clipL ? "rounded-l-none" : ""
                      } ${clipR ? "rounded-r-none" : ""}`}
                      title={b.notes}
                    >
                      {clipL && <span className="mr-1">◂</span>}
                      <span className="truncate">
                        {customerById(b.customerId)?.name ?? b.notes}
                      </span>
                    </button>
                  );
                })}
            </Fragment>
          ))}
        </div>
      </div>
      <p className="mt-2 text-xs text-zinc-400">
        Dane przykładowe z importu RentHelp. Zapis na żywo podłączymy do Supabase w kroku 2.
      </p>

      {(selected || draft) && (
        <div
          className="fixed inset-0 z-40 bg-zinc-900/20"
          onClick={() => {
            setSelected(null);
            setDraft(null);
          }}
        />
      )}

      {/* Detail drawer */}
      {selected && (
        <Drawer onClose={() => setSelected(null)} title="Szczegóły wpisu">
          <DetailRow label="Typ" value={TYPE_STYLES[selected.type].label} />
          <DetailRow
            label="Pojazd"
            value={vehicles.find((v) => v.id === selected.vehicleId)?.name ?? "—"}
          />
          <DetailRow
            label="Klient"
            value={customerById(selected.customerId)?.name ?? "—"}
          />
          <DetailRow label="Od" value={fmtDate(selected.start)} />
          <DetailRow label="Do" value={fmtDate(selected.end)} />
          {selected.total != null && (
            <DetailRow label="Kwota" value={`${selected.total} zł`} />
          )}
          {selected.deposit != null && (
            <DetailRow label="Kaucja" value={`${selected.deposit} zł`} />
          )}
          {selected.notes && <DetailRow label="Notatka" value={selected.notes} />}
          <button
            onClick={() => removeBooking(selected.id)}
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
          >
            <Trash2 className="size-4" /> Usuń wpis
          </button>
        </Drawer>
      )}

      {/* New draft drawer */}
      {draft && (
        <Drawer onClose={() => setDraft(null)} title="Nowa rezerwacja">
          <DetailRow
            label="Pojazd"
            value={vehicles.find((v) => v.id === draft.vehicleId)?.name ?? "—"}
          />
          <DetailRow label="Data od" value={fmtDate(draft.date)} />
          <label className="mt-4 block text-xs font-medium text-zinc-500">Klient / opis</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="np. Jan Kowalski"
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-base outline-none focus:border-zinc-400 md:text-sm"
          />
          <label className="mt-3 block text-xs font-medium text-zinc-500">Typ</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as BookingType })}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-base outline-none focus:border-zinc-400 md:text-sm"
          >
            <option value="reservation">Rezerwacja</option>
            <option value="block">Blokada</option>
            <option value="service">Serwis</option>
          </select>
          <label className="mt-3 block text-xs font-medium text-zinc-500">Liczba dni</label>
          <input
            type="number"
            min={1}
            value={form.days}
            onChange={(e) => setForm({ ...form, days: Number(e.target.value) })}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-base outline-none focus:border-zinc-400 md:text-sm"
          />
          <button
            onClick={addDraft}
            className="mt-6 w-full rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Dodaj do kalendarza
          </button>
        </Drawer>
      )}
    </div>
  );
}

function Drawer({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed right-0 top-0 z-50 flex h-full w-96 max-w-full flex-col border-l border-zinc-200 bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
        <h2 className="text-sm font-semibold">{title}</h2>
        <button
          onClick={onClose}
          aria-label="Zamknij"
          className="grid size-8 place-items-center rounded-lg text-zinc-500 hover:bg-zinc-100"
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-zinc-100 py-2 text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className="text-right font-medium text-zinc-800">{value}</span>
    </div>
  );
}
