import { Router } from "express";
import { randomUUID } from "crypto";
import { db, animalsTable, potrerosTable, insumosTable, personalTable,
  reproduccionTable, alertasTable, gpsUbicacionesTable, pesajesTable,
  plansTable, fincaConfigTable, usuariosTable, licenciasTable } from "@workspace/db";

const router = Router();

const ANIMALS = [
  { id:"A-0042", nombre:"Rosaura",    raza:"Holstein",  categoria:"Vaca adulta", peso:520, lote:"Lote A", estado:"Producción",  litrosDia:18.4, partos:4, fechaNacimiento:"2020-03-15", registro:"SI", numeroRegistro:"REG-0042", valorKilo:0 },
  { id:"A-0604", nombre:"Estrella",   raza:"Holstein",  categoria:"Vaca adulta", peso:535, lote:"Lote A", estado:"Producción",  litrosDia:17.8, partos:3, fechaNacimiento:"2021-06-10", registro:"SI", numeroRegistro:"REG-0604", valorKilo:0 },
  { id:"A-0087", nombre:"Cielo",      raza:"Simmental", categoria:"Vaca adulta", peso:502, lote:"Lote A", estado:"Producción",  litrosDia:16.9, partos:3, fechaNacimiento:"2021-01-20", registro:"NO", numeroRegistro:"",          valorKilo:0 },
  { id:"A-0712", nombre:"Perla",      raza:"Holstein",  categoria:"Vaca adulta", peso:510, lote:"Lote A", estado:"Tratamiento",litrosDia:12.1, partos:2, fechaNacimiento:"2022-05-08", registro:"SI", numeroRegistro:"REG-0712", valorKilo:0 },
  { id:"A-0188", nombre:"Diamante",   raza:"Holstein",  categoria:"Vaca adulta", peso:528, lote:"Lote A", estado:"Producción",  litrosDia:17.2, partos:3, fechaNacimiento:"2021-09-22", registro:"NO", numeroRegistro:"",          valorKilo:0 },
  { id:"A-0394", nombre:"Nube",       raza:"Simmental", categoria:"Vaca adulta", peso:495, lote:"Lote A", estado:"Producción",  litrosDia:15.6, partos:2, fechaNacimiento:"2022-03-11", registro:"NO", numeroRegistro:"",          valorKilo:0 },
  { id:"A-0445", nombre:"Niebla",     raza:"Holstein",  categoria:"Vaca adulta", peso:505, lote:"Lote B", estado:"Producción",  litrosDia:15.8, partos:3, fechaNacimiento:"2021-07-30", registro:"SI", numeroRegistro:"REG-0445", valorKilo:0 },
  { id:"A-0133", nombre:"Palmera",    raza:"Gyr X",     categoria:"Vaca adulta", peso:488, lote:"Lote B", estado:"Producción",  litrosDia:15.2, partos:2, fechaNacimiento:"2022-02-14", registro:"NO", numeroRegistro:"",          valorKilo:0 },
  { id:"A-0108", nombre:"Canela",     raza:"Brahman",   categoria:"Vaca adulta", peso:498, lote:"Lote B", estado:"Seca",        litrosDia:0,    partos:5, fechaNacimiento:"2019-11-05", registro:"SI", numeroRegistro:"REG-0108", valorKilo:0 },
  { id:"A-0560", nombre:"Fortuna",    raza:"Jersey",    categoria:"Vaca adulta", peso:412, lote:"Lote B", estado:"Producción",  litrosDia:14.8, partos:2, fechaNacimiento:"2022-08-17", registro:"NO", numeroRegistro:"",          valorKilo:0 },
  { id:"A-0273", nombre:"Selva",      raza:"Gyr X",     categoria:"Vaca adulta", peso:476, lote:"Lote B", estado:"Producción",  litrosDia:13.9, partos:2, fechaNacimiento:"2022-01-25", registro:"NO", numeroRegistro:"",          valorKilo:0 },
  { id:"A-0819", nombre:"Copete",     raza:"Holstein",  categoria:"Vaca adulta", peso:518, lote:"Lote B", estado:"Gestante",    litrosDia:10.4, partos:3, fechaNacimiento:"2021-04-02", registro:"SI", numeroRegistro:"REG-0819", valorKilo:0 },
  { id:"A-0319", nombre:"Luna",       raza:"Simmental", categoria:"Novilla",     peso:287, lote:"Lote C", estado:"Abierta",     litrosDia:0,    partos:0, fechaNacimiento:"2023-06-18", registro:"NO", numeroRegistro:"",          valorKilo:0 },
  { id:"A-0551", nombre:"Aurora",     raza:"Holstein",  categoria:"Novilla",     peso:295, lote:"Lote C", estado:"Abierta",     litrosDia:0,    partos:0, fechaNacimiento:"2023-08-09", registro:"NO", numeroRegistro:"",          valorKilo:0 },
  { id:"A-0215", nombre:"Tormenta",   raza:"Gyr",       categoria:"Novilla",     peso:312, lote:"Lote C", estado:"Gestante",    litrosDia:0,    partos:0, fechaNacimiento:"2023-03-22", registro:"SI", numeroRegistro:"REG-0215", valorKilo:0 },
  { id:"A-0466", nombre:"Brisa",      raza:"Holstein",  categoria:"Novilla",     peso:278, lote:"Lote C", estado:"Abierta",     litrosDia:0,    partos:0, fechaNacimiento:"2023-10-01", registro:"NO", numeroRegistro:"",          valorKilo:0 },
  { id:"A-0700", nombre:"Princesa",   raza:"Simmental", categoria:"Novilla",     peso:301, lote:"Lote C", estado:"Abierta",     litrosDia:0,    partos:0, fechaNacimiento:"2023-05-14", registro:"NO", numeroRegistro:"",          valorKilo:0 },
  { id:"A-0388", nombre:"Galaxia",    raza:"Gyr X",     categoria:"Novilla",     peso:318, lote:"Lote C", estado:"Gestante",    litrosDia:0,    partos:0, fechaNacimiento:"2023-01-30", registro:"NO", numeroRegistro:"",          valorKilo:0 },
  { id:"A-0401", nombre:"Bravo",      raza:"Brahman",   categoria:"Toro",        peso:810, lote:"Lote D", estado:"Activo",      litrosDia:0,    partos:0, fechaNacimiento:"2019-07-12", registro:"SI", numeroRegistro:"REG-0401", valorKilo:0 },
  { id:"A-0622", nombre:"Titan",      raza:"Simmental", categoria:"Toro",        peso:875, lote:"Lote D", estado:"Activo",      litrosDia:0,    partos:0, fechaNacimiento:"2018-12-01", registro:"SI", numeroRegistro:"REG-0622", valorKilo:0 },
  { id:"A-0755", nombre:"Colosal",    raza:"Brahman",   categoria:"Toro",        peso:798, lote:"Lote D", estado:"Activo",      litrosDia:0,    partos:0, fechaNacimiento:"2020-02-28", registro:"SI", numeroRegistro:"REG-0755", valorKilo:0 },
  { id:"A-0667", nombre:"Manchas",    raza:"Holstein",  categoria:"Ternero",     peso:88,  lote:"Lote E", estado:"Destete",     litrosDia:0,    partos:0, fechaNacimiento:"2024-09-10", registro:"NO", numeroRegistro:"",          valorKilo:0 },
  { id:"A-0512", nombre:"Pulgarcito", raza:"Brahman",   categoria:"Ternero",     peso:72,  lote:"Lote E", estado:"Destete",     litrosDia:0,    partos:0, fechaNacimiento:"2024-11-03", registro:"NO", numeroRegistro:"",          valorKilo:0 },
  { id:"A-0844", nombre:"Cariño",     raza:"Simmental", categoria:"Ternera",     peso:65,  lote:"Lote E", estado:"Lactancia",   litrosDia:0,    partos:0, fechaNacimiento:"2026-01-15", registro:"NO", numeroRegistro:"",          valorKilo:0 },
  { id:"A-0901", nombre:"Florita",    raza:"Holstein",  categoria:"Ternera",     peso:79,  lote:"Lote E", estado:"Destete",     litrosDia:0,    partos:0, fechaNacimiento:"2024-10-20", registro:"NO", numeroRegistro:"",          valorKilo:0 },
  { id:"A-0963", nombre:"Copito",     raza:"Gyr X",     categoria:"Ternero",     peso:58,  lote:"Lote E", estado:"Lactancia",   litrosDia:0,    partos:0, fechaNacimiento:"2026-02-08", registro:"NO", numeroRegistro:"",          valorKilo:0 },
  { id:"A-0334", nombre:"Victoria",   raza:"Holstein",  categoria:"Vaca adulta", peso:540, lote:"Lote F", estado:"Seca",        litrosDia:0,    partos:6, fechaNacimiento:"2018-04-25", registro:"SI", numeroRegistro:"REG-0334", valorKilo:0 },
  { id:"A-0480", nombre:"Mariposa",   raza:"Jersey",    categoria:"Vaca adulta", peso:408, lote:"Lote F", estado:"Gestante",    litrosDia:0,    partos:4, fechaNacimiento:"2020-08-13", registro:"SI", numeroRegistro:"REG-0480", valorKilo:0 },
  { id:"A-0531", nombre:"Esperanza",  raza:"Holstein",  categoria:"Vaca adulta", peso:512, lote:"Lote F", estado:"Gestante",    litrosDia:6.2,  partos:5, fechaNacimiento:"2019-06-30", registro:"SI", numeroRegistro:"REG-0531", valorKilo:0 },
  { id:"A-0150", nombre:"Libertad",   raza:"Simmental", categoria:"Vaca adulta", peso:488, lote:"Lote F", estado:"Seca",        litrosDia:0,    partos:3, fechaNacimiento:"2020-12-18", registro:"NO", numeroRegistro:"",          valorKilo:0 },
];

