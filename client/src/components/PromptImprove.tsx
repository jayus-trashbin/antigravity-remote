import { Sparkles, ArrowRight, Loader2 } from 'lucide-preact';
import { useState } from 'preact/hooks';
import { useApi } from '../hooks/useApi';

export function PromptImprove({ currentPrompt, onSelect }: { 
  currentPrompt: string, 
  onSelect: (improved: string) => void 
}) {
  const { request, loading } = useApi();
  const [suggestion, setSuggestion] = useState('');

  const handleImprove = async () => {
    if (!currentPrompt.trim()) return;
    try {
      const { improved } = await request('/api/improve', {
        method: 'POST',
        body: JSON.stringify({ prompt: currentPrompt, mode: 'detailed' })
      });
      setSuggestion(improved);
    } catch (e) {
      alert('Erro ao melhorar prompt: ' + e);
    }
  };

  if (!currentPrompt.trim()) return null;

  return (
    <div class="p-4">
      {!suggestion ? (
        <button 
          onClick={handleImprove}
          disabled={loading}
          class="w-full glass p-4 rounded-2xl flex items-center justify-between text-accent hover:bg-accent/10 transition-colors group border-accent/20"
        >
          <div class="flex items-center gap-3">
            {loading ? <Loader2 size={20} class="animate-spin" /> : <Sparkles size={20} />}
            <span class="text-sm font-medium">Melhorar prompt com IA</span>
          </div>
          <ArrowRight size={18} class="group-hover:translate-x-1 transition-transform" />
        </button>
      ) : (
        <div class="glass p-4 rounded-2xl border-accent/30 bg-accent/5 animate-in fade-in zoom-in duration-300">
          <div class="flex items-center gap-2 text-accent mb-3 text-xs font-bold uppercase">
            <Sparkles size={14} /> Sugestão de Melhoria
          </div>
          <p class="text-sm text-text leading-relaxed mb-4 italic">"{suggestion}"</p>
          <div class="flex gap-2">
            <button 
              onClick={() => onSelect(suggestion)}
              class="flex-1 bg-accent text-white text-xs font-bold py-2 rounded-lg"
            >
              Usar sugestão
            </button>
            <button 
              onClick={() => setSuggestion('')}
              class="px-4 bg-bg-alt text-text-muted text-xs font-bold py-2 rounded-lg border border-border"
            >
              Descartar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
