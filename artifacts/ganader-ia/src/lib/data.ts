import React, { createContext, useContext, useState, useCallback, useEffect, createElement } from "react";
import { syncEngine } from "./sync";

// ─── Initial Seed Data — CIVAC PRO v3.0 ─────────────────────────────────────

export const initialAnimals = [
  // Lote A — Vacas en Producción
  { id:"A-0042", nombre:"Rosaura",   raza:"Holstein",   categoria:"Vaca adulta", peso:520, lote:"Lote A", estado:"Producción", litrosDia:18.4, partos:4, fechaNacimiento:"2020-03-15", registro:"SI", numeroRegistro:"REG-0042", valorKilo:0 },
  { id:"A-0604", nombre:"Estrella",  raza:"Holstein",   categoria:"Vaca adulta", peso:535, lote:"Lote A", estado:"Producción", litrosDia:17.8, partos:3, fechaNacimiento:"2021-06-10", registro:"SI", numeroRegistro:"REG-0604", valorKilo:0 },
  { id:"A-0087", nombre:"Cielo",     raza:"Simmental",  categoria:"Vaca adulta", peso:502, lote:"Lote A", estado:"Producción", litrosDia:16.9, partos:3, fechaNacimiento:"2021-01-20", registro:"NO", numeroRegistro:"", valorKilo:0 },
  { id:"A-0712", nombre:"Perla",     raza:"Holstein",   categoria:"Vaca adulta", peso:510, lote:"Lote A", estado:"Tratamiento",litrosDia:12.1, partos:2, fechaNacimiento:"2022-05-08", registro:"SI", numeroRegistro:"REG-0712", valorKilo:0 },
  { id:"A-0188", nombre:"Diamante",  raza:"Holstein",   categoria:"Vaca adulta", peso:528, lote:"Lote A", estado:"Producción", litrosDia:17.2, partos:3, fechaNacimiento:"2021-09-22", registro:"NO", numeroRegistro:"", valorKilo:0 },
  { id:"A-0394", nombre:"Nube",      raza:"Simmental",  categoria:"Vaca adulta", peso:495, lote:"Lote A", estado:"Producción", litrosDia:15.6, partos:2, fechaNacimiento:"2022-03-11", registro:"NO", numeroRegistro:"", valorKilo:0 },
  // Lote B — Vacas en Producción
  { id:"A-0445", nombre:"Niebla",    raza:"Holstein",   categoria:"Vaca adulta", peso:505, lote:"Lote B", estado:"Producción", litrosDia:15.8, partos:3, fechaNacimiento:"2021-07-30", registro:"SI", numeroRegistro:"REG-0445", valorKilo:0 },
  { id:"A-0133", nombre:"Palmera",   raza:"Gyr X",      categoria:"Vaca adulta", peso:488, lote:"Lote B", estado:"Producción", litrosDia:15.2, partos:2, fechaNacimiento:"2022-02-14", registro:"NO", numeroRegistro:"", valorKilo:0 },
  { id:"A-0108", nombre:"Canela",    raza:"Brahman",    categoria:"Vaca adulta", peso:498, lote:"Lote B", estado:"Seca",       litrosDia:0,    partos:5, fechaNacimiento:"2019-11-05", registro:"SI", numeroRegistro:"REG-0108", valorKilo:0 },
  { id:"A-0560", nombre:"Fortuna",   raza:"Jersey",     categoria:"Vaca adulta", peso:412, lote:"Lote B", estado:"Producción", litrosDia:14.8, partos:2, fechaNacimiento:"2022-08-17", registro:"NO", numeroRegistro:"", valorKilo:0 },
  { id:"A-0273", nombre:"Selva",     raza:"Gyr X",      categoria:"Vaca adulta", peso:476, lote:"Lote B", estado:"Producción", litrosDia:13.9, partos:2, fechaNacimiento:"2022-01-25", registro:"NO", numeroRegistro:"", valorKilo:0 },
  { id:"A-0819", nombre:"Copete",    raza:"Holstein",   categoria:"Vaca adulta", peso:518, lote:"Lote B", estado:"Gestante",   litrosDia:10.4, partos:3, fechaNacimiento:"2021-04-02", registro:"SI", numeroRegistro:"REG-0819", valorKilo:0 },
  // Lote C — Novillas
  { id:"A-0319", nombre:"Luna",      raza:"Simmental",  categoria:"Novilla", peso:287, lote:"Lote C", estado:"Abierta",  litrosDia:0, partos:0, fechaNacimiento:"2023-06-18", registro:"NO", numeroRegistro:"", valorKilo:0 },
  { id:"A-0551", nombre:"Aurora",    raza:"Holstein",   categoria:"Novilla", peso:295, lote:"Lote C", estado:"Abierta",  litrosDia:0, partos:0, fechaNacimiento:"2023-08-09", registro:"NO", numeroRegistro:"", valorKilo:0 },
  { id:"A-0215", nombre:"Tormenta",  raza:"Gyr",        categoria:"Novilla", peso:312, lote:"Lote C", estado:"Gestante", litrosDia:0, partos:0, fechaNacimiento:"2023-03-22", registro:"SI", numeroRegistro:"REG-0215", valorKilo:0 },
  { id:"A-0466", nombre:"Brisa",     raza:"Holstein",   categoria:"Novilla", peso:278, lote:"Lote C", estado:"Abierta",  litrosDia:0, partos:0, fechaNacimiento:"2023-10-01", registro:"NO", numeroRegistro:"", valorKilo:0 },
  { id:"A-0700", nombre:"Princesa",  raza:"Simmental",  categoria:"Novilla", peso:301, lote:"Lote C", estado:"Abierta",  litrosDia:0, partos:0, fechaNacimiento:"2023-05-14", registro:"NO", numeroRegistro:"", valorKilo:0 },
  { id:"A-0388", nombre:"Galaxia",   raza:"Gyr X",      categoria:"Novilla", peso:318, lote:"Lote C", estado:"Gestante", litrosDia:0, partos:0, fechaNacimiento:"2023-01-30", registro:"NO", numeroRegistro:"", valorKilo:0 },
  // Lote D — Toros
  { id:"A-0401", nombre:"Bravo",     raza:"Brahman",    categoria:"Toro", peso:810, lote:"Lote D", estado:"Activo",  litrosDia:0, partos:0, fechaNacimiento:"2019-07-12", registro:"SI", numeroRegistro:"REG-0401", valorKilo:0 },
  { id:"A-0622", nombre:"Titan",     raza:"Simmental",  categoria:"Toro", peso:875, lote:"Lote D", estado:"Activo",  litrosDia:0, partos:0, fechaNacimiento:"2018-12-01", registro:"SI", numeroRegistro:"REG-0622", valorKilo:0 },
  { id:"A-0755", nombre:"Colosal",   raza:"Brahman",    categoria:"Toro", peso:798, lote:"Lote D", estado:"Activo",  litrosDia:0, partos:0, fechaNacimiento:"2020-02-28", registro:"SI", numeroRegistro:"REG-0755", valorKilo:0 },
  // Lote E — Terneros/as
  { id:"A-0667", nombre:"Manchas",   raza:"Holstein",   categoria:"Ternero", peso:88,  lote:"Lote E", estado:"Destete",  litrosDia:0, partos:0, fechaNacimiento:"2024-09-10", registro:"NO", numeroRegistro:"", valorKilo:0 },
  { id:"A-0512", nombre:"Pulgarcito",raza:"Brahman",    categoria:"Ternero", peso:72,  lote:"Lote E", estado:"Destete",  litrosDia:0, partos:0, fechaNacimiento:"2024-11-03", registro:"NO", numeroRegistro:"", valorKilo:0 },
  { id:"A-0844", nombre:"Cariño",    raza:"Simmental",  categoria:"Ternera", peso:65,  lote:"Lote E", estado:"Lactancia",litrosDia:0, partos:0, fechaNacimiento:"2026-01-15", registro:"NO", numeroRegistro:"", valorKilo:0 },
  { id:"A-0901", nombre:"Florita",   raza:"Holstein",   categoria:"Ternera", peso:79,  lote:"Lote E", estado:"Destete",  litrosDia:0, partos:0, fechaNacimiento:"2024-10-20", registro:"NO", numeroRegistro:"", valorKilo:0 },
  { id:"A-0963", nombre:"Copito",    raza:"Gyr X",      categoria:"Ternero", peso:58,  lote:"Lote E", estado:"Lactancia",litrosDia:0, partos:0, fechaNacimiento:"2026-02-08", registro:"NO", numeroRegistro:"", valorKilo:0 },
  // Lote F — Animales Secos / Secado
  { id:"A-0334", nombre:"Victoria",  raza:"Holstein",   categoria:"Vaca adulta", peso:540, lote:"Lote F", estado:"Seca",    litrosDia:0,   partos:6, fechaNacimiento:"2018-04-25", registro:"SI", numeroRegistro:"REG-0334", valorKilo:0 },
  { id:"A-0480", nombre:"Mariposa",  raza:"Jersey",     categoria:"Vaca adulta", peso:408, lote:"Lote F", estado:"Gestante",litrosDia:0,   partos:4, fechaNacimiento:"2020-08-13", registro:"SI", numeroRegistro:"REG-0480", valorKilo:0 },
  { id:"A-0531", nombre:"Esperanza", raza:"Holstein",   categoria:"Vaca adulta", peso:512, lote:"Lote F", estado:"Gestante",litrosDia:6.2, partos:5, fechaNacimiento:"2019-06-30", registro:"SI", numeroRegistro:"REG-0531", valorKilo:0 },
  { id:"A-0150", nombre:"Libertad",  raza:"Simmental",  categoria:"Vaca adulta", peso:488, lote:"Lote F", estado:"Seca",    litrosDia:0,   partos:3, fechaNacimiento:"2020-12-18", registro:"NO", numeroRegistro:"", valorKilo:0 },
];

