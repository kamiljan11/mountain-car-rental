const company = [
  { label: "Nazwa firmy", value: "Mountain Car Rental" },
  { label: "NIP", value: "———" },
  { label: "Adres", value: "———" },
  { label: "Telefon", value: "———" },
  { label: "E-mail", value: "———" },
  { label: "Konto bankowe", value: "———" },
];

export default function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="mb-1 text-xl font-semibold tracking-tight">Ustawienia</h1>
      <p className="mb-5 text-sm text-zinc-500">
        Dane firmy wykorzystywane na umowach najmu.
      </p>
      <div className="max-w-xl overflow-hidden rounded-xl border border-zinc-200 bg-white">
        {company.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between border-b border-zinc-100 px-5 py-3 text-sm last:border-b-0"
          >
            <span className="text-zinc-500">{row.label}</span>
            <span className="font-medium text-zinc-800">{row.value}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-zinc-400">
        Uzupełnimy przy podłączaniu generowania umów PDF (krok „Później” z planu).
      </p>
    </div>
  );
}
