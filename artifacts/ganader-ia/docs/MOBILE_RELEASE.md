# CIVAC Ganadería: Android e iOS

## Base instalada

La aplicación usa Capacitor para empaquetar la misma interfaz React/Vite como aplicación nativa:

- Identificador: `com.civac.ganaderia`
- Nombre: `CIVAC Ganadería`
- Android: carpeta `android/`
- iOS: carpeta `ios/`
- Salida web compartida: `../../public`

## Flujo de desarrollo

1. `pnpm build`
2. `pnpm mobile:sync`
3. Abrir Android Studio con `pnpm mobile:android`.
4. Abrir Xcode con `pnpm mobile:ios`.

La compilación y firma final requieren Android Studio/SDK para Android y macOS/Xcode para iOS. La VM puede generar y sincronizar los proyectos, pero no puede firmar un IPA de App Store sin certificados de Apple ni publicar directamente en las tiendas.

## Google en un toque

El frontend ya incluye el flujo Google existente (`/api/auth/google`) y manejo de estados de callback. Para producción se deben registrar los redirect URIs HTTPS del dominio de producción y los esquemas nativos/deep links aprobados por Google. No se deben guardar secretos OAuth en el cliente.

## Publicación

- Android: configurar `applicationId`, icono, splash, firma `.aab`, Privacy Policy y ficha de Google Play.
- iOS: configurar Team, Bundle Identifier, Signing & Capabilities, iconos, privacidad y Archive en Xcode.
- Ambos: revisar permisos de cámara, ubicación, notificaciones y almacenamiento antes de enviar a revisión.

## Módulos web ya disponibles

Dashboard, planes, cuentas, administración, ventas, facturación, inventario, trazabilidad, documentación, impresión del módulo actual y paletas por plan están integrados en la aplicación web. Las acciones de datos reales deben continuar pasando por la API autenticada y las políticas RLS de Supabase.
