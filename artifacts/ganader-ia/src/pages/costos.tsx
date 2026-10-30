import { useState, useEffect, useCallback } from "react";
import { Download, Plus, TrendingUp, TrendingDown, DollarSign, BarChart2, Printer, Edit2, Trash2, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer } from "recharts";

const fmt = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
const fmtM = (n: number) => `$${(n / 1000000).toFixed(2)}M`;

const CAT_INGRESOS = ["Venta leche","Venta ganado","Venta embriones","Venta semen","Subvención","Arriendo potrero","Otro"];
const CAT_EGRESOS  = ["Alimentación","Nómina","Medicamentos","Mantenimiento","Servicios","Transporte","Inseminación","Veterinaria","Combustible","Impuestos","Maquinaria","Otro"];

type Ingreso = { id: number; concepto: string; categoria: string; val: number; fecha: string; notas: string; };
type Egreso  = { id: number; concepto: string; categoria: string; val: number; fecha: string; notas: string; presupuesto: number; };

const SEED_ING: Ingreso[] = [
  { id:1, concepto:"Venta leche 56,040L × $1,250", categoria:"Venta leche",   val:70050000, fecha:"2025-05", notas:"" },
  { id:2, concepto:"Venta ganado (4 cabezas)",      categoria:"Venta ganado",  val:12500000, fecha:"2025-05", notas:"Novillas Lote C" },
  { id:3, concepto:"Venta embriones (3 lotes)",     categoria:"Venta embriones",val:3200000, fecha:"2025-05", notas:"Donante Rosaura" },
];
const SEED_EGR: Egreso[] = [
  { id:1, concepto:"Alimentación / concentrados", categoria:"Alimentación",  val:22400000, fecha:"2025-05", notas:"", presupuesto:21000000 },
  { id:2, concepto:"Nómina y prestaciones",       categoria:"Nómina",        val:17200000, fecha:"2025-05", notas:"9 empleados", presupuesto:17000000 },
  { id:3, concepto:"Medicamentos y sanidad",      categoria:"Medicamentos",  val:3800000,  fecha:"2025-05", notas:"",  presupuesto:4000000 },
  { id:4, concepto:"Mantenimiento y servicios",   categoria:"Mantenimiento", val:2100000,  fecha:"2025-05", notas:"Cerca eléctrica", presupuesto:2500000 },
];

const TIP = { backgroundColor:"#030f0b", border:"1px solid rgba(52,211,153,0.2)", color:"#e2e8f0", borderRadius:"12px", fontSize:"12px" };

function usePersistedCostos() {
  const [ingresos, setIngresosRaw] = useState<Ingreso[]>(() => {
    try { const s = localStorage.getItem("civac_costos_ing"); return s ? JSON.parse(s) : SEED_ING; } catch { return SEED_ING; }
  });
  const [egresos, setEgresosRaw] = useState<Egreso[]>(() => {
    try { const s = localStorage.getItem("civac_costos_egr"); return s ? JSON.parse(s) : SEED_EGR; } catch { return SEED_EGR; }
  });
  const setIngresos = useCallback((fn: (p: Ingreso[]) => Ingreso[]) => {
    setIngresosRaw(prev => { const n = fn(prev); localStorage.setItem("civac_costos_ing", JSON.stringify(n)); return n; });
  }, []);
  const setEgresos = useCallback((fn: (p: Egreso[]) => Egreso[]) => {
    setEgresosRaw(prev => { const n = fn(prev); localStorage.setItem("civac_costos_egr", JSON.stringify(n)); return n; });
  }, []);
  return { ingresos, setIngresos, egresos, setEgresos };
}

const BLANK_ING: Omit<Ingreso,"id"> = { concepto:"", categoria:"Venta leche", val:0, fecha:new Date().toISOString().slice(0,7), notas:"" };
const BLANK_EGR: Omit<Egreso,"id"> = { concepto:"", categoria:"Alimentación", val:0, fecha:new Date().toISOString().slice(0,7), notas:"", presupuesto:0 };

