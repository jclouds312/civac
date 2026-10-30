import { useState } from "react";
import {
  useAuth, PLAN_LABEL, PLAN_COLOR, PLAN_ICON, PLAN_PRECIOS,
  CIVAC_STAFF_IDS, PlanId, Account,
} from "@/lib/auth";
import {
  UserCircle, Shield, Stethoscope, Milk, BarChart3,
  Search, Plus, Edit, Trash2, CheckCircle, Eye, EyeOff,
  AlertTriangle, Star, Crown, CreditCard, Activity,
  ToggleLeft, ToggleRight, Lock, Users, ChevronDown,
  Key, RefreshCw, Download, XCircle, Clock,
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
import { createManagedAccount, deleteManagedAccount, downloadAccountsCsv, updateManagedAccount } from "@/lib/api";

/* ── Constants ────────────────────────────────────────────────────────────── */
const PLAN_ORDER: PlanId[] = ["basico", "pro", "premium", "platino"];

const CIVAC_MANAGEMENT_PERMS = ["inventario","produccion","reproduccion","genetica","potreros","alimentacion","insumos","semen","costos","personal","prediccion","co2","alertas","multifinca","usuarios","configuracion","documentacion","pesaje","gps","planes","admin_pagos"];

const PERMS_BY_ROLE: Record<string, string[]> = {
  admin:  CIVAC_MANAGEMENT_PERMS,
  superadmin: CIVAC_MANAGEMENT_PERMS,
  developer: CIVAC_MANAGEMENT_PERMS,
  staff: CIVAC_MANAGEMENT_PERMS.filter(permission => permission !== "admin_pagos"),
  cliente:["inventario","produccion","reproduccion","genetica","potreros","alimentacion","insumos","semen","costos","personal","prediccion","co2","alertas","multifinca","documentacion","pesaje","gps"],
  vet:    ["inventario","produccion","reproduccion","genetica","potreros","alimentacion","insumos","semen","prediccion","alertas","documentacion","pesaje","gps"],
  field:  ["inventario","produccion","potreros","alimentacion","insumos","alertas","pesaje"],
  viewer: ["inventario","produccion","costos","prediccion","co2","alertas","gps"],
};

const ALL_PERMS = [
  { key:"inventario",    label:"Inventario" },
  { key:"produccion",    label:"Producción" },
  { key:"reproduccion",  label:"Reproducción" },
  { key:"genetica",      label:"Genética" },
  { key:"potreros",      label:"Potreros" },
  { key:"alimentacion",  label:"Alimentación" },
  { key:"insumos",       label:"Insumos" },
  { key:"semen",         label:"Semen" },
  { key:"costos",        label:"Costos" },
  { key:"personal",      label:"Personal" },
  { key:"prediccion",    label:"Predicción IA" },
  { key:"co2",           label:"CO₂" },
  { key:"alertas",       label:"Alertas" },
  { key:"multifinca",    label:"Multi-Finca" },
  { key:"usuarios",      label:"Usuarios" },
  { key:"configuracion", label:"Config." },
  { key:"documentacion", label:"Docs" },
  { key:"pesaje",        label:"Pesaje BT" },
  { key:"gps",           label:"GPS" },
  { key:"planes",        label:"Planes" },
];

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador", superadmin: "Superadministrador", developer: "Developer CIVAC",
  staff: "Staff CIVAC", cliente: "Cliente Premium", vet: "Veterinario",
  field: "Campo", viewer: "Solo lectura",
};
const ROLE_COLOR: Record<string, string> = {
  admin:"#00f5d4", superadmin:"#fb7185", developer:"#a78bfa", staff:"#38bdf8",
  cliente:"#fbbf24", vet:"#00c8ff", field:"#39ff7e", viewer:"#c084fc",
};

/* ── Sub-components ───────────────────────────────────────────────────────── */
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

