import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  BookOpen, Search, LayoutDashboard, List, Activity, Baby, Dna,
  Map, Wheat, Package, TestTube, DollarSign, Users, LineChart, Leaf,
  Bell, ActivitySquare, ChevronRight, ChevronDown, Zap, Shield, Database,
  Smartphone, Wifi, HelpCircle, ExternalLink, Clock, Star, Download
} from "lucide-react";

const modules = [
  { icon: LayoutDashboard, name: "Tablero KPIs", color: "text-emerald-500", bg: "bg-emerald-500/10", desc: "Vista general del sistema. 6 KPIs principales, gráficos de tendencia, alertas activas, análisis de 3 columnas y módulos de acceso rápido.", nivel: "Básico", tiempo: "5 min" },
  { icon: List, name: "Inventario", color: "text-blue-500", bg: "bg-blue-500/10", desc: "Gestión del hato ganadero. CRUD completo de animales con RFID, filtros por categoría/lote/estado, badge de color por raza y conteo automático.", nivel: "Básico", tiempo: "10 min" },
  { icon: Activity, name: "Producción", color: "text-cyan-500", bg: "bg-cyan-500/10", desc: "Registro diario de ordeño. Ranking de vacas top con barras horizontales, BarChart histórico de 7 meses, planilla de 3 turnos y cálculo de litros/vaca.", nivel: "Básico", tiempo: "8 min" },
  { icon: Baby, name: "Reproducción", color: "text-pink-500", bg: "bg-pink-500/10", desc: "Seguimiento reproductivo. 5 KPIs con indicadores (IEP, tasa concepción, días abiertos), tabla de próximos partos y panel de anestros con diagnóstico IA.", nivel: "Intermedio", tiempo: "12 min" },
  { icon: Dna, name: "Genética", color: "text-violet-500", bg: "bg-violet-500/10", desc: "Análisis de DEP (Diferencias de Transmisión Esperada). Ranking con barras de score por indicador, panel de pedigrí con árbol genealógico y progenie.", nivel: "Avanzado", tiempo: "15 min" },
  { icon: Map, name: "Potreros", color: "text-teal-500", bg: "bg-teal-500/10", desc: "Gestión de pastoreo rotacional. Mapa CSS interactivo por colores (ocupado/descanso/disponible/rotar), toggle lista vs mapa y semáforo de rotación.", nivel: "Básico", tiempo: "7 min" },
  { icon: Wheat, name: "Alimentación", color: "text-lime-500", bg: "bg-lime-500/10", desc: "Plan nutricional del hato. Raciones por categoría (vaca lactante/seca/novilla/ternero), registro de suplementos, cálculo de materia seca y costeo.", nivel: "Intermedio", tiempo: "10 min" },
  { icon: Package, name: "Insumos", color: "text-orange-500", bg: "bg-orange-500/10", desc: "Inventario Kardex de insumos veterinarios y alimenticios. Botones +/− de stock, alertas automáticas cuando cae por debajo del mínimo, badge de estado.", nivel: "Básico", tiempo: "8 min" },
  { icon: TestTube, name: "Semen y Embriones", color: "text-indigo-500", bg: "bg-indigo-500/10", desc: "Banco genético. Tabla de pajillas de semen por toro con origen y características, registro de embriones con donante/receptor y estado de transferencia.", nivel: "Avanzado", tiempo: "10 min" },
  { icon: DollarSign, name: "Costos y P&G", color: "text-green-500", bg: "bg-green-500/10", desc: "Estado de resultados ganadero. 5 KPIs financieros, tabla P&G detallada por categoría, desglose de costo por litro y ecuación precio−costo=margen.", nivel: "Intermedio", tiempo: "12 min" },
  { icon: Users, name: "Personal", color: "text-amber-500", bg: "bg-amber-500/10", desc: "Nómina del personal de finca. 6 empleados con cargo, EPS, ARL, horas extras y salario. Footer con totales de nómina y prestaciones calculadas automáticamente.", nivel: "Básico", tiempo: "8 min" },
  { icon: LineChart, name: "Predicciones IA", color: "text-purple-500", bg: "bg-purple-500/10", desc: "Simulador financiero con inteligencia artificial. BarChart de proyección a 6 meses y 4 sliders interactivos (precio leche, producción, alimento, empleados).", nivel: "Avanzado", tiempo: "15 min" },
  { icon: Leaf, name: "Huella de Carbono", color: "text-emerald-600", bg: "bg-emerald-600/10", desc: "Medición de emisiones según metodología IPCC 2019. Benchmarking Colombia/Suramérica/Mundial, balance de carbono (Alcances 1/2/3) y evolución mensual.", nivel: "Avanzado", tiempo: "12 min" },
  { icon: Bell, name: "Alertas", color: "text-red-500", bg: "bg-red-500/10", desc: "Centro de notificaciones. Tarjetas con borde lateral por severidad (peligro/advertencia/info), botón Resolver y registro de alertas históricas del sistema.", nivel: "Básico", tiempo: "5 min" },
  { icon: ActivitySquare, name: "Ficha Individual", color: "text-sky-500", bg: "bg-sky-500/10", desc: "Historia clínica por animal. Tabs de vacunas/pesos/partos/eventos, línea de tiempo del animal seleccionado y métricas de producción individuales.", nivel: "Intermedio", tiempo: "10 min" },
  { icon: Map, name: "Multi-Finca", color: "text-blue-600", bg: "bg-blue-600/10", desc: "Gestión de múltiples predios. Tarjetas por finca con KPIs propios, tabla comparativa de producción/margen/CO₂ y visión consolidada del negocio ganadero.", nivel: "Avanzado", tiempo: "10 min" },
];

