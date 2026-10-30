import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import {
  Cloud, CloudOff, Upload, Download, Trash2, RefreshCw,
  HardDrive, FileJson, FolderOpen, CheckCircle2, AlertTriangle,
  Link2, Link2Off, Clock, Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  isGoogleConfigured, GOOGLE_CLIENT_ID,
  initGisTokenClient, revokeGisToken,
  getDriveToken, isDriveConnected, clearDriveToken,
  driveListFiles, driveUpload, driveDownload, driveDelete,
  type DriveFile,
} from "@/lib/google";
import { exportFullBackup, buildFullBackup } from "@/lib/export";
import { useAppState } from "@/lib/data";

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" }); }
  catch { return iso; }
}
function fmtBytes(b?: string) {
  const n = parseInt(b ?? "0");
  if (n < 1024) return `${n} B`;
  if (n < 1024*1024) return `${(n/1024).toFixed(1)} KB`;
  return `${(n/1024/1024).toFixed(2)} MB`;
}

export default function Drive() {
  const { user } = useAuth();
  const state = useAppState();

  const [connected, setConnected] = useState(isDriveConnected());
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState<string|null>(null);
  const [deleting, setDeleting]     = useState<string|null>(null);
  const [msg, setMsg] = useState<{type:"ok"|"error"; text:string}|null>(null);
  const [lastSync, setLastSync] = useState<string|null>(
    localStorage.getItem("civac_drive_last_sync")
  );

  const showMsg = (type:"ok"|"error", text:string) => {
    setMsg({type,text}); setTimeout(() => setMsg(null), 4000);
  };

  const loadFiles = useCallback(async () => {
    const token = getDriveToken();
    if (!token) return;
    setLoading(true);
    try {
      const list = await driveListFiles(token);
      setFiles(list);
    } catch (e) {
      showMsg("error", `Error listando archivos: ${String(e)}`);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (connected) loadFiles(); }, [connected, loadFiles]);

  const handleConnect = () => {
    if (!isGoogleConfigured()) {
      showMsg("error", "VITE_GOOGLE_CLIENT_ID no configurado. Añade la variable de entorno.");
      return;
    }
    initGisTokenClient(
      (token) => {
        void token;
        setConnected(true);
        showMsg("ok", "Conectado a Google Drive ✓");
      },
      (err) => showMsg("error", `Error Google OAuth: ${err}`),
    );
  };

  const handleDisconnect = () => {
    const token = getDriveToken();
    if (token) revokeGisToken(token);
    clearDriveToken();
    setConnected(false);
    setFiles([]);
    showMsg("ok", "Desconectado de Google Drive.");
  };

  const handleUpload = async () => {
    const token = getDriveToken();
    if (!token) return;
    setUploading(true);
    try {
      const stateMap: Record<string,unknown[]> = {
        animals: state.animals, potreros: state.potreros, insumos: state.insumos,
        personal: state.personal, reproduccion: state.reproduccion,
        alertas: state.alertas, pesajes: state.pesajes,
        gps: state.gpsUbicaciones, lotes: state.lotes,
        semen: state.semen, embriones: state.embriones,
      };
      const backup = buildFullBackup(stateMap as Record<string,unknown[]>, user?.nombre);
      const content = JSON.stringify(backup, null, 2);
      const now = new Date().toISOString().slice(0,19).replace("T","_").replace(/:/g,"-");
      const filename = `CIVAC_Backup_${now}.json`;
      await driveUpload(token, content, filename);
      const syncTime = new Date().toISOString();
      localStorage.setItem("civac_drive_last_sync", syncTime);
      setLastSync(syncTime);
      showMsg("ok", `Backup subido: ${filename}`);
      await loadFiles();
    } catch (e) {
      showMsg("error", `Error al subir: ${String(e)}`);
    } finally { setUploading(false); }
  };

  const handleDownload = async (file: DriveFile) => {
    const token = getDriveToken();
    if (!token) return;
    setDownloading(file.id);
    try {
      const content = await driveDownload(token, file.id);
      const blob = new Blob([content], { type: "application/json" });
      const url  = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = file.name; a.click();
      URL.revokeObjectURL(url);
      showMsg("ok", `Descargado: ${file.name}`);
    } catch (e) {
      showMsg("error", `Error al descargar: ${String(e)}`);
    } finally { setDownloading(null); }
  };

  const handleDelete = async (file: DriveFile) => {
    const token = getDriveToken();
    if (!token) return;
    if (!confirm(`¿Eliminar "${file.name}" de Google Drive?`)) return;
    setDeleting(file.id);
    try {
      await driveDelete(token, file.id);
      setFiles(f => f.filter(x => x.id !== file.id));
      showMsg("ok", `Eliminado: ${file.name}`);
    } catch (e) {
      showMsg("error", `Error al eliminar: ${String(e)}`);
    } finally { setDeleting(null); }
  };

  const localBackupAndUpload = () => {
    exportFullBackup(
      { animals: state.animals, potreros: state.potreros, insumos: state.insumos } as Record<string,unknown[]>,
      user?.nombre
    );
  };
  void localBackupAndUpload;

  const configured = isGoogleConfigured();

  return (
    <div className="space-y-5 pb-8 civac-animate">

      {/* ── BANNER ─────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl p-5 relative overflow-hidden"
        style={{ background:"linear-gradient(135deg,#001428 0%,#002040 45%,#001e50 100%)", border:"1px solid rgba(0,200,255,0.28)", boxShadow:"0 0 40px rgba(0,200,255,0.07)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-8 -right-8 w-52 h-52 rounded-full opacity-20"
            style={{ background:"radial-gradient(circle,#00c8ff,transparent)" }}/>
          <div className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full opacity-10"
            style={{ background:"radial-gradient(circle,#00f5d4,transparent)" }}/>
        </div>
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-3xl"
              style={{ background:"rgba(0,200,255,0.12)", border:"1px solid rgba(0,200,255,0.38)", boxShadow:"0 0 24px rgba(0,200,255,0.2)" }}>
              ☁️
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-2xl font-black text-white" style={{ fontFamily:"Sora,sans-serif" }}>
                  Google Drive Sync
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                  style={{ background:"rgba(0,200,255,0.15)", color:"#00c8ff", border:"1px solid rgba(0,200,255,0.35)" }}>
                  {connected ? "CONECTADO" : "DESCONECTADO"}
                </span>
              </div>
              <p className="text-sm" style={{ color:"rgba(0,200,255,0.65)" }}>
                Sube y descarga backups de tu finca directamente en Google Drive
              </p>
              <div className="flex gap-4 mt-2 flex-wrap">
                {[
                  { icon:<Cloud size={9}/>,      label:"Backup automático nube",     c:"#00c8ff" },
                  { icon:<HardDrive size={9}/>,  label:"Sincronización bidireccional",c:"#00f5d4" },
                  { icon:<Database size={9}/>,   label:"Historial de versiones",      c:"#39ff7e" },
                ].map(b => (
                  <span key={b.label} className="text-[10px] flex items-center gap-1.5 font-medium" style={{ color:b.c }}>
                    {b.icon} {b.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {connected ? (
              <>
                <Button onClick={handleUpload} disabled={uploading}
                  className="h-9 gap-1.5 text-sm font-bold"
                  style={{ background:"rgba(0,200,255,0.15)", border:"1px solid rgba(0,200,255,0.4)", color:"#00c8ff" }}>
                  <Upload size={14}/> {uploading ? "Subiendo…" : "Subir Backup"}
                </Button>
                <Button onClick={loadFiles} disabled={loading}
                  className="h-9 gap-1.5 text-sm font-bold"
                  style={{ background:"rgba(0,245,212,0.1)", border:"1px solid rgba(0,245,212,0.25)", color:"#00f5d4" }}>
                  <RefreshCw size={13} className={loading?"animate-spin":""}/>
                </Button>
                <Button onClick={handleDisconnect}
                  className="h-9 gap-1.5 text-sm font-bold"
                  style={{ background:"rgba(255,77,109,0.1)", border:"1px solid rgba(255,77,109,0.25)", color:"#ff6b8a" }}>
                  <Link2Off size={13}/> Desconectar
                </Button>
              </>
            ) : (
              <Button onClick={handleConnect}
                className="h-9 gap-1.5 text-sm font-bold"
                style={{ background:"linear-gradient(135deg,#00c8ff,#0070cc)", color:"white", boxShadow:"0 0 20px rgba(0,200,255,0.3)" }}>
                <Link2 size={14}/> Conectar Drive
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── CONFIG INFO ─────────────────────────────────────────────────── */}
      {!configured && (
        <div className="rounded-2xl p-4 flex items-start gap-3"
          style={{ background:"rgba(0,200,255,0.05)", border:"1px solid rgba(0,200,255,0.12)" }}>
          <Cloud size={16} style={{ color:"rgba(0,200,255,0.5)", flexShrink:0, marginTop:2 }}/>
          <div>
            <p className="font-semibold text-sm" style={{ color:"rgba(0,200,255,0.7)" }}>Sincronización con Google Drive no activada</p>
            <p className="text-xs mt-1" style={{ color:"rgba(0,200,255,0.4)" }}>
              Puedes exportar e importar backups en formato JSON desde el <strong style={{ color:"rgba(0,200,255,0.55)" }}>Centro de Datos</strong>. Para activar la sincronización automática con Drive, configura <code className="font-mono bg-white/5 px-1 rounded">VITE_GOOGLE_CLIENT_ID</code> en las variables de entorno.
            </p>
          </div>
        </div>
      )}

      {/* ── MSG ────────────────────────────────────────────────────────────── */}
      {msg && (
        <div className="rounded-2xl px-4 py-3 flex items-center gap-2 text-sm font-medium"
          style={{
            background: msg.type==="ok" ? "rgba(34,197,94,0.08)" : "rgba(255,77,109,0.08)",
            border: msg.type==="ok" ? "1px solid rgba(34,197,94,0.25)" : "1px solid rgba(255,77,109,0.25)",
            color: msg.type==="ok" ? "#39ff7e" : "#ff6b8a",
          }}>
          {msg.type==="ok" ? <CheckCircle2 size={14}/> : <AlertTriangle size={14}/>}
          {msg.text}
        </div>
      )}

      {/* ── KPI CARDS ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon:"☁️",  label:"Estado Drive",   val: connected ? "Conectado" : "Desconectado", c: connected?"#39ff7e":"#f43f5e", sub: connected?"Google Drive activo":"Sin conexión"                         },
          { icon:"📁",  label:"Backups en Drive",val: String(files.length),                     c:"#00c8ff", sub:"Archivos CIVAC en nube"                                                                          },
          { icon:"🕐",  label:"Último Sync",     val: lastSync ? fmtDate(lastSync).split(",")[0] : "—", c:"#f59e0b", sub: lastSync ? "Sincronizado" : "Sin sincronizar"                                    },
          { icon:"💾",  label:"Config ID",       val: configured ? "Activo" : "Sin clave",      c: configured?"#00f5d4":"#94a3b8", sub: "VITE_GOOGLE_CLIENT_ID"                                             },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-4 relative overflow-hidden card-lift"
            style={{ background:"linear-gradient(135deg,#001428,#001e3c)", border:"1px solid rgba(0,200,255,0.15)" }}>
            <div className="text-2xl mb-2">{k.icon}</div>
            <div className="text-[9px] font-bold uppercase tracking-wider mb-0.5 text-white/40">{k.label}</div>
            <div className="text-lg font-black" style={{ color:k.c, fontFamily:"Sora,sans-serif" }}>{k.val}</div>
            <div className="text-[10px] mt-0.5 text-white/30">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* ── FILE LIST ──────────────────────────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid rgba(0,200,255,0.15)" }}>
        <div className="px-5 py-3 flex items-center justify-between"
          style={{ background:"linear-gradient(90deg,rgba(0,200,255,0.08),rgba(0,200,255,0.03))", borderBottom:"1px solid rgba(0,200,255,0.1)" }}>
          <div className="flex items-center gap-2">
            <FolderOpen size={15} style={{ color:"#00c8ff" }}/>
            <span className="font-bold text-sm text-white">Archivos en Google Drive</span>
            {loading && <RefreshCw size={12} className="animate-spin text-white/30"/>}
          </div>
          <span className="text-[10px] text-white/30">{files.length} archivo{files.length!==1?"s":""} CIVAC</span>
        </div>

        {!connected ? (
          <div className="px-5 py-12 text-center">
            <CloudOff size={40} className="mx-auto mb-3 text-white/15"/>
            <p className="font-bold text-white/30 text-sm">Conecta tu Google Drive para ver tus backups</p>
            <p className="text-xs mt-1 text-white/20">Haz clic en "Conectar Drive" para autorizar el acceso</p>
          </div>
        ) : files.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Cloud size={40} className="mx-auto mb-3 text-white/15"/>
            <p className="font-bold text-white/30 text-sm">No hay backups CIVAC en Drive</p>
            <p className="text-xs mt-1 text-white/20">Sube tu primer backup con el botón "Subir Backup"</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {files.map(f => (
              <div key={f.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/2 transition-colors">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                  style={{ background:"rgba(0,200,255,0.08)", border:"1px solid rgba(0,200,255,0.15)" }}>
                  <FileJson size={14} style={{ color:"#00c8ff" }}/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-white truncate">{f.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[10px] flex items-center gap-1 text-white/30">
                      <Clock size={8}/> {fmtDate(f.modifiedTime)}
                    </span>
                    {f.size && <span className="text-[10px] text-white/20">{fmtBytes(f.size)}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => handleDownload(f)} disabled={downloading===f.id}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all hover:opacity-80 disabled:opacity-40"
                    style={{ background:"rgba(0,200,255,0.1)", color:"#00c8ff", border:"1px solid rgba(0,200,255,0.2)" }}>
                    <Download size={10}/> {downloading===f.id?"…":"Descargar"}
                  </button>
                  <button onClick={() => handleDelete(f)} disabled={deleting===f.id}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all hover:opacity-80 disabled:opacity-40"
                    style={{ background:"rgba(255,77,109,0.08)", color:"#ff6b8a", border:"1px solid rgba(255,77,109,0.15)" }}>
                    <Trash2 size={10}/> {deleting===f.id?"…":"Borrar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SETUP GUIDE ────────────────────────────────────────────────────── */}
      <div className="rounded-2xl p-5" style={{ background:"linear-gradient(135deg,#0a0a1a,#0f0f2a)", border:"1px solid rgba(139,92,246,0.18)" }}>
        <div className="flex items-center gap-2 mb-4">
          <HardDrive size={15} style={{ color:"#8b5cf6" }}/>
          <span className="font-bold text-sm text-white">Cómo activar Google Drive</span>
        </div>
        <div className="space-y-3">
          {[
            { n:1, t:"Crear proyecto en Google Cloud Console", d:"console.cloud.google.com → Nuevo Proyecto" },
            { n:2, t:"Habilitar Google Drive API",             d:"APIs y Servicios → Biblioteca → Google Drive API → Habilitar" },
            { n:3, t:"Crear credenciales OAuth 2.0",           d:"Credenciales → Crear → ID de cliente OAuth → Aplicación web" },
            { n:4, t:"Añadir orígenes autorizados",            d:`Añadir tu dominio (ej. ${window.location.origin})` },
            { n:5, t:"Configurar variable de entorno",         d:"VITE_GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com" },
          ].map(s => (
            <div key={s.n} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black"
                style={{ background:"rgba(139,92,246,0.2)", color:"#8b5cf6", border:"1px solid rgba(139,92,246,0.3)" }}>
                {s.n}
              </div>
              <div>
                <p className="text-xs font-semibold text-white/80">{s.t}</p>
                <p className="text-[10px] text-white/35 mt-0.5">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
