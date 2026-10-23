# CIVAC PRO — Ganadería Inteligente

**Control Inteligente de Valor Agropecuario · Colombia**

PWA ganadera integral para Colombia, con acceso multirol, persistencia offline y rastreo GPS bovino en tiempo real.

---

## 🚀 Inicio rápido

### Requisitos previos

- **Node.js** 20+ (verificar: `node --version`)
- **pnpm** 9+ (instalar: `npm install -g pnpm`)
- **Python** 3.10+ (API Flask)
- **PostgreSQL** 15+ para datos persistentes

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

# Terminal 2: API unificada Flask (puerto 8000)
PORT=8000 bash scripts/run-flask-server.sh
```

### Compilar para producción

```bash
# Build de la aplicación desplegable (Next.js + Flask en Vercel)
pnpm run build:vercel
```

### Despliegue Vercel: Next.js + Flask

Vercel debe desplegar este repositorio como **Next.js**. `vercel.json` fija
`framework: nextjs` y `outputDirectory: .next`; Flask se ejecuta como función
Python para las rutas `/api/*`, no como framework de despliegue. El monolito
Flask reúne el API de dominio, analytics, básculas, autenticación y el
asistente CIVAC IA.

```bash
pnpm install --frozen-lockfile
pnpm run build:vercel
```

Configura estas variables en el entorno seguro del proveedor; no guardes sus
valores en Git ni en el README:

- `DATABASE_URL` (o `POSTGRES_URL`) para datos persistentes.
- `SESSION_SECRET` para firmar el estado de Google OAuth.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` y `CIVAC_PUBLIC_URL` para el
  inicio de sesión con Google. Registra
  `https://<dominio-publicado>/api/auth/google/callback` como URI de retorno
  autorizada en Google Cloud.
- `VITE_GOOGLE_CLIENT_ID` (público) para conectar Google Drive desde el módulo
  de respaldos; no lo uses en lugar del secreto de servidor.
- `GEMINI_API_KEY` para habilitar CIVAC IA en el servidor.

Antes de abrir el sitio al público, rota o desactiva las credenciales de prueba
que aún existen en el backend y retira el archivo histórico de cuentas del
repositorio. No publiques contraseñas en este README.

`/api/health`, `/api/healthz` y `/api/analytics/health` no requieren base de
datos. El frontend usa rutas same-origin `/api/*`.

---

## Stack y arquitectura

| Capa | Tecnología |
|------|------------|
| Sitio publicado | Next.js, fijado como framework en `vercel.json` |
| Interfaz | React, Vite y TypeScript |
| API serverless | Flask/Python mediante `api/index.py` |
| API de desarrollo | Express/Node.js en el workflow local |
| Datos | PostgreSQL |
| Aplicación | PWA con modo offline |

En Vercel, Next.js construye y publica el sitio; las rutas `/api/*` se
redirigen a la función Flask. El servidor Express se conserva para desarrollo
local y no es el framework del despliegue de Vercel.

---

## Estructura del monorepo

```
Civac/
├── artifacts/
│   ├── ganader-ia/          ← Frontend React/Vite
│   ├── api-server/
│   │   ├── api/index.py    ← Monolito Flask usado por Vercel
│   │   └── src/            ← API Express para desarrollo
│   └── analytics-server/   ← Servicios Flask de analytics
├── api/index.py            ← Entrada WSGI de Vercel
├── artifacts/              ← Incluido por el build serverless
├── docs/                   ← Documentación de despliegue
├── lib/db/                 ← Esquema y acceso PostgreSQL
├── requirements.txt        ← Dependencias Python de Vercel
├── scripts/run-flask-server.sh
├── vercel.json             ← Framework Next.js y rewrites Flask
└── README.md
```

---

## Acceso y roles

| Rol | Acceso |
|-----|--------|
| `superadmin` | Administración total de la plataforma |
| `admin` | Gestión de usuarios, fincas y módulos administrativos |
| `developer` | Herramientas técnicas y consola de desarrollo |
| `sales` | Funciones comerciales y seguimiento de clientes |
| `vet` | Módulos clínicos y consulta veterinaria |
| `field` | Operación de campo, pesaje, GPS y potreros |
| `viewer` | Consulta y dashboards de solo lectura |

Los usuarios se crean o activan desde la administración de CIVAC. Google OAuth
vincula el correo autenticado con la cuenta y su rol; las cuentas nuevas quedan
pendientes de activación. Por seguridad, este README no contiene contraseñas,
claves de acceso ni listas de contraseñas de prueba. Usa el proceso de alta o
restablecimiento de cuenta para asignar credenciales.

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
| GET/POST | `/api/ai/status`, `/api/ai/chat` | Estado y chat de CIVAC IA |
| GET | `/api/admin/users` | Usuarios, solo con sesión admin/superadmin |
| PATCH/POST | `/api/admin/users/:id` | Actualización, demo y activación de cuenta |
| GET | `/api/auth/google/status` | Estado de configuración de Google OAuth |

---

## CIVAC IA — Arquitectura de componentes

El asistente `CivacAgent` aparece en las vistas autenticadas de administración,
desarrollo, ventas y finca. Envía el chat a `/api/ai/chat` en Flask y requiere
una sesión de servidor y `GEMINI_API_KEY`. La clave permanece en el servidor;
sin configurarla, la API informa que el proveedor no está disponible.

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

Para Vercel configura los valores desde sus ajustes de entorno; para Replit usa
Secrets. No guardes claves ni contraseñas en Git o en el README.

| Variable | Uso |
|----------|-----|
| `DATABASE_URL` o `POSTGRES_URL` | PostgreSQL para cuentas y datos |
| `SESSION_SECRET` | Firma del estado de sesión/OAuth |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Acceso OAuth con Google |
| `CIVAC_PUBLIC_URL` | Origen público y URL de retorno OAuth |
| `GEMINI_API_KEY` | Habilita el chat del asistente |
| `VITE_GOOGLE_CLIENT_ID` | Google Drive desde el navegador; no es secreto de servidor |

Para el desarrollo local de Flask en Replit se usa
`PORT=8000 bash scripts/run-flask-server.sh`.

---

## PWA — Offline

Service Worker con cache-first para assets, stale-while-revalidate para navegación HTML y network-first para `/api/*`.

---

## Reglas críticas para contribuidores

- `data.ts`, `theme.ts` y `auth.ts` son `.ts` (no `.tsx`) — usar `React.createElement`, NO JSX.
- Iconos: solo `lucide-react` — usar `Map`, NO `MapMap`.
- Todas las rutas deben usar `import.meta.env.BASE_URL`.
- Dark mode: clase `.dark` en `document.documentElement`.
- NO importar `@workspace/api-client-react` en el frontend.
- **IA**: Usar solo `CivacAgent` — removido `CivacBot`.
- **Backend IA**: Implementar en Flask `/api/ai/chat`; requiere sesión y `GEMINI_API_KEY`.
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

### Error: "Flask port 8000 conflict"
```bash
PORT=8001 bash scripts/run-flask-server.sh
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

## Producto, propiedad y soporte

**CIVAC PRO** © 2026

- **Producto y titular**: CIVAC es un producto de SoftGan SAS · NIT 900.205.856-3
- **Desarrollador y creador**: Universal Business Technology
- **Soporte técnico oficial**: Universal Business Technology · soporte@civac.co

Todos los derechos reservados. Prohibida la redistribución, modificación o uso comercial sin autorización expresa de SoftGan SAS.

---

## Contacto
**Soporte técnico oficial — Universal Business Technology:** soporte@civac.co
