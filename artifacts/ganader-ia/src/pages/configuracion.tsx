import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, MapPin, Bell, Palette, Shield, Database, Save, RotateCcw, Sun, Moon, Monitor, Trash2, Download, Upload, CheckCircle, AlertTriangle, FileJson, RefreshCw, Printer, FileText, AlignLeft, Hash, ToggleLeft, ToggleRight, Sliders, Phone } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useAppState } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { exportFullBackup, readBackupFile, applyBackupToLocalStorage, getStorageStats, formatBytes, getTotalStorageBytes, getTotalRecords } from "@/lib/export";

const WA_KEY = "civac_whatsapp_number";

const tabs = ["Finca", "Apariencia", "Notificaciones", "Impresora", "Seguridad", "Datos"];

const PAPER_SIZES = [
  { id: "thermal58",  label: "Térmica 58 mm",  width: "220px", desc: "Miniprinter de bolsillo" },
  { id: "thermal80",  label: "Térmica 80 mm",  width: "300px", desc: "Impresoras POS estándar" },
  { id: "a4",         label: "A4 (210×297 mm)", width: "100%",  desc: "Impresora de oficina" },
  { id: "letter",     label: "Carta (216×279 mm)", width: "100%", desc: "Carta US" },
];

function loadPrinterConfig() {
  try { return JSON.parse(localStorage.getItem("ganader_printer_config") || "{}"); } catch { return {}; }
}

