import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE, verifySession } from "@/lib/auth";

// Ścieżki dostępne bez sesji aplikacji: sam ekran logowania, jego API, oraz
// publiczne zasoby statyczne (ikony/manifest/SW czytane przez przeglądarkę
// bez ciasteczka sesji w niektórych kontekstach).
const PUBLIC_PATHS = ["/login", "/api/login", "/api/login/google", "/api/logout"];
const PUBLIC_PREFIXES = ["/icons/", "/icon.png", "/apple-icon.png", "/manifest.webmanifest", "/sw.js", "/book/", "/api/book/", "/sign/", "/api/sign/"];

// Pliki serwowane z /public (rozpoznawane po rozszerzeniu) — np. /revolut-qr.png
// w mailu do klienta, ikony PWA, manifest, sw. Muszą być osiągalne bez sesji
// (są niewrażliwe), inaczej obrazek w mailu klienta = broken image.
const STATIC_ASSET = /\.(?:png|jpe?g|gif|svg|webp|ico|webmanifest|xml|txt|js|json|woff2?|ttf|otf)$/i;
function isStaticAsset(pathname: string) {
  return STATIC_ASSET.test(pathname);
}

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (isStaticAsset(pathname)) return true;
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

// JEDNO logowanie: tylko ekran /login aplikacji (hasło zespołu albo Google).
// Wcześniej stała tu druga, zewnętrzna ściana Basic Auth (okienko przeglądarki,
// BASIC_AUTH_USER/BASIC_AUTH_PASSWORD) — efektem było logowanie się DWA razy
// przy każdym wejściu. Usunięta świadomie: panel chroni podpisane ciasteczko
// sesji, a każde zapytanie do bazy i tak przechodzi przez requireSession()
// w db.ts. Zmienne BASIC_AUTH_* w Vercelu są od teraz nieużywane (można skasować).

// Optymistyczna bramka sesji aplikacji: samo sprawdzenie podpisu/ważności
// ciasteczka, bez dotykania bazy — właściwa autoryzacja per-zapytanie żyje
// w db.ts (requireSession()). To tylko przekierowuje niezalogowanych zamiast
// renderować pustą/zepsutą stronę.
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const session = await verifySession(request.cookies.get(AUTH_COOKIE)?.value);

  if (pathname === "/login") {
    if (session) return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }

  if (!isPublicPath(pathname) && !session) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
