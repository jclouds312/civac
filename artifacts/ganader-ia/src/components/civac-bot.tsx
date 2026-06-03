import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, RefreshCw, ChevronDown, Minimize2 } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   KNOWLEDGE BASE — Respuestas por keywords
───────────────────────────────────────────────────────────── */
const KB: Array<{ kw: string[]; resp: string }> = [
  {
    kw: ["hola","buenos","buenas","saludo","hey","hi","inicio","menú","menu","opciones"],
    resp: `¡Hola! Soy **CIVAC Assistant** 🤖, tu agente de soporte inteligente de GanaderIA PRO.

Puedo ayudarte con:
• 📱 Instalación y uso de la PWA
• 🐄 Módulos del sistema (GPS, Pesaje, Producción…)
• ⭐ Planes, precios y facturación
• 🔌 Conexión de APIs externas (WhatsApp, Wompi, Nequi…)
• 👥 Gestión de usuarios y permisos
• 🔐 Seguridad y sesiones

¿En qué te puedo ayudar hoy?`,
  },
  {
    kw: ["pwa","instalar","offline","sin internet","instalación","app","aplicación","service worker","caché"],
    resp: `**Instalación PWA** 📱

GanaderIA es una Progressive Web App instalable:

**En Android (Chrome):**
1. Abre la app en Chrome
2. Menú ⋮ → "Instalar GanaderIA"
3. Confirma la instalación

**En iOS (Safari):**
1. Abre en Safari
2. Botón compartir ↑ → "Agregar a pantalla de inicio"

**Modo offline:** El Service Worker v6 precachea las 26 rutas. Sin internet puedes ver animales, historial de pesajes y GPS.

**Estrategias de caché:**
• Assets estáticos → Cache-first (largo TTL)
• Navegación HTML → Stale-while-revalidate
• APIs → Network-first con fallback offline`,
  },
  {
    kw: ["gps","collar","ubicación","rastreo","bovino","dispositivo","geovallado","geofence","imei"],
    resp: `**GPS Bovino** 📡

El módulo GPS tiene rastreo en tiempo real:

• **watchPosition** del navegador (latitud/longitud real)
• Mapa SVG animado con potreros por colores
• Movimiento simulado para demostración (cada 4s)
• Estado de batería por collar con indicadores
• Geovallado: alertas cuando un animal sale de la zona
• Vincular dispositivo: nombre, IMEI, tipo, animal asignado

**Web Bluetooth API:** Escanea collares BT cercanos. Si el navegador no soporta BT, muestra resultados demo.

**Ruta:** Menú → GPS Bovino (/gps)
**Plan mínimo:** PRO`,
  },
  {
    kw: ["bluetooth","bt","báscula","pesaje","peso","bcs","gmd","raza","báscula"],
    resp: `**Pesaje y Báscula BT** ⚖️

3 modos de pesaje disponibles:

1. **Bluetooth (BT):** Conecta báscula CIVAC 9B vía Web Bluetooth. Peso automático en tiempo real.
2. **COM/USB:** Puerto serie RS-232 para básculas tradicionales.
3. **Manual:** Entrada directa de peso desde teclado con recibo PDF.

**IA Engine incluye:**
• BCS (Body Condition Score 1-9)
• GMD (Ganancia Media Diaria en kg/día)
• Score de salud animal
• Soporte para 9 razas bovinas colombianas

**Rutas:** /pesaje (BT/COM) · /pesaje-manual
**Plan mínimo:** PRO (BT), Básico (Manual)`,
  },
  {
    kw: ["plan","precio","básico","pro","premium","platino","suscripción","costo","tarifa","mensual"],
    resp: `**Planes GanaderIA CIVAC PRO** ⭐

| Plan | Precio/mes | Animales | Usuarios |
|------|-----------|----------|---------|
| 🌱 Básico | **Gratis** | 50 | 1 |
| 🚀 PRO | **$89.000** | 300 | 5 |
| 💎 Premium | **$189.000** | 2.000 | 20 |
| 👑 Platino | **$399.000** | Ilimitados | Ilimitados |

**Pagos aceptados:** 💳 Tarjeta · 📱 Nequi · 🏦 PSE · 🟡 Bancolombia · 📲 Daviplata

Para cambiar de plan: Admin → Planes → tarjeta del plan → botón Editar`,
  },
  {
    kw: ["usuario","cuenta","acceso","contraseña","rol","permiso","crear usuario","nuevo usuario"],
    resp: `**Gestión de Usuarios** 👥

**Roles disponibles:**
• 👑 Admin — acceso total al sistema
• 🩺 Veterinario — módulos clínicos + lectura
• 🌿 Campo — pesaje, GPS y potreros
• 👁 Solo lectura — dashboards y reportes
• 💻 Desarrollador — consola técnica CIVAC

**Cuentas demo del sistema:**
| Email | Pass | Rol |
|-------|------|-----|
| admin@ganader.ia | admin | Admin |
| vet@ganader.ia | vet2026 | Veterinario |
| luis@ganader.ia | campo2026 | Campo |
| visor@ganader.ia | visor | Solo lectura |

**Crear usuario:** Admin → Cuentas → "+ Nuevo"
**Permisos:** Admin → Cuentas → ícono 🛡️`,
  },
  {
    kw: ["wompi","pasarela","cobro","link de pago","pago en línea","tarjeta"],
    resp: `**Wompi — Pasarela de Pagos Colombia** 💳

Wompi es la pasarela oficial colombiana (Bancolombia Group):

**Para conectar:**
1. Regístrate en sandbox.wompi.co
2. Obtén tu **Public Key** (pk_test_...) y **Private Key** (prv_test_...)
3. Ve a Admin → APIs → Wompi → "Configurar"
4. Ingresa las claves y haz clic en "Probar conexión"

**Funciones disponibles:**
• Links de pago personalizados
• Suscripciones recurrentes mensuales
• Webhook de confirmación automática
• Aceptación: tarjetas, Nequi, PSE, Bancolombia

Docs: docs.wompi.co`,
  },
  {
    kw: ["nequi","billetera","móvil","pago nequi"],
    resp: `**Nequi** 📱

Billetera digital de Bancolombia — muy popular en Colombia:

**Para conectar:**
1. Solicita acceso en developers.nequi.com
2. Obtén **Client ID** y **Client Secret** de tu sandbox
3. Admin → APIs → Nequi → "Configurar"
4. Ingresa credenciales OAuth2 y prueba

**Límites:** hasta $3.000.000 por transacción
**Confirmación:** instantánea (push al cliente)
**Requisito:** número celular Nequi del cliente`,
  },
  {
    kw: ["daviplata","davivienda","pago daviplata"],
    resp: `**Daviplata** 📲

Billetera digital de Davivienda — segunda más usada en Colombia:

**Para conectar:**
1. Contacta a api.davivienda.com para acceso API
2. Obtén tu **API Key** de sandbox
3. Admin → APIs → Daviplata → "Configurar"

**Características:**
• Pagos P2P y P2B (persona a empresa)
• Cobro por número celular
• Confirmación en tiempo real
• Compatible con todos los bancos colombianos
• Sin costo adicional para el usuario final`,
  },
  {
    kw: ["pse","ach","banco","transferencia bancaria","débito"],
    resp: `**PSE / ACH Colombia** 🏦

Pagos Seguros en Línea — débito directo bancario:

**Para conectar:**
1. Regístrate como recaudador en ACH Colombia (achcolombia.com.co)
2. Obtén tu **Código de empresa** y **Llave privada**
3. Admin → APIs → PSE → "Configurar"

**Características:**
• Compatible con TODOS los bancos colombianos
• Sin límite de monto (ideal para pagos grandes)
• Proceso: cliente elige banco → redirige → confirma
• Tiempo de confirmación: inmediato a 24h
• Reversiones automáticas en caso de error`,
  },
  {
    kw: ["whatsapp","wa","mensajes","chat","bot whatsapp","meta","api whatsapp","notificaciones"],
    resp: `**WhatsApp Business API** 💬

Envía alertas y notificaciones automáticas por WhatsApp:

**Para conectar:**
1. Crea app en developers.facebook.com/apps
2. Activa "WhatsApp Business API"
3. Obtén:
   - **Token de acceso** permanente
   - **Phone Number ID**
   - **WhatsApp Business Account ID**
4. Admin → APIs → WhatsApp → "Configurar"

**Usos en GanaderIA:**
• Alertas críticas de enfermedades
• Notificación de pagos aprobados/rechazados
• Recordatorios de vacunación y partos próximos
• Envío de reportes periódicos al propietario
• Bot de atención al cliente (este asistente)`,
  },
  {
    kw: ["inventario","animales","bovinos","rfid","ganado","hato"],
    resp: `**Inventario Bovino** 🐄

Gestiona tu hato ganadero completo:

• Identificación por RFID o chip
• Categorías: Vaca, Novilla, Ternero, Toro
• Filtros por lote, raza y estado reproductivo
• CRUD completo (crear, ver, editar, eliminar)
• Datos: raza, peso actual, lote, fecha nacimiento, estado

**Ruta:** /inventario
**Capacidad por plan:** Básico (50), PRO (300), Premium (2.000), Platino (∞)`,
  },
  {
    kw: ["producción","leche","ordeño","litros","láctea"],
    resp: `**Producción Láctea** 🥛

Registro y análisis de producción diaria:

• 84 L/día promedio (datos demo)
• Registro por turno: mañana y tarde
• Ranking top-vacas con barras horizontales
• BarChart de 7 meses de histórico
• Precio por litro configurable
• KPIs: promedio/vaca, total mes, proyección

**Ruta:** /produccion`,
  },
  {
    kw: ["reproducción","parto","celo","inseminación","iep","concepción"],
    resp: `**Reproducción Bovina** 🧬

Control reproductivo completo:

• IEP (Intervalo Entre Partos) en días
• Detección y registro de celos
• Inseminación artificial con toro registrado
• Próximos partos con fecha estimada
• Control de anestros post-parto
• Registro de monta natural

**Ruta:** /reproduccion | **Plan mínimo:** PRO`,
  },
  {
    kw: ["genética","dep","pedigrí","genoma","mejoramiento"],
    resp: `**Genética Bovina** 🔬

Evaluación genética del hato:

• Ranking DEP (Diferencias Esperadas en Progenie)
• Score bars por característica: leche, grasa, proteína
• Árbol de pedigrí (3 generaciones)
• Análisis de consanguinidad
• 9 razas bovinas soportadas

**Ruta:** /genetica | **Plan mínimo:** PRO`,
  },
  {
    kw: ["potreros","lotes","pastoreo","rotación","pasto","forraje"],
    resp: `**Gestión de Potreros** 🌿

6 lotes con rotación activa:

• Mapa CSS visual de cada potrero
• Semáforo: disponible / ocupado / descanso
• Días en descanso y carga animal actual
• Rotación programada y sugerida
• Asociación potrero-animales en tiempo real

**Ruta:** /potreros | **Plan mínimo:** Básico`,
  },
  {
    kw: ["costo","finanzas","ingresos","egresos","margen","p&g","rentabilidad"],
    resp: `**Costos P&G** 💰

Análisis financiero detallado:

• Ingresos vs egresos por categoría
• Costo por litro de leche producido
• Margen bruto (~35% demo)
• 5 KPIs: ROI, margen, costo/animal, ingreso/L, cashflow
• Desglose: alimentación, salud, personal, insumos

**Ruta:** /costos | **Plan mínimo:** PRO`,
  },
  {
    kw: ["predicción","ia","simulador","proyección","futuro","forecasting"],
    resp: `**Predicciones IA** 🤖

Simulador financiero con inteligencia artificial:

• Sliders interactivos para todas las variables
• Proyección a 6 y 12 meses
• Escenarios: optimista / esperado / pesimista
• Variables: precio leche, # animales, costos, mortalidad
• Recomendaciones automáticas de la IA
• Exportar proyección como PDF

**Ruta:** /prediccion | **Plan mínimo:** Premium`,
  },
  {
    kw: ["co2","carbono","huella","ambiental","ipcc","emisiones","sostenibilidad"],
    resp: `**Huella de Carbono** 🌍

Cálculo según metodología IPCC 2019:

• Emisiones por animal (kg CO₂eq/año)
• Emisiones por litro de leche
• Benchmarking con promedio nacional Colombia
• Bonos de carbono estimados (USD)
• Categorías: fermentación entérica, estiércol, transporte
• Recomendaciones de reducción

**Ruta:** /co2 | **Plan mínimo:** Premium`,
  },
  {
    kw: ["alerta","notificación","aviso","urgente","crítico","alarma"],
    resp: `**Centro de Alertas** 🔔

Gestión centralizada de notificaciones:

• Severidades: 🔴 Crítica · 🟠 Alta · 🟡 Media · 🟢 Baja
• Categorías: salud, reproducción, inventario, financiero, sistema
• Marcar como resuelto con un clic
• Filtros combinables por tipo y estado
• Con WhatsApp API activo: notificación instantánea al responsable

**Ruta:** /alertas | **Plan mínimo:** Básico`,
  },
  {
    kw: ["multifinca","varias fincas","múltiple","central","regional"],
    resp: `**Multi-Finca** 🏘️

Gestión centralizada de múltiples fincas:

• Hasta 3 fincas demo (Platino: ilimitadas)
• Cards con KPIs individuales por finca
• Tabla comparativa: producción, inventario, costos
• Consolidado total de la empresa ganadera
• Cambio de contexto de finca en un clic

**Ruta:** /multifinca | **Plan mínimo:** Premium`,
  },
  {
    kw: ["sesión","login","sesiones","revocar","seguridad","ip","acceso"],
    resp: `**Gestión de Sesiones** 📡

Monitoreo en tiempo real de todos los accesos:

• Sesiones activas con IP y geolocalización (ciudad)
• Tipo de dispositivo: móvil / desktop / tablet
• Revocar sesión activa de cualquier usuario
• Historial de logins con fecha, hora y dispositivo
• Eventos de seguridad: intentos fallidos, IPs bloqueadas
• Notificación automática de accesos sospechosos

**Ruta:** Admin → tab Sesiones`,
  },
  {
    kw: ["ayuda","soporte","problema","error","no funciona","fallo","bug"],
    resp: `**Soporte CIVAC** 🆘

Opciones de ayuda disponibles:

1. **Documentación:** /documentacion — guías de todos los módulos
2. **Manual:** /manual — manual completo de usuario (PDF)
3. **Este chat:** pregúntame sobre cualquier función
4. **Email:** soporte@civac.co
5. **WhatsApp:** +57 318 248 2261 (horario laboral)

**Acceso por rol:**
• Admin → Panel completo + consola dev
• Veterinario → Módulos clínicos y reproducción
• Campo → Pesaje, GPS y potreros

¿Cuál es tu problema específico?`,
  },
  {
    kw: ["alimentación","ración","tmr","mineral","suplemento","nutrición"],
    resp: `**Alimentación y Nutrición** 🌾

Gestión de raciones y suplementos:

• Raciones TMR (Total Mixed Ration) personalizadas
• Control de minerales y vitaminas
• Suplementos por categoría animal
• Costo de alimentación por animal/día
• Alertas de stock de insumos alimenticios

**Ruta:** /alimentacion | **Plan mínimo:** PRO`,
  },
  {
    kw: ["insumo","stock","inventario insumo","medicamento","producto","kardex"],
    resp: `**Insumos y Bodega** 📦

Control de inventario de productos:

• Kardex de entradas y salidas
• Stock mínimo con alertas rojas automáticas
• Botones +/- para ajustar cantidades
• Categorías: medicamentos, fertilizantes, combustible, herramientas
• Costo promedio ponderado

**Ruta:** /insumos | **Plan mínimo:** PRO`,
  },
  {
    kw: ["personal","empleado","nómina","eps","arl","cargo","trabajador"],
    resp: `**Gestión de Personal** 👷

Administración de empleados de la finca:

• 6 empleados demo (expandible)
• Cargos: Ordeñador, Veterinario, Administrador, Celador
• Nómina mensual con deducciones
• EPS y ARL por empleado
• Horas extras y bonificaciones
• Liquidación automática

**Ruta:** /personal | **Plan mínimo:** PRO`,
  },
  {
    kw: ["admin","administrador","panel admin","backend","gestión","configuración"],
    resp: `**Panel Administrador CIVAC** 👑

Accesible con cuenta admin@ganader.ia:

**11 secciones disponibles:**
📊 Resumen · 👥 Cuentas · ⭐ Planes · 💳 Pagos
📡 Sesiones · 🔌 APIs · 🧩 Módulos · ⚙️ Sistema
🏡 Finca · 🗄️ Datos · 📈 Reportes

**Funciones clave:**
• Crear/editar/eliminar usuarios
• Activar/desactivar cuentas
• Editar planes (nombre, precio, features)
• Ver quién usa cada plan
• Generar links de pago Wompi
• Configurar APIs externas (WhatsApp, Wompi, Nequi…)`,
  },
];

