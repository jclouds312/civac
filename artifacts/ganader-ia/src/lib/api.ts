/**
 * CIVAC PRO — API Client
 * Typed fetch wrapper with offline detection + localStorage fallback.
 * All calls go to /api/* (proxied by Vite → Express :8080 in dev,
 * served by Express directly in production build).
 */

const BASE = "/api";

// ─── Auth token management ────────────────────────────────────────────────────
export function getToken(): string | null {
  return localStorage.getItem("civac_session_token");
}
export function setToken(t: string) {
  localStorage.setItem("civac_session_token", t);
}
export function clearToken() {
  localStorage.removeItem("civac_session_token");
}

// ─── Online detection ─────────────────────────────────────────────────────────
export function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

// ─── Generic fetch helpers ────────────────────────────────────────────────────
type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

async function request<T>(
  method: Method,
  path: string,
  body?: unknown,
  opts?: RequestInit,
): Promise<{ data: T | null; ok: boolean; status: number; offline: boolean }> {
  if (!isOnline()) {
    return { data: null, ok: false, status: 0, offline: true };
  }
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(12000),
      ...opts,
    });
    let data: T | null = null;
    try { data = await res.json(); } catch { /* empty body */ }
    return { data, ok: res.ok, status: res.status, offline: false };
  } catch (e) {
    const isOfflineErr = e instanceof TypeError && e.message.toLowerCase().includes("fetch");
    return { data: null, ok: false, status: 0, offline: isOfflineErr };
  }
}

