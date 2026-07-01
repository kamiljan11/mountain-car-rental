"use client";

import { useState } from "react";
import { Car, Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

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
      const nextParam =
        new URLSearchParams(window.location.search).get("next") || "/";
      // Twarda nawigacja przez granicę auth — pewne odświeżenie sesji i shellu,
      // bez ryzyka odbicia przez zprefetchowany (niezalogowany) RSC.
      window.location.assign(nextParam.startsWith("/") ? nextParam : "/");
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

        <form
          onSubmit={submit}
          className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
        >
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
                className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
              >
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {err && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {err}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {loading ? "Logowanie…" : "Zaloguj się"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-zinc-400">
          Dostęp tylko dla zespołu Mountain Car Rental.
        </p>
      </div>
    </div>
  );
}