export const initialPotreros = [
  { id:1, nombre:"Potrero Norte",    pasto:"Kikuyo",       hectareas:4.5, estado:"Ocupado",      diasOcupado:6,  diasRotacion:30, animales:22 },
  { id:2, nombre:"Potrero Sur",      pasto:"Raigrás",      hectareas:3.8, estado:"Descanso",     diasDescanso:8, diasRotacion:22, animales:0  },
  { id:3, nombre:"Potrero Central",  pasto:"Brachiaria",   hectareas:5.1, estado:"Ocupado",      diasOcupado:14, diasRotacion:34, animales:20 },
  { id:4, nombre:"Potrero Este",     pasto:"Estrella",     hectareas:4.2, estado:"Rotar pronto", diasRestantes:3,diasRotacion:28, animales:26 },
  { id:5, nombre:"Potrero Ladera",   pasto:"Pasto nativo", hectareas:6.0, estado:"Disponible",   diasDescanso:21,diasRotacion:35, animales:0  },
  { id:6, nombre:"Potrero Bajo",     pasto:"Kikuyo",       hectareas:3.5, estado:"Ocupado",      diasOcupado:18, diasRotacion:23, animales:22 },
  { id:7, nombre:"Potrero Alto",     pasto:"Penisetum",    hectareas:4.8, estado:"Descanso",     diasDescanso:15,diasRotacion:30, animales:0  },
  { id:8, nombre:"Potrero Maternidad",pasto:"Kikuyo",      hectareas:2.2, estado:"Ocupado",      diasOcupado:4,  diasRotacion:15, animales:8  },
];

