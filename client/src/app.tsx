import { useEffect, useState } from 'preact/hooks';
import { useWebSocket } from './hooks/useWebSocket';
import { useApi } from './hooks/useApi';
import { ChatPanel } from './components/ChatPanel';
import { VoiceInput } from './components/VoiceInput';
import { ApprovalBanner } from './components/ApprovalBanner';
import { PromptImprove } from './components/PromptImprove';
import { SettingsPanel } from './components/SettingsPanel';
import { FilePanel } from './components/FilePanel';
import { GitPanel } from './components/GitPanel';
import { QRConnect } from './components/QRConnect';
import { MessageSquare, Settings, FileCode, GitBranch } from 'lucide-preact';

export function App() {
  const [token, setToken] = useState(localStorage.getItem('session-token'));
  const [pin, setPin] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const { data: wsData, status: wsStatus } = useWebSocket(`wss://${window.location.host}/ws`);
  const { request, loading } = useApi();
  const [chatData, setChatData] = useState<any>(null);

  useEffect(() => {
    if (wsData?.type === 'chat:update') {
      setChatData(wsData.data);
    }
  }, [wsData]);

  const handleLogin = async () => {
    try {
      const { token } = await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ pin })
      });
      localStorage.setItem('session-token', token);
      setToken(token);
    } catch (e) {
      alert('PIN incorreto');
    }
  };

  const sendPrompt = async (prompt: string) => {
    await request('/api/chat/prompt', {
      method: 'POST',
      body: JSON.stringify({ prompt })
    });
  };

  const approve = () => request('/api/chat/approve', { method: 'POST' });
  const reject = () => request('/api/chat/reject', { method: 'POST' });

  if (!token) {
    return (
      <div class="min-h-screen flex flex-col items-center justify-center p-6">
        <h1 class="font-serif text-5xl mb-2 text-accent italic">Antigravity</h1>
        <p class="text-text-muted mb-12">Remote Control Panel</p>
        
        <div class="w-full max-w-xs space-y-4">
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            value={pin}
            onInput={(e) => setPin((e.target as HTMLInputElement).value)}
            placeholder="Senha PIN (4 dígitos)"
            class="w-full glass p-4 text-center text-2xl tracking-widest rounded-2xl outline-none focus:border-accent"
          />
          <button 
            onClick={handleLogin}
            disabled={loading}
            class="w-full bg-accent text-white font-bold py-4 rounded-2xl active:scale-95 transition-all shadow-lg shadow-accent/20"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </div>
        
        <div class="mt-12 text-xs text-text-muted flex items-center gap-2">
          <div class={`w-2 h-2 rounded-full ${wsStatus === 'open' ? 'bg-green-500' : 'bg-red-500'}`} />
          {wsStatus === 'open' ? 'Conectado ao servidor' : 'Tentando conectar ao servidor...'}
        </div>
      </div>
    );
  }

  return (
    <div class="h-screen flex flex-col bg-bg">
      <ApprovalBanner 
        pending={chatData?.pendingApproval} 
        onApprove={approve}
        onReject={reject}
      />

      {/* Header */}
      <div class="p-4 border-b border-border flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span class="text-xs font-bold tracking-widest uppercase text-text-muted">
            {chatData?.activeModel || 'IDE Online'}
          </span>
        </div>
        <div class="font-serif text-xl italic text-accent">Antigravity</div>
      </div>

      {/* Content */}
      <main class="flex-1 relative overflow-hidden flex flex-col">
        {activeTab === 'chat' && (
          <>
            <ChatPanel messages={chatData?.messages || []} status={chatData?.status || 'idle'} />
            <VoiceInput onSend={sendPrompt} />
          </>
        )}
        {activeTab === 'files' && <FilePanel />}
        {activeTab === 'git' && <GitPanel />}
        {activeTab === 'settings' && <SettingsPanel />}
      </main>

      {/* Tab Bar */}
      <nav class="flex border-t border-border bg-bg/50 backdrop-blur-md safe-bottom">
        <button 
          onClick={() => setActiveTab('chat')}
          class={`flex-1 p-4 flex flex-col items-center gap-1 ${activeTab === 'chat' ? 'text-accent' : 'text-text-muted'}`}
        >
          <MessageSquare size={20} />
          <span class="text-[10px] font-bold uppercase tracking-tighter">Chat</span>
        </button>
        <button 
          onClick={() => setActiveTab('files')}
          class={`flex-1 p-4 flex flex-col items-center gap-1 ${activeTab === 'files' ? 'text-accent' : 'text-text-muted'}`}
        >
          <FileCode size={20} />
          <span class="text-[10px] font-bold uppercase tracking-tighter">Arquivos</span>
        </button>
        <button 
          onClick={() => setActiveTab('git')}
          class={`flex-1 p-4 flex flex-col items-center gap-1 ${activeTab === 'git' ? 'text-accent' : 'text-text-muted'}`}
        >
          <GitBranch size={20} />
          <span class="text-[10px] font-bold uppercase tracking-tighter">Git</span>
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          class={`flex-1 p-4 flex flex-col items-center gap-1 ${activeTab === 'settings' ? 'text-accent' : 'text-text-muted'}`}
        >
          <Settings size={20} />
          <span class="text-[10px] font-bold uppercase tracking-tighter">Config</span>
        </button>
      </nav>
    </div>
  );
}
