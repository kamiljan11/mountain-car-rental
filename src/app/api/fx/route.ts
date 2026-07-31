import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { getFxRates } from "@/lib/fx";

export const runtime = "nodejs";

// Kursy dla żywego przelicznika na stronie Faktury. Klient bije w self (/api/fx),
// serwer odpytuje zewnętrzne API — zgodnie z CSP (connect-src 'self').
export async function GET() {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const fx = await getFxRates();
  if (!fx) return NextResponse.json({ ok: false, message: "Kursy niedostępne" }, { status: 502 });
  return NextResponse.json({ ok: true, ...fx });
}
