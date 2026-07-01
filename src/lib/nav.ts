import {
  CalendarDays,
  ListChecks,
  Car,
  Users,
  FileSignature,
  Settings,
} from "lucide-react";

export const NAV = [
  { href: "/", label: "Kalendarz", icon: CalendarDays },
  { href: "/bookings", label: "Rezerwacje", icon: ListChecks },
  { href: "/fleet", label: "Flota", icon: Car },
  { href: "/customers", label: "Klienci", icon: Users },
  { href: "/contracts", label: "Kontrakt", icon: FileSignature },
  { href: "/settings", label: "Ustawienia", icon: Settings },
] as const;
