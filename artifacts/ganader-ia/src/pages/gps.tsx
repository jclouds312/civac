import { useState, useEffect, useRef, useCallback } from "react";
import { useAppState } from "../lib/data";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import {
  MapPin, Navigation, Wifi, WifiOff, Battery, BatteryLow, BatteryWarning,
  RefreshCw, AlertTriangle, CheckCircle2, Signal, Map, List,
  TrendingUp, Search, Plus, Bluetooth, Trash2,
  Link2, Loader2, LocateFixed, Play, Pause, Radio,
  Satellite, ChevronRight, Info, Zap, Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  saveGpsDevices, loadGpsDevices, appendGpsPosition, loadGpsTrack,
  clearGpsTrack, exportGpsTrack,
  checkGeolocationPermission, checkBluetoothAvailability,
  type StoredPos,
} from "../lib/offline-storage";

/* ─────────────────────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────────────────────── */
interface GpsDevice {
  id: string; nombre: string;
  tipo: 'collar-gps' | 'collar-bt' | 'bolus' | 'oreja';
  imei: string; animalId: string; animalNom: string;
  vinculado: boolean; fechaVin: string;
  lat?: number; lng?: number; precision?: number;
  bateria: number; activo: boolean;
  ultimaActualizacion: number; // timestamp ms
  velocidad?: number; altitud?: number;
  potreroId?: number;
}

interface LivePos { lat: number; lng: number; acc: number; ts: number; }

/* ─────────────────────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────────────────────── */
const TIPOS = [
  { id:'collar-gps',    label:'Collar GPS-LTE',        emoji:'📡', desc:'Nedap · HerdDogg · Gallagher · Smaxtec',        color:'#00c8ff', glow:'0,200,255'   },
  { id:'collar-bt',     label:'Collar Bluetooth BLE',  emoji:'🔵', desc:'Tru-Test · Destron Fearing · Zee Tag',           color:'#60a5fa', glow:'96,165,250'  },
  { id:'bolus',         label:'Bolo Ruminal GPS',       emoji:'💊', desc:'SmaXtec · Allflex · CowManager',                color:'#a78bfa', glow:'167,139,250' },
  { id:'oreja',         label:'Caravana EID electrónica',emoji:'🏷️',desc:'Allflex · SCR · CRV · ISO 11784',              color:'#fbbf24', glow:'251,191,36'  },
  { id:'pedometro',     label:'Podómetro BLE',          emoji:'🦶', desc:'SCR AfiTag · Afimilk · BouMatic',               color:'#34d399', glow:'52,211,153'  },
  { id:'implante',      label:'Implante subcutáneo',    emoji:'💉', desc:'Digital Angel · AVID · Trovan',                 color:'#f87171', glow:'248,113,113' },
  { id:'panel-solar',   label:'Collar Solar LTE',       emoji:'☀️', desc:'Ceres Tag · SenseHub · Quantified Ag',          color:'#f59e0b', glow:'245,158,11'  },
  { id:'camara-ia',     label:'Cámara IA potrero',      emoji:'🎥', desc:'CattleEye · IdentiGEN · AKVA group',            color:'#e879f9', glow:'232,121,249' },
];

const POTREROS_COLORS: Record<number, string> = {
  1:'#22c55e', 2:'#3b82f6', 3:'#f97316', 4:'#a855f7', 5:'#ec4899', 6:'#14b8a6',
};
const POTREROS_BOUNDS: Record<number,{x:number;y:number;w:number;h:number;label:string;ha:string;pasto:string}> = {
  1:{x:5, y:5, w:30,h:30,label:'Potrero 1',ha:'4.5 ha',pasto:'Kikuyo'},
  2:{x:40,y:5, w:25,h:25,label:'Potrero 2',ha:'3.8 ha',pasto:'Raigrás'},
  3:{x:70,y:5, w:28,h:40,label:'Potrero 3',ha:'5.1 ha',pasto:'Brachiaria'},
  4:{x:5, y:40,w:28,h:30,label:'Potrero 4',ha:'4.2 ha',pasto:'Estrella'},
  5:{x:38,y:35,w:30,h:33,label:'Potrero 5',ha:'6.0 ha',pasto:'Nativo'},
  6:{x:5, y:74,w:25,h:20,label:'Potrero 6',ha:'3.5 ha',pasto:'Kikuyo'},
};

const BASE_LAT = 4.710988;
const BASE_LNG = -74.072092;

const INITIAL_DEVICES: GpsDevice[] = [
  {id:'DEV-001',nombre:'Collar Rosaura',  tipo:'collar-gps',imei:'354071230987654',animalId:'A-0042',animalNom:'Rosaura', vinculado:true,fechaVin:'2026-01-10',lat:4.710988,lng:-74.072092,precision:4,bateria:82,activo:true, ultimaActualizacion:Date.now()-120000,potreroId:1},
  {id:'DEV-002',nombre:'Collar Titan',    tipo:'collar-gps',imei:'354071230987655',animalId:'A-0622',animalNom:'Titan',   vinculado:true,fechaVin:'2026-01-10',lat:4.711245,lng:-74.071887,precision:5,bateria:64,activo:true, ultimaActualizacion:Date.now()-60000, potreroId:5},
  {id:'DEV-003',nombre:'Bolo Perla',      tipo:'bolus',      imei:'354071230987656',animalId:'A-0712',animalNom:'Perla',   vinculado:true,fechaVin:'2026-02-15',lat:4.710502,lng:-74.072341,precision:8,bateria:17,activo:true, ultimaActualizacion:Date.now()-30000, potreroId:1},
  {id:'DEV-004',nombre:'Caravana Bravo',  tipo:'oreja',      imei:'RFID-ISO-40042',  animalId:'A-0401',animalNom:'Bravo',   vinculado:true,fechaVin:'2026-03-01',lat:4.711019,lng:-74.072501,precision:3,bateria:8, activo:false,ultimaActualizacion:Date.now()-3600000,potreroId:4},
  {id:'DEV-005',nombre:'Collar Luna',     tipo:'collar-gps',imei:'354071230987657',animalId:'A-0503',animalNom:'Luna',    vinculado:true,fechaVin:'2026-03-15',lat:4.711500,lng:-74.071200,precision:6,bateria:91,activo:true, ultimaActualizacion:Date.now()-45000, potreroId:3},
  {id:'DEV-006',nombre:'Collar Estrella', tipo:'collar-bt', imei:'BT:A1:B2:C3:D4', animalId:'A-0201',animalNom:'Estrella',vinculado:true,fechaVin:'2026-04-01',lat:4.710700,lng:-74.072200,precision:12,bateria:55,activo:true,ultimaActualizacion:Date.now()-90000, potreroId:1},
];

// Map positions (SVG 0-100 coords)
const ANIMAL_SVG: Record<string, {x:number;y:number}> = {
  'DEV-001':{x:18,y:18}, 'DEV-002':{x:51,y:50}, 'DEV-003':{x:28,y:15},
  'DEV-004':{x:16,y:52}, 'DEV-005':{x:84,y:22}, 'DEV-006':{x:22,y:24},
};

function timeSince(ms: number): string {
  const diff = Math.floor((Date.now() - ms) / 1000);
  if (diff < 60) return `hace ${diff}s`;
  if (diff < 3600) return `hace ${Math.floor(diff/60)}min`;
  return `hace ${Math.floor(diff/3600)}h`;
}

