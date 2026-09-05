import { NextResponse } from "next/server";
import { getPublicContract, submitContractSignature } from "@/lib/sign-public";

export const runtime = "nodejs";

// Publiczny (niezalogowany) endpoint podpisu umowy. Dostęp wyłącznie po tokenie
// z URL; walidacja i scoping żyją w src/lib/sign-public.ts (wzorzec /api/book).
export async function GET(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const result = await getPublicContract(token);
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
  } catch (e) {
    console.error("POST /api/sign/[token]: invalid JSON body", e);
    return NextResponse.json({ ok: false, message: "Błędne dane." }, { status: 400 });
  }
  const result = await submitContractSignature(token, String(body?.signerName ?? ""), {
    ip:
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      undefined,
    userAgent: req.headers.get("user-agent") ?? undefined,
  });
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
