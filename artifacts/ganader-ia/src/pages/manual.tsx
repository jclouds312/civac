import { useState, useMemo } from "react";
import {
  Search, ChevronDown, ChevronRight, PlayCircle, BookOpen,
  CheckCircle2, AlertCircle, Info, Lightbulb, BarChart2,
  Beef, Milk, FlaskConical, Leaf, Wheat, Package, DollarSign,
  Users, TrendingUp, Wind, Bell, ClipboardList, Map, Satellite,
  Scale, Dna, Shield, GitMerge, Cloud, Database, Bot, Building2,
  Settings, FileText, Printer, CreditCard, Star, Zap,
  ChevronUp, HelpCircle, ArrowRight, Globe,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { printModule } from "@/lib/print";
import { Button } from "@/components/ui/button";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Step {
  step: number;
  title: string;
  desc: string;
}

interface Tip {
  type: "tip" | "warning" | "info";
  text: string;
}

interface ManualSection {
  id: string;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  color: string;
  category: string;
  title: string;
  subtitle: string;
  steps: Step[];
  tips?: Tip[];
}

// ─── Data ──────────────────────────────────────────────────────────────────────

const SECTIONS: ManualSection[] = [
  // ── INICIO ────────────────────────────────────────────────────────────────
  {
    id: "primeros-pasos",
    icon: PlayCircle,
    color: "#00f5d4",
    category: "Inicio",
    title: "Primeros Pasos",
    subtitle: "Configuración inicial de su finca en CIVAC PRO",
    steps: [
      { step: 1, title: "Iniciar sesión", desc: "Ingrese su email y contraseña en la pantalla de acceso. Use las cuentas demo para explorar sin riesgo. Si olvidó su clave, use el enlace de recuperación." },
      { step: 2, title: "Configurar su finca", desc: "Vaya a Configuración → Finca. Complete el nombre, NIT, departamento, municipio, capacidad y tipo de explotación. Estos datos aparecen en todos los reportes PDF." },
      { step: 3, title: "Instalar como PWA", desc: "En el menú superior haga clic en 'Instalar App'. Acepte el prompt de instalación del navegador. La app funcionará sin internet y enviará notificaciones push." },
      { step: 4, title: "Registrar los primeros animales", desc: "Abra Inventario → botón '+ Animal'. Complete arete, raza, categoría, peso de entrada, lote y fecha de nacimiento. Puede editar todos los campos después." },
      { step: 5, title: "Activar el modo oscuro / claro", desc: "Haga clic en el ícono de sol/luna en la barra superior. El tema se guarda automáticamente para sus próximas sesiones." },
    ],
    tips: [
      { type: "tip", text: "Use las cuentas demo (Tab 'Cuentas Demo' en el login) para ver la app con datos reales sin afectar su información." },
      { type: "info", text: "Todos los datos se guardan en su dispositivo (IndexedDB + localStorage). No se requiere internet para operar." },
    ],
  },
  {
    id: "dashboard",
    icon: BarChart2,
    color: "#00c8ff",
    category: "Inicio",
    title: "Dashboard Principal",
    subtitle: "KPIs en tiempo real y estado general del hato",
    steps: [
      { step: 1, title: "Entender los 6 KPIs", desc: "Producción diaria (L), número de animales, valor del hato, litros/vaca/día, animales en celo próximo y margen del mes. Cada tarjeta tiene color semáforo según si está sobre o bajo la meta." },
      { step: 2, title: "Leer el ticker LIVE", desc: "La barra inferior animada muestra el último precio de leche en finca, alertas activas y eventos del día (vacunaciones, partos programados)." },
      { step: 3, title: "Accesos rápidos", desc: "Los botones de acceso rápido llevan directamente al módulo más relevante según su rol. El veterinario ve Sanidad y Ficha; el operario de campo ve GPS y Pesaje." },
      { step: 4, title: "Gráficas históricas", desc: "El AreaChart muestra la producción de los últimos 7 meses. Pase el cursor sobre las barras para ver el detalle diario. Exportar a PDF con el botón PDF." },
    ],
    tips: [
      { type: "tip", text: "Los KPIs se actualizan cada vez que registra producción, pesos o eventos. No hay que refrescar la página." },
    ],
  },
  // ── INVENTARIO & SALUD ─────────────────────────────────────────────────────
  {
    id: "inventario",
    icon: Beef,
    color: "#39ff7e",
    category: "Inventario y Salud",
    title: "Inventario Bovino",
    subtitle: "Registro completo del hato con RFID y filtros avanzados",
    steps: [
      { step: 1, title: "Agregar un animal", desc: "Botón '+' en la cabecera. Llene: nombre/arete, raza (13 opciones), categoría (vaca, novilla, ternero, toro), peso, lote, estado y valor/kg. El número de registro RFID es opcional." },
      { step: 2, title: "Filtrar el hato", desc: "Use la barra de búsqueda (nombre o arete) y los filtros de categoría y lote en la parte superior de la tabla. Los filtros se combinan." },
      { step: 3, title: "Editar un animal", desc: "Haga clic en el ícono de lápiz en la fila del animal. Cambie cualquier campo y guarde. Los cambios son inmediatos." },
      { step: 4, title: "Ver la ficha clínica", desc: "Desde el ícono de historial (carpeta) en la tabla, accede directamente a la ficha individual del animal con sus registros de vacunas, pesos y partos." },
      { step: 5, title: "Exportar inventario", desc: "Botón 'CSV' exporta la tabla filtrada. Botón 'PDF' genera un reporte imprimible con logo y datos de la finca." },
    ],
    tips: [
      { type: "tip", text: "El estado 'Gestante' activa automáticamente el contador de días y el alerta de parto próximo en el Dashboard." },
      { type: "warning", text: "Eliminar un animal no elimina su historial en la Ficha Clínica. Los registros se conservan para auditoría ICA." },
    ],
  },
  {
    id: "ficha",
    icon: ClipboardList,
    color: "#00c8ff",
    category: "Inventario y Salud",
    title: "Ficha Clínica Individual",
    subtitle: "Historia médica completa: vacunas, pesos, partos y eventos",
    steps: [
      { step: 1, title: "Abrir la ficha", desc: "Desde Inventario → ícono de carpeta, o desde Sanidad → nombre del animal. La ficha tiene 4 pestañas: Vacunas, Pesos, Partos y Eventos." },
      { step: 2, title: "Registrar una vacunación", desc: "Pestaña Vacunas → '+'. Seleccione la vacuna del catálogo o escriba el nombre libre. Indique la dosis, lote y la próxima aplicación. El sistema genera alerta automática." },
      { step: 3, title: "Registrar pesaje manual", desc: "Pestaña Pesos → '+'. Ingrese el peso actual, la fecha y el método (cinta, báscula manual, BT). El sistema calcula la Ganancia Media Diaria (GMD) automáticamente." },
      { step: 4, title: "Registrar un parto", desc: "Pestaña Partos → '+'. Indique la fecha, tipo de parto, sexo de la cría, nombre y si fue asistido. El sistema actualiza el IEP (Intervalo Entre Partos) de la vaca." },
      { step: 5, title: "Imprimir historia clínica", desc: "Botón PDF en la cabecera genera la historia completa con todos los registros. Útil para auditorías ICA y consultas veterinarias." },
    ],
    tips: [
      { type: "info", text: "La ficha clínica cumple con los requerimientos de trazabilidad del ICA para exportación de ganado." },
    ],
  },
  {
    id: "sanidad",
    icon: Shield,
    color: "#22c55e",
    category: "Inventario y Salud",
    title: "Sanidad Animal",
    subtitle: "Vacunación, tratamientos, diagnósticos y períodos de retiro",
    steps: [
      { step: 1, title: "Plan de vacunación", desc: "Módulo Sanidad → pestaña Vacunación. Vea el calendario activo con todas las vacunas pendientes ordenadas por fecha. Las vencidas aparecen en rojo." },
      { step: 2, title: "Registrar un tratamiento", desc: "Pestaña Tratamientos → '+ Tratamiento'. Seleccione el animal, el medicamento (del kardex de insumos), dosis, vía y duración. El sistema calcula automáticamente el período de retiro para leche y carne." },
      { step: 3, title: "Control de retiro", desc: "Los animales en período de retiro aparecen con badge 'RETIRO' en el Inventario. La leche de esos animales NO debe ingresar al registro de producción." },
      { step: 4, title: "Diagnósticos", desc: "Pestaña Diagnósticos → registre hallazgos clínicos, resultado de laboratorio y plan de manejo. Vincula automáticamente el registro a la ficha individual del animal." },
    ],
    tips: [
      { type: "warning", text: "El período de retiro de antibióticos es legal. Siempre respételo antes de entregar leche a la planta." },
      { type: "tip", text: "Puede imprimir el plan de vacunación semestral para entregarlo al médico veterinario de la finca." },
    ],
  },
  {
    id: "trazabilidad",
    icon: GitMerge,
    color: "#f97316",
    category: "Inventario y Salud",
    title: "Trazabilidad ICA",
    subtitle: "Guías de movilización, SINIGAN y registros para exportación",
    steps: [
      { step: 1, title: "Crear una guía de movilización", desc: "Trazabilidad → 'Nueva Guía'. Complete: animales involucrados (por arete), predio origen, predio destino, propietario, transportador y fecha. El sistema genera el número de guía." },
      { step: 2, title: "Registrar en SINIGAN", desc: "Una vez generada la guía, el botón 'Enviar SINIGAN' prepara el XML para el reporte al sistema nacional. Exporte el archivo y súbalo al portal ICA." },
      { step: 3, title: "Historial de movimientos", desc: "La tabla de historial muestra todos los movimientos del predio con su estado (pendiente, reportado, certificado). Puede filtrar por fecha y animal." },
      { step: 4, title: "Certificado sanitario", desc: "Para exportación, genere el Certificado Sanitario de Movilización con el botón 'Certificado'. Requiere que todos los animales estén al día en brucelosis y tuberculosis." },
    ],
    tips: [
      { type: "info", text: "CIVAC PRO cumple con la Resolución ICA 20148 sobre trazabilidad bovina en Colombia." },
      { type: "warning", text: "Movilizar ganado sin guía ICA es una infracción sancionable. Genere siempre la guía antes del traslado." },
    ],
  },
  // ── PRODUCCIÓN ─────────────────────────────────────────────────────────────
  {
    id: "produccion",
    icon: Milk,
    color: "#00c8ff",
    category: "Producción",
    title: "Registro de Producción",
    subtitle: "Ordeños diarios, ranking de vacas y análisis de tendencia",
    steps: [
      { step: 1, title: "Registrar un ordeño", desc: "Producción → '+'. Seleccione el turno (mañana/tarde), indique los litros totales o por vaca. El sistema calcula el acumulado diario automáticamente." },
      { step: 2, title: "Registro por vaca individual", desc: "Haga clic en 'Detalle por vaca' para ingresar litros vaca por vaca. Útil para calcular el ranking de productividad y detectar caídas bruscas." },
      { step: 3, title: "Ver el ranking de top-vacas", desc: "La sección 'Top 5 Vacas' en la parte inferior muestra las mejores productoras con barras horizontales de progreso. Un clic lleva a su ficha individual." },
      { step: 4, title: "Análisis por BarChart", desc: "El gráfico de barras muestra la producción por mes. Compare con el período anterior seleccionando el rango de fechas en el filtro superior." },
      { step: 5, title: "Exportar datos", desc: "Botón CSV exporta todos los ordeños del período. Botón PDF genera un reporte mensual con firma del operario y totales por animal." },
    ],
    tips: [
      { type: "tip", text: "Registre la producción dos veces al día (mañana y tarde) para mayor precisión en el cálculo de L/vaca/día." },
      { type: "warning", text: "Si una vaca cae más de 20% en un solo día, el sistema genera alerta automática en el módulo de Alertas." },
    ],
  },
  {
    id: "reproduccion",
    icon: FlaskConical,
    color: "#ff6fd8",
    category: "Producción",
    title: "Reproducción Bovina",
    subtitle: "Ciclos estrales, inseminación artificial, diagnóstico y partos",
    steps: [
      { step: 1, title: "Registrar un celo", desc: "Reproducción → 'Celo detectado'. Seleccione la vaca, indique la fecha, hora de detección e intensidad (leve, moderado, intenso). El sistema sugiere la hora óptima de IA." },
      { step: 2, title: "Registrar una inseminación", desc: "Botón '+ Inseminación'. Vincule el celo registrado, seleccione el toro (del módulo Semen) y registre quién realizó el procedimiento." },
      { step: 3, title: "Diagnóstico de gestación", desc: "Pestaña 'Diagnóstico'. Registre el resultado del tacto o ecografía (positivo/negativo/dudoso), días de gestación estimados y fecha del próximo tacto." },
      { step: 4, title: "Seguimiento de anestros", desc: "La tabla de 'Vacas en Anestro' lista los animales sin celo en más de 60 días posparto. Filtro para planear protocolo hormonal." },
      { step: 5, title: "Registro de partos", desc: "Sección 'Partos'. Complete datos del nacimiento, condición corporal de la madre, sexo de la cría y si requirió asistencia. Actualiza el IEP automáticamente." },
    ],
    tips: [
      { type: "tip", text: "El IEP ideal en Colombia es ≤ 13 meses. CIVAC PRO muestra el IEP promedio del hato en los KPIs." },
      { type: "info", text: "La regla de las AM/PM para inseminación: si detecta celo en la mañana, insemina en la tarde; si lo detecta en la tarde, insemina a la mañana siguiente." },
    ],
  },
  {
    id: "semen",
    icon: Dna,
    color: "#a855f7",
    category: "Producción",
    title: "Inventario de Semen y Embriones",
    subtitle: "Control criogénico, toros, pajillas y programa de TE",
    steps: [
      { step: 1, title: "Registrar pajillas de semen", desc: "Semen → '+'. Indique el toro (nombre, código, raza, casa genética), número de pajillas, temperatura de almacenamiento (−196 °C) y fecha de ingreso." },
      { step: 2, title: "Consumo de pajillas", desc: "Al registrar una inseminación en el módulo de Reproducción, el sistema descuenta automáticamente una pajilla del inventario del toro seleccionado." },
      { step: 3, title: "Inventario de embriones", desc: "Pestaña 'Embriones'. Registre embriones de TE (transferencia embrionaria) con donante, receptor previsto, calidad IETS y fecha de colecta." },
      { step: 4, title: "Alertas de stock mínimo", desc: "Configure el mínimo de pajillas por toro en la fila del toro. Cuando el stock baje del mínimo, se genera alerta automática en el módulo de Alertas." },
    ],
    tips: [
      { type: "info", text: "Los valores DEP de los toros importados se integran automáticamente con el módulo de Genética para el ranking del hato." },
    ],
  },
  // ── CAMPO ─────────────────────────────────────────────────────────────────
  {
    id: "potreros",
    icon: Leaf,
    color: "#39ff7e",
    category: "Campo",
    title: "Gestión de Potreros",
    subtitle: "Rotación de praderas, aforo y estado del pasto",
    steps: [
      { step: 1, title: "Ver el mapa de rotación", desc: "El mapa CSS muestra los potreros con código de colores: verde = disponible para ocupar, amarillo = ocupado, rojo = en descanso obligatorio." },
      { step: 2, title: "Cambiar el estado de un potrero", desc: "Haga clic en el potrero en el mapa o en la lista → 'Editar'. Cambie el estado, registre el aforo (kg MS/ha) y los días de ocupación planificados." },
      { step: 3, title: "Iniciar una rotación", desc: "Desde la lista → botón 'Mover animales'. Seleccione los animales del lote a mover y confirme. El sistema registra la fecha de ingreso y calcula los días restantes de ocupación." },
      { step: 4, title: "Calcular capacidad de carga", desc: "El panel lateral muestra la capacidad de carga animal (UA/ha) basada en el aforo y las necesidades nutricionales del lote actual." },
    ],
    tips: [
      { type: "tip", text: "El descanso mínimo recomendado en Colombia es 30–45 días en época seca y 21–28 días en época lluviosa." },
      { type: "warning", text: "Sobrecargar un potrero reduce el aforo permanentemente. Configure el máximo de animales por hectárea en Configuración." },
    ],
  },
  {
    id: "lotes",
    icon: Users,
    color: "#00f5d4",
    category: "Campo",
    title: "Gestión de Lotes",
    subtitle: "Movimiento de animales, recibos de compra/venta y kardex",
    steps: [
      { step: 1, title: "Crear un lote de compra", desc: "Lotes → '+'. Seleccione tipo 'Entrada', indique el nombre del lote, número de animales, peso promedio, costo/kg y proveedor. El sistema calcula el valor total." },
      { step: 2, title: "Crear un lote de venta", desc: "Tipo 'Salida'. Indique los animales por arete o seleccione el lote completo. Registre el precio de venta/kg y el comprador." },
      { step: 3, title: "Generar recibo PDF", desc: "Al guardar el movimiento, el botón 'Recibo' genera un PDF con todos los datos de la transacción, peso y valor total. Apto para contabilidad." },
      { step: 4, title: "Kardex de movimientos", desc: "La tabla de historial muestra todos los movimientos con su tipo, fecha, animales involucrados y valor. Exportable a CSV para contabilidad." },
    ],
    tips: [
      { type: "info", text: "Los movimientos de lote actualizan automáticamente el inventario y el módulo de Costos P&G." },
    ],
  },
  {
    id: "pesaje",
    icon: Scale,
    color: "#ff9a3c",
    category: "Campo",
    title: "Pesaje Bluetooth y Manual",
    subtitle: "Báscula BT/COM/Manual, BCS, GMD y score IA por raza",
    steps: [
      { step: 1, title: "Pesaje Bluetooth", desc: "Pesaje → 'Conectar Báscula'. Active el Bluetooth de su dispositivo. El sistema escanea básculas CIVAC, TRU-TEST y Gallagher. Al conectar, los pesos llegan automáticamente." },
      { step: 2, title: "Pesaje manual con cinta", desc: "Módulo Pesaje Manual. Ingrese el perímetro torácico en cm. El sistema convierte usando la fórmula SRNS (Girth² × 0.0073) ajustada por las 9 razas presentes." },
      { step: 3, title: "Condición corporal (BCS)", desc: "Ingrese el score BCS (1–5) con el selector visual. El motor IA de CIVAC cruza el BCS con el peso, raza y estado productivo para recomendar ajuste de ración." },
      { step: 4, title: "Calcular GMD", desc: "Al registrar el peso, el sistema calcula la GMD respecto al último peso registrado. GMD < 400 g/día en animales en crecimiento genera alerta automática." },
      { step: 5, title: "Imprimir recibo de pesaje", desc: "Botón 'Recibo PDF' genera un comprobante con: animal, fecha, peso, GMD, BCS y firma del operario. Útil para entregas a planta cárnica." },
    ],
    tips: [
      { type: "tip", text: "Si la báscula BT no conecta, use el modo 'Fallback Demo' para practicar el flujo mientras llega la conectividad." },
      { type: "info", text: "El motor IA de pesaje fue calibrado con datos de 9 razas tropicales y doble propósito de Colombia." },
    ],
  },
  {
    id: "gps",
    icon: Map,
    color: "#00c8ff",
    category: "Campo",
    title: "GPS Bovino en Tiempo Real",
    subtitle: "Seguimiento continuo, mapa SVG animado y geovallado",
    steps: [
      { step: 1, title: "Activar seguimiento GPS", desc: "GPS → 'Iniciar Seguimiento'. El navegador pedirá permiso de ubicación. Concédalo para activar watchPosition. La posición se actualiza cada segundo." },
      { step: 2, title: "Leer el mapa SVG", desc: "Los puntos con pulso azul = animales online con señal activa. Puntos grises = sin señal en los últimos 5 minutos. El polígono de cada potrero está dibujado en el mapa." },
      { step: 3, title: "Configurar geovallado", desc: "Pestaña 'Geovallado'. Dibuje el perímetro autorizado seleccionando los vértices en el mapa. Cuando un animal cruce el límite, recibirá alerta push inmediata." },
      { step: 4, title: "Ver historial de rutas", desc: "Seleccione un animal → 'Ver ruta'. El mapa dibuja el recorrido de las últimas 24 h con la distancia total recorrida." },
      { step: 5, title: "Estado de batería de collares", desc: "Cada collar muestra su nivel de batería con indicador de color. Verde > 60 %, amarillo 20–60 %, rojo < 20 %. Programe la carga antes de que lleguen al rojo." },
    ],
    tips: [
      { type: "info", text: "El backend GPS Django (puerto 8000) recibe datos MQTT del broker civac.co:1883. Requiere conectividad para los collares IoT." },
      { type: "warning", text: "El GPS del dispositivo (watchPosition) registra la posición del operario, no del ganado. Para rastrear ganado use los collares CIVAC-GPS." },
    ],
  },
  {
    id: "gps-chips",
    icon: Satellite,
    color: "#00c8ff",
    category: "Campo",
    title: "GPS Chips — Gestión de Dispositivos",
    subtitle: "Collares, MQTT broker, vinculación y configuración avanzada",
    steps: [
      { step: 1, title: "Vincular un collar nuevo", desc: "GPS Chips → '+ Dispositivo'. Ingrese el nombre, IMEI del collar, tipo (GPS/BLE/RFID) y seleccione el animal al que se asignará." },
      { step: 2, title: "Configurar el broker MQTT", desc: "Pestaña 'MQTT'. Ingrese el host (default: mqtt.civac.co), puerto (1883), usuario y contraseña del broker. Haga clic en 'Probar conexión'." },
      { step: 3, title: "Ver telemetría en vivo", desc: "La tabla de dispositivos muestra: señal (dBm), batería (%), última posición y tiempo sin señal. Los dispositivos offline por > 10 min aparecen en rojo." },
      { step: 4, title: "Exportar configuración", desc: "Botón 'Exportar Config' genera un JSON con la configuración de todos los collares. Útil para respaldar antes de un reset o migración." },
    ],
    tips: [
      { type: "tip", text: "Actualice el firmware de los collares desde GPS Chips → fila del dispositivo → 'Actualizar'. La actualización tarda ~3 minutos." },
    ],
  },
  // ── INSUMOS Y COSTOS ──────────────────────────────────────────────────────
  {
    id: "alimentacion",
    icon: Wheat,
    color: "#39ff7e",
    category: "Insumos y Costos",
    title: "Alimentación y Raciones",
    subtitle: "Formulación TMR, minerales, suplementos y costo/vaca/día",
    steps: [
      { step: 1, title: "Definir la ración de un lote", desc: "Alimentación → lote → 'Editar Ración'. Ingrese los ingredientes (concentrado, heno, ensilaje, sal, mineral) y las cantidades en kg/animal/día." },
      { step: 2, title: "Calcular el costo por animal", desc: "El sistema cruza las cantidades con el costo de cada insumo en el Kardex y calcula el costo/animal/día automáticamente." },
      { step: 3, title: "Balance nutricional", desc: "La pestaña 'Balance' muestra el perfil energético y proteico de la ración versus la necesidad estimada del animal según su categoría y estado productivo." },
      { step: 4, title: "Registrar suministro diario", desc: "Botón 'Suministrar' registra el suministro del día para el lote seleccionado. Descuenta automáticamente las cantidades del Kardex de Insumos." },
    ],
    tips: [
      { type: "tip", text: "El costo de alimentación debería ser máximo el 60 % del costo de producción total. Si supera este valor, revise la eficiencia del programa nutricional." },
    ],
  },
  {
    id: "insumos",
    icon: Package,
    color: "#ff6fd8",
    category: "Insumos y Costos",
    title: "Insumos — Kardex y Stock",
    subtitle: "Control de inventario, stock mínimo y alertas de reabastecimiento",
    steps: [
      { step: 1, title: "Registrar una entrada de insumo", desc: "Insumos → '+'. Seleccione el producto del catálogo o cree uno nuevo. Indique la cantidad, unidad, precio de compra y proveedor. El stock se actualiza al instante." },
      { step: 2, title: "Registrar una salida (uso)", desc: "Clic en '−' en la fila del insumo. Indique la cantidad usada, la fecha y el motivo (ración, tratamiento, higiene). El kardex queda registrado." },
      { step: 3, title: "Configurar stock mínimo", desc: "Fila del insumo → ícono de engranaje → 'Stock mínimo'. Cuando el stock llegue a ese valor, aparece un badge rojo y se genera alerta en el módulo de Alertas." },
      { step: 4, title: "Ver el kardex completo", desc: "Clic en el nombre del insumo abre el historial de entradas y salidas con fecha, cantidad y saldo acumulado. Exportable a CSV." },
    ],
    tips: [
      { type: "warning", text: "Los medicamentos veterinarios con período de retiro deben registrarse en el módulo de Sanidad, no solo en el Kardex." },
    ],
  },
  {
    id: "costos",
    icon: DollarSign,
    color: "#fbbf24",
    category: "Insumos y Costos",
    title: "Costos P&G",
    subtitle: "Estado de pérdidas y ganancias, costo/litro y margen",
    steps: [
      { step: 1, title: "Registrar un ingreso", desc: "Costos → pestaña 'Ingresos' → '+'. Seleccione categoría (venta leche, venta animal, subsidio) e ingrese el valor y la fecha." },
      { step: 2, title: "Registrar un egreso", desc: "Pestaña 'Egresos' → '+'. Categorías disponibles: insumos, mano de obra, servicios veterinarios, maquinaria, arrendamiento." },
      { step: 3, title: "Calcular el costo por litro", desc: "El KPI 'Costo/Litro' se calcula automáticamente: total egresos del período ÷ litros producidos en el mismo período." },
      { step: 4, title: "Ver el P&G mensual", desc: "La tabla P&G muestra ingresos, egresos y margen neto por mes. El gráfico de barras compara los últimos 6 meses." },
      { step: 5, title: "Exportar a contabilidad", desc: "Botón 'Exportar CSV' genera el resumen de transacciones compatible con software contable colombiano (Siigo, World Office, Aspel)." },
    ],
    tips: [
      { type: "tip", text: "El costo/litro eficiente en ganadería lechera colombiana es entre $950 y $1.200 COP. Si supera $1.400, revise la alimentación y la productividad." },
    ],
  },
  {
    id: "personal",
    icon: Users,
    color: "#00c8ff",
    category: "Insumos y Costos",
    title: "Personal y Nómina",
    subtitle: "Empleados, cargos, liquidación y aportes parafiscales Colombia",
    steps: [
      { step: 1, title: "Registrar un empleado", desc: "Personal → '+'. Complete: nombre, cédula, cargo, salario base, fecha de ingreso, EPS, ARL y AFP. El sistema calcula los aportes según la ley colombiana." },
      { step: 2, title: "Liquidar la nómina del mes", desc: "Botón 'Liquidar Nómina'. El sistema calcula: salario base, auxilio de transporte (si aplica), deducciones (salud 4 %, pensión 4 %) y neto a pagar." },
      { step: 3, title: "Registrar ausencias y extras", desc: "Fila del empleado → 'Novedades'. Registre incapacidades, permisos, horas extras (diurnas/nocturnas) y dominicales. Afectan la liquidación automáticamente." },
      { step: 4, title: "Imprimir comprobante de pago", desc: "Botón 'Comprobante PDF' genera el desprendible de nómina individual con todos los conceptos. Válido como soporte contable." },
    ],
    tips: [
      { type: "info", text: "El salario mínimo 2026 en Colombia es $1.300.606. El sistema incluye el aumento automático al inicio de cada año." },
    ],
  },
  // ── INTELIGENCIA ─────────────────────────────────────────────────────────
  {
    id: "prediccion",
    icon: TrendingUp,
    color: "#00f5d4",
    category: "Inteligencia",
    title: "Predicción IA",
    subtitle: "Simulador financiero con sliders y proyección a 12 meses",
    steps: [
      { step: 1, title: "Entender los sliders", desc: "El simulador tiene 6 sliders: producción/vaca/día, precio leche, % vacas en ordeño, costo insumos, precio venta kg/carne y tasa de natalidad. Arrastre para simular escenarios." },
      { step: 2, title: "Ver la proyección", desc: "El gráfico de barras muestra los ingresos proyectados mes a mes para los próximos 12 meses según los valores de los sliders." },
      { step: 3, title: "Comparar escenarios", desc: "Botón 'Guardar escenario' preserva la configuración actual. Puede comparar hasta 3 escenarios side by side." },
      { step: 4, title: "Analizar el punto de equilibrio", desc: "El KPI 'Punto de Equilibrio' muestra cuántos litros debe producir al mes para cubrir costos fijos. La línea roja en el gráfico marca ese punto." },
    ],
    tips: [
      { type: "tip", text: "Use el escenario pesimista (−15 % producción, −10 % precio) para validar que su finca aguanta crisis. Si el margen es negativo, ajuste los costos fijos." },
    ],
  },
  {
    id: "co2",
    icon: Wind,
    color: "#39ff7e",
    category: "Inteligencia",
    title: "Huella de Carbono",
    subtitle: "Emisiones GEI según IPCC 2019, captura de praderas y benchmarking",
    steps: [
      { step: 1, title: "Entender los KPIs de carbono", desc: "Emisión bruta (tCO₂eq/mes), intensidad de leche (kg CO₂eq/L), captura de praderas y huella neta. La intensidad es el indicador más importante para comparar con la competencia." },
      { step: 2, title: "Interpretar el benchmarking", desc: "Su finca se compara con la media de Colombia (1.05 kg/L) y el promedio extensivo latinoamericano (1.85 kg/L). El objetivo es mantenerse por debajo de 1.0 kg/L." },
      { step: 3, title: "Balance de gases", desc: "El desglose muestra CH₄ entérico (la mayor fuente), N₂O del estiércol y la captura de CO₂ por las praderas. Use este análisis para acceder a bonos de carbono." },
      { step: 4, title: "Generar reporte de huella", desc: "Botón PDF genera el informe de huella de carbono con metodología IPCC Tier 2, apto para bonos de carbono y certificaciones verdes." },
    ],
    tips: [
      { type: "tip", text: "Mejorar la calidad del pasto (kikuyo, brachiaria mejorada) reduce el CH₄ entérico hasta en un 12 % por mejor digestibilidad." },
    ],
  },
  {
    id: "genetica-m",
    icon: Dna,
    color: "#a855f7",
    category: "Inteligencia",
    title: "Genética y Pedigrí",
    subtitle: "Ranking DEP, árbol genealógico y evaluación por índices",
    steps: [
      { step: 1, title: "Entender el DEP (Diferencial de Producción Esperada)", desc: "El DEP de leche en libras indica cuántos litros adicionales producirán los hijos de ese toro respecto al promedio. Un toro con DEP +800L es excelente para lechería." },
      { step: 2, title: "Leer el ranking genético", desc: "La tabla ordena los animales por score compuesto (DEP leche + conformación + facilidad de parto + longevidad). Verde > 80, naranja 60–80, rojo < 60." },
      { step: 3, title: "Ver el pedigrí", desc: "Haga clic en el nombre del animal para ver el árbol genealógico con padre y madre. Si el padre es un toro importado, sus DEP internacionales se muestran." },
      { step: 4, title: "Planificar el apareamiento", desc: "Con el filtro de 'Planificación', seleccione una vaca y el sistema sugiere los 3 mejores toros del módulo Semen para maximizar el progreso genético." },
    ],
    tips: [
      { type: "info", text: "En razas de doble propósito (Gyr, Simmental, Pardo Suizo), priorice DEP leche + DEP carne en igual proporción." },
    ],
  },
  {
    id: "asesora",
    icon: Bot,
    color: "#e879f9",
    category: "Inteligencia",
    title: "Asesora IA",
    subtitle: "Chatbot especializado en ganadería colombiana 24/7",
    steps: [
      { step: 1, title: "Iniciar una consulta", desc: "Asesora IA → campo de texto. Escriba su pregunta en lenguaje natural. Ej: '¿Qué dosis de oxitocina uso en una vaca con retención de placenta?'" },
      { step: 2, title: "Consultas de nutrición", desc: "Pregunte sobre raciones, balances y deficiencias. La IA toma en cuenta las razas de su hato y las condiciones del altiplano colombiano vs. trópico bajo." },
      { step: 3, title: "Consultas de reproducción", desc: "Pregunte sobre protocolos hormonales (CIDR, Ovsynch, crestar), dosis y frecuencias. La IA cita la literatura técnica de CONtECOL y Fedegán." },
      { step: 4, title: "Consultas de mercado", desc: "Pregunte sobre precio de leche por cuenca lechera, precios de novillas en subastas y tendencias del mercado de cárnicos en Colombia." },
    ],
    tips: [
      { type: "info", text: "La Asesora IA no reemplaza al médico veterinario. Para urgencias o diagnósticos definitivos, consulte siempre un profesional certificado." },
      { type: "tip", text: "Sea específico: 'vaca Holstein, 3er parto, 60 DPP, produciendo 14 L' da una respuesta mucho más útil que 'mi vaca está baja de producción'." },
    ],
  },
  // ── GESTIÓN ──────────────────────────────────────────────────────────────
  {
    id: "multifinca",
    icon: Building2,
    color: "#00f5d4",
    category: "Gestión",
    title: "Multi-Finca",
    subtitle: "Gestión centralizada de hasta 3 fincas desde un solo panel",
    steps: [
      { step: 1, title: "Agregar una finca", desc: "Multi-Finca → '+'. Ingrese nombre, municipio, área (ha), tipo de explotación y número de animales. Las fincas adicionales requieren Plan PRO o superior." },
      { step: 2, title: "Comparar indicadores", desc: "La tabla comparativa muestra producción L/día, costo/litro, número de animales y margen para cada finca. Identifique cuál está mejor y aprenda de sus prácticas." },
      { step: 3, title: "Cambiar de finca activa", desc: "Haga clic en la tarjeta de la finca que quiere gestionar. El sidebar y todos los módulos mostrarán los datos de esa finca." },
      { step: 4, title: "Generar reporte consolidado", desc: "Botón 'Reporte Consolidado' genera un PDF con los indicadores de todas las fincas en una sola hoja. Ideal para reuniones con inversores." },
    ],
    tips: [
      { type: "info", text: "Plan Platino incluye fincas ilimitadas y un panel de consolidación con BI avanzado." },
    ],
  },
  {
    id: "alertas",
    icon: Bell,
    color: "#ff9500",
    category: "Gestión",
    title: "Centro de Alertas",
    subtitle: "Notificaciones, severidad, resolver y configurar umbrales",
    steps: [
      { step: 1, title: "Leer una alerta", desc: "Las alertas tienen 3 severidades: Crítico (rojo) = acción inmediata, Advertencia (naranja) = atención pronto, Informativo (azul) = FYI." },
      { step: 2, title: "Resolver una alerta", desc: "Haga clic en la alerta → 'Resolver'. Agregue un comentario de qué acción tomó. La alerta pasa a 'Historial' y queda registrada con fecha y responsable." },
      { step: 3, title: "Configurar umbrales", desc: "Configuración → Notificaciones. Defina los umbrales que generan alerta: caída de producción > X %, stock mínimo de insumos, días sin registrar ordeño, etc." },
      { step: 4, title: "Notificaciones push", desc: "Si instaló la PWA, las alertas críticas llegan como notificación push incluso si no tiene la app abierta. Active los permisos de notificación en su dispositivo." },
    ],
    tips: [
      { type: "tip", text: "Revise el centro de alertas al inicio de cada jornada. Las alertas sin resolver por más de 48 h se escalan automáticamente al administrador." },
    ],
  },
  {
    id: "usuarios",
    icon: Users,
    color: "#00f5d4",
    category: "Gestión",
    title: "Usuarios y Permisos",
    subtitle: "Gestión de cuentas, roles y acceso por módulo",
    steps: [
      { step: 1, title: "Crear un usuario nuevo", desc: "Usuarios → '+'. Ingrese nombre, email y rol (Admin, Veterinario, Operario de campo, Solo lectura). El sistema envía el enlace de activación al email." },
      { step: 2, title: "Asignar permisos por módulo", desc: "Cada usuario tiene una matriz de permisos: Ver, Editar, Crear, Eliminar por módulo. El rol predeterminado define los permisos base, que puede ajustar individualmente." },
      { step: 3, title: "Revocar acceso", desc: "Fila del usuario → 'Desactivar'. El usuario ya no puede iniciar sesión pero sus registros históricos se conservan." },
      { step: 4, title: "Cambiar contraseña", desc: "Fila del usuario → 'Resetear contraseña'. Se envía un enlace al email del usuario para establecer una nueva clave." },
    ],
    tips: [
      { type: "warning", text: "Solo el Administrador puede crear y eliminar usuarios. El rol Super Administrador (⬡ CIVAC) tiene acceso al Server Panel." },
    ],
  },
  {
    id: "configuracion",
    icon: Settings,
    color: "#94a3b8",
    category: "Gestión",
    title: "Configuración",
    subtitle: "Datos de la finca, apariencia, notificaciones y seguridad",
    steps: [
      { step: 1, title: "Datos de la finca", desc: "Tab 'Finca'. Complete nombre, NIT, propietario, ubicación, área, tipo de explotación. Estos datos aparecen en todos los PDFs y reportes." },
      { step: 2, title: "Apariencia", desc: "Tab 'Apariencia'. Cambie el tema (oscuro/claro), el idioma (español colombiano) y la densidad de la interfaz (compacto / normal / espacioso)." },
      { step: 3, title: "Seguridad", desc: "Tab 'Seguridad'. Active autenticación en dos pasos (2FA), cambie su contraseña y vea los últimos inicios de sesión con IP y dispositivo." },
      { step: 4, title: "Exportar / Importar datos", desc: "Tab 'Datos'. Exporte todo el estado de la app a JSON (backup completo). Para restaurar, use el botón 'Importar' y seleccione el archivo de backup." },
    ],
    tips: [
      { type: "info", text: "Haga backup semanal usando Configuración → Datos → Exportar JSON o el módulo Drive para backup automático en la nube." },
    ],
  },
  {
    id: "drive",
    icon: Cloud,
    color: "#00c8ff",
    category: "Gestión",
    title: "Drive — Backup en la Nube",
    subtitle: "Respaldo automático, historial de 30 versiones y restauración",
    steps: [
      { step: 1, title: "Conectar Google Drive", desc: "Drive → 'Conectar'. Autorice a CIVAC PRO acceso a una carpeta específica de su Google Drive. Solo se accede a la carpeta CIVAC, no a otros archivos." },
      { step: 2, title: "Hacer backup manual", desc: "Botón 'Backup ahora'. El sistema sube un archivo JSON con toda la información de la app. El nombre incluye la fecha y la versión." },
      { step: 3, title: "Programar backup automático", desc: "Toggle 'Backup automático'. Seleccione la frecuencia (diario/semanal) y la hora. El backup ocurre en segundo plano con Background Sync del Service Worker." },
      { step: 4, title: "Restaurar una versión", desc: "En el historial, seleccione la versión que desea restaurar → 'Restaurar'. Se le pedirá confirmar, pues esto sobreescribe el estado actual de la app." },
    ],
    tips: [
      { type: "warning", text: "Restaurar un backup elimina todos los datos que registró después de esa fecha. Haga un backup previo antes de restaurar." },
    ],
  },
  {
    id: "datos",
    icon: Database,
    color: "#f97316",
    category: "Gestión",
    title: "Centro de Datos",
    subtitle: "Exportar, importar JSON y reset completo de la aplicación",
    steps: [
      { step: 1, title: "Exportar todo a JSON", desc: "Datos → 'Exportar JSON'. Descarga un archivo con todos los animales, registros, configuración y usuarios. Es el backup más completo disponible." },
      { step: 2, title: "Importar un backup", desc: "Datos → 'Importar'. Seleccione el archivo JSON de backup. El sistema valida la integridad antes de importar. Los datos actuales se reemplazan." },
      { step: 3, title: "Exportar módulos individuales", desc: "Cada módulo tiene su propio botón CSV. Desde el Centro de Datos puede exportar todos los módulos de una vez." },
      { step: 4, title: "Reset de fábrica", desc: "Botón 'Reset completo'. Elimina TODOS los datos y restaura la app al estado inicial con datos demo. Irreversible. Solo use si va a pasar la app a un nuevo propietario." },
    ],
    tips: [
      { type: "warning", text: "El Reset completo es IRREVERSIBLE. Asegúrese de exportar un backup JSON antes de ejecutarlo." },
    ],
  },
  {
    id: "planes",
    icon: CreditCard,
    color: "#fbbf24",
    category: "Gestión",
    title: "Planes y Suscripción",
    subtitle: "Básico / PRO / Premium / Platino — Wompi, Nequi y PSE",
    steps: [
      { step: 1, title: "Ver los planes disponibles", desc: "Planes → compare Básico (gratis), PRO ($129K/mes), Premium ($289K/mes) y Platino ($890K/mes). Cada plan desbloquea módulos y capacidades adicionales." },
      { step: 2, title: "Cambiar de plan", desc: "Haga clic en 'Contratar' en el plan deseado. Se abre la pasarela de pago Wompi. Puede pagar con tarjeta, Nequi o PSE." },
      { step: 3, title: "Pago con Nequi", desc: "Seleccione Nequi, ingrese su número de celular, confirme en la app de Nequi. El plan se activa en menos de 2 minutos." },
      { step: 4, title: "Factura electrónica", desc: "Planes → 'Mis Facturas'. CIVAC PRO emite factura electrónica DIAN con cada cobro. Descargue el PDF para contabilidad." },
    ],
    tips: [
      { type: "info", text: "Los planes anuales tienen 2 meses de bonificación. Equivale a un descuento del 16.7 %." },
    ],
  },
];

const CATEGORIES = ["Todos", "Inicio", "Inventario y Salud", "Producción", "Campo", "Insumos y Costos", "Inteligencia", "Gestión"];

const FAQS = [
  { q: "¿Funciona sin internet?", a: "Sí. CIVAC PRO es una PWA con Service Worker v8. Todos los módulos funcionan offline. Los datos se sincronizan automáticamente al reconectarse gracias al Background Sync." },
  { q: "¿Cómo hago backup de mis datos?", a: "Tres opciones: 1) Datos → Exportar JSON (manual). 2) Drive → Backup automático a Google Drive. 3) El Service Worker mantiene caché local de los últimos datos." },
  { q: "¿Puedo usar CIVAC PRO en el celular?", a: "Sí. Instálelo como PWA desde el navegador Chrome o Safari. Funciona igual que una app nativa con íconos, splash screen y notificaciones push." },
  { q: "¿Cuántos animales soporta el plan Básico?", a: "El plan Básico permite hasta 50 animales. Para hatos más grandes necesita el Plan PRO (animales ilimitados)." },
  { q: "¿El GPS funciona sin collares?", a: "El módulo GPS puede registrar la posición del dispositivo (operario). Para rastrear el ganado necesita los collares CIVAC-GPS que se conectan via MQTT." },
  { q: "¿Cómo exporto para el ICA?", a: "Módulo Trazabilidad → 'Exportar SINIGAN'. Genera el XML en el formato requerido por el Instituto Colombiano Agropecuario para reporte de movilización." },
  { q: "¿Cuántos usuarios puede tener mi cuenta?", a: "Plan Básico: 1 usuario. PRO: 5 usuarios. Premium: 15 usuarios. Platino: ilimitados." },
  { q: "¿Puedo acceder desde varios dispositivos?", a: "Sí. Al ser una aplicación web, puede acceder desde cualquier dispositivo con navegador. Los datos se sincronizan via Drive si lo configura." },
];

// ─── Components ────────────────────────────────────────────────────────────────

function TipBox({ tip }: { tip: Tip }) {
  const cfg = {
    tip:     { icon: Lightbulb,    bg: "rgba(0,245,212,0.07)", border: "rgba(0,245,212,0.25)", color: "#00f5d4" },
    warning: { icon: AlertCircle,  bg: "rgba(255,153,0,0.07)", border: "rgba(255,153,0,0.3)",   color: "#ff9500" },
    info:    { icon: Info,         bg: "rgba(0,200,255,0.07)", border: "rgba(0,200,255,0.25)",  color: "#00c8ff" },
  }[tip.type];
  const Icon = cfg.icon;
  return (
    <div className="flex gap-3 rounded-xl p-3 text-sm"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
      <Icon size={14} className="mt-0.5 flex-shrink-0" style={{ color: cfg.color }} />
      <span className="text-muted-foreground leading-relaxed">{tip.text}</span>
    </div>
  );
}

function SectionCard({ section, isOpen, onToggle }: {
  section: ManualSection;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const Icon = section.icon;
  return (
    <div className="rounded-xl overflow-hidden border transition-all"
      style={{
        borderColor: isOpen ? `${section.color}50` : "rgba(255,255,255,0.07)",
        boxShadow: isOpen ? `0 0 20px ${section.color}10` : "none",
        background: "linear-gradient(135deg,rgba(5,15,40,0.95),rgba(8,20,55,0.9))",
      }}>
      {/* Header */}
      <button
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-white/5 transition-colors"
        onClick={onToggle}
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${section.color}15`, border: `1px solid ${section.color}35` }}>
          <Icon size={16} style={{ color: section.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm text-white leading-tight">{section.title}</div>
          <div className="text-[11px] text-white/40 mt-0.5 truncate">{section.subtitle}</div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="hidden sm:block text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: `${section.color}15`, color: section.color }}>
            {section.steps.length} pasos
          </span>
          {isOpen
            ? <ChevronUp size={16} className="text-white/40" />
            : <ChevronDown size={16} className="text-white/40" />}
        </div>
      </button>

      {/* Body */}
      {isOpen && (
        <div className="px-5 pb-5 space-y-4 border-t" style={{ borderColor: `${section.color}20` }}>
          {/* Steps */}
          <div className="space-y-3 mt-4">
            {section.steps.map(s => (
              <div key={s.step} className="flex gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0 mt-0.5"
                  style={{ background: `${section.color}20`, color: section.color, border: `1px solid ${section.color}40` }}>
                  {s.step}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white leading-tight">{s.title}</p>
                  <p className="text-[12px] text-white/55 mt-0.5 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Tips */}
          {section.tips && section.tips.length > 0 && (
            <div className="space-y-2">
              {section.tips.map((t, i) => <TipBox key={i} tip={t} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function Manual() {
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("Todos");
  const [openIds, setOpenIds]   = useState<Set<string>>(new Set(["primeros-pasos"]));
  const [faqOpen, setFaqOpen]   = useState<Set<number>>(new Set());

  const toggleSection = (id: string) => setOpenIds(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const toggleFaq = (i: number) => setFaqOpen(prev => {
    const next = new Set(prev);
    next.has(i) ? next.delete(i) : next.add(i);
    return next;
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return SECTIONS.filter(s => {
      const matchCat = category === "Todos" || s.category === category;
      if (!q) return matchCat;
      const haystack = `${s.title} ${s.subtitle} ${s.steps.map(x => x.title + " " + x.desc).join(" ")}`.toLowerCase();
      return matchCat && haystack.includes(q);
    });
  }, [search, category]);

  const expandAll  = () => setOpenIds(new Set(filtered.map(s => s.id)));
  const collapseAll = () => setOpenIds(new Set());

  return (
    <div className="space-y-5 pb-12 max-w-4xl">

      {/* ── Banner ─────────────────────────────────────────────────────────── */}
      <div className="rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden"
        style={{ background:"linear-gradient(135deg,#020d1a 0%,#0a2745 100%)", border:"1px solid rgba(0,245,212,0.3)", boxShadow:"0 0 40px rgba(0,245,212,0.08)" }}>
        <div className="absolute right-0 top-0 w-48 h-full pointer-events-none opacity-10"
          style={{ background:"radial-gradient(ellipse at right, #00f5d4, transparent 70%)" }}/>
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background:"rgba(0,245,212,0.1)", border:"1px solid rgba(0,245,212,0.4)", boxShadow:"0 0 16px rgba(0,245,212,0.2)" }}>
            <BookOpen size={24} style={{ color:"#00f5d4" }}/>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white" style={{ fontFamily:"Sora,sans-serif" }}>Manual de Usuario — CIVAC PRO</h1>
            <p className="text-sm" style={{ color:"rgba(0,245,212,0.75)" }}>Guía completa interactiva · {SECTIONS.length} módulos documentados · {SECTIONS.reduce((a, s) => a + s.steps.length, 0)} pasos</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => printModule("Manual de Usuario CIVAC PRO", "Guía completa")}
          className="h-9 gap-1.5 text-sm relative" style={{ background:"rgba(0,245,212,0.08)", border:"1px solid rgba(0,245,212,0.3)", color:"#00f5d4" }}>
          <Printer size={14}/> PDF
        </Button>
      </div>

      {/* ── Barra de búsqueda y filtros ──────────────────────────────────── */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15}/>
          <Input
            placeholder="Buscar módulo, tema o palabra clave..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-muted/30 border-border/50"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs">✕</button>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button key={cat}
              onClick={() => setCategory(cat)}
              className="text-[11px] font-bold px-3 py-1.5 rounded-full transition-all"
              style={category === cat
                ? { background:"rgba(0,245,212,0.15)", border:"1px solid rgba(0,245,212,0.4)", color:"#00f5d4" }
                : { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.5)" }}>
              {cat}
            </button>
          ))}
          <span className="flex-1"/>
          <button onClick={expandAll} className="text-[11px] text-white/40 hover:text-white/70 flex items-center gap-1 transition-colors">
            <ChevronDown size={12}/> Expandir todo
          </button>
          <button onClick={collapseAll} className="text-[11px] text-white/40 hover:text-white/70 flex items-center gap-1 transition-colors">
            <ChevronUp size={12}/> Colapsar todo
          </button>
        </div>
      </div>

      {/* ── Stats row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:"Módulos documentados", val: SECTIONS.length,                                           c:"#00f5d4" },
          { label:"Pasos totales",         val: SECTIONS.reduce((a, s) => a + s.steps.length, 0),         c:"#00c8ff" },
          { label:"Consejos y avisos",     val: SECTIONS.reduce((a, s) => a + (s.tips?.length ?? 0), 0),  c:"#ff9500" },
          { label:"Preguntas frecuentes",  val: FAQS.length,                                              c:"#a855f7" },
        ].map(k => (
          <div key={k.label} className="rounded-xl p-4 text-white relative overflow-hidden"
            style={{ background:"linear-gradient(135deg,#020d09,#041208)", border:"1px solid rgba(0,245,212,0.1)" }}>
            <div className="absolute top-0 right-0 w-12 h-12 rounded-full pointer-events-none"
              style={{ background:k.c, opacity:0.12, filter:"blur(14px)", transform:"translate(30%,-30%)" }}/>
            <div className="text-2xl font-bold" style={{ color:k.c, fontFamily:"Sora,sans-serif" }}>{k.val}</div>
            <div className="text-[10px] text-white/40 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      {/* ── Secciones por categoría ──────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <HelpCircle size={36} className="mx-auto mb-3 opacity-30"/>
          <p className="font-medium">No hay resultados para "{search}"</p>
          <p className="text-sm mt-1">Intente con otra palabra clave o cambie el filtro de categoría</p>
        </div>
      ) : (
        (() => {
          const cats = category === "Todos"
            ? [...new Set(filtered.map(s => s.category))]
            : [category];
          return cats.map(cat => (
            <div key={cat} className="space-y-2">
              <div className="flex items-center gap-2 py-2">
                <div className="h-px flex-1" style={{ background:"rgba(255,255,255,0.06)" }}/>
                <span className="text-[11px] font-black uppercase tracking-widest text-white/30 px-2">{cat}</span>
                <div className="h-px flex-1" style={{ background:"rgba(255,255,255,0.06)" }}/>
              </div>
              <div className="space-y-2">
                {filtered.filter(s => s.category === cat).map(s => (
                  <SectionCard key={s.id} section={s} isOpen={openIds.has(s.id)} onToggle={() => toggleSection(s.id)} />
                ))}
              </div>
            </div>
          ));
        })()
      )}

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      {(category === "Todos" || !search) && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 py-2">
            <div className="h-px flex-1" style={{ background:"rgba(255,255,255,0.06)" }}/>
            <span className="text-[11px] font-black uppercase tracking-widest text-white/30 px-2">Preguntas Frecuentes</span>
            <div className="h-px flex-1" style={{ background:"rgba(255,255,255,0.06)" }}/>
          </div>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-xl overflow-hidden border"
                style={{ borderColor: faqOpen.has(i) ? "rgba(0,245,212,0.3)" : "rgba(255,255,255,0.07)", background:"linear-gradient(135deg,rgba(5,15,40,0.95),rgba(8,20,55,0.9))" }}>
                <button className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-white/5 transition-colors"
                  onClick={() => toggleFaq(i)}>
                  <HelpCircle size={15} style={{ color:"#00f5d4", flexShrink:0 }}/>
                  <span className="flex-1 text-sm font-bold text-white">{faq.q}</span>
                  {faqOpen.has(i) ? <ChevronUp size={14} className="text-white/40"/> : <ChevronRight size={14} className="text-white/40"/>}
                </button>
                {faqOpen.has(i) && (
                  <div className="px-5 pb-4 pt-1 border-t text-[12px] text-white/55 leading-relaxed"
                    style={{ borderColor:"rgba(0,245,212,0.15)" }}>
                    <ArrowRight size={11} className="inline mr-1.5 mb-0.5" style={{ color:"#00f5d4" }}/>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div className="rounded-xl p-5 text-center"
        style={{ background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <Star size={12} style={{ color:"#fbbf24" }}/>
          <span className="text-[11px] font-black text-white">CIVAC PRO — Manual de Usuario v9.0</span>
          <Star size={12} style={{ color:"#fbbf24" }}/>
        </div>
        <p className="text-[10px] text-white/35 leading-relaxed">
          ¿Necesita ayuda adicional? Consulte la <strong className="text-white/55">Asesora IA</strong> para preguntas técnicas
          o escriba a <strong className="text-white/55">soporte@softgan.com.co</strong>
        </p>
        <div className="flex items-center justify-center gap-4 mt-3">
          <div className="flex items-center gap-1.5 text-[9px] text-white/30">
            <Globe size={9}/> civac.pro
          </div>
          <div className="flex items-center gap-1.5 text-[9px] text-white/30">
            <Zap size={9}/> SoftGan SAS · NIT 900.205.856-3
          </div>
          <div className="flex items-center gap-1.5 text-[9px] text-white/30">
            <CheckCircle2 size={9}/> Actualizado 2026
          </div>
        </div>
      </div>
    </div>
  );
}
