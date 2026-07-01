const company = [
  { label: "Nazwa (marka)", value: "Mountain Car Rental" },
  { label: "Podmiot / nazwa formalna", value: "Mountain All Service ehf." },
  { label: "Kennitala", value: "6907250450" },
  { label: "VSK-nr (VAT)", value: "158052" },
  { label: "Adres", value: "Njarðarbraut 3i, 260 Njarðvík" },
  { label: "E-mail", value: "mountainallservice@gmail.com" },
  { label: "Strona", value: "mountaincar.is" },
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
        Po podłączeniu Supabase te dane trafią do tabeli ustawień i będą edytowalne z poziomu apki.
      </p>
    </div>
  );
}
