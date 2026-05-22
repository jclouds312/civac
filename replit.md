# GanaderIA — CIVAC PRO v5.0
## Control Inteligente de Valor Agropecuario · Colombia

Sistema de gestión ganadera integral para Colombia. PWA instalable, 28 módulos, multirol con 6 cuentas, dark/light mode, persistencia offline y rastreo GPS bovino en tiempo real.

---

## Inicio rápido

```bash
# Arrancar el frontend PWA (puerto asignado automáticamente)
pnpm --filter @workspace/ganader-ia run dev

# Typecheck completo del workspace
pnpm run typecheck
```

No se requiere backend — todos los datos viven en `AppStateContext` (React Context + localStorage).

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Runtime | Node.js 24 · pnpm workspaces |
| Frontend | React 18 · Vite · TypeScript 5.9 |
| Routing | wouter (SPA ligero, sin React Router) |
| UI | shadcn/ui · Tailwind CSS |
| Gráficos | Recharts (BarChart · AreaChart · PieChart) |
| Iconos | lucide-react |
| Estado | React Context + localStorage (sin backend) |
| PWA | Service Worker v6 · Web App Manifest · Background Sync |

---

## Estructura del proyecto

```
artifacts/ganader-ia/
├── public/
│   ├── favicon.svg          — Logo SVG Holstein + chip IA teal
│   ├── manifest.json        — PWA manifest (shortcuts, screenshots, standalone)
│   ├── sw.js                — Service Worker v6 (cache-first, offline-shell, bg-sync)
│   ├── opengraph.jpg        — Imagen social / PWA screenshot
│   └── robots.txt
├── src/
│   ├── lib/
│   │   ├── data.ts          — AppStateProvider + useAppState + seed data + localStorage
│   │   ├── auth.ts          — AuthProvider + useAuth + 6 cuentas predefinidas
│   │   ├── theme.ts         — ThemeProvider + useTheme (dark/light, persiste en localStorage)
│   │   ├── print.ts         — printModule() helper para imprimir/PDF cualquier módulo
│   │   ├── export.ts        — exportToCSV / exportToJSON helpers
│   │   ├── drive.ts         — Google Drive backup helper (opcional)
│   │   └── utils.ts         — Utilidades generales
│   ├── components/
│   │   └── layout.tsx       — Sidebar oscuro + topbar (tema, user-menu, instalar PWA)
│   ├── pages/
│   │   ├── login.tsx         — 3 tarjetas cliente + tab Planes + modal pago Wompi/Nequi
│   │   ├── dashboard.tsx     — Tablero CIVAC: 6 KPIs, charts, ticker live, 19 módulos
│   │   ├── admin-dashboard.tsx  — Panel Administrador (facturación, clientes, métricas)
│   │   ├── developer-dashboard.tsx — Consola desarrollador CIVAC
│   │   ├── inventario.tsx    — 13 cabezas, RFID, filtros, CRUD completo
│   │   ├── produccion.tsx    — Ordeños diarios, ranking top-vacas, BarChart 7 meses
│   │   ├── reproduccion.tsx  — IEP, celos, inseminaciones, próximos partos, anestros
│   │   ├── genetica.tsx      — DEP ranking con barras de score, pedigrí
│   │   ├── potreros.tsx      — Mapa CSS rotación, semáforo estado, lista
│   │   ├── alimentacion.tsx  — Raciones TMR, minerales, suplementos
│   │   ├── insumos.tsx       — Kardex, stock mínimo, botones +/-, alertas
│   │   ├── personal.tsx      — 6 empleados, cargos, nómina, EPS/ARL
│   │   ├── costos.tsx        — P&G detallado, costo/litro, margen, 5 KPIs
│   │   ├── prediccion.tsx    — Simulador financiero IA con Sliders, proyección
│   │   ├── co2.tsx           — Huella carbono IPCC 2019, benchmarking Colombia
│   │   ├── alertas.tsx       — Centro notificaciones, severidad, resolver
│   │   ├── semen.tsx         — Inventario criogénico, embriones TE
│   │   ├── ficha.tsx         — Historia clínica tabbed: vacunas/pesos/partos/eventos
│   │   ├── multifinca.tsx    — 3 fincas, cards detalladas, tabla comparativa
│   │   ├── usuarios.tsx      — Gestión cuentas, permisos por módulo y rol
│   │   ├── configuracion.tsx — Tabs: Finca/Apariencia/Notificaciones/Seguridad/Datos
│   │   ├── documentacion.tsx — Guías 20+ módulos, FAQ, quickstart, info PWA
│   │   ├── manual.tsx        — Manual de usuario completo
│   │   ├── pesaje.tsx        — Báscula BT/COM/Manual + IA engine (BCS, GMD, score)
│   │   ├── pesaje-manual.tsx — Pesaje manual con CC, recibo PDF
│   │   ├── gps.tsx           — GPS bovino: watchPosition real, mapa SVG animado,
│   │   │                        geovallado, dispositivos, vincular BT/manual
│   │   ├── planes.tsx        — Planes Free/PRO/Enterprise + pasarela pagos
│   │   ├── lotes.tsx         — Gestión de lotes ganaderos
│   │   └── datos.tsx         — Centro respaldo: exportar/importar JSON, reset
│   └── App.tsx               — 28 rutas + ThemeProvider + AuthProvider + AppStateProvider
```

