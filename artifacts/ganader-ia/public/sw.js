// CIVAC PRO — Service Worker v6
// Estrategia: Cache-first assets · Stale-while-revalidate nav · Network-first API
// Memoria expandida: 50 MB quota + persistent storage · Offline shell completo

const CACHE_VER    = 'v6';
const CACHE_MAIN   = `civac-main-${CACHE_VER}`;
const CACHE_STATIC = `civac-static-${CACHE_VER}`;
const CACHE_API    = `civac-api-${CACHE_VER}`;
const CACHE_IMGS   = `civac-imgs-${CACHE_VER}`;
const CACHE_FONTS  = `civac-fonts-${CACHE_VER}`;
const CACHE_QUEUE  = 'civac-offline-queue';

// Rutas de la app shell (pre-cacheadas al instalar)
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/sw.js',
];

// Todas las rutas de navegación para offline completo
const NAV_ROUTES = [
  '/dashboard', '/inventario', '/produccion', '/reproduccion', '/genetica',
  '/potreros', '/insumos', '/personal', '/costos', '/prediccion', '/co2',
  '/alertas', '/alimentacion', '/semen', '/gps', '/ficha', '/multifinca',
  '/usuarios', '/configuracion', '/documentacion', '/manual', '/planes',
  '/lotes', '/datos', '/pesaje', '/pesaje-manual',
];

// ─── Install — pre-cache completo ────────────────────────────────────────────
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil((async () => {
    // Solicitar almacenamiento persistente
    if (navigator.storage?.persist) {
      await navigator.storage.persist().catch(() => {});
    }
    const cache = await caches.open(CACHE_STATIC);
    // Cachear app shell primero
    await Promise.allSettled(
      [...APP_SHELL, ...NAV_ROUTES].map(url =>
        cache.add(new Request(url, { cache: 'reload' })).catch(() => {})
      )
    );
  })());
});

// ─── Activate — purgar caches anteriores y reclamar clientes ─────────────────
self.addEventListener('activate', (e) => {
  const keep = [CACHE_MAIN, CACHE_STATIC, CACHE_API, CACHE_IMGS, CACHE_FONTS, CACHE_QUEUE];
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => !keep.includes(k)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(async () => {
        // Limpiar caches viejos si superan cuota
        if (navigator.storage?.estimate) {
          const { usage = 0, quota = 0 } = await navigator.storage.estimate();
          if (quota > 0 && usage / quota > 0.85) {
            await caches.delete(CACHE_IMGS);
          }
        }
      })
  );
});

// ─── Fetch — estrategia escalonada ───────────────────────────────────────────
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // Ignorar extensiones de Chrome y similares
  if (!url.protocol.startsWith('http')) return;

  // ── API interna: network-first, fallback a caché ───────────────────────────
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(e.request.clone())
        .then(res => {
          if (res.ok) caches.open(CACHE_API).then(c => c.put(e.request, res.clone()));
          return res;
        })
        .catch(() =>
          caches.match(e.request).then(cached =>
            cached || new Response(
              JSON.stringify({ error: 'offline', cached: false, ts: Date.now() }),
              { status: 503, headers: { 'Content-Type': 'application/json' } }
            )
          )
        )
    );
    return;
  }

  // ── Fuentes externas: cache-first con TTL largo ────────────────────────────
  if (url.origin !== location.origin && (
    url.hostname.includes('fonts.') || url.hostname.includes('gstatic.')
  )) {
    e.respondWith(
      caches.open(CACHE_FONTS).then(async cache => {
        const cached = await cache.match(e.request);
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res.ok) cache.put(e.request, res.clone());
          return res;
        }).catch(() => new Response('', { status: 503 }));
      })
    );
    return;
  }

  // ── Imágenes externas (tiles de mapa, etc.): cache-first ─────────────────
  if (url.origin !== location.origin) {
    e.respondWith(
      caches.open(CACHE_IMGS).then(async cache => {
        const cached = await cache.match(e.request);
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res.ok) cache.put(e.request, res.clone());
          return res;
        }).catch(() => new Response('', { status: 503 }));
      })
    );
    return;
  }

  // ── Assets estáticos (.js .css .woff2 imágenes): cache-first ──────────────
  if (url.pathname.match(/\.(js|css|woff2?|png|jpg|jpeg|webp|svg|ico|ts|map)$/)) {
    e.respondWith(
      caches.open(CACHE_STATIC).then(async cache => {
        const cached = await cache.match(e.request);
        if (cached) return cached;
        return fetch(e.request.clone()).then(res => {
          if (res.ok) cache.put(e.request, res.clone());
          return res;
        }).catch(() => new Response('', { status: 404 }));
      })
    );
    return;
  }

  // ── Navegación HTML: stale-while-revalidate + fallback offline completo ────
  e.respondWith(
    caches.match(e.request).then(async cached => {
      const networkFetch = fetch(e.request.clone())
        .then(res => {
          if (res.ok && res.status < 400) {
            caches.open(CACHE_MAIN).then(c => c.put(e.request, res.clone()));
          }
          return res;
        })
        .catch(async () => {
          // Fallback completo offline: intentar ruta exacta, luego / , luego shell HTML
          return (
            cached ||
            await caches.match('/') ||
            await caches.match('/index.html') ||
            new Response(
              `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/><title>CIVAC PRO — Sin conexión</title><style>body{background:#020d09;color:#00f5d4;font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center}h1{font-size:1.5rem}p{color:rgba(255,255,255,.5);font-size:.9rem;margin-top:.5rem}</style></head><body><div><div style="font-size:3rem">📡</div><h1>CIVAC PRO — Offline</h1><p>Sin conexión a internet.<br/>Los datos guardados siguen disponibles.</p></div></body></html>`,
              { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
            )
          );
        });

      return cached || networkFetch;
    })
  );
});

