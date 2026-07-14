"use client";

import { useEffect, useState } from "react";
import {
  prepareBookingConfirmationAction,
  sendBookingConfirmationAction,
} from "@/lib/actions";
import { useToast } from "@/components/Toast";
import { useData } from "@/components/DataProvider";
import { useModalChrome } from "@/lib/useModalChrome";
import { Loader2, X, Check, Mail, AlertTriangle } from "lucide-react";

// Okienko „wyślij potwierdzenie rezerwacji na e-mail": podgląd treści maila,
// edytowalny adres odbiorcy („popraw email") i akcje Akceptuj / Odrzuć.
export default function SendConfirmationModal({
  bookingId,
  onClose,
}: {
  bookingId: string;
  onClose: () => void;
}) {
  const showToast = useToast();
  const { refresh } = useData();
  useModalChrome();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [sending, setSending] = useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    let alive = true;
    prepareBookingConfirmationAction({ bookingId, origin }).then((r) => {
      if (!alive) return;
      if (!r.ok) setErr(r.message || "Nie udało się przygotować maila.");
      else {
        setTo(r.to || "");
        setSubject(r.subject || "");
        setHtml(r.html || "");
      }
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [bookingId, origin]);

  const send = async () => {
    if (!to.trim()) {
      showToast("error", "Podaj adres e-mail odbiorcy.");
      return;
    }
    setSending(true);
    const r = await sendBookingConfirmationAction({ bookingId, origin, to: to.trim() });
    setSending(false);
    if (r.ok) {
      showToast("success", `Potwierdzenie wysłane do ${to.trim()}.`);
      // Serwer podniósł status wstępna→potwierdzona — dociągamy świeże dane,
      // żeby „Do potwierdzenia" i statusy w listach odznaczyły się od razu.
      void refresh();
      onClose();
    } else {
      showToast("error", r.message || "Nie udało się wysłać.");
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-stretch justify-center bg-zinc-900/40 p-0 sm:items-center sm:p-6">
      <div className="flex h-full w-full max-w-2xl flex-col overflow-hidden bg-white shadow-xl sm:h-[88vh] sm:rounded-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-5 py-4">
          <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900">
            <Mail className="size-4 text-zinc-400" /> Wyślij potwierdzenie rezerwacji
          </h2>
          <button
            onClick={() => !sending && onClose()}
            aria-label="Zamknij"
            className="grid size-9 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
          >
            <X className="size-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center gap-2 text-sm text-zinc-400">
            <Loader2 className="size-5 animate-spin" /> Przygotowuję treść…
          </div>
        ) : err ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center text-sm text-zinc-500">
            <AlertTriangle className="size-7 text-amber-500" />
            {err}
          </div>
        ) : (
          <>
            <div className="shrink-0 space-y-2 border-b border-zinc-100 px-5 py-3">
              <label className="block text-xs font-medium text-zinc-500">
                Do (możesz poprawić adres)
              </label>
              <input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="klient@example.com"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
              />
              <div className="truncate text-xs text-zinc-400">Temat: {subject}</div>
            </div>
            <div className="min-h-0 flex-1 bg-zinc-50 p-3">
              <iframe
                title="Podgląd maila"
                srcDoc={html}
                className="h-full w-full rounded-lg border border-zinc-200 bg-white"
              />
            </div>
          </>
        )}

        <div className="flex shrink-0 justify-end gap-2 border-t border-zinc-200 px-5 py-4">
          <button
            onClick={() => !sending && onClose()}
            disabled={sending}
            className="rounded-lg border border-zinc-200 px-3 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-40"
          >
            Odrzuć
          </button>
          <button
            onClick={send}
            disabled={sending || loading || !!err}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {sending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            Akceptuj — wyślij potwierdzenie
          </button>
        </div>
      </div>
    </div>
  );
}
