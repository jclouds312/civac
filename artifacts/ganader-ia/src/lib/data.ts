import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

// ─── Initial Seed Data ────────────────────────────────────────────────────────

export const initialAnimals = [
  { id:"A-0042", nombre:"Rosaura", raza:"Holstein", categoria:"Vaca adulta", peso:520, lote:"Lote A", estado:"Producción", litrosDia:18.4, partos:4 },
  { id:"A-0604", nombre:"Estrella", raza:"Holstein", categoria:"Vaca adulta", peso:535, lote:"Lote A", estado:"Producción", litrosDia:17.8, partos:3 },
  { id:"A-0087", nombre:"Cielo", raza:"Simmental", categoria:"Vaca adulta", peso:502, lote:"Lote A", estado:"Producción", litrosDia:16.9, partos:3 },
  { id:"A-0445", nombre:"Niebla", raza:"Holstein", categoria:"Vaca adulta", peso:505, lote:"Lote B", estado:"Producción", litrosDia:15.8, partos:3 },
  { id:"A-0133", nombre:"Palmera", raza:"Gyr X", categoria:"Vaca adulta", peso:488, lote:"Lote B", estado:"Producción", litrosDia:15.2, partos:2 },
  { id:"A-0712", nombre:"Perla", raza:"Holstein", categoria:"Vaca adulta", peso:510, lote:"Lote A", estado:"Tratamiento", litrosDia:12.1, partos:2 },
  { id:"A-0108", nombre:"Canela", raza:"Brahman", categoria:"Vaca adulta", peso:498, lote:"Lote B", estado:"Seca", litrosDia:0, partos:5 },
  { id:"A-0319", nombre:"Luna", raza:"Simmental", categoria:"Novilla", peso:287, lote:"Lote C", estado:"Abierta", litrosDia:0, partos:0 },
  { id:"A-0551", nombre:"Aurora", raza:"Holstein", categoria:"Novilla", peso:295, lote:"Lote C", estado:"Abierta", litrosDia:0, partos:0 },
  { id:"A-0215", nombre:"Tormenta", raza:"Gyr", categoria:"Novilla", peso:312, lote:"Lote C", estado:"Gestante", litrosDia:0, partos:0 },
  { id:"A-0401", nombre:"Bravo", raza:"Brahman", categoria:"Toro", peso:810, lote:"Lote D", estado:"Activo", litrosDia:0, partos:0 },
  { id:"A-0667", nombre:"Brisa", raza:"Brahman", categoria:"Ternero", peso:72, lote:"Lote E", estado:"Destete", litrosDia:0, partos:0 },
  { id:"A-0512", nombre:"Manchas", raza:"Holstein", categoria:"Ternero", peso:88, lote:"Lote E", estado:"Destete", litrosDia:0, partos:0 },
];

export const initialPotreros = [
  { id:1, nombre:"Potrero 1", pasto:"Kikuyo", hectareas:4.5, estado:"Ocupado", diasOcupado:6, diasRotacion:30, animales:22 },
  { id:2, nombre:"Potrero 2", pasto:"Raigrás", hectareas:3.8, estado:"Descanso", diasDescanso:8, diasRotacion:22, animales:0 },
  { id:3, nombre:"Potrero 3", pasto:"Brachiaria", hectareas:5.1, estado:"Ocupado", diasOcupado:14, diasRotacion:34, animales:20 },
  { id:4, nombre:"Potrero 4", pasto:"Estrella", hectareas:4.2, estado:"Rotar pronto", diasRestantes:3, diasRotacion:28, animales:26 },
  { id:5, nombre:"Potrero 5", pasto:"Pasto nativo", hectareas:6.0, estado:"Disponible", diasDescanso:21, animales:0 },
  { id:6, nombre:"Potrero 6", pasto:"Kikuyo", hectareas:3.5, estado:"Ocupado", diasOcupado:18, diasRotacion:23, animales:22 },
];

