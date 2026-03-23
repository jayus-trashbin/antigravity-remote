import { Mic, Send, X } from 'lucide-preact';
import { useState, useEffect } from 'preact/hooks';
import { useVoice } from '../hooks/useVoice';

export function VoiceInput({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState('');
  const { isListening, transcript, toggle, supported } = useVoice();

  useEffect(() => {
    if (transcript) setText(transcript);
  }, [transcript]);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText('');
  };

  return (
    <div class="fixed bottom-0 left-0 right-0 p-4 bg-bg/80 backdrop-blur-xl border-t border-border safe-bottom">
      <div class="max-w-xl mx-auto flex items-end gap-3">
        <div class="flex-1 relative">
          <textarea
            rows={1}
            value={text}
            onInput={(e) => setText((e.target as HTMLTextAreaElement).value)}
            placeholder={isListening ? "Ouvindo..." : "Escreva ou use a voz..."}
            class="w-full bg-bg-alt border border-border rounded-2xl p-4 pr-12 focus:border-accent outline-none transition-colors resize-none text-sm"
          />
          {text && (
            <button onClick={() => setText('')} class="absolute right-4 bottom-4 text-text-muted">
              <X size={18} />
            </button>
          )}
        </div>
        
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          class={`p-4 rounded-full transition-all ${
            text.trim() ? 'bg-accent text-white' : 'bg-bg-alt text-text-muted'
          }`}
        >
          <Send size={24} />
        </button>

        {supported && (
          <button
            onClick={toggle}
            class={`p-4 rounded-full transition-all ${
              isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-bg-alt text-text-muted'
            }`}
          >
            <Mic size={24} />
          </button>
        )}
      </div>
    </div>
  );
}
