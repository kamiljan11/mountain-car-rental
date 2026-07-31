"use client";

import { useMemo, useState } from "react";

type Extractor<T> = (item: T) => string | number;

export function useSort<T>(
  items: T[],
  extractors: Record<string, Extractor<T>>,
  initialKey: string,
  initialDir: "asc" | "desc" = "asc",
) {
  const [{ key: sortKey, dir: sortDir }, setSort] = useState<{
    key: string;
    dir: "asc" | "desc";
  }>({ key: initialKey, dir: initialDir });

  const sorted = useMemo(() => {
    const get = extractors[sortKey];
    if (!get) return items;
    const copy = [...items];
    copy.sort((a, b) => {
      const av = get(a);
      const bv = get(b);
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [items, extractors, sortKey, sortDir]);

  const toggleSort = (key: string) => {
    setSort((prev) => ({
      key,
      dir: prev.key === key ? (prev.dir === "asc" ? "desc" : "asc") : "asc",
    }));
  };

  return { sorted, sortKey, sortDir, toggleSort };
}
