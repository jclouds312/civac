import { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageCircle, Send, Search, Users, Phone, CheckCheck,
  Circle, Wifi, WifiOff, X, Bell, Hash, Lock, Globe,
  Smile, Paperclip, MoreVertical, Pin, Star, Reply,
  Trash2, Copy, ChevronDown, UserCheck, AlertCircle,
  Settings, Volume2, VolumeX, RefreshCw, Shield,
  MessageSquare, Zap,
} from "lucide-react";
import { useAuth, CIVAC_STAFF_IDS, PLAN_LABEL_ROLE } from "@/lib/auth";
import { loadCloudMessages, saveCloudMessage, subscribeToCloudMessages, supabase } from "@/lib/supabase";

/* ── Types ──────────────────────────────────────────────────────────────── */
export interface ChatMessage {
  id: string;
  fromId: string;
  fromNombre: string;
  fromRole: string;
  text: string;
  ts: number;
  read: boolean;
  threadId: string;
  channel?: string;
  pinned?: boolean;
  starred?: boolean;
  replyTo?: string;
  replyText?: string;
  type?: 'text' | 'notification' | 'system' | 'payment';
  paymentData?: { plan?: string; monto?: string; link?: string };
}

export interface ChatChannel {
  id: string;
  name: string;
  desc: string;
  icon: string;
  color: string;
  locked?: boolean;
  roles?: string[];
}

/* ── Constants ──────────────────────────────────────────────────────────── */
const STORAGE_KEY  = "civac_chat_messages_v1";
const WA_KEY       = "civac_whatsapp_number";
const NOTIF_KEY    = "civac_push_notifications_v1";
const PREFS_KEY    = "civac_chat_prefs";

const CHANNELS: ChatChannel[] = [
  { id: 'general',  name: 'general',      desc: 'Canal principal CIVAC', icon: '#', color: '#00f5d4', locked: false },
  { id: 'admin',    name: 'admin',         desc: 'Solo staff CIVAC',      icon: '🔒', color: '#FFD700', locked: true, roles: ['admin','superadmin','developer','sales'] },
  { id: 'campo',    name: 'campo',         desc: 'Equipo de campo y GPS',  icon: '#', color: '#39ff7e', locked: false },
  { id: 'vets',     name: 'veterinarios',  desc: 'Módulos clínicos',       icon: '#', color: '#00c8ff', locked: false },
  { id: 'pagos',    name: 'pagos',         desc: 'Notif. de planes y pagos', icon: '💳', color: '#fbbf24', locked: false },
  { id: 'soporte',  name: 'soporte',       desc: 'Soporte técnico CIVAC',  icon: '#', color: '#e879f9', locked: false },
];

const EMOJI_LIST = ['👍','❤️','😊','🎉','🐄','⚖️','📍','🌿','💰','✅','⚠️','🔥'];

/* ── Storage helpers ────────────────────────────────────────────────────── */
function loadMessages(): ChatMessage[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveMessages(msgs: ChatMessage[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
  } catch {}
}
function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(PREFS_KEY) || "{}"); } catch { return {}; }
}
function savePrefs(p: object) {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); } catch {}
}

/* ── Push notification helpers ──────────────────────────────────────────── */
function loadNotifications() {
  try { return JSON.parse(localStorage.getItem(NOTIF_KEY) || "[]"); } catch { return []; }
}
function saveNotification(n: object) {
  try {
    const all = loadNotifications();
    all.push(n);
    localStorage.setItem(NOTIF_KEY, JSON.stringify(all.slice(-50)));
  } catch {}
}

/* ── Seed demo messages ──────────────────────────────────────────────────── */
function seedDemoMessages() {
  const existing = loadMessages();
  if (existing.length > 0) return;
  const now = Date.now();
  const demos: ChatMessage[] = [
    { id: 'seed1', fromId: 'admin', fromNombre: 'Admin CIVAC', fromRole: 'admin',
      text: 'Bienvenidos al canal CIVAC PRO. Aquí encontrarán anuncios y soporte.', ts: now - 7200000,
      read: false, threadId: 'channel', channel: 'general', type: 'system' },
    { id: 'seed2', fromId: 'admin', fromNombre: 'Admin CIVAC', fromRole: 'admin',
      text: 'Recuerden que el módulo de GPS ahora tiene seguimiento en tiempo real con 13 collares activos.', ts: now - 3600000,
      read: false, threadId: 'channel', channel: 'general' },
    { id: 'seed3', fromId: 'admin', fromNombre: 'Admin CIVAC', fromRole: 'admin',
      text: 'Plan PRO activo — GPS, Pesaje BT, Reproducción y Genética habilitados.', ts: now - 1800000,
      read: false, threadId: 'channel', channel: 'pagos', type: 'notification' },
  ];
  saveMessages(demos);
}

