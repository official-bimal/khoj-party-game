const VERSION = "khoj-shell-v1";
const PAGES = [
  "/",
  "/play",
  "/rules",
  "/custom",
  "/settings",
  "/library",
  "/offline",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(VERSION);
      await cache.addAll(PAGES);
      for (const url of PAGES.filter((p) => !p.includes("."))) {
        const response = await cache.match(url);
        if (!response) continue;
        const html = await response.text();
        const assets = [
          ...html.matchAll(/(?:src|href)="([^" ]*\/_next\/static\/[^" ]+)"/g),
        ].map((m) => m[1].replaceAll("&amp;", "&"));
        await Promise.all(
          [...new Set(assets)].map(async (asset) => {
            try {
              await cache.add(asset);
            } catch {}
          }),
        );
      }
    })(),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const name of await caches.keys())
        if (name.startsWith("khoj-shell-") && name !== VERSION)
          await caches.delete(name);
      await self.clients.claim();
    })(),
  );
});
self.addEventListener("fetch", (event) => {
  const req = event.request,
    url = new URL(req.url);
  if (
    req.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/")
  )
    return;
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(VERSION),
          hit = await cache.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) await cache.put(req, res.clone());
        return res;
      })(),
    );
    return;
  }
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        const cache = await caches.open(VERSION);
        try {
          const res = await fetch(req);
          if (res.ok) await cache.put(url.pathname, res.clone());
          return res;
        } catch {
          return (
            (await cache.match(url.pathname)) || (await cache.match("/offline"))
          );
        }
      })(),
    );
    return;
  }
  if (req.headers.get("rsc") === "1") {
    event.respondWith(
      (async () => {
        const cache = await caches.open(VERSION);
        try {
          const res = await fetch(req);
          if (res.ok) await cache.put(req, res.clone());
          return res;
        } catch {
          return (
            (await cache.match(req)) || new Response("Offline", { status: 503 })
          );
        }
      })(),
    );
  }
});
