import { useState, useRef, useEffect, useCallback } from 'preact/hooks';
import { MessageBubble } from './MessageBubble';
import { SessionList } from './SessionList';
import { ApprovalBanner } from './ApprovalBanner';
import { VoiceInput } from './VoiceInput';
import { PromptImprove } from './PromptImprove';
import { apiFetch } from '../hooks/useApi';

interface StoredMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  status: 'complete' | 'streaming' | 'error';
  tokens?: number;
}
interface Snapshot {
  sessionId: string | null;
  messages: StoredMessage[];
  status: 'idle' | 'thinking' | 'error';
  pendingApproval: { text: string } | null;
  activeModel: string;
  streamingMessageId: string | null;
}
interface Props { snapshot: Snapshot | null; }

// ─── Quick action chips ──────────────────────────────────────────
const QUICK_CHIPS = [
  { label: 'Ver projeto', icon: '◎' },
  { label: 'Git status', icon: '⎇' },
  { label: 'Auto-accept ON', icon: '✳' },
];

export function ChatPanel({ snapshot }: Props) {
  const [messages, setMessages] = useState<StoredMessage[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [input, setInput] = useState('');
  const [showVoice, setShowVoice] = useState(false);
  const [improveText, setImproveText] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load active session
  useEffect(() => {
    apiFetch<{ sessions: { id: string }[]; activeId: string | null }>('/api/history/sessions')
      .then(async (r) => {
        const id = r.activeId || r.sessions[0]?.id;
        if (!id) return;
        setActiveSessionId(id);
        const session = await apiFetch<{ messages: StoredMessage[] }>(`/api/history/sessions/${id}`);
        setMessages(session.messages);
      })
      .catch(() => {});
  }, []);

  // WS updates
  useEffect(() => {
    if (!snapshot) return;
    if (snapshot.sessionId && snapshot.sessionId !== activeSessionId) setActiveSessionId(snapshot.sessionId);
    if (snapshot.messages.length > 0) setMessages(snapshot.messages);
  }, [snapshot]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, snapshot?.streamingMessageId]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || sending) return;
    setSending(true);
    setInput('');
    const optimistic: StoredMessage = {
      id: `opt-${Date.now()}`, role: 'user', content: text,
      timestamp: Date.now(), status: 'complete',
    };
    setMessages(prev => [...prev, optimistic]);
    try {
      await apiFetch('/api/chat/prompt', { method: 'POST', body: JSON.stringify({ prompt: text }) });
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [sending]);

  const status = snapshot?.status || 'idle';
  const streamingId = snapshot?.streamingMessageId;
  const hasMessages = messages.length > 0;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

      {/* ── Messages area ── */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' }}>
        
        {/* Approval banner */}
        {snapshot?.pendingApproval && (
          <div style={{ padding: '12px 16px 0' }}>
            <ApprovalBanner
              pending={snapshot.pendingApproval}
              onApprove={() => apiFetch('/api/chat/approve', { method: 'POST' })}
              onReject={() => apiFetch('/api/chat/reject', { method: 'POST' })}
            />
          </div>
        )}

        {/* Empty state */}
        {!hasMessages && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', gap: '28px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '28px', color: 'var(--color-accent)', lineHeight: 1 }}>✳</span>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontStyle: 'italic', color: 'var(--color-text)', textAlign: 'center', lineHeight: 1.25, margin: 0 }}>
                Como posso<br />ajudar hoje?
              </p>
            </div>
            {/* Quick chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              {QUICK_CHIPS.map(chip => (
                <button
                  key={chip.label}
                  onClick={() => send(chip.label)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'var(--color-bg-alt)', border: '0.5px solid var(--color-border-2)',
                    borderRadius: '999px', padding: '7px 14px',
                    fontSize: '12px', color: 'var(--color-text-muted)', cursor: 'pointer',
                    transition: 'border-color 0.15s, color 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border-2)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-muted)'; }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-accent)' }}>{chip.icon}</span>
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {hasMessages && (
          <div style={{ padding: '8px 0 8px' }}>
            {messages.map(msg => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isStreaming={msg.id === streamingId && msg.status === 'streaming'}
              />
            ))}
          </div>
        )}

        {/* Thinking indicator */}
        {status === 'thinking' && !streamingId && (
          <div style={{ padding: '4px 16px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', background: 'var(--color-bg-alt)', border: '0.5px solid var(--color-border-2)', borderRadius: '14px 14px 14px 4px', padding: '10px 16px' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--color-text-dim)', animation: `wave 1.4s ease-in-out ${i * 0.18}s infinite` }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} style={{ height: '1px' }} />
      </div>

      {/* ── Input bar ── */}
      <div style={{ padding: '8px 12px 14px', flexShrink: 0, background: 'var(--color-bg)' }}>
        {/* Improve / file quick action row */}
        {hasMessages && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <button
              onClick={() => { setImproveText(input || messages[messages.length - 1]?.content || ''); }}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '999px', background: 'var(--color-accent-soft)', border: '0.5px solid var(--color-accent-glow)', color: 'var(--color-accent)', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
            >
              ★ melhorar
            </button>
            <button
              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '999px', background: 'var(--color-bg-alt)', border: '0.5px solid var(--color-border-2)', color: 'var(--color-text-muted)', fontSize: '12px', cursor: 'pointer', opacity: 0.7 }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              arquivo
            </button>
          </div>
        )}

        {/* Main input row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'var(--color-bg-alt)', borderRadius: '999px',
          padding: '6px 6px 6px 16px',
          border: `0.5px solid ${sending ? 'var(--color-accent)' : 'var(--color-border-2)'}`,
          transition: 'border-color 0.2s',
        }}>
          <input
            ref={inputRef}
            value={input}
            onInput={(e) => setInput((e.target as HTMLInputElement).value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder={sending ? 'Enviando...' : 'Enviar para Antigravity...'}
            disabled={sending}
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--color-text)', fontSize: '14px', minWidth: 0 }}
          />
          {/* Voice button */}
          <button
            onClick={() => setShowVoice(true)}
            style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'color 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-muted)'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <rect x="9" y="2" width="6" height="11" rx="3"/>
              <path d="M5 10a7 7 0 0014 0M12 19v3M9 22h6"/>
            </svg>
          </button>
          {/* Send button */}
          {(input.trim() || sending) && (
            <button
              onClick={() => send(input)}
              disabled={sending}
              style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: sending ? 'var(--color-bg-3)' : 'var(--color-text)',
                border: 'none', cursor: sending ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                transition: 'background 0.15s',
              }}
            >
              {sending ? (
                <div style={{ width: '14px', height: '14px', border: '2px solid var(--color-text-dim)', borderTopColor: 'var(--color-text)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-bg)" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ── Overlays ── */}
      {showHistory && (
        <SessionList
          activeSessionId={activeSessionId}
          onSessionSelect={(id) => {
            setActiveSessionId(id);
            apiFetch<{ messages: StoredMessage[] }>(`/api/history/sessions/${id}`)
              .then(s => setMessages(s.messages)).catch(() => {});
          }}
          onNewSession={() => { setMessages([]); setActiveSessionId(null); }}
          onClose={() => setShowHistory(false)}
        />
      )}
      {showVoice && (
        <VoiceInput
          onClose={() => setShowVoice(false)}
          onImprove={(t) => { setShowVoice(false); setImproveText(t); }}
          onSend={(text) => { setShowVoice(false); send(text); }}
        />
      )}
      {improveText && (
        <PromptImprove
          currentPrompt={improveText}
          onSelect={(text) => { setInput(text); setImproveText(null); }}
        />
      )}
    </div>
  );
}
