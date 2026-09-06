import "server-only";
import { BRAND, COMPANY } from "./company";
import { fmtDate } from "./dates";
import { isk } from "./contract";
import { REVOLUT_HANDLE, REVOLUT_URL } from "./payment";

// Transakcyjne maile przez Resend (HTTP API, bez SDK — minimalne zależności).
// Degradacja: brak RESEND_API_KEY → log + pominięcie, żeby decyzja zespołu i tak
// przeszła (mail można podłączyć później, dając klucz w env).
const RESEND_ENDPOINT = "https://api.resend.com/emails";

// Udostępniona mapa Google z polecanymi miejscami w Islandii (lista „Places to
// share", ~325 punktów: wodospady, parkingi, kawiarnie…). Wysyłana najemcom jako
// bonus turystyczny. Zmiana mapy = zmiana linku w jednej linii.
export const PLACES_MAP_URL = "https://maps.app.goo.gl/FFtgDkD2f3hvZqCp6";

// Prosta wersja tekstowa z HTML — maile multipart (html+text) rzadziej lądują
// w spamie (Gmail traktuje html-only jako sygnał ostrożności).
function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h1|h2|h3|li|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export type SendResult = { ok: boolean; error?: string };

// Bool-owy wrapper dla dotychczasowych wywołań. Gdy potrzebujesz POWODU porażki
// (żeby pokazać go w UI), użyj sendEmailResult.
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  return (await sendEmailResult(opts)).ok;
}

export async function sendEmailResult(opts: {
  to: string;
  subject: string;
  html: string;
  // Załączniki Resend: content = base64 zawartości pliku.
  attachments?: { filename: string; content: string }[];
}): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  // Nadawca: obie konwencje nazw (EMAIL_FROM oraz RESEND_FROM_EMAIL z vaulta/Vercela).
  // MUSI być z domeny zweryfikowanej w Resend (Twojej wlasnej) — onboarding@resend.dev
  // dowozi tylko na adres właściciela konta, nie do klientów.
  const from =
    process.env.EMAIL_FROM ||
    process.env.RESEND_FROM_EMAIL ||
    `${BRAND} <onboarding@resend.dev>`;
  if (!key) {
    console.warn(`[email] RESEND_API_KEY nie ustawiony — pomijam wysyłkę do ${opts.to}`);
    return { ok: false, error: "brak konfiguracji RESEND_API_KEY (env Vercela)" };
  }
  try {
    const r = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        text: htmlToText(opts.html),
        ...(opts.attachments?.length ? { attachments: opts.attachments } : {}),
      }),
    });
    if (!r.ok) {
      // Stały format + wartości jako osobne argumenty (bez interpolacji do stringa
      // formatu) — inaczej Semgrep słusznie widzi wzorzec „unsafe format string".
      const detail = await r.text().catch(() => "");
      console.error("[email] Resend odrzucił wiadomość. status=", r.status, detail);
      return { ok: false, error: `Resend HTTP ${r.status}${detail ? `: ${detail.slice(0, 160)}` : ""}` };
    }
    return { ok: true };
  } catch (e) {
    console.error("[email] wyjątek", e);
    return { ok: false, error: "błąd sieci przy wysyłce" };
  }
}

function wrap(heading: string, bodyHtml: string): string {
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;color:#18181b">
  <div style="padding:20px 0;text-align:center;font-weight:600;font-size:15px;color:#18181b">${BRAND}</div>
  <div style="border:1px solid #e4e4e7;border-radius:16px;padding:24px">
    <h1 style="margin:0 0 12px;font-size:18px">${heading}</h1>
    ${bodyHtml}
  </div>
  <div style="padding:16px 0;text-align:center;font-size:12px;color:#a1a1aa">${BRAND} · ${COMPANY.addressShort}</div>
</div>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#3f3f46">${text}</p>`;
}

