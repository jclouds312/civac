import { useState, useMemo } from "react";
import { useAppState } from "../lib/data";
import { useTheme } from "../lib/theme";
import {
  HeartPulse, Plus, Search, Filter, Printer, Download, Syringe,
  Thermometer, AlertTriangle, CheckCircle2, Clock, Stethoscope,
  Pill, FlaskConical, FileText, ChevronDown, ChevronUp, X, Beef,
  Activity, TrendingUp, Shield, Calendar, Hash, BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { printModule } from "@/lib/print";

/* ── Types ─────────────────────────────────────────────────────────────────── */
interface RegistroSanidad {
  id: string;
  animalId: string;
  animalNombre: string;
  tipo: "vacuna" | "tratamiento" | "cirugia" | "revision" | "desparasitacion";
  descripcion: string;
  producto: string;
  dosis: string;
  via: string;
  fecha: string;
  proximaFecha?: string;
  veterinario: string;
  estado: "completado" | "pendiente" | "en_curso";
  observaciones: string;
  costo: number;
}

interface ProtocoloVacunacion {
  nombre: string;
  enfermedad: string;
  frecuencia: string;
  proximaFecha: string;
  cobertura: number;
  color: string;
  glow: string;
}

/* ── Seed Data ─────────────────────────────────────────────────────────────── */
const SEED_REGISTROS: RegistroSanidad[] = [
  { id:"S001", animalId:"A-0042", animalNombre:"Rosaura",    tipo:"vacuna",          descripcion:"Vacuna IBR/BVD anual",      producto:"Bovilis MH+IBR",    dosis:"5 mL",  via:"IM",    fecha:"2026-04-10", proximaFecha:"2027-04-10", veterinario:"Martha Ríos",  estado:"completado", observaciones:"Sin reacción adversa",              costo:45000  },
  { id:"S002", animalId:"A-0712", animalNombre:"Perla",      tipo:"tratamiento",     descripcion:"Mastitis clínica cuarto AD",producto:"Penicilina G 4M",   dosis:"20 mL", via:"IM",    fecha:"2026-05-02", proximaFecha:"2026-05-05", veterinario:"Martha Ríos",  estado:"en_curso",   observaciones:"Día 2 de 3 — monitoreo continuo",   costo:28000  },
  { id:"S003", animalId:"A-0401", animalNombre:"Bravo",      tipo:"desparasitacion", descripcion:"Antiparasitario estratégico",producto:"Ivermectina 1%",   dosis:"8 mL",  via:"SC",    fecha:"2026-04-25", proximaFecha:"2026-07-25", veterinario:"Carlos Meza",  estado:"completado", observaciones:"Peso 810 kg al momento",            costo:12000  },
  { id:"S004", animalId:"A-0215", animalNombre:"Tormenta",   tipo:"revision",        descripcion:"Revisión gestación semana 36",producto:"Ecografía",       dosis:"-",     via:"-",     fecha:"2026-05-08", proximaFecha:"2026-05-22", veterinario:"Martha Ríos",  estado:"completado", observaciones:"Feto viable, posición normal",      costo:80000  },
  { id:"S005", animalId:"A-0108", animalNombre:"Canela",     tipo:"tratamiento",     descripcion:"Cetosis subclínica",         producto:"Propilenglicol",   dosis:"300 mL",via:"PO",    fecha:"2026-05-01", proximaFecha:"2026-05-08", veterinario:"Martha Ríos",  estado:"completado", observaciones:"BHB 1.2 mmol/L → recuperada",      costo:15000  },
  { id:"S006", animalId:"A-0667", animalNombre:"Manchas",    tipo:"vacuna",          descripcion:"Vacuna Carbón sintomático",  producto:"Carbuvax",         dosis:"2 mL",  via:"SC",    fecha:"2026-04-20", proximaFecha:"2027-04-20", veterinario:"Pedro Villa",  estado:"completado", observaciones:"Ternero 88 kg — protocolo estándar",costo:8000   },
  { id:"S007", animalId:"A-0622", animalNombre:"Titan",      tipo:"revision",        descripcion:"Examen andrológico semestral",producto:"Prueba calidad semen",dosis:"-", via:"-",     fecha:"2026-03-15", proximaFecha:"2026-09-15", veterinario:"Martha Ríos",  estado:"completado", observaciones:"Motilidad 85% — APTO reproducción", costo:120000 },
  { id:"S008", animalId:"A-0394", animalNombre:"Nube",       tipo:"tratamiento",     descripcion:"Cojera — pododermatitis",    producto:"Peróxido hidróg.", dosis:"Tópico",via:"TÓPICO",fecha:"2026-05-05", proximaFecha:"2026-05-12", veterinario:"Martha Ríos",  estado:"en_curso",   observaciones:"Aplicar sulfato de cobre 2x/semana",costo:5000   },
  { id:"S009", animalId:"A-0273", animalNombre:"Selva",      tipo:"desparasitacion", descripcion:"Fasciola hepatica control",  producto:"Triclabendazol",   dosis:"7 mL",  via:"PO",    fecha:"2026-05-01", proximaFecha:"2026-08-01", veterinario:"Carlos Meza",  estado:"completado", observaciones:"Zona de riesgo alto fasciolosis",   costo:18000  },
  { id:"S010", animalId:"A-0844", animalNombre:"Cariño",     tipo:"vacuna",          descripcion:"Brucelosis vacuna S19",      producto:"S19 Brucella",     dosis:"2 mL",  via:"SC",    fecha:"2026-05-07", proximaFecha:"-",          veterinario:"Martha Ríos",  estado:"pendiente",  observaciones:"Programado semana próxima",         costo:22000  },
];

const PROTOCOLOS: ProtocoloVacunacion[] = [
  { nombre:"IBR/BVD/PI3",   enfermedad:"Rinotraqueítis · Diarrea viral", frecuencia:"Anual",    proximaFecha:"2026-09-10", cobertura:92, color:"#00c8ff", glow:"0,200,255"   },
  { nombre:"Carbón Sintom.", enfermedad:"Clostridium chauvoei",           frecuencia:"Anual",    proximaFecha:"2026-10-15", cobertura:88, color:"#39ff7e", glow:"57,255,126"  },
  { nombre:"Fiebre Aftosa",  enfermedad:"FMD — ICA obligatorio",          frecuencia:"Semestral",proximaFecha:"2026-06-01", cobertura:100,color:"#fbbf24", glow:"251,191,36"  },
  { nombre:"Brucelosis",     enfermedad:"Brucella abortus",               frecuencia:"Una vez",  proximaFecha:"En curso",   cobertura:78, color:"#a855f7", glow:"168,85,247"  },
  { nombre:"Desparasitación",enfermedad:"Helmintos internos/externos",    frecuencia:"Trimestral",proximaFecha:"2026-07-25",cobertura:85, color:"#f87171", glow:"248,113,113" },
];

const TIPO_META: Record<string, { label: string; color: string; glow: string; icon: React.ReactNode }> = {
  vacuna:          { label:"Vacuna",          color:"#39ff7e", glow:"57,255,126",   icon:<Syringe size={12}/> },
  tratamiento:     { label:"Tratamiento",     color:"#ff4d6d", glow:"255,77,109",   icon:<Pill size={12}/> },
  cirugia:         { label:"Cirugía",         color:"#a855f7", glow:"168,85,247",   icon:<Stethoscope size={12}/> },
  revision:        { label:"Revisión",        color:"#00c8ff", glow:"0,200,255",    icon:<FlaskConical size={12}/> },
  desparasitacion: { label:"Desparasitación", color:"#fbbf24", glow:"251,191,36",   icon:<Shield size={12}/> },
};

const ESTADO_META: Record<string, { label: string; color: string }> = {
  completado: { label:"Completado", color:"#39ff7e" },
  pendiente:  { label:"Pendiente",  color:"#fbbf24" },
  en_curso:   { label:"En curso",   color:"#00c8ff" },
};

const VIA_OPTIONS = ["IM","SC","IV","PO","TÓPICO","Intramamario","Nasal","Ocular"];

/* ── Component ─────────────────────────────────────────────────────────────── */
export default function Sanidad() {
  const { animals } = useAppState();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [registros, setRegistros] = useState<RegistroSanidad[]>(SEED_REGISTROS);
  const [search, setSearch] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<RegistroSanidad>>({
    tipo:"vacuna", via:"IM", estado:"completado", costo:0,
  });

  const filtrados = useMemo(() => {
    return registros.filter(r => {
      const matchSearch = search === "" ||
        r.animalNombre.toLowerCase().includes(search.toLowerCase()) ||
        r.descripcion.toLowerCase().includes(search.toLowerCase()) ||
        r.producto.toLowerCase().includes(search.toLowerCase());
      const matchTipo   = filtroTipo   === "todos" || r.tipo   === filtroTipo;
      const matchEstado = filtroEstado === "todos" || r.estado === filtroEstado;
      return matchSearch && matchTipo && matchEstado;
    });
  }, [registros, search, filtroTipo, filtroEstado]);

  const kpis = useMemo(() => {
    const total      = registros.length;
    const enCurso    = registros.filter(r => r.estado === "en_curso").length;
    const pendientes = registros.filter(r => r.estado === "pendiente").length;
    const costoTotal = registros.reduce((a, r) => a + r.costo, 0);
    return { total, enCurso, pendientes, costoTotal };
  }, [registros]);

  function handleGuardar() {
    if (!form.animalId || !form.descripcion || !form.producto || !form.fecha) return;
    const animal = animals.find(a => a.id === form.animalId) ??
      { nombre: form.animalNombre ?? "Animal", id: form.animalId };
    const nuevo: RegistroSanidad = {
      id: `S${Date.now()}`,
      animalId:      animal.id,
      animalNombre:  (animal as any).nombre ?? animal.id,
      tipo:          form.tipo ?? "vacuna",
      descripcion:   form.descripcion!,
      producto:      form.producto!,
      dosis:         form.dosis ?? "-",
      via:           form.via ?? "IM",
      fecha:         form.fecha!,
      proximaFecha:  form.proximaFecha ?? "",
      veterinario:   form.veterinario ?? "Sin asignar",
      estado:        form.estado ?? "completado",
      observaciones: form.observaciones ?? "",
      costo:         Number(form.costo ?? 0),
    };
    setRegistros(prev => [nuevo, ...prev]);
    setModalAbierto(false);
    setForm({ tipo:"vacuna", via:"IM", estado:"completado", costo:0 });
  }

  function handleEliminar(id: string) {
    setRegistros(prev => prev.filter(r => r.id !== id));
  }

  const bg    = isDark ? "hsl(220 45% 16%)" : "hsl(38 22% 84%)";
  const card  = isDark ? "rgba(15,30,60,0.6)" : "rgba(255,252,245,0.85)";
  const border = isDark ? "rgba(0,245,212,0.12)" : "rgba(80,120,60,0.2)";

  return (
    <div className="space-y-5 pb-8 civac-animate">

      {/* ── BANNER ─────────────────────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden module-banner"
        style={{ background:"linear-gradient(135deg,#001a10 0%,#002a18 40%,#001e30 100%)",
                 border:"1px solid rgba(0,245,212,0.2)",
                 boxShadow:"0 0 40px rgba(0,245,212,0.08)" }}>
        <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full pointer-events-none"
          style={{ background:"radial-gradient(circle,rgba(0,245,212,0.15),transparent 70%)" }}/>
        <div className="absolute inset-0 pointer-events-none opacity-5"
          style={{ backgroundImage:"url('https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=20&auto=format&fit=crop') center/cover no-repeat" }}/>
        <div className="h-0.5 w-full" style={{ background:"linear-gradient(90deg,transparent,#00f5d4,#00c8ff,transparent)" }}/>
        <div className="relative p-5 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 rounded-xl" style={{ background:"rgba(0,245,212,0.15)", border:"1px solid rgba(0,245,212,0.3)" }}>
                  <HeartPulse size={20} style={{ color:"#00f5d4" }}/>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily:"'Sora',sans-serif" }}>
                    Sanidad Animal
                  </h1>
                  <p className="text-xs text-white/50">Protocolos · Tratamientos · Registros · CIVAC v7.0</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" onClick={() => printModule("Sanidad Animal","Registros sanitarios CIVAC")}
                className="gap-1.5 text-xs h-8" style={{ background:"rgba(0,245,212,0.1)", border:"1px solid rgba(0,245,212,0.3)", color:"#00f5d4" }}>
                <Printer size={13}/> PDF
              </Button>
              <Button size="sm" onClick={() => setModalAbierto(true)}
                className="gap-1.5 text-xs h-8 font-bold"
                style={{ background:"linear-gradient(135deg,#00f5d4,#00c8ff)", color:"#001a10" }}>
                <Plus size={13}/> Nuevo registro
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPIs ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label:"Total registros", val:kpis.total,    icon:<FileText size={15}/>,   color:"#00f5d4", glow:"0,245,212",   sub:"eventos sanitarios" },
          { label:"En tratamiento",  val:kpis.enCurso,  icon:<HeartPulse size={15}/>, color:"#00c8ff", glow:"0,200,255",   sub:"animales activos" },
          { label:"Pendientes",      val:kpis.pendientes,icon:<Clock size={15}/>,     color:"#fbbf24", glow:"251,191,36",  sub:"requieren acción" },
          { label:"Costo mes",       val:`$${(kpis.costoTotal/1000).toFixed(0)}K`, icon:<BarChart3 size={15}/>, color:"#39ff7e", glow:"57,255,126", sub:"COP en sanidad" },
        ].map(k => (
          <div key={k.label} className="rounded-xl p-4 relative overflow-hidden" style={{
            background: isDark ? `linear-gradient(145deg,rgba(10,20,40,0.9),rgba(5,15,30,0.9))` : "rgba(255,252,245,0.9)",
            border:`1px solid rgba(${k.glow},0.25)`,
            boxShadow:`0 0 20px rgba(${k.glow},0.06)`,
          }}>
            <div className="absolute top-0 right-0 w-16 h-16 rounded-full pointer-events-none"
              style={{ background:`radial-gradient(circle,rgba(${k.glow},0.18),transparent)`, transform:"translate(40%,-40%)" }}/>
            <div className="flex items-center gap-2 mb-2" style={{ color:`rgba(${k.glow},0.7)` }}>
              {k.icon}
              <span className="text-[10px] font-bold uppercase tracking-wider">{k.label}</span>
            </div>
            <div className="text-3xl font-black" style={{ color:`rgba(${k.glow},1)`, textShadow:`0 0 16px rgba(${k.glow},0.5)`, fontFamily:"'Sora',sans-serif" }}>
              {k.val}
            </div>
            <div className="text-[10px] mt-0.5" style={{ color:"rgba(148,163,184,0.6)" }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* ── PROTOCOLOS ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl p-5" style={{ background:card, border:`1px solid ${border}` }}>
        <h3 className="text-sm font-black text-foreground mb-4 flex items-center gap-2">
          <Syringe size={15} style={{ color:"#00f5d4" }}/> Protocolos Vacunación Colombia
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PROTOCOLOS.map(p => (
            <div key={p.nombre} className="rounded-xl p-3.5" style={{
              background:`linear-gradient(135deg,rgba(${p.glow},0.06),rgba(${p.glow},0.02))`,
              border:`1px solid rgba(${p.glow},0.25)`,
            }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black" style={{ color:p.color }}>{p.nombre}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold"
                  style={{ background:`rgba(${p.glow},0.15)`, color:p.color }}>
                  {p.cobertura}%
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mb-2">{p.enfermedad}</p>
              <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width:`${p.cobertura}%`, background:`linear-gradient(90deg,${p.color},${p.color}88)` }}/>
              </div>
              <p className="text-[10px] mt-1.5 text-muted-foreground">
                📅 Próxima: <span style={{ color:p.color }}>{p.proximaFecha}</span> · {p.frecuencia}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FILTROS ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar animal, descripción, producto…"
            className="pl-9 h-9 text-sm bg-background/50"/>
        </div>
        <Select value={filtroTipo} onValueChange={setFiltroTipo}>
          <SelectTrigger className="w-44 h-9 text-sm"><SelectValue placeholder="Tipo"/></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los tipos</SelectItem>
            {Object.entries(TIPO_META).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filtroEstado} onValueChange={setFiltroEstado}>
          <SelectTrigger className="w-40 h-9 text-sm"><SelectValue placeholder="Estado"/></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {Object.entries(ESTADO_META).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* ── TABLA REGISTROS ─────────────────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden" style={{ border:`1px solid ${border}` }}>
        <div className="px-4 py-3 flex items-center justify-between"
          style={{ background: isDark ? "#1a4a2e" : "#2a6040" }}>
          <span className="text-xs font-black text-white flex items-center gap-2">
            <Activity size={13}/> Registros Sanitarios
            <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[10px]">{filtrados.length}</span>
          </span>
        </div>
        <div className="divide-y" style={{ borderColor: border }}>
          {filtrados.length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-sm">Sin registros</div>
          )}
          {filtrados.map(r => {
            const tm  = TIPO_META[r.tipo];
            const em  = ESTADO_META[r.estado];
            const exp = expandedId === r.id;
            return (
              <div key={r.id}>
                <div className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => setExpandedId(exp ? null : r.id)}>
                  {/* Tipo badge */}
                  <div className="w-24 flex-shrink-0">
                    <span className="text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1 w-fit"
                      style={{ background:`rgba(${tm.glow},0.15)`, color:tm.color, border:`1px solid rgba(${tm.glow},0.3)` }}>
                      {tm.icon} {tm.label}
                    </span>
                  </div>
                  {/* Animal + descripción */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Beef size={11} style={{ color:"#00f5d4" }}/>
                      <span className="text-sm font-bold text-foreground">{r.animalNombre}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{r.animalId}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{r.descripcion}</p>
                  </div>
                  {/* Producto */}
                  <div className="hidden sm:block w-36 text-xs text-foreground/80 font-medium truncate">{r.producto}</div>
                  {/* Fecha */}
                  <div className="hidden md:block w-24 text-[11px] text-muted-foreground">{r.fecha}</div>
                  {/* Estado */}
                  <div className="w-24">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background:`${em.color}20`, color:em.color, border:`1px solid ${em.color}40` }}>
                      {em.label}
                    </span>
                  </div>
                  {/* Expand */}
                  <div className="text-muted-foreground">
                    {exp ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                  </div>
                </div>
                {exp && (
                  <div className="px-5 pb-4 pt-1 grid grid-cols-2 sm:grid-cols-4 gap-3"
                    style={{ background: isDark ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.03)" }}>
                    {[
                      ["Dosis",         r.dosis],
                      ["Vía",           r.via],
                      ["Veterinario",   r.veterinario],
                      ["Costo",        `$${r.costo.toLocaleString()}`],
                      ["Próxima fecha", r.proximaFecha || "—"],
                      ["Observaciones", r.observaciones || "—"],
                    ].map(([label, val]) => (
                      <div key={label as string}>
                        <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground mb-0.5">{label as string}</p>
                        <p className="text-xs text-foreground font-medium">{val as string}</p>
                      </div>
                    ))}
                    <div className="flex items-end">
                      <button onClick={(e) => { e.stopPropagation(); handleEliminar(r.id); }}
                        className="text-[10px] flex items-center gap-1 px-2 py-1 rounded-lg transition-all hover:opacity-80"
                        style={{ background:"rgba(255,77,109,0.12)", color:"#ff4d6d", border:"1px solid rgba(255,77,109,0.25)" }}>
                        <X size={10}/> Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MODAL NUEVO REGISTRO ─────────────────────────────────────────── */}
      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HeartPulse size={16} style={{ color:"#00f5d4" }}/> Nuevo Registro Sanitario
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="col-span-2">
              <label className="text-xs font-bold text-muted-foreground mb-1 block">Animal *</label>
              <Select value={form.animalId ?? ""} onValueChange={v => {
                const a = animals.find(x => x.id === v);
                setForm(f => ({ ...f, animalId:v, animalNombre:(a as any)?.nombre ?? v }));
              }}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Seleccionar animal"/></SelectTrigger>
                <SelectContent>
                  {animals.map(a => (
                    <SelectItem key={a.id} value={a.id}>{(a as any).nombre} ({a.id})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">Tipo *</label>
              <Select value={form.tipo ?? "vacuna"} onValueChange={v => setForm(f => ({ ...f, tipo:v as any }))}>
                <SelectTrigger className="h-9 text-sm"><SelectValue/></SelectTrigger>
                <SelectContent>
                  {Object.entries(TIPO_META).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">Estado</label>
              <Select value={form.estado ?? "completado"} onValueChange={v => setForm(f => ({ ...f, estado:v as any }))}>
                <SelectTrigger className="h-9 text-sm"><SelectValue/></SelectTrigger>
                <SelectContent>
                  {Object.entries(ESTADO_META).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-bold text-muted-foreground mb-1 block">Descripción *</label>
              <Input value={form.descripcion ?? ""} onChange={e => setForm(f => ({ ...f, descripcion:e.target.value }))}
                placeholder="Ej: Vacuna IBR/BVD anual" className="h-9 text-sm"/>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">Producto *</label>
              <Input value={form.producto ?? ""} onChange={e => setForm(f => ({ ...f, producto:e.target.value }))}
                placeholder="Nombre comercial" className="h-9 text-sm"/>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">Dosis</label>
              <Input value={form.dosis ?? ""} onChange={e => setForm(f => ({ ...f, dosis:e.target.value }))}
                placeholder="Ej: 5 mL" className="h-9 text-sm"/>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">Vía</label>
              <Select value={form.via ?? "IM"} onValueChange={v => setForm(f => ({ ...f, via:v }))}>
                <SelectTrigger className="h-9 text-sm"><SelectValue/></SelectTrigger>
                <SelectContent>{VIA_OPTIONS.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">Fecha *</label>
              <Input type="date" value={form.fecha ?? ""} onChange={e => setForm(f => ({ ...f, fecha:e.target.value }))}
                className="h-9 text-sm"/>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">Próxima fecha</label>
              <Input type="date" value={form.proximaFecha ?? ""} onChange={e => setForm(f => ({ ...f, proximaFecha:e.target.value }))}
                className="h-9 text-sm"/>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">Costo (COP)</label>
              <Input type="number" value={form.costo ?? ""} onChange={e => setForm(f => ({ ...f, costo:Number(e.target.value) }))}
                placeholder="0" className="h-9 text-sm"/>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">Veterinario</label>
              <Input value={form.veterinario ?? ""} onChange={e => setForm(f => ({ ...f, veterinario:e.target.value }))}
                placeholder="Nombre profesional" className="h-9 text-sm"/>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-bold text-muted-foreground mb-1 block">Observaciones</label>
              <Input value={form.observaciones ?? ""} onChange={e => setForm(f => ({ ...f, observaciones:e.target.value }))}
                placeholder="Notas adicionales…" className="h-9 text-sm"/>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setModalAbierto(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleGuardar}
              style={{ background:"linear-gradient(135deg,#00f5d4,#00c8ff)", color:"#001a10", fontWeight:700 }}>
              Guardar registro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
