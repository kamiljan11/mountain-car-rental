import {
  LayoutDashboard,
  CalendarDays,
  ListChecks,
  Inbox,
  Car,
  Users,
  FileSignature,
  Settings,
} from "lucide-react";

export const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/", label: "Kalendarz", icon: CalendarDays },
  { href: "/bookings", label: "Rezerwacje", icon: ListChecks },
  { href: "/requests", label: "Wnioski", icon: Inbox },
  { href: "/fleet", label: "Flota", icon: Car },
  { href: "/customers", label: "Klienci", icon: Users },
  { href: "/contracts", label: "Kontrakt", icon: FileSignature },
  { href: "/settings", label: "Ustawienia", icon: Settings },
] as const;