export const initialInsumos = [
  { nombre:"Sal mineralizada",   categoria:"Alimentacion",  stock:180, maximo:300, minimo:60,  unidad:"kg" },
  { nombre:"Concentrado 16%",    categoria:"Alimentacion",  stock:1200,maximo:2000,minimo:400, unidad:"kg" },
  { nombre:"Heno de raigrás",    categoria:"Alimentacion",  stock:850, maximo:2000,minimo:500, unidad:"kg" },
  { nombre:"Melaza",             categoria:"Alimentacion",  stock:240, maximo:500, minimo:100, unidad:"kg" },
  { nombre:"Prostaglandina",     categoria:"Reproductivo",  stock:8,   maximo:30,  minimo:15,  unidad:"frascos" },
  { nombre:"Oxitocina 10UI",     categoria:"Reproductivo",  stock:3,   maximo:30,  minimo:10,  unidad:"frascos" },
  { nombre:"GnRH (Cystorelin)",  categoria:"Reproductivo",  stock:12,  maximo:40,  minimo:10,  unidad:"dosis" },
  { nombre:"Calcio i.v.",        categoria:"Mineral",       stock:6,   maximo:25,  minimo:12,  unidad:"frascos" },
  { nombre:"Fósforo inyectable", categoria:"Mineral",       stock:14,  maximo:30,  minimo:10,  unidad:"frascos" },
  { nombre:"Antibiótico L.A.",   categoria:"Antibiotico",   stock:18,  maximo:30,  minimo:10,  unidad:"jeringas" },
  { nombre:"Penicilina 4M",      categoria:"Antibiotico",   stock:24,  maximo:50,  minimo:15,  unidad:"frascos" },
  { nombre:"Vacuna IBR/BVD",     categoria:"Biologico",     stock:180, maximo:500, minimo:250, unidad:"dosis" },
  { nombre:"Vacuna Carbón",      categoria:"Biologico",     stock:95,  maximo:200, minimo:100, unidad:"dosis" },
  { nombre:"Ivermectina 1%",     categoria:"Antiparasitario",stock:12, maximo:40,  minimo:10,  unidad:"frascos" },
  { nombre:"Albendazol 10%",     categoria:"Antiparasitario",stock:28, maximo:60,  minimo:15,  unidad:"frascos" },
  { nombre:"Diclofenac 5%",      categoria:"Antiinflamatorio",stock:9, maximo:20,  minimo:8,   unidad:"frascos" },
  { nombre:"Flunixin megl.",     categoria:"Antiinflamatorio",stock:5, maximo:20,  minimo:8,   unidad:"frascos" },
  { nombre:"Desinfectante yodo", categoria:"Sanidad",       stock:8,   maximo:20,  minimo:5,   unidad:"L" },
];

export const initialPersonal = [
  { nombre:"Carlos Meza",    cargo:"Vaquero jefe",    cedula:"0801-1985-12345", ingreso:"01/03/2020", salario:1600000, hExtras:8,  eps:"Sanitas",    arl:"Positiva" },
  { nombre:"Luis Patiño",    cargo:"Ordeñador",       cedula:"0801-1990-23456", ingreso:"15/06/2021", salario:1420000, hExtras:6,  eps:"Colsanitas", arl:"Sura" },
  { nombre:"Sandra Roa",     cargo:"Ordeñadora",      cedula:"0801-1992-34567", ingreso:"10/01/2022", salario:1420000, hExtras:4,  eps:"Sanitas",    arl:"Positiva" },
  { nombre:"Pedro Villa",    cargo:"Inseminador",     cedula:"0801-1983-45678", ingreso:"05/08/2019", salario:2100000, hExtras:12, eps:"Compensar",  arl:"Sura" },
  { nombre:"Ana Gómez",      cargo:"Administradora",  cedula:"0801-1986-56789", ingreso:"01/02/2020", salario:2800000, hExtras:0,  eps:"Colsanitas", arl:"Positiva" },
  { nombre:"Jorge Cruz",     cargo:"Mantenimiento",   cedula:"0801-1995-67890", ingreso:"20/09/2023", salario:1420000, hExtras:8,  eps:"Sanitas",    arl:"Sura" },
  { nombre:"Martha Ríos",    cargo:"Veterinaria",     cedula:"0801-1988-78901", ingreso:"12/04/2021", salario:3200000, hExtras:5,  eps:"Compensar",  arl:"Positiva" },
  { nombre:"Felipe Mora",    cargo:"Tractorista",     cedula:"0801-1991-89012", ingreso:"03/07/2022", salario:1550000, hExtras:10, eps:"Sanitas",    arl:"Sura" },
  { nombre:"Lucía Vargas",   cargo:"Auxiliar campo",  cedula:"0801-1997-90123", ingreso:"05/01/2024", salario:1300000, hExtras:4,  eps:"Colsanitas", arl:"Positiva" },
];

