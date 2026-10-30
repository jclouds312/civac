# -*- coding: utf-8 -*-
import sys, os, shutil, tempfile

FILE = "artifacts/ganader-ia/src/pages/pesaje-manual.tsx"
TMPFILE = FILE + ".tmp"

with open(FILE, "r", encoding="utf-8") as f:
    content = f.read()

# ── locate Tab 1 & Tab 2 ─────────────────────────────────────────────────────
TAB1_NEEDLE = "TAB 1: SES"   # unique
TAB2_NEEDLE = "TAB 2: NUEVO"

t1 = content.index(TAB1_NEEDLE)
# go back to find the opening of the comment block
t1_start = content.rfind("        {/*", 0, t1)

t2 = content.index(TAB2_NEEDLE)
t2_comment_start = content.rfind("        {/*", 0, t2)
# The </TabsContent> that closes Tab 1 is just before the Tab 2 comment block
tab1_end_pos = content[:t2_comment_start].rfind("        </TabsContent>") + len("        </TabsContent>")

print(f"Tab1 block: chars {t1_start} → {tab1_end_pos}", file=sys.stderr)
print(f"Tab2 comment starts at: {t2_comment_start}", file=sys.stderr)

# ── new Tab 1 JSX ────────────────────────────────────────────────────────────
B70 = "\u2550" * 70   # ══…══ (70)