---

## Sistema de autenticación — 6 cuentas

| Nombre | Email | Password | Rol | Acceso |
|--------|-------|----------|-----|--------|
| Administrador General | admin@ganader.ia | admin | admin | Panel Admin completo |
| Dr. Carlos Ramírez | vet@ganader.ia | vet2026 | vet | Módulos clínicos + lectura |
| Luis Patiño | luis@ganader.ia | campo2026 | field | Campo: pesaje, GPS, potreros |
| Propietario / Inversor | visor@ganader.ia | visor | viewer | Solo lectura / dashboards |
| Dev · Arquitecto CIVAC | dev@civac.co | dev2026 | developer | Consola desarrollo |
| Super Administrador | super@civac.co | super2026 | superadmin | Acceso total plataforma |

---

## Módulos del sistema (20 módulos productivos)

| # | Módulo | Ruta | Descripción |
|---|--------|------|-------------|
| 1 | Dashboard | `/` | 6 KPIs, charts históricos, ticker LIVE, 19 accesos rápidos |
| 2 | Inventario | `/inventario` | 13 bovinos, RFID, filtros por categoría, CRUD |
| 3 | Producción | `/produccion` | Ordeños, 84 L/día, top-vacas, BarChart 7 meses |
| 4 | Reproducción | `/reproduccion` | IEP, celos, IA bovina, próximos partos |
| 5 | Genética | `/genetica` | DEP ranking, score bars, pedigrí |
| 6 | Potreros | `/potreros` | 6 lotes, rotación activa, mapa CSS |
| 7 | Alimentación | `/alimentacion` | Raciones TMR, minerales, suplementos |
| 8 | Insumos | `/insumos` | Kardex, stock mínimo, +/-, alertas rojas |
| 9 | Personal | `/personal` | 6 empleados, nómina, EPS/ARL, horas extras |
| 10 | Costos P&G | `/costos` | Ingresos/egresos, costo/litro, margen 35% |
| 11 | Predicciones IA | `/prediccion` | Simulador financiero con sliders |
| 12 | Huella CO₂ | `/co2` | IPCC 2019, benchmarking Colombia, bonos |
| 13 | Alertas | `/alertas` | Centro notificaciones, resolver, severidad |
| 14 | Semen | `/semen` | Inventario criogénico, embriones TE |
| 15 | Ficha Individual | `/ficha` | Historia clínica tabbed por animal |
| 16 | Multi-Finca | `/multifinca` | 3 fincas, comparativa centralizada |
| 17 | GPS Bovino | `/gps` | watchPosition real, mapa animado, BT scan, vincular |
| 18 | Pesaje BT | `/pesaje` | Báscula BT + IA engine (BCS, GMD, raza, salud) |
| 19 | Pesaje Manual | `/pesaje-manual` | CC, GMD, recibo PDF imprimible |
| 20 | Usuarios | `/usuarios` | Gestión cuentas, permisos por módulo |

---

## GPS Bovino — Características técnicas

- **`navigator.geolocation.watchPosition`** — seguimiento continuo real del navegador
- **Mapa SVG animado** — potreros con colores, dots con pulso para animales online
- **Movimiento simulado** — animales derivan levemente en su potrero cada 4 s
- **Estado real de batería** — declive simulado progresivo, indicadores por color
- **Escaneo Bluetooth** — Web Bluetooth API; fallback a resultados demo si no disponible
- **Vincular dispositivos** — formulario manual (nombre, IMEI, tipo, animal)
- **Geovallado** — panel de alertas por zona; animales sin señal resaltados
- **Dialog historial** — detalle por dispositivo con opción "Ver en mapa"

---

## PWA — Funcionamiento offline

