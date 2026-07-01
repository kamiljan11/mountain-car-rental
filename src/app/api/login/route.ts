import { NextResponse } from "next/server";
import { createSession, AUTH_COOKIE, AUTH_MAX_AGE } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Błędne dane." }, { status: 400 });
  }

  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");

  const U = (process.env.APP_USER ?? "").trim().toLowerCase();
  const P = process.env.APP_PASSWORD ?? "";

  if (!U || !P) {
    return NextResponse.json(
      { ok: false, message: "Logowanie nie jest skonfigurowane na serwerze." },
      { status: 500 },
    );
  }

  if (email !== U || password !== P) {
    return NextResponse.json(
      { ok: false, message: "Nieprawidłowy e-mail lub hasło." },
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
