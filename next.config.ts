import type { NextConfig } from "next";

// Nagłówki bezpieczeństwa — publiczna strona /book/[token] zbiera dane wrażliwe
// (dowód/prawo jazdy/adres), więc chronimy całą apkę na poziomie odpowiedzi HTTP.
const isDev = process.env.NODE_ENV === "development";

// CSP: pozwalamy tylko na to, czego apka realnie używa.
// - Jedyny zewnętrzny origin to Google Identity Services (skrypt gsi/client
//   + przycisk/one-tap renderowane w iframe z accounts.google.com).
// - Revolut QR to lokalny plik /revolut-qr.png (img 'self'); Supabase leci
//   wyłącznie po stronie serwera (service role), klient bije tylko w /api (self).
// - Next.js bez nonce wstrzykuje inline bootstrap hydratacji, a Tailwind inline
//   style — stąd 'unsafe-inline' dla script/style (oficjalny baseline Next bez nonce).
// - W dev React używa eval do debug stacków → 'unsafe-eval' tylko w dev;
//   upgrade-insecure-requests pomijamy w dev, by nie psuć http://localhost.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://accounts.google.com https://www.gstatic.com`,
  "style-src 'self' 'unsafe-inline' https://accounts.google.com",
  "img-src 'self' data: blob: https://accounts.google.com https://*.googleusercontent.com https://www.gstatic.com",
  "font-src 'self' data:",
  "connect-src 'self' https://accounts.google.com",
  "frame-src https://accounts.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  // HSTS: 2 lata + subdomeny (ignorowane przez przeglądarki po http/localhost).
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Wszystkie trasy.
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
