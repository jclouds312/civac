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
    <div className="rounded-xl p-4 space-y-2" style={{background:`rgba(255,255,255,0.03)`, border:`1px solid ${color}25`}}>
      <div className="flex items-center gap-2 mb-1" style={{color}}>
        {icon}
        <span className="font-bold text-sm text-white">{title}</span>
      </div>
      <p className="text-xs text-white/50 leading-relaxed">{desc}</p>
    </div>
  );
}

function Step({ n, text, color }: { n: number; text: string; color: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 text-black"
        style={{background:color}}>{n}</div>
      <p className="text-sm text-white/70 pt-0.5">{text}</p>
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
            {p:'🩺 Veterinario', e:'vet@ganader.ia',    pw:'vet2025',   a:'Clínico + GPS + Reproducción'},
            {p:'🐄 Campo',       e:'luis@ganader.ia',   pw:'campo2025', a:'Inventario + Pesaje BT'},
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
          border="rgba(0,245,212,0.35)" subtitle="Sistema integral de gestión ganadera · Colombia · v3.0"/>

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
            <div key={c.title} className="rounded-xl p-4" style={{background:'rgba(255,255,255,0.03)',border:`1px solid ${c.c}20`}}>
              <div className="text-2xl mb-2">{c.emoji}</div>
              <div className="font-bold text-sm text-white mb-1">{c.title}</div>
              <p className="text-xs text-white/45 leading-relaxed">{c.desc}</p>
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
              <div key={s.label} className="rounded-lg p-3" style={{background:'rgba(0,0,0,0.3)'}}>
                <div className="text-xl mb-1">{s.emoji}</div>
                <div className="font-black text-xl" style={{color:s.c}}>{s.val}</div>
                <div className="text-[10px] text-white/30">{s.label}</div>
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
            <div key={m.ruta} className="rounded-xl px-4 py-3 flex items-center gap-4"
              style={{background:'rgba(255,255,255,0.02)',border:`1px solid ${m.c}18`}}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                style={{background:`${m.c}15`, border:`1px solid ${m.c}30`}}>
                {m.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{m.label}</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded" style={{background:'rgba(0,0,0,0.4)',color:m.c}}>{m.ruta}</span>
                </div>
                <p className="text-xs text-white/40 truncate">{m.desc}</p>
              </div>
              <ChevronRight size={14} style={{color:`${m.c}50`, flexShrink:0}}/>
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
              <div key={f} className="flex items-center gap-1.5 text-xs text-white/60">
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
              steps:['Abra Chrome o Edge','Menú ⋮ → «Instalar GanaderIA»','Confirmar instalación','Acceso desde escritorio'] },
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
            desc="GanaderIA guarda todos los datos en localStorage del navegador. Al abrir la app sin internet, carga los datos locales. Todo funciona: inventario, pesaje, alertas, GPS (si hay collar BT activo)."/>
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
                <p className="text-xs text-white/50 leading-relaxed">{r.acceso}</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {r.permisos.map(p => (
                    <div key={p} className="flex items-center gap-1.5 text-[10px] text-white/55">
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
          <div className="rounded-xl overflow-hidden sticky top-4" style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)'}}>
            {SECTIONS.map(s => {
              const Icon = s.icon;
              const isActive = activeSection === s.id;
              return (
                <button key={s.id} onClick={() => setActiveSection(s.id)}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-semibold transition-all text-left"
                  style={isActive
                    ? {background:'rgba(56,189,248,0.12)',color:'#38bdf8',borderLeft:'2px solid #38bdf8'}
                    : {color:'rgba(255,255,255,0.4)',borderLeft:'2px solid transparent'}}>
                  <Icon size={14} style={{flexShrink:0, opacity: isActive ? 1 : 0.6}}/>
                  {s.label}
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
