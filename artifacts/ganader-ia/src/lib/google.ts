/* ─────────────────────────────────────────────────────────────────────────
   CIVAC v1 — Google OAuth (Identity Services) + Google Drive API v3
   Client-side only. Requires VITE_GOOGLE_CLIENT_ID env variable.
   ───────────────────────────────────────────────────────────────────────── */

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';
export const GOOGLE_API_KEY   = import.meta.env.VITE_GOOGLE_API_KEY   ?? '';

export const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.appdata',
].join(' ');

export const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

export interface GoogleUser {
  sub:          string;
  name:         string;
  email:        string;
  picture:      string;
  given_name:   string;
  family_name:  string;
}

/** Parse the JWT credential returned by Google Identity Services */
export function parseGoogleJwt(token: string): GoogleUser | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64)) as GoogleUser;
  } catch { return null; }
}

/** Check if Google OAuth is configured */
export function isGoogleConfigured(): boolean {
  return !!GOOGLE_CLIENT_ID;
}

/* ── Drive session helpers ─────────────────────────────────────────────── */

const DRIVE_TOKEN_KEY = 'civac_drive_token';

export function saveDriveToken(token: string) {
  try { localStorage.setItem(DRIVE_TOKEN_KEY, token); } catch {}
}
export function getDriveToken(): string | null {
  return localStorage.getItem(DRIVE_TOKEN_KEY);
}
export function clearDriveToken() {
  localStorage.removeItem(DRIVE_TOKEN_KEY);
}
export function isDriveConnected(): boolean {
  return !!getDriveToken();
}

/* ── Google Drive REST API (no gapi dependency) ────────────────────────── */

export async function driveListFiles(token: string): Promise<DriveFile[]> {
  const url = "https://www.googleapis.com/drive/v3/files"
    + "?q=name+contains+'CIVAC'&orderBy=modifiedTime+desc&pageSize=30"
    + "&fields=files(id,name,size,modifiedTime,mimeType)";
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Drive API ${res.status}`);
  const data = await res.json();
  return data.files ?? [];
}

export async function driveUpload(
  token: string,
  content: string,
  filename: string,
  mimeType = 'application/json',
): Promise<DriveFile> {
  const metadata = { name: filename, mimeType };
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file',     new Blob([content],                  { type: mimeType         }));
  const url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,size,modifiedTime';
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw new Error(`Drive upload ${res.status}`);
  return res.json();
}

export async function driveDownload(token: string, fileId: string): Promise<string> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Drive download ${res.status}`);
  return res.text();
}

export async function driveDelete(token: string, fileId: string): Promise<void> {
  await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export interface DriveFile {
  id:           string;
  name:         string;
  size?:        string;
  modifiedTime: string;
  mimeType:     string;
}

/* ── Google Identity Services (GIS) token flow ─────────────────────────── */

declare global { interface Window { google?: any; } }

export function initGisTokenClient(
  onToken: (accessToken: string) => void,
  onError: (msg: string) => void,
): void {
  if (!window.google?.accounts?.oauth2) { onError('Google Identity Services no cargado'); return; }
  const client = window.google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope:     DRIVE_SCOPES,
    callback:  (resp: { access_token?: string; error?: string }) => {
      if (resp.error) { onError(resp.error); return; }
      if (resp.access_token) { saveDriveToken(resp.access_token); onToken(resp.access_token); }
    },
  });
  client.requestAccessToken({ prompt: '' });
}

export function revokeGisToken(token: string): void {
  window.google?.accounts?.oauth2?.revoke(token, () => { clearDriveToken(); });
}
