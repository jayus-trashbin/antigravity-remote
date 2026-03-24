import { useState, useEffect } from 'preact/hooks';

type WsStatus = 'open' | 'connecting' | 'closed' | string;

interface Props { status: WsStatus; }

export function ConnectionStatus({ status }: Props) {
  const [show, setShow] = useState(false);
  const [label, setLabel] = useState('');
  const [isPositive, setIsPositive] = useState(false);

  useEffect(() => {
    if (status === 'open') {
      setLabel('Reconectado');
      setIsPositive(true);
      setShow(true);
      const t = setTimeout(() => setShow(false), 2800);
      return () => clearTimeout(t);
    } else if (status === 'closed') {
      setLabel('Desconectado');
      setIsPositive(false);
      setShow(true);
    } else {
      setShow(false);
    }
  }, [status]);

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed', top: '52px', left: '50%', transform: 'translateX(-50%)',
      zIndex: 100, animation: 'slideUp 0.25s var(--ease-out-quart)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '7px',
        padding: '7px 14px', borderRadius: '999px',
        background: isPositive ? 'rgba(63,197,116,0.12)' : 'rgba(232,80,80,0.12)',
        border: `0.5px solid ${isPositive ? 'rgba(63,197,116,0.3)' : 'rgba(232,80,80,0.3)'}`,
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}>
        <div style={{
          width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
          background: isPositive ? 'var(--color-green)' : 'var(--color-red)',
          boxShadow: isPositive ? '0 0 8px var(--color-green)' : '0 0 8px var(--color-red)',
        }} />
        <span style={{ fontSize: '12px', fontWeight: 600, color: isPositive ? 'var(--color-green)' : 'var(--color-red)' }}>
          {label}
        </span>
      </div>
    </div>
  );
}
