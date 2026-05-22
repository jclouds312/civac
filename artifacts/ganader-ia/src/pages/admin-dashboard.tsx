import { useState, useMemo, useCallback } from "react";
import {
  useAuth, PLAN_LABEL, PLAN_COLOR, PLAN_ICON, PLAN_PRECIOS,
  PlanId, Account, WompiPayment,
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
const PLAN_COLORS_PIE = ["#94a3b8", "#00f5d4", "#a78bfa", "#fbbf24"];

const PLAN_MODULES: Record<PlanId, string[]> = {
  basico:  ["Dashboard","Inventario","Producción","Potreros","Alertas"],
  pro:     ["+ Reproducción","+ Genética","+ Pesaje BT","+ Insumos","+ Alimentación","+ Semen","+ Costos","+ Personal","+ GPS Collares"],
  premium: ["+ Multi-Finca","+ Predicciones IA","+ Huella CO₂","+ Ficha Individual","+ Pesaje Manual/COM"],
  platino: ["+ Usuarios & Roles","+ Configuración","+ Documentación","+ Lotes","+ Multi-Tenant","+ Admin Panel"],
};

const ALL_MODULES = [
  { id:"dashboard",      label:"Dashboard",        icon:"📊", plan:"basico"  },
  { id:"inventario",     label:"Inventario",        icon:"🐄", plan:"basico"  },
  { id:"produccion",     label:"Producción",        icon:"🥛", plan:"basico"  },
  { id:"potreros",       label:"Potreros",          icon:"🌿", plan:"basico"  },
  { id:"alertas",        label:"Alertas",           icon:"🔔", plan:"basico"  },
  { id:"reproduccion",   label:"Reproducción",      icon:"🧬", plan:"pro"     },
  { id:"genetica",       label:"Genética",          icon:"🔬", plan:"pro"     },
  { id:"pesaje",         label:"Pesaje BT/COM",     icon:"⚖️", plan:"pro"     },
  { id:"insumos",        label:"Insumos",           icon:"📦", plan:"pro"     },
  { id:"alimentacion",   label:"Alimentación",      icon:"🌾", plan:"pro"     },
  { id:"semen",          label:"Semen/Embriones",   icon:"🧪", plan:"pro"     },
  { id:"costos",         label:"Costos P&G",        icon:"💰", plan:"pro"     },
  { id:"personal",       label:"Personal",          icon:"👷", plan:"pro"     },
  { id:"gps",            label:"GPS Collares",      icon:"📡", plan:"pro"     },
  { id:"multifinca",     label:"Multi-Finca",       icon:"🏘️", plan:"premium" },
  { id:"prediccion",     label:"Predicciones IA",   icon:"🤖", plan:"premium" },
  { id:"co2",            label:"Huella CO₂",        icon:"🌍", plan:"premium" },
  { id:"ficha",          label:"Ficha Individual",  icon:"📋", plan:"premium" },
  { id:"usuarios",       label:"Usuarios & Roles",  icon:"👥", plan:"platino" },
  { id:"configuracion",  label:"Configuración",     icon:"⚙️", plan:"platino" },
  { id:"documentacion",  label:"Documentación",     icon:"📖", plan:"platino" },
];

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
   MAIN COMPONENT
────────────────────────────────────────────────────────────────────────── */
export default function AdminDashboard({
  activeTab: extTab,
  onTabChange,
}: {
  activeTab?: string;
  onTabChange?: (t: string) => void;
} = {}) {
  const { accounts, registerUser, updateUser, deleteUser, user: currentUser } = useAuth();

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

  const tab    = extTab ?? internalTab;
  const setTab = onTabChange ?? setInternalTab;

  /* ── Derived ── */
  const clients     = accounts.filter(a => a.id !== "admin");
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
      civac_version: "4.2",
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
    { id:"resumen",  icon:"📊", label:"Resumen"   },
    { id:"cuentas",  icon:"👥", label:"Cuentas"   },
    { id:"planes",   icon:"⭐", label:"Planes"    },
    { id:"pagos",    icon:"💳", label:"Pagos"     },
    { id:"sesiones", icon:"📡", label:"Sesiones"  },
    { id:"apis",     icon:"🔌", label:"APIs"      },
    { id:"modulos",  icon:"🧩", label:"Módulos"   },
    { id:"sistema",  icon:"⚙️", label:"Sistema"   },
  ];

  return (
    <div className="space-y-4 pb-12 civac-animate">

      {/* ── HERO BANNER ── */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden"
        style={{
          background:"linear-gradient(135deg,#050d18 0%,#071a30 40%,#0a1e3a 70%,#050d18 100%)",
          border:"1px solid rgba(0,245,212,0.25)",
          boxShadow:"0 0 50px rgba(0,245,212,0.08)",
        }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background:"url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1000&q=15&auto=format&fit=crop') center/cover", opacity:0.04 }}/>
        <div className="absolute -top-10 -right-10 w-72 h-72 rounded-full pointer-events-none"
          style={{ background:"radial-gradient(circle,rgba(0,245,212,0.15),transparent 70%)" }}/>
        <div className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background:"linear-gradient(90deg,transparent,#00f5d4,#00c8ff,transparent)" }}/>

        <div className="relative p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0"
              style={{ border:"2px solid rgba(0,245,212,0.5)", boxShadow:"0 0 24px rgba(0,245,212,0.4)" }}>
              <img src="https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=120&h=120&q=80&auto=format&fit=crop&crop=face"
                alt="CIVAC" className="w-full h-full object-cover"/>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-xl sm:text-2xl font-black text-white" style={{ fontFamily:"'Sora',sans-serif" }}>
                  CIVAC Admin
                </h1>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                  style={{ background:"linear-gradient(135deg,#00f5d4,#00a896)", color:"black" }}>SUPER PANEL</span>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                  style={{ background:"linear-gradient(135deg,#fbbf24,#ea580c)", color:"white" }}>v5.0</span>
              </div>
              <p className="text-xs" style={{ color:"rgba(0,245,212,0.6)" }}>
                Control Inteligente de Valor Agropecuario · Panel de Administración Global
              </p>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1 text-[10px]" style={{ color:"rgba(0,245,212,0.45)" }}>
                  <Shield size={10}/> {currentUser?.nombre ?? "Admin"}
                </span>
                <span className="flex items-center gap-1 text-[10px]" style={{ color:"rgba(255,255,255,0.3)" }}>
                  <Globe size={10}/> Colombia · {new Date().toLocaleDateString("es-CO")}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-green-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/> Sistema operativo
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline"
              className="gap-1.5 text-xs border-white/20 text-white/70 hover:text-white">
              <Download size={12}/> Exportar CSV
            </Button>
            <Button size="sm" onClick={() => setAddOpen(true)}
              className="gap-1.5 text-xs font-bold"
              style={{ background:"linear-gradient(135deg,#00f5d4,#00a896)", color:"black" }}>
              <Plus size={12}/> Nuevo cliente
            </Button>
          </div>
        </div>
      </div>

      {/* ── KPI STRIP ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label:"Total cuentas",   val:accounts.length, sub:"sistemas CIVAC",        icon:<Users size={16}/>,       from:"#00f5d4",to:"#00a896",glow:"0,245,212"   },
          { label:"Activos ahora",   val:sessionsList.filter(s=>s.activa).length, sub:"sesiones en línea",   icon:<Activity size={16}/>,    from:"#39ff7e",to:"#00c850",glow:"57,255,126"  },
          { label:"Planes pagos",    val:proCount,        sub:"PRO / Premium / Platino", icon:<CreditCard size={16}/>,  from:"#a78bfa",to:"#7c3aed",glow:"167,139,250" },
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
              background: tab===t.id ? "rgba(0,245,212,0.12)" : "transparent",
              color: tab===t.id ? "#00f5d4" : "rgba(255,255,255,0.4)",
              borderBottom: tab===t.id ? "2px solid #00f5d4" : "2px solid transparent",
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
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB: CUENTAS
      ════════════════════════════════════════════════════════════════════ */}
      {tab === "cuentas" && (
        <div className="space-y-3">
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
                {filtered.length===0&&(
                  <tr><td colSpan={7} className="text-center py-8 text-white/25 text-xs">Sin resultados</td></tr>
                )}
                {filtered.map((a,i)=>(
                  <tr key={a.id}
                    style={{background:i%2===0?"rgba(255,255,255,0.02)":"transparent",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
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
                      <span className="text-[10px] text-white/50">{a.cargo||a.role}</span>
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
                        <button onClick={()=>toggleStatus(a)} title={a.activo!==false?"Desactivar":"Activar"}
                          className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                          style={{color:a.activo!==false?"#39ff7e":"#f87171"}}>
                          {a.activo!==false?<ToggleRight size={14}/>:<ToggleLeft size={14}/>}
                        </button>
                        <button onClick={()=>setEditTarget(a)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/10 text-white/50 hover:text-white">
                          <Edit size={12}/>
                        </button>
                        <button onClick={()=>{setPermTarget(a);}}
                          className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/10 text-blue-400">
                          <Shield size={12}/>
                        </button>
                        <button onClick={()=>{setPlanTarget(a);setNewPlan(a.plan??"basico");}}
                          className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/10 text-purple-400">
                          <Star size={12}/>
                        </button>
                        <button
                          onClick={()=>genLicencia(a)}
                          title="Descargar licencia JSON del plan asignado"
                          className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-amber-500/15 transition-colors"
                          style={{color:PLAN_COLOR[a.plan??"basico"]}}>
                          <Download size={12}/>
                        </button>
                        <button onClick={()=>setDeleteTarget(a)} disabled={a.id==="admin"}
                          className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-red-500/15 text-red-400/60 hover:text-red-400 disabled:opacity-20">
                          <Trash2 size={12}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
          {/* Plan cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {PLAN_ORDER.map(p=>(
              <div key={p} className="rounded-2xl overflow-hidden"
                style={{background:`${PLAN_COLOR[p]}06`,border:`1px solid ${PLAN_COLOR[p]}30`}}>
                <div className="h-1" style={{background:`linear-gradient(90deg,${PLAN_COLOR[p]},transparent)`}}/>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{PLAN_ICON[p]}</span>
                    <div>
                      <div className="font-black text-sm" style={{color:PLAN_COLOR[p]}}>{PLAN_LABEL[p]}</div>
                      <div className="text-[10px] font-bold" style={{color:PLAN_COLOR[p]}}>
                        {PLAN_PRECIOS[p]>0?`${fmt(PLAN_PRECIOS[p])}/mes`:"Gratis"}
                      </div>
                    </div>
                  </div>
                  <div className="text-2xl font-black text-white mb-0.5">
                    {accounts.filter(a=>(a.plan??"basico")===p).length}
                  </div>
                  <div className="text-[9px] text-white/35">clientes activos</div>
                  <div className="mt-3 space-y-1">
                    {PLAN_MODULES[p].map(m=>(
                      <div key={m} className="flex items-center gap-1.5 text-[9px]" style={{color:`${PLAN_COLOR[p]}80`}}>
                        <CheckCircle size={8} style={{color:PLAN_COLOR[p],flexShrink:0}}/> {m}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t" style={{borderColor:`${PLAN_COLOR[p]}20`}}>
                    <div className="text-[9px] text-white/25 mb-1">MRR de este plan</div>
                    <div className="font-black text-sm" style={{color:PLAN_COLOR[p]}}>
                      {fmt(accounts.filter(a=>(a.plan??"basico")===p).length*PLAN_PRECIOS[p])}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Feature matrix */}
          <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(255,255,255,0.08)"}}>
            <div className="px-4 py-3" style={{background:"rgba(255,255,255,0.04)",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><Layers size={14} style={{color:"#a78bfa"}}/> Matriz de módulos por plan</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                    <th className="px-4 py-2.5 text-left text-[10px] text-white/40 font-bold w-40">Módulo</th>
                    {PLAN_ORDER.map(p=>(
                      <th key={p} className="px-3 py-2.5 text-center text-[10px] font-black" style={{color:PLAN_COLOR[p]}}>
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
                        <td className="px-4 py-2 text-[10px] text-white/60">{m.icon} {m.label}</td>
                        {PLAN_ORDER.map((p,j)=>(
                          <td key={p} className="px-3 py-2 text-center">
                            {j>=planIdx
                              ? <CheckCircle size={13} style={{color:PLAN_COLOR[p],margin:"0 auto"}}/>
                              : <XC size={13} style={{color:"rgba(255,255,255,0.12)",margin:"0 auto"}}/>
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
          {/* API Key */}
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
                {apiKeyVis ? "civac_prod_sk_7f3k2m9x_Col2026_xJ8pQrLnZv4wYtD" : "civac_prod_sk_••••••••_Col2026_••••••••••••"}
              </div>
              <CopyBtn text="civac_prod_sk_7f3k2m9x_Col2026_xJ8pQrLnZv4wYtD"/>
              <button className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-[10px] font-bold"
                style={{background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.25)",color:"#f87171"}}>
                <RefreshCw size={11}/> Rotar
              </button>
            </div>
            <p className="text-[9px] text-white/25 mt-2">Último uso: Hace 5 min · Creada: 2026-01-15 · Permisos: read/write</p>
          </div>

          {/* Integrations */}
          <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(255,255,255,0.08)"}}>
            <div className="px-4 py-3" style={{background:"rgba(255,255,255,0.03)",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><Globe size={14} style={{color:"#00c8ff"}}/> Integraciones activas</h3>
            </div>
            <div className="divide-y" style={{borderColor:"rgba(255,255,255,0.04)"}}>
              {API_INTEGRATIONS.map(api=>(
                <div key={api.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="text-2xl flex-shrink-0">{api.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{api.nombre}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${api.estado==="activo"?"bg-green-500/10 text-green-400 border border-green-500/30":"bg-white/5 text-white/30 border border-white/10"}`}>
                        {api.estado}
                      </span>
                    </div>
                    <p className="text-[10px] text-white/40 mt-0.5">{api.desc}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {api.docs!=="#"&&(
                      <a href={api.docs} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px]"
                        style={{background:"rgba(255,255,255,0.04)",color:"rgba(255,255,255,0.35)"}}>
                        <BookOpen size={10}/> Docs
                      </a>
                    )}
                    <button className={`w-8 h-4 rounded-full relative transition-colors`}
                      style={{background:api.estado==="activo"?"rgba(0,245,212,0.35)":"rgba(255,255,255,0.1)"}}>
                      <div className="absolute w-3.5 h-3.5 rounded-full top-0.5 transition-all bg-white"
                        style={{left:api.estado==="activo"?"calc(100% - 1.125rem)":"0.125rem"}}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
                          civac_version: "4.2",
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

          {/* Admin actions */}
          <div className="rounded-2xl p-4" style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)"}}>
            <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Acciones de sistema</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                {label:"Exportar cuentas CSV",    icon:<Download size={12}/>,   color:"#00f5d4" },
                {label:"Reset sesiones",           icon:<RefreshCw size={12}/>,  color:"#fbbf24" },
                {label:"Backup localStorage",      icon:<Database size={12}/>,   color:"#a78bfa" },
                {label:"Vaciar caché SW",          icon:<HardDrive size={12}/>,  color:"#f87171" },
                {label:"Forzar actualización",     icon:<Zap size={12}/>,        color:"#39ff7e" },
                {label:"Test webhook",             icon:<Send size={12}/>,        color:"#00c8ff" },
                {label:"Rotar API keys",           icon:<Key size={12}/>,         color:"#fbbf24" },
                {label:"Ver métricas Lighthouse",  icon:<BarChart3 size={12}/>,   color:"#94a3b8" },
              ].map(a=>(
                <button key={a.label}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] transition-colors hover:bg-white/08 text-left"
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