El Service Worker v6 implementa:

| Estrategia | Recursos |
|-----------|---------|
| Cache-first | Assets estáticos (.js, .css, .woff2, imágenes) |
| Stale-while-revalidate | Navegación HTML (SPA shell) |
| Network-first + fallback | Rutas /api/* |
| Cache-first TTL largo | Fuentes externas (Google Fonts) |
| Cache-first | Imágenes externas (Unsplash tiles) |

Las 26 rutas de la app se pre-cachean en `install`. Hay shell offline completo con mensaje CIVAC PRO.

---

## Decisiones de arquitectura

- **Frontend puro** — sin backend. Todos los datos en React Context + localStorage.
- **AppStateContext** — fuente única de verdad. `useAppState()` en `src/lib/data.ts`.
- **AuthContext** — autenticación localStorage con 6 cuentas. Sin JWT/servidor.
- **ThemeContext** — toggle dark/light via clase `.dark` en `document.documentElement`.
- **wouter** — router SPA ligero. Todas las rutas usan `import.meta.env.BASE_URL`.
- **Sidebar siempre oscuro** — identidad de marca, independiente del tema.
- **Recharts** — gráficos: BarChart preferido, AreaChart en dashboard, PieChart composición.
- **printModule()** — helper global para imprimir/PDF cualquier módulo.

---

## Diseño visual — v5.0

### Dark mode (predeterminado)
- Fondo: navy profundo `hsl(220 45% 16%)`
- Paleta marina con acentos teal neón `#00f5d4`
- Cards con gradientes oscuros y bordes con glow

### Light mode
- Fondo: crema cálido `hsl(38 22% 84%)`
- Paleta granja: verdes, tierra, amarillo girasol
- KPI cards con gradientes vividos y sombras de color

### Identidad por módulo
Cada página tiene su propio banner degradado con color único:
- GPS → azul marino `#020d1a → #0a2745`
- Inventario → verde ganado `#39ff7e`
- Producción → azul ordeño `#00c8ff`
- Pesaje → naranja báscula `#ff9a3c`
- Reproducción → magenta `#ff6fd8`
- Genética → violeta `#a855f7`
- (etc. — cada módulo tiene su `from/to` gradient y glow)

---

## Flujo de login

```
Pantalla Login
  ├── 3 tarjetas cliente (Finca Familiar / PYME / Corporativo)
  ├── Tab "Planes" → modal pago (Wompi · Nequi · PSE · Bancolombia)
  └── Enlace admin oculto → AdminGate → AdminDashboard (sin sidebar finca)
```

---

## Preferencias de desarrollo

- Clone visual basado en: https://smart-ganader-ia-colombia.base44.app
- Banners degradados por módulo con color identity único
- KPI cards vividas con gradientes y glow
- Cabeceras de tabla verde oscuro `bg-[#1a4a2e]`
- Badges de color para lote / categoría / estado / cargo
- Barras horizontales para top-vacas en producción
- BarChart (NO AreaChart) para producción/predicción/co2
- NO importar `@workspace/api-client-react` — solo React state puro
- Iconos: solo `lucide-react` (usar `Map`, NO `MapMap`)

---

## Reglas críticas para el agente

- `useAppState` en `src/lib/data.ts` es la ÚNICA fuente de datos. No romper.
- `data.ts`, `theme.ts` y `auth.ts` son archivos `.ts` (no `.tsx`) → usar `React.createElement`, NO JSX.
- Slider: `@/components/ui/slider` (ya instalado).
- Todas las rutas deben usar `BASE_URL` prefix (`import.meta.env.BASE_URL`).
- La app corre en el workflow `artifacts/ganader-ia: web` proxiado en `/`.
- Dark mode: `@custom-variant dark (&:is(.dark *))` — clase `.dark` en `document.documentElement`.
- NO usar `MapMap` de lucide-react → usar `Map`.

---

## Historial de versiones

| Versión | Cambios principales |
|---------|---------------------|
| v5.0 | GPS real-time watchPosition · 6 cuentas de acceso · Admin/Developer dashboards · Pesaje PRO con IA engine (BCS, GMD, 9 razas) · Login con planes y pasarela de pago · 28 módulos completos |
| v4.0 | Visual overhaul dark/light · Logo Holstein teal · CSS variables paleta farm/marine |
| v3.x | PWA Service Worker v6 · manifest shortcuts · offline shell |
| v2.x | 16 módulos base · multicuentas · localStorage |
| v1.x | MVP inicial React + Vite |
