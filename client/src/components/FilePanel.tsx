import { useState, useEffect } from 'preact/hooks';
import { useApi } from '../hooks/useApi';
import { Folder, File, ChevronRight, Upload, HardDrive, RefreshCw } from 'lucide-preact';

export function FilePanel() {
  const { request, loading } = useApi();
  const [currentPath, setCurrentPath] = useState('');
  const [entries, setEntries] = useState<any[]>([]);

  const loadFiles = async (path = '') => {
    try {
      const data = await request(`/api/files/list?path=${encodeURIComponent(path)}`);
      setEntries(data.entries.sort((a: any, b: any) => (b.isDir ? 1 : 0) - (a.isDir ? 1 : 0) || a.name.localeCompare(b.name)));
      setCurrentPath(path);
    } catch (e) {
      alert('Erro ao listar arquivos');
    }
  };

  useEffect(() => { loadFiles(); }, []);

  const navigate = (name: string) => {
    const newPath = currentPath ? `${currentPath}/${name}` : name;
    loadFiles(newPath);
  };

  const goBack = () => {
    const parts = currentPath.split('/');
    parts.pop();
    loadFiles(parts.join('/'));
  };

  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await fetch('/api/files/upload', {
        method: 'POST',
        headers: { 'x-session-token': localStorage.getItem('session-token') || '' },
        body: formData
      });
      alert('Arquivo enviado e injetado no chat!');
    } catch (e) {
      alert('Erro no upload');
    }
  };

  return (
    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="p-4 border-b border-border bg-bg-alt/50 flex items-center justify-between">
        <div class="flex items-center gap-2 overflow-hidden">
          <HardDrive size={16} class="text-text-muted shrink-0" />
          <div class="text-xs font-mono truncate text-text-muted">
            {currentPath || './'}
          </div>
        </div>
        <div class="flex gap-2">
          <button onClick={() => loadFiles(currentPath)} class="p-2 text-text-muted"><RefreshCw size={16} /></button>
          <label class="p-2 text-accent cursor-pointer">
            <Upload size={16} />
            <input type="file" class="hidden" onChange={handleUpload} />
          </label>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-2">
        {currentPath && (
          <button 
            onClick={goBack}
            class="w-full p-3 flex items-center gap-3 text-text-muted hover:bg-bg-alt rounded-xl transition-colors"
          >
            <ChevronRight size={18} class="rotate-180" />
            <span class="text-sm font-bold">..</span>
          </button>
        )}

        {entries.map((item) => (
          <button
            key={item.name}
            onClick={() => item.isDir && navigate(item.name)}
            class="w-full p-3 flex items-center gap-3 hover:bg-bg-alt rounded-xl transition-colors group"
          >
            {item.isDir ? (
              <Folder size={20} class="text-accent fill-accent/10" />
            ) : (
              <File size={20} class="text-text-muted" />
            )}
            <div class="flex-1 text-left">
              <div class={`text-sm ${item.isDir ? 'font-bold text-text' : 'text-text-muted'}`}>
                {item.name}
              </div>
              {!item.isDir && (
                <div class="text-[10px] text-text3">
                  {(item.size / 1024).toFixed(1)} KB
                </div>
              )}
            </div>
            {item.isDir && <ChevronRight size={14} class="text-text3 group-hover:translate-x-1 transition-transform" />}
          </button>
        ))}

        {!loading && entries.length === 0 && (
          <div class="flex flex-col items-center justify-center py-20 text-text3">
            <Folder size={48} class="mb-4 opacity-20" />
            <p class="text-sm">Pasta vazia</p>
          </div>
        )}
      </div>
    </div>
  );
}
