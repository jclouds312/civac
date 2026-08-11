// CIVAC PRO — Service Worker v12
// Estrategia: Cache-first assets · Stale-while-revalidate nav · Network-first API
// Memoria expandida: 50 MB quota + persistent storage · Offline shell completo
// v12: evita cachear módulos fuente y dependencias Vite durante desarrollo

const CACHE_VER    = 'v12';
const CACHE_MAIN   = `civac-main-${CACHE_VER}`;
const CACHE_STATIC = `civac-static-${CACHE_VER}`;
const CACHE_API    = `civac-api-${CACHE_VER}`;
const CACHE_IMGS   = `civac-imgs-${CACHE_VER}`;
const CACHE_FONTS  = `civac-fonts-${CACHE_VER}`;
const CACHE_QUEUE  = 'civac-offline-queue';

// App shell — archivos críticos de arranque
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/favicon.ico',
  '/sw.js',
  '/robots.txt',
  '/browserconfig.xml',
];

// Todas las rutas de navegación de la PWA para pre-caché offline completo
const NAV_ROUTES = [
  // ── Core
  '/dashboard',
  // ── Producción animal
  '/inventario',
  '/produccion',
  '/reproduccion',
  '/genetica',
  '/semen',
  '/ficha',
  '/pesaje',
  '/pesaje-manual',
  '/basculas',
  '/lotes',
  // ── Campo
  '/potreros',
  '/gps',
  '/gps-chips',
  // ── Nutrición & Insumos
  '/alimentacion',
  '/insumos',
  // ── Finanzas & Gestión
  '/costos',
  '/personal',
  '/prediccion',
  '/co2',
  '/multifinca',
  // ── Salud & Trazabilidad
  '/sanidad',
  '/trazabilidad',
  // ── Alertas & Comunicación
  '/alertas',
  '/asesora',
  '/ventas',
  '/chat',
  // ── Admin & Config
  '/usuarios',
  '/configuracion',
  '/planes',
  '/datos',
  '/drive',
  // ── Info
  '/documentacion',
  '/manual',
  '/acerca',
];

// ─── Install — pre-cache completo ────────────────────────────────────────────
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil((async () => {
    if (navigator.storage?.persist) {
      await navigator.storage.persist().catch(() => {});
    }
    const cache = await caches.open(CACHE_STATIC);
    await Promise.allSettled(
      [...APP_SHELL, ...NAV_ROUTES].map(url =>
        cache.add(new Request(url, { cache: 'reload' })).catch(() => {})
      )
    );
  })());
});

// ─── Activate — purgar caches anteriores + broadcast update ──────────────────
self.addEventListener('activate', (e) => {
  const keep = [CACHE_MAIN, CACHE_STATIC, CACHE_API, CACHE_IMGS, CACHE_FONTS, CACHE_QUEUE];
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => !keep.includes(k)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(async () => {
        if (navigator.storage?.estimate) {
          const { usage = 0, quota = 0 } = await navigator.storage.estimate();
          if (quota > 0 && usage / quota > 0.85) {
            await caches.delete(CACHE_IMGS);
          }
        }
        // ── Broadcast update disponible a todos los clientes activos ──
        const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_ACTIVATED',
            version: CACHE_VER,
            build: 'v2.2.0',
            ts: Date.now(),
          });
        });
      })
  );
});

// ─── Fetch — estrategia escalonada ───────────────────────────────────────────
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (!url.protocol.startsWith('http')) return;

  // ── API interna: network-first, fallback caché ───────────────────────────
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

  // ── Fuentes externas: cache-first TTL largo ──────────────────────────────
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

  // ── Imágenes externas: cache-first ──────────────────────────────────────
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

  // ── Vite dev deps y HMR — NUNCA cachear (evitar conflictos de React) ─────
  if (
    url.pathname.startsWith('/node_modules/') ||
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/__') ||
    url.pathname.startsWith('/src/')
  ) {
    return;
  }

  // ── Assets estáticos: cache-first ───────────────────────────────────────
   if (url.pathname.match(/\.(js|css|woff2?|png|jpg|jpeg|webp|svg|ico|map)$/)) {
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

  // ── Navegación: stale-while-revalidate + fallback offline completo ────────
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
          return (
            cached ||
            await caches.match('/') ||
            await caches.match('/index.html') ||
            new Response(
              `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/><title>CIVAC PRO — Sin conexión</title><style>*{box-sizing:border-box}body{background:linear-gradient(135deg,#08152a,#0d1e38);color:#FFD60A;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center;padding:1rem}h1{font-size:1.5rem;margin:.5rem 0;background:linear-gradient(90deg,#FFD60A,#C8D4EC);-webkit-background-clip:text;-webkit-text-fill-color:transparent}p{color:rgba(255,255,255,.5);font-size:.9rem;margin:.25rem 0}.tag{display:inline-block;margin-top:1rem;padding:.3rem .8rem;border-radius:999px;border:1px solid rgba(255,210,0,.35);font-size:.75rem;color:rgba(255,210,0,.65);animation:gs 3s ease-in-out infinite}@keyframes gs{0%,100%{box-shadow:0 0 8px rgba(255,210,0,.3)}50%{box-shadow:0 0 8px rgba(196,208,228,.3)}}.icon{font-size:3.5rem;filter:drop-shadow(0 0 16px rgba(255,210,0,.5))}</style></head><body><div><div class="icon">🐄</div><h1>CIVAC PRO — Offline</h1><p>Sin conexión a internet.</p><p>Los datos guardados siguen disponibles.</p><span class="tag">SW v11 · CIVAC PRO v2.2</span></div></body></html>`,
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
      } catch { /* reintentar */ }
    }));
  } catch { /* sin almacenamiento */ }
}

// ─── Periodic Background Sync — pre-calentar cada 6 h ───────────────────────
self.addEventListener('periodicsync', (e) => {
  if (e.tag === 'civac-refresh') e.waitUntil(precacheRoutes());
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
      e.source?.postMessage?.({ type: 'PRECACHE_DONE', routes: NAV_ROUTES.length });
      break;
    case 'GET_CACHE_SIZE': {
      if (navigator.storage?.estimate) {
        const est = await navigator.storage.estimate();
        e.source?.postMessage?.({ type: 'CACHE_SIZE', ...est });
      }
      break;
    }
    case 'GET_VERSION':
      e.source?.postMessage?.({ type: 'VERSION', version: CACHE_VER, routes: NAV_ROUTES.length, build: 'v2.2.0' });
      break;
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