export const initialInsumos = [
  { nombre:"Sal mineralizada", categoria:"Alimentacion", stock:180, maximo:300, minimo:60, unidad:"kg" },
  { nombre:"Concentrado 16%", categoria:"Alimentacion", stock:1200, maximo:2000, minimo:400, unidad:"kg" },
  { nombre:"Prostaglandina", categoria:"Reproductivo", stock:8, maximo:30, minimo:15, unidad:"frascos" },
  { nombre:"Calcio i.v.", categoria:"Mineral", stock:6, maximo:25, minimo:12, unidad:"frascos" },
  { nombre:"Antibiotico L.A.", categoria:"Antibiotico", stock:18, maximo:30, minimo:10, unidad:"jeringas" },
  { nombre:"Vacuna IBR/BVD", categoria:"Biologico", stock:180, maximo:500, minimo:250, unidad:"dosis" },
  { nombre:"Ivermectina 1%", categoria:"Antiparasitario", stock:12, maximo:40, minimo:10, unidad:"frascos" },
  { nombre:"Oxitocina 10UI", categoria:"Reproductivo", stock:3, maximo:30, minimo:10, unidad:"frascos" },
];

export const initialPersonal = [
  { nombre:"Carlos Meza", cargo:"Vaquero jefe", cedula:"0801-1985-12345", ingreso:"01/03/2020", salario:1600000, hExtras:8, eps:"Sanitas", arl:"Positiva" },
  { nombre:"Luis Patiño", cargo:"Ordeñador", cedula:"0801-1990-23456", ingreso:"15/06/2021", salario:1420000, hExtras:6, eps:"Colsanitas", arl:"Sura" },
  { nombre:"Sandra Roa", cargo:"Ordeñadora", cedula:"0801-1992-34567", ingreso:"10/01/2022", salario:1420000, hExtras:4, eps:"Sanitas", arl:"Positiva" },
  { nombre:"Pedro Villa", cargo:"Inseminador", cedula:"0801-1983-45678", ingreso:"05/08/2019", salario:2100000, hExtras:12, eps:"Compensar", arl:"Sura" },
  { nombre:"Ana Gomez", cargo:"Administradora", cedula:"0801-1986-56789", ingreso:"01/02/2020", salario:2800000, hExtras:0, eps:"Colsanitas", arl:"Positiva" },
  { nombre:"Jorge Cruz", cargo:"Mantenimiento", cedula:"0801-1995-67890", ingreso:"20/09/2023", salario:1420000, hExtras:8, eps:"Sanitas", arl:"Sura" },
];

export const initialReproduccion = [
  { arete:"A-0042", animal:"Rosaura", servicio:"IA Altisimo", fechaParto:"10/05/2025", dias:11, partosPrev:4, estado:"Normal" },
  { arete:"A-0215", animal:"Tormenta", servicio:"IA Furacao", fechaParto:"18/05/2025", dias:19, partosPrev:0, estado:"Primipara" },
  { arete:"A-0087", animal:"Cielo", servicio:"Monta natural", fechaParto:"22/05/2025", dias:23, partosPrev:2, estado:"Normal" },
  { arete:"A-0133", animal:"Palmera", servicio:"IA Altisimo", fechaParto:"01/06/2025", dias:33, partosPrev:3, estado:"Vigilar" },
  { arete:"A-0604", animal:"Estrella", servicio:"IA Titan USA", fechaParto:"05/06/2025", dias:37, partosPrev:3, estado:"Normal" },
];

export const initialAlertas = [
  { id: 1, title: "Potrero 4 requiere rotación", desc: "Días de ocupación superados", type: "warning", time: "1h ago", resolved: false },
  { id: 2, title: "Vaca Perla en tratamiento", desc: "Antibiótico L.A. día 2/3", type: "danger", time: "3h ago", resolved: false },
  { id: 3, title: "Stock bajo: Oxitocina", desc: "3 frascos restantes (Min: 10)", type: "warning", time: "5h ago", resolved: false },
  { id: 4, title: "Rosaura próximo parto", desc: "Faltan 11 días", type: "info", time: "1d ago", resolved: false },
];

