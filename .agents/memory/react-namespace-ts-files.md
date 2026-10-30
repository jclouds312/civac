---
name: React namespace in .ts files
description: Why import * as React fails in .ts files under Vite HMR and how to fix it
---

## Rule
In `.ts` files (NOT `.tsx`), NEVER use `import * as React from "react"` or `import React from "react"`.
Use named imports only: `import { useState, useEffect, useRef } from "react"` and `import type { ReactNode, ElementType } from "react"`.

**Why:** Vite's HMR resolves the React module lazily in `.ts` files. The `React` namespace object becomes `null` at hook-call time during hot reloads, causing `Cannot read properties of null (reading 'useState')`. Named imports are resolved correctly by the module system and are stable.

**How to apply:** Any time a `.ts` file uses `React.useState`, `React.useEffect`, `React.ReactNode`, `React.ElementType`, etc., replace with named imports. Files affected: `data.ts`, `auth.ts`, `theme.ts`, `use-toast.ts`. `.tsx` files are unaffected (JSX transform injects React automatically).