// ─── Background Sync — cola offline ──────────────────────────────────────────
self.addEventListener('sync', (e) => {
  if (e.tag === 'civac-sync') e.waitUntil(flushOfflineQueue());
});

async function flushOfflineQueue() {
  try {
    const cache = await caches.open(CACHE_QUEUE);
    const keys  = await cache.keys();
    await Promise.allSettled(keys.map(async req => {
      try {
        const res  = await cache.match(req);
        if (!res) return;
        const body = await res.text();
        const ok   = await fetch(req.url, { method:'POST', headers:{'Content-Type':'application/json'}, body });
        if (ok.ok) await cache.delete(req);
      } catch { /* reintentar en próximo sync */ }
    }));
  } catch { /* almacenamiento no disponible */ }
}

// ─── Periodic Background Sync — pre-calentar datos cada 6 h ─────────────────
self.addEventListener('periodicsync', (e) => {
  if (e.tag === 'civac-refresh') {
    e.waitUntil(precacheRoutes());
  }
});

async function precacheRoutes() {
  try {
    const cache = await caches.open(CACHE_MAIN);
    await Promise.allSettled(
      NAV_ROUTES.map(r => fetch(r).then(res => { if (res.ok) cache.put(r, res); }).catch(() => {}))
    );
  } catch { /* sin conexión */ }
}

// ─── Messages — control desde la app ─────────────────────────────────────────
self.addEventListener('message', async (e) => {
  if (!e.data) return;
  switch (e.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'CLEAR_CACHE':
      await Promise.all((await caches.keys()).map(k => caches.delete(k)));
      e.source?.postMessage?.({ type: 'CACHE_CLEARED' });
      break;
    case 'PRECACHE_ALL':
      await precacheRoutes();
      e.source?.postMessage?.({ type: 'PRECACHE_DONE' });
      break;
    case 'GET_CACHE_SIZE': {
      if (navigator.storage?.estimate) {
        const est = await navigator.storage.estimate();
        e.source?.postMessage?.({ type: 'CACHE_SIZE', ...est });
      }
      break;
    }
  }
});

// ─── Push Notifications ───────────────────────────────────────────────────────
self.addEventListener('push', (e) => {
  const data = e.data?.json?.() || { title: 'CIVAC PRO', body: 'Nueva alerta del sistema' };
  e.waitUntil(
    self.registration.showNotification(data.title || 'CIVAC PRO', {
      body:    data.body  || 'Revisa el sistema',
      icon:    '/favicon.svg',
      badge:   '/favicon.svg',
      tag:     'civac-alert',
      data,
      actions: [{ action:'view', title:'Ver en CIVAC' }],
    })
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const target = e.notification.data?.route || '/alertas';
  e.waitUntil(
    self.clients.matchAll({ type:'window', includeUncontrolled:true }).then(clients => {
      const existing = clients.find(c => c.url.includes(location.origin));
      if (existing) { existing.focus(); existing.navigate(target); }
      else self.clients.openWindow(target);
    })
  );
});
