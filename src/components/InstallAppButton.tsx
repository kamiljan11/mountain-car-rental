"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function InstallAppButton({ className }: { className: string }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setDeferred(null);
      setInstalled(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    // Już uruchomiona jako zainstalowana apka — nie ma czego instalować.
    if (window.matchMedia?.("(display-mode: standalone)").matches) {
      setInstalled(true);
    }
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // Pozycja znika tylko wtedy, gdy apka już działa jako zainstalowana.
  // W pozostałych przypadkach jest zawsze widoczna w menu (odkrywalna).
  if (installed) return null;

  const install = async () => {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
      return;
    }
    // Brak natywnego okna (iOS Safari, albo Chrome jeszcze nie zgłosił zdarzenia):
    // pokaż krótką instrukcję zamiast martwego kliknięcia.
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setHint(
      isIOS
        ? 'iPhone/iPad: dotknij Udostępnij (kwadrat ze strzałką) → „Do ekranu początkowego”.'
        : 'Android: menu przeglądarki (⋮) → „Zainstaluj aplikację” / „Dodaj do ekranu głównego”.',
    );
  };

  return (
    <div>
      <button onClick={install} className={className}>
        <Download className="size-4" />
        Zainstaluj aplikację
      </button>
      {hint && <p className="px-3 pb-1 pt-1 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}
