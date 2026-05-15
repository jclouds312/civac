import { useState } from "react";
import { useAppState } from "../lib/data";
import { useAuth } from "../lib/auth";
import {
  Scale, Bluetooth, Printer, Save, CheckCircle2, TrendingUp, TrendingDown,
  RotateCcw, Search, ChevronRight, Zap, ClipboardList, Activity,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const fmt = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

const PESOS_RAZA: Record<string, Record<string, number>> = {
  Holstein:    { "Vaca adulta":560, Novilla:380, Ternero:180, Ternera:170, Toro:700 },
  Brahman:     { "Vaca adulta":520, Novilla:340, Ternero:200, Ternera:185, Toro:750 },
  Simmental:   { "Vaca adulta":600, Novilla:400, Ternero:210, Ternera:195, Toro:800 },
  Angus:       { "Vaca adulta":580, Novilla:370, Ternero:195, Ternera:180, Toro:780 },
  Cebu:        { "Vaca adulta":490, Novilla:320, Ternero:175, Ternera:165, Toro:720 },
  "Gyr Lechero":{ "Vaca adulta":470, Novilla:310, Ternero:160, Ternera:155, Toro:680 },
  Normando:    { "Vaca adulta":610, Novilla:410, Ternero:215, Ternera:200, Toro:820 },
};

const CAT_ICON: Record<string, { emoji: string; color: string; glow: string; bg: string; border: string }> = {
  "Vaca adulta": { emoji:"🐄", color:"#00f5d4", glow:"0,245,212",   bg:"rgba(0,245,212,0.10)",  border:"rgba(0,245,212,0.30)"  },
  Novilla:       { emoji:"🐮", color:"#a78bfa", glow:"167,139,250", bg:"rgba(167,139,250,0.10)", border:"rgba(167,139,250,0.30)" },
  Ternero:       { emoji:"🐂", color:"#fbbf24", glow:"251,191,36",  bg:"rgba(251,191,36,0.10)",  border:"rgba(251,191,36,0.30)"  },
  Ternera:       { emoji:"🐃", color:"#f472b6", glow:"244,114,182", bg:"rgba(244,114,182,0.10)", border:"rgba(244,114,182,0.30)" },
  Toro:          { emoji:"🦬", color:"#f87171", glow:"248,113,113", bg:"rgba(248,113,113,0.10)", border:"rgba(248,113,113,0.30)" },
};

const CC_OPTS = [
  { val:"1.0", emoji:"💀", label:"Muy delgada", color:"#f87171" },
  { val:"1.5", emoji:"😰", label:"Delgada",     color:"#fb923c" },
  { val:"2.0", emoji:"😟", label:"Bajo normal", color:"#fbbf24" },
  { val:"2.5", emoji:"😐", label:"Normal bajo", color:"#facc15" },
  { val:"3.0", emoji:"😊", label:"Ideal",       color:"#a3e635" },
  { val:"3.5", emoji:"🌟", label:"Buena",       color:"#39ff7e" },
  { val:"4.0", emoji:"✅", label:"Alta",         color:"#34d399" },
  { val:"4.5", emoji:"⚠️", label:"Muy alta",    color:"#f59e0b" },
  { val:"5.0", emoji:"🚨", label:"Obesa",       color:"#f87171" },
];

const LOTE_COLOR: Record<string, string> = {
  "Lote A":"#00f5d4","Lote B":"#ff6fd8","Lote C":"#fbbf24",
  "Lote D":"#39ff7e","Lote E":"#00c8ff","Lote F":"#f472b6",
};

type Row = {
  peso: string; pesoPrev: string; cc: string; valorKilo: string;
  saved: boolean; btLoading: boolean; obs: string;
};

export default function PesajeManual() {
  const { animals, setAnimals, pesajes, setPesajes } = useAppState();
  const { user } = useAuth();

  const [rows,   setRows]   = useState<Record<string, Row>>({});
  const [focusId, setFocusId] = useState<string | null>(null);
  const [lote,   setLote]   = useState("Todos");
  const [search, setSearch] = useState("Todos");
  const [searchQ, setSearchQ] = useState("");
  const [sessionLog, setSessionLog] = useState<{
    animalId:string; nombre:string; peso:number; anterior:number;
    cc:string; gmd:number; valor:number; hora:string;
  }[]>([]);
  const [showRef, setShowRef] = useState(false);

  const lista = animals.filter(a => {
    const m = a.nombre.toLowerCase().includes(searchQ.toLowerCase()) ||
              a.id.toLowerCase().includes(searchQ.toLowerCase());
    return m && (lote === "Todos" || a.lote === lote) &&
                (search === "Todos" || a.categoria === search);
  });

  const getRow = (a: typeof animals[0]): Row =>
    rows[a.id] ?? {
      peso: String(a.peso), pesoPrev: String(a.peso),
      cc: "3.0", valorKilo: String(a.valorKilo || 11000),
      saved: false, btLoading: false, obs: "",
    };

  const upd = (id: string, patch: Partial<Row>) =>
    setRows(p => ({ ...p, [id]: { ...getRow(animals.find(a=>a.id===id)!), ...p[id], ...patch } }));

  const focused = focusId ? animals.find(a => a.id === focusId) ?? null : null;
  const fRow = focused ? getRow(focused) : null;
  const fCat = focused ? (CAT_ICON[focused.categoria] || CAT_ICON["Vaca adulta"]) : null;
  const fPeso = fRow ? Number(fRow.peso) || focused!.peso : 0;
  const fPrev = fRow ? Number(fRow.pesoPrev) || focused!.peso : 0;
  const fDiff = fPeso - fPrev;
  const fEsp  = focused ? (PESOS_RAZA[focused.raza]?.[focused.categoria] || focused.peso) : 0;
  const fPct  = fEsp ? Math.min(100, Math.round((fPeso / fEsp) * 100)) : 0;
  const fValor = fRow ? fPeso * (Number(fRow.valorKilo) || 0) : 0;
  // GMD: diferencia / 30 días estimados
  const fGmd = Math.abs(fDiff) > 0 ? +(fDiff / 30).toFixed(2) : 0;

  const pending = lista.filter(a => !rows[a.id]?.saved).length;
  const done    = lista.filter(a =>  rows[a.id]?.saved).length;

  const saveRow = (a: typeof animals[0]) => {
    const row = getRow(a);
    const pesoN = Number(row.peso);
    if (!pesoN) return;
    const now   = new Date();
    const hora  = now.toLocaleTimeString("es-CO", { hour:"2-digit", minute:"2-digit" });
    const gmd   = +((pesoN - a.peso) / 30).toFixed(2);
    const pesaje = {
      id: Date.now(), animalId: a.id, animalNombre: a.nombre,
      peso: pesoN, pesoAnterior: a.peso,
      fecha: now.toLocaleDateString("es-CO"), hora,
      metodo: "manual", dispositivo: "",
      operador: user?.nombre || "Admin",
      observacion: `CC: ${row.cc} | GMD: ${gmd} kg/día | ${row.obs}`,
      lote: a.lote, categoria: a.categoria,
    };
    setPesajes(p => [pesaje, ...p]);
    setAnimals(p => p.map(x => x.id === a.id
      ? { ...x, peso: pesoN, valorKilo: Number(row.valorKilo) || x.valorKilo }
      : x));
    setRows(p => ({ ...p, [a.id]: { ...getRow(a), ...p[a.id], saved: true, btLoading: false } }));
    setSessionLog(p => [{
      animalId: a.id, nombre: a.nombre, peso: pesoN, anterior: a.peso,
      cc: row.cc, gmd, valor: pesoN * (Number(row.valorKilo) || 0), hora,
    }, ...p]);
  };

  const saveAndNext = (a: typeof animals[0]) => {
    saveRow(a);
    const next = lista.find(x => !rows[x.id]?.saved && x.id !== a.id);
    setFocusId(next?.id ?? null);
  };

  const btSim = (a: typeof animals[0]) => {
    upd(a.id, { btLoading: true });
    const base = PESOS_RAZA[a.raza]?.[a.categoria] || a.peso;
    const sim  = +(base * (0.93 + Math.random() * 0.14)).toFixed(1);
    setTimeout(() => upd(a.id, { peso: String(sim), btLoading: false, saved: false }), 1500);
  };

  const printReceipt = (a: typeof animals[0]) => {
    const row  = getRow(a);
    const pN   = Number(row.peso) || a.peso;
    const diff = pN - a.peso;
    const gmd  = +((pN - a.peso) / 30).toFixed(2);
    const vT   = pN * (Number(row.valorKilo) || 0);
    const now  = new Date();
    const ccInfo = CC_OPTS.find(c => c.val === row.cc);
    const w = window.open("", "_blank", "width=520,height=700");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
      <title>Recibo Pesaje — ${a.nombre}</title>
      <style>
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#111;padding:24px}
        .logo{font-size:24px;text-align:center;margin-bottom:4px}
        h2{text-align:center;font-size:16px;font-weight:900;letter-spacing:1px;text-transform:uppercase;margin-bottom:2px}
        .sub{text-align:center;font-size:10px;color:#888;margin-bottom:16px}
        .big{text-align:center;padding:18px 0;font-size:52px;font-weight:900;letter-spacing:4px;
          border:3px solid #111;border-radius:16px;background:#f9f9f9;margin:14px 0}
        .diff{font-size:20px;font-weight:700;color:${diff>=0?"#22c55e":"#ef4444"}}
        table{width:100%;border-collapse:collapse;font-size:12px;margin-top:12px}
        td{padding:7px 10px;border-bottom:1px solid #eee}
        td:first-child{font-weight:700;color:#555;width:160px}
        .cc-badge{display:inline-block;padding:3px 10px;border-radius:20px;font-weight:700;font-size:12px;background:#f0fdf4;border:1px solid #22c55e;color:#16a34a}
        .footer{margin-top:20px;font-size:9px;color:#ccc;text-align:center;border-top:1px solid #eee;padding-top:10px}
        @media print{body{padding:12px}button{display:none}}
      </style></head><body>
      <div class="logo">🐄</div>
      <h2>CIVAC PRO · Pesaje Manual</h2>
      <div class="sub">${now.toLocaleDateString("es-CO",{weekday:"long",year:"numeric",month:"long",day:"numeric"})} · ${now.toLocaleTimeString("es-CO",{hour:"2-digit",minute:"2-digit"})}</div>
      <div class="big">${pN.toFixed(1)} <span style="font-size:22px;color:#777">kg</span>
        <br/><span class="diff">${diff>=0?"+":""}${diff.toFixed(1)} kg</span>
      </div>
      <table><tbody>
        <tr><td>Animal</td><td><strong>${a.nombre}</strong></td></tr>
        <tr><td>Arete / ID</td><td>#${a.id}</td></tr>
        <tr><td>Raza</td><td>${a.raza}</td></tr>
        <tr><td>Categoría</td><td>${a.categoria}</td></tr>
        <tr><td>Lote</td><td>${a.lote}</td></tr>
        <tr><td>Peso anterior</td><td>${a.peso} kg</td></tr>
        <tr><td>Peso registrado</td><td><strong>${pN.toFixed(1)} kg</strong></td></tr>
        <tr><td>Estándar raza</td><td>${fEsp} kg · ${fPct}% del estándar</td></tr>
        <tr><td>Cond. Corporal</td><td><span class="cc-badge">${ccInfo?.emoji} CC ${row.cc} — ${ccInfo?.label}</span></td></tr>
        <tr><td>GMD estimada</td><td>${gmd >= 0 ? "+" : ""}${gmd} kg/día</td></tr>
        ${vT>0?`<tr><td>Valor estimado</td><td><strong>${fmt(vT)}</strong></td></tr>`:""}
        ${row.obs?`<tr><td>Observaciones</td><td>${row.obs}</td></tr>`:""}
        <tr><td>Operador</td><td>${user?.nombre || "Admin"}</td></tr>
      </tbody></table>
      <div class="footer">CIVAC PRO v3.0 · GanaderIA Colombia · Pesaje Manual con CC</div>
      <script>window.onload=function(){window.print();setTimeout(function(){window.close()},900)}<\/script>
    </body></html>`);
    w.document.close();
  };

  return (
    <div className="space-y-4">

      {/* ── HERO BANNER ─────────────────────────────────────────────────────── */}
      <div className="rounded-2xl p-5 relative overflow-hidden"
        style={{
          background:"linear-gradient(135deg,#120028,#1e0040,#2a005a,#1e0040)",
          border:"1px solid rgba(192,132,252,0.4)",
          boxShadow:"0 0 50px rgba(192,132,252,0.12)",
        }}>
        {/* Decorative blobs */}
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full pointer-events-none opacity-15"
          style={{background:"radial-gradient(circle,#c084fc,transparent)"}}/>
        <div className="absolute -left-6 bottom-0 w-32 h-32 rounded-full pointer-events-none opacity-10"
          style={{background:"radial-gradient(circle,#7c3aed,transparent)"}}/>
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{
                background:"linear-gradient(135deg,rgba(192,132,252,0.25),rgba(124,58,237,0.15))",
                border:"1px solid rgba(192,132,252,0.5)",
                boxShadow:"0 0 28px rgba(192,132,252,0.35)",
              }}>
              📐
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="font-black text-white text-xl" style={{fontFamily:"Sora,sans-serif"}}>
                  Pesaje Manual
                </h1>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-black"
                  style={{background:"rgba(192,132,252,0.15)",color:"#c084fc",border:"1px solid rgba(192,132,252,0.4)"}}>
                  CC · GMD · PDF
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-black"
                  style={{background:"rgba(0,200,255,0.1)",color:"#00c8ff",border:"1px solid rgba(0,200,255,0.3)"}}>
                  ⚡ BT Simulado
                </span>
              </div>
              <p className="text-xs mb-2" style={{color:"rgba(192,132,252,0.6)"}}>
                Condición corporal visual · Ganancia media diaria · Valor por kilo · Recibo imprimible
              </p>
              <div className="flex gap-3 flex-wrap">
                {[
                  {val:String(lista.length), label:"en vista",  c:"192,132,252"},
                  {val:String(pending),      label:"pendientes", c:"251,191,36"},
                  {val:String(done),         label:"guardados",  c:"57,255,126"},
                  {val:String(pesajes.filter(p=>p.fecha===new Date().toLocaleDateString("es-CO")).length), label:"pesajes hoy", c:"0,200,255"},
                ].map(b=>(
                  <span key={b.label} className="flex items-center gap-1.5 text-[10px]" style={{color:`rgba(${b.c},0.85)`}}>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background:`rgb(${b.c})`}}/>
                    <strong className="font-black">{b.val}</strong> {b.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {/* Filters bar */}
          <div className="flex gap-2 flex-wrap flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2" size={11} style={{color:"rgba(192,132,252,0.5)"}}/>
              <Input value={searchQ} onChange={e=>setSearchQ(e.target.value)}
                placeholder="Buscar…"
                className="pl-7 h-8 text-xs w-32"
                style={{background:"rgba(0,0,0,0.4)",border:"1px solid rgba(192,132,252,0.2)",color:"white"}}/>
            </div>
            <Select value={lote} onValueChange={setLote}>
              <SelectTrigger className="h-8 w-28 text-xs" style={{background:"rgba(0,0,0,0.4)",border:"1px solid rgba(192,132,252,0.2)",color:"rgba(192,132,252,0.8)"}}>
                <SelectValue/>
              </SelectTrigger>
              <SelectContent>
                {["Todos","Lote A","Lote B","Lote C","Lote D","Lote E","Lote F"].map(v=>(
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={search} onValueChange={setSearch}>
              <SelectTrigger className="h-8 w-32 text-xs" style={{background:"rgba(0,0,0,0.4)",border:"1px solid rgba(192,132,252,0.2)",color:"rgba(192,132,252,0.8)"}}>
                <SelectValue/>
              </SelectTrigger>
              <SelectContent>
                {["Todos","Vaca adulta","Novilla","Ternero","Ternera","Toro"].map(v=>(
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" className="h-8 gap-1.5 text-xs"
              onClick={()=>setRows({})}
              style={{background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.2)",color:"#f87171"}}>
              <RotateCcw size={11}/> Reiniciar
            </Button>
            <Button size="sm" className="h-8 gap-1.5 text-xs"
              onClick={()=>setShowRef(!showRef)}
              style={{background:"rgba(251,191,36,0.08)",border:"1px solid rgba(251,191,36,0.2)",color:"#fbbf24"}}>
              <ClipboardList size={11}/> {showRef?"Ocultar":"Tabla"} pesos
            </Button>
          </div>
        </div>
      </div>

      {/* ── TABLA DE PESOS REFERENCIA ─────────────────────────────────────── */}
      {showRef && (
        <div className="rounded-2xl p-4 overflow-x-auto" style={{background:"rgba(192,132,252,0.03)",border:"1px solid rgba(192,132,252,0.12)"}}>
          <div className="text-[10px] font-black uppercase tracking-widest mb-3" style={{color:"rgba(192,132,252,0.5)"}}>
            📊 Tabla de Pesos Estándar por Raza (kg)
          </div>
          <table className="w-full text-[10px] min-w-[520px]">
            <thead>
              <tr>
                <th className="text-left py-2 pr-4 font-black" style={{color:"rgba(192,132,252,0.6)"}}>Raza</th>
                {["Vaca adulta","Novilla","Ternero","Ternera","Toro"].map(c=>(
                  <th key={c} className="text-center py-2 px-2 font-black" style={{color:"rgba(192,132,252,0.6)"}}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(PESOS_RAZA).map(([raza,cats])=>(
                <tr key={raza} className="border-t" style={{borderColor:"rgba(192,132,252,0.06)"}}>
                  <td className="py-1.5 pr-4 font-semibold text-white/60">{raza}</td>
                  {["Vaca adulta","Novilla","Ternero","Ternera","Toro"].map(c=>(
                    <td key={c} className="py-1.5 px-2 text-center font-mono font-bold" style={{color:"#c084fc"}}>{cats[c]} kg</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── MAIN 2-COL LAYOUT ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* ── LEFT: Scale widget (3 cols) ─────────────────────────────────── */}
        <div className="lg:col-span-3">
          {focused && fRow && fCat ? (
            <div className="rounded-2xl overflow-hidden sticky top-4"
              style={{background:"linear-gradient(135deg,#0e001e,#16002e)",border:"1px solid rgba(192,132,252,0.45)",boxShadow:"0 0 50px rgba(192,132,252,0.12)"}}>
              <div className="h-1" style={{background:"linear-gradient(90deg,#c084fc,#a855f7,#7c3aed,transparent)"}}/>

              <div className="p-5 space-y-4">
                {/* Animal header */}
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                    style={{background:fCat.bg,border:`1px solid ${fCat.border}`,boxShadow:`0 0 20px rgba(${fCat.glow},0.3)`}}>
                    {fCat.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-white text-lg leading-tight">{focused.nombre}</div>
                    <div className="flex items-center gap-2 text-[10px] mt-0.5 flex-wrap" style={{color:"rgba(255,255,255,0.35)"}}>
                      <span className="font-mono font-bold" style={{color:fCat.color}}>#{focused.id}</span>
                      <span>·</span><span>{focused.raza}</span>
                      <span>·</span><span>{focused.categoria}</span>
                      <span>·</span><span style={{color:LOTE_COLOR[focused.lote]||"#aaa"}}>{focused.lote}</span>
                    </div>
                  </div>
                  {fRow.saved && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-black flex-shrink-0 flex items-center gap-1"
                      style={{background:"rgba(57,255,126,0.12)",color:"#39ff7e",border:"1px solid rgba(57,255,126,0.3)"}}>
                      <CheckCircle2 size={10}/> Guardado
                    </span>
                  )}
                  <button onClick={()=>setFocusId(null)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-white/10 transition-colors text-xs"
                    style={{color:"rgba(255,255,255,0.3)",border:"1px solid rgba(255,255,255,0.08)"}}>✕</button>
                </div>

                {/* ── BIG DIGITAL WEIGHT ──── */}
                <div className="rounded-2xl p-5 relative" style={{background:"rgba(0,0,0,0.55)",border:"1px solid rgba(192,132,252,0.18)"}}>
                  <div className="text-[9px] font-black uppercase tracking-widest mb-3 text-center" style={{color:"rgba(192,132,252,0.45)"}}>
                    📐 PESO ACTUAL
                  </div>
                  <div className="flex items-center justify-center gap-3 mb-3">
                    {/* − buttons */}
                    <div className="flex flex-col gap-2">
                      {[{d:-10,sz:"xl"},{d:-1,sz:"xl"},{d:-0.5,sz:"sm"}].map(({d,sz})=>(
                        <button key={d}
                          onClick={()=>upd(focused.id,{peso:String(Math.max(0,fPeso+d).toFixed(1)),saved:false})}
                          className={`w-14 ${sz==="xl"?"h-12 text-xl":"h-10 text-sm"} rounded-xl font-black transition-all hover:scale-105 active:scale-95 flex items-center justify-center`}
                          style={{background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.25)",color:"#f87171"}}>
                          {d}
                        </button>
                      ))}
                    </div>

                    {/* Big number */}
                    <div className="flex-1 text-center">
                      <input
                        type="number" step="0.5" min="0"
                        value={fRow.peso}
                        onChange={e=>upd(focused.id,{peso:e.target.value,saved:false})}
                        className="w-full text-center font-black border-0 outline-none bg-transparent"
                        style={{
                          fontFamily:"JetBrains Mono,monospace",
                          fontSize:"clamp(42px,9vw,72px)",
                          color:"#c084fc",
                          textShadow:"0 0 32px rgba(192,132,252,0.8),0 0 60px rgba(192,132,252,0.3)",
                          letterSpacing:"2px",
                          lineHeight:1.05,
                        }}
                      />
                      <div className="text-xs font-bold mt-1" style={{color:"rgba(192,132,252,0.4)"}}>kilogramos</div>
                      {/* diff + GMD */}
                      <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full" style={{background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.3)"}}>
                          Ant: {fPrev} kg
                        </span>
                        {fDiff !== 0 && !isNaN(fDiff) && (
                          <span className="text-sm px-3 py-0.5 rounded-full font-black flex items-center gap-1"
                            style={{
                              background:fDiff>0?"rgba(57,255,126,0.15)":"rgba(248,113,113,0.12)",
                              color:fDiff>0?"#39ff7e":"#f87171",
                              border:`1px solid ${fDiff>0?"rgba(57,255,126,0.3)":"rgba(248,113,113,0.3)"}`,
                            }}>
                            {fDiff>0?<TrendingUp size={12}/>:<TrendingDown size={12}/>}
                            {fDiff>0?"+":""}{fDiff.toFixed(1)} kg
                          </span>
                        )}
                        {fGmd !== 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1"
                            style={{background:"rgba(192,132,252,0.1)",color:"#c084fc",border:"1px solid rgba(192,132,252,0.2)"}}>
                            <Activity size={9}/> GMD {fGmd>0?"+":""}{fGmd} kg/día
                          </span>
                        )}
                      </div>
                    </div>

                    {/* + buttons */}
                    <div className="flex flex-col gap-2">
                      {[{d:10,sz:"xl"},{d:1,sz:"xl"},{d:0.5,sz:"sm"}].map(({d,sz})=>(
                        <button key={d}
                          onClick={()=>upd(focused.id,{peso:String((fPeso+d).toFixed(1)),saved:false})}
                          className={`w-14 ${sz==="xl"?"h-12 text-xl":"h-10 text-sm"} rounded-xl font-black transition-all hover:scale-105 active:scale-95 flex items-center justify-center`}
                          style={{background:"rgba(57,255,126,0.1)",border:"1px solid rgba(57,255,126,0.25)",color:"#39ff7e"}}>
                          +{d}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Progress bar vs raza */}
                  {fEsp > 0 && (
                    <div>
                      <div className="flex justify-between text-[9px] mb-1" style={{color:"rgba(255,255,255,0.25)"}}>
                        <span>vs. estándar {focused.raza}</span>
                        <span style={{color:"#c084fc"}}>{fPct}%</span>
                      </div>
                      <div className="h-2 rounded-full" style={{background:"rgba(255,255,255,0.06)"}}>
                        <div className="h-2 rounded-full transition-all duration-300"
                          style={{width:`${fPct}%`,background:"linear-gradient(90deg,#c084fc,#a855f7)",boxShadow:"0 0 10px rgba(192,132,252,0.5)"}}/>
                      </div>
                      <div className="text-[9px] text-center mt-1" style={{color:"rgba(192,132,252,0.35)"}}>
                        Estándar {focused.raza}: {fEsp} kg
                      </div>
                    </div>
                  )}
                </div>

                {/* BT + Raza row */}
                <div className="flex gap-2">
                  <button onClick={()=>btSim(focused)} disabled={fRow.btLoading}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] disabled:opacity-60"
                    style={{background:"rgba(0,200,255,0.1)",border:"1px solid rgba(0,200,255,0.3)",color:"#00c8ff"}}>
                    <Bluetooth size={14} className={fRow.btLoading?"animate-pulse":""}/>{fRow.btLoading?"Leyendo BT…":"Leer Báscula BT"}
                  </button>
                  <button onClick={()=>upd(focused.id,{peso:String(fEsp),saved:false})}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02]"
                    style={{background:"rgba(255,149,0,0.1)",border:"1px solid rgba(255,149,0,0.3)",color:"#ff9500"}}>
                    <Zap size={14}/> Prom. raza ({fEsp} kg)
                  </button>
                </div>

                {/* ── CONDICIÓN CORPORAL ──── */}
                <div className="rounded-xl p-3" style={{background:"rgba(192,132,252,0.04)",border:"1px solid rgba(192,132,252,0.12)"}}>
                  <div className="text-[9px] font-black uppercase tracking-widest mb-2.5" style={{color:"rgba(192,132,252,0.5)"}}>
                    🔬 Condición Corporal (CC)
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {CC_OPTS.map(c=>{
                      const sel = fRow.cc === c.val;
                      return (
                        <button key={c.val} onClick={()=>upd(focused.id,{cc:c.val})}
                          className="flex flex-col items-center px-2 py-1.5 rounded-xl transition-all hover:scale-110 active:scale-95"
                          style={{
                            background:sel?`${c.color}22`:"rgba(255,255,255,0.03)",
                            border:sel?`2px solid ${c.color}80`:"1px solid rgba(255,255,255,0.08)",
                            boxShadow:sel?`0 0 10px ${c.color}40`:"none",
                            minWidth:42,
                          }}>
                          <span className="text-base">{c.emoji}</span>
                          <span className="text-[9px] font-black" style={{color:sel?c.color:"rgba(255,255,255,0.4)"}}>{c.val}</span>
                        </button>
                      );
                    })}
                  </div>
                  {fRow.cc && (
                    <div className="mt-2 text-[10px] flex items-center gap-1.5">
                      <span style={{color:"rgba(192,132,252,0.5)"}}>Seleccionado:</span>
                      <span className="font-bold" style={{color:CC_OPTS.find(c=>c.val===fRow.cc)?.color}}>
                        CC {fRow.cc} — {CC_OPTS.find(c=>c.val===fRow.cc)?.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* $/kg + Valor + Obs */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase tracking-wider" style={{color:"rgba(57,255,126,0.5)"}}>$/kg</label>
                    <Input type="number" step="500" value={fRow.valorKilo}
                      onChange={e=>upd(focused.id,{valorKilo:e.target.value})}
                      className="h-8 text-xs text-center font-mono"
                      style={{background:"rgba(0,0,0,0.35)",border:"1px solid rgba(57,255,126,0.2)",color:"#39ff7e"}}/>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-white/30">Valor animal</label>
                    <div className="h-8 px-2 rounded-md flex items-center font-black text-sm" style={{background:"rgba(57,255,126,0.06)",border:"1px solid rgba(57,255,126,0.12)",color:"#39ff7e",fontFamily:"Sora,sans-serif"}}>
                      {fValor > 0 ? fmt(fValor) : "—"}
                    </div>
                  </div>
                </div>

                {/* Observaciones */}
                <div>
                  <label className="text-[9px] font-black uppercase tracking-wider mb-1 block" style={{color:"rgba(192,132,252,0.4)"}}>Observaciones</label>
                  <Input value={fRow.obs} onChange={e=>upd(focused.id,{obs:e.target.value})}
                    placeholder="Notas del pesaje…"
                    className="h-8 text-xs"
                    style={{background:"rgba(0,0,0,0.3)",border:"1px solid rgba(192,132,252,0.15)",color:"rgba(255,255,255,0.7)"}}/>
                </div>

                {/* ── ACTION BUTTONS ─────── */}
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={()=>printReceipt(focused)}
                    className="flex items-center justify-center gap-1.5 py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.02]"
                    style={{background:"rgba(167,139,250,0.1)",border:"1px solid rgba(167,139,250,0.3)",color:"#a78bfa"}}>
                    <Printer size={14}/> Imprimir recibo
                  </button>
                  <button onClick={()=>saveRow(focused)} disabled={fRow.saved}
                    className="flex items-center justify-center gap-1.5 py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] disabled:opacity-50"
                    style={fRow.saved
                      ?{background:"rgba(57,255,126,0.08)",border:"1px solid rgba(57,255,126,0.25)",color:"#39ff7e"}
                      :{background:"rgba(57,255,126,0.15)",border:"1px solid rgba(57,255,126,0.4)",color:"#39ff7e"}}>
                    {fRow.saved?<><CheckCircle2 size={14}/> Guardado</>:<><Save size={14}/> Guardar</>}
                  </button>
                </div>
                {!fRow.saved && (
                  <button onClick={()=>saveAndNext(focused)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-sm transition-all hover:scale-[1.01]"
                    style={{
                      background:"linear-gradient(135deg,rgba(192,132,252,0.2),rgba(124,58,237,0.15))",
                      border:"1px solid rgba(192,132,252,0.5)",
                      color:"#c084fc",
                      boxShadow:"0 0 20px rgba(192,132,252,0.15)",
                    }}>
                    <Save size={14}/> Guardar + Siguiente animal
                    {pending > 1 && <span className="text-[10px] opacity-55">({pending-1} restantes)</span>}
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* ── Empty state ── */
            <div className="rounded-2xl p-8 text-center relative overflow-hidden"
              style={{background:"linear-gradient(135deg,#0e001e,#16002e)",border:"1px solid rgba(192,132,252,0.2)"}}>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                <Scale className="w-64 h-64" style={{color:"#c084fc"}}/>
              </div>
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl mx-auto mb-4 flex items-center justify-center text-4xl"
                  style={{background:"rgba(192,132,252,0.1)",border:"1px solid rgba(192,132,252,0.3)",boxShadow:"0 0 40px rgba(192,132,252,0.2)"}}>
                  📐
                </div>
                <div className="font-black text-white text-xl mb-2" style={{fontFamily:"Sora,sans-serif"}}>Báscula Lista</div>
                <p className="text-sm mb-5" style={{color:"rgba(192,132,252,0.5)"}}>
                  Selecciona un animal para registrar peso + CC<br/>
                  ±½ · ±1 · ±10 kg · BT · Recibo PDF automático
                </p>
                <div className="flex gap-2 justify-center flex-wrap">
                  {lista.slice(0,8).map(a=>{
                    const ic = CAT_ICON[a.categoria] || CAT_ICON["Vaca adulta"];
                    return (
                      <button key={a.id} onClick={()=>setFocusId(a.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-105"
                        style={{background:`rgba(${ic.glow},0.1)`,border:`1px solid rgba(${ic.glow},0.25)`,color:ic.color}}>
                        {ic.emoji} {a.nombre}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Queue panel (2 cols) ────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(192,132,252,0.15)"}}>
            {/* Header */}
            <div className="px-4 py-3 flex items-center gap-2"
              style={{background:"rgba(192,132,252,0.05)",borderBottom:"1px solid rgba(192,132,252,0.1)"}}>
              <ClipboardList size={13} style={{color:"#c084fc"}}/>
              <span className="font-bold text-sm text-white">Cola de pesaje</span>
              <div className="ml-auto flex gap-1.5">
                <span className="text-[9px] px-1.5 py-0.5 rounded-full"
                  style={{background:"rgba(251,191,36,0.12)",color:"#fbbf24",border:"1px solid rgba(251,191,36,0.25)"}}>
                  {pending} pendientes
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full"
                  style={{background:"rgba(57,255,126,0.12)",color:"#39ff7e",border:"1px solid rgba(57,255,126,0.25)"}}>
                  {done} ✓
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1" style={{background:"rgba(255,255,255,0.04)"}}>
              <div className="h-1 transition-all duration-500"
                style={{width:`${lista.length>0?(done/lista.length)*100:0}%`,background:"linear-gradient(90deg,#c084fc,#a855f7)"}}/>
            </div>

            {/* List */}
            <div className="overflow-y-auto" style={{maxHeight:focused ? 580 : 420}}>
              {lista.length === 0 ? (
                <div className="p-6 text-center text-white/25 text-xs">Sin animales en esta vista</div>
              ) : lista.map((a,idx)=>{
                const ic = CAT_ICON[a.categoria]||CAT_ICON["Vaca adulta"];
                const row = getRow(a);
                const isFocus = focusId === a.id;
                const isDone  = row.saved;
                return (
                  <button key={a.id} onClick={()=>setFocusId(a.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:bg-white/[0.025] border-b"
                    style={{
                      borderColor:"rgba(255,255,255,0.04)",
                      background:isFocus?"rgba(192,132,252,0.07)":isDone?"rgba(57,255,126,0.03)":"transparent",
                      borderLeft:isFocus?"3px solid #c084fc":isDone?"3px solid rgba(57,255,126,0.4)":"3px solid transparent",
                    }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0"
                      style={{background:isDone?"rgba(57,255,126,0.15)":isFocus?"rgba(192,132,252,0.2)":"rgba(255,255,255,0.06)",
                        color:isDone?"#39ff7e":isFocus?"#c084fc":"rgba(255,255,255,0.3)"}}>
                      {isDone?"✓":idx+1}
                    </div>
                    <span className="text-base flex-shrink-0">{ic.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs truncate" style={{color:isFocus?"#c084fc":isDone?"rgba(57,255,126,0.7)":"rgba(255,255,255,0.8)"}}>
                        {a.nombre}
                      </div>
                      <div className="text-[9px] flex items-center gap-1" style={{color:"rgba(255,255,255,0.28)"}}>
                        <span className="font-mono" style={{color:ic.color}}>#{a.id}</span>
                        <span>·</span><span>{a.raza}</span>
                        {isDone && <><span>·</span><span style={{color:"rgba(192,132,252,0.7)"}}>CC {row.cc}</span></>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {isDone ? (
                        <div>
                          <div className="font-black text-xs" style={{color:"#39ff7e"}}>{Number(row.peso).toFixed(1)} kg</div>
                          <div className="text-[9px]" style={{color:"rgba(57,255,126,0.4)"}}>guardado</div>
                        </div>
                      ) : isFocus ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full"
                          style={{background:"rgba(192,132,252,0.12)",color:"#c084fc",border:"1px solid rgba(192,132,252,0.3)"}}>
                          ● activo
                        </span>
                      ) : (
                        <div>
                          <div className="font-mono text-xs text-white/35">{a.peso} kg</div>
                          <ChevronRight size={10} className="ml-auto text-white/15"/>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer totals */}
            {done > 0 && (
              <div className="px-4 py-3 grid grid-cols-2 gap-2" style={{background:"rgba(192,132,252,0.04)",borderTop:"1px solid rgba(192,132,252,0.1)"}}>
                {[
                  {label:"Pesados",     val:String(done),                                        c:"#c084fc"},
                  {label:"Valor sesión",val:sessionLog.reduce((s,r)=>s+r.valor,0)>0?fmt(sessionLog.reduce((s,r)=>s+r.valor,0)):"—", c:"#39ff7e"},
                ].map(s=>(
                  <div key={s.label} className="text-center">
                    <div className="font-black text-sm" style={{color:s.c,fontFamily:"Sora,sans-serif"}}>{s.val}</div>
                    <div className="text-[9px] text-white/25">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── SESSION LOG ─────────────────────────────────────────────────────── */}
      {sessionLog.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(192,132,252,0.15)"}}>
          <div className="px-4 py-3 flex items-center gap-2"
            style={{background:"rgba(192,132,252,0.05)",borderBottom:"1px solid rgba(192,132,252,0.1)"}}>
            <CheckCircle2 size={13} style={{color:"#39ff7e"}}/>
            <span className="font-bold text-sm text-white">
              Sesión actual — {sessionLog.length} {sessionLog.length===1?"animal":"animales"} pesados
            </span>
            <button onClick={()=>window.print()}
              className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold"
              style={{background:"rgba(167,139,250,0.1)",border:"1px solid rgba(167,139,250,0.25)",color:"#a78bfa"}}>
              <Printer size={11}/> Imprimir sesión
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{background:"rgba(192,132,252,0.03)",borderBottom:"1px solid rgba(192,132,252,0.08)"}}>
                  {["Animal","Peso","Anterior","Cambio","CC","GMD","Valor","Hora"].map(h=>(
                    <th key={h} className="text-left px-4 py-2.5 text-[9px] font-black uppercase tracking-wider"
                      style={{color:"rgba(192,132,252,0.5)"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessionLog.map((r,i)=>{
                  const d = r.peso - r.anterior;
                  const ccInfo = CC_OPTS.find(c=>c.val===r.cc);
                  return (
                    <tr key={i} className="border-b hover:bg-white/[0.012] transition-colors"
                      style={{borderColor:"rgba(255,255,255,0.04)"}}>
                      <td className="px-4 py-2.5 font-bold text-white">{r.nombre}</td>
                      <td className="px-4 py-2.5 font-black" style={{color:"#c084fc",fontFamily:"Sora,sans-serif"}}>{r.peso.toFixed(1)} kg</td>
                      <td className="px-4 py-2.5 text-white/35">{r.anterior} kg</td>
                      <td className="px-4 py-2.5 font-bold" style={{color:d>=0?"#39ff7e":"#f87171"}}>
                        {d>=0?"+":""}{d.toFixed(1)} kg
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="font-bold" style={{color:ccInfo?.color||"#888"}}>{ccInfo?.emoji} {r.cc}</span>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[10px]" style={{color:r.gmd>=0?"#39ff7e":"#f87171"}}>
                        {r.gmd>=0?"+":""}{r.gmd} kg/d
                      </td>
                      <td className="px-4 py-2.5 font-semibold" style={{color:"#39ff7e"}}>{r.valor>0?fmt(r.valor):"—"}</td>
                      <td className="px-4 py-2.5 text-white/25">{r.hora}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{background:"rgba(192,132,252,0.04)",borderTop:"1px solid rgba(192,132,252,0.1)"}}>
                  <td className="px-4 py-2.5 font-black text-white/50 text-[10px]">TOTALES</td>
                  <td className="px-4 py-2.5 font-black" style={{color:"#c084fc"}}>
                    {(sessionLog.reduce((s,r)=>s+r.peso,0)/sessionLog.length).toFixed(1)} kg prom.
                  </td>
                  <td/>
                  <td className="px-4 py-2.5 font-black" style={{color:"#39ff7e"}}>
                    {(()=>{const t=sessionLog.reduce((s,r)=>s+(r.peso-r.anterior),0);return(t>=0?"+":"")+t.toFixed(1)+" kg"})()}
                  </td>
                  <td className="px-4 py-2.5 text-[10px]" style={{color:"rgba(192,132,252,0.5)"}}>
                    Prom. {(sessionLog.reduce((s,r)=>s+Number(r.cc),0)/sessionLog.length).toFixed(1)}
                  </td>
                  <td className="px-4 py-2.5 font-black" style={{color:"#39ff7e"}}>
                    {(()=>{const t=sessionLog.reduce((s,r)=>s+r.gmd,0);return(t>=0?"+":"")+t.toFixed(2)+" kg/d"})()}
                  </td>
                  <td className="px-4 py-2.5 font-black" style={{color:"#39ff7e"}}>
                    {fmt(sessionLog.reduce((s,r)=>s+r.valor,0))}
                  </td>
                  <td className="px-4 py-2.5 text-[9px] text-white/20">{sessionLog.length} animales</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
