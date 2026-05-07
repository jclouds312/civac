# GanaderIA — Ganadería Inteligente

Sistema de gestión ganadera inteligente con 16+ módulos completos, multicuentas con login, dark/light mode, PWA instalable y persistencia localStorage.

## Run & Operate

- `pnpm --filter @workspace/ganader-ia run dev` — PWA frontend (wouter routing, auto-assigned port)
- `pnpm run typecheck` — full typecheck across all packages
- No backend required — todos los datos viven en `AppStateContext` (React Context + localStorage)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 18 + Vite + wouter (client-side routing)
- UI: shadcn/ui + Tailwind CSS (dark/light theme togglable)
- Charts: Recharts (BarChart, AreaChart, PieChart)
- Icons: lucide-react
- PWA: Service Worker real + Web App Manifest

## Where things live

```
artifacts/ganader-ia/
  src/
    lib/
      data.ts           — AppStateProvider + useAppState + seed data + localStorage persistence
      auth.ts           — AuthProvider + useAuth + ACCOUNTS (4 cuentas predefinidas)
      theme.ts          — ThemeProvider + useTheme (dark/light, persiste en localStorage)
    components/layout.tsx — sidebar + topbar (tema toggle + user menu + install PWA)
    pages/
      login.tsx         — Pantalla de acceso con 4 tarjetas de rol
      dashboard.tsx     — tablero principal (8 secciones, 6 KPI cards)
      inventario.tsx    — 13 cabezas, table + CRUD, colored badges
      produccion.tsx    — blue banner, top-cow bars, BarChart, planilla
      insumos.tsx       — orange banner, +/- stock buttons, alert banner
      personal.tsx      — orange banner, cargo badges, nómina footer
      costos.tsx        — 5 KPI cards, P&G detallado, costo/litro breakdown
      reproduccion.tsx  — 5 bordered KPIs, próximos partos table, anestros panel
      genetica.tsx      — DEP ranking with score bars, pedigrí panel
      prediccion.tsx    — BarChart proyección + live simulador financiero con Sliders
      co2.tsx           — benchmarking + balance + evolución chart
      alertas.tsx       — red banner, severity cards with resolve button
      alimentacion.tsx  — green banner, raciones table, suplementos grid
      semen.tsx         — teal banner, semen + embriones tables
      ficha.tsx         — blue banner, tabbed animal history (vacunas/pesos/partos/eventos)
      potreros.tsx      — teal banner, mapa CSS + lista toggle
      multifinca.tsx    — 3 fincas con cards, tabla comparativa
      usuarios.tsx      — gestión de cuentas con roles y permisos
      configuracion.tsx — tabs: Finca/Apariencia/Notificaciones/Seguridad/Datos
      documentacion.tsx — guías de 16 módulos, FAQ, quickstart, PWA info
    App.tsx             — 20 rutas + ThemeProvider + AuthProvider + AppStateProvider
  public/
    favicon.svg         — Logo SVG con vaca + circuitos IA
    manifest.json       — PWA manifest con shortcuts
    sw.js               — Service Worker real (cache-first + background sync)
```

## Architecture decisions

- **Frontend only, no backend** — all data in React Context via `AppStateProvider` in `src/lib/data.ts`. No API calls.
- **AppStateContext** — global shared state with localStorage persistence. Same API as old `useAppState()`.
- **AuthContext** — localStorage-based authentication with 4 predefined accounts. No server needed.
- **ThemeContext** — dark/light toggle via `document.documentElement.classList`. Persists to localStorage.
- **wouter routing** — lightweight SPA router. All routes under `BASE_URL`.
- **Dark sidebar always** — sidebar stays dark green even in light mode (brand identity).
- **Recharts** for all charts (BarChart preferred, AreaChart for dashboard, PieChart for composition).

## Auth system (4 cuentas)

| Usuario | Email | Password | Rol |
|---------|-------|----------|-----|
| Administrador General | admin@ganader.ia | admin | admin |
| Dr. Carlos Ramírez | vet@ganader.ia | vet2025 | vet |
| Luis Patiño | luis@ganader.ia | campo2025 | field |
| Propietario/Inversor | visor@ganader.ia | visor | viewer |

## Product

GanaderIA es un sistema de gestión ganadera que incluye:
- **Login multicuenta** — 4 cards de acceso por rol (admin, veterinario, campo, solo lectura)
- **Dark/Light mode** — toggle en topbar, persiste en localStorage
- **PWA instalable** — service worker real, manifest con shortcuts, funciona offline
- Inventario animal (13 cabezas, RFID, filtros, CRUD completo)
- Producción lechera (ordeños, ranking vacas, histórico 7 meses)
- Reproducción (IEP, partos, anestros, diagnóstico IA)
- Genética (DEP, ranking, pedigrí)
- Potreros (mapa CSS interactivo, semáforo rotación)
- Insumos/Kardex (stock mínimo, alertas, +/- buttons)
- Personal y nómina (6 empleados, horas extras, EPS/ARL)
- Costos y P&G (ingresos, egresos, costo/litro, margen)
- Predicciones IA (simulador financiero con sliders)
- Huella de carbono (IPCC 2019, benchmarking Colombia)
- Alertas (centro de notificaciones, resolver)
- **Multi-Finca** — 3 fincas con cards detalladas y tabla comparativa
- **Usuarios** — gestión de cuentas con permisos por módulo
- **Configuración** — Finca/Apariencia/Notificaciones/Seguridad/Datos (exportar JSON, reset)
- **Documentación** — guías de 16 módulos, FAQ, quickstart, info PWA

## User preferences

- Clone visualmente idéntico al original en https://smart-ganader-ia-colombia.base44.app
- Colorful gradient hero banners per page (each module has own color identity)
- Vivid KPI cards with gradient backgrounds
- Dark green table headers (`bg-[#1a4a2e]`)
- Colored badges for lote / categoría / estado / cargo
- Horizontal progress bars for top cows in producción
- BarChart (not AreaChart) for producción/predicción/co2
- NO `@workspace/api-client-react` imports — pure React state only
- Use `lucide-react` icons only (Map not MapMap)

## Gotchas

- Do NOT use `MapMap` from lucide-react — it doesn't exist. Use `Map` instead.
- `useAppState` in `src/lib/data.ts` is the ONLY data source. Never break it.
- `data.ts` and `theme.ts` are `.ts` files (not `.tsx`) — use `React.createElement` instead of JSX.
- `auth.ts` also uses `React.createElement` for the Provider.
- Slider component: `@/components/ui/slider` (already installed)
- All routes must use `BASE_URL` prefix (set by Vite env, exposed via `import.meta.env.BASE_URL`)
- The app runs on workflow `artifacts/ganader-ia: web` at a dynamic port proxied through localhost:80 at path `/`
- Dark mode uses `@custom-variant dark (&:is(.dark *))` — the `dark` class is set on `document.documentElement` by ThemeProvider.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
