"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { NAV } from "@/lib/nav";
import { useData } from "@/components/DataProvider";
import InstallAppButton from "@/components/InstallAppButton";
import { isHiddenVehicleName } from "@/lib/hiddenVehicles";

export default function Sidebar() {
  const pathname = usePathname();
  const { vehicles } = useData();
  // Liczymy tylko widoczne auta (bez Pajero/Vito), spójnie z pulpitem.
  const visibleVehicleCount = vehicles.filter((v) => !isHiddenVehicleName(v.name)).length;

  const logout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  };
  return (
    <aside className="flex w-60 shrink-0 flex-col bg-zinc-900 text-zinc-100">
      <div className="border-b border-zinc-800 px-5 py-5">
        <div className="text-sm font-semibold tracking-tight">Mountain Car Rental</div>
        <div className="text-xs text-zinc-400">Rental Manager</div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-zinc-100 font-medium text-zinc-900"
                  : "text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-zinc-800 p-3">
        <InstallAppButton className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800" />
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
        >
          <LogOut className="size-4" />
          Wyloguj
        </button>
        <div className="px-3 pt-2 text-xs text-zinc-500">
          {visibleVehicleCount} pojazdów · sezon 2026
        </div>
      </div>
    </aside>
  );
}