/* ── Account form ─────────────────────────────────────────────────────────── */
function UserForm({
  initial, onSave, onClose, isEdit,
}: {
  initial?: Partial<Account>;
  onSave: (d: Omit<Account,"id">) => void;
  onClose: () => void;
  isEdit?: boolean;
}) {
  const [role, setRole] = useState<Account["role"]>((initial?.role as Account["role"]) ?? "viewer");
  const [plan, setPlan] = useState<PlanId>(initial?.plan ?? "basico");
  const [permisos, setPermisos] = useState<string[]>(initial?.permisos ?? PERMS_BY_ROLE["viewer"]);
  const [showPw, setShowPw] = useState(false);

  const handleRoleChange = (r: Account["role"]) => {
    setRole(r);
    setPermisos(PERMS_BY_ROLE[r] ?? []);
  };

  const togglePerm = (key: string) =>
    setPermisos(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const pw = fd.get("password") as string;
    onSave({
      nombre: fd.get("nombre") as string,
      cargo: fd.get("cargo") as string || role,
      finca: fd.get("finca") as string || "Finca El Rancho Verde",
      email: fd.get("email") as string,
      password: isEdit && !pw ? (initial?.password ?? "") : pw,
      avatar: "👤",
      gradient: "from-slate-600 to-slate-800",
      role, plan,
      planExpiry: plan !== "basico" ? new Date(Date.now() + 30*86400000).toISOString().slice(0,10) : undefined,
      activo: true,
      permisos,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label className="text-xs text-muted-foreground">Nombre completo *</Label>
          <Input name="nombre" defaultValue={initial?.nombre} required placeholder="Ej. María García" className="mt-1"/>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Cargo</Label>
          <Input name="cargo" defaultValue={initial?.cargo} placeholder="Veterinario, Ordeñador…" className="mt-1"/>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Finca</Label>
          <Input name="finca" defaultValue={initial?.finca ?? "Finca El Rancho Verde"} className="mt-1"/>
        </div>
        <div className="col-span-2">
          <Label className="text-xs text-muted-foreground">Correo electrónico *</Label>
          <Input name="email" type="email" defaultValue={initial?.email} required placeholder="usuario@civac.co" className="mt-1"/>
        </div>
        <div className="col-span-2">
          <Label className="text-xs text-muted-foreground">
            Contraseña {isEdit && <span className="text-white/30">(dejar vacío para mantener)</span>}
          </Label>
          <div className="relative mt-1">
            <Input name="password" type={showPw ? "text" : "password"}
              required={!isEdit} placeholder={isEdit ? "••••• sin cambios" : "Contraseña de acceso"} className="pr-9"/>
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPw ? <EyeOff size={14}/> : <Eye size={14}/>}
            </button>
          </div>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Rol del sistema</Label>
          <Select value={role} onValueChange={v => handleRoleChange(v as Account["role"])}>
            <SelectTrigger className="mt-1"><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="superadmin">Superadministrador</SelectItem>
              <SelectItem value="developer">Developer CIVAC</SelectItem>
              <SelectItem value="staff">Staff CIVAC</SelectItem>
              <SelectItem value="vet">Veterinario</SelectItem>
              <SelectItem value="field">🌿 Personal Campo</SelectItem>
              <SelectItem value="viewer">👁 Solo Lectura</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Plan de suscripción</Label>
          <Select value={plan} onValueChange={v => setPlan(v as PlanId)}>
            <SelectTrigger className="mt-1"><SelectValue/></SelectTrigger>
            <SelectContent>
              {PLAN_ORDER.map(p => (
                <SelectItem key={p} value={p}>
                  {PLAN_ICON[p]} {PLAN_LABEL[p]}
                  {PLAN_PRECIOS[p] > 0 ? ` · $${(PLAN_PRECIOS[p]/1000).toFixed(0)}k/mes` : " · Gratis"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Permisos de módulo</Label>
        <div className="mt-2 flex flex-wrap gap-1.5 border border-border rounded-lg p-3 bg-muted/20">
          {ALL_PERMS.map(p => (
            <button key={p.key} type="button" onClick={() => togglePerm(p.key)}
              className={`text-xs px-2 py-0.5 rounded-full border transition-all ${
                permisos.includes(p.key)
                  ? "bg-primary/20 text-primary border-primary/40"
                  : "bg-muted/30 text-muted-foreground border-border hover:border-primary/30"
              }`}>
              {p.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{permisos.length} permisos activos</p>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit" className="gap-1.5"
          style={{ background:"linear-gradient(135deg,#00f5d4,#00a896)", color:"black" }}>
          {isEdit ? <><Edit size={13}/> Guardar cambios</> : <><Plus size={13}/> Crear usuario</>}
        </Button>
      </DialogFooter>
    </form>
  );
}

/* ── Main component ───────────────────────────────────────────────────────── */
export default function Usuarios() {
  const {
    accounts, user: currentUser,
    registerUser, updateUser, deleteUser,
  } = useAuth();

  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("cuentas");
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Account | null>(null);
  const [planTarget, setPlanTarget] = useState<Account | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null);
  const [newPlan, setNewPlan] = useState<PlanId>("pro");

  const isAdmin = ["admin", "superadmin", "developer", "staff"].includes(currentUser?.role ?? "");

  const filtered = accounts.filter(a =>
    a.nombre.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase()) ||
    a.cargo.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async (data: Omit<Account,"id">) => {
    const planExpiry = data.planExpiry;
    const remote = await createManagedAccount({
      nombre: data.nombre,
      email: data.email,
      password: data.password,
      cargo: data.cargo,
      finca: data.finca,
      role: data.role,
      planCode: data.plan,
      planExpiry,
      permisos: data.permisos,
      activo: data.activo,
    });
    registerUser({ ...data, ...(remote?.id ? { id: remote.id } : {}) });
    setAddOpen(false);
  };

  const handleEdit = async (data: Omit<Account,"id">) => {
    if (!editTarget) return;
    const upd: Partial<Account> = { ...data };
    if (!data.password) delete upd.password;
    await updateManagedAccount(editTarget.id, {
      ...data,
      planCode: data.plan,
      planExpiry: data.planExpiry,
    });
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

  const doDelete = async () => {
    if (!deleteTarget) return;
    await deleteManagedAccount(deleteTarget.id);
    deleteUser(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleExport = async () => {
    await downloadAccountsCsv();
  };

  return (
    <div className="space-y-4 pb-8 civac-animate">

      {/* ── HERO BANNER ─────────────────────────────────────────────────── */}
      <div className="relative rounded-2xl sm:rounded-3xl p-5 sm:p-6 overflow-hidden"
        style={{
          background:"linear-gradient(135deg,#1a0d40 0%,#2d1a6e 40%,#1a0d50 100%)",
          border:"1px solid rgba(192,132,252,0.3)",
          boxShadow:"0 0 40px rgba(192,132,252,0.08)",
        }}>
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full pointer-events-none"
          style={{ background:"radial-gradient(circle,rgba(192,132,252,0.18),transparent 65%)" }}/>
        <div className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background:"linear-gradient(90deg,transparent,#c084fc,#818cf8,transparent)" }}/>
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Users size={20} className="text-purple-300"/>
              <h1 className="text-xl sm:text-2xl font-black text-white" style={{ fontFamily:"'Sora',sans-serif" }}>
                Gestión de Usuarios
              </h1>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                style={{ background:"rgba(192,132,252,0.2)", border:"1px solid rgba(192,132,252,0.4)", color:"#c084fc" }}>
                {accounts.length} cuentas
              </span>
            </div>
            <p className="text-xs" style={{ color:"rgba(192,132,252,0.6)" }}>
              Crear, editar y administrar cuentas, roles, planes y permisos del sistema
            </p>
          </div>
          {isAdmin && (
            <Button onClick={() => setAddOpen(true)}
              className="gap-1.5 text-sm font-bold flex-shrink-0"
              style={{ background:"linear-gradient(135deg,#c084fc,#7c3aed)", color:"white" }}>
              <Plus size={14}/> Registrar usuario
            </Button>
          )}
        </div>

        {/* Stats row */}
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { label:"Admins",     val:accounts.filter(a=>["admin","superadmin","developer"].includes(a.role)).length, color:"#00f5d4" },
            { label:"Staff CIVAC", val:accounts.filter(a=>a.role==="staff").length, color:"#38bdf8" },
            { label:"Veterinarios",val:accounts.filter(a=>a.role==="vet").length, color:"#00c8ff" },
            { label:"Campo",      val:accounts.filter(a=>a.role==="field").length,            color:"#39ff7e" },
            { label:"Solo lectura",val:accounts.filter(a=>a.role==="viewer").length,          color:"#c084fc" },
            { label:"Activos",    val:accounts.filter(a=>a.activo!==false).length,            color:"#34d399" },
            { label:"Con plan pago",val:accounts.filter(a=>(a.plan??"basico")!=="basico").length, color:"#fbbf24" },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px]"
              style={{ background:`${s.color}12`, border:`1px solid ${s.color}30`, color:s.color }}>
              <span className="font-black">{s.val}</span>
              <span className="opacity-70">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── TABS ────────────────────────────────────────────────────────── */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="h-9 gap-0.5"
          style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
          {[
            { id:"cuentas",  label:"👥 Cuentas" },
            { id:"permisos", label:"🔐 Permisos" },
            { id:"planes",   label:"⭐ Planes" },
          ].map(t => (
            <TabsTrigger key={t.id} value={t.id}
              className="text-xs px-3 h-7 data-[state=active]:text-[#c084fc] data-[state=active]:bg-[rgba(192,132,252,0.08)]">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── CUENTAS TAB ── */}
        <TabsContent value="cuentas" className="space-y-3 mt-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Input placeholder="Buscar por nombre, email o cargo…"
                value={search} onChange={e => setSearch(e.target.value)}
                className="pl-8 text-xs h-8"
                style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)" }}/>
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30"/>
            </div>
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5 text-xs">
                <Download size={13} /> Exportar cuentas CSV
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2">
            {filtered.map(a => (
              <div key={a.id}
                className="rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 transition-all"
                style={{
                  background: a.activo === false
                    ? "rgba(239,68,68,0.04)"
                    : "rgba(255,255,255,0.03)",
                  border: a.activo === false
                    ? "1px solid rgba(239,68,68,0.15)"
                    : `1px solid rgba(${a.role === "admin" ? "0,245,212" : "255,255,255"},0.08)`,
                }}>
                {/* Avatar + name */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg,${ROLE_COLOR[a.role]}20,${ROLE_COLOR[a.role]}08)`,
                      border:`1px solid ${ROLE_COLOR[a.role]}30`,
                    }}>
                    {a.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-white truncate">{a.nombre}</p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                        style={{ background:`${ROLE_COLOR[a.role]}15`, color:ROLE_COLOR[a.role], border:`1px solid ${ROLE_COLOR[a.role]}30` }}>
                        {ROLE_LABEL[a.role]}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/40 mt-0.5 truncate">{a.cargo} · {a.email}</p>
                    <p className="text-[10px] text-white/25 truncate">{a.finca}</p>
                  </div>
                </div>

                {/* Plan + status */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap flex-shrink-0">
                  <PlanBadge plan={a.plan}/>
                  <StatusPill activo={a.activo}/>
                  {a.planExpiry && (
                    <span className="text-[9px] text-white/30 flex items-center gap-0.5">
                      <Clock size={8}/>
                      Exp. {a.planExpiry}
                    </span>
                  )}
                </div>

                {/* Actions */}
                {isAdmin && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => toggleStatus(a)} disabled={a.id === "admin"}
                      title={a.activo !== false ? "Desactivar" : "Activar"}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10 disabled:opacity-30"
                      style={{ color: a.activo !== false ? "#39ff7e" : "#f87171" }}>
                      {a.activo !== false ? <ToggleRight size={15}/> : <ToggleLeft size={15}/>}
                    </button>
                    <button onClick={() => setEditTarget(a)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                      <Edit size={13}/>
                    </button>
                    <button onClick={() => { setPlanTarget(a); setNewPlan(a.plan ?? "basico"); }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-purple-500/15 text-purple-400 transition-colors">
                      <Star size={13}/>
                    </button>
                    <button onClick={() => setDeleteTarget(a)} disabled={a.id === "admin" || !!a.isTemplate || CIVAC_STAFF_IDS.includes(a.id)}
                      title={a.isTemplate ? "Cuenta plantilla — protegida" : a.id === "admin" ? "No eliminable" : "Eliminar"}
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/15 text-red-400/60 hover:text-red-400 disabled:opacity-20 transition-colors">
                      <Trash2 size={13}/>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ── PERMISOS TAB ── */}
        <TabsContent value="permisos" className="mt-3">
          <div className="rounded-2xl overflow-auto" style={{ border:"1px solid rgba(255,255,255,0.08)" }}>
            <table className="w-full text-xs min-w-[600px]">
              <thead>
                <tr style={{ background:"rgba(192,132,252,0.07)", borderBottom:"1px solid rgba(192,132,252,0.12)" }}>
                  <th className="px-4 py-2.5 text-left font-bold text-white/60">Módulo</th>
              {["admin","cliente","vet","field","viewer"].map(r => (
                    <th key={r} className="px-3 py-2.5 text-center font-bold"
                      style={{ color:ROLE_COLOR[r] }}>
                      {ROLE_LABEL[r]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ALL_PERMS.map((p, i) => (
                  <tr key={p.key}
                    style={{ background: i%2===0 ? "rgba(255,255,255,0.015)" : "transparent", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                    <td className="px-4 py-2 text-white/70 font-medium">{p.label}</td>
                    {["admin","vet","field","viewer"].map(r => (
                      <td key={r} className="px-3 py-2 text-center">
                        {PERMS_BY_ROLE[r].includes(p.key) ? (
                          <CheckCircle size={13} style={{ color:ROLE_COLOR[r], margin:"0 auto" }}/>
                        ) : (
                          <span className="text-white/15 text-xs">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* ── PLANES TAB ── */}
        <TabsContent value="planes" className="mt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PLAN_ORDER.map(p => {
              const planAccounts = accounts.filter(a => (a.plan ?? "basico") === p);
              const planModules: Record<PlanId, string[]> = {
                basico:  ["Dashboard","Inventario","Producción","Potreros","Alertas"],
                pro:     ["Todo Básico","Reproducción","Genética","GPS","Pesaje BT","Insumos","Aliment.","Semen","Costos","Personal"],
                premium: ["Todo PRO","Multi-Finca","Predicción IA","CO₂","Ficha","Pesaje Manual"],
                platino: ["Todo Premium","Usuarios","Config.","Docs","Lotes","Datos"],
              };
              return (
                <div key={p} className="rounded-2xl p-4 space-y-3"
                  style={{ background:`${PLAN_COLOR[p]}06`, border:`1px solid ${PLAN_COLOR[p]}25` }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{PLAN_ICON[p]}</span>
                      <div>
                        <p className="font-black text-sm text-white">{PLAN_LABEL[p]}</p>
                        <p className="text-[10px] font-bold" style={{ color:PLAN_COLOR[p] }}>
                          {PLAN_PRECIOS[p] > 0 ? `$${(PLAN_PRECIOS[p]/1000).toFixed(0)}k/mes` : "Gratis"}
                        </p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg font-black"
                      style={{ background:`${PLAN_COLOR[p]}20`, color:PLAN_COLOR[p] }}>
                      {planAccounts.length}
                    </div>
                  </div>

                  <ul className="space-y-1">
                    {planModules[p].map(m => (
                      <li key={m} className="flex items-center gap-1.5 text-[10px] text-white/55">
                        <CheckCircle size={8} style={{ color:PLAN_COLOR[p], flexShrink:0 }}/> {m}
                      </li>
                    ))}
                  </ul>

                  {planAccounts.length > 0 && (
                    <div className="border-t border-white/5 pt-2 space-y-1">
                      {planAccounts.map(a => (
                        <div key={a.id} className="flex items-center gap-1.5 text-[10px]">
                          <span className="text-sm leading-none">{a.avatar}</span>
                          <span className="text-white/50 truncate">{a.nombre}</span>
                          <StatusPill activo={a.activo}/>
                        </div>
                      ))}
                    </div>
                  )}

                  {isAdmin && (
                    <Button size="sm" variant="outline"
                      className="w-full text-[10px] h-7 border-white/15 hover:border-white/30"
                      onClick={() => {}}>
                      Asignar este plan
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Plan comparison note */}
          <div className="mt-3 rounded-xl p-3 text-xs"
            style={{ background:"rgba(251,191,36,0.06)", border:"1px solid rgba(251,191,36,0.2)" }}>
            <p className="font-bold text-amber-400 flex items-center gap-1.5 mb-1">
              <CreditCard size={12}/> Pagos a través de Wompi · Bancolombia
            </p>
            <p className="text-white/40">
              Los cambios de plan se efectúan mediante pago verificado. Contacte al administrador CIVAC para actualizar su licencia.
              Todos los planes incluyen soporte técnico y actualizaciones automáticas.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── DIALOGS ─────────────────────────────────────────────────────── */}
      {/* Create */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus size={16} style={{ color:"#c084fc" }}/> Registrar nuevo usuario
            </DialogTitle>
          </DialogHeader>
          <UserForm onSave={handleAdd} onClose={() => setAddOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={!!editTarget} onOpenChange={v => { if (!v) setEditTarget(null); }}>
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit size={16} style={{ color:"#00c8ff" }}/> Editar usuario
            </DialogTitle>
          </DialogHeader>
          {editTarget && (
            <UserForm initial={editTarget} onSave={handleEdit} onClose={() => setEditTarget(null)} isEdit />
          )}
        </DialogContent>
      </Dialog>

      {/* Change plan */}
      <Dialog open={!!planTarget} onOpenChange={v => { if (!v) setPlanTarget(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star size={16} style={{ color:"#fbbf24" }}/> Cambiar plan
            </DialogTitle>
          </DialogHeader>
          {planTarget && (
            <div className="space-y-4">
              <div className="rounded-xl p-3 text-sm"
                style={{ background:"rgba(251,191,36,0.06)", border:"1px solid rgba(251,191,36,0.15)" }}>
                <p className="font-bold text-white">{planTarget.nombre}</p>
                <p className="text-xs text-white/40">{planTarget.email}</p>
                <div className="mt-1.5"><PlanBadge plan={planTarget.plan}/></div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Nuevo plan</Label>
                <Select value={newPlan} onValueChange={v => setNewPlan(v as PlanId)}>
                  <SelectTrigger className="mt-1"><SelectValue/></SelectTrigger>
                  <SelectContent>
                    {PLAN_ORDER.map(p => (
                      <SelectItem key={p} value={p}>
                        {PLAN_ICON[p]} {PLAN_LABEL[p]}
                        {PLAN_PRECIOS[p]>0 ? ` · $${(PLAN_PRECIOS[p]/1000).toFixed(0)}k/mes` : " · Gratis"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline" size="sm">Cancelar</Button></DialogClose>
                <Button size="sm" onClick={doChangePlan}
                  style={{ background:"linear-gradient(135deg,#fbbf24,#ea580c)", color:"black" }}>
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
              <AlertTriangle size={16}/> Eliminar usuario
            </DialogTitle>
          </DialogHeader>
          {deleteTarget && (
            <div className="space-y-4">
              <div className="rounded-xl p-3"
                style={{ background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.2)" }}>
                <p className="font-bold text-white text-sm">{deleteTarget.nombre}</p>
                <p className="text-xs text-white/40">{deleteTarget.email}</p>
              </div>
              <p className="text-sm text-white/70">Esta acción es irreversible.</p>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline" size="sm">Cancelar</Button></DialogClose>
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
