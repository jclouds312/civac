import { useState } from "react";
import {
  BookOpen, Download, Smartphone, WifiOff, Bluetooth, Navigation, BarChart3, Users,
  Monitor, Globe, Play, CheckCircle, Cloud, FileDown, Upload, Database,
  Apple, ChevronRight, Star, Lock, Shield
} from "lucide-react";
import { exportToDrive, getDriveFiles, downloadLocalBackup, downloadCSV } from "@/lib/drive";
import { useAppState } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

const SECTIONS = [
  { id: "inicio", label: "Primeros pasos", icon: Play },
  { id: "pwa", label: "Instalar PWA", icon: Smartphone },
  { id: "offline", label: "Uso sin internet", icon: WifiOff },
  { id: "bluetooth", label: "Pesaje Bluetooth", icon: Bluetooth },
  { id: "gps", label: "GPS Ganado", icon: Navigation },
  { id: "drive", label: "Sync con Drive", icon: Cloud },
  { id: "dashboard", label: "Dashboard PRO", icon: BarChart3 },
  { id: "usuarios", label: "Gestión de usuarios", icon: Users },
  { id: "descarga", label: "Descargar datos", icon: FileDown },
];

function PwaIllustration() {
  return (
    <svg viewBox="0 0 500 240" className="w-full max-w-lg mx-auto rounded-xl" style={{filter:"drop-shadow(0 4px 32px rgba(0,200,100,0.18))"}}>
      <defs>
        <linearGradient id="pwaBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#0d1f14"/><stop offset="100%" stopColor="#0a1a10"/></linearGradient>
        <linearGradient id="pwaGreen" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#16a34a"/><stop offset="100%" stopColor="#059669"/></linearGradient>
        <linearGradient id="pwaBlue" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#2563eb"/><stop offset="100%" stopColor="#1d4ed8"/></linearGradient>
      </defs>
      <rect width="500" height="240" rx="14" fill="url(#pwaBg)" stroke="#1f3a27" strokeWidth="1.5"/>
      {/* Browser chrome */}
      <rect x="20" y="15" width="290" height="175" rx="10" fill="#0d1510" stroke="#1a3a22" strokeWidth="1.2"/>
      <rect x="20" y="15" width="290" height="34" rx="10" fill="#1a2e1e"/>
      <rect x="20" y="39" width="290" height="10" fill="#1a2e1e"/>
      <circle cx="38" cy="32" r="4.5" fill="#ef4444" opacity="0.8"/>
      <circle cx="53" cy="32" r="4.5" fill="#f59e0b" opacity="0.8"/>
      <circle cx="68" cy="32" r="4.5" fill="#22c55e" opacity="0.8"/>
      <rect x="82" y="24" width="190" height="16" rx="8" fill="#0d1f14"/>
      <text x="177" y="34.5" textAnchor="middle" fill="#4ade80" fontSize="8" fontFamily="monospace">ganader.ia</text>
      {/* Install banner */}
      <rect x="30" y="58" width="270" height="42" rx="8" fill="#14532d" stroke="#16a34a" strokeWidth="1"/>
      <text x="42" y="73" fill="#86efac" fontSize="9" fontWeight="bold">📲 Instalar GanaderIA como app</text>
      <text x="42" y="86" fill="#4ade80" fontSize="7.5">Sin ocupar espacio · Funciona sin internet · 1 clic</text>
      <rect x="238" y="63" width="52" height="26" rx="7" fill="url(#pwaGreen)"/>
      <text x="264" y="79" textAnchor="middle" fill="white" fontSize="8.5" fontWeight="bold">Instalar</text>
      {/* Page content preview */}
      <rect x="30" y="108" width="120" height="60" rx="6" fill="#0a1a10"/>
      <rect x="33" y="111" width="114" height="12" rx="3" fill="#1a3a22"/>
      <text x="90" y="120" textAnchor="middle" fill="#4ade80" fontSize="7">GanaderIA PRO</text>
      {[0,1,2].map(i=><rect key={i} x="33" y={127+i*13} width={80+i*10} height="8" rx="2" fill="#1a2e1e"/>)}
      <rect x="158" y="108" width="120" height="60" rx="6" fill="#0a1a10"/>
      <text x="218" y="125" textAnchor="middle" fill="#60a5fa" fontSize="8" fontWeight="bold">Dashboard</text>
      {[52,60,55,65,58].map((h,i)=><rect key={i} x={163+i*22} y={135+(65-h)*0.3} width="16" height={h*0.3} rx="2" fill="#16a34a" opacity={0.7+i*0.05}/>)}
      {/* Phone showing homescreen */}
      <rect x="335" y="25" width="120" height="195" rx="18" fill="#080f0a" stroke="#1f3a27" strokeWidth="1.5"/>
      <rect x="342" y="40" width="106" height="165" rx="8" fill="#0d1a10"/>
      <text x="395" y="60" textAnchor="middle" fill="#6ee7b7" fontSize="7.5">Pantalla de inicio</text>
      {[
        {x:354,y:70,bg:"url(#pwaGreen)",e:"🐄",n:"GanaderIA"},
        {x:392,y:70,bg:"#1e3a5f",e:"📊",n:"Dashboard"},
        {x:430,y:70,bg:"#3b1f5e",e:"📡",n:"GPS"},
        {x:354,y:120,bg:"#2d1b00",e:"⚖️",n:"Pesaje BT"},
        {x:392,y:120,bg:"#14532d",e:"🥛",n:"Producción"},
        {x:430,y:120,bg:"#1e1e3f",e:"💰",n:"Costos"},
      ].map((ic,i)=>(
        <g key={i}>
          <rect x={ic.x} y={ic.y} width="30" height="30" rx="8" fill={ic.bg}/>
          <text x={ic.x+15} y={ic.y+19} textAnchor="middle" fontSize="13">{ic.e}</text>
          <text x={ic.x+15} y={ic.y+41} textAnchor="middle" fill="#4ade80" fontSize="5.5">{ic.n}</text>
        </g>
      ))}
      <rect x="370" y="195" width="50" height="5" rx="3" fill="#1a3a22"/>
      {/* Arrow */}
      <path d="M 318 110 L 340 110" stroke="#4ade80" strokeWidth="2" strokeDasharray="4,3"/>
      <polygon points="338,106 345,110 338,114" fill="#4ade80"/>
      {/* Steps */}
      <text x="177" y="202" textAnchor="middle" fill="#6ee7b7" fontSize="9.5" fontWeight="bold">① Clic "Instalar"  →  ② Aceptar  →  ③ Abierto desde inicio</text>
      <text x="177" y="218" textAnchor="middle" fill="#4ade80" fontSize="8">✓ Android · iOS · Windows · Mac · Sin tienda de apps</text>
    </svg>
  );
}

