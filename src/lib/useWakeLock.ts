"use client";

import { useEffect } from "react";

// Screen Wake Lock API — ekran telefonu nie gaśnie, póki komponent jest zamontowany.
// Sens: checklista wydania / spisywanie licznika robi się na dworze, w rękawicach,
// z przerwami — gasnący ekran zmusza do ciągłego odblokowywania.
// Degradacja: brak wsparcia albo odmowa przeglądarki = po prostu nic się nie dzieje
// (to wygoda, nie funkcja krytyczna), więc świadomie łykamy błąd po cichu.
export function useWakeLock(active = true) {
  useEffect(() => {
    if (!active) return;
    if (typeof navigator === "undefined" || !("wakeLock" in navigator)) return;

    let sentinel: { release: () => Promise<void> } | null = null;
    let disposed = false;

    const request = async () => {
      try {
        const wl = await (
          navigator as Navigator & {
            wakeLock: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> };
          }
        ).wakeLock.request("screen");
        if (disposed) {
          void wl.release().catch(() => {});
          return;
        }
        sentinel = wl;
      } catch {
        // brak zgody / bateria / niewspierane — ignorujemy
      }
    };

    void request();

    // Blokada przepada po przejściu w tło (zmiana karty, zgaszenie) — odnów po powrocie.
    const onVisibility = () => {
      if (document.visibilityState === "visible") void request();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", onVisibility);
      void sentinel?.release().catch(() => {});
    };
  }, [active]);
}
