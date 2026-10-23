# Preparación de despliegue CIVAC en Conexcol

## Destino recomendado

Para ejecutar el frontend y la API Flask de forma continua se recomienda un
**VPS Linux de Conexcol**, con acceso SSH/root. El hosting compartido cPanel no
se debe asumir como compatible con el proceso persistente de Gunicorn y el
proxy de la API. Este documento prepara los archivos de configuración, pero no
cambia DNS, no contrata infraestructura y no publica el sitio.

## Componentes y requisitos

- Frontend React/Vite compilado en `dist/public`.
- API Flask servida por Gunicorn en `127.0.0.1:8080`.
- Nginx para HTTPS, archivos estáticos y proxy de `/api/*`.
- PostgreSQL disponible desde el VPS, configurado con `DATABASE_URL`.
- Variables privadas `GEMINI_API_KEY` y `DATABASE_URL`, guardadas en el
  archivo de entorno del servidor o en su gestor de secretos; nunca en Git.
- Dominio y dirección IP pública del VPS confirmados antes de editar DNS.

El backend devuelve datos persistentes desde PostgreSQL. No debe apuntarse el
dominio al VPS hasta validar una base de datos restaurada y las migraciones
correspondientes en un entorno de prueba.

## Archivos de ejemplo

- `deploy/conexcol/civac-api.service.example`: servicio systemd para Flask.
- `deploy/conexcol/nginx-civac.conf.example`: frontend SPA y proxy de API.

Son plantillas: reemplaza `DOMINIO_DE_CIVAC`, verifica rutas y usuarios del VPS
y revisa la configuración antes de activarla.

## Instalación en un VPS Linux

1. Crear un usuario de sistema `civac`, instalar Git, Python 3, Node.js,
   pnpm, Nginx y Certbot; abrir solo SSH, HTTP y HTTPS en el firewall.
2. Clonar la rama `deploy-backend` en `/opt/civac` y conservar un respaldo de
   la versión actual antes de cualquier actualización.
3. Instalar las dependencias Python del servidor persistente en un entorno
   virtual del VPS y compilar:

   ```bash
   python3 -m venv /opt/civac/.venv
   /opt/civac/.venv/bin/pip install -r /opt/civac/requirements-conexcol.txt
   pnpm install --frozen-lockfile
   VITE_VERCEL_OUT_DIR=dist/public pnpm --filter @workspace/ganader-ia run build
   ```

4. Crear `/etc/civac/civac.env` con permisos `0600`, propiedad de `root`, y
   añadir `DATABASE_URL`, `GEMINI_API_KEY` y, si se desea fijar otro modelo,
   `GEMINI_MODEL`. No guardar este archivo en el repositorio.
5. Instalar la plantilla systemd como `civac-api.service`, revisar los valores
   de usuario/rutas y arrancar el servicio. La app WSGI se sirve desde la raíz
   del repositorio como `api.index:app`.
6. Instalar la plantilla de Nginx, poner el dominio real en `server_name`,
   ejecutar `nginx -t` y recargar Nginx.
7. Probar el sitio con un subdominio temporal de pruebas antes de mover el
   dominio principal. Habilitar TLS para ese subdominio con Certbot y validar
   `/api/healthz`, `/api/analytics/health`, `/api/ai/status` con sesión y una
   ruta protegida con datos de prueba.
8. Revisar logs de Nginx y `journalctl -u civac-api`; confirmar respaldo y
   recuperación de PostgreSQL. Solo después programar y autorizar el cambio
   DNS definitivo del dominio principal.

## Configuración para Vercel

Vercel sigue usando `vercel.json` y la función Flask `api/index.py`. Configura
`GEMINI_API_KEY` y `DATABASE_URL` también en las variables privadas del proyecto
Vercel; los secretos del workspace no se copian automáticamente a Vercel ni a
Conexcol. La clave de Gemini nunca se debe usar como variable `VITE_*` o
`NEXT_PUBLIC_*`.

## Pendiente antes del cambio real

Se necesitan el tipo de servicio contratado (VPS Linux o cPanel), la versión
de Linux, el dominio/subdominio que se moverá, la IP del VPS, una base
PostgreSQL validada y las variables privadas del entorno. El usuario debe
autorizar el cambio de DNS; el corte debe hacerse después de verificar el
sitio en una dirección de prueba y confirmar un plan de reversión.