export const initialReproduccion = [
  { arete:"A-0042", animal:"Rosaura",   servicio:"IA Altísimo",  fechaParto:"10/05/2025", dias:11, partosPrev:4, estado:"Normal" },
  { arete:"A-0215", animal:"Tormenta",  servicio:"IA Furacao",   fechaParto:"18/05/2025", dias:19, partosPrev:0, estado:"Primipara" },
  { arete:"A-0087", animal:"Cielo",     servicio:"Monta natural",fechaParto:"22/05/2025", dias:23, partosPrev:2, estado:"Normal" },
  { arete:"A-0133", animal:"Palmera",   servicio:"IA Altísimo",  fechaParto:"01/06/2025", dias:33, partosPrev:3, estado:"Vigilar" },
  { arete:"A-0604", animal:"Estrella",  servicio:"IA Titan USA", fechaParto:"05/06/2025", dias:37, partosPrev:3, estado:"Normal" },
  { arete:"A-0388", animal:"Galaxia",   servicio:"IA Furacao",   fechaParto:"14/06/2025", dias:46, partosPrev:0, estado:"Primipara" },
  { arete:"A-0819", animal:"Copete",    servicio:"IA Altísimo",  fechaParto:"28/06/2025", dias:60, partosPrev:3, estado:"Normal" },
  { arete:"A-0480", animal:"Mariposa",  servicio:"Monta natural",fechaParto:"10/07/2025", dias:72, partosPrev:4, estado:"Normal" },
  { arete:"A-0531", animal:"Esperanza", servicio:"IA Titan USA", fechaParto:"22/07/2025", dias:84, partosPrev:5, estado:"Vigilar" },
];

export const initialAlertas = [
  { id:1,  title:"Potrero Este requiere rotación",     desc:"Días de ocupación superados — mover en 3 días",   type:"warning", time:"1h ago" },
  { id:2,  title:"Vaca Perla en tratamiento",          desc:"Antibiótico L.A. día 2/3 · Revisar temperatura",  type:"danger",  time:"3h ago" },
  { id:3,  title:"Stock bajo: Oxitocina 10UI",         desc:"3 frascos restantes (Mínimo: 10)",                type:"warning", time:"5h ago" },
  { id:4,  title:"Rosaura próximo parto",              desc:"Faltan 11 días — preparar maternidad",            type:"info",    time:"1d ago" },
  { id:5,  title:"Stock bajo: Prostaglandina",         desc:"8 frascos restantes (Mínimo: 15)",                type:"warning", time:"2h ago" },
  { id:6,  title:"GPS Perla sin señal",                desc:"Última señal hace 45 min — verificar dispositivo",type:"danger",  time:"45min ago" },
  { id:7,  title:"Flunixin meglumina crítico",         desc:"5 frascos restantes (Mínimo: 8) — pedir urgente", type:"danger",  time:"6h ago" },
  { id:8,  title:"Tormenta primípara vigilar",         desc:"Primera gestación · Faltan 19 días parto",        type:"info",    time:"12h ago" },
];

