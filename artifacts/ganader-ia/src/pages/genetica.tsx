const ranking = [
  { rank:1, nombre:'Rosaura', arete:'A-0042', raza:'Holstein', cat:'Vaca adulta', dep:820, score:92, color:'#22c55e' },
  { rank:2, nombre:'Estrella', arete:'A-0604', raza:'Holstein', cat:'Vaca adulta', dep:780, score:88, color:'#22c55e' },
  { rank:3, nombre:'Cielo', arete:'A-0087', raza:'Simmental', cat:'Vaca adulta', dep:740, score:84, color:'#22c55e' },
  { rank:4, nombre:'Niebla', arete:'A-0445', raza:'Holstein', cat:'Vaca adulta', dep:710, score:80, color:'#22c55e' },
  { rank:5, nombre:'Palmera', arete:'A-0133', raza:'Gyr X', cat:'Vaca adulta', dep:680, score:76, color:'#f97316' },
  { rank:6, nombre:'Perla', arete:'A-0712', raza:'Holstein', cat:'Vaca adulta', dep:640, score:72, color:'#f97316' },
  { rank:7, nombre:'Canela', arete:'A-0108', raza:'Brahman', cat:'Vaca adulta', dep:590, score:67, color:'#f97316' },
  { rank:8, nombre:'Luna', arete:'A-0319', raza:'Simmental', cat:'Novilla', dep:520, score:62, color:'#f97316' },
  { rank:9, nombre:'Aurora', arete:'A-0551', raza:'Holstein', cat:'Novilla', dep:480, score:55, color:'#ef4444' },
  { rank:10, nombre:'Brisa', arete:'A-0180', raza:'Angus X', cat:'Novilla', dep:430, score:50, color:'#ef4444' },
  { rank:11, nombre:'Manchas', arete:'A-0512', raza:'Holstein', cat:'Ternero', dep:0, score:38, color:'#ef4444' },
];

