---
name: AI provider billing policy
description: Provider selection, secret handling, and Premium access rules for GanaderIA's AI integrations.
---

Keep free-tier providers as the default. Paid or usage-billed providers must never be selected automatically, and their entitlement must be checked by the server rather than trusted from client state. Provider keys stay server-side; free-tier availability is still subject to provider quotas and terms.

**Why:** The user requested free AI first and premium AI only as an optional addition; automatic paid selection could create unexpected charges, and client-only checks can be bypassed.

**How to apply:** When adding a provider, classify its actual billing terms, present possible charges before selection, keep credentials in server secrets, and enforce Premium access in the API.
