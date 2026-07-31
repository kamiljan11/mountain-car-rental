// Minimalny service worker — wystarcza do instalowalności (Android/Chrome
// wymaga zarejestrowanego SW z obsługą "fetch"). Cache'uje tylko statyczne
// ikony aplikacji; wszystko inne (HTML, API, dane) idzie zawsze do sieci —
// panel wymaga świeżej sesji/danych, więc nie udajemy trybu offline.
const SHELL_CACHE = "mcr-shell-v1";
const SHELL_ASSETS = ["/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  if (!SHELL_ASSETS.some((path) => request.url.endsWith(path))) return;
  event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
});
