---
name: CustomTrama type and testCustomTrama API
description: Correct usage of CustomTrama interface and testCustomTrama function in pesaje module.
---

## CustomTrama interface (scale-config.ts)
All 10 fields are required:
```ts
interface CustomTrama {
  id: string;
  nombre: string;
  descripcion: string;        // often empty string ''
  regex: string;
  icon: string;
  color: string;
  estabilidad_directa: boolean; // often false
  ejemplo: string;
  createdAt: number;           // Date.now()
  active: boolean;             // true
}
```

## testCustomTrama
Signature: `testCustomTrama(trama: CustomTrama, testData: string): number[]`
- Returns an array of matched weight numbers, NOT `{ok, peso, error}`
- Test for match: `r.length > 0`
- Get weight: `r[0]`

**Why:** The pesaje.tsx code had a bug calling testCustomTrama with a raw regex string and treating the result as `{ok,peso,error}`. Fixed by passing a full CustomTrama object and using array semantics.