function OfflineIllustration() {
  return (
    <svg viewBox="0 0 500 190" className="w-full max-w-lg mx-auto rounded-xl">
      <defs>
        <linearGradient id="offL" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#1a0505"/><stop offset="100%" stopColor="#0a0f1a"/></linearGradient>
      </defs>
      <rect width="500" height="190" rx="14" fill="url(#offL)" stroke="#2a1515" strokeWidth="1.5"/>
      <circle cx="90" cy="95" r="55" fill="#1a0808" stroke="#ef4444" strokeWidth="1.5"/>
      <text x="90" y="88" textAnchor="middle" fill="#ef4444" fontSize="30">📵</text>
      <text x="90" y="110" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="bold">Sin internet</text>
      <text x="90" y="124" textAnchor="middle" fill="#ef4444" fontSize="7.5">Sin señal WiFi / 4G</text>
      <path d="M 155 95 L 195 95" stroke="#4ade80" strokeWidth="3" strokeLinecap="round"/>
      <polygon points="193,89 205,95 193,101" fill="#4ade80"/>
      <rect x="210" y="25" width="265" height="140" rx="12" fill="#0a1f14" stroke="#1a4a2e" strokeWidth="1.5"/>
      <text x="342" y="50" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="bold">GanaderIA — Modo Offline ✓</text>
      {[
        {x:220,y:58,w:115,h:28,fill:"#14532d",t:"🐄 13 animales",s:"Inventario completo"},
        {x:348,y:58,w:117,h:28,fill:"#1e3a5f",t:"⚖️ Pesaje BT",s:"Báscula conectada"},
        {x:220,y:94,w:115,h:28,fill:"#2d1b00",t:"📡 GPS activo",s:"6 collares online"},
        {x:348,y:94,w:117,h:28,fill:"#1f1f3a",t:"🔔 Alertas",s:"3 activas"},
      ].map((c,i)=>(
        <g key={i}>
          <rect x={c.x} y={c.y} width={c.w} height={c.h} rx="6" fill={c.fill}/>
          <text x={c.x+8} y={c.y+13} fill="white" fontSize="7.5" fontWeight="bold">{c.t}</text>
          <text x={c.x+8} y={c.y+23} fill="#6ee7b7" fontSize="6.5">{c.s}</text>
        </g>
      ))}
      <rect x="220" y="130" width="245" height="22" rx="5" fill="#1a3a10"/>
      <text x="342" y="143" textAnchor="middle" fill="#4ade80" fontSize="7.5" fontWeight="bold">✓ Datos guardados localmente · Sincroniza al reconectar</text>
      <text x="90" y="165" textAnchor="middle" fill="#ef4444" fontSize="7.5" fontWeight="bold">× Desconectado</text>
      <text x="342" y="178" textAnchor="middle" fill="#4ade80" fontSize="7.5" fontWeight="bold">La app funciona igual — 100% offline</text>
    </svg>
  );
}

