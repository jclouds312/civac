import { useState } from "react";
import {
  Shield, CheckCircle, Crown, Zap, Star, Phone, Mail, Globe,
  Calendar, Users, Lock, Info, Building2, Leaf, AlertTriangle,
  ChevronRight, Award, Cpu
} from "lucide-react";
import { useAuth, PLAN_LABEL, PLAN_COLOR, PLAN_ICON, type PlanId } from "@/lib/auth";

const MODULOS_POR_PLAN: Record<PlanId, string[]> = {
  basico: [
    'Dashboard básico','Inventario (hasta 50 animales)','Fichas de animales',
    'Producción lechera','Alertas básicas','Potreros','Exportar datos',
  ],
  pro: [
    'Todo el plan Básico','Inventario ilimitado','Pesaje Bluetooth (Tru-Test · Gallagher)',
    'GPS Ganado en tiempo real','Reproducción y partos','Genética y DEP',
    'Insumos y Kardex','Personal y nómina','Costos y P&G',
    'Predicciones IA','Multi-Finca (3 fincas)','Semen y Embriones',
    'Alimentación y raciones','Huella de carbono','Centro de alertas',
  ],
  premium: [
    'Todo el plan PRO','Multi-Finca ilimitada','Google Drive sync automático',
    'API de integración','Exportación Excel/PDF avanzada','Soporte prioritario 24/7',
    'Usuarios adicionales (hasta 10)','Acceso histórico 5 años',
  ],
  platino: [
    'Todo el plan Premium','Instancia dedicada','Branding personalizado',
    'SLA de disponibilidad 99.9%','Capacitación en finca incluida',
    'Integración con básculas industriales','Usuarios ilimitados',
    'Módulos a medida','Contrato empresarial',
  ],
};

const PLAN_INFO = [
  { id:'basico'  as PlanId, nombre:'Básico',  icon:<Leaf size={18}/>,  color:'#94a3b8', desc:'Hasta 50 animales · 1 usuario' },
  { id:'pro'     as PlanId, nombre:'PRO',     icon:<Zap size={18}/>,   color:'#00f5d4', desc:'Ilimitado · GPS · BT · 3 fincas' },
  { id:'premium' as PlanId, nombre:'Premium', icon:<Star size={18}/>,  color:'#a855f7', desc:'Drive sync · API · 10 usuarios' },
  { id:'platino' as PlanId, nombre:'Platino', icon:<Crown size={18}/>, color:'#f59e0b', desc:'Empresarial · SLA · Personalizado' },
];

