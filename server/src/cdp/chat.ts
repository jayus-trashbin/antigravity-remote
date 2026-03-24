import { getOrReconnect } from './core.js';
import { getPendingApproval } from './actions.js';
import {
  getActiveSession,
  createSession,
  appendMessage,
  StoredMessage,
  ChatSession,
} from '../services/history.js';

export interface ChatSnapshot {
  sessionId: string | null;
  messages: StoredMessage[];
  status: 'idle' | 'thinking' | 'error';
  pendingApproval: { text: string } | null;
  activeModel: string;
  streamingMessageId: string | null;
}

let currentStreamingId: string | null = null;
let networkInterceptionEnabled = false;
let onNewMessageCallback: ((msg: StoredMessage, sessionId: string) => void) | null = null;

export function onNewMessage(cb: (msg: StoredMessage, sessionId: string) => void): void {
  onNewMessageCallback = cb;
}

// Intercepta respostas de rede do Antigravity para capturar mensagens da API
export async function enableNetworkInterception(): Promise<void> {
  const client = await getOrReconnect();
  if (!client || networkInterceptionEnabled) return;

  try {
    await client.Network.enable();

    // Escuta respostas de rede que parecem ser do chat
    client.Network.responseReceived(async ({ requestId, response }: any) => {
      const url = response.url || '';
      // Heurística: URLs de API do Antigravity geralmente contêm 'completion', 'message', 'chat'
      if (
        !url.includes('completion') &&
        !url.includes('/message') &&
        !url.includes('/chat') &&
        !url.includes('streaming')
      ) return;

      try {
        const body = await client.Network.getResponseBody({ requestId });
        parseAndStoreResponse(body.body, response.headers?.['content-type'] || '');
      } catch {
        // Alguns responses não têm body disponível — ignorar
      }
    });

    networkInterceptionEnabled = true;
    console.log('[cdp/chat] Interceptação de rede habilitada.');
  } catch (err) {
    console.warn('[cdp/chat] Interceptação de rede falhou (fallback para DOM):', (err as Error).message);
  }
}

function parseAndStoreResponse(body: string, contentType: string): void {
  let session = getActiveSession();
  if (!session) session = createSession();

  // SSE (Server-Sent Events) — streaming
  if (contentType.includes('text/event-stream') || body.startsWith('data:')) {
    const lines = body.split('\n').filter((l) => l.startsWith('data:') && l !== 'data: [DONE]');
    let accumulated = '';
    const msgId = currentStreamingId || `msg-${Date.now()}`;
    currentStreamingId = msgId;

    for (const line of lines) {
      try {
        const json = JSON.parse(line.replace('data: ', ''));
        // Anthropic API format
        const delta = json?.delta?.text || json?.choices?.[0]?.delta?.content || '';
        accumulated += delta;
      } catch { /* linha não é JSON válido */ }
    }

    if (accumulated) {
      const msg: StoredMessage = {
        id: msgId,
        role: 'assistant',
        content: accumulated,
        timestamp: Date.now(),
        status: body.includes('[DONE]') ? 'complete' : 'streaming',
      };
      appendMessage(session.id, msg);
      onNewMessageCallback?.(msg, session.id);
      if (body.includes('[DONE]')) currentStreamingId = null;
    }
    return;
  }

  // JSON regular
  if (contentType.includes('application/json')) {
    try {
      const json = JSON.parse(body);
      // Tentar extrair conteúdo de diferentes formatos de API
      const content =
        json?.content?.[0]?.text ||
        json?.choices?.[0]?.message?.content ||
        json?.message?.content ||
        '';
      if (!content) return;

      const msg: StoredMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content,
        timestamp: Date.now(),
        status: 'complete',
        tokens: json?.usage?.output_tokens || json?.usage?.completion_tokens,
      };
      appendMessage(session.id, msg);
      onNewMessageCallback?.(msg, session.id);
    } catch { /* não é JSON parseable */ }
  }
}

