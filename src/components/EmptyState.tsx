import type { LucideIcon } from "lucide-react";

// Jeden wygląd pustego stanu w całej apce: ikona + co to znaczy + (opcjonalnie) co zrobić.
// Zamiast samego „Brak X." — pusty ekran ma mówić, czy to porządek, czy trzeba działać.
export default function EmptyState({
  icon: Icon,
  title,
  hint,
  action,
  compact = false,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
  action?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact ? "gap-1 py-4" : "gap-1.5 py-8"
      }`}
    >
      <Icon className={`${compact ? "size-5" : "size-6"} text-zinc-300`} aria-hidden="true" />
      <p className={`${compact ? "text-sm" : "text-sm font-medium"} text-zinc-500`}>{title}</p>
      {hint && <p className="max-w-xs text-xs text-zinc-400">{hint}</p>}
      {action && <div className="mt-1.5">{action}</div>}
    </div>
  );
}
