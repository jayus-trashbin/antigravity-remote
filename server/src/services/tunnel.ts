import { spawn, ChildProcess } from 'child_process';
import { config } from '../config.js';

let tunnelProcess: ChildProcess | null = null;
let tunnelUrl: string | null = null;
let onUrlCallback: ((url: string) => void) | null = null;

export function startTunnel(onUrl?: (url: string) => void): void {
  if (tunnelProcess) return;
  if (onUrl) onUrlCallback = onUrl;

  tunnelProcess = spawn('cloudflared', ['tunnel', '--url', `https://localhost:${config.port}`], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const handleOutput = (data: Buffer) => {
    const line = data.toString();
    const match = line.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
    if (match) {
      tunnelUrl = match[0];
      console.log('[tunnel] URL pública:', tunnelUrl);
      onUrlCallback?.(tunnelUrl);
    }
  };

  tunnelProcess.stdout?.on('data', handleOutput);
  tunnelProcess.stderr?.on('data', handleOutput);

  tunnelProcess.on('exit', () => {
    tunnelProcess = null;
    tunnelUrl = null;
    console.log('[tunnel] Processo encerrado.');
  });
}

export function stopTunnel(): void {
  tunnelProcess?.kill();
  tunnelProcess = null;
  tunnelUrl = null;
}

export function getTunnelUrl(): string | null {
  return tunnelUrl;
}

export function isTunnelRunning(): boolean {
  return tunnelProcess !== null;
}
