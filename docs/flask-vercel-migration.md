# Migración del backend CIVAC a Flask en Vercel

## Arquitectura actual

`api/index.py` es el único punto de entrada Python de Vercel. Carga de forma
diferida el monolito Flask en `artifacts/api-server/api/index.py`, que monta
los contratos de dominio, analytics y básculas en una sola función WSGI.
Next.js sirve el frontend y el rewrite de `vercel.json` conserva la ruta
original en `__path` para que Flask pueda resolver `/api/<recurso>`.

La función Flask cubre:

- auth, animales, potreros, insumos, personal, reproducción, alertas,
  pesajes, lotes, finca, planes, usuarios, licencias, códigos y auditoría;
- `/api/analytics/*`, incluyendo chat, KPIs, clima y panel administrativo;
- `/api/devices`, `/api/status`, `/api/tramas/*` y `/api/config/*` para
  básculas sin inicializar hardware serial en serverless;
- sincronización, telemetría, imágenes y los endpoints administrativos que
  están definidos en el monolito.

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