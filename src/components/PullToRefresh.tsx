"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useData } from "@/components/DataProvider";
import { useIsMobile } from "@/lib/useIsMobile";
import { RefreshCw } from "lucide-react";

// Pociągnij w dół u góry listy → dociągnij świeże dane z bazy (bez przeładowania strony).
// Powód: apka bywa otwarta godzinami w PWA i pokazywała nieaktualny stan (np. licznik
// wpisany na innym urządzeniu). To jest szybsze niż pełny reload i nie gubi kontekstu.
const THRESHOLD = 70; // px oporu, po którym puszczenie odświeża
const MAX_PULL = 90;

export default function PullToRefresh() {
  const { refresh } = useData();
  const isMobile = useIsMobile();
  const [pull, setPull] = useState(0);
  const [busy, setBusy] = useState(false);

  const startY = useRef<number | null>(null);
  const pullRef = useRef(0);
  const busyRef = useRef(false);
  // `refresh` z DataProvidera dostaje nową tożsamość przy KAŻDYM renderze (obiekt
  // kontekstu budowany od nowa), więc trzymanie go w zależnościach efektu
  // przepinałoby 4 listenery przy każdej zmianie danych (np. każde odhaczenie
  // punktu checklisty). Ref = listenery podpinane raz.
  const refreshRef = useRef(refresh);
  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  const setPullBoth = useCallback((v: number) => {
    pullRef.current = v;
    setPull(v);
  }, []);

  useEffect(() => {
    if (!isMobile) return;

    // Modal otwarty (useModalChrome blokuje scroll body) → nie przechwytuj gestu.
    const modalOpen = () => document.body.style.overflow === "hidden";

    const onStart = (e: TouchEvent) => {
      if (busyRef.current || modalOpen() || window.scrollY > 0) {
        startY.current = null;
        return;
      }
      startY.current = e.touches[0]?.clientY ?? null;
    };

    const onMove = (e: TouchEvent) => {
      if (startY.current == null || busyRef.current) return;
      const y = e.touches[0]?.clientY ?? 0;
      const dy = y - startY.current;
      // tylko ciągnięcie W DÓŁ i tylko gdy nadal jesteśmy na samej górze
      if (dy > 0 && window.scrollY === 0) {
        setPullBoth(Math.min(dy * 0.5, MAX_PULL));
      } else if (dy <= 0) {
        setPullBoth(0);
      }
    };

    const onEnd = () => {
      if (startY.current == null) return;
      startY.current = null;
      if (pullRef.current >= THRESHOLD && !busyRef.current) {
        busyRef.current = true;
        setBusy(true);
        setPullBoth(THRESHOLD);
        void refreshRef
          .current()
          .catch(() => {
            /* błąd pokaże DataProvider/toast — tu tylko kończymy gest */
          })
          .finally(() => {
            busyRef.current = false;
            setBusy(false);
            setPullBoth(0);
          });
      } else {
        setPullBoth(0);
      }
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
    window.addEventListener("touchcancel", onEnd);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onEnd);
    };
  }, [isMobile, setPullBoth]);

  if (!isMobile || pull === 0) return null;

  const ready = pull >= THRESHOLD;
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center"
      style={{ transform: `translateY(${pull - 34}px)` }}
      aria-hidden="true"
    >
      <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 shadow-sm">
        <RefreshCw
          className={`size-4 text-zinc-500 ${busy ? "animate-spin" : ""}`}
          style={busy ? undefined : { transform: `rotate(${pull * 3}deg)` }}
        />
        <span className="text-xs font-medium text-zinc-600">
          {busy ? "Odświeżam…" : ready ? "Puść, aby odświeżyć" : "Pociągnij w dół"}
        </span>
      </div>
    </div>
  );
}
