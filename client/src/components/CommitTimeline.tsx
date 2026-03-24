interface Commit {
  hash: string;
  message: string;
  author_name: string;
  date: string;
}
interface Props { commits: Commit[]; }

function timeAgo(dateStr: string): string {
  const d = Date.now() - new Date(dateStr).getTime();
  if (d < 60_000) return 'agora';
  if (d < 3600_000) return `${Math.floor(d / 60_000)}min`;
  if (d < 86400_000) return `${Math.floor(d / 3600_000)}h`;
  return `${Math.floor(d / 86400_000)}d`;
}

export function CommitTimeline({ commits }: Props) {
  if (!commits.length) return (
    <div style={{ textAlign: 'center', color: 'var(--color-text-dim)', fontSize: '13px', padding: '40px' }}>
      Sem commits encontrados
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {commits.map((c, i) => {
        const short = c.hash?.slice(0, 7) || 'unknown';
        const isYou = c.author_name?.toLowerCase().includes('você') || c.author_name?.toLowerCase().includes('you');
        return (
          <div key={c.hash || i} style={{ display: 'flex', gap: '12px', position: 'relative', paddingBottom: '16px' }}>
            {/* Timeline line */}
            {i < commits.length - 1 && (
              <div style={{ position: 'absolute', left: '10px', top: '20px', bottom: 0, width: '1px', background: 'var(--color-border-2)' }} />
            )}
            {/* Dot */}
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `1.5px solid ${isYou ? 'var(--color-accent)' : 'var(--color-border-2)'}`, background: isYou ? 'var(--color-accent-soft)' : 'var(--color-bg-alt)', flexShrink: 0, position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isYou ? 'var(--color-accent)' : 'var(--color-text-dim)' }} />
            </div>
            {/* Content */}
            <div style={{ flex: 1, paddingTop: '1px', minWidth: 0 }}>
              <p style={{ margin: '0 0 3px', fontSize: '13px', color: 'var(--color-text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>
                {c.message}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-accent)', background: 'var(--color-accent-soft)', padding: '1px 6px', borderRadius: '4px' }}>{short}</span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-dim)' }}>{c.author_name || 'você'}</span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-dim)' }}>{timeAgo(c.date)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
