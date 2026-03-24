import { renderMarkdown } from '../utils/markdown';

interface StoredMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  status: 'complete' | 'streaming' | 'error';
  tokens?: number;
}
interface Props {
  message: StoredMessage;
  isStreaming?: boolean;
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function MessageBubble({ message, isStreaming }: Props) {
  const isUser = message.role === 'user';
  const html = isUser ? undefined : renderMarkdown(message.content);

  if (isUser) {
    return (
      <div style={{ padding: '4px 16px', display: 'flex', justifyContent: 'flex-end', animation: 'fadeIn 0.2s ease-out' }}>
        <div style={{
          maxWidth: '78%', background: 'var(--color-bg-3)',
          border: '0.5px solid var(--color-border-2)',
          borderRadius: '18px 18px 4px 18px',
          padding: '10px 14px',
        }}>
          <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5, color: 'var(--color-text)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {message.content}
          </p>
          <span style={{ display: 'block', marginTop: '4px', fontSize: '10px', color: 'var(--color-text-dim)', textAlign: 'right' }}>
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '4px 16px', display: 'flex', gap: '10px', alignItems: 'flex-start', animation: 'fadeIn 0.2s ease-out' }}>
      {/* Agent avatar */}
      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--color-bg-3)', border: '0.5px solid var(--color-border-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '6px' }}>
        <span style={{ fontSize: '10px', color: 'var(--color-accent)' }}>✳</span>
      </div>
      <div style={{ flex: 1, maxWidth: 'calc(100% - 34px)', minWidth: 0 }}>
        <div style={{
          background: 'var(--color-bg-alt)', border: '0.5px solid var(--color-border)',
          borderRadius: '4px 18px 18px 18px', padding: '10px 14px',
          position: 'relative',
        }}>
          {isStreaming && (
            <div style={{ position: 'absolute', top: '10px', right: '10px', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-accent)', animation: 'pulse 1s ease-in-out infinite' }} />
          )}
          {html ? (
            <div class="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5, color: 'var(--color-text)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{message.content}</p>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', paddingLeft: '4px' }}>
          <span style={{ fontSize: '10px', color: 'var(--color-text-dim)' }}>{formatTime(message.timestamp)}</span>
          {message.tokens && <span style={{ fontSize: '10px', color: 'var(--color-text-dim)', fontFamily: 'var(--font-mono)' }}>{message.tokens}t</span>}
          {message.status === 'error' && <span style={{ fontSize: '10px', color: 'var(--color-red)' }}>erro</span>}
        </div>
      </div>
    </div>
  );
}
