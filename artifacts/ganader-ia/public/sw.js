const CACHE_NAME = 'ganader-ia-v3';
const STATIC_CACHE = 'ganader-ia-static-v3';
const API_CACHE = 'ganader-ia-api-v3';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
];

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(STATIC_CACHE).then(cache =>
      Promise.allSettled(STATIC_ASSETS.map(url => cache.add(url).catch(() => {})))
    )
  );
});

// ─── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME && k !== STATIC_CACHE && k !== API_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;

  // API requests: network first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(API_CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request).then(cached => cached || new Response(
          JSON.stringify({ error: 'offline', cached: false }),
          { headers: { 'Content-Type': 'application/json' }, status: 503 }
        )))
    );
    return;
  }

  // Static assets: cache first, then network
  if (url.pathname.match(/\.(js|css|woff2?|png|jpg|svg|ico)$/)) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(STATIC_CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        });
      })
    );
    return;
  }

  // Navigation: network first, fallback to cached index
  e.respondWith(
    caches.match(e.request).then(cached => {
      const networkFetch = fetch(e.request)
        .then(res => {
          if (res.ok && res.status < 400) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => cached || caches.match('/index.html'));
      return cached || networkFetch;
    })
  );
});

// ─── Background Sync Queue ────────────────────────────────────────────────────
self.addEventListener('sync', (e) => {
  if (e.tag === 'sync-pesajes') {
    e.waitUntil(syncPendingData());
  }
});

async function syncPendingData() {
  try {
    const cache = await caches.open('ganader-offline-queue');
    const keys = await cache.keys();
    await Promise.allSettled(keys.map(async req => {
      try {
        const cachedRes = await cache.match(req);
        if (!cachedRes) return;
        const body = await cachedRes.text();
        await fetch(req.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
        });
        await cache.delete(req);
      } catch {}
    }));
  } catch {}
}

// ─── Push Notifications ───────────────────────────────────────────────────────
self.addEventListener('push', (e) => {
  const data = e.data?.json?.() || { title: 'GanaderIA', body: 'Nueva alerta del sistema' };
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: 'ganader-alert',
      data: data,
    })
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      if (clients.length > 0) {
        clients[0].focus();
        clients[0].navigate('/alertas');
      } else {
        self.clients.openWindow('/alertas');
      }
    })
  );
});
