import { useState } from 'preact/hooks';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('session-token');

  const request = async (path: string, options: RequestInit = {}) => {
    setLoading(true);
    try {
      const resp = await fetch(path, {
        ...options,
        headers: {
          ...options.headers,
          'x-session-token': token || '',
          'Content-Type': 'application/json',
        },
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Erro na requisição');
      return data;
    } finally {
      setLoading(false);
    }
  };

  return { request, loading };
}
