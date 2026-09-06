import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/company";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND} — Rental Manager`,
    short_name: "MCR Manager",
    description: "Wewnętrzny system rezerwacji floty",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f4f5",
    theme_color: "#18181b",
    lang: "pl",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
