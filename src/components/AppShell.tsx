"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import DataProvider from "@/components/DataProvider";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }
  }, []);

  // Strona logowania renderuje się samodzielnie — bez nawigacji i bez pobierania danych.
  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <DataProvider>
      <div className="flex min-h-screen flex-col md:flex-row">
        <Sidebar />
        <MobileNav />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </DataProvider>
  );
}
