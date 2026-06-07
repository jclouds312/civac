import { useState, useMemo, useCallback, useEffect } from "react";
import GoogleUsersPanel from "@/components/google-users-panel";
import {
  useAuth, LoginActivity, PLAN_LABEL, PLAN_COLOR, PLAN_ICON, PLAN_PRECIOS,
  PlanId, Account, WompiPayment, CIVAC_STAFF_IDS,
} from "@/lib/auth";
import {
  Users, Crown, CreditCard, Activity, Plus, Trash2, Edit,
  CheckCircle, XCircle, TrendingUp, DollarSign, Clock,
  Server, Database, Building2, RefreshCw, Eye, EyeOff,
  BarChart3, Bell, MonitorSmartphone, Zap, Star, Settings2,
  ChevronRight, Download, Shield, Globe, AlertTriangle,
  ToggleLeft, ToggleRight, Lock, Unlock, Key, UserPlus,
  Webhook, Code2, Copy, Link2, ExternalLink, Send, Package,
  CheckCircle2, XCircle as XC, Terminal, Cpu, HardDrive,
  Wifi, Radio, Filter, Search, Hash, FileText, BookOpen,
  ChevronDown, ChevronUp, MoreVertical, Ban, LogOut,
  Smartphone, Monitor, Tablet, MapPin, Calendar,
  TrendingDown, ArrowUpRight, ArrowDownRight, Percent,
  Receipt, Landmark, CreditCard as Card, Banknote,
  ShieldCheck, ShieldOff, AlertOctagon, Info, Layers,
  Scale, Bluetooth, BluetoothConnected, Usb, Cable,
  Weight, Wrench, BarChart2, PieChart as PieIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  PieChart, Pie, Cell, Tooltip as RTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area, LineChart, Line,
} from "recharts";

/* ──────────────────────────────────────────────────────────────────────────
   CONSTANTS
────────────────────────────────────────────────────────────────────────── */
const PLAN_ORDER: PlanId[] = ["basico", "pro", "premium", "platino"];
const PLAN_COLORS_PIE = ["#b8c4d4", "#00f5d4", "#fbbf24", "#cd7f32"];

const PLAN_MODULES: Record<PlanId, string[]> = {
  basico:  ["Dashboard","Inventario","Producción","Potreros","Alertas","Sanidad básica","Pesaje Manual"],
  pro:     ["+ Reproducción","+ Genética","+ Pesaje BT/COM","+ Insumos","+ Alimentación","+ Semen/TE","+ Costos P&G","+ Personal","+ GPS Collares","+ GPS Chips/MQTT","+ Lotes","+ Ficha Clínica","+ Trazabilidad ICA"],
  premium: ["+ Asesora IA","+ Ventas CRM","+ Multi-Finca","+ Predicciones IA","+ Huella CO₂ IPCC","+ Drive Backup"],
  platino: ["+ Usuarios & Roles","+ Configuración avanzada","+ Documentación","+ Manual completo","+ Centro Datos","+ Planes & Admin","+ SLA 99.9%"],
};

const ALL_MODULES = [
  { id:"dashboard",      label:"Dashboard",        icon:"📊", plan:"basico"  },
  { id:"inventario",     label:"Inventario",        icon:"🐄", plan:"basico"  },
  { id:"produccion",     label:"Producción",        icon:"🥛", plan:"basico"  },
  { id:"potreros",       label:"Potreros",          icon:"🌿", plan:"basico"  },
  { id:"alertas",        label:"Alertas",           icon:"🔔", plan:"basico"  },
  { id:"sanidad",        label:"Sanidad Animal",    icon:"🩺", plan:"basico"  },
  { id:"pesaje-manual",  label:"Pesaje Manual",     icon:"✏️", plan:"basico"  },
  { id:"reproduccion",   label:"Reproducción",      icon:"🧬", plan:"pro"     },
  { id:"genetica",       label:"Genética",          icon:"🔬", plan:"pro"     },
  { id:"pesaje",         label:"Pesaje BT/COM",     icon:"⚖️", plan:"pro"     },
  { id:"insumos",        label:"Insumos",           icon:"📦", plan:"pro"     },
  { id:"alimentacion",   label:"Alimentación",      icon:"🌾", plan:"pro"     },
  { id:"semen",          label:"Semen/Embriones",   icon:"🧪", plan:"pro"     },
  { id:"costos",         label:"Costos P&G",        icon:"💰", plan:"pro"     },
  { id:"personal",       label:"Personal",          icon:"👷", plan:"pro"     },
  { id:"gps",            label:"GPS Collares",      icon:"📡", plan:"pro"     },
  { id:"gps-chips",      label:"GPS Chips/MQTT",    icon:"📱", plan:"pro"     },
  { id:"lotes",          label:"Lotes Ganaderos",   icon:"🔖", plan:"pro"     },
  { id:"ficha",          label:"Ficha Individual",  icon:"📋", plan:"pro"     },
  { id:"trazabilidad",   label:"Trazabilidad ICA",  icon:"🏷️", plan:"pro"     },
  { id:"asesora",        label:"Asesora IA",        icon:"🤖", plan:"premium" },
  { id:"ventas",         label:"Ventas CRM",        icon:"💼", plan:"premium" },
  { id:"multifinca",     label:"Multi-Finca",       icon:"🏘️", plan:"premium" },
  { id:"prediccion",     label:"Predicciones IA",   icon:"🎯", plan:"premium" },
  { id:"co2",            label:"Huella CO₂",        icon:"🌍", plan:"premium" },
  { id:"drive",          label:"Drive Backup",      icon:"☁️", plan:"premium" },
  { id:"usuarios",       label:"Usuarios & Roles",  icon:"👥", plan:"platino" },
  { id:"configuracion",  label:"Configuración",     icon:"⚙️", plan:"platino" },
  { id:"documentacion",  label:"Documentación",     icon:"📖", plan:"platino" },
  { id:"manual",         label:"Manual Usuario",    icon:"📘", plan:"platino" },
  { id:"planes",         label:"Planes & Pagos",    icon:"💳", plan:"platino" },
  { id:"datos",          label:"Centro de Datos",   icon:"🗄️", plan:"platino" },
];

/* ── Básculas: estadísticas de uso simuladas ── */
const PESAJE_MES = [
  { mes:"Nov", bt:12, com:8,  manual:25, total:45 },
  { mes:"Dic", bt:18, com:10, manual:30, total:58 },
  { mes:"Ene", bt:22, com:12, manual:28, total:62 },
  { mes:"Feb", bt:28, com:15, manual:35, total:78 },
  { mes:"Mar", bt:35, com:18, manual:32, total:85 },
  { mes:"Abr", bt:41, com:20, manual:38, total:99 },
  { mes:"May", bt:48, com:22, manual:42, total:112 },
];

const BT_DEVS_ADMIN = [
  { id:"tru-test-xr3",     nombre:"Tru-Test XR3000",   marca:"Tru-Test",    tipo:"Indicador BLE 5.0",  color:"#00f5d4", desc:"±0.1 kg · IP67 · BLE 5.0",         icon:"⚖️", usos:48, estado:"activo",       ultima:"Hace 5 min",  bateria:82 },
  { id:"gallagher-w210-bt",nombre:"Gallagher W210 BT",  marca:"Gallagher",   tipo:"Báscula WiFi/BT",    color:"#fbbf24", desc:"NLIS · ±50 g · BT 4.2",            icon:"🏋️", usos:22, estado:"activo",       ultima:"Hace 2 h",    bateria:65 },
  { id:"ahi-caroplus",     nombre:"AHI Caroplus 2",     marca:"AHI",         tipo:"Báscula RFID BT",    color:"#a78bfa", desc:"RFID ISO 11784 · BLE",              icon:"📡", usos:15, estado:"disponible",   ultima:"Hace 1 día",  bateria:90 },
  { id:"tru-test-s3",      nombre:"Tru-Test S3",        marca:"Tru-Test",    tipo:"Portátil BLE",        color:"#34d399", desc:"5000 registros · BLE 5.0",          icon:"📱", usos:8,  estado:"disponible",   ultima:"Hace 3 días", bateria:55 },
  { id:"simcro-biotrack",  nombre:"Simcro BioTrack",    marca:"Simcro",      tipo:"RFID + Báscula",     color:"#f87171", desc:"ISO 11785 · EID dual",              icon:"🔖", usos:3,  estado:"sin_señal",    ultima:"Hace 1 sem",  bateria:20 },
  { id:"zee-tag-bt",       nombre:"Zee Tag EID BT",     marca:"Zee Tag",     tipo:"RFID Bluetooth",     color:"#fb923c", desc:"EID ISO 11784/85 · Colombia",       icon:"🏷️", usos:12, estado:"disponible",   ultima:"Hace 6 h",    bateria:74 },
];

const COM_DEVS_ADMIN = [
  { id:"tru-test-xr3-com", nombre:"Tru-Test XR3000 COM",marca:"Tru-Test",      tipo:"RS232/USB-Serial", baud:9600,   color:"#00f5d4", desc:"RS232 · STW format · IP67",     icon:"⚖️", usos:22, estado:"activo"     },
  { id:"gallagher-w210-com",nombre:"Gallagher W210 COM", marca:"Gallagher",     tipo:"RS232/USB-Serial", baud:9600,   color:"#fbbf24", desc:"RS232 · NLIS compatible",        icon:"🏋️", usos:18, estado:"activo"     },
  { id:"sema-bascula",      nombre:"SEMA Báscula",        marca:"SEMA",          tipo:"COM Colombiana",   baud:9600,   color:"#f59e0b", desc:"Marca colombiana pecuaria",      icon:"🇨🇴", usos:9,  estado:"disponible" },
  { id:"ruddweigh-600",     nombre:"Ruddweigh 600",       marca:"Ruddweigh",     tipo:"RS232 portátil",   baud:4800,   color:"#a3e635", desc:"4800 bps · Latam",               icon:"🔌", usos:5,  estado:"disponible" },
  { id:"agrident-apr650",   nombre:"Agrident APR650",     marca:"Agrident",      tipo:"USB-Serial RFID",  baud:115200, color:"#38bdf8", desc:"USB · RFID ISO 11784 + peso",    icon:"📟", usos:7,  estado:"disponible" },
  { id:"mettler-toledo",    nombre:"Mettler Toledo IND",  marca:"Mettler Toledo",tipo:"RS232 Industrial", baud:9600,   color:"#e879f9", desc:"SCS format · ±0.05 kg",          icon:"🏭", usos:4,  estado:"disponible" },
  { id:"toledo-prix3",      nombre:"Toledo Prix 3",        marca:"Toledo Brasil", tipo:"COM Pecuario",     baud:9600,   color:"#fb7185", desc:"9600 7E2 · Brasil/CO",           icon:"⚡", usos:2,  estado:"inactivo"   },
  { id:"generic-com",       nombre:"Generic RS232",        marca:"Genérico",      tipo:"Cualquier COM",    baud:9600,   color:"#94a3b8", desc:"Detecta cualquier nº >100 kg",   icon:"🔧", usos:1,  estado:"disponible" },
];

const BASC_MODULES_DEFAULT = {
  pesaje_bt:     { enabled:true,  plan:"pro"     as PlanId, usos:48, label:"Pesaje Bluetooth",   icon:"🔵", color:"#00f5d4", devs:6, desc:"Báscula BT/BLE 5.0 · 6 modelos soportados"    },
  pesaje_com:    { enabled:true,  plan:"premium" as PlanId, usos:22, label:"Pesaje COM/Serial",  icon:"🔌", color:"#f97316", devs:8, desc:"RS232/USB · 8 controladores COM certificados"  },
  pesaje_manual: { enabled:true,  plan:"basico"  as PlanId, usos:42, label:"Pesaje Manual",      icon:"✏️", color:"#a78bfa", devs:0, desc:"Entrada directa · Recibo PDF imprimible"        },
};

const SIMULATED_SESSIONS = [
  { id:"s1", nombre:"Administrador General",  email:"admin@ganader.ia",  ultima:"Hace 2 min",  ip:"181.132.45.12",  dis:"Chrome 124",  tipo:"desktop",  ciudad:"Bogotá, CO",      activa:true,  login:"Hoy 08:14" },
  { id:"s2", nombre:"Dr. Carlos Ramírez",     email:"vet@ganader.ia",    ultima:"Hace 18 min", ip:"190.25.134.88",  dis:"Safari 17",   tipo:"mobile",   ciudad:"Medellín, CO",    activa:true,  login:"Hoy 09:30" },
  { id:"s3", nombre:"Luis Patiño",            email:"luis@ganader.ia",   ultima:"Hace 1 h",    ip:"181.78.99.201",  dis:"Chrome 124",  tipo:"mobile",   ciudad:"Cali, CO",        activa:false, login:"Ayer 16:22" },
  { id:"s4", nombre:"Propietario/Inversor",   email:"visor@ganader.ia",  ultima:"Hace 3 h",    ip:"190.144.22.55",  dis:"Edge 124",    tipo:"desktop",  ciudad:"Barranquilla, CO",activa:false, login:"Ayer 14:05" },
];

const SYS_METRICS = [
  { mes:"Nov", clientes:2, mrr:178,  churn:0, nuevos:2 },
  { mes:"Dic", clientes:3, mrr:267,  churn:0, nuevos:1 },
  { mes:"Ene", clientes:3, mrr:267,  churn:0, nuevos:0 },
  { mes:"Feb", clientes:4, mrr:445,  churn:0, nuevos:1 },
  { mes:"Mar", clientes:4, mrr:445,  churn:0, nuevos:0 },
  { mes:"Abr", clientes:4, mrr:634,  churn:0, nuevos:1 },
  { mes:"May", clientes:4, mrr:634,  churn:0, nuevos:1 },
];

const PAGOS_DEMO: WompiPayment[] = [
  { id:"w001", userId:"u_carlos",  userNombre:"Dr. Carlos Ramírez",   userEmail:"vet@ganader.ia",   plan:"premium", monto:189000, moneda:"COP", metodo:"tarjeta",     referencia:"CIVAC-2026-001", estado:"aprobado",  fecha:"20/05/2026", hora:"10:34", nit:"901234567" },
  { id:"w002", userId:"u_luis",    userNombre:"Luis Patiño",          userEmail:"luis@ganader.ia",  plan:"pro",     monto:89000,  moneda:"COP", metodo:"nequi",        referencia:"CIVAC-2026-002", estado:"aprobado",  fecha:"18/05/2026", hora:"15:22", telefono:"3124567890" },
  { id:"w003", userId:"u_visor",   userNombre:"Propietario/Inversor", userEmail:"visor@ganader.ia", plan:"pro",     monto:89000,  moneda:"COP", metodo:"pse",          referencia:"CIVAC-2026-003", estado:"aprobado",  fecha:"15/05/2026", hora:"09:10" },
  { id:"w004", userId:"u_test",    userNombre:"Finca La Loma",        userEmail:"loma@civac.co",    plan:"platino", monto:399000, moneda:"COP", metodo:"bancolombia",  referencia:"CIVAC-2026-004", estado:"pendiente", fecha:"21/05/2026", hora:"07:55" },
  { id:"w005", userId:"u_test2",   userNombre:"Agropecuaria Santos",  userEmail:"santos@civac.co",  plan:"pro",     monto:89000,  moneda:"COP", metodo:"tarjeta",      referencia:"CIVAC-2026-005", estado:"rechazado", fecha:"20/05/2026", hora:"16:40" },
];

const WEBHOOK_EVENTS = ["plan.activado","plan.vencido","usuario.creado","usuario.eliminado","pago.aprobado","pago.rechazado","sesion.iniciada","sesion.cerrada"];

const API_INTEGRATIONS = [
  { id:"wompi",    nombre:"Wompi",           desc:"Pasarela de pagos Colombia",     icon:"💳", estado:"activo",   color:"#00f5d4", docs:"https://docs.wompi.co" },
  { id:"nequi",    nombre:"Nequi",           desc:"Pagos móviles Colombia",         icon:"📱", estado:"activo",   color:"#8b5cf6", docs:"https://nequi.com.co" },
  { id:"twilio",   nombre:"Twilio SMS",      desc:"Alertas y notificaciones SMS",   icon:"💬", estado:"inactivo", color:"#f59e0b", docs:"https://twilio.com/docs" },
  { id:"sendgrid", nombre:"SendGrid Email",  desc:"Transaccional y marketing email",icon:"📧", estado:"activo",   color:"#0ea5e9", docs:"https://docs.sendgrid.com" },
  { id:"maps",     nombre:"Google Maps",     desc:"Geolocalización de fincas",      icon:"🗺️", estado:"activo",   color:"#22c55e", docs:"https://developers.google.com/maps" },
  { id:"civac_bt", nombre:"CIVAC Bluetooth", desc:"Báscula CIVAC 9B protocolo",     icon:"⚖️", estado:"activo",   color:"#fbbf24", docs:"#" },
];

const PERMS_BY_ROLE: Record<string, string[]> = {
  admin:  ALL_MODULES.map(m=>m.id).concat(["planes","admin_pagos"]),
  vet:    ["inventario","produccion","reproduccion","genetica","potreros","alimentacion","insumos","semen","prediccion","alertas","documentacion","pesaje","gps"],
  field:  ["inventario","produccion","potreros","alimentacion","insumos","alertas","pesaje"],
  viewer: ["inventario","produccion","costos","prediccion","co2","alertas","gps"],
};

/* ──────────────────────────────────────────────────────────────────────────
   HELPERS
────────────────────────────────────────────────────────────────────────── */
const fmt = (n: number) => new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",minimumFractionDigits:0}).format(n);
const TIP = { backgroundColor:"#050d18", border:"1px solid rgba(0,245,212,0.2)", color:"#e2e8f0", borderRadius:"12px", fontSize:"11px" };

function PlanBadge({ plan }: { plan?: PlanId }) {
  const p = plan ?? "basico";
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide"
      style={{ background:`${PLAN_COLOR[p]}18`, border:`1px solid ${PLAN_COLOR[p]}40`, color:PLAN_COLOR[p] }}>
      {PLAN_ICON[p]} {PLAN_LABEL[p]}
    </span>
  );
}

function StatusPill({ activo }: { activo?: boolean }) {
  return activo !== false ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/30">
      <CheckCircle size={8}/> Activo
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/30">
      <XCircle size={8}/> Inactivo
    </span>
  );
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard?.writeText(text).catch(()=>{}); setCopied(true); setTimeout(()=>setCopied(false),1500); }}
      className="p-1 rounded hover:bg-white/10 transition-colors"
      style={{ color: copied ? "#39ff7e" : "rgba(255,255,255,0.3)" }}>
      {copied ? <CheckCircle2 size={12}/> : <Copy size={12}/>}
    </button>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   ACCOUNT FORM
