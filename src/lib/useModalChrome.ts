import { useEffect } from "react";

// Blokada przewijania tła gdy modal jest otwarty (na mobile inaczej tło skacze
// pod overlayem). Zdejmowana przy odmontowaniu. Escape/focus zostają w gestii
// komponentu — tu tylko scroll-lock, żeby nie kolidować z własnymi handlerami.
export function useModalChrome() {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);
}
