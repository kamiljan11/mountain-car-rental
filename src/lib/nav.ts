import {
  LayoutDashboard,
  CalendarDays,
  ListChecks,
  ClipboardCheck,
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
  { href: "/checklist", label: "Checklista", icon: ClipboardCheck },
  { href: "/contracts", label: "Kontrakt", icon: FileSignature },
  { href: "/settings", label: "Ustawienia", icon: Settings },
] as const;
