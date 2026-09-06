"use client";

import { useToast } from "@/components/Toast";
import { isk } from "@/lib/contract";
import {
  REVOLUT_HANDLE,
  REVOLUT_URL,
  paymentMessage,
  whatsappUrl,
} from "@/lib/payment";
import { CreditCard, Copy, MessageCircle, Mail, Loader2 } from "lucide-react";

export default function RevolutPay({
  amount,
  phone,
  customerName,
  compact,
  onEmail,
  emailBusy,
}: {
  amount?: number;
  phone?: string;
  customerName?: string;
  compact?: boolean;
  // Opcjonalny dodatkowy kanał: „Wyślij mailem" obok WhatsAppa. Pokazywany tylko
  // gdy rodzic go poda (ma bookingId + e-mail klienta do wysyłki serwerowej).
  onEmail?: () => void;
  emailBusy?: boolean;
}) {
  const showToast = useToast();

  const msg = paymentMessage({ name: customerName, amount });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(REVOLUT_URL);
      showToast("success", "Skopiowano link Revolut.");
    } catch (e) {
      console.error("RevolutPay: clipboard write failed", e);
      showToast("error", "Nie udało się skopiować.");
    }
  };

  if (compact) {
    return (
      <a
        href={whatsappUrl(msg, phone)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
      >
        <MessageCircle className="size-4" /> Poproś o płatność (Revolut)
      </a>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-zinc-900">
        <CreditCard className="size-4 text-zinc-400" /> Płatność — Revolut
      </div>

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/revolut-qr.png"
          alt="Kod QR Revolut @m_krokoszynska do płatności"
          className="w-36 shrink-0 rounded-lg border border-zinc-200"
        />
        <div className="min-w-0 flex-1 text-center sm:text-left">
          {amount != null && (
            <div className="mb-1 text-base font-semibold text-zinc-900">
              Do zapłaty: {isk(amount)}
            </div>
          )}
          <div className="text-sm text-zinc-600">
            Zeskanuj kod albo wyślij link — klient zapłaci przez Revolut, też bez
            konta Revolut.
          </div>
          <div className="mt-1 text-xs text-zinc-400">@{REVOLUT_HANDLE}</div>
        </div>
      </div>

      <div
        className={`mt-3 grid grid-cols-1 gap-2 ${onEmail ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}
      >
        <button
          onClick={copy}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          <Copy className="size-4" /> Kopiuj link
        </button>
        <a
          href={whatsappUrl(msg, phone)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
        >
          <MessageCircle className="size-4" /> Wyślij przez WhatsApp
        </a>
        {onEmail && (
          <button
            onClick={onEmail}
            disabled={emailBusy}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
          >
            {emailBusy ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
            Wyślij mailem
          </button>
        )}
      </div>
    </div>
  );
}
