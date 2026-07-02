"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { parseISO, differenceInCalendarDays } from "date-fns";
import Link from "next/link";
import { useData } from "@/components/DataProvider";
import NewReservationWizard from "@/components/NewReservationWizard";
import { PL_MONTHS, PL_WD, fmtDate, toISODate } from "@/lib/dates";
import type { Booking, BookingType } from "@/lib/types";
import { ChevronLeft, ChevronRight, Plus, X, Trash2, FileSignature } from "lucide-react";

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

const CHUNK = 30; // ile dni doładowujemy przy każdym dojściu do krawędzi
const INITIAL_DAYS = 120;
const BACK_BUFFER = 21; // ile dni wstecz od dziś na starcie

// SSR-safe layout effect
const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(d.getDate() + n);
  return r;
}
function midnight(d: Date) {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

function withLanes(list: Booking[]) {
  const sorted = [...list].sort((a, b) =>
    a.start < b.start ? -1 : a.start > b.start ? 1 : 0,
  );
  const laneEnd: number[] = [];
  const rows = sorted.map((b) => {
    const s = parseISO(b.start).getTime();
    const e = parseISO(b.end).getTime();
    let lane = laneEnd.findIndex((end) => end < s);
    if (lane === -1) lane = laneEnd.length;
    laneEnd[lane] = e;
    return { ...b, lane };
  });
  return { rows, lanes: Math.max(1, laneEnd.length) };
}

export default function Timeline() {
  const { vehicles, bookings, removeBooking, customerById } = useData();

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const DAY_W = isMobile ? 44 : 40;
  const LABEL_W = isMobile ? 92 : 176;
  // Nieco wyższe paski na mobile — łatwiej trafić palcem, przy zachowaniu
  // gęstości widoku wielu pojazdów naraz (pełne 44px zajęłoby zbyt dużo miejsca).
  const LANE_H = isMobile ? 36 : 30;

  // Ciągły pas czasu: `start` to pierwszy renderowany dzień, `dayCount` — ile dni.
  const [start, setStart] = useState<Date>(() =>
    addDays(midnight(new Date()), -BACK_BUFFER),
  );
  const [dayCount, setDayCount] = useState(INITIAL_DAYS);
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const adjustRef = useRef(0); // px do dodania po prepend (żeby widok nie skakał)
  const busyRef = useRef(false); // blokada wielokrotnego doładowania na klatkę
  const didInit = useRef(false);

  const [selected, setSelected] = useState<Booking | null>(null);
  const [draft, setDraft] = useState<{ vehicleId: string; date: string } | null>(
    null,
  );

  const days = useMemo(
    () => Array.from({ length: dayCount }, (_, i) => addDays(start, i)),
    [start, dayCount],
  );
  const last = days[days.length - 1] ?? start;
  const gridW = dayCount * DAY_W;

  const todayIndex = useMemo(() => {
    const i = differenceInCalendarDays(midnight(new Date()), start);
    return i >= 0 && i < dayCount ? i : null;
  }, [start, dayCount]);

  const weekends = useMemo(
    () =>
      days
        .map((d, i) => ({ d, i }))
        .filter((x) => x.d.getDay() === 0 || x.d.getDay() === 6),
    [days],
  );
  const monthStarts = useMemo(
    () => days.map((d, i) => ({ d, i })).filter((x) => x.i === 0 || x.d.getDate() === 1),
    [days],
  );

  // pierwsze wejście — przewiń do „dziś"
  useIso(() => {
    if (didInit.current || !scrollRef.current) return;
    didInit.current = true;
    scrollRef.current.scrollLeft = Math.max(0, (BACK_BUFFER - 1) * DAY_W);
  }, []);

  // po prepend: skoryguj scroll, zwolnij blokadę
  useIso(() => {
    if (adjustRef.current && scrollRef.current) {
      scrollRef.current.scrollLeft += adjustRef.current;
      adjustRef.current = 0;
    }
    busyRef.current = false;
  }, [start, dayCount]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, clientWidth, scrollWidth } = el;

    // nazwa miesiąca — wg dnia przy lewej krawędzi widoku
    const idx = Math.round(scrollLeft / DAY_W);
    const d = addDays(start, idx);
    setViewMonth((p) =>
      p.y === d.getFullYear() && p.m === d.getMonth()
        ? p
        : { y: d.getFullYear(), m: d.getMonth() },
    );

    if (busyRef.current) return;
    if (scrollLeft + clientWidth > scrollWidth - DAY_W * 8) {
      busyRef.current = true;
      setDayCount((c) => c + CHUNK); // doładuj w prawo
    } else if (scrollLeft < DAY_W * 8) {
      busyRef.current = true;
      adjustRef.current += CHUNK * DAY_W;
      setStart((s) => addDays(s, -CHUNK)); // doładuj w lewo
      setDayCount((c) => c + CHUNK);
    }
  };

  const move = (delta: number) => {
    scrollRef.current?.scrollBy({
      left: delta * 28 * DAY_W,
      behavior: "smooth",
    });
  };
  const goToday = () => {
    if (!scrollRef.current || todayIndex == null) return;
    scrollRef.current.scrollTo({
      left: Math.max(0, (todayIndex - 1) * DAY_W),
      behavior: "smooth",
    });
  };

  const visible = bookings.filter(
    (b) => parseISO(b.end) >= start && parseISO(b.start) <= last,
  );

  // Wszystkie wiersze pojazdów dostają tę samą wysokość (najdłuższy stos
  // nakładek w bieżącym widoku) — inaczej rzędy "skaczą" przy zmianie miesiąca.
  const vehicleRows = useMemo(
    () =>
      vehicles.map((v) => ({
        v,
        ...withLanes(visible.filter((b) => b.vehicleId === v.id)),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [vehicles, bookings, start, last],
  );
  const rowH =
    Math.max(1, ...vehicleRows.map((r) => r.lanes)) * LANE_H + 8;

  const openDraft = (vehicleId: string, date: Date) => {
    setSelected(null);
    setDraft({ vehicleId, date: toISODate(date) });
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => move(-1)}
            aria-label="Wstecz"
            className="grid size-11 place-items-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={() => move(1)}
            aria-label="Dalej"
            className="grid size-11 place-items-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
          >
            <ChevronRight className="size-4" />
          </button>
          <div className="ml-1 min-w-[9.5rem] text-base font-semibold capitalize">
            {PL_MONTHS[viewMonth.m]} {viewMonth.y}
          </div>
          <button
            onClick={goToday}
            className="ml-1 rounded-lg border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-600 hover:bg-zinc-50"
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
            onClick={() =>
              vehicles[0] && openDraft(vehicles[0].id, midnight(new Date()))
            }
            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-3 text-sm font-medium text-white hover:bg-zinc-800"
          >
            <Plus className="size-4" /> Nowa
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="tl-scroll overflow-x-auto overscroll-x-contain rounded-xl border border-zinc-200 bg-white"
      >
        <div style={{ width: LABEL_W + gridW }}>
          {/* nagłówek dni */}
          <div className="flex border-b border-zinc-200">
            <div
              className="sticky left-0 z-30 flex items-center bg-zinc-50 px-3 text-xs font-medium text-zinc-500"
              style={{ width: LABEL_W, minWidth: LABEL_W }}
            >
              Pojazd
            </div>
            <div
              className="grid"
              style={{
                width: gridW,
                gridTemplateColumns: `repeat(${dayCount}, ${DAY_W}px)`,
              }}
            >
              {days.map((d, di) => {
                const wknd = d.getDay() === 0 || d.getDay() === 6;
                const isToday = todayIndex === di;
                const first = d.getDate() === 1 || di === 0;
                return (
                  <div
                    key={di}
                    className={`py-1.5 text-center ${
                      first ? "border-l border-zinc-300" : "border-r border-zinc-100"
                    } ${wknd ? "bg-zinc-100" : "bg-zinc-50"}`}
                  >
                    <div className="text-[10px] leading-tight text-zinc-400">
                      {PL_WD[d.getDay()]}
                    </div>
                    <div
                      className={`text-xs font-medium leading-tight ${
                        isToday ? "text-blue-600" : "text-zinc-700"
                      }`}
                    >
                      {d.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ciało: warstwa tła (weekendy / miesiące / dziś / siatka) + wiersze */}
          <div className="relative">
            <div
              className="pointer-events-none absolute bottom-0 top-0"
              style={{
                left: LABEL_W,
                width: gridW,
                backgroundImage: `repeating-linear-gradient(90deg, transparent 0, transparent ${
                  DAY_W - 1
                }px, #f1f1f4 ${DAY_W - 1}px, #f1f1f4 ${DAY_W}px)`,
              }}
            >
              {weekends.map((w) => (
                <div
                  key={w.i}
                  className="absolute bottom-0 top-0 bg-zinc-50"
                  style={{ left: w.i * DAY_W, width: DAY_W }}
                />
              ))}
              {todayIndex != null && (
                <div
                  className="absolute bottom-0 top-0 bg-blue-50/70"
                  style={{ left: todayIndex * DAY_W, width: DAY_W }}
                />
              )}
              {monthStarts.map((ms) => (
                <div
                  key={ms.i}
                  className="absolute bottom-0 top-0 border-l border-zinc-300"
                  style={{ left: ms.i * DAY_W }}
                >
                  <span className="absolute left-1 top-1 whitespace-nowrap text-[10px] font-semibold capitalize text-zinc-400">
                    {PL_MONTHS[ms.d.getMonth()]} {ms.d.getFullYear()}
                  </span>
                </div>
              ))}
            </div>

            {vehicleRows.map(({ v, rows }) => {
              return (
                <div
                  key={v.id}
                  className="flex border-b border-zinc-100"
                  style={{ height: rowH }}
                >
                  <div
                    className="sticky left-0 z-20 flex flex-col justify-center border-r border-zinc-200 bg-white px-3"
                    style={{ width: LABEL_W, minWidth: LABEL_W }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ background: v.color }}
                      />
                      <span className="truncate text-[13px] font-medium text-zinc-800">
                        {v.name}
                      </span>
                    </div>
                    {v.plate && (
                      <span className="truncate pl-4 text-[11px] text-zinc-400">
                        {v.plate}
                      </span>
                    )}
                  </div>
                  <div className="relative" style={{ width: gridW }}>
                    {/* warstwa klikania — nowa rezerwacja w danym dniu */}
                    <div
                      className="absolute inset-0 cursor-pointer"
                      onClick={(e) => {
                        const r = e.currentTarget.getBoundingClientRect();
                        const i = Math.floor((e.clientX - r.left) / DAY_W);
                        openDraft(v.id, addDays(start, i));
                      }}
                    />
                    {rows.map((b) => {
                      const bStart = parseISO(b.start);
                      const bEnd = parseISO(b.end);
                      const sC = bStart < start ? start : bStart;
                      const eC = bEnd > last ? last : bEnd;
                      const offset = differenceInCalendarDays(sC, start);
                      const span = differenceInCalendarDays(eC, sC) + 1;
                      const clipL = bStart < start;
                      const clipR = bEnd > last;
                      const s = TYPE_STYLES[b.type];
                      return (
                        <button
                          key={b.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDraft(null);
                            setSelected(b);
                          }}
                          title={b.notes}
                          style={{
                            position: "absolute",
                            left: offset * DAY_W + 2,
                            width: span * DAY_W - 4,
                            top: b.lane * LANE_H + 4,
                            height: LANE_H - 8,
                          }}
                          className={`z-10 flex items-center overflow-hidden text-ellipsis whitespace-nowrap rounded-md border px-2 text-xs font-medium ${s.bar} ${
                            clipL ? "rounded-l-none" : ""
                          } ${clipR ? "rounded-r-none" : ""}`}
                        >
                          <span className="truncate">
                            {customerById(b.customerId)?.name ?? b.notes}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <p className="mt-2 text-xs text-zinc-400">
        Przewijaj w bok (myszką, gładzikiem lub palcem) — pas czasu ładuje kolejne
        miesiące bez końca. Nakładające się wpisy układają się w podwierszach.
      </p>

      {selected && (
        <div
          className="fixed inset-0 z-40 bg-zinc-900/20"
          onClick={() => setSelected(null)}
        />
      )}

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
            <DetailRow
              label="Kwota"
              value={`${selected.total.toLocaleString("pl-PL")} ISK`}
            />
          )}
          {selected.deposit != null && (
            <DetailRow
              label="Kaucja"
              value={`${selected.deposit.toLocaleString("pl-PL")} ISK`}
            />
          )}
          {selected.notes && <DetailRow label="Notatka" value={selected.notes} />}

          <div className="mt-6 space-y-2">
            {selected.type === "reservation" && selected.customerId && (
              <Link
                href={`/contracts?customerId=${selected.customerId}&bookingId=${selected.id}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                <FileSignature className="size-4" /> Podgląd umowy
              </Link>
            )}
            <button
              onClick={() => {
                removeBooking(selected.id);
                setSelected(null);
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm font-medium text-red-700 hover:bg-red-100"
            >
              <Trash2 className="size-4" /> Usuń wpis
            </button>
          </div>
        </Drawer>
      )}

      {draft && (
        <NewReservationWizard
          initialVehicleId={draft.vehicleId}
          initialDate={draft.date}
          onClose={() => setDraft(null)}
        />
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
          className="grid size-11 place-items-center rounded-lg text-zinc-500 hover:bg-zinc-100"
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
