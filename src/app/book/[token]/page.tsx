"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ShieldCheck,
  CalendarDays,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { fmtDate, toISODate, monthLabel, todayISO, nowIceland } from "@/lib/dates";
import type { PublicBookingView } from "@/lib/types";

const WD = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"]; // tydzień od poniedziałku

function addDaysISO(iso: string, n: number) {
  const [y, m, d] = iso.split("-").map(Number);
  return toISODate(new Date(y, m - 1, d + n));
}

// Siatka miesiąca (poniedziałek pierwszy); null = puste komórki wyrównania.
function monthCells(year: number, month: number): (string | null)[] {
  const startWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = Array(startWeekday).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(toISODate(new Date(year, month, d)));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const inputCls =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-base outline-none transition-colors focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10";
const labelCls = "mb-1 block text-xs font-medium text-zinc-600";

export default function BookPage() {
  const { token } = useParams<{ token: string }>();

  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<PublicBookingView | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(`/api/book/${token}`);
        const j = await r.json().catch(() => ({}));
        if (!alive) return;
        if (!r.ok || !j?.ok) setNotFound(true);
        else setView(j.view as PublicBookingView);
      } catch {
        if (alive) setNotFound(true);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-100 to-zinc-200 px-4 py-6">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-5 flex flex-col items-center text-center">
          <div className="mb-3 grid size-12 place-items-center rounded-2xl bg-zinc-900 text-white shadow-lg">
            <Car className="size-6" />
          </div>
          <h1 className="text-base font-semibold tracking-tight text-zinc-900">
            Mountain Car Rental
          </h1>
          <p className="text-sm text-zinc-500">Rezerwacja pojazdu</p>
        </div>

        {loading ? (
          <Card>
            <div className="flex items-center justify-center gap-2 py-10 text-zinc-500">
              <Loader2 className="size-5 animate-spin" /> Wczytywanie…
            </div>
          </Card>
        ) : notFound || !view ? (
          <Info
            icon={<AlertTriangle className="size-7" />}
            title="Link nieprawidłowy lub wygasł"
            text="Poproś Mountain Car Rental o nowy link do rezerwacji."
          />
        ) : submitted || view.status === "submitted" ? (
          <Info
            icon={<Clock className="size-7" />}
            title="Dziękujemy! Poczekaj na potwierdzenie"
            text="Twoje zgłoszenie trafiło do Mountain Car Rental. Skontaktujemy się mailowo, gdy tylko potwierdzimy rezerwację."
            tone="ok"
          />
        ) : view.status === "expired" ? (
          <Info
            icon={<Clock className="size-7" />}
            title="Link wygasł"
            text="Ten link był ważny 60 minut. Poproś zespół o nowy, żeby dokończyć rezerwację."
          />
        ) : view.status === "confirmed" ? (
          <Info
            icon={<Check className="size-7" />}
            title="Rezerwacja potwierdzona"
            text="Ta rezerwacja została już potwierdzona. Do zobaczenia!"
            tone="ok"
          />
        ) : view.status === "rejected" ? (
          <Info
            icon={<AlertTriangle className="size-7" />}
            title="Prośba odrzucona"
            text="Ta prośba o rezerwację nie została przyjęta. W razie pytań skontaktuj się z Mountain Car Rental."
          />
        ) : (
          <Wizard token={token} view={view} onDone={() => setSubmitted(true)} />
        )}

        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-zinc-400">
          <ShieldCheck className="size-3.5" /> Twoje dane wpisujesz sam i trafiają
          bezpiecznie do Mountain Car Rental.
        </p>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      {children}
    </div>
  );
}

function Info({
  icon,
  title,
  text,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  tone?: "ok";
}) {
  return (
    <Card>
      <div className="flex flex-col items-center py-6 text-center">
        <div
          className={`mb-4 grid size-16 place-items-center rounded-full ${
            tone === "ok" ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"
          }`}
        >
          {icon}
        </div>
        <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
        <p className="mt-1.5 max-w-sm text-sm text-zinc-500">{text}</p>
      </div>
    </Card>
  );
}

const STEPS = ["Start", "Termin", "Dane", "Podsumowanie"];

