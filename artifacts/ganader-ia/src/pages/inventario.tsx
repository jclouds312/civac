import { useState, useEffect, useRef } from "react";
import { useAppState } from "../lib/data";
import { useAuth } from "../lib/auth";
import {
  Search, Plus, Download, Pencil, Trash2, Bluetooth, Tag, BarChart3,
  Grid3x3, TableProperties, Printer, QrCode, Filter, RefreshCw,
  Beef, Baby, ChevronRight, TrendingUp, TrendingDown, Milestone,
  Droplets, Heart, Scale, Zap, Star, Award, MapPin, Calendar,
  DollarSign, CheckCircle2, XCircle, Clock, Info, FileText, Eye,
  Activity, ChevronUp, ChevronDown, ClipboardList, AlertTriangle,
  Layers, FlipHorizontal, Save, RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, ReferenceLine, TooltipProps } from "recharts";

// ── Helpers ──────────────────────────────────────────────────────────────────
function calcEdad(fechaNacimiento: string): string {
  if (!fechaNacimiento) return "—";
  const nac = new Date(fechaNacimiento);
  const hoy = new Date();
  const dias = Math.floor((hoy.getTime() - nac.getTime()) / 86400000);
  if (dias < 30) return `${dias}d`;
  const meses = Math.floor(dias / 30);
  if (meses < 12) return `${meses}m`;
  const años = Math.floor(meses / 12);
  const mr = meses % 12;
  return mr > 0 ? `${años}a ${mr}m` : `${años}a`;
}

function fmt(n: number) {
  return new Intl.NumberFormat('es-CO', { style:'currency', currency:'COP', maximumFractionDigits:0 }).format(n);
}

const CAT_CONFIG: Record<string, { color: string; bg: string; border: string; glow: string; icon: string; emoji: string }> = {
  "Vaca adulta": { color:'#00f5d4', bg:'rgba(0,245,212,0.12)', border:'rgba(0,245,212,0.35)', glow:'0,245,212', icon:'text-teal-400', emoji:'🐄' },
  "Novilla":     { color:'#a78bfa', bg:'rgba(167,139,250,0.12)', border:'rgba(167,139,250,0.35)', glow:'167,139,250', icon:'text-purple-400', emoji:'🐮' },
  "Ternero":     { color:'#fb923c', bg:'rgba(251,146,60,0.12)', border:'rgba(251,146,60,0.35)', glow:'251,146,60', icon:'text-orange-400', emoji:'🐄' },
  "Ternera":     { color:'#f472b6', bg:'rgba(244,114,182,0.12)', border:'rgba(244,114,182,0.35)', glow:'244,114,182', icon:'text-pink-400', emoji:'🐮' },
  "Toro":        { color:'#f87171', bg:'rgba(248,113,113,0.12)', border:'rgba(248,113,113,0.35)', glow:'248,113,113', icon:'text-red-400', emoji:'🐂' },
};

const ESTADO_CONFIG: Record<string, { color: string; bg: string; dot: string; emoji: string }> = {
  "Producción": { color:'#4ade80', bg:'rgba(74,222,128,0.15)', dot:'#4ade80', emoji:'🥛' },
  "Gestante":   { color:'#c084fc', bg:'rgba(192,132,252,0.15)', dot:'#c084fc', emoji:'🤰' },
  "Seca":       { color:'#94a3b8', bg:'rgba(148,163,184,0.15)', dot:'#94a3b8', emoji:'💤' },
  "Abierta":    { color:'#fbbf24', bg:'rgba(251,191,36,0.15)', dot:'#fbbf24', emoji:'🔓' },
  "Tratamiento":{ color:'#f87171', bg:'rgba(248,113,113,0.15)', dot:'#f87171', emoji:'💊' },
  "Destete":    { color:'#fb923c', bg:'rgba(251,146,60,0.15)', dot:'#fb923c', emoji:'🍼' },
  "Lactancia":  { color:'#38bdf8', bg:'rgba(56,189,248,0.15)', dot:'#38bdf8', emoji:'🤱' },
  "Activo":     { color:'#4ade80', bg:'rgba(74,222,128,0.15)', dot:'#4ade80', emoji:'💪' },
};

const LOTE_COLOR: Record<string, string> = {
  "Lote A":'#00f5d4', "Lote B":'#00c8ff', "Lote C":'#a78bfa',
  "Lote D":'#f87171', "Lote E":'#fb923c', "Lote F":'#fbbf24',
};

const PESOS_RAZA: Record<string, Record<string, number>> = {
  "Holstein":  { "Vaca adulta":560, "Novilla":330, "Ternero":80, "Ternera":75, "Toro":820 },
  "Simmental": { "Vaca adulta":600, "Novilla":360, "Ternero":90, "Ternera":85, "Toro":870 },
  "Brahman":   { "Vaca adulta":490, "Novilla":300, "Ternero":65, "Ternera":60, "Toro":780 },
  "Gyr X":     { "Vaca adulta":470, "Novilla":290, "Ternero":62, "Ternera":58, "Toro":730 },
  "Gyr":       { "Vaca adulta":460, "Novilla":285, "Ternero":60, "Ternera":56, "Toro":720 },
  "Jersey":    { "Vaca adulta":400, "Novilla":245, "Ternero":52, "Ternera":49, "Toro":600 },
};

// ── Etiqueta Imprimible ───────────────────────────────────────────────────────
function EtiquetaAnimal({ a }: { a: ReturnType<typeof useAppState>['animals'][0] }) {
  const cat = CAT_CONFIG[a.categoria] || CAT_CONFIG["Vaca adulta"];
  const estado = ESTADO_CONFIG[a.estado] || { color:'#888', bg:'rgba(0,0,0,0.2)', emoji:'—' };
  const edad = calcEdad(a.fechaNacimiento || "");
  const valorTotal = (a.peso || 0) * (a.valorKilo || 0);
  const pesoEsp = PESOS_RAZA[a.raza]?.[a.categoria] || 400;
  const pct = Math.min(100, Math.round((a.peso / pesoEsp) * 100));

  return (
    <div className="etiqueta-animal rounded-xl overflow-hidden text-white" style={{
      background:'linear-gradient(135deg,#040e0a,#071810)',
      border:`1px solid ${cat.border}`,
      boxShadow:`0 0 20px rgba(${cat.glow},0.15)`,
      minWidth:240,
    }}>
      {/* Header banda de color */}
      <div className="h-1.5 w-full" style={{background:`linear-gradient(90deg,${cat.color},transparent)`}}/>
      <div className="p-3">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="text-[9px] uppercase tracking-widest font-bold mb-0.5" style={{color:cat.color}}>
              {cat.emoji} {a.categoria}
            </div>
            <div className="font-black text-base leading-tight" style={{fontFamily:'Sora,sans-serif'}}>{a.nombre}</div>
            <div className="font-mono text-[11px] mt-0.5" style={{color:cat.color}}>#{a.id}</div>
          </div>
          {/* QR placeholder */}
          <div className="rounded-lg flex-shrink-0 flex items-center justify-center" style={{
            width:48, height:48, background:`rgba(${cat.glow},0.1)`,
            border:`1px solid rgba(${cat.glow},0.25)`
          }}>
            <QrCode size={24} style={{color:cat.color, opacity:0.7}}/>
          </div>
        </div>

        {/* Data grid */}
        <div className="grid grid-cols-2 gap-1 text-[10px] mb-2">
          {[
            ['Raza', a.raza],
            ['Lote', a.lote],
            ['Peso', `${a.peso} kg`],
            ['Edad', edad !== '—' ? edad : '—'],
            ['Partos', String(a.partos || 0)],
            ['Litros/día', a.litrosDia ? `${a.litrosDia} L` : '—'],
          ].map(([k,v]) => (
            <div key={k} className="flex justify-between">
              <span style={{color:'rgba(255,255,255,0.3)'}}>{k}:</span>
              <span className="font-semibold" style={{color:'rgba(255,255,255,0.85)'}}>{v}</span>
            </div>
          ))}
        </div>

        {/* Estado + Registro */}
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{background:estado.bg, color:estado.color}}>
            {estado.emoji} {a.estado}
          </span>
          {a.registro === "SI" ? (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{background:'rgba(57,255,126,0.12)',color:'#39ff7e',border:'1px solid rgba(57,255,126,0.25)'}}>
              ✓ Reg. {a.numeroRegistro}
            </span>
          ) : (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{background:'rgba(255,255,255,0.05)',color:'rgba(255,255,255,0.3)'}}>Sin registro</span>
          )}
        </div>

        {/* Peso bar */}
        <div className="mb-2">
          <div className="flex justify-between text-[9px] mb-0.5">
            <span style={{color:'rgba(255,255,255,0.3)'}}>Peso vs. raza</span>
            <span style={{color:cat.color}}>{pct}%</span>
          </div>
          <div className="h-1 rounded-full" style={{background:'rgba(255,255,255,0.08)'}}>
            <div className="h-1 rounded-full transition-all" style={{width:`${pct}%`, background:cat.color}}/>
          </div>
        </div>

        {/* Valor */}
        {valorTotal > 0 && (
          <div className="rounded-lg px-2 py-1.5 flex justify-between items-center" style={{background:'rgba(57,255,126,0.07)',border:'1px solid rgba(57,255,126,0.2)'}}>
            <span className="text-[9px]" style={{color:'rgba(255,255,255,0.35)'}}>Valor estimado</span>
            <span className="font-black text-xs" style={{color:'#39ff7e'}}>{fmt(valorTotal)}</span>
          </div>
        )}
      </div>
      <div className="px-3 pb-2 flex items-center justify-between">
        <span className="text-[8px]" style={{color:'rgba(255,255,255,0.15)'}}>CIVAC PRO · {new Date().toLocaleDateString('es-CO')}</span>
        <MapPin size={9} style={{color:`rgba(${cat.glow},0.4)`}}/>
      </div>
    </div>
  );
}

