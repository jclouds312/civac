// CIVAC PRO — Service Worker v4
// Cache-first for assets · Network-first for API · Offline shell fallback

const CACHE_VER    = 'v4';
const CACHE_MAIN   = `civac-main-${CACHE_VER}`;
const CACHE_STATIC = `civac-static-${CACHE_VER}`;
const CACHE_API    = `civac-api-${CACHE_VER}`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
];

// ─── Install — pre-cache app shell ────────────────────────────────────────────
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_STATIC).then(cache =>
      Promise.allSettled(STATIC_ASSETS.map(url =>
        cache.add(new Request(url, { cache: 'reload' })).catch(() => {})
      ))
    )
  );
});

// ─── Activate — purge old caches ─────────────────────────────────────────────
self.addEventListener('activate', (e) => {
  const keep = [CACHE_MAIN, CACHE_STATIC, CACHE_API];
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => !keep.includes(k)).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ─── Fetch — tiered caching strategy ─────────────────────────────────────────
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // Skip cross-origin requests (CDN fonts, etc.)
  if (url.origin !== location.origin) return;

  // ── API: network-first, fall back to cached response ───────────────────────
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(e.request.clone())
        .then(res => {
          if (res.ok) {
            caches.open(CACHE_API).then(c => c.put(e.request, res.clone()));
          }
          return res;
        })
        .catch(() =>
          caches.match(e.request).then(cached =>
            cached || new Response(
              JSON.stringify({ error: 'offline', cached: false }),
              { status: 503, headers: { 'Content-Type': 'application/json' } }
            )
          )
        )
    );
    return;
  }

  // ── Static assets (.js .css .woff2 images): cache-first ────────────────────
  if (url.pathname.match(/\.(js|css|woff2?|png|jpg|jpeg|webp|svg|ico|ts)$/)) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request.clone()).then(res => {
          if (res.ok) {
            caches.open(CACHE_STATIC).then(c => c.put(e.request, res.clone()));
          }
          return res;
        }).catch(() => cached || new Response('', { status: 404 }));
      })
    );
    return;
  }

  // ── Navigation (HTML routes): stale-while-revalidate ───────────────────────
  e.respondWith(
    caches.match(e.request).then(cached => {
      const networkFetch = fetch(e.request.clone())
        .then(res => {
          if (res.ok && res.status < 400) {
            caches.open(CACHE_MAIN).then(c => c.put(e.request, res.clone()));
          }
          return res;
        })
        .catch(() =>
          // Full offline fallback: return cached page or app shell
          cached ||
          caches.match('/index.html') ||
          new Response('<h1>GanaderIA — Offline</h1>', { headers: { 'Content-Type': 'text/html' } })
        );

      // Return cached immediately but refresh in background (stale-while-revalidate)
      return cached || networkFetch;
    })
  );
});

// ─── Background Sync — flush offline API queue ───────────────────────────────
self.addEventListener('sync', (e) => {
  if (e.tag === 'civac-sync') {
    e.waitUntil(flushOfflineQueue());
  }
});

async function flushOfflineQueue() {
  try {
    const cache = await caches.open('civac-offline-queue');
    const keys  = await cache.keys();
    await Promise.allSettled(keys.map(async req => {
      try {
        const res  = await cache.match(req);
        if (!res) return;
        const body = await res.text();
        const ok   = await fetch(req.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
        });
        if (ok.ok) await cache.delete(req);
      } catch { /* retry on next sync */ }
    }));
  } catch { /* storage unavailable */ }
}

// ─── Message — manual cache refresh from app ─────────────────────────────────
self.addEventListener('message', (e) => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (e.data?.type === 'CLEAR_CACHE') {
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));
  }
});

// ─── Push Notifications ───────────────────────────────────────────────────────
self.addEventListener('push', (e) => {
  const data = e.data?.json?.() || { title: 'CIVAC PRO', body: 'Nueva alerta del sistema' };
  e.waitUntil(
    self.registration.showNotification(data.title || 'CIVAC PRO', {
      body:  data.body  || 'Revisa el sistema',
      icon:  '/favicon.svg',
      badge: '/favicon.svg',
      tag:   'civac-alert',
      data,
      actions: [{ action: 'view', title: 'Ver' }],
    })
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const target = e.notification.data?.route || '/alertas';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      const existing = clients.find(c => c.url.includes(location.origin));
      if (existing) { existing.focus(); existing.navigate(target); }
      else self.clients.openWindow(target);
    })
  );
});
