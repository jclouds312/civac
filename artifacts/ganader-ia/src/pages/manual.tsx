import { useState } from "react";
import { Link } from "wouter";
import {
  BookOpen, Search, PlayCircle, ChevronDown, ChevronRight,
  LayoutDashboard, List, Activity, ActivitySquare, Baby, Dna,
  Wheat, Package, TestTube, DollarSign, Users, LineChart, Leaf, Map,
  Bell, Settings, UserCircle, HelpCircle, Scale, Smartphone,
  Wifi, WifiOff, Download, Lightbulb, AlertTriangle, CheckCircle2,
  Keyboard, Star, Zap, Clock, RefreshCw, ArrowRight, Info,
} from "lucide-react";

type TabKey = "inicio" | "modulos" | "atajos" | "pwa" | "faq";

const MODULOS_GUIA = [
  {
    icon: LayoutDashboard, name: "Tablero KPIs", color: "text-emerald-400", bg: "bg-emerald-500/15",
    resumen: "Centro de mando de tu finca. Visualiza todos los indicadores clave en una sola pantalla.",
    pasos: [
      "Al iniciar sesión llegarás automáticamente al Tablero. Es tu pantalla principal.",
      "Revisa los 6 KPIs en la fila superior: animales totales, litros/día, peso promedio, gestantes, en tratamiento y valor del hato.",
      "Usa las pestañas 'Producción Lechera' / 'Peso del Ganado' para cambiar el gráfico histórico (7 meses).",
      "El panel Análisis de Pesos muestra el promedio real de cada categoría vs su meta ideal.",
      "En Producción Lechera verás el ranking de las 3 mejores vacas productoras del día.",
      "Manejo de Potreros muestra en tiempo real cuáles requieren rotación urgente.",
      "Las Alertas activas se muestran en rojo/ámbar con enlace directo a cada módulo.",
      "En la parte inferior está el acceso rápido a los 16 módulos del sistema.",
    ],
    tips: ["Revisa el tablero cada mañana antes de salir al campo.", "El semáforo de alertas indica cuántos eventos requieren acción hoy.", "Haz clic en cualquier tarjeta de módulo para navegar directamente."],
    advertencias: [],
  },
  {
    icon: List, name: "Inventario", color: "text-blue-400", bg: "bg-blue-500/15",
    resumen: "Registro completo del hato. Alta, edición y baja de animales con RFID/arete.",
    pasos: [
      "Navega a Inventario desde el menú lateral (sección Animales).",
      "La tabla muestra todos los animales con: ID/Arete, nombre, raza, categoría, peso, lote y estado.",
      "Para BUSCAR: escribe en la barra superior (busca por nombre, ID o raza).",
      "Para FILTRAR por categoría o estado: usa los selectores desplegables.",
      "Para AGREGAR un animal: clic en '+ Nuevo animal' → rellenar el formulario → Guardar.",
      "Campos obligatorios: ID/Arete, Nombre, Raza, Categoría, Peso (kg), Lote.",
      "Para EDITAR: clic en el ícono de lápiz ✏ en la fila del animal.",
      "Para ELIMINAR: clic en el ícono de papelera 🗑 → confirmar la acción.",
      "El botón 'Exportar' genera un archivo CSV con todos los animales filtrados.",
    ],
    tips: ["Usa el ID real del arete RFID o el número de chapeta como identificador único.", "Los lotes (A, B, C...) corresponden a los grupos de potrero.", "El estado 'Producción' activa automáticamente el campo litros/día."],
    advertencias: ["Al eliminar un animal, su historial de pesaje y reproducción también se elimina."],
  },
  {
    icon: ActivitySquare, name: "Ficha Individual", color: "text-sky-400", bg: "bg-sky-500/15",
    resumen: "Historia clínica completa por animal: vacunas, pesos, partos y eventos sanitarios.",
    pasos: [
      "Ve a Ficha Individual desde el menú lateral.",
      "Selecciona el animal por su nombre o ID en el selector desplegable.",
      "La ficha muestra métricas de producción individual (si aplica): litros/día, partos, peso actual.",
      "La sección Vacunas lista las vacunas aplicadas con fecha y nombre.",
      "La sección Pesaje muestra el historial de pesos con variación.",
      "La sección Partos registra cada evento de parto con fecha y cría.",
      "La línea de tiempo en la parte inferior muestra todos los eventos cronológicamente.",
      "Para agregar un evento: clic en '+ Agregar evento' en la sección correspondiente.",
    ],
    tips: ["Revisa la ficha antes de cada visita veterinaria.", "Los eventos aparecen en la línea de tiempo del Tablero."],
    advertencias: ["Los datos de la ficha están vinculados al ID del animal — no cambies el ID si el animal ya tiene historial."],
  },
  {
    icon: Baby, name: "Reproducción", color: "text-pink-400", bg: "bg-pink-500/15",
    resumen: "Control de celos, inseminación artificial, gestaciones y partos próximos.",
    pasos: [
      "Ve a Reproducción desde el menú lateral (sección Animales).",
      "Revisa los KPIs reproductivos en la fila superior: tasa concepción, próximos partos, anestros, gestantes e IEP.",
      "La tabla de próximos partos está ordenada por urgencia (días restantes en color semáforo).",
      "Días en verde: > 30 días. Ámbar: 8–30 días. Rojo: ≤ 7 días (urgente).",
      "Para AGREGAR un registro de servicio/gestación: clic en '+ Nuevo registro'.",
      "Completa: arete, nombre del animal, tipo de servicio (IA o monta natural), fecha estimada de parto, partos previos.",
      "El panel de Anestros muestra las vacas con > 90 días sin celo (acción urgente recomendada por IA).",
      "El diagnóstico IA recomienda el protocolo GnRH cuando el IEP supera 390 días.",
    ],
    tips: ["Usa el código del toro o del semen para registrar el servicio de IA.", "El IEP meta para ganadería lechera colombiana es ≤ 390 días."],
    advertencias: ["Un IEP > 428 días implica una pérdida estimada de $8.2M COP/mes según el simulador IA."],
  },
  {
    icon: Activity, name: "Producción", color: "text-cyan-400", bg: "bg-cyan-500/15",
    resumen: "Registro diario de ordeño, litros por vaca, ingresos y análisis histórico.",
    pasos: [
      "Ve a Producción desde el menú lateral.",
      "Los KPIs superiores muestran: total litros/día, litros/vaca, ingreso mensual y margen.",
      "El gráfico de barras muestra la producción histórica de los últimos 7 meses.",
      "La tabla de vacas en producción muestra ranking por litros/día con barras visuales.",
      "Para REGISTRAR un ordeño: clic en '+ Registrar ordeño'.",
      "Completa: fecha, litros totales, precio (por defecto $1.250/L) y nota del turno.",
      "El ingreso se calcula automáticamente: litros × precio.",
      "La tabla histórica inferior muestra todos los registros ordenados por fecha.",
    ],
    tips: ["Registra el ordeño cada mañana para mantener el historial actualizado.", "El precio de $1.250/L es el promedio FederaCafé — ajústalo en tu configuración."],
    advertencias: [],
  },
  {
    icon: Scale, name: "Básculas y Pesaje", color: "text-amber-400", bg: "bg-amber-500/15",
    resumen: "Registro de pesos con condición corporal, variación automática y gráficos de evolución.",
    pasos: [
      "Ve a Básculas y Pesaje desde el menú lateral.",
      "Los 4 KPIs muestran: total registros, peso promedio, ganancia mensual promedio y último pesaje.",
      "El gráfico de líneas muestra la evolución de peso de un animal seleccionado.",
      "El gráfico de barras compara el peso promedio por categoría.",
      "Para REGISTRAR un pesaje: clic en '+ Registrar pesaje'.",
      "Completa: animal, fecha, peso (kg), báscula utilizada, operador, condición corporal (1-5) y observaciones.",
      "La variación vs el pesaje anterior se calcula automáticamente (kg y %).",
      "Para FILTRAR: usa el selector de animal o categoría.",
      "Condición corporal: 1=muy flaco, 3=óptimo, 5=muy gordo.",
    ],
    tips: ["Pesa a todas las vacas al inicio y al final de la lactancia.", "La ganancia diaria de peso en terneros debe ser > 500g/día para ser rentable."],
    advertencias: ["Un peso negativo o muy diferente puede ser un error de digitación — revisa antes de guardar."],
  },
  {
    icon: Dna, name: "Genética", color: "text-violet-400", bg: "bg-violet-500/15",
    resumen: "DEP (Diferencias de Transmisión Esperada), ranking genético y árbol de pedigrí.",
    pasos: [
      "Ve a Genética desde el menú lateral.",
      "El ranking genético muestra los toros evaluados por su índice global.",
      "Cada toro tiene DEP individuales: leche, grasa %, proteína %, facilidad de parto, conformación.",
      "Las barras de color indican qué tan bueno es el DEP vs el promedio de la población.",
      "El árbol de pedigrí muestra el padre y abuelo materno/paterno.",
      "La sección Progenie lista las crías registradas con su producción.",
      "Usa el DEP leche (+L) para elegir el semen que mejore la producción en tu finca.",
      "El DEP facilidad de parto es crítico para vaquillas/novillas primerizas.",
    ],
    tips: ["Un DEP leche de +500L significa que las hijas producirán 500L más que el promedio.", "Prioriza DEP proteína % en fincas de leche para quesería artesanal."],
    advertencias: [],
  },
  {
    icon: Map, name: "Potreros", color: "text-teal-400", bg: "bg-teal-500/15",
    resumen: "Rotación de pastoreo, aforo, días de ocupación/descanso con mapa visual interactivo.",
    pasos: [
      "Ve a Potreros desde el menú lateral (sección Campo).",
      "El mapa CSS muestra cada potrero con un color según su estado: verde (disponible), ámbar (ocupado), rojo (rotar ya), gris (descanso).",
      "Usa el toggle Lista / Mapa para cambiar la vista.",
      "El semáforo de rotación indica cuántos días quedan antes de rotar.",
      "Para CAMBIAR el estado de un potrero: clic en el potrero → botón 'Cambiar estado'.",
      "Para AGREGAR un potrero: clic en '+ Nuevo potrero' → nombre, tipo de pasto, hectáreas, ciclo de rotación.",
      "El ciclo de rotación es el tiempo total (ocupación + descanso) en días.",
      "La alerta ⚡ aparece cuando el potrero debe rotarse en ≤ 3 días.",
    ],
    tips: ["El ciclo de rotación ideal para kikuyo en Cundinamarca es 28-35 días.", "Rota cuando el pasto tiene 25-30 cm de altura, no esperes al límite de días."],
    advertencias: ["Superar los días de ocupación degrada el potrero y reduce la producción lechera."],
  },
  {
    icon: Wheat, name: "Alimentación", color: "text-lime-400", bg: "bg-lime-500/15",
    resumen: "Raciones por categoría de animal, cálculo de materia seca y costeo nutricional.",
    pasos: [
      "Ve a Alimentación desde el menú lateral.",
      "Las raciones se muestran por categoría: vaca lactante, vaca seca, novilla, ternero, toro.",
      "Cada ración indica: ingrediente, cantidad (kg), proteína %, energía (Mcal/kg) y costo/animal/día.",
      "El total de materia seca (MS) y costo diario se calculan automáticamente.",
      "Para EDITAR una ración: clic en el ícono de edición → modificar cantidades.",
      "Para AGREGAR un suplemento: usa el botón '+ Suplemento'.",
      "El costeo total muestra el costo diario de alimentación por todo el hato.",
    ],
    tips: ["La vaca lechera de alta producción necesita mínimo 16% PC (proteína cruda) en la ración.", "El concentrado al 16% aporta energía; la sal mineralizada es obligatoria todos los días."],
    advertencias: ["Cambios bruscos de dieta pueden causar acidosis. Introduce cambios en 7-10 días."],
  },
  {
    icon: Package, name: "Insumos / Kardex", color: "text-orange-400", bg: "bg-orange-500/15",
    resumen: "Inventario de medicamentos, vacunas y materiales con stock mínimo y alertas automáticas.",
    pasos: [
      "Ve a Insumos desde el menú lateral.",
      "La tabla muestra todos los insumos con: nombre, categoría, stock actual, mínimo, máximo y unidad.",
      "El estado se calcula automáticamente: ✅ OK, ⚠ Pedir pronto, 🔴 Crítico.",
      "Para AUMENTAR stock: clic en el botón + azul de la fila del producto.",
      "Para REDUCIR stock: clic en el botón − rojo (simula el uso del insumo).",
      "Para AGREGAR un insumo nuevo: clic en '+ Nuevo insumo' → nombre, categoría, cantidades, unidad.",
      "La barra de progreso muestra el nivel de stock vs el máximo.",
      "Las alertas de stock crítico aparecen automáticamente en el Tablero y en Alertas.",
    ],
    tips: ["Define un mínimo que te permita hacer el pedido antes de que se agote (tiempo de entrega + margen de seguridad).", "Las vacunas tienen fechas de vencimiento — anótalas en las observaciones."],
    advertencias: ["Oxitocina y prostaglandina son medicamentos de control — regístralos con cuidado."],
  },
  {
    icon: TestTube, name: "Semen y Embriones", color: "text-indigo-400", bg: "bg-indigo-500/15",
    resumen: "Banco genético criogénico: pajillas de semen por toro y registro de transferencia embrionaria.",
    pasos: [
      "Ve a Semen y Embriones desde el menú lateral.",
      "La tabla de semen muestra: toro, raza, origen (nacional/importado), pajillas disponibles, precio/pajilla y DEP principales.",
      "La tabla de embriones muestra: donante, receptor, fecha de colecta, estado (fresco/congelado/transferido).",
      "Para AGREGAR pajillas: '+ Nueva dosis' → toro, cantidad, proveedor, precio.",
      "Para registrar una TRANSFERENCIA: '+TE' → donante, receptor, fecha, resultado.",
      "El inventario total de pajillas se actualiza automáticamente.",
    ],
    tips: ["Almacena siempre el nombre del toro y su código de catálogo para reproducibilidad.", "Las pajillas congeladas tienen vida útil indefinida si el nitrógeno se mantiene entre -196°C."],
    advertencias: ["Una transferencia embrionaria fallida debe registrarse igual para calcular la tasa de preñez real."],
  },
  {
    icon: DollarSign, name: "Costos y P&G", color: "text-green-400", bg: "bg-green-500/15",
    resumen: "Estado de resultados ganadero: ingresos, egresos, margen y costo por litro.",
    pasos: [
      "Ve a Costos y P&G desde el menú lateral.",
      "Los 5 KPIs superiores muestran: ingresos totales, egresos totales, utilidad neta, margen % y costo/litro.",
      "La ecuación de margen: Precio/L - Costo/L = Margen/L.",
      "La tabla P&G detalla cada concepto de ingreso y egreso con su valor mensual.",
      "Los ingresos incluyen: venta de leche (calculado de producción real), ganado y embriones.",
      "Los egresos incluyen: alimentación, nómina (calculada desde el módulo Personal), medicamentos y mantenimiento.",
      "El desglose de costo por litro muestra la participación % de cada rubro.",
      "Usa este módulo para justificar decisiones de inversión o ajustes de precio.",
    ],
    tips: ["El costo/litro objetivo para ser rentable en Colombia es < $900 COP.", "Si el margen cae < 20%, revisa primero el rubro de alimentación (es el mayor costo)."],
    advertencias: [],
  },
  {
    icon: Users, name: "Personal / Nómina", color: "text-amber-300", bg: "bg-amber-400/15",
    resumen: "Gestión de empleados: cargos, salarios, horas extras, EPS, ARL y prestaciones calculadas.",
    pasos: [
      "Ve a Personal desde el menú lateral.",
      "La tabla muestra todos los empleados con: nombre, cargo, cédula, ingreso, salario base, horas extras, EPS y ARL.",
      "El pie de tabla calcula automáticamente: nómina base total, prestaciones estimadas (52% adicional) y costo real.",
      "Para AGREGAR un empleado: '+ Nuevo empleado' → completar todos los campos.",
      "Para EDITAR o VER detalle: clic en el nombre del empleado.",
      "Las prestaciones incluyen: cesantías, intereses, prima, vacaciones, parafiscales y seguridad social.",
      "El total de nómina se usa automáticamente en el módulo de Costos y P&G.",
    ],
    tips: ["El salario mínimo en Colombia para 2025 es $1.423.500. Verifica que todos los empleados estén por encima.", "Las horas extras diurnas equivalen al 125% del valor hora ordinaria."],
    advertencias: ["El módulo es para estimación gerencial — para liquidaciones exactas consulta un contador."],
  },
  {
    icon: LineChart, name: "Predicciones IA", color: "text-purple-400", bg: "bg-purple-500/15",
    resumen: "Simulador financiero con IA: proyección a 12 meses con 4 sliders interactivos.",
    pasos: [
      "Ve a Predicciones IA desde el menú lateral.",
      "El diagnóstico inicial de SoftGan IA analiza tus indicadores actuales y detecta ineficiencias.",
      "Lee los 3 mensajes del diagnóstico: ⚠️ problemas detectados, ✅ logros actuales, 💡 oportunidades.",
      "El gráfico de proyección muestra producción estimada para los próximos 6 meses (con datos históricos).",
      "Usa los 4 sliders para simular escenarios:",
      "  — Precio leche: ajusta el precio de venta por litro (COP)",
      "  — Vacas en producción: número de vacas activas",
      "  — Litros/vaca: promedio de producción diaria",
      "  — Costo operativo: costo por litro en pesos",
      "Los resultados (ingreso, costo, utilidad, margen) se actualizan en tiempo real al mover los sliders.",
      "Guarda el escenario más favorable como referencia para tu planificación anual.",
    ],
    tips: ["El escenario más impactante suele ser reducir el IEP (mejorar reproducción).", "Un aumento de $50 COP/L en el precio equivale a +$1.5M/mes en un hato de 1.000L/día."],
    advertencias: [],
  },
  {
    icon: Leaf, name: "Huella de Carbono CO₂", color: "text-emerald-500", bg: "bg-emerald-600/15",
    resumen: "Medición de emisiones GEI según metodología IPCC 2019 y benchmarking regional.",
    pasos: [
      "Ve a Huella de Carbono desde el menú lateral.",
      "Los 5 KPIs muestran: emisión bruta (t CO₂eq/mes), intensidad por litro (kg CO₂eq/L), captura de praderas, huella neta y diferencia vs Latinoamérica.",
      "El gráfico de benchmarking compara tu finca vs: media Colombia, referencia IPCC Latam y promedio extensivo.",
      "La evolución mensual muestra si tu huella mejora o empeora en el tiempo.",
      "El balance de carbono desglosa los Alcances 1 (entérico), 2 (energía) y 3 (insumos).",
      "El módulo calcula cuántas hectáreas de praderas necesitarías para ser carbono neutral.",
      "Las recomendaciones de reducción están personalizadas según tu sistema productivo.",
    ],
    tips: ["Una intensidad < 1.0 kg CO₂eq/L es considerada eficiente para ganadería lechera colombiana.", "Mejorar la genética y reducir anestros disminuye la huella de carbono por litro producido."],
    advertencias: [],
  },
  {
    icon: Map, name: "Multi-Finca", color: "text-blue-400", bg: "bg-blue-600/15",
    resumen: "Gestión consolidada de múltiples predios con KPIs comparativos y vista ejecutiva.",
    pasos: [
      "Ve a Multi-Finca desde el menú lateral.",
      "Las tarjetas muestran cada finca con sus KPIs individuales: animales, producción, margen, CO₂ y personal.",
      "El indicador de variación (▲/▼) muestra el cambio vs el mes anterior.",
      "La tabla comparativa alinea todas las fincas para identificar cuál rinde mejor.",
      "Usa 'Ver detalle' para navegar al panel específico de cada finca.",
      "El resumen consolidado en la parte inferior suma todos los predios.",
      "Disponible a partir del plan Profesional (2 fincas) o Empresarial (ilimitadas).",
    ],
    tips: ["Compara el costo/litro entre fincas para identificar ineficiencias.", "La variación mensual en rojo indica que esa finca requiere atención esta semana."],
    advertencias: [],
  },
  {
    icon: Bell, name: "Alertas", color: "text-red-400", bg: "bg-red-500/15",
    resumen: "Centro de notificaciones: alertas críticas, advertencias y registro de resoluciones.",
    pasos: [
      "Ve a Alertas desde el menú lateral o el ícono de campana en el topbar.",
      "Las alertas están clasificadas: 🔴 CRÍTICO (acción inmediata) y ⚠ ADVERTENCIA (seguimiento).",
      "Cada alerta muestra: título, descripción detallada y hace cuánto tiempo se generó.",
      "Para RESOLVER una alerta: clic en el botón '✓ Resolver' de esa tarjeta.",
      "Los filtros superiores permiten ver solo críticas, solo advertencias o todas.",
      "Las alertas resueltas desaparecen de la vista activa pero quedan en el historial.",
      "El badge rojo del menú lateral indica cuántas alertas activas hay.",
    ],
    tips: ["Revisa las alertas críticas cada mañana antes de empezar el día.", "Configura las notificaciones push en Configuración para recibirlas en tu celular."],
    advertencias: ["No ignores las alertas de stock de medicamentos críticos (oxitocina, calcio i.v.) — son necesarios en partos de emergencia."],
  },
  {
    icon: Settings, name: "Configuración", color: "text-slate-400", bg: "bg-slate-500/15",
    resumen: "Ajustes de finca, apariencia (modo oscuro/claro), notificaciones, seguridad y datos.",
    pasos: [
      "Ve a Configuración desde el menú lateral (sección Sistema) o desde el menú de usuario.",
      "Pestaña FINCA: edita el nombre de la finca, propietario, municipio, NIT, teléfono y email.",
      "Pestaña APARIENCIA: alterna entre modo oscuro, claro o el del sistema.",
      "Pestaña NOTIFICACIONES: activa/desactiva alertas de stock, partos, rotación de potreros y reporte semanal.",
      "Pestaña SEGURIDAD: cambia contraseña y administra los roles de usuario.",
      "Pestaña DATOS: exporta todos los datos en JSON, importa una copia de respaldo o restablece los datos de demostración.",
      "Haz clic en 'Guardar cambios' para aplicar.",
    ],
    tips: ["Exporta tus datos en JSON mensualmente como respaldo externo.", "El modo oscuro es más cómodo para usar el sistema en el establo con poca luz."],
    advertencias: ["Restablecer datos elimina permanentemente todos tus registros y vuelve a los datos de demostración."],
  },
];

