---
name: Expo Linux devtools
description: System libraries required for Expo's React Native DevTools process to start in the Replit Linux environment.
---

Expo's Metro server can run even when its optional React Native DevTools desktop subprocess fails to load. The DevTools binary depends on a broader GTK/graphics runtime; this environment reported missing NSPR, NSS, D-Bus, ATK, CUPS, and GBM libraries during startup.

**Why:** Missing libraries affect the optional desktop inspector, but do not stop Expo Metro from serving the app and QR code.

**How to apply:** Check whether Metro and the mobile preview are actually blocked before adding more system packages. Only expand the Nix runtime further when the desktop inspector is required.
