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
  { id: 1, title: "Potrero 4 requiere rotación", desc: "Días de ocupación superados", type: "warning", time: "1h ago" },
  { id: 2, title: "Vaca Perla en tratamiento", desc: "Antibiótico L.A. día 2/3", type: "danger", time: "3h ago" },
  { id: 3, title: "Stock bajo: Oxitocina", desc: "3 frascos restantes (Min: 10)", type: "warning", time: "5h ago" },
  { id: 4, title: "Rosaura próximo parto", desc: "Faltan 11 días", type: "info", time: "1d ago" },
];

export const initialPesajes = [
  { id:1, animalId:"A-0042", animalNombre:"Rosaura", peso:520, pesoAnterior:512, fecha:"09/05/2025", hora:"07:30", metodo:"bluetooth", dispositivo:"Tru-Test XR3000", operador:"Carlos Meza", observacion:"Peso estable, buena condición", lote:"Lote A", categoria:"Vaca adulta" },
  { id:2, animalId:"A-0604", animalNombre:"Estrella", peso:535, pesoAnterior:528, fecha:"09/05/2025", hora:"07:45", metodo:"bluetooth", dispositivo:"Tru-Test XR3000", operador:"Carlos Meza", observacion:"", lote:"Lote A", categoria:"Vaca adulta" },
  { id:3, animalId:"A-0087", animalNombre:"Cielo", peso:502, pesoAnterior:498, fecha:"09/05/2025", hora:"08:00", metodo:"manual", dispositivo:"", operador:"Luis Patiño", observacion:"Pesaje manual báscula corriente", lote:"Lote A", categoria:"Vaca adulta" },
  { id:4, animalId:"A-0401", animalNombre:"Bravo", peso:810, pesoAnterior:805, fecha:"08/05/2025", hora:"09:15", metodo:"bluetooth", dispositivo:"Tru-Test XR3000", operador:"Carlos Meza", observacion:"Toro en excelente condición corporal", lote:"Lote D", categoria:"Toro" },
  { id:5, animalId:"A-0667", animalNombre:"Brisa", peso:72, pesoAnterior:65, fecha:"08/05/2025", hora:"10:00", metodo:"manual", dispositivo:"", operador:"Luis Patiño", observacion:"Buen desarrollo ternero", lote:"Lote E", categoria:"Ternero" },
  { id:6, animalId:"A-0512", animalNombre:"Manchas", peso:88, pesoAnterior:80, fecha:"07/05/2025", hora:"10:20", metodo:"manual", dispositivo:"", operador:"Luis Patiño", observacion:"", lote:"Lote E", categoria:"Ternero" },
];

