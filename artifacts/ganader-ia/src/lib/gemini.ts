/* ─────────────────────────────────────────────────────────────────────────
   CIVAC PRO — Google AI Studio (Gemini) integration
   Requiere: VITE_GOOGLE_API_KEY en variables de entorno
   ───────────────────────────────────────────────────────────────────────── */

import { GoogleGenerativeAI, type GenerationConfig } from "@google/generative-ai";

// ── Configuración ─────────────────────────────────────────────────────────────

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY ?? "";

/** Verdadero cuando la API Key de Gemini está configurada */
export function isGeminiConfigured(): boolean {
  return !!API_KEY;
}

/** Instancia singleton del cliente Gemini (lazy) */
let _client: GoogleGenerativeAI | null = null;
function getClient(): GoogleGenerativeAI {
  if (!_client) {
    if (!API_KEY) throw new Error("VITE_GOOGLE_API_KEY no está configurada");
    _client = new GoogleGenerativeAI(API_KEY);
  }
  return _client;
}

// ── Modelo y configuración base ───────────────────────────────────────────────

const DEFAULT_MODEL = "gemini-1.5-flash";

const CIVAC_SYSTEM_PROMPT = `Eres CivacAgent, el asistente inteligente de CIVAC PRO — sistema ganadero colombiano.
Tienes conocimiento experto en:
- Ganadería bovina colombiana (razas Cebú, Holstein, Brahman, Simmental)
- Manejo sanitario, vacunación y tratamientos veterinarios
- Nutrición animal, pastos y suplementación
- Reproducción bovina (IA, monta natural, detección de celo)
- Economía ganadera colombiana (precios COP, mercados, subsidios FINAGRO)
- Normativa ICA Colombia, trazabilidad SINIGAN
- Producción de leche y carne en trópico bajo/alto colombiano

Responde siempre en español colombiano. Sé conciso, práctico y usa unidades colombianas (kg, litros, COP).
Cuando des precios, indica que son aproximados y varían por región y época.`;

// ── API pública ────────────────────────────────────────────────────────────────

export interface GeminiMessage {
  role: "user" | "model";
  text: string;
}

export interface GeminiResponse {
  text: string;
  ok: boolean;
  error?: string;
}

/**
 * Envía un mensaje al asistente CivacAgent (chat con historial).
 * @param userMessage  Texto del usuario
 * @param history      Historial previo de la conversación
 * @param config       Configuración opcional de generación
 */
export async function askCivacAgent(
  userMessage: string,
  history: GeminiMessage[] = [],
  config?: Partial<GenerationConfig>,
): Promise<GeminiResponse> {
  if (!isGeminiConfigured()) {
    return { ok: false, text: "", error: "API Key de Google AI no configurada" };
  }

  try {
    const model = getClient().getGenerativeModel({
      model: DEFAULT_MODEL,
      systemInstruction: CIVAC_SYSTEM_PROMPT,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
        ...config,
      },
    });

    const chat = model.startChat({
      history: history.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      })),
    });

    const result = await chat.sendMessage(userMessage);
    const text = result.response.text();
    return { ok: true, text };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[CivacAgent Gemini error]", msg);
    return { ok: false, text: "", error: msg };
  }
}

/**
 * Consulta rápida sin historial de chat (análisis puntual de datos ganaderos).
 * Ideal para análisis de tramas, recomendaciones de peso, alertas sanitarias, etc.
 */
export async function analyzeCivac(prompt: string): Promise<GeminiResponse> {
  return askCivacAgent(prompt, []);
}

/**
 * Analiza datos de un animal y devuelve recomendaciones de manejo.
 */
export async function analyzeAnimal(data: {
  nombre: string;
  raza: string;
  peso: number;
  edad?: string;
  produccionLeche?: number;
  estado?: string;
}): Promise<GeminiResponse> {
  const prompt = `Analiza este bovino y dame recomendaciones de manejo:
Nombre: ${data.nombre}
Raza: ${data.raza}
Peso: ${data.peso} kg
${data.edad ? `Edad estimada: ${data.edad}` : ""}
${data.produccionLeche ? `Producción de leche: ${data.produccionLeche} L/día` : ""}
${data.estado ? `Estado actual: ${data.estado}` : ""}

Proporciona: 1) Evaluación del peso/condición corporal  2) Recomendaciones nutricionales  3) Plan sanitario sugerido  4) Potencial productivo`;

  return analyzeCivac(prompt);
}