// Blok płatności Revolut do maili: kod QR (obraz hostowany w apce — potrzebny
// absolutny URL, stąd `origin`) + link + dopisek. Klienci płacą głównie tym.
function paymentBlock(origin: string, amount?: number): string {
  const kwota =
    amount != null
      ? `<div style="font-size:16px;font-weight:600;margin:0 0 10px">Do zapłaty: ${isk(amount)}</div>`
      : "";
  return `<div style="border:1px solid #e4e4e7;border-radius:12px;padding:16px;margin:0 0 12px;text-align:center">
      <div style="font-weight:600;font-size:14px;margin:0 0 10px">Płatność — Revolut</div>
      ${kwota}
      <img src="${origin}/revolut-qr.png" alt="Kod QR Revolut ${REVOLUT_HANDLE}" width="180" height="171" style="display:block;margin:0 auto 10px;border:1px solid #e4e4e7;border-radius:10px" />
      <a href="${REVOLUT_URL}" style="display:inline-block;background:#18181b;color:#fff;text-decoration:none;padding:11px 18px;border-radius:10px;font-size:14px;font-weight:500">Zapłać przez Revolut</a>
      <div style="font-size:12px;color:#71717a;margin-top:10px">Zeskanuj kod lub kliknij — zapłacisz przez Revolut, także bez konta Revolut. (${REVOLUT_URL})</div>
    </div>`;
}

export function emailConfirmed(o: {
  vehicleName: string;
  start: string;
  end: string;
  // origin/amount zostawione dla zgodności wywołań. Model płatności: PRZY ODBIORZE
  // (bez przedpłaty Revolut w potwierdzeniu) — pokazujemy tylko kwotę do zapłaty.
  origin?: string;
  amount?: number;
}): { subject: string; html: string } {
  return {
    subject: `Twoja rezerwacja została potwierdzona — ${BRAND}`,
    html: wrap(
      "Rezerwacja potwierdzona ✅",
      p("Dziękujemy! Potwierdzamy Twoją rezerwację:") +
        `<div style="border:1px solid #e4e4e7;border-radius:12px;padding:14px;margin:0 0 12px;font-size:14px">
          <div><strong>${o.vehicleName}</strong></div>
          <div style="color:#71717a">${fmtDate(o.start)} – ${fmtDate(o.end)}</div>
        </div>` +
        p(
          `<strong>Płatność przy odbiorze pojazdu.</strong>${
            o.amount != null ? ` Do zapłaty: <strong>${isk(o.amount)}</strong>.` : ""
          }`,
        ) +
        p("Bądźmy w kontakcie — najłatwiej złapać nas na Messengerze lub WhatsAppie. Do zobaczenia!") +
        p(
          `🗺️ Na dobry początek — <a href="${PLACES_MAP_URL}" style="color:#2563eb">nasza mapa ulubionych miejsc w Islandii</a> (wodospady, widoki, kawiarnie).`,
        ),
    ),
  };
}

export function emailPayment(o: {
  origin: string;
  vehicleName?: string;
  start?: string;
  end?: string;
  amount?: number;
}): { subject: string; html: string } {
  const summary =
    o.vehicleName || o.start
      ? `<div style="border:1px solid #e4e4e7;border-radius:12px;padding:14px;margin:0 0 12px;font-size:14px">
          ${o.vehicleName ? `<div><strong>${o.vehicleName}</strong></div>` : ""}
          ${o.start && o.end ? `<div style="color:#71717a">${fmtDate(o.start)} – ${fmtDate(o.end)}</div>` : ""}
        </div>`
      : "";
  return {
    subject: `Płatność za rezerwację — ${BRAND}`,
    html: wrap(
      "Płatność za rezerwację",
      p("Poniżej znajdziesz dane do zapłaty za wynajem:") +
        summary +
        paymentBlock(o.origin, o.amount),
    ),
  };
}

