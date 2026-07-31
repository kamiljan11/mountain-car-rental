import { NextResponse } from "next/server";
import { createSession, AUTH_COOKIE, AUTH_MAX_AGE } from "@/lib/auth";

export const runtime = "nodejs";

// Weryfikacja tokenu ID Google przez oficjalny endpoint tokeninfo — bez
// dodatkowej zależności JWKS. Dopuszczalne przy niskim wolumenie logowań
// (jeden zaufany użytkownik); Google waliduje tu podpis i czas życia tokenu.
async function verifyGoogleIdToken(idToken: string): Promise<{
  email: string;
  email_verified: string;
  aud: string;
} | null> {
  const res = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
  );
  if (!res.ok) return null;
  return res.json();
}

export async function POST(req: Request) {
  let body: { credential?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Błędne dane." }, { status: 400 });
  }

  const idToken = String(body?.credential ?? "");
  if (!idToken) {
    return NextResponse.json({ ok: false, message: "Brak tokenu Google." }, { status: 400 });
  }

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
  const allowed = (process.env.APP_USER ?? "").trim().toLowerCase();
  if (!clientId || !allowed) {
    return NextResponse.json(
      { ok: false, message: "Logowanie Google nie jest skonfigurowane na serwerze." },
      { status: 500 },
    );
  }

  const claims = await verifyGoogleIdToken(idToken);
  const email = claims?.email?.trim().toLowerCase();

  if (
    !claims ||
    claims.aud !== clientId ||
    claims.email_verified !== "true" ||
    email !== allowed
  ) {
    return NextResponse.json(
      { ok: false, message: "To konto Google nie ma dostępu do panelu." },
      { status: 401 },
    );
  }

  const token = await createSession(email);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_MAX_AGE,
  });
  return res;
}
