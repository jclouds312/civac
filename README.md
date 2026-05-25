# GanaderIA — CIVAC PRO v5.0

**Control Inteligente de Valor Agropecuario · Colombia**

PWA ganadero integral para Colombia. 28 módulos, multirol con 6 cuentas, dark/light mode, persistencia offline y rastreo GPS bovino en tiempo real.

---

## Inicio rápido

```bash
# Instalar dependencias
pnpm install

# Arrancar frontend PWA (puerto 5000)
pnpm --filter @workspace/ganader-ia run dev

# Arrancar API server (puerto 8080)
PORT=8080 pnpm --filter @workspace/api-server run dev

# Typecheck completo del workspace
pnpm run typecheck
```

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Runtime | Node.js 24 · pnpm workspaces |
| Frontend | React 18 · Vite · TypeScript 5.9 |
| Routing | wouter (SPA ligero) |
| UI | shadcn/ui · Tailwind CSS v4 |
| Gráficos | Recharts (BarChart · AreaChart · PieChart) |
| Iconos | lucide-react |
| Estado | React Context + localStorage (offline-first) |
| Backend | Express · Node.js 24 |
| Base de datos | PostgreSQL (Drizzle ORM) |
| PWA | Service Worker v6 · Web App Manifest · Background Sync |

---

## Estructura del monorepo

```
/
├── artifacts/
│   ├── ganader-ia/          ← Frontend PWA (Vite + React, puerto 5000)
│   │   ├── public/
│   │   │   ├── favicon.svg  ← Logo Holstein + chip IA teal
│   │   │   ├── manifest.json
│   │   │   └── sw.js        ← Service Worker v6
│   │   └── src/
│   │       ├── lib/
│   │       │   ├── data.ts  ← AppStateProvider + useAppState + localStorage
│   │       │   ├── auth.ts  ← AuthProvider + 6 cuentas predefinidas
│   │       │   └── theme.ts ← ThemeProvider dark/light
│   │       ├── components/
│   │       │   └── layout.tsx
│   │       ├── pages/       ← 28 módulos
│   │       └── App.tsx      ← 28 rutas + providers
│   └── api-server/          ← Backend Express (puerto 8080)
│       └── src/
│           ├── index.ts
│           └── routes/
│               ├── animals.ts, potreros.ts, insumos.ts
│               ├── personal.ts, usuarios.ts, finca.ts
│               ├── seed.ts, health.ts
└── lib/
    └── db/                  ← Drizzle ORM schema + migrations
        └── src/schema/index.ts
```

---

## Sistema de autenticación — 6 cuentas

| Nombre | Email | Password | Rol | Acceso |
|--------|-------|----------|-----|--------|
| Administrador General | admin@ganader.ia | admin | admin | Panel Admin completo (11 tabs) |
| Dr. Carlos Ramírez | vet@ganader.ia | vet2026 | vet | Módulos clínicos + lectura |
| Luis Patiño | luis@ganader.ia | campo2026 | field | Campo: pesaje, GPS, potreros |
| Propietario / Inversor | visor@ganader.ia | visor | viewer | Solo lectura / dashboards |
| Dev · Arquitecto CIVAC | dev@civac.co | dev2026 | developer | Consola desarrollo (9 tabs) |
| Super Administrador | super@civac.co | super2026 | superadmin | Acceso total plataforma |

---

## Panel de Administrador — 11 tabs

| Tab | Función |
|-----|---------|
| 📊 Resumen | KPIs MRR, clientes, planes, conversión |
| 👥 Cuentas | CRUD completo de usuarios CIVAC |
| ⭐ Planes | Gestión de planes y precios |
| 💳 Pagos | Historial Wompi/Nequi/PSE/Bancolombia |
| 📡 Sesiones | Sesiones activas + revocar acceso |
| 🔌 APIs | API keys, webhooks, límites de uso |
| 🧩 Módulos | Matriz acceso por plan |
| ⚙️ Sistema | Health check API real + acciones |
| 🏡 Finca | Configuración de la finca (PUT /api/finca) |
| 🗄️ Datos | Seed/reset BD real + exportar JSON/CSV |
| 📈 Reportes | MRR evolución, distribución planes, top clientes |