const POTREROS = [
  { nombre:"Potrero Norte",      pasto:"Kikuyo",       hectareas:4.5, estado:"Ocupado",      diasOcupado:6,  diasRotacion:30, animales:22 },
  { nombre:"Potrero Sur",        pasto:"Raigrás",      hectareas:3.8, estado:"Descanso",     diasDescanso:8, diasRotacion:22, animales:0  },
  { nombre:"Potrero Central",    pasto:"Brachiaria",   hectareas:5.1, estado:"Ocupado",      diasOcupado:14, diasRotacion:34, animales:20 },
  { nombre:"Potrero Este",       pasto:"Estrella",     hectareas:4.2, estado:"Rotar pronto", diasRestantes:3,diasRotacion:28, animales:26 },
  { nombre:"Potrero Ladera",     pasto:"Pasto nativo", hectareas:6.0, estado:"Disponible",   diasDescanso:21,diasRotacion:35, animales:0  },
  { nombre:"Potrero Bajo",       pasto:"Kikuyo",       hectareas:3.5, estado:"Ocupado",      diasOcupado:18, diasRotacion:23, animales:22 },
  { nombre:"Potrero Alto",       pasto:"Penisetum",    hectareas:4.8, estado:"Descanso",     diasDescanso:15,diasRotacion:30, animales:0  },
  { nombre:"Potrero Maternidad", pasto:"Kikuyo",       hectareas:2.2, estado:"Ocupado",      diasOcupado:4,  diasRotacion:15, animales:8  },
];

