/**
 * Acerca de CIVAC PRO — Créditos, Licencias y Propietario
 * Universal Business Technology · SoftGan Colombia
 * Propietario: Johnatan Vallejo Marulanda
 */
import { Shield, Award, Globe, Mail, Phone, Cpu, Code2,
  Database, Satellite, Zap, CheckCircle2, Star, Lock,
  Building2, User, Scale, Heart } from "lucide-react";
import { CIVAC_LICENSE } from "@/lib/protection";

function Section({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{size?:number;style?:React.CSSProperties}>; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5 space-y-3"
      style={{ background:'linear-gradient(135deg,rgba(5,15,40,0.95),rgba(8,20,55,0.9))', border:'1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background:'linear-gradient(135deg,rgba(0,245,212,0.15),rgba(0,200,255,0.1))', border:'1px solid rgba(0,245,212,0.2)' }}>
          <Icon size={14} style={{ color:'#00f5d4' }}/>
        </div>
        <h2 className="font-black text-sm text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 border-b border-white/5 last:border-0">
      <span className="text-[10px] text-white/40 flex-shrink-0 mt-0.5">{label}</span>
      <span className={`text-[11px] font-bold text-white text-right ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}

function TechCard({ emoji, name, version, role }: { emoji: string; name: string; version: string; role: string }) {
  return (
    <div className="rounded-xl p-3 text-center"
      style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
      <div className="text-xl mb-1">{emoji}</div>
      <p className="text-[10px] font-black text-white leading-tight">{name}</p>
      <p className="text-[8px] text-white/30 mt-0.5">{version}</p>
      <p className="text-[8px] text-white/20 mt-0.5">{role}</p>
    </div>
  );
}

export default function Acerca() {
  const year = new Date().getFullYear();
  return (
    <div className="space-y-5 pb-14">

      {/* ── Hero Banner ──────────────────────────────────────────────────────── */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background:'linear-gradient(135deg,#020d1a,#0a2745 50%,#020d1a)', border:'1px solid rgba(0,245,212,0.2)', boxShadow:'0 0 60px rgba(0,245,212,0.06)' }}>
        <div className="absolute right-0 top-0 w-56 h-full opacity-10 pointer-events-none"
          style={{ background:'radial-gradient(ellipse at right,#00f5d4,transparent 70%)' }}/>
        <div className="absolute left-0 bottom-0 w-32 h-32 opacity-5 pointer-events-none"
          style={{ background:'radial-gradient(circle,#a855f7,transparent 70%)' }}/>

        <div className="relative text-center">
          {/* Logo mark */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-4"
            style={{ background:'linear-gradient(135deg,#00f5d4,#00a896)', boxShadow:'0 0 40px rgba(0,245,212,0.5)' }}>
            <span className="text-4xl">🐄</span>
          </div>
          <h1 className="font-black text-3xl text-white mb-1" style={{ fontFamily:"'Sora',sans-serif" }}>
            CIVAC<span style={{ color:'#00f5d4' }}> PRO</span>
          </h1>
          <p className="text-sm font-bold" style={{ color:'rgba(0,245,212,0.6)' }}>
            Control Inteligente de Valor Agropecuario · Colombia
          </p>
          <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
            {['v1.0','PWA','IndexedDB','Django','Flask','GPS Real','22 módulos'].map(tag => (
              <span key={tag} className="text-[9px] font-black px-2.5 py-1 rounded-full"
                style={{ background:'rgba(0,245,212,0.1)', border:'1px solid rgba(0,245,212,0.25)', color:'#00f5d4' }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* ── Propietario y Creador ─────────────────────────────────────────── */}
        <Section title="Propietario y Creador" icon={User}>
          <div className="rounded-2xl p-4 mb-3"
            style={{ background:'linear-gradient(135deg,rgba(0,245,212,0.08),rgba(0,200,255,0.05))', border:'1px solid rgba(0,245,212,0.2)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background:'linear-gradient(135deg,#00f5d4,#00a896)', boxShadow:'0 0 20px rgba(0,245,212,0.4)' }}>
                👨‍💼
              </div>
              <div>
                <p className="font-black text-white text-sm">Johnatan Vallejo Marulanda</p>
                <p className="text-[9px] mt-0.5" style={{ color:'rgba(0,245,212,0.6)' }}>Fundador · Propietario · Creador</p>
                <p className="text-[8px] text-white/30 mt-0.5">Universal Business Technology</p>
              </div>
            </div>
            <div className="space-y-1">
              <InfoRow label="Rol" value="Propietario único y exclusivo"/>
              <InfoRow label="Derechos" value="Intelectuales y comerciales 100%"/>
              <InfoRow label="Empresa" value="Universal Business Technology"/>
              <InfoRow label="País" value="Colombia 🇨🇴"/>
            </div>
          </div>
          <div className="text-[9px] text-white/35 leading-relaxed" data-protected>
            Johnatan Vallejo Marulanda es el creador, desarrollador original y propietario único de CIVAC PRO y toda su propiedad intelectual. Ninguna reproducción, copia, distribución o uso comercial está permitido sin autorización expresa y por escrito del propietario.
          </div>
        </Section>

        {/* ── Empresa y Licencias ─────────────────────────────────────────────── */}
        <Section title="SoftGan Colombia — Proveedor de Licencias" icon={Building2}>
          <div className="rounded-2xl p-4 mb-3"
            style={{ background:'linear-gradient(135deg,rgba(168,85,247,0.08),rgba(124,58,237,0.05))', border:'1px solid rgba(168,85,247,0.2)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background:'linear-gradient(135deg,#a855f7,#7c3aed)', boxShadow:'0 0 20px rgba(168,85,247,0.4)' }}>
                🏢
              </div>
              <div>
                <p className="font-black text-white text-sm">SoftGan Colombia</p>
                <p className="text-[9px] mt-0.5" style={{ color:'rgba(168,85,247,0.7)' }}>Proveedor exclusivo de licencias CIVAC</p>
                <p className="text-[8px] text-white/30 mt-0.5">Software Ganadero · Agtech Colombia</p>
              </div>
            </div>
            <div className="space-y-1">
              <InfoRow label="Marca" value="CIVAC® (Registro pendiente)"/>
              <InfoRow label="Modelo" value="SaaS · Licencias anuales/mensuales"/>
              <InfoRow label="Contacto" value="soporte@softgan.com.co"/>
              <InfoRow label="Mercado" value="Colombia · Latinoamérica"/>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label:'Plan Básico', price:'Gratis', desc:'7 módulos base', color:'#94a3b8' },
              { label:'Plan PRO', price:'$129K/mes', desc:'5 GPS + 20 módulos', color:'#00f5d4' },
              { label:'Plan Premium', price:'$289K/mes', desc:'20 GPS + IA avanzada', color:'#a855f7' },
              { label:'Plan Platino', price:'$890K/mes', desc:'GPS ilimitado + soporte', color:'#fbbf24' },
            ].map(p => (
              <div key={p.label} className="rounded-xl p-2.5"
                style={{ background:`${p.color}08`, border:`1px solid ${p.color}25` }}>
                <p className="text-[9px] font-black" style={{ color:p.color }}>{p.label}</p>
                <p className="text-[11px] font-black text-white mt-0.5">{p.price}</p>
                <p className="text-[8px] text-white/30 mt-0.5">{p.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Protección legal ─────────────────────────────────────────────────── */}
        <Section title="Propiedad Intelectual y Protección" icon={Shield}>
          <div className="space-y-2">
            {[
              { ico:'©', label:'Copyright', val:`${year} Universal Business Technology · Todos los derechos reservados` },
              { ico:'®', label:'Marca CIVAC', val:'Nombre comercial protegido · Registro en trámite Colombia' },
              { ico:'🔐', label:'Código fuente', val:'Propiedad exclusiva de Johnatan Vallejo Marulanda' },
              { ico:'📜', label:'Licencia', val:'Software propietario · No open source' },
              { ico:'🌐', label:'Territorialidad', val:'Colombia · Legislación Ley 23/1982 y Decisión 351 CAN' },
              { ico:'⚖️', label:'Uso no autorizado', val:'Constituye infracción penal y civil bajo ley colombiana' },
            ].map(({ ico, label, val }) => (
              <div key={label} className="flex items-start gap-3 py-1.5 border-b border-white/5 last:border-0" data-protected>
                <span className="text-base flex-shrink-0 mt-0.5">{ico}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-white">{label}</p>
                  <p className="text-[9px] text-white/40 mt-0.5">{val}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Stack tecnológico ─────────────────────────────────────────────────── */}
        <Section title="Stack Tecnológico" icon={Cpu}>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {[
              { emoji:'⚛️', name:'React 18', version:'18.3', role:'UI Framework' },
              { emoji:'⚡', name:'Vite 7', version:'7.3', role:'Build Tool' },
              { emoji:'🐍', name:'Django 6', version:'6.0.5', role:'GPS Backend' },
              { emoji:'🌶️', name:'Flask', version:'3.x', role:'Analytics API' },
              { emoji:'📊', name:'pandas', version:'2.x', role:'Data Science' },
              { emoji:'🔷', name:'TypeScript', version:'5.9', role:'Type Safety' },
              { emoji:'🎨', name:'Tailwind', version:'4.x', role:'CSS Framework' },
              { emoji:'🗄️', name:'SQLite', version:'3.x', role:'GPS Database' },
              { emoji:'📡', name:'DRF', version:'3.17', role:'REST API' },
              { emoji:'🔄', name:'Service Worker', version:'v6', role:'Offline PWA' },
              { emoji:'📦', name:'pnpm', version:'10.x', role:'Package Manager' },
              { emoji:'🗺️', name:'wouter', version:'3.x', role:'SPA Router' },
            ].map(t => <TechCard key={t.name} {...t}/>)}
          </div>
        </Section>
      </div>

      {/* ── Módulos del sistema ───────────────────────────────────────────────── */}
      <Section title="28 Módulos del Sistema" icon={Database}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-2">
          {[
            ['🐄','Inventario'],['🥛','Producción'],['🔁','Reproducción'],['🧬','Genética'],
            ['🌿','Potreros'],['🌾','Alimentación'],['💊','Insumos'],['💰','Costos P&G'],
            ['🧊','Semen'],['👷','Personal'],['🤖','Predicciones IA'],['🌱','Huella CO₂'],
            ['🚨','Alertas'],['📋','Ficha'],['🗺️','Multi-Finca'],['📡','GPS Bovino'],
            ['🛰️','GPS Chips'],['⚖️','Pesaje BT'],['📐','Pesaje Manual'],['👥','Usuarios'],
            ['⚙️','Configuración'],['📚','Documentación'],['📖','Manual'],['💎','Planes'],
            ['📊','Analytics'],['🤖','Asesora IA'],['🗄️','Data Center'],['ℹ️','Acerca de'],
          ].map(([emoji, name]) => (
            <div key={name} className="rounded-xl p-2 text-center"
              style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)' }}>
              <div className="text-lg mb-0.5">{emoji}</div>
              <p className="text-[8px] font-bold text-white/60">{name}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Footer legal ─────────────────────────────────────────────────────── */}
      <div className="rounded-2xl p-4 text-center" data-protected
        style={{ background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.05)' }}>
        <p className="text-[10px] font-black text-white mb-2">
          CIVAC PRO® — Software de Gestión Ganadera Colombia
        </p>
        <p className="text-[9px] text-white/40 leading-relaxed max-w-xl mx-auto">
          © {year} <strong className="text-white/60">Universal Business Technology</strong> · Propietario: <strong className="text-white/60">Johnatan Vallejo Marulanda</strong><br/>
          Proveedor de licencias: <strong className="text-white/60">SoftGan Colombia</strong> · Marca: <strong className="text-white/60">CIVAC®</strong><br/>
          Todos los derechos de propiedad intelectual, comercial e industrial reservados.<br/>
          La reproducción, distribución, ingeniería inversa o uso no autorizado de este software<br/>constituye una violación a la Ley 23 de 1982 y la Decisión 351 de la CAN.
        </p>
        <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-[8px]" style={{ color:'rgba(0,245,212,0.5)' }}>
            <Shield size={10}/> Protegido legalmente
          </div>
          <div className="flex items-center gap-1.5 text-[8px]" style={{ color:'rgba(0,245,212,0.5)' }}>
            <Lock size={10}/> Anti-phishing activo
          </div>
          <div className="flex items-center gap-1.5 text-[8px]" style={{ color:'rgba(0,245,212,0.5)' }}>
            <CheckCircle2 size={10}/> Sistema verificado
          </div>
          <div className="flex items-center gap-1.5 text-[8px]" style={{ color:'rgba(0,245,212,0.5)' }}>
            <Star size={10}/> Made in Colombia 🇨🇴
          </div>
        </div>
      </div>
    </div>
  );
}