---

## Consola de Desarrollador — 9 tabs

| Tab | Función |
|-----|---------|
| 📊 Resumen | Web Vitals, flags activos, stack info |
| 🌿 Versiones | Historial releases, create release, changelog |
| 🚩 Feature Flags | Toggle flags por env/plan, persiste en localStorage |
| 📡 Diagnóstico | Performance chart, system checks |
| 📦 Build Info | Dependencias, bundle size, métricas Lighthouse |
| 💻 Logs | Logs filtrados por nivel (INFO/WARN/ERROR/DEBUG) |
| 🔑 API Explorer | Llamadas reales a los endpoints del API Server |
| 🌐 PWA | Service Worker, manifest, caché, instalación |
| 🗄️ Base de Datos | Conteos reales de cada tabla desde la API |

---

## API Server — Endpoints disponibles

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Estado del servidor + DB |
| POST | `/api/seed` | Carga datos iniciales (force:true para reset) |
| GET/PUT | `/api/finca` | Config de la finca |
| GET/POST/PUT/DELETE | `/api/animals` | CRUD animales |
| GET/POST/PUT/DELETE | `/api/potreros` | CRUD potreros |
| GET/POST/PUT/DELETE | `/api/insumos` | CRUD insumos |
| GET/POST/PUT/DELETE | `/api/personal` | CRUD personal |
| GET/POST/PUT/DELETE | `/api/usuarios` | CRUD usuarios |
| GET/POST | `/api/reproduccion` | Gestión reproductiva |
| GET/POST | `/api/alertas` | Centro de alertas |
| GET/POST | `/api/pesajes` | Historial de pesajes |
| GET/POST | `/api/gps` | Collares GPS |

---

## Seed de datos

```bash
# Cargar datos de ejemplo:
curl -X POST http://localhost:8080/api/seed \
  -H "Content-Type: application/json" -d '{}'

# Reset completo + recarga:
curl -X POST http://localhost:8080/api/seed \
  -H "Content-Type: application/json" -d '{"force":true}'
```

El seed carga: 30 animales, 8 potreros, 18 insumos, 9 empleados, 9 registros reproductivos, 8 alertas, 8 collares GPS, 10 pesajes, 6 usuarios, 4 planes.

---

## Variables de entorno

```bash
DATABASE_URL=postgresql://...   # PostgreSQL (Replit DB — configurado automáticamente)
PORT=8080                        # API server port
```

---

## PWA — Offline

Service Worker v6 con cache-first para assets, stale-while-revalidate para navegación HTML, network-first para `/api/*`. Las 28 rutas se pre-cachean en `install`.

---

## Reglas críticas para contribuidores

- `data.ts`, `theme.ts` y `auth.ts` son `.ts` (no `.tsx`) — usar `React.createElement`, NO JSX.
- Iconos: solo `lucide-react` — usar `Map`, NO `MapMap`.
- Todas las rutas deben usar `import.meta.env.BASE_URL`.
- Dark mode: clase `.dark` en `document.documentElement`.
- NO importar `@workspace/api-client-react` en el frontend.

---

## Historial de versiones

| Versión | Cambios principales |
|---------|---------------------|
| v5.0 | Admin dashboard 11 tabs · Dev Console 9 tabs · API Explorer real · Seed/reset BD · Finca config · Reportes MRR · BD tab · PWA tab · README |
| v4.3 | GPS real watchPosition · 6 cuentas · Admin/Developer dashboards · Pesaje PRO IA · Login planes + Wompi |
| v4.0 | Visual overhaul dark/light · Logo Holstein teal |
| v3.x | PWA Service Worker v6 · manifest · offline shell |
| v2.x | 16 módulos base · multicuentas · localStorage |
| v1.x | MVP inicial React + Vite |
