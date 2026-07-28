# GanaderIA — CIVAC PRO v2.3
## Control Inteligente de Valor Agropecuario · Colombia

Sistema de gestión ganadera integral para Colombia. PWA instalable (v11, 34 rutas), 35+ módulos, multirol con 6 cuentas, dark/light mode, persistencia offline con IndexedDB + localStorage, rastreo GPS bovino en tiempo real, trazabilidad ICA, sanidad animal, asesora IA y backends Python (Analytics Flask + GPS Django).

**Paleta v2.3:** Gold × Silver neon (`#FFD700` ↔ `#C8D4EC`) en todos los bordes de cards, badges, sidebar y módulos. Service Worker v11 con auto-update broadcast.

**Chat interno v2.3:** 6 canales (general · admin · campo · veterinarios · pagos · soporte) + DMs directos. Notificaciones push desde admin/ventas. Payment links configurables por admin en tab pagos.

---

## Inicio rápido

```bash
# Arrancar el frontend PWA (puerto 5000)
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/ganader-ia run dev

# Arrancar el API Server Node.js (puerto 8080)
PORT=8080 pnpm --filter @workspace/api-server run dev

# Typecheck completo del workspace
pnpm run typecheck
```

Todos los datos de la PWA viven en `AppStateContext` (React Context + localStorage). No se requiere backend para el frontend.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Runtime | Node.js 24 · pnpm workspaces |
| Frontend | React 18 · Vite 6 · TypeScript 5.9 |
| Routing | wouter (SPA ligero, sin React Router) |
| UI | shadcn/ui · Tailwind CSS v4 |
| Gráficos | Recharts (BarChart · AreaChart · PieChart) |
| Iconos | lucide-react |
| Estado | React Context + localStorage + IndexedDB |
| PWA | Service Worker v11 · Web App Manifest v2.2 · Background Sync · 33 rutas |
| API Server | Node.js + Fastify (puerto 8080) |
| Analytics | Python 3 Flask (puerto 8099) |
| GPS Backend | Python 3 Django (puerto 8000) |

---

## Estructura del proyecto