export const initialPesaje = [
  { id:1, animalId:"A-0042", animalNombre:"Rosaura", categoria:"Vaca adulta", fecha:"01/10/2024", peso:498, bascula:"Tru-Test S3", operador:"Carlos Meza", observaciones:"Pesaje mensual", condicionCorporal:3, variacion:null },
  { id:2, animalId:"A-0042", animalNombre:"Rosaura", categoria:"Vaca adulta", fecha:"01/11/2024", peso:505, bascula:"Tru-Test S3", operador:"Carlos Meza", observaciones:"", condicionCorporal:3, variacion:7 },
  { id:3, animalId:"A-0042", animalNombre:"Rosaura", categoria:"Vaca adulta", fecha:"01/12/2024", peso:511, bascula:"Tru-Test S3", operador:"Carlos Meza", observaciones:"", condicionCorporal:4, variacion:6 },
  { id:4, animalId:"A-0042", animalNombre:"Rosaura", categoria:"Vaca adulta", fecha:"01/01/2025", peso:516, bascula:"Tru-Test S3", operador:"Carlos Meza", observaciones:"Ganancia excelente", condicionCorporal:4, variacion:5 },
  { id:5, animalId:"A-0042", animalNombre:"Rosaura", categoria:"Vaca adulta", fecha:"01/04/2025", peso:520, bascula:"Tru-Test S3", operador:"Carlos Meza", observaciones:"Estable", condicionCorporal:4, variacion:4 },
  { id:6, animalId:"A-0604", animalNombre:"Estrella", categoria:"Vaca adulta", fecha:"01/10/2024", peso:514, bascula:"Tru-Test S3", operador:"Carlos Meza", observaciones:"", condicionCorporal:4, variacion:null },
  { id:7, animalId:"A-0604", animalNombre:"Estrella", categoria:"Vaca adulta", fecha:"01/12/2024", peso:524, bascula:"Tru-Test S3", operador:"Carlos Meza", observaciones:"", condicionCorporal:4, variacion:10 },
  { id:8, animalId:"A-0604", animalNombre:"Estrella", categoria:"Vaca adulta", fecha:"01/04/2025", peso:535, bascula:"Tru-Test S3", operador:"Carlos Meza", observaciones:"Buen estado", condicionCorporal:4, variacion:11 },
  { id:9, animalId:"A-0087", animalNombre:"Cielo", categoria:"Vaca adulta", fecha:"01/10/2024", peso:482, bascula:"Gallagher W210", operador:"Luis Patiño", observaciones:"", condicionCorporal:3, variacion:null },
  { id:10, animalId:"A-0087", animalNombre:"Cielo", categoria:"Vaca adulta", fecha:"01/01/2025", peso:490, bascula:"Gallagher W210", operador:"Luis Patiño", observaciones:"", condicionCorporal:3, variacion:8 },
  { id:11, animalId:"A-0087", animalNombre:"Cielo", categoria:"Vaca adulta", fecha:"01/04/2025", peso:502, bascula:"Gallagher W210", operador:"Luis Patiño", observaciones:"Mejora post-parto", condicionCorporal:3, variacion:12 },
  { id:12, animalId:"A-0445", animalNombre:"Niebla", categoria:"Vaca adulta", fecha:"01/10/2024", peso:490, bascula:"Tru-Test S3", operador:"Carlos Meza", observaciones:"", condicionCorporal:3, variacion:null },
  { id:13, animalId:"A-0445", animalNombre:"Niebla", categoria:"Vaca adulta", fecha:"01/04/2025", peso:505, bascula:"Tru-Test S3", operador:"Carlos Meza", observaciones:"", condicionCorporal:3, variacion:15 },
  { id:14, animalId:"A-0133", animalNombre:"Palmera", categoria:"Vaca adulta", fecha:"01/10/2024", peso:472, bascula:"Gallagher W210", operador:"Luis Patiño", observaciones:"", condicionCorporal:3, variacion:null },
  { id:15, animalId:"A-0133", animalNombre:"Palmera", categoria:"Vaca adulta", fecha:"01/04/2025", peso:488, bascula:"Gallagher W210", operador:"Luis Patiño", observaciones:"Estable", condicionCorporal:3, variacion:16 },
  { id:16, animalId:"A-0712", animalNombre:"Perla", categoria:"Vaca adulta", fecha:"01/10/2024", peso:518, bascula:"Tru-Test S3", operador:"Carlos Meza", observaciones:"", condicionCorporal:4, variacion:null },
  { id:17, animalId:"A-0712", animalNombre:"Perla", categoria:"Vaca adulta", fecha:"01/04/2025", peso:510, bascula:"Tru-Test S3", operador:"Carlos Meza", observaciones:"Leve pérdida por tratamiento", condicionCorporal:3, variacion:-8 },
  { id:18, animalId:"A-0108", animalNombre:"Canela", categoria:"Vaca adulta", fecha:"01/10/2024", peso:485, bascula:"Gallagher W210", operador:"Luis Patiño", observaciones:"", condicionCorporal:3, variacion:null },
  { id:19, animalId:"A-0108", animalNombre:"Canela", categoria:"Vaca adulta", fecha:"01/04/2025", peso:498, bascula:"Gallagher W210", operador:"Luis Patiño", observaciones:"", condicionCorporal:3, variacion:13 },
  { id:20, animalId:"A-0319", animalNombre:"Luna", categoria:"Novilla", fecha:"01/10/2024", peso:255, bascula:"Báscula portátil", operador:"Pedro Villa", observaciones:"Novilla en crecimiento", condicionCorporal:3, variacion:null },
  { id:21, animalId:"A-0319", animalNombre:"Luna", categoria:"Novilla", fecha:"01/01/2025", peso:272, bascula:"Báscula portátil", operador:"Pedro Villa", observaciones:"", condicionCorporal:3, variacion:17 },
  { id:22, animalId:"A-0319", animalNombre:"Luna", categoria:"Novilla", fecha:"01/04/2025", peso:287, bascula:"Báscula portátil", operador:"Pedro Villa", observaciones:"Buen desarrollo", condicionCorporal:3, variacion:15 },
  { id:23, animalId:"A-0551", animalNombre:"Aurora", categoria:"Novilla", fecha:"01/10/2024", peso:265, bascula:"Báscula portátil", operador:"Pedro Villa", observaciones:"", condicionCorporal:3, variacion:null },
  { id:24, animalId:"A-0551", animalNombre:"Aurora", categoria:"Novilla", fecha:"01/04/2025", peso:295, bascula:"Báscula portátil", operador:"Pedro Villa", observaciones:"", condicionCorporal:3, variacion:30 },
  { id:25, animalId:"A-0215", animalNombre:"Tormenta", categoria:"Novilla", fecha:"01/10/2024", peso:280, bascula:"Báscula portátil", operador:"Pedro Villa", observaciones:"Gestante", condicionCorporal:3, variacion:null },
  { id:26, animalId:"A-0215", animalNombre:"Tormenta", categoria:"Novilla", fecha:"01/04/2025", peso:312, bascula:"Báscula portátil", operador:"Pedro Villa", observaciones:"Ganancia por gestación", condicionCorporal:4, variacion:32 },
  { id:27, animalId:"A-0401", animalNombre:"Bravo", categoria:"Toro", fecha:"01/10/2024", peso:790, bascula:"Tru-Test S3", operador:"Carlos Meza", observaciones:"Pesaje semestral", condicionCorporal:4, variacion:null },
  { id:28, animalId:"A-0401", animalNombre:"Bravo", categoria:"Toro", fecha:"01/04/2025", peso:810, bascula:"Tru-Test S3", operador:"Carlos Meza", observaciones:"Excelente condición", condicionCorporal:4, variacion:20 },
  { id:29, animalId:"A-0667", animalNombre:"Brisa", categoria:"Ternero", fecha:"01/01/2025", peso:45, bascula:"Báscula portátil", operador:"Luis Patiño", observaciones:"Nacimiento", condicionCorporal:3, variacion:null },
  { id:30, animalId:"A-0667", animalNombre:"Brisa", categoria:"Ternero", fecha:"01/04/2025", peso:72, bascula:"Báscula portátil", operador:"Luis Patiño", observaciones:"Buen desarrollo", condicionCorporal:3, variacion:27 },
  { id:31, animalId:"A-0512", animalNombre:"Manchas", categoria:"Ternero", fecha:"01/10/2024", peso:52, bascula:"Báscula portátil", operador:"Luis Patiño", observaciones:"", condicionCorporal:3, variacion:null },
  { id:32, animalId:"A-0512", animalNombre:"Manchas", categoria:"Ternero", fecha:"01/04/2025", peso:88, bascula:"Báscula portátil", operador:"Luis Patiño", observaciones:"", condicionCorporal:3, variacion:36 },
];

