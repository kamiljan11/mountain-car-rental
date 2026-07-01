import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Ściana z hasłem (Basic Auth). Login/hasło w zmiennych środowiskowych Vercela:
// BASIC_AUTH_USER, BASIC_AUTH_PASSWORD. Brak konfiguracji (np. lokalnie) = brak ściany.
export function proxy(request: NextRequest) {
  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASSWORD;
  if (!user || !pass) return NextResponse.next();

  const header = request.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    try {
      const decoded = atob(header.slice(6));
      const sep = decoded.indexOf(":");
      const u = decoded.slice(0, sep);
      const p = decoded.slice(sep + 1);
      if (u === user && p === pass) return NextResponse.next();
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

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
