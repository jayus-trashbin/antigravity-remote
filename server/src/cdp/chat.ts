import { getOrReconnect } from './core.js';
import { getPendingApproval } from './actions.js';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatSnapshot {
  messages: ChatMessage[];
  status: 'idle' | 'thinking' | 'error';
  pendingApproval: { text: string } | null;
  activeModel: string;
}

export async function getChatSnapshot(): Promise<ChatSnapshot | null> {
  const client = await getOrReconnect();
  if (!client) return null;

  try {
    const { result } = await client.Runtime.evaluate({
      expression: `
        (function() {
          const msgs = [];
          const items = document.querySelectorAll('[data-testid*="message"], [class*="message-item"], [class*="chat-message"]');
          items.forEach((el, i) => {
            const isUser = el.querySelector('[data-testid*="user"], [class*="user-message"]') !== null
              || el.getAttribute('data-role') === 'user';
            msgs.push({
              id: 'msg-' + i,
              role: isUser ? 'user' : 'assistant',
              content: el.textContent?.trim() || '',
              timestamp: Date.now(),
            });
          });

          const thinkingEl = document.querySelector('[class*="thinking"], [class*="loading"], [data-testid*="thinking"]');
          const errorEl = document.querySelector('[class*="error-state"], [data-testid*="error"]');
          const status = errorEl ? 'error' : thinkingEl ? 'thinking' : 'idle';

          const modelEl = document.querySelector('[data-testid*="model"], [class*="model-name"], [class*="model-selector"]');
          const activeModel = modelEl?.textContent?.trim() || 'unknown';

          return { messages: msgs, status, activeModel };
        })()
      `,
      returnByValue: true,
    });

    const data = result.value as Omit<ChatSnapshot, 'pendingApproval'>;
    const pendingApproval = await getPendingApproval();

    return { ...data, pendingApproval };
  } catch (err) {
    console.error('[cdp/chat] getChatSnapshot error:', (err as Error).message);
    return null;
  }
}
