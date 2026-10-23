# Migración del backend CIVAC a Flask en Vercel

## Arquitectura actual

`api/index.py` es el único punto de entrada Python de Vercel. Carga de forma
diferida el monolito Flask en `artifacts/api-server/api/index.py`, que monta
los contratos de dominio, analytics y básculas en una sola función WSGI.
Next.js sirve el frontend y el rewrite de `vercel.json` conserva la ruta
original en `__path` para que Flask pueda resolver `/api/<recurso>`.

En desarrollo de Replit, `/api/ai/*` y `/api/gps*` se dirigen al servicio Flask
local; las demás rutas continúan usando temporalmente el servidor Node existente
para evitar cambiar contratos aún no validados en la vista previa. En Vercel,
todos los rewrites `/api/*` llegan al gateway Flask.

La función Flask cubre:

- auth, animales, potreros, insumos, personal, reproducción, alertas,
  pesajes, ubicaciones GPS (`/api/gps`), lotes, finca, planes, usuarios,
  licencias, códigos y auditoría;
- `/api/analytics/*`, incluyendo chat, KPIs, clima y panel administrativo;
- `/api/devices`, `/api/status`, `/api/tramas/*` y `/api/config/*` para
  básculas sin inicializar hardware serial en serverless;
- sincronización, telemetría, imágenes y los endpoints administrativos que
  están definidos en el monolito.
- `/api/ai/status` y `/api/ai/chat`, protegidos por sesión CIVAC; el chat usa
  Gemini desde Flask y requiere `GEMINI_API_KEY` configurada en el entorno de
  Vercel. La clave no se entrega al navegador y la función tiene un máximo de
  ejecución de 30 segundos para completar la solicitud al modelo.
- `/api/auth/google`, `/api/auth/google/callback` y
  `/api/auth/google/status` para Google OAuth en el mismo runtime Flask que
  recibe las rutas `/api/*`. Requiere `GOOGLE_CLIENT_ID`,
  `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET`, una base PostgreSQL y
  `CIVAC_PUBLIC_URL` apuntando al origen publicado.

Las cuentas Google que aún no existen se registran como `viewer` pendientes de
activación. Un administrador debe asignarles el rol y activar el acceso; Google
OAuth no eleva permisos automáticamente.

## Básculas y serverless

El procesamiento HTTP y de tramas no requiere WebSocket ni hardware conectado.
Flask-SocketIO solo se importa cuando `CIVAC_ENABLE_SOCKETIO=1`, pensado para
un proceso persistente local. En Vercel permanece desactivado; una solicitud
de conexión sin puerto serial devuelve un error JSON controlado.

## Prueba local

```bash
python -m compileall -q api artifacts/api-server/api artifacts/api-server/src artifacts/analytics-server
pnpm run build:vercel
```

Las rutas de salud (`/api/health`, `/api/healthz`, `/api/analytics/health`)
no requieren base de datos. Las rutas persistentes requieren `DATABASE_URL`
o `POSTGRES_URL` apuntando a PostgreSQL y devuelven JSON controlado cuando la
conexión o una tabla no está disponible; no inventan almacenamiento en
memoria para los datos de producción.

El asistente CIVAC IA no consulta directamente las tablas de la finca; usa
solo el mensaje y el historial enviado por el usuario. La interfaz explica esta
limitación y muestra una guía distinta para cada perfil.