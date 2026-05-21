import { useState, useEffect, useRef, useCallback } from "react";
import { useAppState } from "../lib/data";
import { useAuth } from "../lib/auth";
import {
  Scale, Bluetooth, BluetoothConnected, BluetoothOff, BluetoothSearching,
  Plus, Download, RefreshCw, CheckCircle2, TrendingUp, TrendingDown,
  Minus, Zap, BarChart3, Search, Printer, Calculator, Wifi, WifiOff,
  AlertTriangle, Settings2, Play, Pause, Target, Cpu, Radio,
  ChevronRight, Activity, Beef, Star, Clock, DollarSign, FileText,
  List, UserPlus, X as XIcon, Usb, Cable,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

/* ─────────────────────────────────────────────────────────────────────────────
   CONTROLADORES BLUETOOTH
───────────────────────────────────────────────────────────────────────────── */
const BT_CONTROLLERS = [
  {
    id: "tru-test-xr3", nombre: "Tru-Test XR3000", marca: "Tru-Test",
    tipo: "Indicador electrónico Bluetooth", protocol: "uart",
    color: "#00f5d4", glow: "0,245,212",
    services: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"],
    nameFilter: ["TruTest","Tru-Test","XR3"],
    desc: "Báscula de precisión ±0.1 kg · BLE 5.0 · IP67", icon: "⚖️",
  },
  {
    id: "gallagher-w210-bt", nombre: "Gallagher W210 BT", marca: "Gallagher",
    tipo: "Báscula WiFi/BT", protocol: "weight_scale",
    color: "#fbbf24", glow: "251,191,36",
    services: ["weight_scale","0000181d-0000-1000-8000-00805f9b34fb"],
    nameFilter: ["Gallagher","W210","W450"],
    desc: "NLIS · 300 kg · ±50 g · Bluetooth 4.2", icon: "🏋️",
  },
  {
    id: "ahi-caroplus", nombre: "AHI Caroplus 2", marca: "AHI",
    tipo: "Báscula RFID Bluetooth", protocol: "uart",
    color: "#a78bfa", glow: "167,139,250",
    services: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"],
    nameFilter: ["AHI","Caroplus"],
    desc: "RFID ISO 11784 · BLE · CSV export", icon: "📡",
  },
  {
    id: "tru-test-s3", nombre: "Tru-Test S3", marca: "Tru-Test",
    tipo: "Indicador portátil BLE", protocol: "uart",
    color: "#34d399", glow: "52,211,153",
    services: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"],
    nameFilter: ["TruTest","S3000","S3 "],
    desc: "Portátil · 5000 registros · BLE 5.0", icon: "📱",
  },
  {
    id: "simcro-biotrack", nombre: "Simcro BioTrack", marca: "Simcro",
    tipo: "Panel RFID + Báscula", protocol: "uart",
    color: "#f87171", glow: "248,113,113",
    services: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"],
    nameFilter: ["Simcro","BioTrack"],
    desc: "ISO 11785 · EID lectura dual · Colombia", icon: "🔖",
  },
  {
    id: "zee-tag-bt", nombre: "Zee Tag EID BT", marca: "Zee Tag",
    tipo: "Panel RFID Bluetooth", protocol: "uart",
    color: "#fb923c", glow: "251,146,60",
    services: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"],
    nameFilter: ["ZeeTag","Zee","EID"],
    desc: "EID ISO 11784/85 · Bluetooth · Colombia", icon: "🏷️",
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   CONTROLADORES COM/SERIAL (cableados USB-Serial / RS232)
───────────────────────────────────────────────────────────────────────────── */
const COM_CONTROLLERS = [
  {
    id: "tru-test-xr3-com", nombre: "Tru-Test XR3000 COM", marca: "Tru-Test",
    tipo: "RS232 / USB-Serial", baudRate: 9600, dataBits: 8 as const,
    stopBits: 1 as const, parity: "none" as const,
    color: "#00f5d4", glow: "0,245,212",
    patterns: [/(?:STW,?\s*)([0-9]{2,4}\.?\d{0,2})/i, /^([0-9]{3,4}\.?\d{0,1})\s*(?:kg)?$/],
    desc: "RS232/USB · 9600 bps · formato STW · IP67", icon: "⚖️",
  },
  {
    id: "gallagher-w210-com", nombre: "Gallagher W210 COM", marca: "Gallagher",
    tipo: "RS232 / USB-Serial", baudRate: 9600, dataBits: 8 as const,
    stopBits: 1 as const, parity: "none" as const,
    color: "#fbbf24", glow: "251,191,36",
    patterns: [/^([0-9]{3,4}\.?\d{0,1})\s*(?:kg)?$/i, /W0*([0-9]{3,4}\.?\d{0,1})/],
    desc: "RS232 · 9600 bps · NLIS compatible", icon: "🏋️",
  },
  {
    id: "sema-bascula", nombre: "SEMA Báscula", marca: "SEMA",
    tipo: "COM / USB · Colombiana", baudRate: 9600, dataBits: 8 as const,
    stopBits: 1 as const, parity: "none" as const,
    color: "#f59e0b", glow: "245,158,11",
    patterns: [/([0-9]{2,4}\.?\d{0,2})\s*(?:Kg|KG|kg)/i, /^([0-9]{3,4}\.?\d{0,2})$/],
    desc: "COM · Marca colombiana · Pecuaria", icon: "🇨🇴",
  },
  {
    id: "ruddweigh-600", nombre: "Ruddweigh 600", marca: "Ruddweigh",
    tipo: "RS232 · Indicador portátil", baudRate: 4800, dataBits: 8 as const,
    stopBits: 1 as const, parity: "none" as const,
    color: "#a3e635", glow: "163,230,53",
    patterns: [/W\s*([0-9]{3,4}\.?\d{0,2})/i, /[+\-]\s*([0-9]{3,4}\.?\d{0,2})\s*[Ss]/],
    desc: "RS232 · 4800 bps · Australia/Latam", icon: "🔌",
  },
  {
    id: "agrident-apr650", nombre: "Agrident APR650", marca: "Agrident",
    tipo: "USB-Serial RFID + Peso", baudRate: 115200, dataBits: 8 as const,
    stopBits: 1 as const, parity: "none" as const,
    color: "#38bdf8", glow: "56,189,248",
    patterns: [/W=\s*([0-9]{3,4}\.?\d{0,2})/i, /(?:weight|peso)[\s:=]*([0-9]{3,4}\.?\d{0,2})/i],
    desc: "USB · 115200 bps · RFID ISO 11784 + peso", icon: "📟",
  },
  {
    id: "mettler-toledo", nombre: "Mettler Toledo IND", marca: "Mettler Toledo",
    tipo: "RS232 / Ethernet · Industrial", baudRate: 9600, dataBits: 8 as const,
    stopBits: 1 as const, parity: "none" as const,
    color: "#e879f9", glow: "232,121,249",
    patterns: [/S\s+S\s+([0-9]{3,4}\.?\d{0,3})\s*kg/i, /([0-9]{3,4}\.?\d{0,3})\s*(?:kg)/i],
    desc: "RS232 · 9600 bps · formato SCS · ±0.05 kg", icon: "🏭",
  },
  {
    id: "toledo-prix3", nombre: "Toledo Prix 3", marca: "Toledo do Brasil",
    tipo: "COM · Uso pecuario", baudRate: 9600, dataBits: 7 as const,
    stopBits: 2 as const, parity: "even" as const,
    color: "#fb7185", glow: "251,113,133",
    patterns: [/([0-9]{3,4}\.?\d{0,2})\s*(?:kg|KG)/i],
    desc: "COM · 9600 7E2 · Brasil/Colombia", icon: "⚡",
  },
  {
    id: "generic-com", nombre: "Generic RS232", marca: "Genérico",
    tipo: "Cualquier báscula COM/RS232", baudRate: 9600, dataBits: 8 as const,
    stopBits: 1 as const, parity: "none" as const,
    color: "#94a3b8", glow: "148,163,184",
    patterns: [/([0-9]{3,4}\.?\d{0,2})/],
    desc: "Genérico · detecta cualquier número >100 kg", icon: "🔧",
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   REFERENCIAS DE PESO POR RAZA
───────────────────────────────────────────────────────────────────────────── */
const PESOS_RAZA: Record<string, Record<string, { min: number; max: number; prom: number }>> = {
  Holstein:  { "Vaca adulta":{min:490,max:650,prom:560},Novilla:{min:280,max:380,prom:330},Ternero:{min:40,max:120,prom:80},Ternera:{min:38,max:110,prom:75},Toro:{min:700,max:950,prom:820} },
  Brahman:   { "Vaca adulta":{min:400,max:580,prom:490},Novilla:{min:250,max:360,prom:300},Ternero:{min:35,max:100,prom:65},Ternera:{min:32,max:95, prom:60},Toro:{min:650,max:900,prom:780} },
  Simmental: { "Vaca adulta":{min:520,max:700,prom:600},Novilla:{min:300,max:420,prom:360},Ternero:{min:45,max:130,prom:90},Ternera:{min:42,max:125,prom:85},Toro:{min:750,max:1000,prom:870} },
  Jersey:    { "Vaca adulta":{min:330,max:470,prom:400},Novilla:{min:200,max:290,prom:245},Ternero:{min:25,max:80, prom:52},Ternera:{min:24,max:76, prom:49},Toro:{min:500,max:700,prom:600} },
  "Gyr X":   { "Vaca adulta":{min:380,max:550,prom:470},Novilla:{min:240,max:350,prom:290},Ternero:{min:32,max:95, prom:62},Ternera:{min:30,max:90, prom:58},Toro:{min:600,max:850,prom:730} },
};
function getPesoRef(raza: string, cat: string) {
  return PESOS_RAZA[raza]?.[cat] ?? { min: 100, max: 800, prom: 400 };
}

type BtStatus = "idle" | "scanning" | "connected" | "simulating" | "error";
type SerialStatus = "idle" | "connecting" | "connected" | "error";

interface PesajeRec {
  id: number; animalId: string; animalNombre: string;
  raza?: string; categoria: string; peso: number; pesoAnterior: number;
  fecha: string; hora: string; metodo: string; dispositivo: string;
  operador: string; observacion: string; lote: string;
  valorKilo?: number; valorTotal?: number;
  condicionCorporal?: string; temperatura?: string; estadoSanitario?: string;
  potreroActual?: string; observacionVet?: string; proximaVacuna?: string;
}

function fmt(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
}
function fmtDate() { return new Date().toLocaleDateString("es-CO"); }

/* ─────────────────────────────────────────────────────────────────────────────
   PANTALLA PESO EN VIVO
───────────────────────────────────────────────────────────────────────────── */
function LiveScale({ weight, stability, stable, status, onCapture, autoCapture, connectionLabel }: {
  weight: number | null; stability: number; stable: boolean;
  status: BtStatus | SerialStatus; onCapture: () => void; autoCapture: boolean;
  connectionLabel?: string;
}) {
  const connected = status === "connected" || status === "simulating";
  return (
    <div className="relative rounded-2xl overflow-hidden flex flex-col items-center justify-center py-8 px-6"
      style={{
        background: stable ? "linear-gradient(145deg,rgba(57,255,126,0.08),rgba(0,200,100,0.04))" : "linear-gradient(145deg,rgba(255,149,0,0.06),rgba(255,100,0,0.03))",
        border: stable ? "1px solid rgba(57,255,126,0.35)" : connected ? "1px solid rgba(255,149,0,0.3)" : "1px solid rgba(255,255,255,0.08)",
        boxShadow: stable ? "0 0 32px rgba(57,255,126,0.15)" : "none",
        minHeight: 200,
      }}>
      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
        style={{
          background: status === "connected" ? "rgba(57,255,126,0.15)" : status === "simulating" ? "rgba(0,200,255,0.15)" : "rgba(255,255,255,0.06)",
          border: `1px solid ${status === "connected" ? "rgba(57,255,126,0.4)" : status === "simulating" ? "rgba(0,200,255,0.35)" : "rgba(255,255,255,0.1)"}`,
          color: status === "connected" ? "#39ff7e" : status === "simulating" ? "#00c8ff" : "#666",
        }}>
        {status === "connected" && <><BluetoothConnected size={10} /> {connectionLabel || "Báscula conectada"}</>}
        {status === "simulating" && <><Activity size={10} className="animate-pulse" /> Simulación</>}
        {(status === "scanning" || status === "connecting") && <><BluetoothSearching size={10} className="animate-pulse" /> Buscando...</>}
        {(status === "idle" || status === "error") && <><BluetoothOff size={10} /> Sin conexión</>}
      </div>
      {connected && weight !== null ? (
        <>
          <div className="font-black text-center leading-none mb-3 transition-all"
            style={{ fontSize:"clamp(52px,10vw,80px)", fontFamily:"'Sora',monospace", color: stable ? "#39ff7e" : "#ff9500", textShadow: stable ? "0 0 30px rgba(57,255,126,0.6)" : "0 0 20px rgba(255,149,0,0.5)", letterSpacing:"-0.02em" }}>
            {weight.toFixed(1)}
            <span className="text-2xl ml-2 font-bold" style={{ color:"rgba(255,255,255,0.4)", textShadow:"none" }}>kg</span>
          </div>
          <div className="w-full max-w-[260px] mb-4">
            <div className="flex justify-between text-[10px] mb-1" style={{ color:"rgba(255,255,255,0.35)" }}>
              <span>Estabilidad</span>
              <span className={stable ? "text-green-400 font-bold" : ""}>{stability}%</span>
            </div>
            <div className="h-2 rounded-full" style={{ background:"rgba(255,255,255,0.08)" }}>
              <div className="h-2 rounded-full transition-all duration-300"
                style={{ width:`${stability}%`, background: stability >= 90 ? "linear-gradient(90deg,#39ff7e,#00f5d4)" : stability >= 50 ? "linear-gradient(90deg,#fbbf24,#f59e0b)" : "linear-gradient(90deg,#f87171,#ef4444)", boxShadow: stability >= 90 ? "0 0 8px rgba(57,255,126,0.5)" : "none" }} />
            </div>
          </div>
          {stable ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-green-400 mb-1">
                <CheckCircle2 size={14} /> Peso estable — Listo para capturar
              </div>
              <Button onClick={onCapture} className="gap-2 font-bold text-sm h-10 px-6"
                style={{ background:"linear-gradient(135deg,#39ff7e,#00c864)", color:"#052010", boxShadow:"0 0 20px rgba(57,255,126,0.4)" }}>
                <Target size={16} /> Capturar peso
              </Button>
              {autoCapture && <p className="text-[10px] text-green-400/60">Auto-captura activa</p>}
            </div>
          ) : (
            <p className="text-xs animate-pulse" style={{ color:"rgba(255,149,0,0.7)" }}>Pesando... mantener animal quieto</p>
          )}
        </>
      ) : (
        <div className="text-center">
          <Scale size={48} className="mx-auto mb-3 opacity-10" />
          <p className="text-sm" style={{ color:"rgba(255,255,255,0.3)" }}>
            {(status === "scanning" || status === "connecting") ? "Buscando báscula..." : "Conectar báscula para ver peso en vivo"}
          </p>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   IMPRIMIR RECIBO INDIVIDUAL (ventana separada — solo el animal pesado)
───────────────────────────────────────────────────────────────────────────── */
function imprimirReciboAnimal(p: PesajeRec) {
  const diff = p.peso - p.pesoAnterior;
  const ref = getPesoRef(p.raza || "", p.categoria);
  const vt = p.peso * (p.valorKilo || 0);
  const rangoMsg = p.peso >= ref.min && p.peso <= ref.max ? "✓ Dentro del rango esperado"
    : p.peso < ref.min ? "⚠ Por debajo del mínimo de raza" : "↑ Excelente condición corporal";

  const html = `<!DOCTYPE html><html><head><title>Recibo Pesaje — ${p.animalNombre}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Courier New', monospace; font-size: 12px; background: #fff; color: #111; padding: 16px; max-width: 320px; margin: 0 auto; }
  .header { text-align: center; border-bottom: 2px solid #1a4a2e; padding-bottom: 10px; margin-bottom: 12px; }
  .farm { font-size: 18px; font-weight: bold; color: #1a4a2e; }
  .sub { font-size: 10px; color: #666; margin-top: 2px; }
  .title { font-size: 13px; font-weight: bold; margin-top: 8px; text-transform: uppercase; letter-spacing: 1px; }
  .folio { font-size: 10px; color: #888; margin-top: 2px; }
  .section { margin: 10px 0; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
  .section-title { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #666; margin-bottom: 6px; }
  .animal-name { font-size: 16px; font-weight: bold; color: #1a4a2e; }
  .animal-id { font-size: 11px; color: #888; }
  .row { display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px dotted #eee; }
  .row:last-child { border: none; }
  .label { color: #666; }
  .value { font-weight: bold; }
  .peso-big { text-align: center; font-size: 32px; font-weight: bold; color: #1a4a2e; padding: 10px 0; }
  .peso-unit { font-size: 14px; color: #666; }
  .diff-pos { color: #1b5e20; font-weight: bold; }
  .diff-neg { color: #b71c1c; font-weight: bold; }
  .valor { text-align: center; font-size: 16px; font-weight: bold; color: #1a4a2e; padding: 6px; background: #f0f7f0; border-radius: 4px; }
  .ref { font-size: 10px; color: #888; text-align: center; margin-top: 4px; }
  .footer { text-align: center; font-size: 10px; color: #999; margin-top: 16px; border-top: 1px solid #eee; padding-top: 8px; }
  .firma { margin-top: 40px; border-top: 1px solid #333; padding-top: 4px; text-align: center; font-size: 10px; color: #666; }
  @media print {
    body { padding: 0; }
    .no-print { display: none !important; }
  }
</style>
</head><body>
<div class="header">
  <div class="farm">🐄 GanaderIA PRO</div>
  <div class="sub">Ganadería Inteligente · Colombia</div>
  <div class="title">Recibo de Pesaje Individual</div>
  <div class="folio">Folio #${p.id} · ${new Date().toLocaleDateString("es-CO")} · ${p.hora}</div>
</div>

<div class="section">
  <div class="section-title">Identificación del Animal</div>
  <div class="animal-name">${p.animalNombre}</div>
  <div class="animal-id">Arete: ${p.animalId}</div>
  <div style="margin-top:6px;">
    <div class="row"><span class="label">Raza:</span><span class="value">${p.raza || "—"}</span></div>
    <div class="row"><span class="label">Categoría:</span><span class="value">${p.categoria}</span></div>
    <div class="row"><span class="label">Lote:</span><span class="value">${p.lote}</span></div>
    ${p.potreroActual ? `<div class="row"><span class="label">Potrero:</span><span class="value">${p.potreroActual}</span></div>` : ""}
  </div>
</div>

<div class="section">
  <div class="section-title">Resultado del Pesaje</div>
  <div class="peso-big">${p.peso.toFixed(1)} <span class="peso-unit">kg</span></div>
  <div class="row"><span class="label">Peso anterior:</span><span class="value">${p.pesoAnterior.toFixed(1)} kg</span></div>
  <div class="row"><span class="label">Diferencia:</span>
    <span class="${diff >= 0 ? "diff-pos" : "diff-neg"}">${diff >= 0 ? "+" : ""}${diff.toFixed(1)} kg</span></div>
  ${p.condicionCorporal ? `<div class="row"><span class="label">Cond. corporal:</span><span class="value">${p.condicionCorporal}</span></div>` : ""}
  ${p.temperatura ? `<div class="row"><span class="label">Temperatura:</span><span class="value">${p.temperatura} °C</span></div>` : ""}
  ${p.estadoSanitario ? `<div class="row"><span class="label">Estado sanit.:</span><span class="value">${p.estadoSanitario}</span></div>` : ""}
  ${p.proximaVacuna ? `<div class="row"><span class="label">Próx. vacuna:</span><span class="value">${p.proximaVacuna}</span></div>` : ""}
  <div class="ref">${rangoMsg} · (Rango raza: ${ref.min}–${ref.max} kg · Prom: ${ref.prom} kg)</div>
</div>

${(p.valorKilo || 0) > 0 ? `
<div class="section">
  <div class="section-title">Valorización</div>
  <div class="valor">${fmt(vt)}</div>
  <div class="ref">${fmt(p.valorKilo || 0)}/kg × ${p.peso.toFixed(1)} kg</div>
</div>` : ""}

<div class="section">
  <div class="section-title">Registro</div>
  <div class="row"><span class="label">Fecha:</span><span class="value">${p.fecha} ${p.hora}</span></div>
  <div class="row"><span class="label">Operador:</span><span class="value">${p.operador}</span></div>
  <div class="row"><span class="label">Método:</span><span class="value">${p.metodo === "bluetooth" ? "Báscula BT" : p.metodo === "serial" ? "Báscula COM" : p.metodo === "simulated" ? "Simulado" : "Manual"}</span></div>
  ${p.dispositivo ? `<div class="row"><span class="label">Dispositivo:</span><span class="value">${p.dispositivo}</span></div>` : ""}
  ${p.observacion ? `<div class="row" style="flex-direction:column;"><span class="label">Observación:</span><span style="margin-top:2px;font-size:10px;">${p.observacion}</span></div>` : ""}
  ${p.observacionVet ? `<div class="row" style="flex-direction:column;"><span class="label">Obs. vet.:</span><span style="margin-top:2px;font-size:10px;">${p.observacionVet}</span></div>` : ""}
</div>

<div class="firma">Responsable: ___________________________</div>
<div class="footer">GanaderIA PRO · Gestión Ganadera Inteligente<br>Este recibo corresponde ÚNICAMENTE al animal indicado<br>${new Date().toLocaleString("es-CO")}</div>

<div class="no-print" style="text-align:center;margin-top:16px;">
  <button onclick="window.print()" style="background:#1a4a2e;color:white;border:none;padding:10px 24px;border-radius:6px;cursor:pointer;font-size:14px;">🖨️ Imprimir</button>
  <button onclick="window.close()" style="background:#eee;color:#333;border:none;padding:10px 16px;border-radius:6px;cursor:pointer;font-size:14px;margin-left:8px;">Cerrar</button>
</div>
</body></html>`;

  const win = window.open("", "_blank", "width=420,height=700,scrollbars=yes");
  if (win) { win.document.write(html); win.document.close(); }
}

/* ─────────────────────────────────────────────────────────────────────────────
   COMPONENTE PRINCIPAL
───────────────────────────────────────────────────────────────────────────── */
export default function Pesaje() {
  const { animals, pesajes, setPesajes, setAnimals, potreros } = useAppState();
  const { user } = useAuth();

  /* Bluetooth */
  const [btStatus, setBtStatus] = useState<BtStatus>("idle");
  const [selectedBtCtrl, setSelectedBtCtrl] = useState(BT_CONTROLLERS[0]);
  const [btError, setBtError] = useState("");
  const btDeviceRef = useRef<any>(null);

  /* COM / Serial */
  const [serialStatus, setSerialStatus] = useState<SerialStatus>("idle");
  const [selectedComCtrl, setSelectedComCtrl] = useState(COM_CONTROLLERS[0]);
  const [serialError, setSerialError] = useState("");
  const serialPortRef = useRef<any>(null);
  const serialReaderRef = useRef<any>(null);

  /* Live weight (shared) */
  const [liveWeight, setLiveWeight] = useState<number | null>(null);
  const [stability, setStability] = useState(0);
  const [stable, setStable] = useState(false);
  const [autoCapture, setAutoCapture] = useState(false);
  const weightSamplesRef = useRef<number[]>([]);
  const simRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Animal selection */
  const [selectedAnimal, setSelectedAnimal] = useState(animals[0]);
  const [searchAnim, setSearchAnim] = useState("");

  /* Queue */
  const [queueMode, setQueueMode] = useState(false);
  const [animalQueue, setAnimalQueue] = useState<string[]>([]);
  const [queueIdx, setQueueIdx] = useState(0);

  /* Dialogs */
  const [captureDialogOpen, setCaptureDialogOpen] = useState(false);
  const [capturedWeight, setCapturedWeight] = useState<number>(0);
  const [manualOpen, setManualOpen] = useState(false);
  const [showNewAnimal, setShowNewAnimal] = useState(false);

  /* Capture detail form */
  const [detCondicion, setDetCondicion] = useState("3.0");
  const [detTemperatura, setDetTemperatura] = useState("");
  const [detEstadoSan, setDetEstadoSan] = useState("Sano");
  const [detPotrero, setDetPotrero] = useState("");
  const [detObsVet, setDetObsVet] = useState("");
  const [detProxVac, setDetProxVac] = useState("");
  const [detValorKilo, setDetValorKilo] = useState("11000");
  const [detObs, setDetObs] = useState("");

  /* Manual form */
  const [manualPeso, setManualPeso] = useState("");
  const [manualAnimalId, setManualAnimalId] = useState(animals[0]?.id || "");

  /* New animal form */
  const [newAId, setNewAId] = useState(""); const [newANombre, setNewANombre] = useState("");
  const [newARaza, setNewARaza] = useState("Holstein"); const [newACat, setNewACat] = useState("Vaca adulta");
  const [newALote, setNewALote] = useState("Lote A");

  /* Connection tab */
  const [connTab, setConnTab] = useState<"bt" | "com" | "manual">("bt");

  const manualAnimal = animals.find(a => a.id === manualAnimalId) || animals[0];
  const filtered = animals.filter(a =>
    a.nombre.toLowerCase().includes(searchAnim.toLowerCase()) || a.id.toLowerCase().includes(searchAnim.toLowerCase())
  );

  /* ── Stability calculator ── */
  const updateStabilityFromSamples = useCallback((w: number) => {
    const samples = weightSamplesRef.current;
    samples.push(w);
    if (samples.length > 8) samples.shift();
    if (samples.length < 4) { setStability(Math.min(40, samples.length * 10)); setStable(false); return; }
    const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
    const maxDev = Math.max(...samples.map(s => Math.abs(s - avg)));
    const pct = Math.max(0, Math.min(100, Math.round(100 - maxDev * 20)));
    setStability(pct);
    const isStable = pct >= 90 && samples.length >= 6;
    setStable(isStable);
  }, []);

  /* ── Simulation ── */
  const startSimulation = useCallback((animal?: typeof animals[0]) => {
    if (simRef.current) clearInterval(simRef.current);
    weightSamplesRef.current = [];
    const base = animal
      ? getPesoRef(animal.raza, animal.categoria).prom
      : getPesoRef(selectedAnimal?.raza || "", selectedAnimal?.categoria || "").prom;
    let ticks = 0;
    simRef.current = setInterval(() => {
      ticks++;
      const noise = ticks < 6 ? (Math.random() - 0.5) * 10 : (Math.random() - 0.5) * 1.2;
      const w = +(base + noise).toFixed(1);
      setLiveWeight(w);
      updateStabilityFromSamples(w);
    }, 550);
  }, [selectedAnimal, updateStabilityFromSamples]);

  /* ── Bluetooth connect ── */
  const connectBluetooth = async () => {
    setBtStatus("scanning"); setBtError(""); weightSamplesRef.current = [];
    if ("bluetooth" in navigator) {
      try {
        const nameFilters = selectedBtCtrl.nameFilter.map(prefix => ({ namePrefix: prefix }));
        const device = await (navigator as any).bluetooth.requestDevice({
          filters: [...nameFilters, { services: ["weight_scale"] }],
          optionalServices: ["weight_scale","0000181d-0000-1000-8000-00805f9b34fb","6e400001-b5a3-f393-e0a9-e50e24dcca9e","battery_service"],
        });
        btDeviceRef.current = device;
        const server = await device.gatt!.connect();
        let handlerAttached = false;
        try {
          const svc = await server.getPrimaryService("weight_scale");
          const char = await svc.getCharacteristic("weight_measurement");
          await char.startNotifications();
          char.addEventListener("characteristicvaluechanged", (e: Event) => {
            const val = (e.target as any).value as DataView;
            const flags = val.getUint8(0); const unit = flags & 0x01;
            const raw = val.getUint16(1, true);
            const w = unit === 0 ? raw * 0.005 : raw * 0.01 * 0.453592;
            const rounded = Math.round(w * 10) / 10; setLiveWeight(rounded); updateStabilityFromSamples(rounded);
          });
          handlerAttached = true;
        } catch { /* try UART */ }
        if (!handlerAttached) {
          try {
            const svc = await server.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");
            const char = await svc.getCharacteristic("6e400003-b5a3-f393-e0a9-e50e24dcca9e");
            await char.startNotifications();
            char.addEventListener("characteristicvaluechanged", (e: Event) => {
              const val = (e.target as any).value as DataView;
              const text = new TextDecoder().decode(val);
              const match = text.match(/(?:W0*|STW,\s*|[+\-]\s*)?(\d{2,4}\.?\d{0,2})/);
              if (match) { const w = parseFloat(match[1]); if (w > 0 && w < 3000) { setLiveWeight(Math.round(w * 10) / 10); updateStabilityFromSamples(w); } }
            });
            handlerAttached = true;
          } catch { /* neither service */ }
        }
        if (handlerAttached) {
          setBtStatus("connected");
          device.addEventListener("gattserverdisconnected", () => { setBtStatus("idle"); setLiveWeight(null); setStable(false); setStability(0); weightSamplesRef.current = []; });
          return;
        }
        server.disconnect();
      } catch (err: unknown) {
        const btErr = err as { name?: string; message?: string };
        if (btErr?.name !== "NotFoundError" && btErr?.name !== "NotAllowedError") { setBtError(`Error BT: ${btErr?.message || String(err)}`); setBtStatus("error"); return; }
      }
    }
    setBtStatus("simulating"); startSimulation();
  };

  const disconnectBluetooth = () => {
    if (simRef.current) { clearInterval(simRef.current); simRef.current = null; }
    if (btDeviceRef.current?.gatt?.connected) btDeviceRef.current.gatt.disconnect();
    btDeviceRef.current = null;
    setBtStatus("idle"); setLiveWeight(null); setStable(false); setStability(0); weightSamplesRef.current = []; setBtError("");
  };

  /* ── COM / Serial connect ── */
  const connectSerial = async () => {
    if (!("serial" in navigator)) {
      setSerialError("Web Serial no soportado. Usa Chrome o Edge en escritorio.");
      setSerialStatus("error"); return;
    }
    setSerialStatus("connecting"); setSerialError(""); weightSamplesRef.current = [];
    try {
      const port = await (navigator as any).serial.requestPort();
      await port.open({
        baudRate: selectedComCtrl.baudRate,
        dataBits: selectedComCtrl.dataBits,
        stopBits: selectedComCtrl.stopBits,
        parity: selectedComCtrl.parity,
        flowControl: "none",
      });
      serialPortRef.current = port;
      setSerialStatus("connected");

      /* Read loop */
      const decoder = new TextDecoderStream();
      port.readable.pipeTo(decoder.writable);
      const reader = decoder.readable.getReader();
      serialReaderRef.current = reader;

      let buffer = "";
      const readLoop = async () => {
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += value;
            const lines = buffer.split(/\r?\n/);
            buffer = lines.pop() || "";
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;
              for (const pat of selectedComCtrl.patterns) {
                const m = trimmed.match(pat);
                if (m) {
                  const w = parseFloat(m[1]);
                  if (w > 50 && w < 3000) {
                    setLiveWeight(Math.round(w * 10) / 10);
                    updateStabilityFromSamples(w);
                  }
                  break;
                }
              }
            }
          }
        } catch { /* port closed */ } finally { reader.releaseLock(); }
        setSerialStatus("idle"); setLiveWeight(null); setStable(false); setStability(0); weightSamplesRef.current = [];
      };
      readLoop();
    } catch (err: unknown) {
      const e = err as { message?: string };
      if ((e.message || "").includes("cancelled") || (e.message || "").includes("No port")) {
        setSerialStatus("idle");
      } else {
        setSerialError(`Error COM: ${e.message || String(err)}`);
        setSerialStatus("error");
      }
    }
  };

  const disconnectSerial = async () => {
    try {
      if (serialReaderRef.current) { await serialReaderRef.current.cancel(); serialReaderRef.current = null; }
      if (serialPortRef.current) { await serialPortRef.current.close(); serialPortRef.current = null; }
    } catch { /* ignore */ }
    setSerialStatus("idle"); setLiveWeight(null); setStable(false); setStability(0); weightSamplesRef.current = []; setSerialError("");
  };

  /* Restart simulation when animal changes */
  useEffect(() => {
    if (btStatus === "simulating") { setStable(false); setStability(0); weightSamplesRef.current = []; startSimulation(selectedAnimal); }
  }, [selectedAnimal]);

  useEffect(() => () => { if (simRef.current) clearInterval(simRef.current); }, []);

  /* ── Open capture detail dialog ── */
  const openCaptureDialog = useCallback((overrideWeight?: number) => {
    const w = overrideWeight ?? liveWeight;
    if (!w || !selectedAnimal) return;
    setCapturedWeight(w);
    setDetCondicion("3.0"); setDetTemperatura(""); setDetEstadoSan("Sano");
    setDetPotrero(""); setDetObsVet(""); setDetProxVac(""); setDetValorKilo("11000"); setDetObs("");
    setCaptureDialogOpen(true);
  }, [liveWeight, selectedAnimal]);

  /* Auto-capture: when stable, open dialog automatically if autoCapture */
  useEffect(() => {
    if (stable && autoCapture && liveWeight && !captureDialogOpen) {
      setTimeout(() => openCaptureDialog(liveWeight), 400);
    }
  }, [stable]);

  /* ── Save captured peso ── */
  const saveCapturedPeso = useCallback(() => {
    if (!capturedWeight || !selectedAnimal) return;
    const prev = pesajes.filter(p => p.animalId === selectedAnimal.id).sort((a, b) => b.id - a.id)[0];
    const now = new Date();
    const vk = Number(detValorKilo) || 11000;
    const activeStatus = btStatus === "connected" ? "bluetooth" : btStatus === "simulating" ? "simulated" : serialStatus === "connected" ? "serial" : "manual";
    const activeDevice = btStatus === "connected" || btStatus === "simulating" ? selectedBtCtrl.nombre : serialStatus === "connected" ? selectedComCtrl.nombre : "";
    const newP: PesajeRec = {
      id: Date.now(), animalId: selectedAnimal.id, animalNombre: selectedAnimal.nombre,
      raza: selectedAnimal.raza, categoria: selectedAnimal.categoria || "",
      peso: capturedWeight, pesoAnterior: prev?.peso ?? selectedAnimal.peso,
      fecha: now.toLocaleDateString("es-CO"),
      hora: now.toLocaleTimeString("es-CO", { hour:"2-digit", minute:"2-digit" }),
      metodo: activeStatus, dispositivo: activeDevice,
      operador: user?.nombre || "Sistema", observacion: detObs, lote: selectedAnimal.lote,
      valorKilo: vk, valorTotal: capturedWeight * vk,
      condicionCorporal: `CC ${detCondicion}`,
      temperatura: detTemperatura || undefined,
      estadoSanitario: detEstadoSan || undefined,
      potreroActual: detPotrero || undefined,
      observacionVet: detObsVet || undefined,
      proximaVacuna: detProxVac || undefined,
    };
    setPesajes([newP, ...pesajes]);
    setCaptureDialogOpen(false);
    setStable(false); setStability(0); weightSamplesRef.current = [];
    /* Auto-advance queue */
    if (queueMode && animalQueue.length > 0) {
      const nextIdx = queueIdx + 1;
      if (nextIdx < animalQueue.length) {
        const nextA = animals.find(a => a.id === animalQueue[nextIdx]);
        if (nextA) setTimeout(() => { setSelectedAnimal(nextA); setQueueIdx(nextIdx); weightSamplesRef.current = []; if (btStatus === "simulating") startSimulation(nextA); }, 1800);
      } else { setTimeout(() => { setQueueMode(false); setQueueIdx(0); setAnimalQueue([]); }, 1200); }
    }
    if (btStatus === "simulating") setTimeout(() => startSimulation(), 300);
    /* Print receipt automatically */
    imprimirReciboAnimal(newP);
  }, [capturedWeight, selectedAnimal, pesajes, btStatus, serialStatus, selectedBtCtrl, selectedComCtrl, user, setPesajes, startSimulation, detCondicion, detTemperatura, detEstadoSan, detPotrero, detObsVet, detProxVac, detValorKilo, detObs]);

  /* ── Pesaje manual ── */
  const handleManualAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const peso = Number(manualPeso);
    if (!peso || !manualAnimal) return;
    const prev = pesajes.filter(p => p.animalId === manualAnimal.id).sort((a, b) => b.id - a.id)[0];
    const now = new Date();
    const vk = Number(detValorKilo) || 11000;
    const newP: PesajeRec = {
      id: Date.now(), animalId: manualAnimal.id, animalNombre: manualAnimal.nombre,
      raza: manualAnimal.raza, categoria: manualAnimal.categoria || "",
      peso, pesoAnterior: prev?.peso ?? manualAnimal.peso,
      fecha: now.toLocaleDateString("es-CO"),
      hora: now.toLocaleTimeString("es-CO", { hour:"2-digit", minute:"2-digit" }),
      metodo: "manual", dispositivo: "", operador: user?.nombre || "",
      observacion: detObs, lote: manualAnimal.lote,
      valorKilo: vk, valorTotal: peso * vk,
      condicionCorporal: `CC ${detCondicion}`,
      temperatura: detTemperatura || undefined,
      estadoSanitario: detEstadoSan || undefined,
      potreroActual: detPotrero || undefined,
      observacionVet: detObsVet || undefined,
      proximaVacuna: detProxVac || undefined,
    };
    setPesajes([newP, ...pesajes]);
    setManualOpen(false); setManualPeso("");
    imprimirReciboAnimal(newP);
  };

  /* ── Registrar nuevo animal ── */
  const handleRegNewAnimal = () => {
    const tid = newAId.trim(); const tnombre = newANombre.trim();
    if (!tid || !tnombre || animals.find(a => a.id === tid)) return;
    const newA = { id:tid, nombre:tnombre, raza:newARaza, categoria:newACat, lote:newALote, peso:0, estado:"Activa", fechaNacimiento:"", registro:"NO", numeroRegistro:"", valorKilo:11000, litrosDia:0, partos:0 };
    setAnimals((prev: any[]) => [...prev, newA]);
    if (queueMode) { setAnimalQueue(prev => [...prev, tid]); } else { setSelectedAnimal(newA as any); }
    setShowNewAnimal(false); setNewAId(""); setNewANombre("");
  };

  /* ── Stats ── */
  const hoy = pesajes.filter(p => p.fecha === fmtDate()).length;
  const btCount = pesajes.filter(p => p.metodo === "bluetooth" || p.metodo === "serial").length;
  const pesoAvg = pesajes.length ? +(pesajes.reduce((s, p) => s + p.peso, 0) / pesajes.length).toFixed(1) : 0;
  const animalHistory = (aid: string) => pesajes.filter(p => p.animalId === aid).slice(0, 8).reverse().map((p, i) => ({ name: `#${i+1}`, kg: p.peso }));
  const selRef = selectedAnimal ? getPesoRef(selectedAnimal.raza, selectedAnimal.categoria) : null;
  const lastPesaje = selectedAnimal ? pesajes.filter(p => p.animalId === selectedAnimal.id)[0] : null;

  /* Active connection status (BT or Serial) */
  const isConnected = btStatus === "connected" || btStatus === "simulating" || serialStatus === "connected";
  const connStatus = serialStatus === "connected" ? serialStatus : btStatus;

  function exportCSV() {
    const h = ["ID","Nombre","Raza","Cat","Peso","PesoAnt","Dif","CC","Temp","EstSan","Potrero","Fecha","Hora","Método","Dispositivo","Operador","Obs","ObsVet","ProxVac","Valor/kg","ValorTotal"];
    const rows = pesajes.map(p => [p.animalId,p.animalNombre,p.raza||"",p.categoria,p.peso,p.pesoAnterior,+(p.peso-p.pesoAnterior).toFixed(1),p.condicionCorporal||"",p.temperatura||"",p.estadoSanitario||"",p.potreroActual||"",p.fecha,p.hora,p.metodo,p.dispositivo,p.operador,p.observacion,p.observacionVet||"",p.proximaVacuna||"",p.valorKilo||"",p.valorTotal||""].join(","));
    const csv = [h.join(","), ...rows].join("\n");
    const a = document.createElement("a"); a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `pesajes_${new Date().toLocaleDateString("es-CO").replace(/\//g,"-")}.csv`; a.click();
  }

  return (
    <div className="space-y-5 pb-8">
      {/* ── Banner ── */}
      <div className="rounded-2xl p-5 relative overflow-hidden"
        style={{ background:"linear-gradient(135deg,#1a0d00 0%,#2e1500 50%,#1a0800 100%)", border:"1px solid rgba(255,149,0,0.4)", boxShadow:"0 0 40px rgba(255,149,0,0.10)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background:"url('https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&q=30&auto=format&fit=crop') center/cover no-repeat", opacity:0.04 }} />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-[0.06] pointer-events-none"><Scale className="w-36 h-36 text-white" /></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background:"rgba(255,149,0,0.12)", border:"1px solid rgba(255,149,0,0.45)", boxShadow:"0 0 20px rgba(255,149,0,0.25)" }}>
              <Scale size={28} className="text-orange-300" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white" style={{ fontFamily:"Sora,sans-serif" }}>Pesaje de Animales</h1>
              <p className="text-sm mt-0.5" style={{ color:"rgba(255,180,80,0.8)" }}>BT real · COM/USB cableado · Tru-Test · Gallagher · SEMA · Ruddweigh · Agrident · Mettler</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: isConnected ? "rgba(57,255,126,0.2)" : "rgba(255,255,255,0.08)", color: isConnected ? "#39ff7e" : "#888" }}>
                  {btStatus === "connected" ? "● BT Báscula real" : btStatus === "simulating" ? "◎ Simulación activa" : serialStatus === "connected" ? "● COM Báscula cableada" : "○ Sin conexión"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button className="h-9 gap-1.5 text-sm" onClick={() => { setQueueMode(v => !v); if (queueMode) { setAnimalQueue([]); setQueueIdx(0); } }}
              style={{ background: queueMode ? "rgba(0,200,255,0.25)" : "rgba(0,200,255,0.10)", border:`1px solid ${queueMode ? "rgba(0,200,255,0.6)" : "rgba(0,200,255,0.3)"}`, color:"#00c8ff" }}>
              <List size={14} /> {queueMode ? "Cola activa" : "Modo Cola"}
            </Button>
            <Button className="h-9 gap-1.5 text-sm" onClick={exportCSV}
              style={{ background:"rgba(255,149,0,0.1)", border:"1px solid rgba(255,149,0,0.3)", color:"#ff9500" }}>
              <Download size={14} /> CSV
            </Button>
            <Button className="h-9 gap-1.5 text-sm" onClick={() => { setManualOpen(true); setDetCondicion("3.0"); setDetTemperatura(""); setDetEstadoSan("Sano"); setDetPotrero(""); setDetObsVet(""); setDetProxVac(""); setDetObs(""); }}
              style={{ background:"rgba(255,149,0,0.15)", border:"1px solid rgba(255,149,0,0.4)", color:"#fff" }}>
              <Plus size={14} /> Pesaje Manual
            </Button>
          </div>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { l:"HOY",       v:String(hoy),          s:"pesajes registrados",  g:"linear-gradient(135deg,#92400e,#b45309)", icon:<Clock size={15} className="text-white"/> },
          { l:"TOTAL",     v:String(pesajes.length),s:"en historial",         g:"linear-gradient(135deg,#064e3b,#065f46)", icon:<BarChart3 size={15} className="text-white"/> },
          { l:"BT/COM",    v:String(btCount),       s:"con báscula conectada",g:"linear-gradient(135deg,#1e3a5f,#1e40af)", icon:<Bluetooth size={15} className="text-white"/> },
          { l:"PROMEDIO",  v:`${pesoAvg} kg`,       s:"por animal",           g:"linear-gradient(135deg,#4a044e,#7e22ce)", icon:<Scale size={15} className="text-white"/> },
        ].map(k => (
          <div key={k.l} className="rounded-xl p-4 text-white shadow-lg transition-transform hover:scale-[1.02] hover:shadow-xl" style={{ background:k.g }}>
            <div className="flex items-center gap-1.5 mb-1">{k.icon}<div className="text-[10px] font-bold uppercase tracking-wider text-white/70">{k.l}</div></div>
            <div className="text-2xl font-black">{k.v}</div>
            <div className="text-[10px] text-white/55">{k.s}</div>
          </div>
        ))}
      </div>

      {/* ── Queue Panel ── */}
      {queueMode && (
        <div className="rounded-xl overflow-hidden" style={{ background:"rgba(0,200,255,0.04)", border:"1px solid rgba(0,200,255,0.22)" }}>
          <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor:"rgba(0,200,255,0.15)", background:"rgba(0,200,255,0.07)" }}>
            <div className="flex items-center gap-2.5">
              <List size={14} style={{ color:"#00c8ff" }}/>
              <span className="text-sm font-bold" style={{ color:"#00c8ff" }}>Cola de Pesaje — Modo Lote</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background:"rgba(0,200,255,0.15)", color:"#00c8ff" }}>
                {queueIdx} / {animalQueue.length} pesados
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" className="h-7 gap-1.5 text-xs" onClick={() => setShowNewAnimal(true)}
                style={{ background:"rgba(57,255,126,0.12)", border:"1px solid rgba(57,255,126,0.35)", color:"#39ff7e" }}>
                <UserPlus size={11}/> Nuevo animal
              </Button>
              <Button size="sm" className="h-7 gap-1.5 text-xs" onClick={() => { setQueueMode(false); setAnimalQueue([]); setQueueIdx(0); }}
                style={{ background:"rgba(255,80,80,0.12)", border:"1px solid rgba(255,80,80,0.3)", color:"#ff7070" }}>
                <XIcon size={11}/> Cancelar
              </Button>
            </div>
          </div>
          <div className="p-3 space-y-2">
            {animalQueue.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">Agrega animales a la cola usando los botones de abajo</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {animalQueue.map((id, i) => {
                  const a = animals.find(x => x.id === id);
                  const done = i < queueIdx; const current = i === queueIdx;
                  return (
                    <div key={id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={{ background: done ? "rgba(57,255,126,0.1)" : current ? "rgba(0,200,255,0.15)" : "rgba(255,255,255,0.04)", border:`1px solid ${done?"rgba(57,255,126,0.4)":current?"rgba(0,200,255,0.5)":"rgba(255,255,255,0.08)"}`, color: done?"#39ff7e":current?"#00c8ff":"rgba(255,255,255,0.45)" }}>
                      {done ? <CheckCircle2 size={10}/> : current ? <Scale size={10}/> : <span className="w-2 h-2 rounded-full border inline-block" style={{ borderColor:"rgba(255,255,255,0.2)" }}/>}
                      <span>{a ? a.nombre : id}</span>
                      {current && <span className="text-[9px] animate-pulse">●</span>}
                    </div>
                  );
                })}
              </div>
            )}
            {animals.filter(a => !animalQueue.includes(a.id)).length > 0 && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-bold mb-1.5">+ Agregar a cola:</p>
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                  {animals.filter(a => !animalQueue.includes(a.id)).map(a => (
                    <button key={a.id}
                      onClick={() => { setAnimalQueue(prev => [...prev, a.id]); if (animalQueue.length === 0) setSelectedAnimal(a); }}
                      className="text-[10px] px-2 py-1 rounded-lg transition-all hover:opacity-80"
                      style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.55)" }}>
                      + {a.nombre}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Main interface ── */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Left: connection + live scale */}
        <div className="lg:col-span-1 space-y-4">
          {/* Connection tabs */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <Cpu size={14} className="text-orange-400"/>
              <span className="font-semibold text-sm">Método de Conexión</span>
            </div>
            {/* Tabs */}
            <div className="flex border-b border-border">
              {[
                { id:"bt", label:"Bluetooth", icon:<Bluetooth size={12}/> },
                { id:"com", label:"COM / USB", icon:<Cable size={12}/> },
                { id:"manual", label:"Manual", icon:<Settings2 size={12}/> },
              ].map(t => (
                <button key={t.id} onClick={() => setConnTab(t.id as any)}
                  className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-semibold transition-colors ${connTab===t.id ? "bg-orange-500/10 text-orange-300 border-b-2 border-orange-400" : "text-muted-foreground hover:text-foreground"}`}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* BT Controllers */}
            {connTab === "bt" && (
              <div className="p-3 space-y-1.5">
                {BT_CONTROLLERS.map(ctrl => (
                  <button key={ctrl.id}
                    onClick={() => { if (btStatus !== "idle" && btStatus !== "error") return; setSelectedBtCtrl(ctrl); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all hover:scale-[1.01]"
                    style={{
                      background: selectedBtCtrl.id === ctrl.id ? `rgba(${ctrl.glow},0.12)` : "rgba(255,255,255,0.02)",
                      border:`1px solid ${selectedBtCtrl.id === ctrl.id ? `rgba(${ctrl.glow},0.4)` : "rgba(255,255,255,0.06)"}`,
                      cursor: btStatus !== "idle" && btStatus !== "error" ? "not-allowed" : "pointer",
                    }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background:`rgba(${ctrl.glow},0.15)`, border:`1px solid rgba(${ctrl.glow},0.3)` }}>{ctrl.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate" style={{ color: selectedBtCtrl.id === ctrl.id ? `rgb(${ctrl.glow})` : "rgba(255,255,255,0.8)" }}>{ctrl.nombre}</div>
                      <div className="text-[9px] text-muted-foreground truncate">{ctrl.desc}</div>
                    </div>
                    {selectedBtCtrl.id === ctrl.id && <CheckCircle2 size={13} style={{ color:`rgb(${ctrl.glow})`, flexShrink:0 }}/>}
                  </button>
                ))}
                <div className="pt-1 space-y-2">
                  {btError && <div className="text-xs text-red-400 flex items-center gap-1.5 px-3 py-2 rounded-lg" style={{ background:"rgba(239,68,68,0.1)" }}><AlertTriangle size={12}/> {btError}</div>}
                  {btStatus === "idle" || btStatus === "error" ? (
                    <Button className="w-full h-10 gap-2 font-bold" onClick={connectBluetooth}
                      style={{ background:`linear-gradient(135deg,rgba(${selectedBtCtrl.glow},0.9),rgba(${selectedBtCtrl.glow},0.7))`, color:"#000" }}>
                      <Bluetooth size={16}/> Conectar Bluetooth
                    </Button>
                  ) : (
                    <Button className="w-full h-10 gap-2 font-bold" onClick={disconnectBluetooth}
                      style={{ background:"rgba(255,80,80,0.15)", border:"1px solid rgba(255,80,80,0.4)", color:"#ff7070" }}>
                      <BluetoothOff size={16}/> Desconectar
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* COM Controllers */}
            {connTab === "com" && (
              <div className="p-3 space-y-1.5">
                <div className="text-[10px] text-muted-foreground px-1 mb-2">
                  Requiere Chrome/Edge en escritorio · Báscula conectada al puerto COM/USB
                </div>
                {COM_CONTROLLERS.map(ctrl => (
                  <button key={ctrl.id}
                    onClick={() => { if (serialStatus !== "idle" && serialStatus !== "error") return; setSelectedComCtrl(ctrl); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all hover:scale-[1.01]"
                    style={{
                      background: selectedComCtrl.id === ctrl.id ? `rgba(${ctrl.glow},0.12)` : "rgba(255,255,255,0.02)",
                      border:`1px solid ${selectedComCtrl.id === ctrl.id ? `rgba(${ctrl.glow},0.4)` : "rgba(255,255,255,0.06)"}`,
                      cursor: serialStatus !== "idle" && serialStatus !== "error" ? "not-allowed" : "pointer",
                    }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background:`rgba(${ctrl.glow},0.15)`, border:`1px solid rgba(${ctrl.glow},0.3)` }}>{ctrl.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate" style={{ color: selectedComCtrl.id === ctrl.id ? `rgb(${ctrl.glow})` : "rgba(255,255,255,0.8)" }}>{ctrl.nombre}</div>
                      <div className="text-[9px] text-muted-foreground truncate">{ctrl.desc}</div>
                    </div>
                    {selectedComCtrl.id === ctrl.id && (
                      <div className="text-[9px] text-right flex-shrink-0" style={{ color:`rgba(${ctrl.glow},0.8)` }}>
                        <div>{ctrl.baudRate} bps</div>
                        <div>{ctrl.dataBits}{ctrl.parity === "none" ? "N" : ctrl.parity === "even" ? "E" : "O"}{ctrl.stopBits}</div>
                      </div>
                    )}
                  </button>
                ))}
                <div className="pt-1 space-y-2">
                  {serialError && <div className="text-xs text-red-400 flex items-center gap-1.5 px-3 py-2 rounded-lg" style={{ background:"rgba(239,68,68,0.1)" }}><AlertTriangle size={12}/> {serialError}</div>}
                  {serialStatus === "idle" || serialStatus === "error" ? (
                    <Button className="w-full h-10 gap-2 font-bold" onClick={connectSerial}
                      style={{ background:`linear-gradient(135deg,rgba(${selectedComCtrl.glow},0.9),rgba(${selectedComCtrl.glow},0.7))`, color:"#000" }}>
                      <Cable size={16}/> Conectar Puerto COM
                    </Button>
                  ) : serialStatus === "connecting" ? (
                    <Button className="w-full h-10 gap-2 font-bold" disabled
                      style={{ background:"rgba(255,255,255,0.06)", color:"#888" }}>
                      <RefreshCw size={16} className="animate-spin"/> Conectando...
                    </Button>
                  ) : (
                    <Button className="w-full h-10 gap-2 font-bold" onClick={disconnectSerial}
                      style={{ background:"rgba(255,80,80,0.15)", border:"1px solid rgba(255,80,80,0.4)", color:"#ff7070" }}>
                      <XIcon size={16}/> Desconectar COM
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Manual tab */}
            {connTab === "manual" && (
              <div className="p-4 text-center">
                <Settings2 size={32} className="mx-auto mb-2 text-muted-foreground opacity-30"/>
                <p className="text-sm text-muted-foreground mb-3">Ingresa el peso directamente con el teclado</p>
                <Button className="w-full gap-2" onClick={() => { setManualOpen(true); setDetCondicion("3.0"); setDetTemperatura(""); setDetEstadoSan("Sano"); setDetPotrero(""); setDetObsVet(""); setDetProxVac(""); setDetObs(""); }}
                  style={{ background:"rgba(255,149,0,0.9)", color:"#1a0800" }}>
                  <Plus size={16}/> Pesaje Manual
                </Button>
              </div>
            )}
          </div>

          {/* Auto-capture toggle */}
          {(btStatus === "simulating" || btStatus === "connected" || serialStatus === "connected") && (
            <div className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-foreground">Auto-captura</div>
                <div className="text-[10px] text-muted-foreground">Abre diálogo al estabilizar</div>
              </div>
              <button onClick={() => setAutoCapture(v => !v)}
                className="w-10 h-6 rounded-full transition-all relative flex-shrink-0"
                style={{ background: autoCapture ? "rgba(57,255,126,0.6)" : "rgba(255,255,255,0.1)" }}>
                <span className="absolute w-4 h-4 rounded-full bg-white top-1 transition-all" style={{ left: autoCapture ? 22 : 4 }}/>
              </button>
            </div>
          )}

          {/* Live scale display */}
          <LiveScale
            weight={liveWeight} stability={stability} stable={stable}
            status={connTab === "com" ? serialStatus : btStatus}
            onCapture={() => openCaptureDialog()}
            autoCapture={autoCapture}
            connectionLabel={serialStatus === "connected" ? `COM: ${selectedComCtrl.nombre}` : undefined}
          />
        </div>

        {/* Center + Right: animal selector + history */}
        <div className="lg:col-span-2 space-y-4">
          {/* Animal selector */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Beef size={14} className="text-orange-400"/>
                <span className="font-semibold text-sm">Animal a Pesar</span>
              </div>
              <Button size="sm" className="h-7 gap-1 text-xs" onClick={() => setShowNewAnimal(true)}
                style={{ background:"rgba(57,255,126,0.1)", border:"1px solid rgba(57,255,126,0.3)", color:"#39ff7e" }}>
                <UserPlus size={11}/> Nuevo
              </Button>
            </div>
            <div className="p-3">
              <div className="relative mb-2">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                <Input value={searchAnim} onChange={e => setSearchAnim(e.target.value)} className="pl-8 h-8 text-xs" placeholder="Buscar por nombre o ID…"/>
              </div>
              <div className="space-y-1 max-h-52 overflow-y-auto">
                {filtered.map(a => {
                  const lastP = pesajes.filter(p => p.animalId === a.id)[0];
                  const isSelected = selectedAnimal?.id === a.id;
                  return (
                    <button key={a.id}
                      onClick={() => { setSelectedAnimal(a); if (queueMode && !animalQueue.includes(a.id)) setAnimalQueue(prev => [...prev, a.id]); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all hover:bg-white/5"
                      style={{ background: isSelected ? "rgba(255,149,0,0.1)" : "transparent", border:`1px solid ${isSelected?"rgba(255,149,0,0.4)":"rgba(255,255,255,0.04)"}` }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                        style={{ background: isSelected ? "rgba(255,149,0,0.2)" : "rgba(255,255,255,0.05)" }}>
                        🐄
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold truncate" style={{ color: isSelected ? "#ff9500" : "rgba(255,255,255,0.85)" }}>{a.nombre}</span>
                          <span className="text-[9px] text-muted-foreground font-mono">{a.id}</span>
                        </div>
                        <div className="text-[9px] text-muted-foreground">{a.raza} · {a.lote} · {lastP ? `Último: ${lastP.peso} kg` : `Ref: ${getPesoRef(a.raza, a.categoria).prom} kg`}</div>
                      </div>
                      {isSelected && <CheckCircle2 size={13} className="text-orange-400 flex-shrink-0"/>}
                      {queueMode && animalQueue.includes(a.id) && !isSelected && <span className="text-[9px] text-cyan-400">en cola</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Selected animal info */}
          {selectedAnimal && selRef && (
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl">🐄</div>
                <div>
                  <div className="font-bold text-foreground">{selectedAnimal.nombre}</div>
                  <div className="text-xs text-muted-foreground">{selectedAnimal.raza} · {selectedAnimal.categoria} · {selectedAnimal.lote}</div>
                </div>
                {lastPesaje && (
                  <div className="ml-auto text-right">
                    <div className="text-lg font-black" style={{ color: "#ff9500" }}>{lastPesaje.peso} kg</div>
                    <div className="text-[10px] text-muted-foreground">último pesaje</div>
                  </div>
                )}
              </div>
              {/* Reference range */}
              <div className="grid grid-cols-3 gap-2 text-center">
                {[["Mínimo", selRef.min, "#60a5fa"],["Promedio", selRef.prom, "#00c8ff"],["Máximo", selRef.max, "#60a5fa"]].map(([l,v,c]) => (
                  <div key={String(l)} className="rounded-lg p-2" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>
                    <div className="text-[9px] text-muted-foreground">{l}</div>
                    <div className="font-bold text-sm" style={{ color:String(c) }}>{v} kg</div>
                  </div>
                ))}
              </div>
              {/* History chart */}
              {animalHistory(selectedAnimal.id).length > 0 && (
                <div className="mt-3 h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={animalHistory(selectedAnimal.id)} margin={{top:0,right:4,left:0,bottom:0}}>
                      <XAxis dataKey="name" stroke="transparent" tick={{fill:"rgba(255,255,255,0.3)",fontSize:9}}/>
                      <YAxis stroke="transparent" tick={{fill:"rgba(255,255,255,0.3)",fontSize:9}} domain={[selRef.min * 0.9, selRef.max * 1.05]} width={32}/>
                      <Tooltip contentStyle={{ background:"#030f0b", border:"1px solid rgba(255,149,0,0.3)", borderRadius:8, fontSize:11 }} formatter={(v: any) => [`${v} kg`, "Peso"]}/>
                      <Bar dataKey="kg" radius={[4,4,0,0]} fill="rgba(255,149,0,0.7)"/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* Historial de pesajes */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-orange-400"/>
                <span className="font-semibold text-sm">Historial de Pesajes</span>
                <span className="text-xs text-muted-foreground">({pesajes.length})</span>
              </div>
            </div>
            <div className="divide-y divide-border max-h-80 overflow-y-auto">
              {pesajes.slice(0, 30).map(p => {
                const diff = p.peso - p.pesoAnterior;
                return (
                  <div key={p.id} className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-muted/10 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-foreground">{p.animalNombre}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{p.animalId}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${p.metodo === "bluetooth" || p.metodo === "serial" ? "bg-blue-500/15 text-blue-400" : "bg-white/8 text-white/40"}`}>
                          {p.metodo === "bluetooth" ? "BT" : p.metodo === "serial" ? "COM" : p.metodo === "simulated" ? "SIM" : "MAN"}
                        </span>
                        {p.condicionCorporal && <span className="text-[9px] text-amber-400">{p.condicionCorporal}</span>}
                        {p.temperatura && <span className="text-[9px] text-cyan-400">🌡{p.temperatura}°C</span>}
                      </div>
                      <div className="flex gap-3 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">{p.fecha} {p.hora} · {p.lote}</span>
                        {p.potreroActual && <span className="text-[10px] text-green-400/70">📍{p.potreroActual}</span>}
                      </div>
                      {p.observacionVet && <div className="text-[9px] text-purple-400 mt-0.5">🩺 {p.observacionVet}</div>}
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <div className="font-black text-base" style={{ color:"#ff9500" }}>{p.peso.toFixed(1)} kg</div>
                        <div className={`text-[10px] font-semibold ${diff > 0 ? "text-green-400" : diff < 0 ? "text-red-400" : "text-muted-foreground"}`}>
                          {diff > 0 ? "+" : ""}{diff.toFixed(1)} kg
                        </div>
                      </div>
                      <Button size="sm" className="h-7 w-7 p-0" variant="ghost"
                        onClick={() => imprimirReciboAnimal(p as PesajeRec)}
                        title="Imprimir recibo de este animal">
                        <Printer size={12} className="text-muted-foreground"/>
                      </Button>
                    </div>
                  </div>
                );
              })}
              {pesajes.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">Sin pesajes registrados aún</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── CAPTURE DETAIL DIALOG ── */}
      <Dialog open={captureDialogOpen} onOpenChange={setCaptureDialogOpen}>
        <DialogContent className="sm:max-w-[520px] max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target size={16} className="text-orange-400"/>
              Capturar Pesaje — {selectedAnimal?.nombre}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            {/* Peso */}
            <div className="rounded-xl p-4 text-center" style={{ background:"rgba(255,149,0,0.08)", border:"1px solid rgba(255,149,0,0.3)" }}>
              <div className="text-[10px] text-orange-400/60 uppercase tracking-wider mb-1">Peso capturado</div>
              <div className="text-5xl font-black" style={{ color:"#ff9500", fontFamily:"Sora,monospace" }}>{capturedWeight.toFixed(1)}<span className="text-xl ml-1 font-normal text-white/40">kg</span></div>
              {selectedAnimal && (
                <div className="text-xs text-muted-foreground mt-1">
                  Ref. {selectedAnimal.raza}: {getPesoRef(selectedAnimal.raza, selectedAnimal.categoria).prom} kg promedio
                </div>
              )}
              <div className="mt-2">
                <Label className="text-xs">Ajustar peso si es necesario</Label>
                <Input type="number" step="0.1" value={capturedWeight} onChange={e => setCapturedWeight(Number(e.target.value))} className="text-center mt-1 h-8 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Condición corporal (CC)</Label>
                <Select value={detCondicion} onValueChange={setDetCondicion}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>{["1.0","1.5","2.0","2.5","3.0","3.5","4.0","4.5","5.0"].map(v => <SelectItem key={v} value={v}>CC {v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Temperatura rectal (°C)</Label>
                <Input type="number" step="0.1" min="35" max="42" value={detTemperatura} onChange={e => setDetTemperatura(e.target.value)} placeholder="38.5" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Estado sanitario</Label>
                <Select value={detEstadoSan} onValueChange={setDetEstadoSan}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    {["Sano","En tratamiento","En observación","Post-parto","Gestante","Sospechoso","Convaleciente"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Potrero actual</Label>
                <Select value={detPotrero} onValueChange={setDetPotrero}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar…"/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin especificar</SelectItem>
                    {potreros.map(p => <SelectItem key={p.id} value={p.nombre}>{p.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Valor/kg (COP)</Label>
                <Input type="number" value={detValorKilo} onChange={e => setDetValorKilo(e.target.value)} />
                {capturedWeight > 0 && Number(detValorKilo) > 0 && (
                  <p className="text-xs" style={{ color:"#39ff7e" }}>
                    {new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(capturedWeight * Number(detValorKilo))}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Próxima vacuna programada</Label>
                <Input value={detProxVac} onChange={e => setDetProxVac(e.target.value)} placeholder="Ej: IBR/BVD — 15 jun" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Observación veterinaria</Label>
              <Input value={detObsVet} onChange={e => setDetObsVet(e.target.value)} placeholder="Ej: Revisar casco derecho, lesión leve…" />
            </div>
            <div className="space-y-1.5">
              <Label>Observación general</Label>
              <Input value={detObs} onChange={e => setDetObs(e.target.value)} placeholder="Notas adicionales del pesaje…" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCaptureDialogOpen(false)}>Cancelar</Button>
            <Button onClick={saveCapturedPeso}
              style={{ background:"linear-gradient(135deg,#39ff7e,#00c864)", color:"#052010" }}>
              <CheckCircle2 size={14} className="mr-1.5"/> Guardar e Imprimir Recibo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MANUAL PESAJE DIALOG ── */}
      <Dialog open={manualOpen} onOpenChange={setManualOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[92vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Scale size={16} className="text-orange-400"/> Registrar Pesaje Manual</DialogTitle></DialogHeader>
          <form onSubmit={handleManualAdd}>
            <div className="grid gap-4 py-3">
              <div className="space-y-1.5">
                <Label>Animal</Label>
                <Select value={manualAnimalId} onValueChange={setManualAnimalId}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>{animals.map(a => <SelectItem key={a.id} value={a.id}>{a.nombre} — {a.id}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Peso (kg) *</Label>
                <Input type="number" step="0.1" min="0" required value={manualPeso} onChange={e => setManualPeso(e.target.value)} placeholder="Ej: 385.5" />
                {manualAnimal && <p className="text-xs text-muted-foreground">Referencia {manualAnimal.raza}: {getPesoRef(manualAnimal.raza, manualAnimal.categoria).prom} kg promedio</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Condición corporal</Label>
                  <Select value={detCondicion} onValueChange={setDetCondicion}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>{["1.0","1.5","2.0","2.5","3.0","3.5","4.0","4.5","5.0"].map(v => <SelectItem key={v} value={v}>CC {v}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Temperatura (°C)</Label>
                  <Input type="number" step="0.1" value={detTemperatura} onChange={e => setDetTemperatura(e.target.value)} placeholder="38.5" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Estado sanitario</Label>
                  <Select value={detEstadoSan} onValueChange={setDetEstadoSan}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>{["Sano","En tratamiento","En observación","Post-parto","Gestante","Sospechoso","Convaleciente"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Potrero actual</Label>
                  <Select value={detPotrero} onValueChange={setDetPotrero}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar…"/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sin especificar</SelectItem>
                      {potreros.map(p => <SelectItem key={p.id} value={p.nombre}>{p.nombre}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Valor/kg (COP)</Label>
                  <Input type="number" value={detValorKilo} onChange={e => setDetValorKilo(e.target.value)} />
                  {manualPeso && Number(manualPeso) > 0 && Number(detValorKilo) > 0 && (
                    <div className="rounded-lg p-2 text-center" style={{ background:"rgba(57,255,126,0.07)", border:"1px solid rgba(57,255,126,0.25)" }}>
                      <div className="text-xs text-muted-foreground">Valor estimado</div>
                      <div className="font-black text-base" style={{ color:"#39ff7e" }}>{fmt(Number(manualPeso) * Number(detValorKilo))}</div>
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Próx. vacuna</Label>
                  <Input value={detProxVac} onChange={e => setDetProxVac(e.target.value)} placeholder="Ej: IBR — 20 jun" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Observación veterinaria</Label>
                <Input value={detObsVet} onChange={e => setDetObsVet(e.target.value)} placeholder="Ej: Revisar pezón posterior derecho…" />
              </div>
              <div className="space-y-1.5">
                <Label>Observación general</Label>
                <Input value={detObs} onChange={e => setDetObs(e.target.value)} placeholder="Notas del pesaje…" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setManualOpen(false)}>Cancelar</Button>
              <Button type="submit" className="gap-2" style={{ background:"rgba(255,149,0,0.9)", color:"black" }}>
                <CheckCircle2 size={14}/> Guardar e Imprimir Recibo
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── NEW ANIMAL DIALOG ── */}
      <Dialog open={showNewAnimal} onOpenChange={setShowNewAnimal}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><UserPlus size={16} className="text-green-400"/> Registrar Nuevo Animal</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>ID / Arete</Label><Input value={newAId} onChange={e => setNewAId(e.target.value)} placeholder="Ej: VCA-014"/></div>
              <div className="space-y-1.5"><Label>Nombre</Label><Input value={newANombre} onChange={e => setNewANombre(e.target.value)} placeholder="Ej: Bonita"/></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Raza</Label>
                <Select value={newARaza} onValueChange={setNewARaza}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>{["Holstein","Jersey","Cebú","Simmental","Angus","Brahman","Gyr","Gyr X","Criollo"].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Categoría</Label>
                <Select value={newACat} onValueChange={setNewACat}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>{["Vaca adulta","Novilla","Ternera","Toro","Novillo","Ternero"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Lote</Label>
              <Select value={newALote} onValueChange={setNewALote}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{["Lote A","Lote B","Lote C","Lote D","Lote E","Lote F","Ordeño","Maternidad"].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {newAId && animals.find(a => a.id === newAId) && <p className="text-xs text-red-400">Ya existe un animal con este ID</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewAnimal(false)}>Cancelar</Button>
            <Button onClick={handleRegNewAnimal} disabled={!newAId.trim() || !newANombre.trim() || !!animals.find(a => a.id === newAId.trim())}
              style={{ background:"rgba(57,255,126,0.9)", color:"black" }}>
              <UserPlus size={14} className="mr-1"/> Registrar{queueMode ? " y agregar a cola" : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
