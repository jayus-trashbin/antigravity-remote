import { useState, useEffect } from 'preact/hooks';
import { useApi } from '../hooks/useApi';
import { GitBranch, GitCommit, GitPullRequest, ArrowUp, ArrowDown, Plus, Check } from 'lucide-preact';

export function GitPanel() {
  const { request, loading } = useApi();
  const [status, setStatus] = useState<any>(null);
  const [branch, setBranch] = useState('');
  const [commitMsg, setCommitMsg] = useState('');

  const refresh = async () => {
    try {
      const [s, b] = await Promise.all([
        request('/api/git/status'),
        request('/api/git/branch')
      ]);
      setStatus(s);
      setBranch(b.branch);
    } catch (e) {
      console.error('Erro ao carregar Git');
    }
  };

  useEffect(() => { refresh(); }, []);

  const handleStageAll = async () => {
    await request('/api/git/stage', { method: 'POST', body: JSON.stringify({ all: true }) });
    refresh();
  };

  const handleCommit = async () => {
    if (!commitMsg) return;
    await request('/api/git/commit', { method: 'POST', body: JSON.stringify({ message: commitMsg }) });
    setCommitMsg('');
    refresh();
  };

  const handlePush = async () => {
    await request('/api/git/push', { method: 'POST' });
    refresh();
  };

  return (
    <div class="flex-1 flex flex-col overflow-hidden bg-bg">
      <div class="p-6 space-y-6 overflow-y-auto pb-32">
        <div class="flex items-center justify-between">
          <h2 class="font-serif text-3xl italic">Git Control</h2>
          <div class="px-3 py-1 bg-accent/10 border border-accent/20 rounded-full flex items-center gap-2">
            <GitBranch size={14} class="text-accent" />
            <span class="text-[10px] font-bold text-accent uppercase tracking-widest">{branch || '...'}</span>
          </div>
        </div>

        {/* Sync Actions */}
        <div class="flex gap-2">
          <button onClick={() => request('/api/git/pull', { method: 'POST' })} class="flex-1 glass p-4 rounded-2xl flex flex-col items-center gap-2 active:scale-95 transition-all">
            <ArrowDown size={20} class="text-blue-400" />
            <span class="text-[10px] font-bold uppercase">Pull</span>
          </button>
          <button onClick={handlePush} class="flex-1 glass p-4 rounded-2xl flex flex-col items-center gap-2 active:scale-95 transition-all">
            <ArrowUp size={20} class="text-green-400" />
            <span class="text-[10px] font-bold uppercase">Push</span>
          </button>
        </div>

        {/* Changes */}
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="text-xs font-bold uppercase tracking-widest text-text-muted">Alterações ({status?.files?.length || 0})</div>
            {status?.files?.length > 0 && (
              <button onClick={handleStageAll} class="text-[10px] font-bold text-accent uppercase">Stage All</button>
            )}
          </div>

          <div class="space-y-2">
            {status?.files?.map((f: any) => (
              <div key={f.path} class="glass p-3 rounded-xl flex items-center justify-between">
                <div class="flex items-center gap-3 overflow-hidden">
                  <div class={`w-1.5 h-1.5 rounded-full ${f.index === '?' ? 'bg-text3' : 'bg-amber-500'}`} />
                  <span class="text-xs font-mono truncate text-text-muted">{f.path}</span>
                </div>
                <div class="text-[10px] font-bold text-text3 bg-bg3 px-2 py-0.5 rounded uppercase">{f.working_dir || 'M'}</div>
              </div>
            ))}
            {status?.files?.length === 0 && (
              <div class="py-8 text-center text-text3 text-xs italic">Nada para commitar</div>
            )}
          </div>
        </div>

        {/* Commit Box */}
        {status?.staged?.length > 0 && (
          <div class="glass p-4 rounded-2xl border-accent/20 bg-accent/5 space-y-4">
             <div class="text-[10px] font-bold text-accent uppercase tracking-widest">Novo Commit</div>
             <textarea 
               value={commitMsg}
               onInput={(e) => setCommitMsg((e.target as HTMLTextAreaElement).value)}
               placeholder="Mensagem do commit..."
               class="w-full bg-bg border border-border rounded-xl p-3 text-sm focus:border-accent outline-none resize-none"
               rows={2}
             />
             <button 
               onClick={handleCommit}
               class="w-full bg-accent text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
             >
               <GitCommit size={18} /> Confirmar Commit
             </button>
          </div>
        )}
      </div>
    </div>
  );
}
