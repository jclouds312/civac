import { useState, useMemo } from "react";
import { useAppState } from "../lib/data";
import { useTheme } from "../lib/theme";
import {
  Tag, QrCode, MapPin, Clock, Search, Filter, Download,
  Printer, Plus, Beef, CheckCircle2, AlertTriangle, TrendingUp,
  ArrowRight, Building2, Truck, X, Hash, Calendar, FileText,
  BarChart3, Globe, Shield, Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { printModule } from "@/lib/print";
import { downloadCSV } from "@/lib/export";

/* ── Types ─────────────────────────────────────────────────────────────────── */
interface EventoTrazabilidad {
  id: string;
  animalId: string;
  animalNombre: string;
  tipo: "nacimiento" | "compra" | "venta" | "traslado" | "muerte" | "sacrificio" | "robo" | "perdida";
  fecha: string;
  origen: string;
  destino: string;
  responsable: string;
  guia: string;
  descripcion: string;
  precio?: number;
  pesoKg?: number;
  validado: boolean;
}

/* ── Seed Data ─────────────────────────────────────────────────────────────── */
const SEED_EVENTOS: EventoTrazabilidad[] = [
  { id:"T001", animalId:"A-0042", animalNombre:"Rosaura",    tipo:"nacimiento", fecha:"2020-03-15", origen:"Finca La Esperanza",     destino:"Finca La Esperanza",    responsable:"Carlos Meza",   guia:"NAC-2020-042",  descripcion:"Nacimiento en maternidad. Madre: Victoria",                  validado:true  },
  { id:"T002", animalId:"A-0401", animalNombre:"Bravo",      tipo:"compra",     fecha:"2019-07-12", origen:"Subasta Montería",        destino:"Finca La Esperanza",    responsable:"Propietario",   guia:"GMP-2019-401",  descripcion:"Compra toro reproductor Brahman registro oficial",           precio:8500000, pesoKg:680, validado:true  },
  { id:"T003", animalId:"A-0560", animalNombre:"Fortuna",    tipo:"compra",     fecha:"2022-08-17", origen:"Finca El Roble",          destino:"Finca La Esperanza",    responsable:"Ana Gómez",     guia:"GMP-2022-560",  descripcion:"Novilla Jersey preñada · Genética lechera",                  precio:4200000, pesoKg:320, validado:true  },
  { id:"T004", animalId:"A-0667", animalNombre:"Manchas",    tipo:"nacimiento", fecha:"2024-09-10", origen:"Finca La Esperanza",     destino:"Finca La Esperanza",    responsable:"Martha Ríos",   guia:"NAC-2024-667",  descripcion:"Parto de Rosaura. Ternero sano 38 kg al nacimiento",                validado:true  },
  { id:"T005", animalId:"A-0334", animalNombre:"Victoria",   tipo:"traslado",   fecha:"2026-01-10", origen:"Potrero Norte",          destino:"Potrero Maternidad",    responsable:"Luis Patiño",   guia:"TRS-2026-334",  descripcion:"Traslado preparto — semana 8 de secado",                     validado:true  },
  { id:"T006", animalId:"A-0108", animalNombre:"Canela",     tipo:"traslado",   fecha:"2026-04-22", origen:"Lote B",                 destino:"Potrero Maternidad",    responsable:"Carlos Meza",   guia:"TRS-2026-108",  descripcion:"Traslado por cetosis. Monitoreo especial",                   validado:true  },
  { id:"T007", animalId:"A-0150", animalNombre:"Libertad",   tipo:"venta",      fecha:"2026-03-05", origen:"Finca La Esperanza",     destino:"Frigorífico del Norte", responsable:"Propietario",   guia:"VNT-2026-150",  descripcion:"Venta descarte — 488 kg canal",                              precio:5100000, pesoKg:488, validado:true  },
  { id:"T008", animalId:"A-0819", animalNombre:"Copete",     tipo:"traslado",   fecha:"2026-05-01", origen:"Lote B Producción",      destino:"Potrero Maternidad",    responsable:"Pedro Villa",   guia:"TRS-2026-819",  descripcion:"Traslado gestante semana 34 — preparación parto",            validado:false },
  { id:"T009", animalId:"A-0622", animalNombre:"Titan",      tipo:"traslado",   fecha:"2026-02-14", origen:"Potrero Ladera",         destino:"Potrero Norte",         responsable:"Luis Patiño",   guia:"TRS-2026-622",  descripcion:"Rotación de toro — 60 vacas por servicio",                   validado:true  },
  { id:"T010", animalId:"A-0215", animalNombre:"Tormenta",   tipo:"compra",     fecha:"2023-03-22", origen:"Subasta Armenia",        destino:"Finca La Esperanza",    responsable:"Propietario",   guia:"GMP-2023-215",  descripcion:"Novilla Simmental x Gyr registro ICA pendiente",             precio:2900000, pesoKg:198, validado:true  },
];

const TIPO_META: Record<string, { label: string; color: string; glow: string; emoji: string }> = {
  nacimiento: { label:"Nacimiento", color:"#39ff7e", glow:"57,255,126",   emoji:"🐣" },
  compra:     { label:"Compra",     color:"#00c8ff", glow:"0,200,255",    emoji:"🛒" },
  venta:      { label:"Venta",      color:"#fbbf24", glow:"251,191,36",   emoji:"💰" },
  traslado:   { label:"Traslado",   color:"#a855f7", glow:"168,85,247",   emoji:"🚚" },
  muerte:     { label:"Muerte",     color:"#ff4d6d", glow:"255,77,109",   emoji:"💀" },
  sacrificio: { label:"Sacrificio", color:"#f87171", glow:"248,113,113",  emoji:"🥩" },
  robo:       { label:"Robo",       color:"#fb923c", glow:"251,146,60",   emoji:"🚨" },
  perdida:    { label:"Pérdida",    color:"#94a3b8", glow:"148,163,184",  emoji:"❓" },
};

/* ── Component ─────────────────────────────────────────────────────────────── */
export default function Trazabilidad() {
  const { animals } = useAppState();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [eventos, setEventos] = useState<EventoTrazabilidad[]>(SEED_EVENTOS);
  const [search, setSearch] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [qrAnimalId, setQrAnimalId] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<EventoTrazabilidad>>({
    tipo:"traslado", validado:false,
  });

  const filtrados = useMemo(() => {
    return eventos.filter(e => {
      const s = search.toLowerCase();
      const match = s === "" ||
        e.animalNombre.toLowerCase().includes(s) ||
        e.animalId.toLowerCase().includes(s) ||
        e.guia.toLowerCase().includes(s) ||
        e.descripcion.toLowerCase().includes(s);
      const tipo = filtroTipo === "todos" || e.tipo === filtroTipo;
      return match && tipo;
    }).sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [eventos, search, filtroTipo]);

  const kpis = useMemo(() => ({
    total:    eventos.length,
    validados:eventos.filter(e => e.validado).length,
    compras:  eventos.filter(e => e.tipo === "compra").length,
    ventas:   eventos.filter(e => e.tipo === "venta").length,
  }), [eventos]);

  function handleGuardar() {
    if (!form.animalId || !form.fecha || !form.descripcion) return;
    const animal = animals.find(a => a.id === form.animalId);
    const nuevo: EventoTrazabilidad = {
      id: `T${Date.now()}`,
      animalId:      form.animalId!,
      animalNombre:  (animal as any)?.nombre ?? form.animalId!,
      tipo:          form.tipo ?? "traslado",
      fecha:         form.fecha!,
      origen:        form.origen ?? "",
      destino:       form.destino ?? "",
      responsable:   form.responsable ?? "",
      guia:          form.guia ?? `TRS-${Date.now()}`,
      descripcion:   form.descripcion!,
      precio:        form.precio ? Number(form.precio) : undefined,
      pesoKg:        form.pesoKg ? Number(form.pesoKg) : undefined,
      validado:      form.validado ?? false,
    };
    setEventos(prev => [nuevo, ...prev]);
    setModalAbierto(false);
    setForm({ tipo:"traslado", validado:false });
  }

  const card  = isDark ? "rgba(15,30,60,0.6)" : "rgba(255,252,245,0.85)";
  const border = isDark ? "rgba(100,140,255,0.12)" : "rgba(80,80,180,0.2)";

  /* ── Fake QR SVG ──────────────────────────────────────────────────────── */
  function QrDisplay({ id }: { id: string }) {
    const seed = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const cells: boolean[] = Array.from({ length: 49 }, (_, i) => ((seed * (i + 1) * 7) % 17) > 7);
    return (
      <div className="flex flex-col items-center gap-3 p-4">
        <div className="p-3 bg-white rounded-xl">
          <svg width="140" height="140" viewBox="0 0 7 7">
            {cells.map((on, i) => on && (
              <rect key={i} x={i % 7} y={Math.floor(i / 7)} width={1} height={1} fill="#111"/>
            ))}
            <rect x={0} y={0} width={2} height={2} fill="#111"/>
            <rect x={5} y={0} width={2} height={2} fill="#111"/>
            <rect x={0} y={5} width={2} height={2} fill="#111"/>
          </svg>
        </div>
        <p className="text-xs font-mono text-foreground">{id}</p>
        <p className="text-[10px] text-muted-foreground text-center">ICA · CIVAC PRO · Colombia</p>
        <Button size="sm" className="w-full text-xs h-7"
          style={{ background:"linear-gradient(135deg,#a855f7,#7c3aed)", color:"white" }}
          onClick={() => window.print()}>
          <Printer size={11} className="mr-1"/> Imprimir código
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8 civac-animate">

      {/* ── BANNER ─────────────────────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden module-banner"
        style={{ background:"linear-gradient(135deg,#0a0028 0%,#1a0040 40%,#0e0030 100%)",
                 border:"1px solid rgba(168,85,247,0.25)",
                 boxShadow:"0 0 40px rgba(168,85,247,0.08)" }}>
        <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full pointer-events-none"
          style={{ background:"radial-gradient(circle,rgba(168,85,247,0.18),transparent 70%)" }}/>
        <div className="h-0.5 w-full" style={{ background:"linear-gradient(90deg,transparent,#a855f7,#7c3aed,transparent)" }}/>
        <div className="relative p-5 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 rounded-xl" style={{ background:"rgba(168,85,247,0.15)", border:"1px solid rgba(168,85,247,0.3)" }}>
                  <Tag size={20} style={{ color:"#a855f7" }}/>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily:"'Sora',sans-serif" }}>
                    Trazabilidad ICA
                  </h1>
                  <p className="text-xs text-white/50">Movimientos · Guías · Códigos QR · CIVAC v7.0</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm"
                onClick={() => downloadCSV(filtrados.map(e => ({ ...e })), "trazabilidad_civac.csv")}
                className="gap-1.5 text-xs h-8" style={{ background:"rgba(168,85,247,0.1)", border:"1px solid rgba(168,85,247,0.3)", color:"#a855f7" }}>
                <Download size={13}/> CSV
              </Button>
              <Button size="sm" onClick={() => printModule("Trazabilidad ICA","Historial movimientos CIVAC")}
                className="gap-1.5 text-xs h-8" style={{ background:"rgba(168,85,247,0.1)", border:"1px solid rgba(168,85,247,0.3)", color:"#a855f7" }}>
                <Printer size={13}/> PDF
              </Button>
              <Button size="sm" onClick={() => setModalAbierto(true)}
                className="gap-1.5 text-xs h-8 font-bold"
                style={{ background:"linear-gradient(135deg,#a855f7,#7c3aed)", color:"white" }}>
                <Plus size={13}/> Nuevo evento
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPIs ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label:"Total eventos",  val:kpis.total,     color:"#a855f7", glow:"168,85,247",  icon:<Tag size={14}/>,         sub:"en historial" },
          { label:"Validados ICA",  val:kpis.validados, color:"#39ff7e", glow:"57,255,126",  icon:<Shield size={14}/>,      sub:"documentados" },
          { label:"Compras",        val:kpis.compras,   color:"#00c8ff", glow:"0,200,255",   icon:<Truck size={14}/>,       sub:"animales ingresados" },
          { label:"Ventas",         val:kpis.ventas,    color:"#fbbf24", glow:"251,191,36",  icon:<BarChart3 size={14}/>,   sub:"animales egresados" },
        ].map(k => (
          <div key={k.label} className="rounded-xl p-4 relative overflow-hidden" style={{
            background: isDark ? "linear-gradient(145deg,rgba(10,20,40,0.9),rgba(5,15,30,0.9))" : "rgba(255,252,245,0.9)",
            border:`1px solid rgba(${k.glow},0.25)`,
          }}>
            <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none"
              style={{ background:`radial-gradient(circle,rgba(${k.glow},0.18),transparent)`, transform:"translate(40%,-40%)" }}/>
            <div className="flex items-center gap-1.5 mb-2" style={{ color:`rgba(${k.glow},0.7)` }}>
              {k.icon}
              <span className="text-[10px] font-bold uppercase tracking-wider">{k.label}</span>
            </div>
            <div className="text-3xl font-black" style={{ color:`rgba(${k.glow},1)`, textShadow:`0 0 16px rgba(${k.glow},0.4)`, fontFamily:"'Sora',sans-serif" }}>
              {k.val}
            </div>
            <p className="text-[10px] mt-0.5 text-muted-foreground">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* ── FILTROS ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar animal, guía, descripción…"
            className="pl-9 h-9 text-sm bg-background/50"/>
        </div>
        <Select value={filtroTipo} onValueChange={setFiltroTipo}>
          <SelectTrigger className="w-44 h-9 text-sm"><SelectValue placeholder="Tipo evento"/></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {Object.entries(TIPO_META).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.emoji} {v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── TIMELINE EVENTOS ────────────────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden" style={{ border:`1px solid ${border}` }}>
        <div className="px-4 py-3 flex items-center justify-between"
          style={{ background: isDark ? "#1a2a5e" : "#1a2060" }}>
          <span className="text-xs font-black text-white flex items-center gap-2">
            <Activity size={13}/> Historial de Movimientos ICA
            <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[10px]">{filtrados.length}</span>
          </span>
        </div>

        <div className="divide-y divide-white/5">
          {filtrados.length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-sm">Sin eventos</div>
          )}
          {filtrados.map((ev, idx) => {
            const tm = TIPO_META[ev.tipo];
            return (
              <div key={ev.id} className="px-4 py-4 flex gap-3 hover:bg-white/5 transition-colors">
                {/* Timeline dot */}
                <div className="flex flex-col items-center flex-shrink-0 pt-1">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0"
                    style={{ background:`rgba(${tm.glow},0.12)`, border:`1px solid rgba(${tm.glow},0.3)` }}>
                    {tm.emoji}
                  </div>
                  {idx < filtrados.length - 1 && (
                    <div className="w-px flex-1 mt-2 min-h-[20px]" style={{ background:`rgba(${tm.glow},0.1)` }}/>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                          style={{ background:`rgba(${tm.glow},0.12)`, color:tm.color, border:`1px solid rgba(${tm.glow},0.25)` }}>
                          {tm.label}
                        </span>
                        <span className="text-sm font-bold text-foreground">{ev.animalNombre}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">{ev.animalId}</span>
                        {ev.validado ? (
                          <span className="text-[9px] flex items-center gap-0.5 text-green-400"><CheckCircle2 size={9}/> ICA</span>
                        ) : (
                          <span className="text-[9px] flex items-center gap-0.5 text-yellow-400"><AlertTriangle size={9}/> Pendiente</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{ev.descripcion}</p>

                      {/* Origin → Destination */}
                      {(ev.origen || ev.destino) && (
                        <div className="flex items-center gap-1.5 mt-1.5 text-[10px]">
                          <MapPin size={9} style={{ color:"rgba(148,163,184,0.6)" }}/>
                          <span className="text-muted-foreground">{ev.origen}</span>
                          <ArrowRight size={9} style={{ color:`rgba(${tm.glow},0.5)` }}/>
                          <span style={{ color:tm.color }}>{ev.destino}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-3 mt-1.5 flex-wrap text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar size={9}/>{ev.fecha}</span>
                        <span className="flex items-center gap-1"><Hash size={9}/>{ev.guia}</span>
                        {ev.pesoKg && <span className="flex items-center gap-1">⚖️ {ev.pesoKg} kg</span>}
                        {ev.precio && <span className="flex items-center gap-1">💰 ${ev.precio.toLocaleString()}</span>}
                      </div>
                    </div>

                    <button onClick={() => setQrAnimalId(ev.animalId)}
                      className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:scale-105"
                      style={{ background:`rgba(${tm.glow},0.08)`, color:tm.color, border:`1px solid rgba(${tm.glow},0.2)` }}>
                      <QrCode size={11}/> QR
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── QR DIALOG ───────────────────────────────────────────────────── */}
      <Dialog open={!!qrAnimalId} onOpenChange={() => setQrAnimalId(null)}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <QrCode size={15} style={{ color:"#a855f7" }}/> Código QR Trazabilidad
            </DialogTitle>
          </DialogHeader>
          {qrAnimalId && <QrDisplay id={qrAnimalId}/>}
        </DialogContent>
      </Dialog>

      {/* ── MODAL NUEVO EVENTO ──────────────────────────────────────────── */}
      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag size={15} style={{ color:"#a855f7" }}/> Nuevo Evento de Trazabilidad
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="col-span-2">
              <label className="text-xs font-bold text-muted-foreground mb-1 block">Animal *</label>
              <Select value={form.animalId ?? ""} onValueChange={v => setForm(f => ({ ...f, animalId:v }))}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Seleccionar…"/></SelectTrigger>
                <SelectContent>
                  {animals.map(a => (
                    <SelectItem key={a.id} value={a.id}>{(a as any).nombre} ({a.id})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">Tipo *</label>
              <Select value={form.tipo ?? "traslado"} onValueChange={v => setForm(f => ({ ...f, tipo:v as any }))}>
                <SelectTrigger className="h-9 text-sm"><SelectValue/></SelectTrigger>
                <SelectContent>
                  {Object.entries(TIPO_META).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.emoji} {v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">Fecha *</label>
              <Input type="date" value={form.fecha ?? ""} onChange={e => setForm(f => ({ ...f, fecha:e.target.value }))}
                className="h-9 text-sm"/>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">Origen</label>
              <Input value={form.origen ?? ""} onChange={e => setForm(f => ({ ...f, origen:e.target.value }))}
                placeholder="Finca / potrero / predio" className="h-9 text-sm"/>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">Destino</label>
              <Input value={form.destino ?? ""} onChange={e => setForm(f => ({ ...f, destino:e.target.value }))}
                placeholder="Finca / predio / frigorífico" className="h-9 text-sm"/>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">Guía / Nro</label>
              <Input value={form.guia ?? ""} onChange={e => setForm(f => ({ ...f, guia:e.target.value }))}
                placeholder="GMP-2026-XXX" className="h-9 text-sm"/>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">Responsable</label>
              <Input value={form.responsable ?? ""} onChange={e => setForm(f => ({ ...f, responsable:e.target.value }))}
                className="h-9 text-sm"/>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">Precio (COP)</label>
              <Input type="number" value={form.precio ?? ""} onChange={e => setForm(f => ({ ...f, precio:Number(e.target.value) }))}
                placeholder="0" className="h-9 text-sm"/>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">Peso (kg)</label>
              <Input type="number" value={form.pesoKg ?? ""} onChange={e => setForm(f => ({ ...f, pesoKg:Number(e.target.value) }))}
                placeholder="0" className="h-9 text-sm"/>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-bold text-muted-foreground mb-1 block">Descripción *</label>
              <Input value={form.descripcion ?? ""} onChange={e => setForm(f => ({ ...f, descripcion:e.target.value }))}
                placeholder="Detalle del evento…" className="h-9 text-sm"/>
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input type="checkbox" id="validado" checked={form.validado ?? false}
                onChange={e => setForm(f => ({ ...f, validado:e.target.checked }))}
                className="w-4 h-4 rounded accent-purple-500"/>
              <label htmlFor="validado" className="text-xs font-bold text-muted-foreground">
                Validado por ICA / Autoridad sanitaria
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setModalAbierto(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleGuardar}
              style={{ background:"linear-gradient(135deg,#a855f7,#7c3aed)", color:"white", fontWeight:700 }}>
              Registrar evento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
