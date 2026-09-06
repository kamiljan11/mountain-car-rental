"use client";

import { use, useEffect, useState } from "react";
import { CheckCircle2, Clock, FileSignature, Loader2, ShieldCheck } from "lucide-react";
import { BRAND } from "@/lib/company";

// Publiczna strona e-podpisu umowy (wzorzec ContractGate z Reykjawwwik:
// treść umowy + dane podpisującego + checkbox → elektroniczny podpis).
// Standalone jak /book/[token] — bez DataProvider/nawigacji/auth (AppShell).

type View = {
  status: "awaiting" | "signed" | "expired";
  number: string;
  content: string;
  signedAt?: string;
  signerName?: string;
};

const inputCls =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-3 text-base outline-none transition-colors focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10";

function fmtTs(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" });
}

export default function SignContractPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [view, setView] = useState<View | null>(null);
  const [failed, setFailed] = useState(false);

  const [signerName, setSignerName] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/sign/${token}`)
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        if (j?.ok) setView(j.view);
        else setFailed(true);
      })
      .catch((e) => {
        console.error("SignPage: failed to load contract", e);
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, [token]);

  const submit = async () => {
    if (!accepted || signerName.trim().length < 3 || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch(`/api/sign/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signerName: signerName.trim() }),
      });
      const j = await r.json();
      if (j?.ok) {
        setView((v) =>
          v ? { ...v, status: "signed", signedAt: j.signedAt, signerName: signerName.trim() } : v,
        );
        window.scrollTo({ top: 0 });
      } else {
        setError(j?.message ?? "Nie udało się zapisać podpisu.");
      }
    } catch (e) {
      console.error("SignPage: submit failed", e);
      setError("Błąd połączenia — spróbuj ponownie.");
    } finally {
      setSubmitting(false);
    }
  };

  const shell = (children: React.ReactNode) => (
    <div className="min-h-screen bg-zinc-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 text-center">
          <div className="text-lg font-semibold tracking-tight text-zinc-900">
            {BRAND}
          </div>
          <div className="text-sm text-zinc-500">Podpis umowy online</div>
        </div>
        {children}
      </div>
    </div>
  );

  if (failed) {
    return shell(
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center">
        <Clock className="mx-auto mb-3 size-8 text-zinc-300" />
        <h1 className="mb-1 text-lg font-semibold text-zinc-900">
          Link nieprawidłowy lub wygasł
        </h1>
        <p className="text-sm text-zinc-500">
          Poproś wypożyczalnię o nowy link do podpisu umowy.
        </p>
      </div>,
    );
  }

  if (!view) {
    return shell(
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-400">
        <Loader2 className="size-5 animate-spin" /> Wczytywanie umowy…
      </div>,
    );
  }

  const signedBanner = view.status === "signed" && (
    <div className="mb-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
      <div>
        <div className="text-sm font-semibold text-emerald-800">Umowa podpisana</div>
        <div className="text-xs text-emerald-700">
          {view.signerName} · {view.signedAt ? fmtTs(view.signedAt) : ""} · umowa nr {view.number}
        </div>
        <div className="mt-0.5 text-xs text-emerald-700/80">
          Ten link pozostaje aktywny — możesz tu wrócić do treści swojej umowy.
        </div>
      </div>
    </div>
  );

  const expiredBanner = view.status === "expired" && (
    <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <Clock className="mt-0.5 size-5 shrink-0 text-amber-600" />
      <div>
        <div className="text-sm font-semibold text-amber-800">Link do podpisu wygasł</div>
        <div className="text-xs text-amber-700">
          Poniżej możesz przeczytać umowę, ale żeby ją podpisać — poproś wypożyczalnię o nowy link.
        </div>
      </div>
    </div>
  );

  return shell(
    <>
      {signedBanner}
      {expiredBanner}

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        {/* `content` to snapshot HTML generowany WYŁĄCZNIE serwerowo przez buildFilled
            (contract.ts), który escapuje wszystkie dane klienta (fix P0 z audytu XSS).
            Ten sam render co na zalogowanej stronie Kontrakt — nie przyjmujemy tu
            żadnego HTML od użytkownika. */}
        <div className="contract" dangerouslySetInnerHTML={{ __html: view.content }} />
      </div>

      {view.status === "awaiting" && (
        <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="mb-1 flex items-center gap-2 text-base font-semibold text-zinc-900">
            <FileSignature className="size-4 text-zinc-400" /> Podpis elektroniczny
          </h2>
          <p className="mb-4 text-xs text-zinc-500">
            Wpisz pełne imię i nazwisko — zapisujemy je razem z datą i godziną jako Twój
            podpis elektroniczny pod umową nr {view.number}.
          </p>

          <label className="mb-1.5 block text-xs font-medium text-zinc-600">
            Imię i nazwisko (jak w dokumencie tożsamości)
          </label>
          <input
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
            placeholder="np. Jan Kowalski"
            autoComplete="name"
            className={inputCls}
          />

          <label className="mt-4 flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 size-5 shrink-0 accent-zinc-900"
            />
            <span className="text-sm text-zinc-700">
              Przeczytałem/-am umowę i <strong>akceptuję jej warunki wraz z OWU</strong>.
              Rozumiem, że złożenie podpisu elektronicznego jest równoznaczne z podpisaniem
              umowy.
            </span>
          </label>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <button
            onClick={submit}
            disabled={!accepted || signerName.trim().length < 3 || submitting}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-3.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-40"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ShieldCheck className="size-4" />
            )}
            Podpisuję umowę
          </button>
          <p className="mt-2 text-center text-[11px] text-zinc-400">
            Data, godzina i adres urządzenia zostaną zapisane jako potwierdzenie podpisu.
          </p>
        </div>
      )}
    </>,
  );
}
