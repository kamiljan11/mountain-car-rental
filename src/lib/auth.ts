// Lekka sesja oparta o podpisane ciasteczko (HMAC-SHA256, Web Crypto — działa
// zarówno w runtime Node, jak i edge). Nie trzyma nic po stronie serwera.

import { cookies } from "next/headers";

const enc = new TextEncoder();
const dec = new TextDecoder();

export const AUTH_COOKIE = "mcr_session";
// Panel wewnętrzny, jeden zaufany użytkownik — długa sesja, żeby logowanie nie znikało.
export const AUTH_MAX_AGE = 60 * 60 * 24 * 365; // 365 dni

function secret() {
  const s = process.env.APP_AUTH_SECRET;
  if (s) return s;
  // Fail-closed w produkcji: bez sekretu podpisy sesji byłyby do podrobienia
  // (znanym domyślnym kluczem) → pełne obejście panelu. Lokalnie dopuszczamy
  // dev-default, w produkcji rzucamy zamiast po cichu użyć publicznego stringa.
  if (process.env.NODE_ENV === "production") {
    throw new Error("APP_AUTH_SECRET nie jest ustawiony w produkcji.");
  }
  return "dev-insecure-secret-change-me";
}

function b64urlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): Uint8Array {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function sign(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return b64urlEncode(new Uint8Array(sig));
}

export async function createSession(email: string): Promise<string> {
  const payload = { u: email, exp: Date.now() + AUTH_MAX_AGE * 1000 };
  const data = b64urlEncode(enc.encode(JSON.stringify(payload)));
  return `${data}.${await sign(data)}`;
}

export async function verifySession(
  token: string | undefined | null,
): Promise<{ u: string } | null> {
  if (!token) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;

  const expected = await sign(data);
  if (sig.length !== expected.length) return null;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff !== 0) return null;

  try {
    const payload = JSON.parse(dec.decode(b64urlDecode(data)));
    if (!payload.exp || Date.now() > payload.exp) return null;
    return { u: String(payload.u) };
  } catch {
    return null;
  }
}

// Do użytku w Server Components / Server Actions (nie w middleware/proxy —
// tam czytaj ciasteczko wprost z `request.cookies`, żeby uniknąć next/headers).
export async function getSession(): Promise<{ u: string } | null> {
  const jar = await cookies();
  return verifySession(jar.get(AUTH_COOKIE)?.value);
}

// Warstwa dostępu do danych (db.ts) wywołuje to na starcie każdej funkcji —
// to jest rzeczywista bramka, nie tylko strona logowania. Rzuca zamiast
// przekierowywać, bo wołający to zwykle Server Action z komponentu klienckiego,
// nie renderowana strona.
export async function requireSession(): Promise<{ u: string }> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}
