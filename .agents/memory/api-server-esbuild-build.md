---
name: API server esbuild build
description: Why the api-server build fails and the permanent fix for drizzle-zod resolution with esbuild 0.27.7
---

## The rule
`drizzle-zod` is a dependency of `@workspace/db` (lib/db) but NOT directly installed in `artifacts/api-server/node_modules/`. esbuild 0.27.7 cannot resolve it when processing aliased files from `lib/db/src/`. Two fixes are required:

1. **Symlink** — `artifacts/api-server/node_modules/drizzle-zod` must point to `../../../lib/db/node_modules/drizzle-zod`. The `build.mjs` `ensureSymlinks()` function creates it automatically before each build.
2. **nodePaths** — esbuild config must include `node_modules/.pnpm/node_modules`, `lib/db/node_modules`, and `artifacts/api-server/node_modules` in `nodePaths` so all transitive deps resolve.

## Why
esbuild 0.27.7 resolves packages from the aliased file's REAL directory. When `@workspace/db` alias → `lib/db/src/index.ts`, esbuild resolves deps from `lib/db/src/`, and `drizzle-zod` is only in `lib/db/node_modules/` (a pnpm symlink to the store). The symlink fix puts it where esbuild CAN find it from the entry point context.

## pnpm override
`pnpm-workspace.yaml` must have `esbuild: "0.27.7"` (not `"0.27.3"` — that version doesn't exist in the pnpm store and causes a broken esbuild symlink that silently deletes `dist/`).

## How to apply
- Before any rebuild, verify `artifacts/api-server/node_modules/drizzle-zod` exists.
- If lost (e.g. after pnpm install): `ln -sf /home/runner/workspace/lib/db/node_modules/drizzle-zod /home/runner/workspace/artifacts/api-server/node_modules/drizzle-zod`
- The `build.mjs` `ensureSymlinks()` function handles this automatically on each build run.
- Workflow command: `PORT=8080 pnpm --filter @workspace/api-server run start` (runs `node dist/index.mjs`)
- Rebuild: `pnpm --filter @workspace/api-server run build`
