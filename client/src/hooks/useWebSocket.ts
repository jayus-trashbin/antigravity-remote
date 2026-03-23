import { useEffect, useRef, useState } from 'preact/hooks';

export function useWebSocket(url: string) {
  const [data, setData] = useState<any>(null);
  const [status, setStatus] = useState<'connecting' | 'open' | 'closed'>('connecting');
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connect = () => {
      const socket = new WebSocket(url);
      ws.current = socket;

      socket.onopen = () => setStatus('open');
      socket.onclose = () => {
        setStatus('closed');
        setTimeout(connect, 3000);
      };
      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          setData(msg);
        } catch (e) {
          console.error('[ws] Parse error:', e);
        }
      };
    };

    connect();
    return () => ws.current?.close();
  }, [url]);

  return { data, status };
}
