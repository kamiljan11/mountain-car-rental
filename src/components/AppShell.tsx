"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import DataProvider from "@/components/DataProvider";
import LoadingBar from "@/components/LoadingBar";
import { useIsMobile } from "@/lib/useIsMobile";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }
  }, []);

  // Strona logowania oraz publiczny kreator bookingu klienta (/book/[token])
  // renderują się samodzielnie — bez nawigacji, bez DataProvider (który odpytałby
  // zalogowaną bazę) i bez auth. ToastProvider (z layoutu) nadal jest dostępny.
  if (pathname === "/login" || pathname.startsWith("/book/")) {
    return <>{children}</>;
  }

  return (
    <DataProvider>
      <LoadingBar />
      <div className={`flex min-h-screen ${isMobile ? "flex-col" : "flex-row"}`}>
        {isMobile ? <MobileNav /> : <Sidebar />}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </DataProvider>
  );
}
