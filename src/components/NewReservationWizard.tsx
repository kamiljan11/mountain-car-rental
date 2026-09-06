"use client";

import { useMemo, useState } from "react";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { useData } from "@/components/DataProvider";
import { useToast } from "@/components/Toast";
import { fmtDate, toISODate, todayISO } from "@/lib/dates";
import { useModalChrome } from "@/lib/useModalChrome";
import type { Booking, BookingStatus, BookingType } from "@/lib/types";
import { customerLabel } from "@/lib/types";
import CustomerFormModal, {
  type CustomerFormValues,
  type CustomerDocValues,
} from "@/components/CustomerFormModal";
import { reconcileCustomerDocuments } from "@/lib/customerDocs";
import { suggestName } from "@/lib/blockHints";
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
import { PICKUP_LOCATIONS } from "@/lib/company";

const STEPS = ["Termin i pojazd", "Oferta", "Klient", "Podsumowanie"];

const LOCATIONS = PICKUP_LOCATIONS;

const TYPE_LABEL: Record<BookingType, string> = {
  reservation: "Rezerwacja",
  block: "Blokada",
  service: "Serwis",
};

// Status w kreatorze: domyślnie „potwierdzona" (dogadka na messengerze = w 95% pewna,
// grunt to od razu wysłać maila) — „wstępna" zostaje w dropboxie w razie czego.
const STATUS_LABEL: Record<BookingStatus, string> = {
  tentative: "Wstępna — do potwierdzenia",
  confirmed: "Potwierdzona",
  active: "Aktywna (w trakcie)",
  completed: "Zakończona",
  cancelled: "Anulowana",
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
  initialType,
  initialCustomerName,
  initialDailyRate,
  onCreated,
  onClose,
}: {
  initialVehicleId?: string;
  initialDate?: string;
  editBooking?: Booking;
  // Do „zamiany blokady na rezerwację": wymuś typ, podpowiedz imię klienta i
  // stawkę wyciągnięte z notatki (importy z RentHelp mają je w tekście).
  initialType?: BookingType;
  initialCustomerName?: string;
  initialDailyRate?: number;
  // Woła się po utworzeniu NOWEJ rezerwacji (rodzic może od razu zaproponować
  // wysłanie potwierdzenia e-mail).
  onCreated?: (b: Booking) => void;
  onClose: () => void;
}) {
  const { vehicles, customers, bookings, addBooking, updateBooking, addCustomer } = useData();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  useModalChrome();
  const showToast = useToast();

  const today = todayISO(); // „dzisiaj" po islandzku (UTC), nie wg strefy przeglądarki
  const [vehicleId, setVehicleId] = useState(
    editBooking?.vehicleId ?? initialVehicleId ?? vehicles[0]?.id ?? "",
  );
  const [type, setType] = useState<BookingType>(
    initialType ?? editBooking?.type ?? "reservation",
  );
  const [start, setStart] = useState(editBooking?.start ?? initialDate ?? today);
  const [end, setEnd] = useState(
    editBooking?.end ?? addDays(initialDate ?? today, 2),
  );
  const [location, setLocation] = useState(editBooking?.location ?? LOCATIONS[0]);
  // Status rezerwacji — domyślnie potwierdzona; „wstępna" wybieralna z dropboxa.
  const [status, setStatus] = useState<BookingStatus>(editBooking?.status ?? "confirmed");
  // Godzina wydania/odbioru ("HH:MM") — opcjonalna, osobno od dat.
  const [pickupTime, setPickupTime] = useState(editBooking?.pickupTime ?? "");
  const [returnTime, setReturnTime] = useState(editBooking?.returnTime ?? "");

  // Trzymane jako tekst (nie number) — pole jest type="text", żeby dało się
  // wpisać przecinek/kropkę dziesiętną; parsowanie dopiero przy użyciu wartości.
  const [dailyRate, setDailyRate] = useState(
    String(editBooking?.dailyRate ?? initialDailyRate ?? 0),
  );
  const [deposit, setDeposit] = useState(String(editBooking?.deposit ?? 0));
  // Stawka VAT (%). Cena za dobę = netto; brutto = netto + VAT. Domyślnie 0%
  // (zw./eksport) — zespół świadomie przestawia na 24% (VSK standard), gdy dana
  // rezerwacja tego wymaga. Edycja istniejącej rezerwacji zachowuje jej zapisaną stawkę.
  const [vatRate, setVatRate] = useState<number>(editBooking?.vatRate ?? 0);
  // Stan licznika (km) — rozliczenie kilometrów z urzędem; puste = nie wpisany.
  const [odoStart, setOdoStart] = useState(
    editBooking?.odometerStart != null ? String(editBooking.odometerStart) : "",
  );
  const [odoEnd, setOdoEnd] = useState(
    editBooking?.odometerEnd != null ? String(editBooking.odometerEnd) : "",
  );

  const [customerId, setCustomerId] = useState<string | null>(editBooking?.customerId ?? null);
  // Przy edycji BLOKADY/serwisu (zamiana na rezerwację) podpowiadamy nazwę klienta
  // z notatki — jak „Przypisz klienta" z kalendarza — żeby konwersja działała też z
  // dashboardu / listy (nie tylko z dedykowanego przycisku w kalendarzu). W kroku
  // Klient wystarczy wtedy kliknąć „Nowy klient" (nazwa jest już wpisana) lub wybrać
  // istniejącego. Dla rezerwacji z klientem — pusto (nie nadpisujemy).
  const [customerSearch, setCustomerSearch] = useState(
    initialCustomerName ??
      (editBooking && editBooking.type !== "reservation"
        ? suggestName(editBooking.notes) ?? ""
        : ""),
  );
  // Pełny formularz nowego klienta (firma/osoba + adres + dowód/paszport/prawko z
  // datami) — ten sam modal co w zakładce Klienci, żeby komplet danych wpisać od razu.
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  // Nowy klient wpisany w kreatorze, ale JESZCZE NIEZAPISANY — materializuje się
  // dopiero przy „Potwierdź", RAZEM z rezerwacją. Dzięki temu wyjście z kreatora bez
  // zapisania rezerwacji nie zostawia „klienta-sieroty" ani duplikatów z prób.
  const [pendingCustomer, setPendingCustomer] = useState<{
    patch: CustomerFormValues;
    docs: CustomerDocValues;
  } | null>(null);

  const [notes, setNotes] = useState(editBooking?.notes ?? "");
  const [override, setOverride] = useState(false); // świadome zapisanie mimo kolizji

  const vehicle = vehicles.find((v) => v.id === vehicleId);
  // Liczba dni = noce (od–do, dzień zwrotu NIE wliczony) — 16.07→26.07 = 10 dni.
  // Godziny wydania/odbioru są tylko informacyjne — NIE wchodzą do liczenia dni
  // ani kwoty (kwota = stawka × days).
  const days = Math.max(
    1,
    differenceInCalendarDays(parseISO(end || start), parseISO(start)),
  );
  const rateNum = Number(dailyRate.replace(",", ".")) || 0;
  const depositNum = Number(deposit.replace(",", ".")) || 0;
  // VAT dotyczy tylko rezerwacji (blokady/serwis nie fakturujemy). netto = stawka × dni,
  // brutto = netto + VAT. Kwotę na zwykłej blokadzie zostawiamy jako netto (VAT 0).
  const effectiveVat = type === "reservation" ? vatRate : 0;
  const nettoTotal = rateNum * days;
  const vatAmount = Math.round((nettoTotal * effectiveVat) / 100);
  const total = nettoTotal + vatAmount; // brutto do zapłaty
  // Licznik: liczba całkowita km albo undefined (pole puste / nie-liczba).
  const odo = (v: string) => {
    const n = Math.round(Number(v.replace(/\s/g, "").replace(",", ".")));
    return v.trim() && Number.isFinite(n) && n >= 0 ? n : undefined;
  };

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
            c.name.toLowerCase().includes(q) ||
            c.phone?.toLowerCase().includes(q) ||
            c.companyName?.toLowerCase().includes(q),
        );
    return list.slice(0, 8);
  }, [customers, customerSearch]);

  const selectedCustomer = customers.find((c) => c.id === customerId);
  // Do wyświetlenia w kroku Klient/Podsumowanie: istniejący wybrany klient ALBO nowy
  // (niezapisany) z kreatora. `pending` = jeszcze nie ma go w bazie (zapis przy Potwierdź).
  const custDisplay = selectedCustomer
    ? { label: customerLabel(selectedCustomer), phone: selectedCustomer.phone, pending: false }
    : pendingCustomer
      ? {
          label: customerLabel({
            name: pendingCustomer.patch.name,
            companyName: pendingCustomer.patch.companyName,
          }),
          phone: pendingCustomer.patch.phone,
          pending: true,
        }
      : null;

  const dateOrderOk = !!start && !!end && parseISO(end) >= parseISO(start);
  const canNext =
    step === 0
      ? !!vehicleId && dateOrderOk && (conflicts.length === 0 || override)
      : step === 2
        ? type !== "reservation" || !!customerId || !!pendingCustomer
        : true;

  const next = () => canNext && setStep((s) => Math.min(3, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const submit = async () => {
    setSubmitting(true);
    // Nowy klient (niezapisany) materializuje się DOPIERO teraz — razem z rezerwacją,
    // żeby wyjście z kreatora bez zapisu nie zostawiało klienta-sieroty/duplikatu.
    let custId = customerId;
    if (type === "reservation" && pendingCustomer && !custId) {
      const c = await addCustomer({ ...pendingCustomer.patch, source: "Panel" });
      if (!c) {
        setSubmitting(false);
        return; // addCustomer pokazał już toast — nie tworzymy rezerwacji bez klienta
      }
      const { ok } = await reconcileCustomerDocuments(
        c.id,
        pendingCustomer.patch,
        pendingCustomer.docs,
        [],
      );
      if (!ok) {
        showToast(
          "error",
          "Klient zapisany, ale nie udało się zapisać dokumentów — uzupełnij w profilu klienta.",
        );
      }
      custId = c.id;
    }
    const payload = {
      vehicleId,
      customerId: type === "reservation" ? custId : null,
      type,
      start,
      end,
      pickupTime: pickupTime || undefined,
      returnTime: returnTime || undefined,
      dailyRate: rateNum || undefined,
      total: total || undefined,
      // VAT tylko przy rezerwacji; przy bloku/serwisie CZYŚCIMY kolumnę (null, nie
      // undefined) — inaczej zamiana rezerwacji na blokadę zostawiałaby nieaktualną
      // stawkę przy przeliczonym (zerowym VAT) total.
      vatRate: type === "reservation" ? vatRate : null,
      deposit: depositNum || undefined,
      odometerStart: odo(odoStart),
      odometerEnd: odo(odoEnd),
      // Miejsce wydania/odbioru tylko dla rezerwacji (blok/serwis go nie mają).
      location: type === "reservation" ? location : undefined,
      notes: notes || undefined,
    };
    // Status z dropboxa dotyczy rezerwacji; przy edycji blokady/serwisu statusu
    // nie ruszamy (undefined = pole pominięte w patchu).
    const statusPatch = type === "reservation" ? { status } : {};
    let saved: Booking | null = null;
    let success: boolean;
    if (editBooking) {
      success = await updateBooking(editBooking.id, { ...payload, ...statusPatch }, override);
    } else {
      saved = await addBooking(
        { ...payload, status: type === "reservation" ? status : "confirmed" },
        override,
      );
      success = !!saved;
    }
    setSubmitting(false);
    if (success) {
      setDone(true);
      if (saved && saved.type === "reservation" && saved.customerId) onCreated?.(saved);
    }
  };

  // Zapis pełnego formularza klienta (firma/osoba + adres + dowód/prawko) i od razu
  // wybór go do rezerwacji. Dokumenty lądują w osobnej tabeli — wspólny helper
  // (ten sam co w profilu klienta), więc daty prawka bez numeru już nie giną.
  const saveNewCustomer = async (
    patch: CustomerFormValues,
    docs: CustomerDocValues,
  ) => {
    // NIE zapisujemy klienta od razu — trzymamy dane i zapiszemy je RAZEM z rezerwacją
    // przy „Potwierdź" (koniec klientów-sierot / duplikatów, gdy ktoś wyjdzie bez zapisu).
    setPendingCustomer({ patch, docs });
    setCustomerId(null); // nowy klient wyklucza wybór istniejącego
    setShowCustomerForm(false);
    setCustomerSearch("");
    setStep(3); // dane klienta już wpisane → od razu Podsumowanie
  };

  return (
    <>
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

                  {type === "reservation" && (
                    <div>
                      <label className={labelCls}>Status rezerwacji</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as BookingStatus)}
                        className={inputCls}
                      >
                        <option value="confirmed">{STATUS_LABEL.confirmed}</option>
                        <option value="tentative">{STATUS_LABEL.tentative}</option>
                        {/* Przy edycji wpisu w innym stanie (aktywna/zakończona/anulowana)
                            pokazujemy go, żeby edycja nie zmieniała statusu po cichu. */}
                        {status !== "confirmed" && status !== "tentative" && (
                          <option value={status}>{STATUS_LABEL[status]}</option>
                        )}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className={labelCls}>Pojazd</label>
                    <select
                      value={vehicleId}
                      onChange={(e) => setVehicleId(e.target.value)}
                      className={inputCls}
                    >
                      {/* „inactive" = auta już nie w flocie — nie oferujemy ich przy
                          nowym wpisie; przy EDYCJI starego wpisu takiego auta opcja
                          zostaje, żeby select nie przestawił pojazdu po cichu. */}
                      {vehicles
                        .filter((v) => v.status !== "inactive" || v.id === vehicleId)
                        .map((v) => (
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

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Godzina wydania</label>
                      <input
                        type="time"
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Godzina odbioru</label>
                      <input
                        type="time"
                        value={returnTime}
                        onChange={(e) => setReturnTime(e.target.value)}
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
                    <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
                      <div className="flex gap-2">
                        <CircleAlert className="mt-0.5 size-4 shrink-0" />
                        <span>
                          Termin zajęty: {vehicle?.name} ma już {conflicts.length}{" "}
                          {conflicts.length === 1 ? "wpis" : "wpisy"} nakładając się na te
                          daty. Zapis jest zablokowany.
                        </span>
                      </div>
                      <label className="flex items-center gap-2 font-medium">
                        <input
                          type="checkbox"
                          checked={override}
                          onChange={(e) => setOverride(e.target.checked)}
                          className="size-4"
                        />
                        Zapisz mimo kolizji (świadomie)
                      </label>
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
                    {vehicle?.name}
                    {vehicle?.plate ? ` ${vehicle.plate}` : ""} na {days}{" "}
                    {days === 1 ? "dzień" : "dni"} ({fmtDate(start)} – {fmtDate(end)})
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Cena netto za dzień (ISK)</label>
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

                  {type === "reservation" && (
                    <div>
                      <label className={labelCls}>Stawka VAT (VSK)</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[24, 0].map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setVatRate(r)}
                            className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                              vatRate === r
                                ? "border-zinc-900 bg-zinc-900 text-white"
                                : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                            }`}
                          >
                            {r}%{" "}
                            <span
                              className={
                                vatRate === r ? "text-white/70" : "text-zinc-400"
                              }
                            >
                              {r === 24 ? "standard" : "zw. / eksport"}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="rounded-lg border border-zinc-200 p-4">
                    <div className="flex items-center justify-between text-sm text-zinc-500">
                      <span>
                        Netto ({rateNum.toLocaleString("pl-PL")} × {days})
                      </span>
                      <span>{nettoTotal.toLocaleString("pl-PL")} ISK</span>
                    </div>
                    {effectiveVat > 0 && (
                      <div className="mt-1.5 flex items-center justify-between text-sm text-zinc-500">
                        <span>VAT {effectiveVat}%</span>
                        <span>{vatAmount.toLocaleString("pl-PL")} ISK</span>
                      </div>
                    )}
                    <div className="mt-2 flex items-center justify-between border-t border-zinc-100 pt-2 text-sm font-semibold text-zinc-900">
                      <span>Suma całkowita{effectiveVat > 0 ? " (brutto)" : ""}</span>
                      <span>{total.toLocaleString("pl-PL")} ISK</span>
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>
                      Stan licznika (km) — do rozliczenia kilometrów z urzędem
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={odoStart}
                        onChange={(e) => setOdoStart(e.target.value)}
                        placeholder="przy wydaniu"
                        className={inputCls}
                      />
                      <input
                        type="text"
                        inputMode="numeric"
                        value={odoEnd}
                        onChange={(e) => setOdoEnd(e.target.value)}
                        placeholder="przy zwrocie"
                        className={inputCls}
                      />
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
                          onClick={() => {
                            setCustomerId(c.id);
                            setPendingCustomer(null);
                          }}
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
                              {customerLabel(c)}
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
                      onClick={() => setShowCustomerForm(true)}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 px-3 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
                    >
                      <UserPlus className="size-4" /> Nowy klient (pełne dane)
                    </button>

                    {pendingCustomer && (
                      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                        Nowy klient „{custDisplay?.label}&rdquo; — zapisze się razem z rezerwacją
                        po „Potwierdź&rdquo;. Wybór istniejącego klienta powyżej go zastąpi.
                      </p>
                    )}
                  </div>
                ))}

              {step === 3 && (
                <div className="space-y-3">
                  <div className="rounded-lg border border-zinc-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-zinc-400">Termin</div>
                        <div className="text-sm font-medium text-zinc-900">
                          {fmtDate(start)}
                          {pickupTime ? ` ${pickupTime}` : ""} – {fmtDate(end)}
                          {returnTime ? ` ${returnTime}` : ""}
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
                      {custDisplay ? (
                        <div className="flex items-center gap-3">
                          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-500">
                            {custDisplay.label.slice(0, 2).toUpperCase()}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-zinc-900">
                              {custDisplay.label}
                            </div>
                            {custDisplay.phone && (
                              <div className="text-xs text-zinc-400">
                                {custDisplay.phone}
                              </div>
                            )}
                            {custDisplay.pending && (
                              <div className="text-xs text-amber-600">
                                Nowy klient — zapisze się przy „Potwierdź&rdquo;.
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
                      <span className="text-zinc-500">Cena netto za dzień</span>
                      <span className="text-zinc-800">
                        {rateNum.toLocaleString("pl-PL")} ISK
                      </span>
                    </div>
                    {effectiveVat > 0 && (
                      <div className="mt-1.5 flex items-center justify-between text-sm">
                        <span className="text-zinc-500">VAT {effectiveVat}%</span>
                        <span className="text-zinc-800">
                          {vatAmount.toLocaleString("pl-PL")} ISK
                        </span>
                      </div>
                    )}
                    {depositNum > 0 && (
                      <div className="mt-1.5 flex items-center justify-between text-sm">
                        <span className="text-zinc-500">Kaucja</span>
                        <span className="text-zinc-800">
                          {depositNum.toLocaleString("pl-PL")} ISK
                        </span>
                      </div>
                    )}
                    <div className="mt-2 flex items-center justify-between border-t border-zinc-100 pt-2 text-sm font-semibold text-zinc-900">
                      <span>Suma całkowita{effectiveVat > 0 ? " (brutto)" : ""}</span>
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
    {/* Pełny formularz nowego klienta — nakładka nad kreatorem (ten sam modal co w
        zakładce Klienci). Firma/osoba, adres, dowód/paszport/prawko z datami. */}
    {showCustomerForm && (
      <CustomerFormModal
        title="Nowy klient"
        submitLabel="Zapisz i wybierz klienta"
        initial={{ name: customerSearch }}
        onClose={() => setShowCustomerForm(false)}
        onSubmit={saveNewCustomer}
      />
    )}
    </>
  );
}
