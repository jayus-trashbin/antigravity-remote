import { WebSocketServer, WebSocket } from 'ws';
import { getChatSnapshot, ChatSnapshot } from '../cdp/chat.js';
import { approveAction, isAutoAcceptEnabled } from '../cdp/actions.js';

const clients = new Set<WebSocket>();
let lastSnapshot: string = '';
let pollingInterval: NodeJS.Timeout | null = null;

export function registerWSClient(ws: WebSocket): void {
  clients.add(ws);
  ws.on('close', () => clients.delete(ws));
}

export function broadcastToAll(type: string, data: unknown): void {
  const msg = JSON.stringify({ type, data, ts: Date.now() });
  clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) ws.send(msg);
  });
}

export function startChatPolling(): void {
  if (pollingInterval) return;

  pollingInterval = setInterval(async () => {
    const snapshot = await getChatSnapshot();
    if (!snapshot) return;

    if (isAutoAcceptEnabled() && snapshot.pendingApproval) {
      await approveAction();
    }

    const serialized = JSON.stringify(snapshot);
    if (serialized !== lastSnapshot) {
      lastSnapshot = serialized;
      broadcastToAll('chat:update', snapshot);
    }
  }, 800);

  console.log('[stream] Polling iniciado (800ms).');
}

export function stopChatPolling(): void {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}
