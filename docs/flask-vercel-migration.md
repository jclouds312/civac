# Migración del backend CIVAC a Flask en Vercel

## Arquitectura actual

`api/index.py` es el punto de entrada Python de Vercel. Carga de forma
diferida el monolito Flask en `artifacts/api-server/api/index.py` para las
rutas migradas y el servicio de básculas para las rutas de hardware.

Los rewrites de `vercel.json` mantienen explícitamente en Node los dominios
que todavía no tienen equivalencia completa en Flask:

- `/api/gps/*`: requiere autenticación, geocercas y operaciones de tracks.
- `/api/sync/*`: sincronización multi-entidad completa.
- `/api/images/*`: almacenamiento de imágenes.
- `/api/admin/*` excepto `/api/admin/stats`: operaciones administrativas
  adicionales.

El resto de los dominios principales (auth, animales, potreros, insumos,
personal, reproducción, alertas, pesajes, lotes, finca, planes, usuarios,
licencias, códigos, tramas, auditoría, analytics y estado de base de datos)
se sirve desde Flask y PostgreSQL mediante `DATABASE_URL`.

## Básculas y serverless

El procesamiento HTTP y de tramas no requiere WebSocket ni hardware conectado.
Flask-SocketIO solo se importa cuando `CIVAC_ENABLE_SOCKETIO=1`, pensado para
un proceso persistente local. En Vercel permanece desactivado; una solicitud
de conexión sin puerto serial devuelve un error JSON controlado.

## Prueba local

```bash
python -m unittest tests.test_flask_serverless
pnpm run build:vercel
```

La prueba de base de datos (`/api/db-status`) requiere `DATABASE_URL`. Los
endpoints de datos devuelven `503` explícito si PostgreSQL no está disponible;
no inventan un almacenamiento en memoria.