NEW_TAB1 = r"""        {/* """ + B70 + r"""
            TAB 1: PESAJE AUTOMATIZADO — Formulario Independiente
        """ + B70 + r""" */}
        <TabsContent value="sesion" className="mt-4">

          {/* Tabla referencia pesos */}
          {showRef && (
            <div className="rounded-2xl p-4 overflow-x-auto mb-4"
              style={{ background: "rgba(192,132,252,0.03)", border: "1px solid rgba(192,132,252,0.12)" }}>
              <div className="text-[10px] font-black uppercase tracking-widest mb-3"
                style={{ color: "rgba(192,132,252,0.5)" }}>
                Tabla de Pesos Estandar por Raza (kg)
              </div>
              <table className="w-full text-[10px] min-w-[520px]">
                <thead>
                  <tr>
                    <th className="text-left py-2 pr-4 font-black" style={{ color: "rgba(192,132,252,0.6)" }}>Raza</th>
                    {["Vaca adulta","Novilla","Ternero","Ternera","Toro"].map(c => (
                      <th key={c} className="text-center py-2 px-2 font-black"
                        style={{ color: "rgba(192,132,252,0.6)" }}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(PESOS_RAZA).map(([raza, cats]) => (
                    <tr key={raza} className="border-t" style={{ borderColor: "rgba(192,132,252,0.06)" }}>
                      <td className="py-1.5 pr-4 font-semibold text-white/60">{raza}</td>
                      {["Vaca adulta","Novilla","Ternero","Ternera","Toro"].map(c => (
                        <td key={c} className="py-1.5 px-2 text-center font-mono font-bold"
                          style={{ color: "#c084fc" }}>
                          {(cats as Record<string,number>)[c] ?? "—"} kg
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Banner guardado */}
          {sSaved && (
            <div className="rounded-xl p-3 flex items-center gap-3 mb-4"
              style={{ background: "rgba(57,255,126,0.1)", border: "1px solid rgba(57,255,126,0.4)" }}>
              <CheckCircle2 size={16} style={{ color: "#39ff7e" }}/>
              <div>
                <div className="font-black text-sm" style={{ color: "#39ff7e" }}>
                  Pesaje guardado — {sNombre.trim() || "Animal"} · {sPesoN.toFixed(1)} kg
                </div>
                <div className="text-[10px]" style={{ color: "rgba(57,255,126,0.6)" }}>
                  {saveToInv ? "Animal actualizado / creado en Inventario" : "Registro guardado en el sistema"}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4">

            {/* ── FORMULARIO PRINCIPAL ─────────────────────────── */}
            <div className="space-y-3">

              {/* IDENTIDAD */}
              <div className="rounded-2xl p-4 space-y-3"
                style={{ background: "rgba(192,132,252,0.04)", border: "1px solid rgba(192,132,252,0.18)" }}>
                <div className="text-[9px] font-black uppercase tracking-widest"
                  style={{ color: "rgba(192,132,252,0.5)" }}>Identidad del Animal</div>

                {/* Nombre */}
                <div>
                  <label className="text-[9px] font-black uppercase tracking-wider mb-1 block"
                    style={{ color: "rgba(192,132,252,0.45)" }}>Nombre del animal</label>
                  <Input value={sNombre} onChange={e => setSNombre(e.target.value)}
                    placeholder="Ej: Margarita, Estrella... (opcional)"
                    className="h-9 text-sm"
                    style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(192,132,252,0.25)", color: "white" }}/>
                </div>

                {/* Categorias */}
                <div>
                  <label className="text-[9px] font-black uppercase tracking-wider mb-1.5 block"
                    style={{ color: "rgba(192,132,252,0.45)" }}>Categoria</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {CATEGORIAS_LIST.map(c => {
                      const ci = CAT_ICON[c] || CAT_ICON["Vaca adulta"];
                      const sel = sCat === c;
                      return (
                        <button key={c} onClick={() => setSCat(c)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs transition-all"
                          style={{
                            background: sel ? `rgba(${ci.glow},0.2)` : "rgba(255,255,255,0.03)",
                            border: sel ? `1px solid rgba(${ci.glow},0.5)` : "1px solid rgba(255,255,255,0.07)",
                            color: sel ? ci.color : "rgba(255,255,255,0.35)",
                          }}>
                          <span>{ci.emoji}</span> {c}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Raza + Lote */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-wider mb-1 block"
                      style={{ color: "rgba(192,132,252,0.4)" }}>Raza</label>
                    <Select value={sRaza} onValueChange={setSRaza}>
                      <SelectTrigger className="h-9 text-sm"
                        style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(192,132,252,0.22)", color: "white" }}>
                        <SelectValue/>
                      </SelectTrigger>
                      <SelectContent>
                        {RAZAS_LIST.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-wider mb-1 block"
                      style={{ color: "rgba(192,132,252,0.4)" }}>Lote</label>
                    <Select value={sLote} onValueChange={setSLote}>
                      <SelectTrigger className="h-9 text-sm"
                        style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(192,132,252,0.22)", color: "white" }}>
                        <SelectValue/>
                      </SelectTrigger>
                      <SelectContent>
                        {LOTES_LIST.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* FECHA NACIMIENTO + EDAD */}
              <div className="rounded-2xl p-4 space-y-2"
                style={{ background: "rgba(0,200,255,0.04)", border: "1px solid rgba(0,200,255,0.16)" }}>
                <div className="text-[9px] font-black uppercase tracking-widest"
                  style={{ color: "rgba(0,200,255,0.5)" }}>
                  <CalendarDays size={9} className="inline mr-1"/>Fecha de Nacimiento
                </div>
                <div className="flex gap-3 items-center">
                  <Input type="date" value={sFechaNac} onChange={e => setSFechaNac(e.target.value)}
                    className="h-9 flex-1 text-sm"
                    style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(0,200,255,0.22)", color: "white" }}/>
                  {sFechaNac && (
                    <div className="flex-shrink-0 text-right">
                      <div className="text-[9px]" style={{ color: "rgba(0,200,255,0.5)" }}>Edad</div>
                      <div className="font-black text-xl"
                        style={{ color: "#00c8ff", fontFamily: "Sora,sans-serif" }}>
                        {sEdad.anios > 0 ? `${sEdad.anios}a ` : ""}{sEdad.meses % 12}m
                      </div>
                    </div>
                  )}
                </div>
                {sFechaNac && (
                  <div className="flex flex-wrap gap-1.5">
                    {(() => {
                      const etapa = sEdad.anios < 1 ? "Lactante / Destete"
                        : sEdad.anios < 2 ? "Cria en desarrollo"
                        : sEdad.anios < 3 ? "Joven / Novilla" : "Animal adulto";
                      const ec = sEdad.anios < 1 ? "#fb923c" : sEdad.anios < 2 ? "#fbbf24"
                        : sEdad.anios < 3 ? "#a78bfa" : "#00f5d4";
                      return (
                        <>
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold"
                            style={{ background: `${ec}18`, color: ec, border: `1px solid ${ec}30` }}>
                            {etapa}
                          </span>
                          <span className="text-[9px] px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)" }}>
                            {sEdad.meses} meses total
                          </span>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* NUMERO DE REGISTRO */}
              <div className="rounded-2xl p-4 space-y-2"
                style={{ background: "rgba(251,191,36,0.04)", border: "1px solid rgba(251,191,36,0.14)" }}>
                <div className="text-[9px] font-black uppercase tracking-widest"
                  style={{ color: "rgba(251,191,36,0.5)" }}>
                  <Hash size={9} className="inline mr-1"/>Numero de Registro
                </div>
                <div className="flex gap-2">
                  {(["si","no"] as const).map(v => (
                    <button key={v} onClick={() => setSRegistro(v)}
                      className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                      style={{
                        background: sRegistro===v ? (v==="si"?"rgba(251,191,36,0.18)":"rgba(255,255,255,0.06)") : "rgba(255,255,255,0.02)",
                        border: sRegistro===v ? (v==="si"?"1px solid rgba(251,191,36,0.45)":"1px solid rgba(255,255,255,0.18)") : "1px solid rgba(255,255,255,0.06)",
                        color: sRegistro===v ? (v==="si"?"#fbbf24":"rgba(255,255,255,0.6)") : "rgba(255,255,255,0.2)",
                      }}>
                      {v==="si" ? "Si tiene registro" : "Sin registro"}
                    </button>
                  ))}
                </div>
                {sRegistro==="si" && (
                  <Input value={sNumReg} onChange={e => setSNumReg(e.target.value)}
                    placeholder="Ej: REG-0042, COL-0123, ICA-2024-001..."
                    className="h-9 text-sm"
                    style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(251,191,36,0.3)", color: "#fbbf24" }}/>
                )}
              </div>

              {/* PESO DIGITAL */}
              <div className="rounded-2xl p-5"
                style={{ background: "rgba(0,0,0,0.55)", border: "1px solid rgba(192,132,252,0.2)" }}>
                <div className="text-[9px] font-black uppercase tracking-widest mb-3 text-center"
                  style={{ color: "rgba(192,132,252,0.45)" }}>PESO ACTUAL</div>

                <div className="flex items-center justify-center gap-3 mb-3">
                  {/* Botones menos */}
                  <div className="flex flex-col gap-2">
                    {([{d:-10},{d:-1},{d:-0.5}] as const).map(({d}) => (
                      <button key={d}
                        onClick={() => setSPeso(String(Math.max(0, sPesoN + d).toFixed(1)))}
                        className="w-14 h-11 rounded-xl font-black text-sm transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
                        style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", color: "#f87171" }}>
                        {d}
                      </button>
                    ))}
                  </div>

                  {/* Display numero grande */}
                  <div className="flex-1 text-center">
                    <input
                      type="number" step="0.5" min="0"
                      value={sPeso}
                      onChange={e => { setSPeso(e.target.value); setSSaved(false); }}
                      placeholder={String(sPesoAuto)}
                      className="w-full text-center font-black border-0 outline-none bg-transparent"
                      style={{
                        fontFamily: "JetBrains Mono,monospace",
                        fontSize: "clamp(40px,8vw,68px)",
                        color: "#c084fc",
                        textShadow: "0 0 32px rgba(192,132,252,0.8),0 0 60px rgba(192,132,252,0.3)",
                        letterSpacing: "2px",
                        lineHeight: 1.05,
                      }}
                    />
                    <div className="text-xs font-bold mt-1" style={{ color: "rgba(192,132,252,0.4)" }}>kilogramos</div>
                    <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full"
                        style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)" }}>
                        Ref. {sRaza}: {sPesoAuto} kg
                      </span>
                      {sPesoN > 0 && (
                        <span className="text-sm px-3 py-0.5 rounded-full font-black"
                          style={{
                            background: sPct >= 80 && sPct <= 120 ? "rgba(57,255,126,0.12)" : "rgba(251,191,36,0.12)",
                            color: sPct >= 80 && sPct <= 120 ? "#39ff7e" : "#fbbf24",
                            border: `1px solid ${sPct >= 80 && sPct <= 120 ? "rgba(57,255,126,0.3)" : "rgba(251,191,36,0.3)"}`,
                          }}>
                          {sPct}% del estandar
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Botones mas */}
                  <div className="flex flex-col gap-2">
                    {([{d:10},{d:1},{d:0.5}] as const).map(({d}) => (
                      <button key={d}
                        onClick={() => setSPeso(String((sPesoN + d).toFixed(1)))}
                        className="w-14 h-11 rounded-xl font-black text-sm transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
                        style={{ background: "rgba(57,255,126,0.1)", border: "1px solid rgba(57,255,126,0.25)", color: "#39ff7e" }}>
                        +{d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Barra de progreso vs estandar */}
                {sPesoN > 0 && (
                  <div className="mt-2">
                    <div className="flex justify-between text-[9px] mb-1"
                      style={{ color: "rgba(255,255,255,0.25)" }}>
                      <span>vs. estandar {sRaza} {sCat}</span>
                      <span style={{ color: "#c084fc" }}>{sPct}%</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(sPct,100)}%`,
                          background: "linear-gradient(90deg,#c084fc,#a855f7)",
                          boxShadow: "0 0 10px rgba(192,132,252,0.5)",
                        }}/>
                    </div>
                  </div>
                )}

                {/* BT / IA / Auto */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <button onClick={sBtSim} disabled={sBtLoading||sAiLoading}
                    className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl font-bold text-xs transition-all hover:scale-[1.02] disabled:opacity-60"
                    style={{ background: "rgba(0,200,255,0.1)", border: "1px solid rgba(0,200,255,0.3)", color: "#00c8ff" }}>
                    <Bluetooth size={14} className={sBtLoading ? "animate-pulse" : ""}/>
                    {sBtLoading ? "Leyendo..." : "Leer BT"}
                  </button>
                  <button onClick={sAiEstimate} disabled={sAiLoading||sBtLoading}
                    className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl font-bold text-xs transition-all hover:scale-[1.02] disabled:opacity-60"
                    style={{ background: "rgba(232,121,249,0.1)", border: "1px solid rgba(232,121,249,0.35)", color: "#e879f9" }}>
                    <Brain size={14} className={sAiLoading ? "animate-spin" : ""}/>
                    {sAiLoading ? "IA calc..." : "Peso IA"}
                  </button>
                  <button onClick={() => setSPeso(String(sPesoAuto))}
                    className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl font-bold text-xs transition-all hover:scale-[1.02]"
                    style={{ background: "rgba(255,149,0,0.1)", border: "1px solid rgba(255,149,0,0.3)", color: "#ff9500" }}>
                    <Zap size={14}/> Prom. raza
                  </button>
                </div>

                {sAiLoading && (
                  <div className="rounded-xl p-2.5 text-center mt-2"
                    style={{ background: "rgba(232,121,249,0.06)", border: "1px solid rgba(232,121,249,0.2)" }}>
                    <div className="text-[10px] font-bold" style={{ color: "#e879f9" }}>
                      IA calculando peso para {sCat} · {sRaza}{sEdad.meses > 0 ? ` · ${sEdad.meses} meses` : ""}...
                    </div>
                  </div>
                )}
              </div>

              {/* CONDICION CORPORAL */}
              <div className="rounded-2xl p-4"
                style={{ background: "rgba(192,132,252,0.04)", border: "1px solid rgba(192,132,252,0.12)" }}>
                <div className="text-[9px] font-black uppercase tracking-widest mb-2.5"
                  style={{ color: "rgba(192,132,252,0.5)" }}>Condicion Corporal (CC)</div>
                <div className="flex flex-wrap gap-1.5">
                  {CC_OPTS.map(c => {
                    const sel = sCC === c.val;
                    return (
                      <button key={c.val} onClick={() => setSCC(c.val)}
                        className="flex flex-col items-center px-2 py-1.5 rounded-xl transition-all hover:scale-110 active:scale-95"
                        style={{
                          background: sel ? `${c.color}22` : "rgba(255,255,255,0.03)",
                          border: sel ? `2px solid ${c.color}80` : "1px solid rgba(255,255,255,0.08)",
                          boxShadow: sel ? `0 0 10px ${c.color}40` : "none",
                          minWidth: 42,
                        }}>
                        <span className="text-base">{c.emoji}</span>
                        <span className="text-[9px] font-black"
                          style={{ color: sel ? c.color : "rgba(255,255,255,0.4)" }}>{c.val}</span>
                      </button>
                    );
                  })}
                </div>
                {sCC && (
                  <div className="mt-2 text-[10px] flex items-center gap-1.5">
                    <span style={{ color: "rgba(192,132,252,0.5)" }}>Seleccionado:</span>
                    <span className="font-bold"
                      style={{ color: CC_OPTS.find(c => c.val===sCC)?.color }}>
                      CC {sCC} — {CC_OPTS.find(c => c.val===sCC)?.label}
                    </span>
                  </div>
                )}
              </div>

              {/* FOTOS */}
              <div className="rounded-2xl p-4 space-y-3"
                style={{ background: "rgba(0,245,212,0.04)", border: "1px solid rgba(0,245,212,0.15)" }}>
                <div className="flex items-center justify-between">
                  <div className="text-[9px] font-black uppercase tracking-widest"
                    style={{ color: "rgba(0,245,212,0.5)" }}>
                    <Camera size={9} className="inline mr-1"/>Evidencia Fotografica
                  </div>
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full"
                    style={{ background: "rgba(0,245,212,0.08)", color: "rgba(0,245,212,0.5)", border: "1px solid rgba(0,245,212,0.15)" }}>
                    {sFotos.length} foto{sFotos.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Visor indicador variable por categoria */}
                <div className="flex flex-col items-center gap-1.5 py-1">
                  <div className="text-[8px] font-bold uppercase tracking-wide"
                    style={{ color: "rgba(0,245,212,0.4)" }}>Foto del Indicador de Pesaje</div>
                  <div className="relative flex items-center justify-center transition-all duration-300"
                    style={{ width: sFrame.w, height: sFrame.h }}>
                    {sIndFoto ? (
                      <div className="relative w-full h-full">
                        <img src={sIndFoto.url} alt="Indicador"
                          className="w-full h-full object-cover rounded-lg"
                          style={{ border: "2px solid rgba(0,245,212,0.6)" }}/>
                        <button onClick={() => sRemoveFoto(sIndFoto.id)}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black"
                          style={{ background: "#f87171", color: "white" }}>X</button>
                      </div>
                    ) : (
                      <div className="w-full h-full rounded-lg flex flex-col items-center justify-center relative"
                        style={{ background: "rgba(0,0,0,0.4)", border: "2px dashed rgba(0,245,212,0.2)" }}>
                        <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 rounded-tl"
                          style={{ borderColor: "rgba(0,245,212,0.55)" }}/>
                        <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 rounded-tr"
                          style={{ borderColor: "rgba(0,245,212,0.55)" }}/>
                        <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 rounded-bl"
                          style={{ borderColor: "rgba(0,245,212,0.55)" }}/>
                        <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 rounded-br"
                          style={{ borderColor: "rgba(0,245,212,0.55)" }}/>
                        <span className="text-xs text-white/30">sin foto</span>
                      </div>
                    )}
                  </div>
                  <div className="text-[7px]" style={{ color: "rgba(0,245,212,0.25)" }}>{sFrame.label}</div>
                  {!sIndFoto && (
                    <div className="flex gap-1.5">
                      <button onClick={() => sCamRef.current?.click()}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg text-[9px] font-bold hover:scale-105"
                        style={{ background: "rgba(0,245,212,0.12)", border: "1px solid rgba(0,245,212,0.35)", color: "#00f5d4" }}>
                        <Camera size={10}/> Camara
                      </button>
                      <button onClick={() => sFileRef.current?.click()}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg text-[9px] font-bold hover:scale-105"
                        style={{ background: "rgba(0,245,212,0.06)", border: "1px solid rgba(0,245,212,0.2)", color: "rgba(0,245,212,0.6)" }}>
                        <Upload size={10}/> Galeria
                      </button>
                    </div>
                  )}
                </div>

                {/* Lateral + Completa */}
                <div className="grid grid-cols-2 gap-1.5">
                  {([
                    { tipo: "lateral"  as const, label: "Lateral" },
                    { tipo: "completa" as const, label: "Completa" },
                  ]).map(({ tipo, label }) => {
                    const tipoFoto = sFotos.find(f => f.tipo === tipo);
                    return (
                      <div key={tipo} className="flex flex-col gap-1">
                        <div className="text-[8px] text-center font-bold"
                          style={{ color: "rgba(0,245,212,0.45)" }}>{label}</div>
                        {tipoFoto ? (
                          <div className="relative">
                            <img src={tipoFoto.url} alt={label}
                              className="w-full h-16 object-cover rounded-lg"
                              style={{ border: "1px solid rgba(0,245,212,0.4)" }}/>
                            <button onClick={() => sRemoveFoto(tipoFoto.id)}
                              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black"
                              style={{ background: "#f87171", color: "white" }}>X</button>
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            <button
                              onClick={() => { if (sCamRef.current) { sCamRef.current.dataset.tipo = tipo; sCamRef.current.click(); } }}
                              className="flex-1 flex items-center justify-center py-2 rounded-lg text-[9px] font-bold hover:scale-105"
                              style={{ background: "rgba(0,245,212,0.08)", border: "1px solid rgba(0,245,212,0.2)", color: "#00f5d4" }}>
                              <Camera size={10}/>
                            </button>
                            <button
                              onClick={() => { if (sFileRef.current) { sFileRef.current.dataset.tipo = tipo; sFileRef.current.click(); } }}
                              className="flex-1 flex items-center justify-center py-2 rounded-lg text-[9px] font-bold hover:scale-105"
                              style={{ background: "rgba(0,245,212,0.08)", border: "1px solid rgba(0,245,212,0.2)", color: "#00f5d4" }}>
                              <Upload size={10}/>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Inputs ocultos camara / galeria */}
                <input ref={sCamRef} type="file" accept="image/*" capture="environment" className="hidden"
                  onChange={e => {
                    const tipo = (sCamRef.current?.dataset.tipo as AnimalPhoto["tipo"]) || "indicador";
                    sFotoUpload(e.target.files, tipo);
                    if (sCamRef.current) sCamRef.current.dataset.tipo = "";
                  }}/>
                <input ref={sFileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => {
                    const tipo = (sFileRef.current?.dataset.tipo as AnimalPhoto["tipo"]) || "indicador";
                    sFotoUpload(e.target.files, tipo);
                    if (sFileRef.current) sFileRef.current.dataset.tipo = "";
                  }}/>

                {sFotos.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {sFotos.map(foto => (
                      <div key={foto.id} className="relative group">
                        <img src={foto.url} alt={foto.label}
                          className="w-20 h-16 object-cover rounded-lg"
                          style={{ border: "1px solid rgba(0,245,212,0.3)" }}/>
                        <div className="absolute bottom-0 left-0 right-0 text-[7px] text-center py-0.5 rounded-b-lg"
                          style={{ background: "rgba(0,0,0,0.6)", color: "rgba(0,245,212,0.8)" }}>
                          {foto.label}
                        </div>
                        <button onClick={() => sRemoveFoto(foto.id)}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: "#f87171", color: "white" }}>X</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* VALOR POR KG */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-3"
                  style={{ background: "rgba(57,255,126,0.04)", border: "1px solid rgba(57,255,126,0.14)" }}>
                  <div className="text-[9px] font-black uppercase tracking-wider mb-1.5"
                    style={{ color: "rgba(57,255,126,0.5)" }}>$/kg</div>
                  <Input type="number" step="500" value={sValorKilo}
                    onChange={e => setSValorKilo(e.target.value)}
                    className="h-9 text-center font-mono"
                    style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(57,255,126,0.2)", color: "#39ff7e" }}/>
                </div>
                <div className="rounded-xl p-3"
                  style={{ background: "rgba(57,255,126,0.04)", border: "1px solid rgba(57,255,126,0.14)" }}>
                  <div className="text-[9px] font-black uppercase tracking-wider mb-1.5 text-white/30">Valor animal</div>
                  <div className="h-9 flex items-center font-black text-base"
                    style={{ color: sValor > 0 ? "#39ff7e" : "rgba(255,255,255,0.2)", fontFamily: "Sora,sans-serif" }}>
                    {sValor > 0 ? fmt(sValor) : "—"}
                  </div>
                </div>
              </div>

              {/* OBSERVACIONES */}
              <div>
                <div className="text-[9px] font-black uppercase tracking-wider mb-1.5"
                  style={{ color: "rgba(255,255,255,0.2)" }}>Observaciones</div>
                <textarea value={sObs} onChange={e => setSobs(e.target.value)}
                  placeholder="Notas del pesaje, tratamientos, comportamiento..."
                  rows={2} className="w-full rounded-xl p-2.5 text-xs resize-none"
                  style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.07)",
                    color: "rgba(255,255,255,0.6)", outline: "none" }}/>
              </div>

              {/* ACCIONES */}
              <div className="grid grid-cols-2 gap-2">
                <button onClick={sPrint}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02]"
                  style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.3)", color: "#a78bfa" }}>
                  <Printer size={13}/> Imprimir recibo
                </button>
                <button onClick={sWA}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02]"
                  style={{ background: "rgba(57,255,126,0.08)", border: "1px solid rgba(57,255,126,0.25)", color: "#39ff7e" }}>
                  <Share2 size={13}/> WhatsApp
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={sReset}
                  className="flex items-center justify-center gap-1.5 py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.02]"
                  style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171" }}>
                  <RotateCcw size={14}/> Limpiar
                </button>
                <button onClick={sSaveData} disabled={!sPesoN}
                  className="flex items-center justify-center gap-1.5 py-3 rounded-xl font-black text-sm transition-all hover:scale-[1.02] disabled:opacity-40"
                  style={{
                    background: sSaved ? "rgba(57,255,126,0.08)" : "rgba(57,255,126,0.15)",
                    border: sSaved ? "1px solid rgba(57,255,126,0.25)" : "1px solid rgba(57,255,126,0.45)",
                    color: "#39ff7e",
                  }}>
                  {sSaved ? <><CheckCircle2 size={14}/> Guardado</> : <><Save size={14}/> Guardar pesaje</>}
                </button>
              </div>

              {/* Toggle guardar en inventario */}
              <button onClick={() => setSaveToInv(!saveToInv)}
                className="w-full flex items-center gap-3 rounded-xl p-3 transition-all hover:opacity-80"
                style={{
                  background: saveToInv ? "rgba(251,191,36,0.08)" : "rgba(255,255,255,0.02)",
                  border: saveToInv ? "1px solid rgba(251,191,36,0.25)" : "1px solid rgba(255,255,255,0.06)",
                }}>
                <div className="w-8 h-5 rounded-full relative flex-shrink-0"
                  style={{
                    background: saveToInv ? "rgba(251,191,36,0.3)" : "rgba(255,255,255,0.08)",
                    border: saveToInv ? "1px solid rgba(251,191,36,0.5)" : "1px solid rgba(255,255,255,0.12)",
                  }}>
                  <div className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                    style={{ left: saveToInv ? "calc(100% - 18px)" : "2px",
                      background: saveToInv ? "#fbbf24" : "rgba(255,255,255,0.3)" }}/>
                </div>
                <span className="text-[10px] text-left"
                  style={{ color: saveToInv ? "#fbbf24" : "rgba(255,255,255,0.3)" }}>
                  {saveToInv ? "Guardar tambien en Inventario de Animales" : "Solo guardar pesaje (sin agregar al inventario)"}
                </span>
              </button>

            </div>{/* fin formulario principal */}

            {/* ── PANEL DERECHO: Inventario opcional ──────────── */}
            <div>
              <div className="rounded-2xl overflow-hidden sticky top-4"
                style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                <button onClick={() => setInvOpen(!invOpen)}
                  className="w-full px-4 py-3 flex items-center gap-2 text-left"
                  style={{ background: "rgba(255,255,255,0.04)",
                    borderBottom: invOpen ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
                  <Users size={13} style={{ color: "rgba(255,255,255,0.4)", flexShrink: 0 }}/>
                  <span className="font-bold text-xs text-white/70">Inventario</span>
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full ml-1"
                    style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }}>
                    opcional
                  </span>
                  <span className="ml-auto text-[10px]"
                    style={{ color: "rgba(255,255,255,0.25)" }}>{invOpen ? "▲" : "▼"}</span>
                </button>

                {invOpen && (
                  <div style={{ background: "rgba(0,0,0,0.2)" }}>
                    <div className="px-3 py-2 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                      <div className="text-[9px] mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>
                        Toca un animal para prellenar el formulario
                      </div>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2" size={10}
                          style={{ color: "rgba(255,255,255,0.3)" }}/>
                        <Input value={invSearch} onChange={e => setInvSearch(e.target.value)}
                          placeholder="Buscar..." className="pl-7 h-7 text-xs"
                          style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.08)", color: "white" }}/>
                      </div>
                    </div>
                    <div className="overflow-y-auto" style={{ maxHeight: 380 }}>
                      {animals
                        .filter(a =>
                          !invSearch ||
                          a.nombre.toLowerCase().includes(invSearch.toLowerCase()) ||
                          a.raza.toLowerCase().includes(invSearch.toLowerCase()) ||
                          a.id.toLowerCase().includes(invSearch.toLowerCase()))
                        .slice(0, 40)
                        .map(a => {
                          const ci = CAT_ICON[a.categoria] || CAT_ICON["Vaca adulta"];
                          const isPrefilled = sNombre.toLowerCase() === a.nombre.toLowerCase();
                          return (
                            <button key={a.id}
                              onClick={() => sPrefillFromInventory(a)}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-all hover:bg-white/[0.025] border-b"
                              style={{
                                borderColor: "rgba(255,255,255,0.04)",
                                background: isPrefilled ? `rgba(${ci.glow},0.07)` : "transparent",
                                borderLeft: isPrefilled ? `3px solid ${ci.color}` : "3px solid transparent",
                              }}>
                              <span className="text-base flex-shrink-0">{ci.emoji}</span>
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-xs truncate"
                                  style={{ color: isPrefilled ? ci.color : "rgba(255,255,255,0.8)" }}>
                                  {a.nombre}
                                </div>
                                <div className="text-[9px]" style={{ color: "rgba(255,255,255,0.28)" }}>
                                  <span style={{ color: ci.color }}>{a.raza}</span> · {a.lote}
                                </div>
                              </div>
                              <div className="font-mono text-[10px] text-white/30 flex-shrink-0">{a.peso} kg</div>
                            </button>
                          );
                        })}
                      {animals.length === 0 && (
                        <div className="p-4 text-center text-[10px] text-white/20">Sin animales en inventario</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── SESSION LOG ─────────────────────────────────── */}
          {sLog.length > 0 && (
            <div className="rounded-2xl overflow-hidden mt-2"
              style={{ border: "1px solid rgba(192,132,252,0.15)" }}>
              <div className="px-4 py-3 flex items-center gap-2"
                style={{ background: "rgba(192,132,252,0.05)", borderBottom: "1px solid rgba(192,132,252,0.1)" }}>
                <CheckCircle2 size={13} style={{ color: "#39ff7e" }}/>
                <span className="font-bold text-sm text-white">
                  Sesion — {sLog.length} pesaje{sLog.length !== 1 ? "s" : ""} registrado{sLog.length !== 1 ? "s" : ""}
                </span>
                <button onClick={() => window.print()}
                  className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold"
                  style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.25)", color: "#a78bfa" }}>
                  <Printer size={11}/> Imprimir
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: "rgba(192,132,252,0.03)", borderBottom: "1px solid rgba(192,132,252,0.08)" }}>
                      {["Animal","Raza","Categoria","Peso","Ant.","CC","Valor","Fotos","Hora"].map(h => (
                        <th key={h} className="text-left px-4 py-2.5 text-[9px] font-black uppercase tracking-wider"
                          style={{ color: "rgba(192,132,252,0.5)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sLog.map((r, i) => {
                      const ccInfo = CC_OPTS.find(c => c.val === r.cc);
                      const ci = CAT_ICON[r.cat] || CAT_ICON["Vaca adulta"];
                      return (
                        <tr key={i} className="border-b hover:bg-white/[0.012] transition-colors"
                          style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                          <td className="px-4 py-2.5 font-bold text-white">{r.nombre}</td>
                          <td className="px-4 py-2.5 text-white/50 text-[10px]">{r.raza}</td>
                          <td className="px-4 py-2.5">
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                              style={{ background: ci.bg, color: ci.color, border: `1px solid ${ci.border}` }}>
                              {ci.emoji} {r.cat}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-black"
                            style={{ color: "#c084fc", fontFamily: "Sora,sans-serif" }}>{r.peso.toFixed(1)} kg</td>
                          <td className="px-4 py-2.5 text-white/35">{r.anterior > 0 ? `${r.anterior} kg` : "—"}</td>
                          <td className="px-4 py-2.5">
                            <span className="font-bold"
                              style={{ color: ccInfo?.color || "#888" }}>{ccInfo?.emoji} {r.cc}</span>
                          </td>
                          <td className="px-4 py-2.5 font-semibold"
                            style={{ color: "#39ff7e" }}>{r.valor > 0 ? fmt(r.valor) : "—"}</td>
                          <td className="px-4 py-2.5 text-white/30 text-[10px]">
                            {r.nFotos > 0 ? `Fotos: ${r.nFotos}` : "—"}
                          </td>
                          <td className="px-4 py-2.5 text-white/25">{r.hora}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </TabsContent>"""

# ── write safely: temp file then rename ──────────────────────────────────────
before = content[:t1_start]
after  = content[tab1_end_pos:]
new_content = before + NEW_TAB1 + after

with open(TMPFILE, "w", encoding="utf-8") as f:
    f.write(new_content)

shutil.move(TMPFILE, FILE)
print(f"OK — wrote {len(new_content)} chars ({new_content.count(chr(10))} lines)")
print(f"Old Tab1: {tab1_end_pos - t1_start} chars  |  New Tab1: {len(NEW_TAB1)} chars")
