# CIVAC PRO v5.1 — 2026

**Control Inteligente de Valor Agropecuario · Colombia**

PWA ganadero integral para Colombia. 28 módulos completados, multirol con 6 cuentas, dark/light mode, persistencia offline y rastreo GPS bovino en tiempo real.

---

## Ejecución local en Replit

Instala las dependencias del monorepo desde la raíz:

```bash
pnpm install --frozen-lockfile
pnpm run typecheck:libs
```

En Replit, inicia los workflows **GanaderIA Frontend**,
**artifacts/api-server: API Server** (API de datos), **API Server** (servicios
Flask de IA y GPS) y **artifacts/ganader-ia-mobile: expo**.
Si los ejecutas manualmente, usa estos comandos en terminales separadas:

```bash
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/ganader-ia run dev
PORT=8080 pnpm --filter @workspace/api-server run dev
PYTHONPATH=.pythonlibs/lib/python3.12/site-packages PORT=8000 python3 artifacts/api-server/api/index.py
PORT=8081 pnpm --filter @workspace/ganader-ia-mobile run dev
```

La base de datos y las claves de proveedores externos deben configurarse en
Secrets de Replit; no guardes contraseñas ni claves privadas en este README.

## 🚀 Inicio rápido

### Requisitos previos

- **Node.js** 24+ (verificar: `node --version`)
- **pnpm** 9+ (instalar: `npm install -g pnpm`)
- **Python** 3.10+ (para backend analytics con Flask)
- **PostgreSQL** 15+ (Replit DB configurado automáticamente)

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/jclouds312/Civac.git
cd Civac

# Instalar dependencias (solo pnpm)
pnpm install

# Verificar instalación
pnpm run typecheck
```

### Ejecutar en desarrollo

```bash
# Terminal 1: Frontend PWA (puerto 5000)
pnpm --filter @workspace/ganader-ia run dev

# Terminal 2: Backend API (puerto 8080)
PORT=8080 pnpm --filter @workspace/api-server run dev

# Terminal 3 (opcional): Flask Analytics Backend
cd backend-analytics
python3 -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py  # puerto 5001
```

### Compilar para producción

```bash
# Build completo con typechecking
pnpm run build

# Build de la aplicación desplegable (Next.js + Flask en Vercel)
pnpm run build:vercel