const INSUMOS = [
  { nombre:"Sal mineralizada",    categoria:"Alimentacion",    stock:180,  maximo:300,  minimo:60,  unidad:"kg" },
  { nombre:"Concentrado 16%",     categoria:"Alimentacion",    stock:1200, maximo:2000, minimo:400, unidad:"kg" },
  { nombre:"Heno de raigrás",     categoria:"Alimentacion",    stock:850,  maximo:2000, minimo:500, unidad:"kg" },
  { nombre:"Melaza",              categoria:"Alimentacion",    stock:240,  maximo:500,  minimo:100, unidad:"kg" },
  { nombre:"Prostaglandina",      categoria:"Reproductivo",    stock:8,    maximo:30,   minimo:15,  unidad:"frascos" },
  { nombre:"Oxitocina 10UI",      categoria:"Reproductivo",    stock:3,    maximo:30,   minimo:10,  unidad:"frascos" },
  { nombre:"GnRH (Cystorelin)",   categoria:"Reproductivo",    stock:12,   maximo:40,   minimo:10,  unidad:"dosis" },
  { nombre:"Calcio i.v.",         categoria:"Mineral",         stock:6,    maximo:25,   minimo:12,  unidad:"frascos" },
  { nombre:"Fósforo inyectable",  categoria:"Mineral",         stock:14,   maximo:30,   minimo:10,  unidad:"frascos" },
  { nombre:"Antibiótico L.A.",    categoria:"Antibiotico",     stock:18,   maximo:30,   minimo:10,  unidad:"jeringas" },
  { nombre:"Penicilina 4M",       categoria:"Antibiotico",     stock:24,   maximo:50,   minimo:15,  unidad:"frascos" },
  { nombre:"Vacuna IBR/BVD",      categoria:"Biologico",       stock:180,  maximo:500,  minimo:250, unidad:"dosis" },
  { nombre:"Vacuna Carbón",       categoria:"Biologico",       stock:95,   maximo:200,  minimo:100, unidad:"dosis" },
  { nombre:"Ivermectina 1%",      categoria:"Antiparasitario", stock:12,   maximo:40,   minimo:10,  unidad:"frascos" },
  { nombre:"Albendazol 10%",      categoria:"Antiparasitario", stock:28,   maximo:60,   minimo:15,  unidad:"frascos" },
  { nombre:"Diclofenac 5%",       categoria:"Antiinflamatorio",stock:9,    maximo:20,   minimo:8,   unidad:"frascos" },
  { nombre:"Flunixin megl.",      categoria:"Antiinflamatorio",stock:5,    maximo:20,   minimo:8,   unidad:"frascos" },
  { nombre:"Desinfectante yodo",  categoria:"Sanidad",         stock:8,    maximo:20,   minimo:5,   unidad:"L" },
];