function BattIcon({pct}:{pct:number}) {
  if (pct > 50) return <Battery size={13} className="text-green-400"/>;
  if (pct > 20) return <BatteryWarning size={13} className="text-amber-400"/>;
  return <BatteryLow size={13} className="text-red-400"/>;
}
function battColor(pct:number) { return pct>50?'#4ade80':pct>20?'#fbbf24':'#f87171'; }

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function Gps() {
  const { gpsUbicaciones, animals, potreros } = useAppState();
  const { user } = useAuth();

  /* ── Devices state — cargado desde localStorage (offline-first) ── */
  const [devices, setDevices] = useState<GpsDevice[]>(
    () => loadGpsDevices<GpsDevice>() ?? INITIAL_DEVICES
  );
  const [activeTab, setActiveTab] = useState<'mapa'|'geovallado'|'lista'|'vincular'>('mapa');

  /* ── Map interaction ── */
  const [selectedDevId, setSelectedDevId] = useState<string|null>(null);
  const [hoveredDevId, setHoveredDevId]   = useState<string|null>(null);
  const [svgPositions, setSvgPositions]   = useState<Record<string,{x:number;y:number}>>(ANIMAL_SVG);
  const [searchQ, setSearchQ]             = useState('');
  const [filterActivo, setFilterActivo]   = useState<'todos'|'online'|'offline'>('todos');

  /* ── GPS track (historial persistido en localStorage) ── */
  const [gpsTrack, setGpsTrack]           = useState<StoredPos[]>(() => loadGpsTrack());
  const [showTrackPanel, setShowTrackPanel] = useState(false);

  /* ── Permisos de hardware ── */
  const [geoPermission, setGeoPermission] = useState<'granted'|'denied'|'prompt'|'unavailable'|null>(null);
  const [btAvailable, setBtAvailable]     = useState<'available'|'unavailable'|'disabled'|null>(null);

  /* ── Real GPS tracking ── */
  const [livePos, setLivePos]             = useState<LivePos|null>(null);
  const [tracking, setTracking]           = useState(false);
  const [geoError, setGeoError]           = useState<string|null>(null);
  const [locating, setLocating]           = useState(false);
  const watchIdRef                        = useRef<number|null>(null);

  /* ── Bluetooth scan ── */
  const [scanning, setScanning]           = useState(false);
  const [scanResults, setScanResults]     = useState<{id:string;nombre:string;rssi:number;tipo:string}[]>([]);
  const [linking, setLinking]             = useState<string|null>(null);

  /* ── Manual form ── */
  const [showForm, setShowForm]           = useState(false);
  const [form, setForm]                   = useState({ nombre:'', tipo:'collar-gps' as GpsDevice['tipo'], imei:'', animalId:'' });
  const [formSaved, setFormSaved]         = useState(false);

  /* ── Device detail dialog ── */
  const [detailDev, setDetailDev]         = useState<GpsDevice|null>(null);

  /* ── Refresh ── */
  const [refreshing, setRefreshing]       = useState(false);
  const [lastUpdate, setLastUpdate]       = useState(new Date());
  const tickRef                           = useRef<ReturnType<typeof setInterval>|null>(null);

  /* ── Derived ── */
  const selectedDev = devices.find(d => d.id === selectedDevId) || null;
  const activeCount   = devices.filter(d => d.activo && d.vinculado).length;
  const offlineCount  = devices.filter(d => !d.activo && d.vinculado).length;
  const lowBatCount   = devices.filter(d => d.bateria <= 20 && d.vinculado).length;
  const totalLinked   = devices.filter(d => d.vinculado).length;

  const filteredDevs = devices.filter(d => {
    const q = searchQ.toLowerCase();
    const matchSearch = !q || d.animalNom.toLowerCase().includes(q) || d.imei.toLowerCase().includes(q) || d.nombre.toLowerCase().includes(q);
    const matchActive = filterActivo==='todos' || (filterActivo==='online'&&d.activo) || (filterActivo==='offline'&&!d.activo);
    return matchSearch && matchActive && d.vinculado;
  });

  /* ─── Simulated movement (animals drift slightly every 4s) ─── */
  useEffect(() => {
    tickRef.current = setInterval(() => {
      setSvgPositions(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => {
          const dev = devices.find(d => d.id === id);
          if (!dev?.activo) return;
          // Small Gaussian drift (±0.3 SVG units)
          const dx = (Math.random() - 0.5) * 0.6;
          const dy = (Math.random() - 0.5) * 0.6;
          const pb = POTREROS_BOUNDS[dev.potreroId || 1] || POTREROS_BOUNDS[1];
          // Keep within potrero bounds
          next[id] = {
            x: Math.max(pb.x + 1, Math.min(pb.x + pb.w - 1, next[id].x + dx)),
            y: Math.max(pb.y + 1, Math.min(pb.y + pb.h - 1, next[id].y + dy)),
          };
        });
        return next;
      });
      // Slow battery drain
      setDevices(prev => prev.map(d => ({
        ...d,
        bateria: d.activo ? Math.max(0, d.bateria - 0.01) : d.bateria,
        ultimaActualizacion: d.activo ? Date.now() - Math.floor(Math.random()*120)*1000 : d.ultimaActualizacion,
      })));
      setLastUpdate(new Date());
    }, 4000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [devices.length]);

  /* ─── Real geolocation watch ─── */
  const startTracking = useCallback(() => {
    setGeoError(null);
    if (!navigator.geolocation) { setGeoError('Geolocalización no disponible en este dispositivo.'); return; }
    setTracking(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      pos => {
        const p: StoredPos = {
          lat: pos.coords.latitude, lng: pos.coords.longitude,
          acc: Math.round(pos.coords.accuracy), ts: Date.now(),
          speed: pos.coords.speed ?? undefined, alt: pos.coords.altitude ?? undefined,
        };
        setLivePos(p);
        setGpsTrack(appendGpsPosition(p));  // persiste en localStorage
        setGeoPermission('granted');
        setGeoError(null);
      },
      err => {
        setGeoError(err.code===1?'Permiso denegado — habilita ubicación en el navegador.':err.code===2?'Señal GPS débil. Sal a campo abierto.':'Tiempo agotado — intenta de nuevo.');
      },
      { enableHighAccuracy:true, timeout:15000, maximumAge:5000 }
    );
  }, []);

  const stopTracking = useCallback(() => {
    setTracking(false);
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  /* Single-shot locate */
  const getOnce = () => {
    setLocating(true); setGeoError(null);
    if (!navigator.geolocation) { setGeoError('Geolocalización no disponible.'); setLocating(false); return; }
    navigator.geolocation.getCurrentPosition(
      pos => { setLivePos({lat:pos.coords.latitude,lng:pos.coords.longitude,acc:Math.round(pos.coords.accuracy),ts:Date.now()}); setLocating(false); },
      err => { setGeoError(err.code===1?'Permiso denegado.':err.code===2?'Señal débil.':'Tiempo agotado.'); setLocating(false); },
      { enableHighAccuracy:true, timeout:10000, maximumAge:0 }
    );
  };

  useEffect(() => () => { if (watchIdRef.current!==null) navigator.geolocation.clearWatch(watchIdRef.current); }, []);

  /* ── Persistir devices en localStorage cada vez que cambian ── */
  useEffect(() => { saveGpsDevices(devices); }, [devices]);

  /* ── Comprobar permisos de hardware al montar ── */
  useEffect(() => {
    checkGeolocationPermission().then(setGeoPermission);
    checkBluetoothAvailability().then(setBtAvailable);
  }, []);

  /* ─── Bluetooth scan ─── */
  const scanBluetooth = async () => {
    setScanning(true); setScanResults([]);
    if ('bluetooth' in navigator) {
      try {
        const dev = await (navigator as any).bluetooth.requestDevice({
          acceptAllDevices:true,
          optionalServices:['battery_service','heart_rate','location_and_speed'],
        });
        setScanResults([{id:dev.id||`BT-${Date.now()}`,nombre:dev.name||'Collar BT detectado',rssi:-58,tipo:'collar-bt'}]);
        setScanning(false); return;
      } catch { /* user cancelled or not supported */ }
    }
    // Simulated fallback with realistic cattle tracker names
    await new Promise(r => setTimeout(r, 2000));
    setScanResults([
      {id:'BT-A1F2',nombre:'TruTest XR3000 · A1:F2:3C',  rssi:-52,tipo:'collar-gps'},
      {id:'BT-B2E4',nombre:'HerdDogg Tag · B2:E4:1A',     rssi:-68,tipo:'collar-bt'},
      {id:'BT-C3D5',nombre:'Gallagher TSi · C3:D5:9B',    rssi:-75,tipo:'collar-gps'},
      {id:'BT-D4E6',nombre:'SmaXtec Bolus · D4:E6:2C',   rssi:-81,tipo:'bolus'},
    ]);
    setScanning(false);
  };

  const linkScanned = async (bt:{id:string;nombre:string;rssi:number;tipo:string}) => {
    setLinking(bt.id);
    await new Promise(r => setTimeout(r, 1200));
    const newDev: GpsDevice = {
      id:`DEV-${Date.now()}`, nombre:bt.nombre, tipo:bt.tipo as GpsDevice['tipo'],
      imei:bt.id, animalId:'', animalNom:'Sin asignar', vinculado:true,
      fechaVin:new Date().toISOString().slice(0,10),
      lat:livePos?.lat, lng:livePos?.lng, precision:bt.rssi*-1,
      bateria:100, activo:true, ultimaActualizacion:Date.now(), potreroId:1,
    };
    setDevices(prev=>[...prev,newDev]);
    setSvgPositions(prev=>({...prev,[newDev.id]:{x:18+Math.random()*10,y:18+Math.random()*10}}));
    setScanResults(prev=>prev.filter(r=>r.id!==bt.id));
    setLinking(null);
  };

  const addManualDevice = () => {
    if (!form.nombre || !form.imei) return;
    const animal = animals.find(a => a.id === form.animalId);
    const newDev: GpsDevice = {
      id:`DEV-${Date.now()}`, nombre:form.nombre, tipo:form.tipo,
      imei:form.imei, animalId:form.animalId, animalNom:animal?.nombre||'Sin asignar',
      vinculado:true, fechaVin:new Date().toISOString().slice(0,10),
      lat:livePos?.lat, lng:livePos?.lng, precision:livePos?.acc,
      bateria:100, activo:true, ultimaActualizacion:Date.now(), potreroId:1,
    };
    setDevices(prev=>[...prev,newDev]);
    setSvgPositions(prev=>({...prev,[newDev.id]:{x:18+Math.random()*12,y:18+Math.random()*12}}));
    setForm({nombre:'',tipo:'collar-gps',imei:'',animalId:''});
    setShowForm(false); setFormSaved(true);
    setTimeout(()=>setFormSaved(false),3000);
  };

  const removeDevice = (id:string) => {
    setDevices(prev=>prev.filter(d=>d.id!==id));
    if (selectedDevId===id) setSelectedDevId(null);
  };

  const refresh = async () => {
    setRefreshing(true);
    await new Promise(r=>setTimeout(r,800));
    setLastUpdate(new Date()); setRefreshing(false);
  };

  /* ── Render ── */
  return (
    <div className="space-y-4 pb-8" style={{fontFamily:"'Space Grotesk','Sora',sans-serif"}}>

      {/* ── Banner ── */}
      <div className="relative rounded-3xl overflow-hidden px-5 py-5"
        style={{background:'linear-gradient(135deg,#020d1a 0%,#0a2745 55%,#071e38 100%)',border:'1px solid rgba(20,100,180,0.4)',boxShadow:'0 0 40px rgba(20,100,180,0.1)'}}>
        <div className="absolute inset-0 pointer-events-none" style={{background:"radial-gradient(ellipse at 70% 50%, rgba(20,80,180,0.12) 0%, transparent 70%)",opacity:1}}/>
        <div className="absolute right-16 top-4 opacity-10 pointer-events-none">
          <div className="w-20 h-20 rounded-full border-2 border-blue-400 animate-ping" style={{animationDuration:'2.5s'}}/>
        </div>
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{background:'rgba(20,100,180,0.2)',border:'1px solid rgba(20,100,180,0.5)',boxShadow:'0 0 20px rgba(20,100,180,0.3)'}}>
              <Satellite size={22} className="text-blue-300"/>
            </div>
            <div>
              <h1 className="text-xl font-black text-white">GPS Ganadero</h1>
              <p className="text-sm mt-0.5" style={{color:'rgba(100,180,255,0.8)'}}>
                Rastreo en tiempo real · Geovallado · Collar GPS-LTE · BT
              </p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                  style={{background:'rgba(20,150,80,0.2)',border:'1px solid rgba(20,150,80,0.4)',color:'#4ade80'}}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
                  {activeCount} Online
                </span>
                {lowBatCount>0&&<span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{background:'rgba(250,100,0,0.15)',border:'1px solid rgba(250,100,0,0.35)',color:'#fb923c'}}>
                  ⚡ {lowBatCount} batería baja
                </span>}
                {offlineCount>0&&<span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{background:'rgba(248,113,113,0.12)',border:'1px solid rgba(248,113,113,0.3)',color:'#f87171'}}>
                  📵 {offlineCount} sin señal
                </span>}
                {tracking&&<span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                  style={{background:'rgba(0,245,212,0.15)',border:'1px solid rgba(0,245,212,0.4)',color:'#00f5d4'}}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f5d4] animate-pulse"/>
                  Seguimiento activo
                </span>}
                {/* ── Offline-capability badges ── */}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                  style={{
                    background:'rgba(0,245,212,0.07)',
                    border:`1px solid ${geoPermission==='granted'?'rgba(0,245,212,0.45)':geoPermission==='denied'?'rgba(248,113,113,0.4)':'rgba(255,255,255,0.12)'}`,
                    color:geoPermission==='granted'?'#00f5d4':geoPermission==='denied'?'#f87171':'rgba(255,255,255,0.4)',
                  }}>
                  <LocateFixed size={9}/>
                  GPS {geoPermission==='granted'?'✓':geoPermission==='denied'?'✗ denegado':'· sin permiso aún'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                  style={{
                    background:'rgba(0,200,255,0.07)',
                    border:`1px solid ${btAvailable==='available'?'rgba(0,200,255,0.4)':btAvailable==='disabled'?'rgba(251,146,60,0.35)':'rgba(255,255,255,0.12)'}`,
                    color:btAvailable==='available'?'#00c8ff':btAvailable==='disabled'?'#fb923c':'rgba(255,255,255,0.35)',
                  }}>
                  <Bluetooth size={9}/>
                  BT {btAvailable==='available'?'✓':btAvailable==='disabled'?'apagado':'no disponible'}
                </span>
                {gpsTrack.length>0&&(
                  <button onClick={()=>setShowTrackPanel(v=>!v)}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                    style={{background:'rgba(167,139,250,0.1)',border:'1px solid rgba(167,139,250,0.35)',color:'#a78bfa'}}>
                    📍 {gpsTrack.length} puntos guardados
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white/30 text-xs hidden sm:block">
              {lastUpdate.toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}
            </span>
            <Button onClick={refresh} size="sm"
              style={{background:'rgba(20,100,180,0.2)',border:'1px solid rgba(20,100,180,0.45)',color:'#60a5fa'}}
              className="gap-1.5 font-bold">
              <RefreshCw size={13} className={refreshing?'animate-spin':''}/> Actualizar
            </Button>
            <Button onClick={()=>setActiveTab('vincular')} size="sm"
              style={{background:'rgba(0,245,212,0.12)',border:'1px solid rgba(0,245,212,0.35)',color:'#00f5d4'}}
              className="gap-1.5 font-bold">
              <Plus size={13}/> Vincular GPS
            </Button>
          </div>
        </div>
      </div>

      {/* ── Track History Panel ── */}
      {showTrackPanel && (
        <div className="rounded-2xl overflow-hidden" style={{border:'1px solid rgba(167,139,250,0.25)'}}>
          <div className="flex items-center gap-3 px-4 py-3 flex-wrap" style={{background:'rgba(167,139,250,0.07)',borderBottom:'1px solid rgba(167,139,250,0.12)'}}>
            <span className="text-sm font-bold text-white">📍 Historial GPS guardado localmente</span>
            <span className="text-[9px] text-white/30">{gpsTrack.length} puntos · almacenado 100% offline en este dispositivo</span>
            <div className="ml-auto flex gap-2">
              <button
                onClick={()=>{
                  const csv = exportGpsTrack();
                  const a = document.createElement('a');
                  a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
                  a.download = `civac_gps_track_${new Date().toISOString().slice(0,10)}.csv`;
                  a.click();
                }}
                className="text-[9px] font-bold px-2.5 py-1 rounded-lg"
                style={{background:'rgba(0,245,212,0.1)',border:'1px solid rgba(0,245,212,0.3)',color:'#00f5d4'}}>
                ⬇ Exportar CSV
              </button>
              <button
                onClick={()=>{ clearGpsTrack(); setGpsTrack([]); }}
                className="text-[9px] font-bold px-2.5 py-1 rounded-lg"
                style={{background:'rgba(248,113,113,0.1)',border:'1px solid rgba(248,113,113,0.25)',color:'#f87171'}}>
                🗑 Borrar track
              </button>
            </div>
          </div>
          <div className="divide-y max-h-52 overflow-y-auto" style={{borderColor:'rgba(255,255,255,0.04)'}}>
            {[...gpsTrack].reverse().slice(0,80).map((p,i)=>(
              <div key={i} className="flex items-center gap-3 px-4 py-2 text-[10px]">
                <span className="text-white/25 w-4 flex-shrink-0">{i+1}</span>
                <span className="font-mono text-white/60">{p.lat.toFixed(6)}, {p.lng.toFixed(6)}</span>
                <span className="text-white/30">±{p.acc}m</span>
                {p.speed!=null&&<span className="text-white/25">{(p.speed*3.6).toFixed(1)} km/h</span>}
                <span className="ml-auto text-white/20">{new Date(p.ts).toLocaleTimeString('es-CO')}</span>
              </div>
            ))}
            {gpsTrack.length>80&&<div className="px-4 py-2 text-[9px] text-white/20">... y {gpsTrack.length-80} puntos más (exporta el CSV para verlos todos)</div>}
          </div>
        </div>
      )}

      {/* ── Alert banner if offline ── */}
      {devices.some(d=>!d.activo&&d.vinculado)&&(
        <div className="rounded-2xl p-4" style={{background:'linear-gradient(135deg,#1a0800,#2e1000)',border:'1px solid rgba(250,100,0,0.4)'}}>
          <div className="flex items-center gap-3">
            <AlertTriangle size={16} className="text-orange-400 flex-shrink-0"/>
            <div className="flex-1">
              <div className="font-bold text-sm text-orange-300 mb-1.5">Alertas de conectividad</div>
              <div className="flex flex-wrap gap-2">
                {devices.filter(d=>!d.activo&&d.vinculado).map(d=>(
                  <div key={d.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
                    style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(250,100,0,0.2)'}}>
                    <span>📵</span>
                    <span className="font-bold text-white/80">{d.animalNom}</span>
                    <span className="text-orange-400">Sin señal</span>
                    <span className="text-white/30">{timeSince(d.ultimaActualizacion)}</span>
                    <button onClick={()=>setActiveTab('vincular')} className="text-orange-400/70 hover:text-orange-400 transition-colors">→ Reparar</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {label:'Rastreados',  val:totalLinked,    sub:'con GPS activo', g:'linear-gradient(135deg,#0a3d62,#1464a0)',icon:<Navigation size={15}/>,tab:'lista'  as const},
          {label:'En línea',    val:activeCount,    sub:'señal activa',   g:'linear-gradient(135deg,#1b5e20,#2e7d32)',icon:<Wifi size={15}/>,       tab:'lista'  as const},
          {label:'Bat. baja',   val:lowBatCount,    sub:'requieren carga',g:'linear-gradient(135deg,#e65100,#f57c00)',icon:<BatteryLow size={15}/>,  tab:'lista'  as const},
          {label:'Sin señal',   val:offlineCount,   sub:'offline',        g:'linear-gradient(135deg,#b71c1c,#c62828)',icon:<WifiOff size={15}/>,     tab:'geovallado' as const},
        ].map(k=>(
          <button key={k.label} onClick={()=>setActiveTab(k.tab)}
            className="rounded-2xl p-4 text-white text-left transition-all hover:scale-[1.02] hover:brightness-110 cursor-pointer"
            style={{background:k.g,boxShadow:'0 4px 16px rgba(0,0,0,0.3)'}}>
            <div className="flex items-center gap-1.5 mb-1 opacity-80">{k.icon}<span className="text-[10px] font-bold uppercase tracking-wider">{k.label}</span></div>
            <div className="text-2xl font-black">{k.val}</div>
            <div className="text-[10px] opacity-60 mt-0.5">{k.sub} →</div>
          </button>
        ))}
      </div>

      {/* ── Tab bar ── */}
      <div className="flex gap-2 flex-wrap">
        {[
          {id:'mapa'      as const, icon:<Map size={13}/>,          label:'Mapa en vivo'},
          {id:'geovallado'as const, icon:<AlertTriangle size={13}/>,label:'Geovallado'},
          {id:'lista'     as const, icon:<List size={13}/>,         label:'Dispositivos'},
          {id:'vincular'  as const, icon:<Link2 size={13}/>,        label:'Vincular nuevo'},
        ].map(t=>(
          <button key={t.id} onClick={()=>setActiveTab(t.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-bold transition-all"
            style={activeTab===t.id
              ?{background:'linear-gradient(135deg,rgba(0,200,255,0.2),rgba(20,100,180,0.15))',border:'1.5px solid rgba(0,200,255,0.5)',color:'#60a5fa',boxShadow:'0 0 12px rgba(0,200,255,0.12)'}
              :{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',color:'rgba(255,255,255,0.45)'}}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════
          TAB: MAPA
      ═══════════════════════════════════════════════════════ */}
      {activeTab==='mapa'&&(
        <div className="grid lg:grid-cols-3 gap-4">
          {/* SVG Map */}
          <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={{background:'rgba(4,13,26,0.95)',border:'1px solid rgba(20,100,180,0.25)'}}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{borderColor:'rgba(255,255,255,0.06)'}}>
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Map size={14} className="text-blue-400"/>Mapa Topográfico — Finca El Rancho Verde
              </div>
              <div className="flex items-center gap-2">
                {tracking
                  ? <button onClick={stopTracking} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                      style={{background:'rgba(248,113,113,0.12)',border:'1px solid rgba(248,113,113,0.3)',color:'#f87171'}}>
                      <Pause size={11}/> Pausar rastreo
                    </button>
                  : <button onClick={startTracking} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                      style={{background:'rgba(0,245,212,0.1)',border:'1px solid rgba(0,245,212,0.3)',color:'#00f5d4'}}>
                      <Play size={11}/> Iniciar rastreo GPS
                    </button>
                }
                <span className="text-[10px] text-white/25">{activeCount} activos</span>
              </div>
            </div>

            {geoError&&<div className="mx-4 mt-3 text-xs px-3 py-2 rounded-xl flex items-center gap-2" style={{background:'rgba(248,113,113,0.08)',border:'1px solid rgba(248,113,113,0.2)',color:'#f87171'}}><AlertTriangle size={11}/>{geoError}</div>}
            {livePos&&<div className="mx-4 mt-3 text-xs px-3 py-2 rounded-xl flex items-center gap-2" style={{background:'rgba(0,245,212,0.08)',border:'1px solid rgba(0,245,212,0.2)',color:'#00f5d4'}}>
              <LocateFixed size={11}/> Tu posición: {livePos.lat.toFixed(5)}, {livePos.lng.toFixed(5)} ±{livePos.acc}m · {timeSince(livePos.ts)}
            </div>}

            {/* SVG */}
            <div className="relative w-full m-4" style={{paddingBottom:'calc(75% - 2rem)',width:'calc(100% - 2rem)'}}>
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full rounded-2xl"
                style={{background:'linear-gradient(180deg,#0b2210 0%,#0f2d0f 50%,#142814 100%)'}}>
                {/* Grid */}
                {[10,20,30,40,50,60,70,80,90].map(v=>(
                  <g key={v}>
                    <line x1={v} y1={0} x2={v} y2={100} stroke="#ffffff06" strokeWidth={0.3}/>
                    <line x1={0} y1={v} x2={100} y2={v} stroke="#ffffff06" strokeWidth={0.3}/>
                  </g>
                ))}

                {/* Potreros */}
                {Object.entries(POTREROS_BOUNDS).map(([pid,b])=>{
                  const id=Number(pid); const color=POTREROS_COLORS[id];
                  const pot=potreros.find(p=>p.id===id);
                  const status=pot?.estado||'Descanso'; const isRed=status==='Rotar pronto';
                  return (
                    <g key={pid}>
                      <rect x={b.x} y={b.y} width={b.w} height={b.h} fill={`${color}18`} stroke={isRed?'#ef4444':color} strokeWidth={isRed?0.9:0.5} rx={1.5}/>
                      <text x={b.x+b.w/2} y={b.y+5} textAnchor="middle" fill={color} fontSize={2.2} fontWeight="bold">P{pid}</text>
                      <text x={b.x+b.w/2} y={b.y+b.h-3} textAnchor="middle" fill={`${color}88`} fontSize={1.7}>{status}</text>
                    </g>
                  );
                })}

                {/* Animal dots */}
                {devices.filter(d=>d.vinculado).map(d=>{
                  const pos=svgPositions[d.id]||{x:50,y:50};
                  const color=d.activo?POTREROS_COLORS[d.potreroId||1]||'#22c55e':'#6b7280';
                  const isHov=hoveredDevId===d.id; const isSel=selectedDevId===d.id;
                  return (
                    <g key={d.id} style={{cursor:'pointer'}}
                      onClick={()=>setSelectedDevId(prev=>prev===d.id?null:d.id)}
                      onMouseEnter={()=>setHoveredDevId(d.id)}
                      onMouseLeave={()=>setHoveredDevId(null)}>
                      {/* Pulse ring for active */}
                      {d.activo&&(
                        <circle cx={pos.x} cy={pos.y} r={isSel?5:3} fill={color} opacity={0.15}>
                          <animate attributeName="r" values={`${isSel?5:3};${isSel?8:5};${isSel?5:3}`} dur="2s" repeatCount="indefinite"/>
                          <animate attributeName="opacity" values="0.15;0;0.15" dur="2s" repeatCount="indefinite"/>
                        </circle>
                      )}
                      {/* Dot */}
                      <circle cx={pos.x} cy={pos.y} r={isHov||isSel?2.8:1.9} fill={color} stroke="white" strokeWidth={0.5}/>
                      {/* Low battery indicator */}
                      {d.bateria<=20&&<circle cx={pos.x+2} cy={pos.y-2} r={0.9} fill="#f87171"/>}
                      {/* Tooltip */}
                      {(isHov||isSel)&&(
                        <g>
                          <rect x={pos.x+3} y={pos.y-7.5} width={18} height={9} fill="#000000cc" rx={1.5}/>
                          <text x={pos.x+12} y={pos.y-3.5} textAnchor="middle" fill="white" fontSize={2.1} fontWeight="bold">{d.animalNom}</text>
                          <text x={pos.x+12} y={pos.y-0.5} textAnchor="middle" fill={d.activo?'#4ade80':'#f87171'} fontSize={1.7}>
                            {d.activo?'● Online':'○ Offline'} · {Math.round(d.bateria)}%
                          </text>
                          <text x={pos.x+12} y={pos.y+2} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={1.5}>{d.tipo==='collar-gps'?'📡':d.tipo==='bolus'?'💊':'🏷️'}</text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* Real GPS position marker */}
                {livePos&&<g>
                  <circle cx={50} cy={50} r={4} fill="none" stroke="#00f5d4" strokeWidth={0.8} opacity={0.4}>
                    <animate attributeName="r" values="4;8;4" dur="2s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx={50} cy={50} r={2} fill="#00f5d4" stroke="white" strokeWidth={0.6}/>
                  <text x={53} y={48} fill="#00f5d4" fontSize={2} fontWeight="bold">📍 Tú</text>
                </g>}

                {/* Legend */}
                <g>
                  <rect x={0} y={92} width={100} height={8} fill="#00000055"/>
                  <circle cx={3} cy={96} r={1.5} fill="#4ade80"/><text x={6} y={97.2} fill="#4ade80" fontSize={2}>Online</text>
                  <circle cx={20} cy={96} r={1.5} fill="#6b7280"/><text x={23} y={97.2} fill="#9ca3af" fontSize={2}>Offline</text>
                  <circle cx={38} cy={96} r={1.5} fill="#f87171"/><text x={41} y={97.2} fill="#f87171" fontSize={2}>Bat.baja</text>
                  <circle cx={55} cy={96} r={1.5} fill="#00f5d4"/><text x={58} y={97.2} fill="#00f5d4" fontSize={2}>Tú (GPS)</text>
                  <text x={74} y={97.2} fill="rgba(255,255,255,0.3)" fontSize={1.8}>Clic = detalle</text>
                </g>
              </svg>
            </div>

            {/* Potrero legend */}
            <div className="flex flex-wrap gap-2 px-4 pb-4">
              {Object.entries(POTREROS_BOUNDS).map(([pid,b])=>(
                <span key={pid} className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full"
                  style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.5)'}}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:POTREROS_COLORS[Number(pid)]}}/>
                  {b.label} · {b.ha} · {b.pasto}
                </span>
              ))}
            </div>
          </div>

          {/* Side panel */}
          <div className="space-y-3">
            {/* Selected device detail */}
            {selectedDev ? (
              <div className="rounded-2xl overflow-hidden" style={{background:'rgba(4,13,26,0.95)',border:'1px solid rgba(0,200,255,0.3)'}}>
                <div className="h-0.5" style={{background:`linear-gradient(90deg,${POTREROS_COLORS[selectedDev.potreroId||1]||'#60a5fa'},transparent)`}}/>
                <div className="px-4 py-3 border-b flex items-center justify-between" style={{borderColor:'rgba(255,255,255,0.06)'}}>
                  <div>
                    <div className="font-bold text-sm text-white">{selectedDev.animalNom}</div>
                    <div className="text-[10px] text-white/35">{selectedDev.nombre} · {selectedDev.imei}</div>
                  </div>
                  <button onClick={()=>setSelectedDevId(null)} className="text-white/30 hover:text-white/60 text-xs">✕</button>
                </div>
                <div className="p-4 space-y-2.5">
                  {[
                    {label:'Estado',      val:selectedDev.activo?'● En línea':'○ Offline', c:selectedDev.activo?'#4ade80':'#f87171'},
                    {label:'Señal',       val:timeSince(selectedDev.ultimaActualizacion)},
                    {label:'Potrero',     val:POTREROS_BOUNDS[selectedDev.potreroId||1]?.label||'—'},
                    {label:'Tipo',        val:TIPOS.find(t=>t.id===selectedDev.tipo)?.label||selectedDev.tipo},
                    {label:'Batería',     val:`${Math.round(selectedDev.bateria)}%`, c:battColor(selectedDev.bateria)},
                    {label:'Lat/Lng',     val:selectedDev.lat?`${selectedDev.lat.toFixed(5)}, ${selectedDev.lng?.toFixed(5)}`:'—'},
                    {label:'Precisión',   val:selectedDev.precision?`±${selectedDev.precision}m`:'—'},
                    {label:'Vinculado',   val:selectedDev.fechaVin},
                  ].map(r=>(
                    <div key={r.label} className="flex justify-between text-xs border-b pb-2" style={{borderColor:'rgba(255,255,255,0.05)'}}>
                      <span className="text-white/35">{r.label}</span>
                      <span className="font-bold" style={{color:r.c||'rgba(255,255,255,0.75)'}}>{r.val}</span>
                    </div>
                  ))}
                  {/* Battery bar */}
                  <div>
                    <div className="h-1.5 rounded-full mt-1" style={{background:'rgba(255,255,255,0.07)'}}>
                      <div className="h-1.5 rounded-full transition-all"
                        style={{width:`${selectedDev.bateria}%`,background:selectedDev.bateria>50?'#4ade80':selectedDev.bateria>20?'#fbbf24':'#f87171'}}/>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button onClick={()=>{setDetailDev(selectedDev);}} className="flex-1 py-2 rounded-xl text-xs font-bold"
                      style={{background:'rgba(0,200,255,0.1)',border:'1px solid rgba(0,200,255,0.25)',color:'#60a5fa'}}>
                      <Info size={11} className="inline mr-1"/>Historial
                    </button>
                    <button onClick={()=>removeDevice(selectedDev.id)} className="flex-1 py-2 rounded-xl text-xs font-bold"
                      style={{background:'rgba(248,113,113,0.1)',border:'1px solid rgba(248,113,113,0.25)',color:'#f87171'}}>
                      <Trash2 size={11} className="inline mr-1"/>Desvincular
                    </button>
                  </div>
                </div>
              </div>
            ):(
              <div className="rounded-2xl p-6 text-center" style={{background:'rgba(4,13,26,0.7)',border:'1px dashed rgba(255,255,255,0.08)'}}>
                <MapPin size={32} className="mx-auto mb-2 opacity-20 text-blue-400"/>
                <p className="text-sm text-white/25">Clic en un punto del mapa para ver detalle del dispositivo</p>
              </div>
            )}

            {/* Quick list */}
            <div className="rounded-2xl overflow-hidden" style={{background:'rgba(4,13,26,0.95)',border:'1px solid rgba(255,255,255,0.07)'}}>
              <div className="px-4 py-3 border-b flex items-center gap-2" style={{borderColor:'rgba(255,255,255,0.06)'}}>
                <Signal size={13} className="text-blue-400"/>
                <span className="font-bold text-sm text-white">Animales rastreados</span>
                <span className="ml-auto text-[10px] text-white/25">{totalLinked} total</span>
              </div>
              <div className="max-h-64 overflow-y-auto" style={{scrollbarWidth:'thin',scrollbarColor:'rgba(0,200,255,0.2) transparent'}}>
                {devices.filter(d=>d.vinculado).map(d=>(
                  <div key={d.id} onClick={()=>setSelectedDevId(prev=>prev===d.id?null:d.id)}
                    className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors border-b"
                    style={{borderColor:'rgba(255,255,255,0.04)',background:selectedDevId===d.id?'rgba(0,200,255,0.06)':'transparent'}}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${d.activo?'bg-green-400 animate-pulse':''}`}
                      style={d.activo?{}:{background:'#6b7280'}}/>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white truncate">{d.animalNom}</div>
                      <div className="text-[10px] text-white/30">{POTREROS_BOUNDS[d.potreroId||1]?.label||'—'} · {timeSince(d.ultimaActualizacion)}</div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <BattIcon pct={d.bateria}/>
                      <span className="text-xs font-bold" style={{color:battColor(d.bateria)}}>{Math.round(d.bateria)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB: GEOVALLADO
      ═══════════════════════════════════════════════════════ */}
      {activeTab==='geovallado'&&(
        <div className="space-y-4">
          <div className="rounded-2xl overflow-hidden" style={{background:'rgba(4,13,26,0.95)',border:'1px solid rgba(20,100,180,0.2)'}}>
            <div className="px-4 py-3 border-b flex items-center justify-between" style={{borderColor:'rgba(255,255,255,0.06)'}}>
              <div className="flex items-center gap-2 font-bold text-sm text-white">
                <AlertTriangle size={14} className="text-blue-400"/>
                Zonas de Geovallado — Finca El Rancho Verde
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{background:'rgba(0,200,255,0.12)',border:'1px solid rgba(0,200,255,0.25)',color:'#60a5fa'}}>
                {Object.keys(POTREROS_BOUNDS).length} zonas activas
              </span>
            </div>
            <div>
              {Object.entries(POTREROS_BOUNDS).map(([pid,b])=>{
                const id=Number(pid); const color=POTREROS_COLORS[id];
                const animalesEnZona=devices.filter(d=>d.potreroId===id&&d.vinculado);
                const hasOffline=animalesEnZona.some(d=>!d.activo);
                const hasLowBat=animalesEnZona.some(d=>d.bateria<=20);
                return (
                  <div key={pid} className="px-4 py-3 flex items-center gap-4 border-b transition-all hover:bg-white/[0.02] cursor-pointer"
                    style={{borderColor:'rgba(255,255,255,0.05)'}}
                    onClick={()=>{setActiveTab('mapa'); const first=animalesEnZona[0]; if(first) setSelectedDevId(first.id);}}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm"
                      style={{background:`${color}15`,border:`1.5px solid ${color}45`,color}}>
                      P{pid}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-white flex items-center gap-2 flex-wrap">
                        {b.label}
                        {hasOffline&&<span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/25">⚠ Sin señal</span>}
                        {hasLowBat&&<span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">⚡ Bat.baja</span>}
                      </div>
                      <div className="text-[10px] text-white/35">{b.ha} · {b.pasto} · {animalesEnZona.length} animal(es)</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {animalesEnZona.length>0
                        ?<div className="flex -space-x-1">
                          {animalesEnZona.slice(0,4).map(d=>(
                            <div key={d.id} className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] border border-black/30"
                              style={{background:`${d.activo?color:'#6b7280'}30`}}
                              title={d.animalNom}>
                              🐄
                            </div>
                          ))}
                          {animalesEnZona.length>4&&<div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] text-white/50" style={{background:'rgba(255,255,255,0.08)'}}>+{animalesEnZona.length-4}</div>}
                        </div>
                        :<span className="text-[10px] text-white/25 italic">Vacío</span>
                      }
                      <ChevronRight size={14} className="text-white/20"/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Geofence alerts */}
          <div className="grid sm:grid-cols-2 gap-3">
            {devices.filter(d=>d.vinculado&&(!d.activo||d.bateria<=20)).map(d=>(
              <div key={d.id} className="rounded-2xl p-4"
                style={{background:!d.activo?'rgba(248,113,113,0.06)':'rgba(251,191,36,0.06)',border:`1px solid ${!d.activo?'rgba(248,113,113,0.25)':'rgba(251,191,36,0.25)'}`}}>
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🐄</div>
                  <div className="flex-1">
                    <div className="font-bold text-sm text-white">{d.animalNom}</div>
                    <div className="text-[10px] text-white/40">{d.nombre} · {d.imei}</div>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {!d.activo&&<span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-red-500/15 text-red-400 border border-red-500/25">📵 Sin señal · {timeSince(d.ultimaActualizacion)}</span>}
                      {d.bateria<=20&&<span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25">⚡ Batería {Math.round(d.bateria)}%</span>}
                    </div>
                  </div>
                  <button onClick={()=>{setSelectedDevId(d.id);setActiveTab('mapa');}}
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{background:'rgba(0,200,255,0.1)',border:'1px solid rgba(0,200,255,0.25)',color:'#60a5fa'}}>
                    <Eye size={13}/>
                  </button>
                </div>
              </div>
            ))}
            {devices.filter(d=>d.vinculado&&(!d.activo||d.bateria<=20)).length===0&&(
              <div className="col-span-2 rounded-2xl p-8 text-center" style={{background:'rgba(74,222,128,0.04)',border:'1px solid rgba(74,222,128,0.15)'}}>
                <CheckCircle2 size={32} className="mx-auto mb-2 text-green-400 opacity-60"/>
                <div className="text-sm font-bold text-green-400">Todo en orden</div>
                <div className="text-xs text-white/25 mt-1">Todos los dispositivos tienen señal y batería normal</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB: LISTA DE DISPOSITIVOS
      ═══════════════════════════════════════════════════════ */}
      {activeTab==='lista'&&(
        <div className="space-y-3">
          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"/>
              <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Buscar por animal, IMEI…"
                className="w-full pl-8 pr-3 py-2 rounded-xl text-xs text-white"
                style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',outline:'none'}}/>
            </div>
            {(['todos','online','offline'] as const).map(f=>(
              <button key={f} onClick={()=>setFilterActivo(f)}
                className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
                style={filterActivo===f
                  ?{background:'rgba(0,200,255,0.15)',border:'1px solid rgba(0,200,255,0.4)',color:'#60a5fa'}
                  :{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.4)'}}>
                {f==='todos'?'Todos':f==='online'?'● Online':'○ Offline'}
              </button>
            ))}
          </div>

          {/* Device cards */}
          <div className="space-y-2">
            {filteredDevs.length===0
              ?<div className="rounded-2xl p-8 text-center" style={{background:'rgba(4,13,26,0.7)',border:'1px dashed rgba(255,255,255,0.07)'}}>
                <Signal size={28} className="mx-auto mb-2 opacity-20 text-blue-400"/>
                <p className="text-sm text-white/25">Sin dispositivos con esos filtros</p>
              </div>
              :filteredDevs.map(d=>{
                const color=POTREROS_COLORS[d.potreroId||1]||'#22c55e';
                const tipoInfo=TIPOS.find(t=>t.id===d.tipo);
                return (
                  <div key={d.id} className="rounded-2xl overflow-hidden group"
                    style={{background:'rgba(4,13,26,0.95)',border:`1px solid ${d.activo?'rgba(255,255,255,0.07)':'rgba(248,113,113,0.2)'}`}}>
                    <div className="flex items-center gap-4 p-4">
                      {/* Status indicator */}
                      <div className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{background:d.activo?'#4ade80':'#6b7280',boxShadow:d.activo?'0 0 8px rgba(74,222,128,0.6)':'none'}}/>
                      {/* Tipo emoji */}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{background:`${color}12`,border:`1px solid ${color}30`}}>
                        {tipoInfo?.emoji||'📡'}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-sm text-white">{d.animalNom}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                            style={{background:`${color}12`,color,border:`1px solid ${color}25`}}>
                            {tipoInfo?.label||d.tipo}
                          </span>
                          {!d.activo&&<span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-red-500/12 text-red-400 border border-red-500/25">Sin señal</span>}
                        </div>
                        <div className="text-[10px] text-white/35 mt-0.5">{d.nombre} · IMEI: {d.imei}</div>
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-white/30 flex-wrap">
                          <span>{POTREROS_BOUNDS[d.potreroId||1]?.label||'—'}</span>
                          <span>·</span>
                          <span>{timeSince(d.ultimaActualizacion)}</span>
                          {d.lat&&<span>· {d.lat.toFixed(4)}, {d.lng?.toFixed(4)}</span>}
                        </div>
                      </div>
                      {/* Battery */}
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 justify-end mb-1">
                          <BattIcon pct={d.bateria}/><span className="text-xs font-bold" style={{color:battColor(d.bateria)}}>{Math.round(d.bateria)}%</span>
                        </div>
                        <div className="w-16 h-1.5 rounded-full" style={{background:'rgba(255,255,255,0.07)'}}>
                          <div className="h-1.5 rounded-full" style={{width:`${d.bateria}%`,background:battColor(d.bateria)}}/>
                        </div>
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button onClick={()=>{setSelectedDevId(d.id);setActiveTab('mapa');}}
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{background:'rgba(0,200,255,0.1)',border:'1px solid rgba(0,200,255,0.2)',color:'#60a5fa'}}
                          title="Ver en mapa">
                          <Map size={12}/>
                        </button>
                        <button onClick={()=>removeDevice(d.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{background:'rgba(248,113,113,0.1)',border:'1px solid rgba(248,113,113,0.2)',color:'#f87171'}}
                          title="Desvincular">
                          <Trash2 size={12}/>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            }
          </div>

          <button onClick={()=>setActiveTab('vincular')}
            className="w-full py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:brightness-110"
            style={{background:'rgba(0,200,255,0.08)',border:'1.5px dashed rgba(0,200,255,0.25)',color:'#60a5fa'}}>
            <Plus size={14}/> Vincular nuevo dispositivo GPS
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB: VINCULAR NUEVO GPS
      ═══════════════════════════════════════════════════════ */}
      {activeTab==='vincular'&&(
        <div className="space-y-4">
          {formSaved&&<div className="rounded-2xl p-3 flex items-center gap-2" style={{background:'rgba(74,222,128,0.1)',border:'1px solid rgba(74,222,128,0.3)',color:'#4ade80'}}>
            <CheckCircle2 size={14}/> Dispositivo vinculado correctamente
          </div>}

          <div className="grid sm:grid-cols-3 gap-3">
            {/* Section 1: Real GPS */}
            <div className="rounded-2xl overflow-hidden" style={{background:'rgba(4,13,26,0.95)',border:'1px solid rgba(0,245,212,0.2)'}}>
              <div className="h-0.5" style={{background:'linear-gradient(90deg,#00f5d4,transparent)'}}/>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:'rgba(0,245,212,0.12)',border:'1px solid rgba(0,245,212,0.3)'}}>
                    <LocateFixed size={14} style={{color:'#00f5d4'}}/>
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">Posición GPS</div>
                    <div className="text-[9px] text-white/30">Geolocalización real del dispositivo</div>
                  </div>
                </div>
                {livePos&&(
                  <div className="rounded-xl p-3 mb-3" style={{background:'rgba(0,245,212,0.06)',border:'1px solid rgba(0,245,212,0.15)'}}>
                    <div className="text-[9px] text-white/30 mb-1">Posición actual</div>
                    <div className="text-xs font-bold" style={{color:'#00f5d4'}}>
                      {livePos.lat.toFixed(5)}<br/>{livePos.lng.toFixed(5)}
                    </div>
                    <div className="text-[9px] text-white/30 mt-1">±{livePos.acc}m · {timeSince(livePos.ts)}</div>
                  </div>
                )}
                {geoError&&<div className="rounded-xl p-2 mb-3 text-[10px]" style={{background:'rgba(248,113,113,0.08)',border:'1px solid rgba(248,113,113,0.2)',color:'#f87171'}}>{geoError}</div>}
                <div className="space-y-2">
                  <button onClick={getOnce} disabled={locating}
                    className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                    style={{background:'rgba(0,245,212,0.12)',border:'1px solid rgba(0,245,212,0.3)',color:'#00f5d4'}}>
                    {locating?<Loader2 size={12} className="animate-spin"/>:<LocateFixed size={12}/>}
                    {locating?'Obteniendo…':'Obtener posición'}
                  </button>
                  <button onClick={tracking?stopTracking:startTracking}
                    className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                    style={tracking
                      ?{background:'rgba(248,113,113,0.12)',border:'1px solid rgba(248,113,113,0.3)',color:'#f87171'}
                      :{background:'rgba(0,245,212,0.06)',border:'1px solid rgba(0,245,212,0.2)',color:'rgba(0,245,212,0.7)'}}>
                    {tracking?<><Pause size={12}/> Detener seguimiento</>:<><Play size={12}/> Seguimiento continuo</>}
                  </button>
                </div>
              </div>
            </div>

            {/* Section 2: Bluetooth scan */}
            <div className="rounded-2xl overflow-hidden" style={{background:'rgba(4,13,26,0.95)',border:'1px solid rgba(129,140,248,0.2)'}}>
              <div className="h-0.5" style={{background:'linear-gradient(90deg,#818cf8,transparent)'}}/>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:'rgba(129,140,248,0.12)',border:'1px solid rgba(129,140,248,0.3)'}}>
                    <Bluetooth size={14} className="text-indigo-400"/>
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">Escaneo BT</div>
                    <div className="text-[9px] text-white/30">Web Bluetooth · Collares cercanos</div>
                  </div>
                </div>
                <button onClick={scanBluetooth} disabled={scanning}
                  className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 mb-3 disabled:opacity-50"
                  style={{background:'rgba(129,140,248,0.12)',border:'1px solid rgba(129,140,248,0.3)',color:'#818cf8'}}>
                  {scanning?<Loader2 size={12} className="animate-spin"/>:<Radio size={12}/>}
                  {scanning?'Escaneando…':'Buscar collares'}
                </button>
                <div className="space-y-2 max-h-48 overflow-y-auto" style={{scrollbarWidth:'thin'}}>
                  {scanResults.map(r=>(
                    <div key={r.id} className="rounded-xl p-2.5"
                      style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(129,140,248,0.15)'}}>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px]"
                          style={{background:'rgba(129,140,248,0.12)'}}>
                          {TIPOS.find(t=>t.id===r.tipo)?.emoji||'📡'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-bold text-white truncate">{r.nombre}</div>
                          <div className="text-[9px] text-white/30">RSSI: {r.rssi} dBm</div>
                        </div>
                        <button onClick={()=>linkScanned(r)} disabled={linking===r.id}
                          className="px-2.5 py-1 rounded-lg text-[9px] font-bold flex items-center gap-1 disabled:opacity-50"
                          style={{background:'rgba(129,140,248,0.15)',border:'1px solid rgba(129,140,248,0.3)',color:'#818cf8'}}>
                          {linking===r.id?<Loader2 size={9} className="animate-spin"/>:<Link2 size={9}/>}
                          {linking===r.id?'…':'Vincular'}
                        </button>
                      </div>
                    </div>
                  ))}
                  {!scanning&&scanResults.length===0&&<p className="text-[10px] text-white/20 text-center py-4">Pulsa "Buscar collares" para iniciar</p>}
                </div>
              </div>
            </div>

            {/* Section 3: Manual registration */}
            <div className="rounded-2xl overflow-hidden" style={{background:'rgba(4,13,26,0.95)',border:'1px solid rgba(251,191,36,0.2)'}}>
              <div className="h-0.5" style={{background:'linear-gradient(90deg,#fbbf24,transparent)'}}/>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:'rgba(251,191,36,0.12)',border:'1px solid rgba(251,191,36,0.3)'}}>
                    <Plus size={14} className="text-amber-400"/>
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">Registro manual</div>
                    <div className="text-[9px] text-white/30">IMEI / ID · Cualquier tipo</div>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div>
                    <label className="text-[9px] text-white/30 uppercase tracking-wider block mb-1">Nombre del collar *</label>
                    <input value={form.nombre} onChange={e=>setForm(p=>({...p,nombre:e.target.value}))} placeholder="Ej: Collar Valentina"
                      className="w-full px-3 py-2 rounded-xl text-xs text-white"
                      style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',outline:'none'}}/>
                  </div>
                  <div>
                    <label className="text-[9px] text-white/30 uppercase tracking-wider block mb-1">IMEI / ID del collar *</label>
                    <input value={form.imei} onChange={e=>setForm(p=>({...p,imei:e.target.value}))} placeholder="354071XXXXXXXXX"
                      className="w-full px-3 py-2 rounded-xl text-xs text-white"
                      style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',outline:'none'}}/>
                  </div>
                  <div>
                    <label className="text-[9px] text-white/30 uppercase tracking-wider block mb-1">Tipo de dispositivo</label>
                    <select value={form.tipo} onChange={e=>setForm(p=>({...p,tipo:e.target.value as GpsDevice['tipo']}))}
                      className="w-full px-2 py-2 rounded-xl text-xs text-white"
                      style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',outline:'none'}}>
                      {TIPOS.map(t=><option key={t.id} value={t.id} style={{background:'#0e1e38'}}>{t.emoji} {t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] text-white/30 uppercase tracking-wider block mb-1">Asignar a animal</label>
                    <select value={form.animalId} onChange={e=>setForm(p=>({...p,animalId:e.target.value}))}
                      className="w-full px-2 py-2 rounded-xl text-xs text-white"
                      style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',outline:'none'}}>
                      <option value="" style={{background:'#0e1e38'}}>Sin asignar</option>
                      {animals.map(a=><option key={a.id} value={a.id} style={{background:'#0e1e38'}}>{a.nombre} — {a.id}</option>)}
                    </select>
                  </div>
                  <button onClick={addManualDevice} disabled={!form.nombre||!form.imei}
                    className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-40 transition-all"
                    style={{background:'rgba(251,191,36,0.15)',border:'1px solid rgba(251,191,36,0.35)',color:'#fbbf24'}}>
                    <Link2 size={12}/> Vincular dispositivo
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Compatible devices info */}
          <div className="rounded-2xl p-4" style={{background:'rgba(4,13,26,0.7)',border:'1px solid rgba(255,255,255,0.06)'}}>
            <div className="text-[10px] text-white/30 uppercase tracking-wider mb-3">Dispositivos compatibles</div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {TIPOS.map(t=>(
                <div key={t.id} className="rounded-xl p-2.5" style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)'}}>
                  <div className="text-base mb-1">{t.emoji}</div>
                  <div className="text-xs font-bold text-white">{t.label}</div>
                  <div className="text-[9px] text-white/30 mt-0.5">{t.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Device History Dialog ── */}
      <Dialog open={!!detailDev} onOpenChange={open=>!open&&setDetailDev(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin size={15} className="text-blue-400"/>{detailDev?.animalNom} — Historial GPS
            </DialogTitle>
          </DialogHeader>
          {detailDev&&(
            <div className="space-y-3">
              <div className="rounded-xl p-3" style={{background:'rgba(0,200,255,0.06)',border:'1px solid rgba(0,200,255,0.15)'}}>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    {l:'Estado',    v:detailDev.activo?'En línea':'Offline', c:detailDev.activo?'#4ade80':'#f87171'},
                    {l:'Batería',   v:`${Math.round(detailDev.bateria)}%`,   c:battColor(detailDev.bateria)},
                    {l:'Tipo',      v:TIPOS.find(t=>t.id===detailDev.tipo)?.label||detailDev.tipo},
                    {l:'IMEI',      v:detailDev.imei},
                    {l:'Vinculado', v:detailDev.fechaVin},
                    {l:'Señal',     v:timeSince(detailDev.ultimaActualizacion)},
                  ].map(r=>(
                    <div key={r.l} className="rounded-lg p-2" style={{background:'rgba(255,255,255,0.04)'}}>
                      <div className="text-[9px] text-white/30 mb-0.5">{r.l}</div>
                      <div className="font-bold" style={{color:r.c||'rgba(255,255,255,0.8)'}}>{r.v}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-[10px] text-white/30 text-center">
                Historial de posiciones disponible con plan PRO · <Link href="/planes"><span className="text-blue-400 cursor-pointer">Ver planes</span></Link>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={()=>setDetailDev(null)}>Cerrar</Button>
            <Button style={{background:'rgba(0,200,255,0.15)',border:'1px solid rgba(0,200,255,0.35)',color:'#60a5fa'}}
              onClick={()=>{setDetailDev(null);setSelectedDevId(detailDev!.id);setActiveTab('mapa');}}>
              <Map size={13} className="mr-1.5"/>Ver en mapa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