export const initialPesajes = [
  { id:1,  animalId:"A-0042", animalNombre:"Rosaura",    peso:520, pesoAnterior:516, fecha:"09/05/2025", hora:"07:30", metodo:"bluetooth", dispositivo:"Tru-Test XR3000", operador:"Carlos Meza", observacion:"Peso estable, buena condición corporal", lote:"Lote A", categoria:"Vaca adulta" },
  { id:2,  animalId:"A-0604", animalNombre:"Estrella",   peso:535, pesoAnterior:530, fecha:"09/05/2025", hora:"07:45", metodo:"bluetooth", dispositivo:"Tru-Test XR3000", operador:"Carlos Meza", observacion:"Excelente condición corporal CC4", lote:"Lote A", categoria:"Vaca adulta" },
  { id:3,  animalId:"A-0087", animalNombre:"Cielo",      peso:502, pesoAnterior:498, fecha:"09/05/2025", hora:"08:00", metodo:"manual",    dispositivo:"", operador:"Luis Patiño", observacion:"Pesaje manual báscula corriente", lote:"Lote A", categoria:"Vaca adulta" },
  { id:4,  animalId:"A-0401", animalNombre:"Bravo",      peso:810, pesoAnterior:805, fecha:"08/05/2025", hora:"09:15", metodo:"bluetooth", dispositivo:"Tru-Test XR3000", operador:"Carlos Meza", observacion:"Toro en excelente condición corporal", lote:"Lote D", categoria:"Toro" },
  { id:5,  animalId:"A-0667", animalNombre:"Manchas",    peso:88,  pesoAnterior:82,  fecha:"08/05/2025", hora:"10:00", metodo:"manual",    dispositivo:"", operador:"Luis Patiño", observacion:"Buen desarrollo ternero", lote:"Lote E", categoria:"Ternero" },
  { id:6,  animalId:"A-0512", animalNombre:"Pulgarcito", peso:72,  pesoAnterior:67,  fecha:"07/05/2025", hora:"10:20", metodo:"manual",    dispositivo:"", operador:"Luis Patiño", observacion:"", lote:"Lote E", categoria:"Ternero" },
  { id:7,  animalId:"A-0445", animalNombre:"Niebla",     peso:505, pesoAnterior:500, fecha:"07/05/2025", hora:"07:30", metodo:"bluetooth", dispositivo:"Gallagher W210", operador:"Carlos Meza", observacion:"", lote:"Lote B", categoria:"Vaca adulta" },
  { id:8,  animalId:"A-0133", animalNombre:"Palmera",    peso:488, pesoAnterior:483, fecha:"06/05/2025", hora:"08:00", metodo:"bluetooth", dispositivo:"Gallagher W210", operador:"Carlos Meza", observacion:"Peso gestante, normal", lote:"Lote B", categoria:"Vaca adulta" },
  { id:9,  animalId:"A-0319", animalNombre:"Luna",       peso:287, pesoAnterior:281, fecha:"06/05/2025", hora:"08:30", metodo:"manual",    dispositivo:"", operador:"Pedro Villa", observacion:"Ganancia de peso correcta", lote:"Lote C", categoria:"Novilla" },
  { id:10, animalId:"A-0622", animalNombre:"Titan",      peso:875, pesoAnterior:869, fecha:"05/05/2025", hora:"09:00", metodo:"bluetooth", dispositivo:"Tru-Test XR3000", operador:"Carlos Meza", observacion:"Toro sementral excelente CC", lote:"Lote D", categoria:"Toro" },
  { id:11, animalId:"A-0188", animalNombre:"Diamante",   peso:528, pesoAnterior:523, fecha:"05/05/2025", hora:"07:45", metodo:"bluetooth", dispositivo:"Tru-Test XR3000", operador:"Carlos Meza", observacion:"", lote:"Lote A", categoria:"Vaca adulta" },
  { id:12, animalId:"A-0560", animalNombre:"Fortuna",    peso:412, pesoAnterior:407, fecha:"04/05/2025", hora:"08:15", metodo:"manual",    dispositivo:"", operador:"Luis Patiño", observacion:"Jersey buen peso", lote:"Lote B", categoria:"Vaca adulta" },
  { id:13, animalId:"A-0712", animalNombre:"Perla",      peso:510, pesoAnterior:506, fecha:"04/05/2025", hora:"09:00", metodo:"bluetooth", dispositivo:"Tru-Test XR3000", operador:"Martha Ríos", observacion:"Animal en tratamiento, monitoreo continuo", lote:"Lote A", categoria:"Vaca adulta" },
  { id:14, animalId:"A-0215", animalNombre:"Tormenta",   peso:312, pesoAnterior:306, fecha:"03/05/2025", hora:"08:45", metodo:"manual",    dispositivo:"", operador:"Pedro Villa", observacion:"Novilla gestante, peso correcto", lote:"Lote C", categoria:"Novilla" },
  { id:15, animalId:"A-0755", animalNombre:"Colosal",    peso:798, pesoAnterior:793, fecha:"02/05/2025", hora:"09:30", metodo:"bluetooth", dispositivo:"AHI Caroplus 2", operador:"Carlos Meza", observacion:"Buen estado corporal", lote:"Lote D", categoria:"Toro" },
  { id:16, animalId:"A-0042", animalNombre:"Rosaura",    peso:516, pesoAnterior:512, fecha:"22/04/2025", hora:"07:30", metodo:"bluetooth", dispositivo:"Tru-Test XR3000", operador:"Carlos Meza", observacion:"Semana 3 — ganancia 4 kg", lote:"Lote A", categoria:"Vaca adulta" },
  { id:17, animalId:"A-0604", animalNombre:"Estrella",   peso:530, pesoAnterior:526, fecha:"22/04/2025", hora:"07:45", metodo:"bluetooth", dispositivo:"Tru-Test XR3000", operador:"Carlos Meza", observacion:"", lote:"Lote A", categoria:"Vaca adulta" },
  { id:18, animalId:"A-0087", animalNombre:"Cielo",      peso:498, pesoAnterior:494, fecha:"22/04/2025", hora:"08:00", metodo:"manual",    dispositivo:"", operador:"Luis Patiño", observacion:"", lote:"Lote A", categoria:"Vaca adulta" },
  { id:19, animalId:"A-0401", animalNombre:"Bravo",      peso:805, pesoAnterior:800, fecha:"21/04/2025", hora:"09:15", metodo:"bluetooth", dispositivo:"Tru-Test XR3000", operador:"Carlos Meza", observacion:"Toro peso estable", lote:"Lote D", categoria:"Toro" },
  { id:20, animalId:"A-0622", animalNombre:"Titan",      peso:869, pesoAnterior:863, fecha:"21/04/2025", hora:"09:00", metodo:"bluetooth", dispositivo:"Tru-Test XR3000", operador:"Carlos Meza", observacion:"Recuperación post-servicio", lote:"Lote D", categoria:"Toro" },
];