const PERSONAL = [
  { nombre:"Carlos Meza",   cargo:"Vaquero jefe",   cedula:"0801-1985-12345", ingreso:"01/03/2020", salario:1600000, hExtras:8,  eps:"Sanitas",    arl:"Positiva" },
  { nombre:"Luis Patiño",   cargo:"Ordeñador",      cedula:"0801-1990-23456", ingreso:"15/06/2021", salario:1420000, hExtras:6,  eps:"Colsanitas", arl:"Sura" },
  { nombre:"Sandra Roa",    cargo:"Ordeñadora",     cedula:"0801-1992-34567", ingreso:"10/01/2022", salario:1420000, hExtras:4,  eps:"Sanitas",    arl:"Positiva" },
  { nombre:"Pedro Villa",   cargo:"Inseminador",    cedula:"0801-1983-45678", ingreso:"05/08/2019", salario:2100000, hExtras:12, eps:"Compensar",  arl:"Sura" },
  { nombre:"Ana Gómez",     cargo:"Administradora", cedula:"0801-1986-56789", ingreso:"01/02/2020", salario:2800000, hExtras:0,  eps:"Colsanitas", arl:"Positiva" },
  { nombre:"Jorge Cruz",    cargo:"Mantenimiento",  cedula:"0801-1995-67890", ingreso:"20/09/2023", salario:1420000, hExtras:8,  eps:"Sanitas",    arl:"Sura" },
  { nombre:"Martha Ríos",   cargo:"Veterinaria",    cedula:"0801-1988-78901", ingreso:"12/04/2021", salario:3200000, hExtras:5,  eps:"Compensar",  arl:"Positiva" },
  { nombre:"Felipe Mora",   cargo:"Tractorista",    cedula:"0801-1991-89012", ingreso:"03/07/2022", salario:1550000, hExtras:10, eps:"Sanitas",    arl:"Sura" },
  { nombre:"Lucía Vargas",  cargo:"Auxiliar campo", cedula:"0801-1997-90123", ingreso:"05/01/2024", salario:1300000, hExtras:4,  eps:"Colsanitas", arl:"Positiva" },
];