const faqs = [
  { q: "¿Cómo agrego un nuevo animal al inventario?", a: "Ingresa al módulo Inventario, haz clic en el botón 'Nuevo animal' (+ en la esquina superior), completa los campos obligatorios (ID/RFID, nombre, raza, categoría, lote) y guarda. El animal aparecerá en la tabla automáticamente." },
  { q: "¿Los datos se guardan si cierro el navegador?", a: "Sí. GanaderIA usa localStorage del navegador para persistir todos los datos. Al recargar o volver a abrir el sistema, los datos estarán intactos. Para un respaldo externo, usa Configuración → Datos → Exportar JSON." },
  { q: "¿Cómo instalo GanaderIA como aplicación en mi teléfono?", a: "En el topbar o menú lateral verás el botón 'Instalar app (PWA)' cuando el sistema detecta que puede instalarse. También puedes ir al menú de tu navegador (Chrome/Edge) y seleccionar 'Instalar aplicación' o 'Agregar a pantalla de inicio'." },
  { q: "¿Cómo cambio entre modo oscuro y claro?", a: "Haz clic en el ícono de Sol/Luna en la barra superior (topbar) para alternar entre modos. La preferencia se guarda automáticamente. También puedes cambiarlo en Configuración → Apariencia." },
  { q: "¿Qué significan los colores de los potreros en el mapa?", a: "Verde oscuro = Disponible para ingreso. Verde/Teal = Ocupado (dentro del tiempo normal). Ámbar = Debe rotarse pronto (1-5 días). Gris = En descanso/recuperación. Cada potrero muestra días de ocupación y su ciclo de rotación." },
  { q: "¿Cómo funciona el simulador de Predicciones IA?", a: "El simulador usa los datos actuales de producción y costos como base. Mueve los 4 sliders (precio leche, producción, costo alimento, empleados) para ver en tiempo real cómo cambia el ingreso proyectado y el margen financiero de los próximos 6 meses." },
  { q: "¿Puedo usar el sistema sin internet?", a: "Sí. GanaderIA es una PWA (Progressive Web App) con service worker que cachea los archivos del sistema. Una vez instalada o visitada, funciona offline. Los datos siempre están en tu dispositivo." },
  { q: "¿Cómo ajustar el stock de un insumo?", a: "Ve al módulo Insumos, busca el producto y usa los botones +/− para aumentar o disminuir el stock en una unidad, o haz clic directamente en el valor para editarlo. El estado (OK/Pedir/Crítico) se actualiza automáticamente." },
];