function BluetoothIllustration() {
  return (
    <svg viewBox="0 0 500 210" className="w-full max-w-lg mx-auto rounded-xl">
      <rect width="500" height="210" rx="14" fill="#080c1a" stroke="#1e2a4a" strokeWidth="1.5"/>
      <rect x="20" y="50" width="130" height="110" rx="12" fill="#0d1533" stroke="#1e40af" strokeWidth="1.5"/>
      <text x="85" y="90" textAnchor="middle" fill="#60a5fa" fontSize="26">⚖️</text>
      <text x="85" y="112" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">520 kg</text>
      <text x="85" y="128" textAnchor="middle" fill="#93c5fd" fontSize="7.5">Tru-Test XR3000</text>
      <text x="85" y="142" textAnchor="middle" fill="#3b82f6" fontSize="7">● BT activo</text>
      {[0,1,2,3].map(i=>(
        <ellipse key={i} cx="185" cy="105" rx={18+i*16} ry={12+i*10} fill="none" stroke="#3b82f6" strokeWidth={1.2-i*0.2} opacity={0.7-i*0.12} strokeDasharray="5,4"/>
      ))}
      <text x="185" y="109" textAnchor="middle" fill="#3b82f6" fontSize="14">᪥</text>
      <text x="185" y="170" textAnchor="middle" fill="#60a5fa" fontSize="7.5">Señal Bluetooth</text>
      <rect x="240" y="30" width="85" height="150" rx="14" fill="#0a0f1a" stroke="#0ea5e9" strokeWidth="1.5"/>
      <rect x="247" y="46" width="71" height="118" rx="6" fill="#0f1e2a"/>
      <text x="282" y="62" textAnchor="middle" fill="#4ade80" fontSize="7" fontWeight="bold">GanaderIA</text>
      <rect x="250" y="66" width="65" height="24" rx="4" fill="#1a3a1a" stroke="#16a34a" strokeWidth="0.8"/>
      <text x="282" y="79" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">520 kg</text>
      <text x="282" y="88" textAnchor="middle" fill="#4ade80" fontSize="6">Rosaura · A-0042</text>
      <rect x="250" y="94" width="65" height="14" rx="3" fill="#1e3a5f"/>
      <text x="282" y="103" textAnchor="middle" fill="#93c5fd" fontSize="6">▲ +8 kg vs anterior</text>
      <rect x="250" y="113" width="65" height="14" rx="3" fill="#14532d"/>
      <text x="282" y="122" textAnchor="middle" fill="#86efac" fontSize="6">GMD: 0.53 kg/día</text>
      <rect x="250" y="131" width="65" height="22" rx="4" fill="#16a34a"/>
      <text x="282" y="144" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">✓ Guardar pesaje</text>
      <text x="282" y="180" textAnchor="middle" fill="#0ea5e9" fontSize="7">App GanaderIA</text>
      {[
        {y:58,t:"① Active Bluetooth en su cel",c:"#94a3b8"},
        {y:76,t:"② Encienda la báscula",c:"#94a3b8"},
        {y:94,t:"③ Clic «Conectar BT»",c:"#4ade80",bold:true},
        {y:112,t:"④ Peso en tiempo real ✓",c:"#4ade80",bold:true},
        {y:130,t:"⑤ Seleccione animal",c:"#94a3b8"},
        {y:148,t:"⑥ Guardar historial",c:"#94a3b8"},
      ].map(s=>(
        <text key={s.y} x="350" y={s.y} fill={s.c} fontSize="8.5" fontWeight={s.bold?"bold":"normal"}>{s.t}</text>
      ))}
    </svg>
  );
}

function GpsIllustration() {
  return (
    <svg viewBox="0 0 500 210" className="w-full max-w-lg mx-auto rounded-xl">
      <rect width="500" height="210" rx="14" fill="#060e09" stroke="#1a4a2e" strokeWidth="1.5"/>
      {[0,1,2,3,4,5].map(i=>(
        <line key={`h${i}`} x1="15" y1={30+i*32} x2="485" y2={30+i*32} stroke="#1a2e1e" strokeWidth="0.5"/>
      ))}
      {[0,1,2,3,4,5,6,7].map(i=>(
        <line key={`v${i}`} x1={15+i*68} y1="30" x2={15+i*68} y2="190" stroke="#1a2e1e" strokeWidth="0.5"/>
      ))}
      {[
        {x:25,y:35,w:110,h:80,fill:"#14532d",stroke:"#16a34a",label:"Potrero 1"},
        {x:160,y:40,w:95,h:70,fill:"#1e3a5f",stroke:"#3b82f6",label:"Potrero 3"},
        {x:295,y:32,w:120,h:90,fill:"#3b1f5e",stroke:"#7c3aed",label:"Potrero 4"},
        {x:30,y:140,w:90,h:45,fill:"#14532d",stroke:"#16a34a",label:"Potrero 2"},
        {x:160,y:132,w:95,h:50,fill:"#2d1b00",stroke:"#f59e0b",label:"Potrero 5"},
      ].map(z=>(
        <g key={z.label}>
          <rect x={z.x} y={z.y} width={z.w} height={z.h} rx="8" fill={z.fill} opacity="0.45" stroke={z.stroke} strokeWidth="1"/>
          <text x={z.x+z.w/2} y={z.y+z.h/2+3} textAnchor="middle" fill={z.stroke} fontSize="7.5" fontWeight="bold">{z.label}</text>
        </g>
      ))}
      {[
        {x:60,y:58,n:"Rosaura",c:"#4ade80"},{x:80,y:72,n:"Estrella",c:"#34d399"},
        {x:50,y:90,n:"Cielo",c:"#6ee7b7"},{x:200,y:65,n:"Tormenta",c:"#60a5fa"},
        {x:220,y:82,n:"Palmera",c:"#93c5fd"},{x:340,y:60,n:"Bravo",c:"#c084fc"},
        {x:355,y:85,n:"Niebla",c:"#a78bfa"},
      ].map(a=>(
        <g key={a.n}>
          <circle cx={a.x} cy={a.y} r="6" fill={a.c} opacity="0.9"/>
          <circle cx={a.x} cy={a.y} r="11" fill={a.c} opacity="0.18"/>
          <text x={a.x} y={a.y-10} textAnchor="middle" fill={a.c} fontSize="5.5" fontWeight="bold">{a.n}</text>
        </g>
      ))}
      {/* Alert */}
      <circle cx="340" cy="60" r="9" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3,2"/>
      <text x="362" y="53" fill="#f59e0b" fontSize="6.5">⚠ Batería 28%</text>
      {/* Fence break */}
      <circle cx="435" cy="70" r="7" fill="#ef4444" opacity="0.9"/>
      <circle cx="435" cy="70" r="13" fill="#ef4444" opacity="0.15"/>
      <text x="435" y="62" textAnchor="middle" fill="#ef4444" fontSize="6">⚠</text>
      <text x="435" y="90" textAnchor="middle" fill="#ef4444" fontSize="6.5">Fuera de zona</text>
      {/* Legend */}
      <rect x="15" y="193" width="470" height="14" rx="4" fill="#0a1a10"/>
      <text x="30" y="202" fill="#4ade80" fontSize="6.5">● En potrero</text>
      <text x="110" y="202" fill="#f59e0b" fontSize="6.5">⚠ Batería baja</text>
      <text x="200" y="202" fill="#ef4444" fontSize="6.5">● Fuera de geocerca</text>
      <text x="320" y="202" fill="#60a5fa" fontSize="6.5">📡 7 collares activos · Actualiza c/2 min</text>
    </svg>
  );
}

