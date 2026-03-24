import { parseDiff } from '../utils/diff';

interface Props { diff: string; }

export function DiffViewer({ diff }: Props) {
  if (!diff) return (
    <div style={{ textAlign: 'center', color: 'var(--color-text-dim)', fontSize: '12px', padding: '24px', fontFamily: 'var(--font-mono)' }}>
      Sem diferenças
    </div>
  );

  const hunks = parseDiff(diff);

  // Group into chunks separated by @@ headers
  const chunks: { header: string; lines: typeof hunks }[] = [];
  let current: (typeof chunks)[0] | null = null;

  for (const h of hunks) {
    if (h.isHeader && (h.content.startsWith('@@ ') || h.content.startsWith('diff '))) {
      if (current) chunks.push(current);
      current = { header: h.content, lines: [] };
    } else if (current) {
      current.lines.push(h);
    } else {
      if (!current) current = { header: '', lines: [] };
      current.lines.push(h);
    }
  }
  if (current) chunks.push(current);

  if (chunks.length === 0) return (
    <div style={{ textAlign: 'center', color: 'var(--color-text-dim)', fontSize: '12px', padding: '24px', fontFamily: 'var(--font-mono)' }}>
      Sem diferenças
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {chunks.map((chunk, ci) => (
        <div key={ci} style={{ background: '#0d0c14', border: '0.5px solid var(--color-border-2)', borderRadius: '10px', overflow: 'hidden' }}>
          {chunk.header && (
            <div style={{ padding: '6px 12px', background: 'rgba(91,164,245,0.06)', borderBottom: '0.5px solid var(--color-border)' }}>
              <span style={{ fontSize: '10px', color: 'var(--color-blue)', fontFamily: 'var(--font-mono)' }}>{chunk.header}</span>
            </div>
          )}
          <div>
            {chunk.lines.map((line, li) => {
              const bg = line.isAdd ? 'rgba(63,197,116,0.08)' : line.isRemove ? 'rgba(232,80,80,0.08)' : line.isHeader ? 'rgba(91,164,245,0.04)' : 'transparent';
              const color = line.isAdd ? 'var(--color-green)' : line.isRemove ? 'var(--color-red)' : line.isHeader ? 'var(--color-blue)' : 'var(--color-text-muted)';
              const prefix = line.isAdd ? '+' : line.isRemove ? '−' : ' ';
              const text = (line.isAdd || line.isRemove) ? line.content.slice(1) : line.content;

              return (
                <div key={li} style={{ display: 'flex', background: bg, padding: '1px 0' }}>
                  <span style={{ width: '20px', textAlign: 'center', fontSize: '10px', color, fontFamily: 'var(--font-mono)', flexShrink: 0, userSelect: 'none', opacity: 0.7 }}>
                    {prefix}
                  </span>
                  <span style={{ flex: 1, fontSize: '11px', lineHeight: 1.7, color, fontFamily: 'var(--font-mono)', paddingRight: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                    {text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
