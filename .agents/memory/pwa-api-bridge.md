---
name: PWA–API bridge pattern
description: How the GanaderIA PWA syncs auth state with the API server. Key gotchas for async state updates in auth.ts.
---

## The setAccounts gotcha

`setAccounts` in `AuthProvider` is a custom wrapper (`useCallback`), NOT a useState setter:
```ts
const setAccounts = useCallback((next: Account[]) => {
  setAccountsState(next); saveAccounts(next);
}, []);
```
**It does NOT support functional updates** (`setAccounts(prev => ...)` fails TypeScript).

**Fix:** Use `setAccountsState` (the raw useState setter) directly for functional updates inside async callbacks, then call `saveAccounts` manually:
```ts
setAccountsState(prev => {
  const next = prev.map((a: Account) => a.id === id ? { ...a, ...updates } : a);
  saveAccounts(next);
  return next;
});
```

## loginAs background sync

`loginAs()` does a fire-and-forget `fetch('/api/auth/login', ...)` after local login to:
1. Store `civac_session_token` in localStorage
2. Sync `demoExpiry`, `planExpiry`, `demoDias` from server into local account state
3. Handle 402 error codes (`demo_expired`, `plan_expired`) and update local flags

The response on success: `{ token, user: { id, nombre, email, role, cargo, finca, planCode, demoExpiry, planExpiry, demoDiasRestantes } }`

## registerUser → API
`registerUser()` calls `POST /api/auth/register` as fire-and-forget after creating the local account. This persists new users to PostgreSQL.

## activatePlan → API
`activatePlan()` calls `POST /api/admin/users/:id/activate` (with Bearer token) after local plan update. Clears `demoExpiry` on success.

## handleSubmit fallback (login.tsx)
If local login fails (user not in localStorage), `handleSubmit` tries `POST /api/auth/login`. On success, creates a minimal Account and calls `loginAs`. Maps API error codes to user-friendly messages.

## Wompi webhook
`POST /api/webhooks/wompi` in `artifacts/api-server/src/routes/webhooks.ts`.
- Verifies X-Wompi-Signature (only if `WOMPI_INTEGRITY_KEY` env var is set)
- On `transaction.updated` + `APPROVED`: looks up user by `customer_data.email`, activates 30-day plan
- Set `WOMPI_INTEGRITY_KEY` in environment secrets to enable signature verification

## planes.tsx redirect handler
`?pago=ok&ref=CIVAC-xxx` is handled via `useEffect` in `Planes` component:
- Clears URL params, shows success toast, notifies API via `POST /api/webhooks/wompi`

## ExpiryBanner (layout.tsx)
Shows between header and content area when `user.demoExpiry` or `user.planExpiry` is ≤ 7 days away.
- Yellow: 4–7 days
- Orange: 1–3 days
- Red: expired (not dismissible)
- Dismissible via X button (session only)
- Hidden for CIVAC_STAFF_IDS
