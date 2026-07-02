"use client";

import { useEffect, useState } from "react";

const BREAKPOINT = 768;

// Math.min(w,h) zamiast samej szerokości — telefon obrócony poziomo bywa
// szerszy niż 768px, a mimo to zostaje telefonem (Tailwind-owe `md:` łapie
// się na samą szerokość i przełączałoby wtedy na widok desktopowy).
function computeIsMobile() {
  return Math.min(window.innerWidth, window.innerHeight) < BREAKPOINT;
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const onResize = () => setIsMobile(computeIsMobile());
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return isMobile;
}
