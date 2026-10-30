import { useCallback, useEffect, useState } from 'react';
import { apiRequest, displayError } from '@/lib/api';

export function useRemote<T>(path: string, keys: string[] = []) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision((v) => v + 1), []);
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    apiRequest<unknown>(path).then((payload) => {
      if (!active) return;
      const list = Array.isArray(payload) ? payload : (() => {
        if (payload && typeof payload === 'object') {
          const obj = payload as Record<string, unknown>;
          for (const key of [...keys, 'data', 'items']) if (Array.isArray(obj[key])) return obj[key] as T[];
        }
        return [];
      })();
      setItems(list as T[]);
    }).catch((e) => { if (active) setError(displayError(e)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [path, revision, keys.join('|')]);
  return { items, loading, error, reload };
}
