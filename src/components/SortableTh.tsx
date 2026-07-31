"use client";

import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

export default function SortableTh({
  label,
  sortKey,
  activeKey,
  dir,
  onSort,
}: {
  label: string;
  sortKey: string;
  activeKey: string;
  dir: "asc" | "desc";
  onSort: (key: string) => void;
}) {
  const active = sortKey === activeKey;
  return (
    <th className="px-4 py-3 font-medium">
      <button
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1 hover:text-zinc-900 ${active ? "text-zinc-900" : ""}`}
      >
        {label}
        {active ? (
          dir === "asc" ? (
            <ChevronUp className="size-3.5" />
          ) : (
            <ChevronDown className="size-3.5" />
          )
        ) : (
          <ChevronsUpDown className="size-3.5 text-zinc-300" />
        )}
      </button>
    </th>
  );
}
