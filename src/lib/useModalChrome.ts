import { useEffect } from "react";

// Blokada przewijania tła gdy modal jest otwarty (na mobile inaczej tło skacze
// pod overlayem). Zdejmowana przy odmontowaniu. Opcjonalny `onEscape` domyka
// modal klawiszem Escape — bez argumentu zachowanie jak dotąd (tylko scroll-lock),
// więc dotychczasowi wywołujący nic nie tracą.
//
// LICZNIK (nie zapamiętywanie „prev"): kilka modali potrafi być otwartych naraz
// (kreator + formularz klienta, drawer + okienko). Wcześniej każdy zapamiętywał
// wartość `body.overflow` z momentu montażu i ją przywracał — przy nakładaniu się
// w innej kolejności niż LIFO wewnętrzny modal przywracał „hidden" i tło zostawało
// ZABLOKOWANE na stałe (znikało przewijanie strony). Globalny licznik otwartych
// modali rozwiązuje to niezależnie od kolejności zamykania: blokujemy przy pierwszym,
// odblokowujemy dopiero gdy zamknie się ostatni.
let openModals = 0;

export function useModalChrome(onEscape?: () => void) {
  useEffect(() => {
    if (openModals === 0) {
      document.body.style.overflow = "hidden";
    }
    openModals += 1;
    return () => {
      openModals -= 1;
      if (openModals <= 0) {
        openModals = 0;
        // Bazowy stan strony to zawsze brak inline-overflow (globals.css nie ustawia
        // overflow na body). Czyścimy do pustego — gwarancja, że tło znów się przewija.
        document.body.style.overflow = "";
      }
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
