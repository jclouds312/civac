import { useState, useEffect, useRef } from "react";
import { useAppState } from "../lib/data";
import { useAuth } from "../lib/auth";
import {
  Search, Plus, Download, Pencil, Trash2, Bluetooth, Tag, BarChart3,
  Grid3x3, TableProperties, Printer, QrCode, Filter, RefreshCw,
  Beef, Baby, ChevronRight, TrendingUp, TrendingDown, Milestone,
  Droplets, Heart, Scale, Zap, Star, Award, MapPin, Calendar,
  DollarSign, CheckCircle2, XCircle, Clock, Info, FileText, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

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
  const { animals, setAnimals } = useAppState();
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
            { val:'estadisticas', icon:<BarChart3 size={14}/>, label:'Estadísticas', c:'#ff9500' },
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
      </Tabs>

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