function printPG(ingresos: Ingreso[], egresos: Egreso[], totalIng: number, totalEgr: number, utilidad: number, margen: number) {
  const html = `<!DOCTYPE html><html><head><title>P&G GanaderIA</title><style>
    body{font-family:sans-serif;font-size:12px;margin:24px;color:#111}
    h2{color:#1a4a2e;margin-bottom:4px}p.sub{color:#666;font-size:11px;margin-bottom:16px}
    h3{color:#1a4a2e;margin:14px 0 6px;font-size:13px}
    table{width:100%;border-collapse:collapse;margin-bottom:10px}
    th{background:#1a4a2e;color:#fff;padding:5px 8px;text-align:left;font-size:11px}
    td{padding:5px 8px;border-bottom:1px solid #eee;font-size:11px}
    .total{background:#e8f5e9;font-weight:bold}.utilidad{background:#e0f7fa;font-weight:bold;font-size:13px}
    .red{color:#c62828}.green{color:#1b5e20}
  </style></head><body>
    <h2>Estado de Resultados (P&G) — GanaderIA PRO</h2>
    <p class="sub">Fecha: ${new Date().toLocaleDateString("es-CO")} · Margen: ${margen}%</p>
    <h3>Ingresos</h3>
    <table><thead><tr><th>Concepto</th><th>Categoría</th><th>Fecha</th><th style="text-align:right">Valor</th></tr></thead>
    <tbody>${ingresos.map(r=>`<tr><td>${r.concepto}</td><td>${r.categoria}</td><td>${r.fecha}</td><td style="text-align:right">${fmt(r.val)}</td></tr>`).join("")}
    <tr class="total"><td colspan="3">Total Ingresos</td><td style="text-align:right" class="green">${fmt(totalIng)}</td></tr></tbody></table>
    <h3>Egresos</h3>
    <table><thead><tr><th>Concepto</th><th>Categoría</th><th>Presupuesto</th><th style="text-align:right">Real</th></tr></thead>
    <tbody>${egresos.map(r=>`<tr><td>${r.concepto}</td><td>${r.categoria}</td><td>${r.presupuesto?fmt(r.presupuesto):"—"}</td><td style="text-align:right" class="red">(${fmt(r.val)})</td></tr>`).join("")}
    <tr class="total"><td colspan="3">Total Egresos</td><td style="text-align:right" class="red">(${fmt(totalEgr)})</td></tr></tbody></table>
    <table><tbody><tr class="utilidad"><td colspan="3">UTILIDAD NETA (${margen}% margen)</td><td style="text-align:right" class="green">${fmt(utilidad)}</td></tr></tbody></table>
  </body></html>`;
  const w = window.open("","_blank","width=900,height=700"); w?.document.write(html); w?.print();
}

function exportPG(ingresos: Ingreso[], egresos: Egreso[]) {
  const rows = [
    ["Tipo","Concepto","Categoría","Fecha","Valor","Presupuesto","Notas"],
    ...ingresos.map(r => ["Ingreso", r.concepto, r.categoria, r.fecha, r.val, "", r.notas]),
    ...egresos.map(r =>  ["Egreso",  r.concepto, r.categoria, r.fecha, r.val, r.presupuesto, r.notas]),
  ].map(r => r.join(",")).join("\n");
  const a = document.createElement("a"); a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(rows);
  a.download = `costos_${new Date().toLocaleDateString("es-CO").replace(/\//g,"-")}.csv`; a.click();
}

