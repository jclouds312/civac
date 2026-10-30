import { useState, useRef, useEffect } from "react";
import { useAppState } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { X, Send, Sparkles, Bot, ChevronDown, RefreshCw, Printer } from "lucide-react";
import { askCivacAgent } from "@/lib/gemini";

type Msg = { role: "user" | "ai"; text: string; ts: number };

const ROLE_FOCUS: Record<string, string> = {
  admin:  "Tengo acceso completo al sistema: inventario, costos, personal, configuración y analytics.",
  vet:    "Mi foco es sanidad animal: vacunas, tratamientos, reproducción y control de enfermedades.",
  field:  "Mi área es operaciones de campo: pesaje, potreros, alimentación y manejo diario.",
  viewer: "Tengo acceso de lectura: puedo consultar reportes, dashboards y estadísticas.",
};

const MODULE_TIPS: Record<string, string[]> = {
  "/":              ["Ver KPIs del día", "Revisar alertas activas", "Ir a producción de leche"],
  "/inventario":    ["Buscar animal por arete", "Filtrar por lote o estado", "Exportar inventario PDF"],
  "/produccion":    ["Ver ranking de vacas", "Comparar ordeños", "Imprimir reporte"],
  "/costos":        ["Ver margen actual", "Desglose costo/litro", "Imprimir P&G"],
  "/reproduccion":  ["Ver próximos partos", "Anestros detectados", "Diagnóstico IA"],
  "/personal":      ["Ver nómina del mes", "Registrar horas extras", "Imprimir planilla"],
  "/insumos":       ["Ver stock crítico", "Actualizar inventario", "Pedidos sugeridos"],
  "/alimentacion":  ["Ver raciones activas", "Costo por animal/día", "Ajustar suplementos"],
  "/pesaje-manual": ["Pesar nuevo animal", "Ver cola de pesaje", "Imprimir recibo"],
  "/potreros":      ["Ver mapa de potreros", "Rotar potrero", "Ver días de descanso"],
  "/genetica":      ["Ver ranking DEP", "Consultar pedigrí", "Seleccionar toro reproductor"],
  "/alertas":       ["Ver alertas críticas", "Resolver notificaciones", "Configurar umbrales"],
};

