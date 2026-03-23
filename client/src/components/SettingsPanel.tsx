import { useState, useEffect } from 'preact/hooks';
import { useApi } from '../hooks/useApi';
import { LogOut, Shield, Wifi, Bell, Globe } from 'lucide-preact';

export function SettingsPanel() {
  const { request, loading } = useApi();
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    // Carregar config (seria uma rota GET /api/config futuramente)
    request('/api/chat/auto-accept').then(data => setConfig({ autoAccept: data.enabled }));
  }, []);

  const toggleAutoAccept = async () => {
    const newVal = !config.autoAccept;
    await request('/api/chat/auto-accept', {
      method: 'POST',
      body: JSON.stringify({ enabled: newVal })
    });
    setConfig({ ...config, autoAccept: newVal });
  };

  const logout = () => {
    localStorage.removeItem('session-token');
    window.location.reload();
  };

  return (
    <div class="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
      <h2 class="font-serif text-3xl italic">Configurações</h2>
      
      <div class="space-y-4">
        <div class="text-xs font-bold uppercase tracking-widest text-text-muted">Geral</div>
        
        <div class="glass p-4 rounded-2xl flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><Shield size={20} /></div>
            <div>
              <div class="text-sm font-bold text-text">Auto-Aprovação</div>
              <div class="text-[10px] text-text-muted">Aprovar ações automaticamente</div>
            </div>
          </div>
          <button 
            onClick={toggleAutoAccept}
            class={`w-12 h-6 rounded-full transition-colors relative ${config?.autoAccept ? 'bg-accent' : 'bg-bg3'}`}
          >
            <div class={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config?.autoAccept ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        <div class="glass p-4 rounded-2xl flex items-center justify-between opacity-50">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-purple-500/10 text-purple-500 rounded-lg"><Bell size={20} /></div>
            <div>
              <div class="text-sm font-bold text-text">Notificações Telegram</div>
              <div class="text-[10px] text-text-muted">Requer configuração no .env</div>
            </div>
          </div>
          <div class="text-[10px] font-bold text-text-muted px-2 py-1 bg-bg3 rounded">OFF</div>
        </div>

        <div class="glass p-4 rounded-2xl flex items-center justify-between opacity-50">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-green-500/10 text-green-500 rounded-lg"><Globe size={20} /></div>
            <div>
              <div class="text-sm font-bold text-text">Cloudflare Tunnel</div>
              <div class="text-[10px] text-text-muted">Acesso remoto seguro</div>
            </div>
          </div>
          <div class="text-[10px] font-bold text-text-muted px-2 py-1 bg-bg3 rounded">OFF</div>
        </div>
      </div>

      <button 
        onClick={logout}
        class="w-full p-4 glass rounded-2xl flex items-center justify-center gap-2 text-red-400 hover:bg-red-400/10 transition-colors border-red-400/20"
      >
        <LogOut size={18} />
        <span class="text-sm font-bold">Sair desta sessão</span>
      </button>

      <div class="text-center text-[10px] text-text3 font-mono">
        Antigravity Remote v1.0.0
      </div>
    </div>
  );
}