const nivelColors: Record<string, string> = {
  Básico: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30",
  Intermedio: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  Avanzado: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
};

export default function Documentacion() {
  const [search, setSearch] = useState("");
  const [activeSection, setActiveSection] = useState("modulos");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [selectedModule, setSelectedModule] = useState<typeof modules[0] | null>(null);

  const filtered = modules.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0d2850] via-[#1a3a6e] to-[#0d2038] p-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-72 h-full opacity-10 flex items-center justify-end pr-8">
          <BookOpen className="w-48 h-48" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={20} className="text-blue-300" />
            <Badge className="bg-blue-500/30 text-blue-200 border-blue-400/30 text-xs">{modules.length} módulos documentados</Badge>
          </div>
          <h1 className="text-2xl font-bold mb-2">Centro de Documentación</h1>
          <p className="text-blue-200/70 text-sm mb-4">Guías de uso, referencia técnica, preguntas frecuentes y tutoriales del sistema GanaderIA.</p>
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <Input
              placeholder="Buscar guías, módulos, funciones..."
              value={search}
              onChange={e => { setSearch(e.target.value); if (e.target.value) setActiveSection("modulos"); }}
              className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-blue-400 focus:bg-white/15"
            />
          </div>
        </div>
      </div>

      {/* Quick access cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Zap, label: "Inicio rápido", desc: "Primeros pasos", color: "text-yellow-500", bg: "bg-yellow-500/10", section: "quickstart" },
          { icon: BookOpen, label: "Módulos", desc: "16 guías completas", color: "text-blue-500", bg: "bg-blue-500/10", section: "modulos" },
          { icon: HelpCircle, label: "FAQ", desc: "Preguntas frecuentes", color: "text-purple-500", bg: "bg-purple-500/10", section: "faq" },
          { icon: Shield, label: "PWA & Datos", desc: "Instalación y backup", color: "text-green-500", bg: "bg-green-500/10", section: "pwa" },
        ].map(item => (
          <Card
            key={item.section}
            className={`border cursor-pointer transition-all hover:shadow-md ${activeSection === item.section ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
            onClick={() => { setActiveSection(item.section); setSearch(""); }}
          >
            <CardContent className="p-4">
              <div className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center mb-2`}>
                <item.icon size={18} className={item.color} />
              </div>
              <p className="font-semibold text-sm text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Quick Start ── */}
      {activeSection === "quickstart" && (
        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Zap size={16} className="text-yellow-500" />Guía de inicio rápido</CardTitle>
              <CardDescription>Empiece a usar GanaderIA en 5 pasos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { n: 1, title: "Inicia sesión", desc: "Selecciona tu perfil de acceso en la pantalla de login y haz clic en tu tarjeta de rol (Administrador, Veterinario, Ordeñador o Propietario)." },
                { n: 2, title: "Revisa el Tablero KPIs", desc: "El dashboard muestra el estado general de la finca: producción del día, animales, alertas activas y análisis financiero." },
                { n: 3, title: "Verifica el Inventario", desc: "Confirma que los animales en el sistema corresponden a los de tu finca. Edita, agrega o elimina según necesites." },
                { n: 4, title: "Registra producción diaria", desc: "En el módulo Producción, ingresa los litros de los 3 turnos de ordeño. El sistema calcula el promedio y actualiza el ranking." },
                { n: 5, title: "Revisa y resuelve Alertas", desc: "El módulo Alertas muestra las notificaciones pendientes. Resuelve las urgentes y configura tus preferencias de notificación." },
              ].map(step => (
                <div key={step.n} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0 mt-0.5">
                    {step.n}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{step.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Flujo de trabajo recomendado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { tiempo: "Cada mañana", tareas: ["Registrar producción", "Revisar alertas", "Verificar insumos críticos"], color: "border-l-blue-500" },
                { tiempo: "Cada semana", tareas: ["Actualizar pesos", "Revisar rotación de potreros", "Control sanitario"], color: "border-l-emerald-500" },
                { tiempo: "Cada mes", tareas: ["Análisis financiero (Costos y P&G)", "Reporte reproductivo", "Exportar respaldo de datos"], color: "border-l-purple-500" },
              ].map(item => (
                <div key={item.tiempo} className={`border-l-4 ${item.color} pl-4 py-2 bg-muted/30 rounded-r-xl`}>
                  <p className="text-sm font-semibold text-foreground">{item.tiempo}</p>
                  <ul className="mt-1 space-y-0.5">
                    {item.tareas.map(t => (
                      <li key={t} className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <ChevronRight size={10} className="text-primary" />{t}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 mt-2">
                <div className="flex items-center gap-2 mb-1.5">
                  <Star size={14} className="text-primary" />
                  <p className="text-xs font-semibold text-primary">Consejo profesional</p>
                </div>
                <p className="text-xs text-muted-foreground">Use el Simulador de Predicciones para planificar escenarios antes de tomar decisiones como aumentar el hato o contratar más personal.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Modules ── */}
      {(activeSection === "modulos" || search) && (
        <div>
          {!search && (
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Guías de módulos ({modules.length})</h2>
              <div className="flex gap-1">
                {["Todos", "Básico", "Intermedio", "Avanzado"].map(n => (
                  <button key={n} className="text-xs px-3 py-1 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors">{n}</button>
                ))}
              </div>
            </div>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map(mod => (
              <Card
                key={mod.name}
                onClick={() => setSelectedModule(selectedModule?.name === mod.name ? null : mod)}
                className={`border cursor-pointer transition-all hover:shadow-md ${selectedModule?.name === mod.name ? 'border-primary shadow-sm shadow-primary/10 bg-primary/5' : 'border-border hover:border-primary/30'}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className={`w-9 h-9 rounded-lg ${mod.bg} flex items-center justify-center`}>
                      <mod.icon size={18} className={mod.color} />
                    </div>
                    <Badge className={`text-[10px] ${nivelColors[mod.nivel]}`}>{mod.nivel}</Badge>
                  </div>
                  <p className="font-semibold text-sm text-foreground mb-1">{mod.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-3">{mod.desc}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground/60">
                    <Clock size={10} />
                    <span>~{mod.tiempo} de lectura</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedModule && (
            <Card className="border-primary/30 bg-primary/5 mt-4">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl ${selectedModule.bg} flex items-center justify-center flex-shrink-0`}>
                    <selectedModule.icon size={20} className={selectedModule.color} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base">{selectedModule.name}</CardTitle>
                      <Badge className={`text-[10px] ${nivelColors[selectedModule.nivel]}`}>{selectedModule.nivel}</Badge>
                    </div>
                    <CardDescription className="mt-1">{selectedModule.desc}</CardDescription>
                  </div>
                  <button onClick={() => setSelectedModule(null)} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid sm:grid-cols-3 gap-3 text-sm">
                  {[
                    { label: "Nivel de dificultad", value: selectedModule.nivel },
                    { label: "Tiempo estimado", value: selectedModule.tiempo + " de lectura" },
                    { label: "Acceso desde", value: "Menú lateral → " + selectedModule.name.split(' ')[0] },
                  ].map(item => (
                    <div key={item.label} className="bg-background rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="font-medium text-foreground text-xs mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Search size={40} className="mx-auto mb-3 opacity-30" />
              <p>No se encontraron resultados para "{search}"</p>
            </div>
          )}
        </div>
      )}

      {/* ── FAQ ── */}
      {activeSection === "faq" && (
        <div className="max-w-3xl space-y-2">
          <h2 className="font-semibold text-foreground mb-4">Preguntas frecuentes ({faqs.length})</h2>
          {faqs.map((faq, i) => (
            <Card
              key={i}
              className={`border cursor-pointer transition-all ${expandedFaq === i ? 'border-primary' : 'border-border hover:border-primary/30'}`}
            >
              <CardContent className="p-4">
                <button
                  className="w-full flex items-start justify-between gap-3 text-left"
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <HelpCircle size={13} className="text-primary" />
                    </div>
                    <p className="font-medium text-sm text-foreground leading-snug">{faq.q}</p>
                  </div>
                  {expandedFaq === i
                    ? <ChevronDown size={16} className="text-primary flex-shrink-0 mt-0.5" />
                    : <ChevronRight size={16} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                  }
                </button>
                {expandedFaq === i && (
                  <p className="text-sm text-muted-foreground mt-3 ml-9 leading-relaxed border-t border-border pt-3">
                    {faq.a}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── PWA & Data ── */}
      {activeSection === "pwa" && (
        <div className="grid lg:grid-cols-2 gap-4 max-w-3xl">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Smartphone size={16} className="text-primary" />Instalar como PWA</CardTitle>
              <CardDescription>GanaderIA funciona como aplicación nativa en tu dispositivo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-muted/40 rounded-xl p-4 space-y-2">
                {[
                  { device: "Android (Chrome)", steps: "Menú ⋮ → 'Instalar aplicación' o 'Agregar a pantalla de inicio'" },
                  { device: "iOS (Safari)", steps: "Compartir □ → 'Agregar a pantalla de inicio'" },
                  { device: "Windows/Mac (Chrome/Edge)", steps: "Ícono de instalación en la barra de URL o menú → 'Instalar GanaderIA'" },
                ].map(item => (
                  <div key={item.device} className="border-b border-border last:border-0 pb-2 last:pb-0">
                    <p className="text-xs font-semibold text-foreground">{item.device}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.steps}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-start gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-600 dark:text-blue-400">
                <Wifi size={13} className="flex-shrink-0 mt-0.5" />
                <span>Una vez instalada, la app funciona completamente sin conexión a internet. El service worker cachea todos los recursos del sistema.</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Database size={16} className="text-primary" />Gestión de datos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                {[
                  { label: "Almacenamiento", value: "localStorage del navegador", icon: "💾" },
                  { label: "Persistencia", value: "Automática al modificar datos", icon: "🔄" },
                  { label: "Capacidad", value: "~5-10 MB según navegador", icon: "📦" },
                  { label: "Respaldo manual", value: "Configuración → Datos → Exportar JSON", icon: "⬇️" },
                  { label: "Restaurar fábrica", value: "Configuración → Datos → Restablecer", icon: "🔁" },
                  { label: "Compatibilidad", value: "Chrome, Safari, Firefox, Edge", icon: "🌐" },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-1 border-b border-border last:border-0">
                    <span className="text-muted-foreground flex items-center gap-2"><span>{item.icon}</span>{item.label}</span>
                    <span className="text-xs text-foreground text-right max-w-[140px]">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-600 dark:text-amber-400">
                <span className="text-base leading-none">⚠️</span>
                <span>Limpiar caché o datos del sitio en el navegador borrará todos los datos. Haz respaldos periódicos.</span>
              </div>
              <Button variant="outline" size="sm" className="w-full gap-2 text-xs" onClick={() => window.open('/configuracion', '_self')}>
                <Download size={12} />
                Ir a Configuración → Exportar datos
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Zap size={16} className="text-primary" />Especificaciones técnicas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                {[
                  { cat: "Frontend", items: ["React 18", "Vite + TypeScript", "Tailwind CSS v4", "shadcn/ui"] },
                  { cat: "Gráficos", items: ["Recharts", "BarChart, AreaChart, PieChart", "Sliders interactivos", "Tablas responsivas"] },
                  { cat: "PWA", items: ["Service Worker", "Web App Manifest", "Caché offline", "Instalable"] },
                  { cat: "Datos", items: ["localStorage", "React Context", "Seed data", "Sin backend necesario"] },
                ].map(sec => (
                  <div key={sec.cat}>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{sec.cat}</p>
                    <ul className="space-y-1">
                      {sec.items.map(item => (
                        <li key={item} className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
