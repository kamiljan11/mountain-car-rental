import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Proxy jest samowystarczalny (bez importów app-owych) — Turbopack najstabilniej
// obsługuje proxy, gdy nie ciągnie za sobą grafu modułów aplikacji.
const AUTH_COOKIE = "mcr_session";

function b64urlDecode(s: string): Uint8Array {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function b64urlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function verifySession(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const [data, sig] = token.split(".");
  if (!data || !sig) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(
      process.env.APP_AUTH_SECRET || "dev-insecure-secret-change-me",
    ),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBuf = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data),
  );
  const expected = b64urlEncode(new Uint8Array(sigBuf));
  if (sig.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff !== 0) return false;

  try {
    const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(data)));
    return !!payload.exp && Date.now() <= payload.exp;
  } catch {
    return false;
  }
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Nigdy nie bramkuj API (login/logout), zasobów Next ani plików statycznych.
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const authed = await verifySession(request.cookies.get(AUTH_COOKIE)?.value);

  // Strona logowania: zalogowanych odbij do apki, resztę wpuść.
  if (pathname === "/login") {
    if (authed) return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }

  // Wszystko inne wymaga sesji.
  if (!authed) {
    const url = new URL("/login", request.url);
    if (pathname !== "/") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
