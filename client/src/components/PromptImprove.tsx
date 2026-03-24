import { useState } from 'preact/hooks';
import { apiFetch } from '../hooks/useApi';

type Mode = 'detailed' | 'concise' | 'technical';

interface Props {
  currentPrompt: string;
  onSelect: (text: string) => void;
}

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: 'detailed',   label: 'detalhado',  hint: 'Mais contexto e clareza' },
  { id: 'concise',    label: 'conciso',    hint: 'Direto ao ponto' },
  { id: 'technical',  label: 'técnico',    hint: 'Termos de engenharia' },
];

export function PromptImprove({ currentPrompt, onSelect }: Props) {
  const [mode, setMode] = useState<Mode>('detailed');
  const [improved, setImproved] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ improved: string }>('/api/improve', {
        method: 'POST',
        body: JSON.stringify({ prompt: currentPrompt, mode }),
      });
      setImproved(data.improved);
    } catch (e) {
      setError('Falha ao melhorar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Backdrop
    <div
      style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', zIndex: 50, display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.2s ease-out' }}
    >
      {/* Sheet */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Handle + header */}
        <div style={{ padding: '16px 20px 12px', borderBottom: '0.5px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={() => onSelect(currentPrompt)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '20px', color: 'var(--color-text)' }}>Melhorando prompt</h3>
            </div>
            <button onClick={() => onSelect(currentPrompt)} style={{ background: 'none', border: 'none', color: 'var(--color-text-dim)', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}>×</button>
          </div>

          {/* Mode chips */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', overflow: 'auto' }}>
            {MODES.map(m => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                style={{
                  padding: '6px 14px', borderRadius: '999px', border: `0.5px solid ${mode === m.id ? 'var(--color-accent)' : 'var(--color-border-2)'}`,
                  background: mode === m.id ? 'var(--color-accent-soft)' : 'transparent',
                  color: mode === m.id ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  fontSize: '12px', fontWeight: mode === m.id ? 600 : 400, cursor: 'pointer', flexShrink: 0,
                  transition: 'all 0.15s',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
          {/* Original */}
          <div>
            <p style={{ margin: '0 0 6px', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--color-text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Original</p>
            <div style={{ background: 'var(--color-bg-alt)', border: '0.5px solid var(--color-border)', borderRadius: '12px', padding: '12px 14px', fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.55 }}>
              {currentPrompt}
            </div>
          </div>

          {/* Improved */}
          {improved && (
            <div style={{ animation: 'slideUp 0.25s ease-out' }}>
              <p style={{ margin: '0 0 6px', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--color-text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                Melhorado · <span style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', fontSize: '9px' }}>claude-haiku-4-5</span>
              </p>
              <div style={{ background: 'var(--color-accent-soft)', border: '0.5px solid var(--color-accent-glow)', borderRadius: '12px', padding: '12px 14px', fontSize: '13px', color: 'var(--color-text)', lineHeight: 1.6 }}>
                {improved}
              </div>
            </div>
          )}

          {error && <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-red)', textAlign: 'center' }}>{error}</p>}
        </div>
      </div>

      {/* Action footer */}
      <div style={{ display: 'flex', gap: '10px', padding: '12px 20px', paddingBottom: 'max(env(safe-area-inset-bottom), 20px)', borderTop: '0.5px solid var(--color-border)' }}>
        <button
          onClick={generate}
          disabled={loading}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '14px', borderRadius: '14px', background: 'var(--color-bg-3)', border: '0.5px solid var(--color-border-2)', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? (
            <div style={{ width: '18px', height: '18px', border: '2px solid var(--color-text-dim)', borderTopColor: 'var(--color-text)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          ) : (
            <>{!improved ? '★ Gerar' : '↺ Gerar'}</>
          )}
        </button>
        {improved && (
          <button
            onClick={() => onSelect(improved)}
            style={{ flex: 2, padding: '14px', borderRadius: '14px', background: 'var(--color-accent)', border: 'none', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 16px var(--color-accent-glow)', transition: 'opacity 0.15s' }}
          >
            Aceitar e enviar
          </button>
        )}
      </div>
    </div>
  );
}
