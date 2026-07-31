"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Car, Loader2, Eye, EyeOff } from "lucide-react";
import InstallAppButton from "@/components/InstallAppButton";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

type GoogleCredentialResponse = { credential: string };
type GoogleIdServices = {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string;
        callback: (r: GoogleCredentialResponse) => void;
      }) => void;
      renderButton: (
        parent: HTMLElement,
        options: Record<string, string | number>,
      ) => void;
    };
  };
};
declare global {
  interface Window {
    google?: GoogleIdServices;
  }
}

function isSafeNextPath(path: string): boolean {
  // Musi być ścieżką względną tego samego originu — nie protokołem-względnym
  // ("//evil.com") ani ukośnikiem wstecznym ("/\evil.com", normalizowanym przez
  // niektóre przeglądarki do "//evil.com") — inaczej to open redirect.
  return path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/\\");
}

function goToNext() {
  const nextParam = new URLSearchParams(window.location.search).get("next") || "/";
  // Twarda nawigacja przez granicę auth — pewne odświeżenie sesji i shellu,
  // bez ryzyka odbicia przez zprefetchowany (niezalogowany) RSC.
  window.location.assign(isSafeNextPath(nextParam) ? nextParam : "/");
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [gsiReady, setGsiReady] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const submitGoogle = async (r: GoogleCredentialResponse) => {
    setErr("");
    setLoading(true);
    try {
      const res = await fetch("/api/login/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: r.credential }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(j?.message || "Nie udało się zalogować przez Google.");
        setLoading(false);
        return;
      }
      goToNext();
    } catch {
      setErr("Błąd połączenia. Spróbuj ponownie.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!gsiReady || !GOOGLE_CLIENT_ID || !googleBtnRef.current) return;
    const google = window.google;
    if (!google) return;
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: submitGoogle,
    });
    google.accounts.id.renderButton(googleBtnRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      shape: "pill",
      width: 328,
      text: "signin_with",
      locale: "pl",
    });
  }, [gsiReady]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const r = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErr(j?.message || "Nie udało się zalogować.");
        setLoading(false);
        return;
      }
      goToNext();
    } catch {
      setErr("Błąd połączenia. Spróbuj ponownie.");
      setLoading(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-base outline-none transition-colors focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-100 to-zinc-200 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 grid size-14 place-items-center rounded-2xl bg-zinc-900 text-white shadow-lg">
            <Car className="size-7" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900">
            Mountain Car Rental
          </h1>
          <p className="text-sm text-zinc-500">Rental Manager — panel wewnętrzny</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          {err && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {err}
            </div>
          )}

          {GOOGLE_CLIENT_ID && (
            <>
              <div className="mb-4 flex justify-center" ref={googleBtnRef} />
              <div className="mb-4 flex items-center gap-3 text-xs text-zinc-400">
                <div className="h-px flex-1 bg-zinc-200" />
                lub e-mailem
                <div className="h-px flex-1 bg-zinc-200" />
              </div>
            </>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                E-mail
              </label>
              <input
                type="email"
                inputMode="email"
                autoComplete="username"
                autoFocus
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ty@firma.pl"
                className={inputCls}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Hasło
              </label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputCls} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Ukryj hasło" : "Pokaż hasło"}
                  className="absolute right-1 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-3 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              {loading ? "Logowanie…" : "Zaloguj się"}
            </button>
          </form>
        </div>

        <InstallAppButton className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm font-medium text-zinc-600 shadow-sm transition-colors hover:bg-zinc-50 hover:text-zinc-900" />

        <p className="mt-4 text-center text-xs text-zinc-400">
          Dostęp tylko dla zespołu Mountain Car Rental.
        </p>
      </div>

      {GOOGLE_CLIENT_ID && (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onReady={() => setGsiReady(true)}
        />
      )}
    </div>
  );
}