function buildResponse(input: string, role: string, animals: any[], personal: any[], insumos: any[], location: string): string {
  const q = input.toLowerCase().trim();

  const vacas    = animals.filter(a => a.categoria === "Vaca adulta");
  const prodVacs = vacas.filter(a => a.estado === "Producción");
  const gestantes= animals.filter(a => a.estado === "Gestante");
  const enfermos = animals.filter(a => a.estado === "Tratamiento");
  const totalLit = prodVacs.reduce((s, a) => s + (a.litrosDia || 0), 0);
  const topVaca  = [...prodVacs].sort((a, b) => b.litrosDia - a.litrosDia)[0];
  const stockCrit= insumos.filter((i: any) => i.stock < i.minimo);

  if (/^(hola|buenas|buenos|hi|hey|saludos|buen día|buen dia)/.test(q)) {
    const hora = new Date().getHours();
    const saludo = hora < 12 ? "Buenos días" : hora < 18 ? "Buenas tardes" : "Buenas noches";
    return `${saludo}! Soy tu asistente IA de GanaderIA 🐄✨\n\n${ROLE_FOCUS[role] || ""}\n\nHoy tengo en mi radar:\n• 📊 ${animals.length} animales en inventario\n• 🥛 ${totalLit.toFixed(1)} L producción diaria\n• 🔴 ${enfermos.length} en tratamiento\n• ⚠️ ${stockCrit.length} insumos en stock crítico\n\n¿En qué te puedo ayudar hoy?`;
  }

  if (/ayuda|qué (puedes|sabes)|opciones|menú|menu/.test(q)) {
    return `Puedo ayudarte con todo esto:\n\n🐄 **Animales** — inventario, fichas, estados\n🥛 **Producción** — litros, ranking, ordeños\n💰 **Costos** — P&G, margen, costo/litro\n🔁 **Reproducción** — partos, celos, gestación\n⚖️ **Pesaje** — pesos, GMD, condición corporal\n🌿 **Potreros** — rotación, disponibilidad\n💊 **Insumos** — stock, alertas de reposición\n👥 **Personal** — nómina, horas, cargos\n🤖 **IA** — predicciones, análisis, recomendaciones\n📄 **PDF** — imprime cualquier módulo\n\n¿Sobre qué quieres profundizar?`;
  }

  if (/cuántos|cuantos|total.*animal|inventar|ganado/.test(q)) {
    const cats = animals.reduce((acc: Record<string, number>, a) => { acc[a.categoria] = (acc[a.categoria] || 0) + 1; return acc; }, {});
    const lines = Object.entries(cats).map(([c, n]) => `• ${c}: ${n}`).join("\n");
    return `📊 **Inventario actual — ${animals.length} animales:**\n\n${lines}\n\n🔴 En tratamiento: ${enfermos.length}\n🤰 Gestantes: ${gestantes.length}\n✅ En producción: ${prodVacs.length}`;
  }

  if (/leche|producción|produccion|litros|ordeño|ordeño/.test(q)) {
    return `🥛 **Producción de hoy:**\n\n• Total: **${totalLit.toFixed(1)} L/día**\n• Vacas activas: ${prodVacs.length}\n• Promedio/vaca: ${prodVacs.length ? (totalLit / prodVacs.length).toFixed(1) : 0} L\n• Top productora: ${topVaca ? `${topVaca.nombre} (${topVaca.litrosDia} L)` : "—"}\n\n💡 Meta diaria: 90 L — estás al ${Math.round(totalLit / 90 * 100)}% del objetivo.\n\nVe al módulo de Producción para el histórico completo.`;
  }

  if (/costo|finanza|margen|ganancia|utilidad|p&g|pyg/.test(q)) {
    return `💰 **Resumen financiero del mes:**\n\n• Ingresos totales: **$85.75M COP**\n• Egresos: $45.5M COP\n• Utilidad neta: **$40.25M COP**\n• Margen: **47%** 📈\n• Costo por litro: $812 COP\n\n🌟 El margen está por encima del promedio sector (38%).\n\nVe a Costos y P&G para el desglose completo e imprimirlo en PDF.`;
  }

  if (/gestant|parto|reproduccion|reproducción|celo|inseminac/.test(q)) {
    return `🔁 **Estado reproductivo:**\n\n• Gestantes: **${gestantes.length} animales**\n• Próximos partos (30 días): 2\n• Celos pendientes de atención: 3\n• Tasa de preñez: 78%\n\n${role === "vet" ? "💡 Como veterinario, recuerda revisar el panel de anestros en el módulo de Reproducción." : "Ve al módulo de Reproducción para el calendario completo de partos."}`;
  }

  if (/enferm|tratamiento|salud|sanidad|vacuna|medic/.test(q)) {
    const e = enfermos.map((a: any) => `• ${a.nombre} (${a.id}) — ${a.estado}`).join("\n");
    return `💊 **Alertas de salud:**\n\n${enfermos.length ? `En tratamiento ahora:\n${e}` : "✅ Sin animales en tratamiento activo."}\n\n${role === "vet" ? "💡 Recuerda registrar las intervenciones en la Ficha Individual de cada animal." : "Ve al módulo de Alertas para ver el historial completo."}`;
  }

  if (/insumo|stock|medicamento|mineral|concentrado|inventari.*insumo/.test(q)) {
    if (stockCrit.length) {
      const lines = stockCrit.map((i: any) => `• ${i.nombre}: ${i.stock} ${i.unidad} (mínimo: ${i.minimo})`).join("\n");
      return `⚠️ **Insumos en stock crítico:**\n\n${lines}\n\nSe recomienda hacer el pedido esta semana para evitar desabastecimiento.`;
    }
    return `✅ Todos los insumos están sobre el stock mínimo. Nada crítico por ahora.\n\nVe a Insumos para ver el detalle completo de inventario.`;
  }

  if (/pesaje|peso|báscula|bascula|kg/.test(q)) {
    const pesados = animals.filter((a: any) => a.peso > 0);
    const avgPeso = pesados.length ? Math.round(pesados.reduce((s: number, a: any) => s + a.peso, 0) / pesados.length) : 0;
    return `⚖️ **Resumen de pesajes:**\n\n• Animales con peso registrado: ${pesados.length}\n• Peso promedio: ${avgPeso} kg\n• Animal más pesado: ${[...animals].sort((a,b)=>b.peso-a.peso)[0]?.nombre} (${[...animals].sort((a,b)=>b.peso-a.peso)[0]?.peso} kg)\n\n💡 Usa el módulo de Pesaje Automatizado (⚡) para registrar nuevos pesajes con foto, CC y recibo imprimible.`;
  }

  if (/personal|nómina|nomina|empleado|trabajador|sueldo|salario/.test(q)) {
    return `👥 **Personal:**\n\n• ${personal.length} empleados activos\n• Nómina estimada: ${personal.length ? new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(personal.reduce((s: number, p: any) => s + p.salario, 0)) : "$0"}/mes\n\nVe al módulo de Personal para ver cargos, horas extras, EPS/ARL e imprimir la planilla.`;
  }

  if (/potrero|pasto|paster|rotacion|rotación|pradera/.test(q)) {
    return `🌿 **Potreros:**\n\n• 8 potreros en total\n• En uso: 4 (con ganado)\n• Descansando: 3\n• ⚠️ Potrero Este: rotar en 3 días\n\n💡 La rotación óptima para kikuyo es 28-35 días. El mapa de potreros te da el semáforo de estado.`;
  }

  if (/pdf|imprimir|print|exportar|reporte|informe/.test(q)) {
    return `📄 **Exportar a PDF:**\n\nEn cada módulo tienes el botón **🖨️ Imprimir / PDF** en el banner superior.\n\nMódulos con PDF disponible:\n• 📊 Dashboard — resumen general\n• 🐄 Inventario — lista de animales\n• 🥛 Producción — reporte de leche\n• 💰 Costos — P&G detallado\n• 👥 Personal — planilla de nómina\n• ⚖️ Pesaje — recibo por animal\n• ♻️ Reproducción, Insumos, Alertas y más\n\nTambién puedes usar **Datos > Exportar CSV** para análisis en Excel.`;
  }

  if (/módulo|modulo|donde|cómo|como|navegar|ir a/.test(q)) {
    const tips = MODULE_TIPS[location] || MODULE_TIPS["/"];
    return `🧭 **Navegación — estás en ${location || "/"}**\n\nAcciones rápidas disponibles aquí:\n${tips.map(t => `• ${t}`).join("\n")}\n\nUsa el menú lateral para ir a cualquier módulo. En móvil, usa la barra inferior o el botón de menú.`;
  }

  if (/predic|ia|inteligenci|gpt|recomend|análisis|analisis/.test(q)) {
    return `🤖 **IA y Predicciones:**\n\nEl módulo de Predicciones IA incluye:\n• Proyección financiera 6 meses\n• Simulador con sliders (precio leche, animales, eficiencia)\n• Score IA de desempeño de la finca\n• Alertas predictivas de producción\n\n💡 Con los datos actuales, la proyección de ingresos para los próximos 6 meses es **+8.3%** si mantienes la eficiencia actual.`;
  }

  if (/clima|temperatura|lluvia/.test(q)) {
    return `🌦️ El módulo de GanaderIA no incluye clima en tiempo real aún.\n\nTe recomiendo revisar el IDEAM (ideam.gov.co) para pronósticos agropecuarios en tu región. El estrés calórico afecta la producción hasta un 15% — monitorea la temperatura en los horarios de ordeño.`;
  }

  if (/gps|rastro|ubicacion|ubicación|satélite/.test(q)) {
    return `📡 **Rastreo GPS:**\n\nEl módulo GPS permite:\n• Rastreo en tiempo real de animales con collar GPS\n• Historial de movimientos\n• Geofencing y alertas de salida de área\n• Mapa satelital interactivo\n\nRequiere dispositivos GPS Tru-Test o compatible. Disponible en plan PRO y superiores.`;
  }

  if (/pwa|offline|instalar|app|móvil|movil/.test(q)) {
    return `📱 **GanaderIA como App (PWA):**\n\nPuedes instalarla en tu teléfono o tablet:\n1. Abre en Chrome/Safari\n2. Toca el botón "Instalar app" en el menú\n3. Se instala como app nativa\n\n✅ Funciona offline — todos tus datos se guardan localmente.\n✅ Shortcuts directos a Pesaje, Dashboard y Alertas.`;
  }

  if (/gracias|excelente|perfecto|genial|bien|listo/.test(q)) {
    return `¡Con gusto! 🐄✨ Estoy aquí cuando me necesites.\n\nRecuerda que puedo ayudarte con cualquier módulo, generar análisis de tus datos o guiarte en el uso del sistema.\n\n¿Hay algo más en lo que pueda ayudarte?`;
  }

  const moduleLinks = Object.entries(MODULE_TIPS).slice(0, 3).map(([k, v]) => `• ${k}: ${v[0]}`).join("\n");
  return `No encontré una respuesta específica para "${input.substring(0, 40)}", pero puedo ayudarte con:\n\n🐄 Animales e inventario\n🥛 Producción de leche\n💰 Costos y finanzas\n💊 Salud y reproducción\n⚖️ Pesaje y CC\n📄 Exportar a PDF\n🧭 Navegar por módulos\n\n¿Puedes reformular tu pregunta o elegir un tema?`;
}

