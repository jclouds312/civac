import { useState, useRef, useEffect, useCallback } from "react";
import { useAppState } from "../lib/data";
import { useAuth } from "../lib/auth";
import {
  Camera, MapPin, Scale, Zap, Brain, Printer, Share2,
  ChevronRight, ChevronLeft, CheckCircle2, RotateCcw, X,
  Bluetooth, Upload, Search, TrendingUp, TrendingDown,
  DollarSign, Activity, AlertCircle, Navigation,
  Plus, Check, Clock, BarChart3, List,
} from "lucide-react";
import { Input } from "@/components/ui/input";

// ── Types ────────────────────────────────────────────────────────────────────
type Step = 'select' | 'camera' | 'weight' | 'review';
interface GpsCoords { lat: number; lng: number; acc: number; ts: number }
interface SessionEntry {
  id: string; nombre: string; raza: string; cat: string; lote: string;
  peso: number; pesoPrev: number; cc: string; valor: number;
  hora: string; foto: boolean; gps: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const PESOS_REF: Record<string, Record<string, number>> = {
  Holstein:     { "Vaca adulta": 560, Novilla: 380, Ternero: 180, Ternera: 170, Toro: 700 },
  Brahman:      { "Vaca adulta": 490, Novilla: 320, Ternero: 175, Ternera: 165, Toro: 720 },
  Simmental:    { "Vaca adulta": 600, Novilla: 400, Ternero: 210, Ternera: 195, Toro: 800 },
  Angus:        { "Vaca adulta": 580, Novilla: 370, Ternero: 195, Ternera: 180, Toro: 780 },
  Cebu:         { "Vaca adulta": 490, Novilla: 320, Ternero: 175, Ternera: 165, Toro: 720 },
  "Gyr Lechero":{ "Vaca adulta": 470, Novilla: 310, Ternero: 160, Ternera: 155, Toro: 680 },
  Normando:     { "Vaca adulta": 610, Novilla: 410, Ternero: 215, Ternera: 200, Toro: 820 },
  "Gyr X":      { "Vaca adulta": 470, Novilla: 305, Ternero: 162, Ternera: 156, Toro: 690 },
  Jersey:       { "Vaca adulta": 400, Novilla: 250, Ternero: 130, Ternera: 120, Toro: 580 },
};

const CAT_META: Record<string, { emoji: string; color: string; glow: string }> = {
  "Vaca adulta": { emoji: "🐄", color: "#00f5d4", glow: "0,245,212" },
  Novilla:       { emoji: "🐮", color: "#a78bfa", glow: "167,139,250" },
  Ternero:       { emoji: "🐂", color: "#fbbf24", glow: "251,191,36" },
  Ternera:       { emoji: "🐃", color: "#f472b6", glow: "244,114,182" },
  Toro:          { emoji: "🦬", color: "#f87171", glow: "248,113,113" },
};

const CC_OPTS = [
  { val: "1.0", emoji: "💀", label: "Muy delgada",  color: "#f87171" },
  { val: "2.0", emoji: "😟", label: "Bajo normal",  color: "#fbbf24" },
  { val: "3.0", emoji: "😊", label: "Ideal",        color: "#a3e635" },
  { val: "3.5", emoji: "🌟", label: "Buena",        color: "#39ff7e" },
  { val: "4.0", emoji: "✅", label: "Alta",          color: "#34d399" },
  { val: "5.0", emoji: "🚨", label: "Obesa",        color: "#f87171" },
];

const LOTE_COLORS: Record<string, string> = {
  "Lote A": "#00f5d4", "Lote B": "#ff6fd8", "Lote C": "#fbbf24",
  "Lote D": "#39ff7e", "Lote E": "#00c8ff", "Lote F": "#f472b6",
};

const PIÑA  = '#FFD60A';
const GREEN = '#00C896';

const fmt = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

// ── Main Component ────────────────────────────────────────────────────────────
export default function PesajeManual() {
  const { animals, setAnimals, setPesajes } = useAppState();
  const { user } = useAuth();

  // ── Wizard ───────────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>('select');
  const [animal, setAnimal] = useState<typeof animals[0] | null>(null);
  const [searchQ, setSearchQ] = useState('');
  const [loteFilter, setLoteFilter] = useState('Todos');
  const [savedOk, setSavedOk] = useState(false);

  // ── Camera ───────────────────────────────────────────────────────────────
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [cameraMode, setCameraMode] = useState<'idle' | 'live' | 'captured'>('idle');
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── GPS ──────────────────────────────────────────────────────────────────
  const [gps, setGps] = useState<GpsCoords | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');

  // ── Weight ───────────────────────────────────────────────────────────────
  const [peso, setPeso] = useState('');
  const [cc, setCC] = useState('3.0');
  const [valorKilo, setValorKilo] = useState('11000');
  const [obs, setObs] = useState('');
  const [btLoading, setBtLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // ── Session log ───────────────────────────────────────────────────────────
  const [sessionLog, setSessionLog] = useState<SessionEntry[]>([]);

  // ── Attach stream to video element ────────────────────────────────────────
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream, cameraMode]);

  // Cleanup on unmount
  useEffect(() => () => { stream?.getTracks().forEach(t => t.stop()); }, [stream]);

  // ── Filtered animals ──────────────────────────────────────────────────────
  const filteredAnimals = animals.filter(a => {
    const q = searchQ.toLowerCase();
    const match = !q || a.nombre.toLowerCase().includes(q) || a.id.toLowerCase().includes(q) || a.raza.toLowerCase().includes(q);
    const loteOk = loteFilter === 'Todos' || a.lote === loteFilter;
    return match && loteOk;
  });
  const lotes = ['Todos', ...Array.from(new Set(animals.map(a => a.lote)))];

