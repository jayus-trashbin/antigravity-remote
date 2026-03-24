import { useEffect } from 'preact/hooks';
import { renderMarkdown } from '../utils/markdown';

interface Props {
  pending: { text: string };
  onApprove: () => void;
  onReject: () => void;
}

export function ApprovalBanner({ pending, onApprove, onReject }: Props) {
  // Ctrl+Enter to approve
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); onApprove(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onApprove]);

  const html = renderMarkdown(pending.text);

  return (
    <div style={{ background: 'var(--color-bg-alt)', border: '0.5px solid var(--color-border-2)', borderRadius: '16px', overflow: 'hidden', animation: 'slideUp 0.25s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderBottom: '0.5px solid var(--color-border)', background: 'rgba(242,110,34,0.05)' }}>
        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--color-accent)', animation: 'pulse 1.5s ease-in-out infinite', flexShrink: 0 }} />
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-accent)', letterSpacing: '0.03em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
          Ação pendente · aprovação necessária
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: '12px 14px', maxHeight: '160px', overflow: 'auto' }}>
        <div class="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', padding: '10px 14px', borderTop: '0.5px solid var(--color-border)' }}>
        <button
          onClick={onApprove}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '10px', background: 'var(--color-accent)', border: 'none', color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'opacity 0.15s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          Aprovar
        </button>
        <button
          onClick={onReject}
          style={{ width: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', borderRadius: '10px', background: 'var(--color-bg-3)', border: '0.5px solid var(--color-border-2)', color: 'var(--color-text-muted)', cursor: 'pointer', transition: 'color 0.15s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-red)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-muted)'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>

      {/* Hint */}
      <div style={{ padding: '6px 14px 10px', fontSize: '10px', color: 'var(--color-text-dim)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
        Aprovar e ativar auto-accept nesta sessão · <kbd style={{ background: 'var(--color-bg-3)', padding: '1px 5px', borderRadius: '4px', fontSize: '9px' }}>Ctrl+Enter</kbd>
      </div>
    </div>
  );
}
