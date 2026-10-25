import { useState, useEffect, useRef, useCallback } from "react";
import { useAppState, type Animal, type Pesaje } from "../lib/data";
import { useAuth } from "../lib/auth";
import {
  Scale, Bluetooth, BluetoothConnected, BluetoothOff, BluetoothSearching,
  Plus, CheckCircle2, TrendingUp, TrendingDown, Zap, BarChart3, Search,
  Printer, Calculator, AlertTriangle, Settings2, Target, Cpu, Radio,
  Activity, Beef, Star, Clock, DollarSign, FileText, List, UserPlus,
  X as XIcon, Usb, Cable, Brain, Sparkles, ChevronDown, ChevronUp,
  Filter, Camera, Image, Hash, Layers, HeartPulse, Weight, Thermometer,
  Info, ChevronRight, BookOpen, Leaf, Shield, RefreshCw, Check, Edit3,
  ArrowUpRight, ArrowDownRight, Download, Database, Globe, Wifi,
} from "lucide-react";
import { saveLastBtDevice, loadLastBtDevice, saveBtSession, loadBtSessions } from "../lib/offline-storage";
import {
  type ScaleDeviceConfig, type CustomTrama, type PrintTemplate,
  DEFAULT_DEVICE_CONFIG, DEFAULT_PRINT_TEMPLATE,
  loadDeviceConfigs, saveDeviceConfigs, loadCustomTramas, saveCustomTramas,
  loadPrintTemplate, savePrintTemplate, testCustomTrama,
} from "../lib/scale-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";

/* ─────────────────────────────────────────────────────────────────────────────
   SISTEMA CONFIG — Configuración del sistema de báscula
─────────────────────────────────────────────────────────────────────────────── */
interface SistemaConfig {
  puerto: string;
  intervalo: number;
  baudios: number;
  paridad: string;
  dataBits: number;
  stopBits: number;
  nPlanilla: number;
  nTiquete: number;
  impVertical: number;
  impHorizontal: number;
  empresa: string;
  nit: string;
  direccion: string;
  telefono: string;
  ciudad: string;
  pais: string;
  idProducto: string;
}
const SISTEMA_CFG_KEY = "ganader_sistema_cfg";
const SISTEMA_CFG_DEFAULT: SistemaConfig = {
  puerto: "COM1", intervalo: 100, baudios: 9600, paridad: "N", dataBits: 8, stopBits: 1,
  nPlanilla: 1, nTiquete: 1, impVertical: 0, impHorizontal: 0,
  empresa: "Finca El Rancho Verde", nit: "900.123.456-7",
  direccion: "Vía Principal km 5", telefono: "310 000 0000",
  ciudad: "Bogotá", pais: "Colombia", idProducto: "CIVAC-PRO-001",
};
function loadSistemaCfgFromStorage(): SistemaConfig {
  try {
    const s = localStorage.getItem(SISTEMA_CFG_KEY);
    return s ? { ...SISTEMA_CFG_DEFAULT, ...JSON.parse(s) } : { ...SISTEMA_CFG_DEFAULT };
  } catch { return { ...SISTEMA_CFG_DEFAULT }; }
}
function saveSistemaCfgToStorage(cfg: SistemaConfig) {
  try { localStorage.setItem(SISTEMA_CFG_KEY, JSON.stringify(cfg)); } catch {}
}

