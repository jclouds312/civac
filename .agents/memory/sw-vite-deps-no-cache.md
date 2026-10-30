---
name: SW must not cache Vite dep URLs
description: Service Worker cache-first for .js files breaks Vite dep optimization, causing a null React dispatcher crash on cold start.
---

## Rule
The Service Worker must NEVER cache Vite dev-server URLs: `/node_modules/`, `/@vite/`, `/@react-refresh`, `/__`.

## Why
Vite's dep pre-bundler (`/node_modules/.vite/deps/`) can run multiple optimization passes during a session (one at startup + one each time a new dep is discovered). Each pass generates a new version hash (e.g. `react.js?v=fe2a14d2` → `react.js?v=d9e15b96`). If the SW has cached `react.js?v=d9e15b96` from a *previous* session with old chunk URLs (e.g. `chunk-OLD.js?v=old`), but `react-dom_client.js?v=d9e15b96` is fetched fresh with NEW chunk URLs (`chunk-KC53NVYV.js?v=fe2a14d2`), the two React entry points reference DIFFERENT chunk module identities in the browser's ESM registry → two separate `ReactSharedInternals` objects → react-dom sets `.H = dispatcher` on one, React's `resolveDispatcher` reads from the other → `null.useState()` crash.

## How to apply
In `sw.js` fetch handler, add an early-return guard BEFORE the cache-first static asset handler:
```js
if (url.pathname.startsWith('/node_modules/') ||
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/__')) {
  return; // let browser handle directly, no SW cache
}
```
Also bump `CACHE_VER` whenever the SW itself changes, to clear all stale caches on activate.
