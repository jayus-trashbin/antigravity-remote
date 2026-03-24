import { WebSocketServer, WebSocket } from 'ws';
import { getChatSnapshot, onNewMessage, enableNetworkInterception } from '../cdp/chat.js';
import { approveAction, isAutoAcceptEnabled } from '../cdp/actions.js';
import { StoredMessage } from './history.js';

const clients = new Set<WebSocket>();
let lastSnapshotHash = '';
let pollingInterval: NodeJS.Timeout | null = null;

export function registerWSClient(ws: WebSocket): void {
  clients.add(ws);
  ws.on('close', () => clients.delete(ws));
}

export function broadcastToAll(type: string, data: unknown): void {
  const msg = JSON.stringify({ type, data, ts: Date.now() });
  for (const ws of clients) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(msg);
    }
  }
}

function hash(obj: unknown): string {
  return JSON.stringify(obj).length.toString() + JSON.stringify(obj).slice(-20);
}

export async function startChatPolling(): Promise<void> {
  if (pollingInterval) return;

  // Habilitar interceptação de rede (melhor que polling)
  await enableNetworkInterception();

  // Broadcast imediato quando nova mensagem chega via interceptação
  onNewMessage((msg: StoredMessage, sessionId: string) => {
    // Ao receber nova mensagem, enviamos o snapshot completo para garantir sincronia
    getChatSnapshot().then(snapshot => {
      if (snapshot) broadcastToAll('chat:update', snapshot);
    });
  });

  // Polling de fallback para status (agente pensando, approval, modelo)
  pollingInterval = setInterval(async () => {
    const snapshot = await getChatSnapshot();
    if (!snapshot) return;

    if (isAutoAcceptEnabled() && snapshot.pendingApproval) {
      await approveAction();
    }

    const h = hash({
      status: snapshot.status,
      pendingApproval: snapshot.pendingApproval,
      msgCount: snapshot.messages.length,
      streamingId: snapshot.streamingMessageId,
    });

    if (h !== lastSnapshotHash) {
      lastSnapshotHash = h;
      broadcastToAll('chat:update', snapshot);
    }
  }, 1200);

  console.log('[stream] Polling de status iniciado (1200ms).');
}

export function stopChatPolling(): void {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}
