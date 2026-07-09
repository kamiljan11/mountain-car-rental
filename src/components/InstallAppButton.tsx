"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

// Przechwytujemy beforeinstallprompt na poziomie modułu — rejestracja odpala się
// gdy tylko wykona się bundle klienta, czyli ZANIM komponent się zamontuje. Bez
// tego, jeśli Chrome zgłosi zdarzenie wcześnie (przed montowaniem przycisku),
// zgubilibyśmy je i przycisk „Zainstaluj” by się nie pokazał mimo że apka jest
// instalowalna. Robimy to bez <script> w drzewie React (brak ostrzeżeń React 19).
let deferredPrompt: BeforeInstallPromptEvent | null = null;
const subscribers = new Set<() => void>();
const notify = () => subscribers.forEach((fn) => fn());

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    notify();
  });
}

export default function InstallAppButton({ className }: { className: string }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const sync = () => setDeferred(deferredPrompt);
    sync(); // złap zdarzenie, które mogło odpalić zanim komponent się zamontował
    subscribers.add(sync);
    return () => {
      subscribers.delete(sync);
    };
  }, []);

  // Widoczny tylko wtedy, gdy przeglądarka uzbroiła instalację. To jedyny
  // mechanizm, jakim strona może wymusić natywny instalator — bez tego
  // zdarzenia nie ma żadnego API „zainstaluj teraz”, a iOS nie ma go w ogóle.
  if (!deferred) return null;

  const install = async () => {
    // Wymuszenie natywnego okna instalacji.
    await deferred.prompt();
    await deferred.userChoice;
    deferredPrompt = null; // zdarzenie jest jednorazowe
    setDeferred(null);
  };

  return (
    <button onClick={install} className={className}>
      <Download className="size-4" />
      Zainstaluj aplikację
    </button>
  );
}