const REPRODUCCION = [
  { arete:"A-0042", animal:"Rosaura",   servicio:"IA Altísimo",   fechaParto:"10/05/2025", dias:11, partosPrev:4, estado:"Normal" },
  { arete:"A-0215", animal:"Tormenta",  servicio:"IA Furacao",    fechaParto:"18/05/2025", dias:19, partosPrev:0, estado:"Primipara" },
  { arete:"A-0087", animal:"Cielo",     servicio:"Monta natural", fechaParto:"22/05/2025", dias:23, partosPrev:2, estado:"Normal" },
  { arete:"A-0133", animal:"Palmera",   servicio:"IA Altísimo",   fechaParto:"01/06/2025", dias:33, partosPrev:3, estado:"Vigilar" },
  { arete:"A-0604", animal:"Estrella",  servicio:"IA Titan USA",  fechaParto:"05/06/2025", dias:37, partosPrev:3, estado:"Normal" },
  { arete:"A-0388", animal:"Galaxia",   servicio:"IA Furacao",    fechaParto:"14/06/2025", dias:46, partosPrev:0, estado:"Primipara" },
  { arete:"A-0819", animal:"Copete",    servicio:"IA Altísimo",   fechaParto:"28/06/2025", dias:60, partosPrev:3, estado:"Normal" },
  { arete:"A-0480", animal:"Mariposa",  servicio:"Monta natural", fechaParto:"10/07/2025", dias:72, partosPrev:4, estado:"Normal" },
  { arete:"A-0531", animal:"Esperanza", servicio:"IA Titan USA",  fechaParto:"22/07/2025", dias:84, partosPrev:5, estado:"Vigilar" },
];

const ALERTAS = [
  { title:"Potrero Este requiere rotación",    desc:"Días de ocupación superados — mover en 3 días",     type:"warning", time:"1h ago",   resolved:false },
  { title:"Vaca Perla en tratamiento",         desc:"Antibiótico L.A. día 2/3 · Revisar temperatura",    type:"danger",  time:"3h ago",   resolved:false },
  { title:"Stock bajo: Oxitocina 10UI",        desc:"3 frascos restantes (Mínimo: 10)",                  type:"warning", time:"5h ago",   resolved:false },
  { title:"Rosaura próximo parto",             desc:"Faltan 11 días — preparar maternidad",              type:"info",    time:"1d ago",   resolved:false },
  { title:"Stock bajo: Prostaglandina",        desc:"8 frascos restantes (Mínimo: 15)",                  type:"warning", time:"2h ago",   resolved:false },
  { title:"GPS Perla sin señal",               desc:"Última señal hace 45 min — verificar dispositivo",  type:"danger",  time:"45min ago",resolved:false },
  { title:"Flunixin meglumina crítico",        desc:"5 frascos restantes (Mínimo: 8) — pedir urgente",   type:"danger",  time:"6h ago",   resolved:false },
  { title:"Tormenta primípara vigilar",        desc:"Primera gestación · Faltan 19 días parto",          type:"info",    time:"12h ago",  resolved:false },
];

const GPS = [
  { animalId:"A-0042", nombre:"Rosaura",  lat:4.9876, lng:-74.0312, potreroId:1, potreroNom:"Potrero Norte",   activo:true,  bateria:87, ultimaSenal:"09/05/2025 07:45", dispositivo:"GPS-Collar-01" },
  { animalId:"A-0622", nombre:"Titan",    lat:4.9901, lng:-74.0287, potreroId:3, potreroNom:"Potrero Central", activo:true,  bateria:74, ultimaSenal:"09/05/2025 07:30", dispositivo:"GPS-Collar-02" },
  { animalId:"A-0712", nombre:"Perla",    lat:4.9845, lng:-74.0334, potreroId:1, potreroNom:"Potrero Norte",   activo:false, bateria:12, ultimaSenal:"09/05/2025 06:00", dispositivo:"GPS-Collar-03" },
  { animalId:"A-0401", nombre:"Bravo",    lat:4.9923, lng:-74.0301, potreroId:7, potreroNom:"Potrero Alto",    activo:true,  bateria:91, ultimaSenal:"09/05/2025 07:50", dispositivo:"GPS-Collar-04" },
  { animalId:"A-0319", nombre:"Luna",     lat:4.9867, lng:-74.0298, potreroId:2, potreroNom:"Potrero Sur",     activo:true,  bateria:55, ultimaSenal:"09/05/2025 07:20", dispositivo:"GPS-Collar-05" },
  { animalId:"A-0604", nombre:"Estrella", lat:4.9880, lng:-74.0318, potreroId:1, potreroNom:"Potrero Norte",   activo:true,  bateria:63, ultimaSenal:"09/05/2025 07:48", dispositivo:"GPS-Collar-06" },
  { animalId:"A-0087", nombre:"Cielo",    lat:4.9872, lng:-74.0325, potreroId:1, potreroNom:"Potrero Norte",   activo:true,  bateria:45, ultimaSenal:"09/05/2025 07:35", dispositivo:"GPS-Collar-07" },
  { animalId:"A-0215", nombre:"Tormenta", lat:4.9859, lng:-74.0295, potreroId:3, potreroNom:"Potrero Central", activo:true,  bateria:82, ultimaSenal:"09/05/2025 07:52", dispositivo:"GPS-Collar-08" },
];