  // ── Camera handlers ───────────────────────────────────────────────────────
  const openCamera = useCallback(async () => {
    setCameraError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Su navegador no soporta cámara. Use "Subir foto".');
      return;
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      setStream(s);
      setCameraMode('live');
    } catch (err: unknown) {
      const e = err as { name?: string };
      if (e?.name === 'NotAllowedError') {
        setCameraError('Permiso de cámara denegado. Active el acceso en Configuración del navegador.');
      } else if (e?.name === 'NotFoundError') {
        setCameraError('No se detectó cámara en este dispositivo. Use "Subir foto".');
      } else {
        setCameraError('No se pudo abrir la cámara. Intente con "Subir foto".');
      }
    }
  }, []);

  const capturePhoto = useCallback(() => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) return;
    c.width = v.videoWidth || 640;
    c.height = v.videoHeight || 480;
    c.getContext('2d')?.drawImage(v, 0, 0);
    setPhoto(c.toDataURL('image/jpeg', 0.85));
    setCameraMode('captured');
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
  }, [stream]);

  const retakePhoto = useCallback(async () => {
    setPhoto(null);
    await openCamera();
  }, [openCamera]);

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
    setCameraMode('idle');
  }, [stream]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setPhoto(ev.target?.result as string);
      setCameraMode('captured');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // ── GPS ───────────────────────────────────────────────────────────────────
  const captureGPS = useCallback(() => {
    if (!navigator.geolocation) { setGpsError('GPS no disponible en este dispositivo'); return; }
    setGpsLoading(true); setGpsError('');
    navigator.geolocation.getCurrentPosition(
      pos => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude, acc: Math.round(pos.coords.accuracy), ts: Date.now() });
        setGpsLoading(false);
      },
      err => { setGpsError(err.code === 1 ? 'Permiso GPS denegado — active en su navegador' : 'Error al obtener ubicación'); setGpsLoading(false); },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    );
  }, []);

  // ── BT simulation ─────────────────────────────────────────────────────────
  const btSim = useCallback(() => {
    if (!animal) return;
    setBtLoading(true);
    const base = PESOS_REF[animal.raza]?.[animal.categoria] || animal.peso;
    setTimeout(() => { setPeso(String(+(base * (0.92 + Math.random() * 0.16)).toFixed(1))); setBtLoading(false); }, 1800);
  }, [animal]);

  // ── AI estimation ─────────────────────────────────────────────────────────
  const aiEstimate = useCallback(() => {
    if (!animal) return;
    setAiLoading(true);
    setTimeout(() => {
      const base = PESOS_REF[animal.raza]?.[animal.categoria] || animal.peso;
      const ccFactor = 0.85 + (Number(cc) / 5) * 0.30;
      setPeso(String(+(base * ccFactor * (0.96 + Math.random() * 0.08)).toFixed(1)));
      setAiLoading(false);
    }, photo ? 2500 : 1800);
  }, [animal, cc, photo]);

  // ── Weight adjustment ─────────────────────────────────────────────────────
  const adjustPeso = (delta: number) => {
    const cur = Number(peso) || (animal ? PESOS_REF[animal.raza]?.[animal.categoria] || animal.peso : 0);
    setPeso(String(Math.max(1, +(cur + delta).toFixed(1))));
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const savePesaje = useCallback(() => {
    if (!animal || !peso) return;
    const pesoN = Number(peso);
    const now = new Date();
    const hora = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    const pesaje = {
      id: Date.now(), animalId: animal.id, animalNombre: animal.nombre,
      peso: pesoN, pesoAnterior: animal.peso,
      fecha: now.toLocaleDateString('es-CO'), hora,
      metodo: 'automatizado', dispositivo: gps ? `GPS ±${gps.acc}m` : '',
      operador: user?.nombre || 'Admin',
      observacion: [
        `CC: ${cc}`,
        obs || '',
        photo ? '📷 Foto' : '',
        gps ? `📡 GPS ${gps.lat.toFixed(4)},${gps.lng.toFixed(4)}` : '',
      ].filter(Boolean).join(' | '),
      lote: animal.lote, categoria: animal.categoria,
    };
    setPesajes(p => [pesaje, ...p]);
    setAnimals(p => p.map(a => a.id === animal.id
      ? { ...a, peso: pesoN, valorKilo: Number(valorKilo) || a.valorKilo } : a));
    setSessionLog(prev => [{
      id: animal.id, nombre: animal.nombre, raza: animal.raza,
      cat: animal.categoria, lote: animal.lote,
      peso: pesoN, pesoPrev: animal.peso,
      cc, valor: pesoN * (Number(valorKilo) || 0), hora,
      foto: !!photo, gps: !!gps,
    }, ...prev]);
    setSavedOk(true);
    setTimeout(() => setSavedOk(false), 3500);
  }, [animal, peso, cc, valorKilo, obs, photo, gps, user, setPesajes, setAnimals]);

  // ── Print receipt ─────────────────────────────────────────────────────────
  const printReceipt = useCallback(() => {
    if (!animal) return;
    const pesoN = Number(peso) || 0;
    const diff = pesoN - animal.peso;
    const ccInfo = CC_OPTS.find(c => c.val === cc);
    const vt = pesoN * (Number(valorKilo) || 0);
    const now = new Date();
    const w = window.open('', '_blank', 'width=540,height=820');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Recibo — ${animal.nombre}</title>
      <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',sans-serif;background:#fff;color:#111;padding:24px}.logo{font-size:32px;text-align:center;margin-bottom:4px}h2{text-align:center;font-size:15px;font-weight:900;letter-spacing:1px;text-transform:uppercase;margin-bottom:2px}.sub{text-align:center;font-size:10px;color:#888;margin-bottom:18px}.big{text-align:center;padding:20px;font-size:52px;font-weight:900;letter-spacing:4px;border:3px solid #111;border-radius:16px;background:#f9f9f9;margin:14px 0}.diff{font-size:18px;font-weight:700;color:${diff>=0?'#22c55e':'#ef4444'}}table{width:100%;border-collapse:collapse;font-size:12px;margin-top:12px}td{padding:7px 10px;border-bottom:1px solid #eee}td:first-child{font-weight:700;color:#555;width:160px}.badge{display:inline-block;padding:3px 10px;border-radius:20px;font-weight:700;font-size:11px;background:#f0fdf4;border:1px solid #22c55e;color:#16a34a}.footer{margin-top:16px;font-size:9px;color:#ccc;text-align:center;border-top:1px solid #eee;padding-top:8px}@media print{button{display:none}}</style>
      </head><body>
      <div class="logo">🐄</div>
      <h2>CIVAC PRO · Pesaje con Cámara y GPS</h2>
      <div class="sub">${now.toLocaleDateString('es-CO',{weekday:'long',year:'numeric',month:'long',day:'numeric'})} · ${now.toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})}</div>
      <div class="big">${pesoN.toFixed(1)} <span style="font-size:22px;color:#777">kg</span><br/><span class="diff">${diff>=0?'+':''}${diff.toFixed(1)} kg</span></div>
      <table><tbody>
        <tr><td>Animal</td><td><strong>${animal.nombre}</strong></td></tr>
        <tr><td>Arete / ID</td><td>#${animal.id}</td></tr>
        <tr><td>Raza</td><td>${animal.raza}</td></tr>
        <tr><td>Categoría</td><td>${animal.categoria}</td></tr>
        <tr><td>Lote</td><td>${animal.lote}</td></tr>
        <tr><td>Peso anterior</td><td>${animal.peso} kg</td></tr>
        <tr><td>Peso registrado</td><td><strong>${pesoN.toFixed(1)} kg</strong></td></tr>
        <tr><td>Ref. raza</td><td>${PESOS_REF[animal.raza]?.[animal.categoria] || '—'} kg</td></tr>
        <tr><td>Cond. Corporal</td><td><span class="badge">${ccInfo?.emoji} CC ${cc} — ${ccInfo?.label}</span></td></tr>
        ${vt > 0 ? `<tr><td>Valor estimado</td><td><strong>${fmt(vt)}</strong></td></tr>` : ''}
        ${obs ? `<tr><td>Observaciones</td><td>${obs}</td></tr>` : ''}
        ${gps ? `<tr><td>Ubicación GPS</td><td>📡 ${gps.lat.toFixed(5)}, ${gps.lng.toFixed(5)} ±${gps.acc}m</td></tr>` : ''}
        <tr><td>Operador</td><td>${user?.nombre || 'Admin'}</td></tr>
      </tbody></table>
      ${photo ? `<div style="margin-top:14px;text-align:center"><div style="font-size:10px;font-weight:700;color:#555;margin-bottom:6px">Evidencia fotográfica</div><img src="${photo}" style="max-width:280px;border-radius:8px;border:1px solid #eee"/></div>` : ''}
      <div class="footer">CIVAC PRO v4.0 · GanaderIA Colombia · Pesaje Automatizado</div>
      <script>window.onload=function(){window.print();setTimeout(function(){window.close()},900)}<\/script>
      </body></html>`);
    w.document.close();
  }, [animal, peso, cc, valorKilo, obs, photo, gps, user]);

  // ── Share WhatsApp ────────────────────────────────────────────────────────
  const shareWA = useCallback(() => {
    if (!animal) return;
    const pesoN = Number(peso) || 0;
    const diff = pesoN - animal.peso;
    const now = new Date();
    const msg = encodeURIComponent(
      `🐄 *Pesaje CIVAC PRO*\n\n` +
      `Animal: *${animal.nombre}* (#${animal.id})\n` +
      `${animal.raza} · ${animal.categoria} · ${animal.lote}\n\n` +
      `⚖️ Peso: *${pesoN.toFixed(1)} kg*\n` +
      `${diff >= 0 ? '📈' : '📉'} Cambio: ${diff >= 0 ? '+' : ''}${diff.toFixed(1)} kg\n` +
      `CC: ${cc}\n` +
      (gps ? `📡 GPS: ${gps.lat.toFixed(5)}, ${gps.lng.toFixed(5)} ±${gps.acc}m\n` : '') +
      `\n📅 ${now.toLocaleDateString('es-CO')} ${now.toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})}\n` +
      `Operador: ${user?.nombre || 'Admin'} — GanaderIA CIVAC PRO`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  }, [animal, peso, cc, gps, user]);

  // ── Navigation between animals ────────────────────────────────────────────
  const nextAnimal = () => {
    const idx = animal ? animals.findIndex(a => a.id === animal.id) : -1;
    const weighed = new Set(sessionLog.map(s => s.id));
    const next = animals.find((a, i) => i > idx && !weighed.has(a.id)) ?? null;
    stopCamera();
    setAnimal(next);
    setPeso(next ? String(next.peso) : '');
    setCC('3.0'); setObs(''); setPhoto(null); setGps(null);
    setCameraMode('idle'); setSavedOk(false); setCameraError(''); setGpsError('');
    setStep(next ? 'camera' : 'select');
  };

  const resetWizard = () => {
    stopCamera();
    setAnimal(null); setPeso(''); setCC('3.0'); setObs('');
    setPhoto(null); setGps(null); setCameraMode('idle');
    setSavedOk(false); setCameraError(''); setGpsError('');
    setStep('select');
  };

  // ── Computed ──────────────────────────────────────────────────────────────
  const pesoN     = Number(peso) || 0;
  const pesoDiff  = animal ? pesoN - animal.peso : 0;
  const pesoRef   = animal ? PESOS_REF[animal.raza]?.[animal.categoria] || animal.peso : 0;
  const pesoPct   = pesoRef > 0 ? Math.min(100, Math.round((pesoN / pesoRef) * 100)) : 0;
  const valorTotal = pesoN * (Number(valorKilo) || 0);
  const catMeta   = animal ? (CAT_META[animal.categoria] || CAT_META['Vaca adulta']) : null;
  const weighed   = new Set(sessionLog.map(s => s.id));

  // ── Step indicator ────────────────────────────────────────────────────────
  const STEPS = [
    { id: 'select', icon: '🐄', label: 'Animal' },
    { id: 'camera', icon: '📷', label: 'Foto & GPS' },
    { id: 'weight', icon: '⚖️', label: 'Peso' },
    { id: 'review', icon: '✅', label: 'Confirmar' },
  ];
  const stepIdx = STEPS.findIndex(s => s.id === step);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 pb-10" style={{ fontFamily: "'Space Grotesk','Sora',sans-serif" }}>
      {/* ── Banner ── */}
      <div className="rounded-2xl p-5 relative overflow-hidden module-banner"
        style={{ background:'linear-gradient(135deg,#0a001f,#180038,#24005e)', border:'1px solid rgba(192,132,252,0.4)', boxShadow:'0 0 60px rgba(192,132,252,0.12)' }}>
        <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full opacity-15 pointer-events-none"
          style={{ background:'radial-gradient(circle,#c084fc,transparent)' }}/>
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{ background:'linear-gradient(135deg,rgba(192,132,252,0.25),rgba(124,58,237,0.15))', border:'1px solid rgba(192,132,252,0.5)', boxShadow:'0 0 30px rgba(192,132,252,0.35)' }}>
              ⚡
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white" style={{ fontFamily:"'Sora',sans-serif" }}>
                Pesaje <span style={{ color:PIÑA }}>Automatizado PRO</span>
              </h1>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {[
                  { icon: <Camera size={10}/>, label:'Cámara Real', c:'#c084fc' },
                  { icon: <MapPin size={10}/>, label:'GPS Real', c:'#39ff7e' },
                  { icon: <Bluetooth size={10}/>, label:'Báscula BT', c:'#00c8ff' },
                  { icon: <Brain size={10}/>, label:'IA Peso', c:PIÑA },
                ].map(b => (
                  <div key={b.label} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background:`${b.c}15`, border:`1px solid ${b.c}35`, color:b.c }}>
                    {b.icon}{b.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="px-3 py-2 rounded-xl text-center" style={{ background:'rgba(0,200,150,0.12)', border:'1px solid rgba(0,200,150,0.3)' }}>
              <div className="font-black text-xl" style={{ color:GREEN }}>{sessionLog.length}</div>
              <div className="text-[9px]" style={{ color:'rgba(0,200,150,0.6)' }}>pesados</div>
            </div>
            <div className="px-3 py-2 rounded-xl text-center" style={{ background:'rgba(255,214,10,0.1)', border:'1px solid rgba(255,214,10,0.25)' }}>
              <div className="font-black text-xl" style={{ color:PIÑA }}>{animals.length - sessionLog.length}</div>
              <div className="text-[9px]" style={{ color:'rgba(255,214,10,0.55)' }}>pendientes</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ── Wizard column ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* ── Step indicator ── */}
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => {
              const done   = i < stepIdx;
              const active = i === stepIdx;
              return (
                <div key={s.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center" style={{ minWidth: 56 }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-black transition-all duration-200"
                      style={{
                        background: done ? GREEN : active ? PIÑA : 'rgba(255,255,255,0.06)',
                        border: `2px solid ${done ? GREEN : active ? PIÑA : 'rgba(255,255,255,0.12)'}`,
                        color: done || active ? '#000' : 'rgba(255,255,255,0.3)',
                        boxShadow: active ? `0 0 20px ${PIÑA}88` : done ? `0 0 14px ${GREEN}66` : 'none',
                        fontSize: done ? 14 : undefined,
                      }}>
                      {done ? <Check size={16} strokeWidth={3}/> : s.icon}
                    </div>
                    <div className="text-[9px] font-bold mt-1 leading-none"
                      style={{ color: active ? PIÑA : done ? GREEN : 'rgba(255,255,255,0.25)' }}>
                      {s.label}
                    </div>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 mx-1 rounded-full transition-all duration-300"
                      style={{ background: i < stepIdx ? GREEN : 'rgba(255,255,255,0.08)' }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              STEP 1 — SELECT ANIMAL
          ═══════════════════════════════════════════════════════════════ */}
          {step === 'select' && (
            <div className="rounded-2xl overflow-hidden"
              style={{ background:'rgba(8,20,48,0.95)', border:'1px solid rgba(50,120,255,0.18)', boxShadow:'0 8px 40px rgba(0,0,0,0.35)' }}>
              {/* Search */}
              <div className="p-4 border-b" style={{ borderColor:'rgba(50,120,255,0.12)' }}>
                <div className="relative mb-3">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'rgba(255,255,255,0.35)' }}/>
                  <input
                    className="w-full pl-9 pr-4 py-3 rounded-xl text-white text-sm font-medium placeholder-white/25 outline-none"
                    style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', fontFamily:"'Space Grotesk',sans-serif" }}
                    placeholder="Buscar por nombre, arete o raza..."
                    value={searchQ}
                    onChange={e => setSearchQ(e.target.value)}
                    autoFocus
                  />
                </div>
                {/* Lote filters */}
                <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                  {lotes.map(l => (
                    <button key={l} onClick={() => setLoteFilter(l)}
                      className="flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all"
                      style={loteFilter === l
                        ? { background:`${LOTE_COLORS[l] || PIÑA}20`, color:LOTE_COLORS[l] || PIÑA, border:`1px solid ${LOTE_COLORS[l] || PIÑA}50`, boxShadow:`0 0 10px ${LOTE_COLORS[l] || PIÑA}30` }
                        : { background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.4)', border:'1px solid rgba(255,255,255,0.08)' }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              {/* Animal list */}
              <div className="overflow-y-auto" style={{ maxHeight: 460 }}>
                {filteredAnimals.length === 0 ? (
                  <div className="text-center py-16 text-white/25">
                    <Scale size={40} className="mx-auto mb-3 opacity-20" />
                    <p>No se encontraron animales</p>
                  </div>
                ) : (
                  <div className="divide-y" style={{ borderColor:'rgba(255,255,255,0.04)' }}>
                    {filteredAnimals.map(a => {
                      const m = CAT_META[a.categoria] || CAT_META['Vaca adulta'];
                      const done = weighed.has(a.id);
                      return (
                        <button key={a.id} onClick={() => { setAnimal(a); setPeso(String(a.peso)); setStep('camera'); }}
                          className="w-full flex items-center gap-4 px-5 py-4 text-left transition-all group hover:bg-white/[0.025] active:scale-[0.995]"
                          disabled={done}>
                          {/* Category icon */}
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform group-hover:scale-110"
                            style={{ background:`rgba(${m.glow},0.12)`, border:`2px solid rgba(${m.glow},0.35)`, boxShadow: done ? 'none' : `0 0 16px rgba(${m.glow},0.18)`, opacity: done ? 0.4 : 1 }}>
                            {done ? '✅' : m.emoji}
                          </div>
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-black text-base leading-none" style={{ color: done ? 'rgba(255,255,255,0.3)' : 'white' }}>
                                {a.nombre}
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.35)' }}>
                                #{a.id}
                              </span>
                              {done && <span className="text-[9px] font-bold" style={{ color:GREEN }}>✓ Pesado</span>}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] flex-wrap">
                              <span style={{ color:`rgba(${m.glow},0.8)` }}>{a.categoria}</span>
                              <span style={{ color:'rgba(255,255,255,0.3)' }}>·</span>
                              <span style={{ color:'rgba(255,255,255,0.5)' }}>{a.raza}</span>
                              <span className="px-1.5 py-0.5 rounded-full font-semibold" style={{ background:`${LOTE_COLORS[a.lote] || '#888'}15`, color:LOTE_COLORS[a.lote] || '#888', border:`1px solid ${LOTE_COLORS[a.lote] || '#888'}30` }}>
                                {a.lote}
                              </span>
                            </div>
                          </div>
                          {/* Last weight */}
                          <div className="text-right flex-shrink-0">
                            <div className="font-black text-lg" style={{ color: done ? 'rgba(255,255,255,0.25)' : m.color }}>{a.peso}</div>
                            <div className="text-[9px]" style={{ color:'rgba(255,255,255,0.25)' }}>kg anterior</div>
                          </div>
                          <ChevronRight size={18} style={{ color:'rgba(255,255,255,0.15)', flexShrink:0 }} className="group-hover:translate-x-1 transition-transform"/>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              {/* Footer */}
              <div className="px-5 py-3 border-t flex items-center justify-between text-xs"
                style={{ borderColor:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.3)' }}>
                <span>{filteredAnimals.length} animales · {animals.length - weighed.size} sin pesar</span>
                <span>{weighed.size} pesados hoy</span>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              STEP 2 — CAMERA + GPS
          ═══════════════════════════════════════════════════════════════ */}
          {step === 'camera' && animal && (
            <div className="space-y-3">
              {/* Animal header */}
              <div className="rounded-xl px-4 py-3 flex items-center gap-3"
                style={{ background:'rgba(8,20,48,0.95)', border:'1px solid rgba(50,120,255,0.18)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background:`rgba(${catMeta!.glow},0.12)`, border:`1px solid rgba(${catMeta!.glow},0.3)` }}>
                  {catMeta!.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-base text-white leading-tight">{animal.nombre}</p>
                  <p className="text-[11px]" style={{ color:`rgba(${catMeta!.glow},0.7)` }}>{animal.categoria} · {animal.raza} · {animal.lote}</p>
                </div>
                <button onClick={resetWizard} className="text-white/25 hover:text-white/60 transition-colors p-1.5 rounded-lg hover:bg-white/5">
                  <X size={16}/>
                </button>
              </div>

              {/* Camera section */}
              <div className="rounded-2xl overflow-hidden"
                style={{ background:'rgba(8,20,48,0.95)', border:'1px solid rgba(50,120,255,0.18)' }}>
                <div className="px-5 pt-4 pb-2 flex items-center gap-2">
                  <Camera size={16} style={{ color:'#c084fc' }}/>
                  <span className="font-black text-sm text-white">Foto del Animal</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full ml-auto" style={{ background:'rgba(192,132,252,0.1)', color:'#c084fc', border:'1px solid rgba(192,132,252,0.25)' }}>
                    Opcional — mejora precisión IA
                  </span>
                </div>

                {/* Camera states */}
                {cameraMode === 'idle' && (
                  <div className="px-5 pb-5 space-y-3">
                    {cameraError && (
                      <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-sm"
                        style={{ background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.2)', color:'#f87171' }}>
                        <AlertCircle size={14} className="flex-shrink-0 mt-0.5"/>{cameraError}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={openCamera}
                        className="flex flex-col items-center gap-3 py-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{ background:'linear-gradient(135deg,rgba(192,132,252,0.12),rgba(124,58,237,0.06))', border:'2px solid rgba(192,132,252,0.35)', boxShadow:'0 0 20px rgba(192,132,252,0.1)' }}>
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                          style={{ background:'linear-gradient(135deg,#c084fc,#7c3aed)', boxShadow:'0 0 24px rgba(192,132,252,0.55)', color:'#000' }}>
                          <Camera size={26} strokeWidth={2.5}/>
                        </div>
                        <div className="text-center">
                          <div className="font-black text-sm text-white">Abrir Cámara</div>
                          <div className="text-[10px] mt-0.5" style={{ color:'rgba(192,132,252,0.6)' }}>Foto en tiempo real</div>
                        </div>
                      </button>
                      <button onClick={() => fileRef.current?.click()}
                        className="flex flex-col items-center gap-3 py-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{ background:'rgba(255,255,255,0.04)', border:'2px solid rgba(255,255,255,0.12)' }}>
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                          style={{ background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.5)' }}>
                          <Upload size={26} strokeWidth={2}/>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-sm text-white/60">Subir Foto</div>
                          <div className="text-[10px] mt-0.5 text-white/30">Desde galería</div>
                        </div>
                      </button>
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload}/>
                  </div>
                )}

                {cameraMode === 'live' && (
                  <div className="relative">
                    <video ref={videoRef} playsInline muted
                      className="w-full max-h-[320px] object-cover bg-black"
                      style={{ display:'block' }}/>
                    <canvas ref={canvasRef} className="hidden"/>
                    {/* Overlay guide */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-36 border-2 rounded-xl opacity-60" style={{ borderColor:PIÑA, boxShadow:`0 0 0 2000px rgba(0,0,0,0.25)` }}/>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 p-4 flex items-center justify-center gap-4"
                      style={{ background:'linear-gradient(to top,rgba(0,0,0,0.7),transparent)' }}>
                      <button onClick={stopCamera} className="w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
                        style={{ background:'rgba(0,0,0,0.5)', border:'1px solid rgba(255,255,255,0.2)' }}>
                        <X size={18}/>
                      </button>
                      <button onClick={capturePhoto}
                        className="w-18 h-18 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                        style={{ width:68, height:68, background:'white', boxShadow:'0 0 0 4px rgba(255,255,255,0.3)', border:'none' }}>
                        <div className="w-14 h-14 rounded-full" style={{ background:`linear-gradient(135deg,${PIÑA},#F59E0B)` }}/>
                      </button>
                      <div className="w-10 h-10"/>
                    </div>
                  </div>
                )}

                {cameraMode === 'captured' && photo && (
                  <div className="px-5 pb-5">
                    <div className="relative rounded-xl overflow-hidden">
                      <img src={photo} alt="Foto animal" className="w-full max-h-[260px] object-cover"/>
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button onClick={retakePhoto}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold"
                          style={{ background:'rgba(0,0,0,0.7)', color:'white', border:'1px solid rgba(255,255,255,0.2)' }}>
                          <RotateCcw size={12}/> Retomar
                        </button>
                        <button onClick={() => { setPhoto(null); setCameraMode('idle'); }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ background:'rgba(0,0,0,0.7)', border:'1px solid rgba(255,255,255,0.2)', color:'white' }}>
                          <X size={14}/>
                        </button>
                      </div>
                      <div className="absolute bottom-0 inset-x-0 px-3 py-2"
                        style={{ background:'linear-gradient(to top,rgba(0,0,0,0.7),transparent)' }}>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color:GREEN }}>
                          <CheckCircle2 size={12}/> Foto capturada · IA lista
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* GPS section */}
              <div className="rounded-2xl p-5"
                style={{ background:'rgba(8,20,48,0.95)', border:'1px solid rgba(50,120,255,0.18)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={16} style={{ color:'#39ff7e' }}/>
                  <span className="font-black text-sm text-white">Ubicación GPS</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full ml-auto" style={{ background:'rgba(57,255,126,0.1)', color:'#39ff7e', border:'1px solid rgba(57,255,126,0.25)' }}>
                    Opcional
                  </span>
                </div>
                {gps ? (
                  <div className="rounded-xl p-3 flex items-center gap-3"
                    style={{ background:'rgba(57,255,126,0.06)', border:'1px solid rgba(57,255,126,0.22)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background:'linear-gradient(135deg,#39ff7e,#00c864)', color:'#000' }}>
                      <Navigation size={18} strokeWidth={2.5}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm" style={{ color:'#39ff7e' }}>GPS Capturado ✓</div>
                      <div className="text-[10px] font-mono" style={{ color:'rgba(57,255,126,0.6)' }}>
                        {gps.lat.toFixed(5)}, {gps.lng.toFixed(5)}
                      </div>
                      <div className="text-[9px]" style={{ color:'rgba(57,255,126,0.4)' }}>Precisión: ±{gps.acc}m</div>
                    </div>
                    <button onClick={() => setGps(null)} className="text-white/25 hover:text-white/50 transition-colors">
                      <X size={14}/>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {gpsError && (
                      <div className="flex items-start gap-2 px-3 py-2 rounded-xl text-xs"
                        style={{ background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.2)', color:'#f87171' }}>
                        <AlertCircle size={12} className="flex-shrink-0 mt-0.5"/>{gpsError}
                      </div>
                    )}
                    <button onClick={captureGPS} disabled={gpsLoading}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
                      style={{ background:'rgba(57,255,126,0.08)', border:'2px solid rgba(57,255,126,0.3)', color:'#39ff7e' }}>
                      {gpsLoading ? (
                        <><Navigation size={16} className="animate-bounce"/> Obteniendo ubicación...</>
                      ) : (
                        <><MapPin size={16}/> Capturar mi ubicación GPS</>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button onClick={resetWizard}
                  className="flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold transition-all"
                  style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)' }}>
                  <ChevronLeft size={16}/> Volver
                </button>
                <button onClick={() => setStep('weight')}
                  className="flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-black transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background:`linear-gradient(135deg,${PIÑA},#F59E0B)`, color:'#000', boxShadow:`0 0 20px rgba(255,214,10,0.4)` }}>
                  Ingresar Peso <ChevronRight size={16}/>
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              STEP 3 — WEIGHT INPUT
          ═══════════════════════════════════════════════════════════════ */}
          {step === 'weight' && animal && (
            <div className="space-y-3">
              {/* Animal + photo header */}
              <div className="rounded-xl overflow-hidden flex items-center gap-0"
                style={{ background:'rgba(8,20,48,0.95)', border:'1px solid rgba(50,120,255,0.18)' }}>
                {photo && <img src={photo} alt="" className="w-24 h-20 object-cover flex-shrink-0"/>}
                <div className="flex items-center gap-3 px-4 py-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background:`rgba(${catMeta!.glow},0.12)`, border:`1px solid rgba(${catMeta!.glow},0.3)` }}>
                    {catMeta!.emoji}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-base text-white leading-tight truncate">{animal.nombre}</p>
                    <div className="flex gap-2 text-[10px] mt-0.5">
                      <span style={{ color:`rgba(${catMeta!.glow},0.7)` }}>{animal.categoria}</span>
                      {gps && <span style={{ color:'rgba(57,255,126,0.7)' }}>📡 GPS</span>}
                      {photo && <span style={{ color:'rgba(192,132,252,0.7)' }}>📷 Foto</span>}
                    </div>
                  </div>
                  <div className="ml-auto text-right flex-shrink-0">
                    <div className="text-xs text-white/35">Anterior</div>
                    <div className="font-black text-lg" style={{ color:catMeta!.color }}>{animal.peso} kg</div>
                  </div>
                </div>
              </div>

              {/* Big weight display */}
              <div className="rounded-2xl p-6"
                style={{ background:'rgba(8,20,48,0.95)', border:'1px solid rgba(50,120,255,0.18)' }}>
                {/* Weight number */}
                <div className="text-center mb-6">
                  <div className="text-[11px] uppercase tracking-widest mb-2 font-bold" style={{ color:'rgba(255,255,255,0.3)' }}>
                    Peso Actual
                  </div>
                  <div className="flex items-baseline justify-center gap-3 leading-none">
                    <span className="font-black transition-all duration-100"
                      style={{ fontSize: 'clamp(64px,15vw,90px)', fontFamily:"'Sora',monospace", letterSpacing:'-0.03em',
                        color: !pesoN ? 'rgba(255,255,255,0.15)' : pesoDiff > 0 ? '#39ff7e' : pesoDiff < 0 ? '#f87171' : PIÑA,
                        textShadow: pesoN > 0 ? `0 0 40px ${pesoDiff > 0 ? 'rgba(57,255,126,0.5)' : pesoDiff < 0 ? 'rgba(248,113,113,0.5)' : 'rgba(255,214,10,0.5)'}` : 'none'
                      }}>
                      {pesoN > 0 ? pesoN.toFixed(1) : '- - -'}
                    </span>
                    <span className="text-3xl font-bold" style={{ color:'rgba(255,255,255,0.3)' }}>kg</span>
                  </div>
                  {pesoN > 0 && (
                    <div className="flex items-center justify-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-sm font-bold"
                        style={{ color: pesoDiff > 0 ? '#39ff7e' : pesoDiff < 0 ? '#f87171' : 'rgba(255,255,255,0.3)' }}>
                        {pesoDiff > 0 ? <TrendingUp size={14}/> : pesoDiff < 0 ? <TrendingDown size={14}/> : null}
                        {pesoDiff > 0 ? '+' : ''}{pesoDiff.toFixed(1)} kg
                      </span>
                      {pesoRef > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                          style={{ background:`rgba(${catMeta!.glow},0.1)`, color:`rgba(${catMeta!.glow},0.8)`, border:`1px solid rgba(${catMeta!.glow},0.25)` }}>
                          {pesoPct}% del estándar
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* ± Adjustment buttons */}
                <div className="space-y-2 mb-5">
                  <div className="grid grid-cols-4 gap-2">
                    {[+50, +10, +5, +1].map(d => (
                      <button key={d} onClick={() => adjustPeso(d)}
                        className="py-3.5 rounded-xl text-sm font-black transition-all hover:scale-[1.04] active:scale-[0.96]"
                        style={{ background:`rgba(57,255,126,0.08)`, border:`1px solid rgba(57,255,126,0.25)`, color:'#39ff7e', boxShadow:'0 0 10px rgba(57,255,126,0.05)' }}>
                        +{d}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[-1, -5, -10, -50].map(d => (
                      <button key={d} onClick={() => adjustPeso(d)}
                        className="py-3.5 rounded-xl text-sm font-black transition-all hover:scale-[1.04] active:scale-[0.96]"
                        style={{ background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.22)', color:'#f87171' }}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Manual input */}
                <div className="relative mb-4">
                  <input
                    type="number" inputMode="decimal" placeholder="O ingrese el peso exacto en kg..."
                    className="w-full px-4 py-3.5 rounded-xl text-white text-lg font-black text-center outline-none"
                    style={{ background:'rgba(255,255,255,0.06)', border:`2px solid ${PIÑA}30`, fontFamily:"'Sora',monospace", fontSize:22 }}
                    value={peso}
                    onChange={e => setPeso(e.target.value)}
                  />
                  {peso && (
                    <button onClick={() => setPeso('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                      <X size={16}/>
                    </button>
                  )}
                </div>

                {/* AI + BT buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={btSim} disabled={btLoading}
                    className="flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                    style={{ background:'rgba(0,200,255,0.08)', border:'2px solid rgba(0,200,255,0.3)', color:'#00c8ff' }}>
                    <Bluetooth size={16}/>
                    {btLoading ? 'Leyendo BT...' : 'Báscula BT'}
                  </button>
                  <button onClick={aiEstimate} disabled={aiLoading}
                    className="flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                    style={{ background:`rgba(255,214,10,0.08)`, border:`2px solid rgba(255,214,10,0.3)`, color:PIÑA }}>
                    <Brain size={16}/>
                    {aiLoading ? 'IA calculando...' : photo ? 'IA desde foto' : 'IA estimar'}
                  </button>
                </div>
              </div>

              {/* CC + Price */}
              <div className="rounded-2xl p-4 space-y-4"
                style={{ background:'rgba(8,20,48,0.95)', border:'1px solid rgba(50,120,255,0.18)' }}>
                {/* Condition score */}
                <div>
                  <div className="text-xs font-bold mb-2 text-white/50 uppercase tracking-wider">Condición Corporal (CC)</div>
                  <div className="grid grid-cols-6 gap-1.5">
                    {CC_OPTS.map(opt => (
                      <button key={opt.val} onClick={() => setCC(opt.val)}
                        className="flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl transition-all hover:scale-105"
                        style={cc === opt.val
                          ? { background:`${opt.color}20`, border:`2px solid ${opt.color}`, boxShadow:`0 0 14px ${opt.color}50` }
                          : { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
                        <span className="text-base leading-none">{opt.emoji}</span>
                        <span className="text-[8px] font-bold" style={{ color: cc === opt.val ? opt.color : 'rgba(255,255,255,0.35)' }}>
                          {opt.val}
                        </span>
                      </button>
                    ))}
                  </div>
                  {cc && (
                    <div className="mt-1.5 text-center text-xs font-bold"
                      style={{ color:CC_OPTS.find(o => o.val === cc)?.color || 'white' }}>
                      {CC_OPTS.find(o => o.val === cc)?.emoji} {CC_OPTS.find(o => o.val === cc)?.label}
                    </div>
                  )}
                </div>

                {/* Price/kg */}
                <div>
                  <div className="text-xs font-bold mb-1.5 text-white/50 uppercase tracking-wider">Precio por kg (COP)</div>
                  <div className="flex items-center gap-2">
                    <DollarSign size={14} style={{ color:'#39ff7e', flexShrink:0 }}/>
                    <input type="number" inputMode="numeric" placeholder="11000"
                      className="flex-1 px-3 py-2.5 rounded-xl text-sm font-bold text-white outline-none"
                      style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(57,255,126,0.2)' }}
                      value={valorKilo} onChange={e => setValorKilo(e.target.value)}/>
                    {pesoN > 0 && Number(valorKilo) > 0 && (
                      <div className="px-3 py-2.5 rounded-xl text-sm font-black flex-shrink-0"
                        style={{ background:'rgba(57,255,126,0.08)', border:'1px solid rgba(57,255,126,0.22)', color:'#39ff7e' }}>
                        {fmt(valorTotal)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Observations */}
                <div>
                  <div className="text-xs font-bold mb-1.5 text-white/50 uppercase tracking-wider">Observaciones</div>
                  <textarea placeholder="Notas del pesaje (opcional)..."
                    rows={2}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none resize-none"
                    style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', fontFamily:"'Space Grotesk',sans-serif" }}
                    value={obs} onChange={e => setObs(e.target.value)}/>
                </div>
              </div>

              {/* Navigation */}
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setStep('camera')}
                  className="flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold"
                  style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)' }}>
                  <ChevronLeft size={16}/> Foto & GPS
                </button>
                <button onClick={() => setStep('review')} disabled={!pesoN}
                  className="flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-black transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background:`linear-gradient(135deg,${PIÑA},#F59E0B)`, color:'#000', boxShadow: pesoN ? `0 0 24px rgba(255,214,10,0.45)` : 'none' }}>
                  Revisar <ChevronRight size={16}/>
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              STEP 4 — REVIEW & CONFIRM
          ═══════════════════════════════════════════════════════════════ */}
          {step === 'review' && animal && (
            <div className="space-y-3">
              {/* Summary card */}
              <div className="rounded-2xl overflow-hidden"
                style={{ background:'rgba(8,20,48,0.95)', border:`2px solid ${savedOk ? GREEN : 'rgba(50,120,255,0.25)'}`, boxShadow: savedOk ? `0 0 30px rgba(0,200,150,0.25)` : 'none', transition:'all 0.3s' }}>
                {/* Header */}
                <div className="px-5 py-4 border-b flex items-center gap-4"
                  style={{ borderColor:'rgba(255,255,255,0.06)', background: savedOk ? 'rgba(0,200,150,0.1)' : 'rgba(255,214,10,0.05)' }}>
                  {photo && <img src={photo} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-white/10"/>}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{catMeta!.emoji}</span>
                      <span className="font-black text-xl text-white">{animal.nombre}</span>
                    </div>
                    <div className="text-[11px]" style={{ color:'rgba(255,255,255,0.45)' }}>
                      {animal.id} · {animal.raza} · {animal.categoria} · {animal.lote}
                    </div>
                    <div className="flex gap-2 mt-1">
                      {photo && <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background:'rgba(192,132,252,0.12)', color:'#c084fc', border:'1px solid rgba(192,132,252,0.25)' }}>📷 Foto</span>}
                      {gps && <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background:'rgba(57,255,126,0.1)', color:'#39ff7e', border:'1px solid rgba(57,255,126,0.25)' }}>📡 GPS ±{gps.acc}m</span>}
                    </div>
                  </div>
                  {savedOk && (
                    <div className="flex items-center gap-2 text-sm font-black flex-shrink-0" style={{ color:GREEN }}>
                      <CheckCircle2 size={22}/> Guardado
                    </div>
                  )}
                </div>

                {/* Weight summary */}
                <div className="p-5 space-y-3">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {[
                      { label:'Peso anterior', val:`${animal.peso} kg`, color:'rgba(255,255,255,0.5)' },
                      { label:'PESO NUEVO', val:`${pesoN.toFixed(1)} kg`, color:PIÑA, big:true },
                      { label:'Diferencia', val:`${pesoDiff >= 0 ? '+' : ''}${pesoDiff.toFixed(1)} kg`, color: pesoDiff > 0 ? '#39ff7e' : pesoDiff < 0 ? '#f87171' : 'rgba(255,255,255,0.4)' },
                    ].map(item => (
                      <div key={item.label} className="rounded-xl py-3 px-2"
                        style={{ background: item.big ? `rgba(255,214,10,0.08)` : 'rgba(255,255,255,0.03)', border: item.big ? `1px solid rgba(255,214,10,0.25)` : '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="font-black text-lg leading-tight" style={{ color:item.color, fontSize: item.big ? 22 : undefined }}>{item.val}</div>
                        <div className="text-[9px] mt-0.5 font-bold" style={{ color:'rgba(255,255,255,0.3)' }}>{item.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5">
                    {[
                      { label:'CC', val:`${cc} — ${CC_OPTS.find(o => o.val === cc)?.emoji} ${CC_OPTS.find(o => o.val === cc)?.label}` },
                      { label:'Ref. raza', val:`${pesoRef} kg (${pesoPct}% del estándar)` },
                      ...(valorTotal > 0 ? [{ label:'Valor estimado', val:fmt(valorTotal) }] : []),
                      ...(obs ? [{ label:'Observaciones', val:obs }] : []),
                      ...(gps ? [{ label:'Ubicación GPS', val:`${gps.lat.toFixed(5)}, ${gps.lng.toFixed(5)} ±${gps.acc}m` }] : []),
                    ].map(row => (
                      <div key={row.label} className="flex justify-between text-sm py-1.5 border-b" style={{ borderColor:'rgba(255,255,255,0.05)' }}>
                        <span style={{ color:'rgba(255,255,255,0.35)' }}>{row.label}</span>
                        <span className="font-semibold text-white/80 text-right max-w-[55%]">{row.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              {!savedOk ? (
                <button onClick={savePesaje}
                  className="w-full py-5 rounded-2xl text-lg font-black transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background:`linear-gradient(135deg,${GREEN},#00FF88)`, color:'#000', boxShadow:`0 0 30px rgba(0,200,150,0.5), 0 4px 20px rgba(0,0,0,0.3)` }}>
                  ✓ GUARDAR PESAJE
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={nextAnimal}
                    className="py-4 rounded-xl text-sm font-black transition-all hover:scale-[1.02]"
                    style={{ background:`linear-gradient(135deg,${PIÑA},#F59E0B)`, color:'#000', boxShadow:`0 0 20px rgba(255,214,10,0.4)` }}>
                    Siguiente Animal →
                  </button>
                  <button onClick={resetWizard}
                    className="py-4 rounded-xl text-sm font-bold transition-all"
                    style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.6)' }}>
                    Nueva Sesión
                  </button>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <button onClick={printReceipt}
                  className="flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold transition-all hover:scale-[1.02]"
                  style={{ background:'rgba(255,149,0,0.08)', border:'1px solid rgba(255,149,0,0.25)', color:'#ff9500' }}>
                  <Printer size={14}/> Recibo
                </button>
                <button onClick={shareWA}
                  className="flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold transition-all hover:scale-[1.02]"
                  style={{ background:'rgba(37,211,102,0.08)', border:'1px solid rgba(37,211,102,0.25)', color:'#25D366' }}>
                  <Share2 size={14}/> WhatsApp
                </button>
                <button onClick={() => setStep('weight')}
                  className="flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold transition-all hover:scale-[1.02]"
                  style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)' }}>
                  <Scale size={14}/> Editar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Session log column ── */}
        <div className="space-y-3">
          <div className="rounded-2xl overflow-hidden"
            style={{ background:'rgba(8,20,48,0.95)', border:'1px solid rgba(50,120,255,0.18)' }}>
            <div className="px-4 py-3 border-b flex items-center gap-2"
              style={{ borderColor:'rgba(50,120,255,0.12)' }}>
              <List size={14} style={{ color:PIÑA }}/>
              <span className="font-black text-sm text-white">Sesión de hoy</span>
              <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold"
                style={{ background:`rgba(255,214,10,0.1)`, color:PIÑA, border:`1px solid rgba(255,214,10,0.25)` }}>
                {sessionLog.length} pesados
              </span>
            </div>
            {sessionLog.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <Scale size={32} className="mx-auto mb-2 opacity-15"/>
                <p className="text-xs" style={{ color:'rgba(255,255,255,0.2)' }}>Seleccione un animal para comenzar</p>
              </div>
            ) : (
              <div className="divide-y overflow-y-auto" style={{ borderColor:'rgba(255,255,255,0.04)', maxHeight:480 }}>
                {sessionLog.map((s, i) => {
                  const diff = s.peso - s.pesoPrev;
                  const m = CAT_META[s.cat] || CAT_META['Vaca adulta'];
                  return (
                    <div key={s.id + i} className="px-4 py-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                        style={{ background:`rgba(${m.glow},0.1)`, border:`1px solid rgba(${m.glow},0.25)` }}>
                        {m.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-white truncate leading-tight">{s.nombre}</div>
                        <div className="flex gap-2 text-[9px] mt-0.5">
                          <span style={{ color:'rgba(255,255,255,0.35)' }}>{s.lote}</span>
                          <span style={{ color:'rgba(255,255,255,0.2)' }}>{s.hora}</span>
                          {s.foto && <span style={{ color:'rgba(192,132,252,0.6)' }}>📷</span>}
                          {s.gps && <span style={{ color:'rgba(57,255,126,0.6)' }}>📡</span>}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-black text-sm" style={{ color:m.color }}>{s.peso} kg</div>
                        <div className="text-[9px] font-bold" style={{ color: diff > 0 ? '#39ff7e' : diff < 0 ? '#f87171' : 'rgba(255,255,255,0.3)' }}>
                          {diff > 0 ? '+' : ''}{diff.toFixed(1)} kg
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {sessionLog.length > 0 && (
              <div className="px-4 py-3 border-t space-y-2" style={{ borderColor:'rgba(255,255,255,0.06)' }}>
                <div className="flex justify-between text-xs">
                  <span style={{ color:'rgba(255,255,255,0.35)' }}>Peso promedio sesión</span>
                  <span className="font-bold" style={{ color:PIÑA }}>
                    {(sessionLog.reduce((s, e) => s + e.peso, 0) / sessionLog.length).toFixed(1)} kg
                  </span>
                </div>
                {sessionLog.some(s => s.valor > 0) && (
                  <div className="flex justify-between text-xs">
                    <span style={{ color:'rgba(255,255,255,0.35)' }}>Valor total sesión</span>
                    <span className="font-bold" style={{ color:'#39ff7e' }}>
                      {fmt(sessionLog.reduce((s, e) => s + e.valor, 0))}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick stats */}
          {sessionLog.length > 0 && (
            <div className="rounded-2xl p-4"
              style={{ background:'rgba(8,20,48,0.95)', border:'1px solid rgba(50,120,255,0.18)' }}>
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 size={14} style={{ color:PIÑA }}/>
                <span className="font-black text-sm text-white">Estadísticas</span>
              </div>
              <div className="space-y-2 text-xs">
                {[
                  { label:'Con foto', val:sessionLog.filter(s => s.foto).length, icon:'📷', color:'#c084fc' },
                  { label:'Con GPS', val:sessionLog.filter(s => s.gps).length, icon:'📡', color:'#39ff7e' },
                  { label:'Ganaron peso', val:sessionLog.filter(s => s.peso > s.pesoPrev).length, icon:'📈', color:'#39ff7e' },
                  { label:'Perdieron peso', val:sessionLog.filter(s => s.peso < s.pesoPrev).length, icon:'📉', color:'#f87171' },
                ].map(st => (
                  <div key={st.label} className="flex items-center justify-between">
                    <span style={{ color:'rgba(255,255,255,0.4)' }}>{st.icon} {st.label}</span>
                    <span className="font-black" style={{ color:st.color }}>{st.val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
