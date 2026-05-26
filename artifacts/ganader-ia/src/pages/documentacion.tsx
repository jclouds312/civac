import { useState } from "react";
import {
  BookOpen, Download, Smartphone, WifiOff, Bluetooth, Navigation, BarChart3, Users,
  Monitor, Globe, Cloud, FileDown, Database, Apple, CheckCircle, Scale,
  Shield, Beef, Baby, Droplets, Dna, Wheat, Package, DollarSign,
  MapPin, Bell, Zap, CreditCard, Settings, RefreshCw, Printer,
  Tag, Grid3x3, Heart, Activity, FlaskConical, TreePine, ChevronRight, Award
} from "lucide-react";
import { exportToDrive, getDriveFiles, downloadLocalBackup, downloadCSV } from "@/lib/drive";
import { useAppState } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

const SECTIONS = [
  { id: "inicio",       label: "Primeros pasos",      icon: BookOpen },
  { id: "modulos",      label: "Módulos del sistema",  icon: Grid3x3 },
  { id: "inventario",   label: "Inventario Animal",    icon: Beef },
  { id: "pesaje",       label: "Pesaje Bluetooth",     icon: Scale },
  { id: "lotes",        label: "Movimiento de Lotes",  icon: Tag },
  { id: "reproduccion", label: "Reproducción",         icon: Heart },
  { id: "produccion",   label: "Producción Leche",     icon: Droplets },
  { id: "pwa",          label: "Instalar PWA",         icon: Smartphone },
  { id: "offline",      label: "Modo Offline",         icon: WifiOff },
  { id: "gps",          label: "GPS Ganado",           icon: Navigation },
  { id: "drive",        label: "Sync & Backups",       icon: Cloud },
  { id: "usuarios",     label: "Usuarios y Roles",     icon: Users },
  { id: "descarga",     label: "Exportar datos",       icon: FileDown },
  { id: "sanidad",      label: "Sanidad Animal",       icon: Activity },
  { id: "trazabilidad", label: "Trazabilidad ICA",     icon: Tag },
  { id: "ventas",       label: "🇨🇴 Agente de Ventas", icon: DollarSign },
];

function SectionBanner({ emoji, title, subtitle, c1, c2, border }: {
  emoji: string; title: string; subtitle: string; c1: string; c2: string; border: string;
}) {
  return (
    <div className="rounded-2xl p-5 mb-5 relative overflow-hidden"
      style={{background:`linear-gradient(135deg,${c1},${c2})`, border:`1px solid ${border}`}}>
      <div className="absolute right-0 top-0 w-32 h-full opacity-10 pointer-events-none"
        style={{background:'radial-gradient(ellipse at right, white, transparent 70%)'}}/>
      <div className="relative flex items-center gap-4">
        <div className="text-4xl">{emoji}</div>
        <div>
          <h2 className="text-2xl font-black text-white" style={{fontFamily:'Sora,sans-serif'}}>{title}</h2>
          <p className="text-sm mt-1 text-white/70">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, color }: { icon: React.ReactNode; title: string; desc: string; color: string }) {
  return (
    <div className="rounded-xl p-4 space-y-2"
      style={{
        background: `linear-gradient(135deg, color-mix(in srgb, ${color} 8%, transparent), color-mix(in srgb, ${color} 4%, transparent))`,
        border: `1px solid ${color}40`,
        boxShadow: `0 0 18px ${color}08`,
      }}>
      <div className="flex items-center gap-2 mb-1" style={{color}}>
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
      <div className="w-7 h-7 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 text-black flex-shrink-0"
        style={{background:color, boxShadow: `0 0 10px ${color}80`}}>{n}</div>
      <p className="text-sm text-foreground/70 pt-0.5">{text}</p>
    </div>
  );
}

