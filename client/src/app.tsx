import { useEffect, useState } from 'preact/hooks';
import { useWebSocket } from './hooks/useWebSocket';
import { useApi } from './hooks/useApi';
import { ChatPanel } from './components/ChatPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { FilePanel } from './components/FilePanel';
import { GitPanel } from './components/GitPanel';
import { ConnectionStatus } from './components/ConnectionStatus';

// ─── Icons ──────────────────────────────────────────────────────
const IconChat = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
);
const IconFiles = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M4 6h16M4 10h16M4 14h10M4 18h6"/>
  </svg>
);
const IconGit = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/>
    <path d="M6 21V9a9 9 0 009 9"/>
  </svg>
);
const IconSettings = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
);
// ─── Login Screen ────────────────────────────────────────────────
function LoginScreen({ onLogin, loading, wsStatus }: { onLogin: (p: string) => void, loading: boolean, wsStatus: string }) {
  const [pin, setPin] = useState('');

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', background: 'var(--color-bg)' }}>
      {/* Logo mark */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '52px' }}>
        <div style={{ fontSize: '32px', lineHeight: 1, color: 'var(--color-accent)', userSelect: 'none' }}>✳</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontStyle: 'italic', color: 'var(--color-text)', margin: 0, lineHeight: 1.1 }}>Antigravity</h1>
        <p style={{ fontSize: '11px', letterSpacing: '0.18em', color: 'var(--color-text-dim)', textTransform: 'uppercase', margin: 0, fontWeight: 500 }}>Remote Connect</p>
      </div>

      {/* Form */}
      <div style={{ width: '100%', maxWidth: '280px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          value={pin}
          onInput={(e) => setPin((e.target as HTMLInputElement).value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && pin.length >= 4) onLogin(pin); }}
          placeholder="• • • •"
          style={{
            width: '100%', background: 'var(--color-bg-alt)', border: '0.5px solid var(--color-border-2)',
            padding: '18px 20px', textAlign: 'center', fontSize: '28px', letterSpacing: '0.6em',
            borderRadius: '16px', outline: 'none', color: 'var(--color-text)', fontFamily: 'var(--font-mono)',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-accent)'; }}
          onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-border-2)'; }}
        />
        <button
          onClick={() => onLogin(pin)}
          disabled={loading || pin.length < 4}
          style={{
            width: '100%', background: pin.length >= 4 && !loading ? 'var(--color-accent)' : 'var(--color-bg-3)',
            border: 'none', padding: '16px', borderRadius: '14px', color: pin.length >= 4 && !loading ? '#fff' : 'var(--color-text-dim)',
            fontWeight: 700, fontSize: '15px', cursor: pin.length >= 4 && !loading ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s', letterSpacing: '0.01em',
            boxShadow: pin.length >= 4 && !loading ? '0 4px 20px var(--color-accent-glow)' : 'none',
          }}
        >
          {loading ? 'Conectando...' : 'Entrar'}
        </button>
      </div>

      {/* WS status */}
      <div style={{ marginTop: '40px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--color-text-dim)' }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: wsStatus === 'open' ? 'var(--color-green)' : 'var(--color-red)', boxShadow: wsStatus === 'open' ? '0 0 8px var(--color-green)' : 'none' }} />
        {wsStatus === 'open' ? 'servidor online' : 'aguardando conexão'}
      </div>
    </div>
  );
}

import { ModelSelector } from './components/ModelSelector';

