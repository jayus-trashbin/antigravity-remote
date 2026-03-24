import { useState, useEffect } from 'preact/hooks';
import { useApi } from '../hooks/useApi';

type FileEntry = { name: string; isDir: boolean; size?: number };

const EXT_LANG: Record<string, string> = {
  ts: 'ts', tsx: 'tsx', js: 'js', jsx: 'jsx', json: 'json', md: 'md',
  css: 'css', html: 'html', py: 'py', sh: 'sh', yaml: 'yml', yml: 'yml',
};

function FileIcon({ name, isDir }: { name: string; isDir: boolean }) {
  const ext = name.split('.').pop() || '';
  const lang = EXT_LANG[ext] || '';
  if (isDir) return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.8" strokeLinecap="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>;
  const color = lang === 'ts' || lang === 'tsx' ? '#3178c6' : lang === 'js' || lang === 'jsx' ? '#f0db4f' : lang === 'json' ? '#cbcb41' : lang === 'md' ? '#4ec9b0' : lang === 'css' ? '#56c0de' : lang === 'py' ? '#3572a5' : 'var(--color-text-dim)';
  return (
    <span style={{ width: '16px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 700, color, fontFamily: 'var(--font-mono)' }}>
      {lang || 'txt'}
    </span>
  );
}

export function FilePanel() {
  const { request, loading } = useApi();
  const [currentPath, setCurrentPath] = useState('');
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [previewFile, setPreviewFile] = useState<{ path: string; name: string } | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const loadFiles = async (path = '') => {
    try {
      const data = await request(`/api/files/list?path=${encodeURIComponent(path)}`);
      setEntries((data.entries as FileEntry[]).sort((a, b) => (b.isDir ? 1 : 0) - (a.isDir ? 1 : 0) || a.name.localeCompare(b.name)));
      setCurrentPath(path);
    } catch (e) {
      console.warn('[FilePanel] Erro ao listar arquivos:', e);
    }
  };

  useEffect(() => { loadFiles(); }, []);

  const navigate = (name: string) => {
    const next = currentPath ? `${currentPath}/${name}` : name;
    loadFiles(next);
  };

  const goBack = () => {
    const parts = currentPath.split('/');
    parts.pop();
    loadFiles(parts.join('/'));
  };

  const openFile = async (name: string) => {
    const target = currentPath ? `${currentPath}/${name}` : name;
    setPreviewFile({ path: target, name });
    setPreviewContent(null);
    setPreviewLoading(true);
    try {
      const resp = await request(`/api/files/read?path=${encodeURIComponent(target)}`);
      setPreviewContent(resp.content);
    } catch (e: any) {
      setPreviewContent(`Erro: ${e.message || 'Não foi possível ler o arquivo'}`);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    await fetch('/api/files/upload', { method: 'POST', headers: { 'x-session-token': localStorage.getItem('session-token') || '' }, body: fd });
    await loadFiles(currentPath);
  };

  // Breadcrumbs
  const crumbs = currentPath ? currentPath.split('/') : [];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* ── Header / Breadcrumb ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '0.5px solid var(--color-border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', flex: 1 }}>
          {currentPath && (
            <button onClick={goBack} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px 4px 2px 0', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
          )}
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentPath ? `src / ${crumbs.join(' / ')} /` : 'src /'}
          </span>
        </div>
        {/* Upload */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '8px', background: 'var(--color-accent)', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
          Upload
          <input type="file" style={{ display: 'none' }} onChange={handleUpload} />
        </label>
      </div>

      {/* ── File list ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', color: 'var(--color-text-dim)', fontSize: '12px' }}>Carregando...</div>
        )}
        
        {!loading && entries.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px', gap: '8px', color: 'var(--color-text-dim)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
            <span style={{ fontSize: '13px' }}>Pasta vazia</span>
          </div>
        )}

        {entries.map(entry => (
          <button
            key={entry.name}
            onClick={() => entry.isDir ? navigate(entry.name) : openFile(entry.name)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px',
              background: 'none', border: 'none', borderRadius: '9px', cursor: 'pointer', textAlign: 'left',
              transition: 'background 0.12s', marginBottom: '1px',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-bg-alt)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
          >
            <FileIcon name={entry.name} isDir={entry.isDir} />
            <span style={{ flex: 1, fontSize: '13px', color: 'var(--color-text)', fontFamily: entry.isDir ? 'var(--font-sans)' : 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {entry.isDir ? `${entry.name} /` : entry.name}
            </span>
            {!entry.isDir && entry.size && (
              <span style={{ fontSize: '10px', color: 'var(--color-text-dim)', flexShrink: 0 }}>
                {entry.size > 1024 ? `${Math.round(entry.size / 1024)}KB` : `${entry.size}B`}
              </span>
            )}
            {entry.isDir && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-dim)" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            )}
          </button>
        ))}
      </div>

      {/* ── Preview overlay ── */}
      {previewFile && (
        <div style={{ position: 'absolute', inset: 0, background: 'var(--color-bg)', zIndex: 40, display: 'flex', flexDirection: 'column', animation: 'slideUp 0.2s ease-out' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderBottom: '0.5px solid var(--color-border)', flexShrink: 0 }}>
            <button onClick={() => { setPreviewFile(null); setPreviewContent(null); }} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <span style={{ flex: 1, fontSize: '13px', color: 'var(--color-text)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{previewFile.name}</span>
            <span style={{ fontSize: '10px', color: 'var(--color-accent)', background: 'var(--color-accent-soft)', padding: '2px 8px', borderRadius: '999px', fontFamily: 'var(--font-mono)' }}>
              {previewFile.name.split('.').pop()}
            </span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {previewLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', color: 'var(--color-text-dim)', fontSize: '12px' }}>Carregando...</div>
            ) : (
              <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '12px', lineHeight: 1.7, color: 'var(--color-text)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: 'var(--color-bg-alt)', borderRadius: '12px', padding: '16px', border: '0.5px solid var(--color-border)' }}>
                {previewContent}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