export const initialGps = [
  { id:1, animalId:"A-0042", nombre:"Rosaura", lat:4.7110, lng:-74.0721, potreroId:1, potreroNom:"Potrero 1", bateria:87, activo:true, ultimaSenal:"hace 2 min", dispositivo:"GPS-BT-001" },
  { id:2, animalId:"A-0604", nombre:"Estrella", lat:4.7115, lng:-74.0718, potreroId:1, potreroNom:"Potrero 1", bateria:72, activo:true, ultimaSenal:"hace 1 min", dispositivo:"GPS-BT-002" },
  { id:3, animalId:"A-0087", nombre:"Cielo", lat:4.7108, lng:-74.0725, potreroId:1, potreroNom:"Potrero 1", bateria:55, activo:true, ultimaSenal:"hace 5 min", dispositivo:"GPS-BT-003" },
  { id:4, animalId:"A-0401", nombre:"Bravo", lat:4.7225, lng:-74.0850, potreroId:4, potreroNom:"Potrero 4", bateria:91, activo:true, ultimaSenal:"hace 3 min", dispositivo:"GPS-BT-004" },
  { id:5, animalId:"A-0215", nombre:"Tormenta", lat:4.7190, lng:-74.0800, potreroId:3, potreroNom:"Potrero 3", bateria:43, activo:true, ultimaSenal:"hace 8 min", dispositivo:"GPS-BT-005" },
  { id:6, animalId:"A-0133", nombre:"Palmera", lat:4.7180, lng:-74.0795, potreroId:3, potreroNom:"Potrero 3", bateria:28, activo:true, ultimaSenal:"hace 12 min", dispositivo:"GPS-BT-006" },
  { id:7, animalId:"A-0319", nombre:"Luna", lat:4.7200, lng:-74.0820, potreroId:3, potreroNom:"Potrero 3", bateria:66, activo:true, ultimaSenal:"hace 4 min", dispositivo:"GPS-BT-007" },
  { id:8, animalId:"A-0712", nombre:"Perla", lat:4.7112, lng:-74.0730, potreroId:1, potreroNom:"Potrero 1", bateria:11, activo:false, ultimaSenal:"hace 45 min", dispositivo:"GPS-BT-008" },
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
type Pesaje = typeof initialPesajes[0];
type GpsUbicacion = typeof initialGps[0];

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
  pesajes: Pesaje[];
  setPesajes: React.Dispatch<React.SetStateAction<Pesaje[]>>;
  gpsUbicaciones: GpsUbicacion[];
  setGpsUbicaciones: React.Dispatch<React.SetStateAction<GpsUbicacion[]>>;
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
  const [pesajes, _setPesajes] = useLocal('pesajes', initialPesajes);
  const [gpsUbicaciones, _setGpsUbicaciones] = useLocal('gps', initialGps);

  useEffect(() => {
    apiGet<Animal[]>("/animals").then(data => { if (data && data.length > 0) _setAnimals(data); }).catch(() => {});
    apiGet<Potrero[]>("/potreros").then(data => { if (data && data.length > 0) _setPotreros(data); }).catch(() => {});
    apiGet<Insumo[]>("/insumos").then(data => { if (data && data.length > 0) _setInsumos(data); }).catch(() => {});
    apiGet<Personal[]>("/personal").then(data => { if (data && data.length > 0) _setPersonal(data); }).catch(() => {});
    apiGet<Reproduccion[]>("/reproduccion").then(data => { if (data && data.length > 0) _setReproduccion(data); }).catch(() => {});
    apiGet<Alerta[]>("/alertas").then(data => { if (data && data.length > 0) _setAlertas(data); }).catch(() => {});
    apiGet<Pesaje[]>("/pesajes").then(data => { if (data && data.length > 0) _setPesajes(data); }).catch(() => {});
    apiGet<GpsUbicacion[]>("/gps").then(data => { if (data && data.length > 0) _setGpsUbicaciones(data); }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const setPesajes = useCallback((action: React.SetStateAction<Pesaje[]>) => {
    _setPesajes(prev => {
      const next = typeof action === "function" ? (action as (p: Pesaje[]) => Pesaje[])(prev) : action;
      apiPost("/pesajes/bulk", { pesajes: next });
      return next;
    });
  }, [_setPesajes]);

  const setGpsUbicaciones = useCallback((action: React.SetStateAction<GpsUbicacion[]>) => {
    _setGpsUbicaciones(prev => {
      const next = typeof action === "function" ? (action as (p: GpsUbicacion[]) => GpsUbicacion[])(prev) : action;
      apiPost("/gps/bulk", { ubicaciones: next });
      return next;
    });
  }, [_setGpsUbicaciones]);

  const resetAll = useCallback(() => {
    _setAnimals(initialAnimals);
    _setPotreros(initialPotreros);
    _setInsumos(initialInsumos);
    _setPersonal(initialPersonal);
    _setReproduccion(initialReproduccion);
    _setAlertas(initialAlertas);
    _setPesajes(initialPesajes);
    _setGpsUbicaciones(initialGps);
    ['animals','potreros','insumos','personal','reproduccion','alertas','pesajes','gps'].forEach(k => {
      try { localStorage.removeItem(`ganader_${k}`); } catch {}
    });
    apiPost("/seed", {});
  }, [_setAnimals, _setPotreros, _setInsumos, _setPersonal, _setReproduccion, _setAlertas, _setPesajes, _setGpsUbicaciones]);

  return React.createElement(
    AppStateContext.Provider,
    { value: { animals, setAnimals, potreros, setPotreros, insumos, setInsumos, personal, setPersonal, reproduccion, setReproduccion, alertas, setAlertas, pesajes, setPesajes, gpsUbicaciones, setGpsUbicaciones, resetAll } },
    children
  );
}

export const useAppState = (): AppStateType => {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
};
