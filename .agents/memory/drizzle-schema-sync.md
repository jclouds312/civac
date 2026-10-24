---
name: Drizzle development schema sync
description: Handling Drizzle Kit schema sync safely in this pnpm workspace
---

**Rule:** Drizzle Kit may fail to load TypeScript schema re-exports that use `.js` suffixes. After correcting source resolution, the regular workspace `db push` still failed against an already-existing table; do not use `push-force` to get past that. Inspect the exact drift and apply only a scoped, non-destructive development change. Replit-managed production schema changes belong to the Publish flow.

**Why:** A broad force sync can approve destructive schema changes; in this workspace the normal push encountered existing database objects before applying the needed change.

**How to apply:** Query only schema metadata, confirm the target environment, prefer the normal schema workflow, and if it fails stop before retrying with force. Keep production untouched unless the user's approved deployment flow changes it.