export default function Genetica() {
  return (
    <div className="space-y-5 pb-8">
      {/* CIVAC Banner */}
      <div className="rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden civac-animate"
        style={{background:'linear-gradient(135deg,#0d001a 0%,#1a002e 100%)', border:'1px solid rgba(191,0,255,0.35)', boxShadow:'0 0 40px rgba(191,0,255,0.1), inset 0 1px 0 rgba(191,0,255,0.08)'}}>
        <div className="absolute right-0 top-0 w-48 h-full pointer-events-none opacity-10" style={{background:'radial-gradient(ellipse at right, #bf00ff, transparent 70%)'}} />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{background:'rgba(191,0,255,0.1)', border:'1px solid rgba(191,0,255,0.4)', boxShadow:'0 0 16px rgba(191,0,255,0.2)'}}>🧪</div>
          <div>
            <h1 className="text-xl font-bold text-white" style={{fontFamily:'Sora,sans-serif'}}>Genética y Pedigrí</h1>
            <p className="text-sm" style={{color:'rgba(191,0,255,0.75)'}}>Evaluación y progreso genético del hato · DEP · Índices</p>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label:'SCORE PROM. HATO', val:'70.8', sub:'promedio', c:'#39ff7e' },
          { label:'CON EVALUACIÓN DEP', val:'11', sub:'animales', c:'#00c8ff' },
          { label:'MEJOR DEP LECHE', val:'+820', sub:'Rosaura', c:'#bf00ff' },
          { label:'TOTAL EVALUADOS', val:'11 / de 13', sub:'animales', c:'#00f5d4' },
        ].map(k => (
          <div key={k.label} className="rounded-xl p-4 text-white relative overflow-hidden"
            style={{background:'linear-gradient(135deg,#020d09,#041208)', border:'1px solid rgba(0,245,212,0.15)'}}>
            <div className="absolute top-0 right-0 w-14 h-14 rounded-full pointer-events-none" style={{background:k.c, opacity:0.15, filter:'blur(18px)', transform:'translate(30%,-30%)'}} />
            <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{color:'rgba(0,245,212,0.55)'}}>{k.label}</div>
            <div className="text-2xl font-bold" style={{color:k.c, fontFamily:'Sora,sans-serif'}}>{k.val}</div>
            <div className="text-[10px]" style={{color:'rgba(255,255,255,0.4)'}}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* 2-col: Ranking + Pedigrí */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Ranking genético */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3" style={{background:'linear-gradient(135deg,#0d001a,#1a002e)', borderBottom:'1px solid rgba(191,0,255,0.2)'}}>
            <div className="font-semibold text-white text-sm">🏆 Ranking genético DEP (Leche)</div>
            <div className="text-xs" style={{color:'rgba(191,0,255,0.6)'}}>Evaluación índice compuesto 2025</div>
          </div>
          <div className="p-4 space-y-3">
            {ranking.map(a => (
              <div key={a.arete}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-full bg-muted/40 text-muted-foreground text-xs font-bold flex items-center justify-center flex-shrink-0">{a.rank}</span>
                  <span className="font-medium text-sm flex-1">{a.nombre}</span>
                  <span className="font-mono text-xs text-muted-foreground">{a.arete}</span>
                  <span className="text-sm font-bold" style={{color: a.color}}>{a.score}</span>
                </div>
                <div className="pl-8">
                  <div className="text-[10px] text-muted-foreground mb-1">DEP {a.dep > 0 ? `+${a.dep}L` : '—'} · {a.raza} · {a.cat}</div>
                  <div className="h-1.5 bg-muted/30 rounded-full">
                    <div className="h-1.5 rounded-full transition-all" style={{width:`${a.score}%`, background: a.color}} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pedigrí */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3" style={{background:'linear-gradient(135deg,#0d001a,#1a002e)', borderBottom:'1px solid rgba(191,0,255,0.2)'}}>
            <div className="font-semibold text-white text-sm">🧬 Pedigrí — Rosaura</div>
            <div className="text-xs" style={{color:'rgba(191,0,255,0.6)'}}>Árbol genealógico y progenie registrada</div>
          </div>
          <div className="p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between bg-muted/20 rounded-xl p-4 border border-border">
              <div>
                <div className="font-bold text-lg">🐄 Rosaura</div>
                <div className="text-xs text-muted-foreground">A-0042 · Holstein · Score 92</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">DEP Leche</div>
                <div className="text-xl font-bold text-green-400">+820L</div>
              </div>
            </div>

            {/* Padre */}
            <div className="border-l-4 border-blue-500 pl-4 bg-blue-500/5 rounded-r-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold">♂ Padre: Altísimo IA</span>
                <span className="text-xs text-muted-foreground">· Toro Holstein importado</span>
              </div>
              <div className="text-xs text-muted-foreground">DEP Leche: <strong className="text-blue-400">+820L</strong> · DEP Grasa: <strong className="text-blue-400">+28kg</strong> · Origen: Canadá</div>
            </div>

            {/* Madre */}
            <div className="border-l-4 border-pink-500 pl-4 bg-pink-500/5 rounded-r-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold">♀ Madre: Rosita</span>
                <span className="text-xs text-muted-foreground">A-0018 · Holstein</span>
              </div>
              <div className="text-xs text-muted-foreground">4 partos registrados · Productividad: 18.2L/d · Salud: Excelente</div>
            </div>

            {/* Progenie */}
            <div>
              <div className="text-xs font-bold text-muted-foreground uppercase mb-2">Progenie (1):</div>
              <div className="flex items-center gap-3 bg-muted/20 rounded-lg p-3 border border-border">
                <span className="text-lg">🐄</span>
                <div>
                  <div className="text-sm font-medium">Manchas</div>
                  <div className="text-xs text-muted-foreground">A-0512 · Ternero · Holstein · Nac. 2025</div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border">
              {[['Productividad','18.4 L/d','text-cyan-400'],['Score DEP','92 / 100','text-green-400'],['Salud','Excelente','text-green-400']].map(([l,v,c]) => (
                <div key={l} className="text-center bg-muted/20 rounded-lg p-2">
                  <div className="text-[10px] text-muted-foreground">{l}</div>
                  <div className={`text-sm font-bold ${c}`}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
