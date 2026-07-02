"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { NAV } from "@/lib/nav";
import InstallAppButton from "@/components/InstallAppButton";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const logout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between bg-zinc-900 px-4 py-3 text-zinc-100">
        <div className="text-sm font-semibold tracking-tight">Mountain Car Rental</div>
        <button
          onClick={() => setOpen(true)}
          aria-label="Otwórz menu"
          className="grid size-11 place-items-center rounded-lg hover:bg-zinc-800"
        >
          <Menu className="size-6" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 flex h-full w-72 max-w-[82%] flex-col bg-zinc-900 p-4 text-zinc-100">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold">Mountain Car Rental</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Zamknij menu"
                className="grid size-11 place-items-center rounded-lg hover:bg-zinc-800"
              >
                <X className="size-6" />
              </button>
            </div>
            <nav className="space-y-1">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active =
                  href === "/" ? pathname === "/" : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-3 text-base ${
                      active
                        ? "bg-zinc-100 font-medium text-zinc-900"
                        : "text-zinc-200 hover:bg-zinc-800"
                    }`}
                  >
                    <Icon className="size-5" />
                    {label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto">
              <InstallAppButton className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-base text-zinc-200 hover:bg-zinc-800" />
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-base text-zinc-200 hover:bg-zinc-800"
              >
                <LogOut className="size-5" />
                Wyloguj
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