function CredTable() {
  return (
    <div className="rounded-xl overflow-hidden" style={{border:'1px solid rgba(255,255,255,0.08)'}}>
      <div className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider" style={{background:'rgba(0,245,212,0.08)',color:'#00f5d4'}}>
        Credenciales de acceso demo
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
            {['Perfil','Email','Contraseña','Acceso'].map(h=>(
              <th key={h} className="text-left py-2.5 px-4 text-white/30 font-semibold uppercase text-[10px] tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            {p:'👑 Admin',      e:'admin@ganader.ia',  pw:'admin',     a:'Total — todos los módulos'},
            {p:'🩺 Veterinario', e:'vet@ganader.ia',    pw:'vet2026',   a:'Clínico + GPS + Reproducción'},
            {p:'🐄 Campo',       e:'luis@ganader.ia',   pw:'campo2026', a:'Inventario + Pesaje BT'},
            {p:'💼 Visor',       e:'visor@ganader.ia',  pw:'visor',     a:'Solo lectura'},
          ].map(r=>(
            <tr key={r.p} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
              <td className="py-2.5 px-4 font-bold text-white">{r.p}</td>
              <td className="py-2.5 px-4 font-mono" style={{color:'#00c8ff'}}>{r.e}</td>
              <td className="py-2.5 px-4 font-mono font-bold" style={{color:'#fbbf24'}}>{r.pw}</td>
              <td className="py-2.5 px-4 text-white/40">{r.a}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Documentacion() {
  const [activeSection, setActiveSection] = useState("inicio");
  const { animals, pesajes, gpsUbicaciones } = useAppState();
  const { toast } = useToast();
  const [driveFiles, setDriveFiles] = useState(getDriveFiles);
  const [exportLoading, setExportLoading] = useState(false);

  const handleExportDrive = async (label: string, data: object) => {
    setExportLoading(true);
    try {
      const file = await exportToDrive(data, `GanaderIA_${label}_${new Date().toISOString().slice(0,10)}.json`);
      setDriveFiles(prev => [file, ...prev]);
      toast({ title: "✓ Guardado en Drive", description: `${file.name} subido correctamente` });
    } catch {
      toast({ title: "Error", description: "No se pudo subir", variant: "destructive" });
    } finally { setExportLoading(false); }
  };

  const handleDownload = async (label: string, data: object) => {
    await downloadLocalBackup(data, `GanaderIA_${label}_${new Date().toISOString().slice(0,10)}.json`);
    toast({ title: "✓ Descarga iniciada", description: `${label}.json descargado` });
  };

  const handleCSV = async (label: string, rows: object[]) => {
    await downloadCSV(rows, `GanaderIA_${label}_${new Date().toISOString().slice(0,10)}.csv`);
    toast({ title: "✓ CSV exportado", description: `${label}.csv descargado` });
  };

  const sections: Record<string, React.ReactNode> = {
    inicio: (
      <div className="space-y-6">
        <SectionBanner emoji="🚀" title="GanaderIA CIVAC PRO" c1="rgba(0,30,20,0.9)" c2="rgba(0,50,30,0.9)"
          border="rgba(0,245,212,0.35)" subtitle="Sistema integral de gestión ganadera · Colombia · v1.0 · 22 módulos · IndexedDB offline"/>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { emoji:'🐄', title:'Inventario Completo',    desc:'30+ animales con fichas individuales, categorías, etiquetas, estadísticas y pesaje integrado.', c:'#00f5d4' },
            { emoji:'⚖️', title:'Pesaje Bluetooth',        desc:'Báscula Tru-Test / Gallagher vía BT. Auto-cálculo por raza, recibos PDF por animal.', c:'#ff9500' },
            { emoji:'📡', title:'GPS Ganado en vivo',      desc:'Rastreo, geocercas, alertas de escape y batería de collares GPS.', c:'#00c8ff' },
            { emoji:'🤖', title:'Predicciones IA',         desc:'Alertas inteligentes, riesgo sanitario, partos estimados y peso futuro.', c:'#a78bfa' },
            { emoji:'📱', title:'PWA Offline 100%',        desc:'Instale en cualquier dispositivo. Funciona sin internet. Se sincroniza al reconectar.', c:'#4ade80' },
            { emoji:'🐂', title:'Movimiento de Lotes',     desc:'Ingreso, venta y compra de lotes con recibos automáticos y cálculo de valores.', c:'#00c8ff' },
            { emoji:'🥛', title:'Producción Lechera',      desc:'Ordeños diarios, ranking de vacas, tendencias mensuales e ingresos.', c:'#60a5fa' },
            { emoji:'🔁', title:'Reproducción',            desc:'Celos, inseminaciones, partos esperados, ecografías y manejo reproductivo.', c:'#f472b6' },
            { emoji:'☁',  title:'Backup Google Drive',    desc:'Exporta JSON/CSV a Drive. Respaldo automático. Descarga local también disponible.', c:'#fbbf24' },
          ].map(c => (
            <div key={c.title} className="rounded-xl p-4 transition-all hover:scale-[1.02]"
              style={{
                background:`linear-gradient(135deg,color-mix(in srgb,${c.c} 10%,transparent),color-mix(in srgb,${c.c} 5%,transparent))`,
                border:`1px solid ${c.c}45`,
                boxShadow:`0 0 20px ${c.c}10`,
              }}>
              <div className="text-2xl mb-2">{c.emoji}</div>
              <div className="font-bold text-sm text-foreground mb-1" style={{color:c.c}}>{c.title}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>

        <CredTable/>

        <div className="rounded-xl p-4" style={{background:'rgba(0,245,212,0.05)',border:'1px solid rgba(0,245,212,0.2)'}}>
          <div className="font-bold text-sm mb-3 flex items-center gap-2" style={{color:'#00f5d4'}}>
            <Database size={14}/> Base de datos actual
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              {label:'Animales',   val:animals.length,        c:'#00f5d4', emoji:'🐄'},
              {label:'Pesajes',    val:pesajes.length,        c:'#ff9500', emoji:'⚖️'},
              {label:'GPS activos',val:gpsUbicaciones.filter(g=>g.activo).length, c:'#00c8ff', emoji:'📡'},
            ].map(s => (
              <div key={s.label} className="rounded-lg p-3"
                style={{background:`color-mix(in srgb,${s.c} 8%,transparent)`, border:`1px solid ${s.c}35`}}>
                <div className="text-xl mb-1">{s.emoji}</div>
                <div className="font-black text-xl" style={{color:s.c}}>{s.val}</div>
                <div className="text-[10px] text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),

    modulos: (
      <div className="space-y-6">
        <SectionBanner emoji="🗂" title="Módulos del Sistema" subtitle="CIVAC PRO incluye 20+ módulos integrados. Todos sincronizados offline."
          c1="rgba(5,5,20,0.9)" c2="rgba(10,10,35,0.9)" border="rgba(167,139,250,0.35)"/>

        <div className="space-y-3">
          {[
            { emoji:'📊', label:'Dashboard PRO',      ruta:'/',              desc:'KPIs en tiempo real, alertas, producción, GPS live, pesajes recientes, valor del hato.', c:'#00f5d4' },
            { emoji:'🔔', label:'Alertas',            ruta:'/alertas',       desc:'Alertas sanitarias, de inventario, reproductivas y de GPS. Clasificadas por urgencia.', c:'#f87171' },
            { emoji:'🐄', label:'Inventario Animal',  ruta:'/inventario',    desc:'5 tabs: Tabla, Fichas, Etiquetas, Pesaje Rápido, Estadísticas. 30+ animales con todos los campos.', c:'#39ff7e' },
            { emoji:'📋', label:'Ficha Individual',   ruta:'/ficha',         desc:'Ficha completa por animal con historial médico, reproductivo y de pesajes.', c:'#00f5d4' },
            { emoji:'🔁', label:'Reproducción',       ruta:'/reproduccion',  desc:'Partos esperados, días restantes, celos, inseminaciones, ecografías y servicios.', c:'#f472b6' },
            { emoji:'🥛', label:'Producción Leche',   ruta:'/produccion',    desc:'Registro de ordeños, litros/día por vaca, tendencias mensuales, ingresos.', c:'#60a5fa' },
            { emoji:'🧬', label:'Genética y Pedigrí', ruta:'/genetica',      desc:'Árbol genealógico, MEP, índice genético, toros disponibles, cruzamiento.', c:'#a78bfa' },
            { emoji:'🌿', label:'Potreros',           ruta:'/potreros',      desc:'Mapa de potreros, estado (ocupado/descanso/rotar), días de ocupación, rotación.', c:'#84ef34' },
            { emoji:'🌾', label:'Alimentación',       ruta:'/alimentacion',  desc:'Raciones por categoría, consumo diario, costo de alimentación, análisis.', c:'#ffd166' },
            { emoji:'⚖️', label:'Pesaje Bluetooth',   ruta:'/pesaje',        desc:'Módulo dedicado: conexión BT, historial completo, facturas por pesaje, análisis GMD.', c:'#ff9500' },
            { emoji:'💊', label:'Insumos',            ruta:'/insumos',       desc:'Stock de medicamentos, alertas de mínimos, consumo y registro de aplicaciones.', c:'#fbbf24' },
            { emoji:'🧪', label:'Semen y Embriones',  ruta:'/semen',         desc:'Inventario de pajillas, toros, dosis disponibles y registro de uso.', c:'#818cf8' },
            { emoji:'💰', label:'Costos y P&G',       ruta:'/costos',        desc:'Ingresos vs egresos, utilidad neta, costo por litro, análisis mensual.', c:'#34d399' },
            { emoji:'👥', label:'Personal',           ruta:'/personal',      desc:'Empleados, contratos, horas extra, EPS, ARL, pagos y novedades.', c:'#94a3b8' },
            { emoji:'🤖', label:'Predicciones IA',    ruta:'/prediccion',    desc:'Predicción de peso a 30/60/90 días, riesgo de mastitis, detección de celo, partos.', c:'#e879f9' },
            { emoji:'🌱', label:'Huella de Carbono',  ruta:'/co2',           desc:'Emisiones por animal, compensación, biogás, indicadores de sostenibilidad.', c:'#4ade80' },
            { emoji:'🗺️', label:'Multi-Finca',        ruta:'/multifinca',    desc:'Gestión de múltiples fincas en un solo panel. Comparativa entre unidades.', c:'#22d3ee' },
            { emoji:'📡', label:'Rastreo GPS',        ruta:'/gps',           desc:'Mapa en tiempo real, 12 collares, geocercas, historial de movimiento, alertas de batería.', c:'#00c8ff' },
            { emoji:'🐂', label:'Movimiento Lotes',   ruta:'/lotes',         desc:'Ingreso, venta y compra de lotes con recibos, cálculo automático de valores.', c:'#00c8ff' },
            { emoji:'👤', label:'Usuarios',           ruta:'/usuarios',      desc:'Gestión de usuarios, roles, permisos, actividad y control de acceso.', c:'#c084fc' },
            { emoji:'⚙️', label:'Configuración',      ruta:'/configuracion', desc:'Datos de la finca, alertas automáticas, idioma, unidades, temas y preferencias.', c:'#9ca3af' },
            { emoji:'📚', label:'Documentación',      ruta:'/documentacion', desc:'Guía completa de uso, tutoriales, credenciales demo, exportación de datos.', c:'#38bdf8' },
            { emoji:'👑', label:'Planes · Wompi',     ruta:'/planes',        desc:'Suscripción PRO, Premium y Platino vía Wompi. Pagos seguros en COP.', c:'#fbbf24' },
          ].map(m => (
            <div key={m.ruta} className="rounded-xl px-4 py-3 flex items-center gap-4 transition-all hover:scale-[1.008]"
              style={{
                background:`linear-gradient(135deg,color-mix(in srgb,${m.c} 6%,transparent),color-mix(in srgb,${m.c} 3%,transparent))`,
                border:`1px solid ${m.c}35`,
              }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                style={{background:`${m.c}18`, border:`1px solid ${m.c}40`, boxShadow:`0 0 10px ${m.c}15`}}>
                {m.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-foreground" style={{color:m.c}}>{m.label}</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-black/20 dark:bg-black/40"
                    style={{color:m.c}}>{m.ruta}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{m.desc}</p>
              </div>
              <ChevronRight size={14} style={{color:`${m.c}60`, flexShrink:0}}/>
            </div>
          ))}
        </div>
      </div>
    ),

    inventario: (
      <div className="space-y-6">
        <SectionBanner emoji="🐄" title="Inventario Animal" subtitle="Registro RFID · Fichas · Etiquetas · Pesaje Rápido · Estadísticas"
          c1="rgba(0,20,10,0.9)" c2="rgba(0,35,15,0.9)" border="rgba(57,255,126,0.35)"/>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FeatureCard icon={<Grid3x3 size={14}/>} color="#39ff7e" title="Tab: Tabla"
            desc="Tabla completa con todos los campos: Arete, Nombre, Raza, Categoría, Fecha nacimiento/Edad auto-calculada, Peso, Valor total, Litros/día, Lote, Estado, Registro. Filtros por categoría + estado + lote + búsqueda."/>
          <FeatureCard icon={<Beef size={14}/>} color="#a78bfa" title="Tab: Fichas"
            desc="Tarjetas visuales con degradado por categoría, barra de condición corporal vs. raza, todos los datos del animal, botones de editar/eliminar/ver ficha, y valor económico."/>
          <FeatureCard icon={<Tag size={14}/>} color="#39ff7e" title="Tab: Etiquetas"
            desc="Etiquetas imprimibles por animal con: Arete, Nombre, Raza, Categoría, Peso, Edad, Estado, Registro N°, código QR (RFID), valor estimado. Botón 'Imprimir Todas'."/>
          <FeatureCard icon={<Scale size={14}/>} color="#ff9500" title="Tab: Pesaje Rápido"
            desc="Por cada animal: botón 'Raza' → auto-completa peso estándar de la raza/categoría, botón 'BT' → simula báscula Bluetooth, campo valor/kg, calcular valor total, Registrar y Imprimir PDF."/>
          <FeatureCard icon={<BarChart3 size={14}/>} color="#f472b6" title="Tab: Estadísticas"
            desc="Gráficas: Animales por Raza (barras), Estado Sanitario (dona multicolor), Distribución por Categoría (barras horizontales), Valor por Lote (con total COP + leche/día)."/>
          <FeatureCard icon={<Zap size={14}/>} color="#ff9500" title="Auto-cálculos"
            desc="Al seleccionar raza + categoría: edad calculada desde fecha nacimiento, peso sugerido por raza, valor total = peso × $/kg. Todo en tiempo real, un solo clic."/>
        </div>

        <div className="rounded-xl p-4" style={{background:'rgba(57,255,126,0.05)',border:'1px solid rgba(57,255,126,0.15)'}}>
          <div className="font-bold text-sm mb-3" style={{color:'#39ff7e'}}>Campos por animal</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['Arete RFID','Nombre','Raza','Categoría','Estado','Lote','Peso (kg)','F. Nacimiento','Edad auto','Registro N°','Litros/día','N° Partos','$/kg','Valor total'].map(f => (
              <div key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CheckCircle size={10} style={{color:'#39ff7e', flexShrink:0}}/>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),

    pesaje: (
      <div className="space-y-6">
        <SectionBanner emoji="⚖️" title="Pesaje Bluetooth" subtitle="Básculas Tru-Test · Gallagher · Auto-cálculo por raza · Recibos PDF"
          c1="rgba(15,8,0,0.9)" c2="rgba(30,15,0,0.9)" border="rgba(255,149,0,0.35)"/>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FeatureCard icon={<Bluetooth size={14}/>} color="#00c8ff" title="Conexión Bluetooth"
            desc="Compatible con básculas Tru-Test XR3000, Gallagher W210 y similares. Activa el BT en tu celular, enciende la báscula y toca 'Conectar BT'. El peso llega en tiempo real."/>
          <FeatureCard icon={<Zap size={14}/>} color="#ff9500" title="Auto-cálculo por raza"
            desc="6 razas × 5 categorías = 30 combinaciones. Al hacer clic en '⚡ Raza', el sistema calcula el peso estándar para esa raza y categoría. Ajusta si es necesario."/>
          <FeatureCard icon={<Scale size={14}/>} color="#ff9500" title="Pesaje Rápido (en Inventario)"
            desc="Desde el módulo Inventario → tab ⚖️ Pesaje Rápido: tabla de todos los animales con botones 'Raza', 'BT' y 'Registrar' por fila. Actualiza el peso y guarda el historial."/>
          <FeatureCard icon={<Printer size={14}/>} color="#a78bfa" title="Recibo PDF imprimible"
            desc="Cada pesaje genera un recibo con: animal, arete, raza, peso nuevo/anterior, variación, peso estándar de raza (%), valor estimado, operador, fecha y hora."/>
          <FeatureCard icon={<Activity size={14}/>} color="#4ade80" title="GMD — Ganancia Media Diaria"
            desc="El módulo /pesaje calcula automáticamente la GMD (kg/día ganados desde el pesaje anterior). Ideal para seguimiento de terneros y novillas."/>
          <FeatureCard icon={<BarChart3 size={14}/>} color="#f472b6" title="Historial y análisis"
            desc="Historial completo de pesajes con fecha, hora, método (BT/manual), dispositivo, operador, y observaciones. Filtrable por animal, lote o fecha."/>
        </div>

        <div className="rounded-xl overflow-hidden" style={{border:'1px solid rgba(255,149,0,0.2)'}}>
          <div className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider" style={{background:'rgba(255,149,0,0.08)',color:'#ff9500'}}>
            Tabla de pesos estándar por raza (kg)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{borderBottom:'1px solid rgba(255,149,0,0.1)'}}>
                  {['Raza','Vaca adulta','Novilla','Ternero','Ternera','Toro'].map(h => (
                    <th key={h} className="text-left py-2.5 px-4 font-bold" style={{color:'rgba(255,149,0,0.6)'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {r:'Holstein',  va:560, no:330, te:80, ta:75, to:820},
                  {r:'Simmental', va:600, no:360, te:90, ta:85, to:870},
                  {r:'Brahman',   va:490, no:300, te:65, ta:60, to:780},
                  {r:'Gyr X',     va:470, no:290, te:62, ta:58, to:730},
                  {r:'Gyr',       va:460, no:285, te:60, ta:56, to:720},
                  {r:'Jersey',    va:400, no:245, te:52, ta:49, to:600},
                ].map(r => (
                  <tr key={r.r} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                    <td className="py-2.5 px-4 font-bold text-white">{r.r}</td>
                    {[r.va,r.no,r.te,r.ta,r.to].map((v,i) => (
                      <td key={i} className="py-2.5 px-4 font-mono" style={{color:'#ff9500'}}>{v} kg</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl p-4 space-y-3" style={{background:'rgba(255,149,0,0.05)',border:'1px solid rgba(255,149,0,0.15)'}}>
          <div className="font-bold text-sm" style={{color:'#ff9500'}}>Pasos para pesaje con báscula BT</div>
          {[
            'Active el Bluetooth en su celular o tablet',
            'Encienda la báscula Tru-Test XR3000 o Gallagher W210',
            'Vaya a módulo Pesaje (/pesaje) o Inventario → tab Pesaje Rápido',
            'Haga clic en "Conectar BT" — el peso aparece en tiempo real',
            'Seleccione el animal o confírmelo desde la lista',
            'Haga clic en "Guardar Pesaje" para registrar en el historial',
            'Opcional: Imprimir recibo PDF con botón 🖨',
          ].map((s,i) => <Step key={i} n={i+1} text={s} color="#ff9500"/>)}
        </div>
      </div>
    ),

    lotes: (
      <div className="space-y-6">
        <SectionBanner emoji="🐂" title="Movimiento de Lotes" subtitle="Ingreso · Venta · Compra · Recibos automáticos · Cálculo de valores"
          c1="rgba(0,8,20,0.9)" c2="rgba(0,15,30,0.9)" border="rgba(0,200,255,0.35)"/>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FeatureCard icon={<Package size={14}/>} color="#39ff7e" title="Ingresar Lote"
            desc="Registra la entrada de animales: nombre del lote, cantidad, peso total, costo por kilo, valor total calculado automáticamente, fecha, proveedor y notas."/>
          <FeatureCard icon={<DollarSign size={14}/>} color="#f87171" title="Vender Lote"
            desc="Registra la venta de animales: lote, cantidad, precio por kilo, total a recibir, fecha, destino (nombre del comprador) y notas de la operación."/>
          <FeatureCard icon={<Beef size={14}/>} color="#00c8ff" title="Comprar Lote"
            desc="Registra compra de nuevos animales: cantidad, peso promedio, precio por kilo, valor total pagado, proveedor y fecha de ingreso a la finca."/>
        </div>

        <div className="rounded-xl p-4 space-y-3" style={{background:'rgba(0,200,255,0.05)',border:'1px solid rgba(0,200,255,0.15)'}}>
          <div className="font-bold text-sm" style={{color:'#00c8ff'}}>Auto-cálculos en movimiento de lote</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-white/60">
            <div className="flex items-start gap-2"><CheckCircle size={13} className="text-teal-400 flex-shrink-0 mt-0.5"/><span>Valor total = cantidad × peso promedio × $ por kilo</span></div>
            <div className="flex items-start gap-2"><CheckCircle size={13} className="text-teal-400 flex-shrink-0 mt-0.5"/><span>Peso promedio por animal = peso total ÷ cantidad</span></div>
            <div className="flex items-start gap-2"><CheckCircle size={13} className="text-teal-400 flex-shrink-0 mt-0.5"/><span>Recibo generado automáticamente al confirmar</span></div>
            <div className="flex items-start gap-2"><CheckCircle size={13} className="text-teal-400 flex-shrink-0 mt-0.5"/><span>Historial de movimientos con fecha y tipo</span></div>
          </div>
        </div>
      </div>
    ),

    reproduccion: (
      <div className="space-y-6">
        <SectionBanner emoji="🔁" title="Reproducción" subtitle="Partos · Inseminaciones · Celos · Ecografías · Manejo reproductivo"
          c1="rgba(20,0,20,0.9)" c2="rgba(35,0,35,0.9)" border="rgba(244,114,182,0.35)"/>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FeatureCard icon={<Heart size={14}/>} color="#f472b6" title="Control de partos"
            desc="Lista de vacas gestantes con días restantes al parto, servicio utilizado (IA o monta natural), número de partos previos y estado (Normal / Vigilar / Primípara)."/>
          <FeatureCard icon={<Baby size={14}/>} color="#c084fc" title="Inseminación Artificial"
            desc="Registro de servicios con toro / pajilla, fecha, técnico inseminador y resultado (confirmado / pendiente / fallido)."/>
          <FeatureCard icon={<Activity size={14}/>} color="#f472b6" title="Detección de celos"
            desc="Alertas automáticas por IA cuando se detecta patrón de celo basado en producción de leche y comportamiento GPS."/>
          <FeatureCard icon={<Shield size={14}/>} color="#a78bfa" title="Ecografías"
            desc="Registro de ecografías con fecha, resultado y diagnóstico de preñez. Seguimiento de cada gestación."/>
        </div>
      </div>
    ),

    produccion: (
      <div className="space-y-6">
        <SectionBanner emoji="🥛" title="Producción Lechera" subtitle="Ordeños · Ranking de vacas · Tendencias · Ingresos diarios"
          c1="rgba(0,8,20,0.9)" c2="rgba(0,15,35,0.9)" border="rgba(96,165,250,0.35)"/>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FeatureCard icon={<Droplets size={14}/>} color="#60a5fa" title="Registro de ordeños"
            desc="Registro diario de litros, precio por litro e ingreso. Historial completo con notas por ordeño (vacuna, lluvia, eventos especiales)."/>
          <FeatureCard icon={<BarChart3 size={14}/>} color="#4ade80" title="Tendencias mensuales"
            desc="Gráfica de barras con producción mensual en litros. Comparativa entre meses, identificación de picos y valles."/>
          <FeatureCard icon={<Award size={14}/>} color="#fbbf24" title="Ranking de vacas"
            desc="Top vacas productoras con litros/día y clasificación por posición. Identifica las mejores productoras del hato."/>
          <FeatureCard icon={<DollarSign size={14}/>} color="#39ff7e" title="Ingresos diarios"
            desc="Cálculo automático: litros × precio = ingreso. Acumulado mensual y anual visible en el dashboard."/>
        </div>
      </div>
    ),

    pwa: (
      <div className="space-y-6">
        <SectionBanner emoji="📱" title="Instalar como App (PWA)" subtitle="Sin tienda de apps · Funciona offline · Actualización automática"
          c1="rgba(0,8,20,0.9)" c2="rgba(0,15,35,0.9)" border="rgba(56,189,248,0.35)"/>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { platform:'Android', icon:'🤖', color:'#4ade80',
              steps:['Abra Chrome en su celular','Banner automático aparece','Toque "Instalar"','Icono aparece en pantalla de inicio'] },
            { platform:'iPhone / iPad', icon:'🍎', color:'#94a3b8',
              steps:['Abra Safari (no Chrome)','Toque ícono compartir ↑','«Agregar a pantalla de inicio»','Confirme el nombre y listo'] },
            { platform:'Windows', icon:'🪟', color:'#60a5fa',
              steps:['Abra Chrome o Edge','Menú ⋮ → «Instalar CIVAC»','Confirmar instalación','Acceso desde escritorio'] },
            { platform:'Mac / Linux', icon:'💻', color:'#a78bfa',
              steps:['Chrome o Edge','Ícono instalar (✚) en barra URL','Instalar y confirmar','Acceso desde Launchpad / Apps'] },
          ].map(p => (
            <div key={p.platform} className="rounded-xl overflow-hidden" style={{border:`1px solid ${p.color}25`}}>
              <div className="p-3 flex items-center gap-2" style={{background:`${p.color}15`}}>
                <span className="text-2xl">{p.icon}</span>
                <span className="font-bold text-sm text-white">{p.platform}</span>
              </div>
              <div className="p-3 space-y-2">
                {p.steps.map((s,i) => <Step key={i} n={i+1} text={s} color={p.color}/>)}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { emoji:'⚡', title:'Sin espacio en memoria', desc:'La PWA no ocupa espacio como las apps normales. Vive en el navegador.' },
            { emoji:'🔄', title:'Actualización automática', desc:'Cada vez que hay una mejora, la app se actualiza sola al abrir con internet.' },
            { emoji:'🔒', title:'Segura y privada', desc:'HTTPS siempre activo. Datos locales en su dispositivo. Sin acceso de terceros.' },
          ].map(f => (
            <div key={f.title} className="rounded-xl p-4 text-center" style={{background:'rgba(56,189,248,0.05)',border:'1px solid rgba(56,189,248,0.15)'}}>
              <div className="text-3xl mb-2">{f.emoji}</div>
              <div className="font-bold text-sm text-white mb-1">{f.title}</div>
              <p className="text-xs text-white/45">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),

    offline: (
      <div className="space-y-6">
        <SectionBanner emoji="📵" title="Modo Offline Completo" subtitle="100% funcional sin internet · Sincroniza al reconectar · IndexedDB + localStorage"
          c1="rgba(20,0,0,0.9)" c2="rgba(30,5,5,0.9)" border="rgba(248,113,113,0.35)"/>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FeatureCard icon={<WifiOff size={14}/>} color="#f87171" title="¿Cómo funciona offline?"
            desc="CIVAC guarda todos los datos en localStorage del navegador. Al abrir la app sin internet, carga los datos locales. Todo funciona: inventario, pesaje, alertas, GPS (si hay collar BT activo)."/>
          <FeatureCard icon={<RefreshCw size={14}/>} color="#4ade80" title="Sincronización al reconectar"
            desc="Al volver a tener internet, la app detecta la conexión y sincroniza automáticamente todos los cambios realizados offline hacia el servidor PostgreSQL."/>
          <FeatureCard icon={<Database size={14}/>} color="#00c8ff" title="Base de datos interna"
            desc="Backend Express + PostgreSQL + Drizzle ORM. Todos los datos persisten en BD real. Si hay servidor local en red local (LAN), funciona también sin internet global."/>
          <FeatureCard icon={<Shield size={14}/>} color="#a78bfa" title="Sin pérdida de datos"
            desc="Todos los cambios se guardan primero en localStorage (instantáneo) y luego se sincronizan con el servidor (fire-and-forget). Si falla la red, los datos locales están seguros."/>
        </div>

        <div className="rounded-xl p-4" style={{background:'rgba(248,113,113,0.05)',border:'1px solid rgba(248,113,113,0.15)'}}>
          <div className="font-bold text-sm mb-3" style={{color:'#f87171'}}>Módulos disponibles 100% offline</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['Inventario Animal','Pesaje (manual)','Alertas','Reproducción','Producción Leche','Insumos','Personal','Costos','Potreros','Alimentación','Genética','Semen','Dashboard (cached)','GPS (si BT activo)'].map(m => (
              <div key={m} className="flex items-center gap-1.5 text-xs text-white/60">
                <CheckCircle size={10} style={{color:'#4ade80',flexShrink:0}}/>
                {m}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),

    gps: (
      <div className="space-y-6">
        <SectionBanner emoji="📡" title="Rastreo GPS Ganado" subtitle="12 collares en tiempo real · Geocercas · Alertas · Batería · Mapa"
          c1="rgba(0,8,20,0.9)" c2="rgba(0,15,30,0.9)" border="rgba(0,200,255,0.35)"/>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FeatureCard icon={<Navigation size={14}/>} color="#00c8ff" title="Mapa en tiempo real"
            desc="Mapa interactivo con Leaflet y OpenStreetMap. Cada animal aparece como punto de color con su nombre. Actualización cada 2 minutos."/>
          <FeatureCard icon={<MapPin size={14}/>} color="#f87171" title="Geocercas"
            desc="Defina zonas virtuales (potreros). Si un animal sale de su geocerca, se genera una alerta inmediata con el nombre del animal y la zona de escape."/>
          <FeatureCard icon={<Bell size={14}/>} color="#fbbf24" title="Alertas automáticas"
            desc="Alertas de: batería baja (< 20%), animal fuera de zona, sin señal por más de 30 min, y collar desactivado."/>
          <FeatureCard icon={<Activity size={14}/>} color="#4ade80" title="Historial de movimiento"
            desc="Rastree dónde estuvo cada animal en las últimas 24h/7 días. Identifica patrones de comportamiento y movimientos inusuales."/>
        </div>

        <div className="rounded-xl p-4" style={{background:'rgba(0,200,255,0.05)',border:'1px solid rgba(0,200,255,0.15)'}}>
          <div className="font-bold text-sm mb-3" style={{color:'#00c8ff'}}>Collares GPS compatibles</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-white/60">
            {['Nedap Smarttag · Collar','HerdDogg · BT + GPS','Moocall · Sensor de parto','Afimilk · Podómetro + GPS','SmaXtec · Bolus ruminal','Collar LTE / NB-IoT genérico'].map(c => (
              <div key={c} className="flex items-center gap-1.5">
                <span className="text-green-400">●</span>{c}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),

    drive: (
      <div className="space-y-6">
        <SectionBanner emoji="☁" title="Sync & Backups" subtitle="Google Drive · Descarga local · JSON · CSV · Respaldo automático"
          c1="rgba(5,10,0,0.9)" c2="rgba(10,20,0,0.9)" border="rgba(251,191,36,0.35)"/>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <FeatureCard icon={<Cloud size={14}/>} color="#fbbf24" title="Google Drive"
            desc="Exporte cualquier módulo de datos directamente a su Google Drive. El archivo JSON queda guardado en la nube con fecha y hora."/>
          <FeatureCard icon={<Download size={14}/>} color="#4ade80" title="Descarga local"
            desc="Descargue un backup JSON completo de todos sus datos directamente al dispositivo. Sin internet necesario."/>
          <FeatureCard icon={<FileDown size={14}/>} color="#60a5fa" title="Exportar CSV"
            desc="Exporte el inventario de animales en formato CSV compatible con Excel y Google Sheets para análisis externo."/>
        </div>

        <div className="rounded-xl p-4" style={{background:'rgba(251,191,36,0.05)',border:'1px solid rgba(251,191,36,0.15)'}}>
          <div className="font-bold text-sm mb-4" style={{color:'#fbbf24'}}>Exportar datos ahora</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button disabled={exportLoading} onClick={() => handleExportDrive('Animales', animals)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
              style={{background:'rgba(251,191,36,0.12)',border:'1px solid rgba(251,191,36,0.3)',color:'#fbbf24'}}>
              <Cloud size={14}/> Drive — Animales
            </button>
            <button onClick={() => handleDownload('TodosLosDatos', { animals, pesajes, gpsUbicaciones })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
              style={{background:'rgba(74,222,128,0.12)',border:'1px solid rgba(74,222,128,0.3)',color:'#4ade80'}}>
              <Download size={14}/> Backup completo .json
            </button>
            <button onClick={() => handleCSV('Inventario', animals)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
              style={{background:'rgba(96,165,250,0.12)',border:'1px solid rgba(96,165,250,0.3)',color:'#60a5fa'}}>
              <FileDown size={14}/> Inventario .csv
            </button>
          </div>
        </div>

        {driveFiles.length > 0 && (
          <div className="rounded-xl overflow-hidden" style={{border:'1px solid rgba(251,191,36,0.15)'}}>
            <div className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider" style={{background:'rgba(251,191,36,0.07)',color:'rgba(251,191,36,0.7)'}}>
              Archivos en Drive ({driveFiles.length})
            </div>
            <div className="divide-y" style={{borderColor:'rgba(255,255,255,0.04)'}}>
              {driveFiles.map((f, i) => (
                <div key={i} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud size={12} style={{color:'#fbbf24'}}/>
                    <span className="text-sm font-mono text-white/70">{f.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/30">
                    <span>{f.size}</span>
                    <span>{f.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    ),

    usuarios: (
      <div className="space-y-6">
        <SectionBanner emoji="👤" title="Usuarios y Roles" subtitle="Control de acceso por rol · Admin · Veterinario · Campo · Visor"
          c1="rgba(10,0,20,0.9)" c2="rgba(18,0,35,0.9)" border="rgba(192,132,252,0.35)"/>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { rol:'👑 Administrador',  color:'#00f5d4', acceso:'Acceso total a todos los módulos. Puede crear/editar/eliminar usuarios, configurar la finca y ver reportes financieros.', permisos:['Todos los módulos','Gestión de usuarios','Configuración','Reportes financieros','Exportar datos','Planes y facturación'] },
            { rol:'🩺 Veterinario',    color:'#00c8ff', acceso:'Acceso a módulos clínicos. Puede ver y editar reproducción, tratamientos, alertas sanitarias y GPS de animales.', permisos:['Inventario (lectura/escritura)','Reproducción','Alertas sanitarias','GPS ganado','Insumos y medicamentos','Predicciones IA'] },
            { rol:'🐄 Operario de Campo', color:'#39ff7e', acceso:'Acceso a operación diaria. Puede registrar pesajes, alimentación, producción y reportar novedades.', permisos:['Inventario (escritura)','Pesaje Bluetooth','Producción leche','Alimentación','Potreros','Alertas (ver)'] },
            { rol:'💼 Visor',          color:'#c084fc', acceso:'Solo lectura. Ideal para propietarios que quieren ver el estado de la finca sin poder hacer cambios.', permisos:['Dashboard (lectura)','Inventario (lectura)','GPS (lectura)','Reportes (lectura)','Sin edición','Sin exportación'] },
          ].map(r => (
            <div key={r.rol} className="rounded-xl overflow-hidden" style={{border:`1px solid ${r.color}25`}}>
              <div className="px-4 py-3 flex items-center gap-2" style={{background:`${r.color}10`}}>
                <div className="font-bold text-base text-white">{r.rol}</div>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">{r.acceso}</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {r.permisos.map(p => (
                    <div key={p} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <CheckCircle size={9} style={{color:r.color,flexShrink:0}}/>
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <CredTable/>
      </div>
    ),

    descarga: (
      <div className="space-y-6">
        <SectionBanner emoji="💾" title="Descargar y Exportar" subtitle="JSON · CSV · PDF · Google Drive · Backup completo"
          c1="rgba(0,10,15,0.9)" c2="rgba(0,18,25,0.9)" border="rgba(56,189,248,0.35)"/>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FeatureCard icon={<FileDown size={14}/>} color="#60a5fa" title="Exportar a CSV"
            desc="Compatible con Excel y Google Sheets. Incluye todos los campos del inventario: Arete, Nombre, Raza, Categoría, Peso, Lote, Estado, Registro, Valor, etc."/>
          <FeatureCard icon={<Download size={14}/>} color="#4ade80" title="Backup JSON completo"
            desc="Descarga local de todos los datos: animales, pesajes, reproducción, GPS, insumos, personal. Ideal para respaldo antes de migrar."/>
          <FeatureCard icon={<Printer size={14}/>} color="#a78bfa" title="PDF / Imprimir"
            desc="Fichas de animales, etiquetas con QR, recibos de pesaje y movimientos de lotes son imprimibles desde el navegador (Ctrl+P o botón 🖨)."/>
          <FeatureCard icon={<Cloud size={14}/>} color="#fbbf24" title="Google Drive Sync"
            desc="Envíe cualquier módulo directamente a su Google Drive. Los archivos quedan organizados con nombre y fecha para fácil búsqueda."/>
        </div>

        <div className="rounded-xl p-4 space-y-3" style={{background:'rgba(56,189,248,0.05)',border:'1px solid rgba(56,189,248,0.15)'}}>
          <div className="font-bold text-sm" style={{color:'#38bdf8'}}>Exportar ahora</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button onClick={() => handleCSV('Animales', animals)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-all"
              style={{background:'rgba(96,165,250,0.1)',border:'1px solid rgba(96,165,250,0.3)',color:'#60a5fa'}}>
              <FileDown size={14}/> Inventario completo .csv
            </button>
            <button onClick={() => handleDownload('TodosLosDatos', { animals, pesajes, gpsUbicaciones })}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-all"
              style={{background:'rgba(74,222,128,0.1)',border:'1px solid rgba(74,222,128,0.3)',color:'#4ade80'}}>
              <Download size={14}/> Backup completo .json
            </button>
            <button disabled={exportLoading} onClick={() => handleExportDrive('Animales', animals)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50"
              style={{background:'rgba(251,191,36,0.1)',border:'1px solid rgba(251,191,36,0.3)',color:'#fbbf24'}}>
              <Cloud size={14}/> Subir animales a Drive
            </button>
            <button onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-all"
              style={{background:'rgba(167,139,250,0.1)',border:'1px solid rgba(167,139,250,0.3)',color:'#a78bfa'}}>
              <Printer size={14}/> Imprimir esta página
            </button>
          </div>
        </div>
      </div>
    ),
    sanidad: (
      <div className="space-y-6">
        <SectionBanner emoji="🩺" title="Sanidad Animal v1" subtitle="Protocolos · Vacunas · Tratamientos · Alertas ICA · Historial clínico"
          c1="rgba(0,20,15,0.9)" c2="rgba(0,40,30,0.9)" border="rgba(0,245,212,0.35)"/>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FeatureCard icon={<Activity size={14}/>} color="#00f5d4" title="Protocolos Sanitarios"
            desc="Registre vacunaciones (aftosa, brucela, IBR, BVD), desparasitaciones y vitaminas. Alertas automáticas 7 días antes del vencimiento." />
          <FeatureCard icon={<FlaskConical size={14}/>} color="#38bdf8" title="Tratamientos y Diagnósticos"
            desc="Historial clínico por animal. Registro de medicamentos, dosis, vía de administración, veterinario responsable y tiempo de retiro." />
          <FeatureCard icon={<Bell size={14}/>} color="#f59e0b" title="Alertas de Revacunación"
            desc="El sistema calcula automáticamente las fechas de refuerzo y genera alertas en el centro de notificaciones para no perder ninguna vacuna." />
          <FeatureCard icon={<Shield size={14}/>} color="#a855f7" title="Certificados ICA"
            desc="Genera reportes de vacunación en formato compatible con los requerimientos del ICA Colombia para movilización de ganado." />
        </div>
        <div className="rounded-xl p-4 space-y-2" style={{background:'rgba(0,245,212,0.05)',border:'1px solid rgba(0,245,212,0.15)'}}>
          <div className="font-bold text-sm" style={{color:'#00f5d4'}}>📋 Enfermedades más registradas en Colombia</div>
          {[
            { e:'🦠', name:'Fiebre Aftosa', freq:'Vacunación obligatoria · ICA · Cada 4 meses', c:'#f87171' },
            { e:'🔬', name:'Brucelosis',    freq:'Hembras de 3–8 meses · Cepa RB51 · Una sola vez', c:'#fb923c' },
            { e:'🌡️', name:'Mastitis',      desc:'Higiene de ordeño · CMT mensual · Tratamiento temprano', c:'#fbbf24' },
            { e:'🐛', name:'Parásitos',     freq:'Desparasitación cada 60–90 días según carga parasitaria', c:'#4ade80' },
          ].map(r=>(
            <div key={r.name} className="flex items-start gap-2 text-xs" style={{color:'rgba(255,255,255,0.6)'}}>
              <span>{r.e}</span>
              <strong className="text-white">{r.name}</strong>
              <span>— {r.freq ?? r.desc}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    trazabilidad: (
      <div className="space-y-6">
        <SectionBanner emoji="🏷️" title="Trazabilidad ICA v1" subtitle="Guías de movilización · Códigos QR · Registro SINIGAN · Movimientos"
          c1="rgba(20,0,40,0.9)" c2="rgba(40,0,80,0.9)" border="rgba(168,85,247,0.35)"/>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FeatureCard icon={<Tag size={14}/>} color="#a855f7" title="Guías de Movilización ICA"
            desc="Registre todos los movimientos de animales entre predios. Genera guías en formato requerido por el ICA con número, origen, destino y animales." />
          <FeatureCard icon={<QrCode size={14}/>} color="#e879f9" title="Código QR por Animal"
            desc="Cada animal tiene su QR único. Escanéelo para ver su historial completo: vacunas, pesajes, partos, movimientos y certificados." />
          <FeatureCard icon={<Globe size={14}/>} color="#38bdf8" title="Registro SINIGAN"
            desc="Exporta los datos en formato compatible con el Sistema de Información de Ganadería Nacional (SINIGAN) para reportes al ICA." />
          <FeatureCard icon={<CheckCircle size={14}/>} color="#4ade80" title="Historial de Movimientos"
            desc="Trazabilidad completa del ciclo de vida: nacimiento, compra, traslados, exposiciones, ferias y venta. Todo auditado y con fecha." />
        </div>
        <div className="rounded-xl p-4 space-y-2" style={{background:'rgba(168,85,247,0.05)',border:'1px solid rgba(168,85,247,0.15)'}}>
          <div className="font-bold text-sm" style={{color:'#a855f7'}}>📌 Tipos de movimiento registrados</div>
          <div className="grid grid-cols-2 gap-2">
            {['🏡 Traslado entre potreros','🚛 Movilización entre predios','🏪 Ingreso por compra','💰 Salida por venta',
              '🏆 Exposición / Feria','🔬 Traslado veterinario','🐣 Nacimiento en finca','🌍 Exportación'].map(t=>(
              <div key={t} className="text-xs rounded-lg px-2.5 py-1.5" style={{background:'rgba(168,85,247,0.08)',color:'rgba(255,255,255,0.65)'}}>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    ventas: (
      <div className="space-y-6">
        <SectionBanner emoji="🇨🇴" title="Kit del Agente de Ventas CIVAC PRO"
          c1="rgba(0,40,0,0.95)" c2="rgba(0,80,20,0.95)" border="rgba(57,255,126,0.45)"
          subtitle="Todo lo que necesitas para vender CIVAC PRO en Colombia · Pitch · Demo · Objeciones · Precios" />

        {/* ── Elevator Pitch ── */}
        <div className="rounded-2xl p-5" style={{background:'linear-gradient(135deg,#001a08,#002a10)',border:'1px solid rgba(57,255,126,0.2)'}}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">⚡</span>
            <span className="font-black text-white text-base">Pitch de 30 Segundos</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full ml-auto" style={{background:'rgba(57,255,126,0.12)',color:'#39ff7e',border:'1px solid rgba(57,255,126,0.3)'}}>Memorizar</span>
          </div>
          <div className="rounded-xl p-4 text-sm leading-relaxed italic" style={{background:'rgba(57,255,126,0.05)',border:'1px solid rgba(57,255,126,0.15)',color:'rgba(255,255,255,0.75)'}}>
            "¿Lleva sus registros ganaderos en cuadernos o Excel? CIVAC PRO es la única app colombiana que funciona <strong className="text-white">sin internet en el campo</strong>, se conecta a su báscula Bluetooth, registra pesajes, reproducción, GPS del ganado, finanzas y 20 módulos más — todo desde el celular. Desde <strong className="text-white">$89.000 pesos al mes</strong>. Se instala en 2 minutos sin App Store. ¿Le hago una demo de 10 minutos?"
          </div>
        </div>

        {/* ── Propuesta de valor ── */}
        <div>
          <h3 className="font-black text-white text-sm mb-3 flex items-center gap-2"><span>🎯</span> Propuesta de Valor — Los 5 puntos que cierran ventas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { n:'1', title:'Funciona SIN Internet', desc:'En zonas rurales sin señal, CIVAC PRO sigue funcionando. Guarda todo en el celular y sincroniza cuando haya wifi. Sus competidores se caen en el campo.', c:'#39ff7e', glow:'57,255,126', emoji:'🌐' },
              { n:'2', title:'Se instala en 2 minutos', desc:'No hay App Store, no hay Play Store. El cliente abre civac.pro desde Chrome, toca "Instalar" y listo. Sin IT, sin configuración. Funciona en cualquier celular o tablet.', c:'#00f5d4', glow:'0,245,212', emoji:'⚡' },
              { n:'3', title:'Pesaje Bluetooth integrado', desc:'Compatible con básculas Tru-Test, Gallagher y Agreto. Pesa el animal y el sistema auto-calcula GMD, valor comercial y condición corporal. Elimina errores manuales.', c:'#3b82f6', glow:'59,130,246', emoji:'⚖️' },
              { n:'4', title:'20+ módulos, un solo precio', desc:'Inventario, reproducción, genética, GPS, potreros, insumos, personal, finanzas, P&G, alertas, multi-finca y más. No paga por módulo como la competencia.', c:'#a78bfa', glow:'167,139,250', emoji:'🗂️' },
              { n:'5', title:'Diseñado para Colombia', desc:'Razas criollas (Brahman, Cebú, GyrXHolstein), normativa ICA/FEDEGAN, precios en COP, pago con Nequi/PSE/Daviplata. No es un software extranjero adaptado.', c:'#f59e0b', glow:'245,158,11', emoji:'🇨🇴' },
              { n:'6', title:'ROI demostrable', desc:'Un ganadero que detecta a tiempo una vaca con pérdida de peso o preñez fallida ahorra millones. El costo del software es mínimo vs. el valor de un animal bien manejado.', c:'#f43f5e', glow:'244,63,94', emoji:'💰' },
            ].map(p=>(
              <div key={p.n} className="rounded-xl p-4" style={{background:`rgba(${p.glow},0.05)`,border:`1px solid rgba(${p.glow},0.18)`}}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{p.emoji}</span>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0" style={{background:`rgba(${p.glow},0.2)`,color:p.c}}>{p.n}</div>
                  <span className="font-bold text-sm text-white">{p.title}</span>
                </div>
                <p className="text-xs leading-relaxed" style={{color:'rgba(255,255,255,0.45)'}}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Precios ── */}
        <div>
          <h3 className="font-black text-white text-sm mb-3 flex items-center gap-2"><span>💳</span> Planes y Precios (pesos colombianos)</h3>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              {
                nombre:'PRO', precio:'$89.000', periodo:'/mes', color:'#00f5d4', glow:'0,245,212',
                bg:'linear-gradient(135deg,#001a14,#002a20)', border:'rgba(0,245,212,0.3)',
                badge:'Más vendido',
                features:['Inventario bovino completo','Pesaje manual + BT básico','Reproducción y partos','Insumos y Kardex','Alertas y notificaciones','Exportar CSV y JSON','Soporte por WhatsApp'],
              },
              {
                nombre:'PREMIUM', precio:'$189.000', periodo:'/mes', color:'#a78bfa', glow:'167,139,250',
                bg:'linear-gradient(135deg,#0f0020,#1a0035)', border:'rgba(167,139,250,0.35)',
                badge:'Recomendado',
                features:['Todo lo de PRO','GPS bovino en tiempo real','Genética y DEP','Multi-finca (3 fincas)','Módulo financiero P&G','Predicciones IA','Huella de carbono','Soporte prioritario'],
              },
              {
                nombre:'PLATINO', precio:'$399.000', periodo:'/mes', color:'#f59e0b', glow:'245,158,11',
                bg:'linear-gradient(135deg,#1a0c00,#2a1400)', border:'rgba(245,158,11,0.35)',
                badge:'Para grandes fincas',
                features:['Todo lo de Premium','Fincas ilimitadas','Usuarios ilimitados','Personalización de marca','Capacitación presencial','SLA 4 horas','API acceso a datos','Consultoría mensual'],
              },
            ].map(plan=>(
              <div key={plan.nombre} className="rounded-2xl overflow-hidden" style={{background:plan.bg,border:`1px solid ${plan.border}`}}>
                <div className="p-4 border-b" style={{borderColor:plan.border}}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-white text-base">{plan.nombre}</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{background:`rgba(${plan.glow},0.15)`,color:plan.color,border:`1px solid rgba(${plan.glow},0.3)`}}>{plan.badge}</span>
                  </div>
                  <div className="font-black text-3xl" style={{color:plan.color,fontFamily:'Sora,sans-serif'}}>{plan.precio}<span className="text-sm font-normal opacity-50">{plan.periodo}</span></div>
                  <div className="text-[10px] mt-1" style={{color:`rgba(${plan.glow},0.5)`}}>Pago con Wompi · PSE · Nequi · Daviplata</div>
                </div>
                <div className="p-4 space-y-1.5">
                  {plan.features.map(f=>(
                    <div key={f} className="flex items-start gap-2 text-xs" style={{color:'rgba(255,255,255,0.6)'}}>
                      <CheckCircle size={11} className="flex-shrink-0 mt-0.5" style={{color:plan.color}}/>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-xl p-3 text-center text-xs" style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.35)'}}>
            Todos los planes incluyen 30 días de prueba gratis · Sin contrato mínimo · Cancela cuando quieras
          </div>
        </div>

        {/* ── Perfil del cliente ideal ── */}
        <div>
          <h3 className="font-black text-white text-sm mb-3 flex items-center gap-2"><span>🎯</span> ¿A quién le vendo?</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { emoji:'🐄', title:'Ganadero mediano/grande', desc:'50–500+ cabezas. Tiene báscula, usa cuadernos o Excel. Pierde dinero por desorganización. Busca reducir costos y mejorar control.', ideal:true, nivel:'Alto potencial' },
              { emoji:'🏥', title:'Veterinario de campo', desc:'Visita fincas, lleva registros de sus clientes. CIVAC le permite ofrecer servicios de gestión digital. Multiplicador de ventas.', ideal:true, nivel:'Alto potencial' },
              { emoji:'🌿', title:'Ganadero pequeño (20–50 cab.)', desc:'Quiere profesionalizarse. Precio más sensible. Entrar con plan PRO y hacer upsell a Premium cuando vea el valor.', ideal:false, nivel:'Potencial medio' },
              { emoji:'🏢', title:'Cooperativas / Asoc. ganaderas', desc:'Una licencia Platino para toda la asociación. Múltiples usuarios, múltiples fincas. Ticket alto, requiere más gestión.', ideal:false, nivel:'Alto ticket' },
            ].map(c=>(
              <div key={c.title} className="rounded-xl p-4 flex gap-3" style={{background:c.ideal?'rgba(57,255,126,0.05)':'rgba(255,255,255,0.03)',border:c.ideal?'1px solid rgba(57,255,126,0.2)':'1px solid rgba(255,255,255,0.07)'}}>
                <span className="text-3xl flex-shrink-0">{c.emoji}</span>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-sm text-white">{c.title}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold" style={{background:c.ideal?'rgba(57,255,126,0.1)':'rgba(255,255,255,0.05)',color:c.ideal?'#39ff7e':'rgba(255,255,255,0.35)'}}>{c.nivel}</span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{color:'rgba(255,255,255,0.45)'}}>{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Manejo de objeciones ── */}
        <div>
          <h3 className="font-black text-white text-sm mb-3 flex items-center gap-2"><span>🛡️</span> Manejo de Objeciones — Las más comunes</h3>
          <div className="space-y-3">
            {[
              {
                obj:'"Tengo Excel y me funciona bien"',
                resp:'Excel no le avisa cuando una vaca lleva más de 90 días sin parir. No se conecta con su báscula. No funciona en el campo sin internet. CIVAC hace todo eso automáticamente — y más rápido que Excel.',
                c:'#f59e0b', glow:'245,158,11',
              },
              {
                obj:'"Es muy caro para mi finca"',
                resp:'$89.000 al mes son menos de $3.000 al día. Si CIVAC le ayuda a detectar a tiempo una sola vaca que no quedó preñada o una con pérdida de peso, ya pagó el año entero. ¿Cuánto vale un ternero perdido?',
                c:'#f43f5e', glow:'244,63,94',
              },
              {
                obj:'"No soy bueno con la tecnología"',
                resp:'CIVAC fue diseñado para ganaderos, no para ingenieros. La pantalla de pesaje tiene botones grandes. Hacemos una capacitación de 30 minutos por WhatsApp y lo dejamos listo. Además tiene soporte incluido.',
                c:'#3b82f6', glow:'59,130,246',
              },
              {
                obj:'"¿Y si se daña el celular y pierdo todo?"',
                resp:'CIVAC exporta backup completo en JSON que puede guardar en WhatsApp, Google Drive o USB. En otro celular instala CIVAC, importa el backup y en 2 minutos tiene todo de vuelta.',
                c:'#a78bfa', glow:'167,139,250',
              },
              {
                obj:'"Ya probé una app y no me funcionó"',
                resp:'La mayoría requieren internet todo el tiempo. CIVAC funciona 100% offline en campo — esa es la diferencia clave. Además fue diseñado para Colombia: razas criollas, precios en COP, normativa ICA.',
                c:'#14b8a6', glow:'20,184,166',
              },
              {
                obj:'"¿Tiene integración con ICA / FEDEGAN?"',
                resp:'CIVAC lleva el registro de todos los movimientos en el formato que exige el ICA (arete, fecha, tipo de movimiento). Puede exportar CSV para sus reportes oficiales con un solo clic.',
                c:'#22c55e', glow:'34,197,94',
              },
            ].map(ob=>(
              <div key={ob.obj} className="rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 flex items-start gap-2" style={{background:`rgba(${ob.glow},0.08)`,borderLeft:`3px solid rgba(${ob.glow},0.7)`}}>
                  <span className="text-sm flex-shrink-0 mt-0.5">❓</span>
                  <span className="font-semibold text-sm italic" style={{color:ob.c}}>{ob.obj}</span>
                </div>
                <div className="px-4 py-2.5 flex items-start gap-2" style={{background:'rgba(255,255,255,0.02)',borderLeft:`3px solid rgba(${ob.glow},0.25)`}}>
                  <span className="text-sm flex-shrink-0 mt-0.5">💬</span>
                  <p className="text-xs leading-relaxed" style={{color:'rgba(255,255,255,0.6)'}}>{ob.resp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Comparativa vs competencia ── */}
        <div>
          <h3 className="font-black text-white text-sm mb-3 flex items-center gap-2"><span>📊</span> Comparativa vs. Competencia</h3>
          <div className="rounded-2xl overflow-hidden" style={{border:'1px solid rgba(0,245,212,0.15)'}}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-xs">
                <thead>
                  <tr style={{background:'rgba(0,245,212,0.06)',borderBottom:'1px solid rgba(0,245,212,0.12)'}}>
                    {['Característica','CIVAC PRO 🇨🇴','SisGan','Agrosoft','Software externo'].map((h,i)=>(
                      <th key={h} className="text-left px-4 py-3 font-bold"
                        style={{color:i===1?'#00f5d4':'rgba(255,255,255,0.4)',minWidth:120}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Funciona offline (campo)','✅ Sí, 100%','⚠️ Parcial','❌ No','❌ No'],
                    ['PWA — sin App Store','✅ Sí','❌ No','❌ No','⚠️ Algunos'],
                    ['Pesaje Bluetooth','✅ Tru-Test, Gallagher','⚠️ Solo Tru-Test','❌ No','✅ Depende'],
                    ['GPS bovino','✅ Incluido','❌ Módulo extra','❌ No','✅ Caro'],
                    ['Genética / DEP','✅ Incluido','⚠️ Básico','❌ No','✅ Caro'],
                    ['Razas criollas Colombia','✅ Brahman, Cebú, Gyr','✅ Sí','⚠️ Limitado','❌ No'],
                    ['Pago en COP (Nequi/PSE)','✅ Sí','✅ Sí','✅ Sí','❌ USD/EUR'],
                    ['Precio mensual','✅ $89K–$399K','⚠️ $150K–$600K','⚠️ Licencia anual','❌ +$500K'],
                    ['Soporte en español','✅ WhatsApp Colombia','⚠️ Solo email','⚠️ Lento','❌ Inglés'],
                    ['Multi-finca','✅ Incluido','⚠️ Costo extra','❌ No','✅ Caro'],
                    ['Módulos financieros IA','✅ P&G + Predicción','❌ Básico','❌ No','⚠️ Limitado'],
                  ].map(row=>(
                    <tr key={row[0]} className="border-t hover:bg-white/[0.012] transition-colors"
                      style={{borderColor:'rgba(255,255,255,0.04)'}}>
                      {row.map((cell,i)=>(
                        <td key={i} className="px-4 py-2.5"
                          style={{color:i===0?'rgba(255,255,255,0.6)':i===1?'rgba(255,255,255,0.85)':'rgba(255,255,255,0.35)',
                            fontWeight:i===1?700:400,
                            background:i===1?'rgba(0,245,212,0.02)':'transparent'}}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Script de demo ── */}
        <div>
          <h3 className="font-black text-white text-sm mb-3 flex items-center gap-2"><span>🎬</span> Guión de Demo — 10 minutos</h3>
          <div className="space-y-2">
            {[
              { min:'00:00', paso:'Abrir civac.pro en Chrome del cliente y mostrar el login', tip:'Deje que el cliente toque las 4 tarjetas de perfil — eso ya impresiona', c:'#00f5d4' },
              { min:'01:30', paso:'Entrar como Admin y mostrar el Dashboard con los KPIs', tip:'Señale los 6 KPIs de arriba: "Todo su negocio en una pantalla"', c:'#3b82f6' },
              { min:'03:00', paso:'Ir a Inventario → abrir una ficha de animal', tip:'Muestre el historial de pesajes, vacunas y partos — diga "esto es lo que el ICA pide"', c:'#a78bfa' },
              { min:'04:30', paso:'Demostrar Pesaje Manual: widget de báscula digital', tip:'Seleccione un animal, ajuste el peso con los botones ±5 y ±1, muestre el recibo que se genera', c:'#f59e0b' },
              { min:'06:00', paso:'Ir a GPS → mostrar el mapa con los collares', tip:'"Sus vacas en tiempo real — si salen de la geocerca, le llega una alerta"', c:'#22c55e' },
              { min:'07:30', paso:'Mostrar Centro de Respaldo → exportar backup JSON', tip:'"Sus datos están en su celular. Aquí los exporta a WhatsApp o Google Drive"', c:'#f43f5e' },
              { min:'09:00', paso:'Ir a Configuración → instalar como PWA', tip:'Haga que el CLIENTE toque "Instalar" — el momento de magia cuando aparece el ícono en su pantalla', c:'#c084fc' },
              { min:'10:00', paso:'Cierre: mostrar los planes y precio', tip:'"¿Con cuál plan empieza?" — no pregunte si quiere, asuma que quiere y pregunta cuál', c:'#39ff7e' },
            ].map(s=>(
              <div key={s.min} className="flex gap-3 items-start">
                <div className="w-10 flex-shrink-0 text-center">
                  <div className="font-mono font-bold text-xs px-1 py-0.5 rounded" style={{background:`rgba(${s.c==='#00f5d4'?'0,245,212':s.c==='#3b82f6'?'59,130,246':s.c==='#a78bfa'?'167,139,250':s.c==='#f59e0b'?'245,158,11':s.c==='#22c55e'?'34,197,94':s.c==='#f43f5e'?'244,63,94':s.c==='#c084fc'?'192,132,252':'57,255,126'},0.15)`,color:s.c}}>{s.min}</div>
                </div>
                <div className="flex-1 rounded-xl px-3 py-2.5" style={{background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.06)'}}>
                  <div className="font-semibold text-xs text-white mb-0.5">{s.paso}</div>
                  <div className="text-[10px]" style={{color:'rgba(255,255,255,0.35)'}}>💡 {s.tip}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Comisiones y contacto ── */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-2xl p-5" style={{background:'linear-gradient(135deg,#1a0800,#2a1200)',border:'1px solid rgba(245,158,11,0.25)'}}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">💰</span>
              <span className="font-black text-white text-sm">Comisiones para Agentes</span>
            </div>
            <div className="space-y-2">
              {[
                {plan:'Plan PRO', comision:'20%', val:'$17.800/mes', glow:'245,158,11'},
                {plan:'Plan Premium', comision:'20%', val:'$37.800/mes', glow:'167,139,250'},
                {plan:'Plan Platino', comision:'20%', val:'$79.800/mes', glow:'244,63,94'},
                {plan:'Bono por 5+ clientes/mes', comision:'25%', val:'Comisión aumentada', glow:'57,255,126'},
              ].map(c=>(
                <div key={c.plan} className="flex items-center justify-between py-1.5 border-b" style={{borderColor:'rgba(255,255,255,0.06)'}}>
                  <span className="text-xs text-white/60">{c.plan}</span>
                  <div className="text-right">
                    <span className="font-black text-sm" style={{color:`rgb(${c.glow})`}}>{c.comision}</span>
                    <div className="text-[9px]" style={{color:`rgba(${c.glow},0.5)`}}>{c.val}</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] mt-3" style={{color:'rgba(255,255,255,0.3)'}}>Comisión recurrente mientras el cliente pague · Pago mensual por Nequi o transferencia</p>
          </div>

          <div className="rounded-2xl p-5" style={{background:'linear-gradient(135deg,#001428,#001e3c)',border:'1px solid rgba(59,130,246,0.25)'}}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">📞</span>
              <span className="font-black text-white text-sm">Contacto y Recursos</span>
            </div>
            <div className="space-y-3">
              {[
                { icon:'💬', label:'WhatsApp ventas', val:'+57 300 000 0000', c:'#25D366' },
                { icon:'📧', label:'Email comercial', val:'ventas@civac.pro', c:'#3b82f6' },
                { icon:'🌐', label:'Demo pública', val:'civac.pro', c:'#00f5d4' },
                { icon:'📹', label:'Video de demo', val:'civac.pro/demo', c:'#f43f5e' },
                { icon:'📋', label:'Brochure PDF', val:'civac.pro/brochure', c:'#a78bfa' },
              ].map(c=>(
                <div key={c.label} className="flex items-center gap-2.5">
                  <span className="text-lg flex-shrink-0">{c.icon}</span>
                  <div>
                    <div className="text-[9px] text-white/30">{c.label}</div>
                    <div className="font-bold text-sm" style={{color:c.c}}>{c.val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FAQ del cliente ── */}
        <div>
          <h3 className="font-black text-white text-sm mb-3 flex items-center gap-2"><span>❓</span> FAQ — Preguntas que hacen los clientes</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { q:'¿Necesito internet en el campo?', a:'No. CIVAC funciona 100% offline. Guarda todo en el celular y puede sincronizar cuando llegue a casa o a la oficina.' },
              { q:'¿Cuántas vacas puedo registrar?', a:'Sin límite. Puede registrar desde 5 hasta 50.000 animales. El sistema maneja cualquier tamaño de hato.' },
              { q:'¿Puedo usar CIVAC en varios celulares?', a:'Sí. La misma finca puede tener varios usuarios con roles distintos: admin, veterinario, vaquero, solo lectura.' },
              { q:'¿Qué pasa si cancelo la suscripción?', a:'Todos sus datos siguen en el celular. Puede exportar backup completo y llevarlo a cualquier lugar. Sus datos son suyos.' },
              { q:'¿Funciona con mi báscula de la finca?', a:'CIVAC se conecta con las principales básculas Bluetooth del mercado colombiano (Tru-Test, Gallagher). Para báscula sin BT, ingresa el peso manualmente.' },
              { q:'¿Hay soporte en español?', a:'Sí. Soporte por WhatsApp en horario colombiano (7am–7pm). También hay guías de video y documentación completa en español.' },
            ].map(fq=>(
              <div key={fq.q} className="rounded-xl p-3.5" style={{background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.07)'}}>
                <div className="font-semibold text-xs text-white mb-1.5">❓ {fq.q}</div>
                <p className="text-xs leading-relaxed" style={{color:'rgba(255,255,255,0.5)'}}>{fq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Cierre ── */}
        <div className="rounded-2xl p-5 text-center relative overflow-hidden"
          style={{background:'linear-gradient(135deg,#001a08,#002a10,#001a08)',border:'1px solid rgba(57,255,126,0.3)'}}>
          <div className="absolute inset-0 pointer-events-none" style={{background:'radial-gradient(ellipse at 50% 0%,rgba(57,255,126,0.06),transparent 60%)'}}/>
          <div className="relative">
            <div className="text-4xl mb-2">🇨🇴</div>
            <h3 className="font-black text-white text-lg mb-2" style={{fontFamily:'Sora,sans-serif'}}>¡Usted puede vender el mejor software ganadero de Colombia!</h3>
            <p className="text-sm mb-4 max-w-xl mx-auto" style={{color:'rgba(57,255,126,0.6)'}}>
              CIVAC PRO está probado, funciona en campo, tiene soporte y un precio justo para el mercado colombiano. Su trabajo es mostrarlo y cerrar. El software se vende solo.
            </p>
            <div className="flex gap-2 justify-center flex-wrap">
              <button onClick={()=>window.print()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm"
                style={{background:'rgba(57,255,126,0.12)',border:'1px solid rgba(57,255,126,0.3)',color:'#39ff7e'}}>
                <Printer size={14}/> Imprimir esta guía
              </button>
              <a href="https://wa.me/573000000000?text=Hola, quiero ser agente CIVAC PRO" target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm"
                style={{background:'rgba(37,211,102,0.12)',border:'1px solid rgba(37,211,102,0.3)',color:'#25D366'}}>
                💬 Contactar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    ),
  };

  const activeConf = SECTIONS.find(s => s.id === activeSection);

  return (
    <div className="space-y-5 pb-8">
      {/* Banner */}
      <div className="rounded-xl p-5 relative overflow-hidden"
        style={{background:'linear-gradient(135deg,#000d1a 0%,#001a2e 100%)',
          border:'1px solid rgba(56,189,248,0.35)',
          boxShadow:'0 0 50px rgba(56,189,248,0.06)'}}>
        <div className="absolute right-0 top-0 w-48 h-full opacity-10 pointer-events-none"
          style={{background:'radial-gradient(ellipse at right, #38bdf8, transparent 70%)'}}/>
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{background:'rgba(56,189,248,0.1)',border:'1px solid rgba(56,189,248,0.4)'}}>📚</div>
          <div>
            <h1 className="text-2xl font-black text-white" style={{fontFamily:'Sora,sans-serif'}}>
              Documentación CIVAC PRO
            </h1>
            <p className="text-sm" style={{color:'rgba(56,189,248,0.7)'}}>
              Guía completa · {SECTIONS.length} secciones · Todos los módulos documentados
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Sidebar nav */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="rounded-xl overflow-hidden sticky top-4 bg-card border border-border">
            {SECTIONS.map(s => {
              const Icon = s.icon;
              const isActive = activeSection === s.id;
              return (
                <button key={s.id} onClick={() => setActiveSection(s.id)}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-semibold transition-all text-left"
                  style={isActive
                    ? {background:'rgba(56,189,248,0.12)',color:'#38bdf8',borderLeft:'3px solid #38bdf8'}
                    : {borderLeft:'3px solid transparent'}}>
                  <Icon size={14} style={{flexShrink:0, color: isActive ? '#38bdf8' : undefined, opacity: isActive ? 1 : 0.5}}/>
                  <span className={isActive ? 'text-[#38bdf8]' : 'text-muted-foreground'}>{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {sections[activeSection] ?? (
            <div className="text-center py-20 text-white/30">
              <BookOpen size={48} className="mx-auto mb-3 opacity-20"/>
              <p>Sección en construcción</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