// Fallback: scraping DOM quando a interceptação de rede não capturou
export async function scrapeVisibleMessages(): Promise<StoredMessage[]> {
  const client = await getOrReconnect();
  if (!client) return [];

  try {
    const { result } = await client.Runtime.evaluate({
      expression: `
        (function() {
          const msgs = [];
          const selectors = [
            '[data-testid*="message"]',
            '[class*="message-item"]',
            '[class*="chat-message"]',
            '[class*="MessageItem"]',
          ];
          let items = [];
          for (const sel of selectors) {
            items = Array.from(document.querySelectorAll(sel));
            if (items.length > 0) break;
          }
          items.forEach((el, i) => {
            const isUser =
              el.querySelector('[data-testid*="user"], [class*="user-message"], [class*="HumanMessage"]') !== null ||
              el.getAttribute('data-role') === 'user' ||
              el.className?.includes?.('user') ||
              el.className?.includes?.('human');
            const contentEl = el.querySelector('[class*="content"], [class*="text"], p') || el;
            msgs.push({
              id: 'dom-' + i,
              role: isUser ? 'user' : 'assistant',
              content: contentEl.textContent?.trim() || '',
              timestamp: Date.now() - (items.length - i) * 1000,
              status: 'complete',
            });
          });
          return msgs.filter(m => m.content.length > 0);
        })()
      `,
      returnByValue: true,
    });
    return (result.value as StoredMessage[]) || [];
  } catch {
    return [];
  }
}

export async function getAgentStatus(): Promise<'idle' | 'thinking' | 'error'> {
  const client = await getOrReconnect();
  if (!client) return 'idle';
  try {
    const { result } = await client.Runtime.evaluate({
      expression: `
        (function() {
          const thinking = document.querySelector(
            '[class*="thinking"], [class*="loading"], [data-testid*="thinking"], [class*="Spinner"], [class*="TypingIndicator"]'
          );
          const error = document.querySelector('[class*="error-state"], [data-testid*="error"], [class*="ErrorMessage"]');
          return error ? 'error' : thinking ? 'thinking' : 'idle';
        })()
      `,
      returnByValue: true,
    });
    return (result.value as 'idle' | 'thinking' | 'error') || 'idle';
  } catch {
    return 'idle';
  }
}

export async function getActiveModel(): Promise<string> {
  const client = await getOrReconnect();
  if (!client) return 'unknown';
  try {
    const { result } = await client.Runtime.evaluate({
      expression: `
        (function() {
          const el = document.querySelector(
            '[data-testid*="model"], [class*="model-name"], [class*="ModelSelector"], [class*="model-selector"]'
          );
          return el?.textContent?.trim() || 'unknown';
        })()
      `,
      returnByValue: true,
    });
    return (result.value as string) || 'unknown';
  } catch {
    return 'unknown';
  }
}

export async function setActiveModel(modelName: string): Promise<boolean> {
  const client = await getOrReconnect();
  if (!client) return false;
  try {
    const { result } = await client.Runtime.evaluate({
      expression: `
        (async function() {
          const btn = document.querySelector(
            '[data-testid*="model"], [class*="model-name"], [class*="ModelSelector"], [class*="model-selector"]'
          );
          if (!btn) return false;
          btn.click();
          await new Promise(r => setTimeout(r, 150));
          
          const options = Array.from(document.querySelectorAll('li, option, [role="option"], button, [class*="item"]'));
          const target = options.find(el => el.textContent.toLowerCase().includes('${modelName.toLowerCase()}'));
          if (target) {
            target.click();
            return true;
          }
          // fallback, click btn again to close
          btn.click();
          return false;
        })()
      `,
      awaitPromise: true,
      returnByValue: true,
    });
    return !!result.value;
  } catch {
    return false;
  }
}

export async function getChatSnapshot(): Promise<ChatSnapshot | null> {
  const session = getActiveSession();
  const [status, pendingApproval, activeModel] = await Promise.all([
    getAgentStatus(),
    getPendingApproval(),
    getActiveModel(),
  ]);

  // Se a sessão tem mensagens da interceptação, usa essas
  // Senão, faz fallback para scraping DOM e armazena
  if (!session || session.messages.length === 0) {
    const domMessages = await scrapeVisibleMessages();
    if (domMessages.length > 0) {
      const newSession = createSession(activeModel);
      for (const msg of domMessages) {
        appendMessage(newSession.id, msg);
      }
      return {
        sessionId: newSession.id,
        messages: domMessages,
        status,
        pendingApproval,
        activeModel,
        streamingMessageId: currentStreamingId,
      };
    }
  }

  return {
    sessionId: session?.id || null,
    messages: session?.messages || [],
    status,
    pendingApproval,
    activeModel,
    streamingMessageId: currentStreamingId,
  };
}
