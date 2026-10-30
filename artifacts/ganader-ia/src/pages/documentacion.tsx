import { useState } from "react";
import type { ReactElement } from "react";
import {
  BookOpen, Smartphone, WifiOff, Bluetooth, Navigation, BarChart3, Users,
  Globe, Cloud, FileDown, Database, CheckCircle, Scale,
  Shield, Beef, Baby, Droplets, Dna, Wheat, Package, DollarSign,
  MapPin, Bell, Zap, CreditCard, Settings, Printer,
  Tag, Grid3x3, Heart, Activity, FlaskConical, TreePine, ChevronRight,
  Award, Cpu, Layers, Server, Code, Lock, RefreshCw, Star,
  ChevronDown, ChevronUp, Copy, ExternalLink, Map, FileText, Radio, Search,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/* ══════════════════════════════════════════════════════════════
   NAVIGATION SECTIONS
══════════════════════════════════════════════════════════════ */
const SECTIONS = [
  { id:"inicio",        label:"Primeros pasos",         icon:BookOpen,     color:"#00f5d4" },
  { id:"modulos",       label:"Mapa de módulos",        icon:Grid3x3,      color:"#39ff7e" },
  { id:"pwa",           label:"Instalar PWA",           icon:Smartphone,   color:"#00c8ff" },
  { id:"offline",       label:"Modo Offline",           icon:WifiOff,      color:"#a78bfa" },
  { id:"login",         label:"Login & Cuentas",        icon:Lock,         color:"#fbbf24" },
  { id:"inventario",    label:"Inventario Animal",      icon:Beef,         color:"#39ff7e" },
  { id:"pesaje",        label:"Pesaje Bluetooth",       icon:Scale,        color:"#ff9a3c" },
  { id:"reproduccion",  label:"Reproducción",           icon:Heart,        color:"#ff6fd8" },
  { id:"genetica",      label:"Genética & DEP",         icon:Dna,          color:"#a855f7" },
  { id:"produccion",    label:"Producción Leche",       icon:Droplets,     color:"#00c8ff" },
  { id:"campo",         label:"Campo & Potreros",       icon:Map,          color:"#4ade80" },
  { id:"gps",           label:"GPS Bovino",             icon:Navigation,   color:"#0ea5e9" },
  { id:"sanidad",       label:"Sanidad Animal",         icon:Activity,     color:"#22c55e" },
  { id:"trazabilidad",  label:"Trazabilidad ICA",       icon:Tag,          color:"#f97316" },
  { id:"finanzas",      label:"Costos & Finanzas",      icon:DollarSign,   color:"#fbbf24" },
  { id:"personal",      label:"Personal & Nómina",      icon:Users,        color:"#60a5fa" },
  { id:"prediccion",    label:"Predicción IA",          icon:Cpu,          color:"#e879f9" },
  { id:"co2",           label:"Huella CO₂",             icon:TreePine,     color:"#86efac" },
  { id:"alertas",       label:"Centro Alertas",         icon:Bell,         color:"#ff6b35" },
  { id:"multifinca",    label:"Multi-Finca",            icon:Layers,       color:"#00c8ff" },
  { id:"backup",        label:"Backup & Datos",         icon:Cloud,        color:"#94a3b8" },
  { id:"usuarios",      label:"Usuarios & Roles",       icon:Shield,       color:"#00f5d4" },
  { id:"asesora",       label:"Asesora IA",             icon:Star,         color:"#e879f9" },
  { id:"server",        label:"Server Panel",           icon:Server,       color:"#00ff88" },
];

/* ══════════════════════════════════════════════════════════════
   SHARED COMPONENTS
══════════════════════════════════════════════════════════════ */
function SectionBanner({ emoji, title, subtitle, c1, c2 }: {
  emoji: string; title: string; subtitle: string; c1: string; c2: string;
}) {
  return (
    <div className="rounded-2xl p-5 mb-6 relative overflow-hidden"
      style={{ background:`linear-gradient(135deg,${c1},${c2})`, border:`1px solid ${c1}40` }}>
      <div className="absolute right-0 top-0 w-32 h-full opacity-10 pointer-events-none"
        style={{ background:'radial-gradient(ellipse at right, white, transparent 70%)' }}/>
      <div className="relative flex items-center gap-4">
        <div className="text-4xl">{emoji}</div>
        <div>
          <h2 className="text-2xl font-black text-white" style={{ fontFamily:'Sora,sans-serif' }}>{title}</h2>
          <p className="text-sm mt-1 text-white/70">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, desc, color }: { icon: React.ReactNode; title: string; desc: string; color: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background:`${color}0d`, border:`1px solid ${color}30` }}>
      <div className="flex items-center gap-2 mb-2" style={{ color }}>
        {icon}
        <span className="font-bold text-sm text-foreground">{title}</span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

function Step({ n, text, color }: { n: number; text: string; color: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 text-black"
        style={{ background:color, boxShadow:`0 0 10px ${color}80` }}>{n}</div>
      <p className="text-sm text-foreground/70 pt-0.5">{text}</p>
    </div>
  );
}

function Tip({ text, color = "#00f5d4" }: { text: string; color?: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl p-3" style={{ background:`${color}0a`, border:`1px solid ${color}25` }}>
      <Zap size={14} style={{ color, flexShrink:0, marginTop:2 }}/>
      <p className="text-xs leading-relaxed" style={{ color:`${color}cc` }}>{text}</p>
    </div>
  );
}

function CodeBlock({ code, label }: { code: string; label?: string }) {
  const { toast } = useToast();
  return (
    <div className="rounded-xl overflow-hidden" style={{ border:"1px solid rgba(255,255,255,0.08)" }}>
      {label && (
        <div className="px-3 py-1.5 flex items-center justify-between" style={{ background:"rgba(255,255,255,0.04)" }}>
          <span className="text-[10px] font-mono text-muted-foreground">{label}</span>
          <button onClick={() => { navigator.clipboard.writeText(code).catch(()=>{}); toast({ title:"Copiado ✓", duration:1500 }); }}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
            <Copy size={10}/> Copiar
          </button>
        </div>
      )}
      <pre className="p-3 text-xs font-mono overflow-x-auto" style={{ background:"rgba(0,0,0,0.35)", color:"#00f5d4" }}>{code}</pre>
    </div>
  );
}

function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
      style={{ background:`${color}18`, color, border:`1px solid ${color}30` }}>{text}</span>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl overflow-hidden" style={{ border:"1px solid rgba(255,255,255,0.07)" }}>
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.01] transition-colors">
        <span className="text-sm font-semibold text-foreground">{q}</span>
        {open ? <ChevronUp size={16} className="text-muted-foreground flex-shrink-0 ml-2"/> : <ChevronDown size={16} className="text-muted-foreground flex-shrink-0 ml-2"/>}
      </button>
      {open && <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{a}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SECTION CONTENT
══════════════════════════════════════════════════════════════ */

function SecInicio() {
  return (
    <div className="space-y-6">
      <SectionBanner emoji="🚀" title="Primeros pasos" subtitle="Configura tu finca y empieza en menos de 5 minutos" c1="#020d1a" c2="#0a2745"/>
      <div className="space-y-3">
        <Step n={1} text="Inicia sesión — usa Google OAuth o tu correo y contraseña; el rol y el plan se asignan desde Gestión Clientes." color="#00f5d4"/>
        <Step n={2} text='Ve a Configuración (⚙️ en el sidebar) y completa los datos de tu finca: nombre, NIT, municipio, departamento y tipo de producción.' color="#39ff7e"/>
        <Step n={3} text="Registra tus bovinos en Inventario — usa la importación CSV o crea cada animal manualmente con su aretado y categoría." color="#a78bfa"/>
        <Step n={4} text="Instala la PWA en tu celular para acceso rápido sin internet (ver sección Instalar PWA)." color="#fbbf24"/>
        <Step n={5} text="Configura tus potreros en el módulo Potreros para activar el plan de rotación y el GPS." color="#ff9a3c"/>
        <Step n={6} text="Activa las alertas para recibir notificaciones de vacunación, partos próximos, stock mínimo e insumos." color="#ff6fd8"/>
      </div>
      <Tip text="💡 CIVAC PRO funciona 100% offline. Todos tus datos se guardan en el dispositivo y se sincronizan cuando hay internet." />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
        {[
          { icon:"📱", t:"PWA instalable", d:"Como app nativa en Android e iOS" },
          { icon:"🌐", t:"Sin internet", d:"Funciona offline con IndexedDB" },
          { icon:"🔒", t:"Datos seguros", d:"Todo en tu dispositivo" },
          { icon:"🤖", t:"IA integrada", d:"Predicciones y análisis automáticos" },
          { icon:"📡", t:"GPS real", d:"Tracking bovino en tiempo real" },
          { icon:"🔵", t:"Bluetooth", d:"Báscula BT — Tru-Test · Gallagher" },
        ].map(i => (
          <div key={i.t} className="rounded-xl p-3 text-center" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
            <div className="text-2xl mb-1">{i.icon}</div>
            <p className="text-xs font-bold text-foreground">{i.t}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{i.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SecModulos() {
  const mods = [
    { emoji:"📊", name:"Dashboard",       ruta:"/",             cat:"Core",      color:"#00f5d4", glow:"0,245,212",    plan:"FREE", desc:"6 KPIs, gráficas históricas, ticker live, 20 accesos rápidos" },
    { emoji:"🐄", name:"Inventario",      ruta:"/inventario",   cat:"Animal",    color:"#39ff7e", glow:"57,255,126",   plan:"FREE", desc:"Registro bovinos, RFID, categorías, CRUD completo" },
    { emoji:"🥛", name:"Producción",      ruta:"/produccion",   cat:"Animal",    color:"#00c8ff", glow:"0,200,255",    plan:"FREE", desc:"Ordeños diarios, ranking top-vacas, BarChart 7 meses" },
    { emoji:"❤️", name:"Reproducción",    ruta:"/reproduccion", cat:"Animal",    color:"#ff6fd8", glow:"255,111,216",  plan:"PRO",  desc:"IEP, celos, inseminaciones, próximos partos, anestros" },
    { emoji:"🧬", name:"Genética",        ruta:"/genetica",     cat:"Animal",    color:"#a855f7", glow:"168,85,247",   plan:"PRO",  desc:"DEP ranking con score bars, pedigrí, selección genética" },
    { emoji:"⚖️", name:"Pesaje BT",       ruta:"/pesaje",       cat:"Animal",    color:"#ff9a3c", glow:"255,154,60",   plan:"PRO",  desc:"Báscula Bluetooth — BCS, GMD, 9 razas, IA engine" },
    { emoji:"🔧", name:"Básculas & Disp.", ruta:"/basculas",    cat:"Animal",    color:"#fb923c", glow:"251,146,60",   plan:"PRO",  desc:"Gestión multi-báscula · BT + COM simultáneos · Drivers Windows" },
    { emoji:"📝", name:"Pesaje Manual",   ruta:"/pesaje-manual",cat:"Animal",    color:"#c084fc", glow:"192,132,252",  plan:"PREM", desc:"Pesaje con CC, GMD, recibo PDF imprimible" },
    { emoji:"🏷️", name:"Lotes",           ruta:"/lotes",        cat:"Animal",    color:"#00c8ff", glow:"0,200,255",    plan:"PREM", desc:"Gestión y movimiento de lotes ganaderos" },
    { emoji:"🧪", name:"Ficha Animal",    ruta:"/ficha",        cat:"Animal",    color:"#00f5d4", glow:"0,245,212",    plan:"PRO",  desc:"Historia clínica por animal: vacunas, pesos, partos, eventos" },
    { emoji:"🧊", name:"Semen",           ruta:"/semen",        cat:"Animal",    color:"#818cf8", glow:"129,140,248",  plan:"PRO",  desc:"Inventario criogénico, embriones TE, toros" },
    { emoji:"🌿", name:"Potreros",        ruta:"/potreros",     cat:"Campo",     color:"#84ef34", glow:"132,239,52",   plan:"FREE", desc:"6 lotes, rotación activa, semáforo estado, mapa CSS" },
    { emoji:"📡", name:"GPS Bovino",      ruta:"/gps",          cat:"Campo",     color:"#0ea5e9", glow:"14,165,233",   plan:"PRO",  desc:"watchPosition real, mapa SVG animado, geovallado, BT scan" },
    { emoji:"🔵", name:"GPS Chips",       ruta:"/gps-chips",    cat:"Campo",     color:"#00c8ff", glow:"0,200,255",    plan:"PRO",  desc:"Dispositivos GPS/collares, protocolo MQTT broker" },
    { emoji:"🌾", name:"Alimentación",    ruta:"/alimentacion", cat:"Nutrición", color:"#ffd166", glow:"255,209,102",  plan:"PRO",  desc:"Raciones TMR, minerales, suplementos, formulación" },
    { emoji:"📦", name:"Insumos",         ruta:"/insumos",      cat:"Nutrición", color:"#fbbf24", glow:"251,191,36",   plan:"PRO",  desc:"Kardex, stock mínimo, botones +/-, alertas rojas" },
    { emoji:"💉", name:"Sanidad",         ruta:"/sanidad",      cat:"Salud",     color:"#22c55e", glow:"34,197,94",    plan:"PRO",  desc:"Vacunación, tratamientos, diagnósticos, control sanitario" },
    { emoji:"📋", name:"Trazabilidad",    ruta:"/trazabilidad", cat:"Salud",     color:"#f97316", glow:"249,115,22",   plan:"PRO",  desc:"Trazabilidad bovina ICA — SINIGAN, guías movilización" },
    { emoji:"💰", name:"Costos P&G",      ruta:"/costos",       cat:"Finanzas",  color:"#34d399", glow:"52,211,153",   plan:"FREE", desc:"Ingresos/egresos, costo/litro, margen 35%, 5 KPIs" },
    { emoji:"👥", name:"Personal",        ruta:"/personal",     cat:"Finanzas",  color:"#94a3b8", glow:"148,163,184",  plan:"PRO",  desc:"6 empleados, cargos, nómina, EPS/ARL, horas extras" },
    { emoji:"🔮", name:"Predicción IA",   ruta:"/prediccion",   cat:"Finanzas",  color:"#e879f9", glow:"232,121,249",  plan:"PRO",  desc:"Simulador financiero IA con sliders de proyección 12 meses" },
    { emoji:"🌱", name:"Huella CO₂",      ruta:"/co2",          cat:"Finanzas",  color:"#4ade80", glow:"74,222,128",   plan:"PREM", desc:"IPCC 2019, benchmarking Colombia, bonos de carbono" },
    { emoji:"🏢", name:"Multi-Finca",     ruta:"/multifinca",   cat:"Admin",     color:"#22d3ee", glow:"34,211,238",   plan:"PRO",  desc:"3 fincas, cards detalladas, tabla comparativa" },
    { emoji:"🔔", name:"Alertas",         ruta:"/alertas",      cat:"Admin",     color:"#ff6b35", glow:"255,107,53",   plan:"FREE", desc:"Centro notificaciones, severidad, resolver, filtros" },
    { emoji:"👤", name:"Usuarios",        ruta:"/usuarios",     cat:"Admin",     color:"#c084fc", glow:"192,132,252",  plan:"PLAT", desc:"Gestión cuentas, permisos por módulo y rol" },
    { emoji:"⚙️", name:"Configuración",   ruta:"/configuracion",cat:"Admin",     color:"#9ca3af", glow:"156,163,175",  plan:"PLAT", desc:"Finca · Apariencia · Notificaciones · Seguridad · Datos" },
    { emoji:"🤖", name:"Asesora IA",      ruta:"/asesora",      cat:"IA",        color:"#e879f9", glow:"232,121,249",  plan:"PRO",  desc:"Asistente IA especializado en ganadería colombiana" },
    { emoji:"💼", name:"Ventas CRM",      ruta:"/ventas",       cat:"IA",        color:"#a855f7", glow:"168,85,247",   plan:"PRO",  desc:"Pipeline comercial, prospectos, seguimiento" },
    { emoji:"☁️", name:"Drive / Backup",  ruta:"/drive",        cat:"Sistema",   color:"#00c8ff", glow:"0,200,255",    plan:"PREM", desc:"Backup en la nube, historial de versiones, restaurar" },
    { emoji:"📤", name:"Centro Datos",    ruta:"/datos",        cat:"Sistema",   color:"#818cf8", glow:"129,140,248",  plan:"PREM", desc:"Exportar/importar JSON, reset datos, migración" },
    { emoji:"💳", name:"Planes",          ruta:"/planes",       cat:"Sistema",   color:"#fbbf24", glow:"251,191,36",   plan:"FREE", desc:"Básico / PRO / Premium / Platino + pasarela Wompi" },
    { emoji:"📚", name:"Documentación",   ruta:"/documentacion",cat:"Ayuda",     color:"#38bdf8", glow:"56,189,248",   plan:"PLAT", desc:"Guías 24 secciones: todos los módulos + PWA + server" },
    { emoji:"📖", name:"Manual",          ruta:"/manual",       cat:"Ayuda",     color:"#2dd4bf", glow:"45,212,191",   plan:"PLAT", desc:"Manual de usuario completo descargable" },
    { emoji:"ℹ️", name:"Acerca de",       ruta:"/acerca",       cat:"Ayuda",     color:"#00f5d4", glow:"0,245,212",    plan:"FREE", desc:"Información del sistema, versión, créditos CIVAC" },
  ];

  const catMeta: Record<string,{color:string; icon:string}> = {
    Core:      { color:"#00f5d4", icon:"⚡" },
    Animal:    { color:"#39ff7e", icon:"🐄" },
    Campo:     { color:"#4ade80", icon:"🌿" },
    Nutrición: { color:"#fbbf24", icon:"🌾" },
    Salud:     { color:"#22c55e", icon:"💉" },
    Finanzas:  { color:"#f97316", icon:"💰" },
    Admin:     { color:"#00c8ff", icon:"🏢" },
    IA:        { color:"#e879f9", icon:"🤖" },
    Sistema:   { color:"#94a3b8", icon:"⚙️" },
    Ayuda:     { color:"#a78bfa", icon:"📚" },
  };

  const planColors: Record<string,string> = {
    FREE:"#39ff7e", PRO:"#fbbf24", PREM:"#a78bfa", PLAT:"#00f5d4"
  };
  const planLabels: Record<string,string> = {
    FREE:"Gratis", PRO:"PRO", PREM:"Premium", PLAT:"Platino"
  };

  const cats = [...new Set(mods.map(m => m.cat))];

  return (
    <div className="space-y-7">
      <SectionBanner emoji="🧩" title="Mapa de módulos" subtitle={`${mods.length} módulos · 10 categorías · CIVAC PRO v2.1`} c1="#071325" c2="#0a1f3c"/>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { val:mods.length, label:"Total módulos", color:"#00f5d4" },
          { val:mods.filter(m=>m.plan==="FREE").length, label:"Gratis", color:"#39ff7e" },
          { val:mods.filter(m=>m.plan==="PRO").length, label:"Plan PRO", color:"#fbbf24" },
          { val:mods.filter(m=>["PREM","PLAT"].includes(m.plan)).length, label:"Premium+", color:"#a78bfa" },
        ].map(({ val, label, color }) => (
          <div key={label} className="rounded-xl p-3 text-center" style={{ background:`rgba(${color==="#00f5d4"?"0,245,212":color==="#39ff7e"?"57,255,126":color==="#fbbf24"?"251,191,36":"167,139,250"},0.06)`, border:`1px solid rgba(${color==="#00f5d4"?"0,245,212":color==="#39ff7e"?"57,255,126":color==="#fbbf24"?"251,191,36":"167,139,250"},0.2)` }}>
            <p className="text-2xl font-black" style={{ color }}>{val}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {cats.map(cat => {
        const meta = catMeta[cat] ?? { color:"#94a3b8", icon:"🔹" };
        const catMods = mods.filter(m => m.cat === cat);
        return (
          <div key={cat}>
            {/* Category header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
                style={{ background:`rgba(${meta.color==="#00f5d4"?"0,245,212":"0,0,0"},0.12)`, border:`1px solid ${meta.color}30` }}>
                {meta.icon}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black tracking-widest uppercase" style={{ color:meta.color }}>{cat}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full border font-bold" style={{ color:meta.color, borderColor:`${meta.color}35`, background:`${meta.color}10` }}>{catMods.length} módulos</span>
              </div>
              <div className="h-px flex-1" style={{ background:`linear-gradient(90deg,${meta.color}30,transparent)` }}/>
            </div>
            {/* Module cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
              {catMods.map(m => (
                <div key={m.ruta} className="rounded-xl p-3.5 hover:scale-[1.01] transition-transform cursor-default"
                  style={{ background:`rgba(${m.glow},0.05)`, border:`1px solid rgba(${m.glow},0.2)` }}>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background:`rgba(${m.glow},0.1)`, border:`1px solid rgba(${m.glow},0.2)` }}>
                      {m.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="text-[13px] font-black text-foreground leading-tight">{m.name}</p>
                        <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full" style={{ background:`rgba(${planColors[m.plan]==="#39ff7e"?"57,255,126":planColors[m.plan]==="#fbbf24"?"251,191,36":planColors[m.plan]==="#a78bfa"?"167,139,250":"0,245,212"},0.12)`, color:planColors[m.plan], border:`1px solid ${planColors[m.plan]}35` }}>
                          {planLabels[m.plan]}
                        </span>
                      </div>
                      <code className="text-[9px] font-mono" style={{ color:`rgba(${m.glow},0.5)` }}>{m.ruta}</code>
                      <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{m.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SecPwa() {
  return (
    <div className="space-y-6">
      <SectionBanner emoji="📱" title="Instalar PWA" subtitle="Instala CIVAC PRO como app nativa en tu dispositivo" c1="#0a1f3c" c2="#0e3050"/>
      <div className="space-y-4">
        {/* Android Chrome */}
        <div className="rounded-2xl p-5" style={{ background:"rgba(57,255,126,0.05)", border:"1px solid rgba(57,255,126,0.15)" }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🤖</span>
            <h3 className="font-black text-foreground">Android — Chrome</h3>
            <Badge text="Recomendado" color="#39ff7e"/>
          </div>
          <div className="space-y-2.5">
            <Step n={1} text='Abre CIVAC PRO en Chrome. Aparece el banner "Agregar a pantalla de inicio" en la parte inferior.' color="#39ff7e"/>
            <Step n={2} text='Si no aparece el banner: toca los 3 puntos ⋮ → "Agregar a pantalla de inicio".' color="#39ff7e"/>
            <Step n={3} text='Confirma en el diálogo. La app se instala como ícono en tu pantalla principal.' color="#39ff7e"/>
            <Step n={4} text='Abre CIVAC PRO desde el ícono — funciona como app nativa, sin barra del navegador.' color="#39ff7e"/>
          </div>
        </div>
        {/* iOS Safari */}
        <div className="rounded-2xl p-5" style={{ background:"rgba(0,200,255,0.05)", border:"1px solid rgba(0,200,255,0.15)" }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🍎</span>
            <h3 className="font-black text-foreground">iPhone / iPad — Safari</h3>
          </div>
          <div className="space-y-2.5">
            <Step n={1} text="Abre CIVAC PRO en Safari (NO Chrome ni otro navegador)." color="#00c8ff"/>
            <Step n={2} text='Toca el botón Compartir 📤 en la barra inferior de Safari.' color="#00c8ff"/>
            <Step n={3} text='Selecciona "Agregar a pantalla de inicio" en el menú.' color="#00c8ff"/>
            <Step n={4} text='Confirma el nombre y toca "Agregar". La app aparece en tu pantalla.' color="#00c8ff"/>
          </div>
        </div>
        {/* Desktop */}
        <div className="rounded-2xl p-5" style={{ background:"rgba(167,139,250,0.05)", border:"1px solid rgba(167,139,250,0.15)" }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🖥️</span>
            <h3 className="font-black text-foreground">PC — Chrome / Edge</h3>
          </div>
          <div className="space-y-2.5">
            <Step n={1} text="Busca el ícono de instalación ⊕ en la barra de direcciones (extremo derecho)." color="#a78bfa"/>
            <Step n={2} text='Haz clic y selecciona "Instalar CIVAC PRO".' color="#a78bfa"/>
            <Step n={3} text="La app abre como ventana independiente sin pestañas del navegador." color="#a78bfa"/>
          </div>
        </div>
      </div>

      {/* PWA Features */}
      <div>
        <p className="text-[11px] font-mono font-bold tracking-widest mb-3" style={{ color:"rgba(0,245,212,0.4)" }}>CARACTERÍSTICAS PWA — SERVICE WORKER v8</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            { icon:"⚡", t:"Cache-first assets",      d:"JS, CSS, imágenes servidas desde caché instantáneamente" },
            { icon:"🔄", t:"Stale-while-revalidate",  d:"Navegación HTML siempre disponible, actualiza en fondo" },
            { icon:"📡", t:"Network-first API",       d:"Datos siempre frescos con fallback a caché offline" },
            { icon:"🔵", t:"Background sync",         d:"Acciones offline se envían al recuperar conexión" },
            { icon:"⏰", t:"Periodic sync",           d:"Pre-calienta datos cada 6 horas automáticamente" },
            { icon:"🔔", t:"Push notifications",      d:"Alertas de partos, vacunación y stock desde el servidor" },
            { icon:"💾", t:"33 rutas pre-cacheadas",  d:"Toda la app disponible offline desde la instalación" },
            { icon:"📤", t:"Share target",            d:"Comparte archivos .json directamente al módulo Datos" },
          ].map(f => (
            <div key={f.t} className="flex items-start gap-3 p-3 rounded-xl" style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)" }}>
              <span className="text-base mt-0.5">{f.icon}</span>
              <div>
                <p className="text-[12px] font-bold text-foreground">{f.t}</p>
                <p className="text-[11px] text-muted-foreground">{f.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Tip text="El Service Worker v8 pre-cachea las 33 rutas de la app en la instalación. Verifica el estado en Configuración → Datos → Info caché." color="#00f5d4"/>
    </div>
  );
}

function SecOffline() {
  return (
    <div className="space-y-6">
      <SectionBanner emoji="📶" title="Modo Offline" subtitle="CIVAC PRO funciona 100% sin internet" c1="#0f0a2a" c2="#1a0a3c"/>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { icon:"💾", t:"IndexedDB", d:"Base de datos local del navegador. Almacena todos los registros ganaderos sin límite práctico.", color:"#a78bfa" },
          { icon:"⚡", t:"Service Worker v8", d:"Intercepta todas las peticiones. Sirve desde caché cuando no hay conexión.", color:"#00f5d4" },
          { icon:"🔄", t:"Background Sync", d:"Las acciones realizadas offline se envían automáticamente al recuperar internet.", color:"#39ff7e" },
          { icon:"🔔", t:"Push Offline", d:"Las alertas críticas se muestran aunque la app esté en segundo plano.", color:"#fbbf24" },
        ].map(c => (
          <InfoCard key={c.t} icon={<span>{c.icon}</span>} title={c.t} desc={c.d} color={c.color}/>
        ))}
      </div>

      <div className="rounded-xl p-4" style={{ background:"rgba(0,245,212,0.05)", border:"1px solid rgba(0,245,212,0.15)" }}>
        <p className="text-sm font-bold text-foreground mb-3">¿Qué funciona offline?</p>
        <div className="space-y-2">
          {[
            ["✅","Todos los módulos de producción animal (inventario, pesaje, reproducción, genética)"],
            ["✅","Registrar pesajes, partos, inseminaciones y eventos de salud"],
            ["✅","Ver y editar potreros, raciones y costos"],
            ["✅","Consultar fichas de animales e historial"],
            ["✅","Reportes y gráficas (datos locales)"],
            ["✅","Pesaje Bluetooth (Bluetooth no depende de internet)"],
            ["⚠️","GPS bovino funciona offline pero el mapa de tiles puede requerir internet la primera vez"],
            ["❌","Sincronización Google Drive (requiere conexión)"],
          ].map(([status, text], i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <span>{status}</span>
              <span className="text-muted-foreground">{text}</span>
            </div>
          ))}
        </div>
      </div>
      <Tip text="Activa el almacenamiento persistente en tu navegador: te protege contra la limpieza automática de caché cuando el disco está lleno." color="#a78bfa"/>
    </div>
  );
}

function SecLogin() {
  const CIVAC_STAFF = [
    { emoji:"🔱", n:"Javier Sánchez B.",            e:"Softganventas@gmail.com",            p:"civac2026",   r:"superadmin", rc:"#e74c3c", cargo:"CEO · Fundador",         from:"#c0392b", to:"#e74c3c", glow:"192,57,43"   },
    { emoji:"👑", n:"Lizet Daza",                   e:"lizet.daza@civac.co",                p:"lizet2026",   r:"admin",      rc:"#f0c040", cargo:"Co-Fund · Dir. Ejec.",  from:"#d4a017", to:"#f0c040", glow:"212,160,23"  },
    { emoji:"🛠️",n:"Johnatan Vallejo M.",            e:"johnatanvallejomarulanda@gmail.com", p:"dev2026",     r:"developer",  rc:"#00e676", cargo:"Arquitecto · Dev",      from:"#00c853", to:"#00e676", glow:"0,200,83"    },
    { emoji:"📊", n:"Asesora CIVAC Ventas",          e:"ventas@civac.co",                   p:"ventas2026",  r:"sales",      rc:"#e879f9", cargo:"Asesora Comercial",     from:"#e879f9", to:"#a855f7", glow:"232,121,249" },
  ];
  const DEMO_CLIENTS = [
    { emoji:"🩺", n:"Dr. Carlos Ramírez",  e:"vet@ganader.ia",    p:"vet2026",   r:"vet",    rc:"#29b6f6", plan:"PRO",    cargo:"Médico Veterinario"          },
    { emoji:"🌿", n:"Luis Patiño",         e:"luis@ganader.ia",   p:"campo2026", r:"field",  rc:"#66bb6a", plan:"Básico", cargo:"Jefe de Campo"               },
    { emoji:"📈", n:"Propietario / Inv.",  e:"visor@ganader.ia",  p:"visor",     r:"viewer", rc:"#ab47bc", plan:"Básico", cargo:"Propietario · Solo lectura"  },
  ];

  return (
    <div className="space-y-6">
      <SectionBanner emoji="🔐" title="Login & Cuentas" subtitle="3 tabs · 2 tipos de cuenta · Google OAuth · 7 usuarios" c1="#1a0a1a" c2="#2a0a2a"/>

      {/* Login tabs info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {[
          { tab:"🔑 Iniciar Sesión",  color:"#00f5d4", glow:"0,245,212",   desc:"Email + contraseña · Google OAuth · auto-login por invite token" },
          { tab:"👥 Cuentas Demo",    color:"#39ff7e", glow:"57,255,126",  desc:"4 planes de demostración + panel CIVAC Staff con tarjetas de equipo" },
          { tab:"💳 Planes",          color:"#fbbf24", glow:"251,191,36",  desc:"Básico / PRO / Premium / Platino · pasarela Wompi · Nequi · PSE" },
          { tab:"✨ Registrarse",     color:"#a855f7", glow:"168,85,247",  desc:"Registro nuevo usuario: nombre, email, finca · pendiente de activación" },
          { tab:"🤖 Módulo IA",       color:"#e879f9", glow:"232,121,249", desc:"Showcase de 6 capacidades IA: Genética, GPS, CO₂, Costos, Diagnóstico" },
        ].map(t => (
          <div key={t.tab} className="p-3 rounded-xl"
            style={{ background:`rgba(${t.glow},0.05)`, border:`1px solid rgba(${t.glow},0.20)` }}>
            <p className="text-[11px] font-black mb-1" style={{ color:t.color }}>{t.tab}</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed">{t.desc}</p>
          </div>
        ))}
      </div>

      {/* Google OAuth info */}
      <div className="rounded-2xl p-4" style={{ background:"rgba(66,133,244,0.06)", border:"1px solid rgba(66,133,244,0.25)" }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background:"rgba(66,133,244,0.10)", border:"1px solid rgba(66,133,244,0.25)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-white mb-0.5">Google OAuth 2.0 — Inicio con Google</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed mb-2">
              El backend Node.js maneja el flujo OAuth server-side vía <code className="text-blue-400">/api/auth/google</code>. El botón "Continuar con Google" aparece solo cuando <code className="text-blue-400">GOOGLE_CLIENT_ID</code> está configurado. Nuevos usuarios quedan en estado <em>pendiente</em> hasta activación por admin.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {["GET /api/auth/google → redirect","GET /api/auth/google/callback → token","GET /api/auth/google/status → bool","GET /api/auth/me → user info"].map(e => (
                <code key={e} className="text-[8px] px-2 py-0.5 rounded" style={{ background:"rgba(66,133,244,0.10)", color:"rgba(147,197,253,0.7)" }}>{e}</code>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CIVAC Staff accounts */}
      <div>
        <p className="text-[10px] font-black tracking-widest uppercase mb-3" style={{ color:"rgba(0,245,212,0.5)" }}>
          ⬡ CIVAC Staff — Acceso Portal Servidor
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {CIVAC_STAFF.map(s => (
            <div key={s.e} className="rounded-2xl overflow-hidden"
              style={{ background:`linear-gradient(135deg,rgba(${s.glow},0.08),rgba(${s.glow},0.03))`, border:`1.5px solid rgba(${s.glow},0.25)` }}>
              <div className="h-0.5" style={{ background:`linear-gradient(90deg,${s.from},${s.to})` }}/>
              <div className="p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background:`rgba(${s.glow},0.12)`, border:`1px solid rgba(${s.glow},0.30)` }}>
                  {s.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="text-[12px] font-black text-white">{s.n}</p>
                    <span className="text-[7px] font-black px-1.5 py-0.5 rounded-full" style={{ background:`rgba(${s.glow},0.12)`, color:`rgb(${s.glow})`, border:`1px solid rgba(${s.glow},0.25)` }}>{s.r}</span>
                    <span className="text-[7px] font-black px-1.5 py-0.5 rounded-full" style={{ background:"rgba(0,245,212,0.07)", color:"rgba(0,245,212,0.6)", border:"1px solid rgba(0,245,212,0.18)" }}>⬡ CIVAC</span>
                  </div>
                  <p className="text-[9px] font-mono text-muted-foreground truncate">{s.e}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[8px] px-1.5 py-0.5 rounded" style={{ background:"rgba(57,255,126,0.10)", color:"rgba(57,255,126,0.75)" }}>Acceso gestionado</span>
                    <span className="text-[8px]" style={{ color:"rgba(255,255,255,0.25)" }}>· {s.cargo}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Client account access */}
      <div>
        <p className="text-[10px] font-black tracking-widest uppercase mb-3" style={{ color:"rgba(57,255,126,0.5)" }}>
          Cuentas y acceso de clientes
        </p>
        <div className="rounded-xl overflow-hidden" style={{ border:"1px solid rgba(255,255,255,0.08)" }}>
          <div className="grid grid-cols-4 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground"
            style={{ background:"rgba(255,255,255,0.03)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <span>Usuario</span><span>Email</span><span>Acceso</span><span>Rol · Plan</span>
          </div>
          {DEMO_CLIENTS.map((row, i) => (
            <div key={row.e} className="grid grid-cols-4 px-3 py-2.5 text-[10px] items-center gap-1"
              style={{ borderBottom: i<DEMO_CLIENTS.length-1 ? "1px solid rgba(255,255,255,0.04)" : "none", background: i%2===0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <span>{row.emoji}</span><span className="truncate">{row.n.split(" ")[0]} {row.n.split(" ")[1]}</span>
              </div>
              <code className="font-mono text-muted-foreground text-[9px] truncate">{row.e}</code>
              <span className="text-[8px] font-semibold" style={{ color:"#39ff7e" }}>Google OAuth / contraseña segura</span>
              <div className="flex flex-wrap gap-1">
                <span className="text-[7px] font-black px-1.5 py-0.5 rounded-full" style={{ background:`${row.rc}15`, color:row.rc, border:`1px solid ${row.rc}30` }}>{row.r}</span>
                <span className="text-[7px] font-black px-1.5 py-0.5 rounded-full" style={{ background:"rgba(0,245,212,0.07)", color:"rgba(0,245,212,0.55)", border:"1px solid rgba(0,245,212,0.15)" }}>{row.plan}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <InfoCard icon={<svg width="16" height="16" viewBox="0 0 24 24"><path d="M21.35 11.1h-9.18v2.72h5.27c-.23 1.45-1.68 4.25-5.27 4.25-3.17 0-5.76-2.62-5.76-5.84s2.59-5.84 5.76-5.84c1.81 0 3.02.77 3.71 1.43l2.5-2.43C16.47 3.88 14.57 3 12.17 3 7.2 3 3.16 7.03 3.16 12s4.04 9 9.01 9c5.2 0 8.66-3.65 8.66-8.8 0-.59-.06-.99-.14-1.1z" fill="currentColor"/></svg>} title="Google Login" desc="Botón OAuth visible en acceso y registro; las cuentas se activan según el rol asignado." color="#4285f4" />
        <InfoCard icon={<Cloud size={16}/>} title="Respaldos" desc="Exportación de datos y respaldos operativos sin exponer contraseñas ni tokens." color="#00f5d4" />
        <InfoCard icon={<Shield size={16}/>} title="Accesos" desc="Roles separados para superadmin, admin, developer, ventas, soporte y cliente." color="#39ff7e" />
      </div>

      {/* Roles matrix */}
      <div>
        <p className="text-[10px] font-black tracking-widest uppercase mb-3" style={{ color:"rgba(255,255,255,0.25)" }}>
          Matriz de roles · 6 niveles de acceso
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { role:"superadmin", emoji:"🔱", desc:"Control total · Server Panel · Auditoría · Config global", color:"#e74c3c" },
            { role:"admin",      emoji:"👑", desc:"Panel Admin · Gestión clientes · Facturación · Usuarios",  color:"#f0c040" },
            { role:"developer",  emoji:"🛠️", desc:"Consola Dev · API · Feature flags · Deploy",               color:"#00e676" },
            { role:"sales",      emoji:"📊", desc:"CRM · Pipeline comercial · Reportes de ventas",             color:"#e879f9" },
            { role:"vet",        emoji:"🩺", desc:"Sanidad · Ficha clínica · Reproducción · Genética",         color:"#29b6f6" },
            { role:"field",      emoji:"🌿", desc:"Pesaje · Potreros · GPS · Insumos · Básculas COM/BT",       color:"#66bb6a" },
          ].map(r => (
            <div key={r.role} className="p-3 rounded-xl"
              style={{ background:`${r.color}08`, border:`1px solid ${r.color}22` }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{r.emoji}</span>
                <Badge text={r.role} color={r.color}/>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SecInventario() {
  return (
    <div className="space-y-6">
      <SectionBanner emoji="🐄" title="Inventario Animal" subtitle="Registro completo de tu hato bovino con RFID y filtros" c1="#062010" c2="#0b3820"/>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InfoCard icon={<Beef size={16}/>} title="Registro bovinos" desc="Crea registros con aretado, nombre, categoría (toro/vaca/novillo/ternero), raza, peso inicial y potrero asignado." color="#39ff7e"/>
        <InfoCard icon={<Tag size={16}/>} title="RFID CIVAC" desc="Vincula etiquetas RFID EPC96 para lectura automática con lectores UHF. Protocolo CIVAC-RFID integrado." color="#fbbf24"/>
        <InfoCard icon={<Scale size={16}/>} title="Pesaje integrado" desc="Desde la ficha del animal puedes acceder directamente al módulo de pesaje BT o manual." color="#ff9a3c"/>
        <InfoCard icon={<FileDown size={16}/>} title="Exportar / Importar" desc="Exporta el inventario a CSV o JSON. Importa desde plantilla Excel con validación automática." color="#a78bfa"/>
      </div>
      <div className="space-y-3">
        <p className="text-sm font-bold text-foreground">Categorías disponibles</p>
        <div className="flex flex-wrap gap-2">
          {["Toro", "Vaca lechera", "Vaca cría", "Novillo", "Novilla", "Ternero", "Ternera", "Macho ceba", "Hembra ceba"].map(cat => (
            <Badge key={cat} text={cat} color="#39ff7e"/>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Faq q="¿Puedo importar desde Excel?" a="Sí. Descarga la plantilla CSV en el módulo → Importar, llena los datos y sube el archivo. CIVAC valida el formato automáticamente."/>
        <Faq q="¿Cómo funciona el RFID?" a="Necesitas un lector UHF compatible. El sistema lee las etiquetas EPC96 y las asocia al animal por ID. También puedes ingresar el número manualmente."/>
        <Faq q="¿Puedo registrar fotos de los animales?" a="Sí, en la ficha individual puedes subir una foto de referencia del animal para identificación visual."/>
      </div>
    </div>
  );
}

function SecPesaje() {
  return (
    <div className="space-y-6">
      <SectionBanner emoji="⚖️" title="Pesaje Bluetooth" subtitle="Báscula BT con motor IA — BCS, GMD, razas y diagnóstico" c1="#1a0c04" c2="#2d1a08"/>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InfoCard icon={<Bluetooth size={16}/>} title="Web Bluetooth API" desc="Conecta báscula BT (Tru-Test · Gallagher · Arlyn). Parser 9-byte frame CIVAC. Lectura automática del peso." color="#3b82f6"/>
        <InfoCard icon={<Cpu size={16}/>} title="IA Engine" desc="Calcula BCS (Body Condition Score 1-9), GMD, diagnóstico por raza. Compatible con 9 razas bovinas Colombia." color="#e879f9"/>
        <InfoCard icon={<Scale size={16}/>} title="9 razas calibradas" desc="Holstein, Jersey, Brahman, Simmental, Angus, Cebuíno, BON, Normando, Criollo Colombiano." color="#fbbf24"/>
        <InfoCard icon={<Printer size={16}/>} title="Recibo PDF" desc="Genera recibo imprimible con: peso, BCS, GMD, animal, fecha, operador y firma." color="#39ff7e"/>
      </div>
      <div className="space-y-3">
        <p className="text-sm font-bold text-foreground">Flujo de pesaje BT</p>
        <div className="space-y-2.5">
          <Step n={1} text="Escanea dispositivos Bluetooth cercanos con el botón 'Escanear'." color="#3b82f6"/>
          <Step n={2} text="Selecciona tu báscula en la lista. El estado cambia a CONECTADO." color="#3b82f6"/>
          <Step n={3} text="Coloca el animal en la báscula. El peso se registra automáticamente (frame 9 bytes)." color="#3b82f6"/>
          <Step n={4} text="Selecciona el animal del inventario y el sistema calcula BCS + GMD con IA." color="#3b82f6"/>
          <Step n={5} text="Guarda el registro e imprime el recibo si lo necesitas." color="#3b82f6"/>
        </div>
      </div>
      <Tip text="Si Bluetooth no está disponible en tu navegador, usa el modo Pesaje Manual (ruta /pesaje-manual) que también calcula BCS y GMD por fórmula." color="#3b82f6"/>
    </div>
  );
}

function SecReproduccion() {
  return (
    <div className="space-y-6">
      <SectionBanner emoji="❤️" title="Reproducción" subtitle="IEP, celos, inseminaciones, partos y anestros" c1="#1a0515" c2="#2d0a25"/>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InfoCard icon={<Heart size={16}/>} title="Ciclos reproductivos" desc="Registra celos observados, detección por cambios de comportamiento o dispositivos de detección." color="#ff6fd8"/>
        <InfoCard icon={<Baby size={16}/>} title="Inseminaciones" desc="IA bovina con seguimiento: toro, fecha, técnico, resultado. Protocolo IATF integrado." color="#f472b6"/>
        <InfoCard icon={<Heart size={16}/>} title="Próximos partos" desc="Calendario predictivo basado en fecha de monta/IA. Alertas automáticas 30, 15 y 7 días antes." color="#ec4899"/>
        <InfoCard icon={<Activity size={16}/>} title="IEP y anestros" desc="Calcula IEP (Intervalo Entre Partos) y detecta vacas en anestro para intervención." color="#ff6fd8"/>
      </div>
      <div className="space-y-2">
        <Faq q="¿Qué es el IEP y cuál es el valor óptimo?" a="El Intervalo Entre Partos (IEP) mide días entre partos consecutivos. El óptimo es 365 días (parto anual). Valores >420 días indican problemas reproductivos."/>
        <Faq q="¿Cómo registro un protocolo IATF?" a="En el módulo Reproducción → Nueva inseminación → selecciona el protocolo (Ovsynch · Presynch · Co-synch) y el sistema guía los pasos."/>
        <Faq q="¿Las alertas de parto próximo llegan al celular?" a="Sí, si tienes la PWA instalada y las notificaciones push activadas, recibirás alertas 30, 15 y 7 días antes del parto estimado."/>
      </div>
    </div>
  );
}

function SecGenetica() {
  return (
    <div className="space-y-6">
      <SectionBanner emoji="🧬" title="Genética & DEP" subtitle="Diferencias Esperadas en Progenie para selección genética" c1="#0f0520" c2="#1a0a35"/>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InfoCard icon={<Dna size={16}/>} title="DEP Ranking" desc="Lista de toros rankeados por DEP: leche, grasa, proteína, facilidad de parto, longevidad y características." color="#a855f7"/>
        <InfoCard icon={<BarChart3 size={16}/>} title="Score Bars" desc="Barras horizontales de progreso para visualizar el DEP de cada característica de forma rápida." color="#8b5cf6"/>
        <InfoCard icon={<Award size={16}/>} title="Pedigrí" desc="Árbol genealógico del animal: padre, madre, abuelos. Identificación de endogamia." color="#7c3aed"/>
        <InfoCard icon={<Dna size={16}/>} title="Semen criogénico" desc="Módulo Semen registra el inventario de pajillas, dosis por toro y embriones TE disponibles." color="#a78bfa"/>
      </div>
      <Tip text="Usa el DEP de facilidad de parto (FP) para vaquillas primerizas. Un FP bajo reduce el riesgo de distocias y pérdidas al nacer." color="#a855f7"/>
    </div>
  );
}

function SecProduccion() {
  return (
    <div className="space-y-6">
      <SectionBanner emoji="🥛" title="Producción de Leche" subtitle="Registro diario de ordeños y análisis de tendencias" c1="#040f1a" c2="#071c35"/>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InfoCard icon={<Droplets size={16}/>} title="Ordeños diarios" desc="Registra hasta 3 ordeños por día por vaca. Sistema acumula litros, calcula promedios y detecta bajan." color="#00c8ff"/>
        <InfoCard icon={<BarChart3 size={16}/>} title="BarChart 7 meses" desc="Gráfica de barras de producción mensual histórica. Comparar años y detectar estacionalidad." color="#0ea5e9"/>
        <InfoCard icon={<Award size={16}/>} title="Ranking top-vacas" desc="Lista automática de las 5 vacas con mayor producción diaria y mensual del hato." color="#38bdf8"/>
        <InfoCard icon={<Activity size={16}/>} title="Curva de lactancia" desc="Gráfica individual por animal de su curva de lactancia. Detecta descensos anormales." color="#00c8ff"/>
      </div>
      <Tip text="La producción promedio del hato demo es 84 L/día con 13 animales en ordeño. Para aumentar: verifica BCS, nutrición y estado reproductivo." color="#00c8ff"/>
    </div>
  );
}

function SecCampo() {
  return (
    <div className="space-y-6">
      <SectionBanner emoji="🌿" title="Campo & Potreros" subtitle="Plan de rotación, semáforo de estado y lotes" c1="#051a0a" c2="#082d12"/>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InfoCard icon={<MapPin size={16}/>} title="Mapa CSS potreros" desc="Visualización de los 6 lotes con estado por color: verde (disponible), amarillo (descansando), rojo (agotado)." color="#4ade80"/>
        <InfoCard icon={<RefreshCw size={16}/>} title="Rotación activa" desc="El sistema gestiona el plan de rotación: días de pastoreo, descanso y reposición de pasto por potrero." color="#22c55e"/>
        <InfoCard icon={<Tag size={16}/>} title="Módulo Lotes" desc="Registra movimientos de animales entre lotes. Historial de entradas/salidas por potrero." color="#86efac"/>
        <InfoCard icon={<Wheat size={16}/>} title="Carga animal" desc="Calcula la carga por ha según animales presentes. Alerta cuando supera la capacidad del potrero." color="#4ade80"/>
      </div>
      <div className="space-y-2">
        <Faq q="¿Cuántos potreros puede manejar CIVAC PRO?" a="Actualmente 6 potreros en el mapa CSS. En la versión Premium se amplía a 12 con GPS overlay para cada uno."/>
        <Faq q="¿Cómo funciona el plan de rotación?" a="Defines días de pastoreo (ej: 3 días) y días de descanso (ej: 21 días). El sistema calcula automáticamente cuándo mover los animales al siguiente potrero."/>
      </div>
    </div>
  );
}

function SecGps() {
  return (
    <div className="space-y-6">
      <SectionBanner emoji="📡" title="GPS Bovino" subtitle="Rastreo en tiempo real con geovallado y Bluetooth" c1="#020d1a" c2="#0a2745"/>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InfoCard icon={<Navigation size={16}/>} title="watchPosition real" desc="Usa navigator.geolocation.watchPosition del navegador para seguimiento continuo sin app nativa." color="#0ea5e9"/>
        <InfoCard icon={<Map size={16}/>} title="Mapa SVG animado" desc="Potreros con colores, dots animados con pulso para animales online, historial de movimiento." color="#00c8ff"/>
        <InfoCard icon={<Radio size={16}/>} title="13 collares activos" desc="Dispositivos CIVAC-GPS-v3 con MQTT broker en mqtt.civac.co:1883. Batería y señal en tiempo real." color="#38bdf8"/>
        <InfoCard icon={<Shield size={16}/>} title="Geovallado" desc="Define zonas seguras por potrero. Alerta inmediata si un animal sale del área asignada." color="#0ea5e9"/>
      </div>
      <div className="space-y-3">
        <p className="text-sm font-bold text-foreground">Vinculación de dispositivos</p>
        <div className="space-y-2.5">
          <Step n={1} text="Ve a GPS → Dispositivos → Nuevo dispositivo." color="#0ea5e9"/>
          <Step n={2} text="Ingresa: nombre del collar, IMEI, tipo (GPS/BT) y animal asignado." color="#0ea5e9"/>
          <Step n={3} text="Si el collar es Bluetooth, usa 'Escanear BT' para emparejar directamente." color="#0ea5e9"/>
          <Step n={4} text="El collar aparece en el mapa como dot animado con su estado de batería." color="#0ea5e9"/>
        </div>
      </div>
      <Tip text="El módulo GPS Chips (/gps-chips) es el gestor avanzado de todos los dispositivos, historial de movimiento y configuración del broker MQTT." color="#0ea5e9"/>
    </div>
  );
}

function SecSanidad() {
  return (
    <div className="space-y-6">
      <SectionBanner emoji="💉" title="Sanidad Animal" subtitle="Control sanitario, vacunación y tratamientos del hato" c1="#051a08" c2="#082d12"/>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InfoCard icon={<Activity size={16}/>} title="Plan vacunacional" desc="Registro de vacunas por animal y por hato. Alertas automáticas de refuerzos y vencimientos del biológico." color="#22c55e"/>
        <InfoCard icon={<FlaskConical size={16}/>} title="Tratamientos" desc="Registro de diagnósticos, medicamentos, dosis y duración del tratamiento. Control de periodos de retiro." color="#4ade80"/>
        <InfoCard icon={<Shield size={16}/>} title="Enfermedades ICA" desc="Reporte de enfermedades de notificación obligatoria ante el ICA Colombia. Gestión de cuarentenas." color="#16a34a"/>
        <InfoCard icon={<FileText size={16}/>} title="Historial sanitario" desc="Cada animal tiene su historial clínico completo accesible desde Ficha Animal o directamente desde Sanidad." color="#22c55e"/>
      </div>
      <div className="space-y-2">
        <Faq q="¿Cómo registro una vacunación masiva del hato?" a="Sanidad → Vacunación → Vacunación masiva. Selecciona el biológico, lote, dosis y el sistema aplica a todos los animales del grupo seleccionado."/>
        <Faq q="¿Qué es el periodo de retiro?" a="Es el tiempo mínimo que debe pasar entre la última dosis del medicamento y el sacrificio o la entrega de leche para consumo. CIVAC calcula y alerta automáticamente cuando termina el periodo."/>
      </div>
    </div>
  );
}

function SecTrazabilidad() {
  return (
    <div className="space-y-6">
      <SectionBanner emoji="📋" title="Trazabilidad ICA" subtitle="Cumplimiento normativo bovino Colombia — Resolución ICA" c1="#1a0d04" c2="#2d1a08"/>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InfoCard icon={<Tag size={16}/>} title="Registro ICA" desc="Genera el reporte de movilización bovina según el formato oficial ICA Colombia. SINIGAN compatible." color="#f97316"/>
        <InfoCard icon={<FileText size={16}/>} title="Guías de movilización" desc="Crea guías de movilización electrónicas para traslado entre predios o hacia la planta de sacrificio." color="#fb923c"/>
        <InfoCard icon={<Shield size={16}/>} title="Predios registrados" desc="Gestiona tus predios CIVAC con NUPEC (Número Único de Predio Pecuario). Vinculación a SINIGAN." color="#f97316"/>
        <InfoCard icon={<Award size={16}/>} title="Cadena de custodia" desc="Trazabilidad completa: desde nacimiento → vacunaciones → movilizaciones → sacrificio o exportación." color="#ea580c"/>
      </div>
      <div className="rounded-xl p-4" style={{ background:"rgba(249,115,22,0.06)", border:"1px solid rgba(249,115,22,0.2)" }}>
        <p className="text-sm font-bold text-foreground mb-2">📌 Marco legal Colombia</p>
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>• Resolución ICA 970 de 2010 — Sistema Nacional de Identificación e Información del Ganado Bovino</p>
          <p>• Decreto 1500 de 2007 — Reglamento técnico para la cadena de cárnicos</p>
          <p>• Ley 914 de 2004 — Sistema Nacional de Identificación e Información del Ganado Bovino y Bufalino</p>
        </div>
      </div>
      <Tip text="Para exportar bovinos o comercializarlos con plantas de sacrificio TIF, el sistema genera automáticamente los documentos exigidos por el ICA." color="#f97316"/>
    </div>
  );
}

function SecFinanzas() {
  return (
    <div className="space-y-6">
      <SectionBanner emoji="💰" title="Costos & Finanzas" subtitle="P&G, costo por litro, margen y análisis financiero" c1="#1a0f02" c2="#2d1e06"/>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InfoCard icon={<DollarSign size={16}/>} title="P&G detallado" desc="Estado de resultados con ingresos (leche, carne, pie de cría) y egresos (alimentación, sanidad, nómina, servicios)." color="#fbbf24"/>
        <InfoCard icon={<Activity size={16}/>} title="Costo por litro" desc="Calcula el costo de producción por litro de leche en tiempo real. Compara contra precio de venta." color="#f59e0b"/>
        <InfoCard icon={<BarChart3 size={16}/>} title="5 KPIs financieros" desc="Margen bruto, ROI, costo/vaca/mes, ingreso mensual y punto de equilibrio del hato." color="#fbbf24"/>
        <InfoCard icon={<Cpu size={16}/>} title="Predicción IA" desc="Módulo /prediccion: simulador con sliders para proyectar escenarios financieros a 12 meses." color="#e879f9"/>
      </div>
      <div className="space-y-2">
        <Faq q="¿Cómo registro los ingresos por venta de leche?" a="Costos → Ingresos → Nueva entrada. Selecciona 'Venta leche', ingresa litros y precio por litro. El sistema calcula automáticamente el total mensual."/>
        <Faq q="¿El módulo CO₂ afecta las finanzas?" a="Sí, el módulo Huella CO₂ calcula tu huella de carbono según IPCC 2019 y te muestra el potencial de bonos de carbono que puedes vender en el mercado voluntario."/>
      </div>
    </div>
  );
}

function SecPersonal() {
  return (
    <div className="space-y-6">
      <SectionBanner emoji="👥" title="Personal & Nómina" subtitle="Gestión de empleados, nómina y prestaciones sociales" c1="#040d1a" c2="#071932"/>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InfoCard icon={<Users size={16}/>} title="6 empleados demo" desc="Cargos: ordeñador, vaquero, administrador, auxiliar, mayordomo, asesor veterinario. Con foto y datos completos." color="#60a5fa"/>
        <InfoCard icon={<DollarSign size={16}/>} title="Nómina mensual" desc="Cálculo automático de salario, horas extras, subsidio de transporte y retenciones." color="#3b82f6"/>
        <InfoCard icon={<Shield size={16}/>} title="EPS / ARL / AFP" desc="Registro de entidades de salud, riesgos laborales y fondos de pensión por empleado." color="#60a5fa"/>
        <InfoCard icon={<Award size={16}/>} title="Prestaciones" desc="Calcula cesantías, prima de servicios, vacaciones e intereses sobre cesantías automáticamente." color="#2563eb"/>
      </div>
    </div>
  );
}

function SecPrediccion() {
  return (
    <div className="space-y-6">
      <SectionBanner emoji="🔮" title="Predicción IA" subtitle="Simulador financiero inteligente con proyecciones a 12 meses" c1="#0f0520" c2="#1c0835"/>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InfoCard icon={<Cpu size={16}/>} title="Sliders de escenario" desc="Ajusta: precio leche, cantidad animales, eficiencia reproductiva, costos alimentación y más para simular escenarios." color="#e879f9"/>
        <InfoCard icon={<BarChart3 size={16}/>} title="Proyección 12 meses" desc="Gráfica de proyección mensual con bandas de confianza. Muestra escenario base, optimista y pesimista." color="#c026d3"/>
        <InfoCard icon={<Activity size={16}/>} title="Punto de equilibrio" desc="Calcula automáticamente el número mínimo de animales y litros necesarios para cubrir costos." color="#e879f9"/>
        <InfoCard icon={<Award size={16}/>} title="Recomendaciones IA" desc="El motor analiza tus datos actuales y sugiere las 3 acciones con mayor impacto en rentabilidad." color="#a21caf"/>
      </div>
      <Tip text="Combina Predicción IA con el módulo CO₂ para proyectar ingresos por bonos de carbono y ver el impacto total en la rentabilidad de tu finca." color="#e879f9"/>
    </div>
  );
}

function SecCo2() {
  return (
    <div className="space-y-6">
      <SectionBanner emoji="🌱" title="Huella CO₂" subtitle="Medición de emisiones según IPCC 2019 AR6 · Colombia" c1="#051a08" c2="#0a2e12"/>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InfoCard icon={<TreePine size={16}/>} title="Factor IPCC 2019" desc="Usa el factor oficial CH₄: 56 kg/cabeza/año para bovinos de doble propósito en clima tropical." color="#86efac"/>
        <InfoCard icon={<BarChart3 size={16}/>} title="Benchmarking Colombia" desc="Compara tu huella con el promedio nacional (4.2 tCO₂e/vaca/año) y con fincas certificadas." color="#4ade80"/>
        <InfoCard icon={<DollarSign size={16}/>} title="Bonos de carbono" desc="Calcula el potencial de ingresos por venta de bonos en el mercado voluntario (VCS/Gold Standard)." color="#22c55e"/>
        <InfoCard icon={<Award size={16}/>} title="Reducción de emisiones" desc="Recomendaciones para reducir huella: mejora genética, ajuste de dietas, manejo de estiércol." color="#86efac"/>
      </div>
    </div>
  );
}

function SecAlertas() {
  return (
    <div className="space-y-6">
      <SectionBanner emoji="🔔" title="Centro de Alertas" subtitle="Notificaciones automáticas por severidad y módulo" c1="#1a0c04" c2="#2d1608"/>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
        {[
          { s:"CRÍTICA", c:"#ef4444", d:"Acción inmediata requerida" },
          { s:"ALTA",    c:"#f97316", d:"Atender en el día" },
          { s:"MEDIA",   c:"#fbbf24", d:"Resolver en la semana" },
          { s:"INFO",    c:"#60a5fa", d:"Informativa / seguimiento" },
        ].map(a => (
          <div key={a.s} className="p-3 rounded-xl text-center" style={{ background:`${a.c}10`, border:`1px solid ${a.c}25` }}>
            <Badge text={a.s} color={a.c}/>
            <p className="text-[10px] text-muted-foreground mt-1.5">{a.d}</p>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {[
          "Partos próximos (7, 15 y 30 días antes)",
          "Stock mínimo de insumos y medicamentos",
          "Vacunas próximas a vencer",
          "Animales en anestro prolongado",
          "Producción de leche por debajo del umbral",
          "GPS bovino fuera de geovallado",
          "Errores de conexión Bluetooth",
          "Vencimiento de licencia y plan",
        ].map((a, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <CheckCircle size={13} style={{ color:"#39ff7e", flexShrink:0 }}/>
            <span className="text-muted-foreground">{a}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SecMultifinca() {
  return (
    <div className="space-y-6">
      <SectionBanner emoji="🏢" title="Multi-Finca" subtitle="Gestiona múltiples predios desde una sola cuenta" c1="#040d1a" c2="#071932"/>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InfoCard icon={<Layers size={16}/>} title="3 fincas incluidas" desc="En el plan PRO y superior puedes gestionar hasta 3 fincas distintas desde una misma cuenta." color="#00c8ff"/>
        <InfoCard icon={<BarChart3 size={16}/>} title="Tabla comparativa" desc="Compara KPIs entre fincas: producción, costos, eficiencia reproductiva y número de animales." color="#0ea5e9"/>
        <InfoCard icon={<Globe size={16}/>} title="Regiones Colombia" desc="Cada finca tiene su región, coordenadas, tipo de sistema (lechero/doble propósito/cría) y NIT." color="#00c8ff"/>
        <InfoCard icon={<Users size={16}/>} title="Equipos por finca" desc="Asigna usuarios específicos a cada finca con permisos granulares por módulo." color="#38bdf8"/>
      </div>
    </div>
  );
}

function SecBackup() {
  return (
    <div className="space-y-6">
      <SectionBanner emoji="💾" title="Backup & Datos" subtitle="Exportar, importar, Drive y migración de datos" c1="#0a0a12" c2="#14141e"/>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InfoCard icon={<FileDown size={16}/>} title="Exportar JSON" desc="Exporta todos tus datos en un archivo JSON completo. Incluye animales, producción, costos y configuración." color="#94a3b8"/>
        <InfoCard icon={<Database size={16}/>} title="Exportar CSV" desc="Exporta módulos específicos (inventario, producción, costos) en formato CSV para Excel." color="#64748b"/>
        <InfoCard icon={<Cloud size={16}/>} title="Google Drive" desc="Módulo /drive: sincronización automática con Google Drive. Historial de 30 versiones de backup." color="#4285f4"/>
        <InfoCard icon={<RefreshCw size={16}/>} title="Restaurar datos" desc="Importa un JSON de backup para restaurar todos los datos. Compatible entre dispositivos." color="#94a3b8"/>
      </div>
      <div className="space-y-3">
        <p className="text-sm font-bold text-foreground">Flujo de backup manual</p>
        <div className="space-y-2.5">
          <Step n={1} text="Ve a Centro Datos (/datos) o Drive (/drive)." color="#94a3b8"/>
          <Step n={2} text="Toca 'Exportar JSON completo'. Se descarga un archivo civac-backup-YYYY-MM-DD.json." color="#94a3b8"/>
          <Step n={3} text="Guarda el archivo en tu Drive, nube o PC." color="#94a3b8"/>
          <Step n={4} text="Para restaurar: sube el archivo JSON al mismo módulo → Importar → Confirmar." color="#94a3b8"/>
        </div>
      </div>
      <Tip text="Configura el backup automático semanal en Configuración → Datos → Auto-backup para no perder ningún registro." color="#64748b"/>
    </div>
  );
}

function SecUsuarios() {
  return (
    <div className="space-y-6">
      <SectionBanner emoji="🔒" title="Usuarios & Roles" subtitle="Gestión de accesos, permisos y seguridad por módulo" c1="#020d0d" c2="#04191a"/>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InfoCard icon={<Shield size={16}/>} title="6 roles disponibles" desc="admin, superadmin, developer, vet, field, viewer. Cada uno con acceso diferenciado por módulo." color="#00f5d4"/>
        <InfoCard icon={<Lock size={16}/>} title="Permisos granulares" desc="Define para cada usuario qué módulos puede ver, editar o administrar." color="#0d9488"/>
        <InfoCard icon={<Users size={16}/>} title="Invitar usuarios" desc="Genera un enlace de invitación (/invite/:token) con rol y plan predefinido." color="#00f5d4"/>
        <InfoCard icon={<Globe size={16}/>} title="Sesiones activas" desc="Visualiza todos los dispositivos conectados y cierra sesión de forma remota." color="#14b8a6"/>
      </div>
      <Tip text="El Admin puede ver el módulo Usuarios completo. Los roles vet y field solo pueden ver los módulos asignados a su área de trabajo." color="#00f5d4"/>
    </div>
  );
}

function SecAsesora() {
  return (
    <div className="space-y-6">
      <SectionBanner emoji="🤖" title="Asesora IA" subtitle="Asistente inteligente especializado en ganadería colombiana" c1="#1a0820" c2="#2d1038"/>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InfoCard icon={<Star size={16}/>} title="Consultas especializadas" desc="Responde preguntas sobre reproducción, sanidad, nutrición, costos, leyes ICA y mejores prácticas ganaderas." color="#e879f9"/>
        <InfoCard icon={<Cpu size={16}/>} title="Análisis de tus datos" desc="Accede a tus registros actuales y genera reportes narrativos, recomendaciones y diagnósticos automáticos." color="#c026d3"/>
        <InfoCard icon={<Globe size={16}/>} title="Contexto Colombia" desc="Entrenado con datos específicos de Colombia: razas, clima, precios, normativa ICA, mercados regionales." color="#e879f9"/>
        <InfoCard icon={<Zap size={16}/>} title="Acceso rápido" desc="También disponible como botón flotante IA en cualquier módulo de la app para consultas contextuales." color="#a21caf"/>
      </div>
      <div className="space-y-2">
        <Faq q="¿La asesora IA tiene acceso a mis datos privados?" a="Solo los datos del contexto que tú le proporciones en la conversación. No hay transmisión automática a servidores externos sin tu consentimiento."/>
        <Faq q="¿Qué tipo de preguntas puedo hacer?" a="Desde 'cuál es el mejor protocolo IATF para mi hato' hasta 'cómo calculo el costo de producción por litro'. También puede generar reportes de tus datos actuales."/>
      </div>
    </div>
  );
}

function SecServer() {
  return (
    <div className="space-y-6">
      <SectionBanner emoji="🖥️" title="Server Panel" subtitle="Panel de control CIVAC para cuentas Staff — /server" c1="#020810" c2="#040d1a"/>
      <div className="p-4 rounded-xl flex items-start gap-3 mb-2" style={{ background:"rgba(0,245,212,0.06)", border:"1px solid rgba(0,245,212,0.18)" }}>
        <Shield size={16} style={{ color:"#00f5d4", flexShrink:0, marginTop:1 }}/>
        <p className="text-sm" style={{ color:"rgba(0,245,212,0.8)" }}>
          Acceso exclusivo para cuentas CIVAC Staff (admin, superadmin, developer, ventas). El resto de usuarios no ve esta sección.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InfoCard icon={<Server size={16}/>} title="11 secciones" desc="Hub · Servicios · Versiones PWA · Dependencias · Lenguajes · Integraciones · Instancias · Demos · Staff · Dev Console · Config." color="#00f5d4"/>
        <InfoCard icon={<Code size={16}/>} title="Dev Console" desc="Terminal simulada con comandos: pnpm build, typecheck, db push, uv sync, restart all, git status." color="#00ff88"/>
        <InfoCard icon={<Package size={16}/>} title="Versiones PWA" desc="Gestiona versiones de la app, descarga builds, genera links de instalación para clientes." color="#a78bfa"/>
        <InfoCard icon={<Globe size={16}/>} title="Integraciones" desc="Panel de APIs activas: Wompi, GPS MQTT, Bluetooth, RFID, PWA SW, IndexedDB, IPCC, Drive." color="#f97316"/>
      </div>
      <CodeBlock label="Acceso al Server Panel" code={`URL:      /server\nAcceso:   cuenta CIVAC Staff autorizada\n\nEl acceso se valida con sesión segura y rol asignado.\nNo se documentan contraseñas ni tokens en esta guía;\nusa Google OAuth o el flujo de restablecimiento de contraseña.`}/>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
const PANEL_MAP: Record<string, () => ReactElement> = {
  inicio:       SecInicio,
  modulos:      SecModulos,
  pwa:          SecPwa,
  offline:      SecOffline,
  login:        SecLogin,
  inventario:   SecInventario,
  pesaje:       SecPesaje,
  reproduccion: SecReproduccion,
  genetica:     SecGenetica,
  produccion:   SecProduccion,
  campo:        SecCampo,
  gps:          SecGps,
  sanidad:      SecSanidad,
  trazabilidad: SecTrazabilidad,
  finanzas:     SecFinanzas,
  personal:     SecPersonal,
  prediccion:   SecPrediccion,
  co2:          SecCo2,
  alertas:      SecAlertas,
  multifinca:   SecMultifinca,
  backup:       SecBackup,
  usuarios:     SecUsuarios,
  asesora:      SecAsesora,
  server:       SecServer,
};

export default function Documentacion() {
  const [active, setActive] = useState("inicio");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const visibleSections = SECTIONS.filter(sec => sec.label.toLowerCase().includes(query.toLowerCase()));
  const Panel = PANEL_MAP[active] || SecInicio;
  const current = SECTIONS.find(s => s.id === active);

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4">
      {/* Header */}
      <div className="rounded-2xl p-5 mb-5 relative overflow-hidden"
        style={{ background:"linear-gradient(135deg,#020d1a,#0a2745)", border:"1px solid rgba(0,245,212,0.15)" }}>
        <div className="absolute right-0 top-0 w-48 h-full opacity-10 pointer-events-none"
          style={{ background:"radial-gradient(ellipse at right, #00f5d4, transparent 70%)" }}/>
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background:"linear-gradient(135deg,#00f5d4,#00c8ff)", boxShadow:"0 0 20px rgba(0,245,212,0.4)" }}>
              <BookOpen size={22} style={{ color:"#040d1a" }}/>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white" style={{ fontFamily:"Sora,sans-serif" }}>Documentación</h1>
              <p className="text-sm text-white/60 mt-0.5">CIVAC PRO v2.3 · {SECTIONS.length} secciones · módulos, IA, cuentas y planes</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 rounded-xl px-3 py-2" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)" }}>
            <Search size={14} style={{ color:"rgba(148,163,184,0.7)" }}/>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar en la guía…" aria-label="Buscar sección" className="w-40 bg-transparent outline-none text-xs text-white placeholder:text-white/30" />
          </div>
          <button onClick={() => setMobileOpen(v => !v)} className="lg:hidden flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold"
            style={{ background:"rgba(0,245,212,0.1)", color:"#00f5d4", border:"1px solid rgba(0,245,212,0.2)" }}>
            <Grid3x3 size={14}/> Índice
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Sidebar nav */}
        <aside className={`flex-shrink-0 w-52 space-y-0.5 ${mobileOpen ? "fixed inset-y-0 left-0 w-64 z-50 p-4 overflow-y-auto" : "hidden lg:block"}`}
          style={mobileOpen ? { background:"rgba(4,13,26,0.99)", borderRight:"1px solid rgba(0,245,212,0.15)" } : {}}>
          {mobileOpen && (
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-white">Índice</p>
              <button onClick={() => setMobileOpen(false)} style={{ color:"rgba(148,163,184,0.5)" }}>✕</button>
            </div>
          )}
          {visibleSections.map(sec => {
            const Icon = sec.icon;
            const isActive = active === sec.id;
            return (
              <button key={sec.id}
                onClick={() => { setActive(sec.id); setMobileOpen(false); window.scrollTo(0,0); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all hover:bg-white/[0.03]"
                style={{
                  background: isActive ? `${sec.color}14` : "transparent",
                  border: isActive ? `1px solid ${sec.color}30` : "1px solid transparent",
                  color: isActive ? sec.color : "rgba(148,163,184,0.7)",
                }}>
                <Icon size={14} style={{ flexShrink:0 }}/>
                <span className="text-[12px] font-semibold truncate">{sec.label}</span>
                {isActive && <ChevronRight size={11} style={{ marginLeft:"auto", flexShrink:0 }}/>}
              </button>
            );
          })}
        </aside>
        {mobileOpen && <div className="fixed inset-0 bg-black/70 z-40 lg:hidden" onClick={() => setMobileOpen(false)}/>}

        {/* Content */}
        <main className="flex-1 min-w-0">
          {/* Mobile breadcrumb */}
          <div className="flex items-center gap-2 mb-4 lg:hidden">
            <button onClick={() => setMobileOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{ background:"rgba(255,255,255,0.04)", color:"rgba(148,163,184,0.6)", border:"1px solid rgba(255,255,255,0.08)" }}>
              <Grid3x3 size={11}/>
              {current?.label}
            </button>
          </div>
          <Panel/>
          {/* Section navigation footer */}
          <div className="flex items-center justify-between mt-8 pt-4" style={{ borderTop:"1px solid rgba(255,255,255,0.06)" }}>
            {(() => {
              const idx = SECTIONS.findIndex(s => s.id === active);
              const prev = SECTIONS[idx - 1];
              const next = SECTIONS[idx + 1];
              return (
                <>
                  <div>
                    {prev && (
                      <button onClick={() => { setActive(prev.id); window.scrollTo(0,0); }}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        ← {prev.label}
                      </button>
                    )}
                  </div>
                  <div>
                    {next && (
                      <button onClick={() => { setActive(next.id); window.scrollTo(0,0); }}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        {next.label} →
                      </button>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </main>
      </div>
    </div>
  );
}
