import CDP from 'chrome-remote-interface';
import { config } from '../config.js';

interface CDPTarget {
  id: string;
  title: string;
  url: string;
  client: CDP.Client | null;
}

let targets: CDPTarget[] = [];
let primaryClient: CDP.Client | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;

export async function connectCDP(): Promise<void> {
  try {
    const list = await CDP.List({ port: config.cdpPort }) as any[];
    const antigravityTargets = list.filter(
      (t: any) => t.url?.includes('antigravity') || t.title?.includes('Antigravity')
    );

    if (antigravityTargets.length === 0) {
      console.warn('[cdp] Nenhum target Antigravity encontrado. Tentando em 5s...');
      scheduleReconnect();
      return;
    }

    targets = await Promise.all(
      antigravityTargets.map(async (t: any) => {
        try {
          const client = await CDP({ port: config.cdpPort, target: t.id });
          await client.Runtime.enable();
          await client.DOM.enable();
          return { id: t.id, title: t.title, url: t.url, client };
        } catch {
          return { id: t.id, title: t.title, url: t.url, client: null };
        }
      })
    );

    primaryClient = targets.find((t) => t.client !== null)?.client || null;

    if (primaryClient) {
      console.log(`[cdp] Conectado. ${targets.length} target(s) encontrado(s).`);
      primaryClient.on('disconnect', () => {
        console.warn('[cdp] Desconectado. Reconectando...');
        primaryClient = null;
        scheduleReconnect();
      });
    }
  } catch (err) {
    console.error('[cdp] Erro ao conectar:', (err as Error).message);
    scheduleReconnect();
  }
}

function scheduleReconnect(): void {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    await connectCDP();
  }, 5000);
}

export function getPrimaryClient(): CDP.Client | null {
  return primaryClient;
}

export function getAllTargets(): CDPTarget[] {
  return targets;
}

export async function getOrReconnect(): Promise<CDP.Client | null> {
  if (!primaryClient) await connectCDP();
  return primaryClient;
}
