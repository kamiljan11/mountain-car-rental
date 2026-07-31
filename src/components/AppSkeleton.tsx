"use client";

import { useIsMobile } from "@/lib/useIsMobile";

// Szkielet w kształcie aplikacji na czas pierwszego fetcha — zamiast spinnera.
// Postrzegany jako szybszy, bo pokazuje UKŁAD, który zaraz się wypełni.
// Czysty CSS (klasa `.sk` = shimmer w globals.css), zero zależności.

function Bar({ className = "" }: { className?: string }) {
  return <div className={`sk rounded-md ${className}`} />;
}

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <Bar className="h-3 w-24" />
      <Bar className="mt-3 h-7 w-16" />
      <Bar className="mt-2 h-3 w-32" />
    </div>
  );
}

export default function AppSkeleton() {
  const isMobile = useIsMobile();

  // Czytnik ekranu dostaje komunikat, którego wcześniej pilnował widoczny napis
  // „Wczytywanie danych…" — same kształty skeletonu nic mu nie mówią.
  const srStatus = (
    <span className="sr-only" role="status">
      Wczytywanie danych…
    </span>
  );

  const content = (
    <main className="min-w-0 flex-1 p-6">
      <Bar className="h-6 w-40" />
      <Bar className="mt-2 h-4 w-56" />
      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <Bar className="h-4 w-32" />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="mt-3 flex items-center gap-3">
              <Bar className="size-4 shrink-0 rounded-full" />
              <Bar className="h-4 flex-1" />
              <Bar className="h-4 w-20 shrink-0" />
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <Bar className="h-4 w-28" />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="mt-3 flex items-center gap-3">
              <Bar className="h-4 flex-1" />
              <Bar className="h-4 w-16 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );

  if (isMobile) {
    return (
      <>
        {srStatus}
        <div className="flex min-h-screen flex-col" aria-hidden="true">
          {/* pasek górny (mobile nav) */}
          <div className="flex items-center justify-between bg-zinc-900 px-4 py-3">
            <Bar className="h-4 w-40 !bg-zinc-700" />
            <Bar className="size-8 !bg-zinc-700" />
          </div>
          {content}
        </div>
      </>
    );
  }

  return (
    <>
      {srStatus}
      <div className="flex min-h-screen flex-row" aria-hidden="true">
        {/* sylwetka sidebara */}
        <div className="w-56 shrink-0 border-r border-zinc-200 bg-white p-4">
          <Bar className="h-5 w-32" />
          <div className="mt-6 space-y-1.5">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <Bar key={i} className="h-9 w-full" />
            ))}
          </div>
        </div>
        {content}
      </div>
    </>
  );
}