function DashboardIllustration() {
  return (
    <svg viewBox="0 0 500 230" className="w-full max-w-lg mx-auto rounded-xl">
      <rect width="500" height="230" rx="14" fill="#060e09" stroke="#1a4a2e" strokeWidth="1.5"/>
      <rect x="0" y="0" width="72" height="230" rx="14" fill="#0a1510" stroke="#1a2e1e" strokeWidth="0.5"/>
      <rect x="8" y="12" width="56" height="22" rx="6" fill="#14532d"/>
      <text x="36" y="26" textAnchor="middle" fill="#4ade80" fontSize="9" fontWeight="bold">GIA PRO</text>
      {["🐄","🔁","🥛","⚖️","📡","💰","🤖","👥"].map((e,i)=>(
        <g key={i}>
          <rect x="10" y={42+i*22} width="52" height="18" rx="5" fill={i===0?"#14532d":"transparent"} opacity="0.8"/>
          <text x="22" y={54+i*22} fill="#4ade80" fontSize="11">{e}</text>
        </g>
      ))}
      {/* KPI row */}
      {[
        {x:82,label:"🐄 Animales",val:"13",c1:"#14532d",c2:"#16a34a"},
        {x:168,label:"🥛 Litros/día",val:"84 L",c1:"#1e3a5f",c2:"#3b82f6"},
        {x:254,label:"⚖️ Peso prom",val:"417kg",c1:"#2d1b00",c2:"#f59e0b"},
        {x:340,label:"📡 GPS Live",val:"7 🟢",c1:"#0d2030",c2:"#0ea5e9"},
        {x:426,label:"💰 Utilidad",val:"47%",c1:"#1a1a10",c2:"#84cc16"},
      ].map(k=>(
        <g key={k.x}>
          <rect x={k.x} y="12" width="74" height="48" rx="7" fill={k.c1} stroke={k.c2} strokeWidth="1"/>
          <text x={k.x+8} y="27" fill={k.c2} fontSize="7">{k.label}</text>
          <text x={k.x+8} y="48" fill="white" fontSize={k.val.length>5?"11":"14"} fontWeight="bold">{k.val}</text>
        </g>
      ))}
      {/* Main chart */}
      <rect x="82" y="68" width="200" height="90" rx="7" fill="#0a1510" stroke="#1a2e1e" strokeWidth="1"/>
      <text x="92" y="82" fill="#4ade80" fontSize="7" fontWeight="bold">Producción Lechera · 7 meses</text>
      {[52000,55000,58000,62000,60000,56000,61300].map((v,i)=>(
        <g key={i}>
          <rect x={90+i*25} y={85+(62000-v)/1000*0.8} width="19" height={(v-50000)/1000*0.8} rx="2" fill="#16a34a" opacity={0.65+i*0.05}/>
          <text x={99+i*25} y={150} textAnchor="middle" fill="#6ee7b7" fontSize="5.5">{["Oct","Nov","Dic","Ene","Feb","Mar","Abr"][i]}</text>
        </g>
      ))}
      {/* GPS Widget */}
      <rect x="290" y="68" width="200" height="90" rx="7" fill="#0a1510" stroke="#1a2e1e" strokeWidth="1"/>
      <text x="300" y="82" fill="#0ea5e9" fontSize="7" fontWeight="bold">📡 GPS Ganado — Live</text>
      {[
        {n:"Rosaura",p:"Potrero 1",b:87,c:"#4ade80"},{n:"Estrella",p:"Potrero 1",b:72,c:"#4ade80"},
        {n:"Bravo",p:"Potrero 4",b:91,c:"#4ade80"},{n:"Palmera",p:"Potrero 3",b:28,c:"#ef4444"},
      ].map((a,i)=>(
        <g key={a.n}>
          <circle cx="302" cy={91+i*15} r="3" fill={a.c}/>
          <text x="309" y={95+i*15} fill="#e2e8f0" fontSize="6.5">{a.n}</text>
          <text x="355" y={95+i*15} fill="#94a3b8" fontSize="6">{a.p}</text>
          <text x="418" y={95+i*15} fill={a.c} fontSize="6.5" fontWeight="bold">{a.b}%</text>
        </g>
      ))}
      {/* Pesaje Widget */}
      <rect x="82" y="165" width="200" height="55" rx="7" fill="#0a1510" stroke="#1a2e1e" strokeWidth="1"/>
      <text x="92" y="179" fill="#f59e0b" fontSize="7" fontWeight="bold">⚖️ Pesaje BT — Últimos registros</text>
      {[{n:"Rosaura",p:520,d:"+8"},{n:"Estrella",p:535,d:"+7"},{n:"Bravo",p:810,d:"+5"}].map((a,i)=>(
        <g key={a.n}>
          <text x="92" y={191+i*11} fill="#94a3b8" fontSize="6.5">{a.n}</text>
          <text x="185" y={191+i*11} fill="#f59e0b" fontSize="6.5" fontWeight="bold">{a.p} kg</text>
          <text x="228" y={191+i*11} fill="#4ade80" fontSize="6.5">{a.d} kg</text>
        </g>
      ))}
      {/* Alerts */}
      <rect x="290" y="165" width="200" height="55" rx="7" fill="#0a1510" stroke="#1a2e1e" strokeWidth="1"/>
      <text x="300" y="179" fill="#ef4444" fontSize="7" fontWeight="bold">🔔 Alertas activas</text>
      {["⚠ Potrero 4: rotar pronto","🏥 Perla: en tratamiento","💊 Oxitocina: stock bajo"].map((a,i)=>(
        <text key={i} x="300" y={191+i*11} fill={i===1?"#ef4444":"#f59e0b"} fontSize="6.5">{a}</text>
      ))}
    </svg>
  );
}

