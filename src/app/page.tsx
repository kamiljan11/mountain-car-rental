import Timeline from "@/components/Timeline";

export default function Page() {
  return (
    <div className="p-6">
      <div className="mb-5">
        <h1 className="text-xl font-semibold tracking-tight">Kalendarz</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Widok zasobów — 13 pojazdów × dni. Klik pustej komórki = nowa rezerwacja,
          klik paska = szczegóły.
        </p>
      </div>
      <Timeline />
    </div>
  );
}
