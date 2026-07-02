"use client";

import { useData } from "@/components/DataProvider";

export default function LoadingBar() {
  const { loaded } = useData();
  if (loaded) return null;
  return (
    <div className="fixed inset-x-0 top-0 z-[200] h-0.5 overflow-hidden bg-zinc-200">
      <div className="h-full w-1/3 animate-[loading-bar_1.1s_ease-in-out_infinite] bg-zinc-900" />
    </div>
  );
}