export default function Documentacion() {
  const [activeSection, setActiveSection] = useState("inicio");
  const { animals, pesajes, gpsUbicaciones } = useAppState();
  const { toast } = useToast();
  const [driveFiles, setDriveFiles] = useState(getDriveFiles);
  const [exportLoading, setExportLoading] = useState(false);

  const handleExportDrive = async (label: string, data: object) => {
    setExportLoading(true);
    try {
      const file = await exportToDrive(data, `GanaderIA_${label}_${new Date().toISOString().slice(0,10)}.json`);
      setDriveFiles(prev => [file, ...prev]);
      toast({ title: "✓ Guardado en Drive", description: `${file.name} subido correctamente` });
    } catch {
      toast({ title: "Error", description: "No se pudo subir", variant: "destructive" });
    } finally { setExportLoading(false); }
  };

  const handleDownload = async (label: string, data: object) => {
    await downloadLocalBackup(data, `GanaderIA_${label}_${new Date().toISOString().slice(0,10)}.json`);
    toast({ title: "✓ Descarga iniciada", description: `${label}.json descargado` });
  };

  const handleCSV = async (label: string, rows: object[]) => {
    await downloadCSV(rows, `GanaderIA_${label}_${new Date().toISOString().slice(0,10)}.csv`);
    toast({ title: "✓ CSV exportado", description: `${label}.csv descargado` });
  };

  const sections: Record<string, React.ReactNode> = {
    inicio: (
      <div className="space-y-5">
        <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 rounded-2xl p-5">
          <h2 className="text-xl font-bold mb-2">Bienvenido a GanaderIA PRO</h2>
          <p className="text-muted-foreground text-sm">Sistema integral de gestión ganadera con IA, pesaje Bluetooth, GPS en tiempo real y PWA offline completa.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {icon:"🐄",title:"Gestión completa del hato",desc:"Inventario, fichas individuales, pesajes, reproducción y genética.",color:"border-emerald-500/30 bg-emerald-500/5"},
            {icon:"⚖️",title:"Pesaje Bluetooth",desc:"Báscula Tru-Test vía BT. Pesos en tiempo real, GMD y análisis.",color:"border-amber-500/30 bg-amber-500/5"},
            {icon:"📡",title:"GPS Ganado en tiempo real",desc:"Rastreo, geocercas, alertas de escape y batería de collares.",color:"border-cyan-500/30 bg-cyan-500/5"},
            {icon:"🤖",title:"Predicciones IA",desc:"Alertas inteligentes, riesgo sanitario y partos estimados.",color:"border-purple-500/30 bg-purple-500/5"},
            {icon:"📱",title:"PWA Offline",desc:"Instale en cualquier dispositivo. Funciona sin internet.",color:"border-blue-500/30 bg-blue-500/5"},
            {icon:"☁",title:"Google Drive Sync",desc:"Respaldo y exportación en JSON/CSV a Google Drive.",color:"border-green-500/30 bg-green-500/5"},
          ].map(c=>(
            <div key={c.title} className={`border rounded-xl p-4 ${c.color}`}>
              <div className="text-2xl mb-2">{c.icon}</div>
              <h3 className="font-semibold text-sm mb-1">{c.title}</h3>
              <p className="text-xs text-muted-foreground">{c.desc}</p>
            </div>
          ))}
        </div>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto">
          <h3 className="font-semibold text-sm mb-3">Credenciales de acceso demo</h3>
          <table className="w-full text-xs min-w-[400px]">
            <thead><tr className="border-b border-border">
              <th className="text-left py-2 text-muted-foreground">Perfil</th>
              <th className="text-left py-2 text-muted-foreground">Email</th>
              <th className="text-left py-2 text-muted-foreground">Contraseña</th>
              <th className="text-left py-2 text-muted-foreground">Acceso</th>
            </tr></thead>
            <tbody>
              {[
                {p:"Admin 👑",e:"admin@ganader.ia",pw:"admin",a:"Total"},
                {p:"Veterinario 🩺",e:"vet@ganader.ia",pw:"vet2025",a:"Clínico + GPS"},
                {p:"Campo 🐄",e:"luis@ganader.ia",pw:"campo2025",a:"Inventario + Pesaje BT"},
                {p:"Visor 💼",e:"visor@ganader.ia",pw:"visor",a:"Solo lectura"},
              ].map(r=>(
                <tr key={r.p} className="border-b border-border/40 last:border-0">
                  <td className="py-2 font-medium">{r.p}</td>
                  <td className="py-2 font-mono text-blue-400">{r.e}</td>
                  <td className="py-2 font-mono text-amber-400">{r.pw}</td>
                  <td className="py-2 text-muted-foreground">{r.a}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ),
    pwa: (
      <div className="space-y-5">
        <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-2xl p-5">
          <h2 className="text-xl font-bold mb-2">Instalar GanaderIA como app</h2>
          <p className="text-muted-foreground text-sm">PWA instalable en cualquier dispositivo. Sin tienda de apps. Funciona offline. Actualización automática.</p>
        </div>
        <PwaIllustration />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {platform:"Windows",icon:<Monitor className="w-5 h-5"/>,color:"from-blue-600 to-blue-800",
              steps:["Abra Chrome o Edge","Menú ⋮ → «Instalar GanaderIA»","La app aparece en el escritorio","Funciona sin internet"]},
            {platform:"Android",icon:<Globe className="w-5 h-5"/>,color:"from-green-600 to-green-800",
              steps:["Abra Chrome","Banner automático aparece","Toque «Instalar»","Icono en pantalla de inicio"]},
            {platform:"iPhone/iPad",icon:<Apple className="w-5 h-5"/>,color:"from-slate-600 to-slate-800",
              steps:["Abra Safari","Icono compartir ↑","«Agregar a pantalla de inicio»","Confirme el nombre"]},
            {platform:"Mac / Linux",icon:<Globe className="w-5 h-5"/>,color:"from-purple-600 to-purple-800",
              steps:["Chrome o Edge","Ícono instalar en barra URL","Instalar y confirmar","Acceso desde dock/apps"]},
          ].map(p=>(
            <div key={p.platform} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className={`bg-gradient-to-r ${p.color} p-3 flex items-center gap-2`}>
                <div className="text-white">{p.icon}</div>
                <span className="text-white font-bold text-sm">{p.platform}</span>
              </div>
              <div className="p-3">
                <ol className="space-y-1.5">
                  {p.steps.map((s,i)=>(
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[9px] flex-shrink-0">{i+1}</span>{s}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>
        {/* Windows download highlight */}
        <div className="bg-gradient-to-r from-blue-900/40 to-blue-800/30 border border-blue-500/40 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl flex-shrink-0">
              <Monitor className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">GanaderIA para Windows</h3>
              <p className="text-muted-foreground text-sm">Instale desde Chrome o Edge. Compatible con Windows 10/11. Sin instalador, sin tienda.</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {["Chrome 88+","Edge 90+","Offline-ready","Gratis","Sin tienda"].map(t=>(
                  <span key={t} className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <button
                onClick={()=>{
                  const p = (window as any).__pwaInstallPrompt;
                  if(p){p.prompt();}
                  else{toast({title:"Instalar en Windows",description:"Haga clic en el ícono de instalación (⊕) en la barra de dirección de Chrome/Edge"});}
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-lg text-sm"
              >
                <Download className="w-4 h-4" />
                Descargar para Windows
              </button>
              <p className="text-[10px] text-muted-foreground text-center">PWA · Chrome/Edge · Sin instalador .exe</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {icon:"⚡",title:"Carga instantánea",desc:"Menos de 1 segundo"},
            {icon:"📵",title:"Offline completo",desc:"Sin internet funciona"},
            {icon:"🔄",title:"Auto actualización",desc:"Siempre última versión"},
            {icon:"🔒",title:"Datos seguros",desc:"Todo en su dispositivo"},
          ].map(b=>(
            <div key={b.title} className="bg-card border border-border rounded-xl p-3 text-center">
              <div className="text-xl mb-1">{b.icon}</div>
              <p className="font-semibold text-xs">{b.title}</p>
              <p className="text-[10px] text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
    offline: (
      <div className="space-y-5">
        <div className="bg-gradient-to-r from-slate-700/30 to-gray-700/20 border border-slate-500/30 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2"><WifiOff className="w-6 h-6 text-slate-400" /><h2 className="text-xl font-bold">Uso sin conexión a internet</h2></div>
          <p className="text-muted-foreground text-sm">GanaderIA guarda todo localmente. Trabaje en el campo sin señal y sincronice al reconectar.</p>
        </div>
        <OfflineIllustration />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-semibold text-sm text-green-400 mb-3">✓ Disponible sin internet</h3>
            <ul className="space-y-2">
              {["Dashboard y KPIs en tiempo real","Inventario completo de animales","Registro de pesajes (Bluetooth)","Crear y ver alertas","Producción lechera y ordeños","Potreros y rotaciones","Fichas individuales por animal","Insumos y kardex de stock"].map(f=>(
                <li key={f} className="flex items-center gap-2 text-xs"><CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0"/>{f}</li>
              ))}
            </ul>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-semibold text-sm text-amber-400 mb-3">⚡ Sincronización automática</h3>
            <div className="space-y-3">
              {[
                {s:"1",t:"Trabaje normalmente",d:"Todos los cambios se guardan localmente en tiempo real."},
                {s:"2",t:"Reconecte internet",d:"El sistema detecta la conexión automáticamente."},
                {s:"3",t:"Sincronización en segundo plano",d:"Datos locales se sincronizan con el servidor."},
                {s:"4",t:"Conflictos resueltos",d:"Se conserva la versión más reciente en caso de conflicto."},
              ].map(s=>(
                <div key={s.s} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center flex-shrink-0">{s.s}</div>
                  <div><p className="text-xs font-semibold">{s.t}</p><p className="text-[10px] text-muted-foreground">{s.d}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    bluetooth: (
      <div className="space-y-5">
        <div className="bg-gradient-to-r from-blue-700/20 to-indigo-700/20 border border-blue-500/30 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2"><Bluetooth className="w-6 h-6 text-blue-400" /><h2 className="text-xl font-bold">Pesaje con báscula Bluetooth</h2></div>
          <p className="text-muted-foreground text-sm">Conecte su báscula ganadera vía Bluetooth y registre pesos en tiempo real.</p>
        </div>
        <BluetoothIllustration />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-semibold text-sm mb-3">Básculas compatibles</h3>
            {[
              {name:"Tru-Test XR3000",status:"✓ Probada",c:"text-green-400"},
              {name:"Tru-Test S3",status:"✓ Probada",c:"text-green-400"},
              {name:"Gallagher W210",status:"✓ Compatible",c:"text-green-400"},
              {name:"VETEK VE-3K",status:"⚠ En prueba",c:"text-amber-400"},
              {name:"BT genérico UART",status:"✓ Compatible",c:"text-green-400"},
            ].map(b=>(
              <div key={b.name} className="flex justify-between text-xs py-1.5 border-b border-border/40 last:border-0">
                <span>{b.name}</span><span className={b.c}>{b.status}</span>
              </div>
            ))}
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-semibold text-sm mb-3">Paso a paso</h3>
            <ol className="space-y-2">
              {[
                "Active el Bluetooth en su teléfono o tablet",
                "Encienda la báscula y active modo BT en ella",
                "Vaya a Módulo Pesaje → «Conectar Bluetooth»",
                "Seleccione su báscula de la lista de dispositivos",
                "El peso aparece automáticamente en pantalla",
                "Seleccione el animal, verifique y guarde",
              ].map((s,i)=>(
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold text-[9px] flex items-center justify-center flex-shrink-0">{i+1}</span>{s}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    ),
    gps: (
      <div className="space-y-5">
        <div className="bg-gradient-to-r from-cyan-700/20 to-blue-700/20 border border-cyan-500/30 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2"><Navigation className="w-6 h-6 text-cyan-400" /><h2 className="text-xl font-bold">Rastreo GPS del ganado</h2></div>
          <p className="text-muted-foreground text-sm">Localice su ganado en tiempo real con collares GPS. Alertas de escape, batería baja y geocercas automáticas.</p>
        </div>
        <GpsIllustration />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {icon:"📍",title:"Ubicación en tiempo real",desc:"Vea cada animal en el mapa. Actualiza cada 1–5 minutos según configuración del collar."},
            {icon:"🔔",title:"Alertas automáticas",desc:"Notificaciones cuando un animal sale de geocerca, batería baja < 30% o sin señal > 30 min."},
            {icon:"🗺",title:"Historial de movimientos",desc:"Recorrido de cada animal en los últimos 7 días. Detecte comportamientos anómalos."},
          ].map(c=>(
            <div key={c.title} className="bg-card border border-border rounded-xl p-4">
              <div className="text-2xl mb-2">{c.icon}</div>
              <h3 className="font-semibold text-sm mb-1">{c.title}</h3>
              <p className="text-xs text-muted-foreground">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
    drive: (
      <div className="space-y-5">
        <div className="bg-gradient-to-r from-green-700/20 to-blue-700/20 border border-green-500/30 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2"><Cloud className="w-6 h-6 text-green-400" /><h2 className="text-xl font-bold">Sincronización con Google Drive</h2></div>
          <p className="text-muted-foreground text-sm">Suba respaldos y descargue sus datos en cualquier momento. JSON y CSV disponibles.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Upload className="w-4 h-4 text-green-400"/>Subir a Drive</h3>
            <div className="space-y-2">
              {[
                {label:"Backup completo",data:{animals,pesajes,gpsUbicaciones}},
                {label:"Animales",data:animals},
                {label:"Pesajes",data:pesajes},
                {label:"GPS",data:gpsUbicaciones},
              ].map(e=>(
                <button key={e.label} onClick={()=>handleExportDrive(e.label,e.data)} disabled={exportLoading}
                  className="w-full text-left px-3 py-2.5 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-300 hover:bg-green-500/20 transition-all flex items-center gap-2">
                  <Cloud className="w-3.5 h-3.5 flex-shrink-0"/>{e.label}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><FileDown className="w-4 h-4 text-blue-400"/>Descargar localmente</h3>
            <div className="space-y-2">
              {[
                {label:"Backup completo JSON",data:{animals,pesajes,gpsUbicaciones},csv:null},
                {label:"Animales CSV",data:null,csv:animals as object[]},
                {label:"Pesajes CSV",data:null,csv:pesajes as object[]},
              ].map(e=>(
                <button key={e.label}
                  onClick={()=>e.csv?handleCSV(e.label.split(" ")[0],e.csv):handleDownload(e.label.split(" ")[0],e.data!)}
                  className="w-full text-left px-3 py-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 hover:bg-blue-500/20 transition-all flex items-center gap-2">
                  <FileDown className="w-3.5 h-3.5 flex-shrink-0"/>{e.label}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Database className="w-4 h-4 text-purple-400"/>Archivos guardados</h3>
            {driveFiles.length===0?(
              <div className="text-center py-6 text-muted-foreground"><Cloud className="w-8 h-8 mx-auto mb-2 opacity-30"/><p className="text-xs">Sin archivos aún</p></div>
            ):(
              <div className="space-y-2">
                {driveFiles.slice(0,6).map(f=>(
                  <div key={f.id} className="flex items-center gap-2 py-1.5 border-b border-border/40 last:border-0">
                    <Cloud className="w-3 h-3 text-green-400 flex-shrink-0"/>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium truncate">{f.name}</p>
                      <p className="text-[9px] text-muted-foreground">{f.date} · {(f.size/1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    dashboard: (
      <div className="space-y-5">
        <div className="bg-gradient-to-r from-emerald-700/20 to-green-700/20 border border-emerald-500/30 rounded-2xl p-5">
          <h2 className="text-xl font-bold mb-2">Dashboard PRO — Tablero central</h2>
          <p className="text-muted-foreground text-sm">Vista de todos los KPIs críticos de su operación en tiempo real con gráficos interactivos.</p>
        </div>
        <DashboardIllustration />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            {title:"KPIs superiores",desc:"Total animales, litros/día, peso promedio, gestantes, en tratamiento y valor del hato"},
            {title:"Gráficos históricos",desc:"Producción lechera y peso de los últimos 7 meses con AreaChart interactivo"},
            {title:"Composición del hato",desc:"PieChart con vacas, novillas, terneros y toros con porcentajes"},
            {title:"Widget Pesaje BT",desc:"Últimos pesajes, GMD promedio y acceso rápido al módulo de pesaje"},
            {title:"Widget GPS Live",desc:"Collares online, baterías, alertas y acceso al mapa GPS en tiempo real"},
            {title:"KPIs reproductivos",desc:"Concepción, gestantes, destetes y natalidad vs metas. Resumen financiero mensual"},
          ].map(w=>(
            <div key={w.title} className="bg-card border border-border rounded-xl p-3">
              <p className="font-semibold text-xs mb-1">{w.title}</p>
              <p className="text-[10px] text-muted-foreground">{w.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
    usuarios: (
      <div className="space-y-5">
        <div className="bg-gradient-to-r from-purple-700/20 to-indigo-700/20 border border-purple-500/30 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2"><Users className="w-6 h-6 text-purple-400"/><h2 className="text-xl font-bold">Gestión de usuarios y permisos</h2></div>
          <p className="text-muted-foreground text-sm">Cree y administre usuarios con roles y permisos para cada miembro del equipo.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {role:"👑 Admin",color:"text-emerald-400",border:"border-emerald-500/30",desc:"Acceso total: todos los módulos, gestión de usuarios, configuración y facturación."},
            {role:"🩺 Veterinario",color:"text-blue-400",border:"border-blue-500/30",desc:"Inventario, reproducción, producción, genética, insumos, pesaje y GPS. Sin finanzas ni usuarios."},
            {role:"🐄 Campo",color:"text-orange-400",border:"border-orange-500/30",desc:"Inventario, producción, potreros, alimentación, insumos y pesaje BT. Vista simplificada."},
            {role:"💼 Visor/Propietario",color:"text-purple-400",border:"border-purple-500/30",desc:"Solo lectura: inventario, producción, costos, predicciones y GPS. Sin edición."},
          ].map(r=>(
            <div key={r.role} className={`bg-card border ${r.border} rounded-xl p-4`}>
              <p className={`font-bold text-sm ${r.color} mb-1`}>{r.role}</p>
              <p className="text-xs text-muted-foreground">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
    descarga: (
      <div className="space-y-5">
        <div className="bg-gradient-to-r from-indigo-700/20 to-blue-700/20 border border-indigo-500/30 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2"><FileDown className="w-6 h-6 text-indigo-400"/><h2 className="text-xl font-bold">Descargar y exportar todos sus datos</h2></div>
          <p className="text-muted-foreground text-sm">Exporte en JSON o CSV para respaldo, análisis externo o migración. Los archivos CSV abren en Excel y Sheets.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-sm">Exportar JSON</h3>
            {[
              {label:"Backup completo del sistema",data:{animals,pesajes,gpsUbicaciones}},
              {label:"Animales — inventario",data:animals},
              {label:"Pesajes — historial",data:pesajes},
              {label:"GPS — ubicaciones",data:gpsUbicaciones},
            ].map(e=>(
              <button key={e.label} onClick={()=>handleDownload(e.label.split(" ")[0],e.data)}
                className="w-full text-left px-4 py-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 rounded-xl text-xs transition-all flex items-center gap-2">
                <FileDown className="w-4 h-4 flex-shrink-0"/>{e.label}
              </button>
            ))}
          </div>
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-sm">Exportar CSV (Excel / Sheets)</h3>
            {[
              {label:"Animales — inventario completo",rows:animals as object[]},
              {label:"Pesajes — historial completo",rows:pesajes as object[]},
              {label:"GPS — ubicaciones actuales",rows:gpsUbicaciones as object[]},
            ].map(e=>(
              <button key={e.label} onClick={()=>handleCSV(e.label.split(" ")[0],e.rows)}
                className="w-full text-left px-4 py-3 bg-green-500/10 border border-green-500/20 text-green-300 hover:bg-green-500/20 rounded-xl text-xs transition-all flex items-center gap-2">
                <Download className="w-4 h-4 flex-shrink-0"/>{e.label} (.csv)
              </button>
            ))}
            <div className="p-3 bg-muted/20 rounded-lg">
              <p className="text-[10px] text-muted-foreground">CSV con encoding UTF-8 + BOM para correcta apertura en Excel con tildes y caracteres especiales.</p>
            </div>
          </div>
        </div>
      </div>
    ),
  };

  return (
    <div className="flex gap-6 pb-8">
      {/* Sidebar */}
      <div className="hidden lg:block w-52 flex-shrink-0">
        <div className="sticky top-20 bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-3 border-b border-border bg-muted/20">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><BookOpen className="w-3 h-3"/>Documentación</p>
          </div>
          <div className="p-1.5">
            {SECTIONS.map(s=>(
              <button key={s.id} onClick={()=>setActiveSection(s.id)}
                className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${
                  activeSection===s.id?"bg-primary/20 text-primary font-semibold":"text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                }`}>
                <s.icon className="w-3.5 h-3.5 flex-shrink-0"/>{s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Mobile nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border flex gap-1 p-2 overflow-x-auto">
        {SECTIONS.map(s=>(
          <button key={s.id} onClick={()=>setActiveSection(s.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap flex-shrink-0 transition-all ${
              activeSection===s.id?"bg-primary text-white":"bg-muted/40 text-muted-foreground"
            }`}>
            <s.icon className="w-3 h-3"/>{s.label}
          </button>
        ))}
      </div>
      {/* Content */}
      <div className="flex-1 min-w-0 pb-16 lg:pb-0">
        {sections[activeSection]}
      </div>
    </div>
  );
}
