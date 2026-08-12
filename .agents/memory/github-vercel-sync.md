---
name: GitHub and Vercel sync
description: Durable workflow constraints for syncing the default GitHub branch and deploying the Vite frontend on Vercel.
---

When synchronizing this project with GitHub, preserve the current branch first and verify the remote default branch before switching. A local remote-tracking ref can be stale when GitHub authentication is unavailable, so do not claim the checkout is the latest remote commit without a successful authenticated fetch.

**Why:** Direct GitHub authentication may be unavailable in the workspace, and the project has multiple branches with different deployment architectures.

**How to apply:** Prefer the default branch reported by `origin/HEAD`; for the Vite GanaderIA artifact, Vercel must build the workspace package and publish `artifacts/ganader-ia/dist/public`, then use an SPA rewrite.