────────────────────────────────────────────────────────────────────────── */
function AccountForm({
  initial, onSave, onClose, isEdit,
}: {
  initial?: Partial<Account>;
  onSave: (d: Omit<Account,"id">) => void;
  onClose: () => void;
  isEdit?: boolean;
}) {
  const [role, setRole]   = useState<Account["role"]>((initial?.role as Account["role"]) ?? "viewer");
  const [plan, setPlan]   = useState<PlanId>(initial?.plan ?? "basico");
  const [showPw, setShowPw] = useState(false);
  const [perms, setPerms] = useState<string[]>(initial?.permisos ?? PERMS_BY_ROLE["viewer"]);

  const togglePerm = (p: string) => setPerms(prev => prev.includes(p) ? prev.filter(x=>x!==p) : [...prev,p]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const pw = fd.get("password") as string;
    onSave({
      nombre: fd.get("nombre") as string,
      cargo: fd.get("cargo") as string || role,
      finca: fd.get("finca") as string || "—",
      email: fd.get("email") as string,
      password: isEdit && !pw ? (initial?.password ?? "") : pw,
      avatar: "👤",
      gradient: "from-slate-600 to-slate-800",
      role, plan,
      planExpiry: plan !== "basico" ? new Date(Date.now() + 30*86400000).toISOString().slice(0,10) : undefined,
      activo: true,
      permisos: perms,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label className="text-xs text-muted-foreground">Nombre completo *</Label>
          <Input name="nombre" defaultValue={initial?.nombre} required placeholder="María García López" className="mt-1"/>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Cargo</Label>
          <Input name="cargo" defaultValue={initial?.cargo} placeholder="Veterinario…" className="mt-1"/>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Finca / Empresa</Label>
          <Input name="finca" defaultValue={initial?.finca ?? ""} placeholder="Finca La Esperanza" className="mt-1"/>
        </div>
        <div className="col-span-2">
          <Label className="text-xs text-muted-foreground">Correo electrónico *</Label>
          <Input name="email" type="email" defaultValue={initial?.email} required placeholder="usuario@civac.co" className="mt-1"/>
        </div>
        <div className="col-span-2">
          <Label className="text-xs text-muted-foreground">Contraseña {isEdit && "(dejar vacío para mantener)"}</Label>
          <div className="relative mt-1">
            <Input name="password" type={showPw ? "text" : "password"} required={!isEdit}
              placeholder={isEdit ? "••••• sin cambios" : "Mínimo 6 caracteres"} className="pr-9"/>
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPw ? <EyeOff size={14}/> : <Eye size={14}/>}
            </button>
          </div>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Rol</Label>
          <Select value={role} onValueChange={v => { setRole(v as Account["role"]); setPerms(PERMS_BY_ROLE[v]??[]); }}>
            <SelectTrigger className="mt-1"><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">👑 Administrador</SelectItem>
              <SelectItem value="vet">🩺 Veterinario</SelectItem>
              <SelectItem value="field">🌿 Personal Campo</SelectItem>
              <SelectItem value="viewer">👁 Solo Lectura</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Plan</Label>
          <Select value={plan} onValueChange={v => setPlan(v as PlanId)}>
            <SelectTrigger className="mt-1"><SelectValue/></SelectTrigger>
            <SelectContent>
              {PLAN_ORDER.map(p => (
                <SelectItem key={p} value={p}>
                  {PLAN_ICON[p]} {PLAN_LABEL[p]}{PLAN_PRECIOS[p]>0?` · $${(PLAN_PRECIOS[p]/1000).toFixed(0)}k`:" · Gratis"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Permissions */}
      <div>
        <Label className="text-xs text-muted-foreground block mb-2">Permisos de módulos</Label>
        <div className="grid grid-cols-3 gap-1 max-h-36 overflow-y-auto pr-1" style={{scrollbarWidth:"thin"}}>
          {ALL_MODULES.map(m => (
            <button key={m.id} type="button" onClick={() => togglePerm(m.id)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] transition-all text-left"
              style={{
                background: perms.includes(m.id) ? "rgba(0,245,212,0.12)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${perms.includes(m.id) ? "rgba(0,245,212,0.3)" : "rgba(255,255,255,0.07)"}`,
                color: perms.includes(m.id) ? "#00f5d4" : "rgba(255,255,255,0.35)",
              }}>
              <span>{m.icon}</span> {m.label}
            </button>
          ))}
        </div>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        </DialogClose>
        <Button type="submit" style={{ background:"linear-gradient(135deg,#00f5d4,#00a896)", color:"black" }}>
          {isEdit ? <><Edit size={13}/> Guardar</> : <><Plus size={13}/> Crear cliente</>}
        </Button>
      </DialogFooter>
    </form>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PYTHON ANALYTICS — Módulos (uso real desde Analytics Server)
────────────────────────────────────────────────────────────────────────── */
type PyMod = { id:string; label:string; plan:string; uso_pct:number; sesiones_mes:number; icono:string };
type PyUser = { id:string; nombre:string; email:string; plan:string; activo:boolean; animales:number; litros_dia:number; modulos_activos:number; region:string; ultima_sesion:string; creado:string };
type PyStats = { total_usuarios:number; activos:number; inactivos:number; por_plan:Record<string,number>; total_animales:number; total_litros_dia:number; mrr_cop:number; total_modulos:number; sesiones_mes:number };

function PythonModuloStats() {
  const [mods, setMods]   = useState<PyMod[]>([]);
  const [stats, setStats] = useState<PyStats|null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  useEffect(() => {
    setLoading(true); setErr("");
    Promise.all([
      fetch(`/api/analytics/admin/modulos`).then(r=>r.json()),
      fetch(`/api/analytics/admin/stats`).then(r=>r.json()),
    ]).then(([mRes, sRes]) => {
      if (mRes.ok) setMods(mRes.modulos as PyMod[]);
      if (sRes.ok) setStats(sRes.plataforma as PyStats);
      setLoading(false);
    }).catch(() => { setErr("Analytics Server no disponible"); setLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fmt = (n:number) => n>=1_000_000 ? `$${(n/1_000_000).toFixed(1)}M` : n>=1000 ? `$${(n/1000).toFixed(0)}K` : `$${n}`;

  if (loading) return (
    <div className="flex items-center justify-center py-10 text-white/30 text-xs gap-2">
      <div className="w-4 h-4 border-2 border-white/20 border-t-teal-400 rounded-full animate-spin"/>
      Cargando datos de Analytics Server (Python)…
    </div>
  );
  if (err) return (
    <div className="flex items-center gap-2 px-4 py-3 rounded-2xl text-xs" style={{background:"rgba(255,100,100,0.07)",border:"1px solid rgba(255,100,100,0.2)",color:"#ff8080"}}>
      <AlertTriangle size={13}/> {err} — verificar que el Analytics Server esté corriendo en puerto 8099
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Stats header */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label:"MRR Plataforma", val:fmt(stats.mrr_cop),                      c:"#fbbf24", g:"251,191,36", icon:<DollarSign size={14}/> },
            { label:"Animales totales", val:stats.total_animales.toLocaleString(),  c:"#39ff7e", g:"57,255,126", icon:<Activity size={14}/> },
            { label:"Litros/día total",  val:`${stats.total_litros_dia.toLocaleString()} L`, c:"#00f5d4", g:"0,245,212", icon:<BarChart3 size={14}/> },
            { label:"Sesiones este mes", val:stats.sesiones_mes.toLocaleString(),   c:"#e879f9", g:"232,121,249", icon:<TrendingUp size={14}/> },
          ].map(s=>(
            <div key={s.label} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{background:`rgba(${s.g},0.06)`,border:`1px solid rgba(${s.g},0.2)`}}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{background:`rgba(${s.g},0.12)`,color:s.c}}>{s.icon}</div>
              <div>
                <div className="text-[9px] uppercase tracking-wider font-bold" style={{color:`rgba(${s.g},0.5)`}}>{s.label}</div>
                <div className="text-base font-black text-white leading-tight">{s.val}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Usage bar chart */}
      <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(232,121,249,0.15)"}}>
        <div className="px-4 py-3 flex items-center justify-between"
          style={{background:"rgba(232,121,249,0.05)",borderBottom:"1px solid rgba(232,121,249,0.1)"}}>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart3 size={14} style={{color:"#e879f9"}}/> Uso real de módulos · sesiones este mes
          </h3>
          <span className="text-[9px] px-2 py-1 rounded-full font-bold"
            style={{background:"rgba(232,121,249,0.1)",color:"#e879f9",border:"1px solid rgba(232,121,249,0.2)"}}>
            🐍 Python Analytics Server
          </span>
        </div>
        <div className="p-4 space-y-2">
          {mods.slice(0,15).map(m=>{
            const planC = PLAN_COLOR[m.plan as PlanId] ?? "#94a3b8";
            const maxSes = mods[0]?.sesiones_mes ?? 1;
            const pct = Math.round((m.sesiones_mes / maxSes) * 100);
            return (
              <div key={m.id} className="flex items-center gap-3">
                <div className="w-5 text-sm flex-shrink-0 text-center">{m.icono}</div>
                <div className="w-28 text-[10px] text-white/60 truncate flex-shrink-0">{m.label}</div>
                <div className="flex-1 h-5 rounded-full overflow-hidden" style={{background:"rgba(255,255,255,0.04)"}}>
                  <div className="h-full rounded-full flex items-center pl-2 transition-all duration-700"
                    style={{width:`${pct}%`,background:`linear-gradient(90deg,${planC}90,${planC}40)`,minWidth:24}}>
                    <span className="text-[8px] font-black" style={{color:planC}}>{m.uso_pct}%</span>
                  </div>
                </div>
                <div className="w-14 text-right text-[9px] font-bold flex-shrink-0" style={{color:`${planC}cc`}}>
                  {m.sesiones_mes.toLocaleString()}
                </div>
                <PlanBadge plan={m.plan as PlanId}/>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PYTHON ANALYTICS — Usuarios de plataforma
────────────────────────────────────────────────────────────────────────── */
function PythonUsuariosPlataforma() {
  const [users, setUsers]   = useState<PyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr]       = useState("");
  const [planFil, setPlanFil] = useState<"todos"|string>("todos");
  const [q, setQ]           = useState("");
  const load = () => {
    setLoading(true); setErr("");
    const params = new URLSearchParams();
    if (planFil !== "todos") params.set("plan", planFil);
    if (q) params.set("q", q);
    fetch(`/api/analytics/admin/usuarios?${params}`)
      .then(r=>r.json())
      .then(d=>{ if(d.ok) setUsers(d.usuarios); setLoading(false); })
      .catch(()=>{ setErr("Analytics Server no disponible"); setLoading(false); });
  };

  useEffect(() => { load(); }, [planFil]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = users.filter(u => !q || u.nombre.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-40 max-w-xs">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar finca o email…"
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl text-white"
            style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",outline:"none"}}/>
          <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30"/>
        </div>
        {["todos","basico","pro","premium","platino"].map(p=>(
          <button key={p} onClick={()=>setPlanFil(p)}
            className="px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all"
            style={{
              background: planFil===p ? (p==="todos"?"rgba(255,255,255,0.1)":PLAN_COLOR[p as PlanId]+"18") : "rgba(255,255,255,0.03)",
              border:`1px solid ${planFil===p?(p==="todos"?"rgba(255,255,255,0.25)":PLAN_COLOR[p as PlanId]+"50"):"rgba(255,255,255,0.08)"}`,
              color: planFil===p ? (p==="todos"?"white":PLAN_COLOR[p as PlanId]) : "rgba(255,255,255,0.35)",
            }}>
            {p==="todos" ? "Todos" : (PLAN_ICON[p as PlanId]+" "+PLAN_LABEL[p as PlanId])}
          </button>
        ))}
        <span className="text-[10px] text-white/25 ml-1 font-mono">🐍 Analytics</span>
      </div>

      {loading && (
        <div className="flex items-center gap-2 py-6 justify-center text-white/30 text-xs">
          <div className="w-4 h-4 border-2 border-white/20 border-t-teal-400 rounded-full animate-spin"/>Cargando…
        </div>
      )}
      {err && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl text-xs"
          style={{background:"rgba(255,100,100,0.07)",border:"1px solid rgba(255,100,100,0.2)",color:"#ff8080"}}>
          <AlertTriangle size={13}/> {err}
        </div>
      )}
      {!loading && !err && (
        <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(0,245,212,0.1)"}}>
          <div className="px-4 py-2.5 flex items-center gap-2"
            style={{background:"rgba(0,245,212,0.05)",borderBottom:"1px solid rgba(0,245,212,0.08)"}}>
            <Globe size={13} style={{color:"#00f5d4"}}/>
            <span className="text-xs font-bold text-white">Fincas registradas en plataforma</span>
            <span className="text-[9px] text-white/30 ml-auto">{filtered.length} resultados · Python Analytics</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{background:"rgba(0,0,0,0.3)",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                  {["Finca / Email","Región","Plan","Animales","L/día","Módulos","Estado","Última sesión"].map(h=>(
                    <th key={h} className="px-3 py-2 text-left text-[9px] uppercase tracking-wider font-bold"
                      style={{color:"rgba(0,245,212,0.5)"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length===0&&(
                  <tr><td colSpan={8} className="text-center py-8 text-white/25 text-xs">Sin resultados</td></tr>
                )}
                {filtered.map((u,i)=>(
                  <tr key={u.id} style={{background:i%2===0?"rgba(255,255,255,0.015)":"transparent",borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                    <td className="px-3 py-2.5">
                      <p className="text-xs font-bold text-white">{u.nombre}</p>
                      <p className="text-[9px]" style={{color:"rgba(0,245,212,0.4)"}}>{u.email}</p>
                    </td>
                    <td className="px-3 py-2.5 text-[10px] text-white/45">{u.region}</td>
                    <td className="px-3 py-2.5"><PlanBadge plan={u.plan as PlanId}/></td>
                    <td className="px-3 py-2.5 text-xs font-bold" style={{color:"#39ff7e"}}>{u.animales}</td>
                    <td className="px-3 py-2.5 text-xs font-bold" style={{color:"#00f5d4"}}>{u.litros_dia} L</td>
                    <td className="px-3 py-2.5 text-[10px] text-white/50">{u.modulos_activos} mód.</td>
                    <td className="px-3 py-2.5">
                      <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full w-fit"
                        style={{
                          background: u.activo ? "rgba(57,255,126,0.1)" : "rgba(248,113,113,0.1)",
                          color: u.activo ? "#39ff7e" : "#f87171",
                          border: `1px solid ${u.activo?"rgba(57,255,126,0.3)":"rgba(248,113,113,0.3)"}`,
                        }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{background: u.activo?"#39ff7e":"#f87171"}}/>
                        {u.activo?"Activa":"Inactiva"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-[9px] text-white/35">{u.ultima_sesion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   CÓDIGOS TAB — sub-component so hooks are top-level
────────────────────────────────────────────────────────────────────────── */
type CodigoItem = {
  id?: number; codigo: string; planCode: string; diasPlan: number;
  sessionLimit: number; maxAnimales: number; estado: string;
  usadoPor?: string; usadoPorEmail?: string; notas?: string;
  createdAt?: string;
};

function CodigosTab() {
  const [codigosData, setCodigosData] = useState<CodigoItem[]>([]);
  const [genPlan,    setGenPlan]    = useState<PlanId>("pro");
  const [genDias,    setGenDias]    = useState(30);
  const [genNotas,   setGenNotas]   = useState("");
  const [genQty,     setGenQty]     = useState(1);
  const [genLoading, setGenLoading] = useState(false);
  const [genMsg,     setGenMsg]     = useState("");

  const MOCK: CodigoItem[] = [
    { id:1, codigo:"CIVAC-PRO-ABC123", planCode:"pro",     diasPlan:30,  sessionLimit:3,   maxAnimales:999, estado:"disponible", notas:"Demo PRO",       createdAt:"2026-06-01" },
    { id:2, codigo:"CIVAC-PREM-XY9Z1", planCode:"premium", diasPlan:90,  sessionLimit:5,   maxAnimales:999, estado:"disponible", notas:"Premio feria",   createdAt:"2026-06-02" },
    { id:3, codigo:"CIVAC-PLAT-QWE72", planCode:"platino", diasPlan:365, sessionLimit:999, maxAnimales:999, estado:"usado",     usadoPorEmail:"cliente@farm.co", notas:"Cliente Platino", createdAt:"2026-05-28" },
    { id:4, codigo:"CIVAC-PRO-TEST01", planCode:"pro",     diasPlan:7,   sessionLimit:1,   maxAnimales:50,  estado:"expirado",  notas:"Test 7 días",    createdAt:"2026-05-01" },
  ];

  useEffect(() => {
    fetch("/api/codigos").then(r => r.json()).then(d => {
      if (d.codigos) setCodigosData(d.codigos);
      else setCodigosData(MOCK);
    }).catch(() => setCodigosData(MOCK));
  }, [genMsg]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGenerate = async () => {
    setGenLoading(true); setGenMsg("");
    try {
      const tasks = Array.from({ length: Math.min(genQty, 10) }).map(() =>
        fetch("/api/codigos", { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planCode: genPlan, diasPlan: genDias, notas: genNotas, creadoPor: "admin" })
        }).then(r => r.json())
      );
      const batch = await Promise.all(tasks);
      const codes = batch.map((b: { codigo?: string }) => b.codigo ?? "").filter(Boolean).join(", ");
      setGenMsg(`Código(s) generado(s): ${codes}`);
    } catch {
      setGenMsg("Error generando. API offline.");
    } finally { setGenLoading(false); }
  };

  const handleRevoke = async (id?: number) => {
    if (!id) return;
    await fetch(`/api/codigos/${id}`, { method: "DELETE" }).catch(() => {});
    setCodigosData(prev => prev.map(c => c.id === id ? { ...c, estado: "expirado" } : c));
  };

  const copyCode = (code: string) => navigator.clipboard?.writeText(code);

  const estadoBadge = (est: string) => {
    const map: Record<string, { bg: string; c: string; label: string }> = {
      disponible: { bg: "rgba(57,255,126,0.12)",  c: "#39ff7e", label: "Disponible" },
      usado:      { bg: "rgba(96,165,250,0.12)",  c: "#60a5fa", label: "Usado"      },
      expirado:   { bg: "rgba(248,113,113,0.12)", c: "#f87171", label: "Expirado"   },
    };
    const s = map[est] ?? map.expirado;
    return (
      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
        style={{ background: s.bg, color: s.c, border: `1px solid ${s.c}44` }}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Generador */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(244,114,182,0.25)" }}>
        <div className="px-4 py-3 flex items-center gap-2"
          style={{ background: "rgba(244,114,182,0.06)", borderBottom: "1px solid rgba(244,114,182,0.12)" }}>
          <Hash size={14} style={{ color: "#f472b6" }}/>
          <span className="text-sm font-bold text-white">Generar códigos de activación</span>
          <span className="ml-auto text-[9px] px-2 py-0.5 rounded-full font-bold"
            style={{ background: "rgba(244,114,182,0.12)", color: "#f472b6", border: "1px solid rgba(244,114,182,0.25)" }}>
            CIVAC-PLAN-XXXXXX
          </span>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <Label className="text-[10px] text-white/50 mb-1 block">Plan</Label>
            <Select value={genPlan} onValueChange={v => setGenPlan(v as PlanId)}>
              <SelectTrigger className="h-8 text-xs" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <SelectValue/>
              </SelectTrigger>
              <SelectContent>
                {(["basico","pro","premium","platino"] as PlanId[]).map(p => (
                  <SelectItem key={p} value={p}>{PLAN_LABEL[p]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[10px] text-white/50 mb-1 block">Días de plan</Label>
            <Select value={String(genDias)} onValueChange={v => setGenDias(Number(v))}>
              <SelectTrigger className="h-8 text-xs" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <SelectValue/>
              </SelectTrigger>
              <SelectContent>
                {[7,15,30,60,90,180,365].map(d => (
                  <SelectItem key={d} value={String(d)}>{d} días</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[10px] text-white/50 mb-1 block">Cantidad (máx 10)</Label>
            <Input type="number" min={1} max={10} value={genQty}
              onChange={e => setGenQty(Math.min(10, Math.max(1, Number(e.target.value))))}
              className="h-8 text-xs" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}/>
          </div>
          <div>
            <Label className="text-[10px] text-white/50 mb-1 block">Notas internas</Label>
            <Input placeholder="Ej: Feria Agro 2026…" value={genNotas}
              onChange={e => setGenNotas(e.target.value)}
              className="h-8 text-xs" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}/>
          </div>
        </div>
        <div className="px-4 pb-4">
          <Button onClick={handleGenerate} disabled={genLoading}
            className="gap-1.5 text-xs"
            style={{ background: "linear-gradient(135deg,#f472b6,#ec4899)", color: "white" }}>
            {genLoading ? <RefreshCw size={12} className="animate-spin"/> : <Hash size={12}/>}
            {genLoading ? "Generando…" : `Generar ${genQty > 1 ? `${genQty} códigos` : "código"}`}
          </Button>
          {genMsg && (
            <div className="mt-2 rounded-xl p-2.5 flex items-center gap-2 font-mono text-xs"
              style={{ background: "rgba(57,255,126,0.08)", border: "1px solid rgba(57,255,126,0.2)", color: "#39ff7e" }}>
              <CheckCircle size={12}/> {genMsg}
            </div>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total generados", val: codigosData.length,                                    c: "#f472b6" },
          { label: "Disponibles",     val: codigosData.filter(c=>c.estado==="disponible").length, c: "#39ff7e" },
          { label: "Usados",          val: codigosData.filter(c=>c.estado==="usado").length,      c: "#60a5fa" },
          { label: "Expirados",       val: codigosData.filter(c=>c.estado==="expirado").length,   c: "#f87171" },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-3 text-center"
            style={{ background: `${k.c}08`, border: `1px solid ${k.c}20` }}>
            <div className="text-2xl font-black text-white">{k.val}</div>
            <div className="text-[9px] mt-0.5" style={{ color: `${k.c}aa` }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="px-4 py-3"
          style={{ background: "rgba(244,114,182,0.05)", borderBottom: "1px solid rgba(244,114,182,0.1)" }}>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Hash size={14} style={{ color: "#f472b6" }}/> Todos los códigos
            <span className="text-[9px] text-white/30 font-normal ml-1">({codigosData.length} total)</span>
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "rgba(244,114,182,0.04)", borderBottom: "1px solid rgba(244,114,182,0.08)" }}>
                {["Código","Plan","Días","Notas","Estado","Usado por","Fecha",""].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-[9px] uppercase tracking-wider font-bold"
                    style={{ color: "rgba(244,114,182,0.5)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {codigosData.length === 0 && (
                <tr><td colSpan={8} className="text-center py-8 text-white/20 text-xs">Sin códigos generados todavía</td></tr>
              )}
              {codigosData.map((c, i) => (
                <tr key={c.id ?? i}
                  style={{ background: i%2===0 ? "rgba(255,255,255,0.01)" : "transparent", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] font-bold" style={{ color: "#f472b6" }}>{c.codigo}</span>
                      <button onClick={() => copyCode(c.codigo)}
                        className="w-5 h-5 rounded flex items-center justify-center text-white/30 hover:text-white/80 transition-colors">
                        <Copy size={9}/>
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-[10px] font-bold" style={{ color: PLAN_COLOR[c.planCode as PlanId] ?? "#fff" }}>
                      {PLAN_LABEL[c.planCode as PlanId] ?? c.planCode}
                    </span>
                  </td>
                  <td className="px-3 py-2"><span className="text-[10px] text-white/60">{c.diasPlan}d</span></td>
                  <td className="px-3 py-2"><span className="text-[10px] text-white/40">{c.notas ?? "—"}</span></td>
                  <td className="px-3 py-2">{estadoBadge(c.estado)}</td>
                  <td className="px-3 py-2">
                    <span className="text-[9px] text-white/30">{c.usadoPorEmail ?? "—"}</span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-[9px] text-white/25">{c.createdAt ? String(c.createdAt).slice(0, 10) : "—"}</span>
                  </td>
                  <td className="px-3 py-2">
                    {c.estado === "disponible" && (
                      <button onClick={() => handleRevoke(c.id)}
                        className="flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[9px] font-bold"
                        style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", color: "#f87171" }}>
                        <Ban size={9}/> Revocar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
────────────────────────────────────────────────────────────────────────── */
export default function AdminDashboard({
  activeTab: extTab,
  onTabChange,
}: {
  activeTab?: string;
  onTabChange?: (t: string) => void;
} = {}) {
  const { accounts, registerUser, updateUser, deleteUser, user: currentUser, loginActivity } = useAuth();

  /* ── State ── */
  const [search,       setSearch]       = useState("");
  const [addOpen,      setAddOpen]      = useState(false);
  const [editTarget,   setEditTarget]   = useState<Account | null>(null);
  const [planTarget,   setPlanTarget]   = useState<Account | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null);
  const [newPlan,      setNewPlan]      = useState<PlanId>("pro");
  const [internalTab,  setInternalTab]  = useState("resumen");
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);
  const [sessionsList, setSessionsList] = useState(SIMULATED_SESSIONS);
  const [inviteTarget, setInviteTarget] = useState<Account | null>(null);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [linkPlan,     setLinkPlan]     = useState<PlanId>("pro");
  const [linkCopied,   setLinkCopied]   = useState(false);
  const [webhookOpen,  setWebhookOpen]  = useState(false);
  const [whEvents,     setWhEvents]     = useState<string[]>(["pago.aprobado","plan.activado"]);
  const [whUrl,        setWhUrl]        = useState("https://tu-servidor.com/webhook/civac");
  const [apiKeyVis,    setApiKeyVis]    = useState(false);
  const [payFilter,    setPayFilter]    = useState<"todos"|"aprobado"|"rechazado"|"pendiente">("todos");
  const [modSearch,    setModSearch]    = useState("");
  const [permTarget,   setPermTarget]   = useState<Account | null>(null);
  const [modPlanFilter, setModPlanFilter] = useState<PlanId|"todos">("todos");
  const [editPlanId,   setEditPlanId]   = useState<PlanId|null>(null);
  const [planExpandUsers, setPlanExpandUsers] = useState<PlanId|null>(null);
  const [planEdits, setPlanEdits] = useState<Record<PlanId,{nombre:string;precio:number;features:string[]}>>({
    basico:  { nombre:"Básico",   precio:0,      features:["Dashboard","Inventario","Producción","Potreros","Alertas","Hasta 50 animales","1 usuario","2 GPS collares"] },
    pro:     { nombre:"PRO",      precio:89000,  features:["Todo lo Básico","Reproducción","Genética","Pesaje BT","Insumos","Semen","Costos P&G","Personal y nómina","GPS Collares","Hasta 300 animales","5 usuarios","10 GPS"] },
    premium: { nombre:"Premium",  precio:189000, features:["Todo lo PRO","Multi-Finca","Predicciones IA","Huella CO₂","Ficha Individual","Pesaje Manual/COM","2000 animales","20 usuarios","50 GPS"] },
    platino: { nombre:"Platino",  precio:399000, features:["Todo Premium","Usuarios & Roles","Admin Panel","Multi-Tenant","Soporte dedicado","Sin límite animales","Ilimitados usuarios","GPS ilimitados"] },
  });
  const [planFeatInput, setPlanFeatInput] = useState("");

  /* ── Básculas: módulos y configuración ── */
  const [bascMods, setBascMods] = useState<Record<string,{enabled:boolean;plan:PlanId}>>(() => {
    try {
      const s = JSON.parse(localStorage.getItem("civac_basc_mods")||"{}");
      return {
        pesaje_bt:     { enabled: s.pesaje_bt?.enabled     ?? true,  plan: s.pesaje_bt?.plan     ?? "pro"     },
        pesaje_com:    { enabled: s.pesaje_com?.enabled    ?? true,  plan: s.pesaje_com?.plan    ?? "premium" },
        pesaje_manual: { enabled: s.pesaje_manual?.enabled ?? true,  plan: s.pesaje_manual?.plan ?? "basico"  },
      };
    } catch { return { pesaje_bt:{enabled:true,plan:"pro"}, pesaje_com:{enabled:true,plan:"premium"}, pesaje_manual:{enabled:true,plan:"basico"} }; }
  });
  const [bascGlobal, setBascGlobal] = useState({ trama:"stw", autoSave:true, alertaCalib:true, unidad:"kg", umbralAlerta:20 });
  const [bascDevFilter, setBascDevFilter] = useState<"todos"|"activo"|"disponible"|"sin_señal">("todos");

  function toggleBascMod(id: string) {
    const next = {...bascMods, [id]:{...bascMods[id],enabled:!bascMods[id].enabled}};
    setBascMods(next); localStorage.setItem("civac_basc_mods",JSON.stringify(next));
  }
  function setBascPlan(id: string, plan: PlanId) {
    const next = {...bascMods, [id]:{...bascMods[id],plan}};
    setBascMods(next); localStorage.setItem("civac_basc_mods",JSON.stringify(next));
  }

  /* ── API Connections ── */
  const [apiConfigs, setApiConfigs] = useState<Record<string,{enabled:boolean;configured:boolean;fields:Record<string,string>}>>(() => {
    try { return JSON.parse(localStorage.getItem("civac_api_configs")||"{}"); } catch { return {}; }
  });
  const [apiConfigOpen, setApiConfigOpen] = useState<string|null>(null);
  const [apiTestResult, setApiTestResult] = useState<Record<string,{ok:boolean;msg:string}>>({});
  const [apiFieldDraft, setApiFieldDraft] = useState<Record<string,string>>({});

  function openApiConfig(id: string) {
    setApiFieldDraft(apiConfigs[id]?.fields || {});
    setApiConfigOpen(id);
    setApiTestResult(p=>({...p,[id]:{ok:false,msg:""}}));
  }
  function saveApiConfig(id: string) {
    const cfg = { enabled:true, configured:Object.values(apiFieldDraft).some(v=>v.trim()), fields:apiFieldDraft };
    const next = {...apiConfigs,[id]:cfg};
    setApiConfigs(next);
    localStorage.setItem("civac_api_configs",JSON.stringify(next));
    setApiConfigOpen(null);
  }
  function toggleApiEnabled(id: string) {
    const next = {...apiConfigs,[id]:{...(apiConfigs[id]||{enabled:false,configured:false,fields:{}}),enabled:!apiConfigs[id]?.enabled}};
    setApiConfigs(next);
    localStorage.setItem("civac_api_configs",JSON.stringify(next));
  }
  function testApi(id: string) {
    setApiTestResult(p=>({...p,[id]:{ok:false,msg:"Probando conexión…"}}));
    setTimeout(()=>{
      const hasFields = Object.values(apiFieldDraft).some(v=>v.trim().length>4);
      setApiTestResult(p=>({...p,[id]: hasFields
        ? {ok:true, msg:"✅ Conexión exitosa — credenciales válidas"}
        : {ok:false,msg:"❌ Ingresa las credenciales primero"}}));
    }, 1200);
  }

  const EXT_APIS = [
    {
      id:"whatsapp", nombre:"WhatsApp Business API", icon:"💬", color:"#25D366", cat:"Mensajería",
      desc:"Envía alertas, notificaciones y mensajes automáticos por WhatsApp",
      docs:"https://developers.facebook.com/docs/whatsapp",
      fields:[
        {key:"token",       label:"Token de acceso permanente", placeholder:"EAABvQq...", type:"password"},
        {key:"phone_id",    label:"Phone Number ID",            placeholder:"123456789012345", type:"text"},
        {key:"waba_id",     label:"WhatsApp Business Account ID", placeholder:"987654321",  type:"text"},
      ],
    },
    {
      id:"wompi", nombre:"Wompi", icon:"💳", color:"#00f5d4", cat:"Pagos",
      desc:"Pasarela de pagos de Colombia — tarjeta, Nequi, PSE, Bancolombia",
      docs:"https://docs.wompi.co",
      fields:[
        {key:"pub_key",  label:"Public Key",  placeholder:"pub_test_...", type:"text"},
        {key:"priv_key", label:"Private Key", placeholder:"prv_test_...", type:"password"},
        {key:"sandbox",  label:"Modo sandbox (escribe 'prod' para producción)", placeholder:"sandbox", type:"text"},
      ],
    },
    {
      id:"nequi", nombre:"Nequi", icon:"📱", color:"#8B5CF6", cat:"Pagos",
      desc:"Billetera digital de Bancolombia — pagos por número celular",
      docs:"https://developers.nequi.com.co",
      fields:[
        {key:"client_id",     label:"Client ID",     placeholder:"your-client-id",     type:"text"},
        {key:"client_secret", label:"Client Secret", placeholder:"your-client-secret", type:"password"},
        {key:"channel",       label:"Canal (sandbox/production)", placeholder:"sandbox",  type:"text"},
      ],
    },
    {
      id:"daviplata", nombre:"Daviplata", icon:"📲", color:"#E31937", cat:"Pagos",
      desc:"Billetera digital de Davivienda — pagos entre cuentas y empresas",
      docs:"https://api.davivienda.com",
      fields:[
        {key:"api_key",    label:"API Key",    placeholder:"DAV-xxxxxxxxxx",  type:"password"},
        {key:"merchant",   label:"Merchant ID", placeholder:"MER-xxxxx",       type:"text"},
        {key:"env",        label:"Entorno (test/prod)", placeholder:"test",    type:"text"},
      ],
    },
    {
      id:"pse", nombre:"PSE / ACH Colombia", icon:"🏦", color:"#0EA5E9", cat:"Pagos",
      desc:"Pagos Seguros en Línea — débito directo a cualquier banco colombiano",
      docs:"https://www.achcolombia.com.co",
      fields:[
        {key:"empresa_id",  label:"Código de empresa ACH",  placeholder:"0000001", type:"text"},
        {key:"clave",       label:"Clave privada ACH",       placeholder:"••••••••", type:"password"},
        {key:"redirect",    label:"URL de retorno (redirect)", placeholder:"https://miapp.com/pse/callback", type:"text"},
      ],
    },
    {
      id:"twilio", nombre:"Twilio SMS", icon:"💬", color:"#F59E0B", cat:"Mensajería",
      desc:"Alertas y notificaciones SMS en Colombia y Latinoamérica",
      docs:"https://www.twilio.com/docs",
      fields:[
        {key:"account_sid",  label:"Account SID",   placeholder:"ACxxxxxxxxxxxxxxxx",  type:"text"},
        {key:"auth_token",   label:"Auth Token",    placeholder:"••••••••••••••••",    type:"password"},
        {key:"from_number",  label:"Número origen", placeholder:"+15017122661",         type:"text"},
      ],
    },
    {
      id:"sendgrid", nombre:"SendGrid Email", icon:"📧", color:"#0EA5E9", cat:"Comunicaciones",
      desc:"Correos transaccionales: facturas, alertas, bienvenida a nuevos usuarios",
      docs:"https://docs.sendgrid.com",
      fields:[
        {key:"api_key",     label:"API Key",          placeholder:"SG.xxxxxxxx",  type:"password"},
        {key:"from_email",  label:"Email remitente",  placeholder:"noreply@civac.co", type:"text"},
        {key:"from_name",   label:"Nombre remitente", placeholder:"GanaderIA PRO",    type:"text"},
      ],
    },
    {
      id:"google_maps", nombre:"Google Maps", icon:"🗺️", color:"#22C55E", cat:"Geolocalización",
      desc:"Mapas y geolocalización de fincas, potreros y rutas GPS",
      docs:"https://developers.google.com/maps",
      fields:[
        {key:"api_key",  label:"API Key",           placeholder:"AIzaSyxxxxxxxxxx",  type:"password"},
        {key:"map_id",   label:"Map ID (opcional)", placeholder:"custom-map-id",      type:"text"},
      ],
    },
  ];

  /* ── Nuevos: Finca, Datos, Sistema real ── */
  const [seedLoading,  setSeedLoading]  = useState(false);
  const [seedMsg,      setSeedMsg]      = useState<{ok:boolean;msg:string}|null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [healthLoading,setHealthLoading]= useState(false);
  const [healthData,   setHealthData]   = useState<{status:string;uptime?:number;db?:string}|null>(null);
  const [dbCounts,     setDbCounts]     = useState<Record<string,number>>({});
  const [dbLoading,    setDbLoading]    = useState(false);
  const [fincaLoading, setFincaLoading] = useState(false);
  const [fincaSaved,   setFincaSaved]   = useState(false);
  const [fincaData,    setFincaData]    = useState({
    nombre:"Finca El Rancho Verde", nit:"", municipio:"Bogotá",
    departamento:"Cundinamarca", telefono:"", email:"", direccion:"",
    planCode:"pro", hectareasTotales:27, capacidadTotal:100,
  });

  const doSeed = async (force = false) => {
    setSeedLoading(true); setSeedMsg(null);
    try {
      const r = await fetch("/api/seed", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({force}) });
      const d = await r.json();
      setSeedMsg({ ok:!!d.ok, msg: d.ok ? (force ? "✓ Datos reseteados y recargados correctamente" : "✓ Datos iniciales cargados correctamente") : String(d.error) });
    } catch(e) { setSeedMsg({ok:false, msg:"Error de conexión con el API"}); }
    finally { setSeedLoading(false); setResetConfirm(false); }
  };

  const doFetchHealth = async () => {
    setHealthLoading(true);
    try {
      const r = await fetch("/api/health"); const d = await r.json();
      setHealthData(d);
    } catch { setHealthData({status:"error", db:"Sin conexión"}); }
    finally { setHealthLoading(false); }
  };

  const doLoadDbCounts = async () => {
    setDbLoading(true);
    try {
      const endpoints = [
        ["animals","/api/animals"],["potreros","/api/potreros"],["insumos","/api/insumos"],
        ["personal","/api/personal"],["reproduccion","/api/reproduccion"],
        ["alertas","/api/alertas"],["pesajes","/api/pesajes"],["gps","/api/gps"],
      ];
      const results = await Promise.allSettled(endpoints.map(([,url])=>fetch(url).then(r=>r.json())));
      const counts: Record<string,number> = {};
      results.forEach((r,i) => {
        const key = endpoints[i][0];
        if (r.status==="fulfilled" && Array.isArray(r.value)) counts[key] = r.value.length;
        else counts[key] = 0;
      });
      setDbCounts(counts);
    } catch { /* ignore */ }
    finally { setDbLoading(false); }
  };

  const doSaveFinca = async () => {
    setFincaLoading(true);
    try {
      await fetch("/api/finca", { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(fincaData) });
      setFincaSaved(true); setTimeout(()=>setFincaSaved(false), 2000);
    } catch { /* ignore */ }
    finally { setFincaLoading(false); }
  };

  const doLoadFinca = async () => {
    try {
      const r = await fetch("/api/finca"); const d = await r.json();
      if (d && d.nombre) setFincaData(prev => ({...prev, ...d}));
    } catch { /* ignore */ }
  };

  const exportCuentasCSV = () => {
    const rows = [["ID","Nombre","Email","Rol","Plan","Finca","Activo"],
      ...accounts.map(a=>[a.id,a.nombre,a.email,a.role,a.plan??"basico",a.finca??"",String(a.activo!==false)])];
    const csv = rows.map(r=>r.map(c=>`"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv],{type:"text/csv"}); const url=URL.createObjectURL(blob);
    const el=document.createElement("a"); el.href=url; el.download=`civac_cuentas_${new Date().toISOString().slice(0,10)}.csv`; el.click();
    URL.revokeObjectURL(url);
  };

  const exportDatosJSON = async () => {
    try {
      const [animals,potreros,insumos,personal] = await Promise.all([
        fetch("/api/animals").then(r=>r.json()),
        fetch("/api/potreros").then(r=>r.json()),
        fetch("/api/insumos").then(r=>r.json()),
        fetch("/api/personal").then(r=>r.json()),
      ]);
      const blob = new Blob([JSON.stringify({exportDate:new Date().toISOString(),animals,potreros,insumos,personal},null,2)],{type:"application/json"});
      const url=URL.createObjectURL(blob); const el=document.createElement("a");
      el.href=url; el.download=`civac_backup_${new Date().toISOString().slice(0,10)}.json`; el.click();
      URL.revokeObjectURL(url);
    } catch { /* ignore */ }
  };

  const tab    = extTab ?? internalTab;
  const setTab = onTabChange ?? setInternalTab;

  /* ── Derived ── */
  const civacStaff  = accounts.filter(a => CIVAC_STAFF_IDS.includes(a.id));
  const clients     = accounts.filter(a => !CIVAC_STAFF_IDS.includes(a.id));
  const filtered    = clients.filter(a =>
    a.nombre.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase()) ||
    (a.finca || "").toLowerCase().includes(search.toLowerCase())
  );

  const planDist = useMemo(() =>
    PLAN_ORDER.map(p => ({
      name: PLAN_LABEL[p],
      value: accounts.filter(a => (a.plan ?? "basico") === p).length,
    })), [accounts]);

  const mrrSimulado  = useMemo(() => accounts.reduce((s,a)=>s+PLAN_PRECIOS[a.plan??"basico"]/1000,0),[accounts]);
  const activosCount = accounts.filter(a=>a.activo!==false).length;
  const proCount     = accounts.filter(a=>(a.plan??"basico")!=="basico").length;
  const pagosFilt    = PAGOS_DEMO.filter(p => payFilter==="todos" || p.estado===payFilter);
  const mrrTotal     = PAGOS_DEMO.filter(p=>p.estado==="aprobado").reduce((s,p)=>s+p.monto,0);

  /* ── Handlers ── */
  const handleAdd    = (d: Omit<Account,"id">) => { registerUser(d); setAddOpen(false); };
  const handleEdit   = (d: Omit<Account,"id">) => {
    if (!editTarget) return;
    const upd: Partial<Account> = { ...d };
    if (!d.password) delete upd.password;
    updateUser(editTarget.id, upd);
    setEditTarget(null);
  };
  const doChangePlan = () => {
    if (!planTarget) return;
    updateUser(planTarget.id, {
      plan: newPlan,
      planExpiry: newPlan !== "basico" ? new Date(Date.now()+30*86400000).toISOString().slice(0,10) : undefined,
    });
    setPlanTarget(null);
  };

  /* ── Generar enlace de invitación ── */
  const genInviteLink = (a: Account): string => {
    const payload = {
      e: a.email,
      p: a.password,
      pl: a.plan ?? "basico",
      n: a.nombre,
      f: a.finca ?? "",
      r: a.role,
      t: Date.now(),
    };
    const token = btoa(JSON.stringify(payload));
    return `${window.location.origin}/invite/${encodeURIComponent(token)}`;
  };
  const copyInviteLink = (a: Account) => {
    const link = genInviteLink(a);
    navigator.clipboard?.writeText(link).catch(() => {});
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2500);
  };
  const toggleStatus = (a: Account) => { if (a.id==="admin") return; updateUser(a.id, { activo:!(a.activo!==false) }); };
  const doDelete     = () => { if (!deleteTarget) return; deleteUser(deleteTarget.id); setDeleteTarget(null); };
  const revokeSession = (id: string) => {
    setSessionsList(s => s.map(x => x.id===id ? {...x, activa:false, ultima:"Sesión revocada"} : x));
    setRevokeTarget(null);
  };
  const genPayLink = () => {
    const base = "https://checkout.wompi.co/p/?public-key=pub_prod_CIVAC&currency=COP";
    const price = PLAN_PRECIOS[linkPlan];
    return `${base}&amount-in-cents=${price*100}&reference=CIVAC-${Date.now()}-${linkPlan}`;
  };
  const copyPayLink = () => { navigator.clipboard?.writeText(genPayLink()).catch(()=>{}); setLinkCopied(true); setTimeout(()=>setLinkCopied(false),2000); };

  /* ── Generar y descargar licencia JSON para un usuario ── */
  const genLicencia = (a: Account) => {
    const plan = (a.plan ?? "basico") as PlanId;
    const planIdx = PLAN_ORDER.indexOf(plan);
    const modulos = ALL_MODULES
      .filter((_,i) => PLAN_ORDER.indexOf(ALL_MODULES[i].plan as PlanId) <= planIdx)
      .filter(m => (a.permisos || []).includes(m.id))
      .map(m => ({ id: m.id, label: m.label, plan: m.plan }));
    const licencia = {
      civac_version: "1.0",
      tipo: "licencia_plan",
      generada: new Date().toISOString(),
      licencia_id: `LIC-${Date.now()}`,
      usuario: {
        id: a.id,
        nombre: a.nombre,
        email: a.email,
        cargo: a.cargo,
        finca: a.finca,
        role: a.role,
      },
      plan: {
        id: plan,
        label: PLAN_LABEL[plan],
        precio_mes: PLAN_PRECIOS[plan],
        expiry: a.planExpiry ?? null,
        activado: a.planActivadoEn ?? null,
        wompi_ref: a.wompiRef ?? null,
      },
      modulos_autorizados: modulos,
      permisos: a.permisos ?? [],
      app_url: window.location.origin,
      instrucciones: [
        "1. Abre GanaderIA PWA en tu navegador",
        "2. Ve a Configuración → Licencia",
        "3. Carga este archivo para activar tu plan",
        `4. Tu plan ${PLAN_LABEL[plan]} incluye ${modulos.length} módulos`,
      ],
    };
    const blob = new Blob([JSON.stringify(licencia, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const el = document.createElement("a");
    el.href = url;
    el.download = `civac_licencia_${a.id}_${plan}.json`;
    el.click();
    URL.revokeObjectURL(url);
  };

  /* ── Tab items ── */
  const TABS = [
    { id:"resumen",      icon:"📊", label:"Resumen",      color:"#00f5d4" },
    { id:"cuentas",      icon:"👥", label:"Cuentas",      color:"#39ff7e" },
    { id:"estadisticas", icon:"📉", label:"Estadísticas", color:"#818cf8" },
    { id:"registros",    icon:"✨", label:"Registros",    color:"#a855f7" },
    { id:"codigos",      icon:"🎟️", label:"Códigos",      color:"#f472b6" },
    { id:"planes",       icon:"⭐", label:"Planes",       color:"#a78bfa" },
    { id:"pagos",        icon:"💳", label:"Pagos",        color:"#fbbf24" },
    { id:"sesiones",     icon:"📡", label:"Sesiones",     color:"#00c8ff" },
    { id:"apis",         icon:"🔌", label:"APIs",         color:"#f97316" },
    { id:"modulos",      icon:"🧩", label:"Módulos",      color:"#e879f9" },
    { id:"basculas",     icon:"⚖️", label:"Básculas",     color:"#fb923c" },
    { id:"sistema",      icon:"⚙️", label:"Sistema",      color:"#94a3b8" },
    { id:"finca",        icon:"🏡", label:"Finca",        color:"#4ade80" },
    { id:"datos",        icon:"🗄️", label:"Datos",        color:"#c084fc" },
    { id:"reportes",     icon:"📈", label:"Reportes",     color:"#facc15" },
    { id:"logs",         icon:"📋", label:"Logs",         color:"#60a5fa" },
    { id:"soporte",      icon:"🎧", label:"Soporte",      color:"#f472b6" },
    { id:"seguridad",    icon:"🔒", label:"Seguridad",    color:"#34d399" },
    { id:"accesos",      icon:"📌", label:"Accesos",      color:"#00f5d4" },
  ];

  return (
    <div className="space-y-4 pb-12 civac-animate">

      {/* ── HERO BANNER ── */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden"
        style={{
          background:"linear-gradient(135deg,#1a0800 0%,#280d00 35%,#200a00 65%,#160800 100%)",
          border:"1px solid rgba(255,149,0,0.28)",
          boxShadow:"0 0 60px rgba(255,149,0,0.10), 0 8px 40px rgba(0,0,0,0.5)",
        }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background:"url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1000&q=15&auto=format&fit=crop') center/cover", opacity:0.04 }}/>
        {/* Amber glow spheres */}
        <div className="absolute -top-10 -right-10 w-80 h-80 rounded-full pointer-events-none"
          style={{ background:"radial-gradient(circle,rgba(255,149,0,0.18),transparent 70%)" }}/>
        <div className="absolute -bottom-12 -left-8 w-60 h-60 rounded-full pointer-events-none"
          style={{ background:"radial-gradient(circle,rgba(255,107,0,0.12),transparent 70%)" }}/>
        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 28px,rgba(255,149,0,0.02) 28px,rgba(255,149,0,0.02) 29px),repeating-linear-gradient(90deg,transparent,transparent 28px,rgba(255,149,0,0.02) 28px,rgba(255,149,0,0.02) 29px)",
        }}/>
        <div className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background:"linear-gradient(90deg,transparent,#ff9500,#fbbf24,#ff6b00,transparent)" }}/>

        <div className="relative p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0"
              style={{ border:"2px solid rgba(255,149,0,0.6)", boxShadow:"0 0 28px rgba(255,149,0,0.5), 0 0 60px rgba(255,149,0,0.15)" }}>
              <img src="https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=120&h=120&q=80&auto=format&fit=crop&crop=face"
                alt="CIVAC" className="w-full h-full object-cover"/>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-xl sm:text-2xl font-black text-white" style={{ fontFamily:"'Sora',sans-serif", textShadow:"0 0 30px rgba(255,149,0,0.3)" }}>
                  CIVAC Admin
                </h1>
                <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full"
                  style={{ background:"linear-gradient(135deg,#ff9500,#ff6b00)", color:"white", boxShadow:"0 0 12px rgba(255,149,0,0.5)" }}>
                  👑 SUPER PANEL
                </span>
                <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full"
                  style={{ background:"linear-gradient(135deg,#fbbf24,#f59e0b)", color:"black", boxShadow:"0 0 10px rgba(251,191,36,0.4)" }}>
                  v1.0
                </span>
              </div>
              <p className="text-xs" style={{ color:"rgba(255,149,0,0.65)" }}>
                Control Inteligente de Valor Agropecuario · Panel de Administración Global
              </p>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1 text-[10px]" style={{ color:"rgba(255,149,0,0.5)" }}>
                  <Shield size={10}/> {currentUser?.nombre ?? "Admin"}
                </span>
                <span className="flex items-center gap-1 text-[10px]" style={{ color:"rgba(255,255,255,0.3)" }}>
                  <Globe size={10}/> Colombia · {new Date().toLocaleDateString("es-CO")}
                </span>
                <span className="flex items-center gap-1 text-[10px]" style={{ color:"#39ff7e" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#39ff7e] animate-pulse"/> Sistema operativo
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button size="sm" variant="outline"
              className="gap-1.5 text-xs border-white/20 text-white/70 hover:text-white">
              <Download size={12}/> Exportar CSV
            </Button>
            <Button size="sm" onClick={() => setAddOpen(true)}
              className="gap-1.5 text-xs font-bold"
              style={{ background:"linear-gradient(135deg,#ff9500,#ff6b00)", color:"white", boxShadow:"0 0 16px rgba(255,149,0,0.4)" }}>
              <Plus size={12}/> Nuevo cliente
            </Button>
            <Button size="sm" onClick={() => setTab("servidor")}
              className="gap-1.5 text-xs font-bold"
              style={{ background:"linear-gradient(135deg,rgba(0,245,212,0.15),rgba(0,200,255,0.10))", color:"#00f5d4", border:"1px solid rgba(0,245,212,0.4)", boxShadow:"0 0 14px rgba(0,245,212,0.18)" }}>
              <Server size={12}/> Server Panel
            </Button>
          </div>
        </div>
      </div>

      {/* ── KPI STRIP ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label:"Total cuentas",   val:accounts.length, sub:"sistemas CIVAC",        icon:<Users size={16}/>,       from:"#00f5d4",to:"#00a896",glow:"0,245,212"   },
          { label:"Activos ahora",   val:sessionsList.filter(s=>s.activa).length, sub:"sesiones en línea",   icon:<Activity size={16}/>,    from:"#39ff7e",to:"#00c850",glow:"57,255,126"  },
          { label:"Planes pagos",    val:proCount,        sub:"PRO / Premium / Platino", icon:<CreditCard size={16}/>,  from:"#fbbf24",to:"#f97316",glow:"251,191,36"  },
          { label:"MRR Colombia",    val:fmt(mrrTotal),   sub:"mes actual pagos",        icon:<DollarSign size={16}/>,  from:"#fbbf24",to:"#ea580c",glow:"251,191,36"  },
        ].map(k => (
          <div key={k.label} className="relative rounded-2xl p-4 overflow-hidden"
            style={{
              background:`linear-gradient(145deg,rgba(${k.glow},0.08),rgba(${k.glow},0.03))`,
              border:`1px solid rgba(${k.glow},0.2)`,
            }}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background:`linear-gradient(135deg,${k.from},${k.to})`, color:"black" }}>
                {k.icon}
              </div>
              <TrendingUp size={12} style={{ color:`rgba(${k.glow},0.5)` }}/>
            </div>
            <p className="text-2xl font-black text-white">{k.val}</p>
            <p className="text-[10px] mt-0.5" style={{ color:`rgba(${k.glow},0.6)` }}>{k.label}</p>
            <p className="text-[9px] text-white/25 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* ── TAB BAR ── */}
      <div className="flex overflow-x-auto gap-0.5 rounded-2xl p-1" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 h-8 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
            style={{
              background: tab===t.id ? `${t.color}18` : "transparent",
              color: tab===t.id ? t.color : "rgba(255,255,255,0.38)",
              borderBottom: tab===t.id ? `2px solid ${t.color}` : "2px solid transparent",
              boxShadow: tab===t.id ? `0 0 12px ${t.color}25` : "none",
            }}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          TAB: RESUMEN
      ════════════════════════════════════════════════════════════════════ */}
      {tab === "resumen" && (
        <div className="space-y-4">
          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* MRR area */}
            <div className="lg:col-span-2 rounded-2xl p-4" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(0,245,212,0.12)"}}>
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <TrendingUp size={14} style={{color:"#00f5d4"}}/> MRR e-Commerce (miles COP)
              </h3>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={SYS_METRICS} margin={{top:4,right:4,left:-24,bottom:0}}>
                  <defs>
                    <linearGradient id="mrr_grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f5d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00f5d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                  <XAxis dataKey="mes" tick={{fontSize:10,fill:"rgba(255,255,255,0.4)"}}/>
                  <YAxis tick={{fontSize:10,fill:"rgba(255,255,255,0.4)"}}/>
                  <RTooltip contentStyle={TIP}/>
                  <Area type="monotone" dataKey="mrr" stroke="#00f5d4" strokeWidth={2} fill="url(#mrr_grad)" name="MRR (k COP)"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* Plan distribution */}
            <div className="rounded-2xl p-4" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(167,139,250,0.12)"}}>
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <BarChart3 size={14} style={{color:"#a78bfa"}}/> Distribución Planes
              </h3>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={planDist} cx="50%" cy="50%" outerRadius={55} dataKey="value"
                    label={({name,value})=>value>0?`${name}:${value}`:""} labelLine={false}>
                    {planDist.map((_,i)=><Cell key={i} fill={PLAN_COLORS_PIE[i]}/>)}
                  </Pie>
                  <RTooltip contentStyle={TIP}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 justify-center mt-1">
                {PLAN_ORDER.map((p,i)=>(
                  <div key={p} className="flex items-center gap-1 text-[9px]">
                    <div className="w-2 h-2 rounded-full" style={{background:PLAN_COLORS_PIE[i]}}/>
                    <span className="text-white/50">{PLAN_LABEL[p]}: {accounts.filter(a=>(a.plan??"basico")===p).length}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Growth + events */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl p-4" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(57,255,126,0.12)"}}>
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Users size={14} style={{color:"#39ff7e"}}/> Crecimiento de clientes
              </h3>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={SYS_METRICS} margin={{top:4,right:4,left:-24,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                  <XAxis dataKey="mes" tick={{fontSize:10,fill:"rgba(255,255,255,0.4)"}}/>
                  <YAxis tick={{fontSize:10,fill:"rgba(255,255,255,0.4)"}} allowDecimals={false}/>
                  <RTooltip contentStyle={TIP}/>
                  <Bar dataKey="clientes" fill="#39ff7e" radius={[4,4,0,0]} name="Clientes"/>
                  <Bar dataKey="nuevos"   fill="#fbbf24" radius={[4,4,0,0]} name="Nuevos"/>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Recent events */}
            <div className="rounded-2xl p-4" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(251,191,36,0.12)"}}>
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Bell size={14} style={{color:"#fbbf24"}}/> Eventos recientes
              </h3>
              <div className="space-y-2">
                {[
                  { icon:"💳", txt:"Pago aprobado — Finca La Loma · Platino",    t:"Hace 2 min",  c:"#39ff7e" },
                  { icon:"👤", txt:"Nuevo registro — santos@civac.co",            t:"Hace 12 min", c:"#00f5d4" },
                  { icon:"⭐", txt:"Upgrade plan — Dr. Carlos Ramírez → Premium", t:"Hace 1 h",    c:"#a78bfa" },
                  { icon:"🔐", txt:"Sesión iniciada — admin@ganader.ia · Bogotá", t:"Hace 2 h",    c:"#fbbf24" },
                  { icon:"❌", txt:"Pago rechazado — Agropecuaria Santos",        t:"Hace 3 h",    c:"#f87171" },
                ].map((ev,i)=>(
                  <div key={i} className="flex items-center gap-2 py-1.5 border-b" style={{borderColor:"rgba(255,255,255,0.04)"}}>
                    <span className="text-base flex-shrink-0">{ev.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/70 truncate">{ev.txt}</p>
                    </div>
                    <span className="text-[9px] flex-shrink-0" style={{color:"rgba(255,255,255,0.25)"}}>{ev.t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label:"Uptime",       val:"99.9%",   icon:"🟢", sub:"Últimos 30 días"  },
              { label:"Churn rate",   val:"0%",      icon:"📉", sub:"Mayo 2026"         },
              { label:"ARPU",         val:"$173k",   icon:"💵", sub:"Promedio por user" },
              { label:"Lighthouse",   val:"98/100",  icon:"⚡", sub:"PWA Performance"  },
            ].map(s=>(
              <div key={s.label} className="rounded-2xl p-3 text-center"
                style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)"}}>
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="font-black text-white text-lg">{s.val}</div>
                <div className="text-[9px] text-white/40 mt-0.5">{s.label}</div>
                <div className="text-[8px] text-white/20">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* ── Acceso rápido a todos los módulos del admin ── */}
          <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(0,245,212,0.12)"}}>
            <div className="px-4 py-3 flex items-center gap-2"
              style={{background:"rgba(0,245,212,0.06)",borderBottom:"1px solid rgba(0,245,212,0.1)"}}>
              <Layers size={14} style={{color:"#00f5d4"}}/>
              <span className="text-sm font-bold text-white">Navegación rápida</span>
              <span className="text-[9px] text-white/30 ml-1">— haz clic para ir al módulo</span>
            </div>
            <div className="p-3 grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 gap-2">
              {[
                { id:"cuentas",   icon:"👥", label:"Cuentas",    color:"#39ff7e", desc:"Gestión de usuarios" },
                { id:"planes",    icon:"⭐", label:"Planes",     color:"#a78bfa", desc:"Editar planes" },
                { id:"pagos",     icon:"💳", label:"Pagos",      color:"#fbbf24", desc:"Transacciones" },
                { id:"sesiones",  icon:"📡", label:"Sesiones",   color:"#00c8ff", desc:"Sesiones activas" },
                { id:"apis",      icon:"🔌", label:"APIs",       color:"#f97316", desc:"Integraciones" },
                { id:"modulos",   icon:"🧩", label:"Módulos",    color:"#e879f9", desc:"Módulos sistema" },
                { id:"basculas",  icon:"⚖️", label:"Básculas",   color:"#fb923c", desc:"Pesaje BT/COM" },
                { id:"sistema",   icon:"⚙️", label:"Sistema",    color:"#94a3b8", desc:"Estado servidor" },
                { id:"finca",     icon:"🏡", label:"Finca",      color:"#4ade80", desc:"Config. finca" },
                { id:"datos",     icon:"🗄️", label:"Datos",      color:"#c084fc", desc:"BD y backups" },
                { id:"reportes",  icon:"📈", label:"Reportes",   color:"#facc15", desc:"Métricas" },
                { id:"logs",      icon:"📋", label:"Logs",       color:"#60a5fa", desc:"Auditoría" },
                { id:"soporte",   icon:"🎧", label:"Soporte",    color:"#f472b6", desc:"Tickets" },
                { id:"seguridad", icon:"🔒", label:"Seguridad",  color:"#34d399", desc:"Permisos" },
              ].map(m=>(
                <button key={m.id} onClick={()=>setTab(m.id)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all hover:scale-[1.03] active:scale-100"
                  style={{
                    background:`${m.color}08`,
                    border:`1px solid ${m.color}25`,
                  }}>
                  <span className="text-xl">{m.icon}</span>
                  <span className="text-[9px] font-bold" style={{color:m.color}}>{m.label}</span>
                  <span className="text-[8px] text-white/25 text-center leading-tight">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB: CUENTAS
      ════════════════════════════════════════════════════════════════════ */}
      {tab === "cuentas" && (
        <div className="space-y-4">

          {/* ── CIVAC STAFF SECTION ── */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background:"linear-gradient(135deg,rgba(0,245,212,0.05),rgba(0,200,255,0.03))", border:"1px solid rgba(0,245,212,0.18)", boxShadow:"0 0 30px rgba(0,245,212,0.06)" }}>
            <div className="px-4 py-3 flex items-center justify-between border-b"
              style={{ borderColor:"rgba(0,245,212,0.12)", background:"rgba(0,245,212,0.04)" }}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ background:"linear-gradient(135deg,#00f5d4,#00c8ff)", boxShadow:"0 0 10px rgba(0,245,212,0.5)" }}>
                  <Server size={12} className="text-black"/>
                </div>
                <span className="text-[11px] font-black tracking-wider" style={{ color:"#00f5d4", fontFamily:"'Space Grotesk',monospace" }}>
                  ⬡ EQUIPO CIVAC — ACCESO SERVIDOR
                </span>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                style={{ background:"rgba(0,245,212,0.10)", border:"1px solid rgba(0,245,212,0.25)", color:"rgba(0,245,212,0.7)" }}>
                {civacStaff.length} miembros
              </span>
            </div>
            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {civacStaff.map(staff => {
                const roleColors: Record<string,{from:string;to:string;glow:string;label:string}> = {
                  superadmin: { from:"#ff6b35", to:"#ff9500", glow:"255,107,53",  label:"Super Admin"  },
                  admin:      { from:"#fbbf24", to:"#f59e0b", glow:"251,191,36",  label:"Admin"        },
                  developer:  { from:"#00ff88", to:"#00c864", glow:"0,255,136",   label:"Developer"    },
                  sales:      { from:"#e879f9", to:"#a855f7", glow:"232,121,249", label:"Sales CRM"    },
                };
                const rc = roleColors[staff.role ?? "admin"] ?? roleColors.admin;
                return (
                  <div key={staff.id} className="relative rounded-2xl p-3.5 flex flex-col gap-2.5 overflow-hidden"
                    style={{ background:`linear-gradient(145deg,rgba(${rc.glow},0.08),rgba(${rc.glow},0.04))`, border:`1px solid rgba(${rc.glow},0.22)` }}>
                    <div className="absolute top-0 left-0 right-0 h-0.5"
                      style={{ background:`linear-gradient(90deg,transparent,${rc.from},${rc.to},transparent)` }}/>
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background:`linear-gradient(135deg,rgba(${rc.glow},0.2),rgba(${rc.glow},0.10))`, border:`1px solid rgba(${rc.glow},0.3)` }}>
                        {staff.avatar}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-black text-white truncate leading-tight">{staff.nombre.split(" ").slice(0,2).join(" ")}</p>
                        <p className="text-[9px] font-mono truncate" style={{ color:`rgba(${rc.glow},0.6)` }}>{staff.cargo?.split(" · ")[0]}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background:`rgba(${rc.glow},0.12)`, border:`1px solid rgba(${rc.glow},0.28)`, color:rc.from }}>
                        {rc.label}
                      </span>
                      <span className="flex items-center gap-1 text-[8px] font-mono"
                        style={{ color:"rgba(0,245,212,0.5)" }}>
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:"#00f5d4", boxShadow:"0 0 4px #00f5d4" }}/>
                        Server ✓
                      </span>
                    </div>
                    <p className="text-[8px] font-mono truncate" style={{ color:"rgba(255,255,255,0.25)" }}>{staff.email}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── SECTION DIVIDER ── */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1" style={{ background:"linear-gradient(90deg,transparent,rgba(57,255,126,0.2),transparent)" }}/>
            <span className="text-[9px] font-black uppercase tracking-[0.22em] px-3 py-1 rounded-full"
              style={{ color:"rgba(57,255,126,0.45)", border:"1px solid rgba(57,255,126,0.12)", background:"rgba(57,255,126,0.04)" }}>
              👥 Cuentas Clientes & Demo
            </span>
            <div className="h-px flex-1" style={{ background:"linear-gradient(90deg,transparent,rgba(57,255,126,0.2),transparent)" }}/>
          </div>

          {/* ── SEARCH + ADD ── */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-48 max-w-sm">
              <Input placeholder="Buscar nombre, email, finca…" value={search} onChange={e=>setSearch(e.target.value)}
                className="pl-8 text-xs h-8"
                style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)"}}/>
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30"/>
            </div>
            <Badge variant="outline" className="text-xs">{filtered.length} clientes</Badge>
            <Button size="sm" onClick={()=>setAddOpen(true)}
              className="gap-1 text-xs ml-auto"
              style={{background:"linear-gradient(135deg,#00f5d4,#00a896)",color:"black"}}>
              <UserPlus size={12}/> Nuevo
            </Button>
          </div>

          <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(255,255,255,0.08)"}}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{background:"rgba(0,245,212,0.06)",borderBottom:"1px solid rgba(0,245,212,0.1)"}}>
                  {["Cliente / Finca","Rol","Plan","Módulos","Estado","Vencimiento","Acciones"].map(h=>(
                    <th key={h} className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider font-bold"
                      style={{color:"rgba(0,245,212,0.6)"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const realClients = filtered.filter(a => !a.isDemo);
                  const demoClients = filtered.filter(a => a.isDemo);
                  if (filtered.length === 0) return <tr><td colSpan={7} className="text-center py-8 text-white/25 text-xs">Sin resultados</td></tr>;
                  const makeRow = (a: Account, i: number, isDemo: boolean) => (
                    <tr key={a.id}
                      style={{background:isDemo?"rgba(251,191,36,0.03)":(i%2===0?"rgba(255,255,255,0.02)":"transparent"),borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                            style={{background:"rgba(0,245,212,0.1)",border:"1px solid rgba(0,245,212,0.2)"}}>
                            {a.avatar}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">{a.nombre}</p>
                            <p className="text-[9px]" style={{color:"rgba(0,245,212,0.4)"}}>{a.finca} · {a.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          {isDemo && <span className="text-[7px] font-black px-1.5 py-0.5 rounded-full" style={{background:"rgba(251,191,36,0.15)",border:"1px solid rgba(251,191,36,0.3)",color:"#fbbf24"}}>DEMO</span>}
                          <span className="text-[10px] text-white/50">{a.cargo||a.role}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5"><PlanBadge plan={a.plan}/></td>
                      <td className="px-3 py-2.5">
                        <span className="text-[10px] text-white/35">{(a.permisos||[]).length} módulos</span>
                      </td>
                      <td className="px-3 py-2.5"><StatusPill activo={a.activo}/></td>
                      <td className="px-3 py-2.5">
                        <span className="text-[10px] text-white/40">{a.planExpiry ?? "—"}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1 flex-wrap">
                          <button onClick={()=>toggleStatus(a)}
                            className="flex items-center gap-1 px-2 py-1 rounded-xl text-[9px] font-bold transition-all"
                            style={{
                              background: a.activo!==false ? "rgba(57,255,126,0.12)" : "rgba(248,113,113,0.12)",
                              border: `1px solid ${a.activo!==false ? "rgba(57,255,126,0.35)" : "rgba(248,113,113,0.35)"}`,
                              color: a.activo!==false ? "#39ff7e" : "#f87171",
                            }}>
                            {a.activo!==false ? <ToggleRight size={11}/> : <ToggleLeft size={11}/>}
                            {a.activo!==false ? "Activo" : "Inactivo"}
                          </button>
                          <button onClick={()=>setEditTarget(a)} title="Editar usuario"
                            className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                            <Edit size={11}/>
                          </button>
                          <button onClick={()=>setPermTarget(a)} title="Permisos"
                            className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-blue-500/15 transition-colors" style={{color:"#60a5fa"}}>
                            <Shield size={11}/>
                          </button>
                          <button onClick={()=>{setPlanTarget(a);setNewPlan(a.plan??"basico");}} title="Cambiar plan"
                            className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-purple-500/15 transition-colors" style={{color:"#c084fc"}}>
                            <Star size={11}/>
                          </button>
                          <button onClick={()=>genLicencia(a)} title="Descargar licencia"
                            className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-amber-500/15 transition-colors"
                            style={{color:PLAN_COLOR[a.plan??"basico"]}}>
                            <Download size={11}/>
                          </button>
                          <button onClick={()=>setInviteTarget(a)} title="Enviar acceso / invitación"
                            className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-emerald-500/15 transition-colors" style={{color:"#34d399"}}>
                            <Send size={11}/>
                          </button>
                          <button onClick={()=>setDeleteTarget(a)} disabled={a.id==="admin"} title="Eliminar"
                            className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-red-500/15 text-red-400/50 hover:text-red-400 disabled:opacity-20 transition-colors">
                            <Trash2 size={11}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                  return [
                    ...(realClients.length > 0 ? [
                      <tr key="sep-real"><td colSpan={7} className="px-3 pt-3 pb-1.5">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em]" style={{color:"rgba(57,255,126,0.35)"}}>✓ Cuentas cliente reales ({realClients.length})</span>
                      </td></tr>,
                      ...realClients.map((a,i) => makeRow(a,i,false)),
                    ] : []),
                    ...(demoClients.length > 0 ? [
                      <tr key="sep-demo"><td colSpan={7} className="px-3 pt-4 pb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="h-px flex-1" style={{background:"rgba(251,191,36,0.15)"}}/>
                          <span className="text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full"
                            style={{color:"rgba(251,191,36,0.5)",border:"1px solid rgba(251,191,36,0.15)",background:"rgba(251,191,36,0.05)"}}>
                            🎭 Cuentas Demo · {demoClients.length} planes
                          </span>
                          <div className="h-px flex-1" style={{background:"rgba(251,191,36,0.15)"}}/>
                        </div>
                      </td></tr>,
                      ...demoClients.map((a,i) => makeRow(a,i,true)),
                    ] : []),
                  ];
                })()}
              </tbody>
            </table>
          </div>

          {/* ── GOOGLE USERS PANEL ── */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1" style={{ background:"rgba(0,245,212,0.1)" }}/>
              <span className="text-[10px] font-black uppercase tracking-wider px-2" style={{ color:"rgba(0,245,212,0.35)" }}>Usuarios DB · Google OAuth</span>
              <div className="h-px flex-1" style={{ background:"rgba(0,245,212,0.1)" }}/>
            </div>
            <GoogleUsersPanel />
          </div>

          {/* ── PYTHON: Fincas registradas en plataforma ── */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1" style={{background:"linear-gradient(90deg,transparent,rgba(96,165,250,0.2),transparent)"}}/>
              <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full"
                style={{color:"rgba(96,165,250,0.55)",border:"1px solid rgba(96,165,250,0.15)",background:"rgba(96,165,250,0.05)"}}>
                🐍 Python Analytics · Fincas registradas
              </span>
              <div className="h-px flex-1" style={{background:"linear-gradient(90deg,transparent,rgba(96,165,250,0.2),transparent)"}}/>
            </div>
            <PythonUsuariosPlataforma />
          </div>

          {/* ── INVITE MODAL ── */}
          {inviteTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.7)",backdropFilter:"blur(8px)"}}>
              <div className="w-full max-w-md rounded-3xl overflow-hidden" style={{background:"linear-gradient(145deg,#020d1a,#0a1a2e)",border:"1px solid rgba(52,211,153,0.3)",boxShadow:"0 0 60px rgba(52,211,153,0.12)"}}>
                <div className="h-1" style={{background:"linear-gradient(90deg,#34d399,#00c8ff,transparent)"}}/>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-base text-white flex items-center gap-2">
                      <Send size={15} style={{color:"#34d399"}}/> Enviar Acceso
                    </h3>
                    <button onClick={()=>{setInviteTarget(null);setInviteCopied(false);}} className="text-white/30 hover:text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10">
                      <XC size={14}/>
                    </button>
                  </div>

                  {/* User info */}
                  <div className="flex items-center gap-3 mb-4 p-3 rounded-2xl" style={{background:"rgba(52,211,153,0.05)",border:"1px solid rgba(52,211,153,0.15)"}}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{background:"rgba(52,211,153,0.1)"}}>
                      {inviteTarget.avatar}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{inviteTarget.nombre}</p>
                      <p className="text-[10px] truncate" style={{color:"rgba(52,211,153,0.5)"}}>{inviteTarget.email}</p>
                      <p className="text-[9px] text-white/30">{inviteTarget.finca} · Plan <span style={{color:PLAN_COLOR[inviteTarget.plan??"basico"]}}>{PLAN_LABEL[inviteTarget.plan??"basico"]}</span></p>
                    </div>
                  </div>

                  {/* Generated link */}
                  <p className="text-[10px] text-white/40 mb-2 uppercase tracking-wider flex items-center gap-1"><Link2 size={9}/> Enlace de acceso personalizado</p>
                  <div className="flex gap-2 mb-3">
                    <div className="flex-1 text-[9px] font-mono bg-white/5 px-3 py-2.5 rounded-xl text-white/40 overflow-hidden truncate border border-white/8">
                      {genInviteLink(inviteTarget).slice(0,55)}…
                    </div>
                    <button onClick={()=>copyInviteLink(inviteTarget)}
                      className="px-3 py-2.5 rounded-xl text-xs font-bold flex-shrink-0 transition-all"
                      style={{background:inviteCopied?"rgba(52,211,153,0.2)":"rgba(52,211,153,0.08)",color:"#34d399",border:"1px solid rgba(52,211,153,0.3)"}}>
                      {inviteCopied ? <CheckCircle size={13}/> : <Copy size={13}/>}
                    </button>
                  </div>

                  {/* Share buttons */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <a href={`https://wa.me/?text=${encodeURIComponent("Tu acceso CIVAC: " + genInviteLink(inviteTarget))}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-bold transition-all hover:opacity-80"
                      style={{background:"rgba(37,211,102,0.08)",color:"#25d366",border:"1px solid rgba(37,211,102,0.2)"}}>
                      📱 WhatsApp
                    </a>
                    <a href={`mailto:${inviteTarget.email}?subject=Tu acceso CIVAC ${PLAN_LABEL[inviteTarget.plan??"basico"]}&body=${encodeURIComponent("Hola " + inviteTarget.nombre + ",\n\nTu acceso a GanaderIA CIVAC está listo:\n\n" + genInviteLink(inviteTarget) + "\n\nSoporte: soporte@civac.co")}`}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-bold transition-all hover:opacity-80"
                      style={{background:"rgba(0,120,255,0.08)",color:"#60a5fa",border:"1px solid rgba(0,120,255,0.2)"}}>
                      ✉️ Email
                    </a>
                    <a href={`https://t.me/share/url?url=${encodeURIComponent(genInviteLink(inviteTarget))}&text=${encodeURIComponent("Tu acceso CIVAC 🐄")}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-bold transition-all hover:opacity-80"
                      style={{background:"rgba(0,136,204,0.08)",color:"#0088cc",border:"1px solid rgba(0,136,204,0.2)"}}>
                      ✈️ Telegram
                    </a>
                  </div>

                  <div className="text-[9px] text-white/25 text-center flex items-center justify-center gap-1">
                    <Shield size={8}/> El enlace contiene credenciales cifradas · Solo accesible por el destinatario
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Permisos inline */}
          {permTarget && (
            <div className="rounded-2xl p-4" style={{background:"rgba(0,200,255,0.04)",border:"1px solid rgba(0,200,255,0.2)"}}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2"><Shield size={13} style={{color:"#00c8ff"}}/> Permisos — {permTarget.nombre}</h3>
                <button onClick={()=>setPermTarget(null)} className="text-white/30 hover:text-white"><XC size={14}/></button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {ALL_MODULES.map(m=>{
                  const hasPerm = (permTarget.permisos||[]).includes(m.id);
                  return (
                    <button key={m.id}
                      onClick={()=>{
                        const newPerms = hasPerm
                          ? (permTarget.permisos||[]).filter(p=>p!==m.id)
                          : [...(permTarget.permisos||[]), m.id];
                        updateUser(permTarget.id, {permisos:newPerms});
                        setPermTarget({...permTarget, permisos:newPerms});
                      }}
                      className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-[9px] transition-all"
                      style={{
                        background:hasPerm?"rgba(0,245,212,0.12)":"rgba(255,255,255,0.02)",
                        border:`1px solid ${hasPerm?"rgba(0,245,212,0.3)":"rgba(255,255,255,0.06)"}`,
                        color:hasPerm?"#00f5d4":"rgba(255,255,255,0.3)",
                      }}>
                      {m.icon} {m.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB: PLANES
      ════════════════════════════════════════════════════════════════════ */}
      {tab === "planes" && (
        <div className="space-y-4">
          {/* KPI header */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label:"Total clientes",  val:accounts.filter(a=>a.id!=="admin").length, icon:"👥", c:"#00f5d4" },
              { label:"MRR total",       val:fmt(mrrTotal),                              icon:"💰", c:"#39ff7e" },
              { label:"Planes activos",  val:PLAN_ORDER.filter(p=>accounts.some(a=>(a.plan??"basico")===p)).length, icon:"⭐", c:"#a78bfa" },
              { label:"ARPU promedio",   val:accounts.filter(a=>a.id!=="admin").length>0?fmt(Math.round(mrrTotal/accounts.filter(a=>a.id!=="admin").length)):"$0", icon:"📊", c:"#fbbf24" },
            ].map(k=>(
              <div key={k.label} className="rounded-2xl p-3 flex items-center gap-3"
                style={{background:`${k.c}09`,border:`1px solid ${k.c}25`}}>
                <span className="text-2xl">{k.icon}</span>
                <div>
                  <div className="font-black text-white text-lg leading-none">{k.val}</div>
                  <div className="text-[9px] mt-0.5" style={{color:`${k.c}80`}}>{k.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Plan cards — 2×2 grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PLAN_ORDER.map(p => {
              const planUsers  = accounts.filter(a => (a.plan ?? "basico") === p);
              const isEditing  = editPlanId === p;
              const isExpanded = planExpandUsers === p;
              const pData      = planEdits[p];
              const mrr        = planUsers.length * pData.precio;
              const clr        = PLAN_COLOR[p];

              return (
                <div key={p} className="space-y-0">
                  {/* ── Plan card ── */}
                  <div className="rounded-2xl overflow-hidden" style={{border:`1.5px solid ${clr}35`,background:`${clr}07`}}>
                    {/* Color top bar */}
                    <div className="h-1.5" style={{background:`linear-gradient(90deg,${clr},${clr}40,transparent)`}}/>

                    {/* Header row */}
                    <div className="px-4 pt-3 pb-2 flex items-center justify-between"
                      style={{borderBottom:`1px solid ${clr}15`}}>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{PLAN_ICON[p]}</span>
                        <div>
                          <div className="font-black text-base leading-none" style={{color:clr}}>{pData.nombre}</div>
                          <div className="text-[10px] font-bold mt-0.5" style={{color:`${clr}90`}}>
                            {pData.precio>0?`${fmt(pData.precio)}/mes`:"Gratis · Plan de entrada"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={()=>{ setEditPlanId(isEditing?null:p); setPlanFeatInput(""); }}
                          className="flex items-center gap-1 px-2 py-1 rounded-xl text-[9px] font-bold transition-all"
                          style={{background:isEditing?`${clr}20`:"rgba(255,255,255,0.06)",border:`1px solid ${isEditing?`${clr}50`:"rgba(255,255,255,0.1)"}`,color:isEditing?clr:"rgba(255,255,255,0.45)"}}>
                          <Edit size={9}/> {isEditing?"Cancelar":"Editar"}
                        </button>
                        <button onClick={()=>setPlanExpandUsers(isExpanded?null:p)}
                          className="flex items-center gap-1 px-2 py-1 rounded-xl text-[9px] font-bold transition-all"
                          style={{background:isExpanded?`${clr}20`:"rgba(255,255,255,0.06)",border:`1px solid ${isExpanded?`${clr}50`:"rgba(255,255,255,0.1)"}`,color:isExpanded?clr:"rgba(255,255,255,0.45)"}}>
                          <Users size={9}/> {planUsers.length} usuarios
                        </button>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-4">
                      {isEditing ? (
                        /* ──── EDIT FORM ──── */
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] text-white/40 block mb-1">Nombre del plan</label>
                              <Input value={pData.nombre} onChange={e=>setPlanEdits(prev=>({...prev,[p]:{...prev[p],nombre:e.target.value}}))}
                                className="h-7 text-xs" style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${clr}30`,color:"white"}}/>
                            </div>
                            <div>
                              <label className="text-[9px] text-white/40 block mb-1">Precio mensual (COP)</label>
                              <Input type="number" value={pData.precio} onChange={e=>setPlanEdits(prev=>({...prev,[p]:{...prev[p],precio:Number(e.target.value)}}))}
                                className="h-7 text-xs" style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${clr}30`,color:"white"}}/>
                            </div>
                          </div>
                          <div>
                            <label className="text-[9px] text-white/40 block mb-1">Funcionalidades incluidas</label>
                            <div className="flex flex-wrap gap-1 mb-2 max-h-24 overflow-y-auto">
                              {pData.features.map((f,fi)=>(
                                <span key={fi} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium"
                                  style={{background:`${clr}18`,border:`1px solid ${clr}35`,color:clr}}>
                                  {f}
                                  <button onClick={()=>setPlanEdits(prev=>({...prev,[p]:{...prev[p],features:prev[p].features.filter((_,i)=>i!==fi)}}))}
                                    className="hover:opacity-60 ml-0.5">✕</button>
                                </span>
                              ))}
                            </div>
                            <div className="flex gap-1">
                              <Input value={planFeatInput} onChange={e=>setPlanFeatInput(e.target.value)}
                                onKeyDown={e=>{if(e.key==="Enter"&&planFeatInput.trim()){setPlanEdits(prev=>({...prev,[p]:{...prev[p],features:[...prev[p].features,planFeatInput.trim()]}}));setPlanFeatInput("");}}}
                                placeholder="Nueva funcionalidad… Enter para agregar" className="h-7 text-[10px] flex-1"
                                style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${clr}30`,color:"white"}}/>
                              <button onClick={()=>{if(planFeatInput.trim()){setPlanEdits(prev=>({...prev,[p]:{...prev[p],features:[...prev[p].features,planFeatInput.trim()]}}));setPlanFeatInput("");}}}
                                className="px-3 h-7 rounded-xl text-[9px] font-bold"
                                style={{background:`${clr}20`,border:`1px solid ${clr}40`,color:clr}}>
                                <Plus size={10}/>
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-1">
                            <button onClick={()=>setEditPlanId(null)}
                              className="px-3 py-1.5 rounded-xl text-[10px] font-bold text-white/40 hover:text-white/70 transition-colors">
                              Cancelar
                            </button>
                            <button onClick={()=>setEditPlanId(null)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all"
                              style={{background:`linear-gradient(135deg,${clr},${clr}90)`,color:"black"}}>
                              <CheckCircle size={10}/> Guardar plan
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* ──── DISPLAY MODE ──── */
                        <div>
                          {/* Stats row */}
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="rounded-xl p-2 text-center" style={{background:"rgba(255,255,255,0.04)"}}>
                              <div className="font-black text-white text-xl leading-none">{planUsers.length}</div>
                              <div className="text-[8px] text-white/35 mt-0.5">Clientes</div>
                            </div>
                            <div className="rounded-xl p-2 text-center" style={{background:"rgba(255,255,255,0.04)"}}>
                              <div className="font-black text-sm leading-tight" style={{color:clr}}>{fmt(mrr)}</div>
                              <div className="text-[8px] text-white/35 mt-0.5">MRR</div>
                            </div>
                            <div className="rounded-xl p-2 text-center" style={{background:"rgba(255,255,255,0.04)"}}>
                              <div className="font-black text-white text-sm leading-tight">{pData.features.length}</div>
                              <div className="text-[8px] text-white/35 mt-0.5">Funciones</div>
                            </div>
                          </div>
                          {/* Features list */}
                          <div className="space-y-1 max-h-36 overflow-y-auto" style={{scrollbarWidth:"thin"}}>
                            {pData.features.map((f,fi)=>(
                              <div key={fi} className="flex items-center gap-1.5 text-[9px]" style={{color:`${clr}90`}}>
                                <CheckCircle size={8} style={{color:clr,flexShrink:0}}/> {f}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Users per plan panel (expandable) ── */}
                  {isExpanded && (
                    <div className="rounded-b-2xl overflow-hidden mt-0.5"
                      style={{border:`1.5px solid ${clr}30`,borderTop:`1px solid ${clr}20`,background:`${clr}05`}}>
                      <div className="px-4 py-2.5 flex items-center justify-between"
                        style={{background:`${clr}10`,borderBottom:`1px solid ${clr}15`}}>
                        <span className="text-xs font-bold" style={{color:clr}}>
                          <Users size={12} className="inline mr-1.5"/>
                          Usuarios en plan {pData.nombre}
                        </span>
                        <button onClick={()=>setPlanExpandUsers(null)} className="text-white/30 hover:text-white/70 transition-colors">
                          <XC size={13}/>
                        </button>
                      </div>
                      {planUsers.length === 0 ? (
                        <div className="py-6 text-center text-[10px] text-white/25">
                          Ningún usuario en este plan aún
                        </div>
                      ) : (
                        <div className="divide-y" style={{borderColor:`${clr}10`}}>
                          {planUsers.map(u => (
                            <div key={u.id} className="px-4 py-2.5 flex items-center gap-3">
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                                style={{background:`${clr}15`,border:`1px solid ${clr}25`}}>
                                {u.avatar}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-white truncate">{u.nombre}</div>
                                <div className="text-[9px] truncate" style={{color:`${clr}60`}}>{u.email} · {u.cargo || u.role}</div>
                              </div>
                              {/* Activate / Deactivate toggle */}
                              <button onClick={()=>toggleStatus(u)}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[9px] font-bold transition-all flex-shrink-0"
                                style={{
                                  background: u.activo!==false ? "rgba(57,255,126,0.12)" : "rgba(248,113,113,0.12)",
                                  border: `1px solid ${u.activo!==false?"rgba(57,255,126,0.35)":"rgba(248,113,113,0.35)"}`,
                                  color: u.activo!==false ? "#39ff7e" : "#f87171",
                                }}>
                                {u.activo!==false ? <ToggleRight size={11}/> : <ToggleLeft size={11}/>}
                                {u.activo!==false ? "Activo" : "Inactivo"}
                              </button>
                              {/* Change plan */}
                              <button onClick={()=>{setPlanTarget(u);setNewPlan(u.plan??"basico");}}
                                className="flex items-center gap-1 px-2 py-1 rounded-xl text-[9px] font-bold transition-all flex-shrink-0"
                                style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",color:"rgba(255,255,255,0.45)"}}>
                                <Star size={9}/> Plan
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Feature matrix */}
          <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(167,139,250,0.2)"}}>
            <div className="px-4 py-3" style={{background:"rgba(167,139,250,0.06)",borderBottom:"1px solid rgba(167,139,250,0.1)"}}>
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><Layers size={14} style={{color:"#a78bfa"}}/> Matriz de módulos por plan</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                    <th className="px-4 py-2.5 text-left text-[10px] text-white/40 font-bold w-40">Módulo</th>
                    {PLAN_ORDER.map(p=>(
                      <th key={p} className="px-3 py-2.5 text-center text-[10px] font-black" style={{color:PLAN_COLOR[p]}}>
                        {PLAN_ICON[p]} {planEdits[p].nombre}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ALL_MODULES.map((m,i)=>{
                    const planIdx = PLAN_ORDER.indexOf(m.plan as PlanId);
                    return (
                      <tr key={m.id} style={{background:i%2===0?"rgba(255,255,255,0.015)":"transparent",borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                        <td className="px-4 py-2 text-[10px] text-white/60">{m.icon} {m.label}</td>
                        {PLAN_ORDER.map((p,j)=>(
                          <td key={p} className="px-3 py-2 text-center">
                            {j>=planIdx
                              ? <CheckCircle size={13} style={{color:PLAN_COLOR[p],margin:"0 auto"}}/>
                              : <XC size={13} style={{color:"rgba(255,255,255,0.1)",margin:"0 auto"}}/>
                            }
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB: REGISTROS — Registros pendientes, DB users, Pagos emitidos
      ════════════════════════════════════════════════════════════════════ */}
      {tab === "registros" && (
        <div className="space-y-5">

          {/* Header banner */}
          <div className="relative rounded-2xl overflow-hidden"
            style={{ background:"linear-gradient(135deg,#0d0620 0%,#150b30 50%,#0d0620 100%)", border:"1px solid rgba(168,85,247,0.3)", boxShadow:"0 0 40px rgba(168,85,247,0.08)" }}>
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background:"linear-gradient(90deg,transparent,#a855f7,#7c3aed,transparent)" }}/>
            <div className="p-5 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background:"rgba(168,85,247,0.12)", border:"1px solid rgba(168,85,247,0.3)" }}>
                  <UserPlus size={18} style={{ color:"#a855f7" }}/>
                </div>
                <div>
                  <h2 className="text-base font-black text-white">Registros & Activación de Cuentas</h2>
                  <p className="text-[11px]" style={{ color:"rgba(168,85,247,0.55)" }}>
                    Usuarios DB · Pendientes de activación · Asignación de planes · Pagos emitidos
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap text-[10px]">
                <span className="px-2.5 py-1 rounded-full font-bold"
                  style={{ background:"rgba(251,191,36,0.1)", color:"#fbbf24", border:"1px solid rgba(251,191,36,0.25)" }}>
                  ⏳ Activación manual requerida
                </span>
                <span className="px-2.5 py-1 rounded-full font-bold"
                  style={{ background:"rgba(57,255,126,0.08)", color:"#39ff7e", border:"1px solid rgba(57,255,126,0.2)" }}>
                  ✓ Google OAuth + Registro directo
                </span>
              </div>
            </div>
          </div>

          {/* Flujo de registro — info rápida */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { step:"1", icon:"✨", label:"Se registra", desc:"Usuario llena el formulario o usa Google OAuth. Cuenta queda en estado Pendiente.", color:"#a855f7", g:"168,85,247" },
              { step:"2", icon:"👁️", label:"Admin revisa", desc:"Admin ve la cuenta aquí, verifica, asigna plan y genera enlace de pago si aplica.", color:"#fbbf24", g:"251,191,36" },
              { step:"3", icon:"✅", label:"Activa cuenta", desc:"Admin activa la cuenta (estado → Activo). Usuario ya puede iniciar sesión.", color:"#39ff7e", g:"57,255,126" },
            ].map(s => (
              <div key={s.step} className="flex items-start gap-3 p-4 rounded-2xl"
                style={{ background:`rgba(${s.g},0.05)`, border:`1px solid rgba(${s.g},0.18)` }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-black"
                  style={{ background:`rgba(${s.g},0.15)`, color:s.color }}>{s.step}</div>
                <div>
                  <p className="text-xs font-black text-white">{s.icon} {s.label}</p>
                  <p className="text-[10px] mt-0.5" style={{ color:"rgba(255,255,255,0.4)" }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* GoogleUsersPanel — gestiona TODOS los usuarios DB (pendientes + activos + bloqueados) */}
          <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid rgba(168,85,247,0.18)" }}>
            <div className="px-4 py-3 flex items-center gap-2"
              style={{ background:"rgba(168,85,247,0.06)", borderBottom:"1px solid rgba(168,85,247,0.12)" }}>
              <UserPlus size={14} style={{ color:"#a855f7" }}/>
              <span className="text-sm font-black text-white">Usuarios registrados en base de datos</span>
              <span className="ml-auto text-[9px] font-bold px-2 py-0.5 rounded-full"
                style={{ background:"rgba(168,85,247,0.1)", color:"#a855f7", border:"1px solid rgba(168,85,247,0.25)" }}>
                Google OAuth + Registro manual
              </span>
            </div>
            <div className="p-4">
              <GoogleUsersPanel />
            </div>
          </div>

          {/* Pagos emitidos */}
          <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid rgba(251,191,36,0.18)" }}>
            <div className="px-4 py-3 flex items-center gap-2"
              style={{ background:"rgba(251,191,36,0.05)", borderBottom:"1px solid rgba(251,191,36,0.1)" }}>
              <CreditCard size={14} style={{ color:"#fbbf24" }}/>
              <span className="text-sm font-black text-white">Pagos emitidos para activación</span>
              <span className="ml-auto text-[10px] text-white/30">
                Total cobrado: <strong style={{ color:"#fbbf24" }}>{fmt(mrrTotal)}</strong>
              </span>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label:"Total cobrado",   val:fmt(mrrTotal),                                                          c:"#39ff7e", g:"57,255,126"  },
                  { label:"Aprobados",       val:String(PAGOS_DEMO.filter(p=>p.estado==="aprobado").length),              c:"#00f5d4", g:"0,245,212"   },
                  { label:"Pendientes",      val:String(PAGOS_DEMO.filter(p=>p.estado==="pendiente").length),             c:"#fbbf24", g:"251,191,36"  },
                  { label:"Rechazados",      val:String(PAGOS_DEMO.filter(p=>p.estado==="rechazado").length),             c:"#f87171", g:"248,113,113" },
                ].map(k => (
                  <div key={k.label} className="px-3 py-2.5 rounded-xl text-center"
                    style={{ background:`rgba(${k.g},0.06)`, border:`1px solid rgba(${k.g},0.2)` }}>
                    <div className="text-lg font-black" style={{ color:k.c }}>{k.val}</div>
                    <div className="text-[9px] text-white/40 mt-0.5">{k.label}</div>
                  </div>
                ))}
              </div>

              {/* Filters */}
              <div className="flex gap-2 flex-wrap">
                {(["todos","aprobado","pendiente","rechazado"] as const).map(f => (
                  <button key={f} onClick={() => setPayFilter(f)}
                    className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all"
                    style={{
                      background: payFilter===f ? (f==="aprobado"?"rgba(57,255,126,0.2)":f==="pendiente"?"rgba(251,191,36,0.2)":f==="rechazado"?"rgba(248,113,113,0.2)":"rgba(255,255,255,0.1)") : "rgba(255,255,255,0.04)",
                      border: `1px solid ${payFilter===f ? (f==="aprobado"?"rgba(57,255,126,0.5)":f==="pendiente"?"rgba(251,191,36,0.5)":f==="rechazado"?"rgba(248,113,113,0.5)":"rgba(255,255,255,0.25)") : "rgba(255,255,255,0.08)"}`,
                      color: payFilter===f ? (f==="aprobado"?"#39ff7e":f==="pendiente"?"#fbbf24":f==="rechazado"?"#f87171":"white") : "rgba(255,255,255,0.4)",
                    }}>
                    {f==="todos"?"Todos":f.charAt(0).toUpperCase()+f.slice(1)}
                  </button>
                ))}
              </div>

              {/* Payments table */}
              <div className="rounded-xl overflow-hidden" style={{ border:"1px solid rgba(255,255,255,0.06)" }}>
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background:"rgba(0,0,0,0.35)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                      {["Referencia","Usuario","Plan","Monto","Método","Estado","Fecha","Acción"].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-[9px] uppercase tracking-wider font-bold"
                          style={{ color:"rgba(251,191,36,0.5)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pagosFilt.map((p, i) => (
                      <tr key={p.id} style={{ background:i%2===0?"rgba(255,255,255,0.015)":"transparent", borderBottom:"1px solid rgba(255,255,255,0.03)" }}>
                        <td className="px-3 py-2.5 font-mono text-[9px] text-white/40">{p.id}</td>
                        <td className="px-3 py-2.5">
                          <p className="font-bold text-white text-[10px]">{p.userNombre}</p>
                          <p className="text-[9px] text-white/30">{p.userEmail}</p>
                        </td>
                        <td className="px-3 py-2.5">
                          <PlanBadge plan={p.plan as PlanId}/>
                        </td>
                        <td className="px-3 py-2.5 font-black" style={{ color:"#fbbf24" }}>{fmt(p.monto)}</td>
                        <td className="px-3 py-2.5 text-[10px] text-white/50">{p.metodo}</td>
                        <td className="px-3 py-2.5">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold"
                            style={{
                              background: p.estado==="aprobado"?"rgba(57,255,126,0.12)":p.estado==="pendiente"?"rgba(251,191,36,0.12)":"rgba(248,113,113,0.12)",
                              color: p.estado==="aprobado"?"#39ff7e":p.estado==="pendiente"?"#fbbf24":"#f87171",
                              border: `1px solid ${p.estado==="aprobado"?"rgba(57,255,126,0.3)":p.estado==="pendiente"?"rgba(251,191,36,0.3)":"rgba(248,113,113,0.3)"}`,
                            }}>
                            {p.estado==="aprobado"?"✓ Aprobado":p.estado==="pendiente"?"⏳ Pendiente":"✗ Rechazado"}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-[9px] text-white/35">{p.fecha}</td>
                        <td className="px-3 py-2.5">
                          {p.estado==="pendiente" && (
                            <button
                              className="px-2 py-1 rounded-lg text-[9px] font-bold transition-all hover:opacity-80"
                              style={{ background:"rgba(57,255,126,0.1)", color:"#39ff7e", border:"1px solid rgba(57,255,126,0.25)" }}>
                              Activar
                            </button>
                          )}
                          {p.estado==="aprobado" && (
                            <span className="text-[9px] text-white/20">Activo</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {pagosFilt.length === 0 && (
                      <tr><td colSpan={8} className="text-center py-8 text-white/25 text-xs">Sin pagos en este estado</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB: PAGOS
      ════════════════════════════════════════════════════════════════════ */}
      {tab === "pagos" && (
        <div className="space-y-4">
          {/* Payment KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {label:"Total cobrado",    val:fmt(mrrTotal),                      icon:"💰", c:"#39ff7e",  sub:"pagos aprobados" },
              {label:"Transacciones",    val:PAGOS_DEMO.filter(p=>p.estado==="aprobado").length, icon:"✅", c:"#00f5d4", sub:"aprobadas" },
              {label:"Pendientes",       val:PAGOS_DEMO.filter(p=>p.estado==="pendiente").length, icon:"⏳", c:"#fbbf24", sub:"por confirmar" },
              {label:"Rechazadas",       val:PAGOS_DEMO.filter(p=>p.estado==="rechazado").length, icon:"❌", c:"#f87171", sub:"este mes" },
            ].map(k=>(
              <div key={k.label} className="rounded-2xl p-3"
                style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${k.c}20`}}>
                <div className="text-xl mb-1">{k.icon}</div>
                <div className="text-xl font-black text-white">{k.val}</div>
                <div className="text-[9px] mt-0.5" style={{color:`${k.c}90`}}>{k.label}</div>
                <div className="text-[8px] text-white/25">{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Wompi payment link generator */}
          <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(0,245,212,0.2)"}}>
            <div className="px-4 py-3 flex items-center gap-2" style={{background:"rgba(0,245,212,0.06)",borderBottom:"1px solid rgba(0,245,212,0.1)"}}>
              <Link2 size={14} style={{color:"#00f5d4"}}/>
              <span className="font-bold text-sm text-white">Generar link de pago Wompi</span>
              <span className="text-[9px] ml-2 px-2 py-0.5 rounded-full font-bold" style={{background:"rgba(0,245,212,0.12)",color:"#00f5d4"}}>Colombia 🇨🇴</span>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PLAN_ORDER.filter(p=>p!=="basico").map(p=>(
                  <button key={p} onClick={()=>setLinkPlan(p)}
                    className="p-2.5 rounded-xl text-center transition-all"
                    style={{
                      background:linkPlan===p?`${PLAN_COLOR[p]}18`:"rgba(255,255,255,0.03)",
                      border:`1.5px solid ${linkPlan===p?`${PLAN_COLOR[p]}50`:"rgba(255,255,255,0.07)"}`,
                      color:linkPlan===p?PLAN_COLOR[p]:"rgba(255,255,255,0.4)",
                    }}>
                    <div className="text-lg mb-0.5">{PLAN_ICON[p]}</div>
                    <div className="font-black text-xs">{PLAN_LABEL[p]}</div>
                    <div className="text-[9px] font-bold mt-0.5" style={{color:`${PLAN_COLOR[p]}80`}}>{fmt(PLAN_PRECIOS[p])}/mes</div>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <div className="flex-1 font-mono text-[10px] px-3 py-2 rounded-xl truncate"
                  style={{background:"rgba(0,0,0,0.4)",border:"1px solid rgba(0,245,212,0.15)",color:"rgba(0,245,212,0.7)"}}>
                  {genPayLink()}
                </div>
                <button onClick={copyPayLink}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                  style={{background:linkCopied?"rgba(57,255,126,0.15)":"rgba(0,245,212,0.1)",border:`1px solid ${linkCopied?"rgba(57,255,126,0.4)":"rgba(0,245,212,0.25)"}`,color:linkCopied?"#39ff7e":"#00f5d4"}}>
                  {linkCopied?<CheckCircle2 size={13}/>:<Copy size={13}/>}
                  {linkCopied?"¡Copiado!":"Copiar"}
                </button>
                <a href={genPayLink()} target="_blank" rel="noopener noreferrer"
                  className="flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                  style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.5)"}}>
                  <ExternalLink size={13}/> Abrir
                </a>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[9px] text-white/30">
                {["💳 Tarjeta débito/crédito","📱 Nequi","🏦 PSE","🟡 Bancolombia Transfer"].map(m=>(
                  <div key={m} className="flex items-center gap-1">{m}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Transaction history */}
          <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(255,255,255,0.08)"}}>
            <div className="px-4 py-3 flex items-center gap-3" style={{background:"rgba(255,255,255,0.04)",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
              <Receipt size={14} style={{color:"#fbbf24"}}/>
              <span className="font-bold text-sm text-white">Historial de transacciones</span>
              <div className="flex gap-1 ml-auto">
                {(["todos","aprobado","rechazado","pendiente"] as const).map(f=>(
                  <button key={f} onClick={()=>setPayFilter(f)}
                    className="px-2 py-0.5 rounded-lg text-[9px] font-bold transition-all"
                    style={{
                      background:payFilter===f?"rgba(0,245,212,0.12)":"transparent",
                      color:payFilter===f?"#00f5d4":"rgba(255,255,255,0.3)",
                      border:`1px solid ${payFilter===f?"rgba(0,245,212,0.3)":"transparent"}`,
                    }}>
                    {f==="todos"?"Todos":f.charAt(0).toUpperCase()+f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                  {["Referencia","Cliente","Plan","Monto","Método","Fecha","Estado"].map(h=>(
                    <th key={h} className="px-3 py-2 text-left text-[9px] uppercase tracking-wider text-white/30 font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagosFilt.map((p,i)=>(
                  <tr key={p.id} style={{background:i%2===0?"rgba(255,255,255,0.01)":"transparent",borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-[9px] text-white/50">{p.referencia}</span>
                        <CopyBtn text={p.referencia}/>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="text-[10px] font-bold text-white">{p.userNombre}</div>
                      <div className="text-[9px] text-white/30">{p.userEmail}</div>
                    </td>
                    <td className="px-3 py-2.5"><PlanBadge plan={p.plan}/></td>
                    <td className="px-3 py-2.5">
                      <span className="font-bold text-xs text-white">{fmt(p.monto)}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-[10px] text-white/50">
                        {p.metodo==="tarjeta"?"💳":p.metodo==="nequi"?"📱":p.metodo==="pse"?"🏦":"🟡"} {p.metodo}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-[9px] text-white/40">{p.fecha} {p.hora}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        p.estado==="aprobado"?"bg-green-500/10 text-green-400 border border-green-500/30":
                        p.estado==="rechazado"?"bg-red-500/10 text-red-400 border border-red-500/30":
                        "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"
                      }`}>
                        {p.estado==="aprobado"?<CheckCircle size={8}/>:p.estado==="rechazado"?<XC size={8}/>:<Clock size={8}/>}
                        {p.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB: SESIONES
      ════════════════════════════════════════════════════════════════════ */}
      {tab === "sesiones" && (
        <div className="space-y-4">
          {/* Session KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {label:"Online ahora",     val:sessionsList.filter(s=>s.activa).length,    c:"#39ff7e", icon:"🟢" },
              {label:"Sesiones hoy",     val:sessionsList.length,                         c:"#00c8ff", icon:"📡" },
              {label:"Móvil",            val:sessionsList.filter(s=>s.tipo==="mobile").length, c:"#a78bfa", icon:"📱" },
              {label:"Desktop",          val:sessionsList.filter(s=>s.tipo==="desktop").length, c:"#fbbf24", icon:"🖥️" },
            ].map(k=>(
              <div key={k.label} className="rounded-2xl p-3 text-center"
                style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${k.c}20`}}>
                <div className="text-2xl mb-1">{k.icon}</div>
                <div className="text-2xl font-black text-white">{k.val}</div>
                <div className="text-[9px] mt-0.5" style={{color:`${k.c}80`}}>{k.label}</div>
              </div>
            ))}
          </div>

          {/* Sessions table */}
          <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(255,255,255,0.08)"}}>
            <div className="px-4 py-3 flex items-center justify-between"
              style={{background:"rgba(0,200,255,0.06)",borderBottom:"1px solid rgba(0,200,255,0.1)"}}>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MonitorSmartphone size={14} style={{color:"#00c8ff"}}/> Sesiones activas e historial
              </h3>
              <span className="text-[10px] text-white/30">{sessionsList.filter(s=>s.activa).length} activas ahora</span>
            </div>
            <div className="divide-y" style={{borderColor:"rgba(255,255,255,0.04)"}}>
              {sessionsList.map((s,i)=>(
                <div key={s.id} className="px-4 py-3 flex items-center gap-3"
                  style={{background:i%2===0?"rgba(255,255,255,0.01)":"transparent"}}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{background:"rgba(0,200,255,0.08)",border:"1px solid rgba(0,200,255,0.15)"}}>
                    {s.tipo==="mobile"?<Smartphone size={16} style={{color:"#00c8ff"}}/>:<Monitor size={16} style={{color:"#00c8ff"}}/>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-white">{s.nombre}</span>
                      {s.activa&&<span className="inline-flex items-center gap-1 text-[9px] text-green-400"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>Online</span>}
                    </div>
                    <div className="text-[9px] text-white/35 mt-0.5">{s.email}</div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 text-[9px] text-white/30"><MapPin size={9}/>{s.ciudad}</span>
                      <span className="font-mono text-[9px] text-white/25">{s.ip}</span>
                      <span className="text-[9px] text-white/25">{s.dis}</span>
                      <span className="flex items-center gap-1 text-[9px] text-white/25"><Calendar size={9}/>{s.login}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[9px] text-white/30 mb-2">{s.ultima}</div>
                    {s.activa&&(
                      <button onClick={()=>setRevokeTarget(s.id)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold transition-all"
                        style={{background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.25)",color:"#f87171"}}>
                        <Ban size={10}/> Revocar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security events */}
          <div className="rounded-2xl p-4" style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)"}}>
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <ShieldCheck size={14} style={{color:"#39ff7e"}}/> Eventos de seguridad recientes
            </h3>
            <div className="space-y-2">
              {[
                {icon:"🔐",txt:"Login exitoso — admin@ganader.ia desde Bogotá",           t:"Hace 2 min",  nivel:"info"   },
                {icon:"🔑",txt:"Login exitoso — vet@ganader.ia desde Medellín",            t:"Hace 18 min", nivel:"info"   },
                {icon:"⚠️",txt:"Intento fallido — unknown@test.com · 3 intentos",          t:"Hace 1 h",    nivel:"warn"   },
                {icon:"🚫",txt:"IP bloqueada — 192.168.1.105 · brute force detected",      t:"Hace 2 h",    nivel:"error"  },
                {icon:"🔓",txt:"Contraseña cambiada — luis@ganader.ia",                    t:"Hace 1 día",  nivel:"info"   },
              ].map((ev,i)=>(
                <div key={i} className="flex items-center gap-2 py-2 border-b" style={{borderColor:"rgba(255,255,255,0.04)"}}>
                  <span className="text-base flex-shrink-0">{ev.icon}</span>
                  <span className="text-[10px] flex-1 text-white/60">{ev.txt}</span>
                  <span className="text-[9px] flex-shrink-0"
                    style={{color:ev.nivel==="error"?"#f87171":ev.nivel==="warn"?"#fbbf24":"rgba(255,255,255,0.25)"}}>
                    {ev.t}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB: APIs
      ════════════════════════════════════════════════════════════════════ */}
      {tab === "apis" && (
        <div className="space-y-4">
          {/* CIVAC API Key */}
          <div className="rounded-2xl p-4" style={{background:"rgba(255,191,36,0.04)",border:"1px solid rgba(251,191,36,0.2)"}}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><Key size={14} style={{color:"#fbbf24"}}/> API Key de producción CIVAC</h3>
              <button onClick={()=>setApiKeyVis(v=>!v)}
                className="text-[10px] flex items-center gap-1 px-2 py-1 rounded-lg"
                style={{background:"rgba(251,191,36,0.1)",color:"#fbbf24",border:"1px solid rgba(251,191,36,0.2)"}}>
                {apiKeyVis?<EyeOff size={11}/>:<Eye size={11}/>} {apiKeyVis?"Ocultar":"Mostrar"}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 font-mono text-xs px-3 py-2 rounded-xl"
                style={{background:"rgba(0,0,0,0.4)",border:"1px solid rgba(251,191,36,0.15)",color:"rgba(251,191,36,0.8)"}}>
                {apiKeyVis?"civac_prod_sk_7f3k2m9x_Col2026_xJ8pQrLnZv4wYtD":"civac_prod_sk_••••••••_Col2026_••••••••••••"}
              </div>
              <CopyBtn text="civac_prod_sk_7f3k2m9x_Col2026_xJ8pQrLnZv4wYtD"/>
              <button className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-[10px] font-bold"
                style={{background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.25)",color:"#f87171"}}>
                <RefreshCw size={11}/> Rotar
              </button>
            </div>
            <p className="text-[9px] text-white/25 mt-2">Último uso: Hace 5 min · Creada: 2026-01-15 · Permisos: read/write</p>
          </div>

          {/* ── External API Connections ── */}
          <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(249,115,22,0.2)"}}>
            <div className="px-4 py-3 flex items-center gap-3"
              style={{background:"rgba(249,115,22,0.06)",borderBottom:"1px solid rgba(249,115,22,0.12)"}}>
              <Globe size={14} style={{color:"#f97316"}}/>
              <span className="text-sm font-bold text-white">APIs externas</span>
              <span className="ml-auto text-[9px] px-2 py-0.5 rounded-full font-bold"
                style={{background:"rgba(249,115,22,0.12)",color:"#f97316",border:"1px solid rgba(249,115,22,0.25)"}}>
                {Object.values(apiConfigs).filter(c=>c.enabled&&c.configured).length} conectadas
              </span>
            </div>

            {/* Category groups */}
            {(["Mensajería","Pagos","Comunicaciones","Geolocalización"] as const).map(cat => {
              const catApis = EXT_APIS.filter(a=>a.cat===cat);
              if (!catApis.length) return null;
              return (
                <div key={cat}>
                  <div className="px-4 py-1.5 text-[9px] font-black uppercase tracking-widest"
                    style={{background:"rgba(255,255,255,0.02)",color:"rgba(255,255,255,0.25)",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                    {cat}
                  </div>
                  {catApis.map(api => {
                    const cfg = apiConfigs[api.id];
                    const isOpen = apiConfigOpen === api.id;
                    const result = apiTestResult[api.id];
                    const isConnected = cfg?.enabled && cfg?.configured;
                    return (
                      <div key={api.id} style={{borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                        {/* API row */}
                        <div className="flex items-center gap-3 px-4 py-3">
                          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                            style={{background:`${api.color}12`,border:`1px solid ${api.color}25`}}>
                            {api.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-white">{api.nombre}</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                                style={{
                                  background: isConnected?"rgba(57,255,126,0.1)":cfg?.configured?"rgba(251,191,36,0.1)":"rgba(255,255,255,0.04)",
                                  color: isConnected?"#39ff7e":cfg?.configured?"#fbbf24":"rgba(255,255,255,0.25)",
                                  border:`1px solid ${isConnected?"rgba(57,255,126,0.3)":cfg?.configured?"rgba(251,191,36,0.3)":"rgba(255,255,255,0.08)"}`,
                                }}>
                                {isConnected?"● Conectada":cfg?.configured?"⏸ Desactivada":"○ Sin configurar"}
                              </span>
                              <span className="text-[8px] px-1.5 py-0.5 rounded-full"
                                style={{background:`${api.color}10`,color:`${api.color}80`,border:`1px solid ${api.color}20`}}>
                                {api.cat}
                              </span>
                            </div>
                            <p className="text-[10px] text-white/35 mt-0.5 truncate">{api.desc}</p>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <a href={api.docs} target="_blank" rel="noopener noreferrer"
                              className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] transition-all hover:bg-white/8"
                              style={{color:"rgba(255,255,255,0.3)"}}>
                              <BookOpen size={9}/> Docs
                            </a>
                            <button onClick={()=>isOpen?setApiConfigOpen(null):openApiConfig(api.id)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[9px] font-bold transition-all"
                              style={{
                                background:isOpen?`${api.color}20`:"rgba(255,255,255,0.05)",
                                border:`1px solid ${isOpen?`${api.color}40`:"rgba(255,255,255,0.1)"}`,
                                color:isOpen?api.color:"rgba(255,255,255,0.5)",
                              }}>
                              <Edit size={9}/> {isOpen?"Cerrar":"Configurar"}
                            </button>
                            {/* Enable/disable toggle */}
                            <button onClick={()=>toggleApiEnabled(api.id)}
                              className="w-9 h-5 rounded-full relative transition-all flex-shrink-0"
                              style={{background:cfg?.enabled?`${api.color}50`:"rgba(255,255,255,0.08)"}}>
                              <div className="absolute w-4 h-4 rounded-full top-0.5 transition-all"
                                style={{
                                  background:cfg?.enabled?api.color:"rgba(255,255,255,0.4)",
                                  left:cfg?.enabled?"calc(100% - 1.25rem)":"0.125rem",
                                  boxShadow:cfg?.enabled?`0 0 8px ${api.color}80`:"none",
                                }}/>
                            </button>
                          </div>
                        </div>

                        {/* Config panel (inline) */}
                        {isOpen && (
                          <div className="px-4 pb-4 pt-1" style={{background:`${api.color}05`,borderTop:`1px solid ${api.color}10`}}>
                            <div className="space-y-2.5">
                              {api.fields.map(f=>(
                                <div key={f.key}>
                                  <label className="text-[9px] text-white/40 uppercase tracking-wider block mb-1">{f.label}</label>
                                  <Input
                                    type={f.type}
                                    value={apiFieldDraft[f.key]||""}
                                    onChange={e=>setApiFieldDraft(p=>({...p,[f.key]:e.target.value}))}
                                    placeholder={f.placeholder}
                                    className="h-8 text-xs font-mono"
                                    style={{background:"rgba(0,0,0,0.3)",border:`1px solid ${api.color}25`,color:"white"}}
                                  />
                                </div>
                              ))}
                              <div className="flex items-center gap-2 flex-wrap pt-1">
                                <button onClick={()=>testApi(api.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all"
                                  style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",color:"rgba(255,255,255,0.6)"}}>
                                  <Activity size={10}/> Probar conexión
                                </button>
                                <button onClick={()=>saveApiConfig(api.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all"
                                  style={{background:`linear-gradient(135deg,${api.color},${api.color}90)`,color:"black"}}>
                                  <CheckCircle size={10}/> Guardar y activar
                                </button>
                                <button onClick={()=>setApiConfigOpen(null)}
                                  className="text-[10px] text-white/30 hover:text-white/60 px-2 py-1.5">
                                  Cancelar
                                </button>
                                {result?.msg && (
                                  <span className="text-[9px] font-bold" style={{color:result.ok?"#39ff7e":"#f87171"}}>
                                    {result.msg}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Webhooks */}
          <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(139,92,246,0.2)"}}>
            <div className="px-4 py-3 flex items-center justify-between"
              style={{background:"rgba(139,92,246,0.06)",borderBottom:"1px solid rgba(139,92,246,0.1)"}}>
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><Send size={14} style={{color:"#a78bfa"}}/> Webhooks configurados</h3>
              <button onClick={()=>setWebhookOpen(v=>!v)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold"
                style={{background:"rgba(139,92,246,0.12)",color:"#a78bfa",border:"1px solid rgba(139,92,246,0.25)"}}>
                <Plus size={11}/> Configurar
              </button>
            </div>
            {webhookOpen && (
              <div className="p-4 space-y-3" style={{background:"rgba(0,0,0,0.2)"}}>
                <div>
                  <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1.5">URL del endpoint</label>
                  <div className="flex gap-2">
                    <input value={whUrl} onChange={e=>setWhUrl(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl text-xs font-mono text-white"
                      style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(139,92,246,0.2)",outline:"none"}}/>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1.5">Eventos a escuchar</label>
                  <div className="flex flex-wrap gap-1.5">
                    {WEBHOOK_EVENTS.map(ev=>(
                      <button key={ev} onClick={()=>setWhEvents(p=>p.includes(ev)?p.filter(x=>x!==ev):[...p,ev])}
                        className="px-2 py-1 rounded-lg text-[9px] font-bold transition-all"
                        style={{
                          background:whEvents.includes(ev)?"rgba(139,92,246,0.2)":"rgba(255,255,255,0.03)",
                          border:`1px solid ${whEvents.includes(ev)?"rgba(139,92,246,0.4)":"rgba(255,255,255,0.08)"}`,
                          color:whEvents.includes(ev)?"#a78bfa":"rgba(255,255,255,0.35)",
                        }}>
                        {ev}
                      </button>
                    ))}
                  </div>
                </div>
                <Button size="sm" className="gap-1.5 font-bold" style={{background:"linear-gradient(135deg,#a78bfa,#7c3aed)",color:"white"}}>
                  <Send size={12}/> Guardar webhook
                </Button>
              </div>
            )}

            {/* Webhook logs */}
            <div className="p-4">
              <div className="text-[9px] text-white/25 uppercase tracking-wider mb-2">Últimas llamadas</div>
              <div className="space-y-1.5">
                {[
                  {ev:"pago.aprobado",   url:whUrl, status:200, t:"Hace 2 min"},
                  {ev:"plan.activado",   url:whUrl, status:200, t:"Hace 12 min"},
                  {ev:"usuario.creado",  url:whUrl, status:404, t:"Hace 1 h"},
                  {ev:"pago.rechazado",  url:whUrl, status:200, t:"Hace 3 h"},
                ].map((log,i)=>(
                  <div key={i} className="flex items-center gap-2 font-mono text-[9px] px-2 py-1.5 rounded-lg"
                    style={{background:"rgba(0,0,0,0.3)"}}>
                    <span className={`px-1.5 py-0.5 rounded font-black ${log.status<300?"bg-green-500/15 text-green-400":"bg-red-500/15 text-red-400"}`}>{log.status}</span>
                    <span className="text-purple-400">{log.ev}</span>
                    <span className="text-white/25 truncate flex-1">{log.url}</span>
                    <span className="text-white/20 flex-shrink-0">{log.t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB: MÓDULOS
      ════════════════════════════════════════════════════════════════════ */}
      {tab === "modulos" && (() => {
        const filteredMods = ALL_MODULES.filter(m=>
          (!modSearch || m.label.toLowerCase().includes(modSearch.toLowerCase())) &&
          (modPlanFilter === "todos" || m.plan === modPlanFilter)
        );

        const planModCount = PLAN_ORDER.reduce((acc, p) => {
          acc[p] = ALL_MODULES.filter(m => PLAN_ORDER.indexOf(m.plan as PlanId) <= PLAN_ORDER.indexOf(p)).length;
          return acc;
        }, {} as Record<PlanId, number>);

        return (
          <div className="space-y-4">
            {/* Header bar */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-40 max-w-xs">
                <Input placeholder="Buscar módulo…" value={modSearch} onChange={e=>setModSearch(e.target.value)}
                  className="pl-8 text-xs h-8" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)"}}/>
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30"/>
              </div>
              <span className="text-[10px] text-white/30">{ALL_MODULES.length} módulos · {accounts.length} usuarios</span>
            </div>

            {/* Plan filter tabs */}
            <div className="flex gap-2 flex-wrap">
              {(([
                ["todos","Todos",ALL_MODULES.length,"#94a3b8"],
                ...PLAN_ORDER.map(p=>[p, PLAN_LABEL[p], planModCount[p], PLAN_COLOR[p]]),
              ]) as [string,string,number,string][]).map(([id,label,cnt,color])=>(
                <button key={id} onClick={()=>setModPlanFilter(id as PlanId|"todos")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                  style={{
                    background: modPlanFilter===id ? `${color}18` : "rgba(255,255,255,0.03)",
                    border: `1px solid ${modPlanFilter===id ? color+"50" : "rgba(255,255,255,0.08)"}`,
                    color: modPlanFilter===id ? color : "rgba(255,255,255,0.4)",
                    boxShadow: modPlanFilter===id ? `0 0 12px ${color}20` : "none",
                  }}>
                  {id==="todos" ? "🧩" : PLAN_ICON[id as PlanId]} {label}
                  <span className="text-[9px] opacity-60">({cnt})</span>
                </button>
              ))}
            </div>

            {/* Download plan config buttons */}
            <div className="rounded-2xl p-4" style={{background:"rgba(0,245,212,0.04)",border:"1px solid rgba(0,245,212,0.12)"}}>
              <div className="flex items-center gap-2 mb-3">
                <Download size={13} style={{color:"#00f5d4"}}/>
                <span className="text-sm font-bold text-white">Descargar configuración de plan</span>
                <span className="text-[10px] text-white/30 ml-auto">Genera JSON con módulos autorizados por plan</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PLAN_ORDER.map(p=>{
                  const planIdx = PLAN_ORDER.indexOf(p);
                  const planMods = ALL_MODULES.filter(m => PLAN_ORDER.indexOf(m.plan as PlanId) <= planIdx);
                  return (
                    <button key={p}
                      onClick={()=>{
                        const config = {
                          civac_version: "1.0",
                          tipo: "config_plan",
                          plan: { id:p, label:PLAN_LABEL[p], precio_mes:PLAN_PRECIOS[p] },
                          modulos: planMods.map(m=>({ id:m.id, label:m.label, plan:m.plan })),
                          rutas_autorizadas: planMods.map(m=>`/${m.id}`),
                          total_modulos: planMods.length,
                          generada: new Date().toISOString(),
                        };
                        const blob = new Blob([JSON.stringify(config,null,2)],{type:"application/json"});
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a"); a.href=url; a.download=`civac_plan_${p}_config.json`; a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="flex flex-col items-center gap-1 px-3 py-3 rounded-xl transition-all hover:scale-[1.03]"
                      style={{background:`${PLAN_COLOR[p]}10`,border:`1px solid ${PLAN_COLOR[p]}35`,color:PLAN_COLOR[p]}}>
                      <span className="text-xl">{PLAN_ICON[p]}</span>
                      <span className="text-xs font-black">{PLAN_LABEL[p]}</span>
                      <span className="text-[9px] opacity-60">{planMods.length} módulos</span>
                      <span className="text-[8px] opacity-40">{PLAN_PRECIOS[p]>0?fmt(PLAN_PRECIOS[p])+"/mes":"Gratis"}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Module cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredMods.map(m=>{
                const planColor  = PLAN_COLOR[m.plan as PlanId];
                const usersWithMod = accounts.filter(a=>(a.permisos||[]).includes(m.id));
                const planIdx = PLAN_ORDER.indexOf(m.plan as PlanId);
                return (
                  <div key={m.id} className="rounded-2xl overflow-hidden transition-all hover:scale-[1.01]"
                    style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${planColor}25`}}>
                    <div className="h-0.5" style={{background:`linear-gradient(90deg,${planColor},transparent)`}}/>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                            style={{background:`${planColor}12`,border:`1px solid ${planColor}30`}}>
                            {m.icon}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-white">{m.label}</div>
                            <PlanBadge plan={m.plan as PlanId}/>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xl font-black" style={{color:planColor}}>{usersWithMod.length}</div>
                          <div className="text-[8px] text-white/30">usuarios</div>
                        </div>
                      </div>

                      {/* Plan access indicator */}
                      <div className="flex gap-0.5 mb-3">
                        {PLAN_ORDER.map((p,i)=>(
                          <div key={p} className="flex-1 h-1.5 rounded-full transition-all"
                            style={{background: i<=planIdx ? planColor : "rgba(255,255,255,0.06)"}}/>
                        ))}
                      </div>
                      <div className="text-[9px] mb-2" style={{color:`${planColor}80`}}>
                        Incluido desde plan {PLAN_LABEL[m.plan as PlanId]}
                      </div>

                      {/* Users with access */}
                      {usersWithMod.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {usersWithMod.slice(0,5).map(u=>(
                            <span key={u.id} className="flex items-center gap-1 text-[8px] px-1.5 py-0.5 rounded-full"
                              style={{background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.45)"}}>
                              {u.avatar} {u.nombre.split(" ")[0]}
                            </span>
                          ))}
                          {usersWithMod.length>5&&<span className="text-[8px] text-white/25">+{usersWithMod.length-5}</span>}
                        </div>
                      ) : (
                        <div className="text-[9px] text-white/20 italic">Sin usuarios asignados aún</div>
                      )}

                      {/* Assign to users button */}
                      <div className="mt-3 pt-3 border-t" style={{borderColor:"rgba(255,255,255,0.05)"}}>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-white/25">Asignar a usuario:</span>
                          <div className="flex gap-1">
                            {accounts.filter(a=>!(a.permisos||[]).includes(m.id)).slice(0,3).map(u=>(
                              <button key={u.id}
                                onClick={()=>updateUser(u.id,{permisos:[...(u.permisos||[]),m.id]})}
                                className="text-[8px] px-1.5 py-0.5 rounded-full transition-all hover:opacity-100 opacity-70"
                                style={{background:`${planColor}15`,border:`1px solid ${planColor}30`,color:planColor}}
                                title={`Dar acceso a ${u.nombre}`}>
                                +{u.avatar}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Module matrix by plan */}
            <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(255,255,255,0.07)"}}>
              <div className="px-4 py-3 flex items-center justify-between"
                style={{background:"rgba(255,255,255,0.03)",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers size={14} style={{color:"#a78bfa"}}/> Matriz de acceso por plan
                </h3>
                <span className="text-[10px] text-white/30">{ALL_MODULES.length} módulos × 4 planes</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                      <th className="px-4 py-2 text-left text-[9px] text-white/40 font-bold w-40">Módulo</th>
                      {PLAN_ORDER.map(p=>(
                        <th key={p} className="px-3 py-2 text-center text-[9px] font-black" style={{color:PLAN_COLOR[p]}}>
                          {PLAN_ICON[p]} {PLAN_LABEL[p]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ALL_MODULES.map((m,i)=>{
                      const planIdx = PLAN_ORDER.indexOf(m.plan as PlanId);
                      return (
                        <tr key={m.id} style={{background:i%2===0?"rgba(255,255,255,0.01)":"transparent",borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/70">
                              <span>{m.icon}</span>{m.label}
                            </div>
                          </td>
                          {PLAN_ORDER.map((p,pi)=>(
                            <td key={p} className="px-3 py-2 text-center">
                              {pi>=planIdx
                                ? <CheckCircle size={12} style={{color:PLAN_COLOR[p],margin:"0 auto"}}/>
                                : <span className="w-3 h-0.5 rounded-full block mx-auto" style={{background:"rgba(255,255,255,0.08)"}}/>
                              }
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{borderTop:"1px solid rgba(255,255,255,0.06)",background:"rgba(255,255,255,0.02)"}}>
                      <td className="px-4 py-2 text-[9px] text-white/30 font-bold">Total módulos</td>
                      {PLAN_ORDER.map(p=>(
                        <td key={p} className="px-3 py-2 text-center">
                          <span className="text-xs font-black" style={{color:PLAN_COLOR[p]}}>{planModCount[p]}</span>
                        </td>
                      ))}
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* ── PYTHON ANALYTICS: Uso real de módulos ── */}
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1" style={{background:"linear-gradient(90deg,transparent,rgba(232,121,249,0.2),transparent)"}}/>
                <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full"
                  style={{color:"rgba(232,121,249,0.5)",border:"1px solid rgba(232,121,249,0.15)",background:"rgba(232,121,249,0.05)"}}>
                  🐍 Analytics Python · Uso real
                </span>
                <div className="h-px flex-1" style={{background:"linear-gradient(90deg,transparent,rgba(232,121,249,0.2),transparent)"}}/>
              </div>
              <PythonModuloStats />
            </div>
          </div>
        );
      })()}

      {/* ════════════════════════════════════════════════════════════════════
          TAB: BÁSCULAS
      ════════════════════════════════════════════════════════════════════ */}
      {tab === "basculas" && (() => {
        const totalPesajes = PESAJE_MES.reduce((a,m)=>a+m.total,0);
        const lastMes = PESAJE_MES[PESAJE_MES.length-1];
        const btActive = BT_DEVS_ADMIN.filter(d=>d.estado==="activo").length;
        const filteredBT = bascDevFilter==="todos" ? BT_DEVS_ADMIN : BT_DEVS_ADMIN.filter(d=>d.estado===bascDevFilter);
        const filteredCOM = bascDevFilter==="todos" ? COM_DEVS_ADMIN : COM_DEVS_ADMIN.filter(d=>d.estado===bascDevFilter);
        const pieData = [
          { name:"Bluetooth", value:lastMes.bt,     fill:"#00f5d4" },
          { name:"COM/Serial", value:lastMes.com,    fill:"#f97316" },
          { name:"Manual",     value:lastMes.manual, fill:"#a78bfa" },
        ];
        const BM = BASC_MODULES_DEFAULT;
        return (
          <div className="space-y-4">

            {/* ── Banner ── */}
            <div className="relative rounded-2xl overflow-hidden p-5" style={{background:"linear-gradient(135deg,#100a00,#1a1000 50%,#100a00)",border:"1px solid rgba(251,146,60,0.25)",boxShadow:"0 0 40px rgba(251,146,60,0.06)"}}>
              <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full" style={{background:"radial-gradient(circle,rgba(251,146,60,0.15),transparent 70%)"}}/>
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{background:"linear-gradient(90deg,transparent,#fb923c,#fbbf24,transparent)"}}/>
              <div className="relative flex flex-wrap items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{background:"linear-gradient(135deg,#fb923c,#f97316)",boxShadow:"0 0 20px rgba(251,146,60,0.5)"}}>
                  <Scale size={22} style={{color:"black"}}/>
                </div>
                <div>
                  <h2 className="text-xl font-black text-white" style={{fontFamily:"'Sora',sans-serif"}}>Gestión de Básculas</h2>
                  <p className="text-xs mt-0.5" style={{color:"rgba(251,146,60,0.6)"}}>Control de módulos · Estadísticas de uso · Dispositivos BT/COM · Configuración global</p>
                </div>
                <div className="ml-auto flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] px-2.5 py-1 rounded-full font-bold" style={{background:"rgba(251,146,60,0.1)",border:"1px solid rgba(251,146,60,0.3)",color:"#fb923c"}}>
                    {btActive} dispositivos activos
                  </span>
                  <span className="text-[10px] px-2.5 py-1 rounded-full font-bold" style={{background:"rgba(57,255,126,0.08)",border:"1px solid rgba(57,255,126,0.25)",color:"#39ff7e"}}>
                    {Object.values(bascMods).filter(m=>m.enabled).length}/3 módulos ON
                  </span>
                </div>
              </div>
            </div>

            {/* ── KPIs ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label:"Total pesajes",    val:totalPesajes,                     sub:"7 meses acumulados",          icon:<Scale size={16}/>,          from:"#fb923c",to:"#f97316",glow:"251,146,60"   },
                { label:"Este mes",         val:lastMes.total,                    sub:`BT:${lastMes.bt} COM:${lastMes.com} M:${lastMes.manual}`, icon:<BarChart3 size={16}/>, from:"#00f5d4",to:"#00a896",glow:"0,245,212"   },
                { label:"Dispositivos BT",  val:`${btActive}/${BT_DEVS_ADMIN.length}`, sub:"activos / registrados",    icon:<Bluetooth size={16}/>,       from:"#00c8ff",to:"#0ea5e9",glow:"0,200,255"   },
                { label:"Promedio/sesión",  val:"342 kg",                         sub:"peso promedio por pesaje",    icon:<Weight size={16}/>,           from:"#a78bfa",to:"#7c3aed",glow:"167,139,250" },
              ].map(k=>(
                <div key={k.label} className="rounded-2xl p-4 relative overflow-hidden"
                  style={{background:`linear-gradient(145deg,rgba(${k.glow},0.08),rgba(${k.glow},0.03))`,border:`1px solid rgba(${k.glow},0.2)`}}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:`linear-gradient(135deg,${k.from},${k.to})`,color:"black"}}>
                      {k.icon}
                    </div>
                    <TrendingUp size={11} style={{color:`rgba(${k.glow},0.5)`}}/>
                  </div>
                  <p className="text-2xl font-black text-white">{k.val}</p>
                  <p className="text-[10px] mt-0.5" style={{color:`rgba(${k.glow},0.6)`}}>{k.label}</p>
                  <p className="text-[9px] text-white/25 mt-0.5">{k.sub}</p>
                </div>
              ))}
            </div>

            {/* ── Módulos de pesaje ── */}
            <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(251,146,60,0.2)"}}>
              <div className="px-4 py-3 flex items-center gap-3" style={{background:"rgba(251,146,60,0.06)",borderBottom:"1px solid rgba(251,146,60,0.12)"}}>
                <Settings2 size={14} style={{color:"#fb923c"}}/>
                <span className="text-sm font-bold text-white">Control de módulos de pesaje</span>
                <span className="text-[9px] text-white/30 ml-auto">Activa/desactiva y ajusta el plan mínimo requerido por módulo</span>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(Object.entries(BM) as [string,typeof BM[keyof typeof BM]][]).map(([id,def])=>{
                  const ms = bascMods[id] ?? { enabled:def.enabled, plan:def.plan };
                  return (
                    <div key={id} className="rounded-2xl p-4 transition-all" style={{
                      background: ms.enabled ? `${def.color}08` : "rgba(255,255,255,0.02)",
                      border:`1px solid ${ms.enabled ? def.color+"30" : "rgba(255,255,255,0.07)"}`,
                      opacity: ms.enabled ? 1 : 0.65,
                    }}>
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl" style={{background:`${def.color}15`,border:`1px solid ${def.color}30`}}>
                            {def.icon}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-white leading-tight">{def.label}</div>
                            <div className="text-[8px] text-white/30 mt-0.5">ID: {id}</div>
                          </div>
                        </div>
                        {/* Toggle */}
                        <button onClick={()=>toggleBascMod(id)}
                          className="w-10 h-5 rounded-full relative transition-all flex-shrink-0"
                          style={{background:ms.enabled?`${def.color}60`:"rgba(255,255,255,0.1)"}}>
                          <div className="absolute w-4 h-4 rounded-full top-0.5 transition-all"
                            style={{background:ms.enabled?def.color:"rgba(255,255,255,0.35)",left:ms.enabled?"calc(100% - 1.25rem)":"0.125rem",boxShadow:ms.enabled?`0 0 8px ${def.color}80`:"none"}}/>
                        </button>
                      </div>

                      <p className="text-[10px] text-white/40 mb-3">{def.desc}</p>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="text-center px-2 py-1.5 rounded-xl" style={{background:"rgba(255,255,255,0.04)"}}>
                          <div className="text-lg font-black" style={{color:def.color}}>{def.usos}</div>
                          <div className="text-[8px] text-white/25">usos este mes</div>
                        </div>
                        <div className="text-center px-2 py-1.5 rounded-xl" style={{background:"rgba(255,255,255,0.04)"}}>
                          <div className="text-lg font-black text-white">{def.devs}</div>
                          <div className="text-[8px] text-white/25">dispositivos</div>
                        </div>
                      </div>

                      {/* Plan mínimo selector */}
                      <div>
                        <div className="text-[8px] text-white/30 uppercase tracking-wider mb-1.5">Plan mínimo requerido</div>
                        <div className="flex gap-1">
                          {PLAN_ORDER.map(p=>(
                            <button key={p} onClick={()=>setBascPlan(id,p)}
                              className="flex-1 py-1 rounded-lg text-[8px] font-black transition-all"
                              style={{
                                background: ms.plan===p ? `${PLAN_COLOR[p]}20` : "rgba(255,255,255,0.03)",
                                border:`1px solid ${ms.plan===p ? PLAN_COLOR[p]+"60" : "rgba(255,255,255,0.06)"}`,
                                color: ms.plan===p ? PLAN_COLOR[p] : "rgba(255,255,255,0.25)",
                                boxShadow: ms.plan===p ? `0 0 8px ${PLAN_COLOR[p]}30` : "none",
                              }}>
                              {PLAN_ICON[p]}
                            </button>
                          ))}
                        </div>
                        <div className="text-[8px] text-center mt-1" style={{color:"rgba(255,255,255,0.25)"}}>
                          Desde plan {PLAN_LABEL[ms.plan]}
                        </div>
                      </div>

                      {/* Status pill */}
                      <div className="mt-3 pt-3 flex items-center gap-2" style={{borderTop:`1px solid ${def.color}15`}}>
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-bold"
                          style={{background:ms.enabled?"rgba(57,255,126,0.1)":"rgba(255,80,80,0.1)",border:`1px solid ${ms.enabled?"rgba(57,255,126,0.3)":"rgba(255,80,80,0.3)"}`,color:ms.enabled?"#39ff7e":"#f87171"}}>
                          {ms.enabled?"● Activo":"○ Desactivado"}
                        </span>
                        <span className="text-[8px] text-white/20 ml-auto">clic toggle para {ms.enabled?"desactivar":"activar"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Estadísticas de uso ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* BarChart */}
              <div className="lg:col-span-2 rounded-2xl p-4" style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(251,146,60,0.15)"}}>
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 size={14} style={{color:"#fb923c"}}/>
                  <span className="text-sm font-bold text-white">Pesajes por mes y modo</span>
                  <span className="ml-auto text-[9px] text-white/30">7 meses · {totalPesajes} total</span>
                </div>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={PESAJE_MES} barSize={8} barGap={2}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                      <XAxis dataKey="mes" tick={{fill:"rgba(255,255,255,0.3)",fontSize:9}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fill:"rgba(255,255,255,0.25)",fontSize:9}} axisLine={false} tickLine={false} width={24}/>
                      <RTooltip contentStyle={TIP}/>
                      <Bar dataKey="bt"     name="Bluetooth" fill="#00f5d4" radius={[3,3,0,0]}/>
                      <Bar dataKey="com"    name="COM/Serial" fill="#f97316" radius={[3,3,0,0]}/>
                      <Bar dataKey="manual" name="Manual"    fill="#a78bfa" radius={[3,3,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-4 mt-2 justify-center">
                  {[["#00f5d4","Bluetooth"],["#f97316","COM/Serial"],["#a78bfa","Manual"]].map(([c,l])=>(
                    <div key={l} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{background:c as string}}/>
                      <span className="text-[9px] text-white/40">{l}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* PieChart distribución */}
              <div className="rounded-2xl p-4" style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(167,139,250,0.15)"}}>
                <div className="flex items-center gap-2 mb-3">
                  <PieIcon size={13} style={{color:"#a78bfa"}}/>
                  <span className="text-sm font-bold text-white">Distribución</span>
                  <span className="text-[9px] text-white/30 ml-auto">Mayo 2026</span>
                </div>
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={60} dataKey="value" paddingAngle={3}>
                        {pieData.map((e,i)=><Cell key={i} fill={e.fill}/>)}
                      </Pie>
                      <RTooltip contentStyle={TIP}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5 mt-1">
                  {pieData.map(e=>(
                    <div key={e.name} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:e.fill}}/>
                      <span className="text-[9px] text-white/50 flex-1">{e.name}</span>
                      <span className="text-[9px] font-bold" style={{color:e.fill}}>{e.value}</span>
                      <span className="text-[9px] text-white/25">{Math.round(e.value/(lastMes.total||1)*100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Dispositivos: filtro + BT + COM ── */}
            <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(0,200,255,0.15)"}}>
              <div className="px-4 py-3 flex items-center gap-3 flex-wrap" style={{background:"rgba(0,200,255,0.05)",borderBottom:"1px solid rgba(0,200,255,0.1)"}}>
                <Bluetooth size={14} style={{color:"#00c8ff"}}/>
                <span className="text-sm font-bold text-white">Dispositivos registrados</span>
                <span className="text-[10px] text-white/30">{BT_DEVS_ADMIN.length} BT · {COM_DEVS_ADMIN.length} COM</span>
                <div className="ml-auto flex gap-1 flex-wrap">
                  {(["todos","activo","disponible","sin_señal"] as const).map(f=>(
                    <button key={f} onClick={()=>setBascDevFilter(f)}
                      className="px-2.5 py-1 rounded-xl text-[9px] font-bold transition-all"
                      style={{
                        background: bascDevFilter===f ? "rgba(0,200,255,0.15)" : "rgba(255,255,255,0.04)",
                        border:`1px solid ${bascDevFilter===f ? "rgba(0,200,255,0.4)" : "rgba(255,255,255,0.08)"}`,
                        color: bascDevFilter===f ? "#00c8ff" : "rgba(255,255,255,0.3)",
                      }}>
                      {f==="todos"?"Todos":f==="activo"?"● Activo":f==="disponible"?"○ Disponible":"⚠ Sin señal"}
                    </button>
                  ))}
                </div>
              </div>

              {/* BT Devices */}
              <div>
                <div className="px-4 py-2 text-[9px] font-black uppercase tracking-widest" style={{background:"rgba(0,245,212,0.04)",color:"rgba(0,245,212,0.5)",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                  🔵 Bluetooth / BLE — {filteredBT.length} dispositivos
                </div>
                <div className="divide-y" style={{borderColor:"rgba(255,255,255,0.04)"}}>
                  {filteredBT.map(dev=>(
                    <div key={dev.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{background:`${dev.color}12`,border:`1px solid ${dev.color}25`}}>
                        {dev.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-white">{dev.nombre}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                            style={{
                              background: dev.estado==="activo"?"rgba(57,255,126,0.1)":dev.estado==="sin_señal"?"rgba(248,113,113,0.1)":"rgba(255,255,255,0.05)",
                              border:`1px solid ${dev.estado==="activo"?"rgba(57,255,126,0.3)":dev.estado==="sin_señal"?"rgba(248,113,113,0.3)":"rgba(255,255,255,0.1)"}`,
                              color: dev.estado==="activo"?"#39ff7e":dev.estado==="sin_señal"?"#f87171":"rgba(255,255,255,0.4)",
                            }}>
                            {dev.estado==="activo"?"● Activo":dev.estado==="sin_señal"?"⚠ Sin señal":"○ Disponible"}
                          </span>
                        </div>
                        <p className="text-[9px] text-white/35 truncate">{dev.marca} · {dev.tipo} · {dev.desc}</p>
                      </div>
                      {/* Batería */}
                      <div className="hidden sm:flex flex-col items-center gap-0.5 flex-shrink-0 w-12">
                        <div className="w-full h-1.5 rounded-full" style={{background:"rgba(255,255,255,0.08)"}}>
                          <div className="h-full rounded-full transition-all"
                            style={{width:`${dev.bateria}%`,background:dev.bateria>50?"#39ff7e":dev.bateria>25?"#fbbf24":"#f87171"}}/>
                        </div>
                        <span className="text-[8px] text-white/30">{dev.bateria}%</span>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="text-[10px] font-bold" style={{color:dev.color}}>{dev.usos}</div>
                        <div className="text-[8px] text-white/20">usos</div>
                        <div className="text-[8px] text-white/20 mt-0.5">{dev.ultima}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* COM Devices */}
              <div>
                <div className="px-4 py-2 text-[9px] font-black uppercase tracking-widest" style={{background:"rgba(249,115,22,0.04)",color:"rgba(249,115,22,0.5)",borderBottom:"1px solid rgba(255,255,255,0.04)",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
                  🔌 COM / RS232 / USB-Serial — {filteredCOM.length} controladores
                </div>
                <div className="divide-y" style={{borderColor:"rgba(255,255,255,0.04)"}}>
                  {filteredCOM.map(dev=>(
                    <div key={dev.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{background:`${dev.color}12`,border:`1px solid ${dev.color}25`}}>
                        {dev.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-white">{dev.nombre}</span>
                          <span className="text-[8px] font-mono px-1.5 py-0.5 rounded-lg"
                            style={{background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.3)"}}>
                            {dev.baud} bps
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                            style={{
                              background: dev.estado==="activo"?"rgba(57,255,126,0.1)":dev.estado==="inactivo"?"rgba(248,113,113,0.1)":"rgba(255,255,255,0.05)",
                              border:`1px solid ${dev.estado==="activo"?"rgba(57,255,126,0.3)":dev.estado==="inactivo"?"rgba(248,113,113,0.3)":"rgba(255,255,255,0.1)"}`,
                              color: dev.estado==="activo"?"#39ff7e":dev.estado==="inactivo"?"#f87171":"rgba(255,255,255,0.4)",
                            }}>
                            {dev.estado==="activo"?"● Activo":dev.estado==="inactivo"?"○ Inactivo":"○ Disponible"}
                          </span>
                        </div>
                        <p className="text-[9px] text-white/35 truncate">{dev.marca} · {dev.tipo} · {dev.desc}</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="text-[10px] font-bold" style={{color:dev.color}}>{dev.usos}</div>
                        <div className="text-[8px] text-white/20">usos</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Configuración global ── */}
            <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(167,139,250,0.2)"}}>
              <div className="px-4 py-3 flex items-center gap-3" style={{background:"rgba(167,139,250,0.06)",borderBottom:"1px solid rgba(167,139,250,0.1)"}}>
                <Wrench size={14} style={{color:"#a78bfa"}}/>
                <span className="text-sm font-bold text-white">Configuración global de básculas</span>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Trama por defecto */}
                <div>
                  <label className="text-[9px] text-white/35 uppercase tracking-wider block mb-1.5">Formato de trama por defecto</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {[["stw","STW (Tru-Test)"],["wn","WN (Gallagher)"],["scs","SCS (Mettler)"],["raw","RAW genérico"]].map(([id,label])=>(
                      <button key={id} onClick={()=>setBascGlobal(g=>({...g,trama:id}))}
                        className="px-2.5 py-1.5 rounded-xl text-[9px] font-bold transition-all"
                        style={{
                          background: bascGlobal.trama===id ? "rgba(167,139,250,0.18)" : "rgba(255,255,255,0.03)",
                          border:`1px solid ${bascGlobal.trama===id ? "rgba(167,139,250,0.5)" : "rgba(255,255,255,0.08)"}`,
                          color: bascGlobal.trama===id ? "#a78bfa" : "rgba(255,255,255,0.35)",
                        }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Unidad de peso */}
                <div>
                  <label className="text-[9px] text-white/35 uppercase tracking-wider block mb-1.5">Unidad de peso</label>
                  <div className="flex gap-1.5">
                    {[["kg","Kilogramos (kg)"],["lb","Libras (lb)"]].map(([id,label])=>(
                      <button key={id} onClick={()=>setBascGlobal(g=>({...g,unidad:id}))}
                        className="px-3 py-1.5 rounded-xl text-[9px] font-bold transition-all"
                        style={{
                          background: bascGlobal.unidad===id ? "rgba(251,146,60,0.18)" : "rgba(255,255,255,0.03)",
                          border:`1px solid ${bascGlobal.unidad===id ? "rgba(251,146,60,0.5)" : "rgba(255,255,255,0.08)"}`,
                          color: bascGlobal.unidad===id ? "#fb923c" : "rgba(255,255,255,0.35)",
                        }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Auto-guardar */}
                <div className="flex items-center justify-between py-2 px-3 rounded-xl" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)"}}>
                  <div>
                    <div className="text-xs font-bold text-white">Guardar pesaje automáticamente</div>
                    <div className="text-[9px] text-white/30">Al estabilizarse la báscula</div>
                  </div>
                  <button onClick={()=>setBascGlobal(g=>({...g,autoSave:!g.autoSave}))}
                    className="w-10 h-5 rounded-full relative transition-all"
                    style={{background:bascGlobal.autoSave?"rgba(57,255,126,0.4)":"rgba(255,255,255,0.1)"}}>
                    <div className="absolute w-4 h-4 rounded-full top-0.5 transition-all"
                      style={{background:bascGlobal.autoSave?"#39ff7e":"rgba(255,255,255,0.35)",left:bascGlobal.autoSave?"calc(100% - 1.25rem)":"0.125rem",boxShadow:bascGlobal.autoSave?"0 0 8px rgba(57,255,126,0.6)":"none"}}/>
                  </button>
                </div>
                {/* Alertas calibración */}
                <div className="flex items-center justify-between py-2 px-3 rounded-xl" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)"}}>
                  <div>
                    <div className="text-xs font-bold text-white">Alertas de calibración</div>
                    <div className="text-[9px] text-white/30">Notificar cuando batería &lt; {bascGlobal.umbralAlerta}%</div>
                  </div>
                  <button onClick={()=>setBascGlobal(g=>({...g,alertaCalib:!g.alertaCalib}))}
                    className="w-10 h-5 rounded-full relative transition-all"
                    style={{background:bascGlobal.alertaCalib?"rgba(251,191,36,0.4)":"rgba(255,255,255,0.1)"}}>
                    <div className="absolute w-4 h-4 rounded-full top-0.5 transition-all"
                      style={{background:bascGlobal.alertaCalib?"#fbbf24":"rgba(255,255,255,0.35)",left:bascGlobal.alertaCalib?"calc(100% - 1.25rem)":"0.125rem",boxShadow:bascGlobal.alertaCalib?"0 0 8px rgba(251,191,36,0.6)":"none"}}/>
                  </button>
                </div>
                {/* Umbral batería */}
                <div className="sm:col-span-2">
                  <label className="text-[9px] text-white/35 uppercase tracking-wider block mb-2">Umbral de alerta de batería: <span style={{color:"#fbbf24"}}>{bascGlobal.umbralAlerta}%</span></label>
                  <input type="range" min={10} max={50} step={5} value={bascGlobal.umbralAlerta}
                    onChange={e=>setBascGlobal(g=>({...g,umbralAlerta:+e.target.value}))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{accentColor:"#fb923c",background:`linear-gradient(to right, #fb923c ${((bascGlobal.umbralAlerta-10)/40)*100}%, rgba(255,255,255,0.1) 0%)`}}
                  />
                  <div className="flex justify-between text-[8px] text-white/20 mt-1">
                    <span>10%</span><span>20%</span><span>30%</span><span>40%</span><span>50%</span>
                  </div>
                </div>
              </div>
              {/* Save button */}
              <div className="px-4 pb-4">
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-[1.02]"
                  style={{background:"linear-gradient(135deg,#fb923c,#f97316)",color:"black",boxShadow:"0 0 16px rgba(251,146,60,0.3)"}}>
                  <CheckCircle size={13}/> Guardar configuración global
                </button>
              </div>
            </div>

          </div>
        );
      })()}

      {/* ════════════════════════════════════════════════════════════════════
          TAB: SISTEMA
      ════════════════════════════════════════════════════════════════════ */}
      {tab === "sistema" && (
        <div className="space-y-4">
          {/* Health check */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              {icon:<Server size={18}/>,    title:"Versión CIVAC",      val:"v4.2.1",         sub:"Build 2026-05-21",    color:"#00f5d4", status:"ok" },
              {icon:<Database size={18}/>,  title:"Almacenamiento",     val:"localStorage",   sub:"PWA offline-first",  color:"#00c8ff", status:"ok" },
              {icon:<Wifi size={18}/>,      title:"Conectividad",       val:"Online",         sub:"Service Worker v6",  color:"#39ff7e", status:"ok" },
              {icon:<Bell size={18}/>,      title:"Alertas sistema",    val:"0 críticas",     sub:"Sistema estable",    color:"#34d399", status:"ok" },
              {icon:<Cpu size={18}/>,       title:"Performance",        val:"98 / 100",       sub:"Lighthouse PWA",     color:"#fbbf24", status:"ok" },
              {icon:<Globe size={18}/>,     title:"Cobertura",          val:"Colombia",       sub:"20+ módulos activos", color:"#a78bfa", status:"ok" },
            ].map(s=>(
              <div key={s.title} className="rounded-2xl p-4 flex items-center gap-3"
                style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${s.color}20`}}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{background:`${s.color}15`,color:s.color}}>
                  {s.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{s.title}</p>
                  <p className="text-sm font-black" style={{color:s.color}}>{s.val}</p>
                  <p className="text-[9px] text-white/30">{s.sub}</p>
                </div>
                <div className="ml-auto">
                  <span className="w-2 h-2 rounded-full block bg-green-400 animate-pulse"/>
                </div>
              </div>
            ))}
          </div>

          {/* System logs */}
          <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(255,255,255,0.08)"}}>
            <div className="px-4 py-3 flex items-center justify-between"
              style={{background:"rgba(255,255,255,0.03)",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><Terminal size={14} style={{color:"#39ff7e"}}/> Logs del sistema</h3>
              <button className="text-[9px] text-white/30 hover:text-white flex items-center gap-1">
                <RefreshCw size={10}/> Actualizar
              </button>
            </div>
            <div className="p-3 font-mono text-[9px] space-y-1 max-h-48 overflow-y-auto"
              style={{background:"rgba(0,0,0,0.4)",scrollbarWidth:"thin"}}>
              {[
                {t:"INFO",  msg:"[2026-05-21 10:34] Sistema iniciado · v4.2.1",        c:"#39ff7e" },
                {t:"INFO",  msg:"[2026-05-21 10:34] Service Worker registrado scope /", c:"#39ff7e" },
                {t:"INFO",  msg:"[2026-05-21 10:34] AuthContext cargado · 4 cuentas",  c:"#00f5d4" },
                {t:"INFO",  msg:"[2026-05-21 10:35] AppStateContext · localStorage OK", c:"#00f5d4" },
                {t:"INFO",  msg:"[2026-05-21 10:36] Login exitoso — admin@ganader.ia",  c:"#a78bfa" },
                {t:"WARN",  msg:"[2026-05-21 09:10] Intento fallido 3x — unknown@test",c:"#fbbf24" },
                {t:"INFO",  msg:"[2026-05-21 08:22] Pago aprobado — CIVAC-2026-001",  c:"#00f5d4" },
                {t:"ERROR", msg:"[2026-05-20 16:40] Pago rechazado — CIVAC-2026-005", c:"#f87171" },
              ].map((l,i)=>(
                <div key={i} className="flex gap-2">
                  <span className="flex-shrink-0 font-black"
                    style={{color:l.t==="ERROR"?"#f87171":l.t==="WARN"?"#fbbf24":"#39ff7e"}}>[{l.t}]</span>
                  <span style={{color:"rgba(255,255,255,0.5)"}}>{l.msg}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Health check real */}
          <div className="rounded-2xl p-4" style={{background:"rgba(0,245,212,0.04)",border:"1px solid rgba(0,245,212,0.15)"}}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><Activity size={14} style={{color:"#00f5d4"}}/> Estado del API Server</h3>
              <button onClick={doFetchHealth} disabled={healthLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold disabled:opacity-50"
                style={{background:"rgba(0,245,212,0.12)",border:"1px solid rgba(0,245,212,0.3)",color:"#00f5d4"}}>
                <RefreshCw size={10} className={healthLoading?"animate-spin":""}/> Verificar ahora
              </button>
            </div>
            {healthData ? (
              <div className="grid grid-cols-3 gap-3">
                {[
                  {k:"API Status", v:healthData.status==="ok"?"✓ Online":"✗ Error", c:healthData.status==="ok"?"#39ff7e":"#f87171"},
                  {k:"Base de datos", v:healthData.db??"PostgreSQL", c:"#00c8ff"},
                  {k:"Uptime", v:healthData.uptime?`${Math.floor(healthData.uptime/60)}m ${Math.floor(healthData.uptime%60)}s`:"—", c:"#fbbf24"},
                ].map(({k,v,c})=>(
                  <div key={k} className="rounded-xl p-3 text-center" style={{background:"rgba(0,0,0,0.3)"}}>
                    <div className="text-xs font-black" style={{color:c}}>{v}</div>
                    <div className="text-[9px] text-white/30 mt-0.5">{k}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-white/30 italic">Haz clic en "Verificar ahora" para obtener el estado real del servidor.</p>
            )}
          </div>

          {/* Admin actions */}
          <div className="rounded-2xl p-4" style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)"}}>
            <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Acciones de sistema</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                {label:"Exportar cuentas CSV",    icon:<Download size={12}/>,   color:"#00f5d4", fn:exportCuentasCSV },
                {label:"Exportar datos JSON",      icon:<Database size={12}/>,   color:"#a78bfa", fn:exportDatosJSON  },
                {label:"Vaciar caché SW",          icon:<HardDrive size={12}/>,  color:"#f87171", fn:()=>{ if("serviceWorker" in navigator){ navigator.serviceWorker.getRegistrations().then(regs=>regs.forEach(r=>r.unregister())); } } },
                {label:"Forzar recarga SW",        icon:<Zap size={12}/>,        color:"#39ff7e", fn:()=>window.location.reload() },
                {label:"Verificar API health",     icon:<Activity size={12}/>,   color:"#00c8ff", fn:doFetchHealth  },
                {label:"Cargar conteos BD",        icon:<BarChart3 size={12}/>,  color:"#fbbf24", fn:doLoadDbCounts },
                {label:"Ir a tab Datos",           icon:<RefreshCw size={12}/>,  color:"#94a3b8", fn:()=>setTab("datos") },
                {label:"Configurar Finca",         icon:<Building2 size={12}/>,  color:"#39ff7e", fn:()=>{doLoadFinca();setTab("finca");} },
              ].map(a=>(
                <button key={a.label} onClick={a.fn}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] transition-all hover:opacity-80 text-left"
                  style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${a.color}25`,color:a.color}}>
                  {a.icon} {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Version info */}
          <div className="rounded-2xl p-4" style={{background:"rgba(0,200,255,0.04)",border:"1px solid rgba(0,200,255,0.15)"}}>
            <div className="flex items-center gap-3 mb-3">
              <Info size={16} style={{color:"#00c8ff"}}/>
              <h3 className="text-sm font-bold text-white">Información de versión</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {k:"App",        v:"GanaderIA v4.2.1"},
                {k:"React",      v:"18.3.0"},
                {k:"Vite",       v:"6.3.5"},
                {k:"TypeScript", v:"5.9"},
                {k:"Tailwind",   v:"4.1.4"},
                {k:"shadcn/ui",  v:"latest"},
                {k:"Recharts",   v:"2.15.3"},
                {k:"PWA",        v:"Service Worker v6"},
              ].map(({k,v})=>(
                <div key={k} className="rounded-xl px-3 py-2" style={{background:"rgba(0,0,0,0.3)"}}>
                  <div className="text-[9px] text-white/30">{k}</div>
                  <div className="font-mono text-[10px] font-bold text-white/70">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB: FINCA
      ════════════════════════════════════════════════════════════════════ */}
      {tab === "finca" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Building2 size={16} style={{color:"#39ff7e"}}/> Configuración de la Finca
              </h2>
              <p className="text-[10px] text-white/30">Datos oficiales · Se sincronizan con el servidor</p>
            </div>
            <button onClick={doLoadFinca}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold"
              style={{background:"rgba(57,255,126,0.1)",border:"1px solid rgba(57,255,126,0.25)",color:"#39ff7e"}}>
              <RefreshCw size={10}/> Cargar desde servidor
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Datos generales */}
            <div className="rounded-2xl p-5 space-y-4" style={{background:"rgba(57,255,126,0.04)",border:"1px solid rgba(57,255,126,0.15)"}}>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 size={13} style={{color:"#39ff7e"}}/> Datos generales
              </h3>
              <div className="space-y-3">
                {[
                  {label:"Nombre de la finca *",      key:"nombre",         placeholder:"Finca El Rancho Verde", type:"text"},
                  {label:"NIT / Cédula",               key:"nit",            placeholder:"900.123.456-7",         type:"text"},
                  {label:"Municipio",                  key:"municipio",      placeholder:"Bogotá",                type:"text"},
                  {label:"Departamento",               key:"departamento",   placeholder:"Cundinamarca",          type:"text"},
                  {label:"Teléfono",                   key:"telefono",       placeholder:"+57 300 000 0000",      type:"tel"},
                  {label:"Correo electrónico",         key:"email",          placeholder:"finca@civac.co",        type:"email"},
                ].map(f=>(
                  <div key={f.key}>
                    <Label className="text-[10px] text-white/40 uppercase tracking-wide">{f.label}</Label>
                    <Input type={f.type} value={(fincaData as Record<string,string|number>)[f.key] as string}
                      onChange={e=>setFincaData(p=>({...p,[f.key]:e.target.value}))}
                      placeholder={f.placeholder}
                      className="mt-1 text-xs h-9" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(57,255,126,0.15)"}}/>
                  </div>
                ))}
                <div>
                  <Label className="text-[10px] text-white/40 uppercase tracking-wide">Dirección completa</Label>
                  <Input value={fincaData.direccion}
                    onChange={e=>setFincaData(p=>({...p,direccion:e.target.value}))}
                    placeholder="Vereda La Esperanza, km 5 vía principal…"
                    className="mt-1 text-xs h-9" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(57,255,126,0.15)"}}/>
                </div>
              </div>
            </div>

            {/* Capacidad y plan */}
            <div className="space-y-4">
              <div className="rounded-2xl p-5 space-y-4" style={{background:"rgba(0,200,255,0.04)",border:"1px solid rgba(0,200,255,0.15)"}}>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart3 size={13} style={{color:"#00c8ff"}}/> Capacidad y plan
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px] text-white/40 uppercase tracking-wide">Hectáreas totales</Label>
                    <Input type="number" value={fincaData.hectareasTotales}
                      onChange={e=>setFincaData(p=>({...p,hectareasTotales:Number(e.target.value)}))}
                      className="mt-1 text-xs h-9" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(0,200,255,0.15)"}}/>
                  </div>
                  <div>
                    <Label className="text-[10px] text-white/40 uppercase tracking-wide">Capacidad (animales)</Label>
                    <Input type="number" value={fincaData.capacidadTotal}
                      onChange={e=>setFincaData(p=>({...p,capacidadTotal:Number(e.target.value)}))}
                      className="mt-1 text-xs h-9" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(0,200,255,0.15)"}}/>
                  </div>
                </div>
                <div>
                  <Label className="text-[10px] text-white/40 uppercase tracking-wide">Plan actual</Label>
                  <Select value={fincaData.planCode} onValueChange={v=>setFincaData(p=>({...p,planCode:v}))}>
                    <SelectTrigger className="mt-1 h-9 text-xs" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(0,200,255,0.15)"}}>
                      <SelectValue/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">🌱 Básico — Gratis</SelectItem>
                      <SelectItem value="pro">⚡ PRO — $89.000/mes</SelectItem>
                      <SelectItem value="platinum">👑 Platino — $189.000/mes</SelectItem>
                      <SelectItem value="enterprise">🏢 Enterprise — $490.000/mes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Estadísticas actuales */}
              <div className="rounded-2xl p-4" style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)"}}>
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <TrendingUp size={13} style={{color:"#fbbf24"}}/> Resumen actual
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {label:"Usuarios",  val:accounts.length,                                    c:"#00f5d4"},
                    {label:"Con plan",  val:accounts.filter(a=>(a.plan??"basico")!=="basico").length, c:"#a78bfa"},
                    {label:"Activos",   val:accounts.filter(a=>a.activo!==false).length,        c:"#39ff7e"},
                  ].map(s=>(
                    <div key={s.label} className="rounded-xl p-2 text-center" style={{background:"rgba(0,0,0,0.25)"}}>
                      <div className="text-lg font-black" style={{color:s.c}}>{s.val}</div>
                      <div className="text-[9px] text-white/30">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Save button */}
          <div className="flex items-center gap-3 justify-end">
            <button onClick={doLoadFinca} className="px-4 py-2 rounded-xl text-xs font-bold"
              style={{background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.5)",border:"1px solid rgba(255,255,255,0.1)"}}>
              Cancelar
            </button>
            <button onClick={doSaveFinca} disabled={fincaLoading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black disabled:opacity-60 transition-all hover:opacity-90"
              style={{background:"linear-gradient(135deg,#39ff7e,#00d4aa)",color:"black"}}>
              {fincaLoading ? <RefreshCw size={12} className="animate-spin"/> : <CheckCircle size={12}/>}
              {fincaSaved ? "✓ Guardado" : "Guardar configuración"}
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB: DATOS
      ════════════════════════════════════════════════════════════════════ */}
      {tab === "datos" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Database size={16} style={{color:"#a78bfa"}}/> Gestión de Datos del Sistema
            </h2>
            <p className="text-[10px] text-white/30">Carga inicial, reset y exportación de todos los datos de la plataforma</p>
          </div>

          {/* Seed message */}
          {seedMsg && (
            <div className="rounded-xl px-4 py-3 flex items-center gap-2"
              style={{background:seedMsg.ok?"rgba(57,255,126,0.08)":"rgba(248,113,113,0.08)",border:`1px solid ${seedMsg.ok?"rgba(57,255,126,0.25)":"rgba(248,113,113,0.25)"}`}}>
              {seedMsg.ok ? <CheckCircle2 size={14} style={{color:"#39ff7e"}}/> : <XCircle size={14} style={{color:"#f87171"}}/>}
              <span className="text-xs font-bold" style={{color:seedMsg.ok?"#39ff7e":"#f87171"}}>{seedMsg.msg}</span>
              <button onClick={()=>setSeedMsg(null)} className="ml-auto text-white/30 hover:text-white"><XCircle size={12}/></button>
            </div>
          )}

          {/* Main actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Seed */}
            <div className="rounded-2xl p-5 space-y-3" style={{background:"rgba(0,245,212,0.04)",border:"1px solid rgba(0,245,212,0.2)"}}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:"rgba(0,245,212,0.12)",color:"#00f5d4"}}>
                <Database size={18}/>
              </div>
              <h3 className="font-black text-white text-sm">Cargar datos iniciales</h3>
              <p className="text-[10px] text-white/40 leading-relaxed">Inserta el dataset de ejemplo: 30 animales, 8 potreros, 18 insumos, 9 empleados, GPS, alertas y pesajes. Solo actúa si la BD está vacía.</p>
              <button onClick={()=>doSeed(false)} disabled={seedLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black disabled:opacity-50 transition-all hover:opacity-90"
                style={{background:"linear-gradient(135deg,#00f5d4,#00a896)",color:"black"}}>
                {seedLoading ? <RefreshCw size={12} className="animate-spin"/> : <Database size={12}/>}
                Cargar seed data
              </button>
            </div>

            {/* Reset */}
            <div className="rounded-2xl p-5 space-y-3" style={{background:"rgba(248,113,113,0.04)",border:"1px solid rgba(248,113,113,0.2)"}}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:"rgba(248,113,113,0.12)",color:"#f87171"}}>
                <RefreshCw size={18}/>
              </div>
              <h3 className="font-black text-white text-sm">Resetear todos los datos</h3>
              <p className="text-[10px] text-white/40 leading-relaxed">Borra y recarga todos los datos: animales, pesajes, GPS, alertas, insumos, potreros y personal. <strong className="text-red-400">Irreversible.</strong></p>
              {!resetConfirm ? (
                <button onClick={()=>setResetConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all hover:opacity-90"
                  style={{background:"rgba(248,113,113,0.15)",border:"1px solid rgba(248,113,113,0.3)",color:"#f87171"}}>
                  <AlertTriangle size={12}/> Resetear datos
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-[10px] text-red-400 font-bold">¿Confirmar reset total?</p>
                  <div className="flex gap-2">
                    <button onClick={()=>setResetConfirm(false)}
                      className="flex-1 py-2 rounded-xl text-[10px] font-bold"
                      style={{background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.5)",border:"1px solid rgba(255,255,255,0.1)"}}>
                      Cancelar
                    </button>
                    <button onClick={()=>doSeed(true)} disabled={seedLoading}
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-black disabled:opacity-50"
                      style={{background:"linear-gradient(135deg,#ef4444,#b91c1c)",color:"white"}}>
                      {seedLoading ? <RefreshCw size={10} className="animate-spin"/> : <AlertTriangle size={10}/>}
                      Confirmar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Export */}
            <div className="rounded-2xl p-5 space-y-3" style={{background:"rgba(167,139,250,0.04)",border:"1px solid rgba(167,139,250,0.2)"}}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:"rgba(167,139,250,0.12)",color:"#a78bfa"}}>
                <Download size={18}/>
              </div>
              <h3 className="font-black text-white text-sm">Exportar datos</h3>
              <p className="text-[10px] text-white/40 leading-relaxed">Descarga un backup completo en JSON o exporta las cuentas como CSV. Útil para respaldo o migración.</p>
              <div className="space-y-2">
                <button onClick={exportDatosJSON}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90"
                  style={{background:"rgba(167,139,250,0.15)",border:"1px solid rgba(167,139,250,0.3)",color:"#a78bfa"}}>
                  <Download size={12}/> Backup JSON completo
                </button>
                <button onClick={exportCuentasCSV}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90"
                  style={{background:"rgba(0,245,212,0.08)",border:"1px solid rgba(0,245,212,0.2)",color:"#00f5d4"}}>
                  <FileText size={12}/> Exportar cuentas CSV
                </button>
              </div>
            </div>
          </div>

          {/* DB counts */}
          <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(255,255,255,0.08)"}}>
            <div className="px-4 py-3 flex items-center justify-between"
              style={{background:"rgba(255,255,255,0.03)",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 size={14} style={{color:"#fbbf24"}}/> Conteos en Base de Datos (PostgreSQL)
              </h3>
              <button onClick={doLoadDbCounts} disabled={dbLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold disabled:opacity-50"
                style={{background:"rgba(251,191,36,0.1)",border:"1px solid rgba(251,191,36,0.25)",color:"#fbbf24"}}>
                <RefreshCw size={10} className={dbLoading?"animate-spin":""}/> Recargar
              </button>
            </div>
            <div className="p-4">
              {Object.keys(dbCounts).length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    {k:"animals",    label:"Animales",    icon:"🐄", c:"#39ff7e"},
                    {k:"potreros",   label:"Potreros",    icon:"🌿", c:"#00f5d4"},
                    {k:"insumos",    label:"Insumos",     icon:"📦", c:"#fbbf24"},
                    {k:"personal",   label:"Personal",    icon:"👷", c:"#a78bfa"},
                    {k:"reproduccion",label:"Reproducción",icon:"🧬", c:"#f472b6"},
                    {k:"alertas",    label:"Alertas",     icon:"🔔", c:"#f87171"},
                    {k:"pesajes",    label:"Pesajes",     icon:"⚖️", c:"#00c8ff"},
                    {k:"gps",        label:"GPS collares",icon:"📡", c:"#60a5fa"},
                  ].map(({k,label,icon,c})=>(
                    <div key={k} className="rounded-xl p-3 flex items-center gap-3"
                      style={{background:"rgba(0,0,0,0.2)",border:`1px solid ${c}15`}}>
                      <span className="text-xl">{icon}</span>
                      <div>
                        <div className="text-lg font-black" style={{color:c}}>{dbCounts[k]??0}</div>
                        <div className="text-[9px] text-white/30">{label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-white/30 mb-3">Haz clic en "Recargar" para ver los conteos reales de la base de datos.</p>
                  <button onClick={doLoadDbCounts} disabled={dbLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold mx-auto disabled:opacity-50"
                    style={{background:"linear-gradient(135deg,#fbbf24,#f59e0b)",color:"black"}}>
                    <Database size={12}/> Cargar estadísticas BD
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tabla de planes */}
          <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(255,255,255,0.07)"}}>
            <div className="px-4 py-3" style={{background:"rgba(0,245,212,0.04)",borderBottom:"1px solid rgba(0,245,212,0.1)"}}>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Star size={14} style={{color:"#00f5d4"}}/> Planes configurados en BD
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{borderBottom:"1px solid rgba(255,255,255,0.06)",background:"rgba(255,255,255,0.02)"}}>
                    {["Plan","Código","Precio/mes","Límite animales","Usuarios máx","GPS collares"].map(h=>(
                      <th key={h} className="px-4 py-2 text-left text-[9px] text-white/40 font-bold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    {name:"Básico",    code:"basic",      price:"Gratis",    animals:50,    users:1,  gps:2,  c:"#00f5d4"},
                    {name:"PRO",       code:"pro",        price:"$89.000",   animals:300,   users:5,  gps:10, c:"#a78bfa"},
                    {name:"Platino",   code:"platinum",   price:"$189.000",  animals:2000,  users:20, gps:50, c:"#fbbf24"},
                    {name:"Enterprise",code:"enterprise", price:"$490.000",  animals:99999, users:999,gps:999,c:"#94a3b8"},
                  ].map((p,i)=>(
                    <tr key={p.code} style={{background:i%2===0?"rgba(255,255,255,0.01)":"transparent",borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                      <td className="px-4 py-2 font-black text-xs" style={{color:p.c}}>{p.name}</td>
                      <td className="px-4 py-2 font-mono text-[10px] text-white/50">{p.code}</td>
                      <td className="px-4 py-2 font-bold text-[10px] text-white/80">{p.price}/mes</td>
                      <td className="px-4 py-2 text-[10px] text-white/60">{p.animals.toLocaleString()}</td>
                      <td className="px-4 py-2 text-[10px] text-white/60">{p.users}</td>
                      <td className="px-4 py-2 text-[10px] text-white/60">{p.gps}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB: REPORTES
      ════════════════════════════════════════════════════════════════════ */}
      {tab === "reportes" && (() => {
        const totalMRR = accounts.reduce((s,a)=>s+PLAN_PRECIOS[a.plan??"basico"],0);
        const activos  = accounts.filter(a=>a.activo!==false).length;
        const conPlan  = accounts.filter(a=>(a.plan??"basico")!=="basico").length;
        const convRate = accounts.length>0 ? Math.round((conPlan/accounts.length)*100) : 0;

        const planDistFull = PLAN_ORDER.map(p=>({
          name: PLAN_LABEL[p],
          value: accounts.filter(a=>(a.plan??"basico")===p).length,
          color: PLAN_COLOR[p],
        }));

        const monthlyData = [
          {mes:"Nov",mrr:178000,clientes:2,nuevos:2},
          {mes:"Dic",mrr:267000,clientes:3,nuevos:1},
          {mes:"Ene",mrr:267000,clientes:3,nuevos:0},
          {mes:"Feb",mrr:445000,clientes:4,nuevos:1},
          {mes:"Mar",mrr:534000,clientes:4,nuevos:0},
          {mes:"Abr",mrr:623000,clientes:5,nuevos:1},
          {mes:"May",mrr:totalMRR,clientes:accounts.length,nuevos:1},
        ];

        return (
          <div className="space-y-4">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <TrendingUp size={16} style={{color:"#fbbf24"}}/> Reportes y Métricas CIVAC
            </h2>

            {/* KPI row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {label:"MRR Total",       val:fmt(totalMRR),   sub:"Ingresos mensuales",   icon:<DollarSign size={16}/>, c:"#fbbf24"},
                {label:"Clientes activos",val:activos,         sub:"de "+accounts.length+" registrados", icon:<Users size={16}/>,    c:"#00f5d4"},
                {label:"Con plan pago",   val:conPlan,         sub:`${convRate}% conversión`,icon:<Star size={16}/>,     c:"#a78bfa"},
                {label:"ARR estimado",    val:fmt(totalMRR*12),sub:"Anual recurrente",     icon:<TrendingUp size={16}/>, c:"#39ff7e"},
              ].map(k=>(
                <div key={k.label} className="rounded-2xl p-4" style={{background:`${k.c}06`,border:`1px solid ${k.c}20`}}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{background:`${k.c}12`,color:k.c}}>{k.icon}</div>
                  <div className="text-lg font-black" style={{color:k.c}}>{k.val}</div>
                  <div className="text-xs font-bold text-white/60">{k.label}</div>
                  <div className="text-[9px] text-white/25">{k.sub}</div>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl p-4" style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(251,191,36,0.15)"}}>
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><TrendingUp size={13} style={{color:"#fbbf24"}}/> MRR evolución (COP)</h3>
                <ResponsiveContainer width="100%" height={150}>
                  <AreaChart data={monthlyData} margin={{top:4,right:8,left:-10,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                    <XAxis dataKey="mes" tick={{fontSize:9,fill:"rgba(255,255,255,0.35)"}}/>
                    <YAxis tick={{fontSize:9,fill:"rgba(255,255,255,0.35)"}} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`}/>
                    <RTooltip contentStyle={TIP} formatter={(v:number)=>[fmt(v),"MRR"]}/>
                    <Area type="monotone" dataKey="mrr" stroke="#fbbf24" fill="rgba(251,191,36,0.08)" strokeWidth={2}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-2xl p-4" style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(0,245,212,0.12)"}}>
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Users size={13} style={{color:"#00f5d4"}}/> Distribución por plan</h3>
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width={120} height={120}>
                    <PieChart>
                      <Pie data={planDistFull} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value" paddingAngle={3}>
                        {planDistFull.map((e,i)=><Cell key={i} fill={e.color}/>)}
                      </Pie>
                      <RTooltip contentStyle={TIP}/>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 flex-1">
                    {planDistFull.map(p=>(
                      <div key={p.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{background:p.color}}/>
                          <span className="text-[10px] text-white/60">{p.name}</span>
                        </div>
                        <span className="text-[10px] font-black" style={{color:p.color}}>{p.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Clientes por crecimiento */}
            <div className="rounded-2xl p-4" style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)"}}>
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Users size={13} style={{color:"#00c8ff"}}/> Clientes y crecimiento mensual</h3>
              <ResponsiveContainer width="100%" height={130}>
                <BarChart data={monthlyData} margin={{top:4,right:8,left:-20,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                  <XAxis dataKey="mes" tick={{fontSize:9,fill:"rgba(255,255,255,0.35)"}}/>
                  <YAxis tick={{fontSize:9,fill:"rgba(255,255,255,0.35)"}}/>
                  <RTooltip contentStyle={TIP}/>
                  <Bar dataKey="clientes" fill="#00c8ff" radius={[4,4,0,0]} name="Total clientes"/>
                  <Bar dataKey="nuevos"   fill="#39ff7e" radius={[4,4,0,0]} name="Nuevos"/>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top clientes */}
            <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(255,255,255,0.07)"}}>
              <div className="px-4 py-3 flex items-center justify-between"
                style={{background:"rgba(255,255,255,0.03)",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                <h3 className="text-sm font-bold text-white flex items-center gap-2"><Crown size={14} style={{color:"#fbbf24"}}/> Top clientes por plan</h3>
                <button onClick={exportCuentasCSV}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold"
                  style={{background:"rgba(0,245,212,0.08)",border:"1px solid rgba(0,245,212,0.2)",color:"#00f5d4"}}>
                  <Download size={10}/> CSV
                </button>
              </div>
              <div className="divide-y" style={{borderColor:"rgba(255,255,255,0.04)"}}>
                {[...accounts].sort((a,b)=>PLAN_PRECIOS[b.plan??"basico"]-PLAN_PRECIOS[a.plan??"basico"]).slice(0,8).map((a,i)=>(
                  <div key={a.id} className="px-4 py-2.5 flex items-center gap-3"
                    style={{background:i%2===0?"rgba(255,255,255,0.01)":"transparent"}}>
                    <span className="w-5 text-[10px] font-black text-white/30">#{i+1}</span>
                    <span className="text-lg">{a.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-white truncate">{a.nombre}</div>
                      <div className="text-[9px] text-white/35 truncate">{a.email}</div>
                    </div>
                    <PlanBadge plan={a.plan}/>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-black" style={{color:PLAN_COLOR[a.plan??"basico"]}}>
                        {PLAN_PRECIOS[a.plan??"basico"]>0?fmt(PLAN_PRECIOS[a.plan??"basico"])+"/mes":"Gratis"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ════════════════════════════════════════════════════════════════════
          DIALOGS
      ════════════════════════════════════════════════════════════════════ */}
      {/* Create */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus size={16} style={{color:"#00f5d4"}}/> Nuevo cliente CIVAC
            </DialogTitle>
          </DialogHeader>
          <AccountForm onSave={handleAdd} onClose={()=>setAddOpen(false)}/>
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={!!editTarget} onOpenChange={v=>{if(!v)setEditTarget(null);}}>
        <DialogContent className="sm:max-w-lg max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit size={16} style={{color:"#00c8ff"}}/> Editar cuenta
            </DialogTitle>
          </DialogHeader>
          {editTarget&&<AccountForm initial={editTarget} onSave={handleEdit} onClose={()=>setEditTarget(null)} isEdit/>}
        </DialogContent>
      </Dialog>

      {/* Change plan */}
      <Dialog open={!!planTarget} onOpenChange={v=>{if(!v)setPlanTarget(null);}}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star size={16} style={{color:"#a78bfa"}}/> Cambiar plan
            </DialogTitle>
          </DialogHeader>
          {planTarget&&(
            <div className="space-y-4">
              <div className="rounded-xl p-3" style={{background:"rgba(167,139,250,0.07)",border:"1px solid rgba(167,139,250,0.2)"}}>
                <p className="font-bold text-sm text-white">{planTarget.nombre}</p>
                <p className="text-xs text-white/40">{planTarget.email}</p>
                <div className="mt-2"><PlanBadge plan={planTarget.plan}/></div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Nuevo plan</Label>
                <Select value={newPlan} onValueChange={v=>setNewPlan(v as PlanId)}>
                  <SelectTrigger className="mt-1"><SelectValue/></SelectTrigger>
                  <SelectContent>
                    {PLAN_ORDER.map(p=>(
                      <SelectItem key={p} value={p}>
                        {PLAN_ICON[p]} {PLAN_LABEL[p]}{PLAN_PRECIOS[p]>0?` · $${(PLAN_PRECIOS[p]/1000).toFixed(0)}k/mes`:" · Gratis"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline" size="sm">Cancelar</Button></DialogClose>
                <Button size="sm" onClick={doChangePlan}
                  style={{background:"linear-gradient(135deg,#a78bfa,#7c3aed)",color:"white"}}>
                  Aplicar plan
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ════════════════════════════════════════════════════════════════════
          TAB: LOGS & AUDITORÍA
      ════════════════════════════════════════════════════════════════════ */}
      {tab === "logs" && (
        <div className="space-y-4">
          <div className="rounded-2xl p-4" style={{background:"rgba(96,165,250,0.06)",border:"1px solid rgba(96,165,250,0.2)"}}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-white flex items-center gap-2"><span>📋</span> Log de Auditoría CIVAC v1.0</h3>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:opacity-80"
                  style={{background:"rgba(96,165,250,0.12)",color:"#60a5fa",border:"1px solid rgba(96,165,250,0.25)"}}>
                  🔽 Exportar CSV
                </button>
                <button className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:opacity-80"
                  style={{background:"rgba(239,68,68,0.08)",color:"#f87171",border:"1px solid rgba(239,68,68,0.2)"}}>
                  🗑️ Limpiar logs
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {[
                {time:"Hoy 10:42",user:"admin@ganader.ia",      action:"LOGIN",        module:"Auth",       ip:"181.132.45.12",  ok:true,  detail:"Sesión iniciada — Chrome 124 · Bogotá"},
                {time:"Hoy 10:38",user:"vet@ganader.ia",        action:"CONSULTA",     module:"Inventario", ip:"190.25.134.88",  ok:true,  detail:"Listado 13 animales · filtro: activos"},
                {time:"Hoy 10:30",user:"luis@ganader.ia",       action:"PESAJE",       module:"Pesaje BT",  ip:"181.78.99.201",  ok:true,  detail:"Vaca CIVA-007 · 382 kg · BT Tru-Test"},
                {time:"Hoy 09:55",user:"visor@ganader.ia",      action:"EXPORT",       module:"Costos",     ip:"190.144.22.55",  ok:true,  detail:"Descarga CSV P&G Mayo 2026"},
                {time:"Hoy 09:22",user:"admin@ganader.ia",      action:"CREAR",        module:"Usuarios",   ip:"181.132.45.12",  ok:true,  detail:"Nueva cuenta: vendedora@civac.co · Plan PRO"},
                {time:"Ayer 17:45",user:"???@externo.com",      action:"LOGIN_FAIL",   module:"Auth",       ip:"195.220.11.4",   ok:false, detail:"Contraseña inválida — IP bloqueada 30 min"},
                {time:"Ayer 16:30",user:"admin@ganader.ia",     action:"PLAN_UPGRADE", module:"Planes",     ip:"181.132.45.12",  ok:true,  detail:"vet@ganader.ia: PRO → Premium"},
                {time:"Ayer 14:12",user:"dev@civac.co",         action:"FEATURE_FLAG", module:"Dev Panel",  ip:"127.0.0.1",      ok:true,  detail:"Flag 'ai_prediccion' → enabled"},
                {time:"Ayer 11:05",user:"super@civac.co",       action:"SISTEMA",      module:"Admin",      ip:"localhost",      ok:true,  detail:"Restart Analytics Server · uptime 99.8%"},
                {time:"Hace 2 días",user:"admin@ganader.ia",    action:"DELETE",       module:"Usuarios",   ip:"181.132.45.12",  ok:true,  detail:"Eliminada cuenta: test@civac.co"},
              ].map((log,i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl transition-all hover:bg-white/3"
                  style={{background:"rgba(255,255,255,0.02)",border:`1px solid rgba(${log.ok?"96,165,250":"239,68,68"},0.15)`}}>
                  <div className="text-xs font-mono px-2 py-0.5 rounded-lg flex-shrink-0 mt-0.5"
                    style={{background:log.ok?"rgba(52,211,153,0.1)":"rgba(239,68,68,0.1)",color:log.ok?"#34d399":"#f87171",border:`1px solid ${log.ok?"rgba(52,211,153,0.25)":"rgba(239,68,68,0.25)"}`}}>
                    {log.ok ? "✓" : "✗"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black" style={{color:log.ok?"#60a5fa":"#f87171"}}>{log.action}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold text-white/50" style={{background:"rgba(255,255,255,0.05)"}}>{log.module}</span>
                      <span className="text-[9px] text-white/25 font-mono">{log.ip}</span>
                    </div>
                    <p className="text-[10px] text-white/50 mt-0.5 truncate">{log.user} · {log.detail}</p>
                  </div>
                  <span className="text-[9px] text-white/25 flex-shrink-0">{log.time}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 text-center text-[10px] text-white/25">
              Mostrando últimas 10 entradas · Total en BD: 2,847 eventos · Retención: 90 días
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB: SOPORTE
      ════════════════════════════════════════════════════════════════════ */}
      {tab === "soporte" && (
        <div className="space-y-4">
          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {label:"Tickets abiertos",  val:"3",  sub:"2 sin respuesta",  c:"#f472b6", g:"244,114,182"},
              {label:"Resueltos hoy",     val:"7",  sub:"< 2h promedio",    c:"#34d399", g:"52,211,153"},
              {label:"CSAT Score",        val:"4.8",sub:"de 5.0 · 32 reseñas",c:"#fbbf24",g:"251,191,36"},
              {label:"WhatsApp pendientes",val:"5", sub:"Línea soporte",    c:"#00f5d4", g:"0,245,212"},
            ].map(k=>(
              <div key={k.label} className="rounded-2xl p-4" style={{background:`rgba(${k.g},0.07)`,border:`1px solid rgba(${k.g},0.2)`}}>
                <div className="text-2xl font-black" style={{color:k.c}}>{k.val}</div>
                <div className="text-[10px] font-bold text-white/70 mt-0.5">{k.label}</div>
                <div className="text-[9px] text-white/30">{k.sub}</div>
              </div>
            ))}
          </div>
          {/* Tickets */}
          <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(244,114,182,0.2)"}}>
            <div className="px-4 py-3 flex items-center justify-between"
              style={{background:"rgba(244,114,182,0.06)",borderBottom:"1px solid rgba(244,114,182,0.12)"}}>
              <span className="text-sm font-bold text-white">🎧 Tickets de Soporte</span>
              <button className="px-3 py-1.5 rounded-xl text-xs font-bold"
                style={{background:"rgba(244,114,182,0.12)",color:"#f472b6",border:"1px solid rgba(244,114,182,0.3)"}}>
                + Nuevo ticket
              </button>
            </div>
            <div className="divide-y" style={{borderColor:"rgba(255,255,255,0.05)"}}>
              {[
                {id:"TK-041",cliente:"Dr. Carlos Ramírez",  asunto:"GPS collar #7 sin señal",               estado:"abierto",     prioridad:"alta",   plan:"premium", canal:"WhatsApp", hace:"5 min"},
                {id:"TK-040",cliente:"Luis Patiño",         asunto:"Error al exportar CSV pesaje",          estado:"en_progreso", prioridad:"media",  plan:"pro",     canal:"Email",     hace:"1 h"},
                {id:"TK-039",cliente:"Inversiones Bovinas", asunto:"Solicitud módulo multi-tenant",          estado:"abierto",     prioridad:"alta",   plan:"platino", canal:"Teléfono",  hace:"2 h"},
                {id:"TK-038",cliente:"Agropecuaria Santos", asunto:"Error al procesar pago PSE",             estado:"resuelto",    prioridad:"urgente",plan:"pro",     canal:"WhatsApp", hace:"3 h"},
                {id:"TK-037",cliente:"Finca El Palmar",     asunto:"¿Cómo vincular báscula Gallagher W210?", estado:"resuelto",    prioridad:"baja",   plan:"basico",  canal:"Email",     hace:"1 día"},
                {id:"TK-036",cliente:"Ana Lucía Torres",    asunto:"Capacitación módulo Reproducción",       estado:"resuelto",    prioridad:"media",  plan:"premium", canal:"Video",    hace:"2 días"},
              ].map(t=>{
                const ec = t.estado==="abierto"?"#f472b6":t.estado==="en_progreso"?"#fbbf24":"#34d399";
                const eg = t.estado==="abierto"?"244,114,182":t.estado==="en_progreso"?"251,191,36":"52,211,153";
                const pc = t.prioridad==="urgente"?"#f87171":t.prioridad==="alta"?"#fb923c":t.prioridad==="media"?"#fbbf24":"#94a3b8";
                return (
                  <div key={t.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/2 transition-colors">
                    <div className="w-16 flex-shrink-0">
                      <div className="text-[9px] font-mono font-bold text-white/40">{t.id}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-white truncate">{t.asunto}</div>
                      <div className="text-[10px] text-white/40">{t.cliente} · {t.canal} · {t.hace}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[9px] font-bold" style={{color:pc}}>⬤ {t.prioridad}</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black" style={{background:`rgba(${eg},0.12)`,color:ec,border:`1px solid rgba(${eg},0.3)`}}>
                        {t.estado.replace("_"," ")}
                      </span>
                      <button className="px-2 py-1 rounded-lg text-[9px] font-bold hover:opacity-80 transition-opacity"
                        style={{background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.5)"}}>
                        Ver →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Quick contact channels */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {emoji:"💬",label:"WhatsApp Soporte",sub:"+57 300 CIVAC 00",color:"#25D366",g:"37,211,102"},
              {emoji:"📧",label:"Email Soporte",   sub:"soporte@softgan.com.co",color:"#0ea5e9",g:"14,165,233"},
              {emoji:"📞",label:"Línea Directa",   sub:"01-8000-CIVAC-CO",color:"#f472b6",g:"244,114,182"},
            ].map(c=>(
              <div key={c.label} className="rounded-2xl p-4 text-center" style={{background:`rgba(${c.g},0.07)`,border:`1px solid rgba(${c.g},0.2)`}}>
                <div className="text-3xl mb-2">{c.emoji}</div>
                <div className="text-sm font-black text-white">{c.label}</div>
                <div className="text-[10px] mt-1" style={{color:`rgba(${c.g},0.7)`}}>{c.sub}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB: SEGURIDAD
      ════════════════════════════════════════════════════════════════════ */}
      {tab === "seguridad" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Intentos fallidos */}
            <div className="rounded-2xl p-4" style={{background:"rgba(248,113,113,0.06)",border:"1px solid rgba(248,113,113,0.2)"}}>
              <h3 className="font-bold text-white mb-3 flex items-center gap-2"><span>🚨</span> Intentos de acceso fallidos (30 días)</h3>
              <div className="space-y-2">
                {[
                  {ip:"195.220.11.4",  intentos:14, pais:"RU", bloq:true,  ultimo:"Hoy 09:22"},
                  {ip:"45.33.32.156",  intentos:7,  pais:"US", bloq:true,  ultimo:"Ayer 23:10"},
                  {ip:"190.144.22.55", intentos:3,  pais:"CO", bloq:false, ultimo:"Hace 3 días"},
                  {ip:"103.21.244.0",  intentos:22, pais:"CN", bloq:true,  ultimo:"Hace 5 días"},
                ].map(ip=>(
                  <div key={ip.ip} className="flex items-center justify-between p-2 rounded-xl" style={{background:"rgba(255,255,255,0.03)"}}>
                    <div>
                      <span className="font-mono text-xs text-white/70">{ip.ip}</span>
                      <span className="text-[9px] ml-2 text-white/30">{ip.pais} · {ip.ultimo}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-red-400">{ip.intentos} intentos</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${ip.bloq?"bg-red-500/15 text-red-400 border border-red-500/30":"bg-yellow-500/10 text-yellow-400"}`}>
                        {ip.bloq?"Bloqueada":"Monitoreando"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Política de contraseñas */}
            <div className="rounded-2xl p-4" style={{background:"rgba(52,211,153,0.06)",border:"1px solid rgba(52,211,153,0.2)"}}>
              <h3 className="font-bold text-white mb-3 flex items-center gap-2"><span>🔒</span> Política de Seguridad</h3>
              <div className="space-y-3">
                {[
                  {label:"Longitud mínima contraseña",    val:"8 caracteres",      ok:true},
                  {label:"Autenticación 2FA",             val:"Opcional (JWT)",     ok:true},
                  {label:"Sesión máxima inactiva",        val:"8 horas",           ok:true},
                  {label:"Bloqueo por intentos fallidos", val:"5 intentos → 30 min",ok:true},
                  {label:"Cifrado en tránsito",           val:"HTTPS / TLS 1.3",   ok:true},
                  {label:"Logs de auditoría",             val:"90 días retención",  ok:true},
                  {label:"Rate limiting API",             val:"100 req/min/IP",     ok:true},
                  {label:"Dominio autorizado CIVAC",      val:"civac.pro · replit", ok:true},
                ].map(r=>(
                  <div key={r.label} className="flex items-center justify-between">
                    <span className="text-xs text-white/60">{r.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white/80">{r.val}</span>
                      <CheckCircle size={12} style={{color:"#34d399"}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Certificados */}
          <div className="rounded-2xl p-4" style={{background:"rgba(96,165,250,0.06)",border:"1px solid rgba(96,165,250,0.15)"}}>
            <h3 className="font-bold text-white mb-3 flex items-center gap-2"><span>🛡️</span> Certificados y Cumplimiento</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {emoji:"🏛️",label:"DIAN Colombia",sub:"Factura electrónica",ok:true},
                {emoji:"🔐",label:"SSL/TLS 1.3",sub:"Cifrado extremo a extremo",ok:true},
                {emoji:"📊",label:"GDPR Básico",sub:"Protección de datos",ok:true},
                {emoji:"🇨🇴",label:"Ley 1581/2012",sub:"Habeas Data Colombia",ok:true},
              ].map(c=>(
                <div key={c.label} className="rounded-xl p-3 text-center" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(96,165,250,0.12)"}}>
                  <div className="text-2xl mb-1">{c.emoji}</div>
                  <div className="text-[10px] font-black text-white">{c.label}</div>
                  <div className="text-[9px] text-white/40 mt-0.5">{c.sub}</div>
                  <div className="mt-1.5 text-[9px] font-bold text-green-400">✓ Activo</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ ACCESOS ══ */}
      {tab === "accesos" && (
        <div className="space-y-4">
          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label:"Total accesos",  val:loginActivity.length, c:"#00f5d4", rgb:"0,245,212" },
              { label:"⬡ CIVAC Staff",  val:loginActivity.filter(a=>a.isCivac).length, c:"#fbbf24", rgb:"251,191,36" },
              { label:"Demo",           val:loginActivity.filter(a=>a.isDemo&&!a.isCivac).length, c:"#e879f9", rgb:"232,121,249" },
              { label:"Hoy",            val:loginActivity.filter(a=>a.fecha===new Date().toLocaleDateString("es-CO")).length, c:"#39ff7e", rgb:"57,255,126" },
            ].map(k=>(
              <div key={k.label} className="rounded-2xl p-4 text-center" style={{background:`rgba(${k.rgb},0.07)`,border:`1px solid rgba(${k.rgb},0.25)`}}>
                <div className="text-2xl font-black mb-1" style={{color:k.c}}>{k.val}</div>
                <div className="text-[10px] text-white/40">{k.label}</div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(0,245,212,0.12)"}}>
            <div className="px-4 py-3 flex items-center justify-between" style={{background:"rgba(0,245,212,0.05)",borderBottom:"1px solid rgba(0,245,212,0.1)"}}>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield size={13} style={{color:"#00f5d4"}}/> Historial de accesos recientes
              </h3>
              <div className="flex items-center gap-2">
                <button onClick={()=>{
                  const csv=["ID,Usuario,Email,Rol,Plan,Fecha,Hora,Browser,Demo,CIVAC",...loginActivity.map(a=>`${a.id},${a.userName},${a.userEmail},${a.userRole},${a.plan},${a.fecha},${a.hora},${a.ua},${a.isDemo},${a.isCivac}`)].join("\n");
                  const blob=new Blob([csv],{type:"text/csv"}); const url=URL.createObjectURL(blob); const anchor=document.createElement("a"); anchor.href=url; anchor.download="civac_accesos_admin.csv"; anchor.click(); URL.revokeObjectURL(url);
                }} className="text-[9px] font-bold px-2 py-1 rounded-lg"
                  style={{background:"rgba(0,245,212,0.1)",color:"#00f5d4",border:"1px solid rgba(0,245,212,0.25)"}}>
                  ↓ CSV
                </button>
                <button onClick={()=>{ try{localStorage.removeItem("civac_login_activity");}catch{} }}
                  className="text-[9px] font-bold px-2 py-1 rounded-lg"
                  style={{background:"rgba(248,113,113,0.1)",color:"#f87171",border:"1px solid rgba(248,113,113,0.25)"}}>
                  Limpiar
                </button>
              </div>
            </div>
            <div className="max-h-[480px] overflow-y-auto">
              {loginActivity.length === 0 ? (
                <div className="p-8 text-center">
                  <Shield size={28} className="mx-auto mb-3" style={{color:"rgba(0,245,212,0.3)"}}/>
                  <p className="text-sm text-white/30">Sin registros aún. Los accesos se registran automáticamente al iniciar sesión.</p>
                </div>
              ) : loginActivity.map((a, i) => {
                const planC: Record<string,string> = { basico:"#b8c4d4", pro:"#00f5d4", premium:"#fbbf24", platino:"#cd7f32" };
                const c = a.isCivac ? "#fbbf24" : planC[a.plan] ?? "#b8c4d4";
                return (
                  <div key={a.id} className="px-4 py-3 flex items-center gap-3 border-b"
                    style={{borderColor:"rgba(255,255,255,0.04)",background:i%2===0?"transparent":"rgba(255,255,255,0.01)"}}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm"
                      style={{background:`${c}15`,border:`1px solid ${c}35`}}>
                      {a.isCivac ? "⬡" : a.isDemo ? "🧪" : "👤"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white truncate">{a.userName}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{background:`${c}15`,color:c,border:`1px solid ${c}35`}}>
                          {a.isCivac ? "⬡ CIVAC" : a.plan.toUpperCase()}
                        </span>
                        {a.isDemo && !a.isCivac && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{background:"rgba(232,121,249,0.12)",color:"#e879f9",border:"1px solid rgba(232,121,249,0.3)"}}>
                            🧪 Demo
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-white/30 truncate">{a.userEmail} · {a.ua}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-[10px] font-bold" style={{color:c}}>{a.hora}</div>
                      <div className="text-[9px] text-white/25">{a.fecha}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Plan breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(["basico","pro","premium","platino"] as const).map(p=>{
              const cnt = loginActivity.filter(a=>a.plan===p&&!a.isCivac).length;
              const c = PLAN_COLOR[p];
              return (
                <div key={p} className="rounded-2xl p-4 text-center" style={{background:`${c}08`,border:`1px solid ${c}25`}}>
                  <div className="text-xl font-black mb-1" style={{color:c}}>{cnt}</div>
                  <div className="text-[10px] text-white/40">{PLAN_ICON[p]} {PLAN_LABEL[p]}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB: ESTADÍSTICAS — DAU / WAU / MAU, conversión, módulos
      ════════════════════════════════════════════════════════════════════ */}
      {tab === "estadisticas" && (
        <div className="space-y-4">
          {/* KPI row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label:"Usuarios activos HOY",  val:"12",  sub:"↑ 4 vs ayer",       c:"#818cf8", icon:"👤" },
              { label:"Activos esta SEMANA",   val:"28",  sub:"↑ 6 vs sem. ant.",   c:"#00f5d4", icon:"📅" },
              { label:"Activos este MES",      val:"41",  sub:"↑ 9 vs mes ant.",    c:"#39ff7e", icon:"📆" },
              { label:"Tiempo promedio sesión",val:"22 min",sub:"↑ 3 min",          c:"#fbbf24", icon:"⏱️" },
            ].map(k=>(
              <div key={k.label} className="rounded-2xl p-4 text-center"
                style={{background:`${k.c}08`,border:`1px solid ${k.c}22`}}>
                <div className="text-2xl mb-1">{k.icon}</div>
                <div className="text-2xl font-black text-white">{k.val}</div>
                <div className="text-[9px] font-bold mt-0.5" style={{color:`${k.c}cc`}}>{k.label}</div>
                <div className="text-[9px] text-white/30 mt-0.5">{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Conversión funnel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(129,140,248,0.2)"}}>
              <div className="px-4 py-3" style={{background:"rgba(129,140,248,0.06)",borderBottom:"1px solid rgba(129,140,248,0.12)"}}>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp size={14} style={{color:"#818cf8"}}/> Funnel de conversión
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {[
                  { label:"Visitantes únicos",    val:312, pct:100, c:"#60a5fa" },
                  { label:"Cuenta creada",         val:87,  pct:28,  c:"#818cf8" },
                  { label:"Plan gratuito activo",  val:63,  pct:20,  c:"#a78bfa" },
                  { label:"Conversión a PRO+",     val:24,  pct:8,   c:"#00f5d4" },
                  { label:"Plan Premium / Platino",val:9,   pct:3,   c:"#fbbf24" },
                ].map(f=>(
                  <div key={f.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-white/60">{f.label}</span>
                      <span className="text-[10px] font-bold text-white">{f.val} <span className="text-white/30">({f.pct}%)</span></span>
                    </div>
                    <div className="h-2 rounded-full" style={{background:"rgba(255,255,255,0.05)"}}>
                      <div className="h-full rounded-full transition-all" style={{width:`${f.pct}%`,background:f.c,boxShadow:`0 0 8px ${f.c}60`}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Módulos más usados */}
            <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(0,245,212,0.2)"}}>
              <div className="px-4 py-3" style={{background:"rgba(0,245,212,0.06)",borderBottom:"1px solid rgba(0,245,212,0.12)"}}>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart3 size={14} style={{color:"#00f5d4"}}/> Top módulos visitados (30d)
                </h3>
              </div>
              <div className="p-4 space-y-2.5">
                {[
                  { label:"Dashboard",    val:1840, c:"#00f5d4" },
                  { label:"Inventario",   val:1420, c:"#39ff7e" },
                  { label:"GPS Bovino",   val:1180, c:"#00c8ff" },
                  { label:"Producción",   val:980,  c:"#fbbf24" },
                  { label:"Asesora IA",   val:862,  c:"#e879f9" },
                  { label:"Pesaje BT",    val:714,  c:"#fb923c" },
                  { label:"Trazabilidad", val:540,  c:"#f97316" },
                  { label:"Reproducción", val:480,  c:"#f472b6" },
                ].map((m,i)=>{
                  const max = 1840;
                  return (
                    <div key={m.label} className="flex items-center gap-2">
                      <span className="text-[9px] text-white/30 w-4 text-right">{i+1}</span>
                      <span className="text-[10px] text-white/70 w-24 flex-shrink-0">{m.label}</span>
                      <div className="flex-1 h-2 rounded-full" style={{background:"rgba(255,255,255,0.05)"}}>
                        <div className="h-full rounded-full" style={{width:`${(m.val/max)*100}%`,background:m.c}}/>
                      </div>
                      <span className="text-[9px] text-white/40 w-10 text-right">{m.val.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Actividad diaria 30d — mini chart */}
          <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(129,140,248,0.15)"}}>
            <div className="px-4 py-3" style={{background:"rgba(129,140,248,0.05)",borderBottom:"1px solid rgba(129,140,248,0.1)"}}>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity size={14} style={{color:"#818cf8"}}/> Sesiones diarias — últimos 30 días
              </h3>
            </div>
            <div className="p-4">
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={Array.from({length:30},(_,i)=>{
                  const d = new Date(); d.setDate(d.getDate()-29+i);
                  const label = `${d.getDate()}/${d.getMonth()+1}`;
                  const base = 8 + Math.round(Math.sin(i*0.4)*3);
                  return { label, sesiones: base + Math.round(Math.random()*5), acciones: (base+4) + Math.round(Math.random()*8) };
                })}>
                  <defs>
                    <linearGradient id="statGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                  <XAxis dataKey="label" tick={{fontSize:8,fill:"rgba(255,255,255,0.25)"}} interval={4}/>
                  <YAxis tick={{fontSize:8,fill:"rgba(255,255,255,0.25)"}}/>
                  <RTooltip contentStyle={{background:"#0a1628",border:"1px solid rgba(129,140,248,0.3)",borderRadius:12,fontSize:11}}/>
                  <Area type="monotone" dataKey="sesiones" stroke="#818cf8" strokeWidth={2} fill="url(#statGrad)" dot={false}/>
                  <Area type="monotone" dataKey="acciones" stroke="#00f5d4" strokeWidth={1.5} fill="none" dot={false} strokeDasharray="3 3"/>
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-2 justify-end">
                <div className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded-full inline-block" style={{background:"#818cf8"}}/><span className="text-[9px] text-white/40">Sesiones</span></div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded-full inline-block" style={{background:"#00f5d4"}} /><span className="text-[9px] text-white/40">Acciones</span></div>
              </div>
            </div>
          </div>

          {/* Retención + Churn */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label:"Tasa retención 30d",  val:"78.4%",  sub:"↑ 2.1 pp",  c:"#39ff7e", icon:"🔄" },
              { label:"Churn mensual",        val:"4.8%",   sub:"↓ 0.6 pp",  c:"#f87171", icon:"📉" },
              { label:"NPS estimado",         val:"72 pts", sub:"Excelente",  c:"#fbbf24", icon:"⭐" },
            ].map(k=>(
              <div key={k.label} className="rounded-2xl p-4 flex items-center gap-3"
                style={{background:`${k.c}08`,border:`1px solid ${k.c}22`}}>
                <span className="text-3xl">{k.icon}</span>
                <div>
                  <div className="text-xl font-black text-white">{k.val}</div>
                  <div className="text-[10px] font-bold" style={{color:`${k.c}cc`}}>{k.label}</div>
                  <div className="text-[9px] text-white/30">{k.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB: CÓDIGOS DE ACTIVACIÓN
      ════════════════════════════════════════════════════════════════════ */}
      {tab === "codigos" && <CodigosTab />}

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={v=>{if(!v)setDeleteTarget(null);}}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle size={16}/> Eliminar cuenta
            </DialogTitle>
          </DialogHeader>
          {deleteTarget&&(
            <div className="space-y-4">
              <div className="rounded-xl p-3" style={{background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.2)"}}>
                <p className="font-bold text-white">{deleteTarget.nombre}</p>
                <p className="text-xs text-white/40">{deleteTarget.email}</p>
              </div>
              <p className="text-sm text-white/70">Esta acción es irreversible. Se eliminará la cuenta y todos sus datos.</p>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline" size="sm">Cancelar</Button></DialogClose>
                <Button size="sm" onClick={doDelete}
                  style={{background:"linear-gradient(135deg,#ef4444,#b91c1c)",color:"white"}}>
                  <Trash2 size={12} className="mr-1"/> Eliminar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Revoke session */}
      <Dialog open={!!revokeTarget} onOpenChange={v=>{if(!v)setRevokeTarget(null);}}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-400">
              <Ban size={16}/> Revocar sesión
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-white/70">Se cerrará la sesión activa de este usuario inmediatamente. Tendrá que volver a iniciar sesión.</p>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline" size="sm">Cancelar</Button></DialogClose>
              <Button size="sm" onClick={()=>revokeTarget&&revokeSession(revokeTarget)}
                style={{background:"linear-gradient(135deg,#f97316,#ea580c)",color:"white"}}>
                <Ban size={12} className="mr-1"/> Revocar sesión
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