const PESAJES = [
  { animalId:"A-0042", animalNombre:"Rosaura",    peso:520, pesoAnterior:516, fecha:"09/05/2025", hora:"07:30", metodo:"bluetooth", dispositivo:"Tru-Test XR3000", operador:"Carlos Meza",  observacion:"Peso estable, buena condición corporal", lote:"Lote A", categoria:"Vaca adulta" },
  { animalId:"A-0604", animalNombre:"Estrella",   peso:535, pesoAnterior:530, fecha:"09/05/2025", hora:"07:45", metodo:"bluetooth", dispositivo:"Tru-Test XR3000", operador:"Carlos Meza",  observacion:"Excelente condición corporal CC4",       lote:"Lote A", categoria:"Vaca adulta" },
  { animalId:"A-0087", animalNombre:"Cielo",      peso:502, pesoAnterior:498, fecha:"09/05/2025", hora:"08:00", metodo:"manual",    dispositivo:"",                operador:"Luis Patiño",  observacion:"Pesaje manual báscula corriente",        lote:"Lote A", categoria:"Vaca adulta" },
  { animalId:"A-0401", animalNombre:"Bravo",      peso:810, pesoAnterior:805, fecha:"08/05/2025", hora:"09:15", metodo:"bluetooth", dispositivo:"Tru-Test XR3000", operador:"Carlos Meza",  observacion:"Toro en excelente condición corporal",  lote:"Lote D", categoria:"Toro" },
  { animalId:"A-0667", animalNombre:"Manchas",    peso:88,  pesoAnterior:82,  fecha:"08/05/2025", hora:"10:00", metodo:"manual",    dispositivo:"",                operador:"Luis Patiño",  observacion:"Buen desarrollo ternero",               lote:"Lote E", categoria:"Ternero" },
  { animalId:"A-0512", animalNombre:"Pulgarcito", peso:72,  pesoAnterior:67,  fecha:"07/05/2025", hora:"10:20", metodo:"manual",    dispositivo:"",                operador:"Luis Patiño",  observacion:"",                                      lote:"Lote E", categoria:"Ternero" },
  { animalId:"A-0445", animalNombre:"Niebla",     peso:505, pesoAnterior:500, fecha:"07/05/2025", hora:"07:30", metodo:"bluetooth", dispositivo:"Gallagher W210",  operador:"Carlos Meza",  observacion:"",                                      lote:"Lote B", categoria:"Vaca adulta" },
  { animalId:"A-0133", animalNombre:"Palmera",    peso:488, pesoAnterior:483, fecha:"06/05/2025", hora:"08:00", metodo:"bluetooth", dispositivo:"Gallagher W210",  operador:"Carlos Meza",  observacion:"Peso gestante, normal",                 lote:"Lote B", categoria:"Vaca adulta" },
  { animalId:"A-0319", animalNombre:"Luna",       peso:287, pesoAnterior:281, fecha:"06/05/2025", hora:"08:30", metodo:"manual",    dispositivo:"",                operador:"Pedro Villa",  observacion:"Ganancia de peso correcta",             lote:"Lote C", categoria:"Novilla" },
  { animalId:"A-0622", animalNombre:"Titan",      peso:875, pesoAnterior:869, fecha:"05/05/2025", hora:"09:00", metodo:"bluetooth", dispositivo:"Tru-Test XR3000", operador:"Carlos Meza",  observacion:"Toro sementral excelente CC",           lote:"Lote D", categoria:"Toro" },
];