const ATAJOS = [
  { tecla: "/ o Ctrl+F", accion: "Abrir búsqueda en el menú lateral" },
  { tecla: "Escape", accion: "Cerrar menú de búsqueda o modal abierto" },
  { tecla: "G + D", accion: "Ir al Tablero (Dashboard)" },
  { tecla: "G + I", accion: "Ir a Inventario" },
  { tecla: "G + P", accion: "Ir a Producción" },
  { tecla: "G + R", accion: "Ir a Reproducción" },
  { tecla: "G + A", accion: "Ir a Alertas" },
  { tecla: "G + C", accion: "Ir a Configuración" },
  { tecla: "Alt + T", accion: "Cambiar modo oscuro/claro" },
  { tecla: "Alt + M", accion: "Colapsar/expandir menú lateral" },
  { tecla: "Ctrl + S", accion: "Guardar el formulario activo" },
  { tecla: "Ctrl + N", accion: "Abrir formulario de nuevo registro" },
  { tecla: "Ctrl + E", accion: "Exportar tabla actual a CSV" },
];

const FAQS_MANUAL = [
  { q: "¿Los datos se guardan si cierro el navegador?", a: "Sí. GanaderIA usa el almacenamiento local del navegador (localStorage) para mantener todos tus datos. Al recargar o volver a abrir, todo estará intacto. Adicionalmente, si tienes el plan Profesional o Empresarial, los datos se sincronizan en la nube automáticamente." },
  { q: "¿Puedo usar GanaderIA sin internet en el campo?", a: "Sí. GanaderIA es una PWA (Progressive Web App) con service worker avanzado. Una vez instalada o visitada, el sistema funciona completamente offline. Los datos siempre están en tu dispositivo. Al volver a tener señal, los cambios se sincronizan automáticamente." },
  { q: "¿Cómo instalo la app en mi celular sin pasar por Play Store o App Store?", a: "En Chrome/Edge, cuando visites GanaderIA verás el botón 'Instalar app' en el topbar o en el menú lateral. En iOS Safari, usa el ícono de compartir → 'Agregar a pantalla de inicio'. La app se comporta igual que una app nativa." },
  { q: "¿Cuántos usuarios pueden usar el sistema simultáneamente?", a: "Depende de tu plan: Básico (2 usuarios), Profesional (5 usuarios), Empresarial (ilimitados). Cada usuario tiene sus propias credenciales y permisos según su rol (admin, veterinario, vaquero, solo lectura)." },
  { q: "¿Cómo funciona el sistema de roles y permisos?", a: "Hay 4 roles: Administrador (acceso total), Médico Veterinario (módulos clínicos y productivos), Vaquero/Campo (módulos operativos diarios) y Solo Lectura (visualización sin edición). Los roles se asignan en Configuración → Seguridad → Usuarios." },
  { q: "¿Qué pasa si ingreso mal el peso de un animal?", a: "Ve a Básculas y Pesaje → busca el registro → clic en ✏ editar → corrige el valor → Guardar. La variación se recalcula automáticamente. Si el registro tiene más de 30 días, aparece una advertencia de modificación tardía." },
  { q: "¿Cómo agrego un potrero y cuál es el ciclo correcto?", a: "Ve a Potreros → '+ Nuevo potrero' → nombre, tipo de pasto, hectáreas, ciclo de rotación en días. El ciclo ideal varía por pasto y clima: kikuyo 28-35 días, brachiaria 35-45 días, raigrás 21-28 días. El sistema te avisará cuando llegue el momento de rotar." },
  { q: "¿Qué significa DEP en el módulo de Genética?", a: "DEP = Diferencias de Transmisión Esperada. Es una predicción estadística de cuánto mejorará (o empeorará) cada característica en las crías de ese toro vs el promedio de la población. Un DEP Leche de +500L significa que las hijas producirán 500L más que el promedio de su grupo de contemporáneas." },
  { q: "¿Cómo exporto mis datos para llevarlos a Excel?", a: "En cada módulo (Inventario, Producción, Personal, etc.) hay un botón 'Exportar' o el ícono de descarga. Genera un archivo CSV que puedes abrir directamente en Excel o Google Sheets. Para exportar TODO en JSON, ve a Configuración → Datos → Exportar JSON." },
  { q: "¿Puedo cambiar el precio de venta de la leche?", a: "Sí. Ve a Configuración → Finca → Precio leche (COP/L) y ajusta el valor. El cambio se refleja inmediatamente en los cálculos de Producción y Costos. Por defecto está en $1.250/L (promedio FederaLeche 2025)." },
  { q: "¿Funciona en tabletas en el campo?", a: "Sí. La interfaz es completamente responsiva (mobile-first). En celulares, la barra de navegación inferior permite acceso rápido a los 5 módulos más usados. Se recomienda usar Chrome o Edge para la mejor experiencia PWA." },
  { q: "¿Cómo solicito soporte técnico?", a: "Plan Básico: comunidad en GitHub y foro. Plan Profesional: email soporte@ganader.ia con respuesta en < 24h. Plan Empresarial: WhatsApp dedicado +57 320 GAN-ERIA con respuesta en < 2h hábiles." },
];

