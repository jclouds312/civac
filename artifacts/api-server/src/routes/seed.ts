import { Router } from "express";
import { db } from "@workspace/db";
import { animalsTable, potrerosTable, insumosTable, personalTable, reproduccionTable, alertasTable, pesajeTable } from "@workspace/db/schema";

const router = Router();

const ANIMALS = [
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

const POTREROS = [
  { nombre:"Potrero 1", pasto:"Kikuyo", hectareas:4.5, estado:"Ocupado", diasOcupado:6, diasRotacion:30, animales:22 },
  { nombre:"Potrero 2", pasto:"Raigrás", hectareas:3.8, estado:"Descanso", diasDescanso:8, diasRotacion:22, animales:0 },
  { nombre:"Potrero 3", pasto:"Brachiaria", hectareas:5.1, estado:"Ocupado", diasOcupado:14, diasRotacion:34, animales:20 },
  { nombre:"Potrero 4", pasto:"Estrella", hectareas:4.2, estado:"Rotar pronto", diasRestantes:3, diasRotacion:28, animales:26 },
  { nombre:"Potrero 5", pasto:"Pasto nativo", hectareas:6.0, estado:"Disponible", diasDescanso:21, animales:0 },
  { nombre:"Potrero 6", pasto:"Kikuyo", hectareas:3.5, estado:"Ocupado", diasOcupado:18, diasRotacion:23, animales:22 },
];

const INSUMOS = [
  { nombre:"Sal mineralizada", categoria:"Alimentacion", stock:180, maximo:300, minimo:60, unidad:"kg" },
  { nombre:"Concentrado 16%", categoria:"Alimentacion", stock:1200, maximo:2000, minimo:400, unidad:"kg" },
  { nombre:"Prostaglandina", categoria:"Reproductivo", stock:8, maximo:30, minimo:15, unidad:"frascos" },
  { nombre:"Calcio i.v.", categoria:"Mineral", stock:6, maximo:25, minimo:12, unidad:"frascos" },
  { nombre:"Antibiotico L.A.", categoria:"Antibiotico", stock:18, maximo:30, minimo:10, unidad:"jeringas" },
  { nombre:"Vacuna IBR/BVD", categoria:"Biologico", stock:180, maximo:500, minimo:250, unidad:"dosis" },
  { nombre:"Ivermectina 1%", categoria:"Antiparasitario", stock:12, maximo:40, minimo:10, unidad:"frascos" },
  { nombre:"Oxitocina 10UI", categoria:"Reproductivo", stock:3, maximo:30, minimo:10, unidad:"frascos" },
];

const PERSONAL = [
  { nombre:"Carlos Meza", cargo:"Vaquero jefe", cedula:"0801-1985-12345", ingreso:"01/03/2020", salario:1600000, hExtras:8, eps:"Sanitas", arl:"Positiva" },
  { nombre:"Luis Patiño", cargo:"Ordeñador", cedula:"0801-1990-23456", ingreso:"15/06/2021", salario:1420000, hExtras:6, eps:"Colsanitas", arl:"Sura" },
  { nombre:"Sandra Roa", cargo:"Ordeñadora", cedula:"0801-1992-34567", ingreso:"10/01/2022", salario:1420000, hExtras:4, eps:"Sanitas", arl:"Positiva" },
  { nombre:"Pedro Villa", cargo:"Inseminador", cedula:"0801-1983-45678", ingreso:"05/08/2019", salario:2100000, hExtras:12, eps:"Compensar", arl:"Sura" },
  { nombre:"Ana Gomez", cargo:"Administradora", cedula:"0801-1986-56789", ingreso:"01/02/2020", salario:2800000, hExtras:0, eps:"Colsanitas", arl:"Positiva" },
  { nombre:"Jorge Cruz", cargo:"Mantenimiento", cedula:"0801-1995-67890", ingreso:"20/09/2023", salario:1420000, hExtras:8, eps:"Sanitas", arl:"Sura" },
];

const REPRODUCCION = [
  { arete:"A-0042", animal:"Rosaura", servicio:"IA Altisimo", fechaParto:"10/05/2025", dias:11, partosPrev:4, estado:"Normal" },
  { arete:"A-0215", animal:"Tormenta", servicio:"IA Furacao", fechaParto:"18/05/2025", dias:19, partosPrev:0, estado:"Primipara" },
  { arete:"A-0087", animal:"Cielo", servicio:"Monta natural", fechaParto:"22/05/2025", dias:23, partosPrev:2, estado:"Normal" },
  { arete:"A-0133", animal:"Palmera", servicio:"IA Altisimo", fechaParto:"01/06/2025", dias:33, partosPrev:3, estado:"Vigilar" },
  { arete:"A-0604", animal:"Estrella", servicio:"IA Titan USA", fechaParto:"05/06/2025", dias:37, partosPrev:3, estado:"Normal" },
];

const ALERTAS = [
  { title:"Potrero 4 requiere rotación", desc:"Días de ocupación superados", type:"warning", time:"1h ago", resolved:false },
  { title:"Vaca Perla en tratamiento", desc:"Antibiótico L.A. día 2/3", type:"danger", time:"3h ago", resolved:false },
  { title:"Stock bajo: Oxitocina", desc:"3 frascos restantes (Min: 10)", type:"warning", time:"5h ago", resolved:false },
  { title:"Rosaura próximo parto", desc:"Faltan 11 días", type:"info", time:"1d ago", resolved:false },
];

// Historical weighing records for all animals
const PESAJE = [
  // Rosaura — 5 pesajes históricos
  { animalId:"A-0042", animalNombre:"Rosaura", categoria:"Vaca adulta", fecha:"01/10/2024", peso:498, bascula:"Tru-Test S3", operador:"Carlos Meza", observaciones:"Pesaje mensual", condicionCorporal:3, variacion:null },
  { animalId:"A-0042", animalNombre:"Rosaura", categoria:"Vaca adulta", fecha:"01/11/2024", peso:505, bascula:"Tru-Test S3", operador:"Carlos Meza", observaciones:"", condicionCorporal:3, variacion:7 },
  { animalId:"A-0042", animalNombre:"Rosaura", categoria:"Vaca adulta", fecha:"01/12/2024", peso:511, bascula:"Tru-Test S3", operador:"Carlos Meza", observaciones:"", condicionCorporal:4, variacion:6 },
  { animalId:"A-0042", animalNombre:"Rosaura", categoria:"Vaca adulta", fecha:"01/01/2025", peso:516, bascula:"Tru-Test S3", operador:"Carlos Meza", observaciones:"Ganancia excelente", condicionCorporal:4, variacion:5 },
  { animalId:"A-0042", animalNombre:"Rosaura", categoria:"Vaca adulta", fecha:"01/04/2025", peso:520, bascula:"Tru-Test S3", operador:"Carlos Meza", observaciones:"Estable", condicionCorporal:4, variacion:4 },
  // Estrella
  { animalId:"A-0604", animalNombre:"Estrella", categoria:"Vaca adulta", fecha:"01/10/2024", peso:514, bascula:"Tru-Test S3", operador:"Carlos Meza", observaciones:"", condicionCorporal:4, variacion:null },
  { animalId:"A-0604", animalNombre:"Estrella", categoria:"Vaca adulta", fecha:"01/12/2024", peso:524, bascula:"Tru-Test S3", operador:"Carlos Meza", observaciones:"", condicionCorporal:4, variacion:10 },
  { animalId:"A-0604", animalNombre:"Estrella", categoria:"Vaca adulta", fecha:"01/04/2025", peso:535, bascula:"Tru-Test S3", operador:"Carlos Meza", observaciones:"Buen estado", condicionCorporal:4, variacion:11 },
  // Cielo
  { animalId:"A-0087", animalNombre:"Cielo", categoria:"Vaca adulta", fecha:"01/10/2024", peso:482, bascula:"Gallagher W210", operador:"Luis Patiño", observaciones:"", condicionCorporal:3, variacion:null },
  { animalId:"A-0087", animalNombre:"Cielo", categoria:"Vaca adulta", fecha:"01/01/2025", peso:490, bascula:"Gallagher W210", operador:"Luis Patiño", observaciones:"", condicionCorporal:3, variacion:8 },
  { animalId:"A-0087", animalNombre:"Cielo", categoria:"Vaca adulta", fecha:"01/04/2025", peso:502, bascula:"Gallagher W210", operador:"Luis Patiño", observaciones:"Mejora post-parto", condicionCorporal:3, variacion:12 },
  // Niebla
  { animalId:"A-0445", animalNombre:"Niebla", categoria:"Vaca adulta", fecha:"01/10/2024", peso:490, bascula:"Tru-Test S3", operador:"Carlos Meza", observaciones:"", condicionCorporal:3, variacion:null },
  { animalId:"A-0445", animalNombre:"Niebla", categoria:"Vaca adulta", fecha:"01/04/2025", peso:505, bascula:"Tru-Test S3", operador:"Carlos Meza", observaciones:"", condicionCorporal:3, variacion:15 },
  // Palmera
  { animalId:"A-0133", animalNombre:"Palmera", categoria:"Vaca adulta", fecha:"01/10/2024", peso:472, bascula:"Gallagher W210", operador:"Luis Patiño", observaciones:"", condicionCorporal:3, variacion:null },
  { animalId:"A-0133", animalNombre:"Palmera", categoria:"Vaca adulta", fecha:"01/04/2025", peso:488, bascula:"Gallagher W210", operador:"Luis Patiño", observaciones:"Estable", condicionCorporal:3, variacion:16 },
  // Perla
  { animalId:"A-0712", animalNombre:"Perla", categoria:"Vaca adulta", fecha:"01/10/2024", peso:518, bascula:"Tru-Test S3", operador:"Carlos Meza", observaciones:"", condicionCorporal:4, variacion:null },
  { animalId:"A-0712", animalNombre:"Perla", categoria:"Vaca adulta", fecha:"01/04/2025", peso:510, bascula:"Tru-Test S3", operador:"Carlos Meza", observaciones:"Leve pérdida por tratamiento", condicionCorporal:3, variacion:-8 },
  // Canela
  { animalId:"A-0108", animalNombre:"Canela", categoria:"Vaca adulta", fecha:"01/10/2024", peso:485, bascula:"Gallagher W210", operador:"Luis Patiño", observaciones:"", condicionCorporal:3, variacion:null },
  { animalId:"A-0108", animalNombre:"Canela", categoria:"Vaca adulta", fecha:"01/04/2025", peso:498, bascula:"Gallagher W210", operador:"Luis Patiño", observaciones:"", condicionCorporal:3, variacion:13 },
  // Luna — Novilla
  { animalId:"A-0319", animalNombre:"Luna", categoria:"Novilla", fecha:"01/10/2024", peso:255, bascula:"Báscula portátil", operador:"Pedro Villa", observaciones:"Novilla en crecimiento", condicionCorporal:3, variacion:null },
  { animalId:"A-0319", animalNombre:"Luna", categoria:"Novilla", fecha:"01/01/2025", peso:272, bascula:"Báscula portátil", operador:"Pedro Villa", observaciones:"", condicionCorporal:3, variacion:17 },
  { animalId:"A-0319", animalNombre:"Luna", categoria:"Novilla", fecha:"01/04/2025", peso:287, bascula:"Báscula portátil", operador:"Pedro Villa", observaciones:"Buen desarrollo", condicionCorporal:3, variacion:15 },
  // Aurora — Novilla
  { animalId:"A-0551", animalNombre:"Aurora", categoria:"Novilla", fecha:"01/10/2024", peso:265, bascula:"Báscula portátil", operador:"Pedro Villa", observaciones:"", condicionCorporal:3, variacion:null },
  { animalId:"A-0551", animalNombre:"Aurora", categoria:"Novilla", fecha:"01/04/2025", peso:295, bascula:"Báscula portátil", operador:"Pedro Villa", observaciones:"", condicionCorporal:3, variacion:30 },
  // Tormenta — Novilla
  { animalId:"A-0215", animalNombre:"Tormenta", categoria:"Novilla", fecha:"01/10/2024", peso:280, bascula:"Báscula portátil", operador:"Pedro Villa", observaciones:"Gestante", condicionCorporal:3, variacion:null },
  { animalId:"A-0215", animalNombre:"Tormenta", categoria:"Novilla", fecha:"01/04/2025", peso:312, bascula:"Báscula portátil", operador:"Pedro Villa", observaciones:"Ganancia por gestación", condicionCorporal:4, variacion:32 },
  // Bravo — Toro
  { animalId:"A-0401", animalNombre:"Bravo", categoria:"Toro", fecha:"01/10/2024", peso:790, bascula:"Tru-Test S3", operador:"Carlos Meza", observaciones:"Pesaje semestral", condicionCorporal:4, variacion:null },
  { animalId:"A-0401", animalNombre:"Bravo", categoria:"Toro", fecha:"01/04/2025", peso:810, bascula:"Tru-Test S3", operador:"Carlos Meza", observaciones:"Excelente condición", condicionCorporal:4, variacion:20 },
  // Terneros
  { animalId:"A-0667", animalNombre:"Brisa", categoria:"Ternero", fecha:"01/01/2025", peso:45, bascula:"Báscula portátil", operador:"Luis Patiño", observaciones:"Nacimiento", condicionCorporal:3, variacion:null },
  { animalId:"A-0667", animalNombre:"Brisa", categoria:"Ternero", fecha:"01/04/2025", peso:72, bascula:"Báscula portátil", operador:"Luis Patiño", observaciones:"Buen desarrollo", condicionCorporal:3, variacion:27 },
  { animalId:"A-0512", animalNombre:"Manchas", categoria:"Ternero", fecha:"01/10/2024", peso:52, bascula:"Báscula portátil", operador:"Luis Patiño", observaciones:"", condicionCorporal:3, variacion:null },
  { animalId:"A-0512", animalNombre:"Manchas", categoria:"Ternero", fecha:"01/04/2025", peso:88, bascula:"Báscula portátil", operador:"Luis Patiño", observaciones:"", condicionCorporal:3, variacion:36 },
];

// Seed endpoint — inserts initial data if tables are empty, or resets on force
router.post("/seed", async (req, res) => {
  try {
    const force = req.body?.force === true;

    const existingAnimals = await db.select().from(animalsTable).limit(1);
    const isEmpty = force || existingAnimals.length === 0;

    if (isEmpty) {
      await db.delete(pesajeTable);
      await db.delete(animalsTable);
      await db.delete(potrerosTable);
      await db.delete(insumosTable);
      await db.delete(personalTable);
      await db.delete(reproduccionTable);
      await db.delete(alertasTable);

      await db.insert(animalsTable).values(ANIMALS);
      await db.insert(potrerosTable).values(POTREROS);
      await db.insert(insumosTable).values(INSUMOS);
      await db.insert(personalTable).values(PERSONAL);
      await db.insert(reproduccionTable).values(REPRODUCCION);
      await db.insert(alertasTable).values(ALERTAS);
      await db.insert(pesajeTable).values(PESAJE);
    }

    res.json({ ok: true, seeded: isEmpty });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