// ── FichaCard ─────────────────────────────────────────────────────────────────
function FichaCard({ a, onEdit, onDelete, onVerRecibo }: {
  a: ReturnType<typeof useAppState>['animals'][0];
  onEdit: () => void; onDelete: () => void; onVerRecibo: () => void;
}) {
  const cat = CAT_CONFIG[a.categoria] || CAT_CONFIG["Vaca adulta"];
  const estado = ESTADO_CONFIG[a.estado] || { color:'#888', bg:'rgba(0,0,0,0.2)', emoji:'—', dot:'#888' };
  const edad = calcEdad(a.fechaNacimiento || "");
  const valorTotal = (a.peso || 0) * (a.valorKilo || 0);
  const pesoEsp = PESOS_RAZA[a.raza]?.[a.categoria] || 400;
  const pct = Math.min(100, Math.round((a.peso / pesoEsp) * 100));
  const loteColor = LOTE_COLOR[a.lote] || '#888';

  return (
    <div className="rounded-xl overflow-hidden transition-all hover:scale-[1.01] group" style={{
      background:'linear-gradient(160deg,#041208,#030c07)',
      border:`1px solid rgba(${cat.glow},0.2)`,
      boxShadow:`0 0 0 rgba(${cat.glow},0)`,
    }}>
      {/* Top accent */}
      <div className="h-1" style={{background:`linear-gradient(90deg,${cat.color},${loteColor},transparent)`}}/>

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{background:cat.bg, border:`1px solid ${cat.border}`, boxShadow:`0 0 12px rgba(${cat.glow},0.2)`}}>
              {cat.emoji}
            </div>
            <div>
              <div className="font-black text-base text-white" style={{fontFamily:'Sora,sans-serif'}}>{a.nombre}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono text-xs" style={{color:cat.color}}>#{a.id}</span>
                <span className="text-white/20">·</span>
                <span className="text-xs text-white/50">{a.raza}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <button onClick={onVerRecibo} title="Ver ficha" className="p-1.5 rounded-lg transition-all hover:bg-white/10"
              style={{color:'rgba(0,245,212,0.6)'}}><Eye size={13}/></button>
            <button onClick={onEdit} className="p-1.5 rounded-lg transition-all hover:bg-white/10"
              style={{color:'rgba(255,149,0,0.6)'}}><Pencil size={13}/></button>
            <button onClick={onDelete} className="p-1.5 rounded-lg transition-all hover:bg-red-500/20"
              style={{color:'rgba(248,113,113,0.6)'}}><Trash2 size={13}/></button>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{background:cat.bg, color:cat.color, border:`1px solid ${cat.border}`}}>
            {a.categoria}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{background:estado.bg, color:estado.color}}>
            {estado.emoji} {a.estado}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{background:`rgba(${LOTE_COLOR[a.lote]?.replace('#','')},0.15)`, color:loteColor, border:`1px solid ${loteColor}30`}}>
            📍 {a.lote}
          </span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon:<Scale size={12}/>, label:'Peso', val:`${a.peso}kg`, c:'#ff9500' },
            { icon:<Calendar size={12}/>, label:'Edad', val:edad, c:'#00c8ff' },
            { icon:<Droplets size={12}/>, label:'L/día', val:a.litrosDia ? `${a.litrosDia}L` : '—', c:'#00f5d4' },
          ].map(s => (
            <div key={s.label} className="rounded-lg p-2 text-center" style={{background:'rgba(255,255,255,0.04)'}}>
              <div className="flex items-center justify-center gap-1 mb-1" style={{color:s.c}}>{s.icon}</div>
              <div className="font-bold text-xs text-white">{s.val}</div>
              <div className="text-[9px] text-white/30">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Peso bar */}
        <div>
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-white/30">Condición vs raza ({a.raza})</span>
            <span style={{color:cat.color}}>{pct}%</span>
          </div>
          <div className="h-1.5 rounded-full" style={{background:'rgba(255,255,255,0.07)'}}>
            <div className="h-1.5 rounded-full" style={{width:`${pct}%`, background:`linear-gradient(90deg,${cat.color},${loteColor})`}}/>
          </div>
        </div>

        {/* Registro + valor */}
        <div className="flex items-center justify-between">
          {a.registro === "SI" ? (
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={12} className="text-green-400"/>
              <span className="text-[10px] text-green-400 font-semibold">{a.numeroRegistro || 'Registrada'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <XCircle size={12} className="text-white/20"/>
              <span className="text-[10px] text-white/30">Sin registro</span>
            </div>
          )}
          {valorTotal > 0 && (
            <span className="text-xs font-black" style={{color:'#39ff7e'}}>{fmt(valorTotal)}</span>
          )}
        </div>

        {/* Partos */}
        {a.partos > 0 && (
          <div className="flex items-center gap-1.5 text-[10px] text-white/40">
            <Heart size={10} style={{color:'#f472b6'}}/>
            <span>{a.partos} parto{a.partos !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Ficha detallada ───────────────────────────────────────────────────────────
function FichaDetalle({ a }: { a: ReturnType<typeof useAppState>['animals'][0] }) {
  const cat = CAT_CONFIG[a.categoria] || CAT_CONFIG["Vaca adulta"];
  const estado = ESTADO_CONFIG[a.estado] || { color:'#888', bg:'rgba(0,0,0,0.2)', emoji:'—', dot:'#888' };
  const edad = calcEdad(a.fechaNacimiento || "");
  const valorTotal = (a.peso || 0) * (a.valorKilo || 0);

  return (
    <div className="space-y-4">
      <div className="rounded-xl overflow-hidden" style={{border:`1px solid rgba(${cat.glow},0.3)`}}>
        <div className="p-4" style={{background:`linear-gradient(135deg,rgba(${cat.glow},0.08),transparent)`}}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
              style={{background:cat.bg, border:`1px solid ${cat.border}`}}>
              {cat.emoji}
            </div>
            <div>
              <div className="font-black text-2xl text-white">{a.nombre}</div>
              <div className="font-mono text-sm" style={{color:cat.color}}>#{a.id} · {a.raza}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['Categoría', a.categoria],
              ['Estado', `${estado.emoji} ${a.estado}`],
              ['Lote', a.lote],
              ['Edad', edad],
              ['Peso actual', `${a.peso} kg`],
              ['Valor/kg', a.valorKilo ? fmt(a.valorKilo) : '—'],
              ['Litros/día', a.litrosDia ? `${a.litrosDia} L` : '—'],
              ['Partos', String(a.partos || 0)],
              ['F. Nacimiento', a.fechaNacimiento || '—'],
              ['Registro', a.registro === 'SI' ? `SI · ${a.numeroRegistro}` : 'NO'],
            ].map(([k,v]) => (
              <div key={k}>
                <div className="text-[10px] uppercase tracking-wider text-white/30">{k}</div>
                <div className="font-semibold text-white/90">{v}</div>
              </div>
            ))}
          </div>

          {valorTotal > 0 && (
            <div className="mt-4 rounded-xl p-3 flex justify-between items-center"
              style={{background:'rgba(57,255,126,0.08)',border:'1px solid rgba(57,255,126,0.25)'}}>
              <div className="text-xs text-white/40">Valor total estimado</div>
              <div className="font-black text-xl" style={{color:'#39ff7e'}}>{fmt(valorTotal)}</div>
            </div>
          )}
        </div>
      </div>

      <Button className="w-full gap-2" onClick={() => window.print()}
        style={{background:'rgba(255,149,0,0.12)',border:'1px solid rgba(255,149,0,0.3)',color:'#ff9500'}}>
        <Printer size={14}/> Imprimir Ficha
      </Button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Inventario() {
  const { animals, setAnimals, pesajes, setPesajes } = useAppState();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("Todos");
  const [estadoFilter, setEstadoFilter] = useState("Todos");
  const [loteFilter, setLoteFilter] = useState("Todos");
  const [open, setOpen] = useState(false);
  const [editAnimal, setEditAnimal] = useState<typeof animals[0] | null>(null);
  const [fichaAnimal, setFichaAnimal] = useState<typeof animals[0] | null>(null);
  const [activeTab, setActiveTab] = useState("tabla");
  const [etiqSearch, setEtiqSearch] = useState("");

  // ── Pesaje Manual Avanzado state ──────────────────────────────────────────
  type AdvRow = { peso: string; valorKilo: string; condicion: string; observacion: string; saved: boolean; modified: boolean };
  const [advRows, setAdvRows] = useState<Record<string, AdvRow>>({});
  const [advRazaFilter, setAdvRazaFilter] = useState("Todas");
  const [advCatFilter, setAdvCatFilter] = useState("Todas");
  const [advLoteFilter, setAdvLoteFilter] = useState("Todos");
  const [advSearch, setAdvSearch] = useState("");
  const [advSortBy, setAdvSortBy] = useState<"nombre"|"peso_desc"|"diferencia">("nombre");
  const [advRefOpen, setAdvRefOpen] = useState(false);
  const [advBatchSaving, setAdvBatchSaving] = useState(false);
  const [advSessionLog, setAdvSessionLog] = useState<{id:number;nombre:string;peso:number;anterior:number;cc:string;hora:string}[]>([]);

  const CC_CONFIG: Record<string, {emoji:string;label:string;color:string;glow:string}> = {
    "1.0": {emoji:"💀",label:"Muy delgada",color:"#f87171",glow:"248,113,113"},
    "1.5": {emoji:"😰",label:"Delgada",color:"#fb923c",glow:"251,146,60"},
    "2.0": {emoji:"⚠️",label:"Bajo normal",color:"#fbbf24",glow:"251,191,36"},
    "2.5": {emoji:"📊",label:"Normal bajo",color:"#a3e635",glow:"163,230,53"},
    "3.0": {emoji:"✅",label:"Normal",color:"#4ade80",glow:"74,222,128"},
    "3.5": {emoji:"🌟",label:"Normal alto",color:"#34d399",glow:"52,211,153"},
    "4.0": {emoji:"💪",label:"Buena cond.",color:"#00f5d4",glow:"0,245,212"},
    "4.5": {emoji:"🏆",label:"Excelente",color:"#00c8ff",glow:"0,200,255"},
    "5.0": {emoji:"🔴",label:"Sobrepeso",color:"#a78bfa",glow:"167,139,250"},
  };

  const PESOS_RAZA_ADV: Record<string, Record<string, {min:number;max:number;promedio:number}>> = {
    "Holstein":  {"Vaca adulta":{min:490,max:650,promedio:560},"Novilla":{min:280,max:380,promedio:330},"Ternero":{min:40,max:120,promedio:80},"Ternera":{min:38,max:110,promedio:75},"Toro":{min:700,max:950,promedio:820}},
    "Simmental": {"Vaca adulta":{min:520,max:700,promedio:600},"Novilla":{min:300,max:420,promedio:360},"Ternero":{min:45,max:130,promedio:90},"Ternera":{min:42,max:125,promedio:85},"Toro":{min:750,max:1000,promedio:870}},
    "Brahman":   {"Vaca adulta":{min:400,max:580,promedio:490},"Novilla":{min:250,max:360,promedio:300},"Ternero":{min:35,max:100,promedio:65},"Ternera":{min:32,max:95,promedio:60},"Toro":{min:650,max:900,promedio:780}},
    "Gyr X":     {"Vaca adulta":{min:380,max:550,promedio:470},"Novilla":{min:240,max:350,promedio:290},"Ternero":{min:32,max:95,promedio:62},"Ternera":{min:30,max:90,promedio:58},"Toro":{min:600,max:850,promedio:730}},
    "Gyr":       {"Vaca adulta":{min:380,max:540,promedio:460},"Novilla":{min:240,max:345,promedio:285},"Ternero":{min:32,max:92,promedio:60},"Ternera":{min:30,max:88,promedio:56},"Toro":{min:590,max:840,promedio:720}},
    "Jersey":    {"Vaca adulta":{min:330,max:470,promedio:400},"Novilla":{min:200,max:290,promedio:245},"Ternero":{min:25,max:80,promedio:52},"Ternera":{min:24,max:76,promedio:49},"Toro":{min:500,max:700,promedio:600}},
  };
  const getPesoEspAdv = (raza:string, cat:string) => PESOS_RAZA_ADV[raza]?.[cat] ?? {min:100,max:800,promedio:400};

  const getNutriRec = (cc:string, cat:string): string => {
    const n = Number(cc);
    if (n < 2.0) return "🚨 Emergencia nutricional — ración máxima + suplemento proteico urgente";
    if (n < 2.5) return "⚠️ Incrementar ración energética · Revisar sanidad · Suplementar minerales";
    if (n < 3.0) return "📈 Aumentar proteína 15% · Asegurar acceso a sales minerales";
    if (n > 4.5 && ["Vaca adulta","Novilla"].includes(cat)) return "🔴 Reducir energía — riesgo cetosis posparto · Control estricto";
    if (n > 4.0 && ["Vaca adulta","Novilla"].includes(cat)) return "↓ Ajustar ración — leve sobrecondición · Monitorear";
    return "✓ Ración estándar recomendada — condición óptima";
  };

  const getAdvRow = (a: typeof animals[0]): AdvRow =>
    advRows[a.id] ?? { peso: String(a.peso), valorKilo: String(a.valorKilo || 11000), condicion:"3.0", observacion:"", saved:false, modified:false };

  const updateAdvRow = (id:string, patch: Partial<AdvRow>) =>
    setAdvRows(prev => ({...prev, [id]: {...getAdvRow(animals.find(x=>x.id===id)!), ...patch}}));

  const autoFillAdvByRaza = (a: typeof animals[0]) => {
    const esp = getPesoEspAdv(a.raza, a.categoria);
    updateAdvRow(a.id, {peso: String(esp.promedio), modified:true, saved:false});
  };

  const saveAdvRow = (a: typeof animals[0]) => {
    const row = getAdvRow(a);
    const pesoN = Number(row.peso);
    if (!pesoN) return;
    const newPesaje = {
      id: Date.now(), animalId: a.id, animalNombre: a.nombre,
      peso: pesoN, pesoAnterior: a.peso,
      fecha: new Date().toLocaleDateString('es-CO'),
      hora: new Date().toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'}),
      metodo:'manual', dispositivo:'',
      operador: user?.nombre || 'Admin',
      observacion: `CC ${row.condicion} | ${row.observacion}`.trim().replace(/\s*\|\s*$/,''),
      lote: a.lote, categoria: a.categoria,
    };
    setPesajes(prev => [newPesaje, ...prev]);
    setAnimals(prev => prev.map(x => x.id===a.id ? {...x, peso:pesoN, valorKilo:Number(row.valorKilo)||x.valorKilo} : x));
    updateAdvRow(a.id, {saved:true, modified:false});
    setAdvSessionLog(prev => [{
      id: Date.now(), nombre: a.nombre, peso: pesoN, anterior: a.peso,
      cc: row.condicion, hora: newPesaje.hora
    }, ...prev]);
  };

  const batchSaveAllAdv = () => {
    setAdvBatchSaving(true);
    const modified = animals.filter(a => advRows[a.id]?.modified && !advRows[a.id]?.saved);
    modified.forEach(a => saveAdvRow(a));
    setTimeout(() => setAdvBatchSaving(false), 600);
  };

  const resetAllAdvRows = () => {
    setAdvRows({});
    setAdvSessionLog([]);
  };

  // Pesaje Rápido state
  type PesajeRow = { animalId: string; peso: string; valorKilo: string; saved: boolean; btLoading: boolean };
  const [pesajeRows, setPesajeRows] = useState<Record<string, PesajeRow>>({});
  const [printPesajeData, setPrintPesajeData] = useState<typeof animals[0] | null>(null);
  const [pesajeLoteFilter, setPesajeLoteFilter] = useState("Todos");

  const getPRow = (a: typeof animals[0]): PesajeRow =>
    pesajeRows[a.id] ?? { animalId: a.id, peso: String(a.peso), valorKilo: String(a.valorKilo || 0), saved: false, btLoading: false };

  const updatePRow = (id: string, patch: Partial<PesajeRow>) =>
    setPesajeRows(prev => ({ ...prev, [id]: { ...getPRow(animals.find(x=>x.id===id)!), ...patch } }));

  const autoCalcRazaPesaje = (a: typeof animals[0]) => {
    const p = PESOS_RAZA[a.raza]?.[a.categoria] || a.peso;
    updatePRow(a.id, { peso: String(p), saved: false });
  };

  const btSimPesaje = (a: typeof animals[0]) => {
    updatePRow(a.id, { btLoading: true });
    const pesoEsp = PESOS_RAZA[a.raza]?.[a.categoria] || a.peso;
    setTimeout(() => {
      const pesoBT = (pesoEsp + (Math.random() - 0.5) * 18).toFixed(1);
      updatePRow(a.id, { peso: pesoBT, btLoading: false, saved: false });
    }, 1400);
  };

  const registrarPesajeRapido = (a: typeof animals[0]) => {
    const row = getPRow(a);
    const newPesaje = {
      id: Date.now(),
      animalId: a.id, animalNombre: a.nombre,
      peso: Number(row.peso), pesoAnterior: a.peso,
      fecha: new Date().toLocaleDateString('es-CO'),
      hora: new Date().toLocaleTimeString('es-CO', { hour:'2-digit', minute:'2-digit' }),
      metodo: 'manual', dispositivo: '',
      operador: user?.nombre || 'Admin',
      observacion: `Pesaje rápido — raza ${a.raza}`,
      lote: a.lote, categoria: a.categoria,
    };
    setPesajes(prev => [newPesaje, ...prev]);
    setAnimals(prev => prev.map(x => x.id === a.id ? { ...x, peso: Number(row.peso) } : x));
    updatePRow(a.id, { saved: true });
  };

  // Form state
  const [formRegistro, setFormRegistro] = useState("NO");
  const [formFechaNac, setFormFechaNac] = useState("");
  const [formEdad, setFormEdad] = useState("");
  const [formPeso, setFormPeso] = useState("");
  const [formValorKilo, setFormValorKilo] = useState("0");
  const [formValorAnimal, setFormValorAnimal] = useState(0);
  const [formCat, setFormCat] = useState("Vaca adulta");
  const [formRaza, setFormRaza] = useState("Holstein");
  const [btConnecting, setBtConnecting] = useState(false);

  useEffect(() => { setFormEdad(calcEdad(formFechaNac)); }, [formFechaNac]);
  useEffect(() => {
    const p = Number(formPeso) || 0;
    const vk = Number(formValorKilo) || 0;
    setFormValorAnimal(p * vk);
  }, [formPeso, formValorKilo]);

  const resetForm = () => {
    setFormRegistro("NO"); setFormFechaNac(""); setFormEdad("");
    setFormPeso(""); setFormValorKilo("0"); setFormValorAnimal(0);
    setFormCat("Vaca adulta"); setFormRaza("Holstein"); setEditAnimal(null);
  };

  const openNew = () => { resetForm(); setOpen(true); };
  const openEdit = (a: typeof animals[0]) => {
    setEditAnimal(a);
    setFormRegistro(a.registro || "NO");
    setFormFechaNac(a.fechaNacimiento || "");
    setFormEdad(calcEdad(a.fechaNacimiento || ""));
    setFormPeso(String(a.peso));
    setFormValorKilo(String(a.valorKilo || 0));
    setFormValorAnimal((a.peso || 0) * (a.valorKilo || 0));
    setFormCat(a.categoria);
    setFormRaza(a.raza);
    setOpen(true);
  };

  const handleBluetooth = () => {
    setBtConnecting(true);
    const pesoSug = PESOS_RAZA[formRaza]?.[formCat] || 400;
    setTimeout(() => {
      setFormPeso((pesoSug + (Math.random() - 0.5) * 20).toFixed(1));
      setBtConnecting(false);
    }, 1500);
  };

  const autoCalcPeso = () => {
    const p = PESOS_RAZA[formRaza]?.[formCat] || 400;
    setFormPeso(String(p));
  };

  const filtered = animals.filter(a => {
    const ms = a.nombre.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase()) ||
      a.raza.toLowerCase().includes(search.toLowerCase());
    return ms &&
      (catFilter === "Todos" || a.categoria === catFilter) &&
      (estadoFilter === "Todos" || a.estado === estadoFilter) &&
      (loteFilter === "Todos" || a.lote === loteFilter);
  });

  const filteredEtiq = animals.filter(a =>
    a.nombre.toLowerCase().includes(etiqSearch.toLowerCase()) ||
    a.id.toLowerCase().includes(etiqSearch.toLowerCase())
  );

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const entry = {
      id: editAnimal ? editAnimal.id : (fd.get('arete') as string),
      nombre: fd.get('nombre') as string,
      raza: formRaza,
      categoria: formCat,
      peso: Number(formPeso),
      lote: fd.get('lote') as string,
      estado: fd.get('estado') as string,
      litrosDia: Number(fd.get('litrosDia') || 0),
      partos: Number(fd.get('partos') || 0),
      fechaNacimiento: formFechaNac,
      registro: formRegistro,
      numeroRegistro: formRegistro === "SI" ? (fd.get('numeroRegistro') as string || "") : "",
      valorKilo: Number(formValorKilo) || 0,
    };
    if (editAnimal) setAnimals(animals.map(a => a.id === editAnimal.id ? entry : a));
    else setAnimals([entry, ...animals]);
    setOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => setAnimals(animals.filter(a => a.id !== id));

  // Stats
  const totalLeche = animals.reduce((s, a) => s + (a.litrosDia || 0), 0);
  const totalValor = animals.reduce((s, a) => s + (a.peso || 0) * (a.valorKilo || 0), 0);
  const pesoPromedio = animals.length ? (animals.reduce((s,a) => s + a.peso, 0) / animals.length).toFixed(0) : '0';

  // Chart data
  const byRaza = Array.from(new Set(animals.map(a => a.raza))).map(r => ({
    raza: r.split(' ')[0], count: animals.filter(a => a.raza === r).length,
    promPeso: Math.round(animals.filter(a => a.raza === r).reduce((s,a) => s + a.peso, 0) / (animals.filter(a => a.raza === r).length || 1)),
  }));
  const byEstado = Object.entries(
    animals.reduce((acc, a) => { acc[a.estado] = (acc[a.estado] || 0) + 1; return acc; }, {} as Record<string,number>)
  ).map(([name, value]) => ({ name, value, color: ESTADO_CONFIG[name]?.color || '#888' }));
  const byCat = ['Vaca adulta','Novilla','Ternero','Ternera','Toro'].map(c => ({
    name: c, count: animals.filter(a => a.categoria === c).length,
    color: CAT_CONFIG[c]?.color || '#888'
  })).filter(d => d.count > 0);
  const byLote = Array.from(new Set(animals.map(a => a.lote))).map(l => ({
    lote: l, count: animals.filter(a => a.lote === l).length,
    color: LOTE_COLOR[l] || '#888',
  }));

  const catConf = (c: string) => CAT_CONFIG[c] || CAT_CONFIG["Vaca adulta"];

  return (
    <div className="space-y-5 pb-8">
      {/* === BANNER === */}
      <div className="rounded-xl p-5 relative overflow-hidden"
        style={{background:'linear-gradient(135deg,#001a11 0%,#002e1a 50%,#001a11 100%)',
          border:'1px solid rgba(0,245,212,0.35)',
          boxShadow:'0 0 60px rgba(0,245,212,0.08), inset 0 1px 0 rgba(0,245,212,0.08)'}}>
        <div className="absolute right-0 top-0 bottom-0 w-64 pointer-events-none opacity-10"
          style={{background:'radial-gradient(ellipse at right, #00f5d4, transparent 70%)'}}/>
        <div className="absolute bottom-0 left-40 w-32 h-32 pointer-events-none opacity-5"
          style={{background:'radial-gradient(circle, #39ff7e, transparent 70%)'}}/>

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{background:'rgba(0,245,212,0.1)', border:'1px solid rgba(0,245,212,0.4)', boxShadow:'0 0 20px rgba(0,245,212,0.2)'}}>
              🐄
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-white" style={{fontFamily:'Sora,sans-serif'}}>
                  Inventario Animal
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{background:'rgba(0,245,212,0.15)',color:'#00f5d4',border:'1px solid rgba(0,245,212,0.3)'}}>
                  {animals.length} cabezas
                </span>
              </div>
              <p className="text-sm" style={{color:'rgba(0,245,212,0.65)'}}>
                Registro RFID · Básculas Tru-Test · Etiquetas · Fichas · Estadísticas
              </p>
              <div className="flex gap-3 mt-1.5 flex-wrap">
                {['Producción','Gestante','Tratamiento'].map(e => {
                  const n = animals.filter(a => a.estado === e).length;
                  const ec = ESTADO_CONFIG[e];
                  return (
                    <span key={e} className="text-[10px] flex items-center gap-1" style={{color:ec?.color||'#888'}}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{background:ec?.color||'#888'}}/>
                      {n} {e}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" className="h-9 gap-1.5 text-sm"
              style={{background:'rgba(0,245,212,0.06)', border:'1px solid rgba(0,245,212,0.25)', color:'#00f5d4'}}>
              <Download size={13}/> Exportar CSV
            </Button>
            <Button className="h-9 gap-1.5 text-sm"
              onClick={() => { setActiveTab("etiquetas"); }}
              style={{background:'rgba(57,255,126,0.1)', border:'1px solid rgba(57,255,126,0.3)', color:'#39ff7e'}}>
              <Tag size={13}/> Etiquetas
            </Button>
            <Dialog open={open} onOpenChange={v => { if (!v) resetForm(); setOpen(v); }}>
              <DialogTrigger asChild>
                <Button onClick={openNew} className="h-9 gap-1.5 text-sm"
                  style={{background:'rgba(0,245,212,0.15)', border:'1px solid rgba(0,245,212,0.4)', color:'#fff'}}>
                  <Plus size={14}/> Agregar Animal
                </Button>
              </DialogTrigger>
              {/* FORM DIALOG */}
              <DialogContent className="sm:max-w-[560px] max-h-[92vh] overflow-y-auto">
                <form onSubmit={handleSave}>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <span className="text-xl">{editAnimal ? '✏️' : '🐄'}</span>
                      {editAnimal ? `Editar: ${editAnimal.nombre}` : "Registrar Nuevo Animal"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {!editAnimal && (
                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold">Número de Arete</Label>
                        <Input name="arete" required placeholder="Ej. A-1234" className="font-mono"/>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold">Nombre</Label>
                        <Input name="nombre" required defaultValue={editAnimal?.nombre}/>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold">Raza</Label>
                        <Select value={formRaza} onValueChange={v => { setFormRaza(v); setFormPeso(""); }}>
                          <SelectTrigger><SelectValue/></SelectTrigger>
                          <SelectContent>{['Holstein','Simmental','Brahman','Gyr X','Gyr','Jersey'].map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Fecha nacimiento + edad auto */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold">Fecha de Nacimiento</Label>
                      <div className="flex gap-2 items-center">
                        <Input type="date" value={formFechaNac} onChange={e => setFormFechaNac(e.target.value)} className="flex-1"/>
                        {formEdad && formEdad !== "—" && (
                          <span className="text-xs px-3 py-1.5 rounded-full font-bold whitespace-nowrap"
                            style={{background:'rgba(0,245,212,0.12)',color:'#00f5d4',border:'1px solid rgba(0,245,212,0.25)'}}>
                            ⏱ {formEdad}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Registro */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold">Registro Oficial</Label>
                      <div className="flex gap-2 mb-2">
                        {["SI","NO"].map(v => (
                          <button key={v} type="button" onClick={() => setFormRegistro(v)}
                            className="flex-1 py-2 rounded-lg text-sm font-bold transition-all"
                            style={formRegistro === v
                              ? {background:'rgba(0,245,212,0.2)',color:'#00f5d4',border:'1px solid rgba(0,245,212,0.5)'}
                              : {background:'rgba(255,255,255,0.04)',color:'rgba(255,255,255,0.35)',border:'1px solid rgba(255,255,255,0.08)'}}>
                            {v === "SI" ? "✓ SÍ" : "✗ NO"}
                          </button>
                        ))}
                      </div>
                      {formRegistro === "SI" && (
                        <Input name="numeroRegistro" placeholder="N° de Registro oficial"
                          defaultValue={editAnimal?.numeroRegistro || ""}/>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold">Categoría</Label>
                        <Select value={formCat} onValueChange={v => { setFormCat(v); setFormPeso(""); }}>
                          <SelectTrigger><SelectValue/></SelectTrigger>
                          <SelectContent>{['Vaca adulta','Novilla','Ternero','Ternera','Toro'].map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold">Estado</Label>
                        <Select name="estado" defaultValue={editAnimal?.estado || "Producción"}>
                          <SelectTrigger><SelectValue/></SelectTrigger>
                          <SelectContent>{['Producción','Seca','Gestante','Abierta','Tratamiento','Destete','Lactancia','Activo'].map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold">Lote</Label>
                        <Select name="lote" defaultValue={editAnimal?.lote || "Lote A"}>
                          <SelectTrigger><SelectValue/></SelectTrigger>
                          <SelectContent>{['Lote A','Lote B','Lote C','Lote D','Lote E','Lote F'].map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Peso + BT + auto-calc */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold">Peso (kg)</Label>
                      <div className="flex gap-2">
                        <Input type="number" step="0.1" value={formPeso} onChange={e => setFormPeso(e.target.value)}
                          placeholder="0.0" className="flex-1" required/>
                        <Button type="button" onClick={handleBluetooth} disabled={btConnecting}
                          className="gap-1.5 px-3 text-xs whitespace-nowrap"
                          style={{background:btConnecting?'rgba(0,200,255,0.2)':'rgba(0,200,255,0.1)',border:'1px solid rgba(0,200,255,0.4)',color:'#00c8ff'}}>
                          <Bluetooth size={13} className={btConnecting?"animate-pulse":""}/>
                          {btConnecting?"Leyendo…":"Báscula BT"}
                        </Button>
                        <Button type="button" onClick={autoCalcPeso}
                          className="gap-1.5 px-3 text-xs whitespace-nowrap"
                          style={{background:'rgba(255,149,0,0.1)',border:'1px solid rgba(255,149,0,0.3)',color:'#ff9500'}}>
                          <Zap size={13}/> Raza
                        </Button>
                      </div>
                      {formRaza && formCat && (
                        <p className="text-[10px] text-white/30">
                          Peso promedio {formRaza} — {formCat}: <strong className="text-white/60">{PESOS_RAZA[formRaza]?.[formCat] || '—'} kg</strong>
                        </p>
                      )}
                    </div>

                    {/* Valor kilo + total auto */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold">$ Valor por Kilo (COP)</Label>
                      <div className="flex gap-2 items-center">
                        <Input type="number" step="100" value={formValorKilo} onChange={e => setFormValorKilo(e.target.value)}
                          placeholder="0" className="flex-1"/>
                        {formValorAnimal > 0 && (
                          <span className="text-sm px-3 py-1.5 rounded-full font-black whitespace-nowrap"
                            style={{background:'rgba(57,255,126,0.1)',color:'#39ff7e',border:'1px solid rgba(57,255,126,0.25)'}}>
                            {fmt(formValorAnimal)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold">Litros / día</Label>
                        <Input name="litrosDia" type="number" step="0.1" defaultValue={editAnimal?.litrosDia ?? 0}/>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold">Partos anteriores</Label>
                        <Input name="partos" type="number" defaultValue={editAnimal?.partos ?? 0}/>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
                    </DialogClose>
                    <Button type="submit" style={{background:'rgba(0,245,212,0.18)',border:'1px solid rgba(0,245,212,0.4)',color:'#00f5d4'}}>
                      {editAnimal ? "✓ Actualizar Animal" : "✓ Guardar Animal"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* === KPI WIDGETS === */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { icon:'🐄', label:'TOTAL HATO', val:String(animals.length), sub:'cabezas', c:'#00f5d4', glow:'0,245,212' },
          { icon:'🥛', label:'PRODUCCIÓN', val:String(animals.filter(a=>a.estado==='Producción').length), sub:'ordeño activo', c:'#4ade80', glow:'74,222,128' },
          { icon:'🤰', label:'GESTANTES', val:String(animals.filter(a=>a.estado==='Gestante').length), sub:'confirmadas', c:'#c084fc', glow:'192,132,252' },
          { icon:'💊', label:'TRATAMIENTO', val:String(animals.filter(a=>a.estado==='Tratamiento').length), sub:'revisar hoy', c:'#f87171', glow:'248,113,113' },
          { icon:'💧', label:'LECHE/DÍA', val:`${totalLeche.toFixed(0)}L`, sub:'producción total', c:'#00c8ff', glow:'0,200,255' },
          { icon:'💰', label:'VALOR HATO', val:totalValor > 0 ? `$${(totalValor/1000000).toFixed(0)}M` : '—', sub:'COP estimado', c:'#39ff7e', glow:'57,255,126' },
        ].map(k => (
          <div key={k.label} className="rounded-xl p-3.5 text-white relative overflow-hidden"
            style={{background:'linear-gradient(135deg,#020d09,#041208)', border:`1px solid rgba(${k.glow},0.18)`}}>
            <div className="absolute top-0 right-0 w-12 h-12 rounded-full pointer-events-none"
              style={{background:`rgb(${k.glow})`, opacity:0.12, filter:'blur(16px)', transform:'translate(30%,-30%)'}}/>
            <div className="text-lg mb-1">{k.icon}</div>
            <div className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{color:`rgba(${k.glow},0.6)`}}>{k.label}</div>
            <div className="text-xl font-black" style={{color:k.c, fontFamily:'Sora,sans-serif'}}>{k.val}</div>
            <div className="text-[9px]" style={{color:'rgba(255,255,255,0.35)'}}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* === TABS === */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex w-full mb-4 p-1 gap-1 h-auto" style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)'}}>
          {[
            { val:'tabla', icon:<TableProperties size={14}/>, label:'Tabla', c:'#00f5d4' },
            { val:'fichas', icon:<Grid3x3 size={14}/>, label:'Fichas', c:'#a78bfa' },
            { val:'etiquetas', icon:<Tag size={14}/>, label:'Etiquetas', c:'#39ff7e' },
            { val:'pesaje', icon:<Scale size={14}/>, label:'Pesaje BT', c:'#ff9500' },
            { val:'pesaje-avanzado', icon:<ClipboardList size={14}/>, label:'Pesaje Manual +', c:'#a78bfa' },
            { val:'estadisticas', icon:<BarChart3 size={14}/>, label:'Estadísticas', c:'#f472b6' },
          ].map(t => (
            <TabsTrigger key={t.val} value={t.val}
              className="flex-1 gap-1.5 h-9 text-sm font-semibold transition-all"
              style={activeTab === t.val
                ? {background:`rgba(${t.c.replace('#','').match(/../g)?.map(h=>parseInt(h,16)).join(',')},0.15)` || 'rgba(0,245,212,0.15)',
                   color:t.c, border:`1px solid ${t.c}40`}
                : {}}>
              {t.icon} {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ─── TABLA ─── */}
        <TabsContent value="tabla">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14}/>
              <Input placeholder="Buscar arete, nombre, raza..." value={search}
                onChange={e => setSearch(e.target.value)} className="pl-9 bg-muted/30"/>
            </div>
            {[
              { val:catFilter, set:setCatFilter, opts:['Todos','Vaca adulta','Novilla','Ternero','Ternera','Toro'], ph:'Categoría' },
              { val:estadoFilter, set:setEstadoFilter, opts:['Todos','Producción','Seca','Gestante','Abierta','Tratamiento','Destete','Lactancia','Activo'], ph:'Estado' },
              { val:loteFilter, set:setLoteFilter, opts:['Todos','Lote A','Lote B','Lote C','Lote D','Lote E','Lote F'], ph:'Lote' },
            ].map((f,i) => (
              <Select key={i} value={f.val} onValueChange={f.set}>
                <SelectTrigger className="w-36 bg-muted/30 text-sm"><SelectValue placeholder={f.ph}/></SelectTrigger>
                <SelectContent>{f.opts.map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
              </Select>
            ))}
          </div>

          <div className="rounded-xl overflow-hidden" style={{border:'1px solid rgba(0,245,212,0.12)'}}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{background:'rgba(0,245,212,0.07)', borderBottom:'1px solid rgba(0,245,212,0.12)'}}>
                    {['ARETE','NOMBRE','RAZA','CATEGORÍA','F.NAC/EDAD','PESO','VALOR TOTAL','LITROS','LOTE','ESTADO','REGISTRO','ACC.'].map(h => (
                      <th key={h} className="text-left px-3 py-3 text-[10px] uppercase font-bold whitespace-nowrap"
                        style={{color:'rgba(0,245,212,0.7)'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => {
                    const cc = catConf(a.categoria);
                    const ec = ESTADO_CONFIG[a.estado];
                    const vt = (a.peso||0)*(a.valorKilo||0);
                    return (
                      <tr key={a.id} className="border-b border-white/5 hover:bg-white/3 transition-colors"
                        style={{'--hover-bg':'rgba(0,245,212,0.03)'} as any}>
                        <td className="px-3 py-2.5">
                          <span className="font-mono text-xs font-semibold" style={{color:cc.color}}>#{a.id}</span>
                        </td>
                        <td className="px-3 py-2.5 font-bold text-white">{a.nombre}</td>
                        <td className="px-3 py-2.5 text-white/60 text-xs">{a.raza}</td>
                        <td className="px-3 py-2.5">
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                            style={{background:cc.bg, color:cc.color, border:`1px solid ${cc.border}`}}>
                            {cc.emoji} {a.categoria}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-xs">
                          {a.fechaNacimiento ? (
                            <div>
                              <div className="text-white/40">{a.fechaNacimiento}</div>
                              <div className="font-bold text-[11px]" style={{color:'#00f5d4'}}>{calcEdad(a.fechaNacimiento)}</div>
                            </div>
                          ) : <span className="text-white/20">—</span>}
                        </td>
                        <td className="px-3 py-2.5 font-bold text-orange-300 whitespace-nowrap">{a.peso} kg</td>
                        <td className="px-3 py-2.5">
                          {vt > 0
                            ? <div>
                                <div className="text-[10px] text-white/30">{a.valorKilo ? fmt(a.valorKilo)+'/kg' : ''}</div>
                                <div className="font-bold text-[11px]" style={{color:'#39ff7e'}}>{fmt(vt)}</div>
                              </div>
                            : <span className="text-white/20">—</span>}
                        </td>
                        <td className="px-3 py-2.5 text-xs">
                          {a.litrosDia ? (
                            <span className="flex items-center gap-1 text-blue-300"><Droplets size={11}/>{a.litrosDia}L</span>
                          ) : <span className="text-white/20">—</span>}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                            style={{background:`${LOTE_COLOR[a.lote]}20`, color:LOTE_COLOR[a.lote]||'#888'}}>
                            📍 {a.lote}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                            style={{background:ec?.bg||'rgba(0,0,0,0.2)', color:ec?.color||'#888'}}>
                            {ec?.emoji} {a.estado}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          {a.registro === "SI" ? (
                            <div className="flex items-center gap-1">
                              <CheckCircle2 size={12} className="text-green-400"/>
                              <span className="text-[10px] text-green-400 font-semibold">{a.numeroRegistro || 'SI'}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-white/25">NO</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex gap-0.5">
                            <button title="Ver ficha" onClick={() => setFichaAnimal(a)}
                              className="p-1.5 rounded hover:bg-white/8 transition-colors" style={{color:'rgba(0,245,212,0.6)'}}>
                              <Eye size={12}/>
                            </button>
                            <button onClick={() => openEdit(a)}
                              className="p-1.5 rounded hover:bg-white/8 transition-colors" style={{color:'rgba(255,149,0,0.6)'}}>
                              <Pencil size={12}/>
                            </button>
                            <button onClick={() => handleDelete(a.id)}
                              className="p-1.5 rounded hover:bg-red-500/20 transition-colors text-red-400/50 hover:text-red-400">
                              <Trash2 size={12}/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-16 text-white/30">
                  <span className="text-4xl block mb-2">🐄</span>
                  <p>No se encontraron animales con los filtros actuales</p>
                </div>
              )}
            </div>
            <div className="px-4 py-2.5 flex justify-between items-center border-t border-white/5">
              <span className="text-xs text-white/30">{filtered.length} de {animals.length} animales</span>
              <span className="text-xs text-white/30">Peso promedio hato: <strong className="text-white/60">{pesoPromedio} kg</strong></span>
            </div>
          </div>
        </TabsContent>

        {/* ─── FICHAS ─── */}
        <TabsContent value="fichas">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14}/>
              <Input placeholder="Buscar animal..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-muted/30"/>
            </div>
            <Select value={catFilter} onValueChange={setCatFilter}>
              <SelectTrigger className="w-36 bg-muted/30 text-sm"><SelectValue placeholder="Categoría"/></SelectTrigger>
              <SelectContent>{['Todos','Vaca adulta','Novilla','Ternero','Ternera','Toro'].map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={loteFilter} onValueChange={setLoteFilter}>
              <SelectTrigger className="w-28 bg-muted/30 text-sm"><SelectValue placeholder="Lote"/></SelectTrigger>
              <SelectContent>{['Todos','Lote A','Lote B','Lote C','Lote D','Lote E','Lote F'].map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(a => (
              <FichaCard key={a.id} a={a}
                onEdit={() => openEdit(a)}
                onDelete={() => handleDelete(a.id)}
                onVerRecibo={() => setFichaAnimal(a)}
              />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-white/30">
              <span className="text-4xl block mb-2">🐄</span>
              <p>No hay animales que mostrar</p>
            </div>
          )}
        </TabsContent>

        {/* ─── ETIQUETAS ─── */}
        <TabsContent value="etiquetas">
          <div className="flex flex-col sm:flex-row gap-3 mb-4 items-start sm:items-center justify-between">
            <div className="flex gap-3 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14}/>
                <Input placeholder="Buscar para etiqueta..." value={etiqSearch}
                  onChange={e => setEtiqSearch(e.target.value)} className="pl-9 bg-muted/30"/>
              </div>
            </div>
            <Button className="gap-2 h-9"
              onClick={() => window.print()}
              style={{background:'rgba(57,255,126,0.12)',border:'1px solid rgba(57,255,126,0.35)',color:'#39ff7e'}}>
              <Printer size={14}/> Imprimir Todas las Etiquetas
            </Button>
          </div>

          {/* Info card */}
          <div className="rounded-xl p-4 mb-5 flex items-center gap-3"
            style={{background:'rgba(57,255,126,0.06)',border:'1px solid rgba(57,255,126,0.18)'}}>
            <Tag size={18} style={{color:'#39ff7e', flexShrink:0}}/>
            <div className="text-sm text-white/60">
              Cada etiqueta incluye: <strong className="text-white/80">Arete, Nombre, Raza, Categoría, Peso, Edad, Estado, Registro, Valor estimado</strong> y código QR para escaneo RFID.
              Usa <strong className="text-white/80">"Imprimir Todas"</strong> o haz clic en una etiqueta individual.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredEtiq.map(a => (
              <div key={a.id} className="cursor-pointer group relative" onClick={() => setFichaAnimal(a)}>
                <div className="absolute inset-0 rounded-xl pointer-events-none group-hover:opacity-100 opacity-0 transition-opacity z-10 flex items-center justify-center"
                  style={{background:'rgba(0,0,0,0.5)'}}>
                  <div className="flex gap-2">
                    <Button size="sm" className="gap-1.5 text-xs" onClick={e => { e.stopPropagation(); window.print(); }}
                      style={{background:'rgba(57,255,126,0.2)',border:'1px solid rgba(57,255,126,0.4)',color:'#39ff7e'}}>
                      <Printer size={12}/> Imprimir
                    </Button>
                    <Button size="sm" className="gap-1.5 text-xs" onClick={e => { e.stopPropagation(); setFichaAnimal(a); }}
                      style={{background:'rgba(0,245,212,0.2)',border:'1px solid rgba(0,245,212,0.4)',color:'#00f5d4'}}>
                      <Eye size={12}/> Ver
                    </Button>
                  </div>
                </div>
                <EtiquetaAnimal a={a}/>
              </div>
            ))}
          </div>

          {filteredEtiq.length === 0 && (
            <div className="text-center py-16 text-white/30">
              <Tag size={36} className="mx-auto mb-2 opacity-30"/>
              <p>No hay etiquetas disponibles</p>
            </div>
          )}
        </TabsContent>

        {/* ─── ESTADÍSTICAS ─── */}
        <TabsContent value="estadisticas">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Por raza */}
            <div className="rounded-xl p-5" style={{background:'linear-gradient(135deg,#040e0a,#071810)',border:'1px solid rgba(255,149,0,0.15)'}}>
              <div className="font-bold mb-4 flex items-center gap-2">
                <Beef size={15} className="text-orange-400"/>
                <span>Animales por Raza</span>
              </div>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byRaza} margin={{top:5,right:10,left:0,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false}/>
                    <XAxis dataKey="raza" tick={{fontSize:10,fill:'#888'}}/>
                    <YAxis tick={{fontSize:10,fill:'#888'}} width={28}/>
                    <Tooltip contentStyle={{backgroundColor:'#111',border:'1px solid #333',fontSize:'11px'}}
                      formatter={(v:number,n:string) => [v, n==='count'?'Animales':'Peso prom. (kg)']}/>
                    <Bar dataKey="count" name="count" fill="#ff9500" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 space-y-1.5">
                {byRaza.map(r => (
                  <div key={r.raza} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0"/>
                    <span className="text-white/60 w-20">{r.raza}</span>
                    <div className="flex-1 h-1 bg-white/5 rounded-full">
                      <div className="h-1 bg-orange-500 rounded-full" style={{width:`${(r.count/animals.length)*100}%`}}/>
                    </div>
                    <span className="text-white/40 w-12 text-right">{r.count} anim. · {r.promPeso}kg</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Por estado */}
            <div className="rounded-xl p-5" style={{background:'linear-gradient(135deg,#040e0a,#071810)',border:'1px solid rgba(0,245,212,0.12)'}}>
              <div className="font-bold mb-4 flex items-center gap-2">
                <Heart size={15} className="text-pink-400"/>
                <span>Estado Sanitario del Hato</span>
              </div>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={byEstado} cx="50%" cy="50%" outerRadius={70} innerRadius={35} dataKey="value" paddingAngle={2}>
                      {byEstado.map((e,i) => <Cell key={i} fill={e.color}/>)}
                    </Pie>
                    <Tooltip contentStyle={{backgroundColor:'#111',border:'1px solid #333',fontSize:'11px'}}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {byEstado.map(e => (
                  <div key={e.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:e.color}}/>
                    <span className="text-white/50">{ESTADO_CONFIG[e.name]?.emoji} {e.name}</span>
                    <span className="font-bold ml-auto" style={{color:e.color}}>{e.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Por categoría */}
            <div className="rounded-xl p-5" style={{background:'linear-gradient(135deg,#040e0a,#071810)',border:'1px solid rgba(167,139,250,0.15)'}}>
              <div className="font-bold mb-4 flex items-center gap-2">
                <Baby size={15} className="text-purple-400"/>
                <span>Distribución por Categoría</span>
              </div>
              <div className="space-y-3">
                {byCat.map(c => {
                  const cc = CAT_CONFIG[c.name];
                  return (
                    <div key={c.name} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                        style={{background:cc.bg, border:`1px solid ${cc.border}`}}>
                        {cc.emoji}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold" style={{color:cc.color}}>{c.name}</span>
                          <span className="text-white/50">{c.count} anim.</span>
                        </div>
                        <div className="h-2 rounded-full" style={{background:'rgba(255,255,255,0.07)'}}>
                          <div className="h-2 rounded-full transition-all" style={{
                            width:`${(c.count/animals.length)*100}%`,
                            background:`linear-gradient(90deg,${cc.color},${cc.color}80)`
                          }}/>
                        </div>
                      </div>
                      <div className="text-xs font-black w-10 text-right" style={{color:cc.color}}>
                        {Math.round((c.count/animals.length)*100)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Por lote + valor */}
            <div className="rounded-xl p-5" style={{background:'linear-gradient(135deg,#040e0a,#071810)',border:'1px solid rgba(57,255,126,0.12)'}}>
              <div className="font-bold mb-4 flex items-center gap-2">
                <DollarSign size={15} className="text-green-400"/>
                <span>Valor por Lote</span>
              </div>
              <div className="space-y-3">
                {byLote.map(l => {
                  const lAnimals = animals.filter(a => a.lote === l.lote);
                  const valor = lAnimals.reduce((s,a) => s + (a.peso||0)*(a.valorKilo||0), 0);
                  const avg = lAnimals.length ? (lAnimals.reduce((s,a) => s+a.peso,0)/lAnimals.length).toFixed(0) : '0';
                  return (
                    <div key={l.lote} className="rounded-lg p-3 flex items-center gap-3"
                      style={{background:`rgba(${l.color.replace('#','').match(/../g)?.map(h=>parseInt(h,16)).join(',')},0.08)` || 'rgba(0,0,0,0.2)',
                        border:`1px solid ${l.color}25`}}>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0"
                        style={{background:`${l.color}20`, color:l.color}}>
                        {l.lote.replace('Lote ','')}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-white">{l.lote}</span>
                          <span className="text-white/40">{l.count} anim. · {avg}kg prom.</span>
                        </div>
                        {valor > 0 && (
                          <div className="font-black text-sm mt-0.5" style={{color:'#39ff7e'}}>{fmt(valor)}</div>
                        )}
                      </div>
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:l.color}}/>
                    </div>
                  );
                })}
              </div>

              {/* Resumen leche */}
              <div className="mt-4 rounded-xl p-3 flex items-center gap-3"
                style={{background:'rgba(0,200,255,0.07)',border:'1px solid rgba(0,200,255,0.2)'}}>
                <Droplets size={20} style={{color:'#00c8ff', flexShrink:0}}/>
                <div>
                  <div className="text-[10px] text-white/30 uppercase tracking-wider">Producción total diaria</div>
                  <div className="font-black text-xl" style={{color:'#00c8ff'}}>{totalLeche.toFixed(1)} L/día</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-[10px] text-white/30">Promedio/vaca</div>
                  <div className="font-bold" style={{color:'#00c8ff'}}>
                    {animals.filter(a=>a.litrosDia>0).length
                      ? (totalLeche/animals.filter(a=>a.litrosDia>0).length).toFixed(1)
                      : '0'} L
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        {/* ─── PESAJE RÁPIDO ─── */}
        <TabsContent value="pesaje">
          {/* Banner */}
          <div className="rounded-xl p-4 mb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between"
            style={{background:'linear-gradient(135deg,#0d0800,#1a0f00)',border:'1px solid rgba(255,149,0,0.3)',boxShadow:'0 0 30px rgba(255,149,0,0.06)'}}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{background:'rgba(255,149,0,0.12)',border:'1px solid rgba(255,149,0,0.35)'}}>⚖️</div>
              <div>
                <div className="font-black text-base text-white">Pesaje Rápido — Un Clic por Animal</div>
                <p className="text-xs" style={{color:'rgba(255,149,0,0.6)'}}>
                  Auto-cálculo por raza · Báscula BT · Guardar y actualizar · Recibo PDF imprimible
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={pesajeLoteFilter} onValueChange={setPesajeLoteFilter}>
                <SelectTrigger className="w-28 text-xs bg-black/30" style={{border:'1px solid rgba(255,149,0,0.25)',color:'rgba(255,149,0,0.8)'}}>
                  <SelectValue placeholder="Lote"/>
                </SelectTrigger>
                <SelectContent>
                  {['Todos','Lote A','Lote B','Lote C','Lote D','Lote E','Lote F'].map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button className="h-8 text-xs gap-1.5" onClick={() => window.print()}
                style={{background:'rgba(255,149,0,0.1)',border:'1px solid rgba(255,149,0,0.35)',color:'#ff9500'}}>
                <Printer size={12}/> Imprimir Sesión
              </Button>
            </div>
          </div>

          {/* Pesos raza reference */}
          <div className="rounded-xl p-4 mb-4 overflow-x-auto" style={{background:'rgba(255,149,0,0.04)',border:'1px solid rgba(255,149,0,0.12)'}}>
            <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{color:'rgba(255,149,0,0.5)'}}>
              📊 Tabla de Pesos Estándar por Raza (kg)
            </div>
            <table className="w-full text-[10px] min-w-[480px]">
              <thead>
                <tr>
                  <th className="text-left py-1.5 pr-3 font-bold" style={{color:'rgba(255,149,0,0.6)'}}>Raza</th>
                  {['Vaca adulta','Novilla','Ternero','Ternera','Toro'].map(c => (
                    <th key={c} className="text-center py-1.5 px-2 font-bold" style={{color:'rgba(255,149,0,0.6)'}}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(PESOS_RAZA).map(([raza, cats]) => (
                  <tr key={raza} className="border-t border-white/5">
                    <td className="py-1.5 pr-3 font-semibold text-white/70">{raza}</td>
                    {['Vaca adulta','Novilla','Ternero','Ternera','Toro'].map(c => (
                      <td key={c} className="py-1.5 px-2 text-center font-mono" style={{color:'#ff9500'}}>
                        {cats[c]} kg
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Animal rows */}
          <div className="space-y-2">
            {animals
              .filter(a => pesajeLoteFilter === 'Todos' || a.lote === pesajeLoteFilter)
              .map(a => {
                const cc = CAT_CONFIG[a.categoria] || CAT_CONFIG["Vaca adulta"];
                const row = getPRow(a);
                const pesoNum = Number(row.peso) || 0;
                const vkNum = Number(row.valorKilo) || 0;
                const valorTotal = pesoNum * vkNum;
                const pesoRaza = PESOS_RAZA[a.raza]?.[a.categoria] || a.peso;
                const pct = Math.min(100, Math.round((pesoNum / pesoRaza) * 100));
                const diff = pesoNum - a.peso;
                const isNew = pesajes.some(p => p.animalId === a.id && p.fecha === new Date().toLocaleDateString('es-CO'));

                return (
                  <div key={a.id} className="rounded-xl p-3 transition-all"
                    style={{
                      background: row.saved ? 'rgba(57,255,126,0.06)' : 'linear-gradient(135deg,#050e07,#060c08)',
                      border: row.saved
                        ? '1px solid rgba(57,255,126,0.25)'
                        : `1px solid rgba(${cc.glow},0.15)`,
                    }}>
                    <div className="flex flex-wrap gap-3 items-center">
                      {/* Animal info */}
                      <div className="flex items-center gap-2 min-w-[160px]">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                          style={{background:cc.bg, border:`1px solid ${cc.border}`}}>
                          {cc.emoji}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-white">{a.nombre}</div>
                          <div className="text-[10px] flex items-center gap-1.5" style={{color:'rgba(255,255,255,0.35)'}}>
                            <span className="font-mono" style={{color:cc.color}}>#{a.id}</span>
                            <span>·</span>
                            <span>{a.raza}</span>
                            <span>·</span>
                            <span style={{color:LOTE_COLOR[a.lote]||'#888'}}>{a.lote}</span>
                          </div>
                        </div>
                      </div>

                      {/* Peso anterior */}
                      <div className="text-center min-w-[70px]">
                        <div className="text-[9px] text-white/30 uppercase tracking-wide">Anterior</div>
                        <div className="font-mono font-bold text-xs text-white/50">{a.peso} kg</div>
                      </div>

                      {/* Peso input */}
                      <div className="flex items-center gap-1.5 flex-1 min-w-[180px]">
                        <Input
                          type="number" step="0.1"
                          value={row.peso}
                          onChange={e => updatePRow(a.id, { peso: e.target.value, saved: false })}
                          className="w-24 text-center font-mono font-bold text-base h-9"
                          style={{background:'rgba(0,0,0,0.4)',border:`1px solid rgba(${cc.glow},0.3)`,color:cc.color}}
                        />
                        <span className="text-xs text-white/30">kg</span>
                        {diff !== 0 && !isNaN(diff) && (
                          <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                            style={{
                              background: diff > 0 ? 'rgba(57,255,126,0.12)' : 'rgba(248,113,113,0.12)',
                              color: diff > 0 ? '#39ff7e' : '#f87171',
                            }}>
                            {diff > 0 ? '+' : ''}{diff.toFixed(1)} kg
                          </span>
                        )}
                      </div>

                      {/* Valor/kg input */}
                      <div className="flex items-center gap-1.5 min-w-[140px]">
                        <span className="text-[10px] text-white/30">$/kg</span>
                        <Input
                          type="number" step="100"
                          value={row.valorKilo}
                          onChange={e => updatePRow(a.id, { valorKilo: e.target.value, saved: false })}
                          className="w-24 text-center font-mono h-9 text-xs"
                          style={{background:'rgba(0,0,0,0.4)',border:'1px solid rgba(57,255,126,0.2)',color:'#39ff7e'}}
                        />
                      </div>

                      {/* Valor total */}
                      {valorTotal > 0 && (
                        <div className="text-center min-w-[90px]">
                          <div className="text-[9px] text-white/30">Valor total</div>
                          <div className="font-black text-xs" style={{color:'#39ff7e'}}>{fmt(valorTotal)}</div>
                        </div>
                      )}

                      {/* Peso bar */}
                      <div className="flex-1 min-w-[80px] hidden md:block">
                        <div className="flex justify-between text-[9px] mb-0.5">
                          <span className="text-white/25">vs. raza</span>
                          <span style={{color:cc.color}}>{pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/5">
                          <div className="h-1.5 rounded-full transition-all" style={{width:`${pct}%`,background:cc.color}}/>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-1.5 flex-shrink-0 flex-wrap">
                        {/* Auto-calc raza */}
                        <button onClick={() => autoCalcRazaPesaje(a)}
                          title={`Auto peso estándar ${a.raza}: ${pesoRaza} kg`}
                          className="h-8 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all hover:opacity-90"
                          style={{background:'rgba(255,149,0,0.12)',border:'1px solid rgba(255,149,0,0.3)',color:'#ff9500'}}>
                          <Zap size={11}/> Raza
                        </button>
                        {/* BT simulado */}
                        <button onClick={() => btSimPesaje(a)} disabled={row.btLoading}
                          title="Simular báscula Bluetooth"
                          className="h-8 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all hover:opacity-90"
                          style={{background:'rgba(0,200,255,0.1)',border:'1px solid rgba(0,200,255,0.3)',color:'#00c8ff'}}>
                          <Bluetooth size={11} className={row.btLoading ? 'animate-pulse' : ''}/>
                          {row.btLoading ? '…' : 'BT'}
                        </button>
                        {/* Registrar */}
                        <button onClick={() => registrarPesajeRapido(a)} disabled={row.saved}
                          className="h-8 px-3 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                          style={row.saved
                            ? {background:'rgba(57,255,126,0.08)',border:'1px solid rgba(57,255,126,0.2)',color:'rgba(57,255,126,0.5)'}
                            : {background:'rgba(57,255,126,0.15)',border:'1px solid rgba(57,255,126,0.4)',color:'#39ff7e'}}>
                          {row.saved ? <>✓ Guardado</> : <><Scale size={11}/> Registrar</>}
                        </button>
                        {/* Imprimir recibo */}
                        <button onClick={() => { setPrintPesajeData(a); setTimeout(()=>window.print(), 100); }}
                          className="h-8 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all hover:opacity-90"
                          style={{background:'rgba(167,139,250,0.1)',border:'1px solid rgba(167,139,250,0.3)',color:'#a78bfa'}}>
                          <Printer size={11}/> PDF
                        </button>
                      </div>
                    </div>

                    {/* Saved indicator */}
                    {row.saved && (
                      <div className="mt-2 flex items-center gap-1.5 text-[10px]" style={{color:'#39ff7e'}}>
                        <CheckCircle2 size={11}/>
                        <span>Pesaje registrado · {new Date().toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})} · Peso actualizado a {row.peso} kg</span>
                      </div>
                    )}
                    {isNew && !row.saved && (
                      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-white/30">
                        <Clock size={10}/> Pesaje previo hoy registrado
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {/* Session pesajes */}
          {pesajes.filter(p => p.fecha === new Date().toLocaleDateString('es-CO')).length > 0 && (
            <div className="mt-5 rounded-xl p-4" style={{background:'rgba(57,255,126,0.05)',border:'1px solid rgba(57,255,126,0.15)'}}>
              <div className="font-bold text-sm mb-3 flex items-center gap-2">
                <CheckCircle2 size={14} style={{color:'#39ff7e'}}/>
                <span>Pesajes registrados hoy ({pesajes.filter(p=>p.fecha===new Date().toLocaleDateString('es-CO')).length})</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{borderBottom:'1px solid rgba(57,255,126,0.1)'}}>
                      {['Animal','Arete','Peso','Anterior','Cambio','Hora','Operador'].map(h=>(
                        <th key={h} className="text-left py-2 pr-3 text-[10px] font-bold uppercase tracking-wider" style={{color:'rgba(57,255,126,0.5)'}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pesajes.filter(p=>p.fecha===new Date().toLocaleDateString('es-CO')).map(p => {
                      const d = p.peso - p.pesoAnterior;
                      return (
                        <tr key={p.id} className="border-b border-white/5">
                          <td className="py-2 pr-3 font-bold text-white">{p.animalNombre}</td>
                          <td className="py-2 pr-3 font-mono text-white/40">#{p.animalId}</td>
                          <td className="py-2 pr-3 font-black text-orange-400">{p.peso} kg</td>
                          <td className="py-2 pr-3 text-white/30">{p.pesoAnterior} kg</td>
                          <td className="py-2 pr-3">
                            <span style={{color: d>=0?'#39ff7e':'#f87171', fontWeight:'bold'}}>
                              {d>=0?'+':''}{d} kg
                            </span>
                          </td>
                          <td className="py-2 pr-3 text-white/40">{p.hora}</td>
                          <td className="py-2 pr-3 text-white/40">{p.operador}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>


        {/* ─── PESAJE MANUAL AVANZADO ─── */}
        <TabsContent value="pesaje-avanzado">
          {/* Banner */}
          <div className="rounded-xl p-5 mb-4 relative overflow-hidden"
            style={{background:'linear-gradient(135deg,#120020,#1e0035,#120020)',border:'1px solid rgba(167,139,250,0.4)',boxShadow:'0 0 40px rgba(167,139,250,0.1)'}}>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
              <ClipboardList className="w-28 h-28 text-purple-300"/>
            </div>
            <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{background:'rgba(167,139,250,0.12)',border:'1px solid rgba(167,139,250,0.45)',boxShadow:'0 0 20px rgba(167,139,250,0.25)'}}>
                  <ClipboardList size={26} style={{color:'#a78bfa'}}/>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2 className="text-xl font-black text-white" style={{fontFamily:'Sora,sans-serif'}}>Pesaje Manual Avanzado</h2>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{background:'rgba(167,139,250,0.2)',color:'#a78bfa',border:'1px solid rgba(167,139,250,0.4)'}}>PRO</span>
                  </div>
                  <p className="text-sm" style={{color:'rgba(196,181,253,0.7)'}}>
                    CC (Condición Corporal 1–5) · GMD · Alerta nutricional · Referencia por raza · Sesión completa
                  </p>
                  <div className="flex flex-wrap gap-3 mt-1.5">
                    {[
                      {label:`${animals.length} animales`, c:'#a78bfa'},
                      {label:`${Object.values(advRows).filter(r=>r.modified&&!r.saved).length} por guardar`, c:'#fbbf24'},
                      {label:`${advSessionLog.length} pesajes hoy`, c:'#4ade80'},
                    ].map(b => (
                      <span key={b.label} className="text-[10px] flex items-center gap-1" style={{color:b.c}}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{background:b.c}}/>{b.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" className="gap-1.5 text-xs h-9" onClick={() => setAdvRefOpen(v=>!v)}
                  style={{background:'rgba(167,139,250,0.12)',border:'1px solid rgba(167,139,250,0.35)',color:'#a78bfa'}}>
                  <Layers size={13}/> {advRefOpen ? "Ocultar" : "Mostrar"} Tabla Razas
                </Button>
                <Button size="sm" className="gap-1.5 text-xs h-9" onClick={batchSaveAllAdv}
                  disabled={advBatchSaving || Object.values(advRows).filter(r=>r.modified&&!r.saved).length===0}
                  style={{background:'rgba(57,255,126,0.12)',border:'1px solid rgba(57,255,126,0.35)',color:'#39ff7e'}}>
                  <Save size={13}/> {advBatchSaving?"Guardando…":"Guardar Todo"}
                </Button>
                <Button size="sm" className="gap-1.5 text-xs h-9" onClick={resetAllAdvRows}
                  style={{background:'rgba(248,113,113,0.08)',border:'1px solid rgba(248,113,113,0.25)',color:'#f87171'}}>
                  <RotateCcw size={13}/> Limpiar Sesión
                </Button>
                <Button size="sm" className="gap-1.5 text-xs h-9" onClick={()=>window.print()}
                  style={{background:'rgba(255,149,0,0.1)',border:'1px solid rgba(255,149,0,0.3)',color:'#ff9500'}}>
                  <Printer size={13}/> Imprimir
                </Button>
              </div>
            </div>
          </div>

          {/* Tabla referencia razas (collapsible) */}
          {advRefOpen && (
            <div className="rounded-xl p-4 mb-4 overflow-x-auto" style={{background:'rgba(167,139,250,0.04)',border:'1px solid rgba(167,139,250,0.18)'}}>
              <div className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{color:'rgba(167,139,250,0.6)'}}>
                📊 Pesos de Referencia por Raza y Categoría (kg) — FAO/FEDEGAN Colombia
              </div>
              <table className="w-full text-[10px] min-w-[600px]">
                <thead>
                  <tr style={{borderBottom:'1px solid rgba(167,139,250,0.15)'}}>
                    <th className="text-left py-2 pr-4 font-bold" style={{color:'rgba(167,139,250,0.7)'}}>Raza</th>
                    {['Vaca adulta','Novilla','Ternero','Ternera','Toro'].map(c=>(
                      <th key={c} colSpan={3} className="text-center py-2 px-2 font-bold border-l border-white/5" style={{color:'rgba(167,139,250,0.7)'}}>{c}</th>
                    ))}
                  </tr>
                  <tr style={{borderBottom:'1px solid rgba(167,139,250,0.1)'}}>
                    <th/>
                    {['Vaca adulta','Novilla','Ternero','Ternera','Toro'].map(c=>(['Mín','Prom','Máx'].map(l=>(
                      <th key={c+l} className="text-center py-1 px-1 text-[9px] border-l border-white/5" style={{color:'rgba(255,255,255,0.25)'}}>{l}</th>
                    ))))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(PESOS_RAZA_ADV).map(([raza, cats])=>(
                    <tr key={raza} className="border-t border-white/5 hover:bg-purple-500/5">
                      <td className="py-2 pr-4 font-bold text-white/70">{raza}</td>
                      {['Vaca adulta','Novilla','Ternero','Ternera','Toro'].map(c=>{
                        const d = cats[c];
                        return d ? [
                          <td key={c+'min'} className="py-2 px-1 text-center text-blue-300/70 border-l border-white/5">{d.min}</td>,
                          <td key={c+'prom'} className="py-2 px-1 text-center font-black border-l border-white/5" style={{color:'#a78bfa'}}>{d.promedio}</td>,
                          <td key={c+'max'} className="py-2 px-1 text-center text-blue-300/70 border-l border-white/5">{d.max}</td>,
                        ] : [<td key={c+'—'} colSpan={3} className="py-2 px-1 text-center text-white/15 border-l border-white/5">—</td>];
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-2 text-[9px] text-white/20">* Valores de referencia promedio Colombia. Condiciones pueden variar por altitud, alimentación y manejo.</div>
            </div>
          )}

          {/* CC Scale legend */}
          <div className="rounded-xl p-3 mb-4 overflow-x-auto" style={{background:'rgba(167,139,250,0.04)',border:'1px solid rgba(167,139,250,0.12)'}}>
            <div className="text-[9px] font-bold uppercase tracking-wider mb-2" style={{color:'rgba(167,139,250,0.5)'}}>Escala Condición Corporal (CC) — Método INIA/FAO</div>
            <div className="flex gap-2 min-w-max">
              {Object.entries(CC_CONFIG).map(([cc,cfg])=>(
                <div key={cc} className="flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg" style={{background:`rgba(${cfg.glow},0.08)`,border:`1px solid rgba(${cfg.glow},0.2)`}}>
                  <span className="text-base">{cfg.emoji}</span>
                  <span className="font-black text-xs" style={{color:cfg.color}}>{cc}</span>
                  <span className="text-[8px] text-white/40 text-center whitespace-nowrap">{cfg.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Filters bar */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={13}/>
              <Input placeholder="Buscar nombre, arete..." value={advSearch}
                onChange={e=>setAdvSearch(e.target.value)} className="pl-8 h-9 text-sm bg-muted/30"/>
            </div>
            {[
              {label:'Raza', val:advRazaFilter, set:setAdvRazaFilter, opts:['Todas','Holstein','Simmental','Brahman','Gyr X','Gyr','Jersey']},
              {label:'Categoría', val:advCatFilter, set:setAdvCatFilter, opts:['Todas','Vaca adulta','Novilla','Ternero','Ternera','Toro']},
              {label:'Lote', val:advLoteFilter, set:setAdvLoteFilter, opts:['Todos','Lote A','Lote B','Lote C','Lote D','Lote E','Lote F']},
            ].map((f,i)=>(
              <Select key={i} value={f.val} onValueChange={f.set}>
                <SelectTrigger className="w-32 h-9 text-xs bg-muted/30"><SelectValue placeholder={f.label}/></SelectTrigger>
                <SelectContent>{f.opts.map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
              </Select>
            ))}
            <Select value={advSortBy} onValueChange={v=>setAdvSortBy(v as typeof advSortBy)}>
              <SelectTrigger className="w-36 h-9 text-xs bg-muted/30"><SelectValue placeholder="Ordenar"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="nombre">A–Z Nombre</SelectItem>
                <SelectItem value="peso_desc">Peso ↓ Mayor</SelectItem>
                <SelectItem value="diferencia">Diferencia ↓</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" className="h-9 gap-1.5 text-xs"
              onClick={() => { animals.filter(a=>advLoteFilter==='Todos'||a.lote===advLoteFilter).forEach(autoFillAdvByRaza); }}
              style={{background:'rgba(167,139,250,0.12)',border:'1px solid rgba(167,139,250,0.3)',color:'#a78bfa'}}>
              <Zap size={12}/> Auto-Raza Todos
            </Button>
          </div>

          {/* Quick session KPIs */}
          {(() => {
            const filtered = animals.filter(a=>{
              const ms = a.nombre.toLowerCase().includes(advSearch.toLowerCase()) || a.id.toLowerCase().includes(advSearch.toLowerCase());
              return ms && (advRazaFilter==='Todas'||a.raza===advRazaFilter) && (advCatFilter==='Todas'||a.categoria===advCatFilter) && (advLoteFilter==='Todos'||a.lote===advLoteFilter);
            });
            const modified = filtered.filter(a=>advRows[a.id]?.modified&&!advRows[a.id]?.saved);
            const savedToday = filtered.filter(a=>advRows[a.id]?.saved);
            const totalValorSession = advSessionLog.reduce((s,r)=>s + r.peso * (animals.find(a=>a.nombre===r.nombre)?.valorKilo||0), 0);
            return (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  {icon:'🐄', label:'En esta vista', val:String(filtered.length), c:'#a78bfa', glow:'167,139,250'},
                  {icon:'⚡', label:'Por guardar', val:String(modified.length), c:'#fbbf24', glow:'251,191,36'},
                  {icon:'✅', label:'Guardados hoy', val:String(savedToday.length + advSessionLog.length), c:'#4ade80', glow:'74,222,128'},
                  {icon:'💰', label:'Valor sesión', val:totalValorSession > 0 ? `$${(totalValorSession/1000000).toFixed(1)}M` : '—', c:'#39ff7e', glow:'57,255,126'},
                ].map(k=>(
                  <div key={k.label} className="rounded-xl p-3 relative overflow-hidden" style={{background:'linear-gradient(135deg,#060410,#090618)',border:`1px solid rgba(${k.glow},0.2)`}}>
                    <div className="text-base mb-1">{k.icon}</div>
                    <div className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{color:`rgba(${k.glow},0.55)`}}>{k.label}</div>
                    <div className="text-lg font-black" style={{color:k.c,fontFamily:'Sora,sans-serif'}}>{k.val}</div>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Animal weighing cards */}
          <div className="space-y-3">
            {(() => {
              let list = animals.filter(a=>{
                const ms = a.nombre.toLowerCase().includes(advSearch.toLowerCase()) || a.id.toLowerCase().includes(advSearch.toLowerCase());
                return ms && (advRazaFilter==='Todas'||a.raza===advRazaFilter) && (advCatFilter==='Todas'||a.categoria===advCatFilter) && (advLoteFilter==='Todos'||a.lote===advLoteFilter);
              });
              if (advSortBy==='peso_desc') list = [...list].sort((a,b)=>b.peso-a.peso);
              else if (advSortBy==='diferencia') list = [...list].sort((a,b)=>{
                const da = Math.abs((Number(getAdvRow(a).peso)||a.peso)-a.peso);
                const db = Math.abs((Number(getAdvRow(b).peso)||b.peso)-b.peso);
                return db-da;
              });
              else list = [...list].sort((a,b)=>a.nombre.localeCompare(b.nombre));

              return list.map(a => {
                const row = getAdvRow(a);
                const cc = CC_CONFIG[row.condicion] || CC_CONFIG["3.0"];
                const cat = CAT_CONFIG[a.categoria] || CAT_CONFIG["Vaca adulta"];
                const ec = ESTADO_CONFIG[a.estado] || {color:'#888',emoji:'—'};
                const pesoN = Number(row.peso) || a.peso;
                const vkN = Number(row.valorKilo) || 0;
                const valorTotal = pesoN * vkN;
                const esp = getPesoEspAdv(a.raza, a.categoria);
                const pct = Math.min(100, Math.round((pesoN / esp.promedio) * 100));
                const diff = pesoN - a.peso;
                const isUnder = pesoN < esp.min;
                const isOver = pesoN > esp.max;
                const lastPesaje = pesajes.filter(p=>p.animalId===a.id).sort((x,y)=>y.id-x.id)[0];
                const gmd = lastPesaje
                  ? (((pesoN - lastPesaje.peso) / 30)).toFixed(2)
                  : null;
                const nutri = getNutriRec(row.condicion, a.categoria);
                const loteCol = LOTE_COLOR[a.lote] || '#888';
                const isSavedOrModified = row.saved || row.modified;

                return (
                  <div key={a.id} className="rounded-xl overflow-hidden transition-all"
                    style={{
                      background: row.saved ? 'linear-gradient(135deg,rgba(57,255,126,0.05),rgba(0,30,15,0.8))' : 'linear-gradient(135deg,#05020f,#08041a)',
                      border: row.saved ? '1px solid rgba(57,255,126,0.3)' : row.modified ? '1px solid rgba(167,139,250,0.4)' : `1px solid rgba(${cat.glow},0.18)`,
                      boxShadow: row.modified && !row.saved ? '0 0 12px rgba(167,139,250,0.08)' : 'none',
                    }}>
                    {/* Top accent bar */}
                    <div className="h-0.5 w-full" style={{background:`linear-gradient(90deg,${cat.color},${loteCol},transparent)`}}/>

                    <div className="p-4">
                      {/* Row 1: Animal info + CC + Save */}
                      <div className="flex flex-wrap gap-4 items-start">

                        {/* Animal identity */}
                        <div className="flex items-center gap-3 min-w-[200px]">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                            style={{background:cat.bg,border:`1px solid ${cat.border}`,boxShadow:`0 0 12px rgba(${cat.glow},0.2)`}}>
                            {cat.emoji}
                          </div>
                          <div>
                            <div className="font-black text-sm text-white">{a.nombre}</div>
                            <div className="flex items-center gap-1.5 text-[10px] mt-0.5" style={{color:'rgba(255,255,255,0.35)'}}>
                              <span className="font-mono" style={{color:cat.color}}>#{a.id}</span>
                              <span>·</span>
                              <span>{a.raza}</span>
                            </div>
                            <div className="flex gap-1 mt-1 flex-wrap">
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{background:cat.bg,color:cat.color,border:`1px solid ${cat.border}`}}>{a.categoria}</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{background:ec.bg||'rgba(0,0,0,0.2)',color:ec.color}}>{ec.emoji} {a.estado}</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold" style={{background:`${loteCol}18`,color:loteCol}}>📍{a.lote}</span>
                            </div>
                          </div>
                        </div>

                        {/* Weight section */}
                        <div className="flex-1 min-w-[280px] space-y-2">
                          {/* Previous vs new */}
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="text-center">
                              <div className="text-[9px] text-white/30 uppercase tracking-wide">Anterior</div>
                              <div className="font-mono font-bold text-sm text-white/50">{a.peso} kg</div>
                            </div>
                            <ChevronRight size={14} className="text-white/20"/>
                            {/* Weight input with +/- */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={()=>updateAdvRow(a.id,{peso:String(Math.max(0,Number(row.peso)-0.5)),modified:true,saved:false})}
                                className="w-7 h-9 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
                                style={{background:'rgba(167,139,250,0.08)',border:'1px solid rgba(167,139,250,0.2)',color:'#a78bfa'}}>
                                <ChevronDown size={14}/>
                              </button>
                              <Input
                                type="number" step="0.5" min="0"
                                value={row.peso}
                                onChange={e=>updateAdvRow(a.id,{peso:e.target.value,modified:true,saved:false})}
                                className="w-24 text-center font-mono font-black text-base h-9"
                                style={{background:'rgba(0,0,0,0.5)',border:`1px solid rgba(${cat.glow},0.4)`,color:cat.color}}
                              />
                              <button
                                onClick={()=>updateAdvRow(a.id,{peso:String(Number(row.peso)+0.5),modified:true,saved:false})}
                                className="w-7 h-9 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
                                style={{background:'rgba(167,139,250,0.08)',border:'1px solid rgba(167,139,250,0.2)',color:'#a78bfa'}}>
                                <ChevronUp size={14}/>
                              </button>
                              <span className="text-xs text-white/30">kg</span>
                            </div>
                            {diff !== 0 && !isNaN(diff) && (
                              <span className="text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1"
                                style={{background:diff>0?'rgba(57,255,126,0.12)':'rgba(248,113,113,0.12)',color:diff>0?'#39ff7e':'#f87171'}}>
                                {diff>0?<TrendingUp size={11}/>:<TrendingDown size={11}/>}
                                {diff>0?'+':''}{diff.toFixed(1)} kg
                              </span>
                            )}
                          </div>

                          {/* Auto-fill buttons row */}
                          <div className="flex gap-1.5 flex-wrap">
                            <button onClick={()=>autoFillAdvByRaza(a)}
                              className="text-[10px] px-2 py-1 rounded-lg flex items-center gap-1 transition-all hover:bg-purple-500/15"
                              style={{background:'rgba(167,139,250,0.08)',border:'1px solid rgba(167,139,250,0.2)',color:'#a78bfa'}}>
                              <Zap size={10}/> Prom. raza ({esp.promedio}kg)
                            </button>
                            <button onClick={()=>updateAdvRow(a.id,{peso:String(esp.min),modified:true,saved:false})}
                              className="text-[10px] px-2 py-1 rounded-lg flex items-center gap-1 transition-all hover:bg-blue-500/10"
                              style={{background:'rgba(59,130,246,0.07)',border:'1px solid rgba(59,130,246,0.2)',color:'#60a5fa'}}>
                              Mín {esp.min}kg
                            </button>
                            <button onClick={()=>updateAdvRow(a.id,{peso:String(esp.max),modified:true,saved:false})}
                              className="text-[10px] px-2 py-1 rounded-lg flex items-center gap-1 transition-all hover:bg-cyan-500/10"
                              style={{background:'rgba(6,182,212,0.07)',border:'1px solid rgba(6,182,212,0.2)',color:'#22d3ee'}}>
                              Máx {esp.max}kg
                            </button>
                          </div>

                          {/* Weight vs breed bar */}
                          <div>
                            <div className="flex justify-between text-[9px] mb-1">
                              <span className="text-white/30">vs. raza {a.raza}</span>
                              <span style={{color: isUnder?'#f87171': isOver?'#a78bfa':cat.color}}>{pct}%
                                {isUnder && ' ⚠ Bajo mínimo'}
                                {isOver && ' ↑ Sobre máximo'}
                                {!isUnder && !isOver && ' ✓ Dentro del rango'}
                              </span>
                            </div>
                            <div className="relative h-2 rounded-full" style={{background:'rgba(255,255,255,0.06)'}}>
                              {/* Min/max markers */}
                              <div className="absolute top-0 bottom-0 w-0.5 bg-blue-400/30 rounded-full" style={{left:`${Math.min(100,(esp.min/esp.max)*100)}%`}}/>
                              <div className="absolute top-0 bottom-0 w-0.5 bg-cyan-400/30 rounded-full" style={{left:'100%',transform:'translateX(-1px)'}}/>
                              <div className="h-2 rounded-full transition-all" style={{
                                width:`${pct}%`,
                                background: isUnder ? 'linear-gradient(90deg,#f87171,#fb923c)' : isOver ? 'linear-gradient(90deg,#a78bfa,#c084fc)' : `linear-gradient(90deg,${cat.color},${loteCol})`,
                              }}/>
                            </div>
                            <div className="flex justify-between text-[8px] mt-0.5 text-white/20">
                              <span>Mín {esp.min}kg</span><span>Prom {esp.promedio}kg</span><span>Máx {esp.max}kg</span>
                            </div>
                          </div>
                        </div>

                        {/* CC + Valor + Save */}
                        <div className="flex flex-col gap-2 min-w-[200px]">
                          {/* CC selector */}
                          <div>
                            <div className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{color:'rgba(167,139,250,0.5)'}}>Condición Corporal</div>
                            <Select value={row.condicion} onValueChange={v=>updateAdvRow(a.id,{condicion:v,modified:true,saved:false})}>
                              <SelectTrigger className="h-9 text-xs" style={{background:'rgba(0,0,0,0.4)',border:`1px solid rgba(${cc.glow},0.35)`,color:cc.color}}>
                                <SelectValue/>
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(CC_CONFIG).map(([val,cfg])=>(
                                  <SelectItem key={val} value={val}>
                                    <span className="flex items-center gap-2">
                                      <span>{cfg.emoji}</span>
                                      <span style={{color:cfg.color}}>{val} — {cfg.label}</span>
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-base">{cc.emoji}</span>
                              <span className="text-[10px] font-semibold" style={{color:cc.color}}>{cc.label}</span>
                            </div>
                          </div>

                          {/* Valor/kg + total */}
                          <div>
                            <div className="text-[9px] font-bold uppercase tracking-wider mb-1 text-white/30">$/kg · Valor Total</div>
                            <div className="flex items-center gap-1.5">
                              <Input type="number" step="100"
                                value={row.valorKilo}
                                onChange={e=>updateAdvRow(a.id,{valorKilo:e.target.value,modified:true,saved:false})}
                                className="w-24 h-9 text-xs text-center font-mono"
                                style={{background:'rgba(0,0,0,0.4)',border:'1px solid rgba(57,255,126,0.2)',color:'#39ff7e'}}
                              />
                              {valorTotal > 0 && (
                                <span className="font-black text-xs" style={{color:'#39ff7e'}}>{fmt(valorTotal)}</span>
                              )}
                            </div>
                          </div>

                          {/* Save button */}
                          <Button size="sm" className="w-full gap-1.5 text-xs h-9" onClick={()=>saveAdvRow(a)}
                            disabled={row.saved}
                            style={row.saved
                              ? {background:'rgba(57,255,126,0.08)',border:'1px solid rgba(57,255,126,0.25)',color:'#39ff7e'}
                              : {background:'rgba(167,139,250,0.18)',border:'1px solid rgba(167,139,250,0.45)',color:'#c4b5fd'}}>
                            {row.saved ? <><CheckCircle2 size={13}/> Guardado</> : <><Save size={13}/> Guardar Pesaje</>}
                          </Button>
                        </div>
                      </div>

                      {/* Row 2: GMD + Alerta + Observacion */}
                      <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-3">
                        {/* GMD */}
                        {gmd !== null && (
                          <div className="flex items-center gap-2 rounded-lg px-3 py-2"
                            style={{background:'rgba(0,200,255,0.06)',border:'1px solid rgba(0,200,255,0.15)'}}>
                            <Activity size={13} style={{color:'#00c8ff',flexShrink:0}}/>
                            <div>
                              <div className="text-[9px] text-white/30 uppercase tracking-wide">GMD (ult. 30d)</div>
                              <div className="font-black text-sm" style={{color:Number(gmd)>0?'#00c8ff':'#f87171'}}>
                                {Number(gmd)>0?'+':''}{gmd} kg/día
                              </div>
                            </div>
                            {lastPesaje && (
                              <div className="ml-2">
                                <div className="text-[9px] text-white/20">Ult. pesaje</div>
                                <div className="text-[10px] text-white/40">{lastPesaje.fecha} · {lastPesaje.peso}kg</div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Nutritional alert */}
                        <div className="flex items-center gap-2 rounded-lg px-3 py-2 flex-1 min-w-[200px]"
                          style={{background:Number(row.condicion)<2.5?'rgba(248,113,113,0.06)':'rgba(74,222,128,0.05)',border:`1px solid ${Number(row.condicion)<2.5?'rgba(248,113,113,0.2)':'rgba(74,222,128,0.12)'}`}}>
                          {Number(row.condicion)<2.5
                            ? <AlertTriangle size={13} style={{color:'#f87171',flexShrink:0}}/>
                            : <CheckCircle2 size={13} style={{color:'#4ade80',flexShrink:0}}/>}
                          <span className="text-[10px]" style={{color:Number(row.condicion)<2.5?'#fca5a5':'rgba(255,255,255,0.5)'}}>{nutri}</span>
                        </div>

                        {/* Weight alert */}
                        {(isUnder || isOver) && (
                          <div className="flex items-center gap-2 rounded-lg px-3 py-2"
                            style={{background:isUnder?'rgba(251,191,36,0.06)':'rgba(167,139,250,0.06)',border:`1px solid ${isUnder?'rgba(251,191,36,0.25)':'rgba(167,139,250,0.25)'}`}}>
                            <AlertTriangle size={13} style={{color:isUnder?'#fbbf24':'#a78bfa',flexShrink:0}}/>
                            <span className="text-[10px]" style={{color:isUnder?'#fcd34d':'#c4b5fd'}}>
                              {isUnder ? `Peso bajo mínimo raza (${esp.min}kg) — revisar alimentación` : `Peso sobre máximo (${esp.max}kg) — verificar condición`}
                            </span>
                          </div>
                        )}

                        {/* Observaciones */}
                        <div className="flex-1 min-w-[200px]">
                          <Input
                            placeholder="Observaciones (CC, comportamiento, tratamiento...)"
                            value={row.observacion}
                            onChange={e=>updateAdvRow(a.id,{observacion:e.target.value,modified:!!e.target.value,saved:false})}
                            className="h-9 text-xs"
                            style={{background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.07)'}}
                          />
                        </div>
                      </div>

                      {/* Saved confirmation */}
                      {row.saved && (
                        <div className="mt-2 flex items-center gap-1.5 text-[10px]" style={{color:'#39ff7e'}}>
                          <CheckCircle2 size={11}/>
                          <span>✓ Pesaje registrado · peso actualizado a {pesoN} kg · CC {row.condicion} ({cc.label})</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          {/* Session summary */}
          {advSessionLog.length > 0 && (
            <div className="mt-6 rounded-xl p-4" style={{background:'rgba(167,139,250,0.05)',border:'1px solid rgba(167,139,250,0.2)'}}>
              <div className="font-bold text-sm mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} style={{color:'#a78bfa'}}/>
                  <span>Registro de Sesión — {advSessionLog.length} pesajes guardados hoy</span>
                </div>
                <Button size="sm" className="h-7 text-xs gap-1" onClick={()=>window.print()}
                  style={{background:'rgba(255,149,0,0.1)',border:'1px solid rgba(255,149,0,0.3)',color:'#ff9500'}}>
                  <Printer size={11}/> Imprimir
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{borderBottom:'1px solid rgba(167,139,250,0.15)'}}>
                      {['Animal','Peso Nuevo','Anterior','Cambio','CC','GMD estimado','Hora'].map(h=>(
                        <th key={h} className="text-left py-2 pr-3 text-[10px] font-bold uppercase tracking-wider" style={{color:'rgba(167,139,250,0.55)'}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {advSessionLog.map(r=>{
                      const diff = r.peso - r.anterior;
                      const ccConf = CC_CONFIG[r.cc] || CC_CONFIG["3.0"];
                      const gmdEst = ((diff)/30).toFixed(2);
                      return (
                        <tr key={r.id} className="border-b border-white/5">
                          <td className="py-2 pr-3 font-bold text-white">{r.nombre}</td>
                          <td className="py-2 pr-3 font-black text-purple-300">{r.peso} kg</td>
                          <td className="py-2 pr-3 text-white/30">{r.anterior} kg</td>
                          <td className="py-2 pr-3">
                            <span style={{color:diff>=0?'#39ff7e':'#f87171',fontWeight:'bold'}}>
                              {diff>=0?'+':''}{diff.toFixed(1)} kg
                            </span>
                          </td>
                          <td className="py-2 pr-3">
                            <span style={{color:ccConf.color}}>{ccConf.emoji} {r.cc}</span>
                          </td>
                          <td className="py-2 pr-3" style={{color:Number(gmdEst)>=0?'#00c8ff':'#f87171'}}>
                            {Number(gmdEst)>0?'+':''}{gmdEst} kg/d
                          </td>
                          <td className="py-2 pr-3 text-white/40">{r.hora}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Session totals */}
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  {label:'Total pesados', val:String(advSessionLog.length), c:'#a78bfa'},
                  {label:'Ganancia prom.', val:`${(advSessionLog.reduce((s,r)=>s+(r.peso-r.anterior),0)/advSessionLog.length).toFixed(1)} kg`, c:'#39ff7e'},
                  {label:'GMD prom. (30d)', val:`${((advSessionLog.reduce((s,r)=>s+(r.peso-r.anterior),0)/advSessionLog.length)/30).toFixed(2)} kg/d`, c:'#00c8ff'},
                  {label:'CC prom.', val:(advSessionLog.reduce((s,r)=>s+Number(r.cc),0)/advSessionLog.length).toFixed(1), c:'#fbbf24'},
                ].map(s=>(
                  <div key={s.label} className="rounded-lg p-2 text-center" style={{background:'rgba(255,255,255,0.03)'}}>
                    <div className="text-[9px] text-white/30 uppercase tracking-wide">{s.label}</div>
                    <div className="font-black text-sm" style={{color:s.c}}>{s.val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

      </Tabs>

      {/* Hidden print receipt for pesaje */}
      {printPesajeData && (() => {
        const a = printPesajeData;
        const row = getPRow(a);
        const pesoNum = Number(row.peso) || a.peso;
        const vkNum = Number(row.valorKilo) || 0;
        const valorTotal = pesoNum * vkNum;
        const pesoRaza = PESOS_RAZA[a.raza]?.[a.categoria] || a.peso;
        const pct = Math.min(100, Math.round((pesoNum/pesoRaza)*100));
        const diff = pesoNum - a.peso;
        return (
          <div id="recibo-pesaje-print" className="print-only" style={{
            display:'none', fontFamily:'Sora,sans-serif', color:'#000',
            padding:'24px', background:'#fff', maxWidth:480, margin:'0 auto',
          }}>
            <div style={{textAlign:'center', borderBottom:'2px solid #000', paddingBottom:12, marginBottom:16}}>
              <div style={{fontSize:22, fontWeight:900}}>🐄 CIVAC PRO</div>
              <div style={{fontSize:11, color:'#555'}}>Control Inteligente de Valor Agropecuario · Colombia</div>
              <div style={{fontSize:18, fontWeight:800, marginTop:8}}>RECIBO DE PESAJE</div>
              <div style={{fontSize:10, color:'#888'}}>Fecha: {new Date().toLocaleDateString('es-CO')} · Hora: {new Date().toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})}</div>
            </div>
            <table style={{width:'100%', fontSize:12, borderCollapse:'collapse', marginBottom:12}}>
              <tbody>
                {[
                  ['Animal', a.nombre],
                  ['Arete / ID', `#${a.id}`],
                  ['Raza', a.raza],
                  ['Categoría', a.categoria],
                  ['Lote', a.lote],
                  ['Estado', a.estado],
                  ['Peso registrado', `${pesoNum} kg`],
                  ['Peso anterior', `${a.peso} kg`],
                  ['Variación', `${diff>=0?'+':''}${diff.toFixed(1)} kg`],
                  ['Peso estándar raza', `${pesoRaza} kg (${pct}%)`],
                  ['Valor por kilo', vkNum > 0 ? fmt(vkNum) : '—'],
                  ['Valor total estimado', valorTotal > 0 ? fmt(valorTotal) : '—'],
                  ['Operador', user?.nombre || 'Admin'],
                ].map(([k,v]) => (
                  <tr key={k} style={{borderBottom:'1px solid #eee'}}>
                    <td style={{padding:'5px 8px', color:'#666', width:160, fontWeight:600}}>{k}</td>
                    <td style={{padding:'5px 8px', fontWeight:700}}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{borderTop:'2px solid #000', paddingTop:10, fontSize:9, color:'#aaa', textAlign:'center'}}>
              CIVAC PRO v3.0 · GanaderIA Colombia · {new Date().getFullYear()} · Impreso: {new Date().toLocaleString('es-CO')}
            </div>
          </div>
        );
      })()}


      {/* Ficha detalle dialog */}
      <Dialog open={!!fichaAnimal} onOpenChange={v => { if(!v) setFichaAnimal(null); }}>
        <DialogContent className="sm:max-w-[440px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText size={15} style={{color:'#00f5d4'}}/>
              Ficha del Animal
            </DialogTitle>
          </DialogHeader>
          {fichaAnimal && <FichaDetalle a={fichaAnimal}/>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