export const initialGps = [
  { id:"G-001", animalId:"A-0042", nombre:"Rosaura",  lat:4.9876, lng:-74.0312, potreroId:1, potreroNom:"Potrero Norte",  activo:true,  bateria:87, ultimaSenal:"09/05/2025 07:45", dispositivo:"GPS-Collar-01", estado:"OK"        },
  { id:"G-002", animalId:"A-0622", nombre:"Titan",    lat:4.9901, lng:-74.0287, potreroId:3, potreroNom:"Potrero Central",activo:true,  bateria:74, ultimaSenal:"09/05/2025 07:30", dispositivo:"GPS-Collar-02", estado:"OK"        },
  { id:"G-003", animalId:"A-0712", nombre:"Perla",    lat:4.9845, lng:-74.0334, potreroId:1, potreroNom:"Potrero Norte",  activo:false, bateria:12, ultimaSenal:"09/05/2025 06:00", dispositivo:"GPS-Collar-03", estado:"Sin señal" },
  { id:"G-004", animalId:"A-0401", nombre:"Bravo",    lat:4.9923, lng:-74.0301, potreroId:7, potreroNom:"Potrero Alto",   activo:true,  bateria:91, ultimaSenal:"09/05/2025 07:50", dispositivo:"GPS-Collar-04", estado:"OK"        },
  { id:"G-005", animalId:"A-0319", nombre:"Luna",     lat:4.9867, lng:-74.0298, potreroId:2, potreroNom:"Potrero Sur",    activo:true,  bateria:55, ultimaSenal:"09/05/2025 07:20", dispositivo:"GPS-Collar-05", estado:"OK"        },
  { id:"G-006", animalId:"A-0604", nombre:"Estrella", lat:4.9880, lng:-74.0318, potreroId:1, potreroNom:"Potrero Norte",  activo:true,  bateria:63, ultimaSenal:"09/05/2025 07:48", dispositivo:"GPS-Collar-06", estado:"OK"        },
  { id:"G-007", animalId:"A-0087", nombre:"Cielo",    lat:4.9872, lng:-74.0325, potreroId:1, potreroNom:"Potrero Norte",  activo:true,  bateria:45, ultimaSenal:"09/05/2025 07:35", dispositivo:"GPS-Collar-07", estado:"OK"        },
  { id:"G-008", animalId:"A-0215", nombre:"Tormenta", lat:4.9859, lng:-74.0295, potreroId:3, potreroNom:"Potrero Central",activo:true,  bateria:82, ultimaSenal:"09/05/2025 07:52", dispositivo:"GPS-Collar-08", estado:"OK"        },
];

export const initialLotes: MovimientoLote[] = [];

// ─── Semen & Embriones (Cryo Bank) ───────────────────────────────────────────

export const initialSemen = [
  { id:'S-001', toro:'Altísimo IA',   raza:'Holstein', dep:'+820L', canecas:2, pajillas:24, origen:'Canadá',   tipo:'Convencional', cria:2026 },
  { id:'S-002', toro:'El Campeón',    raza:'Gyr',      dep:'+680L', canecas:1, pajillas:12, origen:'Brasil',   tipo:'Sexado',       cria:2025 },
  { id:'S-003', toro:'Montana Star',  raza:'Angus',    dep:'+540kg',canecas:1, pajillas:8,  origen:'EE.UU.',   tipo:'Convencional', cria:2025 },
  { id:'S-004', toro:'Brahman Royal', raza:'Brahman',  dep:'+410L', canecas:1, pajillas:18, origen:'Colombia', tipo:'Convencional', cria:2024 },
];

export const initialEmbriones = [
  { id:'E-001', donante:'Rosaura A-0042',  receptor:'Perla A-0712',    fecha:'15/03/2025', estado:'Transferido',         raza:'Holstein' },
  { id:'E-002', donante:'Estrella A-0604', receptor:'Canela A-0108',   fecha:'28/03/2025', estado:'En criopreservación', raza:'Holstein' },
  { id:'E-003', donante:'Rosaura A-0042',  receptor:'—',               fecha:'10/04/2025', estado:'En criopreservación', raza:'Holstein' },
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
      const stored = localStorage.getItem(`civac_${key}`);
      return stored ? JSON.parse(stored) : initial;
    } catch { return initial; }
  });

  const setPersisted = useCallback((action: React.SetStateAction<T>) => {
    setState(prev => {
      const next = typeof action === "function" ? (action as (p: T) => T)(prev) : action;
      try {
        localStorage.setItem(`civac_${key}`, JSON.stringify(next));
        localStorage.setItem('civac_last_write', new Date().toISOString());
      } catch { /* storage full */ }
      return next;
    });
  }, [key]) as React.Dispatch<React.SetStateAction<T>>;

  return [state, setPersisted];
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Animal {
  id: string;
  nombre: string;
  raza: string;
  categoria: string;
  peso: number;
  lote: string;
  estado: string;
  litrosDia: number;
  partos: number;
  fechaNacimiento: string;
  registro: string;
  numeroRegistro: string;
  valorKilo: number;
  foto?: string;
}

export interface Potrero {
  id: number;
  nombre: string;
  pasto: string;
  hectareas: number;
  estado: string;
  diasOcupado?: number;
  diasDescanso?: number;
  diasRestantes?: number;
  diasRotacion: number;
  animales: number;
  capacidadMax?: number;
  aforo?: number;
  observaciones?: string;
}

export interface Pesaje {
  id: number;
  animalId: string;
  animalNombre: string;
  peso: number;
  pesoAnterior: number;
  fecha: string;
  hora: string;
  metodo: string;
  dispositivo: string;
  operador: string;
  observacion: string;
  lote: string;
  categoria: string;
  raza?: string;
  condicionCorporal?: string | number;
  temperatura?: string | number;
  estadoSanitario?: string;
  potreroActual?: string;
  observacionVet?: string;
  proximaVacuna?: string;
  valorKilo?: number;
  valorTotal?: number;
  iaScore?: number;
}

export type Insumo          = typeof initialInsumos[0];
export type Personal        = typeof initialPersonal[0];
export type Reproduccion    = typeof initialReproduccion[0];
export type Alerta          = typeof initialAlertas[0];
export type GpsUbicacion    = typeof initialGps[0];
export type SemenRecord     = typeof initialSemen[0];
export type EmbrionRecord   = typeof initialEmbriones[0];

