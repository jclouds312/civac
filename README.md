# GanaderIA Colombia

Plataforma CIVAC de gestión ganadera para Colombia. Este monorepo contiene la
PWA web instalable, una aplicación móvil Expo, la API de aplicación y servicios
de soporte.

## Aplicaciones y servicios

| Proyecto | Ruta | Tecnología | Uso |
| --- | --- | --- | --- |
| PWA web | `artifacts/ganader-ia` | React, Vite, TypeScript | Aplicación principal instalable y offline |
| App móvil | `artifacts/ganader-ia-mobile` | Expo, React Native, Expo Router | Android/iOS y vista web móvil |
| API | `artifacts/api-server` | Express, TypeScript, Drizzle | Autenticación, cuentas, licencias y datos |
| Base de datos | `lib/db` | PostgreSQL/SQLite, Drizzle | Persistencia de cuentas y datos |
| Servicios Python | `artifacts/analytics-server`, `artifacts/gps-server` | Flask/Django | Servicios opcionales de analítica y GPS |

## Requisitos

- Node.js 20+
- pnpm 9+
- Python 3.12 para los servicios Python
- Una base de datos configurada para la API

No pongas contraseñas, tokens OAuth, claves API ni URLs con credenciales en el
README. Configúralos en Secrets de Replit o en el gestor de secretos del entorno
de despliegue.

## Preparar el workspace

Desde la raíz:

```bash
pnpm install --frozen-lockfile
pnpm run typecheck
```

En Replit, usa los workflows configurados del proyecto. Para arrancar servicios
por separado en desarrollo:

```bash
# PWA web
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/ganader-ia run dev

# API Express
PORT=8080 pnpm --filter @workspace/api-server run dev-tsx

# App móvil Expo
PORT=8081 pnpm --filter @workspace/ganader-ia-mobile run dev
```

La vista Expo muestra un QR para Expo Go. En Replit, la URL pública de preview
se proporciona mediante las variables del workflow; no fijes `localhost` como
URL de API en el código móvil.

Los servicios analíticos y GPS son procesos opcionales y requieren sus
dependencias Python. Inícialos solo cuando la función que se está probando los
necesite:

```bash
python3 artifacts/analytics-server/app.py
python3 artifacts/gps-server/manage.py runserver 0.0.0.0:8000
```

## Construcción y validación

```bash
# Tipos de todo el monorepo
pnpm run typecheck

# PWA web
pnpm --filter @workspace/ganader-ia run build

# API Express
pnpm --filter @workspace/api-server run build

# App móvil
pnpm --filter @workspace/ganader-ia-mobile run typecheck
pnpm --filter @workspace/ganader-ia-mobile run build
```

El build del workspace configurado para Replit compila la PWA y la API. La API
Express puede servir los archivos estáticos web en producción. Publicar se hace
desde Replit Publishing; la geografía del despliegue debe coincidir con la de la
base de datos existente.

## PWA instalable y uso offline

La PWA está en `artifacts/ganader-ia` y se puede instalar desde navegadores
compatibles en escritorio, Android y iOS. En iOS, la instalación se inicia desde
Compartir → Añadir a pantalla de inicio.

La aplicación incluye:

- `public/manifest.json` con el nombre, iconos, accesos directos y manejo de
  respaldos JSON.
- `public/sw.js` (caché v11), con caché de archivos estáticos, navegación,
  pantalla offline y estrategia de red/caché para datos API.
- Sincronización diferida de cambios cuando vuelve la conexión.
- IndexedDB para datos offline como colas de sincronización, sesiones de pesaje,
  GPS, sanidad y trazabilidad.
- Indicadores de conexión/sincronización e instalación dentro de la interfaz.

Offline no significa que todas las integraciones externas sigan operativas:
OAuth, Meta, servicios remotos, funciones de IA en servidor y sincronización
requieren conexión. Los datos locales pendientes se sincronizan al recuperar
conectividad. No se deben mostrar mediciones simuladas como lecturas reales de
básculas.

Después de actualizar archivos de la PWA, incrementa la versión de caché del
Service Worker para que los clientes instalados reciban los nuevos recursos.

## Aplicación móvil

La app Expo comparte la API y las sesiones CIVAC. Incluye autenticación con
token, almacenamiento seguro nativo, dashboard, búsqueda y gestión de animales,
registro de pesajes, chat CIVAC IA y vistas de potreros, insumos, reproducción,
alertas, personal y GPS. Para operaciones que aún no tienen formulario nativo,
la app enlaza con la PWA adaptable.

Desarrollo:

```bash
pnpm --filter @workspace/ganader-ia-mobile run dev
```

En Replit, sigue el QR mostrado por Expo para abrir Expo Go. La vista web móvil
se utiliza para previsualizar la experiencia; para distribuir una app Android
o iOS se debe ejecutar el proceso de build/firma de Expo con las cuentas y
credenciales correspondientes. La clave del proveedor de IA debe permanecer en
el servidor; nunca se incluye en el bundle móvil.

## Cuentas CIVAC y acceso temporal de William

El panel de administración puede emitir una tarjeta privada, de un solo uso,
para la cuenta cliente de William. La tarjeta de campaña `NOVIEMBRE2026`:

- Otorga el plan Premium con acceso completo durante 30 días desde su activación.
- Se consume una sola vez y se almacena como hash en la base de datos.
- Tiene un plazo de 30 días para canjearse; el token de sesión vence al terminar
  el período de acceso.
- El código completo se muestra una sola vez en el panel de administración.
  Entrégalo únicamente por un canal privado; no lo guardes en el README, código
  fuente, capturas públicas ni logs.

El aprovisionamiento de la cuenta conserva una fecha de vencimiento existente;
reiniciar el servidor no debe extender el acceso. Las contraseñas y códigos
activos no se documentan aquí.

## Integraciones y API

El frontend usa rutas relativas `/api/*` para que desarrollo y despliegue
compartan origen. La API Express contiene las rutas de autenticación, cuentas,
licencias, datos ganaderos, sincronización y estado del servidor. Comprueba las
rutas disponibles en `artifacts/api-server/src/routes/`.

Para configurar Google OAuth u otros proveedores, define los secretos requeridos
en el entorno y registra las URLs de callback exactas en cada consola de
proveedor. No pongas access tokens ni claves privadas en código frontend.

## Estructura resumida

```text
artifacts/
  ganader-ia/          # PWA web React/Vite
  ganader-ia-mobile/   # aplicación Expo
  api-server/          # API Express y rutas
  analytics-server/    # servicio opcional de analítica
  gps-server/          # servicio opcional de GPS
lib/
  db/                  # esquema y acceso a PostgreSQL/SQLite
```

## Propiedad y licencias

Titular indicado para este proyecto: Johnatan Vallejo Marulanda, Universal
Business Technology. Las licencias de uso se asignan y verifican desde los
módulos de cuentas/licencias CIVAC. Los términos definitivos y cualquier
registro legal deben corresponder a la documentación del titular; este README
no sustituye un contrato o certificado de licencia.

## Historial reciente

- Se trabaja desde la rama `deploy-backend`, que corresponde a
  `origin/deploy-backend`; la rama predeterminada del remoto es `v7`.
- La tarjeta de William se está configurando para Premium por 30 días, con
  código de un solo uso y almacenamiento protegido.
- Se documentan aquí los flujos reales de la PWA offline y la app móvil Expo.
- Se actualizan dependencias Python y esbuild para corregir versiones con
  avisos de seguridad conocidos.
