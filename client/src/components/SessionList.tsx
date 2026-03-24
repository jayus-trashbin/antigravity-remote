import { useState, useEffect } from 'preact/hooks';
import { apiFetch } from '../hooks/useApi';

interface Session {
  id: string;
  title: string;
  startedAt: number;
  updatedAt: number;
  messageCount: number;
  model?: string;
}
interface Props {
  activeSessionId: string | null;
  onSessionSelect: (id: string) => void;
  onNewSession: () => void;
  onClose: () => void;
}

function timeAgo(ts: number): string {
  const d = Date.now() - ts;
  if (d < 60_000)  return 'agora';
  if (d < 3600_000) return `${Math.floor(d / 60_000)}min`;
  if (d < 86400_000) return `${Math.floor(d / 3600_000)}h`;
  return `${Math.floor(d / 86400_000)}d`;
}

export function SessionList({ activeSessionId, onSessionSelect, onNewSession, onClose }: Props) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    apiFetch<{ sessions: Session[] }>('/api/history/sessions')
      .then(r => setSessions(r.sessions))
      .catch(() => {});
  }, []);

  const filtered = sessions.filter(s => s.title.toLowerCase().includes(query.toLowerCase()));

  return (
    // Backdrop
    <div
      style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.2s ease-out' }}
      onClick={onClose}
    >
      {/* Panel */}
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--color-bg-alt)', borderBottom: '0.5px solid var(--color-border-2)', flex: 1, display: 'flex', flexDirection: 'column', maxHeight: '85%', marginTop: 'auto' /* bottom sheet */ }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 12px' }}>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '22px', fontStyle: 'italic', color: 'var(--color-text)' }}>Histórico</h2>
          <button
            onClick={() => { onNewSession(); apiFetch('/api/history/sessions', { method: 'POST' }).then((s: any) => onSessionSelect(s.id)).catch(() => {}); onClose(); }}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', borderRadius: '999px', background: 'var(--color-accent)', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
          >
            + Nova
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '0 16px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-bg-3)', border: '0.5px solid var(--color-border-2)', borderRadius: '10px', padding: '9px 12px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-dim)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              value={query}
              onInput={e => setQuery((e.target as HTMLInputElement).value)}
              placeholder="Buscar em todas as conversas..."
              style={{ background: 'none', border: 'none', outline: 'none', flex: 1, fontSize: '13px', color: 'var(--color-text)' }}
            />
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 16px' }}>
          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--color-text-dim)', fontSize: '13px', padding: '24px' }}>Nenhuma sessão encontrada</p>
          )}
          {filtered.map(s => {
            const active = s.id === activeSessionId;
            return (
              <button
                key={s.id}
                onClick={() => { onSessionSelect(s.id); onClose(); }}
                style={{
                  width: '100%', display: 'flex', flexDirection: 'column', gap: '3px',
                  padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', textAlign: 'left',
                  background: active ? 'var(--color-accent-soft)' : 'transparent',
                  transition: 'background 0.15s',
                  marginBottom: '2px',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-bg-3)'; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    {s.title}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--color-text-dim)', flexShrink: 0 }}>{timeAgo(s.updatedAt)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-dim)' }}>{s.messageCount} msgs</span>
                  {s.model && <span style={{ fontSize: '10px', color: 'var(--color-text-dim)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.model}</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
