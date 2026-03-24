import { useState } from 'preact/hooks';

export async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('session-token');
  const headers: Record<string, string> = {
    'x-session-token': token || '',
  };
  
  if (!(options.body && options.body.constructor.name === 'FormData')) {
    headers['Content-Type'] = 'application/json';
  }

  const resp = await fetch(path, {
    ...options,
    headers: { ...headers, ...options.headers },
  });
  
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data.error || 'Erro na requisição');
  return data as T;
}

export function useApi() {
  const [loading, setLoading] = useState(false);

  const request = async <T = any>(path: string, options: RequestInit = {}): Promise<T> => {
    setLoading(true);
    try {
      return await apiFetch<T>(path, options);
    } finally {
      setLoading(false);
    }
  };

  return { request, loading };
}