// ─── API Sync Helpers ─────────────────────────────────────────────────────────

async function apiGet<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`/api${path}`);
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch { return null; }
}

async function apiPost(path: string, body: unknown): Promise<void> {
  try {
    await fetch(`/api${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch { /* fire and forget */ }
}

// ─── localStorage Helper ──────────────────────────────────────────────────────

function useLocal<T>(key: string, initial: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(`ganader_${key}`);
      return stored ? JSON.parse(stored) : initial;
    } catch { return initial; }
  });

  const setPersisted = useCallback((action: React.SetStateAction<T>) => {
    setState(prev => {
      const next = typeof action === "function" ? (action as (p: T) => T)(prev) : action;
      try { localStorage.setItem(`ganader_${key}`, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [key]) as React.Dispatch<React.SetStateAction<T>>;

  return [state, setPersisted];
}

// ─── App State Context ────────────────────────────────────────────────────────

type Animal = typeof initialAnimals[0];
type Potrero = typeof initialPotreros[0];
type Insumo = typeof initialInsumos[0];
type Personal = typeof initialPersonal[0];
type Reproduccion = typeof initialReproduccion[0];
type Alerta = typeof initialAlertas[0];
export type Pesaje = typeof initialPesaje[0];

interface AppStateType {
  animals: Animal[];
  setAnimals: React.Dispatch<React.SetStateAction<Animal[]>>;
  potreros: Potrero[];
  setPotreros: React.Dispatch<React.SetStateAction<Potrero[]>>;
  insumos: Insumo[];
  setInsumos: React.Dispatch<React.SetStateAction<Insumo[]>>;
  personal: Personal[];
  setPersonal: React.Dispatch<React.SetStateAction<Personal[]>>;
  reproduccion: Reproduccion[];
  setReproduccion: React.Dispatch<React.SetStateAction<Reproduccion[]>>;
  alertas: Alerta[];
  setAlertas: React.Dispatch<React.SetStateAction<Alerta[]>>;
  pesaje: Pesaje[];
  setPesaje: React.Dispatch<React.SetStateAction<Pesaje[]>>;
  resetAll: () => void;
}

const AppStateContext = createContext<AppStateType | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [animals, _setAnimals] = useLocal('animals', initialAnimals);
  const [potreros, _setPotreros] = useLocal('potreros', initialPotreros);
  const [insumos, _setInsumos] = useLocal('insumos', initialInsumos);
  const [personal, _setPersonal] = useLocal('personal', initialPersonal);
  const [reproduccion, _setReproduccion] = useLocal('reproduccion', initialReproduccion);
  const [alertas, _setAlertas] = useLocal('alertas', initialAlertas);
  const [pesaje, _setPesaje] = useLocal('pesaje', initialPesaje);

  // ── Hydrate from API on mount ─────────────────────────────────────────────
  useEffect(() => {
    apiGet<Animal[]>("/animals").then(data => { if (data && data.length > 0) _setAnimals(data); }).catch(() => {});
    apiGet<Potrero[]>("/potreros").then(data => { if (data && data.length > 0) _setPotreros(data); }).catch(() => {});
    apiGet<Insumo[]>("/insumos").then(data => { if (data && data.length > 0) _setInsumos(data); }).catch(() => {});
    apiGet<Personal[]>("/personal").then(data => { if (data && data.length > 0) _setPersonal(data); }).catch(() => {});
    apiGet<Reproduccion[]>("/reproduccion").then(data => { if (data && data.length > 0) _setReproduccion(data); }).catch(() => {});
    apiGet<Alerta[]>("/alertas").then(data => { if (data && data.length > 0) _setAlertas(data); }).catch(() => {});
    apiGet<Pesaje[]>("/pesaje").then(data => { if (data && data.length > 0) _setPesaje(data); }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── API-synced setters ────────────────────────────────────────────────────
  const setAnimals = useCallback((action: React.SetStateAction<Animal[]>) => {
    _setAnimals(prev => {
      const next = typeof action === "function" ? (action as (p: Animal[]) => Animal[])(prev) : action;
      apiPost("/animals/bulk", { animals: next });
      return next;
    });
  }, [_setAnimals]);

  const setPotreros = useCallback((action: React.SetStateAction<Potrero[]>) => {
    _setPotreros(prev => {
      const next = typeof action === "function" ? (action as (p: Potrero[]) => Potrero[])(prev) : action;
      apiPost("/potreros/bulk", { potreros: next });
      return next;
    });
  }, [_setPotreros]);

  const setInsumos = useCallback((action: React.SetStateAction<Insumo[]>) => {
    _setInsumos(prev => {
      const next = typeof action === "function" ? (action as (p: Insumo[]) => Insumo[])(prev) : action;
      apiPost("/insumos/bulk", { insumos: next });
      return next;
    });
  }, [_setInsumos]);

  const setPersonal = useCallback((action: React.SetStateAction<Personal[]>) => {
    _setPersonal(prev => {
      const next = typeof action === "function" ? (action as (p: Personal[]) => Personal[])(prev) : action;
      apiPost("/personal/bulk", { personal: next });
      return next;
    });
  }, [_setPersonal]);

  const setReproduccion = useCallback((action: React.SetStateAction<Reproduccion[]>) => {
    _setReproduccion(prev => {
      const next = typeof action === "function" ? (action as (p: Reproduccion[]) => Reproduccion[])(prev) : action;
      apiPost("/reproduccion/bulk", { reproduccion: next });
      return next;
    });
  }, [_setReproduccion]);

  const setAlertas = useCallback((action: React.SetStateAction<Alerta[]>) => {
    _setAlertas(prev => {
      const next = typeof action === "function" ? (action as (p: Alerta[]) => Alerta[])(prev) : action;
      apiPost("/alertas/bulk", { alertas: next });
      return next;
    });
  }, [_setAlertas]);

  const setPesaje = useCallback((action: React.SetStateAction<Pesaje[]>) => {
    _setPesaje(prev => {
      const next = typeof action === "function" ? (action as (p: Pesaje[]) => Pesaje[])(prev) : action;
      apiPost("/pesaje/bulk", { pesaje: next });
      return next;
    });
  }, [_setPesaje]);

  const resetAll = useCallback(() => {
    _setAnimals(initialAnimals);
    _setPotreros(initialPotreros);
    _setInsumos(initialInsumos);
    _setPersonal(initialPersonal);
    _setReproduccion(initialReproduccion);
    _setAlertas(initialAlertas);
    _setPesaje(initialPesaje);
    ['animals','potreros','insumos','personal','reproduccion','alertas','pesaje'].forEach(k => {
      try { localStorage.removeItem(`ganader_${k}`); } catch {}
    });
    apiPost("/seed", { force: true });
  }, [_setAnimals, _setPotreros, _setInsumos, _setPersonal, _setReproduccion, _setAlertas, _setPesaje]);

  return React.createElement(
    AppStateContext.Provider,
    { value: { animals, setAnimals, potreros, setPotreros, insumos, setInsumos, personal, setPersonal, reproduccion, setReproduccion, alertas, setAlertas, pesaje, setPesaje, resetAll } },
    children
  );
}

export const useAppState = (): AppStateType => {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
};
