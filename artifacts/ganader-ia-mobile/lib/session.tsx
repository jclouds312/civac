import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { apiRequest, SessionUser, setApiToken } from './api';

type SessionContextValue = {
  token: string | null; user: SessionUser | null; ready: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  activateCard: (code: string) => Promise<void>;
  signOut: () => Promise<void>;
};
const SessionContext = createContext<SessionContextValue | null>(null);
const TOKEN_KEY = 'ganaderia_session_token';
const USER_KEY = 'ganaderia_session_user';

async function getStoredValue(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return typeof window === 'undefined' ? null : window.sessionStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function setStoredValue(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') throw new Error('El almacenamiento del navegador no está disponible.');
    window.sessionStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function removeStoredValue(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.sessionStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const savedToken = await getStoredValue(TOKEN_KEY);
        if (!savedToken) return;
        setApiToken(savedToken);
        try {
          const result = await apiRequest<{ user?: SessionUser } | SessionUser>('/api/auth/me');
          const me = (result as { user?: SessionUser }).user ?? result as SessionUser;
          if (active) { setToken(savedToken); setUser(me); }
          await setStoredValue(USER_KEY, JSON.stringify(me));
        } catch {
          setApiToken(null);
          await removeStoredValue(TOKEN_KEY);
          await removeStoredValue(USER_KEY);
        }
      } catch { /* Recuperación silenciosa: la pantalla de acceso sigue disponible. */ }
      finally { if (active) setReady(true); }
    })();
    return () => { active = false; };
  }, []);
  const signIn = useCallback(async (email: string, password: string) => {
    const result = await apiRequest<{ token: string; user: SessionUser }>('/api/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    });
    if (!result?.token || !result.user) throw new Error('La respuesta de acceso no contiene una sesión válida.');
    await setStoredValue(TOKEN_KEY, result.token);
    await setStoredValue(USER_KEY, JSON.stringify(result.user));
    setApiToken(result.token); setToken(result.token); setUser(result.user);
  }, []);
  const activateCard = useCallback(async (code: string) => {
    const result = await apiRequest<{ token: string; user: SessionUser }>('/api/auth/card/activate', {
      method: 'POST', body: JSON.stringify({ code: code.trim() }),
    });
    if (!result?.token || !result.user) throw new Error('La tarjeta no devolvió una sesión válida.');
    await setStoredValue(TOKEN_KEY, result.token);
    await setStoredValue(USER_KEY, JSON.stringify(result.user));
    setApiToken(result.token); setToken(result.token); setUser(result.user);
  }, []);
  const signOut = useCallback(async () => {
    try { await apiRequest('/api/auth/logout', { method: 'POST' }); } finally {
      setApiToken(null); setToken(null); setUser(null);
      await removeStoredValue(TOKEN_KEY); await removeStoredValue(USER_KEY);
    }
  }, []);
  const value = useMemo(() => ({ token, user, ready, signIn, activateCard, signOut }), [token, user, ready, signIn, activateCard, signOut]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession debe usarse dentro de SessionProvider.');
  return value;
}