const USUARIOS = [
  { id:"u-admin",  nombre:"Administrador General",  cargo:"Administrador",         finca:"Finca El Rancho Verde", email:"admin@ganader.ia",  password:"admin",    role:"admin",     planCode:"pro",      permisos:"[]", activo:true, estado:"activo" },
  { id:"u-vet",    nombre:"Dr. Carlos Ramírez",      cargo:"Médico Veterinario",    finca:"Finca El Rancho Verde", email:"vet@ganader.ia",    password:"vet2026",  role:"vet",       planCode:"pro",      permisos:"[]", activo:true, estado:"activo" },
  { id:"u-field",  nombre:"Luis Patiño",             cargo:"Jefe de Campo",         finca:"Finca El Rancho Verde", email:"luis@ganader.ia",   password:"campo2026",role:"field",     planCode:"basico",   permisos:"[]", activo:true, estado:"activo" },
  { id:"u-viewer", nombre:"Propietario / Inversor",  cargo:"Propietario",           finca:"Finca El Rancho Verde", email:"visor@ganader.ia",  password:"visor",    role:"viewer",    planCode:"basico",   permisos:"[]", activo:true, estado:"activo" },
  { id:"u-dev",    nombre:"Dev · Arquitecto CIVAC",  cargo:"Arquitecto Principal",  finca:"CIVAC Labs · Colombia", email:"dev@civac.co",      password:"dev2026",  role:"developer", planCode:"platino",  permisos:"[]", activo:true, estado:"activo" },
  { id:"u-super",  nombre:"Super Administrador",     cargo:"CEO · Fundador CIVAC",  finca:"CIVAC HQ · Bogotá",    email:"super@civac.co",    password:"super2026",role:"superadmin",planCode:"platino",  permisos:"[]", activo:true, estado:"activo" },
];

const PLANS = [
  { code:"basico",     name:"Básico",    nameLong:"Plan Básico CIVAC",     priceMonthly:0,      maxAnimals:50,    maxUsers:1,  maxGpsCollars:2,  features:JSON.stringify(["Inventario","Producción","Alertas","Pesaje manual","App PWA"]),                                                                          colorPrimary:"#00f5d4", colorSecondary:"#00c8ff", colorAccent:"#39ff7e",  badgeLabel:"GRATIS",     active:true },
  { code:"pro",        name:"PRO",       nameLong:"Plan PRO CIVAC",        priceMonthly:129000, maxAnimals:300,   maxUsers:5,  maxGpsCollars:10, features:JSON.stringify(["Todo Básico","GPS Bovino","Reproducción","Genética","Pesaje BT","Multi-Finca","Predicción IA","Huella CO₂","Fotos animales"]),        colorPrimary:"#00c8ff", colorSecondary:"#7c3aed", colorAccent:"#a855f7",  badgeLabel:"POPULAR",    active:true },
  { code:"premium",    name:"Premium",   nameLong:"Plan Premium CIVAC",    priceMonthly:289000, maxAnimals:2000,  maxUsers:15, maxGpsCollars:50, features:JSON.stringify(["Todo PRO","Pesaje automatizado","Huella CO₂","Lotes","Centro de datos","Google Drive","Multi-finca"]),                        colorPrimary:"#fbbf24", colorSecondary:"#f59e0b", colorAccent:"#fcd34d",  badgeLabel:"PREMIUM",    active:true },
  { code:"platino",    name:"Platino",   nameLong:"Plan Platino CIVAC",    priceMonthly:890000, maxAnimals:2000,  maxUsers:20, maxGpsCollars:50, features:JSON.stringify(["Todo Premium","API pública","Reportes BI","Backup automático","Soporte 24/7","White-label"]),                                              colorPrimary:"#ff9500", colorSecondary:"#fbbf24", colorAccent:"#f59e0b",  badgeLabel:"PLATINO",    active:true },
  { code:"enterprise", name:"Enterprise",nameLong:"Plan Enterprise CIVAC", priceMonthly:490000, maxAnimals:99999, maxUsers:999,maxGpsCollars:999,features:JSON.stringify(["Todo Platino","Servidores dedicados","SLA 99.9%","Consultoría agro","Integración ERP"]),                                               colorPrimary:"#e2e8f0", colorSecondary:"#94a3b8", colorAccent:"#cbd5e1",  badgeLabel:"CORPORATIVO",active:true },
];

