import RevolutPay from "@/components/RevolutPay";
import { COMPANY, webLabel } from "@/lib/company";

// Podglad danych z src/lib/company.ts — tam sie je zmienia, tu tylko widac.
const company = [
  { label: "Nazwa (marka)", value: COMPANY.brand },
  { label: "Podmiot / nazwa formalna", value: COMPANY.legalName },
  { label: "Kennitala", value: COMPANY.kennitala },
  { label: "VSK-nr (VAT)", value: COMPANY.vat },
  { label: "Adres", value: COMPANY.addressShort },
  { label: "E-mail", value: COMPANY.email },
  { label: "Strona", value: webLabel(COMPANY) },
];

export default function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="mb-1 text-xl font-semibold tracking-tight">Ustawienia</h1>
      <p className="mb-5 text-sm text-zinc-500">
        Dane firmy wykorzystywane na umowach i protokołach.
      </p>
      <div className="max-w-xl overflow-hidden rounded-xl border border-zinc-200 bg-white">
        {company.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-4 border-b border-zinc-100 px-5 py-3 text-sm last:border-b-0"
          >
            <span className="text-zinc-500">{row.label}</span>
            <span className="text-right font-medium text-zinc-800">{row.value}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-zinc-400">
        Dane pochodzą z pliku src/lib/company.ts. Stawiasz aplikację u siebie? Podmieniasz je tam.
      </p>

      <div className="mt-8 max-w-xl">
        <h2 className="mb-1 text-sm font-semibold text-zinc-900">Płatność — Revolut</h2>
        <p className="mb-3 text-sm text-zinc-500">
          Kod QR i link, które podajesz klientom do zapłaty (te same, które są na
          Checkliście i przy rezerwacji).
        </p>
        <RevolutPay />
      </div>
    </div>
  );
}
