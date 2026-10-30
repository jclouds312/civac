import { setAuthTokenGetter, setBaseUrl } from '@workspace/api-client-react';

export type Animal = {
  id: number | string;
  nombre: string;
  raza?: string;
  categoria?: string;
  peso?: number;
  lote?: string;
  estado?: string;
  litrosDia?: number;
  partos?: number;
  fechaNacimiento?: string;
  registro?: string;
  numeroRegistro?: string;
  valorKilo?: number;
  [key: string]: unknown;
};
export type Pesaje = {
  id: number | string; animalId?: number | string; animalNombre?: string;
  peso?: number; pesoAnterior?: number; fecha?: string; hora?: string;
  metodo?: string; dispositivo?: string; operador?: string; observacion?: string;
  lote?: string; categoria?: string; [key: string]: unknown;
};
export type SessionUser = { id?: number | string; nombre?: string; name?: string; email?: string; rol?: string; role?: string; [key: string]: unknown };
export type ApiResult<T> = { data: T; error?: never } | { data?: never; error: string };

function normalizeBase(value: string | undefined): string {
  const trimmed = (value ?? '').trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export const API_BASE = normalizeBase(
  process.env.EXPO_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_DOMAIN,
);
export const WEB_BASE = normalizeBase(
  process.env.EXPO_PUBLIC_WEB_URL ?? process.env.EXPO_PUBLIC_DOMAIN,
);
let currentToken: string | null = null;
setBaseUrl(API_BASE || null);
setAuthTokenGetter(() => currentToken);
export const setApiToken = (token: string | null) => { currentToken = token; };

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!API_BASE) throw new Error('No se encontró EXPO_PUBLIC_DOMAIN. Verifica la configuración del entorno.');
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
      ...options.headers,
    },
  });
  const text = await response.text();
  let payload: any = null;
  if (text) { try { payload = JSON.parse(text); } catch { payload = { message: text }; } }
  if (!response.ok) {
    const message = payload?.error || payload?.message || payload?.detail || `Error ${response.status}`;
    throw new Error(String(message));
  }
  return payload as T;
}

export function asList<T>(payload: unknown, keys: string[] = []): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    for (const key of keys) if (Array.isArray(record[key])) return record[key] as T[];
    if (Array.isArray(record.data)) return record.data as T[];
    if (Array.isArray(record.items)) return record.items as T[];
  }
  return [];
}

export async function syncMobileData(payload: Record<string, unknown>): Promise<{ ok: boolean; serverData?: Record<string, unknown[]> }> {
  return apiRequest('/api/sync/v1/ingest', { method: 'POST', body: JSON.stringify(payload) });
}

export async function pullMobileData(since: string, deviceId: string): Promise<{ ok: boolean; data?: Record<string, unknown[]> }> {
  return apiRequest(`/api/sync/v1/pull?since=${encodeURIComponent(since)}&deviceId=${encodeURIComponent(deviceId)}`);
}

export function displayError(error: unknown): string {
  return error instanceof Error ? error.message : 'No fue posible completar la solicitud.';
}
