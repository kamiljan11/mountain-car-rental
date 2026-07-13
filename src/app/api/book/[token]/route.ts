import { NextResponse } from "next/server";
import { getPublicBookingLink, submitBookingRequest } from "@/lib/book-public";

export const runtime = "nodejs";

// Publiczny (niezalogowany) endpoint. Dostęp wyłącznie po tokenie z URL; cała
// walidacja i scoping żyją w src/lib/book-public.ts.
export async function GET(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const result = await getPublicBookingLink(token);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, message: "Link nieprawidłowy lub wygasł." },
      { status: 404 },
    );
  }
  return NextResponse.json({ ok: true, view: result.view });
}

export async function POST(req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Błędne dane." }, { status: 400 });
  }

  const str = (v: unknown) => (v == null ? undefined : String(v));
  const result = await submitBookingRequest(
    token,
    {
      name: String(body?.name ?? ""),
      email: String(body?.email ?? ""),
      phone: str(body?.phone),
      address: str(body?.address),
      idNumber: str(body?.idNumber),
      idIssued: str(body?.idIssued),
      idExpires: str(body?.idExpires),
      license: str(body?.license),
      licenseIssued: str(body?.licenseIssued),
      licenseExpires: str(body?.licenseExpires),
      note: str(body?.note),
    },
    String(body?.start ?? ""),
    String(body?.end ?? ""),
  );
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