```
artifacts/ganader-ia/
├── public/
│   ├── favicon.svg          — Logo SVG Holstein + chip IA teal, borde Gold×Silver
│   ├── manifest.json        — PWA manifest v2.2 (8 shortcuts, WCO, launch_handler)
│   ├── sw.js                — Service Worker v11 (33 rutas, GET_VERSION msg)
│   ├── browserconfig.xml    — Windows tile config (tile color #FFD60A)
│   ├── opengraph.jpg        — Imagen social / PWA screenshot
│   └── robots.txt
├── src/
│   ├── lib/
│   │   ├── data.ts          — AppStateProvider + useAppState + seed data + localStorage
│   │   ├── auth.ts          — AuthProvider + useAuth + CIVAC_STAFF_IDS + 7 cuentas
│   │   ├── theme.ts         — ThemeProvider + useTheme (dark/light, persiste en localStorage)
│   │   ├── print.ts         — printModule() helper para imprimir/PDF cualquier módulo
│   │   ├── export.ts        — exportToCSV / exportToJSON helpers
│   │   ├── drive.ts         — Google Drive backup helper
│   │   └── utils.ts         — Utilidades generales
│   ├── components/
│   │   ├── layout.tsx       — Sidebar oscuro + topbar + PWA WCO titlebar
│   │   └── civac-agent.tsx  — Asistente IA flotante (botón global en todas las páginas)
│   ├── pages/
│   │   ├── login.tsx             — 3 tabs: login / cuentas-demo / planes · pasarela Wompi
│   │   ├── dashboard.tsx         — Tablero CIVAC: 6 KPIs, charts, ticker live, accesos rápidos
│   │   ├── admin-dashboard.tsx   — Panel Admin 14 secciones (facturación, clientes, métricas)
│   │   ├── developer-dashboard.tsx — Consola desarrollador CIVAC
│   │   ├── ventas-dashboard.tsx  — Dashboard rol ventas / CRM
│   │   ├── server-login.tsx      — Login panel servidor CIVAC Staff
│   │   ├── server-dashboard.tsx  — Panel servidor 11 secciones (deps, langs, integrations)
│   │   ├── inventario.tsx        — 13 cabezas, RFID, filtros, CRUD completo
│   │   ├── produccion.tsx        — Ordeños diarios, ranking top-vacas, BarChart 7 meses
│   │   ├── reproduccion.tsx      — IEP, celos, inseminaciones, próximos partos, anestros
│   │   ├── genetica.tsx          — DEP ranking con barras de score, pedigrí
│   │   ├── potreros.tsx          — Mapa CSS rotación, semáforo estado, lista
│   │   ├── alimentacion.tsx      — Raciones TMR, minerales, suplementos
│   │   ├── insumos.tsx           — Kardex, stock mínimo, botones +/-, alertas
│   │   ├── personal.tsx          — 6 empleados, cargos, nómina, EPS/ARL
│   │   ├── costos.tsx            — P&G detallado, costo/litro, margen, 5 KPIs
│   │   ├── prediccion.tsx        — Simulador financiero IA con Sliders, proyección 12m
│   │   ├── co2.tsx               — Huella carbono IPCC 2019, benchmarking Colombia
│   │   ├── alertas.tsx           — Centro notificaciones, severidad, resolver
│   │   ├── semen.tsx             — Inventario criogénico, embriones TE
│   │   ├── ficha.tsx             — Historia clínica tabbed: vacunas/pesos/partos/eventos
│   │   ├── multifinca.tsx        — 3 fincas, cards detalladas, tabla comparativa
│   │   ├── usuarios.tsx          — Gestión cuentas, permisos por módulo y rol
│   │   ├── configuracion.tsx     — Tabs: Finca/Apariencia/Notificaciones/Seguridad/Datos
│   │   ├── documentacion.tsx     — Guías 24 secciones: todos los módulos + PWA + server
│   │   ├── manual.tsx            — Manual de usuario completo
│   │   ├── pesaje.tsx            — Báscula BT/COM/Manual + IA engine (BCS, GMD, score)
│   │   ├── pesaje-manual.tsx     — Pesaje manual con CC, recibo PDF
│   │   ├── gps.tsx               — GPS bovino: watchPosition real, mapa SVG animado, geovallado
│   │   ├── gps-chips.tsx         — Gestión dispositivos GPS/collares, MQTT broker
│   │   ├── planes.tsx            — Planes Free/PRO/Premium/Platino + pasarela pagos Wompi
│   │   ├── lotes.tsx             — Gestión de lotes y movimiento de animales
│   │   ├── datos.tsx             — Centro respaldo: exportar/importar JSON, reset
│   │   ├── drive.tsx             — Google Drive backup, historial versiones, restaurar
│   │   ├── asesora.tsx           — Asesora IA especializada en ganadería Colombia
│   │   ├── ventas.tsx            — CRM: pipeline comercial, prospectos, seguimiento
│   │   ├── sanidad.tsx           — Vacunación, tratamientos, diagnósticos, retiro
│   │   ├── trazabilidad.tsx      — Trazabilidad bovina ICA, guías movilización, SINIGAN
│   │   ├── acerca.tsx            — Información del sistema, versión, créditos
│   │   ├── plan-landing.tsx      — Landing pública por plan (/plan/:planId)
│   │   └── invite.tsx            — Página de invitación por token (/invite/:token)
│   └── App.tsx                   — 34 rutas + ThemeProvider + AuthProvider + AppStateProvider
```

---

## Sistema de autenticación — Cuentas oficiales v7.5.0

### Cuentas CIVAC Staff (acceso Server Panel + badge ⬡ CIVAC)