# Servir frontend localmente (preview)
pnpm --filter @workspace/ganader-ia run serve
```

### Despliegue Vercel: Next.js + Flask

La rama `backup/vercel-public-output-fix-2026-08-12` encapsula la PWA React
dentro de Next.js y expone todo `/api/*` mediante una única función Flask en
`api/index.py`. El monolito Flask monta el API de dominio, analytics y
básculas sin inicializar hardware serial en serverless.

```bash
pnpm install --frozen-lockfile
pnpm run build:vercel
```

En Vercel configura `DATABASE_URL` (o `POSTGRES_URL`) para las rutas
persistentes. `/api/health`, `/api/healthz` y `/api/analytics/health` no
requieren base de datos. El frontend usa rutas same-origin `/api/*`, por lo
que `VITE_API_BASE_URL` solo es necesario cuando se ejecuta la SPA Vite
separada en desarrollo.

---

## Stack tecnológico

| Capa | Tecnología | Versión |
|------|-----------|----------|
| **Runtime** | Node.js · pnpm workspaces | 24 · 9+ |
| **Frontend** | React · Vite · TypeScript | 18 · 6 · 5.9 |
| **Routing** | wouter (SPA ligero) | 3.3.5 |
| **UI** | shadcn/ui · Tailwind CSS · Radix UI | v4 · 1.x |
| **Gráficos** | Recharts | 2.15+ |
| **Iconos** | lucide-react | latest |
| **Estado** | React Context + localStorage | — |
| **Async** | @tanstack/react-query | latest |
| **Backend Vercel** | Flask · Python | 3.10+ |
| **Backend local** | Express · Node.js | 5.x · 24 |
| **Analytics** | Flask + pandas | 3.10+ |
| **Base de datos** | PostgreSQL · Drizzle ORM | 15+ · latest |
| **PWA** | Service Worker v6 · Web App Manifest | — |
| **Forms** | React Hook Form · Zod | 7.55+ · latest |

---

## Lenguajes y dependencias complementarias

### TypeScript (92%)
- **tsconfig.json**: `strict: true` · `target: ES2020` · `module: ESNext`
- **Validación**: Zod para schemas de runtime
- **Herramientas**: `tsx` para scripts, `esbuild` para builds

### Python (5.1%)
- **Flask** 3.0+ — Backend de analytics IA
- **Requirements**:
  ```bash
  flask==3.0.0
  flask-cors==4.0.0
  python-dotenv==1.0.0
  psycopg2-binary==2.9.0  # PostgreSQL driver
  ```
- **Ubicación**: `backend-analytics/` (CIVAC IA conversacional)

### CSS & Tailwind (1.8%)
- **Tailwind CSS v4** — Atomic styling
- **PostCSS** — Transformación de estilos
- **Plugins**: `@tailwindcss/typography`, `@tailwindcss/vite`

### Otros (1.1%)
- **Bash scripts** (`build.mjs`) — Bundling con esbuild
- **JSON** — Configuración de proyectos y manifests
- **SQL** — Migrations de Drizzle ORM

---

## Estructura del monorepo

```
Civac/
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
│   │       │   ├── layout.tsx
│   │       │   ├── civac-agent.tsx     ← IA Agent (PRINCIPAL - mantener)
│   │       │   └── civac-bot.tsx       ← Knowledge Base Bot (DEPRECADO)
│   │       ├── pages/       ← 28 módulos completados
│   │       └── App.tsx      ← 28 rutas + providers
│   ├── api-server/          ← Backend Express (puerto 8080)
│   │   └── src/
│   │       ├── index.ts
│   │       └── routes/
│   │           ├── animals.ts, potreros.ts, insumos.ts
│   │           ├── personal.ts, usuarios.ts, finca.ts
│   │           └── seed.ts, health.ts
├── backend-analytics/       ← Flask Analytics Backend (puerto 5001)
│   ├── app.py
│   ├── requirements.txt
│   └── venv/                ← Python virtual environment
├── lib/
│   └── db/                  ← Drizzle ORM schema + migrations
│       └── src/schema/index.ts
└── README.md
```

---

## Sistema de autenticación — 6 cuentas con planes aplicados

| Nombre | Email | Password | Rol | Acceso | Plan |
|--------|-------|----------|-----|--------|------|
| Administrador General | admin@civac.co | admin | admin | Panel Admin completo (11 tabs) | Enterprise |
| Dr. Carlos Ramírez | vet@civac.co | vet2026 | vet | Módulos clínicos + lectura | Professional |
| Luis Patiño | luis@civac.co | campo2026 | field | Campo: pesaje, GPS, potreros | Professional |
| Propietario / Inversor | visor@civac.co | visor | viewer | Solo lectura / dashboards | Basic |
| Dev · Arquitecto CIVAC | dev@civac.co | dev2026 | developer | Consola desarrollo (9 tabs) | Developer |
| Super Administrador | super@civac.co | super2026 | superadmin | Acceso total plataforma | Enterprise |

---

## Planes disponibles

| Plan | Descripción | Módulos | Máx. Usuarios | Soporte |
|------|-------------|---------|---------------|---------|
| **Basic** | Lectura y monitoreo | 15 | 3 | Email |
| **Professional** | Gestión operativa completa | 28 | 10 | Email + Chat |
| **Enterprise** | Full acceso + APIs + Soporte dedicado | 28 | Ilimitado | 24/7 dedicado |
| **Developer** | Desarrollo e integración | 28 | Equipo | 24/7 + Beta features |

---

## Panel de Administrador — 11 tabs

| Tab | Función |
|-----|----------|
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
|-----|----------|
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
| **POST** | **`/api/analytics/chat`** | **CIVAC IA conversacional (Flask)** |

---

## CIVAC IA — Arquitectura de componentes

### CivacAgent (Principal) ✅
- **Componente**: `civac-agent.tsx`
- **Botón flotante**: Gradiente teal/rojo dinámico
- **Conexión backend**: POST `/api/analytics/chat` → Flask
- **Funcionalidades**:
  - Conversación contextual con historial
  - Acciones rápidas (Producción, Inventario, GPS, etc)
  - Offline fallback inteligente
  - Online/offline status indicator
  - Unread message badge
- **Disponibilidad**: Todos los roles (excepto login)
- **Puerto backend**: 5001 (Flask)

### CivacBot (Deprecado) ⚠️
- **Componente**: `civac-bot.tsx`
- **Tipo**: Knowledge Base estática (65 keywords)
- **Limitación**: Solo responde pre-escritas, sin IA real
- **Estado**: REMOVIDO de App.tsx (líneas 289, 337)
- **Alternativa**: Usar CivacAgent + Flask backend

### Consolidación realizada:
- ✅ Removidas importaciones de `CivacBot` en `App.tsx`
- ✅ Solo `CivacAgent` render activo en todas las rutas
- ✅ Un solo botón flotante IA (sin duplicados)
- ✅ Conocimiento base integrado en Flask `/api/analytics/chat`

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

El seed carga: 30 animales, 8 potreros, 18 insumos, 9 empleados, 9 registros reproductivos, 8 alertas, 8 collares GPS, 10 pesajes, 6 usuarios con planes aplicados, 4 planes.

---

## Variables de entorno

```bash
# Backend Express (puerto 8080)
DATABASE_URL=postgresql://...   # PostgreSQL (Replit DB — configurado automáticamente)
PORT=8080                        # API server port
NODE_ENV=development             # development | production

# Flask Backend (puerto 5001)
FLASK_ENV=development
FLASK_APP=app.py
DATABASE_URL=postgresql://...   # Compartida con Express
API_SECRET_KEY=your-secret-key  # Para validar requests desde frontend
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
- **IA**: Usar solo `CivacAgent` — removido `CivacBot`.
- **Backend IA**: Implementar en Flask `/api/analytics/chat` (no hardcoded).
- **Validación**: Todos los schemas deben usar Zod en `@workspace/api-zod`.

---

## Troubleshooting

### Error: "pnpm not found"
```bash
npm install -g pnpm@latest
```

### Error: "Port 5000 already in use"
```bash
# Cambiar puerto en vite.config.ts:
pnpm --filter @workspace/ganader-ia run dev -- --port 3000
```

### Error: "Cannot find module @workspace/..."
```bash
# Reinstalar dependencias del workspace:
pnpm install
pnpm run typecheck
```

### Error: "Flask port 5001 conflict"
```bash
# Cambiar puerto en backend-analytics/app.py:
app.run(debug=True, port=5002)
```

### PostgreSQL connection failed
```bash
# Verificar DATABASE_URL en .env
# En Replit: configurado automáticamente
# Local: postgresql://localhost/civac_dev
```

---

## Historial de versiones

| Versión | Año | Cambios principales |
|---------|-----|---------------------|
| **v5.1** | 2026 | ✅ 28 módulos completados · Consolidar botones IA (CivacBot→CivacAgent) · Flask Analytics backend · Todos los planes aplicados a cuentas de prueba · Actualizar README con datos 2026 · Agregar lenguajes complementarios |
| v5.0 | 2025 | Admin dashboard 11 tabs · Dev Console 9 tabs · API Explorer real · Seed/reset BD · Finca config · Reportes MRR · BD tab · PWA tab · README |
| v4.3 | 2024 | GPS real watchPosition · 6 cuentas · Admin/Developer dashboards · Pesaje PRO IA · Login planes + Wompi |
| v4.0 | 2024 | Visual overhaul dark/light · Logo Holstein teal |
| v3.x | 2023 | PWA Service Worker v6 · manifest · offline shell |
| v2.x | 2023 | 16 módulos base · multicuentas · localStorage |
| v1.x | 2022 | MVP inicial React + Vite |

---

## Licencia y Propiedad

**CIVAC PRO** © 2026

- **Titular único y vendedor de licencias**: SoftGan SAS · NIT 900.205.856-3
- **Desarrollador y creador**: Universal Business Technology
- **Soporte y licenciamiento**: SoftGan SAS

Todos los derechos reservados. Prohibida la redistribución, modificación o uso comercial sin autorización expresa de SoftGan SAS.

---

## Contacto

📧 **Email (SoftGan)**: contacto@softgan.com  
📧 **Email (Soporte técnico)**: soporte@civac.co  
📱 **WhatsApp**: +57 318 248 2261  
🌐 **Web**: https://civac--aaplicativo676.replit.app
