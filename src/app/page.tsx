import Timeline from "@/components/Timeline";

export default function Page() {
  return (
    <div className="p-3 sm:p-6">
      <div className="mb-2 sm:mb-5">
        <h1 className="text-xl font-semibold tracking-tight">Kalendarz</h1>
        <p className="mt-0.5 hidden text-sm text-zinc-500 sm:block">
          Widok zasobów — pojazdy × dni. Klik pustej komórki = nowa rezerwacja,
          klik paska = szczegóły.
        </p>
      </div>
      <Timeline />
    </div>
  );
}
