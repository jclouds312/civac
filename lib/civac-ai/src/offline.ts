export interface OfflineCivacAnswer {
  topic: string;
  text: string;
}

const LOCAL_GUIDES: Array<{
  topic: string;
  matches: RegExp;
  text: string;
}> = [
  {
    topic: "Atención veterinaria urgente",
    matches: /\b(no puede levantarse|dificultad para respirar|respira mal|hemorragia|convulsion|convulsiona|parto detenido|distocia|prolapso|colapso)\b/,
    text: "Mantén al animal en un lugar seguro y tranquilo, evita moverlo innecesariamente y contacta de inmediato a un médico veterinario. No administres medicamentos ni dosis sin indicación profesional.",
  },
  {
    topic: "Pesajes y ganancia de peso",
    matches: /\b(peso|pesaje|pesar|ganancia|ganancia diaria|kg|kilos|bascula|báscula)\b/,
    text: "Registra el peso medido, la identificación del animal, la fecha y la báscula utilizada. Para calcular ganancia diaria promedio usa: (peso final − peso inicial) ÷ días entre mediciones. No sustituyas una lectura real por una estimación.",
  },
  {
    topic: "Alimentación y agua",
    matches: /\b(alimentacion|racion|nutricion|forraje|agua|mineral|sal|engorde|comida)\b/,
    text: "Asegura agua limpia y acceso suficiente a forraje. Cambia las raciones gradualmente y confirma suplementos o minerales con un profesional que conozca la dieta, el suelo y la región de la finca.",
  },
  {
    topic: "Potreros",
    matches: /\b(potrero|potreros|pasto|rotacion|rotacional|sobrepastoreo|aforo)\b/,
    text: "Registra ocupación, descanso, disponibilidad de forraje y condición del suelo por potrero. Ajusta la rotación a la temporada y al crecimiento observado; evita dejar el suelo expuesto por sobrepastoreo.",
  },
  {
    topic: "Reproducción",
    matches: /\b(reproduccion|preñez|prenada|prenada|celo|estro|inseminacion|parto|servicio|gestacion)\b/,
    text: "Anota identificación, fecha de celo o servicio, método, toro o semen y controles posteriores. Confirma preñez y decisiones reproductivas con el profesional responsable de la finca.",
  },
  {
    topic: "Salud y sanidad",
    matches: /\b(salud|sanidad|vacuna|vacunacion|desparas|diarrea|tos|fiebre|mastitis|herida|sintoma|enfermedad)\b/,
    text: "Registra signos observables, fecha de inicio, temperatura medida si corresponde, consumo de agua y alimento, y cambios recientes. No puedo diagnosticar ni indicar tratamientos; consulta a un veterinario, especialmente si empeora.",
  },
  {
    topic: "Registros en GanaderIA",
    matches: /\b(registro|registrar|inventario|animal|identificacion|trazabilidad|modulo|modulo|cuenta|aplicacion|app)\b/,
    text: "En GanaderIA, consulta Inicio para el resumen; Ganado/Inventario para fichas; Pesajes para mediciones reales; Producción para sus registros; y Alertas para novedades. Guarda cada dato en el módulo correspondiente. No tengo acceso automático a los datos de tu cuenta.",
  },
];

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function answerOfflineCivac(question: string): OfflineCivacAnswer {
  const normalized = normalize(question);
  const guide = LOCAL_GUIDES.find(item => item.matches.test(normalized));
  if (guide) return { topic: guide.topic, text: guide.text };

  return {
    topic: "Guía local",
    text: "La guía sin conexión puede orientar sobre pesajes, alimentación, potreros, reproducción, sanidad y registros de la app. Para una respuesta generativa, usa el modelo local cuando se haya descargado en un navegador compatible o vuelve a conectarte al servicio de IA. No consulto datos privados ni reemplazo a un profesional veterinario.",
  };
}

export function buildCivacLocalSystemInstruction(role: string): string {
  const guidance: Record<string, string> = {
    admin: "Ayuda a explicar la administración y el uso de la plataforma. No afirmes haber cambiado cuentas ni consultado datos privados.",
    superadmin: "Ayuda a explicar la operación CIVAC y la plataforma. No afirmes haber cambiado cuentas ni consultado datos privados.",
    developer: "Ayuda a entender la arquitectura y depurar problemas con recomendaciones verificables. No afirmes haber ejecutado cambios.",
    sales: "Ayuda a explicar funciones y preparar respuestas comerciales. No inventes precios, condiciones ni datos de clientes.",
    vet: "Ofrece orientación general de manejo. No diagnostiques ni prescribas tratamientos; deriva decisiones clínicas a un médico veterinario.",
    field: "Da pasos prácticos para el trabajo de campo y el registro de datos medidos.",
    viewer: "Explica reportes y funciones de consulta. No indiques que este perfil puede editar datos.",
    cliente: "Explica el uso de la app y orientación general de manejo. No afirmes tener acceso a los datos privados de la finca.",
  };

  return [
    "Eres CIVAC IA, el asistente de GanaderIA. Responde en español claro y conciso.",
    "Ayuda a entender Inicio, Ganado/Inventario, Pesajes, Producción, Potreros, Reproducción, Insumos, Sanidad, Alertas, GPS, Costos, Personal y Administración.",
    "Solo usas esta conversación y conocimiento general: no tienes internet, no consultas cuentas, fincas ni bases de datos y no ejecutas cambios.",
    "No inventes valores, precios, eventos ni resultados. No pidas contraseñas, tokens ni datos personales innecesarios.",
    "Para diagnósticos, medicamentos o urgencias, recomienda atención veterinaria profesional.",
    `Perfil autenticado: ${role}. ${guidance[role] ?? guidance.viewer}`,
  ].join(" ");
}