// Finca demo
const FINCA_CONFIG = {
  nombre:           "Finca El Rancho Verde",
  nit:              "900.123.456-7",
  municipio:        "Ubaté",
  departamento:     "Cundinamarca",
  telefono:         "+57 310 555 0100",
  email:            "finca@rancho.co",
  direccion:        "Vía Ubaté-Lenguazaque km 8",
  planCode:         "pro",
  themeMode:        "dark",
  primaryColor:     "#00f5d4",
  hectareasTotales: 27.1,
  capacidadTotal:   130,
};

// Una licencia PRO (1 año) para las cuentas de demo principales
function makeLicencia(userId: string, email: string, nombre: string, planCode: string) {
  return {
    id:          randomUUID(),
    userId,
    userEmail:   email,
    userNombre:  nombre,
    planCode,
    diasValidos: 365,
    sessionLimit:planCode === "platino" ? 10 : planCode === "pro" ? 5 : 2,
    maxAnimales: planCode === "platino" ? 2000 : planCode === "pro" ? 300 : 50,
    maxUsuarios: planCode === "platino" ? 20 : planCode === "pro" ? 5 : 1,
    permisos:    JSON.stringify(["*"]),
    signature:   randomUUID(),
    estado:      "activa",
    generadaPor: "seed",
    notas:       "Licencia demo generada por seed inicial",
    expiresAt:   new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  };
}

// ── POST /api/seed — inserta todos los datos iniciales; force=true para reset ──
router.post("/seed", async (req, res) => {
  try {
    const force = req.body?.force === true;
    const existingAnimals = await db.select().from(animalsTable).limit(1);
    const isEmpty = force || existingAnimals.length === 0;

    if (isEmpty) {
      // Limpiar tablas existentes
      await db.delete(animalsTable);
      await db.delete(potrerosTable);
      await db.delete(insumosTable);
      await db.delete(personalTable);
      await db.delete(reproduccionTable);
      await db.delete(alertasTable);
      await db.delete(gpsUbicacionesTable);
      await db.delete(pesajesTable);
      await db.delete(plansTable);
      await db.delete(fincaConfigTable);
      await db.delete(licenciasTable);

      // Insertar datos base
      await db.insert(animalsTable).values(ANIMALS);
      await db.insert(potrerosTable).values(POTREROS);
      await db.insert(insumosTable).values(INSUMOS);
      await db.insert(personalTable).values(PERSONAL);
      await db.insert(reproduccionTable).values(REPRODUCCION);
      await db.insert(alertasTable).values(ALERTAS);
      await db.insert(gpsUbicacionesTable).values(GPS);
      await db.insert(pesajesTable).values(PESAJES);
      await db.insert(plansTable).values(PLANS);
      await db.insert(fincaConfigTable).values(FINCA_CONFIG);

      // Usuarios (upsert)
      for (const u of USUARIOS) {
        try { await db.insert(usuariosTable).values(u).onConflictDoNothing(); } catch { /* skip */ }
      }

      // Licencias demo para cada usuario de DB
      const licencias = USUARIOS.map(u =>
        makeLicencia(u.id, u.email, u.nombre, u.planCode)
      );
      for (const lic of licencias) {
        try { await db.insert(licenciasTable).values(lic); } catch { /* skip */ }
      }
    }

    const counts = {
      animals:    (await db.select().from(animalsTable)).length,
      potreros:   (await db.select().from(potrerosTable)).length,
      insumos:    (await db.select().from(insumosTable)).length,
      personal:   (await db.select().from(personalTable)).length,
      planes:     (await db.select().from(plansTable)).length,
      licencias:  (await db.select().from(licenciasTable)).length,
      fincaConfig:(await db.select().from(fincaConfigTable)).length,
    };

    res.json({ ok: true, seeded: isEmpty, counts });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
