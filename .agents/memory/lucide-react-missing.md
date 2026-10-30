---
name: lucide-react missing icons
description: Icons that do NOT exist in the installed lucide-react version in this project, and their replacements.
---

## Rule
Before using any lucide-react icon that isn't already in the codebase, verify with:
```
node -e "const lr=require('./node_modules/lucide-react'); console.log('IconName', 'IconName' in lr ? 'OK' : 'MISSING')"
```

## Known missing
- `Cow` → use `Beef` instead

**Why:** The installed version of lucide-react (checked in artifacts/ganader-ia) does not export `Cow`. Using it causes a Vite runtime error: "The requested module does not provide an export named 'Cow'".

**How to apply:** Any time you add an animal/cattle icon, use `Beef`. For GPS/location always check before using.