/* ── Channel badge ──────────────────────────────────────────────────────── */
function ChannelItem({
  channel, unread, active, locked, onClick,
}: { channel: ChatChannel; unread: number; active: boolean; locked: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={locked}
      className="w-full text-left px-3 py-2 flex items-center gap-2.5 transition-all group"
      style={{
        borderRadius: 10,
        background: active ? `rgba(${channel.color === '#FFD700' ? '255,215,0' : channel.color === '#00f5d4' ? '0,245,212' : '57,255,126'},0.10)` : 'transparent',
        borderLeft: active ? `3px solid ${channel.color}` : '3px solid transparent',
        opacity: locked ? 0.45 : 1,
        cursor: locked ? 'not-allowed' : 'pointer',
      }}>
      <span className="text-xs font-bold flex-shrink-0 w-5" style={{ color: active ? channel.color : 'rgba(255,255,255,0.35)' }}>
        {channel.icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold truncate" style={{ color: active ? channel.color : 'rgba(255,255,255,0.65)' }}>
          {channel.name}
        </p>
        {!active && (
          <p className="text-[9px] truncate" style={{ color: 'rgba(255,255,255,0.25)' }}>{channel.desc}</p>
        )}
      </div>
      {locked && <Lock size={9} className="flex-shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }} />}
      {unread > 0 && !active && (
        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0"
          style={{ background: channel.color, color: '#020d1a' }}>
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </button>
  );
}

/* ── Direct Message thread item ─────────────────────────────────────────── */
function ThreadItem({
  threadId, nombre, role, lastMsg, unread, active, onClick,
}: {
  threadId: string; nombre: string; role: string;
  lastMsg: ChatMessage | null; unread: number; active: boolean; onClick: () => void;
}) {
  const tier = PLAN_LABEL_ROLE[role] || 'Basic';
  const tierColor = role === 'admin' || role === 'superadmin' ? '#FFD700'
    : role === 'developer' ? '#39ff7e'
    : role === 'vet' || role === 'field' ? '#00f5d4'
    : '#94a3b8';

  return (
    <button onClick={onClick} className="w-full text-left px-3 py-2.5 flex items-center gap-2.5 transition-all group"
      style={{
        borderRadius: 10,
        background: active ? 'rgba(0,245,212,0.07)' : 'rgba(255,255,255,0.01)',
        borderLeft: active ? '3px solid #00f5d4' : '3px solid transparent',
      }}>
      <div className="relative flex-shrink-0">
        <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm"
          style={{ background: active ? 'rgba(0,245,212,0.15)' : 'rgba(255,255,255,0.07)', color: active ? '#00f5d4' : 'rgba(255,255,255,0.5)' }}>
          {nombre?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-[#040d1a]"
          style={{ background: '#39ff7e', boxShadow: '0 0 6px rgba(57,255,126,0.8)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-[12px] font-bold text-white truncate">{nombre}</p>
          <span className="text-[8px] font-bold px-1 py-0.5 rounded-full flex-shrink-0"
            style={{ background: `${tierColor}15`, color: tierColor, border: `1px solid ${tierColor}30` }}>
            {tier}
          </span>
        </div>
        <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {lastMsg ? lastMsg.text : 'Sin mensajes aún'}
        </p>
      </div>
      {unread > 0 && (
        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0"
          style={{ background: '#00f5d4', color: '#020d1a' }}>
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </button>
  );
}

/* ── Message bubble ──────────────────────────────────────────────────────── */
function Bubble({
  msg, isMe, onReact, onReply, onPin,
}: { msg: ChatMessage; isMe: boolean; onReact: (id: string, e: string) => void; onReply: (msg: ChatMessage) => void; onPin: (id: string) => void }) {
  const [showActions, setShowActions] = useState(false);
  const isStaff = CIVAC_STAFF_IDS.includes(msg.fromId) || ['admin','superadmin','developer','sales'].includes(msg.fromRole);
  const time = new Date(msg.ts).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

  if (msg.type === 'system' || msg.type === 'notification') {
    return (
      <div className="flex justify-center my-3">
        <div className="max-w-[85%] px-4 py-2 rounded-2xl text-center"
          style={{
            background: msg.type === 'notification' ? 'rgba(255,215,0,0.08)' : 'rgba(0,245,212,0.05)',
            border: msg.type === 'notification' ? '1px solid rgba(255,215,0,0.2)' : '1px solid rgba(0,245,212,0.15)',
          }}>
          <p className="text-[10px] font-bold" style={{ color: msg.type === 'notification' ? '#FFD700' : '#00f5d4' }}>
            {msg.type === 'notification' ? '🔔 ' : 'ℹ️ '}{msg.text}
          </p>
          <p className="text-[8px] mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>{time}</p>
        </div>
      </div>
    );
  }

  if (msg.type === 'payment') {
    return (
      <div className="flex justify-center my-3">
        <div className="max-w-[90%] px-4 py-3 rounded-2xl"
          style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)' }}>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-base">💳</span>
            <p className="text-[11px] font-black" style={{ color: '#fbbf24' }}>Enlace de Pago CIVAC</p>
          </div>
          {msg.paymentData?.plan && (
            <p className="text-[10px] font-bold text-white mb-1">Plan: {msg.paymentData.plan} — {msg.paymentData.monto}</p>
          )}
          <p className="text-[10px] text-white/70 mb-2">{msg.text}</p>
          {msg.paymentData?.link && (
            <a href={msg.paymentData.link} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black"
              style={{ background: 'linear-gradient(135deg,#fbbf24,#ea580c)', color: '#020d1a' }}>
              Pagar ahora →
            </a>
          )}
          <p className="text-[8px] mt-1.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{msg.fromNombre} · {time}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1.5 group`}>
      {!isMe && (
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mr-1.5 mt-1"
          style={{ background: isStaff ? 'rgba(255,215,0,0.15)' : 'rgba(0,245,212,0.12)', color: isStaff ? '#FFD700' : '#00f5d4' }}>
          {msg.fromNombre?.[0]?.toUpperCase() ?? '?'}
        </div>
      )}
      <div className="max-w-[78%]">
        {!isMe && (
          <p className="text-[9px] font-bold mb-0.5 px-1"
            style={{ color: isStaff ? '#FFD700' : 'rgba(255,255,255,0.4)' }}>
            {isStaff ? `${msg.fromNombre} ⬡ CIVAC` : msg.fromNombre}
          </p>
        )}
        {msg.replyTo && msg.replyText && (
          <div className="mb-1 px-2 py-1 rounded-xl text-[9px] border-l-2"
            style={{ background: 'rgba(255,255,255,0.04)', borderLeftColor: '#00f5d4', color: 'rgba(255,255,255,0.45)' }}>
            {msg.replyText.slice(0, 60)}{msg.replyText.length > 60 ? '...' : ''}
          </div>
        )}
        <div
          className="relative px-3 py-2 rounded-2xl text-[11px] leading-relaxed cursor-pointer"
          style={isMe ? {
            background: 'linear-gradient(135deg,rgba(0,245,212,0.22),rgba(0,200,255,0.14))',
            border: '1px solid rgba(0,245,212,0.35)',
            borderBottomRightRadius: 4,
            color: 'white',
          } : {
            background: isStaff ? 'rgba(255,215,0,0.07)' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${isStaff ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.09)'}`,
            borderBottomLeftRadius: 4,
            color: 'rgba(255,255,255,0.88)',
          }}
          onContextMenu={e => { e.preventDefault(); setShowActions(true); }}
          onClick={() => { if (showActions) setShowActions(false); }}
        >
          {msg.text}
          {msg.pinned && (
            <span className="absolute -top-1.5 -right-1.5 text-[10px]" title="Fijado">📌</span>
          )}
        </div>
        <div className={`flex items-center gap-2 mt-0.5 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
          <p className="text-[8px]" style={{ color: 'rgba(255,255,255,0.2)' }}>{time}</p>
          {isMe && <CheckCheck size={9} style={{ color: msg.read ? '#00f5d4' : 'rgba(255,255,255,0.25)' }} />}
        </div>
        {/* Context actions */}
        <div className={`flex items-center gap-1 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? 'justify-end' : 'justify-start'}`}>
          {EMOJI_LIST.slice(0, 5).map(e => (
            <button key={e} onClick={() => onReact(msg.id, e)}
              className="text-[11px] hover:scale-110 transition-transform p-0.5 rounded"
              style={{ lineHeight: 1 }}>{e}</button>
          ))}
          <button onClick={() => onReply(msg)}
            className="p-1 rounded-lg hover:bg-white/10 transition-all"
            title="Responder">
            <Reply size={10} style={{ color: 'rgba(255,255,255,0.4)' }} />
          </button>
          <button onClick={() => onPin(msg.id)}
            className="p-1 rounded-lg hover:bg-white/10 transition-all"
            title="Fijar">
            <Pin size={10} style={{ color: msg.pinned ? '#FFD700' : 'rgba(255,255,255,0.3)' }} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Chat Page ──────────────────────────────────────────────────────── */
export default function ChatPage() {
  const { user, accounts } = useAuth();
  const [msgs, setMsgs]           = useState<ChatMessage[]>(loadMessages);
  const [view, setView]           = useState<'channels' | 'dms'>('channels');
  const [activeChannel, setActiveChannel] = useState<string>('general');
  const [activeDm, setActiveDm]   = useState<string | null>(null);
  const [input, setInput]         = useState('');
  const [search, setSearch]       = useState('');
  const [online, setOnline]       = useState(navigator.onLine);
  const [showWa, setShowWa]       = useState(false);
  const [showPush, setShowPush]   = useState(false);
  const [replyMsg, setReplyMsg]   = useState<ChatMessage | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [muted, setMuted]         = useState(() => loadPrefs().muted ?? false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pushForm, setPushForm]   = useState({ title: '', body: '', channel: 'general', type: 'text' as const });
  const bottomRef                 = useRef<HTMLDivElement>(null);
  const inputRef                  = useRef<HTMLInputElement>(null);

  const isStaff = user ? (CIVAC_STAFF_IDS.includes(user.id) || ['admin','superadmin','developer','sales'].includes(user.role)) : false;
  const whatsapp = localStorage.getItem(WA_KEY) || '3187351262';

  /* ── Sincronización persistente con Supabase ───────────────────────────── */
  useEffect(() => {
    let channel: ReturnType<typeof subscribeToCloudMessages>;
    let cancelled = false;
    void supabase?.auth.getUser().then(async ({ data }) => {
      if (!data.user || cancelled) return;
      const records = await loadCloudMessages(data.user.id);
      if (records.length) {
        const cloud = records.flatMap((record) => {
          try {
            const payload = JSON.parse(record.body) as { text: string; channel?: string; type?: ChatMessage["type"] };
            return [{ id: record.id, fromId: record.author_id, fromNombre: record.author_id === data.user.id ? (user?.nombre ?? "Yo") : "Usuario", fromRole: "user", text: payload.text, ts: new Date(record.created_at).getTime(), read: record.author_id === data.user.id, threadId: record.thread_id, channel: payload.channel, type: payload.type ?? "text" } satisfies ChatMessage];
          } catch { return []; }
        });
        if (!cancelled) setMsgs(cloud);
      }
      channel = subscribeToCloudMessages(() => { void loadCloudMessages(data.user!.id).then(() => setMsgs(loadMessages())); });
    });
    return () => { cancelled = true; if (channel && supabase) void supabase.removeChannel(channel); };
  }, [user?.nombre]);

  /* ── Online status ─────────────────────────────────────────────────────── */
  useEffect(() => {
    const on  = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  /* ── Poll + storage events ─────────────────────────────────────────────── */
  useEffect(() => {
    const poll = setInterval(() => setMsgs(loadMessages()), 2500);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setMsgs(loadMessages());
    };
    window.addEventListener('storage', onStorage);
    return () => { clearInterval(poll); window.removeEventListener('storage', onStorage); };
  }, []);

  /* ── Scroll to bottom ──────────────────────────────────────────────────── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, activeChannel, activeDm]);

  /* ── Mark read on view ─────────────────────────────────────────────────── */
  useEffect(() => {
    if (!user) return;
    const updated = loadMessages().map(m => {
      if (view === 'channels' && m.channel === activeChannel && m.fromId !== user.id)
        return { ...m, read: true };
      if (view === 'dms' && m.threadId === activeDm && m.fromId !== user.id)
        return { ...m, read: true };
      return m;
    });
    saveMessages(updated);
    setMsgs(updated);
  }, [activeChannel, activeDm, view, user]);

  /* ── Non-staff: auto DM view ───────────────────────────────────────────── */
  useEffect(() => {
    if (!isStaff && user) {
      setView('dms');
      setActiveDm(user.id);
    }
  }, [isStaff, user]);

  /* ── Send message ──────────────────────────────────────────────────────── */
  const sendMessage = useCallback(() => {
    if (!input.trim() || !user) return;
    const msg: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      fromId: user.id,
      fromNombre: user.nombre,
      fromRole: user.role,
      text: input.trim(),
      ts: Date.now(),
      read: false,
      threadId: view === 'channels' ? 'channel' : (activeDm ?? user.id),
      channel: view === 'channels' ? activeChannel : undefined,
      replyTo: replyMsg?.id,
      replyText: replyMsg?.text,
      type: 'text',
    };
    saveMessages([...loadMessages(), msg]);
    void supabase?.auth.getUser().then(({ data }) => data.user && saveCloudMessage(data.user.id, { text: msg.text, channel: msg.channel, type: msg.type, replyTo: msg.replyTo, replyText: msg.replyText }));
    setMsgs(loadMessages());
    setInput('');
    setReplyMsg(null);
  }, [input, user, view, activeChannel, activeDm, replyMsg]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  /* ── Send push notification (admin/sales only) ─────────────────────────── */
  const sendPushNotification = () => {
    if (!user || !pushForm.body.trim()) return;
    const msg: ChatMessage = {
      id: `notif-${Date.now()}`,
      fromId: user.id,
      fromNombre: user.nombre,
      fromRole: user.role,
      text: pushForm.body.trim(),
      ts: Date.now(),
      read: false,
      threadId: 'channel',
      channel: pushForm.channel,
      type: 'notification',
    };
    saveMessages([...loadMessages(), msg]);
    void supabase?.auth.getUser().then(({ data }) => data.user && saveCloudMessage(data.user.id, { text: msg.text, channel: msg.channel, type: msg.type }));
    saveNotification({ ...msg, title: pushForm.title || 'CIVAC PRO' });
    /* Try Web Push if permitted */
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(pushForm.title || 'CIVAC PRO', {
        body: pushForm.body,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
      });
    }
    setMsgs(loadMessages());
    setPushForm({ title: '', body: '', channel: 'general', type: 'text' });
    setShowPush(false);
  };

  /* ── Send payment link (admin only) ────────────────────────────────────── */
  const sendPaymentLink = (plan: string, monto: string, link: string) => {
    if (!user) return;
    const msg: ChatMessage = {
      id: `pay-${Date.now()}`,
      fromId: user.id,
      fromNombre: user.nombre,
      fromRole: user.role,
      text: `Enlace de pago para el Plan ${plan}. Haz clic en "Pagar ahora" para completar tu suscripción.`,
      ts: Date.now(),
      read: false,
      threadId: 'channel',
      channel: view === 'channels' ? activeChannel : 'pagos',
      type: 'payment',
      paymentData: { plan, monto, link },
    };
    saveMessages([...loadMessages(), msg]);
    void supabase?.auth.getUser().then(({ data }) => data.user && saveCloudMessage(data.user.id, { text: msg.text, channel: msg.channel, type: msg.type }));
    setMsgs(loadMessages());
  };

  /* ── React / pin helpers ───────────────────────────────────────────────── */
  const handleReact = (id: string, emoji: string) => {
    const updated = loadMessages().map(m => m.id === id ? { ...m, text: `${m.text} ${emoji}` } : m);
    saveMessages(updated);
    setMsgs(updated);
  };
  const handlePin = (id: string) => {
    const updated = loadMessages().map(m => m.id === id ? { ...m, pinned: !m.pinned } : m);
    saveMessages(updated);
    setMsgs(updated);
  };

  /* ── Request push permission ────────────────────────────────────────────── */
  const requestPushPerm = async () => {
    if ('Notification' in window) {
      await Notification.requestPermission();
    }
  };

  /* ── Derived data ──────────────────────────────────────────────────────── */
  const nonStaffAccounts = accounts.filter(a => !CIVAC_STAFF_IDS.includes(a.id) && !a.isTemplate);
  const filteredDmAccounts = nonStaffAccounts.filter(a =>
    !search || a.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const channelMsgs = msgs.filter(m => m.channel === activeChannel && m.threadId === 'channel');
  const dmMsgs = msgs.filter(m => m.threadId === activeDm);
  const currentMsgs = view === 'channels' ? channelMsgs : dmMsgs;

  const unreadForChannel = (chId: string) =>
    msgs.filter(m => m.channel === chId && !m.read && m.fromId !== user?.id).length;
  const unreadForDm = (tid: string) =>
    msgs.filter(m => m.threadId === tid && !m.read && m.fromId !== user?.id).length;
  const lastDmMsg = (tid: string) => {
    const t = msgs.filter(m => m.threadId === tid);
    return t[t.length - 1] ?? null;
  };

  const activeChannel_ = CHANNELS.find(c => c.id === activeChannel);
  const activeDmAccount = activeDm ? accounts.find(a => a.id === activeDm) : null;

  if (!user) return null;

  /* ── Can access locked channels? ──────────────────────────────────────── */
  const canAccessChannel = (ch: ChatChannel) => {
    if (!ch.locked) return true;
    return ch.roles ? ch.roles.includes(user.role) : isStaff;
  };

  const totalUnread = msgs.filter(m => !m.read && m.fromId !== user.id).length;

  return (
    <div className="flex h-[calc(100vh-132px)] lg:h-[calc(100vh-90px)] rounded-3xl overflow-hidden border"
      style={{ fontFamily: "'Space Grotesk','Sora',sans-serif", background: '#040d1a', borderColor: 'rgba(0,245,212,0.15)', boxShadow: '0 0 40px rgba(0,245,212,0.05)' }}>

      {/* ── Left Sidebar ────────────────────────────────────────────────── */}
      <div className={`${sidebarOpen ? 'w-[240px] sm:w-[220px]' : 'w-0'} flex-shrink-0 transition-all duration-250 overflow-hidden flex flex-col`}
        style={{ borderRight: '1px solid rgba(255,255,255,0.06)', background: 'rgba(4,10,22,0.98)' }}>

        {/* Header */}
        <div className="px-3 py-3 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,rgba(0,245,212,0.2),rgba(255,215,0,0.1))', border: '1px solid rgba(0,245,212,0.3)' }}>
                <MessageCircle size={13} style={{ color: '#00f5d4' }} />
              </div>
              <div>
                <p className="text-[11px] font-black text-white leading-none">Canal CIVAC</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${online ? 'animate-pulse' : ''}`}
                    style={{ background: online ? '#39ff7e' : '#f87171' }} />
                  <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {online ? 'En línea' : 'Sin conexión'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {totalUnread > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[8px] font-black"
                  style={{ background: '#ff4d6d', color: 'white' }}>{totalUnread}</span>
              )}
              <button onClick={() => setMuted(!muted)} title={muted ? 'Activar sonido' : 'Silenciar'}
                className="p-1 rounded-lg hover:bg-white/5 transition-all">
                {muted ? <VolumeX size={11} style={{ color: 'rgba(255,255,255,0.3)' }} /> : <Volume2 size={11} style={{ color: '#00f5d4' }} />}
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <Search size={11} style={{ color: 'rgba(255,255,255,0.3)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="flex-1 bg-transparent text-[11px] text-white placeholder-white/30 outline-none" />
          </div>
        </div>

        {/* View tabs */}
        <div className="flex p-2 gap-1 flex-shrink-0">
          {[
            { id: 'channels' as const, label: 'Canales', Icon: Hash },
            { id: 'dms' as const, label: 'Mensajes', Icon: MessageSquare },
          ].map(v => (
            <button key={v.id} onClick={() => setView(v.id)}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-[10px] font-bold transition-all"
              style={{
                background: view === v.id ? 'rgba(0,245,212,0.12)' : 'transparent',
                color: view === v.id ? '#00f5d4' : 'rgba(255,255,255,0.35)',
                border: view === v.id ? '1px solid rgba(0,245,212,0.25)' : '1px solid transparent',
              }}>
              <v.Icon size={10} /> {v.label}
            </button>
          ))}
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto px-1.5 py-1 space-y-0.5">
          {view === 'channels' ? (
            <>
              <p className="text-[8px] uppercase font-black tracking-[0.18em] px-2 pt-1 pb-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>
                — canales —
              </p>
              {CHANNELS.map(ch => (
                <ChannelItem key={ch.id} channel={ch}
                  unread={unreadForChannel(ch.id)}
                  active={activeChannel === ch.id}
                  locked={!canAccessChannel(ch)}
                  onClick={() => { if (canAccessChannel(ch)) setActiveChannel(ch.id); }} />
              ))}
            </>
          ) : (
            <>
              <p className="text-[8px] uppercase font-black tracking-[0.18em] px-2 pt-1 pb-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>
                — mensajes directos —
              </p>
              {(isStaff ? filteredDmAccounts : accounts.filter(a => CIVAC_STAFF_IDS.includes(a.id))).map(a => (
                <ThreadItem key={a.id}
                  threadId={a.id} nombre={a.nombre} role={a.role}
                  lastMsg={lastDmMsg(isStaff ? a.id : user.id)}
                  unread={unreadForDm(a.id)}
                  active={activeDm === a.id}
                  onClick={() => setActiveDm(a.id)} />
              ))}
              {!isStaff && accounts.filter(a => CIVAC_STAFF_IDS.includes(a.id)).length === 0 && (
                <div className="text-center py-8 text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  <Users size={24} className="mx-auto mb-2 opacity-30" />
                  Sin staff disponible
                </div>
              )}
            </>
          )}
        </div>

        {/* WhatsApp button */}
        <div className="p-2 border-t flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <button onClick={() => setShowWa(!showWa)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold transition-all"
            style={{ background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.2)', color: '#25D366' }}>
            <Phone size={11} /> Contactar por WhatsApp
          </button>
        </div>
      </div>

      {/* ── Main chat area ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Chat header */}
        <div className="flex-shrink-0 px-4 py-3 border-b flex items-center gap-3"
          style={{ background: 'rgba(4,13,26,0.98)', borderColor: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}>

          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex-shrink-0 p-1.5 rounded-xl hover:bg-white/5 transition-all"
            style={{ color: 'rgba(255,255,255,0.4)' }}>
            <MessageCircle size={15} />
          </button>

          {view === 'channels' && activeChannel_ && (
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${activeChannel_.color}18`, border: `1px solid ${activeChannel_.color}30` }}>
                <span className="text-sm">{activeChannel_.icon === '#' ? '#' : activeChannel_.icon}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-white leading-tight"># {activeChannel_.name}</p>
                <p className="text-[9px] truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{activeChannel_.desc}</p>
              </div>
            </div>
          )}

          {view === 'dms' && activeDmAccount && (
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                style={{ background: 'rgba(0,245,212,0.15)', color: '#00f5d4' }}>
                {activeDmAccount.nombre[0]}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-white leading-tight">{activeDmAccount.nombre}</p>
                <p className="text-[9px]" style={{ color: '#39ff7e' }}>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#39ff7e] mr-1 animate-pulse" />
                  {activeDmAccount.cargo}
                </p>
              </div>
            </div>
          )}

          {!activeDmAccount && view === 'dms' && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-white">Mensajes directos</p>
            </div>
          )}

          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Notifications button (admin/sales only) */}
            {isStaff && (
              <button onClick={() => setShowPush(!showPush)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all"
                style={{ background: showPush ? 'rgba(255,215,0,0.12)' : 'rgba(255,215,0,0.06)', border: `1px solid rgba(255,215,0,${showPush ? '0.35' : '0.15'})`, color: '#FFD700' }}>
                <Bell size={11} /> Notificar
              </button>
            )}
            <button onClick={requestPushPerm} title="Activar notificaciones push"
              className="p-1.5 rounded-xl hover:bg-white/5 transition-all"
              style={{ color: 'rgba(255,255,255,0.3)' }}>
              <Bell size={14} />
            </button>
            <button onClick={() => setMsgs(loadMessages())}
              className="p-1.5 rounded-xl hover:bg-white/5 transition-all"
              style={{ color: 'rgba(255,255,255,0.3)' }}>
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        {/* Push notification composer (admin/sales only) */}
        {showPush && isStaff && (
          <div className="mx-4 mt-3 p-4 rounded-2xl flex-shrink-0"
            style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.2)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-black text-white flex items-center gap-2">
                <Zap size={12} style={{ color: '#FFD700' }} /> Enviar notificación a usuarios
              </p>
              <button onClick={() => setShowPush(false)}><X size={13} style={{ color: 'rgba(255,255,255,0.3)' }} /></button>
            </div>
            <div className="space-y-2">
              <input
                value={pushForm.title}
                onChange={e => setPushForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Título (opcional)"
                className="w-full bg-black/30 border text-xs text-white rounded-xl px-3 py-2 outline-none focus:border-yellow-400/50"
                style={{ borderColor: 'rgba(255,215,0,0.15)' }}
              />
              <textarea
                value={pushForm.body}
                onChange={e => setPushForm(p => ({ ...p, body: e.target.value }))}
                placeholder="Mensaje de notificación..."
                rows={2}
                className="w-full bg-black/30 border text-xs text-white rounded-xl px-3 py-2 outline-none focus:border-yellow-400/50 resize-none"
                style={{ borderColor: 'rgba(255,215,0,0.15)' }}
              />
              <div className="flex items-center gap-2">
                <select
                  value={pushForm.channel}
                  onChange={e => setPushForm(p => ({ ...p, channel: e.target.value }))}
                  className="flex-1 bg-black/30 border text-[11px] text-white rounded-xl px-3 py-1.5 outline-none"
                  style={{ borderColor: 'rgba(255,215,0,0.15)' }}>
                  {CHANNELS.map(ch => (
                    <option key={ch.id} value={ch.id}># {ch.name}</option>
                  ))}
                </select>
                <button onClick={sendPushNotification}
                  disabled={!pushForm.body.trim()}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[11px] font-black transition-all hover:scale-105 disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg,#FFD700,#f59e0b)', color: '#020d1a' }}>
                  <Send size={11} /> Enviar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-0.5"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,245,212,0.2) transparent' }}>
          {currentMsgs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(0,245,212,0.08)', border: '1px solid rgba(0,245,212,0.15)' }}>
                <MessageCircle size={28} style={{ color: 'rgba(0,245,212,0.4)' }} />
              </div>
              <p className="text-sm font-black text-white/50 mb-1">Sin mensajes aún</p>
              <p className="text-[10px] text-white/25">Sé el primero en escribir algo</p>
            </div>
          ) : (
            currentMsgs.map(m => (
              <Bubble key={m.id} msg={m}
                isMe={m.fromId === user.id}
                onReact={handleReact}
                onReply={setReplyMsg}
                onPin={handlePin}
              />
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* WhatsApp panel */}
        {showWa && (
          <div className="mx-4 mb-2 p-3 rounded-2xl flex-shrink-0"
            style={{ background: 'rgba(37,211,102,0.05)', border: '1px solid rgba(37,211,102,0.2)' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold text-white flex items-center gap-2"><Phone size={11} style={{ color: '#25D366' }} /> WhatsApp CIVAC</p>
              <button onClick={() => setShowWa(false)}><X size={12} style={{ color: 'rgba(255,255,255,0.3)' }} /></button>
            </div>
            <p className="text-[9px] mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <strong style={{ color: '#25D366' }}>+57 {whatsapp}</strong> · Lun–Vie 8am–6pm
            </p>
            <a href={`https://wa.me/57${whatsapp}?text=${encodeURIComponent('Hola CIVAC, soy ' + user.nombre + ' y necesito soporte.')}`}
              target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 py-2 rounded-xl font-black text-[11px] w-full"
              style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)', color: 'white' }}>
              <Phone size={12} /> Abrir WhatsApp
            </a>
          </div>
        )}

        {/* Reply indicator */}
        {replyMsg && (
          <div className="mx-4 mb-1 flex items-center gap-2 px-3 py-1.5 rounded-xl flex-shrink-0"
            style={{ background: 'rgba(0,245,212,0.06)', border: '1px solid rgba(0,245,212,0.15)' }}>
            <Reply size={11} style={{ color: '#00f5d4' }} />
            <span className="text-[10px] text-white/60 flex-1 truncate">
              Respondiendo a: {replyMsg.text.slice(0, 50)}{replyMsg.text.length > 50 ? '...' : ''}
            </span>
            <button onClick={() => setReplyMsg(null)}><X size={11} style={{ color: 'rgba(255,255,255,0.3)' }} /></button>
          </div>
        )}

        {/* Input area */}
        <div className="flex-shrink-0 px-4 pb-3 pt-2"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(4,13,26,0.95)' }}>
          <div className="flex items-end gap-2">
            {/* Emoji */}
            <div className="relative flex-shrink-0">
              <button onClick={() => setShowEmoji(!showEmoji)}
                className="p-2.5 rounded-xl hover:bg-white/5 transition-all flex-shrink-0"
                style={{ color: 'rgba(255,255,255,0.4)' }}>
                <Smile size={16} />
              </button>
              {showEmoji && (
                <div className="absolute bottom-full mb-2 left-0 p-2 rounded-2xl grid grid-cols-6 gap-1 z-50"
                  style={{ background: 'rgba(4,13,26,0.98)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}>
                  {EMOJI_LIST.map(e => (
                    <button key={e} onClick={() => { setInput(i => i + e); setShowEmoji(false); inputRef.current?.focus(); }}
                      className="text-lg hover:scale-110 transition-transform p-1 rounded">{e}</button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 relative">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={
                  view === 'channels'
                    ? `Mensaje en #${activeChannel_?.name ?? 'general'}...`
                    : activeDmAccount ? `Mensaje a ${activeDmAccount.nombre.split(' ')[0]}...` : 'Selecciona una conversación'
                }
                disabled={view === 'dms' && !activeDm}
                className="w-full bg-transparent text-[12px] text-white placeholder-white/25 outline-none resize-none"
                style={{
                  padding: '10px 14px',
                  borderRadius: 16,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  lineHeight: '1.4',
                }}
              />
            </div>

            <button
              onClick={sendMessage}
              disabled={!input.trim() || (view === 'dms' && !activeDm)}
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-2xl font-black transition-all hover:scale-105 disabled:opacity-30"
              style={{
                background: input.trim()
                  ? 'linear-gradient(135deg,#00f5d4,#FFD700)'
                  : 'rgba(255,255,255,0.07)',
                color: input.trim() ? '#020d1a' : 'rgba(255,255,255,0.3)',
                boxShadow: input.trim() ? '0 0 20px rgba(0,245,212,0.4)' : 'none',
              }}>
              <Send size={15} strokeWidth={2.5} />
            </button>
          </div>

          {/* Quick actions for staff */}
          {isStaff && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <p className="text-[8px] text-white/20">Acciones rápidas:</p>
              {[
                { label: 'Plan PRO', plan: 'PRO', monto: '$89.000/mes', link: 'https://checkout.wompi.co/p/?public-key=pub_prod_civac&currency-code=COP&amount-in-cents=8900000' },
                { label: 'Plan Premium', plan: 'Premium', monto: '$189.000/mes', link: 'https://checkout.wompi.co/p/?public-key=pub_prod_civac&currency-code=COP&amount-in-cents=18900000' },
                { label: 'Plan Platino', plan: 'Platino', monto: '$399.000/mes', link: 'https://checkout.wompi.co/p/?public-key=pub_prod_civac&currency-code=COP&amount-in-cents=39900000' },
              ].map(pay => (
                <button key={pay.plan} onClick={() => sendPaymentLink(pay.plan, pay.monto, pay.link)}
                  className="flex items-center gap-1 px-2 py-1 rounded-xl text-[9px] font-bold transition-all hover:scale-105"
                  style={{ background: 'rgba(251,191,36,0.10)', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24' }}>
                  💳 {pay.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
