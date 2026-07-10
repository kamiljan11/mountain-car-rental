import "server-only";
import { fmtDate } from "./dates";

// Transakcyjne maile przez Resend (HTTP API, bez SDK — minimalne zależności).
// Degradacja: brak RESEND_API_KEY → log + pominięcie, żeby decyzja zespołu i tak
// przeszła (mail można podłączyć później, dając klucz w env).
const RESEND_ENDPOINT = "https://api.resend.com/emails";

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Mountain Car Rental <onboarding@resend.dev>";
  if (!key) {
    console.warn(`[email] RESEND_API_KEY nie ustawiony — pomijam wysyłkę do ${opts.to}`);
    return false;
  }
  try {
    const r = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: opts.to, subject: opts.subject, html: opts.html }),
    });
    if (!r.ok) {
      console.error(`[email] Resend ${r.status}`, await r.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (e) {
    console.error("[email] wyjątek", e);
    return false;
  }
}

function wrap(heading: string, bodyHtml: string): string {
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;color:#18181b">
  <div style="padding:20px 0;text-align:center;font-weight:600;font-size:15px;color:#18181b">Mountain Car Rental</div>
  <div style="border:1px solid #e4e4e7;border-radius:16px;padding:24px">
    <h1 style="margin:0 0 12px;font-size:18px">${heading}</h1>
    ${bodyHtml}
  </div>
  <div style="padding:16px 0;text-align:center;font-size:12px;color:#a1a1aa">Mountain Car Rental · Njarðarbraut 6i, 260 Njarðvík</div>
</div>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#3f3f46">${text}</p>`;
}

export function emailConfirmed(o: {
  vehicleName: string;
  start: string;
  end: string;
}): { subject: string; html: string } {
  return {
    subject: "Twoja rezerwacja została potwierdzona — Mountain Car Rental",
    html: wrap(
      "Rezerwacja potwierdzona ✅",
      p("Dziękujemy! Potwierdzamy Twoją rezerwację:") +
        `<div style="border:1px solid #e4e4e7;border-radius:12px;padding:14px;margin:0 0 12px;font-size:14px">
          <div><strong>${o.vehicleName}</strong></div>
          <div style="color:#71717a">${fmtDate(o.start)} – ${fmtDate(o.end)}</div>
        </div>` +
        p("Skontaktujemy się w sprawie odbioru pojazdu. Do zobaczenia!"),
    ),
  };
}

export function emailChanges(o: { reason: string; link: string }): {
  subject: string;
  html: string;
} {
  return {
    subject: "Prośba o uzupełnienie rezerwacji — Mountain Car Rental",
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
    subject: "W sprawie Twojej rezerwacji — Mountain Car Rental",
    html: wrap(
      "Nie możemy przyjąć tej rezerwacji",
      p("Dziękujemy za zainteresowanie. Niestety nie możemy przyjąć tej rezerwacji.") +
        (o.reason ? p(`Powód: <em>${o.reason}</em>`) : "") +
        p("W razie pytań odpisz na tego maila — chętnie pomożemy znaleźć inny termin lub pojazd."),
    ),
  };
}