export default function Planes() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [selectedPlan, setSelectedPlan] = useState<PlanId>(user?.plan || 'pro');

  const planActual = user?.plan as PlanId | undefined;

  return (
    <div className="space-y-6 pb-10">

      {/* ── Banner ──────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background:'linear-gradient(135deg,#071325,#0d2137 50%,#0a1c38)', border:'1px solid rgba(0,245,212,0.2)', boxShadow:'0 0 60px rgba(0,245,212,0.05)' }}>
        <div className="absolute right-0 top-0 w-64 h-full opacity-10 pointer-events-none"
          style={{ background:'radial-gradient(ellipse at right, #00f5d4, transparent 70%)' }} />
        <div className="relative flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background:'rgba(0,245,212,0.1)', border:'1px solid rgba(0,245,212,0.25)' }}>
            <Shield className="text-[#00f5d4]" size={24} />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 text-xs font-bold rounded-full"
              style={{ background:'rgba(0,245,212,0.1)', border:'1px solid rgba(0,245,212,0.25)', color:'#00f5d4' }}>
              <Lock size={11} /> Sistema de Licenciamiento Privado · CIVAC Colombia
            </div>
            <h1 className="text-2xl font-black text-white mb-1">Licencia CIVAC PRO</h1>
            <p className="text-sm" style={{ color:'rgba(255,255,255,0.5)' }}>
              Las licencias son administradas exclusivamente por <strong className="text-white">CIVAC Colombia</strong>.
              Para activar o cambiar un plan, contacte al equipo comercial.
            </p>
          </div>
        </div>
      </div>

      {/* ── Licencia actual del usuario ─────────────────────────────────────── */}
      {user && (
        <div className="rounded-2xl p-5"
          style={{ background:`linear-gradient(135deg,${PLAN_COLOR[planActual||'basico']}12,${PLAN_COLOR[planActual||'basico']}05)`, border:`1px solid ${PLAN_COLOR[planActual||'basico']}30` }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background:`${PLAN_COLOR[planActual||'basico']}15`, border:`1px solid ${PLAN_COLOR[planActual||'basico']}30` }}>
              {PLAN_ICON[planActual||'basico']}
            </div>
            <div>
              <div className="font-black text-white text-lg">Tu Licencia Activa</div>
              <div className="text-sm font-bold" style={{ color:PLAN_COLOR[planActual||'basico'] }}>
                Plan {PLAN_LABEL[planActual||'basico']}
                {user.planExpiry && <span className="text-xs font-normal text-white/40 ml-2">· válida hasta {user.planExpiry}</span>}
              </div>
            </div>
            <div className="ml-auto">
              <span className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5"
                style={{ background:`${PLAN_COLOR[planActual||'basico']}15`, border:`1px solid ${PLAN_COLOR[planActual||'basico']}30`, color:PLAN_COLOR[planActual||'basico'] }}>
                <CheckCircle size={12} /> Activo
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(MODULOS_POR_PLAN[planActual||'basico']||[]).map(m => (
              <div key={m} className="flex items-center gap-2 text-xs text-white/70 bg-white/5 rounded-lg px-3 py-2">
                <CheckCircle size={11} className="text-green-400 flex-shrink-0" />
                {m}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Comparar planes ─────────────────────────────────────────────────── */}
      <div>
        <div className="text-sm font-bold text-white/50 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Award size={14} /> Planes disponibles
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PLAN_INFO.map(p => {
            const isCurrent = planActual === p.id;
            return (
              <button key={p.id}
                onClick={() => setSelectedPlan(p.id)}
                className="rounded-2xl p-4 text-left transition-all hover:scale-[1.02]"
                style={{
                  background: selectedPlan === p.id ? `${p.color}10` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${selectedPlan === p.id ? `${p.color}40` : 'rgba(255,255,255,0.07)'}`,
                  boxShadow: selectedPlan === p.id ? `0 0 20px ${p.color}18` : 'none',
                }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:`${p.color}15`, color:p.color }}>
                    {p.icon}
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background:`${p.color}15`, color:p.color, border:`1px solid ${p.color}30` }}>
                      Activo
                    </span>
                  )}
                </div>
                <div className="font-black text-white">{p.nombre}</div>
                <div className="text-[11px] text-white/40 mt-0.5">{p.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Módulos del plan seleccionado ───────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-3">
          <Cpu size={15} className="text-[#00f5d4]" />
          <span className="font-bold text-sm">
            Módulos incluidos en Plan {PLAN_LABEL[selectedPlan]}
          </span>
          <span className="ml-auto text-xs text-muted-foreground">
            {MODULOS_POR_PLAN[selectedPlan]?.length} módulos
          </span>
        </div>
        <div className="p-4 grid sm:grid-cols-2 gap-2">
          {(MODULOS_POR_PLAN[selectedPlan]||[]).map(m => (
            <div key={m} className="flex items-center gap-2.5 text-sm text-white/75 rounded-xl bg-white/[0.03] border border-white/5 px-4 py-2.5">
              <CheckCircle size={13} className="text-green-400 flex-shrink-0" />
              {m}
            </div>
          ))}
        </div>
      </div>

      {/* ── Contacto para licencias ─────────────────────────────────────────── */}
      <div className="rounded-2xl p-6 space-y-4"
        style={{ background:'linear-gradient(135deg,#071325,#071a0e)', border:'1px solid rgba(0,245,212,0.15)' }}>
        <div className="flex items-center gap-3 mb-2">
          <Building2 size={18} className="text-[#00f5d4]" />
          <div className="font-black text-white">Adquirir o actualizar licencia</div>
        </div>
        <p className="text-sm text-white/50 leading-relaxed">
          Las licencias CIVAC PRO son comercializadas exclusivamente por el equipo de <strong className="text-white">CIVAC Colombia</strong>.
          No se venden a través de la plataforma — contacte directamente al equipo comercial para activar, renovar o cambiar su plan.
        </p>
        <div className="grid sm:grid-cols-3 gap-3 mt-2">
          {[
            { icon:<Phone size={16}/>, label:'WhatsApp Comercial', val:'+57 300 000 0000', c:'#25d366' },
            { icon:<Mail size={16}/>,  label:'Email Empresarial',  val:'licencias@civac.co', c:'#00f5d4' },
            { icon:<Globe size={16}/>, label:'Web Corporativa',    val:'civac.co', c:'#60a5fa' },
          ].map(c => (
            <div key={c.label} className="rounded-xl p-3 flex items-start gap-3"
              style={{ background:`${c.c}08`, border:`1px solid ${c.c}20` }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background:`${c.c}15`, color:c.c }}>
                {c.icon}
              </div>
              <div>
                <div className="text-[10px] text-white/40 mb-0.5">{c.label}</div>
                <div className="text-xs font-bold text-white">{c.val}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Panel Admin (solo admin) ─────────────────────────────────────────── */}
      {isAdmin && (
        <div className="rounded-2xl overflow-hidden border border-amber-500/20">
          <div className="bg-amber-500/10 px-5 py-4 border-b border-amber-500/20 flex items-center gap-2">
            <Crown size={15} className="text-amber-400" />
            <span className="font-bold text-amber-400 text-sm">Panel de Administración de Licencias</span>
            <span className="ml-auto text-xs text-amber-400/50">Solo Admin</span>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/15 rounded-xl p-4">
              <Info size={15} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-white/60 leading-relaxed">
                La gestión de licencias se realiza desde el sistema interno de CIVAC.
                Las activaciones se aplican directamente a cada cuenta desde el panel corporativo.
                Para soporte técnico de licencias: <strong className="text-amber-300">soporte@civac.co</strong>
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { label:'Cuentas activas', val:'4', icon:<Users size={16}/>, c:'#00f5d4' },
                { label:'Licencias vigentes', val:'4 / 4', icon:<CheckCircle size={16}/>, c:'#4ade80' },
                { label:'Próximo vencimiento', val:'2026-12-31', icon:<Calendar size={16}/>, c:'#fbbf24' },
                { label:'Nivel máximo', val:'PRO', icon:<Shield size={16}/>, c:'#a855f7' },
              ].map(k => (
                <div key={k.label} className="flex items-center gap-3 rounded-xl p-3"
                  style={{ background:`${k.c}08`, border:`1px solid ${k.c}18` }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background:`${k.c}15`, color:k.c }}>
                    {k.icon}
                  </div>
                  <div>
                    <div className="text-[10px] text-white/40">{k.label}</div>
                    <div className="font-bold text-sm text-white">{k.val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Nota informativa ────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 rounded-xl p-4 bg-white/[0.03] border border-white/8">
        <AlertTriangle size={15} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-white/40 leading-relaxed">
          CIVAC PRO es un sistema privado de gestión ganadera. Las licencias no son transferibles y están vinculadas a la cuenta empresarial registrada.
          Cualquier uso no autorizado será reportado a las autoridades competentes.
          © 2026 CIVAC Colombia — Todos los derechos reservados.
        </p>
      </div>

    </div>
  );
}
