import { useState, useEffect, useRef } from "react";
import {
  MessageCircle, Send, Search, Users, Phone, ChevronRight,
  CheckCheck, Circle, AlertCircle, Wifi, WifiOff, X,
} from "lucide-react";
import { useAuth, CIVAC_STAFF_IDS } from "@/lib/auth";

/* ── Types ──────────────────────────────────────────────────────────────── */
export interface ChatMessage {
  id: string;
  fromId: string;
  fromNombre: string;
  fromRole: string;
  text: string;
  ts: number;
  read: boolean;
  threadId: string;   // id del usuario cliente (no-staff)
  attachedFile?: string;
}

const STORAGE_KEY = "civac_chat_messages_v1";
const WA_KEY      = "civac_whatsapp_number";

function loadMessages(): ChatMessage[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveMessages(msgs: ChatMessage[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs)); } catch {}
}

/* ── Thread list item ────────────────────────────────────────────────────── */
function ThreadItem({
  threadId, nombre, lastMsg, unread, active, onClick,
}: {
  threadId: string; nombre: string; lastMsg: ChatMessage | null;
  unread: number; active: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="w-full text-left px-3 py-3 flex items-center gap-3 transition-all"
      style={{
        background: active ? "rgba(0,245,212,0.07)" : "transparent",
        borderLeft: active ? "3px solid #00f5d4" : "3px solid transparent",
      }}>
      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-black text-sm"
        style={{ background: active ? "rgba(0,245,212,0.15)" : "rgba(255,255,255,0.06)", color: active ? "#00f5d4" : "rgba(255,255,255,0.5)" }}>
        {nombre?.[0]?.toUpperCase() ?? "?"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-white truncate">{nombre}</p>
        <p className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.35)" }}>
          {lastMsg ? lastMsg.text : "Sin mensajes aún"}
        </p>
      </div>
      {unread > 0 && (
        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0"
          style={{ background: "#00f5d4", color: "#020d1a" }}>
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </button>
  );
}

/* ── Message bubble ──────────────────────────────────────────────────────── */
function Bubble({ msg, isMe }: { msg: ChatMessage; isMe: boolean }) {
  const isStaff = CIVAC_STAFF_IDS.includes(msg.fromRole) || msg.fromRole === "superadmin" || msg.fromRole === "admin" || msg.fromRole === "developer" || msg.fromRole === "sales";
  const time = new Date(msg.ts).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2`}>
      {!isMe && (
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mr-2 mt-1"
          style={{ background: isStaff ? "rgba(0,245,212,0.15)" : "rgba(57,255,126,0.12)", color: isStaff ? "#00f5d4" : "#39ff7e" }}>
          {msg.fromNombre?.[0]?.toUpperCase() ?? "?"}
        </div>
      )}
      <div className="max-w-[75%]">
        {!isMe && (
          <p className="text-[9px] font-bold mb-0.5 px-1"
            style={{ color: isStaff ? "#00f5d4" : "rgba(255,255,255,0.35)" }}>
            {isStaff ? `${msg.fromNombre} · CIVAC` : msg.fromNombre}
          </p>
        )}
        <div className="px-3 py-2 rounded-2xl text-xs"
          style={isMe ? {
            background: "linear-gradient(135deg,rgba(0,245,212,0.18),rgba(0,200,255,0.12))",
            border: "1px solid rgba(0,245,212,0.3)",
            color: "white",
            borderBottomRightRadius: 4,
          } : {
            background: isStaff ? "rgba(0,245,212,0.07)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${isStaff ? "rgba(0,245,212,0.2)" : "rgba(255,255,255,0.08)"}`,
            color: "rgba(255,255,255,0.85)",
            borderBottomLeftRadius: 4,
          }}>
          {msg.text}
        </div>
        <p className="text-[8px] mt-0.5 px-1" style={{ color: "rgba(255,255,255,0.2)", textAlign: isMe ? "right" : "left" }}>
          {time} {isMe && <CheckCheck size={9} className="inline" style={{ color: msg.read ? "#00f5d4" : "rgba(255,255,255,0.3)" }}/>}
        </p>
      </div>
    </div>
  );
}

