---
name: API server esbuild build
description: Durable rule — drizzle-zod resolution in esbuild requires symlink + nodePaths; esbuild version must be 0.27.7
---

## The rule
When esbuild resolves a path-aliased workspace package (e.g. `@workspace/db → lib/db/src/`), it resolves transitive deps from the aliased file's real directory, not the entry point. Any dep that only exists in that package's own `node_modules/` (not the root) will silently fail to resolve.

**Why:** esbuild 0.27.7 follows real filesystem paths for module resolution. `drizzle-zod` lives in `lib/db/node_modules/` but is invisible from the api-server entry context without a symlink or explicit `nodePaths`.

**How to apply:** Any workspace package added as an alias in the api-server build that brings its own dep tree needs either a symlink into `artifacts/api-server/node_modules/` or inclusion in `nodePaths`. The `build.mjs` `ensureSymlinks()` function handles this automatically — keep it.

**pnpm override:** `esbuild: "0.27.7"` in `pnpm-workspace.yaml` is required; other patch versions are not present in the local pnpm store and cause silent breakage.
