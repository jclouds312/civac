import { buildCivacLocalSystemInstruction } from "@workspace/civac-ai/offline";
import type { MLCEngineInterface, InitProgressReport } from "@mlc-ai/web-llm";

export const LOCAL_AI_MODEL_ID = "Qwen2.5-0.5B-Instruct-q4f16_1-MLC";

export interface LocalAIProgress {
  progress: number;
  text: string;
}

type ProgressCallback = (progress: LocalAIProgress) => void;
type LocalHistoryMessage = { role: "user" | "assistant"; text: string };

let enginePromise: Promise<MLCEngineInterface> | null = null;

export async function canRunLocalAI(): Promise<boolean> {
  if (typeof navigator === "undefined") return false;
  const gpu = (navigator as Navigator & {
    gpu?: { requestAdapter: () => Promise<unknown | null> };
  }).gpu;
  if (!gpu) return false;
  try {
    return Boolean(await gpu.requestAdapter());
  } catch {
    return false;
  }
}

async function getEngine(onProgress?: ProgressCallback): Promise<MLCEngineInterface> {
  if (!enginePromise) {
    enginePromise = import("@mlc-ai/web-llm")
      .then(({ CreateMLCEngine }) => CreateMLCEngine(
        LOCAL_AI_MODEL_ID,
        {
          initProgressCallback: (report: InitProgressReport) => onProgress?.({
            progress: Math.max(0, Math.min(1, report.progress ?? 0)),
            text: report.text ?? "Preparando el modelo local…",
          }),
        },
        { context_window_size: 2048 },
      ))
      .catch(error => {
        enginePromise = null;
        throw error;
      });
  }
  return enginePromise;
}

export async function prepareLocalCivacAI(onProgress?: ProgressCallback): Promise<void> {
  await getEngine(onProgress);
}

export async function askLocalCivacAI(
  message: string,
  history: LocalHistoryMessage[],
  role: string,
  onProgress?: ProgressCallback,
): Promise<string> {
  const engine = await getEngine(onProgress);
  const messages = [
    { role: "system" as const, content: buildCivacLocalSystemInstruction(role) },
    ...history.slice(-6).map(item => ({
      role: item.role,
      content: item.text.slice(0, 1000),
    })),
    { role: "user" as const, content: message.slice(0, 1600) },
  ];
  const completion = await engine.chat.completions.create({
    messages,
    temperature: 0.35,
    max_tokens: 420,
  });
  const content = completion.choices[0]?.message.content;
  if (typeof content === "string" && content.trim()) return content.trim();
  if (Array.isArray(content)) {
    const text = content
      .filter(part => part.type === "text")
      .map(part => part.text)
      .join("\n")
      .trim();
    if (text) return text;
  }
  throw new Error("El modelo local no generó una respuesta.");
}
