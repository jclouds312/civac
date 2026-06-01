---
name: CIVAC Server Panel architecture
description: How the CIVAC internal server zone is separated from the client-facing login/demo system
---

## Rule
The CIVAC Server Panel is a fully separate zone from the client-facing GanaderIA PWA.

## URLs
- `/server` → ServerLogin page (CIVAC staff only)
- `/server-dashboard` → ServerDashboard (guarded, redirects to /server if not auth'd)
- `/` → client login (demos, plan accounts, farm users)

## Access control
- `CIVAC_STAFF_IDS` in `src/lib/auth.ts` = `['superadmin', 'developer', 'admin', 'ventas']`
- Server dashboard guards check `CIVAC_STAFF_IDS.includes(user.id)` and redirect if not staff
- These routes are declared BEFORE `<Route component={AuthGate}/>` in App.tsx's Switch

## Account split
- **CIVAC Staff** (server panel): super@civac.co, dev@civac.co, admin@ganader.ia, ventas@civac.co
- **Demo/sales accounts**: demo_basico, demo_pro, demo_premium, demo_platino — for showing demos to clients
- **Farm user accounts**: vet, campo, visor — standard platform users

## Visual identity
- Server zone: deep space dark (#020810), teal (#00f5d4) accents, monospace font, grid background
- Client zone: navy + farm imagery, warm accents, Colombian theme

**Why:** The user wants CIVAC internal staff to have a dedicated server management zone that manages all PWA instances, versions, and clients, separate from the client-facing demo/sales login.
