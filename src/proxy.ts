import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE, verifySession } from "@/lib/auth";

// Ścieżki dostępne bez sesji aplikacji: sam ekran logowania, jego API, oraz
// publiczne zasoby statyczne (ikony/manifest/SW czytane przez przeglądarkę
// bez ciasteczka sesji w niektórych kontekstach).
const PUBLIC_PATHS = ["/login", "/api/login", "/api/login/google", "/api/logout"];
const PUBLIC_PREFIXES = ["/icons/", "/icon.png", "/apple-icon.png", "/manifest.webmanifest", "/sw.js"];

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

// Ściana z hasłem (Basic Auth). Login/hasło w zmiennych środowiskowych Vercela:
// BASIC_AUTH_USER, BASIC_AUTH_PASSWORD. Brak konfiguracji (np. lokalnie) = brak ściany.
async function checkBasicAuth(request: NextRequest): Promise<NextResponse | null> {
  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASSWORD;
  if (!user || !pass) return null;

  const header = request.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    try {
      const decoded = atob(header.slice(6));
      const sep = decoded.indexOf(":");
      const u = decoded.slice(0, sep);
      const p = decoded.slice(sep + 1);
      if (u === user && p === pass) return null;
    } catch {
      // malformed header → poniżej zwracamy 401
    }
  }

  return new NextResponse("Wymagane logowanie.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Mountain Car Rental", charset="UTF-8"',
    },
  });
}

// Optymistyczna bramka sesji aplikacji: samo sprawdzenie podpisu/ważności
// ciasteczka, bez dotykania bazy — właściwa autoryzacja per-zapytanie żyje
// w db.ts (requireSession()). To tylko przekierowuje niezalogowanych zamiast
// renderować pustą/zepsutą stronę.
export async function proxy(request: NextRequest) {
  const basicAuthBlock = await checkBasicAuth(request);
  if (basicAuthBlock) return basicAuthBlock;

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
