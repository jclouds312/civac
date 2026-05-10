// GanaderIA — Advanced Service Worker v5
const CACHE_VERSION = 'v5';
const CACHES = {
  app:    `ganader-ia-app-${CACHE_VERSION}`,
  static: `ganader-ia-static-${CACHE_VERSION}`,
  api:    `ganader-ia-api-${CACHE_VERSION}`,
};

const APP_ROUTES = [
  '/', '/alertas', '/inventario', '/ficha', '/reproduccion',
  '/produccion', '/pesaje', '/genetica', '/potreros', '/alimentacion',
  '/insumos', '/semen', '/costos', '/personal', '/prediccion',
  '/co2', '/multifinca', '/usuarios', '/configuracion', '/documentacion', '/manual',
];
const STATIC_ASSETS = ['/index.html', '/manifest.json', '/favicon.svg', '/robots.txt'];

// ── Install: pre-cache all routes and static assets ──────────────────────────
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    Promise.all([
      caches.open(CACHES.static).then(c =>
        Promise.allSettled(STATIC_ASSETS.map(u => c.add(u).catch(() => {})))
      ),
      caches.open(CACHES.app).then(c =>
        Promise.allSettled(APP_ROUTES.map(u => c.add(u).catch(() => {})))
      ),
    ])
  );
});

// ── Activate: purge stale caches ─────────────────────────────────────────────
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k.startsWith('ganader-ia-') && !Object.values(CACHES).includes(k))
          .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Message: handle SKIP_WAITING from app ─────────────────────────────────────
self.addEventListener('message', (e) => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (e.data?.type === 'CACHE_ROUTE') {
    const url = e.data.url;
    if (url) caches.open(CACHES.app).then(c => c.add(url).catch(() => {}));
  }
});

// ── Fetch: per-resource cache strategies ─────────────────────────────────────
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;

  // API → Network first, offline fallback JSON
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(networkFirst(e.request, CACHES.api));
    return;
  }

  // Static assets → Cache first
  if (/\.(js|css|woff2?|ttf|otf|png|jpg|jpeg|webp|svg|ico)(\?.*)?$/.test(url.pathname)) {
    e.respondWith(cacheFirst(e.request, CACHES.static));
    return;
  }

  // App shell + pages → Stale while revalidate
  e.respondWith(staleWhileRevalidate(e.request, CACHES.app));
});

// ─── Strategy helpers ─────────────────────────────────────────────────────────
async function networkFirst(req, cacheName) {
  try {
    const res = await fetch(req.clone());
    if (res.ok) {
      const cache = await caches.open(cacheName);
      cache.put(req, res.clone());
    }
    return res;
  } catch {
    const cached = await caches.match(req);
    if (cached) return cached;
    return new Response(
      JSON.stringify({ error: 'offline', message: 'Sin conexión. Datos no disponibles.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function cacheFirst(req, cacheName) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req.clone());
    if (res.ok) {
      const cache = await caches.open(cacheName);
      cache.put(req, res.clone());
    }
    return res;
  } catch {
    return new Response('Recurso no disponible sin conexión.', { status: 503 });
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const networkPromise = fetch(req.clone())
    .then(res => {
      if (res.ok) cache.put(req, res.clone());
      return res;
    })
    .catch(() => cached ?? new Response('Sin conexión', { status: 503 }));
  return cached ?? (await networkPromise);
}

// ── Background Sync ───────────────────────────────────────────────────────────
self.addEventListener('sync', (e) => {
  if (e.tag === 'sync-ganader-changes') {
    e.waitUntil(
      self.clients.matchAll({ includeUncontrolled: true }).then(clients => {
        clients.forEach(c => c.postMessage({ type: 'SYNC_COMPLETE', timestamp: Date.now() }));
      })
    );
  }
  if (e.tag === 'sync-alertas') {
    e.waitUntil(
      self.clients.matchAll().then(clients => {
        clients.forEach(c => c.postMessage({ type: 'ALERTAS_SYNCED' }));
      })
    );
  }
});

// ── Periodic Background Sync ──────────────────────────────────────────────────
self.addEventListener('periodicsync', (e) => {
  if (e.tag === 'check-alertas') {
    e.waitUntil(
      self.clients.matchAll().then(clients => {
        clients.forEach(c => c.postMessage({ type: 'PERIODIC_SYNC', tag: e.tag }));
      })
    );
  }
});

// ── Push Notifications ────────────────────────────────────────────────────────
self.addEventListener('push', (e) => {
  const data = e.data?.json() ?? {};
  const title = data.title ?? 'GanaderIA';
  const options = {
    body:             data.body ?? 'Hay novedades en tu finca.',
    icon:             '/favicon.svg',
    badge:            '/favicon.svg',
    tag:              data.tag ?? 'ganader-ia-alert',
    renotify:         data.renotify ?? false,
    requireInteraction: data.urgent ?? false,
    silent:           data.silent ?? false,
    data:             { url: data.url ?? '/', ...data },
    actions: [
      { action: 'view',    title: 'Ver ahora' },
      { action: 'dismiss', title: 'Descartar' },
    ],
    vibrate: data.urgent ? [200, 100, 200] : [100],
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  if (e.action === 'dismiss') return;
  const targetUrl = e.notification.data?.url ?? '/';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      const existing = clients.find(c => c.url.includes(targetUrl) || c.url.endsWith('/'));
      if (existing) return existing.focus();
      return self.clients.openWindow(targetUrl);
    })
  );
});
