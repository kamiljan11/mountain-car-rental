import { useEffect } from "react";

// Blokada przewijania tła gdy modal jest otwarty (na mobile inaczej tło skacze
// pod overlayem). Zdejmowana przy odmontowaniu. Opcjonalny `onEscape` domyka
// modal klawiszem Escape — bez argumentu zachowanie jak dotąd (tylko scroll-lock),
// więc dotychczasowi wywołujący nic nie tracą.
export function useModalChrome(onEscape?: () => void) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    if (!onEscape) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onEscape();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onEscape]);
}