| Nombre | Email | Password | Rol | Cargo |
|--------|-------|----------|-----|-------|
| Super Administrador | super@civac.co | super2026 | superadmin | Control total · Auditoría · Config global |
| Administrador General | admin@civac.co | admin | admin | Panel Admin completo · Gestión plataforma |
| Dev · Arquitecto CIVAC | dev@civac.co | dev2026 | developer | Consola Dev · PWA · APIs · Deploy |
| Asesora CIVAC · Ventas | ventas@civac.co | ventas2026 | sales | Asesora Comercial Senior · CRM |

### Cuentas Cliente (acceso finca — Plan Premium)

| Nombre | Email | Password | Rol | Descripción |
|--------|-------|----------|-----|-------------|
| Dr. Carlos Ramírez | vet@civac.co | vet2026 | vet | Médico Veterinario — módulos clínicos |
| Luis Patiño | luis@civac.co | campo2026 | field | Jefe de Campo — pesaje, GPS, potreros |
| Propietario / Inversor | visor@civac.co | visor | viewer | Solo lectura / dashboards |

**`CIVAC_STAFF_IDS`** = `['superadmin','developer','admin','sales']` — exportado de `auth.ts`. Estas cuentas muestran badge `⬡ CIVAC` en lugar del badge de plan y tienen acceso al Server Panel (`/server`).

**Respaldo oficial:** `civac-accounts-backup.json` — contiene todas las cuentas staff, demo por plan y cuentas cliente con passwords, precios, permisos y configuración de días demo.

---

## Módulos del sistema (35+ módulos)

| # | Módulo | Ruta | Rol mínimo | Descripción |
|---|--------|------|------------|-------------|
| 1 | Dashboard | `/` | viewer | 6 KPIs, charts históricos, ticker LIVE |
| 2 | Inventario | `/inventario` | field | 13 bovinos, RFID, filtros, CRUD |
| 3 | Producción | `/produccion` | field | Ordeños, 84 L/día, top-vacas, BarChart |
| 4 | Reproducción | `/reproduccion` | vet | IEP, celos, IA bovina, próximos partos |
| 5 | Genética | `/genetica` | vet | DEP ranking, score bars, pedigrí |
| 6 | Pesaje BT | `/pesaje` | field | Báscula Bluetooth — BCS, GMD, 9 razas |
| 7 | Pesaje Manual | `/pesaje-manual` | field | CC, GMD, recibo PDF imprimible |
| 8 | Ficha Individual | `/ficha` | vet | Historia clínica tabbed por animal |
| 9 | Semen | `/semen` | vet | Inventario criogénico, embriones TE |
| 10 | Lotes | `/lotes` | field | Movimiento de lotes ganaderos |
| 11 | Potreros | `/potreros` | field | 6 lotes, rotación activa, mapa CSS |
| 12 | GPS Bovino | `/gps` | field | watchPosition real, mapa animado, geovallado |
| 13 | GPS Chips | `/gps-chips` | field | Dispositivos GPS/collares, MQTT broker |
| 14 | Alimentación | `/alimentacion` | field | Raciones TMR, minerales, suplementos |
| 15 | Insumos | `/insumos` | field | Kardex, stock mínimo, +/-, alertas |
| 16 | Sanidad | `/sanidad` | vet | Vacunación, tratamientos, retiro |
| 17 | Trazabilidad | `/trazabilidad` | vet | ICA, guías movilización, SINIGAN |
| 18 | Costos P&G | `/costos` | viewer | Ingresos/egresos, costo/litro, margen |
| 19 | Personal | `/personal` | admin | 6 empleados, nómina, EPS/ARL |
| 20 | Predicción IA | `/prediccion` | viewer | Simulador financiero con sliders 12m |
| 21 | Huella CO₂ | `/co2` | viewer | IPCC 2019, benchmarking Colombia |
| 22 | Multi-Finca | `/multifinca` | viewer | 3 fincas, comparativa centralizada |
| 23 | Alertas | `/alertas` | viewer | Centro notificaciones, resolver |
| 24 | Asesora IA | `/asesora` | viewer | Chatbot IA ganadería colombiana |
| 25 | Ventas CRM | `/ventas` | sales | Pipeline comercial, prospectos |
| 26 | Drive | `/drive` | viewer | Backup nube, historial 30 versiones |
| 27 | Centro Datos | `/datos` | viewer | Exportar/importar JSON, reset |
| 28 | Planes | `/planes` | viewer | Básico/PRO/Premium/Platino + Wompi |
| 29 | Usuarios | `/usuarios` | admin | Gestión cuentas, permisos por módulo |
| 30 | Configuración | `/configuracion` | viewer | Finca/Apariencia/Seguridad/Datos |
| 31 | Documentación | `/documentacion` | viewer | 24 secciones: todos los módulos |
| 32 | Manual | `/manual` | viewer | Manual de usuario completo |
| 33 | Básculas | `/basculas` | field | Gestión multi-báscula COM/BT |
| — | Acerca de | `/acerca` | viewer | Info sistema, versión, créditos |
| — | Server Login | `/server` | staff | Acceso panel servidor CIVAC |
| — | Server Dashboard | `/server-dashboard` | staff | 11 secciones: deps, langs, integraciones |

