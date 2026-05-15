import { useState, useRef, useCallback } from "react";
import { useAppState } from "../lib/data";
import { useAuth } from "../lib/auth";
import {
  Scale, Bluetooth, Printer, Save, CheckCircle2, TrendingUp, TrendingDown,
  RotateCcw, Search, ChevronRight, Zap, ClipboardList, Activity,
  Camera, Upload, X, Brain, Plus, Calculator, Users, Baby,
  Image as ImageIcon, Trash2, Share2, QrCode, FileText, Hash,
  CalendarDays, Beef, Package, DollarSign, BarChart3,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

// ─── Datos de referencia ──────────────────────────────────────────────────────

const PESOS_RAZA: Record<string, Record<string, number>> = {
  Holstein:      { "Vaca adulta": 560, Novilla: 380, Ternero: 180, Ternera: 170, Toro: 700 },
  Brahman:       { "Vaca adulta": 520, Novilla: 340, Ternero: 200, Ternera: 185, Toro: 750 },
  Simmental:     { "Vaca adulta": 600, Novilla: 400, Ternero: 210, Ternera: 195, Toro: 800 },
  Angus:         { "Vaca adulta": 580, Novilla: 370, Ternero: 195, Ternera: 180, Toro: 780 },
  Cebu:          { "Vaca adulta": 490, Novilla: 320, Ternero: 175, Ternera: 165, Toro: 720 },
  "Gyr Lechero": { "Vaca adulta": 470, Novilla: 310, Ternero: 160, Ternera: 155, Toro: 680 },
  Normando:      { "Vaca adulta": 610, Novilla: 410, Ternero: 215, Ternera: 200, Toro: 820 },
  "Gyr X":       { "Vaca adulta": 470, Novilla: 305, Ternero: 162, Ternera: 156, Toro: 690 },
  Jersey:        { "Vaca adulta": 400, Novilla: 250, Ternero: 130, Ternera: 120, Toro: 580 },
};

const CAT_ICON: Record<string, { emoji: string; color: string; glow: string; bg: string; border: string }> = {
  "Vaca adulta": { emoji: "🐄", color: "#00f5d4", glow: "0,245,212",   bg: "rgba(0,245,212,0.10)",  border: "rgba(0,245,212,0.30)"  },
  Novilla:       { emoji: "🐮", color: "#a78bfa", glow: "167,139,250", bg: "rgba(167,139,250,0.10)", border: "rgba(167,139,250,0.30)" },
  Ternero:       { emoji: "🐂", color: "#fbbf24", glow: "251,191,36",  bg: "rgba(251,191,36,0.10)",  border: "rgba(251,191,36,0.30)"  },
  Ternera:       { emoji: "🐃", color: "#f472b6", glow: "244,114,182", bg: "rgba(244,114,182,0.10)", border: "rgba(244,114,182,0.30)" },
  Toro:          { emoji: "🦬", color: "#f87171", glow: "248,113,113", bg: "rgba(248,113,113,0.10)", border: "rgba(248,113,113,0.30)" },
};

const CC_OPTS = [
  { val: "1.0", emoji: "💀", label: "Muy delgada", color: "#f87171" },
  { val: "1.5", emoji: "😰", label: "Delgada",     color: "#fb923c" },
  { val: "2.0", emoji: "😟", label: "Bajo normal", color: "#fbbf24" },
  { val: "2.5", emoji: "😐", label: "Normal bajo", color: "#facc15" },
  { val: "3.0", emoji: "😊", label: "Ideal",       color: "#a3e635" },
  { val: "3.5", emoji: "🌟", label: "Buena",       color: "#39ff7e" },
  { val: "4.0", emoji: "✅", label: "Alta",         color: "#34d399" },
  { val: "4.5", emoji: "⚠️", label: "Muy alta",    color: "#f59e0b" },
  { val: "5.0", emoji: "🚨", label: "Obesa",       color: "#f87171" },
];

const LOTE_COLOR: Record<string, string> = {
  "Lote A": "#00f5d4", "Lote B": "#ff6fd8", "Lote C": "#fbbf24",
  "Lote D": "#39ff7e", "Lote E": "#00c8ff", "Lote F": "#f472b6",
};

const RAZAS_LIST = ["Holstein", "Brahman", "Simmental", "Angus", "Cebu", "Gyr Lechero", "Normando", "Gyr X", "Jersey"];
const CATEGORIAS_LIST = ["Vaca adulta", "Novilla", "Ternero", "Ternera", "Toro"];
const LOTES_LIST = ["Lote A", "Lote B", "Lote C", "Lote D", "Lote E", "Lote F"];

// ─── Tipos ────────────────────────────────────────────────────────────────────

type AnimalPhoto = { id: string; url: string; tipo: "indicador" | "lateral" | "completa"; label: string };

type Row = {
  peso: string; pesoPrev: string; cc: string; valorKilo: string;
  saved: boolean; btLoading: boolean; obs: string; aiLoading: boolean;
  fechaNacimiento: string; edadMeses: number; edadAnios: number;
  tieneRegistro: "si" | "no" | ""; numeroRegistro: string;
  fotos: AnimalPhoto[];
};

function calcEdad(fechaNac: string): { meses: number; anios: number } {
  if (!fechaNac) return { meses: 0, anios: 0 };
  const nac = new Date(fechaNac);
  const hoy = new Date();
  let meses = (hoy.getFullYear() - nac.getFullYear()) * 12 + (hoy.getMonth() - nac.getMonth());
  if (meses < 0) meses = 0;
  return { meses, anios: Math.floor(meses / 12) };
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function PesajeManual() {
  const { animals, setAnimals, pesajes, setPesajes } = useAppState();
  const { user } = useAuth();

  // ── Estado sesión pesaje ──────────────────────────────────────────────────
  const [rows,       setRows]       = useState<Record<string, Row>>({});
  const [focusId,    setFocusId]    = useState<string | null>(null);
  const [lote,       setLote]       = useState("Todos");
  const [search,     setSearch]     = useState("Todos");
  const [searchQ,    setSearchQ]    = useState("");
  const [showRef,    setShowRef]    = useState(false);
  const [sessionLog, setSessionLog] = useState<{
    animalId: string; nombre: string; peso: number; anterior: number;
    cc: string; gmd: number; valor: number; hora: string;
  }[]>([]);

  // ── Estado Nuevo Animal rápido ────────────────────────────────────────────
  const [nuevoNombre,      setNuevoNombre]      = useState("");
  const [nuevoRaza,        setNuevoRaza]        = useState("Holstein");
  const [nuevoCategoria,   setNuevoCategoria]   = useState("Vaca adulta");
  const [nuevoLote,        setNuevoLote]        = useState("Lote A");
  const [nuevoFechaNac,    setNuevoFechaNac]    = useState("");
  const [nuevoRegistro,    setNuevoRegistro]    = useState<"si" | "no">("no");
  const [nuevoNumReg,      setNuevoNumReg]      = useState("");
  const [nuevoPeso,        setNuevoPeso]        = useState("");
  const [nuevoCreado,      setNuevoCreado]      = useState<string | null>(null);

  // ── Estado Calculadora de Lote ───────────────────────────────────────────
  const [loteCantidad, setLoteCantidad] = useState("");
  const [lotePesoTotal, setLotePesoTotal] = useState("");
  const [lotePrecioKg, setLotePrecioKg] = useState("11000");

  const lotePromedio = loteCantidad && lotePesoTotal
    ? (Number(lotePesoTotal) / Number(loteCantidad)).toFixed(1)
    : "—";
  const loteValorTotal = lotePesoTotal && lotePrecioKg
    ? Number(lotePesoTotal) * Number(lotePrecioKg)
    : 0;

  // ── Refs para cámara / upload (inventario-session) ────────────────────────
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // ── Estado formulario standalone Tab 1 ────────────────────────────────────
  const [sNombre,    setSNombre]    = useState("");
  const [sRaza,      setSRaza]      = useState("Holstein");
  const [sCat,       setSCat]       = useState("Vaca adulta");
  const [sLote,      setSLote]      = useState("Lote A");
  const [sFechaNac,  setSFechaNac]  = useState("");
  const [sRegistro,  setSRegistro]  = useState<"si"|"no">("no");
  const [sNumReg,    setSNumReg]    = useState("");
  const [sPeso,      setSPeso]      = useState("");
  const [sCC,        setSCC]        = useState("3.0");
  const [sValorKilo, setSValorKilo] = useState("11000");
  const [sFotos,     setSFotos]     = useState<AnimalPhoto[]>([]);
  const [sObs,       setSobs]       = useState("");
  const [sSaved,     setSSaved]     = useState(false);
  const [sBtLoading, setSBtLoading] = useState(false);
  const [sAiLoading, setSAiLoading] = useState(false);
  const [invOpen,    setInvOpen]    = useState(true);
  const [saveToInv,  setSaveToInv]  = useState(false);
  const [invSearch,  setInvSearch]  = useState("");
  const [sLog, setSLog] = useState<{
    id: string; nombre: string; peso: number; anterior: number;
    cc: string; valor: number; hora: string; raza: string; cat: string; nFotos: number;
  }[]>([]);
  const sFileRef   = useRef<HTMLInputElement>(null);
  const sCamRef    = useRef<HTMLInputElement>(null);
  const sAiImgRef  = useRef<HTMLInputElement>(null);
  const [sAiPhotoUrl, setSAiPhotoUrl] = useState<string|null>(null);
  const [sAiFromImg, setSAiFromImg]   = useState(false);

  // ── Filtros ────────────────────────────────────────────────────────────────
  const lista = animals.filter(a => {
    const m = a.nombre.toLowerCase().includes(searchQ.toLowerCase()) ||
              a.id.toLowerCase().includes(searchQ.toLowerCase());
    return m && (lote === "Todos" || a.lote === lote) &&
                (search === "Todos" || a.categoria === search);
  });

  const getRow = (a: typeof animals[0]): Row => {
    if (rows[a.id]) return rows[a.id];
    const edad = calcEdad(a.fechaNacimiento || "");
    return {
      peso: String(a.peso), pesoPrev: String(a.peso),
      cc: "3.0", valorKilo: String(a.valorKilo || 11000),
      saved: false, btLoading: false, obs: "", aiLoading: false,
      fechaNacimiento: a.fechaNacimiento || "",
      edadMeses: edad.meses, edadAnios: edad.anios,
      tieneRegistro: a.registro === "SI" ? "si" : "no",
      numeroRegistro: a.numeroRegistro || "",
      fotos: [],
    };
  };

  const upd = (id: string, patch: Partial<Row>) =>
    setRows(p => ({ ...p, [id]: { ...getRow(animals.find(a => a.id === id)!), ...p[id], ...patch } }));

  const focused = focusId ? animals.find(a => a.id === focusId) ?? null : null;
  const fRow = focused ? getRow(focused) : null;
  const fCat = focused ? (CAT_ICON[focused.categoria] || CAT_ICON["Vaca adulta"]) : null;
  const fPeso = fRow ? Number(fRow.peso) || focused!.peso : 0;
  const fPrev = fRow ? Number(fRow.pesoPrev) || focused!.peso : 0;
  const fDiff = fPeso - fPrev;
  const fEsp  = focused ? (PESOS_RAZA[focused.raza]?.[focused.categoria] || focused.peso) : 0;
  const fPct  = fEsp ? Math.min(100, Math.round((fPeso / fEsp) * 100)) : 0;
  const fValor = fRow ? fPeso * (Number(fRow.valorKilo) || 0) : 0;
  const fGmd  = Math.abs(fDiff) > 0 ? +(fDiff / 30).toFixed(2) : 0;

  const pending = lista.filter(a => !rows[a.id]?.saved).length;
  const done    = lista.filter(a =>  rows[a.id]?.saved).length;

  // ── IA: estimar peso ───────────────────────────────────────────────────────
  const estimarPesoIA = (a: typeof animals[0]) => {
    upd(a.id, { aiLoading: true });
    setTimeout(() => {
      const base   = PESOS_RAZA[a.raza]?.[a.categoria] || a.peso;
      const row    = getRow(a);
      const meses  = row.edadMeses || 24;
      // Factor edad: terneros crecen, adultos ya estabilizados
      let factor = 1.0;
      if      (meses < 6)  factor = 0.20 + (meses / 6) * 0.15;
      else if (meses < 12) factor = 0.35 + ((meses - 6) / 6) * 0.20;
      else if (meses < 24) factor = 0.55 + ((meses - 12) / 12) * 0.25;
      else if (meses < 36) factor = 0.80 + ((meses - 24) / 12) * 0.15;
      else                 factor = 0.95 + Math.random() * 0.10;
      // Factor condición corporal
      const ccVal = Number(row.cc) || 3.0;
      const ccFactor = 0.85 + (ccVal / 5) * 0.30;
      const estimado = +(base * factor * ccFactor * (0.97 + Math.random() * 0.06)).toFixed(1);
      upd(a.id, { peso: String(estimado), aiLoading: false, saved: false });
    }, 2200);
  };

  // ── BT simulado ───────────────────────────────────────────────────────────
  const btSim = (a: typeof animals[0]) => {
    upd(a.id, { btLoading: true });
    const base = PESOS_RAZA[a.raza]?.[a.categoria] || a.peso;
    const sim  = +(base * (0.93 + Math.random() * 0.14)).toFixed(1);
    setTimeout(() => upd(a.id, { peso: String(sim), btLoading: false, saved: false }), 1500);
  };

  // ── Fecha nacimiento → edad ───────────────────────────────────────────────
  const handleFechaNac = (animalId: string, fecha: string) => {
    const { meses, anios } = calcEdad(fecha);
    upd(animalId, { fechaNacimiento: fecha, edadMeses: meses, edadAnios: anios });
  };

  // ── Fotos ─────────────────────────────────────────────────────────────────
  const handleFotoUpload = useCallback((animalId: string, files: FileList | null, tipo: AnimalPhoto["tipo"]) => {
    if (!files?.length) return;
    Array.from(files).slice(0, 3).forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        const url = e.target?.result as string;
        const labels: Record<AnimalPhoto["tipo"], string> = {
          indicador: "Indicador peso",
          lateral:   "Vista lateral",
          completa:  "Animal completo",
        };
        const foto: AnimalPhoto = { id: Date.now() + Math.random().toString(), url, tipo, label: labels[tipo] };
        setRows(p => {
          const cur = p[animalId] || getRow(animals.find(a => a.id === animalId)!);
          return { ...p, [animalId]: { ...cur, fotos: [...(cur.fotos || []), foto] } };
        });
      };
      reader.readAsDataURL(file);
    });
  }, [animals]);

  const removeFoto = (animalId: string, fotoId: string) => {
    setRows(p => {
      const cur = p[animalId];
      if (!cur) return p;
      return { ...p, [animalId]: { ...cur, fotos: cur.fotos.filter(f => f.id !== fotoId) } };
    });
  };

  // ── Guardar pesaje ────────────────────────────────────────────────────────
  const saveRow = (a: typeof animals[0]) => {
    const row  = getRow(a);
    const pesoN = Number(row.peso);
    if (!pesoN) return;
    const now  = new Date();
    const hora = now.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
    const gmd  = +((pesoN - a.peso) / 30).toFixed(2);
    const pesaje = {
      id: Date.now(), animalId: a.id, animalNombre: a.nombre,
      peso: pesoN, pesoAnterior: a.peso,
      fecha: now.toLocaleDateString("es-CO"), hora,
      metodo: "automatizado", dispositivo: "",
      operador: user?.nombre || "Admin",
      observacion: `CC: ${row.cc} | GMD: ${gmd} kg/día | ${row.obs}`,
      lote: a.lote, categoria: a.categoria,
    };
    setPesajes(p => [pesaje, ...p]);
    setAnimals(p => p.map(x => x.id === a.id
      ? { ...x, peso: pesoN, valorKilo: Number(row.valorKilo) || x.valorKilo }
      : x));
    setRows(p => ({ ...p, [a.id]: { ...getRow(a), ...p[a.id], saved: true, btLoading: false, aiLoading: false } }));
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

  // ── Imprimir recibo ────────────────────────────────────────────────────────
  const printReceipt = (a: typeof animals[0]) => {
    const row  = getRow(a);
    const pN   = Number(row.peso) || a.peso;
    const diff = pN - a.peso;
    const gmd  = +((pN - a.peso) / 30).toFixed(2);
    const vT   = pN * (Number(row.valorKilo) || 0);
    const now  = new Date();
    const ccInfo = CC_OPTS.find(c => c.val === row.cc);
    const fotosHtml = (row.fotos || []).map(f =>
      `<div style="display:inline-block;margin:4px">
        <div style="font-size:9px;color:#888;margin-bottom:2px">${f.label}</div>
        <img src="${f.url}" style="width:100px;height:75px;object-fit:cover;border-radius:6px;border:1px solid #eee"/>
      </div>`).join("");
    const w = window.open("", "_blank", "width=540,height=780");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
      <title>Recibo — ${a.nombre}</title>
      <style>
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#111;padding:24px}
        .logo{font-size:24px;text-align:center;margin-bottom:4px}
        h2{text-align:center;font-size:15px;font-weight:900;letter-spacing:1px;text-transform:uppercase;margin-bottom:2px}
        .sub{text-align:center;font-size:10px;color:#888;margin-bottom:16px}
        .big{text-align:center;padding:16px 0;font-size:48px;font-weight:900;letter-spacing:4px;
          border:3px solid #111;border-radius:16px;background:#f9f9f9;margin:14px 0}
        .diff{font-size:18px;font-weight:700;color:${diff >= 0 ? "#22c55e" : "#ef4444"}}
        table{width:100%;border-collapse:collapse;font-size:12px;margin-top:12px}
        td{padding:6px 10px;border-bottom:1px solid #eee}
        td:first-child{font-weight:700;color:#555;width:160px}
        .badge{display:inline-block;padding:3px 10px;border-radius:20px;font-weight:700;font-size:11px;background:#f0fdf4;border:1px solid #22c55e;color:#16a34a}
        .photos{margin-top:14px;padding-top:10px;border-top:1px solid #eee}
        .footer{margin-top:16px;font-size:9px;color:#ccc;text-align:center;border-top:1px solid #eee;padding-top:8px}
        @media print{body{padding:12px}button{display:none}}
      </style></head><body>
      <div class="logo">🐄</div>
      <h2>CIVAC PRO · Pesaje Automatizado</h2>
      <div class="sub">${now.toLocaleDateString("es-CO",{weekday:"long",year:"numeric",month:"long",day:"numeric"})} · ${now.toLocaleTimeString("es-CO",{hour:"2-digit",minute:"2-digit"})}</div>
      <div class="big">${pN.toFixed(1)} <span style="font-size:20px;color:#777">kg</span>
        <br/><span class="diff">${diff >= 0 ? "+" : ""}${diff.toFixed(1)} kg</span>
      </div>
      <table><tbody>
        <tr><td>Animal</td><td><strong>${a.nombre}</strong></td></tr>
        <tr><td>Arete / ID</td><td>#${a.id}</td></tr>
        <tr><td>Raza</td><td>${a.raza}</td></tr>
        <tr><td>Categoría</td><td>${a.categoria}</td></tr>
        <tr><td>Lote</td><td>${a.lote}</td></tr>
        ${row.edadMeses > 0 ? `<tr><td>Edad</td><td>${row.edadAnios} años ${row.edadMeses % 12} meses</td></tr>` : ""}
        ${row.tieneRegistro === "si" && row.numeroRegistro ? `<tr><td>Nº Registro</td><td>${row.numeroRegistro}</td></tr>` : ""}
        <tr><td>Peso anterior</td><td>${a.peso} kg</td></tr>
        <tr><td>Peso registrado</td><td><strong>${pN.toFixed(1)} kg</strong></td></tr>
        <tr><td>Estándar raza</td><td>${fEsp} kg · ${fPct}% del estándar</td></tr>
        <tr><td>Cond. Corporal</td><td><span class="badge">${ccInfo?.emoji} CC ${row.cc} — ${ccInfo?.label}</span></td></tr>
        <tr><td>GMD estimada</td><td>${gmd >= 0 ? "+" : ""}${gmd} kg/día</td></tr>
        ${vT > 0 ? `<tr><td>Valor estimado</td><td><strong>${fmt(vT)}</strong></td></tr>` : ""}
        ${row.obs ? `<tr><td>Observaciones</td><td>${row.obs}</td></tr>` : ""}
        <tr><td>Operador</td><td>${user?.nombre || "Admin"}</td></tr>
      </tbody></table>
      ${fotosHtml ? `<div class="photos"><div style="font-size:10px;font-weight:700;color:#555;margin-bottom:6px">Evidencia fotográfica</div>${fotosHtml}</div>` : ""}
      <div class="footer">CIVAC PRO v3.0 · GanaderIA Colombia · Pesaje Automatizado</div>
      <script>window.onload=function(){window.print();setTimeout(function(){window.close()},900)}<\/script>
    </body></html>`);
    w.document.close();
  };

  // ── Compartir WhatsApp ────────────────────────────────────────────────────
  const shareWhatsApp = (a: typeof animals[0]) => {
    const row  = getRow(a);
    const pN   = Number(row.peso) || a.peso;
    const diff = pN - a.peso;
    const now  = new Date();
    const msg  = encodeURIComponent(
      `🐄 *Pesaje CIVAC PRO*\n\n` +
      `Animal: *${a.nombre}* (#${a.id})\n` +
      `Raza: ${a.raza} · ${a.categoria}\n` +
      `Lote: ${a.lote}\n\n` +
      `⚖️ Peso: *${pN.toFixed(1)} kg*\n` +
      `Diferencia: ${diff >= 0 ? "+" : ""}${diff.toFixed(1)} kg\n` +
      `CC: ${row.cc}\n\n` +
      `📅 ${now.toLocaleDateString("es-CO")} ${now.toLocaleTimeString("es-CO", {hour:"2-digit",minute:"2-digit"})}\n` +
      `Operador: ${user?.nombre || "Admin"}\n` +
      `— GanaderIA CIVAC PRO`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  // ── Crear animal rápido ───────────────────────────────────────────────────
  const crearAnimalRapido = () => {
    if (!nuevoNombre.trim()) return;
    const edad  = calcEdad(nuevoFechaNac);
    const pesoBase = PESOS_RAZA[nuevoRaza]?.[nuevoCategoria] || 350;
    const pesoFinal = nuevoPeso ? Number(nuevoPeso) : pesoBase;
    const newId = `Q-${Date.now().toString().slice(-4)}`;
    const newAnimal = {
      id: newId, nombre: nuevoNombre.trim(), raza: nuevoRaza,
      categoria: nuevoCategoria, peso: pesoFinal, lote: nuevoLote,
      estado: "Activo", litrosDia: 0, partos: 0,
      fechaNacimiento: nuevoFechaNac || "",
      registro: nuevoRegistro === "si" ? "SI" : "NO",
      numeroRegistro: nuevoRegistro === "si" ? nuevoNumReg : "",
      valorKilo: 0,
    };
    setAnimals(p => [...p, newAnimal]);
    setNuevoCreado(newId);
    setTimeout(() => setNuevoCreado(null), 4000);
    setNuevoNombre(""); setNuevoFechaNac(""); setNuevoPeso(""); setNuevoNumReg("");
    setNuevoRegistro("no");
  };

  // ── Standalone form computed values ───────────────────────────────────────
  const sEdad    = calcEdad(sFechaNac);
  const sPesoN   = Number(sPeso) || 0;
  const sPesoAuto = PESOS_RAZA[sRaza]?.[sCat] || 400;
  const sPct     = sPesoN > 0 ? Math.min(100, Math.round((sPesoN / sPesoAuto) * 100)) : 0;
  const sValor   = sPesoN * (Number(sValorKilo) || 0);
  const sCatIcon = CAT_ICON[sCat] || CAT_ICON["Vaca adulta"];
  const sIndFoto = sFotos.find(f => f.tipo === "indicador");
  const SFRAME: Record<string, { w: number; h: number; label: string }> = {
    "Ternero":    { w: 88,  h: 66,  label: "Marco pequeño · ternero" },
    "Ternera":    { w: 88,  h: 66,  label: "Marco pequeño · ternera" },
    "Novilla":    { w: 120, h: 90,  label: "Marco mediano · novilla" },
    "Vaca adulta":{ w: 152, h: 110, label: "Marco estándar · vaca" },
    "Toro":       { w: 192, h: 130, label: "Marco grande · toro" },
  };
  const sFrame = SFRAME[sCat] || SFRAME["Vaca adulta"];

  // ── Standalone form handlers ───────────────────────────────────────────────
  const sFotoUpload = useCallback((files: FileList|null, tipo: AnimalPhoto["tipo"]) => {
    if (!files?.[0]) return;
    const reader = new FileReader();
    reader.onload = e => {
      const labels: Record<AnimalPhoto["tipo"], string> = {
        indicador: "Indicador peso", lateral: "Vista lateral", completa: "Animal completo",
      };
      const foto: AnimalPhoto = {
        id: Date.now() + Math.random().toString(),
        url: e.target?.result as string, tipo, label: labels[tipo],
      };
      setSFotos(prev => tipo === "indicador"
        ? [...prev.filter(f => f.tipo !== "indicador"), foto]
        : [...prev, foto]);
    };
    reader.readAsDataURL(files[0]);
  }, []);

  const sRemoveFoto = (fotoId: string) => setSFotos(prev => prev.filter(f => f.id !== fotoId));

  const sBtSim = () => {
    setSBtLoading(true);
    const base = PESOS_RAZA[sRaza]?.[sCat] || 400;
    const sim  = +(base * (0.93 + Math.random() * 0.14)).toFixed(1);
    setTimeout(() => { setSPeso(String(sim)); setSBtLoading(false); setSSaved(false); }, 1500);
  };

  const sAiEstimate = () => {
    setSAiLoading(true);
    setTimeout(() => {
      const base  = PESOS_RAZA[sRaza]?.[sCat] || 400;
      const meses = sEdad.meses || 24;
      let factor  = meses < 6  ? 0.20 + (meses / 6) * 0.15
        : meses < 12 ? 0.35 + ((meses -  6) /  6) * 0.20
        : meses < 24 ? 0.55 + ((meses - 12) / 12) * 0.25
        : meses < 36 ? 0.80 + ((meses - 24) / 12) * 0.15
        : 0.95 + Math.random() * 0.10;
      const ccFactor = 0.85 + (Number(sCC) / 5) * 0.30;
      const est = +(base * factor * ccFactor * (0.97 + Math.random() * 0.06)).toFixed(1);
      setSPeso(String(est)); setSAiLoading(false); setSSaved(false);
    }, 2200);
  };

  const sAiFromPhoto = (url: string) => {
    setSAiPhotoUrl(url); setSAiFromImg(true); setSAiLoading(true);
    setTimeout(() => {
      const base  = PESOS_RAZA[sRaza]?.[sCat] || 400;
      const meses = sEdad.meses || 24;
      let factor  = meses < 6  ? 0.22 + (meses / 6) * 0.14
        : meses < 12 ? 0.36 + ((meses -  6) /  6) * 0.20
        : meses < 24 ? 0.56 + ((meses - 12) / 12) * 0.24
        : meses < 36 ? 0.80 + ((meses - 24) / 12) * 0.16
        : 0.94 + Math.random() * 0.12;
      const ccFactor = 0.85 + (Number(sCC) / 5) * 0.30;
      const est = +(base * factor * ccFactor * (0.96 + Math.random() * 0.08)).toFixed(1);
      setSPeso(String(est)); setSAiLoading(false); setSAiFromImg(false); setSSaved(false);
    }, 2800);
  };

  const sPrint = () => {
    const nombre  = sNombre.trim() || "Animal sin nombre";
    const ccInfo  = CC_OPTS.find(c => c.val === sCC);
    const fotosHtml = sFotos.map(f =>
      `<div style="display:inline-block;margin:4px">
        <div style="font-size:9px;color:#888">${f.label}</div>
        <img src="${f.url}" style="width:100px;height:75px;object-fit:cover;border-radius:6px"/>
      </div>`).join("");
    const w = window.open("", "_blank", "width=540,height=780");
    if (!w) return;
    const now = new Date();
    w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
      <title>Recibo — ${nombre}</title>
      <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#111;padding:24px}.logo{font-size:24px;text-align:center;margin-bottom:4px}h2{text-align:center;font-size:15px;font-weight:900;letter-spacing:1px;text-transform:uppercase;margin-bottom:2px}.sub{text-align:center;font-size:10px;color:#888;margin-bottom:16px}.big{text-align:center;padding:16px;font-size:52px;font-weight:900;letter-spacing:4px;border:3px solid #111;border-radius:16px;background:#f9f9f9;margin:14px 0}table{width:100%;border-collapse:collapse;font-size:12px;margin-top:12px}td{padding:6px 10px;border-bottom:1px solid #eee}td:first-child{font-weight:700;color:#555;width:160px}.footer{margin-top:14px;font-size:9px;color:#ccc;text-align:center;border-top:1px solid #eee;padding-top:8px}</style>
      </head><body>
      <div class="logo">🐄</div>
      <h2>CIVAC PRO · Pesaje Automatizado</h2>
      <div class="sub">${now.toLocaleDateString("es-CO",{weekday:"long",year:"numeric",month:"long",day:"numeric"})} · ${now.toLocaleTimeString("es-CO",{hour:"2-digit",minute:"2-digit"})}</div>
      <div class="big">${sPesoN.toFixed(1)} <span style="font-size:20px;color:#777">kg</span></div>
      <table><tbody>
        <tr><td>Animal</td><td><strong>${nombre}</strong></td></tr>
        <tr><td>Raza</td><td>${sRaza}</td></tr>
        <tr><td>Categoría</td><td>${sCat}</td></tr>
        <tr><td>Lote</td><td>${sLote}</td></tr>
        ${sFechaNac ? `<tr><td>F. Nacimiento</td><td>${sFechaNac} · ${sEdad.anios}a ${sEdad.meses%12}m</td></tr>` : ""}
        ${sRegistro==="si"&&sNumReg ? `<tr><td>Nº Registro</td><td>${sNumReg}</td></tr>` : ""}
        <tr><td>Peso registrado</td><td><strong>${sPesoN.toFixed(1)} kg</strong></td></tr>
        <tr><td>Estándar raza</td><td>${sPesoAuto} kg · ${sPct}%</td></tr>
        <tr><td>Cond. Corporal</td><td>${ccInfo?.emoji} CC ${sCC} — ${ccInfo?.label}</td></tr>
        ${sValor>0?`<tr><td>Valor estimado</td><td><strong>${fmt(sValor)}</strong></td></tr>`:""}
        ${sObs?`<tr><td>Observaciones</td><td>${sObs}</td></tr>`:""}
        <tr><td>Operador</td><td>${user?.nombre||"Admin"}</td></tr>
      </tbody></table>
      ${fotosHtml?`<div style="margin-top:14px"><div style="font-size:10px;font-weight:700;color:#555;margin-bottom:6px">Evidencia fotográfica</div>${fotosHtml}</div>`:""}
      <div class="footer">CIVAC PRO v3.0 · GanaderIA Colombia · Pesaje Automatizado</div>
      <script>window.onload=function(){window.print();setTimeout(function(){window.close()},900)}<\/script>
    </body></html>`);
    w.document.close();
  };

  const sWA = () => {
    const nombre = sNombre.trim() || "Animal";
    const now    = new Date();
    const msg    = encodeURIComponent(
      `🐄 *Pesaje CIVAC PRO*\n\n` +
      `Animal: *${nombre}*\n` +
      `Raza: ${sRaza} · ${sCat} · ${sLote}\n\n` +
      `⚖️ Peso: *${sPesoN.toFixed(1)} kg*\n` +
      `CC: ${sCC} · Ref raza: ${sPesoAuto} kg\n` +
      (sValor > 0 ? `Valor: ${fmt(sValor)}\n` : "") +
      `\n📅 ${now.toLocaleDateString("es-CO")} ${now.toLocaleTimeString("es-CO",{hour:"2-digit",minute:"2-digit"})}\n` +
      `Operador: ${user?.nombre||"Admin"}\n— GanaderIA CIVAC PRO`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  const sSaveData = () => {
    if (!sPesoN) return;
    const now    = new Date();
    const hora   = now.toLocaleTimeString("es-CO",{hour:"2-digit",minute:"2-digit"});
    const nombre = sNombre.trim() || `Pesaje ${hora}`;
    const existingAnimal = animals.find(a => a.nombre.toLowerCase() === nombre.toLowerCase());
    const animalId = existingAnimal?.id || `P-${Date.now().toString().slice(-5)}`;
    const pesaje = {
      id: Date.now(), animalId, animalNombre: nombre,
      peso: sPesoN, pesoAnterior: existingAnimal?.peso || 0,
      fecha: now.toLocaleDateString("es-CO"), hora,
      metodo: "automatizado", dispositivo: "",
      operador: user?.nombre || "Admin",
      observacion: `CC: ${sCC}${sObs ? ` | ${sObs}` : ""}`,
      lote: sLote, categoria: sCat,
    };
    setPesajes(p => [pesaje, ...p]);
    if (existingAnimal) {
      setAnimals(p => p.map(a => a.id === existingAnimal.id
        ? { ...a, peso: sPesoN, valorKilo: Number(sValorKilo) || a.valorKilo } : a));
    } else if (saveToInv) {
      setAnimals(p => [...p, {
        id: animalId, nombre, raza: sRaza, categoria: sCat,
        peso: sPesoN, lote: sLote, estado: "Activo",
        litrosDia: 0, partos: 0, fechaNacimiento: sFechaNac,
        registro: sRegistro === "si" ? "SI" : "NO",
        numeroRegistro: sRegistro === "si" ? sNumReg : "",
        valorKilo: Number(sValorKilo) || 0,
      }]);
    }
    setSLog(p => [{
      id: animalId, nombre, peso: sPesoN, anterior: existingAnimal?.peso || 0,
      cc: sCC, valor: sValor, hora, raza: sRaza, cat: sCat, nFotos: sFotos.length,
    }, ...p]);
    setSSaved(true);
    setTimeout(() => setSSaved(false), 4000);
  };

  const sReset = () => {
    setSNombre(""); setSFechaNac(""); setSRegistro("no"); setSNumReg("");
    setSPeso(""); setSCC("3.0"); setSFotos([]); setSobs("");
    setSSaved(false); setSBtLoading(false); setSAiLoading(false);
  };

  const sPrefillFromInventory = (a: typeof animals[0]) => {
    setSNombre(a.nombre); setSRaza(a.raza); setSCat(a.categoria);
    setSLote(a.lote); setSFechaNac(a.fechaNacimiento || "");
    setSRegistro(a.registro === "SI" ? "si" : "no");
    setSNumReg(a.numeroRegistro || "");
    setSPeso(String(a.peso)); setSValorKilo(String(a.valorKilo || 11000));
    setSCC("3.0"); setSFotos([]); setSobs(""); setSSaved(false);
  };

  // ── Edad nueva del nuevo animal ───────────────────────────────────────────
  const nuevoEdad = calcEdad(nuevoFechaNac);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* ── HERO BANNER ─────────────────────────────────────────────────────── */}
      <div className="rounded-2xl p-5 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg,#0a001f,#180038,#240052,#180038)",
          border: "1px solid rgba(192,132,252,0.4)",
          boxShadow: "0 0 60px rgba(192,132,252,0.14)",
        }}>
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full pointer-events-none opacity-15"
          style={{ background: "radial-gradient(circle,#c084fc,transparent)" }}/>
        <div className="absolute -left-6 bottom-0 w-32 h-32 rounded-full pointer-events-none opacity-10"
          style={{ background: "radial-gradient(circle,#7c3aed,transparent)" }}/>
        <div className="absolute right-20 bottom-0 w-24 h-24 rounded-full pointer-events-none opacity-8"
          style={{ background: "radial-gradient(circle,#00c8ff,transparent)" }}/>

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{
                background: "linear-gradient(135deg,rgba(192,132,252,0.25),rgba(124,58,237,0.15))",
                border: "1px solid rgba(192,132,252,0.5)",
                boxShadow: "0 0 30px rgba(192,132,252,0.4)",
              }}>
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="font-black text-white text-xl" style={{ fontFamily: "Sora,sans-serif" }}>
                  Pesaje Automatizado
                </h1>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-black"
                  style={{ background: "rgba(192,132,252,0.15)", color: "#c084fc", border: "1px solid rgba(192,132,252,0.4)" }}>
                  IA · CC · GMD · PDF
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-black"
                  style={{ background: "rgba(0,200,255,0.1)", color: "#00c8ff", border: "1px solid rgba(0,200,255,0.3)" }}>
                  🤖 Auto-peso IA
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-black"
                  style={{ background: "rgba(57,255,126,0.1)", color: "#39ff7e", border: "1px solid rgba(57,255,126,0.3)" }}>
                  📸 Foto evidencia
                </span>
              </div>
              <p className="text-xs mb-2" style={{ color: "rgba(192,132,252,0.6)" }}>
                Cálculo IA por raza/edad · Foto del animal · Crear animal desde pesaje · Calculadora de lote
              </p>
              <div className="flex gap-3 flex-wrap">
                {[
                  { val: String(lista.length),   label: "en vista",    c: "192,132,252" },
                  { val: String(pending),          label: "pendientes",  c: "251,191,36" },
                  { val: String(done),             label: "guardados",   c: "57,255,126" },
                  { val: String(pesajes.filter(p => p.fecha === new Date().toLocaleDateString("es-CO")).length), label: "pesajes hoy", c: "0,200,255" },
                ].map(b => (
                  <span key={b.label} className="flex items-center gap-1.5 text-[10px]" style={{ color: `rgba(${b.c},0.85)` }}>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: `rgb(${b.c})` }}/>
                    <strong className="font-black">{b.val}</strong> {b.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex gap-2 flex-wrap flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2" size={11} style={{ color: "rgba(192,132,252,0.5)" }}/>
              <Input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder="Buscar…" className="pl-7 h-8 text-xs w-32"
                style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(192,132,252,0.2)", color: "white" }}/>
            </div>
            <Select value={lote} onValueChange={setLote}>
              <SelectTrigger className="h-8 w-28 text-xs" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(192,132,252,0.2)", color: "rgba(192,132,252,0.8)" }}>
                <SelectValue/>
              </SelectTrigger>
              <SelectContent>
                {["Todos","Lote A","Lote B","Lote C","Lote D","Lote E","Lote F"].map(v => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={search} onValueChange={setSearch}>
              <SelectTrigger className="h-8 w-32 text-xs" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(192,132,252,0.2)", color: "rgba(192,132,252,0.8)" }}>
                <SelectValue/>
              </SelectTrigger>
              <SelectContent>
                {["Todos","Vaca adulta","Novilla","Ternero","Ternera","Toro"].map(v => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" className="h-8 gap-1.5 text-xs"
              onClick={() => setRows({})}
              style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171" }}>
              <RotateCcw size={11}/> Reiniciar
            </Button>
            <Button size="sm" className="h-8 gap-1.5 text-xs"
              onClick={() => setShowRef(!showRef)}
              style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", color: "#fbbf24" }}>
              <ClipboardList size={11}/> {showRef ? "Ocultar" : "Tabla"} pesos
            </Button>
          </div>
        </div>
      </div>

      {/* ── TABS PRINCIPALES ─────────────────────────────────────────────────── */}
      <Tabs defaultValue="sesion">
        <TabsList className="w-full grid grid-cols-3"
          style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(192,132,252,0.2)" }}>
          <TabsTrigger value="sesion" className="gap-1.5 text-xs data-[state=active]:text-white"
            style={{ fontFamily: "Sora,sans-serif" }}>
            <Scale size={12}/> Sesión de Pesaje
          </TabsTrigger>
          <TabsTrigger value="nuevo" className="gap-1.5 text-xs data-[state=active]:text-white">
            <Plus size={12}/> Nuevo Animal
          </TabsTrigger>
          <TabsTrigger value="lote" className="gap-1.5 text-xs data-[state=active]:text-white">
            <Calculator size={12}/> Calculadora Lote
          </TabsTrigger>
        </TabsList>

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 1: PESAJE AUTOMATIZADO — Formulario Independiente
        ══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="sesion" className="mt-4">

          {/* Tabla referencia pesos */}
          {showRef && (
            <div className="rounded-2xl p-4 overflow-x-auto mb-4"
              style={{ background: "rgba(192,132,252,0.03)", border: "1px solid rgba(192,132,252,0.12)" }}>
              <div className="text-[10px] font-black uppercase tracking-widest mb-3"
                style={{ color: "rgba(192,132,252,0.5)" }}>
                Tabla de Pesos Estandar por Raza (kg)
              </div>
              <table className="w-full text-[10px] min-w-[520px]">
                <thead>
                  <tr>
                    <th className="text-left py-2 pr-4 font-black" style={{ color: "rgba(192,132,252,0.6)" }}>Raza</th>
                    {["Vaca adulta","Novilla","Ternero","Ternera","Toro"].map(c => (
                      <th key={c} className="text-center py-2 px-2 font-black"
                        style={{ color: "rgba(192,132,252,0.6)" }}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(PESOS_RAZA).map(([raza, cats]) => (
                    <tr key={raza} className="border-t" style={{ borderColor: "rgba(192,132,252,0.06)" }}>
                      <td className="py-1.5 pr-4 font-semibold text-white/60">{raza}</td>
                      {["Vaca adulta","Novilla","Ternero","Ternera","Toro"].map(c => (
                        <td key={c} className="py-1.5 px-2 text-center font-mono font-bold"
                          style={{ color: "#c084fc" }}>
                          {(cats as Record<string,number>)[c] ?? "—"} kg
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Banner guardado */}
          {sSaved && (
            <div className="rounded-xl p-3 flex items-center gap-3 mb-4"
              style={{ background: "rgba(57,255,126,0.1)", border: "1px solid rgba(57,255,126,0.4)" }}>
              <CheckCircle2 size={16} style={{ color: "#39ff7e" }}/>
              <div>
                <div className="font-black text-sm" style={{ color: "#39ff7e" }}>
                  Pesaje guardado — {sNombre.trim() || "Animal"} · {sPesoN.toFixed(1)} kg
                </div>
                <div className="text-[10px]" style={{ color: "rgba(57,255,126,0.6)" }}>
                  {saveToInv ? "Animal actualizado / creado en Inventario" : "Registro guardado en el sistema"}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4">

            {/* ── FORMULARIO PRINCIPAL ─────────────────────────── */}
            <div className="space-y-3">

              {/* IDENTIDAD */}
              <div className="rounded-2xl p-4 space-y-3"
                style={{ background: "rgba(192,132,252,0.04)", border: "1px solid rgba(192,132,252,0.18)" }}>
                <div className="text-[9px] font-black uppercase tracking-widest"
                  style={{ color: "rgba(192,132,252,0.5)" }}>Identidad del Animal</div>

                {/* Nombre */}
                <div>
                  <label className="text-[9px] font-black uppercase tracking-wider mb-1 block"
                    style={{ color: "rgba(192,132,252,0.45)" }}>Nombre del animal</label>
                  <Input value={sNombre} onChange={e => setSNombre(e.target.value)}
                    placeholder="Ej: Margarita, Estrella... (opcional)"
                    className="h-9 text-sm"
                    style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(192,132,252,0.25)", color: "white" }}/>
                </div>

                {/* Categorias */}
                <div>
                  <label className="text-[9px] font-black uppercase tracking-wider mb-1.5 block"
                    style={{ color: "rgba(192,132,252,0.45)" }}>Categoria</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {CATEGORIAS_LIST.map(c => {
                      const ci = CAT_ICON[c] || CAT_ICON["Vaca adulta"];
                      const sel = sCat === c;
                      return (
                        <button key={c} onClick={() => setSCat(c)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs transition-all"
                          style={{
                            background: sel ? `rgba(${ci.glow},0.2)` : "rgba(255,255,255,0.03)",
                            border: sel ? `1px solid rgba(${ci.glow},0.5)` : "1px solid rgba(255,255,255,0.07)",
                            color: sel ? ci.color : "rgba(255,255,255,0.35)",
                          }}>
                          <span>{ci.emoji}</span> {c}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Raza + Lote */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-wider mb-1 block"
                      style={{ color: "rgba(192,132,252,0.4)" }}>Raza</label>
                    <Select value={sRaza} onValueChange={setSRaza}>
                      <SelectTrigger className="h-9 text-sm"
                        style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(192,132,252,0.22)", color: "white" }}>
                        <SelectValue/>
                      </SelectTrigger>
                      <SelectContent>
                        {RAZAS_LIST.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-wider mb-1 block"
                      style={{ color: "rgba(192,132,252,0.4)" }}>Lote</label>
                    <Select value={sLote} onValueChange={setSLote}>
                      <SelectTrigger className="h-9 text-sm"
                        style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(192,132,252,0.22)", color: "white" }}>
                        <SelectValue/>
                      </SelectTrigger>
                      <SelectContent>
                        {LOTES_LIST.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* FECHA NACIMIENTO + EDAD */}
              <div className="rounded-2xl p-4 space-y-2"
                style={{ background: "rgba(0,200,255,0.04)", border: "1px solid rgba(0,200,255,0.16)" }}>
                <div className="text-[9px] font-black uppercase tracking-widest"
                  style={{ color: "rgba(0,200,255,0.5)" }}>
                  <CalendarDays size={9} className="inline mr-1"/>Fecha de Nacimiento
                </div>
                <div className="flex gap-3 items-center">
                  <Input type="date" value={sFechaNac} onChange={e => setSFechaNac(e.target.value)}
                    className="h-9 flex-1 text-sm"
                    style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(0,200,255,0.22)", color: "white" }}/>
                  {sFechaNac && (
                    <div className="flex-shrink-0 text-right">
                      <div className="text-[9px]" style={{ color: "rgba(0,200,255,0.5)" }}>Edad</div>
                      <div className="font-black text-xl"
                        style={{ color: "#00c8ff", fontFamily: "Sora,sans-serif" }}>
                        {sEdad.anios > 0 ? `${sEdad.anios}a ` : ""}{sEdad.meses % 12}m
                      </div>
                    </div>
                  )}
                </div>
                {sFechaNac && (
                  <div className="flex flex-wrap gap-1.5">
                    {(() => {
                      const etapa = sEdad.anios < 1 ? "Lactante / Destete"
                        : sEdad.anios < 2 ? "Cria en desarrollo"
                        : sEdad.anios < 3 ? "Joven / Novilla" : "Animal adulto";
                      const ec = sEdad.anios < 1 ? "#fb923c" : sEdad.anios < 2 ? "#fbbf24"
                        : sEdad.anios < 3 ? "#a78bfa" : "#00f5d4";
                      return (
                        <>
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold"
                            style={{ background: `${ec}18`, color: ec, border: `1px solid ${ec}30` }}>
                            {etapa}
                          </span>
                          <span className="text-[9px] px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)" }}>
                            {sEdad.meses} meses total
                          </span>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* NUMERO DE REGISTRO */}
              <div className="rounded-2xl p-4 space-y-2"
                style={{ background: "rgba(251,191,36,0.04)", border: "1px solid rgba(251,191,36,0.14)" }}>
                <div className="text-[9px] font-black uppercase tracking-widest"
                  style={{ color: "rgba(251,191,36,0.5)" }}>
                  <Hash size={9} className="inline mr-1"/>Numero de Registro
                </div>
                <div className="flex gap-2">
                  {(["si","no"] as const).map(v => (
                    <button key={v} onClick={() => setSRegistro(v)}
                      className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                      style={{
                        background: sRegistro===v ? (v==="si"?"rgba(251,191,36,0.18)":"rgba(255,255,255,0.06)") : "rgba(255,255,255,0.02)",
                        border: sRegistro===v ? (v==="si"?"1px solid rgba(251,191,36,0.45)":"1px solid rgba(255,255,255,0.18)") : "1px solid rgba(255,255,255,0.06)",
                        color: sRegistro===v ? (v==="si"?"#fbbf24":"rgba(255,255,255,0.6)") : "rgba(255,255,255,0.2)",
                      }}>
                      {v==="si" ? "Si tiene registro" : "Sin registro"}
                    </button>
                  ))}
                </div>
                {sRegistro==="si" && (
                  <Input value={sNumReg} onChange={e => setSNumReg(e.target.value)}
                    placeholder="Ej: REG-0042, COL-0123, ICA-2024-001..."
                    className="h-9 text-sm"
                    style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(251,191,36,0.3)", color: "#fbbf24" }}/>
                )}
              </div>

              {/* PESO DIGITAL */}
              <div className="rounded-2xl p-5"
                style={{ background: "rgba(0,0,0,0.55)", border: "1px solid rgba(192,132,252,0.2)" }}>
                <div className="text-[9px] font-black uppercase tracking-widest mb-3 text-center"
                  style={{ color: "rgba(192,132,252,0.45)" }}>PESO ACTUAL</div>

                <div className="flex items-center justify-center gap-3 mb-3">
                  {/* Botones menos */}
                  <div className="flex flex-col gap-2">
                    {([{d:-10},{d:-1},{d:-0.5}] as const).map(({d}) => (
                      <button key={d}
                        onClick={() => setSPeso(String(Math.max(0, sPesoN + d).toFixed(1)))}
                        className="w-14 h-11 rounded-xl font-black text-sm transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
                        style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", color: "#f87171" }}>
                        {d}
                      </button>
                    ))}
                  </div>

                  {/* Display numero grande */}
                  <div className="flex-1 text-center">
                    <input
                      type="number" step="0.5" min="0"
                      value={sPeso}
                      onChange={e => { setSPeso(e.target.value); setSSaved(false); }}
                      placeholder={String(sPesoAuto)}
                      className="w-full text-center font-black border-0 outline-none bg-transparent"
                      style={{
                        fontFamily: "JetBrains Mono,monospace",
                        fontSize: "clamp(40px,8vw,68px)",
                        color: "#c084fc",
                        textShadow: "0 0 32px rgba(192,132,252,0.8),0 0 60px rgba(192,132,252,0.3)",
                        letterSpacing: "2px",
                        lineHeight: 1.05,
                      }}
                    />
                    <div className="text-xs font-bold mt-1" style={{ color: "rgba(192,132,252,0.4)" }}>kilogramos</div>
                    <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full"
                        style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)" }}>
                        Ref. {sRaza}: {sPesoAuto} kg
                      </span>
                      {sPesoN > 0 && (
                        <span className="text-sm px-3 py-0.5 rounded-full font-black"
                          style={{
                            background: sPct >= 80 && sPct <= 120 ? "rgba(57,255,126,0.12)" : "rgba(251,191,36,0.12)",
                            color: sPct >= 80 && sPct <= 120 ? "#39ff7e" : "#fbbf24",
                            border: `1px solid ${sPct >= 80 && sPct <= 120 ? "rgba(57,255,126,0.3)" : "rgba(251,191,36,0.3)"}`,
                          }}>
                          {sPct}% del estandar
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Botones mas */}
                  <div className="flex flex-col gap-2">
                    {([{d:10},{d:1},{d:0.5}] as const).map(({d}) => (
                      <button key={d}
                        onClick={() => setSPeso(String((sPesoN + d).toFixed(1)))}
                        className="w-14 h-11 rounded-xl font-black text-sm transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
                        style={{ background: "rgba(57,255,126,0.1)", border: "1px solid rgba(57,255,126,0.25)", color: "#39ff7e" }}>
                        +{d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Barra de progreso vs estandar */}
                {sPesoN > 0 && (
                  <div className="mt-2">
                    <div className="flex justify-between text-[9px] mb-1"
                      style={{ color: "rgba(255,255,255,0.25)" }}>
                      <span>vs. estandar {sRaza} {sCat}</span>
                      <span style={{ color: "#c084fc" }}>{sPct}%</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(sPct,100)}%`,
                          background: "linear-gradient(90deg,#c084fc,#a855f7)",
                          boxShadow: "0 0 10px rgba(192,132,252,0.5)",
                        }}/>
                    </div>
                  </div>
                )}

                {/* BT / IA / Auto */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <button onClick={sBtSim} disabled={sBtLoading||sAiLoading}
                    className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl font-bold text-xs transition-all hover:scale-[1.02] disabled:opacity-60"
                    style={{ background: "rgba(0,200,255,0.1)", border: "1px solid rgba(0,200,255,0.3)", color: "#00c8ff" }}>
                    <Bluetooth size={14} className={sBtLoading ? "animate-pulse" : ""}/>
                    {sBtLoading ? "Leyendo..." : "Leer BT"}
                  </button>
                  <button onClick={sAiEstimate} disabled={sAiLoading||sBtLoading}
                    className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl font-bold text-xs transition-all hover:scale-[1.02] disabled:opacity-60"
                    style={{ background: "rgba(232,121,249,0.1)", border: "1px solid rgba(232,121,249,0.35)", color: "#e879f9" }}>
                    <Brain size={14} className={sAiLoading ? "animate-spin" : ""}/>
                    {sAiLoading ? "IA calc..." : "Peso IA"}
                  </button>
                  <button onClick={() => setSPeso(String(sPesoAuto))}
                    className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl font-bold text-xs transition-all hover:scale-[1.02]"
                    style={{ background: "rgba(255,149,0,0.1)", border: "1px solid rgba(255,149,0,0.3)", color: "#ff9500" }}>
                    <Zap size={14}/> Prom. raza
                  </button>
                </div>

                {sAiLoading && (
                  <div className="rounded-xl p-2.5 text-center mt-2"
                    style={{ background: "rgba(232,121,249,0.06)", border: "1px solid rgba(232,121,249,0.2)" }}>
                    <div className="text-[10px] font-bold" style={{ color: "#e879f9" }}>
                      {sAiFromImg ? "IA analizando foto..." : `IA calculando para ${sCat} · ${sRaza}${sEdad.meses > 0 ? ` · ${sEdad.meses}m` : ""}...`}
                    </div>
                  </div>
                )}

                {/* IA DESDE FOTO ─────────────────────────────────────── */}
                <div className="mt-3 rounded-xl p-3 space-y-2"
                  style={{ background: "rgba(232,121,249,0.05)", border: "1px solid rgba(232,121,249,0.2)" }}>
                  <div className="flex items-center justify-between">
                    <div className="text-[9px] font-black uppercase tracking-wider"
                      style={{ color: "#e879f9" }}>
                      <Brain size={9} className="inline mr-1"/>Estimar Peso desde Foto (IA)
                    </div>
                    {sAiPhotoUrl && !sAiLoading && (
                      <button onClick={() => { setSAiPhotoUrl(null); }}
                        className="text-[8px] px-1.5 py-0.5 rounded-full"
                        style={{ background: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}>
                        Quitar foto
                      </button>
                    )}
                  </div>

                  {sAiPhotoUrl ? (
                    <div className="flex items-center gap-3">
                      <img src={sAiPhotoUrl} alt="IA foto"
                        className="w-20 h-14 object-cover rounded-lg flex-shrink-0"
                        style={{ border: "1px solid rgba(232,121,249,0.4)" }}/>
                      <div>
                        <div className="text-[9px] font-bold" style={{ color: "rgba(232,121,249,0.8)" }}>
                          {sAiLoading ? "Analizando imagen..." : `Peso estimado: ${sPesoN.toFixed(1)} kg`}
                        </div>
                        <div className="text-[8px] mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>
                          IA detecta: {sCat} · {sRaza} · {sPct}% del estandar
                        </div>
                        {!sAiLoading && (
                          <button onClick={() => { if (sAiImgRef.current) sAiImgRef.current.click(); }}
                            className="mt-1 text-[8px] px-2 py-0.5 rounded-full font-bold"
                            style={{ background: "rgba(232,121,249,0.12)", color: "#e879f9", border: "1px solid rgba(232,121,249,0.3)" }}>
                            Nueva foto
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-1.5">
                      <button onClick={() => { if (sAiImgRef.current) { sAiImgRef.current.dataset.src = "cam"; sAiImgRef.current.click(); } }}
                        disabled={sAiLoading || sBtLoading}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-bold transition-all hover:scale-[1.02] disabled:opacity-50"
                        style={{ background: "rgba(232,121,249,0.1)", border: "1px solid rgba(232,121,249,0.3)", color: "#e879f9" }}>
                        <Camera size={11}/> Foto del animal
                      </button>
                      <button onClick={() => { if (sAiImgRef.current) { sAiImgRef.current.removeAttribute("capture"); sAiImgRef.current.click(); } }}
                        disabled={sAiLoading || sBtLoading}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-bold transition-all hover:scale-[1.02] disabled:opacity-50"
                        style={{ background: "rgba(232,121,249,0.06)", border: "1px solid rgba(232,121,249,0.18)", color: "rgba(232,121,249,0.7)" }}>
                        <Upload size={11}/> Subir imagen
                      </button>
                    </div>
                  )}
                  <div className="text-[8px] text-center" style={{ color: "rgba(255,255,255,0.15)" }}>
                    Sube una foto lateral del animal para que la IA calcule el peso automaticamente
                  </div>
                  <input ref={sAiImgRef} type="file" accept="image/*" capture="environment" className="hidden"
                    onChange={e => {
                      if (!e.target.files?.[0]) return;
                      const r = new FileReader();
                      r.onload = ev => { sAiFromPhoto(ev.target?.result as string); };
                      r.readAsDataURL(e.target.files[0]);
                    }}/>
                </div>
              </div>

              {/* CONDICION CORPORAL */}
              <div className="rounded-2xl p-4"
                style={{ background: "rgba(192,132,252,0.04)", border: "1px solid rgba(192,132,252,0.12)" }}>
                <div className="text-[9px] font-black uppercase tracking-widest mb-2.5"
                  style={{ color: "rgba(192,132,252,0.5)" }}>Condicion Corporal (CC)</div>
                <div className="flex flex-wrap gap-1.5">
                  {CC_OPTS.map(c => {
                    const sel = sCC === c.val;
                    return (
                      <button key={c.val} onClick={() => setSCC(c.val)}
                        className="flex flex-col items-center px-2 py-1.5 rounded-xl transition-all hover:scale-110 active:scale-95"
                        style={{
                          background: sel ? `${c.color}22` : "rgba(255,255,255,0.03)",
                          border: sel ? `2px solid ${c.color}80` : "1px solid rgba(255,255,255,0.08)",
                          boxShadow: sel ? `0 0 10px ${c.color}40` : "none",
                          minWidth: 42,
                        }}>
                        <span className="text-base">{c.emoji}</span>
                        <span className="text-[9px] font-black"
                          style={{ color: sel ? c.color : "rgba(255,255,255,0.4)" }}>{c.val}</span>
                      </button>
                    );
                  })}
                </div>
                {sCC && (
                  <div className="mt-2 text-[10px] flex items-center gap-1.5">
                    <span style={{ color: "rgba(192,132,252,0.5)" }}>Seleccionado:</span>
                    <span className="font-bold"
                      style={{ color: CC_OPTS.find(c => c.val===sCC)?.color }}>
                      CC {sCC} — {CC_OPTS.find(c => c.val===sCC)?.label}
                    </span>
                  </div>
                )}
              </div>

              {/* FOTOS */}
              <div className="rounded-2xl p-4 space-y-3"
                style={{ background: "rgba(0,245,212,0.04)", border: "1px solid rgba(0,245,212,0.15)" }}>
                <div className="flex items-center justify-between">
                  <div className="text-[9px] font-black uppercase tracking-widest"
                    style={{ color: "rgba(0,245,212,0.5)" }}>
                    <Camera size={9} className="inline mr-1"/>Evidencia Fotografica
                  </div>
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full"
                    style={{ background: "rgba(0,245,212,0.08)", color: "rgba(0,245,212,0.5)", border: "1px solid rgba(0,245,212,0.15)" }}>
                    {sFotos.length} foto{sFotos.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Visor indicador variable por categoria */}
                <div className="flex flex-col items-center gap-1.5 py-1">
                  <div className="text-[8px] font-bold uppercase tracking-wide"
                    style={{ color: "rgba(0,245,212,0.4)" }}>Foto del Indicador de Pesaje</div>
                  <div className="relative flex items-center justify-center transition-all duration-300"
                    style={{ width: sFrame.w, height: sFrame.h }}>
                    {sIndFoto ? (
                      <div className="relative w-full h-full">
                        <img src={sIndFoto.url} alt="Indicador"
                          className="w-full h-full object-cover rounded-lg"
                          style={{ border: "2px solid rgba(0,245,212,0.6)" }}/>
                        <button onClick={() => sRemoveFoto(sIndFoto.id)}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black"
                          style={{ background: "#f87171", color: "white" }}>X</button>
                      </div>
                    ) : (
                      <div className="w-full h-full rounded-lg flex flex-col items-center justify-center relative"
                        style={{ background: "rgba(0,0,0,0.4)", border: "2px dashed rgba(0,245,212,0.2)" }}>
                        <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 rounded-tl"
                          style={{ borderColor: "rgba(0,245,212,0.55)" }}/>
                        <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 rounded-tr"
                          style={{ borderColor: "rgba(0,245,212,0.55)" }}/>
                        <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 rounded-bl"
                          style={{ borderColor: "rgba(0,245,212,0.55)" }}/>
                        <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 rounded-br"
                          style={{ borderColor: "rgba(0,245,212,0.55)" }}/>
                        <span className="text-xs text-white/30">sin foto</span>
                      </div>
                    )}
                  </div>
                  <div className="text-[7px]" style={{ color: "rgba(0,245,212,0.25)" }}>{sFrame.label}</div>
                  {!sIndFoto && (
                    <div className="flex gap-1.5">
                      <button onClick={() => sCamRef.current?.click()}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg text-[9px] font-bold hover:scale-105"
                        style={{ background: "rgba(0,245,212,0.12)", border: "1px solid rgba(0,245,212,0.35)", color: "#00f5d4" }}>
                        <Camera size={10}/> Camara
                      </button>
                      <button onClick={() => sFileRef.current?.click()}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg text-[9px] font-bold hover:scale-105"
                        style={{ background: "rgba(0,245,212,0.06)", border: "1px solid rgba(0,245,212,0.2)", color: "rgba(0,245,212,0.6)" }}>
                        <Upload size={10}/> Galeria
                      </button>
                    </div>
                  )}
                </div>

                {/* Lateral + Completa */}
                <div className="grid grid-cols-2 gap-1.5">
                  {([
                    { tipo: "lateral"  as const, label: "Lateral" },
                    { tipo: "completa" as const, label: "Completa" },
                  ]).map(({ tipo, label }) => {
                    const tipoFoto = sFotos.find(f => f.tipo === tipo);
                    return (
                      <div key={tipo} className="flex flex-col gap-1">
                        <div className="text-[8px] text-center font-bold"
                          style={{ color: "rgba(0,245,212,0.45)" }}>{label}</div>
                        {tipoFoto ? (
                          <div className="relative">
                            <img src={tipoFoto.url} alt={label}
                              className="w-full h-16 object-cover rounded-lg"
                              style={{ border: "1px solid rgba(0,245,212,0.4)" }}/>
                            <button onClick={() => sRemoveFoto(tipoFoto.id)}
                              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black"
                              style={{ background: "#f87171", color: "white" }}>X</button>
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            <button
                              onClick={() => { if (sCamRef.current) { sCamRef.current.dataset.tipo = tipo; sCamRef.current.click(); } }}
                              className="flex-1 flex items-center justify-center py-2 rounded-lg text-[9px] font-bold hover:scale-105"
                              style={{ background: "rgba(0,245,212,0.08)", border: "1px solid rgba(0,245,212,0.2)", color: "#00f5d4" }}>
                              <Camera size={10}/>
                            </button>
                            <button
                              onClick={() => { if (sFileRef.current) { sFileRef.current.dataset.tipo = tipo; sFileRef.current.click(); } }}
                              className="flex-1 flex items-center justify-center py-2 rounded-lg text-[9px] font-bold hover:scale-105"
                              style={{ background: "rgba(0,245,212,0.08)", border: "1px solid rgba(0,245,212,0.2)", color: "#00f5d4" }}>
                              <Upload size={10}/>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Inputs ocultos camara / galeria */}
                <input ref={sCamRef} type="file" accept="image/*" capture="environment" className="hidden"
                  onChange={e => {
                    const tipo = (sCamRef.current?.dataset.tipo as AnimalPhoto["tipo"]) || "indicador";
                    sFotoUpload(e.target.files, tipo);
                    if (sCamRef.current) sCamRef.current.dataset.tipo = "";
                  }}/>
                <input ref={sFileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => {
                    const tipo = (sFileRef.current?.dataset.tipo as AnimalPhoto["tipo"]) || "indicador";
                    sFotoUpload(e.target.files, tipo);
                    if (sFileRef.current) sFileRef.current.dataset.tipo = "";
                  }}/>

                {sFotos.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {sFotos.map(foto => (
                      <div key={foto.id} className="relative group">
                        <img src={foto.url} alt={foto.label}
                          className="w-20 h-16 object-cover rounded-lg"
                          style={{ border: "1px solid rgba(0,245,212,0.3)" }}/>
                        <div className="absolute bottom-0 left-0 right-0 text-[7px] text-center py-0.5 rounded-b-lg"
                          style={{ background: "rgba(0,0,0,0.6)", color: "rgba(0,245,212,0.8)" }}>
                          {foto.label}
                        </div>
                        <button onClick={() => sRemoveFoto(foto.id)}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: "#f87171", color: "white" }}>X</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* VALOR POR KG */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-3"
                  style={{ background: "rgba(57,255,126,0.04)", border: "1px solid rgba(57,255,126,0.14)" }}>
                  <div className="text-[9px] font-black uppercase tracking-wider mb-1.5"
                    style={{ color: "rgba(57,255,126,0.5)" }}>$/kg</div>
                  <Input type="number" step="500" value={sValorKilo}
                    onChange={e => setSValorKilo(e.target.value)}
                    className="h-9 text-center font-mono"
                    style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(57,255,126,0.2)", color: "#39ff7e" }}/>
                </div>
                <div className="rounded-xl p-3"
                  style={{ background: "rgba(57,255,126,0.04)", border: "1px solid rgba(57,255,126,0.14)" }}>
                  <div className="text-[9px] font-black uppercase tracking-wider mb-1.5 text-white/30">Valor animal</div>
                  <div className="h-9 flex items-center font-black text-base"
                    style={{ color: sValor > 0 ? "#39ff7e" : "rgba(255,255,255,0.2)", fontFamily: "Sora,sans-serif" }}>
                    {sValor > 0 ? fmt(sValor) : "—"}
                  </div>
                </div>
              </div>

              {/* OBSERVACIONES */}
              <div>
                <div className="text-[9px] font-black uppercase tracking-wider mb-1.5"
                  style={{ color: "rgba(255,255,255,0.2)" }}>Observaciones</div>
                <textarea value={sObs} onChange={e => setSobs(e.target.value)}
                  placeholder="Notas del pesaje, tratamientos, comportamiento..."
                  rows={2} className="w-full rounded-xl p-2.5 text-xs resize-none"
                  style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.07)",
                    color: "rgba(255,255,255,0.6)", outline: "none" }}/>
              </div>

              {/* INFORMACION RECIBIDA ─────────────────────────────── */}
              {(sNombre || sPesoN > 0 || sFechaNac) && (
                <div className="rounded-2xl overflow-hidden"
                  style={{ border: `1px solid ${sPesoN > 0 ? "rgba(57,255,126,0.3)" : "rgba(255,255,255,0.08)"}` }}>
                  <div className="px-4 py-2.5 flex items-center gap-2"
                    style={{ background: sPesoN > 0 ? "rgba(57,255,126,0.08)" : "rgba(255,255,255,0.03)",
                      borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <CheckCircle2 size={12} style={{ color: sPesoN > 0 ? "#39ff7e" : "rgba(255,255,255,0.2)" }}/>
                    <span className="font-black text-xs"
                      style={{ color: sPesoN > 0 ? "#39ff7e" : "rgba(255,255,255,0.4)" }}>
                      Informacion Recibida
                    </span>
                    {sPesoN > 0 && (
                      <span className="ml-auto text-[8px] px-2 py-0.5 rounded-full font-bold"
                        style={{ background: "rgba(57,255,126,0.12)", color: "#39ff7e",
                          border: "1px solid rgba(57,255,126,0.25)" }}>
                        Listo para guardar
                      </span>
                    )}
                  </div>
                  <div className="px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[10px]">
                    {[
                      { label: "Animal",      val: sNombre.trim() || "Sin nombre", c: "#c084fc" },
                      { label: "Categoria",   val: `${sCatIcon.emoji} ${sCat}`, c: sCatIcon.color },
                      { label: "Raza",        val: sRaza,       c: "rgba(255,255,255,0.7)" },
                      { label: "Lote",        val: sLote,       c: "rgba(255,255,255,0.7)" },
                      ...(sFechaNac ? [{ label: "Edad",  val: `${sEdad.anios > 0 ? sEdad.anios+"a " : ""}${sEdad.meses % 12}m`, c: "#00c8ff" }] : []),
                      ...(sRegistro==="si"&&sNumReg ? [{ label: "Registro", val: sNumReg, c: "#fbbf24" }] : []),
                      { label: "Peso",        val: sPesoN > 0 ? `${sPesoN.toFixed(1)} kg` : "—",
                        c: sPesoN > 0 ? "#c084fc" : "rgba(255,255,255,0.2)" },
                      { label: "vs estandar", val: sPesoN > 0 ? `${sPct}%` : "—",
                        c: sPct >= 80 && sPct <= 120 ? "#39ff7e" : "#fbbf24" },
                      { label: "CC",          val: sCC ? `CC ${sCC} — ${CC_OPTS.find(c=>c.val===sCC)?.label||""}` : "—",
                        c: CC_OPTS.find(c=>c.val===sCC)?.color||"#888" },
                      ...(sValor > 0 ? [{ label: "Valor", val: fmt(sValor), c: "#39ff7e" }] : []),
                      { label: "Fotos",       val: sFotos.length > 0 ? `${sFotos.length} capturadas` : "Sin fotos",
                        c: sFotos.length > 0 ? "#00f5d4" : "rgba(255,255,255,0.2)" },
                      ...(sObs ? [{ label: "Observ.", val: sObs.slice(0,30)+(sObs.length>30?"…":""), c: "rgba(255,255,255,0.5)" }] : []),
                    ].map(({ label, val, c }) => (
                      <div key={label} className="flex items-baseline gap-1.5">
                        <span style={{ color: "rgba(255,255,255,0.25)", flexShrink: 0, minWidth: 56 }}>{label}</span>
                        <span className="font-bold truncate" style={{ color: c }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ACCIONES */}
              <div className="grid grid-cols-2 gap-2">
                <button onClick={sPrint}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02]"
                  style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.3)", color: "#a78bfa" }}>
                  <Printer size={13}/> Imprimir recibo
                </button>
                <button onClick={sWA}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02]"
                  style={{ background: "rgba(57,255,126,0.08)", border: "1px solid rgba(57,255,126,0.25)", color: "#39ff7e" }}>
                  <Share2 size={13}/> WhatsApp
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={sReset}
                  className="flex items-center justify-center gap-1.5 py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.02]"
                  style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171" }}>
                  <RotateCcw size={14}/> Limpiar
                </button>
                <button onClick={sSaveData} disabled={!sPesoN}
                  className="flex items-center justify-center gap-1.5 py-3 rounded-xl font-black text-sm transition-all hover:scale-[1.02] disabled:opacity-40"
                  style={{
                    background: sSaved ? "rgba(57,255,126,0.08)" : "rgba(57,255,126,0.15)",
                    border: sSaved ? "1px solid rgba(57,255,126,0.25)" : "1px solid rgba(57,255,126,0.45)",
                    color: "#39ff7e",
                  }}>
                  {sSaved ? <><CheckCircle2 size={14}/> Guardado</> : <><Save size={14}/> Guardar pesaje</>}
                </button>
              </div>

              {/* Toggle guardar en inventario */}
              <button onClick={() => setSaveToInv(!saveToInv)}
                className="w-full flex items-center gap-3 rounded-xl p-3 transition-all hover:opacity-80"
                style={{
                  background: saveToInv ? "rgba(251,191,36,0.08)" : "rgba(255,255,255,0.02)",
                  border: saveToInv ? "1px solid rgba(251,191,36,0.25)" : "1px solid rgba(255,255,255,0.06)",
                }}>
                <div className="w-8 h-5 rounded-full relative flex-shrink-0"
                  style={{
                    background: saveToInv ? "rgba(251,191,36,0.3)" : "rgba(255,255,255,0.08)",
                    border: saveToInv ? "1px solid rgba(251,191,36,0.5)" : "1px solid rgba(255,255,255,0.12)",
                  }}>
                  <div className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                    style={{ left: saveToInv ? "calc(100% - 18px)" : "2px",
                      background: saveToInv ? "#fbbf24" : "rgba(255,255,255,0.3)" }}/>
                </div>
                <span className="text-[10px] text-left"
                  style={{ color: saveToInv ? "#fbbf24" : "rgba(255,255,255,0.3)" }}>
                  {saveToInv ? "Guardar tambien en Inventario de Animales" : "Solo guardar pesaje (sin agregar al inventario)"}
                </span>
              </button>

            </div>{/* fin formulario principal */}

            {/* ── PANEL DERECHO: Inventario opcional ──────────── */}
            <div>
              <div className="rounded-2xl overflow-hidden sticky top-4"
                style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                <button onClick={() => setInvOpen(!invOpen)}
                  className="w-full px-4 py-3 flex items-center gap-2 text-left"
                  style={{ background: "rgba(255,255,255,0.04)",
                    borderBottom: invOpen ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
                  <Users size={13} style={{ color: "rgba(255,255,255,0.4)", flexShrink: 0 }}/>
                  <span className="font-bold text-xs text-white/70">Inventario</span>
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full ml-1"
                    style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }}>
                    opcional
                  </span>
                  <span className="ml-auto text-[10px]"
                    style={{ color: "rgba(255,255,255,0.25)" }}>{invOpen ? "▲" : "▼"}</span>
                </button>

                {invOpen && (
                  <div style={{ background: "rgba(0,0,0,0.2)" }}>
                    <div className="px-3 py-2 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                      <div className="text-[9px] mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>
                        Toca un animal para prellenar el formulario
                      </div>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2" size={10}
                          style={{ color: "rgba(255,255,255,0.3)" }}/>
                        <Input value={invSearch} onChange={e => setInvSearch(e.target.value)}
                          placeholder="Buscar..." className="pl-7 h-7 text-xs"
                          style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.08)", color: "white" }}/>
                      </div>
                    </div>
                    <div className="overflow-y-auto" style={{ maxHeight: 380 }}>
                      {animals
                        .filter(a =>
                          !invSearch ||
                          a.nombre.toLowerCase().includes(invSearch.toLowerCase()) ||
                          a.raza.toLowerCase().includes(invSearch.toLowerCase()) ||
                          a.id.toLowerCase().includes(invSearch.toLowerCase()))
                        .slice(0, 40)
                        .map(a => {
                          const ci = CAT_ICON[a.categoria] || CAT_ICON["Vaca adulta"];
                          const isPrefilled = sNombre.toLowerCase() === a.nombre.toLowerCase();
                          return (
                            <button key={a.id}
                              onClick={() => sPrefillFromInventory(a)}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-all hover:bg-white/[0.025] border-b"
                              style={{
                                borderColor: "rgba(255,255,255,0.04)",
                                background: isPrefilled ? `rgba(${ci.glow},0.07)` : "transparent",
                                borderLeft: isPrefilled ? `3px solid ${ci.color}` : "3px solid transparent",
                              }}>
                              <span className="text-base flex-shrink-0">{ci.emoji}</span>
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-xs truncate"
                                  style={{ color: isPrefilled ? ci.color : "rgba(255,255,255,0.8)" }}>
                                  {a.nombre}
                                </div>
                                <div className="text-[9px]" style={{ color: "rgba(255,255,255,0.28)" }}>
                                  <span style={{ color: ci.color }}>{a.raza}</span> · {a.lote}
                                </div>
                              </div>
                              <div className="font-mono text-[10px] text-white/30 flex-shrink-0">{a.peso} kg</div>
                            </button>
                          );
                        })}
                      {animals.length === 0 && (
                        <div className="p-4 text-center text-[10px] text-white/20">Sin animales en inventario</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── SESSION LOG ─────────────────────────────────── */}
          {sLog.length > 0 && (
            <div className="rounded-2xl overflow-hidden mt-2"
              style={{ border: "1px solid rgba(192,132,252,0.15)" }}>
              <div className="px-4 py-3 flex items-center gap-2"
                style={{ background: "rgba(192,132,252,0.05)", borderBottom: "1px solid rgba(192,132,252,0.1)" }}>
                <CheckCircle2 size={13} style={{ color: "#39ff7e" }}/>
                <span className="font-bold text-sm text-white">
                  Sesion — {sLog.length} pesaje{sLog.length !== 1 ? "s" : ""} registrado{sLog.length !== 1 ? "s" : ""}
                </span>
                <button onClick={() => window.print()}
                  className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold"
                  style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.25)", color: "#a78bfa" }}>
                  <Printer size={11}/> Imprimir
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: "rgba(192,132,252,0.03)", borderBottom: "1px solid rgba(192,132,252,0.08)" }}>
                      {["Animal","Raza","Categoria","Peso","Ant.","CC","Valor","Fotos","Hora"].map(h => (
                        <th key={h} className="text-left px-4 py-2.5 text-[9px] font-black uppercase tracking-wider"
                          style={{ color: "rgba(192,132,252,0.5)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sLog.map((r, i) => {
                      const ccInfo = CC_OPTS.find(c => c.val === r.cc);
                      const ci = CAT_ICON[r.cat] || CAT_ICON["Vaca adulta"];
                      return (
                        <tr key={i} className="border-b hover:bg-white/[0.012] transition-colors"
                          style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                          <td className="px-4 py-2.5 font-bold text-white">{r.nombre}</td>
                          <td className="px-4 py-2.5 text-white/50 text-[10px]">{r.raza}</td>
                          <td className="px-4 py-2.5">
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                              style={{ background: ci.bg, color: ci.color, border: `1px solid ${ci.border}` }}>
                              {ci.emoji} {r.cat}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-black"
                            style={{ color: "#c084fc", fontFamily: "Sora,sans-serif" }}>{r.peso.toFixed(1)} kg</td>
                          <td className="px-4 py-2.5 text-white/35">{r.anterior > 0 ? `${r.anterior} kg` : "—"}</td>
                          <td className="px-4 py-2.5">
                            <span className="font-bold"
                              style={{ color: ccInfo?.color || "#888" }}>{ccInfo?.emoji} {r.cc}</span>
                          </td>
                          <td className="px-4 py-2.5 font-semibold"
                            style={{ color: "#39ff7e" }}>{r.valor > 0 ? fmt(r.valor) : "—"}</td>
                          <td className="px-4 py-2.5 text-white/30 text-[10px]">
                            {r.nFotos > 0 ? `Fotos: ${r.nFotos}` : "—"}
                          </td>
                          <td className="px-4 py-2.5 text-white/25">{r.hora}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </TabsContent>

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 2: NUEVO ANIMAL RÁPIDO
        ══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="nuevo" className="mt-4">
          <div className="max-w-2xl mx-auto space-y-4">

            {/* Banner */}
            <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg,#001a0e,#002e18)", border: "1px solid rgba(57,255,126,0.3)" }}>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: "rgba(57,255,126,0.1)", border: "1px solid rgba(57,255,126,0.3)" }}>
                  🐄
                </div>
                <div>
                  <div className="font-black text-white" style={{ fontFamily: "Sora,sans-serif" }}>Crear Animal Rápido</div>
                  <div className="text-xs" style={{ color: "rgba(57,255,126,0.6)" }}>
                    Registra un nuevo animal directo desde el módulo de pesaje
                  </div>
                </div>
              </div>
            </div>

            {nuevoCreado && (
              <div className="rounded-xl p-3 flex items-center gap-2"
                style={{ background: "rgba(57,255,126,0.1)", border: "1px solid rgba(57,255,126,0.4)" }}>
                <CheckCircle2 size={16} style={{ color: "#39ff7e" }}/>
                <span className="font-bold text-sm" style={{ color: "#39ff7e" }}>
                  Animal creado con ID #{nuevoCreado} — ya aparece en la cola de pesaje ✓
                </span>
              </div>
            )}

            <div className="rounded-2xl p-5 space-y-4"
              style={{ background: "rgba(57,255,126,0.03)", border: "1px solid rgba(57,255,126,0.12)" }}>

              {/* Nombre */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider" style={{ color: "rgba(57,255,126,0.5)" }}>
                  <Beef size={10} className="inline mr-1"/>Nombre del animal *
                </label>
                <Input value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)}
                  placeholder="Ej: Rosaura, Estrella, Bravo…" className="h-9 text-sm"
                  style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(57,255,126,0.2)", color: "white" }}/>
              </div>

              {/* Raza + Categoría */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider" style={{ color: "rgba(57,255,126,0.5)" }}>Raza</label>
                  <Select value={nuevoRaza} onValueChange={setNuevoRaza}>
                    <SelectTrigger className="h-9 text-sm" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(57,255,126,0.2)", color: "white" }}>
                      <SelectValue/>
                    </SelectTrigger>
                    <SelectContent>
                      {RAZAS_LIST.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider" style={{ color: "rgba(57,255,126,0.5)" }}>Categoría</label>
                  <Select value={nuevoCategoria} onValueChange={setNuevoCategoria}>
                    <SelectTrigger className="h-9 text-sm" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(57,255,126,0.2)", color: "white" }}>
                      <SelectValue/>
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS_LIST.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Lote */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider" style={{ color: "rgba(57,255,126,0.5)" }}>
                  <Package size={10} className="inline mr-1"/>Lote
                </label>
                <Select value={nuevoLote} onValueChange={setNuevoLote}>
                  <SelectTrigger className="h-9 text-sm" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(57,255,126,0.2)", color: "white" }}>
                    <SelectValue/>
                  </SelectTrigger>
                  <SelectContent>
                    {LOTES_LIST.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Fecha nacimiento + edad calculada */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider" style={{ color: "rgba(57,255,126,0.5)" }}>
                  <CalendarDays size={10} className="inline mr-1"/>Fecha de Nacimiento
                </label>
                <div className="flex gap-3 items-center">
                  <Input type="date" value={nuevoFechaNac} onChange={e => setNuevoFechaNac(e.target.value)}
                    className="h-9 flex-1 text-sm"
                    style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(57,255,126,0.2)", color: "white" }}/>
                  {nuevoFechaNac && (
                    <div className="flex-shrink-0 text-right">
                      <div className="text-[9px]" style={{ color: "rgba(0,200,255,0.5)" }}>Edad calculada</div>
                      <div className="font-black text-base" style={{ color: "#00c8ff" }}>
                        {nuevoEdad.anios > 0 ? `${nuevoEdad.anios}a ` : ""}{nuevoEdad.meses % 12}m
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Registro */}
              <div className="space-y-2 rounded-xl p-3" style={{ background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.15)" }}>
                <label className="text-[10px] font-black uppercase tracking-wider" style={{ color: "rgba(251,191,36,0.6)" }}>
                  <Hash size={10} className="inline mr-1"/>¿Tiene número de registro?
                </label>
                <div className="flex gap-2">
                  {(["si","no"] as const).map(v => (
                    <button key={v} onClick={() => setNuevoRegistro(v)}
                      className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                      style={{
                        background: nuevoRegistro === v ? (v === "si" ? "rgba(251,191,36,0.2)" : "rgba(255,255,255,0.05)") : "rgba(255,255,255,0.03)",
                        border: nuevoRegistro === v ? (v === "si" ? "1px solid rgba(251,191,36,0.5)" : "1px solid rgba(255,255,255,0.2)") : "1px solid rgba(255,255,255,0.06)",
                        color: nuevoRegistro === v ? (v === "si" ? "#fbbf24" : "rgba(255,255,255,0.6)") : "rgba(255,255,255,0.2)",
                      }}>
                      {v === "si" ? "✓ Sí, tiene registro" : "✗ No tiene registro"}
                    </button>
                  ))}
                </div>
                {nuevoRegistro === "si" && (
                  <Input value={nuevoNumReg} onChange={e => setNuevoNumReg(e.target.value)}
                    placeholder="Ej: REG-0042, COL-0123…"
                    className="h-8 text-xs"
                    style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(251,191,36,0.25)", color: "#fbbf24" }}/>
                )}
              </div>

              {/* Peso inicial */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider" style={{ color: "rgba(57,255,126,0.5)" }}>
                  Peso inicial (kg) — opcional
                </label>
                <div className="flex gap-2 items-center">
                  <Input type="number" min="0" step="0.5" value={nuevoPeso} onChange={e => setNuevoPeso(e.target.value)}
                    placeholder={`Referencia: ${PESOS_RAZA[nuevoRaza]?.[nuevoCategoria] || 350} kg (raza ${nuevoRaza})`}
                    className="h-9 flex-1 text-sm"
                    style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(57,255,126,0.2)", color: "white" }}/>
                  <button onClick={() => setNuevoPeso(String(PESOS_RAZA[nuevoRaza]?.[nuevoCategoria] || 350))}
                    className="h-9 px-3 rounded-lg text-xs font-bold flex-shrink-0"
                    style={{ background: "rgba(232,121,249,0.1)", border: "1px solid rgba(232,121,249,0.3)", color: "#e879f9" }}>
                    <Brain size={12} className="inline mr-1"/>IA
                  </button>
                </div>
              </div>

              {/* Botón crear */}
              <button onClick={crearAnimalRapido} disabled={!nuevoNombre.trim()}
                className="w-full py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-40"
                style={{
                  background: "linear-gradient(135deg,rgba(57,255,126,0.2),rgba(0,200,100,0.1))",
                  border: "1px solid rgba(57,255,126,0.45)",
                  color: "#39ff7e",
                  boxShadow: "0 0 20px rgba(57,255,126,0.12)",
                }}>
                <Plus size={16}/> Crear Animal y Agregar a Pesaje
              </button>
            </div>
          </div>
        </TabsContent>

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 3: CALCULADORA DE LOTE
        ══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="lote" className="mt-4">
          <div className="max-w-2xl mx-auto space-y-4">

            {/* Banner */}
            <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg,#1a0d00,#2e1a00)", border: "1px solid rgba(255,149,0,0.3)" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: "rgba(255,149,0,0.1)", border: "1px solid rgba(255,149,0,0.3)" }}>
                  🐂
                </div>
                <div>
                  <div className="font-black text-white" style={{ fontFamily: "Sora,sans-serif" }}>Calculadora de Lote</div>
                  <div className="text-xs" style={{ color: "rgba(255,149,0,0.7)" }}>
                    Peso total del lote · Promedio por animal · Valor comercial total
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-5 space-y-4"
              style={{ background: "rgba(255,149,0,0.03)", border: "1px solid rgba(255,149,0,0.15)" }}>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Cantidad animales */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1"
                    style={{ color: "rgba(255,149,0,0.6)" }}>
                    <Users size={10}/> Cantidad animales
                  </label>
                  <Input type="number" min="1" value={loteCantidad} onChange={e => setLoteCantidad(e.target.value)}
                    placeholder="Ej: 15"
                    className="h-10 text-sm text-center font-mono"
                    style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,149,0,0.25)", color: "white" }}/>
                </div>

                {/* Peso total */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1"
                    style={{ color: "rgba(255,149,0,0.6)" }}>
                    <Scale size={10}/> Peso total lote (kg)
                  </label>
                  <Input type="number" min="0" step="0.5" value={lotePesoTotal} onChange={e => setLotePesoTotal(e.target.value)}
                    placeholder="Ej: 6850"
                    className="h-10 text-sm text-center font-mono"
                    style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,149,0,0.25)", color: "white" }}/>
                  {done > 0 && (
                    <button
                      onClick={() => setLotePesoTotal(String(sessionLog.reduce((s,r) => s + r.peso, 0).toFixed(1)))}
                      className="w-full text-[9px] py-1 rounded-lg font-bold"
                      style={{ background: "rgba(192,132,252,0.08)", border: "1px solid rgba(192,132,252,0.2)", color: "#c084fc" }}>
                      ↓ Usar peso de sesión actual ({sessionLog.reduce((s,r) => s+r.peso,0).toFixed(1)} kg)
                    </button>
                  )}
                </div>

                {/* Precio por kg */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1"
                    style={{ color: "rgba(255,149,0,0.6)" }}>
                    <DollarSign size={10}/> Precio / kg (COP)
                  </label>
                  <Input type="number" min="0" step="500" value={lotePrecioKg} onChange={e => setLotePrecioKg(e.target.value)}
                    placeholder="Ej: 11000"
                    className="h-10 text-sm text-center font-mono"
                    style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,149,0,0.25)", color: "white" }}/>
                </div>
              </div>

              {/* Resultados en tiempo real */}
              <div className="h-px" style={{ background: "rgba(255,149,0,0.15)" }}/>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Peso promedio */}
                <div className="rounded-2xl p-4 text-center"
                  style={{ background: "rgba(0,200,255,0.06)", border: "1px solid rgba(0,200,255,0.2)" }}>
                  <div className="text-[9px] font-black uppercase tracking-wider mb-2" style={{ color: "rgba(0,200,255,0.5)" }}>
                    ⚖️ Peso Promedio Animal
                  </div>
                  <div className="font-black text-3xl" style={{ color: "#00c8ff", fontFamily: "JetBrains Mono,monospace" }}>
                    {lotePromedio === "—" ? "—" : lotePromedio}
                  </div>
                  <div className="text-xs mt-1" style={{ color: "rgba(0,200,255,0.4)" }}>kg / animal</div>
                  <div className="text-[8px] mt-2" style={{ color: "rgba(0,200,255,0.25)" }}>
                    = Peso total ÷ Cantidad
                  </div>
                </div>

                {/* Total lote en peso */}
                <div className="rounded-2xl p-4 text-center"
                  style={{ background: "rgba(192,132,252,0.06)", border: "1px solid rgba(192,132,252,0.2)" }}>
                  <div className="text-[9px] font-black uppercase tracking-wider mb-2" style={{ color: "rgba(192,132,252,0.5)" }}>
                    📦 Peso Total Lote
                  </div>
                  <div className="font-black text-3xl" style={{ color: "#c084fc", fontFamily: "JetBrains Mono,monospace" }}>
                    {lotePesoTotal || "—"}
                  </div>
                  <div className="text-xs mt-1" style={{ color: "rgba(192,132,252,0.4)" }}>kilogramos</div>
                  <div className="text-[8px] mt-2" style={{ color: "rgba(192,132,252,0.25)" }}>
                    {loteCantidad ? `${loteCantidad} animales` : "ingresa cantidad"}
                  </div>
                </div>

                {/* Valor total lote */}
                <div className="rounded-2xl p-4 text-center"
                  style={{ background: "rgba(57,255,126,0.06)", border: "1px solid rgba(57,255,126,0.25)" }}>
                  <div className="text-[9px] font-black uppercase tracking-wider mb-2" style={{ color: "rgba(57,255,126,0.5)" }}>
                    💰 Valor Total Lote
                  </div>
                  <div className="font-black text-2xl" style={{ color: "#39ff7e", fontFamily: "Sora,sans-serif" }}>
                    {loteValorTotal > 0 ? fmt(loteValorTotal) : "—"}
                  </div>
                  <div className="text-xs mt-1" style={{ color: "rgba(57,255,126,0.4)" }}>COP</div>
                  <div className="text-[8px] mt-2" style={{ color: "rgba(57,255,126,0.25)" }}>
                    = Peso total × Precio/kg
                  </div>
                </div>
              </div>

              {/* Fórmulas */}
              <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="text-[9px] font-black uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.25)" }}>
                  📐 Fórmulas aplicadas
                </div>
                <div className="grid grid-cols-2 gap-2 text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                  <div>
                    <span className="font-mono" style={{ color: "rgba(0,200,255,0.6)" }}>pesoPromedio</span>
                    {" = pesoTotal ÷ cantidad"}
                  </div>
                  <div>
                    <span className="font-mono" style={{ color: "rgba(57,255,126,0.6)" }}>valorTotal</span>
                    {" = pesoTotal × precio/kg"}
                  </div>
                </div>
              </div>

              {/* Botón imprimir cálculo */}
              {loteValorTotal > 0 && (
                <button
                  onClick={() => {
                    const w = window.open("", "_blank", "width=480,height=600");
                    if (!w) return;
                    w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Cálculo Lote</title>
                    <style>body{font-family:Segoe UI,sans-serif;padding:24px;color:#111}h2{text-align:center;margin-bottom:16px}
                    table{width:100%;border-collapse:collapse;font-size:13px}td{padding:8px 12px;border-bottom:1px solid #eee}
                    td:first-child{font-weight:700;color:#555;width:200px}.big{font-size:28px;font-weight:900;color:#16a34a}
                    .footer{margin-top:20px;font-size:9px;color:#ccc;text-align:center}@media print{button{display:none}}</style>
                    </head><body><h2>🐂 Cálculo de Lote — CIVAC PRO</h2>
                    <table><tbody>
                    <tr><td>Cantidad animales</td><td><strong>${loteCantidad}</strong></td></tr>
                    <tr><td>Peso total lote</td><td><strong>${lotePesoTotal} kg</strong></td></tr>
                    <tr><td>Peso promedio/animal</td><td><strong>${lotePromedio} kg</strong></td></tr>
                    <tr><td>Precio por kg</td><td>${new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(Number(lotePrecioKg))}</td></tr>
                    <tr><td>VALOR TOTAL LOTE</td><td><span class="big">${new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(loteValorTotal)}</span></td></tr>
                    </tbody></table>
                    <div class="footer">CIVAC PRO v3.0 · GanaderIA Colombia · ${new Date().toLocaleDateString("es-CO")}</div>
                    <script>window.onload=function(){window.print();setTimeout(function(){window.close()},900)}<\/script>
                    </body></html>`);
                    w.document.close();
                  }}
                  className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                  style={{ background: "rgba(255,149,0,0.12)", border: "1px solid rgba(255,149,0,0.35)", color: "#ff9500" }}>
                  <Printer size={14}/> Imprimir Cálculo de Lote
                </button>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