/* ── Main Chat Page ──────────────────────────────────────────────────────── */
export default function ChatPage() {
  const { user, accounts } = useAuth();
  const [msgs, setMsgs]     = useState<ChatMessage[]>(loadMessages);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [input, setInput]   = useState("");
  const [search, setSearch] = useState("");
  const [online, setOnline] = useState(navigator.onLine);
  const [showWa, setShowWa] = useState(false);
  const bottomRef           = useRef<HTMLDivElement>(null);

  const isStaff = user ? CIVAC_STAFF_IDS.includes(user.id) : false;
  const myThreadId = isStaff ? activeThread : (user?.id ?? null);

  const whatsapp = localStorage.getItem(WA_KEY) || "3187351262";

  /* Online status */
  useEffect(() => {
    const on  = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  /* Poll messages every 2s */
  useEffect(() => {
    const id = setInterval(() => setMsgs(loadMessages()), 2000);
    return () => clearInterval(id);
  }, []);

  /* Scroll to bottom on new messages */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, activeThread]);

  /* Mark thread as read */
  useEffect(() => {
    if (!myThreadId) return;
    const updated = loadMessages().map(m =>
      m.threadId === myThreadId && m.fromId !== user?.id ? { ...m, read: true } : m
    );
    saveMessages(updated);
    setMsgs(updated);
  }, [activeThread, myThreadId, user?.id]);

  /* Non-staff auto-join their own thread */
  useEffect(() => {
    if (!isStaff && user) setActiveThread(user.id);
  }, [isStaff, user]);

  const sendMessage = () => {
    if (!input.trim() || !user) return;
    const threadId = isStaff ? (activeThread ?? "") : user.id;
    if (!threadId) return;
    const msg: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      fromId: user.id,
      fromNombre: user.nombre,
      fromRole: user.role,
      text: input.trim(),
      ts: Date.now(),
      read: false,
      threadId,
    };
    const updated = [...loadMessages(), msg];
    saveMessages(updated);
    setMsgs(updated);
    setInput("");
  };

  /* Thread list for staff */
  const nonStaffAccounts = accounts.filter(a => !CIVAC_STAFF_IDS.includes(a.id));
  const filteredAccounts = nonStaffAccounts.filter(a =>
    !search || a.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const threadMessages = msgs.filter(m => m.threadId === myThreadId);
  const unreadForThread = (tid: string) => msgs.filter(m => m.threadId === tid && !m.read && m.fromId !== user?.id).length;
  const lastMsgForThread = (tid: string) => {
    const threadMsgs = msgs.filter(m => m.threadId === tid);
    return threadMsgs[threadMsgs.length - 1] ?? null;
  };

  const activeAccount = activeThread ? accounts.find(a => a.id === activeThread) : null;

  if (!user) return null;

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-120px)]" style={{ fontFamily: "'Space Grotesk','Sora',sans-serif" }}>
      {/* ── Header ── */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,rgba(0,245,212,0.2),rgba(0,200,255,0.1))", border: "1px solid rgba(0,245,212,0.3)", boxShadow: "0 0 20px rgba(0,245,212,0.15)" }}>
              <MessageCircle size={18} style={{ color: "#00f5d4" }} />
            </div>
            <div>
              <h1 className="text-lg font-black text-white flex items-center gap-2">
                Canal CIVAC
                <span className={`w-2 h-2 rounded-full ${online ? "animate-pulse" : ""}`}
                  style={{ background: online ? "#39ff7e" : "#f87171", boxShadow: online ? "0 0 8px rgba(57,255,126,0.9)" : "none" }}/>
              </h1>
              <p className="text-[10px]" style={{ color: "rgba(0,245,212,0.5)" }}>
                {online ? "Chat interno en línea" : "Modo offline — mensajes se guardan localmente"}
              </p>
            </div>
          </div>
          {/* WhatsApp button */}
          <button onClick={() => setShowWa(!showWa)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all"
            style={{ background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.3)", color: "#25D366" }}>
            <Phone size={13}/> WhatsApp
          </button>
        </div>

        {/* WhatsApp panel */}
        {showWa && (
          <div className="mt-3 p-4 rounded-2xl relative" style={{ background: "rgba(37,211,102,0.05)", border: "1px solid rgba(37,211,102,0.2)" }}>
            <button onClick={() => setShowWa(false)} className="absolute top-2 right-2 text-white/30 hover:text-white/60"><X size={14}/></button>
            <p className="text-xs font-bold text-white mb-2 flex items-center gap-2"><Phone size={12} style={{ color: "#25D366" }}/> Contactar a CIVAC por WhatsApp</p>
            <p className="text-[10px] mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>
              Número: <strong style={{ color: "#25D366" }}>+57 {whatsapp}</strong><br/>
              Horario: Lun–Vie 8am–6pm · Sáb 9am–1pm
            </p>
            <a href={`https://wa.me/57${whatsapp}?text=${encodeURIComponent("Hola CIVAC, soy " + user.nombre + " y necesito ayuda con mi cuenta de ganadería.")}`}
              target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-sm w-full"
              style={{ background: "linear-gradient(135deg,#25D366,#128C7E)", color: "white" }}>
              <Phone size={14}/> Abrir WhatsApp
            </a>
          </div>
        )}
      </div>

      {/* ── Main area ── */}
      <div className="flex flex-1 gap-3 px-4 pb-4 min-h-0">

        {/* Thread list (only staff) */}
        {isStaff && (
          <div className="w-64 flex-shrink-0 rounded-2xl flex flex-col overflow-hidden"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="px-3 pt-3 pb-2 flex-shrink-0">
              <div className="relative">
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar usuario…"
                  className="w-full pl-7 pr-3 py-2 rounded-xl text-[11px] text-white"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", outline: "none" }}/>
                <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-white/25"/>
              </div>
            </div>
            <p className="text-[8px] uppercase font-black tracking-widest px-3 pb-1" style={{ color: "rgba(0,245,212,0.35)" }}>
              Conversaciones ({filteredAccounts.length})
            </p>
            <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
              {filteredAccounts.length === 0 && (
                <p className="text-center py-8 text-[10px] text-white/25">Sin usuarios clientes</p>
              )}
              {filteredAccounts.map(acc => (
                <ThreadItem key={acc.id}
                  threadId={acc.id}
                  nombre={acc.nombre}
                  lastMsg={lastMsgForThread(acc.id)}
                  unread={unreadForThread(acc.id)}
                  active={activeThread === acc.id}
                  onClick={() => setActiveThread(acc.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Chat window */}
        <div className="flex-1 rounded-2xl flex flex-col min-h-0 overflow-hidden"
          style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.07)" }}>

          {/* Thread header */}
          {myThreadId ? (
            <>
              <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(0,245,212,0.03)" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                  style={{ background: "rgba(0,245,212,0.12)", color: "#00f5d4" }}>
                  {isStaff ? (activeAccount?.nombre?.[0] ?? "U") : (user.nombre?.[0] ?? "U")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-white">
                    {isStaff ? (activeAccount?.nombre ?? "Cliente") : "Soporte CIVAC"}
                  </p>
                  <p className="text-[9px]" style={{ color: "rgba(0,245,212,0.4)" }}>
                    {isStaff ? (activeAccount?.email ?? "") : "Javier · Lizet · Equipo CIVAC"}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[9px]" style={{ color: online ? "#39ff7e" : "#f87171" }}>
                  {online ? <Wifi size={11}/> : <WifiOff size={11}/>}
                  {online ? "En línea" : "Offline"}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {threadMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ background: "rgba(0,245,212,0.05)", border: "1px solid rgba(0,245,212,0.1)" }}>
                      <MessageCircle size={22} style={{ color: "rgba(0,245,212,0.3)" }}/>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white/40">No hay mensajes aún</p>
                      <p className="text-[9px] text-white/25 mt-0.5">Envía el primer mensaje al soporte CIVAC</p>
                    </div>
                  </div>
                )}
                {threadMessages.map(msg => (
                  <Bubble key={msg.id} msg={msg} isMe={msg.fromId === user.id} />
                ))}
                <div ref={bottomRef}/>
              </div>

              {/* Input */}
              <div className="flex-shrink-0 p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                {!online && (
                  <div className="flex items-center gap-1.5 text-[9px] mb-2 px-2" style={{ color: "#fbbf24" }}>
                    <AlertCircle size={10}/> Modo offline: mensaje se guardará y enviará al reconectar
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                    placeholder={isStaff ? `Responder a ${activeAccount?.nombre ?? "cliente"}…` : "Escribe tu mensaje al soporte CIVAC…"}
                    className="flex-1 px-3 py-2.5 rounded-xl text-xs text-white resize-none"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", outline: "none" }}
                  />
                  <button onClick={sendMessage} disabled={!input.trim()}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
                    style={{
                      background: input.trim() ? "linear-gradient(135deg,#00f5d4,#00c8ff)" : "rgba(255,255,255,0.04)",
                      color: input.trim() ? "#020d1a" : "rgba(255,255,255,0.2)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}>
                    <Send size={14}/>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Staff: no thread selected */
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(0,245,212,0.05)", border: "1px solid rgba(0,245,212,0.1)" }}>
                <Users size={24} style={{ color: "rgba(0,245,212,0.3)" }}/>
              </div>
              <div>
                <p className="text-sm font-bold text-white/40">Selecciona una conversación</p>
                <p className="text-[10px] text-white/25 mt-1">
                  Elige un usuario de la lista para ver su canal de chat
                </p>
              </div>
              <div className="flex items-center gap-2 text-[9px] px-3 py-2 rounded-xl"
                style={{ background: "rgba(0,245,212,0.04)", border: "1px solid rgba(0,245,212,0.1)", color: "rgba(0,245,212,0.4)" }}>
                <ChevronRight size={10}/> {nonStaffAccounts.length} usuarios cliente registrados
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Online status bar */}
      {!online && (
        <div className="flex-shrink-0 mx-4 mb-4 px-4 py-2 rounded-xl flex items-center gap-2 text-xs"
          style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.2)", color: "#fbbf24" }}>
          <WifiOff size={12}/> Sin conexión — los mensajes se guardan localmente y se envían al reconectar automáticamente
        </div>
      )}
    </div>
  );
}
