import { useState, useEffect } from 'preact/hooks';
import { useApi } from '../hooks/useApi';

interface ToggleRowProps {
  label: string;
  hint: string;
  value: boolean;
  onToggle: () => void;
  disabled?: boolean;
  color?: string;
}

function ToggleRow({ label, hint, value, onToggle, disabled, color = 'var(--color-accent)' }: ToggleRowProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '0.5px solid var(--color-border)', opacity: disabled ? 0.45 : 1 }}>
      <div>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: 'var(--color-text)', lineHeight: 1.2 }}>{label}</p>
        <p style={{ margin: '3px 0 0', fontSize: '11px', color: 'var(--color-text-dim)' }}>{hint}</p>
      </div>
      <button
        class={`toggle ${value ? 'toggle-on' : 'toggle-off'}`}
        style={value ? { background: color, boxShadow: `0 0 12px ${color}55` } : {}}
        onClick={disabled ? undefined : onToggle}
        disabled={disabled}
      >
        <div class="toggle-thumb" />
      </button>
    </div>
  );
}

function Section({ title }: { title: string }) {
  return <p style={{ margin: '20px 0 4px', fontSize: '10px', letterSpacing: '0.12em', color: 'var(--color-text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>{title}</p>;
}

export function SettingsPanel() {
  const { request } = useApi();
  const [autoAccept, setAutoAccept] = useState(false);
  const [notify, setNotify] = useState(false);
  const [quotaMonitor, setQuotaMonitor] = useState(true);
  const [autoImprove, setAutoImprove] = useState(false);
  const [tunnel, setTunnel] = useState(false);
  const [improveMode, setImproveMode] = useState('detalhado');
  const [connectionState, setConnectionState] = useState<'online' | 'offline'>('online');

  useEffect(() => {
    request('/api/chat/auto-accept').then((d: any) => setAutoAccept(d.enabled)).catch(() => {});
  }, []);

  const toggleAutoAccept = async () => {
    const next = !autoAccept;
    await request('/api/chat/auto-accept', { method: 'POST', body: JSON.stringify({ enabled: next }) });
    setAutoAccept(next);
  };

  const logout = () => { localStorage.removeItem('session-token'); window.location.reload(); };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 40px' }}>
      
      {/* Connection badge */}
      <div style={{ paddingTop: '4px', paddingBottom: '8px' }}>
        <span class={connectionState === 'online' ? 'pill pill-green' : 'pill pill-red'}>
          <span class={connectionState === 'online' ? 'dot dot-green' : 'dot dot-red'} />
          {connectionState === 'online' ? 'Reconectado' : 'Desconectado'}
        </span>
      </div>

      {/* Agente */}
      <Section title="Agente" />
      <ToggleRow label="Auto-accept ações" hint="Aprovar comandos silenciosamente" value={autoAccept} onToggle={toggleAutoAccept} />
      <ToggleRow label="Notificar conclusão" hint="Avisar ao finalizar tarefa" value={notify} onToggle={() => setNotify(v => !v)} />
      <ToggleRow label="Quota monitor" hint="Acompanhar uso de tokens" value={quotaMonitor} onToggle={() => setQuotaMonitor(v => !v)} />

      {/* Voz e melhoria */}
      <Section title="Voz e Melhoria" />
      <ToggleRow label="Melhoria automática (★)" hint="Melhorar prompts ao gravar" value={autoImprove} onToggle={() => setAutoImprove(v => !v)} />

      {/* Improve mode */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '0.5px solid var(--color-border)' }}>
        <div>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: 'var(--color-text)' }}>Modo padrão</p>
          <p style={{ margin: '3px 0 0', fontSize: '11px', color: 'var(--color-text-dim)' }}>Estilo de melhoria</p>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['detalhado', 'conciso', 'técnico'].map(m => (
            <button key={m} onClick={() => setImproveMode(m)} style={{ padding: '5px 10px', borderRadius: '999px', border: `0.5px solid ${improveMode === m ? 'var(--color-accent)' : 'var(--color-border-2)'}`, background: improveMode === m ? 'var(--color-accent-soft)' : 'transparent', color: improveMode === m ? 'var(--color-accent)' : 'var(--color-text-dim)', fontSize: '11px', cursor: 'pointer', transition: 'all 0.15s' }}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Modelo de improve */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '0.5px solid var(--color-border)' }}>
        <div>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: 'var(--color-text)' }}>Modelo de improve</p>
          <p style={{ margin: '3px 0 0', fontSize: '11px', color: 'var(--color-text-dim)' }}>Modelo LLM para melhoria</p>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>haiku-4-5 ›</span>
      </div>

      {/* Conexão */}
      <Section title="Conexão" />
      <ToggleRow label="Cloudflare Tunnel" hint="Acesso remoto seguro" value={tunnel} onToggle={() => setTunnel(v => !v)} color="var(--color-green)" disabled />

      {/* Logout */}
      <div style={{ marginTop: '32px' }}>
        <button
          onClick={logout}
          style={{ width: '100%', padding: '14px', borderRadius: '14px', background: 'rgba(232,80,80,0.08)', border: '0.5px solid rgba(232,80,80,0.2)', color: 'var(--color-red)', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.15s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(232,80,80,0.15)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(232,80,80,0.08)'; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          Sair desta sessão
        </button>
      </div>

      <p style={{ textAlign: 'center', fontSize: '10px', color: 'var(--color-text-dim)', marginTop: '24px', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
        Antigravity Remote v2.0
      </p>
    </div>
  );
}
