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

## Acceso CIVAC y seguridad de cuentas

`NOVIEMBRE2026` es el nombre de la campaña, no una contraseña ni un código que
se pueda canjear por sí solo. La cuenta de William conserva el rol de cliente y
el plan Premium sin vencimiento, asignado únicamente por una operación protegida
del panel administrativo. Para el primer acceso:

1. Un administrador abre **Admin → Códigos → Tarjeta de William** y pulsa
   **Crear cuenta y tarjeta**.
2. El panel crea un token aleatorio de un solo uso, lo almacena como hash y
   muestra el token y la opción **Copiar enlace privado** una sola vez.
3. Comparte el enlace directamente con William por un canal privado. Al abrirlo,
   la tarjeta se valida automáticamente; no hace falta escribir el código
   completo. Si se escribe únicamente `NOVIEMBRE2026`, la tarjeta no se activa.
4. Tras el primer acceso, William puede crear una contraseña permanente en
   **Mi cuenta → Seguridad → Crear contraseña de acceso**. La contraseña debe
   tener al menos 10 caracteres y se guarda protegida en el servidor.

La tarjeta de acceso inicial vence si no se usa dentro de los 30 días posteriores
a su emisión. Al activarla, la cuenta conserva Platino sin vencimiento; cada
sesión vence por separado y se puede iniciar de nuevo con la contraseña que
defina el titular. El plan Platino no concede rol ni permisos administrativos.

No se configura una contraseña compartida ni se publica información de cuentas,
clientes, enlaces privados o tokens en este README. Las credenciales se crean o
restablecen en el flujo privado de la cuenta; nunca se escriben en documentación,
código fuente, capturas públicas ni logs. Este documento describe roles y
funciones, no contiene un directorio de personas.

### Roles

| Perfil | Alcance general |
|---|---|
| Administrador CIVAC | Gestión de cuentas, planes, módulos y sesiones, siempre con autenticación administrativa. |
| Personal CIVAC | Herramientas internas según el rol asignado; acceso al panel de servidor separado del acceso de clientes. |
| Veterinario | Registros clínicos, sanidad, reproducción y consultas técnicas. |
| Campo | Inventario, pesajes, potreros, alimentación y registros operativos. |
| Consulta | Lectura de paneles y reportes permitidos por su finca. |
| Cliente | Funciones habilitadas por plan y permisos de la cuenta. |

### Módulos y funciones

| Módulo | Función principal |
|---|---|
| Dashboard | Indicadores de finca, tendencias y resúmenes de actividad. |
| Inventario y fichas | Identificación, búsqueda, historial y datos individuales del ganado. |
| Pesajes | Registro manual, Bluetooth y serial; comparación de mediciones reales y evolución. |
| Producción | Registro y consulta de producción pecuaria. |
| Reproducción y genética | Eventos reproductivos, servicios, preñez, partos y referencias genéticas. |
| Semen y embriones | Control de inventario reproductivo y movimientos. |
| Lotes | Organización y movimiento de grupos de animales. |
| Potreros y alimentación | Rotación, disponibilidad de pasto, raciones y suplementos. |
| Insumos | Existencias, movimientos, mínimos y alertas de inventario. |
| Sanidad y alertas | Eventos sanitarios, recordatorios y seguimiento de novedades. |
| Trazabilidad ICA | Historial y documentos relacionados con movimientos y trazabilidad. |
| GPS y dispositivos | Ubicación, geocercas y administración de dispositivos compatibles. |
| Costos y huella CO₂ | Registros financieros y estimaciones ambientales de la finca. |
| Personal y permisos | Gestión de usuarios internos y acceso por rol/módulo. |
| Ventas CRM | Seguimiento de prospectos y procesos comerciales CIVAC. |
| Multi-Finca | Consulta comparativa de varias fincas autorizadas. |
| Predicción IA | Simulaciones y proyecciones basadas en los datos ingresados. |
| CIVAC IA | Asistencia para entender el uso de la app y orientación general ganadera. |
| Planes y pagos | Consulta de planes, licencias y opciones de pago configuradas. |
| Centro de datos y Drive | Importación, exportación y copias de respaldo disponibles. |
| Configuración | Preferencias de finca, apariencia, seguridad y datos locales. |
| Documentación y manual | Guías de uso y pasos por módulo. |
| Panel de sesiones | Sesiones no vencidas, revocación administrativa y días de uso registrados. |
| Panel de servidor | Herramientas internas CIVAC; acceso independiente y restringido a personal autorizado. |

### CIVAC IA y funcionamiento sin conexión

En la web, el usuario puede preparar el modelo local Qwen2.5 0.5B mediante
WebLLM. La descarga inicial es de aproximadamente 300 MB y requiere un navegador
con WebGPU e internet; después puede responder sin conexión mientras el navegador
conserve los archivos descargados. Si el dispositivo no tiene WebGPU o no conserva
el modelo, queda una guía local breve sin generación de texto. La app móvil Expo
incluye esa guía local y puede usar el servicio remoto cuando está configurado.

No se requiere una API key para el modelo local. Los proveedores remotos opcionales
requieren una cuenta y una clave guardada solo como secreto del servidor; los
niveles gratuitos dependen de cuotas y disponibilidad del proveedor. Ningún
proveedor remoto se presenta como ilimitado ni garantiza funcionamiento offline.
La IA no accede a cuentas, datos de fincas o animales, no ejecuta cambios y no
sustituye la valoración veterinaria.

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
- William conserva el rol de cliente y el plan Premium sin vencimiento; el
  acceso inicial se establece por una activación privada de un solo uso.
- CIVAC IA ofrece modelo local opcional en web y una guía local sin conexión en
  Expo; las claves remotas permanecen en el servidor.
- Se documentan aquí los flujos reales de la PWA offline y la app móvil Expo.
- Se actualizan dependencias Python y esbuild para corregir versiones con
  avisos de seguridad conocidos.