export default function Costos() {
  const { ingresos, setIngresos, egresos, setEgresos } = usePersistedCostos();

  /* dialogs */
  const [ingDialog, setIngDialog] = useState(false);
  const [egrDialog, setEgrDialog] = useState(false);
  const [ingEdit, setIngEdit] = useState<Ingreso | null>(null);
  const [egrEdit, setEgrEdit] = useState<Egreso  | null>(null);
  const [ingForm, setIngForm] = useState<Omit<Ingreso,"id">>(BLANK_ING);
  const [egrForm, setEgrForm] = useState<Omit<Egreso,"id">>(BLANK_EGR);
  const [delIng, setDelIng] = useState<number | null>(null);
  const [delEgr, setDelEgr] = useState<number | null>(null);

  const totalIngresos = ingresos.reduce((s, r) => s + r.val, 0);
  const totalEgresos  = egresos.reduce((s, r) => s + r.val, 0);
  const utilidad      = totalIngresos - totalEgresos;
  const margen        = totalIngresos > 0 ? Math.round(utilidad / totalIngresos * 100) : 0;
  const totalPres     = egresos.reduce((s, r) => s + (r.presupuesto || 0), 0);
  const varPres       = totalPres > 0 ? Math.round((totalEgresos - totalPres) / totalPres * 100) : 0;

  /* ingreso CRUD */
  function openAddIng() { setIngEdit(null); setIngForm(BLANK_ING); setIngDialog(true); }
  function openEditIng(r: Ingreso) { setIngEdit(r); setIngForm({ concepto:r.concepto, categoria:r.categoria, val:r.val, fecha:r.fecha, notas:r.notas }); setIngDialog(true); }
  function saveIng() {
    if (!ingForm.concepto.trim() || !ingForm.val) return;
    if (ingEdit) { setIngresos(prev => prev.map(r => r.id === ingEdit.id ? { ...ingEdit, ...ingForm } : r)); }
    else { const id = Date.now(); setIngresos(prev => [...prev, { id, ...ingForm }]); }
    setIngDialog(false);
  }
  function deleteIng(id: number) { setIngresos(prev => prev.filter(r => r.id !== id)); setDelIng(null); }

  /* egreso CRUD */
  function openAddEgr() { setEgrEdit(null); setEgrForm(BLANK_EGR); setEgrDialog(true); }
  function openEditEgr(r: Egreso) { setEgrEdit(r); setEgrForm({ concepto:r.concepto, categoria:r.categoria, val:r.val, fecha:r.fecha, notas:r.notas, presupuesto:r.presupuesto }); setEgrDialog(true); }
  function saveEgr() {
    if (!egrForm.concepto.trim() || !egrForm.val) return;
    if (egrEdit) { setEgresos(prev => prev.map(r => r.id === egrEdit.id ? { ...egrEdit, ...egrForm } : r)); }
    else { const id = Date.now(); setEgresos(prev => [...prev, { id, ...egrForm }]); }
    setEgrDialog(false);
  }
  function deleteEgr(id: number) { setEgresos(prev => prev.filter(r => r.id !== id)); setDelEgr(null); }

  /* chart data */
  const catEgr = CAT_EGRESOS.filter(c => egresos.some(e => e.categoria === c))
    .map(c => ({ name: c.slice(0,8), val: egresos.filter(e => e.categoria === c).reduce((s,e) => s+e.val,0) }));

  const maxIng = Math.max(...ingresos.map(r => r.val), 1);
  const maxEgr = Math.max(...egresos.map(r => r.val), 1);

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 civac-animate">

      {/* ── HERO BANNER ── */}
      <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-5 relative overflow-hidden"
        style={{background:"linear-gradient(135deg,#001a0f 0%,#002e1a 40%,#002a18 70%,#001a12 100%)",border:"1px solid rgba(52,211,153,0.3)",boxShadow:"0 0 40px rgba(52,211,153,0.08),inset 0 1px 0 rgba(52,211,153,0.12)"}}>
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full pointer-events-none" style={{background:"radial-gradient(circle,rgba(52,211,153,0.18),transparent 65%)"}}/>
        <div className="absolute -left-8 -bottom-12 w-48 h-48 rounded-full pointer-events-none" style={{background:"radial-gradient(circle,rgba(0,245,212,0.1),transparent 65%)"}}/>
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{background:"linear-gradient(90deg,transparent,#34d399,#00f5d4,transparent)"}}/>
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0"
              style={{background:"linear-gradient(135deg,rgba(52,211,153,0.2),rgba(52,211,153,0.06))",border:"1px solid rgba(52,211,153,0.4)",boxShadow:"0 0 20px rgba(52,211,153,0.3)"}}>
              💰
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-black text-white" style={{fontFamily:"'Sora',sans-serif"}}>Costos y Estado de Resultados</h1>
                <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-black"
                  style={{background:"rgba(52,211,153,0.15)",color:"#34d399",border:"1px solid rgba(52,211,153,0.3)"}}>
                  Margen {margen}%
                </span>
              </div>
              <p className="text-xs sm:text-sm" style={{color:"rgba(52,211,153,0.7)"}}>Rentabilidad editable · P&G dinámico · Presupuesto vs Real</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" onClick={() => exportPG(ingresos, egresos)}
              className="h-9 gap-1.5 text-xs sm:text-sm"
              style={{background:"rgba(52,211,153,0.1)",border:"1px solid rgba(52,211,153,0.3)",color:"#34d399"}}>
              <Download size={13}/> CSV
            </Button>
            <Button size="sm" onClick={() => printPG(ingresos, egresos, totalIngresos, totalEgresos, utilidad, margen)}
              className="h-9 gap-1.5 text-xs sm:text-sm"
              style={{background:"rgba(52,211,153,0.08)",border:"1px solid rgba(52,211,153,0.25)",color:"#34d399"}}>
              <Printer size={13}/> PDF
            </Button>
          </div>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {[
          { label:"Ingresos",      val:fmtM(totalIngresos), sub:"total periodo",        c:"#39ff7e", g:"57,255,126",  icon:<TrendingUp size={14}/>, up:true  },
          { label:"Egresos",       val:fmtM(totalEgresos),  sub:"total periodo",        c:"#ff4d6d", g:"255,77,109",  icon:<TrendingDown size={14}/>, up:false },
          { label:"Utilidad neta", val:fmtM(utilidad),      sub:`${margen}% margen`,    c:"#00f5d4", g:"0,245,212",   icon:<DollarSign size={14}/>, up:utilidad>0  },
          { label:"Presupuesto",   val:fmtM(totalPres),     sub:totalPres>0?`${varPres>0?"+":""}${varPres}% vs real`:"Sin pres.", c:"#fbbf24", g:"251,191,36", icon:<BarChart2 size={14}/>, up:varPres<=0 },
          { label:"Rentabilidad",  val:`${margen}%`,        sub:"sobre ingresos totales", c:"#a855f7", g:"168,85,247", icon:<TrendingUp size={14}/>, up:margen>20 },
        ].map(k=>(
          <div key={k.label} className="rounded-2xl p-3 sm:p-4 relative overflow-hidden transition-all hover:scale-[1.03]"
            style={{background:`linear-gradient(145deg,rgba(${k.g},0.12),rgba(${k.g},0.05),rgba(0,0,0,0.3))`,border:`1px solid rgba(${k.g},0.25)`,borderRadius:18}}>
            <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-15 pointer-events-none"
              style={{background:`radial-gradient(circle,rgba(${k.g},1),transparent)`,transform:"translate(40%,-40%)"}}/>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider" style={{color:`rgba(${k.g},0.7)`}}>{k.label}</div>
              <div style={{color:`rgba(${k.g},0.5)`}}>{k.icon}</div>
            </div>
            <div className="text-xl sm:text-2xl font-black leading-none mb-1" style={{color:`rgba(${k.g},1)`,fontFamily:"'Sora',sans-serif"}}>{k.val}</div>
            <div className="flex items-center gap-1 text-[9px] sm:text-[10px]" style={{color:k.up?"rgba(57,255,126,0.7)":"rgba(255,77,109,0.7)"}}>
              {k.up?<TrendingUp size={9}/>:<TrendingDown size={9}/>}<span>{k.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── P&G Detallado + Chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">

        {/* P&G Detallado */}
        <div className="rounded-2xl sm:rounded-3xl overflow-hidden" style={{border:"1px solid rgba(52,211,153,0.15)",borderRadius:20}}>
          <div className="px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between"
            style={{background:"linear-gradient(135deg,#001a0f,#002e1a)",borderBottom:"1px solid rgba(52,211,153,0.15)"}}>
            <div className="font-black text-sm sm:text-base text-white flex items-center gap-2"><span>📊</span> P&G Detallado</div>
          </div>
          <div className="p-4 sm:p-5 space-y-5" style={{background:"rgba(3,15,10,0.85)"}}>

            {/* INGRESOS */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-2" style={{color:"#39ff7e"}}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#39ff7e] inline-block"/> Ingresos ({ingresos.length})
                </div>
                <Button size="sm" onClick={openAddIng}
                  className="h-7 gap-1 text-[10px]"
                  style={{background:"rgba(57,255,126,0.15)",border:"1px solid rgba(57,255,126,0.35)",color:"#39ff7e"}}>
                  <Plus size={11}/> Agregar
                </Button>
              </div>
              <div className="space-y-1.5">
                {ingresos.map(r => {
                  const pct = Math.round(r.val / totalIngresos * 100) || 0;
                  return (
                    <div key={r.id} className="py-2 border-b last:border-0 group" style={{borderColor:"rgba(255,255,255,0.05)"}}>
                      <div className="flex justify-between items-start gap-1 text-xs sm:text-sm mb-1.5">
                        <div className="flex-1 min-w-0">
                          <span className="text-white/60 block truncate">{r.concepto}</span>
                          <span className="text-[9px] text-white/30">{r.categoria} · {r.fecha}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="font-black text-white">{fmtM(r.val)}</span>
                          <button onClick={() => openEditIng(r)} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-white/10">
                            <Edit2 size={11} className="text-green-400"/>
                          </button>
                          {delIng === r.id ? (
                            <div className="flex gap-0.5">
                              <button onClick={() => deleteIng(r.id)} className="p-0.5 rounded bg-red-500/20 hover:bg-red-500/40"><CheckCircle2 size={10} className="text-red-400"/></button>
                              <button onClick={() => setDelIng(null)} className="p-0.5 rounded hover:bg-white/10"><X size={10} className="text-white/40"/></button>
                            </div>
                          ) : (
                            <button onClick={() => setDelIng(r.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-white/10">
                              <Trash2 size={11} className="text-red-400"/>
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="h-1 rounded-full" style={{background:"rgba(57,255,126,0.1)"}}>
                        <div className="h-full rounded-full" style={{width:`${pct}%`,background:"linear-gradient(90deg,#39ff7e,#34d399)"}}/>
                      </div>
                    </div>
                  );
                })}
                <div className="flex justify-between items-center py-2.5 mt-1 rounded-xl px-3"
                  style={{background:"rgba(57,255,126,0.08)",border:"1px solid rgba(57,255,126,0.15)"}}>
                  <span className="font-black text-sm text-white">Total ingresos</span>
                  <span className="font-black text-base sm:text-lg" style={{color:"#39ff7e"}}>{fmtM(totalIngresos)}</span>
                </div>
              </div>
            </div>

            {/* EGRESOS */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-2" style={{color:"#ff4d6d"}}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d6d] inline-block"/> Egresos ({egresos.length})
                </div>
                <Button size="sm" onClick={openAddEgr}
                  className="h-7 gap-1 text-[10px]"
                  style={{background:"rgba(255,77,109,0.15)",border:"1px solid rgba(255,77,109,0.35)",color:"#ff4d6d"}}>
                  <Plus size={11}/> Agregar
                </Button>
              </div>
              <div className="space-y-1.5">
                {egresos.map(r => {
                  const pct = Math.round(r.val / totalEgresos * 100) || 0;
                  const overBudget = r.presupuesto > 0 && r.val > r.presupuesto;
                  return (
                    <div key={r.id} className="py-2 border-b last:border-0 group" style={{borderColor:"rgba(255,255,255,0.05)"}}>
                      <div className="flex justify-between items-start gap-1 text-xs sm:text-sm mb-1.5">
                        <div className="flex-1 min-w-0">
                          <span className="text-white/60 block truncate">{r.concepto}</span>
                          <span className="text-[9px] text-white/30">{r.categoria} · {r.fecha}
                            {r.presupuesto > 0 && <> · Pres: {fmtM(r.presupuesto)} <span className={overBudget?"text-red-400":"text-green-400"}>{overBudget?"↑ over":"✓ ok"}</span></>}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="font-black" style={{color:"#ff4d6d"}}>({fmtM(r.val)})</span>
                          <button onClick={() => openEditEgr(r)} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-white/10">
                            <Edit2 size={11} className="text-orange-400"/>
                          </button>
                          {delEgr === r.id ? (
                            <div className="flex gap-0.5">
                              <button onClick={() => deleteEgr(r.id)} className="p-0.5 rounded bg-red-500/20 hover:bg-red-500/40"><CheckCircle2 size={10} className="text-red-400"/></button>
                              <button onClick={() => setDelEgr(null)} className="p-0.5 rounded hover:bg-white/10"><X size={10} className="text-white/40"/></button>
                            </div>
                          ) : (
                            <button onClick={() => setDelEgr(r.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-white/10">
                              <Trash2 size={11} className="text-red-400"/>
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="h-1 rounded-full" style={{background:"rgba(255,77,109,0.1)"}}>
                        <div className="h-full rounded-full" style={{width:`${pct}%`,background:"linear-gradient(90deg,#ff4d6d,#c9184a)"}}/>
                      </div>
                      {r.presupuesto > 0 && (
                        <div className="mt-1 h-0.5 rounded-full opacity-40" style={{background:"rgba(255,255,255,0.15)"}}>
                          <div className="h-full rounded-full bg-white/50" style={{width:`${Math.min(100,Math.round(r.presupuesto/totalEgresos*100))}%`}}/>
                        </div>
                      )}
                    </div>
                  );
                })}
                <div className="flex justify-between items-center py-2.5 mt-1 rounded-xl px-3"
                  style={{background:"rgba(255,77,109,0.08)",border:"1px solid rgba(255,77,109,0.15)"}}>
                  <span className="font-black text-sm text-white">Total egresos</span>
                  <span className="font-black text-base sm:text-lg" style={{color:"#ff4d6d"}}>({fmtM(totalEgresos)})</span>
                </div>
              </div>
            </div>

            {/* Utilidad */}
            <div className="rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
              style={{background:"linear-gradient(135deg,rgba(0,245,212,0.1),rgba(52,211,153,0.06))",border:"1px solid rgba(0,245,212,0.25)"}}>
              <div>
                <div className="text-[10px] sm:text-xs font-black uppercase tracking-wider mb-1" style={{color:"rgba(0,245,212,0.6)"}}>UTILIDAD NETA</div>
                <div className="text-2xl sm:text-3xl font-black" style={{color:utilidad>=0?"#00f5d4":"#ff4d6d",fontFamily:"'Sora',sans-serif"}}>{fmtM(utilidad)}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-black" style={{color:margen>=0?"#39ff7e":"#ff4d6d"}}>{margen}%</div>
                <div className="text-[10px] sm:text-xs text-white/40">margen sobre ingresos</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: category breakdown + chart */}
        <div className="space-y-3 sm:space-y-4">

          {/* Egreso por categoría */}
          <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-5"
            style={{background:"rgba(3,15,10,0.85)",border:"1px solid rgba(255,154,60,0.18)",borderRadius:20}}>
            <div className="font-black text-sm sm:text-base text-white mb-4">Desglose egresos por categoría</div>
            <div className="space-y-3">
              {catEgr.map((c,i) => {
                const colors = ["#39ff7e","#00c8ff","#ff9a3c","#fbbf24","#a855f7","#f87171","#34d399","#60a5fa"];
                const col = colors[i % colors.length];
                const pct = Math.round(c.val / totalEgresos * 100) || 0;
                return (
                  <div key={c.name}>
                    <div className="flex justify-between text-[10px] sm:text-xs mb-1.5">
                      <span className="text-white/50">{c.name}</span>
                      <span className="font-black" style={{color:col}}>{fmtM(c.val)} <span className="text-white/30">({pct}%)</span></span>
                    </div>
                    <div className="h-2 sm:h-2.5 rounded-full" style={{background:"rgba(255,255,255,0.06)"}}>
                      <div className="h-full rounded-full" style={{width:`${pct}%`,background:col,boxShadow:`0 0 6px ${col}66`}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Margen por litro */}
          <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-5"
            style={{background:"rgba(3,15,10,0.85)",border:"1px solid rgba(0,245,212,0.15)",borderRadius:20}}>
            <div className="font-black text-sm sm:text-base text-white mb-3">Margen neto por litro (leche)</div>
            <div className="grid grid-cols-5 gap-2 items-center text-center mb-4">
              <div className="col-span-2 rounded-xl sm:rounded-2xl p-2.5 sm:p-3"
                style={{background:"rgba(57,255,126,0.08)",border:"1px solid rgba(57,255,126,0.2)"}}>
                <div className="text-[9px] sm:text-[10px] text-white/40 mb-1">Precio</div>
                <div className="text-lg sm:text-xl font-black" style={{color:"#39ff7e"}}>$1.250</div>
              </div>
              <div className="text-xl sm:text-2xl text-white/30 font-light">−</div>
              <div className="col-span-2 rounded-xl sm:rounded-2xl p-2.5 sm:p-3"
                style={{background:"rgba(255,77,109,0.08)",border:"1px solid rgba(255,77,109,0.2)"}}>
                <div className="text-[9px] sm:text-[10px] text-white/40 mb-1">Costo/L</div>
                <div className="text-lg sm:text-xl font-black" style={{color:"#ff4d6d"}}>$820</div>
              </div>
            </div>
            <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center"
              style={{background:"rgba(0,245,212,0.08)",border:"1px solid rgba(0,245,212,0.2)"}}>
              <div className="text-[10px] text-white/40 mb-1">Margen por litro</div>
              <div className="text-2xl sm:text-3xl font-black" style={{color:"#00f5d4",fontFamily:"'Sora',sans-serif"}}>$430/L</div>
              <div className="text-[10px] text-white/30 mt-1">56.040 L × $430 = $24.1M utilidad leche</div>
            </div>
          </div>

          {/* Chart */}
          <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-5"
            style={{background:"rgba(3,15,10,0.85)",border:"1px solid rgba(52,211,153,0.12)",borderRadius:20}}>
            <div className="font-black text-xs sm:text-sm text-white mb-3">📊 Egresos por categoría</div>
            <div className="h-40 sm:h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={catEgr} margin={{top:0,right:8,left:0,bottom:0}}>
                  <defs>
                    <linearGradient id="gEgrCat" x1="0" y1="0" x2="0" y2="1">
                      <stop stopColor="#ff4d6d"/><stop offset="1" stopColor="#c9184a" stopOpacity={0.5}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                  <XAxis dataKey="name" stroke="transparent" tick={{fill:"rgba(255,255,255,0.4)",fontSize:9}}/>
                  <YAxis stroke="transparent" tick={{fill:"rgba(255,255,255,0.4)",fontSize:9}} width={32} tickFormatter={v=>`$${(v/1000000).toFixed(1)}M`}/>
                  <RTooltip contentStyle={TIP} formatter={(v:any)=>[fmt(Number(v)),"Egreso"]}/>
                  <Bar dataKey="val" fill="url(#gEgrCat)" radius={[5,5,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ── DIALOG INGRESO ── */}
      <Dialog open={ingDialog} onOpenChange={setIngDialog}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><TrendingUp size={16} className="text-green-400"/> {ingEdit ? "Editar Ingreso" : "Nuevo Ingreso"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label>Concepto *</Label>
              <Input value={ingForm.concepto} onChange={e => setIngForm(f=>({...f,concepto:e.target.value}))} placeholder="Ej: Venta leche semana 3" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Categoría</Label>
                <Select value={ingForm.categoria} onValueChange={v => setIngForm(f=>({...f,categoria:v}))}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>{CAT_INGRESOS.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Fecha (AAAA-MM)</Label>
                <Input type="month" value={ingForm.fecha} onChange={e => setIngForm(f=>({...f,fecha:e.target.value}))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Valor (COP) *</Label>
              <Input type="number" min="0" value={ingForm.val || ""} onChange={e => setIngForm(f=>({...f,val:Number(e.target.value)}))} placeholder="0" />
              {ingForm.val > 0 && <p className="text-xs text-muted-foreground">{fmt(ingForm.val)}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Notas</Label>
              <Input value={ingForm.notas} onChange={e => setIngForm(f=>({...f,notas:e.target.value}))} placeholder="Opcional…" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIngDialog(false)}>Cancelar</Button>
            <Button onClick={saveIng} disabled={!ingForm.concepto.trim() || !ingForm.val}
              style={{background:"rgba(57,255,126,0.9)",color:"#052010"}}>
              <CheckCircle2 size={14} className="mr-1.5"/> {ingEdit ? "Guardar cambios" : "Agregar ingreso"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DIALOG EGRESO ── */}
      <Dialog open={egrDialog} onOpenChange={setEgrDialog}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><TrendingDown size={16} className="text-red-400"/> {egrEdit ? "Editar Egreso" : "Nuevo Egreso"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label>Concepto *</Label>
              <Input value={egrForm.concepto} onChange={e => setEgrForm(f=>({...f,concepto:e.target.value}))} placeholder="Ej: Compra concentrado 500 kg" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Categoría</Label>
                <Select value={egrForm.categoria} onValueChange={v => setEgrForm(f=>({...f,categoria:v}))}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>{CAT_EGRESOS.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Fecha (AAAA-MM)</Label>
                <Input type="month" value={egrForm.fecha} onChange={e => setEgrForm(f=>({...f,fecha:e.target.value}))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Valor real (COP) *</Label>
                <Input type="number" min="0" value={egrForm.val || ""} onChange={e => setEgrForm(f=>({...f,val:Number(e.target.value)}))} />
                {egrForm.val > 0 && <p className="text-xs text-muted-foreground">{fmt(egrForm.val)}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Presupuesto (COP)</Label>
                <Input type="number" min="0" value={egrForm.presupuesto || ""} onChange={e => setEgrForm(f=>({...f,presupuesto:Number(e.target.value)}))} placeholder="0" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Notas</Label>
              <Input value={egrForm.notas} onChange={e => setEgrForm(f=>({...f,notas:e.target.value}))} placeholder="Opcional…" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEgrDialog(false)}>Cancelar</Button>
            <Button onClick={saveEgr} disabled={!egrForm.concepto.trim() || !egrForm.val}
              style={{background:"rgba(255,77,109,0.9)",color:"white"}}>
              <CheckCircle2 size={14} className="mr-1.5"/> {egrEdit ? "Guardar cambios" : "Agregar egreso"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