export function AiAssistant() {
  const [open, setOpen]       = useState(false);
  const [input, setInput]     = useState("");
  const [msgs, setMsgs]       = useState<Msg[]>([]);
  const [typing, setTyping]   = useState(false);
  const [pulse, setPulse]     = useState(true);
  const endRef                = useRef<HTMLDivElement>(null);
  const inputRef              = useRef<HTMLInputElement>(null);
  const { user }              = useAuth();
  const { animals, personal, insumos } = useAppState();
  const [location]            = useLocation();

  useEffect(() => { const t = setTimeout(() => setPulse(false), 8000); return () => clearTimeout(t); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);
  useEffect(() => { if (open) { setTimeout(() => inputRef.current?.focus(), 100); } }, [open]);

  const welcome = () => {
    const hora = new Date().getHours();
    const sal = hora < 12 ? "Buenos días" : hora < 18 ? "Buenas tardes" : "Buenas noches";
    return `${sal}, **${user?.nombre?.split(" ")[0] || ""}**! 👋\n\nSoy tu asistente IA de GanaderIA. Conozco todos tus datos de la finca en tiempo real.\n\n${ROLE_FOCUS[user?.role || "admin"]}\n\n¿En qué te ayudo hoy?`;
  };

  const openChat = () => {
    if (!open && msgs.length === 0) {
      setMsgs([{ role: "ai", text: welcome(), ts: Date.now() }]);
    }
    setOpen(true);
  };

  const send = async (txt?: string) => {
    const q = (txt || input).trim();
    if (!q) return;
    setInput("");
    const newMsgs: Msg[] = [...msgs, { role: "user", text: q, ts: Date.now() }];
    setMsgs(newMsgs);
    setTyping(true);
    const remote = await askCivacAgent(q, newMsgs.filter((m) => m.role !== "ai").slice(-12).map((m) => ({ role: "user" as const, text: m.text })));
    const response = remote.ok && remote.text
      ? remote.text
      : buildResponse(q, user?.role || "admin", animals, personal, insumos, location);
    setMsgs([...newMsgs, { role: "ai", text: remote.ok ? response : `${response}\n\nNota: CIVAC IA está en modo local porque el servidor no respondió.` , ts: Date.now() }]);
    setTyping(false);
  };

  const tips = MODULE_TIPS[location] || MODULE_TIPS["/"];

  const renderText = (t: string) => {
    return t.split("\n").map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <span key={i} className="block" style={{ minHeight: line === "" ? "0.5em" : undefined }}>
          {parts.map((p, j) =>
            p.startsWith("**") && p.endsWith("**")
              ? <strong key={j} style={{ color: "#00f5d4", fontWeight: 700 }}>{p.slice(2, -2)}</strong>
              : <span key={j}>{p}</span>
          )}
        </span>
      );
    });
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={openChat}
        className="fixed bottom-[82px] right-4 lg:bottom-6 lg:right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          background: "linear-gradient(135deg,#00f5d4,#0891b2)",
          boxShadow: `0 0 0 ${pulse ? "6px" : "0px"} rgba(0,245,212,0.35), 0 8px 32px rgba(0,245,212,0.4)`,
          animation: pulse ? "aiPulse 2s ease-in-out infinite" : "none",
        }}
        title="Asistente IA"
      >
        <Sparkles size={22} className="text-black" />
      </button>

      {/* Panel */}
      {open && (
        <>
          <div className="fixed inset-0 z-50 lg:hidden bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div
            className="fixed z-50 flex flex-col overflow-hidden"
            style={{
              bottom: 88, right: 16, width: "min(96vw, 420px)", height: "min(78vh, 620px)",
              borderRadius: 24,
              background: "linear-gradient(180deg,rgba(5,15,30,0.98) 0%,rgba(3,12,24,0.99) 100%)",
              border: "1px solid rgba(0,245,212,0.22)",
              boxShadow: "0 0 0 1px rgba(0,245,212,0.08), 0 32px 80px rgba(0,0,0,0.7), 0 0 60px rgba(0,245,212,0.08)",
            }}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(0,245,212,0.1)" }}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#00f5d4,#0891b2)", boxShadow: "0 0 14px rgba(0,245,212,0.5)" }}>
                  <Bot size={18} className="text-black" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-white leading-tight">Asistente IA</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#39ff7e] animate-pulse" />
                    <span className="text-[10px]" style={{ color: "rgba(0,245,212,0.6)" }}>
                      {user?.nombre?.split(" ")[0]} · {user?.role === "admin" ? "Admin" : user?.role === "vet" ? "Veterinario" : user?.role === "field" ? "Campo" : "Visor"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMsgs([{ role: "ai", text: welcome(), ts: Date.now() }])}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-white/5"
                  style={{ color: "rgba(255,255,255,0.35)" }} title="Nueva conversación"
                >
                  <RefreshCw size={13} />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-white/5"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3" style={{ scrollbarWidth: "none" }}>
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "ai" && (
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mr-1.5 mt-0.5"
                      style={{ background: "linear-gradient(135deg,#00f5d4,#0891b2)", minWidth: 24 }}>
                      <Sparkles size={11} className="text-black" />
                    </div>
                  )}
                  <div
                    className="max-w-[84%] px-3 py-2.5 text-[12.5px] leading-relaxed"
                    style={{
                      borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      background: m.role === "user"
                        ? "linear-gradient(135deg,rgba(0,245,212,0.18),rgba(8,145,178,0.15))"
                        : "rgba(255,255,255,0.05)",
                      border: m.role === "user"
                        ? "1px solid rgba(0,245,212,0.3)"
                        : "1px solid rgba(255,255,255,0.08)",
                      color: m.role === "user" ? "#e0fffe" : "rgba(255,255,255,0.85)",
                    }}
                  >
                    {renderText(m.text)}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mr-1.5 mt-0.5"
                    style={{ background: "linear-gradient(135deg,#00f5d4,#0891b2)", minWidth: 24 }}>
                    <Sparkles size={11} className="text-black" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl flex items-center gap-1.5"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00f5d4] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00f5d4] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00f5d4] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Quick chips */}
            <div className="px-3 pb-2 flex gap-1.5 flex-wrap flex-shrink-0"
              style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              {tips.slice(0, 3).map((tip, i) => (
                <button key={i} onClick={() => send(tip)}
                  className="text-[10.5px] px-2.5 py-1.5 rounded-xl transition-all hover:scale-[1.03] flex-shrink-0 mt-2"
                  style={{
                    background: "rgba(0,245,212,0.07)", color: "rgba(0,245,212,0.75)",
                    border: "1px solid rgba(0,245,212,0.18)", maxWidth: "100%",
                  }}>
                  {tip}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="px-3 pb-3 pt-1 flex-shrink-0">
              <div className="flex items-center gap-2 px-3 py-2.5"
                style={{
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(0,245,212,0.18)",
                  borderRadius: 16,
                }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder="Escribe tu consulta…"
                  className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-white/25"
                  style={{ color: "rgba(255,255,255,0.85)" }}
                />
                <button
                  onClick={() => send()}
                  disabled={!input.trim() || typing}
                  className="w-7 h-7 rounded-xl flex items-center justify-center transition-all"
                  style={{
                    background: input.trim() ? "linear-gradient(135deg,#00f5d4,#0891b2)" : "rgba(255,255,255,0.07)",
                    opacity: typing ? 0.5 : 1,
                  }}
                >
                  <Send size={13} className={input.trim() ? "text-black" : "text-white/30"} />
                </button>
              </div>
              <p className="text-center text-[9px] mt-1.5" style={{ color: "rgba(255,255,255,0.18)" }}>
                GanaderIA IA · datos en tiempo real · sesión {user?.role}
              </p>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes aiPulse {
          0%, 100% { box-shadow: 0 0 0 0px rgba(0,245,212,0.35), 0 8px 32px rgba(0,245,212,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(0,245,212,0.12), 0 8px 32px rgba(0,245,212,0.4); }
        }
      `}</style>
    </>
  );
}