export default function Configuracion() {
  const [activeTab, setActiveTab] = useState("Finca");
  const [saved, setSaved] = useState(false);
  const [finca, setFinca] = useState({
    nombre: "Finca El Rancho Verde",
    propietario: "Administrador General",
    municipio: "Zipaquirá",
    departamento: "Cundinamarca",
    hectareas: "120",
    nit: "900.123.456-7",
    telefono: "+57 300 123 4567",
    email: "finca@ganader.ia",
  });
  const [whatsappNum, setWhatsappNum] = useState(() => localStorage.getItem(WA_KEY) || "3187351262");
  const saveWhatsapp = () => { localStorage.setItem(WA_KEY, whatsappNum.replace(/\D/g, "")); setSaved(true); setTimeout(() => setSaved(false), 2200); };

  const [notifs, setNotifs] = useState({
    alertasStock: true,
    recordatoriosPartos: true,
    rotacionPotreros: true,
    vacunaciones: true,
    reporteSemanal: false,
    emailNotifs: false,
  });

  const _saved = loadPrinterConfig();
  const [printer, setPrinter] = useState({
    paperSize:   (_saved.paperSize   || "thermal80") as string,
    printerName: (_saved.printerName || "") as string,
    copies:      (_saved.copies      || "1") as string,
    headerLine1: (_saved.headerLine1 || "") as string,
    headerLine2: (_saved.headerLine2 || "Ganadería Inteligente · Colombia") as string,
    footerText:  (_saved.footerText  || "Sistema GanaderIA PRO · Recibo oficial") as string,
    marginTop:   (_saved.marginTop   || "8") as string,
    marginSide:  (_saved.marginSide  || "10") as string,
    autoPrint:   (_saved.autoPrint   !== undefined ? _saved.autoPrint : true) as boolean,
    showIA:      (_saved.showIA      !== undefined ? _saved.showIA   : true) as boolean,
    showFoto:    (_saved.showFoto    !== undefined ? _saved.showFoto : true) as boolean,
    showFirma:   (_saved.showFirma   !== undefined ? _saved.showFirma: true) as boolean,
    showValor:   (_saved.showValor   !== undefined ? _saved.showValor: true) as boolean,
    showReg:     (_saved.showReg     !== undefined ? _saved.showReg  : true) as boolean,
  });

  const { theme, setTheme } = useTheme();
  const state = useAppState();
  const { resetAll } = state;
  const { user, logout } = useAuth();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSave = () => {
    try {
      localStorage.setItem('ganader_finca', JSON.stringify(finca));
      localStorage.setItem('ganader_notifs', JSON.stringify(notifs));
      localStorage.setItem('ganader_printer_config', JSON.stringify(printer));
    } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    resetAll();
    setShowResetConfirm(false);
  };

  const importRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const handleExport = () => {
    const { animals, potreros, insumos, personal, reproduccion, alertas, pesajes, gpsUbicaciones, lotes, semen, embriones } = state;
    exportFullBackup(
      { animals, potreros, insumos, personal, reproduccion, alertas, pesajes, gps: gpsUbicaciones, lotes, semen, embriones } as Record<string, unknown[]>,
      user?.nombre
    );
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportMsg(null);
    try {
      const backup = await readBackupFile(file);
      applyBackupToLocalStorage(backup);
      setImportMsg({ ok: true, text: 'Backup restaurado. Recargando…' });
      setTimeout(() => window.location.reload(), 1800);
    } catch (err: unknown) {
      setImportMsg({ ok: false, text: String((err as Error).message || 'Error') });
      setImporting(false);
    }
    if (importRef.current) importRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#1a1a3a] via-[#2a1a4a] to-[#1a1040] p-6 text-white relative overflow-hidden">
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10">
          <Settings className="w-32 h-32" />
        </div>
        <div className="flex items-center justify-between relative">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Settings size={20} className="text-indigo-300" />
              <Badge className="bg-indigo-500/30 text-indigo-200 border-indigo-400/30 text-xs">Sistema v2.0</Badge>
            </div>
            <h1 className="text-2xl font-bold mb-1">Configuración</h1>
            <p className="text-indigo-200/70 text-sm">Finca · Apariencia · Notificaciones · Seguridad · Datos</p>
          </div>
          <Button
            onClick={handleSave}
            className="bg-white/15 hover:bg-white/25 border border-white/20 text-white gap-2"
          >
            {saved ? <CheckCircle size={15} className="text-green-300" /> : <Save size={15} />}
            {saved ? "Guardado" : "Guardar cambios"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Finca ── */}
      {activeTab === "Finca" && (
        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><MapPin size={16} className="text-primary" />Datos de la Finca</CardTitle>
              <CardDescription>Información principal registrada en el sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Nombre de la finca", key: "nombre" },
                { label: "Propietario / Admin", key: "propietario" },
                { label: "Municipio", key: "municipio" },
                { label: "Departamento", key: "departamento" },
                { label: "Hectáreas totales", key: "hectareas" },
                { label: "NIT / Razón social", key: "nit" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <Label className="text-xs text-muted-foreground">{label}</Label>
                  <Input
                    value={finca[key as keyof typeof finca]}
                    onChange={e => setFinca(p => ({ ...p, [key]: e.target.value }))}
                    className="mt-1 bg-background border-border h-9 text-sm"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Bell size={16} className="text-primary" />Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Teléfono de contacto", key: "telefono" },
                { label: "Email de la finca", key: "email" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <Label className="text-xs text-muted-foreground">{label}</Label>
                  <Input
                    value={finca[key as keyof typeof finca]}
                    onChange={e => setFinca(p => ({ ...p, [key]: e.target.value }))}
                    className="mt-1 bg-background border-border h-9 text-sm"
                  />
                </div>
              ))}

              {/* WhatsApp CIVAC — configurable por admin */}
              <div className="pt-2 border-t border-border">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Phone size={11} className="text-green-400"/> Número WhatsApp CIVAC (soporte y chat)
                </Label>
                <div className="flex gap-2 mt-1">
                  <div className="flex items-center px-2 rounded-l-lg border border-r-0 border-border bg-muted/40 text-xs text-muted-foreground">+57</div>
                  <Input
                    value={whatsappNum}
                    onChange={e => setWhatsappNum(e.target.value)}
                    placeholder="3187351262"
                    className="flex-1 bg-background border-border h-9 text-sm rounded-l-none"
                  />
                  <Button size="sm" onClick={saveWhatsapp} className="h-9 px-3 text-xs bg-green-600 hover:bg-green-700 text-white gap-1.5">
                    <Phone size={11}/> Guardar
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Este número aparece en el canal de chat y en el botón flotante de WhatsApp de toda la app.
                </p>
              </div>

              <div className="pt-3 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Resumen</p>
                <div className="space-y-2 text-sm">
                  {[
                    ["Sistema", "GanaderIA v2.0"],
                    ["Base de datos", "LocalStorage + IndexedDB"],
                    ["Modo", "PWA instalable"],
                    ["Última sincronización", "Hoy, ahora"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="text-foreground text-xs">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Apariencia ── */}
      {activeTab === "Apariencia" && (
        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Palette size={16} className="text-primary" />Tema de la interfaz</CardTitle>
              <CardDescription>Elige entre modo oscuro y claro</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'dark', label: 'Oscuro', icon: Moon, desc: 'Ideal para fincas y trabajo nocturno' },
                  { id: 'light', label: 'Claro', icon: Sun, desc: 'Mejor visibilidad con luz solar' },
                  { id: 'system', label: 'Sistema', icon: Monitor, desc: 'Sigue la preferencia del dispositivo' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => opt.id !== 'system' && setTheme(opt.id as 'dark' | 'light')}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      (opt.id === 'system' ? false : theme === opt.id)
                        ? 'border-primary bg-primary/10'
                        : opt.id === 'system'
                        ? 'border-border bg-muted/20 opacity-50 cursor-not-allowed'
                        : 'border-border hover:border-primary/50 cursor-pointer'
                    }`}
                  >
                    <opt.icon size={20} className={`mx-auto mb-2 ${theme === opt.id ? 'text-primary' : 'text-muted-foreground'}`} />
                    <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{opt.desc}</p>
                  </button>
                ))}
              </div>

              <div className="bg-muted/40 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vista previa actual</p>
                <div className={`rounded-lg p-3 border ${theme === 'dark' ? 'bg-[#111714] border-[#1e3a2a] text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                  <p className="text-sm font-semibold">Panel GanaderIA</p>
                  <p className={`text-xs mt-0.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Modo {theme === 'dark' ? 'oscuro activo' : 'claro activo'}</p>
                  <div className="flex gap-2 mt-2">
                    <div className="h-1.5 w-12 rounded bg-emerald-500" />
                    <div className={`h-1.5 w-8 rounded ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Preferencias de visualización</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Sidebar compacto", desc: "Íconos sin texto en el menú lateral" },
                { label: "Animaciones reducidas", desc: "Para dispositivos de bajo rendimiento" },
                { label: "Tablas densas", desc: "Más filas visibles por pantalla" },
                { label: "Números grandes en KPIs", desc: "Tamaño mayor para los indicadores" },
              ].map((opt, i) => (
                <div key={i} className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-sm font-medium text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                  </div>
                  <Switch disabled />
                </div>
              ))}
              <p className="text-xs text-muted-foreground/60 pt-2">Estas opciones estarán disponibles próximamente</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Notificaciones ── */}
      {activeTab === "Notificaciones" && (
        <Card className="border-border max-w-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Bell size={16} className="text-primary" />Alertas del sistema</CardTitle>
            <CardDescription>Controla qué notificaciones deseas recibir dentro de la app</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "alertasStock", label: "Stock bajo de insumos", desc: "Cuando el inventario cae por debajo del mínimo", icon: "⚠️" },
              { key: "recordatoriosPartos", label: "Recordatorios de partos", desc: "Alertas 7 y 3 días antes del parto estimado", icon: "🐄" },
              { key: "rotacionPotreros", label: "Rotación de potreros", desc: "Cuando un potrero supera los días de ocupación", icon: "🌿" },
              { key: "vacunaciones", label: "Calendario de vacunaciones", desc: "Recordatorios del plan sanitario", icon: "💉" },
              { key: "reporteSemanal", label: "Reporte semanal", desc: "Resumen automático los lunes en la mañana", icon: "📊" },
              { key: "emailNotifs", label: "Notificaciones por email", desc: "Enviar copia al email de la finca (próxima versión)", icon: "📧" },
            ].map(({ key, label, desc, icon }) => (
              <div key={key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">{icon}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
                <Switch
                  checked={notifs[key as keyof typeof notifs]}
                  onCheckedChange={v => setNotifs(p => ({ ...p, [key]: v }))}
                  disabled={key === 'emailNotifs'}
                />
              </div>
            ))}

            <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 mt-2">
              <Save size={14} />
              {saved ? "¡Guardado!" : "Guardar preferencias"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Impresora ── */}
      {activeTab === "Impresora" && (
        <div className="space-y-4 max-w-3xl">
          {/* Paper size selector */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Printer size={16} className="text-primary" />Tamaño de papel</CardTitle>
              <CardDescription>Selecciona el tipo de impresora y papel que usas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {PAPER_SIZES.map(ps => (
                  <button key={ps.id} onClick={() => setPrinter(p => ({ ...p, paperSize: ps.id }))}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${printer.paperSize === ps.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
                    <div className="font-bold text-sm text-foreground">{ps.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{ps.desc}</div>
                    <div className="text-[10px] text-primary/60 mt-1 font-mono">{ps.width}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-4">
            {/* Printer identification */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Sliders size={16} className="text-primary" />Parámetros del recibo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Nombre de la impresora / puerto</Label>
                  <Input value={printer.printerName}
                    onChange={e => setPrinter(p => ({ ...p, printerName: e.target.value }))}
                    placeholder="Ej: POS-80, Zebra ZD220, COM3"
                    className="mt-1 bg-background border-border h-9 text-sm" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Encabezado línea 1 (nombre finca)</Label>
                  <Input value={printer.headerLine1 || finca.nombre}
                    onChange={e => setPrinter(p => ({ ...p, headerLine1: e.target.value }))}
                    placeholder={finca.nombre || "Nombre de la finca"}
                    className="mt-1 bg-background border-border h-9 text-sm" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Encabezado línea 2</Label>
                  <Input value={printer.headerLine2}
                    onChange={e => setPrinter(p => ({ ...p, headerLine2: e.target.value }))}
                    className="mt-1 bg-background border-border h-9 text-sm" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Texto de pie de página</Label>
                  <Input value={printer.footerText}
                    onChange={e => setPrinter(p => ({ ...p, footerText: e.target.value }))}
                    className="mt-1 bg-background border-border h-9 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Margen superior (mm)</Label>
                    <Input type="number" min="0" max="30" value={printer.marginTop}
                      onChange={e => setPrinter(p => ({ ...p, marginTop: e.target.value }))}
                      className="mt-1 bg-background border-border h-9 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Margen lateral (mm)</Label>
                    <Input type="number" min="0" max="30" value={printer.marginSide}
                      onChange={e => setPrinter(p => ({ ...p, marginSide: e.target.value }))}
                      className="mt-1 bg-background border-border h-9 text-sm" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Copias por pesaje</Label>
                  <Input type="number" min="1" max="5" value={printer.copies}
                    onChange={e => setPrinter(p => ({ ...p, copies: e.target.value }))}
                    className="mt-1 bg-background border-border h-9 text-sm" />
                </div>
              </CardContent>
            </Card>

            {/* Sections and behavior */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><FileText size={16} className="text-primary" />Secciones del recibo</CardTitle>
                <CardDescription>Elige qué incluir en cada impresión</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { key: "autoPrint",  label: "Auto-imprimir al pesar",    desc: "Imprime al detectar peso estable en báscula" },
                  { key: "showFoto",   label: "Foto del animal",           desc: "Incluir imagen del animal en el recibo" },
                  { key: "showIA",     label: "Análisis IA (Score/BCS)",   desc: "Mostrar score de desarrollo y condición corporal" },
                  { key: "showValor",  label: "Valorización económica",    desc: "Precio por kg y valor total del animal" },
                  { key: "showFirma",  label: "Línea de firma",            desc: "Espacio para firma del responsable" },
                  { key: "showReg",    label: "Datos del registro",        desc: "Operador, fecha, método y dispositivo" },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    <Switch
                      checked={printer[key as keyof typeof printer] as boolean}
                      onCheckedChange={v => setPrinter(p => ({ ...p, [key]: v }))}
                    />
                  </div>
                ))}

                <div className="pt-2">
                  <Button onClick={handleSave} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                    <Save size={14} />
                    {saved ? "¡Guardado!" : "Guardar configuración de impresora"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview mini-receipt */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><AlignLeft size={16} className="text-primary" />Vista previa del recibo</CardTitle>
              <CardDescription>Cómo se verá el encabezado y pie de página</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mx-auto bg-white text-black rounded-xl overflow-hidden shadow-lg"
                style={{ maxWidth: printer.paperSize === "thermal58" ? 220 : printer.paperSize === "thermal80" ? 300 : 480, fontFamily: "'Courier New', monospace", fontSize: 11 }}>
                <div className="p-3 border-b-2 border-[#1a4a2e] text-center">
                  <div className="font-bold text-base text-[#1a4a2e]">🐄 {printer.headerLine1 || finca.nombre || "Nombre de la finca"}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{printer.headerLine2}</div>
                  <div className="font-bold text-xs mt-1 uppercase tracking-wider">Recibo de Pesaje</div>
                  <div className="text-[9px] text-gray-400">Folio #0001 · {new Date().toLocaleDateString("es-CO")}</div>
                </div>
                <div className="px-3 py-2 text-center">
                  <div className="text-3xl font-black text-[#1a4a2e] py-2">520.0 <span className="text-sm font-bold text-gray-400">kg</span></div>
                  {printer.showIA && <div className="text-[10px] bg-[#f0f0ff] border border-[#c4b5fd] rounded px-2 py-1 text-[#6d28d9] my-1">🤖 Score: 85/100 · CC 3.5 — Ideal</div>}
                  {printer.showValor && <div className="font-bold text-[#1a4a2e]">$5.720.000 COP</div>}
                </div>
                {printer.showFirma && (
                  <div className="px-3 pt-1 pb-2 border-t border-gray-200 text-[9px] text-gray-500 text-center">
                    Firma: ______________________
                  </div>
                )}
                <div className="px-3 pb-3 text-center text-[9px] text-gray-400 border-t border-gray-100">{printer.footerText}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Seguridad ── */}
      {activeTab === "Seguridad" && (
        <div className="grid lg:grid-cols-2 gap-4 max-w-3xl">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Shield size={16} className="text-primary" />Sesión activa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-muted/50 rounded-xl p-4 space-y-2 text-sm">
                {[
                  ["Dispositivo", "Navegador web"],
                  ["Ubicación", "Colombia"],
                  ["Inicio de sesión", "Hoy, " + new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })],
                  ["Duración", "Sesión activa"],
                  ["Seguridad", "LocalStorage cifrado"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="text-foreground">{v}</span>
                  </div>
                ))}
              </div>
              <Button variant="destructive" size="sm" className="w-full gap-2" onClick={logout}>
                <Shield size={13} />
                Cerrar sesión ahora
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Política de acceso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                {[
                  ["Autenticación", "LocalStorage (sin servidor)"],
                  ["Cifrado", "Datos en texto plano"],
                  ["Sesión", "Persiste al recargar"],
                  ["Cuentas", "4 perfiles predefinidos"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="text-foreground text-xs">{v}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-600 dark:text-amber-400">
                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                <span>Este sistema almacena datos localmente en el navegador. Para seguridad empresarial, use un backend dedicado.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Datos ── */}
      {activeTab === "Datos" && (() => {
        const stats = getStorageStats();
        const totalBytes = getTotalStorageBytes();
        const totalRecords = getTotalRecords({ animals: state.animals, potreros: state.potreros, insumos: state.insumos, personal: state.personal, reproduccion: state.reproduccion, alertas: state.alertas, pesajes: state.pesajes, gps: state.gpsUbicaciones, lotes: state.lotes, semen: state.semen, embriones: state.embriones });
        return (
          <div className="space-y-4 max-w-3xl">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Registros totales', val: String(totalRecords), icon: <Database size={14} /> },
                { label: 'Espacio usado', val: formatBytes(totalBytes), icon: <Download size={14} /> },
                { label: 'Módulos activos', val: `${stats.filter(s => s.hasData).length}/11`, icon: <CheckCircle size={14} /> },
              ].map(k => (
                <div key={k.label} className="rounded-xl p-3 border border-border bg-muted/20 text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">{k.icon}</div>
                  <div className="font-black text-lg text-foreground">{k.val}</div>
                  <div className="text-[10px] text-muted-foreground">{k.label}</div>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              {/* Module list */}
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2"><Database size={16} className="text-primary" />Base de datos local</CardTitle>
                  <CardDescription>Almacenamiento en este navegador</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  {stats.slice(0, 8).map(m => (
                    <div key={m.key} className="flex items-center justify-between py-1 border-b border-border last:border-0">
                      <span className="text-sm text-foreground flex items-center gap-2">{m.emoji} {m.label}</span>
                      <div className="flex items-center gap-1.5">
                        <Badge className={`text-[10px] ${m.hasData ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' : 'bg-muted text-muted-foreground'}`}>
                          {m.hasData ? formatBytes(m.bytes) : 'Semilla'}
                        </Badge>
                        <span className="text-[10px] font-bold text-muted-foreground">{m.count}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Export / Import / Reset */}
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Gestión de datos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full gap-2 justify-start border-border" onClick={handleExport}>
                    <FileJson size={14} /> Backup completo (JSON)
                  </Button>
                  <Button variant="outline" className="w-full gap-2 justify-start border-border"
                    onClick={() => importRef.current?.click()}>
                    {importing
                      ? <><RefreshCw size={14} className="animate-spin" /> Importando…</>
                      : <><Upload size={14} /> Restaurar backup (JSON)</>}
                  </Button>
                  <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />

                  {importMsg && (
                    <div className={`rounded-lg p-2.5 flex items-center gap-2 text-xs ${importMsg.ok ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                      {importMsg.ok ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                      {importMsg.text}
                    </div>
                  )}

                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Restaurar al estado inicial de demostración.</p>
                    {!showResetConfirm ? (
                      <Button variant="outline" size="sm" className="w-full gap-2 border-red-500/30 text-red-500 hover:bg-red-500/10"
                        onClick={() => setShowResetConfirm(true)}>
                        <RotateCcw size={13} /> Restablecer datos de fábrica
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-500 flex items-start gap-2">
                          <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
                          <span>¿Seguro? Todos los cambios se perderán y los datos volverán al estado demo.</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => setShowResetConfirm(false)}>Cancelar</Button>
                          <Button size="sm" className="flex-1 text-xs bg-red-600 hover:bg-red-700 text-white gap-1" onClick={handleReset}>
                            <Trash2 size={11} /> Confirmar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
