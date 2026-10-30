/**
 * CIVAC IA client.
 *
 * Gemini is called only by the authenticated Flask API. The browser never
 * receives or embeds the provider API key.
 */

import { getToken } from "./api";

export interface GeminiMessage {
  role: "user" | "model";
  text: string;
}

export interface GeminiResponse {
  text: string;
  ok: boolean;
  error?: string;
}

function authToken(): string | null {
  try {
    return typeof window === "undefined" ? null : getToken();
  } catch {
    return null;
  }
}

/** Checks authenticated server configuration without exposing provider secrets. */
export async function isGeminiConfigured(): Promise<boolean> {
  const token = authToken();
  if (!token) return false;
  try {
    const response = await fetch("/api/ai/status", {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return false;
    const data = await response.json();
    return data.configured === true;
  } catch {
    return false;
  }
}

/** Sends a prompt and recent conversation history to the secured Flask route. */
export async function askCivacAgent(
  userMessage: string,
  history: GeminiMessage[] = [],
): Promise<GeminiResponse> {
  const token = authToken();
  if (!token) {
    return { ok: false, text: "", error: "Inicia sesión nuevamente para usar CIVAC IA." };
  }

  try {
    const response = await fetch("/api/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: userMessage,
        history: history.slice(-12),
      }),
      signal: AbortSignal.timeout(30000),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        ok: false,
        text: "",
        error: data.error || "No fue posible obtener una respuesta de CIVAC IA.",
      };
    }
    return { ok: true, text: data.respuesta || "" };
  } catch {
    return { ok: false, text: "", error: "No fue posible conectar con CIVAC IA. Intenta nuevamente." };
  }
}

/** General question without prior conversation. */
export function analyzeCivac(prompt: string): Promise<GeminiResponse> {
  return askCivacAgent(prompt);
}

/** Requests general, non-diagnostic livestock guidance based on supplied details. */
export function analyzeAnimal(data: {
  nombre: string;
  raza: string;
  peso: number;
  edad?: string;
  produccionLeche?: number;
  estado?: string;
}): Promise<GeminiResponse> {
  const prompt = `Ofrece orientación general de manejo para este bovino. No diagnostiques ni prescribas tratamientos.
Nombre: ${data.nombre}
Raza: ${data.raza}
Peso: ${data.peso} kg
${data.edad ? `Edad estimada: ${data.edad}` : ""}
${data.produccionLeche ? `Producción de leche: ${data.produccionLeche} L/día` : ""}
${data.estado ? `Estado informado: ${data.estado}` : ""}

Separa observaciones, datos que faltan y próximos pasos seguros.`;
  return analyzeCivac(prompt);
}
