---
name: CIVAC version strings locations
description: Where version numbers live across the codebase — update all when bumping version
---

# Regla
Al subir versión de CIVAC PRO, actualizar estos archivos:

**Why:** la versión aparece en ≥10 lugares. Olvidar uno deja inconsistencias en console, badges, server-dashboard, documentación.

**How to apply:**
```bash
# Búsqueda rápida de versiones stale
grep -rn "v2\.[0-9]\." artifacts/ganader-ia/src/ | grep -v node_modules
```

| Archivo | Campo |
|---------|-------|
| `src/lib/protection.ts` | console.log badge `🐄 CIVAC PRO vX.X` |
| `src/pages/login.tsx` | hero badge `v2.1`, ticker text, GanaderIA PRO footer |
| `src/components/layout.tsx` | sidebar footer "CIVAC PRO vX.X · 35+ módulos" |
| `src/pages/dashboard.tsx` | live ticker item, header sub-text |
| `src/pages/server-dashboard.tsx` | Versión plataforma config, PWA detail, changelog |
| `src/pages/admin-dashboard.tsx` | Audit log header |
| `src/pages/acerca.tsx` | badge chips array |
| `src/pages/documentacion.tsx` | SectionBanner subtitle |
| `public/sw.js` | CACHE_VER constant + offline HTML tag |
| `public/manifest.json` | `version` field + description |

**Current version:** v2.1.0 (SW v10, manifest 2.1.0)
