# GanaderIA — Ganadería Inteligente

Sistema de gestión ganadera inteligente con 16+ módulos completos, datos en tiempo real y diseño idéntico al original (https://smart-ganader-ia-colombia.base44.app).

## Run & Operate

- `pnpm --filter @workspace/ganader-ia run dev` — PWA frontend (wouter routing, auto-assigned port)
- `pnpm run typecheck` — full typecheck across all packages
- No backend required — todos los datos viven en `useAppState` hook (React state + seed data)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 18 + Vite + wouter (client-side routing)
- UI: shadcn/ui + Tailwind CSS (dark theme, dark green sidebar)
- Charts: Recharts (BarChart, AreaChart, PieChart)
- Icons: lucide-react

## Where things live

```
artifacts/ganader-ia/
  src/
    lib/data.ts           — useAppState hook, ALL seed data (source of truth, do not break)
    components/layout.tsx — sidebar + topbar (dark forest-green theme)
    pages/
      dashboard.tsx       — tablero principal (8 sections, 6 KPI cards, 3-col analytics)
      inventario.tsx      — 13 cabezas, table + CRUD, colored badges
      produccion.tsx      — blue banner, top-cow bars, BarChart, planilla
      insumos.tsx         — orange banner, +/- stock buttons, alert banner
      personal.tsx        — orange banner, cargo badges, nómina footer
      costos.tsx          — 5 KPI cards, P&G detallado, costo/litro breakdown
      reproduccion.tsx    — 5 bordered KPIs, próximos partos table, anestros panel
      genetica.tsx        — DEP ranking with score bars, pedigrí panel
      prediccion.tsx      — BarChart proyección + live simulador financiero con Sliders
      co2.tsx             — benchmarking + balance + evolución chart
      alertas.tsx         — red banner, severity cards with resolve button
      alimentacion.tsx    — green banner, raciones table, suplementos grid
      semen.tsx           — teal banner, semen + embriones tables
      ficha.tsx           — blue banner, tabbed animal history (vacunas/pesos/partos/eventos)
      potreros.tsx        — teal banner, mapa CSS + lista toggle
      multifinca.tsx      — placeholder
      usuarios.tsx        — placeholder
      configuracion.tsx   — placeholder
    App.tsx               — 20 rutas con wouter + BASE_URL
```

## Architecture decisions

- **Frontend only, no backend** — all data in React state via `useAppState` in `src/lib/data.ts`. No API calls.
- **wouter routing** — lightweight SPA router. All routes under `BASE_URL` (handled by Vite proxy config).
- **Colorful gradient banners per page** — each module has its own color identity (green/blue/orange/teal/red).
- **Dark green sidebar** (`bg-[#0d2016]`) matching original design. Active item: `bg-[#1a5c2e]`.
- **Recharts** for all charts (BarChart preferred, AreaChart for dashboard, PieChart for composition).

## Product

GanaderIA es un sistema de gestión ganadera que incluye:
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
- Alimentación, Semen/Embriones, Ficha individual

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
- Slider component: `@/components/ui/slider` (already installed)
- All routes must use `BASE_URL` prefix (set by Vite env, exposed via `import.meta.env.BASE_URL`)
- The app runs on workflow `artifacts/ganader-ia: web` at a dynamic port proxied through localhost:80 at path `/`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