// Mapa z polecanymi miejscami w Islandii (bonus turystyczny dla najemcy).
export function emailPlaces(o: { firstName?: string }): { subject: string; html: string } {
  const hi = o.firstName ? `Cześć ${o.firstName}!` : "Cześć!";
  return {
    subject: `Polecane miejsca w Islandii — ${BRAND}`,
    html: wrap(
      "Nasze ulubione miejsca w Islandii 🗺️",
      p(`${hi} Przygotowaliśmy dla Ciebie mapę z naszymi ulubionymi punktami — wodospady, widoki, parkingi, kawiarnie i miejscówki, których nie znajdziesz w typowym przewodniku.`) +
        `<div style="text-align:center;margin:0 0 12px">
          <a href="${PLACES_MAP_URL}" style="display:inline-block;background:#18181b;color:#fff;text-decoration:none;padding:13px 22px;border-radius:10px;font-size:14px;font-weight:600">Otwórz mapę miejsc</a>
        </div>` +
        p(
          `Jeśli przycisk nie działa, skopiuj adres:<br/><a href="${PLACES_MAP_URL}" style="color:#2563eb;word-break:break-all">${PLACES_MAP_URL}</a>`,
        ) +
        p("Zapisz mapę na telefonie i korzystaj offline. Udanej podróży!"),
    ),
  };
}

// Umowa do podpisu online — link do publicznej strony /sign/[token].
export function emailContractSign(o: {
  origin: string;
  token: string;
  number: string;
  vehicleName?: string;
  start?: string;
  end?: string;
}): { subject: string; html: string } {
  const link = `${o.origin}/sign/${o.token}`;
  const summary =
    o.vehicleName || o.start
      ? `<div style="border:1px solid #e4e4e7;border-radius:12px;padding:14px;margin:0 0 12px;font-size:14px">
          ${o.vehicleName ? `<div><strong>${o.vehicleName}</strong></div>` : ""}
          ${o.start && o.end ? `<div style="color:#71717a">${fmtDate(o.start)} – ${fmtDate(o.end)}</div>` : ""}
        </div>`
      : "";
  return {
    subject: `Umowa najmu nr ${o.number} do podpisu — ${BRAND}`,
    html: wrap(
      "Umowa gotowa do podpisu ✍️",
      p(
        `Przygotowaliśmy Twoją umowę najmu (nr <strong>${o.number}</strong>). ` +
          "Przeczytaj ją i podpisz online — zajmie to minutę:",
      ) +
        summary +
        `<div style="text-align:center;margin:0 0 12px">
          <a href="${link}" style="display:inline-block;background:#18181b;color:#fff;text-decoration:none;padding:13px 22px;border-radius:10px;font-size:14px;font-weight:600">Przeczytaj i podpisz umowę</a>
        </div>` +
        p(
          `Jeśli przycisk nie działa, skopiuj ten adres do przeglądarki:<br/><a href="${link}" style="color:#2563eb;word-break:break-all">${link}</a>`,
        ) +
        p("W razie pytań — złap nas na Messengerze lub WhatsAppie."),
    ),
  };
}