function Wizard({
  token,
  view,
  onDone,
}: {
  token: string;
  view: PublicBookingView;
  onDone: () => void;
}) {
  const [step, setStep] = useState(0);
  const [start, setStart] = useState<string>(view.suggestedStart ?? "");
  const [end, setEnd] = useState<string>(view.suggestedEnd ?? "");
  const [form, setForm] = useState({
    name: view.prefill?.name ?? "",
    email: view.prefill?.email ?? "",
    phone: view.prefill?.phone ?? "",
    address: view.prefill?.address ?? "",
    idNumber: view.prefill?.idNumber ?? "",
    license: view.prefill?.license ?? "",
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const today = todayISO(); // dostępność liczona wg daty islandzkiej (UTC)
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const dataOk = form.name.trim().length > 1 && emailOk;
  const datesOk = !!start && !!end && end >= start;

  const submit = async () => {
    setErr("");
    setSubmitting(true);
    try {
      const r = await fetch(`/api/book/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, start, end }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j?.ok) {
        setErr(j?.message || "Nie udało się wysłać. Spróbuj ponownie.");
        setSubmitting(false);
        return;
      }
      onDone();
    } catch {
      setErr("Błąd połączenia. Spróbuj ponownie.");
      setSubmitting(false);
    }
  };

  return (
    <Card>
      {/* stepper */}
      <div className="mb-5 flex items-center justify-between">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center last:flex-none">
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
            {i < STEPS.length - 1 && (
              <div className={`mx-1.5 h-px flex-1 ${i < step ? "bg-zinc-900" : "bg-zinc-200"}`} />
            )}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <p className="text-sm text-zinc-600">
            Rezerwujesz pojazd u Mountain Car Rental. Wybierzesz termin i podasz swoje
            dane — zajmie to chwilę.
          </p>
          <div className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4">
            <span
              className="size-3 shrink-0 rounded-full"
              style={{ background: view.vehicle.color }}
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-base font-semibold text-zinc-900">
                {view.vehicle.name}
              </div>
              {view.vehicle.plate && (
                <div className="text-xs text-zinc-400">{view.vehicle.plate}</div>
              )}
            </div>
            <Car className="size-5 text-zinc-300" />
          </div>
          {view.noteToClient && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm text-blue-800">
              {view.noteToClient}
            </div>
          )}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <p className="flex items-center gap-1.5 text-sm text-zinc-600">
            <CalendarDays className="size-4 text-zinc-400" /> Wybierz termin — dni zajęte
            są nieaktywne.
          </p>
          <Calendar
            today={today}
            bookedRanges={view.bookedRanges}
            start={start}
            end={end}
            onPick={(s, e) => {
              setStart(s);
              setEnd(e);
            }}
          />
          {datesOk && (
            <div className="rounded-lg bg-zinc-50 px-3 py-2.5 text-center text-sm font-medium text-zinc-700">
              {fmtDate(start)} – {fmtDate(end)}
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Imię i nazwisko *</label>
            <input
              autoComplete="name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Jan Kowalski"
              className={inputCls}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelCls}>E-mail *</label>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="jan@przyklad.pl"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Telefon</label>
              <input
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+48 …"
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Adres</label>
            <input
              autoComplete="street-address"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="Ulica, kod, miasto, kraj"
              className={inputCls}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Nr dokumentu tożsamości</label>
              <input
                value={form.idNumber}
                onChange={(e) => set("idNumber", e.target.value)}
                placeholder="Dowód / paszport"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Nr prawa jazdy</label>
              <input
                value={form.license}
                onChange={(e) => set("license", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Wiadomość do zespołu (opcjonalnie)</label>
            <textarea
              rows={2}
              value={form.note}
              onChange={(e) => set("note", e.target.value)}
              placeholder="np. godzina odbioru, dodatkowe ustalenia"
              className={inputCls}
            />
          </div>
          {!dataOk && (form.name || form.email) && (
            <p className="text-xs text-amber-600">
              Podaj imię i nazwisko oraz poprawny e-mail.
            </p>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <Row label="Pojazd" value={`${view.vehicle.name}${view.vehicle.plate ? ` · ${view.vehicle.plate}` : ""}`} />
          <Row label="Termin" value={`${fmtDate(start)} – ${fmtDate(end)}`} />
          <Row label="Imię i nazwisko" value={form.name} />
          <Row label="E-mail" value={form.email} />
          {form.phone && <Row label="Telefon" value={form.phone} />}
          {form.address && <Row label="Adres" value={form.address} />}
          {form.idNumber && <Row label="Dokument tożsamości" value={form.idNumber} />}
          {form.license && <Row label="Prawo jazdy" value={form.license} />}
          {form.note && <Row label="Wiadomość" value={form.note} />}
          {err && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {err}
            </div>
          )}
          <p className="text-xs text-zinc-400">
            Po wysłaniu zobaczysz ekran potwierdzenia. Rezerwację zatwierdza zespół —
            dostaniesz e-mail.
          </p>
        </div>
      )}

      {/* footer */}
      <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50 disabled:opacity-0"
        >
          <ChevronLeft className="size-4" /> Wstecz
        </button>
        {step < 3 ? (
          <button
            onClick={() => setStep((s) => Math.min(3, s + 1))}
            disabled={(step === 1 && !datesOk) || (step === 2 && !dataOk)}
            className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-40"
          >
            Dalej <ChevronRight className="size-4" />
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={submitting || !datesOk || !dataOk}
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {submitting ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            {submitting ? "Wysyłanie…" : "Wyślij zgłoszenie"}
          </button>
        )}
      </div>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-zinc-200 px-3 py-2.5">
      <span className="text-xs text-zinc-400">{label}</span>
      <span className="text-right text-sm font-medium text-zinc-800">{value}</span>
    </div>
  );
}

function Calendar({
  today,
  bookedRanges,
  start,
  end,
  onPick,
}: {
  today: string;
  bookedRanges: { start: string; end: string }[];
  start: string;
  end: string;
  onPick: (start: string, end: string) => void;
}) {
  const now = nowIceland();
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() });

  const unavailable = useMemo(() => {
    return (iso: string) =>
      iso < today || bookedRanges.some((r) => iso >= r.start && iso <= r.end);
  }, [today, bookedRanges]);

  // Czy w zakresie [s,e] są jakieś zajęte dni? (blokuje przeskoczenie rezerwacji)
  const rangeBlocked = (s: string, e: string) => {
    for (let d = s; d <= e; d = addDaysISO(d, 1)) if (unavailable(d)) return true;
    return false;
  };

  const pick = (iso: string) => {
    if (unavailable(iso)) return;
    if (!start || (start && end)) {
      onPick(iso, ""); // pierwszy klik = początek
    } else if (iso < start) {
      onPick(iso, "");
    } else if (rangeBlocked(start, iso)) {
      onPick(iso, ""); // zakres zawiera zajęte dni → restart od tej daty
    } else {
      onPick(start, iso);
    }
  };

  const inRange = (iso: string) => start && end && iso >= start && iso <= end;
  const cells = monthCells(cursor.y, cursor.m);

  return (
    <div className="rounded-xl border border-zinc-200 p-3">
      <div className="mb-2 flex items-center justify-between">
        <button
          onClick={() => setCursor((c) => (c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 }))}
          className="grid size-9 place-items-center rounded-lg text-zinc-500 hover:bg-zinc-100"
          aria-label="Poprzedni miesiąc"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="text-sm font-medium text-zinc-800">{monthLabel(cursor.y, cursor.m)}</span>
        <button
          onClick={() => setCursor((c) => (c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 }))}
          className="grid size-9 place-items-center rounded-lg text-zinc-500 hover:bg-zinc-100"
          aria-label="Następny miesiąc"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-zinc-400">
        {WD.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((iso, i) => {
          if (!iso) return <div key={i} />;
          const off = unavailable(iso);
          const sel = iso === start || iso === end;
          const mid = inRange(iso) && !sel;
          return (
            <button
              key={i}
              onClick={() => pick(iso)}
              disabled={off}
              className={`aspect-square rounded-lg text-sm transition-colors ${
                off
                  ? "cursor-not-allowed text-zinc-300 line-through"
                  : sel
                    ? "bg-zinc-900 font-semibold text-white"
                    : mid
                      ? "bg-zinc-900/10 text-zinc-900"
                      : "text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              {Number(iso.slice(8, 10))}
            </button>
          );
        })}
      </div>
    </div>
  );
}
