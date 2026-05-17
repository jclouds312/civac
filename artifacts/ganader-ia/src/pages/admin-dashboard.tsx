import { useState, useMemo } from "react";
import {
  useAuth, PLAN_LABEL, PLAN_COLOR, PLAN_ICON, PLAN_PRECIOS,
  PlanId, Account,
} from "@/lib/auth";
import {
  Users, Crown, CreditCard, Activity, Plus, Trash2, Edit,
  CheckCircle, XCircle, TrendingUp, DollarSign, Clock,
  Server, Database, Building2, RefreshCw, Eye, EyeOff,
  BarChart3, Bell, MonitorSmartphone, Zap, Star, Settings2,
  ChevronRight, Download, Shield, Globe, AlertTriangle,
  ToggleLeft, ToggleRight, Lock, Unlock, Key,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PieChart, Pie, Cell, Tooltip as RTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

/* ── Constants ────────────────────────────────────────────────────────────── */
const PLAN_ORDER: PlanId[] = ["basico", "pro", "premium", "platino"];
const PLAN_MODULES: Record<PlanId, string[]> = {
  basico: ["Dashboard","Inventario","Producción","Potreros","Alertas"],
  pro:    ["Todo Básico","Reproducción","Genética","GPS","Pesaje BT","Insumos","Alimentación","Semen","Costos","Personal"],
  premium:["Todo PRO","Multi-Finca","Predicciones IA","Huella CO₂","Ficha Individual","Pesaje Manual"],
  platino:["Todo Premium","Usuarios & Roles","Configuración","Documentación","Lotes","Datos","Multi-Tenant"],
};
const PLAN_COLORS_PIE = ["#94a3b8","#00f5d4","#a78bfa","#fbbf24"];

const SIMULATED_SESSIONS = [
  { nombre:"Administrador General", email:"admin@civac.co", ultima:"Hace 2 min", ip:"181.132.45.12", dis:"Chrome · Desktop", activa:true },
  { nombre:"Dr. Carlos Ramírez",    email:"vet@ganader.ia", ultima:"Hace 18 min", ip:"190.25.134.88", dis:"Safari · iPhone",  activa:true },
  { nombre:"Luis Patiño",           email:"luis@ganader.ia", ultima:"Hace 1 h",   ip:"181.78.99.201", dis:"Chrome · Android", activa:false },
  { nombre:"Propietario/Inversor",  email:"visor@ganader.ia",ultima:"Hace 3 h",   ip:"190.144.22.55", dis:"Chrome · Desktop", activa:false },
];

const SYS_METRICS = [
  { mes:"Nov", clientes:2, mrr:178 },
  { mes:"Dic", clientes:3, mrr:267 },
  { mes:"Ene", clientes:3, mrr:267 },
  { mes:"Feb", clientes:4, mrr:445 },
  { mes:"Mar", clientes:4, mrr:445 },
  { mes:"Abr", clientes:4, mrr:634 },
  { mes:"May", clientes:4, mrr:634 },
];

const PERMS_BY_ROLE: Record<string, string[]> = {
  admin:  ["inventario","produccion","reproduccion","genetica","potreros","alimentacion","insumos","semen","costos","personal","prediccion","co2","alertas","multifinca","usuarios","configuracion","documentacion","pesaje","gps","planes","admin_pagos"],
  vet:    ["inventario","produccion","reproduccion","genetica","potreros","alimentacion","insumos","semen","prediccion","alertas","documentacion","pesaje","gps"],
  field:  ["inventario","produccion","potreros","alimentacion","insumos","alertas","pesaje"],
  viewer: ["inventario","produccion","costos","prediccion","co2","alertas","gps"],
};

/* ── Small display components ─────────────────────────────────────────────── */
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

/* ── Create/Edit account form ─────────────────────────────────────────────── */
function AccountForm({
  initial, onSave, onClose, isEdit,
}: {
  initial?: Partial<Account>;
  onSave: (d: Omit<Account,"id">) => void;
  onClose: () => void;
  isEdit?: boolean;
}) {
  const [role, setRole] = useState<Account["role"]>((initial?.role as Account["role"]) ?? "viewer");
  const [plan, setPlan] = useState<PlanId>(initial?.plan ?? "basico");
  const [showPw, setShowPw] = useState(false);

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
      permisos: PERMS_BY_ROLE[role] ?? [],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label className="text-xs text-muted-foreground">Nombre completo *</Label>
          <Input name="nombre" defaultValue={initial?.nombre} required placeholder="María García López" className="mt-1" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Cargo</Label>
          <Input name="cargo" defaultValue={initial?.cargo} placeholder="Veterinario, Ordeñador…" className="mt-1" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Finca / Empresa</Label>
          <Input name="finca" defaultValue={initial?.finca ?? ""} placeholder="Finca La Esperanza" className="mt-1" />
        </div>
        <div className="col-span-2">
          <Label className="text-xs text-muted-foreground">Correo electrónico *</Label>
          <Input name="email" type="email" defaultValue={initial?.email} required placeholder="usuario@civac.co" className="mt-1" />
        </div>
        <div className="col-span-2">
          <Label className="text-xs text-muted-foreground">Contraseña {isEdit && "(dejar vacío para mantener)"}</Label>
          <div className="relative mt-1">
            <Input name="password" type={showPw ? "text" : "password"} required={!isEdit}
              placeholder={isEdit ? "••••• sin cambios" : "Mínimo 6 caracteres"} className="pr-9" />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPw ? <EyeOff size={14}/> : <Eye size={14}/>}
            </button>
          </div>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Rol del sistema</Label>
          <Select value={role} onValueChange={v => { setRole(v as Account["role"]); }}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">👑 Administrador</SelectItem>
              <SelectItem value="vet">🩺 Veterinario</SelectItem>
              <SelectItem value="field">🌿 Personal Campo</SelectItem>
              <SelectItem value="viewer">👁 Solo Lectura</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Plan de suscripción</Label>
          <Select value={plan} onValueChange={v => setPlan(v as PlanId)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PLAN_ORDER.map(p => (
                <SelectItem key={p} value={p}>
                  {PLAN_ICON[p]} {PLAN_LABEL[p]}
                  {PLAN_PRECIOS[p] > 0 ? ` · $${(PLAN_PRECIOS[p]/1000).toFixed(0)}k` : " · Gratis"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

/* ── Main Component ───────────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const { accounts, registerUser, updateUser, deleteUser, user: currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Account | null>(null);
  const [planTarget, setPlanTarget] = useState<Account | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null);
  const [newPlan, setNewPlan] = useState<PlanId>("pro");
  const [tab, setTab] = useState("cuentas");

  const clients = accounts.filter(a => a.id !== "admin");
  const filtered = clients.filter(a =>
    a.nombre.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase()) ||
    a.finca.toLowerCase().includes(search.toLowerCase())
  );

  const planDist = useMemo(() =>
    PLAN_ORDER.map(p => ({
      name: PLAN_LABEL[p],
      value: accounts.filter(a => (a.plan ?? "basico") === p).length,
    })), [accounts]);

  const mrrSimulado = useMemo(() =>
    accounts.reduce((s, a) => s + PLAN_PRECIOS[a.plan ?? "basico"] / 1000, 0),
    [accounts]);

  const activosCount = accounts.filter(a => a.activo !== false).length;
  const proCount = accounts.filter(a => (a.plan ?? "basico") !== "basico").length;

  const handleAdd = (data: Omit<Account,"id">) => {
    registerUser(data);
    setAddOpen(false);
  };

  const handleEdit = (data: Omit<Account,"id">) => {
    if (!editTarget) return;
    const upd: Partial<Account> = { ...data };
    if (!data.password) delete upd.password;
    updateUser(editTarget.id, upd);
    setEditTarget(null);
  };

  const doChangePlan = () => {
    if (!planTarget) return;
    updateUser(planTarget.id, {
      plan: newPlan,
      planExpiry: newPlan !== "basico"
        ? new Date(Date.now() + 30*86400000).toISOString().slice(0,10)
        : undefined,
    });
    setPlanTarget(null);
  };

  const toggleStatus = (a: Account) => {
    if (a.id === "admin") return;
    updateUser(a.id, { activo: !(a.activo !== false) });
  };

  const doDelete = () => {
    if (!deleteTarget) return;
    deleteUser(deleteTarget.id);
    setDeleteTarget(null);
  };

  const TIP = { backgroundColor:"#050d18", border:"1px solid rgba(0,245,212,0.2)", color:"#e2e8f0", borderRadius:"12px", fontSize:"11px" };

  return (
    <div className="space-y-4 pb-10 civac-animate">

      {/* ── HERO BANNER ─────────────────────────────────────────────────── */}
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
                alt="CIVAC" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-xl sm:text-2xl font-black text-white" style={{ fontFamily:"'Sora',sans-serif" }}>
                  CIVAC Admin
                </h1>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                  style={{ background:"linear-gradient(135deg,#00f5d4,#00a896)", color:"black" }}>
                  SUPER PANEL
                </span>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                  style={{ background:"linear-gradient(135deg,#fbbf24,#ea580c)", color:"white" }}>
                  v4.2
                </span>
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
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline"
              className="gap-1.5 text-xs border-white/20 text-white/70 hover:text-white hover:border-white/40">
              <Download size={12}/> Exportar
            </Button>
            <Button size="sm" onClick={() => setAddOpen(true)}
              className="gap-1.5 text-xs font-bold"
              style={{ background:"linear-gradient(135deg,#00f5d4,#00a896)", color:"black" }}>
              <Plus size={12}/> Nuevo cliente
            </Button>
          </div>
        </div>
      </div>

      {/* ── KPI STRIP ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label:"Total cuentas", val:accounts.length, sub:"sistemas CIVAC", icon:<Users size={16}/>, from:"#00f5d4", to:"#00a896", glow:"0,245,212" },
          { label:"Cuentas activas", val:activosCount, sub:`${accounts.length - activosCount} inactivas`, icon:<Activity size={16}/>, from:"#39ff7e", to:"#00c850", glow:"57,255,126" },
          { label:"Planes pagos", val:proCount, sub:"PRO / Premium / Platino", icon:<CreditCard size={16}/>, from:"#a78bfa", to:"#7c3aed", glow:"167,139,250" },
          { label:"MRR simulado", val:`$${mrrSimulado.toFixed(0)}k`, sub:"COP mensual recurrente", icon:<DollarSign size={16}/>, from:"#fbbf24", to:"#ea580c", glow:"251,191,36" },
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

      {/* ── MAIN TABS ───────────────────────────────────────────────────── */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="h-9 gap-0.5" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
          {[
            { id:"cuentas",   label:"👥 Cuentas" },
            { id:"planes",    label:"⭐ Planes" },
            { id:"sesiones",  label:"📡 Sesiones" },
            { id:"sistema",   label:"⚙️ Sistema" },
          ].map(t => (
            <TabsTrigger key={t.id} value={t.id}
              className="text-xs px-3 h-7 data-[state=active]:text-[#00f5d4] data-[state=active]:bg-[rgba(0,245,212,0.08)]">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── CUENTAS ── */}
        <TabsContent value="cuentas" className="space-y-3 mt-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Input
                placeholder="Buscar por nombre, email o finca…"
                value={search} onChange={e => setSearch(e.target.value)}
                className="pl-8 text-xs h-8"
                style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)" }}/>
              <Users size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30"/>
            </div>
            <Badge variant="outline" className="text-xs">{filtered.length} clientes</Badge>
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid rgba(255,255,255,0.08)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background:"rgba(0,245,212,0.06)", borderBottom:"1px solid rgba(0,245,212,0.1)" }}>
                  {["Cliente / Finca","Rol","Plan","Estado","Vencimiento","Acciones"].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider font-bold"
                      style={{ color:"rgba(0,245,212,0.6)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-white/25 text-xs">Sin resultados</td></tr>
                )}
                {filtered.map((a, i) => (
                  <tr key={a.id}
                    style={{
                      background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                      borderBottom:"1px solid rgba(255,255,255,0.04)",
                    }}>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                          style={{ background:"rgba(0,245,212,0.1)", border:"1px solid rgba(0,245,212,0.2)" }}>
                          {a.avatar}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{a.nombre}</p>
                          <p className="text-[9px]" style={{ color:"rgba(0,245,212,0.4)" }}>{a.finca} · {a.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-[10px] text-white/50">{a.cargo || a.role}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <PlanBadge plan={a.plan}/>
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusPill activo={a.activo}/>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-[10px] text-white/40">
                        {a.planExpiry ?? "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleStatus(a)}
                          title={a.activo !== false ? "Desactivar" : "Activar"}
                          className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                          style={{ color: a.activo !== false ? "#39ff7e" : "#f87171" }}>
                          {a.activo !== false ? <ToggleRight size={14}/> : <ToggleLeft size={14}/>}
                        </button>
                        <button
                          onClick={() => { setEditTarget(a); }}
                          className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10 text-white/50 hover:text-white">
                          <Edit size={12}/>
                        </button>
                        <button
                          onClick={() => { setPlanTarget(a); setNewPlan(a.plan ?? "basico"); }}
                          className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10 text-purple-400">
                          <Star size={12}/>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(a)}
                          disabled={a.id === "admin"}
                          className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-red-500/15 text-red-400/60 hover:text-red-400 disabled:opacity-20">
                          <Trash2 size={12}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* ── PLANES ── */}
        <TabsContent value="planes" className="mt-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Distribution pie */}
            <div className="rounded-2xl p-4" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)" }}>
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <BarChart3 size={14} style={{ color:"#00f5d4" }}/> Distribución de Planes
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={planDist} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => value > 0 ? `${name}: ${value}` : ""} labelLine={false}>
                    {planDist.map((_, i) => <Cell key={i} fill={PLAN_COLORS_PIE[i]}/>)}
                  </Pie>
                  <RTooltip contentStyle={TIP}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {PLAN_ORDER.map((p, i) => (
                  <div key={p} className="flex items-center gap-1.5 text-[10px]">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background:PLAN_COLORS_PIE[i] }}/>
                    <span className="text-white/50">{PLAN_LABEL[p]}: {accounts.filter(a=>(a.plan??'basico')===p).length}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* MRR chart */}
            <div className="rounded-2xl p-4" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)" }}>
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <TrendingUp size={14} style={{ color:"#fbbf24" }}/> MRR Histórico (miles COP)
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={SYS_METRICS} margin={{ top:4, right:4, left:-20, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                  <XAxis dataKey="mes" tick={{ fontSize:10, fill:"rgba(255,255,255,0.4)" }}/>
                  <YAxis tick={{ fontSize:10, fill:"rgba(255,255,255,0.4)" }}/>
                  <RTooltip contentStyle={TIP}/>
                  <Bar dataKey="mrr" fill="#00f5d4" radius={[4,4,0,0]} name="MRR (k COP)"/>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Plan feature matrix */}
            <div className="lg:col-span-2 rounded-2xl p-4" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)" }}>
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Shield size={14} style={{ color:"#a78bfa" }}/> Módulos por Plan
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PLAN_ORDER.map(p => (
                  <div key={p} className="rounded-xl p-3"
                    style={{ background:`${PLAN_COLOR[p]}08`, border:`1px solid ${PLAN_COLOR[p]}30` }}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-base">{PLAN_ICON[p]}</span>
                      <span className="font-black text-sm" style={{ color:PLAN_COLOR[p] }}>{PLAN_LABEL[p]}</span>
                    </div>
                    <p className="text-[10px] font-bold mb-2" style={{ color:PLAN_COLOR[p] }}>
                      {PLAN_PRECIOS[p] > 0 ? `$${(PLAN_PRECIOS[p]/1000).toFixed(0)}k/mes` : "Gratis"}
                    </p>
                    <ul className="space-y-0.5">
                      {PLAN_MODULES[p].map(m => (
                        <li key={m} className="flex items-center gap-1.5 text-[10px] text-white/60">
                          <CheckCircle size={8} style={{ color:PLAN_COLOR[p], flexShrink:0 }}/> {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── SESIONES ── */}
        <TabsContent value="sesiones" className="mt-3">
          <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid rgba(255,255,255,0.08)" }}>
            <div className="px-4 py-3 flex items-center justify-between"
              style={{ background:"rgba(0,200,255,0.06)", borderBottom:"1px solid rgba(0,200,255,0.1)" }}>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MonitorSmartphone size={14} style={{ color:"#00c8ff" }}/> Sesiones activas
              </h3>
              <span className="text-[10px] text-white/30">{SIMULATED_SESSIONS.filter(s=>s.activa).length} activas ahora</span>
            </div>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                  {["Usuario","Última actividad","IP","Dispositivo","Estado"].map(h => (
                    <th key={h} className="px-4 py-2 text-left text-[10px] uppercase tracking-wider text-white/30">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SIMULATED_SESSIONS.map((s, i) => (
                  <tr key={i} style={{ background: i%2===0 ? "rgba(255,255,255,0.01)" : "transparent", borderBottom:"1px solid rgba(255,255,255,0.03)" }}>
                    <td className="px-4 py-2.5">
                      <p className="text-xs font-bold text-white">{s.nombre}</p>
                      <p className="text-[9px] text-white/35">{s.email}</p>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1 text-[10px] text-white/50">
                        <Clock size={10}/> {s.ultima}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-[10px] text-white/40 font-mono">{s.ip}</td>
                    <td className="px-4 py-2.5 text-[10px] text-white/40">{s.dis}</td>
                    <td className="px-4 py-2.5">
                      {s.activa ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-green-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>Online
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-white/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-white/20"/>Offline
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* ── SISTEMA ── */}
        <TabsContent value="sistema" className="mt-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon:<Server size={18}/>, title:"Versión CIVAC", val:"v4.2.0", sub:"Build 2026-05-17", color:"#00f5d4" },
              { icon:<Database size={18}/>, title:"Almacenamiento", val:"localStorage", sub:"PWA offline-first", color:"#00c8ff" },
              { icon:<Globe size={18}/>, title:"Cobertura", val:"Colombia", sub:"Módulos activos: 20+", color:"#39ff7e" },
              { icon:<Bell size={18}/>, title:"Alertas sistema", val:"0 críticas", sub:"Sistema estable", color:"#34d399" },
              { icon:<RefreshCw size={18}/>, title:"Service Worker", val:"v6 activo", sub:"Cache-first · Offline", color:"#a78bfa" },
              { icon:<Zap size={18}/>, title:"Performance", val:"98 / 100", sub:"Lighthouse PWA", color:"#fbbf24" },
            ].map(s => (
              <div key={s.title} className="rounded-2xl p-4 flex items-center gap-3"
                style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${s.color}20` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background:`${s.color}15`, color:s.color }}>
                  {s.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{s.title}</p>
                  <p className="text-base font-black" style={{ color:s.color }}>{s.val}</p>
                  <p className="text-[9px] text-white/30">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick admin actions */}
          <div className="mt-4 rounded-2xl p-4" style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)" }}>
            <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Acciones rápidas</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { label:"Exportar cuentas CSV", icon:<Download size={12}/>, color:"#00f5d4" },
                { label:"Reset sesiones", icon:<RefreshCw size={12}/>, color:"#fbbf24" },
                { label:"Backup sistema", icon:<Database size={12}/>, color:"#a78bfa" },
                { label:"Ver logs", icon:<BarChart3 size={12}/>, color:"#94a3b8" },
              ].map(a => (
                <button key={a.label}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors hover:bg-white/08"
                  style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${a.color}25`, color:a.color }}
                  onClick={() => {}}>
                  {a.icon} {a.label}
                </button>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── DIALOGS ─────────────────────────────────────────────────────── */}
      {/* Create */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus size={16} style={{ color:"#00f5d4" }}/> Nuevo cliente CIVAC
            </DialogTitle>
          </DialogHeader>
          <AccountForm onSave={handleAdd} onClose={() => setAddOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={!!editTarget} onOpenChange={v => { if (!v) setEditTarget(null); }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit size={16} style={{ color:"#00c8ff" }}/> Editar cuenta
            </DialogTitle>
          </DialogHeader>
          {editTarget && (
            <AccountForm initial={editTarget} onSave={handleEdit} onClose={() => setEditTarget(null)} isEdit />
          )}
        </DialogContent>
      </Dialog>

      {/* Change plan */}
      <Dialog open={!!planTarget} onOpenChange={v => { if (!v) setPlanTarget(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star size={16} style={{ color:"#a78bfa" }}/> Cambiar plan
            </DialogTitle>
          </DialogHeader>
          {planTarget && (
            <div className="space-y-4">
              <div className="rounded-xl p-3 text-sm" style={{ background:"rgba(167,139,250,0.07)", border:"1px solid rgba(167,139,250,0.2)" }}>
                <p className="font-bold text-white">{planTarget.nombre}</p>
                <p className="text-xs text-white/40">{planTarget.email}</p>
                <div className="mt-2"><PlanBadge plan={planTarget.plan}/></div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Nuevo plan</Label>
                <Select value={newPlan} onValueChange={v => setNewPlan(v as PlanId)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PLAN_ORDER.map(p => (
                      <SelectItem key={p} value={p}>
                        {PLAN_ICON[p]} {PLAN_LABEL[p]} {PLAN_PRECIOS[p]>0 ? `· $${(PLAN_PRECIOS[p]/1000).toFixed(0)}k/mes` : "· Gratis"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" size="sm">Cancelar</Button>
                </DialogClose>
                <Button size="sm" onClick={doChangePlan}
                  style={{ background:"linear-gradient(135deg,#a78bfa,#7c3aed)", color:"white" }}>
                  Aplicar plan
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={v => { if (!v) setDeleteTarget(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle size={16}/> Eliminar cuenta
            </DialogTitle>
          </DialogHeader>
          {deleteTarget && (
            <div className="space-y-4">
              <div className="rounded-xl p-3 text-sm" style={{ background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.2)" }}>
                <p className="font-bold text-white">{deleteTarget.nombre}</p>
                <p className="text-xs text-white/40">{deleteTarget.email}</p>
              </div>
              <p className="text-sm text-white/70">
                Esta acción es irreversible. Se eliminará la cuenta y todos sus datos locales.
              </p>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" size="sm">Cancelar</Button>
                </DialogClose>
                <Button size="sm" onClick={doDelete}
                  style={{ background:"linear-gradient(135deg,#ef4444,#b91c1c)", color:"white" }}>
                  <Trash2 size={12} className="mr-1"/> Eliminar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
