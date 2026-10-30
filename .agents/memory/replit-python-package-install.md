---
name: Replit Python package installation
description: Ensure Python requirements are actually available in this Replit runtime.
---

**Rule:** Do not assume that a dependency listed in `requirements.txt` is installed in the active Replit Python runtime. Verify imports in the runtime and use Replit package management when a module is missing; include the runtime's site-packages path in commands when needed.

**Why:** Flask could not import `psycopg` even though it was pinned in `requirements.txt`. Installing it through Replit's package management made the PostgreSQL health check succeed.

**How to apply:** Before diagnosing application code, test imports in the same runtime used by the workflow or deployment, install missing packages through the package-management flow, then smoke-test the app under its production WSGI server.
