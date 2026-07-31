// Płatności — Revolut. Klienci płacą głównie tym (link „revolut.me/<handle>"
// przyjmuje wpłatę od każdego, też bez konta Revolut). Zmiana odbiorcy = zmiana
// handle w jednej linii.
export const REVOLUT_HANDLE = "m_krokoszynska";
export const REVOLUT_URL = `https://revolut.me/${REVOLUT_HANDLE}`;

// Gotowa wiadomość do klienta z linkiem do zapłaty (WhatsApp / SMS).
export function paymentMessage(opts: { name?: string; amount?: number } = {}): string {
  const first = opts.name?.trim().split(/\s+/)[0];
  const hi = first ? `Cześć ${first}!` : "Cześć!";
  const kwota = opts.amount
    ? ` (${Math.round(opts.amount).toLocaleString("pl-PL")} ISK)`
    : "";
  return `${hi} Płatność za wynajem${kwota} możesz zrobić wygodnie przez Revolut — nawet bez konta Revolut: ${REVOLUT_URL}`;
}

// Link do WhatsApp z gotową wiadomością; z numerem = od razu do tej osoby.
export function whatsappUrl(message: string, phone?: string): string {
  const digits = (phone ?? "").replace(/\D/g, "");
  const base = digits ? `https://wa.me/${digits}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(message)}`;
}
