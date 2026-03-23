import { useRef, useEffect } from 'preact/hooks';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function ChatPanel({ messages, status }: { messages: Message[], status: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={scrollRef} class="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
      {messages.map((msg) => (
        <div key={msg.id} class={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div class={`max-w-[85%] p-4 rounded-2xl ${
            msg.role === 'user' 
              ? 'bg-accent text-white rounded-br-none' 
              : 'bg-bg-alt border border-border text-text rounded-bl-none'
          }`}>
            <pre class="whitespace-pre-wrap font-sans text-sm leading-relaxed">{msg.content}</pre>
          </div>
        </div>
      ))}
      
      {status === 'thinking' && (
        <div class="flex justify-start">
          <div class="bg-bg-alt border border-border p-4 rounded-2xl rounded-bl-none flex items-center gap-2">
            <div class="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" />
            <div class="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:0.2s]" />
            <div class="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
        </div>
      )}
    </div>
  );
}
