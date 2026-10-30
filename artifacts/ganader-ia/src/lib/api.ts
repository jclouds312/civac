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

export async function downloadAccountsCsv(): Promise<boolean> {
  if (!isOnline()) return false;
  const token = getToken();
  if (!token) return false;
  try {
    const response = await fetch(`${BASE}/usuarios/export`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) return false;
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `civac-cuentas-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    return true;
  } catch {
    return false;
  }
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

// ─── Gestión de cuentas staff ─────────────────────────────────────────────────
export interface ManagedAccountPayload {
  nombre: string;
  email: string;
  password?: string;
  cargo?: string;
  finca?: string;
  role: string;
  planCode?: string;
  planExpiry?: string;
  permisos?: string[];
  activo?: boolean;
}

export async function createManagedAccount(payload: ManagedAccountPayload) {
  return apiPost<{ id: string; email: string; role: string }>("/usuarios", payload);
}

export async function updateManagedAccount(id: string, payload: Partial<ManagedAccountPayload>) {
  return apiPut<{ id: string }>(`/usuarios/${encodeURIComponent(id)}`, payload);
}

export async function deleteManagedAccount(id: string): Promise<boolean> {
  return apiDelete(`/usuarios/${encodeURIComponent(id)}`);
}

export async function getManagedAccounts() {
  return apiGet<ManagedAccountPayload[]>("/usuarios");
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
export type PlanCode = "basic" | "pro" | "premium" | "platinum" | "enterprise";

const PLAN_VARS: Record<PlanCode, Record<string, string>> = {
  /* ── Básico — Cromo / Plata ───────────────────────────────────────────── */
  basic: {
    "--plan-primary":        "#b8c4d4",
    "--plan-secondary":      "#94a3b8",
    "--plan-accent":         "#e2e8f0",
    "--plan-glow":           "184,196,212",
    "--plan-badge-bg":       "rgba(184,196,212,0.10)",
    "--plan-badge-border":   "rgba(184,196,212,0.32)",
    "--plan-badge-text":     "#c8d4e4",
    "--plan-sidebar-accent": "rgba(184,196,212,0.10)",
    "--plan-ring-color":     "#b8c4d4",
    "--plan-shimmer-from":   "#d0d8e8",
    "--plan-shimmer-to":     "#8090a8",
    "--plan-sidebar-border": "rgba(184,196,212,0.18)",
    "--plan-metal-label":    "CROMO",
  },
  /* ── PRO — Neón Teal ──────────────────────────────────────────────────── */
  pro: {
    "--plan-primary":        "#00f5d4",
    "--plan-secondary":      "#00c8ff",
    "--plan-accent":         "#39ff7e",
    "--plan-glow":           "0,245,212",
    "--plan-badge-bg":       "rgba(0,245,212,0.12)",
    "--plan-badge-border":   "rgba(0,245,212,0.38)",
    "--plan-badge-text":     "#00f5d4",
    "--plan-sidebar-accent": "rgba(0,245,212,0.15)",
    "--plan-ring-color":     "#00f5d4",
    "--plan-shimmer-from":   "#00f5d4",
    "--plan-shimmer-to":     "#00c8ff",
    "--plan-sidebar-border": "rgba(0,245,212,0.22)",
    "--plan-metal-label":    "NEÓN",
  },
  /* ── Premium — Oro / Dorado ───────────────────────────────────────────── */
  premium: {
    "--plan-primary":        "#fbbf24",
    "--plan-secondary":      "#f59e0b",
    "--plan-accent":         "#fcd34d",
    "--plan-glow":           "251,191,36",
    "--plan-badge-bg":       "rgba(251,191,36,0.12)",
    "--plan-badge-border":   "rgba(251,191,36,0.42)",
    "--plan-badge-text":     "#fbbf24",
    "--plan-sidebar-accent": "rgba(251,191,36,0.15)",
    "--plan-ring-color":     "#fbbf24",
    "--plan-shimmer-from":   "#fcd34d",
    "--plan-shimmer-to":     "#d97706",
    "--plan-sidebar-border": "rgba(251,191,36,0.28)",
    "--plan-metal-label":    "ORO",
  },
  /* ── Platino — Cobre / Rose-Gold ──────────────────────────────────────── */
  platinum: {
    "--plan-primary":        "#e07b54",
    "--plan-secondary":      "#cd7f32",
    "--plan-accent":         "#b87333",
    "--plan-glow":           "224,123,84",
    "--plan-badge-bg":       "rgba(205,127,50,0.12)",
    "--plan-badge-border":   "rgba(205,127,50,0.42)",
    "--plan-badge-text":     "#e07b54",
    "--plan-sidebar-accent": "rgba(205,127,50,0.15)",
    "--plan-ring-color":     "#cd7f32",
    "--plan-shimmer-from":   "#e09060",
    "--plan-shimmer-to":     "#8b4513",
    "--plan-sidebar-border": "rgba(205,127,50,0.28)",
    "--plan-metal-label":    "COBRE",
  },
  /* ── Enterprise — Platino Brillante ──────────────────────────────────── */
  enterprise: {
    "--plan-primary":        "#e2e8f0",
    "--plan-secondary":      "#94a3b8",
    "--plan-accent":         "#cbd5e1",
    "--plan-glow":           "226,232,240",
    "--plan-badge-bg":       "rgba(226,232,240,0.12)",
    "--plan-badge-border":   "rgba(226,232,240,0.30)",
    "--plan-badge-text":     "#e2e8f0",
    "--plan-sidebar-accent": "rgba(226,232,240,0.10)",
    "--plan-ring-color":     "#e2e8f0",
    "--plan-shimmer-from":   "#ffffff",
    "--plan-shimmer-to":     "#94a3b8",
    "--plan-sidebar-border": "rgba(226,232,240,0.20)",
    "--plan-metal-label":    "PLATINUM",
  },
};

export function applyPlanTheme(planCode: string) {
  const map: Record<string, PlanCode> = {
    basico: "basic", basic: "basic",
    pro: "pro",
    premium: "premium",
    platino: "platinum", platinum: "platinum",
    enterprise: "enterprise",
  };
  const code = map[planCode] ?? "basic";
  const vars = PLAN_VARS[code] ?? PLAN_VARS.basic;
  const root = document.documentElement;
  root.setAttribute("data-plan", code);
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
}

// ─── Seed helper (call once on first load to populate DB) ────────────────────
export async function seedIfEmpty(): Promise<void> {
  await apiPost("/seed", { force: false });
}
