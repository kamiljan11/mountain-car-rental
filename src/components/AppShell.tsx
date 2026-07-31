"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import DataProvider from "@/components/DataProvider";
import LoadingBar from "@/components/LoadingBar";
import PullToRefresh from "@/components/PullToRefresh";
import { useIsMobile } from "@/lib/useIsMobile";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  // Tryb „embed" — strona otwarta w iframe (np. z kalendarza): renderujemy samą
  // treść, bez nawigacji i paska ładowania, ale z DataProvider (strony go potrzebują).
  // Czytane po zamontowaniu; iframe-modal i tak trzyma spinner do onLoad, więc bez migotania.
  const [embed, setEmbed] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEmbed(new URLSearchParams(window.location.search).get("embed") === "1");
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }
  }, []);

  // Strona logowania oraz publiczny kreator bookingu klienta (/book/[token])
  // renderują się samodzielnie — bez nawigacji, bez DataProvider (który odpytałby
  // zalogowaną bazę) i bez auth. ToastProvider (z layoutu) nadal jest dostępny.
  if (
    pathname === "/login" ||
    pathname.startsWith("/book/") ||
    pathname.startsWith("/sign/")
  ) {
    return <>{children}</>;
  }

  if (embed) {
    return (
      <DataProvider>
        <main className="min-h-screen bg-white">{children}</main>
      </DataProvider>
    );
  }

  return (
    <DataProvider>
      <LoadingBar />
      <PullToRefresh />
      <div className={`flex min-h-screen ${isMobile ? "flex-col" : "flex-row"}`}>
        {isMobile ? <MobileNav /> : <Sidebar />}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </DataProvider>
  );
}
