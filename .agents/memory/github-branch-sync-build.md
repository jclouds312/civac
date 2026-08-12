---
name: GitHub branch sync and build
description: When replacing the active checkout with a newer GitHub branch, preserve divergent local commits before hard-resetting and validate the artifact-specific workflows.
---

When a requested GitHub branch diverges from local work, create a local backup branch before aligning the requested branch to its remote tip. In this monorepo, build the frontend and API artifact separately when the root typecheck includes legacy API errors, then validate the artifact workflows directly.

**Why:** A previous sync exposed divergent local commits and stale/duplicate workflow processes; preserving the local branch avoided data loss, while artifact builds proved the requested branch was usable even when unrelated strict typechecks were noisy.

**How to apply:** Use the authenticated GitHub pull when raw `git fetch` times out, verify `git rev-list --left-right --count` is `00`, and restart the artifact-specific workflows after checkout changes.