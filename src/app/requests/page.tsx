"use client";

import { useEffect, useMemo, useState } from "react";
import { useData } from "@/components/DataProvider";
import { useToast } from "@/components/Toast";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  fetchBookingLinksAction,
  createBookingLinkAction,
  decideBookingRequestAction,
} from "@/lib/actions";
import type { BookingLink } from "@/lib/types";
import { fmtDate } from "@/lib/dates";
import {
  Plus,
  Link2,
  Copy,
  Check,
  X,
  Clock,
  Loader2,
  Car,
  Mail,
  Phone,
  MapPin,
  IdCard,
} from "lucide-react";

const inputCls =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-base outline-none transition-colors focus:border-zinc-900 md:text-sm focus:ring-2 focus:ring-zinc-900/10";
const labelCls = "mb-1 block text-xs font-medium text-zinc-600";

export default function RequestsPage() {
  const { vehicles, refresh } = useData();
  const showToast = useToast();
  const vById = useMemo(() => new Map(vehicles.map((v) => [v.id, v])), [vehicles]);

  const [links, setLinks] = useState<BookingLink[] | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [decision, setDecision] = useState<{ link: BookingLink; kind: "request_changes" | "reject" } | null>(null);
  const [confirmLink, setConfirmLink] = useState<BookingLink | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const reload = () => {
    fetchBookingLinksAction().then(setLinks);
  };
  useEffect(() => {
    let alive = true;
    fetchBookingLinksAction().then((r) => {
      if (alive) setLinks(r);
    });
    return () => {
      alive = false;
    };
  }, []);

  const vehName = (id: string) => vById.get(id)?.name ?? "Pojazd";
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const decide = async (
    link: BookingLink,
    kind: "confirm" | "request_changes" | "reject",
    adminNote?: string,
  ) => {
    setBusyId(link.id);
    const res = await decideBookingRequestAction({ id: link.id, decision: kind, adminNote, origin });
    setBusyId(null);
    if (!res.ok) {
      showToast("error", res.message || "Nie udało się.");
      return;
    }
    // Mail mógł nie wyjść (brak/zła konfiguracja Resend) — nie udawaj, że wyszedł,
    // i pokaż KONKRETNY powód, żeby dało się to naprawić bez zgadywania.
    const mailNote =
      res.emailSent === false
        ? ` (mail NIE wyszedł${res.emailError ? `: ${res.emailError}` : ""})`
        : " — mail wysłany.";
    showToast(
      res.emailSent === false ? "error" : "success",
      (kind === "confirm"
        ? "Potwierdzono — rezerwacja utworzona"
        : kind === "reject"
          ? "Odrzucono"
          : "Wysłano nowy link do klienta") + mailNote,
    );
    setDecision(null);
    reload();
    // Nowy klient + rezerwacja muszą pojawić się w Kalendarzu/Rezerwacjach/pickerach.
    if (kind === "confirm") await refresh();
  };

  const submitted = (links ?? []).filter((l) => l.status === "submitted");
  const active = (links ?? []).filter(
    (l) => l.status === "awaiting_client" && new Date(l.expiresAt).getTime() > new Date().getTime(),
  );
  const history = (links ?? []).filter(
    (l) =>
      l.status === "confirmed" ||
      l.status === "rejected" ||
      l.status === "changes_requested" ||
      (l.status === "awaiting_client" && new Date(l.expiresAt).getTime() <= new Date().getTime()),
  );

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Wnioski</h1>
          <p className="text-sm text-zinc-500">
            Linki do samodzielnej rezerwacji przez klienta i zgłoszenia do decyzji.
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
        >
          <Plus className="size-4" /> Nowy link rezerwacji
        </button>
      </div>

      {links === null ? (
        <div className="flex items-center gap-2 py-16 text-zinc-400">
          <Loader2 className="size-5 animate-spin" /> Wczytywanie…
        </div>
      ) : (
        <div className="space-y-8">
          {/* Do decyzji */}
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Do decyzji ({submitted.length})
            </h2>
            {submitted.length === 0 ? (
              <p className="rounded-xl border border-dashed border-zinc-200 px-4 py-8 text-center text-sm text-zinc-400">
                Brak zgłoszeń oczekujących na decyzję.
              </p>
            ) : (
              <div className="grid gap-3 lg:grid-cols-2">
                {submitted.map((l) => (
                  <div key={l.id} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <Car className="size-4 text-zinc-400" />
                      <span className="text-sm font-semibold text-zinc-900">{vehName(l.vehicleId)}</span>
                      <span className="ml-auto rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                        czeka na decyzję
                      </span>
                    </div>
                    <div className="mb-3 rounded-lg bg-zinc-50 px-3 py-2 text-center text-sm font-medium text-zinc-800">
                      {l.reqStart && l.reqEnd ? `${fmtDate(l.reqStart)} – ${fmtDate(l.reqEnd)}` : "—"}
                    </div>
                    <dl className="space-y-1.5 text-sm">
                      <Field icon={<Check className="size-3.5" />} v={l.clientName} />
                      <Field icon={<Mail className="size-3.5" />} v={l.clientEmail} />
                      <Field icon={<Phone className="size-3.5" />} v={l.clientPhone} />
                      <Field icon={<MapPin className="size-3.5" />} v={l.clientAddress} />
                      <Field
                        icon={<IdCard className="size-3.5" />}
                        v={[
                          l.clientIdNumber &&
                            `Dowód ${l.clientIdNumber}${l.clientIdIssued ? ` (${fmtDate(l.clientIdIssued)} – ${l.clientIdExpires ? fmtDate(l.clientIdExpires) : "…"})` : ""}`,
                          l.clientLicense &&
                            `PJ ${l.clientLicense}${l.clientLicenseIssued ? ` (${fmtDate(l.clientLicenseIssued)} – ${l.clientLicenseExpires ? fmtDate(l.clientLicenseExpires) : "…"})` : ""}`,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      />
                    </dl>
                    {l.clientNote && (
                      <p className="mt-2 rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-600">{l.clientNote}</p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => setConfirmLink(l)}
                        disabled={busyId === l.id}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        {busyId === l.id ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                        Potwierdź
                      </button>
                      <button
                        onClick={() => setDecision({ link: l, kind: "request_changes" })}
                        disabled={busyId === l.id}
                        className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                      >
                        Poproś o zmianę
                      </button>
                      <button
                        onClick={() => setDecision({ link: l, kind: "reject" })}
                        disabled={busyId === l.id}
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        Odrzuć
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Aktywne linki */}
          {active.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Aktywne linki ({active.length})
              </h2>
              <div className="space-y-2">
                {active.map((l) => (
                  <ActiveLinkRow key={l.id} link={l} vehName={vehName(l.vehicleId)} origin={origin} onCopied={() => showToast("success", "Skopiowano link.")} />
                ))}
              </div>
            </section>
          )}

          {/* Historia */}
          {history.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Historia ({history.length})
              </h2>
              <div className="overflow-x-auto rounded-xl border border-zinc-200">
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="bg-zinc-50 text-left text-xs text-zinc-500">
                    <tr>
                      <th className="px-3 py-2 font-medium">Pojazd</th>
                      <th className="px-3 py-2 font-medium">Klient</th>
                      <th className="px-3 py-2 font-medium">Termin</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((l) => (
                      <tr key={l.id} className="border-t border-zinc-100">
                        <td className="px-3 py-2 text-zinc-800">{vehName(l.vehicleId)}</td>
                        <td className="px-3 py-2 text-zinc-600">{l.clientName ?? "—"}</td>
                        <td className="px-3 py-2 text-zinc-600">
                          {l.reqStart && l.reqEnd ? `${fmtDate(l.reqStart)} – ${fmtDate(l.reqEnd)}` : "—"}
                        </td>
                        <td className="px-3 py-2">
                          <StatusBadge status={l.status} expiresAt={l.expiresAt} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      )}

      {showNew && (
        <NewLinkModal
          onClose={() => setShowNew(false)}
          onCreated={() => {
            setShowNew(false);
            reload();
          }}
        />
      )}
      {decision && (
        <DecisionModal
          kind={decision.kind}
          busy={busyId === decision.link.id}
          onClose={() => setDecision(null)}
          onConfirm={(note) => decide(decision.link, decision.kind, note)}
        />
      )}

      {confirmLink && (
        <ConfirmDialog
          title="Potwierdzić rezerwację?"
          description="Utworzy klienta i rezerwację w kalendarzu oraz wyśle klientowi maila z potwierdzeniem i linkiem do płatności."
          summary={[
            { label: "Klient", value: confirmLink.clientName || "—" },
            { label: "E-mail", value: confirmLink.clientEmail || "—" },
            { label: "Pojazd", value: vehName(confirmLink.vehicleId) },
            {
              label: "Termin",
              value:
                confirmLink.reqStart && confirmLink.reqEnd
                  ? `${fmtDate(confirmLink.reqStart)} – ${fmtDate(confirmLink.reqEnd)}`
                  : "—",
            },
          ]}
          confirmLabel="Potwierdź rezerwację"
          onConfirm={() => decide(confirmLink, "confirm")}
          onClose={() => setConfirmLink(null)}
        />
      )}
    </div>
  );
}

function Field({ icon, v }: { icon: React.ReactNode; v?: string }) {
  if (!v) return null;
  return (
    <div className="flex items-center gap-2 text-zinc-700">
      <span className="text-zinc-400">{icon}</span>
      <span className="truncate">{v}</span>
    </div>
  );
}

function StatusBadge({ status, expiresAt }: { status: string; expiresAt: string }) {
  const expired = status === "awaiting_client" && new Date(expiresAt).getTime() <= new Date().getTime();
  const s = expired ? "expired" : status;
  const map: Record<string, { label: string; cls: string }> = {
    confirmed: { label: "potwierdzona", cls: "bg-green-100 text-green-700" },
    rejected: { label: "odrzucona", cls: "bg-red-100 text-red-700" },
    changes_requested: { label: "poproszono o zmianę", cls: "bg-blue-100 text-blue-700" },
    expired: { label: "wygasł", cls: "bg-zinc-100 text-zinc-500" },
  };
  const m = map[s] ?? { label: s, cls: "bg-zinc-100 text-zinc-600" };
  return <span className={`rounded px-2 py-0.5 text-xs font-medium ${m.cls}`}>{m.label}</span>;
}

function ActiveLinkRow({
  link,
  vehName,
  origin,
  onCopied,
}: {
  link: BookingLink;
  vehName: string;
  origin: string;
  onCopied: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const url = `${origin}/book/${link.token}`;
  const minsLeft = Math.max(0, Math.round((new Date(link.expiresAt).getTime() - new Date().getTime()) / 60000));
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      onCopied();
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // brak dostępu do schowka — ignorujemy
    }
  };
  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3">
      <Link2 className="size-4 shrink-0 text-zinc-400" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-zinc-800">{vehName}</div>
        <div className="flex items-center gap-1 text-xs text-zinc-400">
          <Clock className="size-3" /> wygasa za {minsLeft} min · czeka aż klient wypełni
        </div>
      </div>
      <button
        onClick={copy}
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
      >
        {copied ? <Check className="size-4 text-green-600" /> : <Copy className="size-4" />}
        {copied ? "Skopiowano" : "Kopiuj link"}
      </button>
    </div>
  );
}

function NewLinkModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { vehicles } = useData();
  const showToast = useToast();
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id ?? "");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [rate, setRate] = useState("");
  const [deposit, setDeposit] = useState("");
  const [note, setNote] = useState("");
  const [creating, setCreating] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const create = async () => {
    if (!vehicleId) return;
    setCreating(true);
    const res = await createBookingLinkAction({
      vehicleId,
      suggestedStart: start || undefined,
      suggestedEnd: end || undefined,
      suggestedDailyRate: rate ? Number(rate.replace(",", ".")) : undefined,
      suggestedDeposit: deposit ? Number(deposit.replace(",", ".")) : undefined,
      noteToClient: note || undefined,
    });
    setCreating(false);
    if (!res.ok || !res.token) {
      showToast("error", res.message || "Nie udało się utworzyć linku.");
      return;
    }
    setUrl(`${window.location.origin}/book/${res.token}`);
  };

  const copy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <Modal title="Nowy link rezerwacji" onClose={onClose}>
      {url ? (
        <div className="space-y-4">
          <div className="flex flex-col items-center py-2 text-center">
            <div className="mb-3 grid size-14 place-items-center rounded-full bg-green-100 text-green-600">
              <Check className="size-7" />
            </div>
            <p className="text-sm text-zinc-600">
              Link gotowy. Ważny 60 minut — wyślij go klientowi (WhatsApp, SMS, e-mail).
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
            <span className="min-w-0 flex-1 truncate text-sm text-zinc-700">{url}</span>
            <button
              onClick={copy}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Skopiowano" : "Kopiuj"}
            </button>
          </div>
          <button
            onClick={onCreated}
            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Gotowe
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Pojazd (który klient rezerwuje)</label>
            <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} className={inputCls}>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} {v.plate ? `— ${v.plate}` : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Sugerowana data od (opc.)</label>
              <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Sugerowana data do (opc.)</label>
              <input type="date" value={end} min={start} onChange={(e) => setEnd(e.target.value)} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Cena/dzień (opc.)</label>
              <input inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Kaucja (opc.)</label>
              <input inputMode="decimal" value={deposit} onChange={(e) => setDeposit(e.target.value)} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Notatka dla klienta (opc.)</label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="np. auto z namiotem dachowym; odbiór po 15:00"
              className={inputCls}
            />
          </div>
          <button
            onClick={create}
            disabled={!vehicleId || creating}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {creating ? <Loader2 className="size-4 animate-spin" /> : <Link2 className="size-4" />}
            Wygeneruj link
          </button>
        </div>
      )}
    </Modal>
  );
}

function DecisionModal({
  kind,
  busy,
  onClose,
  onConfirm,
}: {
  kind: "request_changes" | "reject";
  busy: boolean;
  onClose: () => void;
  onConfirm: (note: string) => void;
}) {
  const [note, setNote] = useState("");
  const isChange = kind === "request_changes";
  return (
    <Modal title={isChange ? "Poproś o zmianę danych" : "Odrzuć zgłoszenie"} onClose={onClose}>
      <div className="space-y-3">
        <p className="text-sm text-zinc-600">
          {isChange
            ? "Klient dostanie e-mail z nowym linkiem (ważnym 60 min) i Twoją uwagą. Jego dane będą już wpisane — poprawi tylko to, co trzeba."
            : "Klient dostanie e-mail z informacją. Możesz dodać powód."}
        </p>
        <div>
          <label className={labelCls}>{isChange ? "Co poprawić?" : "Powód (opcjonalnie)"}</label>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={isChange ? "np. podaj poprawny nr prawa jazdy" : "np. pojazd niedostępny w tym terminie"}
            className={inputCls}
            autoFocus
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onConfirm(note)}
            disabled={busy || (isChange && !note.trim())}
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50 ${
              isChange ? "bg-zinc-900 hover:bg-zinc-800" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            {isChange ? "Wyślij nowy link" : "Odrzuć i powiadom"}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-zinc-200 px-4 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50"
          >
            Anuluj
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-zinc-900/30 px-4 py-6 md:items-center">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Zamknij"
            className="grid size-9 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  );
}