export interface MovimientoLote {
  id: number;
  tipo: string;
  nombreLote: string;
  cantidadAnimales: number;
  pesoTotalLote: number;
  promedioPesoAnimal: number;
  costoKilo: number;
  valorTotalLote: number;
  fecha: string;
  notas: string;
  reciboGenerado: boolean;
  proveedor: string;
  destino: string;
}

// ─── App State Context ────────────────────────────────────────────────────────

interface AppStateType {
  animals: Animal[];                setAnimals: React.Dispatch<React.SetStateAction<Animal[]>>;
  potreros: Potrero[];              setPotreros: React.Dispatch<React.SetStateAction<Potrero[]>>;
  insumos: Insumo[];                setInsumos: React.Dispatch<React.SetStateAction<Insumo[]>>;
  personal: Personal[];             setPersonal: React.Dispatch<React.SetStateAction<Personal[]>>;
  reproduccion: Reproduccion[];     setReproduccion: React.Dispatch<React.SetStateAction<Reproduccion[]>>;
  alertas: Alerta[];                setAlertas: React.Dispatch<React.SetStateAction<Alerta[]>>;
  pesajes: Pesaje[];                setPesajes: React.Dispatch<React.SetStateAction<Pesaje[]>>;
  gpsUbicaciones: GpsUbicacion[];   setGpsUbicaciones: React.Dispatch<React.SetStateAction<GpsUbicacion[]>>;
  lotes: MovimientoLote[];          setLotes: React.Dispatch<React.SetStateAction<MovimientoLote[]>>;
  semen: SemenRecord[];             setSemen: React.Dispatch<React.SetStateAction<SemenRecord[]>>;
  embriones: EmbrionRecord[];       setEmbriones: React.Dispatch<React.SetStateAction<EmbrionRecord[]>>;
  resetAll: () => void;
}

