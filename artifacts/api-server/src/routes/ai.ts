import { Router } from "express";
import { authMiddleware, type AuthRequest } from "../middleware/auth";

const router = Router();
const GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/chat/completions";
const DEFAULT_MODEL = process.env.CIVAC_AI_MODEL || "openai/o4-mini";
const FREE_MODEL = process.env.CIVAC_AI_FREE_MODEL || "openai/gpt-oss-20b";
const MAX_MESSAGE_BY_ROLE: Record<string, number> = { anonymous: 0, viewer: 2500, cliente: 4000, staff: 6000, sales: 6000, admin: 8000, developer: 10000, superadmin: 10000 };

function gatewayConfigured() {
  return Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN || process.env.VERCEL_URL);
}

function selectedModel(provider?: string) {
  if (provider === "free") return FREE_MODEL;
  if (provider === "premium") return DEFAULT_MODEL;
  return DEFAULT_MODEL;
}

router.get("/ai/status", authMiddleware, (_req: AuthRequest, res) => {
  const configured = gatewayConfigured();
  res.json({
    available: configured,
    configured,
    defaultProvider: "openai",
    providers: [
      { id: "openai", label: "OpenAI · Gateway", tier: "premium", locked: false, configured, available: configured },
      { id: "free", label: "Modelo económico", tier: "standard", locked: false, configured, available: configured, model: FREE_MODEL },
    ],
  });
});

router.post("/ai/chat", authMiddleware, async (req: AuthRequest, res) => {
  if (!gatewayConfigured()) return res.status(503).json({ code: "AI_NOT_CONFIGURED", error: "Servicio remoto no configurado." });
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  const role = req.user?.role ?? "anonymous";
  const maxMessage = MAX_MESSAGE_BY_ROLE[role] ?? 2500;
  if (!maxMessage) return res.status(401).json({ error: "Inicia sesión para usar CIVAC IA." });
  if (!message || message.length > maxMessage) return res.status(400).json({ error: `El mensaje debe tener entre 1 y ${maxMessage} caracteres.` });

  const history: unknown[] = Array.isArray(req.body?.history) ? req.body.history.slice(-12) : [];
  const roleRules = role === "developer" || role === "superadmin"
    ? "Puedes explicar diagnósticos técnicos y APIs, pero no reveles secretos ni tokens."
    : role === "admin" || role === "staff" || role === "sales"
      ? "Puedes explicar indicadores operativos y comerciales, pero no muestres datos de otras cuentas sin autorización."
      : "Solo puedes ayudar con los módulos y datos de la cuenta autenticada.";
  const messages = [
    { role: "system", content: `Eres CIVAC IA, asistente seguro para gestión ganadera. Responde en español, con pasos concretos. Rol actual: ${role}. Plan: ${req.user?.plan ?? "basico"}. ${roleRules} No inventes precios, no solicites contraseñas y no ejecutes cambios administrativos. Para cambiar planes, pagos o permisos, indica el módulo autorizado correspondiente.` },
    ...history.filter((item: unknown): item is { role: string; text?: string; content?: string } => Boolean(item && typeof item === "object" && (typeof (item as { text?: unknown }).text === "string" || typeof (item as { content?: unknown }).content === "string"))).map(item => ({ role: item.role === "user" ? "user" : "assistant", content: (item.text ?? item.content ?? "").slice(0, 4000) })),
    { role: "user", content: message },
  ];

  try {
    const token = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN;
    const response = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ model: selectedModel(req.body?.provider), messages, temperature: 0.3, max_tokens: 700 }),
      signal: AbortSignal.timeout(30000),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) return res.status(502).json({ error: "El servicio de IA no respondió correctamente." });
    const respuesta = payload.choices?.[0]?.message?.content;
    if (typeof respuesta !== "string" || !respuesta.trim()) return res.status(502).json({ error: "La respuesta de IA llegó vacía." });
    return res.json({ ok: true, respuesta: respuesta.trim(), model: selectedModel(req.body?.provider) });
  } catch {
    return res.status(502).json({ error: "El servicio remoto no está disponible." });
  }
});

export default router;