function matchResp(input: string): string {
  const lower = input.toLowerCase().trim();
  if (!lower) return "Por favor escribe tu pregunta 😊";
  const match = KB.find(k => k.kw.some(kw => lower.includes(kw)));
  if (match) return match.resp;
  return `No encontré información específica sobre **"${input}"**.

Intenta con palabras clave como:
*gps* · *planes* · *pwa* · *pesaje* · *wompi* · *nequi* · *whatsapp* · *usuarios* · *alertas* · *producción* · *admin*

O escribe **ayuda** para las opciones de soporte. 🤖`;
}

const QUICK_PROMPTS = [
  { label:"📱 PWA", q:"cómo instalar la pwa" },
  { label:"⭐ Planes", q:"cuáles son los planes y precios" },
  { label:"👥 Usuarios", q:"cómo crear un usuario" },
  { label:"💳 Wompi", q:"cómo conectar wompi" },
  { label:"📡 GPS", q:"cómo funciona el gps bovino" },
  { label:"🔌 APIs", q:"conectar whatsapp api" },
];

interface Msg {
  id: string;
  role: "user" | "bot";
  text: string;
  ts: string;
}

function renderMd(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

export default function CivacBot({ show }: { show?: boolean }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id:"0", role:"bot",
      text:"¡Hola! Soy **CIVAC Assistant** 🤖\n\nTu asistente inteligente de GanaderIA PRO. Escribe tu pregunta o elige una opción rápida.",
      ts: new Date().toLocaleTimeString("es-CO",{hour:"2-digit",minute:"2-digit"}),
    }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs, typing]);

  if (show === false) return null;

  function send(text?: string) {
    const q = (text ?? input).trim();
    if (!q) return;
    const ts = new Date().toLocaleTimeString("es-CO",{hour:"2-digit",minute:"2-digit"});
    const userMsg: Msg = { id: Date.now().toString(), role:"user", text:q, ts };
    setMsgs(p => [...p, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const resp = matchResp(q);
      setMsgs(p => [...p, { id:(Date.now()+1).toString(), role:"bot", text:resp, ts }]);
      setTyping(false);
    }, 600 + Math.random() * 400);
  }

  function reset() {
    setMsgs([{
      id:"0", role:"bot",
      text:"¡Hola! Soy **CIVAC Assistant** 🤖\n\nTu asistente inteligente de GanaderIA PRO. Escribe tu pregunta o elige una opción rápida.",
      ts: new Date().toLocaleTimeString("es-CO",{hour:"2-digit",minute:"2-digit"}),
    }]);
  }

  return (
    <>
      {/* ── Floating toggle button ── */}
      {!open && (
        <button
          onClick={() => { setOpen(true); setTimeout(()=>inputRef.current?.focus(),300); }}
          className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{
            background: "linear-gradient(135deg,#00f5d4,#00a896)",
            boxShadow: "0 0 24px rgba(0,245,212,0.5), 0 4px 20px rgba(0,0,0,0.4)",
          }}
          title="CIVAC Assistant"
        >
          <Bot size={24} style={{color:"#040d1a"}}/>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-[#040d1a] animate-pulse"/>
        </button>
      )}

      {/* ── Chat panel ── */}
      {open && (
        <div
          className="fixed bottom-5 right-5 z-50 flex flex-col rounded-3xl overflow-hidden"
          style={{
            width: "360px",
            maxHeight: "560px",
            background: "linear-gradient(145deg,#040f1e,#071528)",
            border: "1px solid rgba(0,245,212,0.25)",
            boxShadow: "0 0 40px rgba(0,245,212,0.15), 0 20px 60px rgba(0,0,0,0.6)",
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
            style={{background:"linear-gradient(135deg,#00f5d412,#00a89608)",borderBottom:"1px solid rgba(0,245,212,0.15)"}}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{background:"linear-gradient(135deg,#00f5d4,#00a896)"}}>
              <Bot size={18} style={{color:"#040d1a"}}/>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-black text-white text-sm leading-none">CIVAC Assistant</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
                <span className="text-[9px] text-green-400">En línea · GanaderIA PRO</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={reset} title="Nueva conversación"
                className="w-7 h-7 rounded-xl flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/5 transition-all">
                <RefreshCw size={13}/>
              </button>
              <button onClick={()=>setOpen(false)}
                className="w-7 h-7 rounded-xl flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/5 transition-all">
                <Minimize2 size={13}/>
              </button>
              <button onClick={()=>setOpen(false)}
                className="w-7 h-7 rounded-xl flex items-center justify-center text-white/30 hover:text-red-400/80 hover:bg-red-500/10 transition-all">
                <X size={13}/>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3" style={{scrollbarWidth:"thin",minHeight:0}}>
            {msgs.map(m => (
              <div key={m.id} className={`flex gap-2 ${m.role==="user"?"flex-row-reverse":""}`}>
                {m.role==="bot" && (
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 self-end"
                    style={{background:"linear-gradient(135deg,#00f5d4,#00a896)"}}>
                    <Bot size={13} style={{color:"#040d1a"}}/>
                  </div>
                )}
                <div className="max-w-[82%]">
                  <div className="px-3 py-2.5 rounded-2xl text-[11px] leading-relaxed"
                    style={m.role==="bot" ? {
                      background:"rgba(255,255,255,0.05)",
                      border:"1px solid rgba(0,245,212,0.12)",
                      color:"rgba(255,255,255,0.87)",
                      borderBottomLeftRadius:4,
                    } : {
                      background:"linear-gradient(135deg,#00f5d4,#00a896)",
                      color:"#040d1a",
                      fontWeight:600,
                      borderBottomRightRadius:4,
                    }}
                    dangerouslySetInnerHTML={{ __html: renderMd(m.text) }}
                  />
                  <div className={`text-[8px] text-white/20 mt-0.5 ${m.role==="user"?"text-right":""}`}>{m.ts}</div>
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{background:"linear-gradient(135deg,#00f5d4,#00a896)"}}>
                  <Bot size={13} style={{color:"#040d1a"}}/>
                </div>
                <div className="px-3 py-3 rounded-2xl" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(0,245,212,0.12)"}}>
                  <div className="flex gap-1">
                    {[0,1,2].map(i=>(
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-teal-400/60"
                        style={{animation:`bounce 1s ease-in-out ${i*0.15}s infinite`}}/>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef}/>
          </div>

          {/* Quick prompts */}
          {msgs.length <= 2 && !typing && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
              {QUICK_PROMPTS.map(p => (
                <button key={p.q} onClick={()=>send(p.q)}
                  className="px-2.5 py-1 rounded-xl text-[9px] font-bold transition-all hover:scale-[1.04]"
                  style={{background:"rgba(0,245,212,0.08)",border:"1px solid rgba(0,245,212,0.2)",color:"#00f5d4"}}>
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 pb-3 flex-shrink-0" style={{borderTop:"1px solid rgba(255,255,255,0.05)"}}>
            <div className="flex items-center gap-2 mt-2 rounded-2xl px-3 py-2"
              style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(0,245,212,0.15)"}}>
              <input
                ref={inputRef}
                value={input}
                onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()}
                placeholder="Pregunta sobre GPS, planes, APIs…"
                className="flex-1 bg-transparent text-xs text-white placeholder:text-white/25 outline-none"
              />
              <button onClick={()=>send()} disabled={!input.trim()||typing}
                className="w-7 h-7 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
                style={{background:"linear-gradient(135deg,#00f5d4,#00a896)"}}>
                <Send size={13} style={{color:"#040d1a"}}/>
              </button>
            </div>
            <p className="text-[8px] text-white/15 text-center mt-1.5">CIVAC Bot · GanaderIA PRO v7.0 · 32 módulos</p>
          </div>
        </div>
      )}

      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
    </>
  );
}