const WINDOWS_COM_DRIVERS = [
  {
    id: "ch340", nombre: "CH340 / CH341", icon: "🇨🇳",
    desc: "El más común en básculas chinas y conversores económicos. Reconocible por el chip marcado 'CH340' o 'CH341' en la PCB.",
    url: "https://www.wch-ic.com/downloads/CH341SER_EXE.html",
    sistId: "VID_1A86&PID_7523", color: "#fbbf24", glow: "251,191,36",
  },
  {
    id: "prolific", nombre: "Prolific PL2303", icon: "🔌",
    desc: "Frecuente en cables USB-RS232 económicos. Si Windows muestra 'Código 10', instale el driver oficial desde Prolific.",
    url: "http://www.prolific.com.tw/US/ShowProduct.aspx?p_id=225&pcid=41",
    sistId: "VID_067B&PID_2303", color: "#00c8ff", glow: "0,200,255",
  },
  {
    id: "ftdi", nombre: "FTDI FT232 / FT2232", icon: "🏭",
    desc: "Alta calidad industrial. Usado en Tru-Test y Gallagher. Drivers incluidos automáticamente en Windows 10+.",
    url: "https://ftdichip.com/drivers/vcp-drivers/",
    sistId: "VID_0403&PID_6001", color: "#39ff7e", glow: "57,255,126",
  },
  {
    id: "cp210x", nombre: "Silicon Labs CP210x", icon: "💎",
    desc: "Muy estable. Común en adaptadores de calidad media-alta. Necesita driver manual en Windows 7/8.",
    url: "https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers",
    sistId: "VID_10C4&PID_EA60", color: "#a78bfa", glow: "167,139,250",
  },
  {
    id: "cdc-acm", nombre: "USB CDC-ACM (genérico)", icon: "🖥️",
    desc: "Clase nativa del SO — sin driver extra. Muchos indicadores modernos lo implementan. Aparece como COM# automáticamente en Windows 10+.",
    url: "https://learn.microsoft.com/windows-hardware/drivers/usbcon/usb-driver-installation-based-on-compatible-ids",
    sistId: "VID_xxxx&PID_xxxx (CDC class)", color: "#34d399", glow: "52,211,153",
  },
  {
    id: "ch348", nombre: "CH348 (8 puertos COM)", icon: "🔀",
    desc: "Versión multipuerto del CH340 para hubs industriales. Permite conectar báscula + EID reader + impresora por un solo USB.",
    url: "https://www.wch-ic.com/products/CH348.html",
    sistId: "VID_1A86&PID_55D3", color: "#f97316", glow: "249,115,22",
  },
  {
    id: "cp2102n", nombre: "Silicon Labs CP2102N", icon: "⚡",
    desc: "Versión mejorada del CP210x con velocidades hasta 3 Mbps. Presente en básculas industriales modernas y adaptadores de alta velocidad.",
    url: "https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers",
    sistId: "VID_10C4&PID_EA60", color: "#e879f9", glow: "232,121,249",
  },
  {
    id: "wch-usb3ser", nombre: "WCH USB3.0 Serial", icon: "🚀",
    desc: "Driver de alta velocidad para sistemas de pesaje con video integrado. USB 3.0 SuperSpeed con fallback USB 2.0.",
    url: "https://www.wch-ic.com/products/USB3.0.html",
    sistId: "VID_1A86&PID_7523", color: "#60a5fa", glow: "96,165,250",
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   BLUETOOTH CONTROLLERS
───────────────────────────────────────────────────────────────────────────── */
const BT_CONTROLLERS = [
  { id:"tru-test-xr3",     nombre:"Tru-Test XR3000",    marca:"Tru-Test",      tipo:"Indicador BLE 5.0",  protocol:"uart",         color:"#00f5d4", glow:"0,245,212",     services:["6e400001-b5a3-f393-e0a9-e50e24dcca9e"], nameFilter:["TruTest","Tru-Test","XR3"],        desc:"±0.1 kg · IP67 · BLE 5.0",       icon:"⚖️" },
  { id:"gallagher-w210-bt", nombre:"Gallagher W210 BT",  marca:"Gallagher",     tipo:"Báscula WiFi/BT",    protocol:"weight_scale", color:"#fbbf24", glow:"251,191,36",   services:["weight_scale","0000181d-0000-1000-8000-00805f9b34fb"], nameFilter:["Gallagher","W210","W450"], desc:"NLIS · ±50 g · BT 4.2",          icon:"🏋️" },
  { id:"ahi-caroplus",      nombre:"AHI Caroplus 2",     marca:"AHI",           tipo:"Báscula RFID BT",    protocol:"uart",         color:"#a78bfa", glow:"167,139,250",   services:["6e400001-b5a3-f393-e0a9-e50e24dcca9e"], nameFilter:["AHI","Caroplus"],          desc:"RFID ISO 11784 · BLE",            icon:"📡" },
  { id:"tru-test-s3",       nombre:"Tru-Test S3",        marca:"Tru-Test",      tipo:"Portátil BLE",       protocol:"uart",         color:"#34d399", glow:"52,211,153",    services:["6e400001-b5a3-f393-e0a9-e50e24dcca9e"], nameFilter:["TruTest","S3000","S3 "],   desc:"5000 registros · BLE 5.0",       icon:"📱" },
  { id:"simcro-biotrack",   nombre:"Simcro BioTrack",    marca:"Simcro",        tipo:"RFID + Báscula",     protocol:"uart",         color:"#f87171", glow:"248,113,113",   services:["6e400001-b5a3-f393-e0a9-e50e24dcca9e"], nameFilter:["Simcro","BioTrack"],       desc:"ISO 11785 · EID dual",            icon:"🔖" },
  { id:"zee-tag-bt",        nombre:"Zee Tag EID BT",     marca:"Zee Tag",       tipo:"RFID Bluetooth",     protocol:"uart",         color:"#fb923c", glow:"251,146,60",    services:["6e400001-b5a3-f393-e0a9-e50e24dcca9e"], nameFilter:["ZeeTag","Zee","EID"],      desc:"EID ISO 11784/85 · Colombia",    icon:"🏷️" },
  { id:"herd-manager-bt",   nombre:"Herd Manager HM7",   marca:"Herd Manager",  tipo:"Sistema integrado BLE",protocol:"uart",       color:"#e879f9", glow:"232,121,249",   services:["6e400001-b5a3-f393-e0a9-e50e24dcca9e"], nameFilter:["HerdMgr","HM7","Herd"],    desc:"7\" display · BLE 5.0 · NFC",    icon:"🗂️" },
  { id:"smaxtec-cbt",       nombre:"smaXtec CBT Sensor", marca:"smaXtec",       tipo:"Sensor rumen BLE",   protocol:"uart",         color:"#00c8ff", glow:"0,200,255",     services:["6e400001-b5a3-f393-e0a9-e50e24dcca9e"], nameFilter:["smaXtec","cbt","CBT"],     desc:"Temperatura rumen · pH · BLE",   icon:"🌡️" },
  { id:"id-tech-rfid",      nombre:"ID Tech BLE RFID",   marca:"ID Technology", tipo:"Lector RFID+Peso BT",protocol:"weight_scale", color:"#4ade80", glow:"74,222,128",    services:["0000181d-0000-1000-8000-00805f9b34fb"], nameFilter:["IDTech","IDTECH","RFID"],  desc:"ISO 11784 · 134.2 kHz · BLE 5", icon:"🔏" },
  { id:"agersens-ear-bt",   nombre:"Agersens eShepherd", marca:"Agersens",      tipo:"Collar virtual IA",  protocol:"uart",         color:"#f59e0b", glow:"245,158,11",    services:["6e400001-b5a3-f393-e0a9-e50e24dcca9e"], nameFilter:["Agersens","eShepherd"],    desc:"Pastoreo virtual · GPS + BLE",   icon:"🛡️" },
  { id:"civac-scale-bt",    nombre:"CIVAC Scale v2",      marca:"CIVAC",         tipo:"Báscula Colombia BT",protocol:"uart",         color:"#FFD60A", glow:"255,214,10",    services:["6e400001-b5a3-f393-e0a9-e50e24dcca9e"], nameFilter:["CIVAC","SoftGan","CSCL"],  desc:"Protocolo CIVAC-9B · ±20 g",    icon:"🇨🇴" },
];

/* ─────────────────────────────────────────────────────────────────────────────
   COM/SERIAL CONTROLLERS
───────────────────────────────────────────────────────────────────────────── */
const COM_CONTROLLERS = [
  { id:"tru-test-xr3-com", nombre:"Tru-Test XR3000 COM", marca:"Tru-Test",        tipo:"RS232/USB-Serial", baudRate:9600,   dataBits:8 as const, stopBits:1 as const, parity:"none" as const, color:"#00f5d4", glow:"0,245,212",   patterns:[/(?:STW,?\s*)([0-9]{2,4}\.?\d{0,2})/i,/^([0-9]{3,4}\.?\d{0,1})\s*(?:kg)?$/], desc:"RS232 · STW format · IP67", icon:"⚖️" },
  { id:"gallagher-w210-com",nombre:"Gallagher W210 COM",  marca:"Gallagher",        tipo:"RS232/USB-Serial", baudRate:9600,   dataBits:8 as const, stopBits:1 as const, parity:"none" as const, color:"#fbbf24", glow:"251,191,36", patterns:[/^([0-9]{3,4}\.?\d{0,1})\s*(?:kg)?$/i,/W0*([0-9]{3,4}\.?\d{0,1})/], desc:"RS232 · NLIS compatible", icon:"🏋️" },
  { id:"sema-bascula",       nombre:"SEMA Báscula",        marca:"SEMA",             tipo:"COM Colombiana",   baudRate:9600,   dataBits:8 as const, stopBits:1 as const, parity:"none" as const, color:"#f59e0b", glow:"245,158,11", patterns:[/([0-9]{2,4}\.?\d{0,2})\s*(?:Kg|KG|kg)/i,/^([0-9]{3,4}\.?\d{0,2})$/], desc:"Marca colombiana pecuaria", icon:"🇨🇴" },
  { id:"ruddweigh-600",      nombre:"Ruddweigh 600",       marca:"Ruddweigh",        tipo:"RS232 portátil",   baudRate:4800,   dataBits:8 as const, stopBits:1 as const, parity:"none" as const, color:"#a3e635", glow:"163,230,53", patterns:[/W\s*([0-9]{3,4}\.?\d{0,2})/i,/[+\-]\s*([0-9]{3,4}\.?\d{0,2})\s*[Ss]/], desc:"RS232 · 4800 bps · Latam", icon:"🔌" },
  { id:"agrident-apr650",    nombre:"Agrident APR650",     marca:"Agrident",         tipo:"USB-Serial RFID",  baudRate:115200, dataBits:8 as const, stopBits:1 as const, parity:"none" as const, color:"#38bdf8", glow:"56,189,248", patterns:[/W=\s*([0-9]{3,4}\.?\d{0,2})/i,/(?:weight|peso)[\s:=]*([0-9]{3,4}\.?\d{0,2})/i], desc:"USB · RFID ISO 11784 + peso", icon:"📟" },
  { id:"mettler-toledo",     nombre:"Mettler Toledo IND",  marca:"Mettler Toledo",   tipo:"RS232 Industrial", baudRate:9600,   dataBits:8 as const, stopBits:1 as const, parity:"none" as const, color:"#e879f9", glow:"232,121,249", patterns:[/S\s+S\s+([0-9]{3,4}\.?\d{0,3})\s*kg/i,/([0-9]{3,4}\.?\d{0,3})\s*(?:kg)/i], desc:"RS232 · formato SCS · ±0.05 kg", icon:"🏭" },
  { id:"toledo-prix3",       nombre:"Toledo Prix 3",       marca:"Toledo do Brasil", tipo:"COM Pecuario",     baudRate:9600,   dataBits:7 as const, stopBits:2 as const, parity:"even" as const, color:"#fb7185", glow:"251,113,133", patterns:[/([0-9]{3,4}\.?\d{0,2})\s*(?:kg|KG)/i], desc:"COM · 9600 7E2 · Brasil/CO", icon:"⚡" },
  { id:"generic-com",        nombre:"Generic RS232",       marca:"Genérico",         tipo:"Cualquier COM",    baudRate:9600,   dataBits:8 as const, stopBits:1 as const, parity:"none" as const, color:"#94a3b8", glow:"148,163,184", patterns:[/([0-9]{3,4}\.?\d{0,2})/], desc:"Detecta cualquier nº >100 kg", icon:"🔧" },
];

/* ─────────────────────────────────────────────────────────────────────────────
   TRAMAS DE BÁSCULA — formatos de trama serial configurables
   Cada trama define cómo parsear el stream de bytes de la báscula
─────────────────────────────────────────────────────────────────────────────── */
interface TramaFrame { peso: number; stable: boolean; raw: string }
interface TramaType {
  id: string; nombre: string; descripcion: string; ejemplo: string;
  estabilidad_directa: boolean; icon: string; color: string;
  parse: (buf: string) => TramaFrame[];
}

const TRAMA_TYPES: TramaType[] = [
  {
    id: "civac_9b",
    nombre: "CIVAC / Colombia 9B",
    descripcion: "[Estado 1B][Peso 7B][Unidad 1B] · 'I'=inestable · '!'=estable · 's'=kg",
    ejemplo: "I      0s  →  I    320s  →  !    450s",
    estabilidad_directa: true, icon: "🇨🇴", color: "#fbbf24",
    parse: (buf: string): TramaFrame[] => {
      const frames: TramaFrame[] = [];
      for (let i = 0; i <= buf.length - 9; i++) {
        const ch = buf[i];
        if (ch === 'I' || ch === '!') {
          const ws = buf.slice(i + 1, i + 8);
          const u  = buf[i + 8];
          if (u === 's' || u === 'S' || u === 'k' || u === 'K' || u === '\r' || u === ' ') {
            const w = parseFloat(ws.trim());
            if (!isNaN(w) && w >= 0 && w < 3000) {
              frames.push({ peso: w, stable: ch === '!', raw: buf.slice(i, i + 9) });
              i += 8;
            }
          }
        }
      }
      return frames;
    },
  },
  {
    id: "civac_9b_sp",
    nombre: "CIVAC 9B (espacio=estable)",
    descripcion: "[Estado 1B][Peso 7B][Unidad 1B] · 'I'=inestable · ' '=estable",
    ejemplo: "I    300s  →       300s",
    estabilidad_directa: true, icon: "⚖️", color: "#00f5d4",
    parse: (buf: string): TramaFrame[] => {
      const frames: TramaFrame[] = [];
      for (let i = 0; i <= buf.length - 9; i++) {
        const ch = buf[i];
        if (ch === 'I' || ch === ' ' || ch === '!') {
          const ws = buf.slice(i + 1, i + 8);
          const u  = buf[i + 8];
          if (u === 's' || u === 'S' || u === 'k' || u === 'K') {
            const w = parseFloat(ws.trim());
            if (!isNaN(w) && w >= 0 && w < 3000) {
              frames.push({ peso: w, stable: ch === ' ' || ch === '!', raw: buf.slice(i, i + 9) });
              i += 8;
            }
          }
        }
      }
      return frames;
    },
  },
  {
    id: "toledo_scs",
    nombre: "Toledo / Mettler SCS",
    descripcion: "S S [peso] kg = estable · S D [peso] kg = dinámico",
    ejemplo: "S S     450.000 kg\\r\\n",
    estabilidad_directa: true, icon: "🏭", color: "#e879f9",
    parse: (buf: string): TramaFrame[] => {
      const frames: TramaFrame[] = [];
      buf.split(/\r?\n/).forEach(line => {
        const m = line.match(/^S\s+(S|D)\s+([\s\d.]+)\s*(?:kg)?/i);
        if (m) { const w = parseFloat(m[2].trim()); if (!isNaN(w) && w > 0) frames.push({ peso: w, stable: m[1].toUpperCase() === 'S', raw: line }); }
      });
      return frames;
    },
  },
  {
    id: "ruddweigh",
    nombre: "Ruddweigh / ± prefijo",
    descripcion: "[+/-][peso]S por línea · sufijo 'S'=estable",
    ejemplo: "+    450.0S\\r\\n",
    estabilidad_directa: true, icon: "🔌", color: "#a3e635",
    parse: (buf: string): TramaFrame[] => {
      const frames: TramaFrame[] = [];
      buf.split(/\r?\n/).forEach(line => {
        const m = line.match(/[+\-]\s*([0-9]{2,4}\.?\d{0,2})\s*([Ss])?/);
        if (m) { const w = parseFloat(m[1]); if (!isNaN(w) && w > 0) frames.push({ peso: w, stable: !!m[2], raw: line }); }
      });
      return frames;
    },
  },
  {
    id: "sema_co",
    nombre: "SEMA Báscula Colombia",
    descripcion: "Número seguido de Kg/KG en cada línea",
    ejemplo: "450.5Kg\\r\\n  ó  450KG\\r\\n",
    estabilidad_directa: false, icon: "🐄", color: "#f59e0b",
    parse: (buf: string): TramaFrame[] => {
      const frames: TramaFrame[] = [];
      buf.split(/\r?\n/).forEach(line => {
        const m = line.match(/([0-9]{2,4}\.?\d{0,2})\s*(?:Kg|KG|kg)/);
        if (m) { const w = parseFloat(m[1]); if (w > 10 && w < 3000) frames.push({ peso: w, stable: true, raw: line }); }
      });
      return frames;
    },
  },
  {
    id: "generic_line",
    nombre: "Genérica por línea",
    descripcion: "Detecta cualquier número >50 en cada línea (compatible con la mayoría)",
    ejemplo: "450.5\\r\\n · W0450\\r\\n · STW,450.5",
    estabilidad_directa: false, icon: "🔧", color: "#94a3b8",
    parse: (buf: string): TramaFrame[] => {
      const frames: TramaFrame[] = [];
      buf.split(/\r?\n/).forEach(line => {
        const m = line.match(/([0-9]{2,4}\.?\d{0,2})/);
        if (m) { const w = parseFloat(m[1]); if (w > 50 && w < 3000) frames.push({ peso: w, stable: false, raw: line }); }
      });
      return frames;
    },
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   PESO DE REFERENCIA POR RAZA × CATEGORÍA
───────────────────────────────────────────────────────────────────────────── */
const PESOS_RAZA: Record<string, Record<string, { min:number; max:number; prom:number; gdpMes:number }>> = {
  Holstein:  { "Vaca adulta":{min:490,max:650,prom:560,gdpMes:6},   Novilla:{min:280,max:380,prom:330,gdpMes:18}, Ternero:{min:40,max:120,prom:80,gdpMes:22}, Ternera:{min:38,max:110,prom:75,gdpMes:20}, Toro:{min:700,max:950,prom:820,gdpMes:8},   "Novillo":{min:280,max:450,prom:360,gdpMes:20} },
  Brahman:   { "Vaca adulta":{min:400,max:580,prom:490,gdpMes:5},   Novilla:{min:250,max:360,prom:300,gdpMes:16}, Ternero:{min:35,max:100,prom:65,gdpMes:20}, Ternera:{min:32,max:95, prom:60,gdpMes:18}, Toro:{min:650,max:900,prom:780,gdpMes:7},   "Novillo":{min:260,max:420,prom:340,gdpMes:18} },
  Simmental: { "Vaca adulta":{min:520,max:700,prom:600,gdpMes:7},   Novilla:{min:300,max:420,prom:360,gdpMes:20}, Ternero:{min:45,max:130,prom:90,gdpMes:25}, Ternera:{min:42,max:125,prom:85,gdpMes:22}, Toro:{min:750,max:1000,prom:870,gdpMes:10}, "Novillo":{min:300,max:480,prom:390,gdpMes:22} },
  Jersey:    { "Vaca adulta":{min:330,max:470,prom:400,gdpMes:4},   Novilla:{min:200,max:290,prom:245,gdpMes:14}, Ternero:{min:25,max:80, prom:52,gdpMes:16}, Ternera:{min:24,max:76, prom:49,gdpMes:15}, Toro:{min:500,max:700,prom:600,gdpMes:6},   "Novillo":{min:200,max:350,prom:270,gdpMes:15} },
  "Gyr X":   { "Vaca adulta":{min:380,max:550,prom:470,gdpMes:5},   Novilla:{min:240,max:350,prom:290,gdpMes:16}, Ternero:{min:32,max:95, prom:62,gdpMes:20}, Ternera:{min:30,max:90, prom:58,gdpMes:18}, Toro:{min:600,max:850,prom:730,gdpMes:8},   "Novillo":{min:250,max:400,prom:320,gdpMes:18} },
  Gyr:       { "Vaca adulta":{min:360,max:530,prom:450,gdpMes:5},   Novilla:{min:230,max:340,prom:280,gdpMes:15}, Ternero:{min:30,max:90, prom:60,gdpMes:18}, Ternera:{min:28,max:85, prom:56,gdpMes:17}, Toro:{min:580,max:820,prom:700,gdpMes:7},   "Novillo":{min:240,max:390,prom:310,gdpMes:17} },
  Angus:     { "Vaca adulta":{min:450,max:620,prom:520,gdpMes:6},   Novilla:{min:270,max:380,prom:320,gdpMes:18}, Ternero:{min:40,max:115,prom:75,gdpMes:22}, Ternera:{min:38,max:110,prom:72,gdpMes:20}, Toro:{min:700,max:950,prom:830,gdpMes:9},   "Novillo":{min:280,max:450,prom:365,gdpMes:22} },
  Normando:  { "Vaca adulta":{min:500,max:680,prom:580,gdpMes:6},   Novilla:{min:290,max:400,prom:345,gdpMes:18}, Ternero:{min:42,max:125,prom:85,gdpMes:23}, Ternera:{min:40,max:118,prom:80,gdpMes:21}, Toro:{min:750,max:1000,prom:860,gdpMes:9},  "Novillo":{min:290,max:470,prom:380,gdpMes:21} },
  Criollo:   { "Vaca adulta":{min:340,max:490,prom:415,gdpMes:4},   Novilla:{min:210,max:310,prom:255,gdpMes:13}, Ternero:{min:28,max:80, prom:54,gdpMes:15}, Ternera:{min:26,max:76, prom:50,gdpMes:14}, Toro:{min:520,max:750,prom:630,gdpMes:6},   "Novillo":{min:220,max:360,prom:285,gdpMes:15} },
};
function getPesoRef(raza: string, cat: string) {
  return PESOS_RAZA[raza]?.[cat] ?? { min:100, max:800, prom:400, gdpMes:10 };
}

/* ─────────────────────────────────────────────────────────────────────────────
   IA PREDICTOR
───────────────────────────────────────────────────────────────────────────── */
interface IAPrediccion {
  pesoEstimado: number;
  bcs: string;
  bcsNum: number;
  estadoSalud: string;
  alertaNivel: "ok" | "alerta" | "critico";
  gdpActual: number;   // kg/mes
  gdpEsperado: number;
  valorEstimado: number;
  proximoPesaje: string;
  recomendacion: string;
  recomendaciones: string[];
  scoreDesarrollo: number; // 0-100
  temperatura: string;
  diasDesdeUltPesaje: number;
}

function computeIA(animal: Animal, pesajes: Pesaje[], valorKilo = 11000): IAPrediccion {
  const ref = getPesoRef(animal.raza, animal.categoria);
  const historial = pesajes.filter(p => p.animalId === animal.id).sort((a, b) => b.id - a.id);
  const ultimo = historial[0];
  const penultimo = historial[1];
  const pesoBase = ultimo?.peso ?? animal.peso ?? ref.prom;

  // Days since last weighing
  let diasDesde = 30;
  if (ultimo) {
    const [d,m,y] = (ultimo.fecha || "").split("/").map(Number);
    const fechaU = new Date(y || 2025, (m||1)-1, d||1);
    diasDesde = Math.max(0, Math.round((Date.now() - fechaU.getTime()) / 86400000));
  }

  // Growth rate actual
  let gdpActual = ref.gdpMes;
  if (ultimo && penultimo) {
    const diffPeso = ultimo.peso - penultimo.peso;
    const [d1,m1,y1] = (penultimo.fecha || "").split("/").map(Number);
    const [d2,m2,y2] = (ultimo.fecha || "").split("/").map(Number);
    const dias = Math.abs((new Date(y2||2025,(m2||1)-1,d2||1).getTime() - new Date(y1||2025,(m1||1)-1,d1||1).getTime()) / 86400000);
    if (dias > 0) gdpActual = Math.round((diffPeso / dias) * 30 * 10) / 10;
  }

  // Predicted current weight
  const pesoEstimado = Math.round((pesoBase + (gdpActual / 30) * diasDesde) * 10) / 10;

  // Body Condition Score
  const ratioRef = pesoEstimado / ref.prom;
  let bcsNum = 3.0;
  let bcs = "CC 3.0 — Buena";
  let alertaNivel: "ok" | "alerta" | "critico" = "ok";
  if (ratioRef >= 1.15)      { bcsNum = 4.5; bcs = "CC 4.5 — Sobrepeso";     alertaNivel = "alerta"; }
  else if (ratioRef >= 1.05) { bcsNum = 4.0; bcs = "CC 4.0 — Sobre ideal";   alertaNivel = "ok"; }
  else if (ratioRef >= 0.95) { bcsNum = 3.5; bcs = "CC 3.5 — Ideal";         alertaNivel = "ok"; }
  else if (ratioRef >= 0.85) { bcsNum = 3.0; bcs = "CC 3.0 — Buena";         alertaNivel = "ok"; }
  else if (ratioRef >= 0.75) { bcsNum = 2.5; bcs = "CC 2.5 — Bajo normal";   alertaNivel = "alerta"; }
  else if (ratioRef >= 0.65) { bcsNum = 2.0; bcs = "CC 2.0 — Delgado";       alertaNivel = "alerta"; }
  else                        { bcsNum = 1.5; bcs = "CC 1.5 — Muy delgado";   alertaNivel = "critico"; }

  // Score desarrollo
  const gdpRatio = ref.gdpMes > 0 ? gdpActual / ref.gdpMes : 1;
  const scoreDesarrollo = Math.min(100, Math.max(0, Math.round(((ratioRef * 0.6) + (gdpRatio * 0.4)) * 100)));

  // Health state
  const estadoSalud = alertaNivel === "critico" ? "Revisar urgente" : alertaNivel === "alerta" ? "Vigilar" : "Sano";

  // Economic value
  const valorEstimado = Math.round(pesoEstimado * valorKilo);

  // Next weighing (based on category)
  const intervalos: Record<string, number> = { "Ternero":14, "Ternera":14, "Novillo":21, "Novilla":21, "Vaca adulta":30, "Toro":45 };
  const intervalo = intervalos[animal.categoria] || 30;
  const nextDate = new Date(Date.now() + intervalo * 86400000);
  const proximoPesaje = nextDate.toLocaleDateString("es-CO");

  // Recommendations
  const recomendaciones: string[] = [];
  if (bcsNum < 2.5) recomendaciones.push("⚠ Aumentar suplementación energética");
  if (bcsNum > 4.0) recomendaciones.push("✓ Revisar dieta · posible sobrepeso");
  if (gdpActual < ref.gdpMes * 0.7) recomendaciones.push("📉 GDP por debajo del ideal — revisar alimentación");
  if (gdpActual > ref.gdpMes * 1.3) recomendaciones.push("📈 Excelente ganancia — mantener manejo");
  if (diasDesde > intervalo) recomendaciones.push(`⏰ Pesaje atrasado ${diasDesde - intervalo} días`);
  if (diasDesde > intervalo * 2) recomendaciones.push("🚨 Urgente: pesaje muy atrasado");
  if (recomendaciones.length === 0) recomendaciones.push("✅ Animal con desarrollo normal");

  // Temperature estimate based on status
  const tempBase = animal.estado?.toLowerCase().includes("trat") ? "38.8" :
    animal.estado?.toLowerCase().includes("enfer") ? "39.2" : "38.5";

  return {
    pesoEstimado, bcs, bcsNum, estadoSalud, alertaNivel,
    gdpActual, gdpEsperado: ref.gdpMes,
    valorEstimado, proximoPesaje,
    recomendacion: recomendaciones[0] || "Animal en condición normal",
    recomendaciones, scoreDesarrollo,
    temperatura: tempBase, diasDesdeUltPesaje: diasDesde,
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   TIPOS
───────────────────────────────────────────────────────────────────────────── */
type BtStatus = "idle" | "scanning" | "connected" | "simulating" | "error";
type SerialStatus = "idle" | "connecting" | "connected" | "error";

interface PesajeRec {
  id: number; animalId: string; animalNombre: string;
  raza?: string; categoria: string; peso: number; pesoAnterior: number;
  fecha: string; hora: string; metodo: string; dispositivo: string;
  operador: string; observacion: string; lote: string;
  valorKilo?: number; valorTotal?: number;
  condicionCorporal?: string | number; temperatura?: string | number; estadoSanitario?: string;
  potreroActual?: string; observacionVet?: string; proximaVacuna?: string;
  iaScore?: number;
}

function fmt(n: number) {
  return new Intl.NumberFormat("es-CO", { style:"currency", currency:"COP", maximumFractionDigits:0 }).format(n);
}
function fmtDate() { return new Date().toLocaleDateString("es-CO"); }

/* ─────────────────────────────────────────────────────────────────────────────
   IMPRIMIR RECIBO — con granja, fecha, foto, IA
   Lee config de impresora desde ganader_printer_config y finca desde ganader_finca
───────────────────────────────────────────────────────────────────────────── */
function getPrinterConfig() {
  try { return JSON.parse(localStorage.getItem("ganader_printer_config") || "{}"); } catch { return {}; }
}
function getFincaConfig() {
  try { return JSON.parse(localStorage.getItem("ganader_finca") || "{}"); } catch { return {}; }
}

function imprimirRecibo(p: PesajeRec, _granja?: string, animal?: Animal, fromAutoCapture = false) {
  const finca   = getFincaConfig();
  const pcfg    = getPrinterConfig();
  const granja  = pcfg.headerLine1 || finca.nombre || _granja || "GanaderIA PRO";
  const line2   = pcfg.headerLine2 || "Ganadería Inteligente · Colombia";
  const footer  = pcfg.footerText  || `GanaderIA PRO · ${granja}`;
  const copies  = Math.max(1, parseInt(pcfg.copies || "1") || 1);
  const showIA  = pcfg.showIA    !== false;
  const showFoto= pcfg.showFoto  !== false;
  const showFirma= pcfg.showFirma !== false;
  const showValor= pcfg.showValor !== false;
  const showReg = pcfg.showReg   !== false;

  // Paper size → max-width
  const paperWidths: Record<string, string> = {
    thermal58: "220px", thermal80: "300px", a4: "680px", letter: "680px",
  };
  const maxW = paperWidths[pcfg.paperSize || "thermal80"] || "300px";
  const marginT = `${pcfg.marginTop  || 8}px`;
  const marginS = `${pcfg.marginSide || 10}px`;
  const diff = p.peso - p.pesoAnterior;
  const ref = getPesoRef(p.raza || "", p.categoria);
  const vt = p.peso * (p.valorKilo || 0);
  const rangoMsg = p.peso >= ref.min && p.peso <= ref.max ? "✓ Dentro del rango esperado"
    : p.peso < ref.min ? "⚠ Por debajo del mínimo de raza" : "↑ Sobre el promedio de raza";
  const foto = animal?.foto;

  /* Respect autoPrint toggle when triggered by auto-capture */
  if (fromAutoCapture && pcfg.autoPrint === false) return;

  const isNarrow = maxW === "220px" || maxW === "300px";
  const fontSize = isNarrow ? "10.5px" : "12px";

  const buildReceipt = () => `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<title>Recibo Pesaje — ${p.animalNombre}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Courier New',monospace;font-size:${fontSize};background:#fff;color:#111;padding:${marginT} ${marginS};max-width:${maxW};margin:0 auto}
  .header{text-align:center;border-bottom:2.5px solid #1a4a2e;padding-bottom:10px;margin-bottom:10px}
  .farm{font-size:${isNarrow?"15px":"18px"};font-weight:bold;color:#1a4a2e;letter-spacing:-0.5px}
  .sub{font-size:9px;color:#777;margin-top:2px}
  .title{font-size:${isNarrow?"11px":"13px"};font-weight:bold;margin-top:6px;text-transform:uppercase;letter-spacing:1px}
  .folio{font-size:9px;color:#999;margin-top:1px}
  .section{margin:8px 0;padding:7px;border:1px solid #ddd;border-radius:4px}
  .section-title{font-size:9px;font-weight:bold;text-transform:uppercase;color:#666;margin-bottom:5px;letter-spacing:.5px}
  .animal-header{display:flex;align-items:center;gap:8px;margin-bottom:6px}
  .animal-foto{width:52px;height:52px;border-radius:6px;object-fit:cover;border:1.5px solid #1a4a2e}
  .animal-foto-placeholder{width:52px;height:52px;border-radius:6px;background:#f0f7f0;border:1.5px solid #1a4a2e;display:flex;align-items:center;justify-content:center;font-size:22px}
  .animal-name{font-size:${isNarrow?"13px":"15px"};font-weight:bold;color:#1a4a2e}
  .animal-id{font-size:10px;color:#888}
  .row{display:flex;justify-content:space-between;padding:2.5px 0;border-bottom:1px dotted #eee}
  .row:last-child{border:none}
  .label{color:#666}
  .value{font-weight:bold}
  .peso-big{text-align:center;font-size:${isNarrow?"30px":"38px"};font-weight:bold;color:#1a4a2e;padding:8px 0}
  .peso-unit{font-size:13px;color:#666}
  .diff-pos{color:#1b5e20;font-weight:bold}
  .diff-neg{color:#b71c1c;font-weight:bold}
  .valor-box{text-align:center;font-size:${isNarrow?"13px":"16px"};font-weight:bold;color:#1a4a2e;padding:5px;background:#f0f7f0;border-radius:4px}
  .ref{font-size:9px;color:#888;text-align:center;margin-top:3px}
  .ia-box{background:#f0f0ff;border:1px solid #c4b5fd;border-radius:4px;padding:6px;margin-top:5px}
  .ia-title{font-size:9px;font-weight:bold;color:#6d28d9;margin-bottom:3px}
  .ia-row{font-size:9px;color:#555;padding:1.5px 0}
  .score-bar{height:6px;background:#e5e7eb;border-radius:3px;margin-top:3px}
  .score-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,#4ade80,#22c55e)}
  .footer{text-align:center;font-size:9px;color:#aaa;margin-top:12px;border-top:1px solid #eee;padding-top:7px}
  .firma{margin-top:36px;border-top:1px solid #333;padding-top:4px;text-align:center;font-size:9px;color:#666}
  @media print{body{padding:0}.no-print{display:none!important}}
</style></head><body>
<div class="header">
  <div class="farm">🐄 ${granja}</div>
  <div class="sub">${line2}</div>
  <div class="title">Recibo de Pesaje</div>
  <div class="folio">Folio #${p.id} · ${new Date().toLocaleDateString("es-CO",{weekday:"long",year:"numeric",month:"long",day:"numeric"})} · ${p.hora}</div>
</div>

<div class="section">
  <div class="section-title">Identificación del animal</div>
  <div class="animal-header">
    ${showFoto && foto ? `<img class="animal-foto" src="${foto}" alt="${p.animalNombre}"/>` : showFoto ? `<div class="animal-foto-placeholder">🐄</div>` : ""}
    <div>
      <div class="animal-name">${p.animalNombre}</div>
      <div class="animal-id">Arete: ${p.animalId}</div>
      <div class="animal-id">${p.raza || "—"} · ${p.categoria} · ${p.lote}</div>
    </div>
  </div>
  ${p.potreroActual ? `<div class="row"><span class="label">Potrero:</span><span class="value">${p.potreroActual}</span></div>` : ""}
</div>

<div class="section">
  <div class="section-title">Resultado del pesaje</div>
  <div class="peso-big">${p.peso.toFixed(1)} <span class="peso-unit">kg</span></div>
  <div class="row"><span class="label">Peso anterior:</span><span class="value">${p.pesoAnterior.toFixed(1)} kg</span></div>
  <div class="row"><span class="label">Variación:</span><span class="${diff >= 0 ? "diff-pos" : "diff-neg"}">${diff >= 0 ? "+" : ""}${diff.toFixed(1)} kg</span></div>
  ${p.condicionCorporal ? `<div class="row"><span class="label">Cond. corporal:</span><span class="value">${p.condicionCorporal}</span></div>` : ""}
  ${p.temperatura ? `<div class="row"><span class="label">Temperatura:</span><span class="value">${p.temperatura} °C</span></div>` : ""}
  ${p.estadoSanitario ? `<div class="row"><span class="label">Estado sanitario:</span><span class="value">${p.estadoSanitario}</span></div>` : ""}
  ${p.proximaVacuna ? `<div class="row"><span class="label">Próx. vacuna:</span><span class="value">${p.proximaVacuna}</span></div>` : ""}
  <div class="ref">${rangoMsg} · Rango raza: ${ref.min}–${ref.max} kg · Prom: ${ref.prom} kg</div>
</div>

${showValor && (p.valorKilo || 0) > 0 ? `<div class="section">
  <div class="section-title">Valorización</div>
  <div class="valor-box">${fmt(vt)}</div>
  <div class="ref">${fmt(p.valorKilo || 0)}/kg × ${p.peso.toFixed(1)} kg</div>
</div>` : ""}

${showIA && p.iaScore !== undefined ? `<div class="section">
  <div class="section-title">Análisis IA GanaderIA</div>
  <div class="ia-box">
    <div class="ia-title">🤖 Score de desarrollo: ${p.iaScore}/100</div>
    <div class="score-bar"><div class="score-fill" style="width:${p.iaScore}%"></div></div>
    <div class="ia-row">Referencia ${p.raza||"raza"}: Prom ${ref.prom} kg · GDP esp. ${ref.gdpMes} kg/mes</div>
    <div class="ia-row">${diff >= 0 ? "📈" : "📉"} Variación: ${diff >= 0 ? "+" : ""}${diff.toFixed(1)} kg vs anterior</div>
  </div>
</div>` : ""}

${showReg ? `<div class="section">
  <div class="section-title">Registro</div>
  <div class="row"><span class="label">Fecha y hora:</span><span class="value">${p.fecha} ${p.hora}</span></div>
  <div class="row"><span class="label">Operador:</span><span class="value">${p.operador}</span></div>
  <div class="row"><span class="label">Método:</span><span class="value">${p.metodo === "bluetooth" ? "Báscula BT" : p.metodo === "serial" ? "Báscula COM" : p.metodo === "simulated" ? "Simulado" : "Manual"}</span></div>
  ${p.dispositivo ? `<div class="row"><span class="label">Dispositivo:</span><span class="value">${p.dispositivo}</span></div>` : ""}
  ${p.observacion ? `<div class="row" style="flex-direction:column"><span class="label">Observación:</span><span style="margin-top:2px;font-size:9px">${p.observacion}</span></div>` : ""}
  ${p.observacionVet ? `<div class="row" style="flex-direction:column"><span class="label">Obs. veterinaria:</span><span style="margin-top:2px;font-size:9px">${p.observacionVet}</span></div>` : ""}
  <div class="row"><span class="label">Granja:</span><span class="value">${granja}</span></div>
</div>` : ""}

${showFirma ? `<div class="firma">Firma responsable: ___________________________</div>` : ""}
<div class="footer">${footer}<br>Sistema de Gestión Ganadera Inteligente · Colombia ${new Date().getFullYear()}<br><strong>Este recibo corresponde únicamente al animal indicado</strong><br>${new Date().toLocaleString("es-CO")}</div>

<div class="no-print" style="text-align:center;margin-top:14px;display:flex;gap:8px;justify-content:center">
  <button onclick="window.print()" style="background:#1a4a2e;color:white;border:none;padding:9px 20px;border-radius:6px;cursor:pointer;font-size:13px;font-family:sans-serif">🖨️ Imprimir</button>
  <button onclick="window.close()" style="background:#eee;color:#333;border:none;padding:9px 14px;border-radius:6px;cursor:pointer;font-size:13px;font-family:sans-serif">Cerrar</button>
</div></body></html>`;

  const winW = isNarrow ? 380 : 760;
  for (let i = 0; i < copies; i++) {
    const win = window.open("", "_blank", `width=${winW},height=780,scrollbars=yes`);
    if (win) { win.document.write(buildReceipt()); win.document.close(); }
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   IMPRESIÓN EN LOTE — tabla con todos los pesajes seleccionados
─────────────────────────────────────────────────────────────────────────────── */
function imprimirLote(pesajesLote: PesajeRec[], titulo = "Pesaje en Lote — GanaderIA PRO") {
  if (!pesajesLote.length) return;
  const finca   = getFincaConfig();
  const pcfg    = getPrinterConfig();
  const granja  = pcfg.headerLine1 || finca.nombre || "GanaderIA PRO";
  const subtitulo = pcfg.headerLine2 || "Ganadería Inteligente · Colombia";
  const footer  = pcfg.footerText   || "GanaderIA PRO · Gestión Ganadera Inteligente";
  const total   = pesajesLote.length;
  const pesoSum = pesajesLote.reduce((s, p) => s + p.peso, 0);
  const promedio = total > 0 ? pesoSum / total : 0;
  const valorSum = pesajesLote.reduce((s, p) => s + (p.peso * (p.valorKilo || 0)), 0);
  const diffPos  = pesajesLote.filter(p => p.peso >= p.pesoAnterior).length;
  const fmtCop = (n: number) => new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(n);
  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<title>${titulo}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Courier New',monospace;font-size:10px;background:#fff;color:#111;padding:14px 16px;max-width:920px;margin:0 auto}
.header{text-align:center;border-bottom:3px solid #1a4a2e;padding-bottom:10px;margin-bottom:12px}
.farm{font-size:20px;font-weight:bold;color:#1a4a2e}.sub{font-size:10px;color:#777;margin-top:2px}
.title{font-size:14px;font-weight:bold;margin-top:7px;text-transform:uppercase;letter-spacing:1.5px}
.meta{font-size:9px;color:#aaa;margin-top:3px}
.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:12px 0}
.kpi{text-align:center;padding:10px;background:#f0f7f0;border-radius:6px;border:1.5px solid #c8e6c9}
.kpi-val{font-size:17px;font-weight:bold;color:#1a4a2e}
.kpi-lbl{font-size:8px;color:#777;margin-top:3px;text-transform:uppercase}
table{width:100%;border-collapse:collapse;margin-top:10px;font-size:9px}
th{background:#1a4a2e;color:white;padding:6px 4px;text-align:left;font-size:8px;letter-spacing:.3px}
td{padding:4px;border-bottom:1px solid #eee}tr:nth-child(even)td{background:#f8faf8}
.pos{color:#1b5e20;font-weight:bold}.neg{color:#b71c1c;font-weight:bold}
.stitle{font-size:11px;font-weight:bold;color:#1a4a2e;margin:12px 0 5px;text-transform:uppercase;letter-spacing:.7px}
.footer{text-align:center;font-size:8.5px;color:#bbb;margin-top:14px;border-top:1px solid #eee;padding-top:8px}
@media print{body{padding:0}.no-print{display:none!important}}
</style></head><body>
<div class="header">
  <div class="farm">🐄 ${granja}</div><div class="sub">${subtitulo}</div>
  <div class="title">${titulo}</div>
  <div class="meta">Generado: ${new Date().toLocaleString("es-CO")} · Folio lote: #L${Date.now().toString().slice(-6)}</div>
</div>
<div class="kpis">
  <div class="kpi"><div class="kpi-val">${total}</div><div class="kpi-lbl">Animales</div></div>
  <div class="kpi"><div class="kpi-val">${promedio.toFixed(1)} kg</div><div class="kpi-lbl">Promedio</div></div>
  <div class="kpi"><div class="kpi-val">${diffPos}/${total}</div><div class="kpi-lbl">Con ganancia</div></div>
  <div class="kpi"><div class="kpi-val">${valorSum>0?fmtCop(valorSum):pesoSum.toFixed(0)+" kg"}</div><div class="kpi-lbl">${valorSum>0?"Valor total":"Peso total"}</div></div>
</div>
<div class="stitle">Detalle de pesajes</div>
<table><thead><tr><th>#</th><th>Animal</th><th>ID</th><th>Raza</th><th>Cat.</th><th>Lote</th><th>Peso</th><th>Anterior</th><th>Variación</th><th>CC</th><th>Método</th><th>Fecha · Hora</th></tr></thead>
<tbody>${pesajesLote.map((p,i)=>{
  const diff=p.peso-p.pesoAnterior;
  const mb=p.metodo==="bluetooth"?"BT":p.metodo==="serial"?"COM":p.metodo==="simulated"?"SIM":"MAN";
  return `<tr><td style="color:#999">${i+1}</td><td><strong>${p.animalNombre}</strong></td><td style="font-size:8px;color:#888">${p.animalId}</td><td>${p.raza||"—"}</td><td>${p.categoria}</td><td>${p.lote}</td><td><strong>${p.peso.toFixed(1)}</strong></td><td>${p.pesoAnterior.toFixed(1)}</td><td class="${diff>=0?"pos":"neg"}">${diff>=0?"+":""}${diff.toFixed(1)}</td><td>${p.condicionCorporal||"—"}</td><td style="font-size:8px">${mb}</td><td style="font-size:8px">${p.fecha} ${p.hora}</td></tr>`;
}).join("")}</tbody></table>
<div class="stitle">Resumen</div>
<table style="width:45%;font-size:9px"><tbody>
  <tr><td>Total animales</td><td><strong>${total}</strong></td></tr>
  <tr><td>Peso total</td><td><strong>${pesoSum.toFixed(1)} kg</strong></td></tr>
  <tr><td>Peso promedio</td><td><strong>${promedio.toFixed(1)} kg</strong></td></tr>
  <tr><td>Mínimo / Máximo</td><td><strong>${Math.min(...pesajesLote.map(p=>p.peso)).toFixed(1)} / ${Math.max(...pesajesLote.map(p=>p.peso)).toFixed(1)} kg</strong></td></tr>
  <tr><td>Con ganancia</td><td><strong>${diffPos} animales (${Math.round(diffPos/total*100)}%)</strong></td></tr>
  ${valorSum>0?`<tr><td>Valor total</td><td><strong>${fmtCop(valorSum)}</strong></td></tr>`:""}
</tbody></table>
<div class="footer">${footer}<br>GanaderIA PRO · Colombia ${new Date().getFullYear()}</div>
<div class="no-print" style="text-align:center;margin-top:14px;display:flex;gap:10px;justify-content:center">
  <button onclick="window.print()" style="background:#1a4a2e;color:white;border:none;padding:10px 24px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:bold">🖨️ Imprimir Lote</button>
  <button onclick="window.close()" style="background:#eee;color:#333;border:none;padding:10px 16px;border-radius:8px;cursor:pointer;font-size:13px">Cerrar</button>
</div></body></html>`;
  const win = window.open("", "_blank", "width=980,height=900,scrollbars=yes");
  if (win) { win.document.write(html); win.document.close(); }
}

/* ─────────────────────────────────────────────────────────────────────────────
   LIVE SCALE DISPLAY
───────────────────────────────────────────────────────────────────────────── */
function LiveScale({ weight, stability, stable, status, onCapture, autoCapture, connectionLabel }: {
  weight: number | null; stability: number; stable: boolean;
  status: BtStatus | SerialStatus; onCapture: () => void; autoCapture: boolean;
  connectionLabel?: string;
}) {
  const connected = status === "connected" || status === "simulating";
  return (
    <div className="relative rounded-2xl overflow-hidden flex flex-col items-center justify-center py-8 px-6" style={{
      background: stable ? "linear-gradient(145deg,rgba(57,255,126,0.08),rgba(0,200,100,0.04))"
        : connected ? "linear-gradient(145deg,rgba(255,149,0,0.06),rgba(255,100,0,0.03))"
        : "rgba(255,255,255,0.02)",
      border: stable ? "1px solid rgba(57,255,126,0.4)" : connected ? "1px solid rgba(255,149,0,0.3)" : "1px solid rgba(255,255,255,0.08)",
      boxShadow: stable ? "0 0 32px rgba(57,255,126,0.15)" : "none",
      minHeight: 180,
    }}>
      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold" style={{
        background: status==="connected"?"rgba(57,255,126,0.12)":status==="simulating"?"rgba(0,200,255,0.12)":"rgba(255,255,255,0.05)",
        border: `1px solid ${status==="connected"?"rgba(57,255,126,0.4)":status==="simulating"?"rgba(0,200,255,0.35)":"rgba(255,255,255,0.1)"}`,
        color: status==="connected"?"#39ff7e":status==="simulating"?"#00c8ff":"#666",
      }}>
        {status==="connected"&&<><BluetoothConnected size={10}/>{connectionLabel||"Báscula conectada"}</>}
        {status==="simulating"&&<><Activity size={10} className="animate-pulse"/>Simulación activa</>}
        {(status==="scanning"||status==="connecting")&&<><BluetoothSearching size={10} className="animate-pulse"/>Buscando…</>}
        {(status==="idle"||status==="error")&&<><BluetoothOff size={10}/>Sin conexión</>}
      </div>
      {connected && weight !== null ? (
        <>
          <div className="font-black text-center leading-none mb-3 transition-all" style={{
            fontSize:"clamp(48px,9vw,76px)", fontFamily:"'Sora',monospace",
            color: stable?"#39ff7e":"#ff9500",
            textShadow: stable?"0 0 30px rgba(57,255,126,0.6)":"0 0 20px rgba(255,149,0,0.5)",
            letterSpacing:"-0.02em",
          }}>
            {weight.toFixed(1)}<span className="text-xl ml-2 font-bold" style={{color:"rgba(255,255,255,0.35)",textShadow:"none"}}>kg</span>
          </div>
          <div className="w-full max-w-[240px] mb-3">
            <div className="flex justify-between text-[10px] mb-1" style={{color:"rgba(255,255,255,0.3)"}}>
              <span>Estabilidad</span><span className={stable?"text-green-400 font-bold":""}>{stability}%</span>
            </div>
            <div className="h-2 rounded-full" style={{background:"rgba(255,255,255,0.08)"}}>
              <div className="h-2 rounded-full transition-all duration-300" style={{
                width:`${stability}%`,
                background: stability>=90?"linear-gradient(90deg,#39ff7e,#00f5d4)":stability>=50?"linear-gradient(90deg,#fbbf24,#f59e0b)":"linear-gradient(90deg,#f87171,#ef4444)",
                boxShadow: stability>=90?"0 0 8px rgba(57,255,126,0.5)":"none",
              }}/>
            </div>
          </div>
          {stable ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-green-400">
                <CheckCircle2 size={13}/>Peso estable — Listo
              </div>
              <Button onClick={onCapture} className="gap-2 font-bold h-10 px-5"
                style={{background:"linear-gradient(135deg,#39ff7e,#00c864)",color:"#052010",boxShadow:"0 0 20px rgba(57,255,126,0.4)"}}>
                <Target size={15}/>Capturar peso
              </Button>
              {autoCapture&&<p className="text-[10px] text-green-400/50">Auto-captura activa</p>}
            </div>
          ) : (
            <p className="text-xs animate-pulse mt-1" style={{color:"rgba(255,149,0,0.7)"}}>Pesando… mantener animal quieto</p>
          )}
        </>
      ) : (
        <div className="text-center">
          <Scale size={44} className="mx-auto mb-2 opacity-10"/>
          <p className="text-sm" style={{color:"rgba(255,255,255,0.25)"}}>
            {(status==="scanning"||status==="connecting")?"Buscando báscula…":"Conectar báscula para ver peso en vivo"}
          </p>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ANIMAL CARD (compact, in selector list)
───────────────────────────────────────────────────────────────────────────── */
function AnimalCard({ animal, pesajes, selected, onSelect, onQueue }: {
  animal: Animal; pesajes: Pesaje[]; selected: boolean;
  onSelect: () => void; onQueue: () => void;
}) {
  const ref = getPesoRef(animal.raza, animal.categoria);
  const ia = computeIA(animal, pesajes);
  const lastP = pesajes.filter(p => p.animalId === animal.id).sort((a,b)=>b.id-a.id)[0];
  const pesoActual = lastP?.peso ?? animal.peso;
  const pctRef = Math.min(100, Math.round((pesoActual / ref.prom) * 100));
  const alertColor = ia.alertaNivel==="critico"?"#f87171":ia.alertaNivel==="alerta"?"#fbbf24":"#39ff7e";
  const catColors: Record<string,string> = { "Vaca adulta":"#00c8ff","Novilla":"#c084fc","Toro":"#fb923c","Ternero":"#fbbf24","Ternera":"#f9a8d4","Novillo":"#a3e635" };
  const catC = catColors[animal.categoria] || "#94a3b8";

  return (
    <div onClick={onSelect} className="relative rounded-2xl overflow-hidden cursor-pointer transition-all group"
      style={{
        background: selected?"linear-gradient(145deg,rgba(0,245,212,0.1),rgba(0,200,180,0.05))":"rgba(255,255,255,0.02)",
        border: selected?"1.5px solid rgba(0,245,212,0.5)":"1px solid rgba(255,255,255,0.07)",
        boxShadow: selected?"0 0 16px rgba(0,245,212,0.12)":"none",
      }}>
      {selected && <div className="absolute top-0 left-0 right-0 h-0.5" style={{background:"linear-gradient(90deg,#00f5d4,#00c8ff)"}}/>}
      <div className="p-3 flex gap-3 items-center">
        {/* Photo / Avatar */}
        <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden"
          style={{border:`1.5px solid ${alertColor}40`,boxShadow:`0 0 8px ${alertColor}20`}}>
          {animal.foto
            ? <img src={animal.foto} alt={animal.nombre} className="w-full h-full object-cover"/>
            : <div className="w-full h-full flex items-center justify-center text-xl"
                style={{background:`linear-gradient(135deg,rgba(0,245,212,0.08),rgba(45,122,79,0.12))`}}>
                🐄
              </div>
          }
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-sm text-white truncate">{animal.nombre}</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold" style={{background:`${catC}18`,color:catC,border:`1px solid ${catC}35`}}>{animal.categoria}</span>
            <div className="ml-auto w-2 h-2 rounded-full flex-shrink-0" style={{background:alertColor,boxShadow:`0 0 4px ${alertColor}`}}/>
          </div>
          <div className="text-[10px] text-white/40 mt-0.5">{animal.id} · {animal.raza} · {animal.lote}</div>
          {/* Weight bar */}
          <div className="mt-1.5">
            <div className="flex justify-between text-[9px] mb-0.5">
              <span style={{color:"rgba(0,245,212,0.5)"}}>{pesoActual} kg</span>
              <span style={{color:"rgba(255,255,255,0.25)"}}>{pctRef}% ref</span>
            </div>
            <div className="h-1 rounded-full" style={{background:"rgba(255,255,255,0.06)"}}>
              <div className="h-full rounded-full" style={{
                width:`${pctRef}%`,
                background: pctRef>=95&&pctRef<=110?"linear-gradient(90deg,#39ff7e,#00f5d4)":pctRef<85?"linear-gradient(90deg,#f87171,#fb923c)":"linear-gradient(90deg,#fbbf24,#f59e0b)",
              }}/>
            </div>
          </div>
        </div>
        {/* Queue button */}
        <button onClick={e=>{e.stopPropagation();onQueue();}} className="w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          style={{background:"rgba(0,245,212,0.1)",border:"1px solid rgba(0,245,212,0.25)",color:"#00f5d4"}}>
          <Plus size={12}/>
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   IA PANEL
───────────────────────────────────────────────────────────────────────────── */
function IAPanel({ animal, pesajes, ia, valorKilo }: { animal: Animal|null; pesajes: Pesaje[]; ia: IAPrediccion|null; valorKilo: number }) {
  if (!animal || !ia) return (
    <div className="rounded-2xl p-5 flex flex-col items-center justify-center" style={{background:"rgba(139,92,246,0.04)",border:"1px solid rgba(139,92,246,0.15)",minHeight:200}}>
      <Brain size={32} className="opacity-20 mb-2" style={{color:"#c084fc"}}/>
      <p className="text-xs text-white/25 text-center">Selecciona un animal para ver el análisis IA</p>
    </div>
  );

  const ref = getPesoRef(animal.raza, animal.categoria);
  const alertColor = ia.alertaNivel==="critico"?"#f87171":ia.alertaNivel==="alerta"?"#fbbf24":"#39ff7e";
  const historial = pesajes.filter(p=>p.animalId===animal.id).sort((a,b)=>a.id-b.id).slice(-6);

  return (
    <div className="rounded-2xl overflow-hidden" style={{background:"linear-gradient(145deg,rgba(139,92,246,0.06),rgba(99,102,241,0.04))",border:"1px solid rgba(139,92,246,0.2)"}}>
      <div className="h-0.5" style={{background:"linear-gradient(90deg,#c084fc,#818cf8)"}}/>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{background:"rgba(192,132,252,0.15)",border:"1px solid rgba(192,132,252,0.35)"}}>
            <Brain size={14} style={{color:"#c084fc"}}/>
          </div>
          <span className="font-black text-sm text-white">Asistente IA</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold ml-auto" style={{background:"rgba(192,132,252,0.15)",color:"#c084fc",border:"1px solid rgba(192,132,252,0.25)"}}>
            🤖 GanaderIA
          </span>
        </div>

        {/* Score */}
        <div className="rounded-xl p-3 mb-3" style={{background:"rgba(0,0,0,0.2)"}}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-white/40 uppercase tracking-wider">Score Desarrollo</span>
            <span className="font-black text-lg" style={{color:alertColor}}>{ia.scoreDesarrollo}</span>
          </div>
          <div className="h-2 rounded-full" style={{background:"rgba(255,255,255,0.07)"}}>
            <div className="h-2 rounded-full transition-all" style={{width:`${ia.scoreDesarrollo}%`,background:`linear-gradient(90deg,${alertColor},${alertColor}88)`,boxShadow:`0 0 6px ${alertColor}55`}}/>
          </div>
          <div className="flex justify-between text-[9px] mt-1" style={{color:"rgba(255,255,255,0.2)"}}>
            <span>0</span><span>100</span>
          </div>
        </div>

        {/* Key metrics grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[
            { label:"Peso estimado",  value:`${ia.pesoEstimado} kg`,  icon:"⚖️",  color:"#00f5d4" },
            { label:"Cond. corporal", value:ia.bcs.split("—")[0].trim(), icon:"💪",  color:alertColor },
            { label:"GDP actual",     value:`${ia.gdpActual} kg/mes`, icon:"📈",  color: ia.gdpActual>=ia.gdpEsperado?"#39ff7e":"#fbbf24" },
            { label:"Valor est.",     value:fmt(ia.valorEstimado),    icon:"💰",  color:"#fbbf24" },
          ].map(m=>(
            <div key={m.label} className="rounded-xl p-2.5" style={{background:"rgba(0,0,0,0.2)",border:"1px solid rgba(255,255,255,0.05)"}}>
              <div className="text-sm mb-0.5">{m.icon}</div>
              <div className="font-bold text-xs" style={{color:m.color}}>{m.value}</div>
              <div className="text-[9px] text-white/30">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Estado */}
        <div className="rounded-xl p-2.5 mb-3 flex items-center gap-2" style={{background:`${alertColor}10`,border:`1px solid ${alertColor}30`}}>
          <div className="text-sm">{ia.alertaNivel==="ok"?"✅":ia.alertaNivel==="alerta"?"⚠️":"🚨"}</div>
          <div>
            <div className="text-[10px] font-bold" style={{color:alertColor}}>{ia.estadoSalud}</div>
            <div className="text-[9px] text-white/40">{ia.bcs}</div>
          </div>
        </div>

        {/* Ref comparison */}
        <div className="rounded-xl p-2.5 mb-3" style={{background:"rgba(0,0,0,0.15)"}}>
          <div className="text-[9px] text-white/30 uppercase tracking-wider mb-2">vs Referencia de raza</div>
          <div className="flex items-center gap-2 text-[10px]">
            <span style={{color:"rgba(255,255,255,0.4)"}}>{ref.min} kg</span>
            <div className="flex-1 h-2 rounded-full relative" style={{background:"rgba(255,255,255,0.07)"}}>
              <div className="absolute inset-y-0 rounded-full" style={{
                left:`${((ref.min)/ref.max*100)}%`,
                right:`${100-((ref.prom+60)/ref.max*100)}%`,
                background:"rgba(0,245,212,0.2)",
              }}/>
              <div className="absolute w-2 h-2 rounded-full top-0" style={{
                left:`${Math.min(100,(ia.pesoEstimado/ref.max)*100)}%`,
                background:alertColor,
                boxShadow:`0 0 4px ${alertColor}`,
                transform:"translateX(-50%)",
              }}/>
            </div>
            <span style={{color:"rgba(255,255,255,0.4)"}}>{ref.max} kg</span>
          </div>
          <div className="text-[9px] text-center mt-1" style={{color:"rgba(255,255,255,0.25)"}}>Prom raza: {ref.prom} kg · GDP esp: {ref.gdpMes} kg/mes</div>
        </div>

        {/* Mini chart */}
        {historial.length >= 2 && (
          <div className="mb-3">
            <div className="text-[9px] text-white/25 uppercase tracking-wider mb-1.5">Evolución de peso</div>
            <ResponsiveContainer width="100%" height={70}>
              <BarChart data={historial.map(p=>({ fecha:p.fecha.split("/").slice(0,2).join("/"), peso:p.peso }))} barSize={8}>
                <XAxis dataKey="fecha" tick={{fontSize:7,fill:"rgba(255,255,255,0.25)"}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:"#111",border:"1px solid rgba(0,245,212,0.2)",borderRadius:"8px",fontSize:10}} labelStyle={{color:"rgba(255,255,255,0.5)"}} itemStyle={{color:"#00f5d4"}}/>
                <ReferenceLine y={ref.prom} stroke="rgba(0,245,212,0.3)" strokeDasharray="3 3"/>
                <Bar dataKey="peso" fill="#00f5d4" fillOpacity={0.7} radius={[3,3,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recommendations */}
        <div className="space-y-1">
          {ia.recomendaciones.slice(0,3).map((r,i)=>(
            <div key={i} className="text-[9px] px-2 py-1.5 rounded-lg" style={{background:"rgba(255,255,255,0.04)",color:"rgba(255,255,255,0.55)"}}>
              {r}
            </div>
          ))}
        </div>

        <div className="mt-3 text-[9px] text-center" style={{color:"rgba(192,132,252,0.4)"}}>
          Próx. pesaje recomendado: <strong style={{color:"rgba(192,132,252,0.7)"}}>{ia.proximoPesaje}</strong>
          {ia.diasDesdeUltPesaje > 0 && <span className="ml-1 text-white/25">· hace {ia.diasDesdeUltPesaje}d</span>}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   COMPONENTE PRINCIPAL
───────────────────────────────────────────────────────────────────────────── */
export default function Pesaje() {
  const { animals, pesajes, setPesajes, setAnimals, potreros } = useAppState();
  const { user } = useAuth();

  /* ── Bluetooth ── */
  const [btStatus, setBtStatus]       = useState<BtStatus>("idle");
  const [selBt, setSelBt]             = useState(BT_CONTROLLERS[0]);
  const [btError, setBtError]         = useState("");
  const btDeviceRef                   = useRef<any>(null);

  /* ── COM/Serial ── */
  const [serialStatus, setSerialStatus] = useState<SerialStatus>("idle");
  const [selCom, setSelCom]             = useState(COM_CONTROLLERS[0]);
  const [serialError, setSerialError]   = useState("");
  const serialPortRef                   = useRef<any>(null);
  const serialReaderRef                 = useRef<any>(null);

  /* ── COM custom port params ── */
  const [showComPortParams, setShowComPortParams] = useState(false);
  const [comCustomBaud,     setComCustomBaud]     = useState("");
  const [comCustomDataBits, setComCustomDataBits] = useState("");
  const [comCustomStopBits, setComCustomStopBits] = useState("");
  const [comCustomParity,   setComCustomParity]   = useState("");

  /* ── Live weight ── */
  const [liveWeight, setLiveWeight]   = useState<number | null>(null);
  const [stability, setStability]     = useState(0);
  const [stable, setStable]           = useState(false);
  const [autoCapture, setAutoCapture] = useState(false);
  const weightSamplesRef              = useRef<number[]>([]);
  const simRef                        = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Trama serial ── */
  const selTramaRef                   = useRef<TramaType>(TRAMA_TYPES[0]);
  const customRegexRef                = useRef("([0-9]{2,4}\\.?\\d{0,2})");
  const [selTrama, setSelTrama]       = useState<TramaType>(TRAMA_TYPES[0]);
  const [customRegex, setCustomRegex] = useState("([0-9]{2,4}\\.?\\d{0,2})");
  const [showTramaConfig, setShowTramaConfig] = useState(false);
  const [lastRawFrame, setLastRawFrame] = useState("");

  /* ── Modo operación ── */
  const [modoOperacion, setModoOperacion] = useState<"continuo"|"pausado">("pausado");

  /* ── Filters ── */
  const [searchAnim, setSearchAnim]   = useState("");
  const [filterRaza, setFilterRaza]   = useState("Todas");
  const [filterCat, setFilterCat]     = useState("Todas");
  const [filterLote, setFilterLote]   = useState("Todos");
  const [filterEstado, setFilterEstado] = useState("Todos");
  const [showFilters, setShowFilters] = useState(false);

  /* ── Animal selection ── */
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(animals[0] || null);

  /* ── Queue ── */
  const [queueMode, setQueueMode]     = useState(false);
  const [animalQueue, setAnimalQueue] = useState<string[]>([]);
  const [queueIdx, setQueueIdx]       = useState(0);

  /* ── Tab ── */
  const [connTab, setConnTab]         = useState<"bt"|"com"|"manual">("bt");
  const [mainTab, setMainTab]         = useState<"bascula"|"manual"|"historial"|"estadisticas"|"config">("bascula");

  /* ── Capture dialog ── */
  const [captureDialogOpen, setCaptureDialogOpen] = useState(false);
  const [capturedWeight, setCapturedWeight]       = useState(0);
  const [detCondicion, setDetCondicion]           = useState("3.0");
  const [detTemperatura, setDetTemperatura]       = useState("");
  const [detEstadoSan, setDetEstadoSan]           = useState("Sano");
  const [detPotrero, setDetPotrero]               = useState("");
  const [detObsVet, setDetObsVet]                 = useState("");
  const [detProxVac, setDetProxVac]               = useState("");
  const [detValorKilo, setDetValorKilo]           = useState("11000");
  const [detObs, setDetObs]                       = useState("");
  const [detIAAccepted, setDetIAAccepted]         = useState(true);

  /* ── Manual entry ── */
  const [manualPeso, setManualPeso]   = useState("");
  const [manualAnimalId, setManualAnimalId] = useState(animals[0]?.id || "");
  const [manualOpen, setManualOpen]   = useState(false);

  /* ── New animal form ── */
  const [showNewAnimal, setShowNewAnimal] = useState(false);
  const [newAId, setNewAId]       = useState("");
  const [newANombre, setNewANombre] = useState("");
  const [newARaza, setNewARaza]   = useState("Holstein");
  const [newACat, setNewACat]     = useState("Vaca adulta");
  const [newALote, setNewALote]   = useState("Lote A");
  const [newAFoto, setNewAFoto]   = useState<string | null>(null);
  const [newAFotoName, setNewAFotoName] = useState("");
  const [newAFechaNac, setNewAFechaNac] = useState("");
  const [newARegistro, setNewARegistro] = useState("NO");
  const [newANumReg, setNewANumReg] = useState("");
  const fotoInputRef              = useRef<HTMLInputElement>(null);

  /* ── Scale administration ── */
  const [cfgDevs, setCfgDevs]         = useState<Record<string, ScaleDeviceConfig>>(() => loadDeviceConfigs());
  const [customTramas, setCustomTramas] = useState<CustomTrama[]>(() => loadCustomTramas());
  const [printTmpl, setPrintTmpl]     = useState<PrintTemplate>(() => loadPrintTemplate());
  const [histSelected, setHistSelected] = useState<Set<number>>(new Set());
  const [batchSelectMode, setBatchSelectMode] = useState(false);
  const [newTramaForm, setNewTramaForm] = useState({ nombre:"", regex:"([0-9]{3,4})", icon:"🔧", color:"#94a3b8", ejemplo:"" });
  const [newTramaTest, setNewTramaTest] = useState("");
  const [showNewTramaForm, setShowNewTramaForm] = useState(false);
  const [showBtTramaConfig, setShowBtTramaConfig] = useState(false);
  const [btTramaId, setBtTramaId]     = useState("civac_9b");
  const [configSaved, setConfigSaved] = useState(false);

  /* ── Sistema Config ── */
  const [sistemaCfg, setSistemaCfgState]   = useState<SistemaConfig>(loadSistemaCfgFromStorage);
  const [sistemaCfgEdit, setSistemaCfgEdit] = useState<SistemaConfig>(loadSistemaCfgFromStorage);
  const [sistemaCfgOpen, setSistemaCfgOpen] = useState(false);
  const [sistemaSaved, setSistemaSaved]     = useState(false);
  const [tramaDbStats, setTramaDbStats]     = useState<{total:number;capturadas:number;avgPeso:number}|null>(null);
  const [showWinDrivers, setShowWinDrivers] = useState(false);

  /* ── Stats ── */
  const hoy = pesajes.filter(p => p.fecha === fmtDate()).length;

  /* ── Derived ── */
  const manualAnimal = animals.find(a => a.id === manualAnimalId) || animals[0] || null;
  const ia = selectedAnimal ? computeIA(selectedAnimal, pesajes, Number(detValorKilo)||11000) : null;
  const manualIa = manualAnimal ? computeIA(manualAnimal, pesajes) : null;

  /* Distinct filter options */
  const razas  = ["Todas", ...Array.from(new Set(animals.map(a=>a.raza))).sort()];
  const cats   = ["Todas", ...Array.from(new Set(animals.map(a=>a.categoria))).sort()];
  const lotes  = ["Todos", ...Array.from(new Set(animals.map(a=>a.lote))).sort()];
  const estados = ["Todos", ...Array.from(new Set(animals.map(a=>a.estado))).sort()];

  const filtered = animals.filter(a => {
    const q = searchAnim.toLowerCase();
    const matchSearch = !q || a.nombre.toLowerCase().includes(q) || a.id.toLowerCase().includes(q) || a.raza.toLowerCase().includes(q);
    const matchRaza   = filterRaza  === "Todas"  || a.raza      === filterRaza;
    const matchCat    = filterCat   === "Todas"  || a.categoria === filterCat;
    const matchLote   = filterLote  === "Todos"  || a.lote      === filterLote;
    const matchEst    = filterEstado=== "Todos"  || a.estado    === filterEstado;
    return matchSearch && matchRaza && matchCat && matchLote && matchEst;
  });

  /* ── Stability ── */
  const updateStabilityFromSamples = useCallback((w: number) => {
    const samples = weightSamplesRef.current;
    samples.push(w);
    if (samples.length > 8) samples.shift();
    if (samples.length < 4) { setStability(Math.min(40, samples.length*10)); setStable(false); return; }
    const avg = samples.reduce((a,b)=>a+b,0)/samples.length;
    const maxDev = Math.max(...samples.map(s=>Math.abs(s-avg)));
    const pct = Math.max(0, Math.min(100, Math.round(100 - maxDev*20)));
    setStability(pct);
    setStable(pct>=90 && samples.length>=6);
  }, []);

  /* ── Simulation ── */
  const startSimulation = useCallback((animal?: Animal|null) => {
    if (simRef.current) clearInterval(simRef.current);
    weightSamplesRef.current = [];
    const base = animal
      ? getPesoRef(animal.raza, animal.categoria).prom
      : getPesoRef(selectedAnimal?.raza||"", selectedAnimal?.categoria||"").prom;
    let ticks = 0;
    simRef.current = setInterval(() => {
      ticks++;
      const noise = ticks < 6 ? (Math.random()-0.5)*10 : (Math.random()-0.5)*1.2;
      const w = +(base+noise).toFixed(1);
      setLiveWeight(w); updateStabilityFromSamples(w);
    }, 550);
  }, [selectedAnimal, updateStabilityFromSamples]);

  /* ── Bluetooth ── */
  const connectBluetooth = async () => {
    setBtStatus("scanning"); setBtError(""); weightSamplesRef.current = [];
    if ("bluetooth" in navigator) {
      try {
        const device = await (navigator as any).bluetooth.requestDevice({
          filters: [...selBt.nameFilter.map(p=>({namePrefix:p})), {services:["weight_scale"]}],
          optionalServices: ["weight_scale","0000181d-0000-1000-8000-00805f9b34fb","6e400001-b5a3-f393-e0a9-e50e24dcca9e","battery_service"],
        });
        btDeviceRef.current = device;
        const server = await device.gatt!.connect();
        let ok = false;
        try {
          const svc  = await server.getPrimaryService("weight_scale");
          const char = await svc.getCharacteristic("weight_measurement");
          await char.startNotifications();
          char.addEventListener("characteristicvaluechanged", (e: Event) => {
            const val = (e.target as any).value as DataView;
            const flags = val.getUint8(0); const unit = flags & 0x01;
            const raw = val.getUint16(1, true);
            const w = unit===0 ? raw*0.005 : raw*0.01*0.453592;
            const r = Math.round(w*10)/10; setLiveWeight(r); updateStabilityFromSamples(r);
          });
          ok = true;
        } catch {}
        if (!ok) {
          try {
            const svc  = await server.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");
            const char = await svc.getCharacteristic("6e400003-b5a3-f393-e0a9-e50e24dcca9e");
            await char.startNotifications();
            char.addEventListener("characteristicvaluechanged", (e: Event) => {
              const text = new TextDecoder().decode((e.target as any).value);
              const m = text.match(/(?:W0*|STW,\s*|[+\-]\s*)?(\d{2,4}\.?\d{0,2})/);
              if (m) { const w = parseFloat(m[1]); if (w>0&&w<3000) { setLiveWeight(Math.round(w*10)/10); updateStabilityFromSamples(w); } }
            });
            ok = true;
          } catch {}
        }
        if (ok) {
          setBtStatus("connected");
          // Persistir último dispositivo BT localmente (offline-first)
          saveLastBtDevice({ id: device.id || `BT-${Date.now()}`, name: device.name || selBt.nombre, controllerId: selBt.id, lastSeen: Date.now(), address: device.id });
          device.addEventListener("gattserverdisconnected", () => { setBtStatus("idle"); setLiveWeight(null); setStable(false); setStability(0); weightSamplesRef.current=[]; });
          return;
        }
        server.disconnect();
      } catch (err: unknown) {
        const e = err as {name?:string;message?:string};
        if (e?.name==="NotFoundError" || e?.name==="NotAllowedError") { setBtStatus("idle"); return; }
        setBtError(`Error BT: ${e?.message||String(err)}`); setBtStatus("error"); return;
      }
    }
    setBtStatus("error");
    setBtError("No se pudo leer un peso real de la báscula. Comprueba que el dispositivo sea compatible con la controladora seleccionada; no se usarán datos simulados.");
  };

  const disconnectBluetooth = () => {
    if (simRef.current) { clearInterval(simRef.current); simRef.current=null; }
    if (btDeviceRef.current?.gatt?.connected) btDeviceRef.current.gatt.disconnect();
    btDeviceRef.current = null;
    setBtStatus("idle"); setLiveWeight(null); setStable(false); setStability(0); weightSamplesRef.current=[]; setBtError("");
  };

  /* ── Serial ── */
  const connectSerial = async () => {
    if (!("serial" in navigator)) { setSerialError("Web Serial no soportado. Usa Chrome/Edge."); setSerialStatus("error"); return; }
    setSerialStatus("connecting"); setSerialError(""); weightSamplesRef.current=[];
    try {
      const port = await (navigator as any).serial.requestPort();
      /* Use custom params if user overrode them, otherwise fall back to controller defaults */
      const openOpts = {
        baudRate:  comCustomBaud     ? parseInt(comCustomBaud)               : selCom.baudRate,
        dataBits:  comCustomDataBits ? parseInt(comCustomDataBits)           : selCom.dataBits,
        stopBits:  comCustomStopBits ? parseFloat(comCustomStopBits)         : selCom.stopBits,
        parity:    (comCustomParity  || selCom.parity) as "none"|"even"|"odd",
        flowControl: "none" as const,
      };
      await port.open(openOpts);
      serialPortRef.current = port;
      setSerialStatus("connected");
      const reader = port.readable.getReader();
      serialReaderRef.current = reader;
      const byteDecoder = new TextDecoder("ascii", { fatal: false });
      let buffer = "";
      const readLoop = async () => {
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            /* Decode raw bytes — handles both binary frames (CIVAC) and ASCII lines */
            buffer += byteDecoder.decode(value, { stream: true });
            /* Bound buffer to avoid memory growth */
            if (buffer.length > 4096) buffer = buffer.slice(-2048);

            /* Use the currently selected trama parser (always reads from ref for freshness) */
            const trama = selTramaRef.current;
            let activeParse = trama.parse;
            if (trama.id === "custom_regex") {
              activeParse = (buf: string): TramaFrame[] => {
                const frames: TramaFrame[] = [];
                try {
                  const re = new RegExp(customRegexRef.current, "i");
                  buf.split(/\r?\n/).forEach(line => {
                    const m = line.match(re);
                    if (m?.[1]) { const w = parseFloat(m[1]); if (w > 10 && w < 3000) frames.push({ peso: w, stable: false, raw: line }); }
                  });
                } catch {}
                return frames;
              };
            }

            const frames = activeParse(buffer);
            if (frames.length > 0) {
              const last = frames[frames.length - 1];
              setLastRawFrame(last.raw.replace(/[\r\n]/g, "↵").slice(0, 40));
              const w = Math.round(last.peso * 10) / 10;
              setLiveWeight(w);

              if (trama.estabilidad_directa) {
                if (last.stable) {
                  /* Scale reports stable — override stability immediately */
                  weightSamplesRef.current = [w, w, w, w, w, w];
                  setStability(100);
                  setStable(true);
                } else {
                  /* Scale reports moving — reset stability */
                  weightSamplesRef.current = [];
                  setStability(20);
                  setStable(false);
                }
              } else {
                updateStabilityFromSamples(w);
              }

              /* Trim buffer: for fixed-frame tramas keep only unprocessed tail */
              const lastPos = buffer.lastIndexOf(last.raw);
              if (lastPos >= 0) {
                buffer = buffer.slice(lastPos + last.raw.length);
              } else if (!trama.id.startsWith("generic") && !trama.id.startsWith("custom")) {
                buffer = buffer.slice(-200);
              } else {
                const nl = buffer.lastIndexOf("\n");
                if (nl >= 0) buffer = buffer.slice(nl + 1);
              }
            }
          }
        } catch { } finally { try { reader.releaseLock(); } catch {} }
        setSerialStatus("idle"); setLiveWeight(null); setStable(false); setStability(0);
        weightSamplesRef.current=[]; setLastRawFrame("");
      };
      readLoop();
    } catch (err: unknown) {
      const e = err as {message?:string};
      if ((e.message||"").includes("cancelled")||(e.message||"").includes("No port")) { setSerialStatus("idle"); }
      else { setSerialError(`Error COM: ${e.message||String(err)}`); setSerialStatus("error"); }
    }
  };

  const disconnectSerial = async () => {
    try { if (serialReaderRef.current) { await serialReaderRef.current.cancel(); serialReaderRef.current=null; } if (serialPortRef.current) { await serialPortRef.current.close(); serialPortRef.current=null; } } catch {}
    setSerialStatus("idle"); setLiveWeight(null); setStable(false); setStability(0);
    weightSamplesRef.current=[]; setSerialError(""); setLastRawFrame("");
  };

  useEffect(() => {
    if (btStatus==="simulating") { setStable(false); setStability(0); weightSamplesRef.current=[]; startSimulation(selectedAnimal); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAnimal]);

  useEffect(() => () => { if (simRef.current) clearInterval(simRef.current); }, []);

  /* Load trama stats when config tab is shown */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (mainTab === "config") { loadTramaStats?.(); } }, [mainTab]); // loadTramaStats defined below — safe forward ref via optional call

  /* Keep trama/regex refs in sync for readLoop closures */
  useEffect(() => { selTramaRef.current = selTrama; }, [selTrama]);
  useEffect(() => { customRegexRef.current = customRegex; }, [customRegex]);

  /* Continuo mode always enables autoCapture */
  useEffect(() => { if (modoOperacion === "continuo") setAutoCapture(true); }, [modoOperacion]);

  /* ── Open capture dialog with IA pre-fill ── */
  const openCaptureDialog = useCallback((overrideWeight?: number) => {
    const w = overrideWeight ?? liveWeight;
    if (!w || !selectedAnimal) return;
    setCapturedWeight(w);
    const iaVal = computeIA(selectedAnimal, pesajes, Number(detValorKilo)||11000);
    if (detIAAccepted) {
      setDetCondicion(String(iaVal.bcsNum));
      setDetTemperatura(iaVal.temperatura);
      setDetEstadoSan(iaVal.estadoSalud);
    }
    setDetPotrero(selectedAnimal.lote || "");
    setCaptureDialogOpen(true);
  }, [liveWeight, selectedAnimal, pesajes, detValorKilo, detIAAccepted]);

  /* ── Capture instant (modo continuo — sin diálogo, guarda con valores IA) ── */
  const captureInstant = useCallback((w: number) => {
    if (!w || !selectedAnimal) return;
    const prev = pesajes.filter(p=>p.animalId===selectedAnimal.id).sort((a,b)=>b.id-a.id)[0];
    const now  = new Date();
    const vk   = Number(detValorKilo) || 11000;
    const activeStatus = btStatus==="connected"?"bluetooth":btStatus==="simulating"?"simulated":serialStatus==="connected"?"serial":"manual";
    const activeDevice = btStatus==="connected"||btStatus==="simulating"
      ? selBt.nombre
      : serialStatus==="connected" ? `${selCom.nombre} [${selTrama.nombre}]` : "";
    const iaVal = computeIA(selectedAnimal, pesajes, vk);
    const newP: PesajeRec = {
      id: Date.now(), animalId: selectedAnimal.id, animalNombre: selectedAnimal.nombre,
      raza: selectedAnimal.raza, categoria: selectedAnimal.categoria||"",
      peso: w, pesoAnterior: prev?.peso ?? selectedAnimal.peso,
      fecha: now.toLocaleDateString("es-CO"),
      hora:  now.toLocaleTimeString("es-CO",{hour:"2-digit",minute:"2-digit"}),
      metodo: activeStatus, dispositivo: activeDevice,
      operador: user?.nombre||"Sistema",
      observacion: `Modo continuo · Trama: ${selTrama.id} · CC ${iaVal.bcsNum} · Score ${iaVal.scoreDesarrollo}`,
      lote: selectedAnimal.lote, valorKilo: vk, valorTotal: w * vk,
      condicionCorporal: `CC ${iaVal.bcsNum}`,
      temperatura: iaVal.temperatura,
      estadoSanitario: iaVal.estadoSalud,
      iaScore: iaVal.scoreDesarrollo,
    };
    setPesajes([newP, ...pesajes] as any);
    postTrama(newP, lastRawFrame, true);
    const updCfgB = { ...sistemaCfg, nTiquete: sistemaCfg.nTiquete + 1, nPlanilla: sistemaCfg.nPlanilla + 1 };
    setSistemaCfgState(updCfgB); saveSistemaCfgToStorage(updCfgB);
    setStable(false); setStability(0); weightSamplesRef.current=[];
    /* Auto-advance queue */
    if (queueMode && animalQueue.length > 0) {
      const nextIdx = queueIdx + 1;
      if (nextIdx < animalQueue.length) {
        const nextA = animals.find(a=>a.id===animalQueue[nextIdx]);
        if (nextA) setTimeout(()=>{ setSelectedAnimal(nextA); setQueueIdx(nextIdx); weightSamplesRef.current=[]; if (btStatus==="simulating") startSimulation(nextA); }, 1500);
      } else { setTimeout(()=>{ setQueueMode(false); setQueueIdx(0); setAnimalQueue([]); }, 1200); }
    }
    if (btStatus==="simulating") setTimeout(()=>startSimulation(selectedAnimal), 300);
    imprimirRecibo(newP, "GanaderIA PRO", selectedAnimal, true);
  }, [selectedAnimal, pesajes, btStatus, serialStatus, selBt, selCom, selTrama, user, setPesajes,
      startSimulation, detValorKilo, queueMode, animalQueue, queueIdx, animals]);

  useEffect(() => {
    if (stable && autoCapture && liveWeight && !captureDialogOpen) {
      if (modoOperacion === "continuo") {
        setTimeout(() => captureInstant(liveWeight), 600);
      } else {
        setTimeout(() => openCaptureDialog(liveWeight), 400);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stable]);

  /* ── Save captured peso ── */
  const saveCapturedPeso = useCallback(() => {
    if (!capturedWeight || !selectedAnimal) return;
    const prev = pesajes.filter(p=>p.animalId===selectedAnimal.id).sort((a,b)=>b.id-a.id)[0];
    const now = new Date();
    const vk = Number(detValorKilo) || 11000;
    const activeStatus = btStatus==="connected"?"bluetooth":btStatus==="simulating"?"simulated":serialStatus==="connected"?"serial":"manual";
    const activeDevice = btStatus==="connected"||btStatus==="simulating"?selBt.nombre:serialStatus==="connected"?selCom.nombre:"";
    const iaVal = computeIA(selectedAnimal, pesajes, vk);
    const newP: PesajeRec = {
      id:Date.now(), animalId:selectedAnimal.id, animalNombre:selectedAnimal.nombre,
      raza:selectedAnimal.raza, categoria:selectedAnimal.categoria||"",
      peso:capturedWeight, pesoAnterior:prev?.peso??selectedAnimal.peso,
      fecha:now.toLocaleDateString("es-CO"),
      hora:now.toLocaleTimeString("es-CO",{hour:"2-digit",minute:"2-digit"}),
      metodo:activeStatus, dispositivo:activeDevice,
      operador:user?.nombre||"Sistema", observacion:detObs, lote:selectedAnimal.lote,
      valorKilo:vk, valorTotal:capturedWeight*vk,
      condicionCorporal:`CC ${detCondicion}`,
      temperatura:detTemperatura||undefined,
      estadoSanitario:detEstadoSan||undefined,
      potreroActual:detPotrero||undefined,
      observacionVet:detObsVet||undefined,
      proximaVacuna:detProxVac||undefined,
      iaScore: iaVal.scoreDesarrollo,
    };
    setPesajes([newP, ...pesajes] as any);
    postTrama(newP, lastRawFrame, true);
    const updCfgA = { ...sistemaCfg, nTiquete: sistemaCfg.nTiquete + 1, nPlanilla: sistemaCfg.nPlanilla + 1 };
    setSistemaCfgState(updCfgA); saveSistemaCfgToStorage(updCfgA);
    setCaptureDialogOpen(false);
    setStable(false); setStability(0); weightSamplesRef.current=[];
    if (queueMode && animalQueue.length > 0) {
      const nextIdx = queueIdx+1;
      if (nextIdx < animalQueue.length) {
        const nextA = animals.find(a=>a.id===animalQueue[nextIdx]);
        if (nextA) setTimeout(()=>{ setSelectedAnimal(nextA); setQueueIdx(nextIdx); weightSamplesRef.current=[]; if (btStatus==="simulating") startSimulation(nextA); },1800);
      } else { setTimeout(()=>{ setQueueMode(false); setQueueIdx(0); setAnimalQueue([]); },1200); }
    }
    if (btStatus==="simulating") setTimeout(()=>startSimulation(selectedAnimal),300);
    imprimirRecibo(newP, "GanaderIA PRO", selectedAnimal);
  }, [capturedWeight, selectedAnimal, pesajes, btStatus, serialStatus, selBt, selCom, user, setPesajes, startSimulation, detCondicion, detTemperatura, detEstadoSan, detPotrero, detObsVet, detProxVac, detValorKilo, detObs, queueMode, animalQueue, queueIdx, animals]);

  /* ── Manual pesaje ── */
  const handleManualSave = () => {
    const peso = Number(manualPeso);
    if (!peso || !manualAnimal) return;
    const prev = pesajes.filter(p=>p.animalId===manualAnimal.id).sort((a,b)=>b.id-a.id)[0];
    const now = new Date();
    const vk = Number(detValorKilo) || 11000;
    const iaVal = computeIA(manualAnimal, pesajes, vk);
    const newP: PesajeRec = {
      id:Date.now(), animalId:manualAnimal.id, animalNombre:manualAnimal.nombre,
      raza:manualAnimal.raza, categoria:manualAnimal.categoria||"",
      peso, pesoAnterior:prev?.peso??manualAnimal.peso,
      fecha:now.toLocaleDateString("es-CO"),
      hora:now.toLocaleTimeString("es-CO",{hour:"2-digit",minute:"2-digit"}),
      metodo:"manual", dispositivo:"", operador:user?.nombre||"",
      observacion:detObs, lote:manualAnimal.lote,
      valorKilo:vk, valorTotal:peso*vk,
      condicionCorporal:`CC ${detCondicion}`,
      temperatura:detTemperatura||undefined, estadoSanitario:detEstadoSan||undefined,
      potreroActual:detPotrero||undefined, observacionVet:detObsVet||undefined, proximaVacuna:detProxVac||undefined,
      iaScore: iaVal.scoreDesarrollo,
    };
    setPesajes([newP, ...pesajes] as any);
    setManualPeso(""); setManualOpen(false);
    imprimirRecibo(newP, "GanaderIA PRO", manualAnimal);
  };

  /* ── New animal ── */
  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 5*1024*1024) { alert("Foto máx 5 MB"); return; }
    setNewAFotoName(file.name);
    const reader = new FileReader();
    reader.onload = ev => setNewAFoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  };
  /* ── Save sistema config ── */
  const guardarSistemaCfg = useCallback(() => {
    setSistemaCfgState({...sistemaCfgEdit});
    saveSistemaCfgToStorage({...sistemaCfgEdit});
    setSistemaCfgOpen(false);
    setSistemaSaved(true);
    setTimeout(()=>setSistemaSaved(false), 2500);
  }, [sistemaCfgEdit]);

  /* ── Load trama DB stats on config tab open ── */
  const loadTramaStats = useCallback(async () => {
    try {
      const r = await fetch("/api/tramas/stats");
      if (r.ok) { const d = await r.json(); setTramaDbStats(d.totals); }
    } catch {}
  }, []);

  /* ── Post trama to DB (fire & forget) ── */
  const postTrama = useCallback(async (newP: PesajeRec, rawTrama: string, captured: boolean) => {
    const activeStatus = btStatus==="connected"?"bluetooth":btStatus==="simulating"?"simulated":serialStatus==="connected"?"serial":"manual";
    try {
      await fetch("/api/tramas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          animalId: newP.animalId, animalNombre: newP.animalNombre,
          peso: newP.peso, rawTrama: rawTrama || "",
          tramaType: selTrama.id, metodo: activeStatus,
          dispositivo: newP.dispositivo,
          puerto: sistemaCfg.puerto,
          baudRate: comCustomBaud ? parseInt(comCustomBaud) : selCom.baudRate,
          stable: captured, operador: newP.operador,
          userId: user?.id || "", planCode: user?.plan || "basico",
          deviceId: `${user?.id || "anon"}_${navigator.userAgent.slice(0,20)}`,
          capturado: captured, pesajeId: newP.id,
        }),
      });
    } catch {}
  }, [btStatus, serialStatus, selTrama, sistemaCfg, selCom, comCustomBaud, user]);

  const handleRegNewAnimal = () => {
    const tid = newAId.trim(); const tnombre = newANombre.trim();
    if (!tid||!tnombre||animals.find(a=>a.id===tid)) return;
    const newA: Animal = { id:tid, nombre:tnombre, raza:newARaza, categoria:newACat, lote:newALote, peso:0, estado:"Activa", fechaNacimiento:newAFechaNac, registro:newARegistro, numeroRegistro:newANumReg, valorKilo:11000, litrosDia:0, partos:0, foto:newAFoto??undefined };
    setAnimals((prev: Animal[]) => [...prev, newA]);
    if (queueMode) { setAnimalQueue(prev=>[...prev,tid]); } else { setSelectedAnimal(newA); }
    setShowNewAnimal(false);
    setNewAId(""); setNewANombre(""); setNewAFoto(null); setNewAFotoName(""); setNewAFechaNac(""); setNewARegistro("NO"); setNewANumReg("");
  };

  /* ── Active connection status ── */
  const isConnected = btStatus==="connected"||btStatus==="simulating"||serialStatus==="connected";

  /* ─────────────────────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────────────────────── */
  return (
    <div className="p-4 space-y-4 max-w-screen-2xl" style={{fontFamily:"'Space Grotesk','Sora',sans-serif"}}>

      {/* ── Header banner ── */}
      <div className="relative rounded-3xl overflow-hidden px-6 py-5"
        style={{background:"linear-gradient(135deg,#0a3d22 0%,#0d4f2c 40%,#064020 80%,#052810 100%)",border:"1px solid rgba(57,255,126,0.2)",boxShadow:"0 0 40px rgba(57,255,126,0.05)"}}>
        <div className="absolute inset-0 pointer-events-none" style={{background:"radial-gradient(ellipse 60% 80% at 90% 50%, rgba(0,245,212,0.08), transparent)",backgroundSize:"100% 100%"}}/>
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{background:"linear-gradient(90deg,transparent,rgba(57,255,126,0.6),rgba(0,245,212,0.4),transparent)"}}/>
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{background:"rgba(57,255,126,0.15)",border:"1px solid rgba(57,255,126,0.4)",boxShadow:"0 0 16px rgba(57,255,126,0.25)"}}>
              <Scale size={22} style={{color:"#39ff7e"}}/>
            </div>
            <div>
              <h1 className="text-xl font-black text-white flex items-center gap-2">
                Módulo de Pesaje
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{background:"rgba(139,92,246,0.2)",color:"#c084fc",border:"1px solid rgba(139,92,246,0.3)"}}>
                  🤖 IA integrada
                </span>
              </h1>
              <p className="text-xs mt-0.5" style={{color:"rgba(57,255,126,0.55)"}}>
                Báscula BT · COM/USB · Manual · Predicciones IA · Cola de animales · Recibo granja
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label:`${pesajes.length} pesajes`,    color:"0,245,212" },
              { label:`${hoy} hoy`,                   color:"57,255,126" },
              { label:`${animals.length} animales`,   color:"251,191,36" },
              { label:isConnected?"Báscula ON":"Sin báscula", color:isConnected?"57,255,126":"248,113,113" },
            ].map(s=>(
              <div key={s.label} className="px-3 py-1.5 rounded-xl text-xs font-bold" style={{background:`rgba(${s.color},0.1)`,border:`1px solid rgba(${s.color},0.25)`,color:`rgba(${s.color},0.9)`}}>
                {s.label}
              </div>
            ))}
            <Button size="sm" onClick={()=>setShowNewAnimal(true)}
              style={{background:"rgba(57,255,126,0.15)",border:"1px solid rgba(57,255,126,0.4)",color:"#39ff7e"}}
              className="font-bold">
              <UserPlus size={13} className="mr-1"/>Nuevo animal
            </Button>
          </div>
        </div>
      </div>

      {/* ── Main 3-col grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr_300px] gap-4">

        {/* ═══ COL 1: Animal Selector ═══ */}
        <div className="space-y-3">
          {/* Search + filters */}
          <div className="rounded-2xl overflow-hidden" style={{background:"rgba(4,13,26,0.95)",border:"1px solid rgba(0,245,212,0.12)"}}>
            <div className="p-3">
              <div className="relative mb-2">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:"rgba(0,245,212,0.4)"}}/>
                <input value={searchAnim} onChange={e=>setSearchAnim(e.target.value)}
                  placeholder="Buscar por nombre, ID, raza…"
                  className="w-full pl-8 pr-3 py-2 rounded-xl text-xs text-white"
                  style={{background:"rgba(0,245,212,0.04)",border:"1px solid rgba(0,245,212,0.12)",outline:"none"}}/>
              </div>
              <button onClick={()=>setShowFilters(v=>!v)} className="flex items-center gap-1.5 text-[10px] text-white/30 hover:text-white/60 transition-colors">
                <Filter size={10}/>Filtros avanzados
                {showFilters?<ChevronUp size={10}/>:<ChevronDown size={10}/>}
                {(filterRaza!=="Todas"||filterCat!=="Todas"||filterLote!=="Todos"||filterEstado!=="Todos") &&
                  <span className="px-1.5 py-0.5 rounded-full text-[8px] font-bold" style={{background:"rgba(0,245,212,0.15)",color:"#00f5d4"}}>Activo</span>}
              </button>
              {showFilters && (
                <div className="mt-2 space-y-2">
                  {[
                    {label:"Raza",   opts:razas,   val:filterRaza,   set:setFilterRaza},
                    {label:"Cat.",   opts:cats,    val:filterCat,    set:setFilterCat},
                    {label:"Lote",   opts:lotes,   val:filterLote,   set:setFilterLote},
                    {label:"Estado", opts:estados, val:filterEstado, set:setFilterEstado},
                  ].map(f=>(
                    <div key={f.label}>
                      <div className="text-[9px] text-white/25 mb-1">{f.label}</div>
                      <select value={f.val} onChange={e=>f.set(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg text-xs text-white"
                        style={{background:"rgba(0,245,212,0.04)",border:"1px solid rgba(0,245,212,0.1)",outline:"none"}}>
                        {f.opts.map(o=><option key={o} value={o} style={{background:"#0e1e38"}}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                  <button onClick={()=>{setFilterRaza("Todas");setFilterCat("Todas");setFilterLote("Todos");setFilterEstado("Todos");}}
                    className="text-[9px] text-white/25 hover:text-white/50">Limpiar filtros</button>
                </div>
              )}
            </div>
            <div className="px-3 pb-2 text-[9px]" style={{color:"rgba(0,245,212,0.4)"}}>
              {filtered.length} de {animals.length} animales
            </div>
          </div>

          {/* Animal list */}
          <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1" style={{scrollbarWidth:"thin",scrollbarColor:"rgba(0,245,212,0.2) transparent"}}>
            {filtered.length === 0
              ? <div className="text-center py-8 text-xs text-white/20">Sin animales con esos filtros</div>
              : filtered.map(a => (
                <AnimalCard key={a.id} animal={a} pesajes={pesajes} selected={selectedAnimal?.id===a.id}
                  onSelect={()=>setSelectedAnimal(a)}
                  onQueue={()=>{ if (!animalQueue.includes(a.id)) setAnimalQueue(prev=>[...prev,a.id]); setQueueMode(true); }}/>
              ))
            }
          </div>

          {/* Queue panel */}
          {queueMode && (
            <div className="rounded-2xl p-3" style={{background:"rgba(251,191,36,0.06)",border:"1px solid rgba(251,191,36,0.2)"}}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold" style={{color:"#fbbf24"}}>Cola de pesaje ({animalQueue.length})</span>
                <button onClick={()=>{setQueueMode(false);setAnimalQueue([]);setQueueIdx(0);}} className="text-[9px] text-white/30 hover:text-white/60">Cancelar</button>
              </div>
              {animalQueue.map((id,i)=>{
                const a = animals.find(x=>x.id===id);
                return a ? (
                  <div key={id} className="flex items-center gap-2 text-[10px] py-1"
                    style={{color:i===queueIdx?"#fbbf24":"rgba(255,255,255,0.4)"}}>
                    <span className="w-4 h-4 rounded flex items-center justify-center text-[8px] font-bold"
                      style={{background:i===queueIdx?"rgba(251,191,36,0.2)":"rgba(255,255,255,0.05)"}}>{i+1}</span>
                    {i===queueIdx&&<Activity size={8} className="animate-pulse text-yellow-400"/>}
                    {i<queueIdx&&<Check size={8} className="text-green-400"/>}
                    <span className="truncate">{a.nombre}</span>
                    <span className="text-white/20">{a.id}</span>
                  </div>
                ) : null;
              })}
            </div>
          )}
        </div>

        {/* ═══ COL 2: Main weighing area ═══ */}
        <div className="space-y-4">

          {/* Selected animal card */}
          {selectedAnimal && (
            <div className="rounded-2xl overflow-hidden" style={{background:"linear-gradient(145deg,rgba(0,245,212,0.06),rgba(0,200,180,0.03))",border:"1px solid rgba(0,245,212,0.2)"}}>
              <div className="h-0.5" style={{background:"linear-gradient(90deg,#00f5d4,#00c8ff,transparent)"}}/>
              <div className="p-4 flex gap-4 items-start">
                <div className="w-16 h-16 rounded-2xl flex-shrink-0 overflow-hidden" style={{border:"2px solid rgba(0,245,212,0.3)",boxShadow:"0 0 12px rgba(0,245,212,0.15)"}}>
                  {selectedAnimal.foto
                    ? <img src={selectedAnimal.foto} alt={selectedAnimal.nombre} className="w-full h-full object-cover"/>
                    : <div className="w-full h-full flex items-center justify-center text-3xl" style={{background:"rgba(0,245,212,0.06)"}}>🐄</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-black text-white">{selectedAnimal.nombre}</h2>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{background:"rgba(0,245,212,0.1)",color:"#00f5d4",border:"1px solid rgba(0,245,212,0.25)"}}>{selectedAnimal.raza}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.6)",border:"1px solid rgba(255,255,255,0.1)"}}>{selectedAnimal.estado}</span>
                  </div>
                  <div className="text-xs text-white/40 mt-1">{selectedAnimal.id} · {selectedAnimal.categoria} · {selectedAnimal.lote}</div>
                  {selectedAnimal.fechaNacimiento && <div className="text-[10px] text-white/25 mt-0.5">Nacimiento: {selectedAnimal.fechaNacimiento}</div>}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-black" style={{color:"#00f5d4"}}>{(pesajes.find(p=>p.animalId===selectedAnimal.id)||{peso:selectedAnimal.peso})?.peso?.toFixed(1)||"—"} kg</div>
                  <div className="text-[10px] text-white/30">Último peso</div>
                  {ia && <div className="text-[10px] mt-1" style={{color:ia.alertaNivel==="ok"?"#39ff7e":ia.alertaNivel==="alerta"?"#fbbf24":"#f87171"}}>
                    IA: {ia.pesoEstimado} kg est.
                  </div>}
                </div>
              </div>
              {/* Animal ref bar */}
              {ia && (() => {
                const ref = getPesoRef(selectedAnimal.raza, selectedAnimal.categoria);
                const lastPeso = (pesajes.find(p=>p.animalId===selectedAnimal.id)||{peso:selectedAnimal.peso})?.peso || selectedAnimal.peso;
                const pct = Math.min(100, Math.round((lastPeso/ref.max)*100));
                return (
                  <div className="px-4 pb-3">
                    <div className="flex justify-between text-[9px] mb-1" style={{color:"rgba(255,255,255,0.2)"}}>
                      <span>{ref.min} kg mín</span>
                      <span className="font-bold" style={{color:"rgba(0,245,212,0.6)"}}>{ref.prom} kg prom esperado</span>
                      <span>{ref.max} kg máx</span>
                    </div>
                    <div className="relative h-1.5 rounded-full" style={{background:"rgba(255,255,255,0.06)"}}>
                      <div className="absolute h-full rounded-full" style={{left:`${(ref.min/ref.max)*100}%`,right:`${100-(ref.prom/ref.max)*100+5}%`,background:"rgba(0,245,212,0.15)"}}/>
                      <div className="absolute w-2.5 h-2.5 rounded-full -top-0.5" style={{left:`${pct}%`,background:"#00f5d4",boxShadow:"0 0 8px rgba(0,245,212,0.8)",transform:"translateX(-50%)"}}/>
                    </div>
                    <div className="text-[9px] text-center mt-1" style={{color:"rgba(0,245,212,0.4)"}}>
                      GDP actual: {ia.gdpActual >= 0 ? "+" : ""}{ia.gdpActual} kg/mes · Esp: +{ia.gdpEsperado} kg/mes · Score: {ia.scoreDesarrollo}/100
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Main tabs */}
          <div className="flex gap-2">
            {[
              {id:"bascula"     as const, label:"⚖️ Báscula",       sub:"BT + COM"},
              {id:"manual"      as const, label:"✏️ Manual",         sub:"Entrada directa"},
              {id:"historial"   as const, label:"📋 Historial",      sub:`${pesajes.length} registros`},
              {id:"estadisticas"as const, label:"📊 Estadísticas",   sub:"GDP · Valor · Gráficas"},
              {id:"config"      as const, label:"⚙️ Config",          sub:"Básculas · Tramas · Impresión"},
            ].map(t=>(
              <button key={t.id} onClick={()=>setMainTab(t.id)}
                className="flex-1 py-2.5 rounded-2xl text-center transition-all"
                style={mainTab===t.id
                  ?{background:"linear-gradient(135deg,rgba(57,255,126,0.15),rgba(0,245,212,0.1))",border:"1.5px solid rgba(57,255,126,0.4)",boxShadow:"0 0 12px rgba(57,255,126,0.08)"}
                  :{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)"}}>
                <div className="text-sm font-bold" style={{color:mainTab===t.id?"#39ff7e":"rgba(255,255,255,0.55)"}}>{t.label}</div>
                <div className="text-[9px]" style={{color:"rgba(255,255,255,0.25)"}}>{t.sub}</div>
              </button>
            ))}
          </div>

          {/* ── BÁSCULA TAB ── */}
          {mainTab === "bascula" && (
            <div className="space-y-4">
              {/* Connection sub-tabs */}
              <div className="rounded-2xl overflow-hidden" style={{background:"rgba(4,13,26,0.95)",border:"1px solid rgba(255,255,255,0.07)"}}>
                <div className="flex border-b" style={{borderColor:"rgba(255,255,255,0.06)"}}>
                  {[
                    {id:"bt"  as const, icon:<Bluetooth size={13}/>,   label:"Bluetooth"},
                    {id:"com" as const, icon:<Usb size={13}/>,          label:"COM/USB"},
                    {id:"manual" as const, icon:<Calculator size={13}/>,label:"Modo manual"},
                  ].map(t=>(
                    <button key={t.id} onClick={()=>setConnTab(t.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition-colors"
                      style={{background:connTab===t.id?"rgba(57,255,126,0.08)":"transparent",borderBottom:connTab===t.id?"2px solid #39ff7e":"2px solid transparent",color:connTab===t.id?"#39ff7e":"rgba(255,255,255,0.35)"}}>
                      {t.icon}{t.label}
                    </button>
                  ))}
                </div>
                <div className="p-4">
                  {/* BT */}
                  {connTab==="bt" && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1.5">Controladora Bluetooth</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {BT_CONTROLLERS.map(c=>(
                            <button key={c.id} onClick={()=>setSelBt(c)}
                              className="p-2.5 rounded-xl text-left transition-all text-[10px]"
                              style={{background:selBt.id===c.id?`${c.color}18`:"rgba(255,255,255,0.03)",border:`1.5px solid ${selBt.id===c.id?`${c.color}55`:"rgba(255,255,255,0.07)"}`,color:selBt.id===c.id?c.color:"rgba(255,255,255,0.5)"}}>
                              <div className="text-sm mb-0.5">{c.icon}</div>
                              <div className="font-bold leading-tight">{c.marca}</div>
                              <div className="text-white/30 text-[8px] leading-tight">{c.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* ── Trama BT ── */}
                      <div className="rounded-xl overflow-hidden" style={{border:"1px solid rgba(0,245,212,0.18)"}}>
                        <button onClick={()=>setShowBtTramaConfig(v=>!v)}
                          className="w-full flex items-center justify-between px-3 py-2 text-[10px]"
                          style={{background:"rgba(0,245,212,0.05)"}}>
                          <div className="flex items-center gap-2 font-bold" style={{color:"#00f5d4"}}>
                            <Radio size={11}/>
                            Trama BT — <span style={{color:TRAMA_TYPES.find(t=>t.id===btTramaId)?.color||"#94a3b8"}}>{TRAMA_TYPES.find(t=>t.id===btTramaId)?.icon} {TRAMA_TYPES.find(t=>t.id===btTramaId)?.nombre}</span>
                          </div>
                          <span style={{color:"rgba(0,245,212,0.4)"}}>{showBtTramaConfig?"▲":"▼"}</span>
                        </button>
                        {showBtTramaConfig && (
                          <div className="p-2.5 space-y-2" style={{background:"rgba(0,0,0,0.3)"}}>
                            <div className="text-[9px] text-white/30 mb-1">Protocolo de decodificación para stream UART/GATT personalizado</div>
                            <div className="grid grid-cols-2 gap-1.5">
                              {TRAMA_TYPES.map(t=>(
                                <button key={t.id} onClick={()=>{ setBtTramaId(t.id); selTramaRef.current=t; setSelTrama(t); }}
                                  className="p-2 rounded-xl text-left transition-all"
                                  style={{
                                    background:btTramaId===t.id?`${t.color}18`:"rgba(255,255,255,0.03)",
                                    border:`1.5px solid ${btTramaId===t.id?`${t.color}55`:"rgba(255,255,255,0.07)"}`,
                                    color:btTramaId===t.id?t.color:"rgba(255,255,255,0.5)",
                                  }}>
                                  <div className="text-xs mb-0.5">{t.icon}</div>
                                  <div className="font-bold text-[9px] leading-tight">{t.nombre}</div>
                                  {btTramaId===t.id&&<div className="text-[8px] mt-0.5" style={{color:`${t.color}90`}}>{t.estabilidad_directa?"⚡ Estabilidad directa":"📊 Análisis estadístico"}</div>}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {btStatus==="idle"||btStatus==="error"
                          ? <Button onClick={connectBluetooth} className="flex-1 gap-2 font-bold"
                              style={{background:"linear-gradient(135deg,#00f5d4,#00a896)",color:"black"}}>
                              <Bluetooth size={14}/>Conectar {selBt.nombre}
                            </Button>
                          : <Button onClick={disconnectBluetooth} variant="outline" className="flex-1 gap-2 font-bold"
                              style={{borderColor:"rgba(248,113,113,0.4)",color:"#f87171"}}>
                              <BluetoothOff size={14}/>Desconectar
                            </Button>
                        }
                        <Button onClick={()=>setAutoCapture(v=>!v)} variant="outline" size="sm"
                          className="gap-1.5 text-xs font-bold"
                          style={{borderColor:autoCapture?"rgba(251,191,36,0.4)":"rgba(255,255,255,0.1)",color:autoCapture?"#fbbf24":"rgba(255,255,255,0.4)"}}>
                          <Zap size={12}/>Auto
                        </Button>
                      </div>
                      {btError && <div className="text-xs text-red-400 flex items-center gap-1.5 px-3 py-2 rounded-xl" style={{background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.2)"}}><AlertTriangle size={11}/>{btError}</div>}
                    </div>
                  )}
                  {/* COM */}
                  {connTab==="com" && (
                    <div className="space-y-3">
                      {/* Controller selector */}
                      <div>
                        <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1.5">Controladora COM/Serial</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {COM_CONTROLLERS.map(c=>(
                            <button key={c.id} onClick={()=>setSelCom(c)}
                              className="p-2.5 rounded-xl text-left transition-all text-[10px]"
                              style={{background:selCom.id===c.id?`${c.color}18`:"rgba(255,255,255,0.03)",border:`1.5px solid ${selCom.id===c.id?`${c.color}55`:"rgba(255,255,255,0.07)"}`,color:selCom.id===c.id?c.color:"rgba(255,255,255,0.5)"}}>
                              <div className="text-sm mb-0.5">{c.icon}</div>
                              <div className="font-bold leading-tight">{c.marca}</div>
                              <div className="text-white/30 text-[8px]">{c.baudRate} bps · {c.tipo}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* ── Trama de datos ── */}
                      <div className="rounded-xl overflow-hidden" style={{border:"1px solid rgba(251,191,36,0.2)"}}>
                        <button onClick={()=>setShowTramaConfig(v=>!v)}
                          className="w-full flex items-center justify-between px-3 py-2.5 text-[10px]"
                          style={{background:"rgba(251,191,36,0.06)"}}>
                          <div className="flex items-center gap-2 font-bold" style={{color:"#fbbf24"}}>
                            <Radio size={11}/>
                            Trama de datos — <span style={{color:selTrama.color}}>{selTrama.icon} {selTrama.nombre}</span>
                          </div>
                          <span style={{color:"rgba(251,191,36,0.5)"}}>{showTramaConfig?"▲":"▼"}</span>
                        </button>
                        {showTramaConfig && (
                          <div className="p-3 space-y-2.5" style={{background:"rgba(0,0,0,0.3)"}}>
                            <div className="grid grid-cols-2 gap-1.5">
                              {TRAMA_TYPES.map(t=>(
                                <button key={t.id} onClick={()=>{ setSelTrama(t); selTramaRef.current=t; }}
                                  className="p-2 rounded-xl text-left transition-all"
                                  style={{
                                    background:selTrama.id===t.id?`${t.color}18`:"rgba(255,255,255,0.03)",
                                    border:`1.5px solid ${selTrama.id===t.id?`${t.color}55`:"rgba(255,255,255,0.07)"}`,
                                    color:selTrama.id===t.id?t.color:"rgba(255,255,255,0.5)",
                                  }}>
                                  <div className="text-xs mb-0.5">{t.icon}</div>
                                  <div className="font-bold text-[9px] leading-tight">{t.nombre}</div>
                                  {selTrama.id===t.id&&<div className="text-[8px] mt-0.5" style={{color:`${t.color}90`}}>{t.estabilidad_directa?"⚡ Estabilidad directa":"📊 Análisis estadístico"}</div>}
                                </button>
                              ))}
                            </div>
                            {/* Trama info panel */}
                            <div className="rounded-xl p-2.5" style={{background:"rgba(0,0,0,0.4)",border:`1px solid ${selTrama.color}25`}}>
                              <div className="text-[9px] font-bold mb-1" style={{color:selTrama.color}}>{selTrama.icon} {selTrama.nombre}</div>
                              <div className="text-[9px] mb-1.5" style={{color:"rgba(255,255,255,0.45)"}}>{selTrama.descripcion}</div>
                              <div className="font-mono text-[9px] px-2 py-1.5 rounded" style={{background:"rgba(0,0,0,0.5)",color:"#39ff7e",letterSpacing:"0.05em"}}>
                                {selTrama.ejemplo}
                              </div>
                              {selTrama.estabilidad_directa && (
                                <div className="mt-1.5 flex gap-3 text-[9px]">
                                  <span className="text-yellow-400">⚡ Estabilidad desde trama: '!' = listo, 'I' = pesando</span>
                                </div>
                              )}
                            </div>
                            {/* Live decoder */}
                            {lastRawFrame && (
                              <div className="rounded-xl p-2.5" style={{background:"rgba(57,255,126,0.05)",border:"1px solid rgba(57,255,126,0.2)"}}>
                                <div className="text-[9px] text-white/30 mb-1 uppercase tracking-wider">Último frame decodificado</div>
                                <div className="font-mono text-[10px]" style={{color:"#39ff7e"}}>{lastRawFrame}</div>
                                <div className="flex gap-3 mt-1 text-[9px]">
                                  <span style={{color:"rgba(0,245,212,0.7)"}}>Peso: <strong>{liveWeight ?? 0} kg</strong></span>
                                  <span style={{color:stable?"#39ff7e":"#fbbf24"}}>Estado: <strong>{stable?"✅ ESTABLE":"⏳ PESANDO"}</strong></span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* ── Puerto serie: parámetros avanzados ── */}
                      <div className="rounded-xl overflow-hidden" style={{border:"1px solid rgba(0,200,255,0.15)"}}>
                        <button onClick={()=>setShowComPortParams(v=>!v)}
                          className="w-full flex items-center justify-between px-3 py-2.5 text-[10px]"
                          style={{background:"rgba(0,200,255,0.05)"}}>
                          <div className="flex items-center gap-2 font-bold" style={{color:"#00c8ff"}}>
                            <Settings2 size={11}/>
                            Parámetros del puerto
                            <span style={{color:"rgba(0,200,255,0.5)",fontWeight:"normal"}}>
                              {selCom.baudRate} bps · {selCom.dataBits}/{selCom.parity}/{selCom.stopBits}
                              {(comCustomBaud||comCustomDataBits||comCustomStopBits||comCustomParity)
                                ? " ✎ override" : " (predeterminado)"}
                            </span>
                          </div>
                          <span style={{color:"rgba(0,200,255,0.4)"}}>{showComPortParams?"▲":"▼"}</span>
                        </button>
                        {showComPortParams && (
                          <div className="p-3 space-y-2.5" style={{background:"rgba(0,0,0,0.3)"}}>
                            <p className="text-[9px] text-white/30">Sobrescribe los parámetros de la báscula seleccionada. Deja vacío para usar los predeterminados.</p>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[9px] text-white/30 block mb-1">Baud rate</label>
                                <select value={comCustomBaud} onChange={e=>setComCustomBaud(e.target.value)}
                                  className="w-full px-2 py-1.5 rounded-lg text-xs text-white"
                                  style={{background:"rgba(0,200,255,0.04)",border:"1px solid rgba(0,200,255,0.15)",outline:"none"}}>
                                  <option value="" style={{background:"#0e1e38"}}>Auto ({selCom.baudRate})</option>
                                  {[1200,2400,4800,9600,19200,38400,57600,115200].map(b=>(
                                    <option key={b} value={String(b)} style={{background:"#0e1e38"}}>{b}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="text-[9px] text-white/30 block mb-1">Paridad</label>
                                <select value={comCustomParity} onChange={e=>setComCustomParity(e.target.value)}
                                  className="w-full px-2 py-1.5 rounded-lg text-xs text-white"
                                  style={{background:"rgba(0,200,255,0.04)",border:"1px solid rgba(0,200,255,0.15)",outline:"none"}}>
                                  <option value="" style={{background:"#0e1e38"}}>Auto ({selCom.parity})</option>
                                  {["none","even","odd"].map(v=>(
                                    <option key={v} value={v} style={{background:"#0e1e38"}}>{v}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="text-[9px] text-white/30 block mb-1">Bits de datos</label>
                                <select value={comCustomDataBits} onChange={e=>setComCustomDataBits(e.target.value)}
                                  className="w-full px-2 py-1.5 rounded-lg text-xs text-white"
                                  style={{background:"rgba(0,200,255,0.04)",border:"1px solid rgba(0,200,255,0.15)",outline:"none"}}>
                                  <option value="" style={{background:"#0e1e38"}}>Auto ({selCom.dataBits})</option>
                                  {[7,8].map(v=>(
                                    <option key={v} value={String(v)} style={{background:"#0e1e38"}}>{v} bits</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="text-[9px] text-white/30 block mb-1">Bits de parada</label>
                                <select value={comCustomStopBits} onChange={e=>setComCustomStopBits(e.target.value)}
                                  className="w-full px-2 py-1.5 rounded-lg text-xs text-white"
                                  style={{background:"rgba(0,200,255,0.04)",border:"1px solid rgba(0,200,255,0.15)",outline:"none"}}>
                                  <option value="" style={{background:"#0e1e38"}}>Auto ({selCom.stopBits})</option>
                                  {["1","1.5","2"].map(v=>(
                                    <option key={v} value={v} style={{background:"#0e1e38"}}>{v}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            {(comCustomBaud||comCustomDataBits||comCustomStopBits||comCustomParity) && (
                              <button onClick={()=>{setComCustomBaud("");setComCustomDataBits("");setComCustomStopBits("");setComCustomParity("");}}
                                className="text-[9px]" style={{color:"rgba(248,113,113,0.7)"}}>
                                ✕ Limpiar sobrescrituras
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {serialStatus==="idle"||serialStatus==="error"
                          ? <Button onClick={connectSerial} className="flex-1 gap-2 font-bold"
                              style={{background:"linear-gradient(135deg,#fbbf24,#ea580c)",color:"black"}}>
                              <Cable size={14}/>Conectar {selCom.nombre}
                            </Button>
                          : <Button onClick={disconnectSerial} variant="outline" className="flex-1 gap-2 font-bold"
                              style={{borderColor:"rgba(248,113,113,0.4)",color:"#f87171"}}>
                              <XIcon size={14}/>Desconectar
                            </Button>
                        }
                      </div>
                      {serialError && <div className="text-xs text-red-400 flex items-center gap-1.5 px-3 py-2 rounded-xl" style={{background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.2)"}}><AlertTriangle size={11}/>{serialError}</div>}
                    </div>
                  )}
                  {/* Manual direct */}
                  {connTab==="manual" && (
                    <div className="space-y-3">
                      <p className="text-xs text-white/40">Ingresa el peso manualmente y captura directamente sin báscula externa.</p>
                      <div>
                        <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1.5">Peso a ingresar (kg)</label>
                        <div className="flex gap-2">
                          <input type="number" step="0.1" min="10" max="2000" placeholder={ia ? `IA: ${ia.pesoEstimado} kg estimado` : "Ej: 520.5"}
                            value={manualPeso} onChange={e=>setManualPeso(e.target.value)}
                            className="flex-1 px-4 py-3 rounded-2xl text-white text-sm"
                            style={{background:"rgba(57,255,126,0.06)",border:"1px solid rgba(57,255,126,0.2)",outline:"none"}}/>
                          {ia && <button onClick={()=>setManualPeso(String(ia.pesoEstimado))}
                            className="px-3 py-2 rounded-2xl text-xs font-bold"
                            style={{background:"rgba(139,92,246,0.12)",border:"1px solid rgba(139,92,246,0.3)",color:"#c084fc"}}>
                            IA
                          </button>}
                        </div>
                      </div>
                      <Button onClick={()=>{ if (Number(manualPeso)>0) openCaptureDialog(Number(manualPeso)); }}
                        disabled={!Number(manualPeso)||!selectedAnimal}
                        className="w-full gap-2 font-bold"
                        style={{background:"linear-gradient(135deg,#39ff7e,#00c864)",color:"#052010"}}>
                        <Target size={14}/>Capturar peso manual
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Live scale display */}
              <LiveScale
                weight={liveWeight} stability={stability} stable={stable}
                status={connTab==="bt"?btStatus:connTab==="com"?serialStatus:"idle"}
                onCapture={()=>openCaptureDialog()}
                autoCapture={autoCapture}
                connectionLabel={connTab==="bt"?selBt.nombre:`${selCom.nombre} · ${selTrama.icon}${selTrama.nombre}`}
              />

              {/* ── Modo operación ── */}
              <div className="rounded-2xl overflow-hidden" style={{background:"rgba(4,13,26,0.95)",border:"1px solid rgba(251,191,36,0.15)"}}>
                <div className="flex items-center gap-3 px-4 py-3 border-b" style={{borderColor:"rgba(255,255,255,0.06)"}}>
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{background:"rgba(251,191,36,0.15)",border:"1px solid rgba(251,191,36,0.3)"}}>
                    <Zap size={12} style={{color:"#fbbf24"}}/>
                  </div>
                  <span className="font-black text-sm text-white">Modo de operación</span>
                  <span className="text-[9px] ml-auto" style={{color:"rgba(251,191,36,0.5)"}}>{modoOperacion==="continuo"?"🚀 Flujo continuo activo":"⏸ Paso a paso"}</span>
                </div>
                <div className="p-3 grid grid-cols-2 gap-2">
                  {(["pausado","continuo"] as const).map(m=>(
                    <button key={m} onClick={()=>setModoOperacion(m)}
                      className="rounded-xl p-3 text-center transition-all"
                      style={{
                        background: modoOperacion===m
                          ? m==="continuo" ? "linear-gradient(135deg,rgba(251,191,36,0.18),rgba(234,88,12,0.12))"
                                          : "rgba(57,255,126,0.1)"
                          : "rgba(255,255,255,0.02)",
                        border: modoOperacion===m
                          ? m==="continuo" ? "1.5px solid rgba(251,191,36,0.5)" : "1.5px solid rgba(57,255,126,0.4)"
                          : "1px solid rgba(255,255,255,0.07)",
                      }}>
                      <div className="text-xl mb-1">{m==="continuo"?"🚀":"⏸"}</div>
                      <div className="font-black text-xs" style={{color:modoOperacion===m?(m==="continuo"?"#fbbf24":"#39ff7e"):"rgba(255,255,255,0.4)"}}>
                        {m==="continuo"?"Continuo":"Pausado"}
                      </div>
                      <div className="text-[8px] mt-0.5" style={{color:"rgba(255,255,255,0.3)"}}>
                        {m==="continuo"?"Pasar animales sin parar · auto-imprime":"Un animal a la vez · confirma cada uno"}
                      </div>
                    </button>
                  ))}
                </div>
                {modoOperacion==="continuo" && (
                  <div className="px-3 pb-3">
                    <div className="rounded-xl px-3 py-2 flex items-start gap-2" style={{background:"rgba(251,191,36,0.07)",border:"1px solid rgba(251,191,36,0.2)"}}>
                      <Zap size={11} className="mt-0.5 flex-shrink-0" style={{color:"#fbbf24"}}/>
                      <p className="text-[9px]" style={{color:"rgba(251,191,36,0.8)"}}>
                        <strong>Modo Continuo:</strong> Al detectar peso estable ('!' en trama CIVAC), captura y guarda automáticamente con valores IA, imprime recibo y avanza al siguiente animal en cola. Agrega animales a la cola para pesaje en serie.
                      </p>
                    </div>
                  </div>
                )}
                {/* Live trama decoder strip — shown when serial connected */}
                {serialStatus==="connected" && lastRawFrame && (
                  <div className="px-3 pb-3">
                    <div className="rounded-xl px-3 py-2" style={{background:"rgba(0,0,0,0.4)",border:"1px solid rgba(57,255,126,0.15)"}}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] text-white/25 uppercase tracking-wider">Stream en vivo · {selTrama.icon} {selTrama.nombre}</span>
                        <span className="text-[9px] font-bold" style={{color:stable?"#39ff7e":"#ff9500"}}>{stable?"✅ ESTABLE":"⏳ PESANDO"}</span>
                      </div>
                      <div className="font-mono text-[10px] tracking-widest" style={{color:"#fbbf24"}}>
                        {lastRawFrame.split("").map((ch,i)=>(
                          <span key={i} style={{
                            color: (ch==="!" || ch==="I") ? (ch==="!"?"#39ff7e":"#ff9500")
                              : ch==="s"||ch==="S"||ch==="k"||ch==="K" ? "#00c8ff"
                              : ch==="↵" ? "#c084fc"
                              : "rgba(255,255,255,0.6)",
                            background: i===0?"rgba(255,255,255,0.08)":"transparent",
                            padding:"0 1px", borderRadius:"2px",
                          }}>{ch}</span>
                        ))}
                      </div>
                      <div className="flex gap-4 mt-1.5 text-[9px]">
                        <span style={{color:"rgba(57,255,126,0.6)"}}>B0: estado · B1–7: peso (rjust) · B8: unidad</span>
                        <span className="ml-auto font-bold" style={{color:"#00f5d4"}}>{liveWeight ?? 0} kg</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── MANUAL TAB ── */}
          {mainTab === "manual" && (
            <div className="rounded-2xl overflow-hidden" style={{background:"rgba(4,13,26,0.95)",border:"1px solid rgba(0,200,255,0.15)"}}>
              <div className="h-0.5" style={{background:"linear-gradient(90deg,#00c8ff,#818cf8,transparent)"}}/>
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{background:"rgba(0,200,255,0.12)",border:"1px solid rgba(0,200,255,0.3)"}}>
                    <Edit3 size={13} style={{color:"#00c8ff"}}/>
                  </div>
                  <span className="font-black text-sm text-white">Pesaje manual</span>
                  <span className="text-[9px] ml-auto text-white/25">Sin báscula — entrada directa</span>
                </div>

                {/* Animal selector */}
                <div>
                  <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1.5">Seleccionar animal *</label>
                  <select value={manualAnimalId} onChange={e=>setManualAnimalId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-2xl text-sm text-white"
                    style={{background:"rgba(0,200,255,0.04)",border:"1px solid rgba(0,200,255,0.15)",outline:"none"}}>
                    {animals.map(a=>(
                      <option key={a.id} value={a.id} style={{background:"#0e1e38"}}>
                        {a.nombre} — {a.id} · {a.raza} · {a.lote}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Manual animal info card */}
                {manualAnimal && manualIa && (
                  <div className="rounded-2xl p-3 flex gap-3" style={{background:"rgba(0,200,255,0.05)",border:"1px solid rgba(0,200,255,0.1)"}}>
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                      {manualAnimal.foto
                        ? <img src={manualAnimal.foto} className="w-full h-full object-cover" alt={manualAnimal.nombre}/>
                        : <div className="w-full h-full flex items-center justify-center text-2xl" style={{background:"rgba(0,200,255,0.08)"}}>🐄</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-white">{manualAnimal.nombre}</div>
                      <div className="text-[10px] text-white/40">{manualAnimal.raza} · {manualAnimal.categoria} · {manualAnimal.lote}</div>
                      <div className="grid grid-cols-3 gap-1 mt-1.5">
                        {[
                          {label:"Últ. peso", v:`${(pesajes.filter(p=>p.animalId===manualAnimal.id).sort((a,b)=>b.id-a.id)[0]?.peso||manualAnimal.peso).toFixed(1)} kg`, c:"#00c8ff"},
                          {label:"IA estima", v:`${manualIa.pesoEstimado} kg`, c:"#c084fc"},
                          {label:"Score",     v:`${manualIa.scoreDesarrollo}/100`, c: manualIa.alertaNivel==="ok"?"#39ff7e":manualIa.alertaNivel==="alerta"?"#fbbf24":"#f87171"},
                        ].map(m=>(
                          <div key={m.label} className="text-center">
                            <div className="font-bold text-xs" style={{color:m.c}}>{m.v}</div>
                            <div className="text-[8px] text-white/25">{m.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">Peso medido (kg) *</label>
                    <div className="flex gap-1">
                      <input type="number" step="0.1" min="10" max="2000" value={manualPeso}
                        onChange={e=>setManualPeso(e.target.value)} placeholder={manualIa?`${manualIa.pesoEstimado} est.`:"kg"}
                        className="flex-1 px-3 py-2.5 rounded-xl text-white text-sm"
                        style={{background:"rgba(0,200,255,0.05)",border:"1px solid rgba(0,200,255,0.15)",outline:"none"}}/>
                      {manualIa && <button onClick={()=>setManualPeso(String(manualIa.pesoEstimado))}
                        className="px-2 py-2 rounded-xl text-[10px] font-bold"
                        style={{background:"rgba(139,92,246,0.1)",border:"1px solid rgba(139,92,246,0.25)",color:"#c084fc"}} title="Usar predicción IA">
                        🤖
                      </button>}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">Cond. corporal</label>
                    <div className="flex gap-1">
                      <select value={detCondicion} onChange={e=>setDetCondicion(e.target.value)}
                        className="flex-1 px-2 py-2.5 rounded-xl text-white text-xs"
                        style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",outline:"none"}}>
                        {["1.0","1.5","2.0","2.5","3.0","3.5","4.0","4.5","5.0"].map(v=><option key={v} value={v} style={{background:"#0e1e38"}}>CC {v}</option>)}
                      </select>
                      {manualIa && <button onClick={()=>setDetCondicion(String(manualIa.bcsNum))}
                        className="px-2 py-2 rounded-xl text-[10px] font-bold"
                        style={{background:"rgba(139,92,246,0.1)",border:"1px solid rgba(139,92,246,0.25)",color:"#c084fc"}} title="Predicción IA">
                        🤖
                      </button>}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">Estado sanitario</label>
                    <div className="flex gap-1">
                      <select value={detEstadoSan} onChange={e=>setDetEstadoSan(e.target.value)}
                        className="flex-1 px-2 py-2.5 rounded-xl text-white text-xs"
                        style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",outline:"none"}}>
                        {["Sano","Vigilar","En tratamiento","Revisar urgente","Cuarentena"].map(v=><option key={v} value={v} style={{background:"#0e1e38"}}>{v}</option>)}
                      </select>
                      {manualIa && <button onClick={()=>setDetEstadoSan(manualIa.estadoSalud)}
                        className="px-2 py-2 rounded-xl text-[10px]"
                        style={{background:"rgba(139,92,246,0.1)",border:"1px solid rgba(139,92,246,0.25)",color:"#c084fc"}}>
                        🤖
                      </button>}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">Temperatura °C</label>
                    <div className="flex gap-1">
                      <input type="number" step="0.1" min="35" max="42" value={detTemperatura}
                        onChange={e=>setDetTemperatura(e.target.value)} placeholder={manualIa?`${manualIa.temperatura} est.`:"38.5"}
                        className="flex-1 px-3 py-2.5 rounded-xl text-white text-sm"
                        style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",outline:"none"}}/>
                      {manualIa && <button onClick={()=>setDetTemperatura(manualIa.temperatura)}
                        className="px-2 py-2 rounded-xl text-[10px]"
                        style={{background:"rgba(139,92,246,0.1)",border:"1px solid rgba(139,92,246,0.25)",color:"#c084fc"}}>
                        🤖
                      </button>}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">Potrero actual</label>
                    <select value={detPotrero} onChange={e=>setDetPotrero(e.target.value)}
                      className="w-full px-2 py-2.5 rounded-xl text-white text-xs"
                      style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",outline:"none"}}>
                      <option value="" style={{background:"#0e1e38"}}>Sin especificar</option>
                      {potreros.map(p=><option key={p.id} value={p.nombre} style={{background:"#0e1e38"}}>{p.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">Valor COP/kg</label>
                    <input type="number" value={detValorKilo} onChange={e=>setDetValorKilo(e.target.value)} placeholder="11000"
                      className="w-full px-3 py-2.5 rounded-xl text-white text-sm"
                      style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",outline:"none"}}/>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">Próxima vacuna</label>
                  <input value={detProxVac} onChange={e=>setDetProxVac(e.target.value)} placeholder="Ej: Aftosa 15/06/2025"
                    className="w-full px-3 py-2 rounded-xl text-white text-xs"
                    style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",outline:"none"}}/>
                </div>
                <div>
                  <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">Observación veterinaria</label>
                  <textarea value={detObsVet} onChange={e=>setDetObsVet(e.target.value)} rows={2} placeholder="Obs. clínicas, indicaciones…"
                    className="w-full px-3 py-2 rounded-xl text-white text-xs resize-none"
                    style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",outline:"none"}}/>
                </div>
                <div>
                  <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">Observación general</label>
                  <textarea value={detObs} onChange={e=>setDetObs(e.target.value)} rows={2} placeholder="Notas de campo…"
                    className="w-full px-3 py-2 rounded-xl text-white text-xs resize-none"
                    style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",outline:"none"}}/>
                </div>

                {/* Value preview */}
                {Number(manualPeso) > 0 && Number(detValorKilo) > 0 && (
                  <div className="rounded-xl p-3 flex items-center justify-between" style={{background:"rgba(251,191,36,0.08)",border:"1px solid rgba(251,191,36,0.2)"}}>
                    <span className="text-xs text-white/40">Valor estimado:</span>
                    <span className="font-black text-lg" style={{color:"#fbbf24"}}>{fmt(Number(manualPeso)*Number(detValorKilo))}</span>
                  </div>
                )}

                <Button onClick={handleManualSave} disabled={!Number(manualPeso)||!manualAnimal}
                  className="w-full gap-2 font-black h-11"
                  style={{background:"linear-gradient(135deg,#00c8ff,#0ea5e9)",color:"black",boxShadow:"0 0 20px rgba(0,200,255,0.25)"}}>
                  <Printer size={14}/>Guardar pesaje e imprimir recibo
                </Button>
              </div>
            </div>
          )}

          {/* ── HISTORIAL TAB ── */}
          {mainTab === "historial" && (
            <div className="rounded-2xl overflow-hidden" style={{background:"rgba(4,13,26,0.95)",border:"1px solid rgba(255,255,255,0.07)"}}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-white">Historial de pesajes</span>
                    {batchSelectMode && histSelected.size > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{background:"rgba(251,191,36,0.15)",color:"#fbbf24",border:"1px solid rgba(251,191,36,0.3)"}}>{histSelected.size} sel.</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px]" style={{color:"rgba(0,245,212,0.5)"}}>{pesajes.length} reg.</span>
                    {/* Batch select toggle */}
                    <button
                      onClick={()=>{ setBatchSelectMode(v=>!v); setHistSelected(new Set()); }}
                      className="flex items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-bold transition-all"
                      style={{background:batchSelectMode?"rgba(251,191,36,0.15)":"rgba(255,255,255,0.04)",border:`1px solid ${batchSelectMode?"rgba(251,191,36,0.4)":"rgba(255,255,255,0.1)"}`,color:batchSelectMode?"#fbbf24":"rgba(255,255,255,0.4)"}}>
                      <Layers size={10}/>{batchSelectMode ? "Cancelar" : "Lote"}
                    </button>
                    {/* Batch print */}
                    {batchSelectMode && (
                      <button
                        disabled={histSelected.size===0}
                        onClick={()=>{ const sel=pesajes.filter(p=>histSelected.has(p.id)); imprimirLote(sel); }}
                        className="flex items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-bold transition-all"
                        style={{background:histSelected.size>0?"rgba(57,255,126,0.12)":"rgba(255,255,255,0.03)",border:`1px solid ${histSelected.size>0?"rgba(57,255,126,0.35)":"rgba(255,255,255,0.07)"}`,color:histSelected.size>0?"#39ff7e":"rgba(255,255,255,0.2)",cursor:histSelected.size>0?"pointer":"not-allowed"}}>
                        <Printer size={10}/>Imprimir ({histSelected.size})
                      </button>
                    )}
                    {/* CSV download */}
                    <button
                      onClick={()=>{
                        const header = "Folio,Animal,ID,Raza,Categoría,Lote,Peso(kg),PesoAnterior(kg),Diferencia(kg),Fecha,Hora,Método,Dispositivo,Operador,CC,Temperatura,EstadoSanitario,ValorKilo,ValorTotal,ScoreIA,Observación";
                        const rows = pesajes.map(p=>[
                          p.id, p.animalNombre, p.animalId, p.raza||"", p.categoria, p.lote,
                          p.peso.toFixed(1), p.pesoAnterior.toFixed(1), (p.peso-p.pesoAnterior).toFixed(1),
                          p.fecha, p.hora, p.metodo, p.dispositivo, p.operador,
                          p.condicionCorporal||"", p.temperatura||"", p.estadoSanitario||"",
                          p.valorKilo||"", p.valorTotal||"", p.iaScore||"",
                          `"${(p.observacion||"").replace(/"/g,"'")}"`,
                        ].join(","));
                        const csv = [header,...rows].join("\n");
                        const blob = new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"});
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a"); a.href=url; a.download=`pesajes_${new Date().toLocaleDateString("es-CO").replace(/\//g,"-")}.csv`; a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all"
                      style={{background:"rgba(0,245,212,0.1)",border:"1px solid rgba(0,245,212,0.25)",color:"#00f5d4"}}>
                      <Download size={11}/>CSV
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5 max-h-[500px] overflow-y-auto" style={{scrollbarWidth:"thin",scrollbarColor:"rgba(0,245,212,0.2) transparent"}}>
                  {pesajes.slice(0,50).map(p=>{
                    const diff = p.peso - p.pesoAnterior;
                    const animal = animals.find(a=>a.id===p.animalId);
                    return (
                      <div key={p.id}
                        onClick={()=>{ if (batchSelectMode) { setHistSelected(prev=>{ const s=new Set(prev); s.has(p.id)?s.delete(p.id):s.add(p.id); return s; }); } }}
                        className="rounded-2xl p-3 flex gap-3 items-center group hover:border-white/15 transition-all cursor-pointer"
                        style={{background:batchSelectMode&&histSelected.has(p.id)?"rgba(251,191,36,0.08)":"rgba(255,255,255,0.02)",border:`1px solid ${batchSelectMode&&histSelected.has(p.id)?"rgba(251,191,36,0.4)":"rgba(255,255,255,0.06)"}`}}>
                        {batchSelectMode && (
                          <div className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center transition-all"
                            style={{background:histSelected.has(p.id)?"#fbbf24":"rgba(255,255,255,0.06)",border:`1.5px solid ${histSelected.has(p.id)?"#fbbf24":"rgba(255,255,255,0.2)"}`}}>
                            {histSelected.has(p.id) && <Check size={11} style={{color:"black"}}/>}
                          </div>
                        )}
                        <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0">
                          {animal?.foto
                            ? <img src={animal.foto} className="w-full h-full object-cover" alt=""/>
                            : <div className="w-full h-full flex items-center justify-center" style={{background:"rgba(0,245,212,0.06)",fontSize:"1.2rem"}}>🐄</div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-white">{p.animalNombre}</span>
                            <span className="text-[9px] text-white/30">{p.animalId}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                              style={{background:p.metodo==="bluetooth"?"rgba(0,200,255,0.12)":p.metodo==="serial"?"rgba(251,191,36,0.12)":p.metodo==="simulated"?"rgba(139,92,246,0.12)":"rgba(255,255,255,0.06)",color:p.metodo==="bluetooth"?"#00c8ff":p.metodo==="serial"?"#fbbf24":p.metodo==="simulated"?"#c084fc":"rgba(255,255,255,0.5)"}}>
                              {p.metodo==="bluetooth"?"BT":p.metodo==="serial"?"COM":p.metodo==="simulated"?"SIM":"MAN"}
                            </span>
                          </div>
                          <div className="text-[10px] text-white/30 mt-0.5">{p.fecha} {p.hora} · {p.raza||"—"} · {p.lote}</div>
                          {p.observacion && <div className="text-[9px] text-white/20 truncate mt-0.5">{p.observacion}</div>}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-black text-base" style={{color:"#00f5d4"}}>{p.peso.toFixed(1)} kg</div>
                          <div className={`text-xs font-bold flex items-center gap-0.5 justify-end ${diff>=0?"text-green-400":"text-red-400"}`}>
                            {diff>=0?<ArrowUpRight size={10}/>:<ArrowDownRight size={10}/>}{diff>=0?"+":""}{diff.toFixed(1)} kg
                          </div>
                          {(p.valorKilo||0)>0&&<div className="text-[9px]" style={{color:"rgba(251,191,36,0.6)"}}>{fmt(p.peso*(p.valorKilo||0))}</div>}
                        </div>
                        <button onClick={()=>{ const a=animals.find(x=>x.id===p.animalId); imprimirRecibo(p,"GanaderIA PRO",a); }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{background:"rgba(0,245,212,0.1)",border:"1px solid rgba(0,245,212,0.25)",color:"#00f5d4"}}>
                          <Printer size={12}/>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── ESTADÍSTICAS TAB ── */}
          {mainTab === "estadisticas" && (() => {
            /* ── Build chart data ── */
            const allAnim = selectedAnimal ? [selectedAnimal] : animals.slice(0,8);
            /* Weight evolution — selected animal or all */
            const evolData = (() => {
              if (!selectedAnimal) return [];
              return pesajes
                .filter(p=>p.animalId===selectedAnimal.id)
                .sort((a,b)=>a.id-b.id)
                .slice(-12)
                .map(p=>({ fecha:p.fecha.slice(0,5), peso:Number(p.peso.toFixed(1)), valorTotal:p.valorTotal||0, ia:p.iaScore||0 }));
            })();
            /* GDP by animal */
            const gdpData = animals.slice(0,10).map(a=>{
              const hist = pesajes.filter(p=>p.animalId===a.id).sort((a,b)=>a.id-b.id);
              if (hist.length<2) return { nombre:a.nombre.slice(0,8), gdp:0 };
              const last=hist[hist.length-1], prev=hist[hist.length-2];
              const diff=last.peso-prev.peso;
              const [d1,m1,y1]=(prev.fecha||"").split("/").map(Number);
              const [d2,m2,y2]=(last.fecha||"").split("/").map(Number);
              const dias=Math.abs((new Date(y2||2025,(m2||1)-1,d2||1).getTime()-new Date(y1||2025,(m1||1)-1,d1||1).getTime())/86400000)||30;
              return { nombre:a.nombre.slice(0,8), gdp:Math.round((diff/dias)*30*10)/10 };
            }).filter(x=>x.gdp!==0);
            /* Value by lote */
            const loteVal: Record<string,number> = {};
            pesajes.slice(0,100).forEach(p=>{ if (p.lote&&p.valorTotal) loteVal[p.lote]=(loteVal[p.lote]||0)+p.valorTotal; });
            const loteData = Object.entries(loteVal).map(([lote,val])=>({ lote, val:Math.round(val/1000) })).sort((a,b)=>b.val-a.val);
            /* KPIs */
            const totalKg   = pesajes.reduce((s,p)=>s+p.peso,0);
            const promPeso  = pesajes.length>0 ? Math.round(totalKg/pesajes.length*10)/10 : 0;
            const totalVal  = pesajes.reduce((s,p)=>s+(p.valorTotal||0),0);
            const metodos   = pesajes.reduce((m,p)=>{m[p.metodo]=(m[p.metodo]||0)+1;return m;},{} as Record<string,number>);

            return (
              <div className="space-y-4">
                {/* KPI row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    {label:"Total pesajes",    val:pesajes.length,           sub:"registros",       c:"#00f5d4", icon:"📋"},
                    {label:"Peso promedio",    val:`${promPeso} kg`,         sub:"por pesaje",      c:"#39ff7e", icon:"⚖️"},
                    {label:"Total kg pesados", val:`${Math.round(totalKg)} kg`,sub:"acumulado",    c:"#fbbf24", icon:"📦"},
                    {label:"Valor total",      val:fmt(totalVal),            sub:"COP acumulado",   c:"#a78bfa", icon:"💰"},
                  ].map(k=>(
                    <div key={k.label} className="rounded-2xl p-3 text-center"
                      style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${k.c}20`}}>
                      <div className="text-xl mb-1">{k.icon}</div>
                      <div className="font-black text-white text-base">{k.val}</div>
                      <div className="text-[9px] mt-0.5" style={{color:`${k.c}80`}}>{k.label}</div>
                      <div className="text-[8px] text-white/20">{k.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Weight evolution chart */}
                {evolData.length>1 && (
                  <div className="rounded-2xl p-4" style={{background:"rgba(4,13,26,0.95)",border:"1px solid rgba(0,245,212,0.12)"}}>
                    <div className="text-xs font-bold text-white mb-3 flex items-center gap-2">
                      <TrendingUp size={13} style={{color:"#00f5d4"}}/>
                      Evolución de peso — {selectedAnimal?.nombre}
                    </div>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={evolData} margin={{top:4,right:4,left:-20,bottom:0}}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                        <XAxis dataKey="fecha" tick={{fontSize:9,fill:"rgba(255,255,255,0.35)"}}/>
                        <YAxis tick={{fontSize:9,fill:"rgba(255,255,255,0.35)"}}/>
                        <Tooltip contentStyle={{backgroundColor:"#050d18",border:"1px solid rgba(0,245,212,0.2)",borderRadius:"12px",fontSize:"11px"}}/>
                        <Bar dataKey="peso" fill="#00f5d4" radius={[4,4,0,0]} name="Peso (kg)"/>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {evolData.length<=1 && selectedAnimal && (
                  <div className="rounded-2xl p-4 text-center" style={{background:"rgba(4,13,26,0.95)",border:"1px solid rgba(255,255,255,0.06)"}}>
                    <div className="text-white/25 text-sm">Sin historial de pesajes para {selectedAnimal.nombre}</div>
                    <div className="text-white/15 text-xs mt-1">Registra al menos 2 pesajes para ver la evolución</div>
                  </div>
                )}

                {/* GDP ranking */}
                {gdpData.length>0 && (
                  <div className="rounded-2xl p-4" style={{background:"rgba(4,13,26,0.95)",border:"1px solid rgba(57,255,126,0.12)"}}>
                    <div className="text-xs font-bold text-white mb-3 flex items-center gap-2">
                      <BarChart3 size={13} style={{color:"#39ff7e"}}/>
                      GDP (kg/mes) — ranking de animales
                    </div>
                    <ResponsiveContainer width="100%" height={Math.max(100,gdpData.length*30)}>
                      <BarChart data={gdpData} layout="vertical" margin={{top:2,right:24,left:8,bottom:2}}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false}/>
                        <XAxis type="number" tick={{fontSize:9,fill:"rgba(255,255,255,0.35)"}}/>
                        <YAxis type="category" dataKey="nombre" tick={{fontSize:9,fill:"rgba(255,255,255,0.5)"}} width={60}/>
                        <Tooltip contentStyle={{backgroundColor:"#050d18",border:"1px solid rgba(57,255,126,0.2)",borderRadius:"12px",fontSize:"11px"}}/>
                        <Bar dataKey="gdp" radius={[0,4,4,0]} name="GDP kg/mes">
                          {gdpData.map((entry,i)=>(
                            <Cell key={i} fill={entry.gdp>=0?"#39ff7e":"#f87171"}/>
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Value by lote */}
                {loteData.length>0 && (
                  <div className="rounded-2xl p-4" style={{background:"rgba(4,13,26,0.95)",border:"1px solid rgba(251,191,36,0.12)"}}>
                    <div className="text-xs font-bold text-white mb-3 flex items-center gap-2">
                      <DollarSign size={13} style={{color:"#fbbf24"}}/>
                      Valorización por lote (miles COP)
                    </div>
                    <ResponsiveContainer width="100%" height={140}>
                      <BarChart data={loteData} margin={{top:4,right:4,left:-16,bottom:0}}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                        <XAxis dataKey="lote" tick={{fontSize:9,fill:"rgba(255,255,255,0.35)"}}/>
                        <YAxis tick={{fontSize:9,fill:"rgba(255,255,255,0.35)"}}/>
                        <Tooltip contentStyle={{backgroundColor:"#050d18",border:"1px solid rgba(251,191,36,0.2)",borderRadius:"12px",fontSize:"11px"}} formatter={(v:number)=>[`$${v}k COP`,"Valor"]}/>
                        <Bar dataKey="val" fill="#fbbf24" radius={[4,4,0,0]} name="Valor (k COP)"/>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Methods breakdown */}
                <div className="rounded-2xl p-4" style={{background:"rgba(4,13,26,0.95)",border:"1px solid rgba(255,255,255,0.07)"}}>
                  <div className="text-xs font-bold text-white mb-3">Métodos de captura usados</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Object.entries(metodos).map(([met,cnt])=>(
                      <div key={met} className="rounded-xl p-3 text-center"
                        style={{background:met==="bluetooth"?"rgba(0,200,255,0.08)":met==="serial"?"rgba(251,191,36,0.08)":met==="simulated"?"rgba(139,92,246,0.08)":"rgba(255,255,255,0.04)",border:`1px solid ${met==="bluetooth"?"rgba(0,200,255,0.2)":met==="serial"?"rgba(251,191,36,0.2)":met==="simulated"?"rgba(139,92,246,0.2)":"rgba(255,255,255,0.08)"}`}}>
                        <div className="text-xl mb-1">{met==="bluetooth"?"🔵":met==="serial"?"🟡":met==="simulated"?"🟣":"⚪"}</div>
                        <div className="font-black text-white text-lg">{cnt}</div>
                        <div className="text-[9px] text-white/35 capitalize">{met==="bluetooth"?"Bluetooth":met==="serial"?"COM/Serial":met==="simulated"?"Simulado":"Manual"}</div>
                      </div>
                    ))}
                    {Object.keys(metodos).length===0&&<div className="col-span-4 text-center py-4 text-white/20 text-xs">Sin pesajes aún</div>}
                  </div>
                </div>

                {/* Animals without recent weighing */}
                {(() => {
                  const atrasados = animals.filter(a=>{
                    const last=pesajes.filter(p=>p.animalId===a.id).sort((x,y)=>y.id-x.id)[0];
                    if(!last) return true;
                    const [d,m,y]=last.fecha.split("/").map(Number);
                    return (Date.now()-new Date(y,m-1,d).getTime())>30*86400000;
                  });
                  if(!atrasados.length) return null;
                  return (
                    <div className="rounded-2xl p-4" style={{background:"rgba(248,113,113,0.06)",border:"1px solid rgba(248,113,113,0.2)"}}>
                      <div className="text-xs font-bold text-red-400 mb-2 flex items-center gap-2">
                        <AlertTriangle size={13}/> {atrasados.length} animales sin pesaje en +30 días
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {atrasados.slice(0,12).map(a=>(
                          <button key={a.id} onClick={()=>setSelectedAnimal(a)}
                            className="px-2 py-1 rounded-xl text-[9px] font-bold transition-all"
                            style={{background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.25)",color:"#f87171"}}>
                            {a.nombre} · {a.id}
                          </button>
                        ))}
                        {atrasados.length>12&&<span className="text-[9px] text-white/30">+{atrasados.length-12} más</span>}
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          })()}

          {/* ── CONFIG TAB ── */}
          {mainTab === "config" && (
            <div className="space-y-4">

              {/* ── Configuración del Sistema ── */}
              <div className="rounded-2xl overflow-hidden" style={{background:"rgba(4,13,26,0.95)",border:"1px solid rgba(251,191,36,0.22)"}}>
                <div className="h-0.5" style={{background:"linear-gradient(90deg,#fbbf24,#f59e0b,transparent)"}}/>
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{background:"rgba(251,191,36,0.12)",border:"1px solid rgba(251,191,36,0.3)"}}>
                        <Settings2 size={13} style={{color:"#fbbf24"}}/>
                      </div>
                      <span className="font-black text-sm text-white">Configuración del Sistema</span>
                      <span className="text-[9px] text-white/25">· Báscula + Empresa</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {sistemaSaved && <span className="text-[9px] text-green-400 font-bold animate-pulse">✓ Guardado</span>}
                      <button
                        onClick={()=>{ setSistemaCfgEdit({...sistemaCfg}); setSistemaCfgOpen(true); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold"
                        style={{background:"rgba(251,191,36,0.12)",border:"1px solid rgba(251,191,36,0.35)",color:"#fbbf24"}}>
                        <Settings2 size={10}/>Editar sistema
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Comunicación */}
                    <div className="rounded-xl p-3 space-y-2" style={{background:"rgba(251,191,36,0.05)",border:"1px solid rgba(251,191,36,0.15)"}}>
                      <div className="text-[9px] uppercase tracking-wider font-bold" style={{color:"#fbbf24"}}>Parámetros del Indicador Digital de Peso</div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px]">
                        {([
                          ["Puerto COM",   sistemaCfg.puerto],
                          ["Intervalo",    `${sistemaCfg.intervalo} ms`],
                          ["Baudios",      String(sistemaCfg.baudios)],
                          ["Paridad",      sistemaCfg.paridad==="N"?"Ninguna (N)":sistemaCfg.paridad==="E"?"Par (E)":"Impar (O)"],
                          ["Bits datos",   String(sistemaCfg.dataBits)],
                          ["Bits parada",  String(sistemaCfg.stopBits)],
                        ] as [string,string][]).map(([k,v])=>(
                          <div key={k} className="flex flex-col">
                            <span className="text-white/25 text-[9px]">{k}</span>
                            <span className="font-bold text-white">{v}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-1 px-2 py-1.5 rounded-lg text-[9px] font-mono text-center"
                        style={{background:"rgba(0,0,0,0.3)",color:"rgba(251,191,36,0.7)",border:"1px solid rgba(251,191,36,0.1)"}}>
                        {sistemaCfg.baudios},{sistemaCfg.paridad},{sistemaCfg.dataBits},{sistemaCfg.stopBits}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {/* Consecutivos */}
                      <div className="rounded-xl p-3" style={{background:"rgba(0,245,212,0.05)",border:"1px solid rgba(0,245,212,0.15)"}}>
                        <div className="text-[9px] uppercase tracking-wider font-bold mb-2" style={{color:"#00f5d4"}}>Numeración de Consecutivos</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-center">
                            <div className="text-[9px] text-white/25 mb-1">N° Planilla</div>
                            <div className="text-xl font-black" style={{color:"#00f5d4"}}>{sistemaCfg.nPlanilla.toString().padStart(4,"0")}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-[9px] text-white/25 mb-1">N° Tiquete</div>
                            <div className="text-xl font-black" style={{color:"#39ff7e"}}>{sistemaCfg.nTiquete.toString().padStart(4,"0")}</div>
                          </div>
                        </div>
                      </div>
                      {/* Impresión */}
                      <div className="rounded-xl p-3" style={{background:"rgba(192,132,252,0.05)",border:"1px solid rgba(192,132,252,0.15)"}}>
                        <div className="text-[9px] uppercase tracking-wider font-bold mb-2" style={{color:"#c084fc"}}>Ajuste Impresión Tiquete de Pesa</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-center">
                            <div className="text-[9px] text-white/25 mb-1">Vertical (mm)</div>
                            <div className="text-base font-black" style={{color:"#c084fc"}}>{sistemaCfg.impVertical}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-[9px] text-white/25 mb-1">Horizontal (mm)</div>
                            <div className="text-base font-black" style={{color:"#c084fc"}}>{sistemaCfg.impHorizontal}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Empresa */}
                  <div className="rounded-xl p-3 space-y-2" style={{background:"rgba(57,255,126,0.05)",border:"1px solid rgba(57,255,126,0.15)"}}>
                    <div className="text-[9px] uppercase tracking-wider font-bold" style={{color:"#39ff7e"}}>Datos de la Empresa</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 text-[10px]">
                      {([
                        ["Empresa",     sistemaCfg.empresa],
                        ["NIT",         sistemaCfg.nit],
                        ["Teléfono",    sistemaCfg.telefono],
                        ["Dirección",   sistemaCfg.direccion],
                        ["Ciudad",      sistemaCfg.ciudad],
                        ["País",        sistemaCfg.pais],
                        ["ID Producto", sistemaCfg.idProducto],
                      ] as [string,string][]).map(([k,v])=>(
                        <div key={k}>
                          <span className="text-white/25 text-[9px]">{k}: </span>
                          <span className="text-white font-semibold">{v||"—"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Drivers COM Windows ── */}
              <div className="rounded-2xl overflow-hidden" style={{background:"rgba(4,13,26,0.95)",border:"1px solid rgba(0,200,255,0.18)"}}>
                <div className="h-0.5" style={{background:"linear-gradient(90deg,#00c8ff,#818cf8,transparent)"}}/>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{background:"rgba(0,200,255,0.12)",border:"1px solid rgba(0,200,255,0.3)"}}>
                        <Usb size={13} style={{color:"#00c8ff"}}/>
                      </div>
                      <span className="font-black text-sm text-white">Drivers COM · Windows</span>
                      <span className="text-[9px] text-white/25">· USB-Serial</span>
                    </div>
                    <button onClick={()=>setShowWinDrivers(v=>!v)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold"
                      style={{background:"rgba(0,200,255,0.08)",border:"1px solid rgba(0,200,255,0.2)",color:"#00c8ff"}}>
                      {showWinDrivers ? <ChevronUp size={10}/> : <ChevronDown size={10}/>}
                      {showWinDrivers ? "Ocultar" : "Ver drivers"}
                    </button>
                  </div>

                  <div className="rounded-xl px-3 py-2.5 flex items-start gap-2" style={{background:"rgba(0,200,255,0.05)",border:"1px solid rgba(0,200,255,0.12)"}}>
                    <Info size={12} className="mt-0.5 flex-shrink-0" style={{color:"#00c8ff"}}/>
                    <p className="text-[10px]" style={{color:"rgba(0,200,255,0.75)"}}>
                      Para conectar su báscula por puerto COM/USB en Windows, instale el driver del chip del cable convertidor.
                      Identifique el chip en el <strong>Administrador de dispositivos</strong> (Win+X) → Puertos COM y LPT.
                    </p>
                  </div>

                  {showWinDrivers && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {WINDOWS_COM_DRIVERS.map(d=>(
                          <div key={d.id} className="rounded-xl p-3 space-y-2"
                            style={{background:`rgba(${d.glow},0.05)`,border:`1px solid rgba(${d.glow},0.2)`}}>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{d.icon}</span>
                              <div>
                                <div className="font-bold text-xs" style={{color:`rgba(${d.glow},0.9)`}}>{d.nombre}</div>
                                <div className="text-[8px] font-mono text-white/20">{d.sistId}</div>
                              </div>
                            </div>
                            <p className="text-[9px] leading-relaxed" style={{color:"rgba(255,255,255,0.4)"}}>{d.desc}</p>
                            <a href={d.url} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-[10px] font-bold"
                              style={{color:`rgba(${d.glow},0.8)`}}>
                              <Download size={10}/>Descargar driver oficial
                            </a>
                          </div>
                        ))}
                      </div>
                      <div className="rounded-xl p-3 space-y-2" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)"}}>
                        <div className="text-[9px] font-bold text-white/50">Pasos para instalar driver COM en Windows</div>
                        <ol className="text-[9px] space-y-1 list-decimal list-inside" style={{color:"rgba(255,255,255,0.35)"}}>
                          <li>Conecte el cable o adaptador USB-Serial a su PC Windows</li>
                          <li>Abra <strong className="text-white/55">Administrador de dispositivos</strong> (Win+X → Administrador de dispositivos)</li>
                          <li>Busque en <strong className="text-white/55">"Puertos (COM y LPT)"</strong> o <strong className="text-white/55">"Otros dispositivos"</strong></li>
                          <li>Haga clic derecho → <strong className="text-white/55">Actualizar controlador</strong></li>
                          <li>Si no funciona, descargue e instale el driver manual desde el enlace de arriba</li>
                          <li>Reinicie el PC si se solicita, reconecte la báscula y tome nota del puerto asignado (COM X)</li>
                          <li>Ingrese ese puerto en la Configuración del Sistema → Puerto COM</li>
                        </ol>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Trama DB Stats ── */}
              {tramaDbStats && (
                <div className="rounded-2xl p-4" style={{background:"rgba(4,13,26,0.95)",border:"1px solid rgba(57,255,126,0.12)"}}>
                  <div className="flex items-center gap-2 mb-3">
                    <Database size={13} style={{color:"#39ff7e"}}/>
                    <span className="font-black text-sm text-white">Registro de Tramas · Base de Datos</span>
                    <button onClick={loadTramaStats} className="ml-auto p-1 rounded-lg" style={{background:"rgba(57,255,126,0.08)",border:"1px solid rgba(57,255,126,0.15)",color:"#39ff7e"}}>
                      <RefreshCw size={10}/>
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      {label:"Total tramas",  val:tramaDbStats.total,             c:"#00f5d4"},
                      {label:"Capturadas",    val:tramaDbStats.capturadas,        c:"#39ff7e"},
                      {label:"Peso promedio", val:`${tramaDbStats.avgPeso||0} kg`,c:"#fbbf24"},
                    ] as {label:string;val:number|string;c:string}[]).map(k=>(
                      <div key={k.label} className="rounded-xl p-3 text-center" style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${k.c}20`}}>
                        <div className="font-black text-white text-lg">{k.val}</div>
                        <div className="text-[9px] mt-0.5" style={{color:`${k.c}80`}}>{k.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Custom Tramas ── */}
              <div className="rounded-2xl overflow-hidden" style={{background:"rgba(4,13,26,0.95)",border:"1px solid rgba(139,92,246,0.18)"}}>
                <div className="h-0.5" style={{background:"linear-gradient(90deg,#a855f7,#818cf8,transparent)"}}/>
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Radio size={13} style={{color:"#c084fc"}}/>
                      <span className="font-black text-sm text-white">Tramas Personalizadas</span>
                      <span className="text-[9px] text-white/25">({customTramas.length})</span>
                    </div>
                    <button onClick={()=>setShowNewTramaForm(v=>!v)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold"
                      style={{background:"rgba(139,92,246,0.12)",border:"1px solid rgba(139,92,246,0.3)",color:"#c084fc"}}>
                      <Plus size={10}/>{showNewTramaForm?"Cancelar":"Nueva trama"}
                    </button>
                  </div>

                  {showNewTramaForm && (
                    <div className="rounded-xl p-3 space-y-3" style={{background:"rgba(139,92,246,0.06)",border:"1px solid rgba(139,92,246,0.2)"}}>
                      <div className="text-[9px] font-bold" style={{color:"#c084fc"}}>Definir trama personalizada</div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          {label:"Nombre",     key:"nombre"  as const,placeholder:"Mi Báscula"},
                          {label:"Regex",      key:"regex"   as const,placeholder:"([0-9]{3,4})"},
                          {label:"Ejemplo",    key:"ejemplo" as const,placeholder:"STW, 450.3kg"},
                        ].map(f=>(
                          <div key={f.key}>
                            <label className="text-[9px] text-white/30 block mb-1">{f.label}</label>
                            <input value={newTramaForm[f.key]} onChange={e=>setNewTramaForm(x=>({...x,[f.key]:e.target.value}))}
                              placeholder={f.placeholder}
                              className="w-full px-2 py-1.5 rounded-lg text-xs text-white font-mono"
                              style={{background:"rgba(139,92,246,0.08)",border:"1px solid rgba(139,92,246,0.25)",outline:"none"}}/>
                          </div>
                        ))}
                        <div>
                          <label className="text-[9px] text-white/30 block mb-1">Probar extracción</label>
                          <input value={newTramaTest} onChange={e=>setNewTramaTest(e.target.value)}
                            placeholder="Pega una trama real"
                            className="w-full px-2 py-1.5 rounded-lg text-xs text-white font-mono"
                            style={{background:"rgba(0,0,0,0.3)",border:"1px solid rgba(255,255,255,0.08)",outline:"none"}}/>
                        </div>
                      </div>
                      {newTramaTest && (()=>{
                        const r=testCustomTrama({id:'',nombre:'',descripcion:'',regex:newTramaForm.regex,icon:'',color:'',estabilidad_directa:false,ejemplo:'',createdAt:0,active:true},newTramaTest);
                        const matched=r.length>0;
                        return <div className={`rounded-lg px-2 py-1 text-[9px] font-bold ${matched?"text-green-400":"text-red-400"}`}
                          style={{background:matched?"rgba(57,255,126,0.06)":"rgba(248,113,113,0.06)"}}>
                          {matched?`✓ Extraído: ${r[0]} kg`:`✗ Sin coincidencia`}
                        </div>;
                      })()}
                      <button
                        disabled={!newTramaForm.nombre.trim()||!newTramaForm.regex.trim()}
                        onClick={()=>{
                          if(!newTramaForm.nombre.trim()||!newTramaForm.regex.trim()) return;
                          const t:CustomTrama={id:`ct_${Date.now()}`,nombre:newTramaForm.nombre,descripcion:'',regex:newTramaForm.regex,icon:newTramaForm.icon,color:newTramaForm.color,estabilidad_directa:false,ejemplo:newTramaForm.ejemplo,createdAt:Date.now(),active:true};
                          const next=[...customTramas,t]; setCustomTramas(next); saveCustomTramas(next);
                          setShowNewTramaForm(false); setNewTramaForm({nombre:"",regex:"([0-9]{3,4})",icon:"🔧",color:"#94a3b8",ejemplo:""});
                        }}
                        className="px-3 py-1.5 rounded-xl text-[10px] font-bold"
                        style={{background:"rgba(139,92,246,0.15)",border:"1px solid rgba(139,92,246,0.4)",color:"#c084fc"}}>
                        Guardar trama
                      </button>
                    </div>
                  )}
                  <div className="space-y-2">
                    {customTramas.map((ct,i)=>(
                      <div key={ct.id} className="rounded-xl p-3 flex items-center gap-3" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)"}}>
                        <span className="text-base">{ct.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white">{ct.nombre}</div>
                          <div className="font-mono text-[9px] text-white/30 mt-0.5 truncate">{ct.regex}</div>
                          {ct.ejemplo&&<div className="text-[9px] text-white/20 italic truncate">{ct.ejemplo}</div>}
                        </div>
                        <button onClick={()=>{ const n=customTramas.filter((_,j)=>j!==i); setCustomTramas(n); saveCustomTramas(n); }}
                          className="text-[9px] text-red-400/50 hover:text-red-400 px-2 py-1">✕</button>
                      </div>
                    ))}
                    {customTramas.length===0&&<div className="text-[9px] text-white/20 py-2 text-center">Sin tramas personalizadas definidas</div>}
                  </div>
                </div>
              </div>

              {/* ── Print Template ── */}
              <div className="rounded-2xl overflow-hidden" style={{background:"rgba(4,13,26,0.95)",border:"1px solid rgba(57,255,126,0.12)"}}>
                <div className="h-0.5" style={{background:"linear-gradient(90deg,#39ff7e,transparent)"}}/>
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Printer size={13} style={{color:"#39ff7e"}}/>
                    <span className="font-black text-sm text-white">Plantilla de Impresión Tiquete</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      {label:"Encabezado",  key:"header" as const, placeholder:"Ganadería El Rancho · Tiquete de Báscula"},
                      {label:"Pie de página",key:"footer"as const, placeholder:"Gracias por su confianza · CIVAC PRO"},
                    ].map(f=>(
                      <div key={f.key}>
                        <label className="text-[9px] text-white/30 uppercase tracking-wider block mb-1">{f.label}</label>
                        <input value={(printTmpl as any)[f.key]||""} onChange={e=>{ const t={...printTmpl,[f.key]:e.target.value}; setPrintTmpl(t); savePrintTemplate(t); }}
                          placeholder={f.placeholder}
                          className="w-full px-3 py-2 rounded-xl text-white text-xs"
                          style={{background:"rgba(57,255,126,0.04)",border:"1px solid rgba(57,255,126,0.15)",outline:"none"}}/>
                      </div>
                    ))}
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        {k:"showLogo"      as const, label:"Mostrar logo"},
                        {k:"showBarcode"   as const, label:"Código de barras"},
                        {k:"showQR"        as const, label:"Código QR"},
                        {k:"showSignature" as const, label:"Línea de firma"},
                      ]).map(({k,label})=>(
                        <label key={k} className="flex items-center gap-2 cursor-pointer">
                          <button type="button" onClick={()=>{ const t={...printTmpl,[k]:!(printTmpl as any)[k]}; setPrintTmpl(t); savePrintTemplate(t); }}
                            className="w-9 h-5 rounded-full relative flex-shrink-0"
                            style={{background:(printTmpl as any)[k]?"rgba(57,255,126,0.4)":"rgba(255,255,255,0.1)"}}>
                            <div className="absolute w-4 h-4 rounded-full top-0.5 transition-all"
                              style={{background:"white",left:(printTmpl as any)[k]?"calc(100% - 1.15rem)":"0.125rem"}}/>
                          </button>
                          <span className="text-[10px] text-white/50">{label}</span>
                        </label>
                      ))}
                    </div>
                    {configSaved&&<div className="text-[10px] text-green-400 font-bold animate-pulse">✓ Plantilla guardada</div>}
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* ═══ COL 3: IA Panel ═══ */}
        <div className="space-y-3">
          <IAPanel animal={selectedAnimal} pesajes={pesajes} ia={ia} valorKilo={Number(detValorKilo)||11000}/>

          {/* IA autocomplete toggle */}
          <div className="rounded-2xl p-3 flex items-center gap-3" style={{background:"rgba(139,92,246,0.06)",border:"1px solid rgba(139,92,246,0.15)"}}>
            <Brain size={14} style={{color:"#c084fc"}}/>
            <div className="flex-1">
              <div className="text-xs font-bold text-white">Pre-llenar con IA</div>
              <div className="text-[9px] text-white/30">Al capturar, auto-rellena CC, temp y estado (editable)</div>
            </div>
            <button onClick={()=>setDetIAAccepted(v=>!v)}
              className="w-10 h-5 rounded-full relative transition-colors flex-shrink-0"
              style={{background:detIAAccepted?"rgba(192,132,252,0.4)":"rgba(255,255,255,0.1)"}}>
              <div className="absolute w-4 h-4 rounded-full top-0.5 transition-all"
                style={{background:"white",left:detIAAccepted?"calc(100% - 1.25rem)":"0.125rem"}}/>
            </button>
          </div>

          {/* Quick stats */}
          <div className="rounded-2xl p-4" style={{background:"rgba(4,13,26,0.95)",border:"1px solid rgba(255,255,255,0.07)"}}>
            <div className="text-[10px] text-white/25 uppercase tracking-wider mb-3">Estadísticas rápidas</div>
            <div className="space-y-2">
              {[
                {label:"Pesajes hoy",         v:hoy,                              c:"#39ff7e"},
                {label:"Total registros",     v:pesajes.length,                   c:"#00c8ff"},
                {label:"Animales en cola",    v:animalQueue.length,               c:"#fbbf24"},
                {label:"Sin pesar (30d)",     v:animals.filter(a=>{ const last=pesajes.filter(p=>p.animalId===a.id).sort((x,y)=>y.id-x.id)[0]; if(!last) return true; const [d,m,y]=last.fecha.split("/").map(Number); return (Date.now()-new Date(y,m-1,d).getTime())>30*86400000; }).length, c:"#f87171" },
              ].map(s=>(
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-[10px] text-white/35">{s.label}</span>
                  <span className="font-black text-sm" style={{color:s.c}}>{s.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── CAPTURE DETAIL DIALOG ── */}
      <Dialog open={captureDialogOpen} onOpenChange={setCaptureDialogOpen}>
        <DialogContent className="sm:max-w-[520px] max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target size={16} className="text-green-400"/>
              Registrar pesaje — {selectedAnimal?.nombre}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Weight */}
            <div className="rounded-2xl p-4 text-center" style={{background:"rgba(57,255,126,0.06)",border:"1px solid rgba(57,255,126,0.2)"}}>
              <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Peso capturado</div>
              <div className="text-4xl font-black" style={{color:"#39ff7e",textShadow:"0 0 20px rgba(57,255,126,0.4)"}}>{capturedWeight.toFixed(1)} <span className="text-base text-white/40">kg</span></div>
              {ia && (
                <div className="mt-2 text-[10px]" style={{color:"rgba(0,245,212,0.6)"}}>
                  IA estimaba: {ia.pesoEstimado} kg · Diferencia: {(capturedWeight-ia.pesoEstimado).toFixed(1)} kg
                </div>
              )}
            </div>

            {/* IA notice */}
            {detIAAccepted && ia && (
              <div className="rounded-xl px-3 py-2 flex items-center gap-2" style={{background:"rgba(139,92,246,0.08)",border:"1px solid rgba(139,92,246,0.2)"}}>
                <Brain size={12} style={{color:"#c084fc"}}/>
                <p className="text-[10px]" style={{color:"rgba(192,132,252,0.8)"}}>Campos pre-llenados con IA · Score {ia.scoreDesarrollo}/100 · Todos editables</p>
              </div>
            )}

            {/* Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">Cond. corporal</label>
                <div className="flex gap-1">
                  <select value={detCondicion} onChange={e=>setDetCondicion(e.target.value)}
                    className="flex-1 px-2 py-2 rounded-xl text-white text-xs"
                    style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",outline:"none"}}>
                    {["1.0","1.5","2.0","2.5","3.0","3.5","4.0","4.5","5.0"].map(v=><option key={v} value={v} style={{background:"#0e1e38"}}>CC {v}</option>)}
                  </select>
                  {ia&&<button onClick={()=>setDetCondicion(String(ia.bcsNum))} className="px-1.5 rounded-lg text-[9px] font-bold" style={{background:"rgba(139,92,246,0.12)",color:"#c084fc",border:"1px solid rgba(139,92,246,0.2)"}}>IA</button>}
                </div>
              </div>
              <div>
                <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">Temp. °C</label>
                <div className="flex gap-1">
                  <input type="number" step="0.1" min="35" max="42" value={detTemperatura} onChange={e=>setDetTemperatura(e.target.value)} placeholder="38.5"
                    className="flex-1 px-2 py-2 rounded-xl text-white text-xs"
                    style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",outline:"none"}}/>
                  {ia&&<button onClick={()=>setDetTemperatura(ia.temperatura)} className="px-1.5 rounded-lg text-[9px] font-bold" style={{background:"rgba(139,92,246,0.12)",color:"#c084fc",border:"1px solid rgba(139,92,246,0.2)"}}>IA</button>}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">Estado sanitario</label>
                <div className="flex gap-1">
                  <select value={detEstadoSan} onChange={e=>setDetEstadoSan(e.target.value)}
                    className="flex-1 px-2 py-2 rounded-xl text-white text-xs"
                    style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",outline:"none"}}>
                    {["Sano","Vigilar","En tratamiento","Revisar urgente","Cuarentena"].map(v=><option key={v} value={v} style={{background:"#0e1e38"}}>{v}</option>)}
                  </select>
                  {ia&&<button onClick={()=>setDetEstadoSan(ia.estadoSalud)} className="px-1.5 rounded-lg text-[9px] font-bold" style={{background:"rgba(139,92,246,0.12)",color:"#c084fc",border:"1px solid rgba(139,92,246,0.2)"}}>IA</button>}
                </div>
              </div>
              <div>
                <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">Potrero</label>
                <select value={detPotrero} onChange={e=>setDetPotrero(e.target.value)}
                  className="w-full px-2 py-2 rounded-xl text-white text-xs"
                  style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",outline:"none"}}>
                  <option value="" style={{background:"#0e1e38"}}>—</option>
                  {potreros.map(p=><option key={p.id} value={p.nombre} style={{background:"#0e1e38"}}>{p.nombre}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">Valor COP/kg</label>
                <input type="number" value={detValorKilo} onChange={e=>setDetValorKilo(e.target.value)} placeholder="11000"
                  className="w-full px-3 py-2 rounded-xl text-white text-sm"
                  style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",outline:"none"}}/>
              </div>
              <div>
                <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">Próxima vacuna</label>
                <input value={detProxVac} onChange={e=>setDetProxVac(e.target.value)} placeholder="Ej: Aftosa"
                  className="w-full px-3 py-2 rounded-xl text-white text-sm"
                  style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",outline:"none"}}/>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">Obs. veterinaria</label>
              <textarea value={detObsVet} onChange={e=>setDetObsVet(e.target.value)} rows={2} placeholder="Indicaciones clínicas…"
                className="w-full px-3 py-2 rounded-xl text-white text-xs resize-none"
                style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",outline:"none"}}/>
            </div>
            <div>
              <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">Observación general</label>
              <textarea value={detObs} onChange={e=>setDetObs(e.target.value)} rows={2} placeholder="Notas de campo…"
                className="w-full px-3 py-2 rounded-xl text-white text-xs resize-none"
                style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",outline:"none"}}/>
            </div>
            {Number(detValorKilo)>0 && (
              <div className="rounded-xl p-3 flex items-center justify-between" style={{background:"rgba(251,191,36,0.08)",border:"1px solid rgba(251,191,36,0.2)"}}>
                <span className="text-xs text-white/40">Valor del animal:</span>
                <span className="font-black text-xl" style={{color:"#fbbf24"}}>{fmt(capturedWeight*Number(detValorKilo))}</span>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={()=>setCaptureDialogOpen(false)}>Cancelar</Button>
            <Button onClick={saveCapturedPeso}
              style={{background:"linear-gradient(135deg,#39ff7e,#00c864)",color:"#052010"}}
              className="gap-2 font-bold">
              <Printer size={13}/>Guardar e imprimir recibo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── NEW ANIMAL DIALOG ── */}
      <Dialog open={showNewAnimal} onOpenChange={open=>{setShowNewAnimal(open);if(!open){setNewAFoto(null);setNewAFotoName("");}}}>
        <DialogContent className="sm:max-w-[520px] max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><UserPlus size={16} className="text-green-400"/>Registrar nuevo animal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Photo */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Foto del animal (opcional)</Label>
              <div className="flex gap-3 items-start">
                <div className="w-24 h-24 rounded-2xl flex-shrink-0 overflow-hidden flex items-center justify-center"
                  style={{background:"rgba(57,255,126,0.05)",border:`2px ${newAFoto?"solid rgba(57,255,126,0.4)":"dashed rgba(255,255,255,0.1)"}`}}>
                  {newAFoto?<img src={newAFoto} alt="preview" className="w-full h-full object-cover"/>:<span className="text-3xl opacity-20">🐄</span>}
                </div>
                <div className="flex-1 space-y-2">
                  <input ref={fotoInputRef} type="file" accept="image/*" className="hidden" onChange={handleFotoChange}/>
                  <input id="cameraCapInput" type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFotoChange}/>
                  <button type="button" onClick={()=>fotoInputRef.current?.click()} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold"
                    style={{background:"rgba(57,255,126,0.1)",border:"1px solid rgba(57,255,126,0.3)",color:"#39ff7e"}}>
                    <Image size={12}/>Subir desde galería
                  </button>
                  <button type="button" onClick={()=>(document.getElementById("cameraCapInput") as HTMLInputElement)?.click()} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold"
                    style={{background:"rgba(0,200,255,0.08)",border:"1px solid rgba(0,200,255,0.25)",color:"#00c8ff"}}>
                    <Camera size={12}/>Tomar foto con cámara
                  </button>
                  {newAFoto&&<button type="button" onClick={()=>{setNewAFoto(null);setNewAFotoName("");}} className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold" style={{background:"rgba(255,80,80,0.08)",border:"1px solid rgba(255,80,80,0.2)",color:"#ff7070"}}>
                    <XIcon size={11}/>Quitar foto
                  </button>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>ID / Arete *</Label><Input value={newAId} onChange={e=>setNewAId(e.target.value)} placeholder="VCA-014"/>
                {newAId&&animals.find(a=>a.id===newAId.trim())&&<p className="text-[10px] text-red-400">⚠ ID ya existe</p>}
              </div>
              <div className="space-y-1"><Label>Nombre *</Label><Input value={newANombre} onChange={e=>setNewANombre(e.target.value)} placeholder="Bonita"/></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Raza</Label>
                <Select value={newARaza} onValueChange={setNewARaza}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>{Object.keys(PESOS_RAZA).concat(["Criollo","Normando"]).map(r=><SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Categoría</Label>
                <Select value={newACat} onValueChange={setNewACat}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>{["Vaca adulta","Novilla","Ternera","Toro","Novillo","Ternero","Cría"].map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Lote</Label>
                <Select value={newALote} onValueChange={setNewALote}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>{["Lote A","Lote B","Lote C","Lote D","Lote E","Lote F","Ordeño","Maternidad","Engorde"].map(l=><SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Fecha nacimiento</Label><Input type="date" value={newAFechaNac} onChange={e=>setNewAFechaNac(e.target.value)}/></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>¿Tiene registro?</Label>
                <Select value={newARegistro} onValueChange={setNewARegistro}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent><SelectItem value="SI">Sí — con registro</SelectItem><SelectItem value="NO">No — sin registro</SelectItem></SelectContent>
                </Select>
              </div>
              {newARegistro==="SI"&&<div className="space-y-1"><Label>Número registro</Label><Input value={newANumReg} onChange={e=>setNewANumReg(e.target.value)} placeholder="REG-0099"/></div>}
            </div>

            {/* IA reference */}
            {newARaza&&newACat&&(()=>{
              const ref = getPesoRef(newARaza, newACat);
              return (
                <div className="rounded-xl p-3 flex items-center gap-3" style={{background:"rgba(139,92,246,0.06)",border:"1px solid rgba(139,92,246,0.2)"}}>
                  <Brain size={14} style={{color:"#c084fc"}}/>
                  <div className="text-[10px]">
                    <span className="font-bold" style={{color:"#c084fc"}}>{newARaza} — {newACat}</span>
                    <span className="text-white/40 ml-2">Peso esperado: {ref.min}–{ref.max} kg · Prom: {ref.prom} kg · GDP: +{ref.gdpMes} kg/mes</span>
                  </div>
                </div>
              );
            })()}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={()=>setShowNewAnimal(false)}>Cancelar</Button>
            <Button onClick={handleRegNewAnimal} disabled={!newAId.trim()||!newANombre.trim()||!!animals.find(a=>a.id===newAId.trim())}
              style={{background:"rgba(57,255,126,0.9)",color:"black"}} className="gap-2 font-bold">
              <UserPlus size={13}/>{newAFoto?"📸 ":""}Registrar animal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── SISTEMA CONFIG DIALOG ── */}
      <Dialog open={sistemaCfgOpen} onOpenChange={setSistemaCfgOpen}>
        <DialogContent className="sm:max-w-[620px] max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 size={16} style={{color:"#fbbf24"}}/>
              Configuración del Sistema de Báscula
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">

            {/* 1. Parámetros de Comunicación */}
            <div className="rounded-2xl p-4 space-y-3" style={{background:"rgba(251,191,36,0.05)",border:"1px solid rgba(251,191,36,0.2)"}}>
              <div className="text-[10px] uppercase tracking-wider font-bold" style={{color:"#fbbf24"}}>
                Parámetros de Comunicación del Indicador Digital de Peso
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px]">Puerto COM</Label>
                  <Select value={sistemaCfgEdit.puerto} onValueChange={v=>setSistemaCfgEdit(c=>({...c,puerto:v}))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue/></SelectTrigger>
                    <SelectContent>
                      {["COM1","COM2","COM3","COM4","COM5","COM6","COM7","COM8","COM9","COM10","USB","Auto"].map(p=>(
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Intervalo (ms)</Label>
                  <Select value={String(sistemaCfgEdit.intervalo)} onValueChange={v=>setSistemaCfgEdit(c=>({...c,intervalo:Number(v)}))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue/></SelectTrigger>
                    <SelectContent>
                      {[50,100,200,300,500,1000].map(n=>(
                        <SelectItem key={n} value={String(n)}>{n} ms</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Baudios</Label>
                  <Select value={String(sistemaCfgEdit.baudios)} onValueChange={v=>setSistemaCfgEdit(c=>({...c,baudios:Number(v)}))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue/></SelectTrigger>
                    <SelectContent>
                      {[1200,2400,4800,9600,19200,38400,57600,115200].map(n=>(
                        <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Paridad</Label>
                  <Select value={sistemaCfgEdit.paridad} onValueChange={v=>setSistemaCfgEdit(c=>({...c,paridad:v}))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="N">Ninguna (N)</SelectItem>
                      <SelectItem value="E">Par (E)</SelectItem>
                      <SelectItem value="O">Impar (O)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Bits de datos</Label>
                  <Select value={String(sistemaCfgEdit.dataBits)} onValueChange={v=>setSistemaCfgEdit(c=>({...c,dataBits:Number(v)}))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 bits</SelectItem>
                      <SelectItem value="8">8 bits</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Bits de parada</Label>
                  <Select value={String(sistemaCfgEdit.stopBits)} onValueChange={v=>setSistemaCfgEdit(c=>({...c,stopBits:Number(v)}))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="1.5">1.5</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="px-3 py-2 rounded-xl text-center font-mono text-sm font-bold" style={{background:"rgba(0,0,0,0.4)",color:"#fbbf24",border:"1px solid rgba(251,191,36,0.15)"}}>
                Parámetros: {sistemaCfgEdit.baudios},{sistemaCfgEdit.paridad},{sistemaCfgEdit.dataBits},{sistemaCfgEdit.stopBits}
              </div>
            </div>

            {/* 2. Consecutivos */}
            <div className="rounded-2xl p-4 space-y-3" style={{background:"rgba(0,245,212,0.05)",border:"1px solid rgba(0,245,212,0.18)"}}>
              <div className="text-[10px] uppercase tracking-wider font-bold" style={{color:"#00f5d4"}}>
                Numeración de Consecutivos
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-[10px]">N° Planilla</Label>
                  <Input type="number" min={1} value={sistemaCfgEdit.nPlanilla}
                    onChange={e=>setSistemaCfgEdit(c=>({...c,nPlanilla:Math.max(1,Number(e.target.value))}))}
                    className="h-9 text-center font-black text-base"/>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">N° Tiquete</Label>
                  <Input type="number" min={1} value={sistemaCfgEdit.nTiquete}
                    onChange={e=>setSistemaCfgEdit(c=>({...c,nTiquete:Math.max(1,Number(e.target.value))}))}
                    className="h-9 text-center font-black text-base"/>
                </div>
              </div>
            </div>

            {/* 3. Ajuste Impresión */}
            <div className="rounded-2xl p-4 space-y-3" style={{background:"rgba(192,132,252,0.05)",border:"1px solid rgba(192,132,252,0.18)"}}>
              <div className="text-[10px] uppercase tracking-wider font-bold" style={{color:"#c084fc"}}>
                Ajuste Impresión Tiquete de Pesa
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-[10px]">Vertical (mm)</Label>
                  <Input type="number" step={0.5} value={sistemaCfgEdit.impVertical}
                    onChange={e=>setSistemaCfgEdit(c=>({...c,impVertical:Number(e.target.value)}))}
                    className="h-9"/>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Horizontal (mm)</Label>
                  <Input type="number" step={0.5} value={sistemaCfgEdit.impHorizontal}
                    onChange={e=>setSistemaCfgEdit(c=>({...c,impHorizontal:Number(e.target.value)}))}
                    className="h-9"/>
                </div>
              </div>
            </div>

            {/* 4. Datos Empresa */}
            <div className="rounded-2xl p-4 space-y-3" style={{background:"rgba(57,255,126,0.05)",border:"1px solid rgba(57,255,126,0.18)"}}>
              <div className="text-[10px] uppercase tracking-wider font-bold" style={{color:"#39ff7e"}}>
                Datos de la Empresa
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-[10px]">Nombre de la empresa</Label>
                  <Input value={sistemaCfgEdit.empresa} onChange={e=>setSistemaCfgEdit(c=>({...c,empresa:e.target.value}))} placeholder="Ganadería El Rancho Verde"/>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">NIT</Label>
                  <Input value={sistemaCfgEdit.nit} onChange={e=>setSistemaCfgEdit(c=>({...c,nit:e.target.value}))} placeholder="900.123.456-7"/>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Teléfono</Label>
                  <Input value={sistemaCfgEdit.telefono} onChange={e=>setSistemaCfgEdit(c=>({...c,telefono:e.target.value}))} placeholder="310 000 0000"/>
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-[10px]">Dirección</Label>
                  <Input value={sistemaCfgEdit.direccion} onChange={e=>setSistemaCfgEdit(c=>({...c,direccion:e.target.value}))} placeholder="Vía Principal km 5"/>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Ciudad</Label>
                  <Input value={sistemaCfgEdit.ciudad} onChange={e=>setSistemaCfgEdit(c=>({...c,ciudad:e.target.value}))} placeholder="Bogotá"/>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">País</Label>
                  <Input value={sistemaCfgEdit.pais} onChange={e=>setSistemaCfgEdit(c=>({...c,pais:e.target.value}))} placeholder="Colombia"/>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">ID Producto</Label>
                  <Input value={sistemaCfgEdit.idProducto} onChange={e=>setSistemaCfgEdit(c=>({...c,idProducto:e.target.value}))} placeholder="CIVAC-PRO-001"/>
                </div>
              </div>
            </div>

          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={()=>setSistemaCfgOpen(false)}>Cancelar</Button>
            <Button onClick={guardarSistemaCfg}
              style={{background:"linear-gradient(135deg,#fbbf24,#f59e0b)",color:"black"}}
              className="gap-2 font-bold">
              <Check size={14}/>Guardar configuración
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
