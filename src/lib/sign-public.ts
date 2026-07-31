import "server-only";
import { supabaseAdmin as supabase } from "./supabase-admin";

// ⚠️ ŚCIEŻKA PUBLICZNA — jak book-public.ts: BEZ requireSession(), wołane
// wyłącznie z /api/sign/[token]. Każde zapytanie scoped po sign_token umowy.
// E-podpis wg wzorca ContractGate (Reykjawwwik/maskalkulator): treść umowy +
// dane podpisującego + checkbox → zapis podpisu z timestampem i metadanymi.
// „Wersjonowanie": podpis wiąże się z konkretnym rekordem, którego `content`
// jest niezmiennym snapshotem — zmiana umowy = nowy rekord + nowy link (aneks).

export type PublicContractView = {
  status: "awaiting" | "signed" | "expired";
  number: string;
  content: string; // pełny HTML umowy (snapshot z momentu wysłania)
  signedAt?: string;
  signerName?: string;
};

export type SignResult =
  | { ok: true; signedAt: string }
  | { ok: false; message: string };

export async function getPublicContract(
  token: string,
): Promise<{ ok: true; view: PublicContractView } | { ok: false }> {
  if (!supabase || !token) return { ok: false };

  const { data: c, error } = await supabase
    .from("contracts")
    .select("number, content, status, signed_at, signer_name, sign_expires_at")
    .eq("sign_token", token)
    .maybeSingle();
  if (error || !c || !c.content) return { ok: false };

  // Podpisana umowa zostaje dostępna pod linkiem (klient ma swój egzemplarz);
  // wygasa tylko NIEPODPISANY link.
  const signed = c.status === "signed" && c.signed_at;
  const expired =
    !signed &&
    c.sign_expires_at != null &&
    new Date(c.sign_expires_at).getTime() < Date.now();

  return {
    ok: true,
    view: {
      status: signed ? "signed" : expired ? "expired" : "awaiting",
      number: c.number,
      content: c.content,
      signedAt: signed ? String(c.signed_at) : undefined,
      signerName: signed ? (c.signer_name ?? undefined) : undefined,
    },
  };
}

export async function submitContractSignature(
  token: string,
  signerName: string,
  meta: { ip?: string; userAgent?: string },
): Promise<SignResult> {
  if (!supabase || !token) return { ok: false, message: "Link nieprawidłowy." };
  const name = signerName.trim();
  if (name.length < 3) {
    return { ok: false, message: "Wpisz pełne imię i nazwisko." };
  }

  const { data: c } = await supabase
    .from("contracts")
    .select("id, status, signed_at, sign_expires_at, content")
    .eq("sign_token", token)
    .maybeSingle();
  if (!c) return { ok: false, message: "Link nieprawidłowy." };
  if (c.status === "signed" || c.signed_at) {
    return { ok: false, message: "Ta umowa została już podpisana." };
  }
  if (c.sign_expires_at != null && new Date(c.sign_expires_at).getTime() < Date.now()) {
    return { ok: false, message: "Link do podpisu wygasł — poproś o nowy." };
  }

  const signedAt = new Date().toISOString();
  const signerMeta = [meta.ip && `ip=${meta.ip}`, meta.userAgent && `ua=${meta.userAgent}`]
    .filter(Boolean)
    .join(" | ")
    .slice(0, 500);

  // Wstrzyknij podpis klienta W TREŚĆ umowy (miejsce „data i podpis Najemcy") —
  // renderowany „ręczną" czcionką (.signature). Nazwa podpisującego pochodzi z
  // formularza (dane niezaufane) → ESCAPE przed wstawieniem w HTML (anti-XSS).
  const esc = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  const [yy, mm, dd] = signedAt.slice(0, 10).split("-");
  const dateStr = `${dd}.${mm}.${yy}`;
  const sigHtml = `<span class="sigval sig-najemca signature">${esc(name)}<small>podpisano elektronicznie ${dateStr}</small></span>`;
  // Nowe umowy mają marker; starsze (sprzed tej zmiany) go nie mają → treść bez
  // zmian, ale status i tak przechodzi na „podpisana".
  const signedContent =
    typeof c.content === "string" && c.content.includes('<span class="sigval sig-najemca"></span>')
      ? c.content.replace('<span class="sigval sig-najemca"></span>', sigHtml)
      : c.content;

  // Idempotentnie: podpisze tylko wiersz, który wciąż jest niepodpisany
  // (wyścig dwóch kliknięć → drugi dostanie 0 wierszy i komunikat wyżej).
  const { data: updated, error } = await supabase
    .from("contracts")
    .update({
      status: "signed",
      signed_at: signedAt,
      signer_name: name,
      signer_meta: signerMeta || null,
      content: signedContent,
    })
    .eq("sign_token", token)
    .is("signed_at", null)
    .select("id");
  if (error || !updated || updated.length === 0) {
    return { ok: false, message: "Nie udało się zapisać podpisu — spróbuj ponownie." };
  }
  return { ok: true, signedAt };
}