---

## GPS Bovino — Características técnicas

- **`navigator.geolocation.watchPosition`** — seguimiento continuo real del navegador
- **Mapa SVG animado** — potreros con colores, dots con pulso para animales online
- **13 collares activos** — protocolo CIVAC-GPS-v3 vía MQTT broker `mqtt.civac.co:1883`
- **Estado real de batería** — declive simulado progresivo, indicadores por color
- **Escaneo Bluetooth** — Web Bluetooth API; fallback a resultados demo si no disponible
- **Vincular dispositivos** — formulario manual (nombre, IMEI, tipo, animal)
- **Geovallado** — panel de alertas por zona; animales sin señal resaltados
- **Módulo GPS Chips** (`/gps-chips`) — gestor avanzado de dispositivos y configuración MQTT

---

## PWA — Service Worker v11

| Estrategia | Recursos |
|-----------|---------|
| Cache-first | Assets estáticos (.js, .css, .woff2, imágenes) |
| Stale-while-revalidate | Navegación HTML (SPA shell) |
| Network-first + fallback | Rutas /api/* |
| Cache-first TTL largo | Fuentes externas (Google Fonts) |
| Cache-first | Imágenes externas (tiles de mapa) |
| Background Sync | Cola de acciones offline → reenvío al reconectar |
| Periodic Sync | Pre-calentar datos cada 6 horas |
| Push Notifications | Alertas de partos, vacunación, stock |
| Share Target | Acepta archivos .json para importar backup |

**33 rutas pre-cacheadas** en `install`. Shell offline completo con mensaje CIVAC PRO v11.

Mensajes soportados: `SKIP_WAITING`, `CLEAR_CACHE`, `PRECACHE_ALL`, `GET_CACHE_SIZE`, `GET_VERSION`.

---

## PWA Windows Desktop — Window Controls Overlay (WCO)

- **`display_override: ["window-controls-overlay"]`** en manifest.json v2.2
- **CSS `@media (display-mode: window-controls-overlay)`** — titlebar drag region
- **`env(titlebar-area-*)` CSS variables** — posición y dimensiones exactas del titlebar
- **`.pwa-titlebar` div** en layout.tsx — muestra módulo activo en la barra de título
- **`-webkit-app-region: drag`** — barra arrastrable; botones con `no-drag`
- **`launch_handler: { client_mode: ["navigate-existing", "auto"] }`** — una sola ventana
- **`handle_links: "preferred"`** — la app abre sus propios links internamente
- **`theme_color: "#FFD60A"`** — color de la barra de Windows dorado neon
- **`browserconfig.xml`** — tile de Windows con color PIÑA (#FFD60A)
- **`msapplication-task`** — 4 tareas en jump-list de Windows (Dashboard, GPS, Pesaje, Inventario)

---

## Diseño visual — v2.2 (Gold × Silver Neon)

### Paleta Gold × Silver
- **Dorado neon:** `#FFD700` / `rgba(255,210,0,x)`
- **Plateado neon:** `#C8D4EC` / `rgba(196,208,228,x)`
- **Animación:** `@keyframes civac-gs` — ciclo 5s ease-in-out gold ↔ silver
- **Aplicado a:** `.kpi-card`, `.kpi-ultra`, `.card-lift`, `.neon-card`, `.lm-card*`, `.glass-card`, `.glass-panel`
- **Clase utilitaria:** `.gs-border` — gradiente perfecto respetando border-radius
- **Scrollbar:** gradiente gold→silver en dark mode
- **Sidebar active line:** `linear-gradient(#FFD700, #C8D4EC)`
- **Topbar border:** `rgba(255,210,0,0.12)`

### Dark mode (predeterminado)
- Fondo: navy profundo `hsl(220 45% 16%)`
- Paleta marina con acentos gold×silver neon
- Cards con gradientes oscuros y bordes gs animados

### Light mode
- Fondo: crema cálido `hsl(38 22% 84%)`
- Paleta granja: verdes, tierra, amarillo girasol
- KPI cards con box-shadow gold suave

### Identidad por módulo
| Módulo | Gradiente | Acento |
|--------|-----------|--------|
| GPS | `#020d1a → #0a2745` | azul marino |
| Inventario | verde | `#39ff7e` |
| Producción | azul | `#00c8ff` |
| Pesaje | naranja | `#ff9a3c` |
| Reproducción | magenta | `#ff6fd8` |
| Genética | violeta | `#a855f7` |
| Sanidad | verde salud | `#22c55e` |
| Trazabilidad | naranja ICA | `#f97316` |
| Asesora IA | púrpura IA | `#e879f9` |
| Server Panel | teal CIVAC | `#00f5d4` |
| Dashboard | gold PIÑA | `#FFD60A` |

---

## Flujo de login

```
Pantalla Login (/login implícito vía AuthGate)
  ├── Tab "🔑 Iniciar Sesión" — formulario email + contraseña
  ├── Tab "👤 Cuentas Demo"  — cuentas cliente visibles; staff OCULTOS
  └── Tab "💳 Planes"        — Básico/PRO/Premium/Platino + modal pago Wompi/Nequi/PSE

Server Panel (fuera del AuthGate)
  ├── /server              — ServerLogin (solo staff CIVAC)
  └── /server-dashboard    — ServerDashboard (11 secciones)

Rutas públicas (sin auth)
  ├── /plan/:planId        — PlanLanding (landing pública por plan)
  └── /invite/:token       — InvitePage (invitación por enlace)
```

---

## Decisiones de arquitectura

- **Frontend puro** — todos los datos en React Context + localStorage. Sin backend obligatorio.
- **AppStateContext** — fuente única de verdad. `useAppState()` en `src/lib/data.ts`.
- **AuthContext** — autenticación localStorage con 7 cuentas. Sin JWT/servidor.
- **ThemeContext** — toggle dark/light via clase `.dark` en `document.documentElement`.
- **wouter** — router SPA ligero. Todas las rutas usan `import.meta.env.BASE_URL`.
- **Sidebar siempre oscuro** — identidad de marca, independiente del tema.
- **Recharts** — gráficos: BarChart preferido, AreaChart en dashboard, PieChart composición.
- **printModule()** — helper global para imprimir/PDF cualquier módulo.
- **CIVAC_STAFF_IDS** — array en `auth.ts` para identificar cuentas staff con acceso al Server Panel y badge `⬡ CIVAC`.
- **AdminGate / AuthGate** — routing condicional por rol en App.tsx. Admin/superadmin → AdminGate (sin Layout de finca). Developer → Layout con todas las rutas.

---

## Historial de versiones

| Versión | Cambios principales |
|---------|---------------------|
| v2.2 (v11 SW) | **Gold × Silver Neon** borde animado global (`@keyframes civac-gs`) en todos los cards/KPIs/lm-cards · **PWA Windows WCO** titlebar drag region + env(titlebar-area-*) · **manifest.json v2.2** launch_handler, handle_links, file_handlers, WCO display_override · **browserconfig.xml** Windows tile gold · **SW v11** shell offline gold×silver · **viewport-fit=cover** + tema dorado en dark mode · favicon borde gold×silver · `msapplication-task` jump-list Windows · **cuentas v7.5.0** con 7 cuentas oficiales |
| v2.1 (v10 SW) | **Seguridad login**: cuentas CIVAC Staff sin contraseña visible (badge 🔒 Acceso protegido) · Cuentas demo con credenciales visibles + botón copiar email/pass · Versión unificada v2.1 en toda la plataforma · API Server operativo con PostgreSQL real (seed completo 30 animales) · Build esbuild 0.27.7 estable |
| v2.0 (v8 SW) | Bottom nav mobile multicolor neon · Login v2.0 badge · Feature badges actualizados · 8 drivers Windows COM · 11 controladores BT · 8 tipos GPS · Analytics Server v2.0 |
| v7.0 | 32+ módulos · Server Panel 11 secciones · Sanidad + Trazabilidad ICA · GPS Chips MQTT · Ventas CRM · Asesora IA · Drive backup |
| v5.0 | GPS real-time watchPosition · 6 cuentas de acceso · Admin/Developer dashboards · Pesaje PRO con IA engine |
| v1.x | MVP inicial React + Vite |

---

## Preferencias de desarrollo

- Clone visual basado en: https://smart-ganader-ia-colombia.base44.app
- **Referencia de diseño Base44:** la app original en base44.app es la guía visual de referencia; este proyecto es la implementación completa en código propio.
- Banners degradados por módulo con color identity único
- KPI cards vividas con gradientes, glow y animación gold×silver
- Cabeceras de tabla verde oscuro `bg-[#1a4a2e]`
- Badges de color para lote / categoría / estado / cargo
- Barras horizontales para top-vacas en producción
- BarChart (NO AreaChart) para producción/predicción/co2
- `@workspace/api-client-react` se usa SOLO en `main.tsx` para `setBaseUrl`. En el resto de la app usar solo React state puro.
- Iconos: solo `lucide-react` (usar `Map`, NO `MapMap`; usar `Beef`, NO `Cow`)
- Dark mode es el predeterminado de la app
- Idioma: español colombiano en toda la UI
- Nunca usar emojis en código salvo en strings de UI

---

## Reglas críticas para el agente

- `useAppState` en `src/lib/data.ts` es la ÚNICA fuente de datos. No romper.
- **CRÍTICO:** `data.ts`, `theme.ts` y `auth.ts` son archivos `.ts` (no `.tsx`) → usar SOLO imports nombrados de React. NUNCA `import * as React` — se vuelve null en Vite HMR. Usar: `import { useState, useEffect } from "react"` + `import type { ReactNode } from "react"`.
- Slider: `@/components/ui/slider` (ya instalado).
- Todas las rutas deben usar `BASE_URL` prefix (`import.meta.env.BASE_URL`).
- La app corre en el workflow `GanaderIA Frontend` proxiado en `/`.
- Dark mode: `@custom-variant dark (&:is(.dark *))` — clase `.dark` en `document.documentElement`.
- NO usar `MapMap` de lucide-react → usar `Map`. NO usar `Cow` → usar `Beef`.
- Server Panel (`/server`, `/server-dashboard`) está **fuera del AuthGate** — acceso directo sin autenticación de finca.
- `CIVAC_STAFF_IDS` en `auth.ts` controla quién ve el badge CIVAC y tiene acceso al Server Panel.
- `Cow` no existe en lucide-react instalado → usar `Beef`. Verificar nuevos iconos antes de usarlos.
- Gold × Silver paleta: `#FFD700` (dorado) ↔ `#C8D4EC` (plateado) — aplicar con `.gs-border` o `civac-gs` keyframes.

## User preferences

- Dark mode es el predeterminado de la app
- Idioma: español colombiano en toda la UI
- Nunca usar emojis en código salvo en strings de UI
