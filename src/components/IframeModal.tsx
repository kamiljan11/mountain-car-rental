"use client";

import { useEffect, useState } from "react";
import { Loader2, X, ExternalLink } from "lucide-react";

// Okienko z realną stroną apki (edycja klienta / umowa / checklista) w iframe —
// zamiast wyrzucać z kalendarza. Strona ładowana z `?embed=1` (AppShell ukrywa
// wtedy menu). Spinner trzyma się do onLoad, więc nie widać migotania sidebara.
export default function IframeModal({
  title,
  url,
  onClose,
}: {
  title: string;
  url: string; // ścieżka względna, np. /customers/abc (embed dokładamy sami)
  onClose: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const sep = url.includes("?") ? "&" : "?";
  const embedUrl = `${url}${sep}embed=1`;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-stretch justify-center bg-zinc-900/40 p-0 sm:items-center sm:p-6">
      <div className="flex h-full w-full max-w-4xl flex-col overflow-hidden bg-white shadow-xl sm:h-[86vh] sm:rounded-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-4 py-3">
          <h2 className="truncate text-sm font-semibold text-zinc-900">{title}</h2>
          <div className="flex items-center gap-1">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              title="Otwórz w pełnym widoku"
              className="grid size-9 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            >
              <ExternalLink className="size-4" />
            </a>
            <button
              onClick={onClose}
              aria-label="Zamknij"
              className="grid size-9 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
        <div className="relative min-h-0 flex-1">
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-white text-sm text-zinc-400">
              <Loader2 className="size-5 animate-spin" /> Wczytywanie…
            </div>
          )}
          <iframe
            src={embedUrl}
            title={title}
            onLoad={() => setLoaded(true)}
            className={`h-full w-full border-0 transition-opacity ${loaded ? "opacity-100" : "opacity-0"}`}
          />
        </div>
      </div>
    </div>
  );
}
