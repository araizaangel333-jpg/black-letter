// Service worker de Black Letter: la app y los juegos funcionan sin red después de la primera visita.
// Páginas: red primero, caché de respaldo. Recursos con hash (/_astro/): caché primero.
// Datos (/data/, /map/data/, fuentes): caché y actualización en segundo plano.
const VERSION = 'bl-2026-10-27-1';
const SHELL = `${VERSION}-shell`;
const RUNTIME = `${VERSION}-runtime`;
const CORE = ['/', '/games/', '/games/round/', '/games/flashcards/', '/games/match/', '/glossary/', '/quiz/', '/courses/', '/schedule/', '/more/', '/data/items.json', '/data/calendar.json', '/manifest.webmanifest', '/icons/icon-192.png', '/favicon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL);
    await Promise.all(CORE.map(async (url) => { try { await cache.add(new Request(url, { cache: 'reload' })); } catch (e) { /* una ruta que falte no bloquea la instalación */ } }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => !k.startsWith(VERSION)).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

const isSameOrigin = (url) => url.origin === self.location.origin;

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (!isSameOrigin(url)) return;

  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(RUNTIME); cache.put(req, fresh.clone());
        return fresh;
      } catch (e) {
        const cached = await caches.match(req) || await caches.match(url.pathname) || await caches.match('/');
        return cached || new Response('<!doctype html><meta charset="utf-8"><title>Black Letter</title><p style="font-family:system-ui;padding:24px">Sin conexión. Abre una página que ya hayas visitado o vuelve cuando tengas red.</p>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      }
    })());
    return;
  }

  if (url.pathname.startsWith('/_astro/')) {
    event.respondWith((async () => {
      const cached = await caches.match(req); if (cached) return cached;
      const fresh = await fetch(req); const cache = await caches.open(RUNTIME); cache.put(req, fresh.clone()); return fresh;
    })());
    return;
  }

  if (url.pathname.startsWith('/data/') || url.pathname.startsWith('/map/') || url.pathname.startsWith('/icons/') || /\.(woff2?|json|svg|png)$/.test(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME);
      const cached = await cache.match(req);
      const refresh = fetch(req).then(res => { if (res && res.ok) cache.put(req, res.clone()); return res; }).catch(() => null);
      return cached || (await refresh) || new Response('', { status: 504 });
    })());
    return;
  }

  event.respondWith((async () => {
    try { const fresh = await fetch(req); const cache = await caches.open(RUNTIME); cache.put(req, fresh.clone()); return fresh; }
    catch (e) { return (await caches.match(req)) || new Response('', { status: 504 }); }
  })());
});