const AppStateContext = createContext<AppStateType | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [animals,       _setAnimals]       = useLocal('animals',       initialAnimals);
  const [potreros,      _setPotreros]      = useLocal<Potrero[]>('potreros',      initialPotreros);
  const [insumos,       _setInsumos]       = useLocal('insumos',       initialInsumos);
  const [personal,      _setPersonal]      = useLocal('personal',      initialPersonal);
  const [reproduccion,  _setReproduccion]  = useLocal('reproduccion',  initialReproduccion);
  const [alertas,       _setAlertas]       = useLocal('alertas',       initialAlertas);
  const [pesajes,       _setPesajes]       = useLocal('pesajes',       initialPesajes);
  const [gpsUbicaciones,_setGpsUbicaciones]= useLocal('gps',           initialGps);
  const [lotes,         _setLotes]         = useLocal<MovimientoLote[]>('lotes', initialLotes);
  const [semen,         _setSemen]         = useLocal('semen',         initialSemen);
  const [embriones,     _setEmbriones]     = useLocal('embriones',     initialEmbriones);

  useEffect(() => {
    // Cargar datos del servidor al iniciar (si está online)
    apiGet<Animal[]>("/animals").then(data => { if (data && data.length > 0) _setAnimals(data); }).catch(() => {});
    apiGet<Potrero[]>("/potreros").then(data => { if (data && data.length > 0) _setPotreros(data); }).catch(() => {});
    apiGet<Insumo[]>("/insumos").then(data => { if (data && data.length > 0) _setInsumos(data); }).catch(() => {});
    apiGet<Personal[]>("/personal").then(data => { if (data && data.length > 0) _setPersonal(data); }).catch(() => {});
    apiGet<Reproduccion[]>("/reproduccion").then(data => { if (data && data.length > 0) _setReproduccion(data); }).catch(() => {});
    apiGet<Alerta[]>("/alertas").then(data => { if (data && data.length > 0) _setAlertas(data); }).catch(() => {});
    apiGet<Pesaje[]>("/pesajes").then(data => { if (data && data.length > 0) _setPesajes(data); }).catch(() => {});
    apiGet<GpsUbicacion[]>("/gps").then(data => { if (data && data.length > 0) _setGpsUbicaciones(data); }).catch(() => {});
    apiGet<MovimientoLote[]>("/lotes").then(data => { if (data) _setLotes(data); }).catch(() => {});

    // Escuchar cuando el SyncEngine aplique datos del servidor → actualizar React state
    const handleServerSync = (e: Event) => {
      const d = (e as CustomEvent).detail as Record<string, unknown[]>;
      if (d["animals"]?.length)      _setAnimals(d["animals"] as Animal[]);
      if (d["potreros"]?.length)     _setPotreros(d["potreros"] as Potrero[]);
      if (d["insumos"]?.length)      _setInsumos(d["insumos"] as Insumo[]);
      if (d["personal"]?.length)     _setPersonal(d["personal"] as Personal[]);
      if (d["reproduccion"]?.length) _setReproduccion(d["reproduccion"] as Reproduccion[]);
      if (d["alertas"]?.length)      _setAlertas(d["alertas"] as Alerta[]);
      if (d["pesajes"]?.length)      _setPesajes(d["pesajes"] as Pesaje[]);
      if (d["gps"]?.length)          _setGpsUbicaciones(d["gps"] as GpsUbicacion[]);
      if (d["lotes"]?.length)        _setLotes(d["lotes"] as MovimientoLote[]);
    };
    window.addEventListener('civac:server-sync', handleServerSync);

    // Sync inicial diferido (deja que la app cargue primero)
    const t = setTimeout(() => syncEngine.flush(), 3000);

    return () => {
      window.removeEventListener('civac:server-sync', handleServerSync);
      clearTimeout(t);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setAnimals = useCallback((action: React.SetStateAction<Animal[]>) => {
    _setAnimals(prev => {
      const next = typeof action === "function" ? (action as (p: Animal[]) => Animal[])(prev) : action;
      apiPost("/animals/bulk", { animals: next });
      syncEngine.markPending();
      return next;
    });
  }, [_setAnimals]);

  const setPotreros = useCallback((action: React.SetStateAction<Potrero[]>) => {
    _setPotreros(prev => {
      const next = typeof action === "function" ? (action as (p: Potrero[]) => Potrero[])(prev) : action;
      apiPost("/potreros/bulk", { potreros: next });
      syncEngine.markPending();
      return next;
    });
  }, [_setPotreros]);

  const setInsumos = useCallback((action: React.SetStateAction<Insumo[]>) => {
    _setInsumos(prev => {
      const next = typeof action === "function" ? (action as (p: Insumo[]) => Insumo[])(prev) : action;
      apiPost("/insumos/bulk", { insumos: next });
      syncEngine.markPending();
      return next;
    });
  }, [_setInsumos]);

  const setPersonal = useCallback((action: React.SetStateAction<Personal[]>) => {
    _setPersonal(prev => {
      const next = typeof action === "function" ? (action as (p: Personal[]) => Personal[])(prev) : action;
      apiPost("/personal/bulk", { personal: next });
      syncEngine.markPending();
      return next;
    });
  }, [_setPersonal]);

  const setReproduccion = useCallback((action: React.SetStateAction<Reproduccion[]>) => {
    _setReproduccion(prev => {
      const next = typeof action === "function" ? (action as (p: Reproduccion[]) => Reproduccion[])(prev) : action;
      apiPost("/reproduccion/bulk", { reproduccion: next });
      syncEngine.markPending();
      return next;
    });
  }, [_setReproduccion]);

  const setAlertas = useCallback((action: React.SetStateAction<Alerta[]>) => {
    _setAlertas(prev => {
      const next = typeof action === "function" ? (action as (p: Alerta[]) => Alerta[])(prev) : action;
      apiPost("/alertas/bulk", { alertas: next });
      syncEngine.markPending();
      return next;
    });
  }, [_setAlertas]);

  const setPesajes = useCallback((action: React.SetStateAction<Pesaje[]>) => {
    _setPesajes(prev => {
      const next = typeof action === "function" ? (action as (p: Pesaje[]) => Pesaje[])(prev) : action;
      apiPost("/pesajes/bulk", { pesajes: next });
      syncEngine.markPending();
      return next;
    });
  }, [_setPesajes]);

  const setGpsUbicaciones = useCallback((action: React.SetStateAction<GpsUbicacion[]>) => {
    _setGpsUbicaciones(prev => {
      const next = typeof action === "function" ? (action as (p: GpsUbicacion[]) => GpsUbicacion[])(prev) : action;
      apiPost("/gps/bulk", { ubicaciones: next });
      syncEngine.markPending();
      return next;
    });
  }, [_setGpsUbicaciones]);

  const setLotes = useCallback((action: React.SetStateAction<MovimientoLote[]>) => {
    _setLotes(prev => {
      const next = typeof action === "function" ? (action as (p: MovimientoLote[]) => MovimientoLote[])(prev) : action;
      apiPost("/lotes/bulk", { lotes: next });
      syncEngine.markPending();
      return next;
    });
  }, [_setLotes]);

  const setSemen = useCallback((action: React.SetStateAction<SemenRecord[]>) => {
    _setSemen(prev => {
      const next = typeof action === "function" ? (action as (p: SemenRecord[]) => SemenRecord[])(prev) : action;
      return next;
    });
  }, [_setSemen]);

  const setEmbriones = useCallback((action: React.SetStateAction<EmbrionRecord[]>) => {
    _setEmbriones(prev => {
      const next = typeof action === "function" ? (action as (p: EmbrionRecord[]) => EmbrionRecord[])(prev) : action;
      return next;
    });
  }, [_setEmbriones]);

  const resetAll = useCallback(() => {
    _setAnimals(initialAnimals);
    _setPotreros(initialPotreros);
    _setInsumos(initialInsumos);
    _setPersonal(initialPersonal);
    _setReproduccion(initialReproduccion);
    _setAlertas(initialAlertas);
    _setPesajes(initialPesajes);
    _setGpsUbicaciones(initialGps);
    _setLotes(initialLotes);
    _setSemen(initialSemen);
    _setEmbriones(initialEmbriones);
    ['animals','potreros','insumos','personal','reproduccion','alertas','pesajes','gps','lotes','semen','embriones'].forEach(k => {
      try { localStorage.removeItem(`civac_${k}`); } catch { /* skip */ }
    });
    apiPost("/seed", {});
  }, [_setAnimals, _setPotreros, _setInsumos, _setPersonal, _setReproduccion, _setAlertas, _setPesajes, _setGpsUbicaciones, _setLotes, _setSemen, _setEmbriones]);

  return createElement(
    AppStateContext.Provider,
    { value: {
        animals, setAnimals,
        potreros, setPotreros,
        insumos, setInsumos,
        personal, setPersonal,
        reproduccion, setReproduccion,
        alertas, setAlertas,
        pesajes, setPesajes,
        gpsUbicaciones, setGpsUbicaciones,
        lotes, setLotes,
        semen, setSemen,
        embriones, setEmbriones,
        resetAll,
      }
    },
    children
  );
}

export const useAppState = (): AppStateType => {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
};
