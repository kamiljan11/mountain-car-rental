"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function InstallAppButton({ className }: { className: string }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      // Przechwytujemy zdarzenie, którym Chrome „uzbraja” instalację, i trzymamy
      // je, żeby móc wymusić natywne okno instalacji na klik przycisku.
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setDeferred(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // Widoczny tylko wtedy, gdy przeglądarka pozwala wymusić instalację
  // (Android/desktop Chrome/Edge na spełnionych kryteriach PWA). Bez zdarzenia
  // nie istnieje żadne API, które otworzyłoby instalator — więc nie udajemy.
  if (!deferred) return null;

  const install = async () => {
    // To jest wymuszenie instalatora — natywne okno „Zainstaluj”.
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  };

  return (
    <button onClick={install} className={className}>
      <Download className="size-4" />
      Zainstaluj aplikację
    </button>
  );
}