// ─── Main App ────────────────────────────────────────────────────
export function App() {
  const [token, setToken] = useState(localStorage.getItem('session-token'));
  const [activeTab, setActiveTab] = useState<'chat' | 'files' | 'git' | 'settings'>('chat');
  const [showModelSelect, setShowModelSelect] = useState(false);
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const { data: wsData, status: wsStatus } = useWebSocket(`${protocol}//${window.location.host}/ws`);
  const { request, loading } = useApi();
  const [chatData, setChatData] = useState<any>(null);

  // WebSocket chat updates
  useEffect(() => {
    if (wsData?.type === 'chat:update') setChatData(wsData.data);
  }, [wsData]);

  const handleLogin = async (pin: string) => {
    try {
      const { token: t } = await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ pin }) });
      localStorage.setItem('session-token', t);
      setToken(t);
    } catch { alert('PIN incorreto'); }
  };

  if (!token) return <LoginScreen onLogin={handleLogin} loading={loading} wsStatus={wsStatus} />;

  // Model pill from WS snapshot
  const model = chatData?.activeModel;
  const agentStatus = chatData?.status as 'idle' | 'thinking' | 'error' | undefined;
  const pillClass = agentStatus === 'thinking' ? 'pill pill-amber' : agentStatus === 'error' ? 'pill pill-red' : 'pill pill-green';
  const statusLabel = agentStatus === 'thinking' ? 'pensando' : agentStatus === 'error' ? 'erro' : 'pronto';

  const tabs = [
    { id: 'chat',     label: 'Chat',   Icon: IconChat,     badge: agentStatus === 'thinking' },
    { id: 'files',    label: 'Files',  Icon: IconFiles,    badge: false },
    { id: 'git',      label: 'Git',    Icon: IconGit,      badge: false },
    { id: 'settings', label: 'Config', Icon: IconSettings, badge: wsStatus !== 'open' },
  ] as const;

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)', overflow: 'hidden' }}>
      <ConnectionStatus status={wsStatus} />

      {/* ── Header bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px 12px', gap: '10px', flexShrink: 0 }}>
        {/* Model + status pill */}
        {activeTab === 'chat' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={() => setShowModelSelect(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-bg-alt)', border: '0.5px solid var(--color-border-2)', borderRadius: '999px', padding: '5px 12px', maxWidth: '180px', overflow: 'hidden', cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-bg-3)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-bg-alt)'; }}
            >
              <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width: '3px', height: '14px', borderRadius: '2px', background: 'var(--color-text-dim)', opacity: 0.5 + i * 0.2 }} />
                ))}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>
                {model || 'Antigravity'}
              </span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-dim)" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginLeft: '2px' }}><path d="M6 9l6 6 6-6"/></svg>
            </button>
            <span class={pillClass} style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
              <span class="dot" style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor', boxShadow: 'none' }} />
              {statusLabel}
            </span>
          </div>
        ) : (
          <span style={{ fontWeight: 600, fontSize: '17px', color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
            {activeTab === 'files' ? 'Arquivos' : activeTab === 'git' ? 'Git' : 'Configurações'}
          </span>
        )}
        
        <div style={{ flex: 1 }} />
        
        {/* Antigravity + action icon per tab */}
        {activeTab === 'chat' && (
          <button style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--color-bg-2)', border: '0.5px solid var(--color-border-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
        )}
      </div>

      {/* ── Content area ── */}
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <div style={{ display: activeTab === 'chat' ? 'flex' : 'none', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <ChatPanel snapshot={chatData} />
        </div>
        {activeTab === 'files'    && <FilePanel />}
        {activeTab === 'git'      && <GitPanel />}
        {activeTab === 'settings' && <SettingsPanel />}
      </main>

      {/* ── Overlays ── */}
      {showModelSelect && (
        <ModelSelector 
          currentModel={model || ''} 
          onClose={() => setShowModelSelect(false)} 
        />
      )}

      {/* ── Tab Bar ── */}
      <nav style={{
        display: 'flex', borderTop: '0.5px solid var(--color-border)', background: 'rgba(15,14,17,0.92)',
        backdropFilter: 'blur(20px)', paddingBottom: 'max(env(safe-area-inset-bottom), 8px)', paddingTop: '4px',
        paddingLeft: '8px', paddingRight: '8px', gap: '4px', position: 'relative', zIndex: 40, flexShrink: 0,
      }}>
        {tabs.map(({ id, label, Icon, badge }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '8px 4px 6px', border: 'none', background: 'none', cursor: 'pointer',
                color: active ? 'var(--color-text)' : 'var(--color-text-dim)', position: 'relative',
                transition: 'color 0.15s', gap: '4px',
              }}
            >
              <div style={{ position: 'relative' }}>
                <Icon />
                {badge && (
                  <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '7px', height: '7px', borderRadius: '50%', background: 'var(--color-accent)', border: '1.5px solid var(--color-bg)', flexShrink: 0 }} />
                )}
              </div>
              <span style={{ fontSize: '9.5px', fontWeight: active ? 600 : 400, letterSpacing: '0.02em', textTransform: 'uppercase', lineHeight: 1 }}>{label}</span>
              {active && (
                <div style={{ position: 'absolute', bottom: '2px', width: '16px', height: '2px', borderRadius: '1px', background: 'var(--color-accent)' }} />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
