import { useState, useEffect } from 'preact/hooks';
import { apiFetch } from '../hooks/useApi';
import { DiffViewer } from './DiffViewer';
import { CommitTimeline } from './CommitTimeline';

type Tab = 'changes' | 'commits' | 'actions';

const FILE_COLORS: Record<string, string> = {
  M: 'var(--color-accent)',
  A: 'var(--color-green)',
  D: 'var(--color-red)',
  R: 'var(--color-blue)',
  '?': 'var(--color-text-dim)',
};

export function GitPanel() {
  const [status, setStatus] = useState<any>(null);
  const [commits, setCommits] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('changes');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileDiff, setFileDiff] = useState('');
  const [message, setMessage] = useState('');
  const [branch, setBranch] = useState('main');
  const [changesCount, setChangesCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      const [s, b, c] = await Promise.all([
        apiFetch('/api/git/status'),
        apiFetch('/api/git/branch'),
        apiFetch('/api/git/log'),
      ]);
      setStatus(s);
      setBranch((b as any).branch);
      setCommits((c as any).all || []);
      const s2 = s as any;
      setChangesCount((s2?.staged?.length || 0) + (s2?.modified?.length || 0) + (s2?.not_added?.length || 0));
      if (selectedFile) {
        const r = await apiFetch(`/api/git/diff?file=${encodeURIComponent(selectedFile)}`);
        setFileDiff((r as any).diff || '');
      }
    } catch {}
  };

  useEffect(() => { fetchAll(); }, []);

  const fetchDiff = async (file: string) => {
    setSelectedFile(file);
    const r = await apiFetch(`/api/git/diff?file=${encodeURIComponent(file)}`);
    setFileDiff((r as any).diff || '');
  };

  const doAction = async (label: string, action: () => Promise<void>) => {
    setLoading(true);
    try { await action(); await fetchAll(); setActionFeedback(`${label} concluído`); setTimeout(() => setActionFeedback(null), 2000); }
    catch { setActionFeedback('Erro'); setTimeout(() => setActionFeedback(null), 2000); }
    finally { setLoading(false); }
  };

  const staged: string[] = status?.staged || [];
  const unstaged = [...(status?.modified || []), ...(status?.not_added || []), ...(status?.deleted || [])].filter(f => !staged.includes(f));

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: 'changes', label: 'Mudanças', badge: changesCount || undefined },
    { id: 'commits', label: 'Histórico' },
    { id: 'actions', label: 'Ações' },
  ];

  if (!status) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-dim)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
      Carregando...
    </div>
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Branch bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '0.5px solid var(--color-border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round">
            <circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/>
            <path d="M6 21V9a9 9 0 009 9"/>
          </svg>
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>⎇ {branch}</span>
          {changesCount > 0 && (
            <span style={{ fontSize: '11px', color: 'var(--color-accent)', background: 'var(--color-accent-soft)', padding: '1px 8px', borderRadius: '999px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
              {changesCount}
            </span>
          )}
        </div>
        <button
          onClick={fetchAll}
          style={{ background: 'none', border: 'none', color: 'var(--color-text-dim)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
          </svg>
        </button>
      </div>

      {/* Tab strip */}
      <div style={{ display: 'flex', gap: '0', borderBottom: '0.5px solid var(--color-border)', flexShrink: 0, padding: '0 16px' }}>
        {tabs.map(({ id, label, badge }) => {
          const active = activeTab === id;
          return (
            <button key={id} onClick={() => { setActiveTab(id); setSelectedFile(null); }}
              style={{ padding: '10px 16px', background: 'none', border: 'none', color: active ? 'var(--color-text)' : 'var(--color-text-dim)', fontSize: '13px', fontWeight: active ? 600 : 400, cursor: 'pointer', borderBottom: `2px solid ${active ? 'var(--color-accent)' : 'transparent'}`, transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '6px', position: 'relative', top: '1px' }}>
              {label}
              {badge !== undefined && badge > 0 && (
                <span style={{ fontSize: '9px', background: 'var(--color-accent)', color: '#fff', padding: '1px 5px', borderRadius: '999px', fontWeight: 700 }}>{badge}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Action feedback */}
      {actionFeedback && (
        <div style={{ padding: '6px 16px', background: 'var(--color-accent-soft)', borderBottom: '0.5px solid var(--color-accent-glow)', fontSize: '12px', color: 'var(--color-accent)', textAlign: 'center', animation: 'fadeIn 0.2s ease-out' }}>
          {actionFeedback}
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>

        {/* ── Changes ── */}
        {activeTab === 'changes' && !selectedFile && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {staged.length > 0 && (
              <div>
                <p style={{ margin: '0 0 8px', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--color-text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Staged ({staged.length})</p>
                {staged.map(file => (
                  <FileRow key={file} file={file} type="A" onSelect={() => fetchDiff(file)}
                    actions={[{ label: '−', title: 'Unstage', onClick: () => doAction('Unstage', () => apiFetch('/api/git/unstage', { method: 'POST', body: JSON.stringify({ file }) }) as any) }]}
                  />
                ))}
              </div>
            )}
            {unstaged.length > 0 && (
              <div>
                <p style={{ margin: '0 0 8px', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--color-text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Modificados ({unstaged.length})</p>
                {unstaged.map(file => {
                  const type = status?.deleted?.includes(file) ? 'D' : status?.not_added?.includes(file) ? 'A' : 'M';
                  return (
                    <FileRow key={file} file={file} type={type} onSelect={() => fetchDiff(file)}
                      actions={[
                        { label: '+', title: 'Stage', onClick: () => doAction('Stage', () => apiFetch('/api/git/stage', { method: 'POST', body: JSON.stringify({ file }) }) as any) },
                        { label: '×', title: 'Descartar', onClick: () => doAction('Discard', () => apiFetch('/api/git/discard', { method: 'POST', body: JSON.stringify({ file }) }) as any) },
                      ]}
                    />
                  );
                })}
              </div>
            )}
            {staged.length === 0 && unstaged.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--color-text-dim)', fontSize: '13px', marginTop: '40px' }}>Sem mudanças pendentes</p>
            )}
          </div>
        )}

        {/* ── Diff view ── */}
        {activeTab === 'changes' && selectedFile && (
          <div>
            <button onClick={() => setSelectedFile(null)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '12px', marginBottom: '12px', padding: '4px 0' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
              {selectedFile}
            </button>
            <DiffViewer diff={fileDiff} />
          </div>
        )}

        {/* ── Commits ── */}
        {activeTab === 'commits' && <CommitTimeline commits={commits} />}

        {/* ── Actions ── */}
        {activeTab === 'actions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Commit input */}
            <div style={{ background: 'var(--color-bg-alt)', border: '0.5px solid var(--color-border-2)', borderRadius: '14px', overflow: 'hidden' }}>
              <textarea
                value={message}
                onInput={e => setMessage((e.target as HTMLTextAreaElement).value)}
                placeholder="Mensagem do commit..."
                style={{ width: '100%', background: 'none', border: 'none', outline: 'none', padding: '12px 14px', fontSize: '13px', color: 'var(--color-text)', resize: 'none', minHeight: '80px', fontFamily: 'var(--font-sans)' }}
              />
              <div style={{ borderTop: '0.5px solid var(--color-border)', display: 'flex' }}>
                <button
                  onClick={() => doAction('Commit', () => apiFetch('/api/git/commit', { method: 'POST', body: JSON.stringify({ message: message || 'chore: update' }) }) as any)}
                  disabled={loading}
                  style={{ flex: 1, padding: '10px', background: 'var(--color-accent)', border: 'none', color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                >
                  Commit
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { label: 'Stage All', emoji: '+', action: () => apiFetch('/api/git/stage-all', { method: 'POST' }) as any },
                { label: 'Pull',      emoji: '↓', action: () => apiFetch('/api/git/pull',     { method: 'POST' }) as any },
                { label: 'Push',      emoji: '↑', action: () => apiFetch('/api/git/push',     { method: 'POST' }) as any },
              ].map(({ label, emoji, action }) => (
                <button key={label} onClick={() => doAction(label, action)} disabled={loading}
                  style={{ padding: '12px', borderRadius: '12px', background: 'var(--color-bg-alt)', border: '0.5px solid var(--color-border-2)', color: 'var(--color-text)', fontWeight: 500, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <span style={{ color: 'var(--color-accent)' }}>{emoji}</span> {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── File row component ──────────────────────────────────────────
function FileRow({ file, type, onSelect, actions }: { file: string; type: string; onSelect: () => void; actions: { label: string; title: string; onClick: () => void }[] }) {
  const color = FILE_COLORS[type] || 'var(--color-text-dim)';
  const short = file.split('/').pop() || file;
  const dir = file.includes('/') ? file.split('/').slice(0, -1).join('/') + '/' : '';

  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2px', borderRadius: '8px', overflow: 'hidden', border: '0.5px solid var(--color-border)' }}>
      <button onClick={onSelect} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'var(--color-bg-alt)', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s', minWidth: 0 }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-bg-3)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-bg-alt)'; }}>
        {/* File icon */}
        <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: '9px', fontWeight: 700, color, fontFamily: 'var(--font-mono)' }}>ts</span>
        </div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{short}</p>
          {dir && <p style={{ margin: 0, fontSize: '10px', color: 'var(--color-text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dir}</p>}
        </div>
        <span style={{ fontSize: '11px', fontWeight: 700, color, fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{type}</span>
      </button>
      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '1px' }}>
        {actions.map(a => (
          <button key={a.label} onClick={a.onClick} title={a.title}
            style={{ width: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 0', background: 'var(--color-bg-3)', border: 'none', borderLeft: '0.5px solid var(--color-border)', color: a.label === '×' || a.label === '−' ? 'var(--color-red)' : 'var(--color-green)', fontSize: '16px', fontWeight: 300, cursor: 'pointer', transition: 'background 0.15s', alignSelf: 'stretch' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-bg-2)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-bg-3)'; }}>
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
