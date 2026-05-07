import React, { createContext, useContext, useState, useCallback } from "react";

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
  resetAll: () => void;
}

const AppStateContext = createContext<AppStateType | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [animals, setAnimals] = useLocal('animals', initialAnimals);
  const [potreros, setPotreros] = useLocal('potreros', initialPotreros);
  const [insumos, setInsumos] = useLocal('insumos', initialInsumos);
  const [personal, setPersonal] = useLocal('personal', initialPersonal);
  const [reproduccion, setReproduccion] = useLocal('reproduccion', initialReproduccion);
  const [alertas, setAlertas] = useLocal('alertas', initialAlertas);

  const resetAll = useCallback(() => {
    setAnimals(initialAnimals);
    setPotreros(initialPotreros);
    setInsumos(initialInsumos);
    setPersonal(initialPersonal);
    setReproduccion(initialReproduccion);
    setAlertas(initialAlertas);
    ['animals','potreros','insumos','personal','reproduccion','alertas'].forEach(k => {
      try { localStorage.removeItem(`ganader_${k}`); } catch {}
    });
  }, [setAnimals, setPotreros, setInsumos, setPersonal, setReproduccion, setAlertas]);

  return React.createElement(
    AppStateContext.Provider,
    { value: { animals, setAnimals, potreros, setPotreros, insumos, setInsumos, personal, setPersonal, reproduccion, setReproduccion, alertas, setAlertas, resetAll } },
    children
  );
}

export const useAppState = (): AppStateType => {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
};