// Faktura w treści maila — inline style (klienty pocztowe wycinają <style>/klasy).
// Wartości podstawia serwer (sendInvoiceEmail) z zapisanej faktury.
export function emailInvoice(o: {
  number: string;
  date: string;
  sellerLegal: string;
  sellerKt: string;
  sellerVat: string;
  buyerName: string;
  vehicleName?: string;
  period?: string;
  net?: number;
  vat?: number;
  vatRate: number;
  gross?: number;
  term: string; // np. „przed wydaniem pojazdu (01.12.2026)"
  paymentRows: { label: string; value: string }[];
  currencyLine?: string; // np. „Równowartość: ≈ 523,40 EUR (kurs z dnia)"
}): { subject: string; html: string } {
  const row = (k: string, v: string) =>
    `<tr><td style="padding:6px 0;color:#71717a;font-size:13px">${k}</td><td style="padding:6px 0;text-align:right;font-size:13px;font-weight:500">${v}</td></tr>`;
  const desc = [o.vehicleName, o.period].filter(Boolean).join(" · ") || "Wynajem pojazdu";
  const payLines = [{ label: "Termin", value: o.term }, ...o.paymentRows]
    .map(
      (r) =>
        `<div style="margin-top:4px"><span style="color:#71717a">${r.label}:</span> ${r.value}</div>`,
    )
    .join("");
  return {
    subject: `Faktura nr ${o.number} — ${BRAND}`,
    html: wrap(
      "Faktura za wynajem",
      p(`W załączeniu faktura nr <strong>${o.number}</strong> z dnia ${o.date}.`) +
        `<div style="border:1px solid #e4e4e7;border-radius:12px;padding:14px 16px;margin:0 0 12px">
          <div style="font-size:13px;color:#71717a;margin:0 0 8px">Sprzedawca</div>
          <div style="font-size:14px">${o.sellerLegal}<br/>Kennitala: ${o.sellerKt} · VSK-nr: ${o.sellerVat}</div>
        </div>` +
        `<div style="border:1px solid #e4e4e7;border-radius:12px;padding:14px 16px;margin:0 0 12px">
          <div style="font-size:13px;color:#71717a;margin:0 0 8px">Nabywca</div>
          <div style="font-size:14px">${o.buyerName}</div>
        </div>` +
        `<table style="width:100%;border-collapse:collapse;margin:0 0 12px">
          ${row("Opis", desc)}
          ${row("Wartość netto", o.net != null ? isk(o.net) : "—")}
          ${row(`VAT (VSK) ${o.vatRate}%`, o.vat != null ? isk(o.vat) : "—")}
          <tr><td style="padding:10px 0 0;font-size:15px;font-weight:600;border-top:1px solid #e4e4e7">Do zapłaty (brutto)</td><td style="padding:10px 0 0;text-align:right;font-size:15px;font-weight:700;border-top:1px solid #e4e4e7">${o.gross != null ? isk(o.gross) : "—"}</td></tr>
          ${o.currencyLine ? `<tr><td></td><td style="text-align:right;font-size:12px;color:#71717a;padding-top:2px">${o.currencyLine}</td></tr>` : ""}
        </table>` +
        `<div style="border:1px solid #e4e4e7;border-radius:12px;padding:14px 16px;margin:0 0 12px;font-size:13px">
          <div style="color:#71717a;margin:0 0 6px">Płatność</div>
          ${payLines}
        </div>` +
        p("Faktura PDF w załączniku. W razie pytań odpisz na tego maila — chętnie pomożemy."),
    ),
  };
}

export function emailChanges(o: { reason: string; link: string }): {
  subject: string;
  html: string;
} {
  return {
    subject: `Prośba o uzupełnienie rezerwacji — ${BRAND}`,
    html: wrap(
      "Poprosiliśmy o zmianę danych",
      (o.reason ? p(`Uwaga od zespołu: <em>${o.reason}</em>`) : "") +
        p("Otwórz poniższy link, popraw dane i wyślij ponownie. Link jest ważny 60 minut:") +
        `<p style="margin:0 0 12px"><a href="${o.link}" style="display:inline-block;background:#18181b;color:#fff;text-decoration:none;padding:11px 18px;border-radius:10px;font-size:14px;font-weight:500">Dokończ rezerwację</a></p>` +
        p(`Jeśli przycisk nie działa, skopiuj adres: <br><span style="color:#71717a;word-break:break-all">${o.link}</span>`),
    ),
  };
}

export function emailRejected(o: { reason: string }): { subject: string; html: string } {
  return {
    subject: `W sprawie Twojej rezerwacji — ${BRAND}`,
    html: wrap(
      "Nie możemy przyjąć tej rezerwacji",
      p("Dziękujemy za zainteresowanie. Niestety nie możemy przyjąć tej rezerwacji.") +
        (o.reason ? p(`Powód: <em>${o.reason}</em>`) : "") +
        p("W razie pytań odpisz na tego maila — chętnie pomożemy znaleźć inny termin lub pojazd."),
    ),
  };
}