const PASOS_PWA = [
  { paso: 1, titulo: "Visita GanaderIA en Chrome o Edge", desc: "Abre el navegador Chrome (Android) o Edge en tu dispositivo móvil y navega a la URL de tu sistema GanaderIA. En iOS (iPhone/iPad) usa Safari.", icon: Wifi },
  { paso: 2, titulo: "Aparece el botón 'Instalar app'", desc: "En el topbar (barra superior) o en el menú lateral encontrarás el botón azul/verde 'Instalar app (PWA)'. En iOS, usa el ícono de compartir en Safari (cuadrado con flecha hacia arriba).", icon: Download },
  { paso: 3, titulo: "Confirma la instalación", desc: "Haz clic en 'Instalar' en el diálogo que aparece. En iOS, selecciona 'Agregar a pantalla de inicio'. La app se instala en segundos, sin pasar por Play Store ni App Store.", icon: Smartphone },
  { paso: 4, titulo: "Úsala offline en el campo", desc: "Una vez instalada, GanaderIA funciona sin conexión a internet. Todos tus datos están en el dispositivo. Al volver a tener señal, los cambios se sincronizan automáticamente.", icon: WifiOff },
];

export default function Manual() {
  const [tab, setTab] = useState<TabKey>("inicio");
  const [search, setSearch] = useState("");
  const [expandedMod, setExpandedMod] = useState<number | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const filteredModulos = MODULOS_GUIA.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.resumen.toLowerCase().includes(search.toLowerCase())
  );

  const TABS: { id: TabKey; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { id: "inicio",   label: "Primeros pasos", icon: PlayCircle },
    { id: "modulos",  label: "Por módulo",     icon: BookOpen },
    { id: "atajos",   label: "Atajos y tips",  icon: Keyboard },
    { id: "pwa",      label: "Instalar PWA",   icon: Smartphone },
    { id: "faq",      label: "Preguntas FAQ",  icon: HelpCircle },
  ];

  return (
    <div className="space-y-6 pb-10">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1e1b4b] via-[#312e81] to-[#4c1d95] p-7 shadow-xl">
        <div className="absolute right-0 top-0 h-full flex items-center pr-8 opacity-5 text-[120px] pointer-events-none">📖</div>
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={20} className="text-purple-300" />
              <span className="text-purple-300 text-sm font-semibold uppercase tracking-wider">Manual de Uso</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Guía completa de GanaderIA</h1>
            <p className="text-white/60 text-sm">
              18 módulos documentados paso a paso · Atajos de teclado · PWA offline · FAQ completa
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
            <input
              placeholder="Buscar en el manual..."
              value={search}
              onChange={e => { setSearch(e.target.value); if (e.target.value) setTab("modulos"); }}
              className="w-full pl-9 pr-3 py-2 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-400/60"
            />
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map(t => {
          const TIcon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setSearch(""); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                tab === t.id
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <TIcon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ══════════════════ INICIO ══════════════════ */}
      {tab === "inicio" && (
        <div className="space-y-6">
          {/* Quick start */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-900/40 to-transparent px-6 py-4 border-b border-border">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Zap size={18} className="text-emerald-400" />
                Guía de inicio rápido — 5 pasos
              </h2>
              <p className="text-sm text-muted-foreground">Configura tu finca y registra tu primer animal en menos de 10 minutos</p>
            </div>
            <div className="divide-y divide-border">
              {[
                { n: 1, titulo: "Selecciona tu perfil de acceso", desc: "En la pantalla de inicio, haz clic en tu rol (Administrador, Veterinario, Vaquero o Solo Lectura) para acceder rápidamente. O usa el formulario con tu email y contraseña.", icon: UserCircle, color: "bg-emerald-500" },
                { n: 2, titulo: "Configura tu finca", desc: "Ve a Configuración → Finca y actualiza el nombre, municipio, departamento y los datos de contacto de tu predio. Estos datos aparecerán en los reportes.", icon: Settings, color: "bg-blue-500" },
                { n: 3, titulo: "Registra tus animales", desc: "Ve a Inventario → '+ Nuevo animal'. Ingresa el ID/Arete, nombre, raza, categoría (vaca adulta/novilla/ternero/toro), peso actual, lote y estado. Repite para cada animal del hato.", icon: List, color: "bg-purple-500" },
                { n: 4, titulo: "Registra la producción de hoy", desc: "Ve a Producción → '+ Registrar ordeño'. Ingresa la fecha de hoy, los litros totales del ordeño y una nota. El ingreso se calcula automáticamente.", icon: Activity, color: "bg-cyan-500" },
                { n: 5, titulo: "Instala la app en tu celular", desc: "Usa el botón 'Instalar app (PWA)' que aparece en el topbar para instalarla sin Play Store. Así podrás usarla offline en el campo, en el potrero o en el establo.", icon: Smartphone, color: "bg-amber-500" },
              ].map(s => (
                <div key={s.n} className="flex items-start gap-4 px-6 py-4 hover:bg-muted/10 transition-colors">
                  <div className={`w-8 h-8 ${s.color} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-0.5`}>{s.n}</div>
                  <div>
                    <div className="font-semibold text-sm mb-1 flex items-center gap-2">
                      <s.icon size={14} className="text-muted-foreground" />
                      {s.titulo}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Video placeholder */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-900/30 to-transparent px-6 py-4 border-b border-border flex items-center gap-3">
              <PlayCircle size={18} className="text-purple-400" />
              <div>
                <h3 className="font-bold">Video tutoriales de GanaderIA</h3>
                <p className="text-xs text-muted-foreground">Aprende visualmente los módulos principales</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5">
              {[
                { titulo: "Tour inicial — primeros pasos", dur: "5:20", icon: "🚀" },
                { titulo: "Inventario y fichas individuales", dur: "8:45", icon: "🐄" },
                { titulo: "Producción y análisis financiero", dur: "11:30", icon: "🥛" },
              ].map(v => (
                <div key={v.titulo} className="bg-muted/20 rounded-xl overflow-hidden border border-border group cursor-pointer hover:border-primary/30 transition-colors">
                  <div className="h-28 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative">
                    <span className="text-4xl">{v.icon}</span>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayCircle size={36} className="text-white drop-shadow-lg" />
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold text-foreground leading-tight mb-1">{v.titulo}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Clock size={10} /> {v.dur}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links to modules */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <ArrowRight size={16} className="text-primary" />
              Accesos rápidos a módulos
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {MODULOS_GUIA.slice(0, 8).map((m, i) => (
                <button key={i} onClick={() => { setTab("modulos"); setExpandedMod(i); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/30 hover:bg-muted/60 border border-border hover:border-primary/20 transition-all text-left cursor-pointer">
                  <m.icon size={14} className={m.color} />
                  <span className="text-xs font-medium truncate">{m.name}</span>
                  <ChevronRight size={10} className="text-muted-foreground ml-auto flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ MÓDULOS ══════════════════ */}
      {tab === "modulos" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {search ? `${filteredModulos.length} módulo(s) encontrado(s) para "${search}"` : `${MODULOS_GUIA.length} módulos documentados`}
            </p>
            {search && (
              <button onClick={() => setSearch("")} className="text-xs text-primary hover:underline">Limpiar búsqueda</button>
            )}
          </div>
          {filteredModulos.map((mod, idx) => {
            const realIdx = MODULOS_GUIA.indexOf(mod);
            const isOpen = expandedMod === realIdx;
            return (
              <div key={mod.name} className={`bg-card border rounded-xl overflow-hidden transition-all ${isOpen ? "border-primary/30 shadow-lg" : "border-border"}`}>
                <button
                  onClick={() => setExpandedMod(isOpen ? null : realIdx)}
                  className="w-full flex items-center gap-3 px-5 py-4 hover:bg-muted/20 transition-colors"
                >
                  <div className={`w-9 h-9 ${mod.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <mod.icon size={17} className={mod.color} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-sm">{mod.name}</div>
                    <div className="text-xs text-muted-foreground">{mod.resumen}</div>
                  </div>
                  <ChevronDown size={15} className={`text-muted-foreground flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 space-y-4 border-t border-border">
                    {/* Steps */}
                    <div className="pt-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Paso a paso</h4>
                      <ol className="space-y-2">
                        {mod.pasos.map((paso, pi) => (
                          <li key={pi} className="flex gap-3 text-sm">
                            <span className="w-5 h-5 bg-primary/20 text-primary rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{pi + 1}</span>
                            <span className="text-foreground leading-relaxed">{paso}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                    {/* Tips */}
                    {mod.tips.length > 0 && (
                      <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-4">
                        <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Lightbulb size={12} /> Consejos pro
                        </h4>
                        <ul className="space-y-1">
                          {mod.tips.map((tip, ti) => (
                            <li key={ti} className="text-xs text-amber-300/80 flex items-start gap-2">
                              <span className="flex-shrink-0 mt-0.5">•</span>{tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {/* Warnings */}
                    {mod.advertencias.length > 0 && (
                      <div className="bg-red-500/8 border border-red-500/20 rounded-xl p-4">
                        <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <AlertTriangle size={12} /> Advertencias
                        </h4>
                        <ul className="space-y-1">
                          {mod.advertencias.map((w, wi) => (
                            <li key={wi} className="text-xs text-red-300/80 flex items-start gap-2">
                              <span className="flex-shrink-0 mt-0.5">⚠</span>{w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="flex justify-end">
                      <Link href={mod.name === "Tablero KPIs" ? "/" : mod.name === "Ficha Individual" ? "/ficha" : mod.name === "Predicciones IA" ? "/prediccion" : mod.name === "Huella de Carbono CO₂" ? "/co2" : mod.name === "Personal / Nómina" ? "/personal" : "/" + mod.name.toLowerCase().replace(/[^a-z]/g, '')}>
                        <span className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline cursor-pointer">
                          Ir al módulo <ArrowRight size={11} />
                        </span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════ ATAJOS ══════════════════ */}
      {tab === "atajos" && (
        <div className="space-y-5">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="font-bold flex items-center gap-2"><Keyboard size={16} className="text-primary" /> Atajos de teclado</h2>
              <p className="text-sm text-muted-foreground">Navega GanaderIA más rápido usando el teclado</p>
            </div>
            <div className="divide-y divide-border/50">
              {ATAJOS.map((a, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-3 hover:bg-muted/10 transition-colors">
                  <span className="text-sm text-foreground">{a.accion}</span>
                  <kbd className="font-mono text-xs bg-muted/60 border border-border rounded-lg px-2.5 py-1 text-muted-foreground ml-4 flex-shrink-0">{a.tecla}</kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Pro tips */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Star size={16} className="text-amber-400 fill-amber-400" /> Tips de experto</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { tip: "Usa el modo mini del sidebar (botón ◀ en el menú) para ver más contenido en pantallas pequeñas.", icon: "⬅" },
                { tip: "Fija tus módulos favoritos haciendo clic en la ⭐ estrella que aparece al pasar el cursor sobre cada ítem del menú.", icon: "⭐" },
                { tip: "Usa la búsqueda del menú lateral (lupa) para navegar rápidamente sin usar el ratón.", icon: "🔍" },
                { tip: "El modo oscuro reduce la fatiga visual en trabajos nocturnos o en el establo con poca luz.", icon: "🌙" },
                { tip: "Exporta el inventario a CSV cada semana como respaldo adicional a localStorage.", icon: "💾" },
                { tip: "Registra el ordeño a la misma hora cada día para que el historial sea comparable.", icon: "🕐" },
                { tip: "Activa las notificaciones push para recibir alertas de partos y stock en tu celular aunque la app esté cerrada.", icon: "🔔" },
                { tip: "En modo PWA instalada (standalone), la app usa menos batería y responde más rápido.", icon: "⚡" },
              ].map((t, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-muted/20 rounded-xl border border-border">
                  <span className="text-lg flex-shrink-0">{t.icon}</span>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t.tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ PWA ══════════════════ */}
      {tab === "pwa" && (
        <div className="space-y-5">
          <div className="bg-gradient-to-r from-[#1a3a2e] to-[#0d2118] rounded-2xl p-6 border border-emerald-500/20">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Smartphone size={28} className="text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-1">GanaderIA como app nativa</h2>
                <p className="text-white/60 text-sm leading-relaxed">
                  Instala GanaderIA directamente en tu celular o tableta sin Play Store ni App Store.
                  Funciona offline, responde más rápido y ocupa menos de 5 MB.
                </p>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PASOS_PWA.map(p => (
              <div key={p.paso} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{p.paso}</div>
                  <h4 className="font-semibold text-sm">{p.titulo}</h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>

          {/* PWA features */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-bold mb-4">Ventajas de instalar GanaderIA como PWA</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { icon: WifiOff, label: "100% offline", desc: "Trabaja en el campo sin señal de celular ni WiFi", color: "text-blue-400" },
                { icon: Zap,     label: "Inicio instantáneo", desc: "Se abre en < 1 segundo desde la pantalla de inicio", color: "text-amber-400" },
                { icon: Download, label: "Sin Play Store", desc: "Instalación directa desde el navegador, en segundos", color: "text-green-400" },
                { icon: RefreshCw, label: "Actualizaciones automáticas", desc: "Siempre tienes la última versión, en segundo plano", color: "text-purple-400" },
                { icon: Bell,    label: "Notificaciones push", desc: "Recibe alertas de partos y stock sin abrir la app", color: "text-red-400" },
                { icon: Smartphone, label: "Pantalla completa", desc: "Sin barra del navegador, como una app nativa real", color: "text-cyan-400" },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-muted/20 rounded-xl">
                  <f.icon size={16} className={`${f.color} flex-shrink-0 mt-0.5`} />
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-0.5">{f.label}</p>
                    <p className="text-[11px] text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compatibility */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-semibold mb-3 text-sm">Compatibilidad de dispositivos</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { device: "Android (Chrome)", status: "✅ Completa", note: "PWA + notificaciones" },
                { device: "Android (Edge)", status: "✅ Completa", note: "PWA + notificaciones" },
                { device: "iPhone (Safari)", status: "⚠ Parcial", note: "Sin push nativo (iOS 16.4+)" },
                { device: "iPad (Safari)", status: "⚠ Parcial", note: "Sin push nativo" },
                { device: "Windows (Chrome)", status: "✅ Completa", note: "PWA desktop + notif." },
                { device: "macOS (Chrome)", status: "✅ Completa", note: "PWA desktop" },
                { device: "macOS (Safari)", status: "⚠ Parcial", note: "Sin PWA install" },
                { device: "Linux (Chrome)", status: "✅ Completa", note: "PWA + notificaciones" },
              ].map(c => (
                <div key={c.device} className="bg-muted/20 rounded-lg p-3">
                  <p className="text-xs font-semibold text-foreground mb-0.5">{c.device}</p>
                  <p className="text-[11px] mb-0.5">{c.status}</p>
                  <p className="text-[10px] text-muted-foreground">{c.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ FAQ ══════════════════ */}
      {tab === "faq" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Info size={14} />
            {FAQS_MANUAL.length} preguntas frecuentes respondidas
          </div>
          {FAQS_MANUAL.map((faq, i) => (
            <div key={i} className={`bg-card border rounded-xl overflow-hidden transition-all ${expandedFaq === i ? "border-primary/30" : "border-border"}`}>
              <button
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/20 transition-colors"
              >
                <span className="font-medium text-sm text-foreground pr-4">{faq.q}</span>
                <ChevronDown size={15} className={`text-muted-foreground flex-shrink-0 transition-transform ${expandedFaq === i ? "rotate-180" : ""}`} />
              </button>
              {expandedFaq === i && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}

          {/* CTA */}
          <div className="bg-muted/20 border border-border rounded-xl p-5 text-center mt-4">
            <p className="text-sm text-muted-foreground mb-3">¿No encontraste lo que buscabas?</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/documentacion">
                <span className="inline-flex items-center gap-1.5 bg-card border border-border rounded-lg px-4 py-2 text-xs font-semibold hover:bg-muted/50 cursor-pointer transition-colors">
                  <BookOpen size={13} /> Ver Documentación técnica
                </span>
              </Link>
              <a href="mailto:soporte@ganader.ia" className="inline-flex items-center gap-1.5 bg-primary text-white rounded-lg px-4 py-2 text-xs font-semibold hover:bg-primary/90 transition-colors">
                Contactar soporte →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
