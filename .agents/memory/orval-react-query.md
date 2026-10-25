---
name: Orval y React Query
description: Compatibilidad de la generación de hooks de Orval con la versión de React Query.
---

Al actualizar Orval, configura `output.override.query.version` para que coincida con la versión principal de TanStack React Query instalada. Orval 8.44.0 no infirió la versión 5 del workspace y avisó que generaría hooks para v4.

**Why:** Una actualización del generador sin esta opción puede producir tipos de opciones incompatibles con el cliente instalado.

**How to apply:** Mantén explícito el número de versión en la configuración y revisa la salida de `codegen` cuando cambie Orval.