export async function apiGet<T>(path: string): Promise<T | null> {
  const { data, ok } = await request<T>("GET", path);
  return ok && data !== null ? data : null;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T | null> {
  const { data, ok } = await request<T>("POST", path, body);
  return ok && data !== null ? data : null;
}

export async function apiPut<T>(path: string, body: unknown): Promise<T | null> {
  const { data, ok } = await request<T>("PUT", path, body);
  return ok && data !== null ? data : null;
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T | null> {
  const { data, ok } = await request<T>("PATCH", path, body);
  return ok && data !== null ? data : null;
}

export async function apiDelete(path: string): Promise<boolean> {
  const { ok } = await request("DELETE", path);
  return ok;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface AuthResponse {
  token: string;
  user: {
    id: string; nombre: string; email: string; role: string;
    cargo: string; finca: string; planCode: string;
  };
}

export async function apiLogin(email: string, password: string): Promise<AuthResponse | null> {
  const result = await apiPost<AuthResponse>("/auth/login", { email, password });
  if (result?.token) setToken(result.token);
  return result;
}

export async function apiLogout(): Promise<void> {
  await apiPost("/auth/logout", {});
  clearToken();
}

export async function apiMe(): Promise<AuthResponse["user"] | null> {
  return apiGet<AuthResponse["user"]>("/auth/me");
}

// ─── Image upload ─────────────────────────────────────────────────────────────
export interface StoredImageMeta {
  id: number; entityType: string; entityId: string;
  filename: string; mimetype: string; sizeBytes: number;
  width?: number; height?: number; createdAt: string;
}

/** Convert File/Blob to base64 dataURL in browser */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Resize an image dataURL to max dimensions, returns new dataURL */
export function resizeDataUrl(
  dataUrl: string,
  maxW = 800,
  maxH = 800,
  quality = 0.82,
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxW || height > maxH) {
        const ratio = Math.min(maxW / width, maxH / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.src = dataUrl;
  });
}

/** Upload image to API — stores base64 in DB */
export async function uploadImage(
  file: File,
  entityType: string,
  entityId: string,
): Promise<StoredImageMeta | null> {
  let dataUrl = await fileToDataUrl(file);
  // Auto-resize if > 500 KB
  if (dataUrl.length > 500_000) {
    dataUrl = await resizeDataUrl(dataUrl, 800, 800, 0.80);
  }
  return apiPost<StoredImageMeta>("/images", {
    entityType,
    entityId,
    filename: file.name,
    mimetype: file.type || "image/jpeg",
    dataUrl,
    sizeBytes: Math.round(dataUrl.length * 0.75),
  });
}

/** Fetch all images for an entity */
export async function getImages(
  entityType: string,
  entityId: string,
): Promise<StoredImageMeta[]> {
  return (await apiGet<StoredImageMeta[]>(`/images?entityType=${entityType}&entityId=${entityId}`)) ?? [];
}

/** Get single image with dataUrl */
export async function getImageData(
  id: number,
): Promise<(StoredImageMeta & { dataUrl: string }) | null> {
  return apiGet(`/images/${id}`);
}

export async function deleteImage(id: number): Promise<boolean> {
  return apiDelete(`/images/${id}`);
}

// ─── Finca config ─────────────────────────────────────────────────────────────
export interface FincaConfig {
  id?: number; nombre: string; nit: string; municipio: string;
  departamento: string; telefono: string; email: string; direccion: string;
  planCode: string; themeMode: string; primaryColor: string;
  logoImageId?: number; hectareasTotales: number; capacidadTotal: number;
}

export async function getFinca(): Promise<FincaConfig | null> {
  return apiGet<FincaConfig>("/finca");
}

export async function saveFinca(data: Partial<FincaConfig>): Promise<FincaConfig | null> {
  return apiPut<FincaConfig>("/finca", data);
}

// ─── Plans ────────────────────────────────────────────────────────────────────
export interface PlanConfig {
  id: number; code: string; name: string; nameLong: string;
  priceMonthly: number; maxAnimals: number; maxUsers: number;
  maxGpsCollars: number; features: string; colorPrimary: string;
  colorSecondary: string; colorAccent: string; badgeLabel: string;
}

export async function getPlans(): Promise<PlanConfig[]> {
  return (await apiGet<PlanConfig[]>("/plans")) ?? [];
}

export async function getPlan(code: string): Promise<PlanConfig | null> {
  return apiGet<PlanConfig>(`/plans/${code}`);
}

// ─── Offline queue ────────────────────────────────────────────────────────────
interface QueueItem { method: Method; path: string; body: unknown; ts: number }
const QUEUE_KEY = "civac_offline_queue";

export function enqueueOffline(method: Method, path: string, body: unknown) {
  try {
    const queue: QueueItem[] = JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]");
    queue.push({ method, path, body, ts: Date.now() });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch { /* storage full */ }
}

export async function flushOfflineQueue(): Promise<number> {
  if (!isOnline()) return 0;
  try {
    const queue: QueueItem[] = JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]");
    if (!queue.length) return 0;
    let flushed = 0;
    const remaining: QueueItem[] = [];
    for (const item of queue) {
      const { ok } = await request(item.method, item.path, item.body);
      if (ok) { flushed++; }
      else remaining.push(item);
    }
    localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
    return flushed;
  } catch { return 0; }
}

// ─── Plan theming helpers ─────────────────────────────────────────────────────
export type PlanCode = "basic" | "pro" | "platinum" | "enterprise";

const PLAN_VARS: Record<PlanCode, Record<string, string>> = {
  basic: {
    "--plan-primary":       "#00f5d4",
    "--plan-secondary":     "#00c8ff",
    "--plan-accent":        "#39ff7e",
    "--plan-glow":          "0,245,212",
    "--plan-badge-bg":      "rgba(0,245,212,0.12)",
    "--plan-badge-border":  "rgba(0,245,212,0.3)",
    "--plan-badge-text":    "#00f5d4",
    "--plan-sidebar-accent":"rgba(0,245,212,0.15)",
    "--plan-ring-color":    "#00f5d4",
  },
  pro: {
    "--plan-primary":       "#00c8ff",
    "--plan-secondary":     "#7c3aed",
    "--plan-accent":        "#a855f7",
    "--plan-glow":          "0,200,255",
    "--plan-badge-bg":      "rgba(0,200,255,0.12)",
    "--plan-badge-border":  "rgba(0,200,255,0.35)",
    "--plan-badge-text":    "#00c8ff",
    "--plan-sidebar-accent":"rgba(0,200,255,0.15)",
    "--plan-ring-color":    "#00c8ff",
  },
  platinum: {
    "--plan-primary":       "#ff9500",
    "--plan-secondary":     "#fbbf24",
    "--plan-accent":        "#f59e0b",
    "--plan-glow":          "255,149,0",
    "--plan-badge-bg":      "rgba(255,149,0,0.15)",
    "--plan-badge-border":  "rgba(255,149,0,0.4)",
    "--plan-badge-text":    "#ff9500",
    "--plan-sidebar-accent":"rgba(255,149,0,0.15)",
    "--plan-ring-color":    "#ff9500",
  },
  enterprise: {
    "--plan-primary":       "#e2e8f0",
    "--plan-secondary":     "#94a3b8",
    "--plan-accent":        "#cbd5e1",
    "--plan-glow":          "226,232,240",
    "--plan-badge-bg":      "rgba(226,232,240,0.12)",
    "--plan-badge-border":  "rgba(226,232,240,0.3)",
    "--plan-badge-text":    "#e2e8f0",
    "--plan-sidebar-accent":"rgba(226,232,240,0.1)",
    "--plan-ring-color":    "#e2e8f0",
  },
};

export function applyPlanTheme(planCode: string) {
  const code = (planCode ?? "basic") as PlanCode;
  const vars = PLAN_VARS[code] ?? PLAN_VARS.basic;
  const root = document.documentElement;
  root.setAttribute("data-plan", code);
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
}

// ─── Seed helper (call once on first load to populate DB) ────────────────────
export async function seedIfEmpty(): Promise<void> {
  await apiPost("/seed", { force: false });
}
