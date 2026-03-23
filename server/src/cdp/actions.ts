import { getOrReconnect } from './core.js';

// Injeta texto no input do chat do Antigravity e submete
export async function sendPromptToAntigravity(text: string): Promise<boolean> {
  const client = await getOrReconnect();
  if (!client) return false;

  try {
    await client.Runtime.evaluate({
      expression: `
        (function() {
          const input = document.querySelector('[data-testid="chat-input"], textarea[placeholder], .chat-input');
          if (!input) return false;
          const nativeInput = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value');
          if (nativeInput && nativeInput.set) {
            nativeInput.set.call(input, ${JSON.stringify(text)});
          } else {
            input.value = ${JSON.stringify(text)};
          }
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          const btn = document.querySelector('[data-testid="send-button"], button[type="submit"]');
          if (btn) btn.click();
          return true;
        })()
      `,
      returnByValue: true,
    });
    return true;
  } catch (err) {
    console.error('[cdp/actions] sendPrompt error:', (err as Error).message);
    return false;
  }
}

// Detecta se há ação pendente de aprovação
export async function getPendingApproval(): Promise<{ text: string } | null> {
  const client = await getOrReconnect();
  if (!client) return null;

  try {
    const { result } = await client.Runtime.evaluate({
      expression: `
        (function() {
          const approveBtn = document.querySelector('[data-testid="approve-button"], button[aria-label*="approve" i], button[aria-label*="aprovar" i]');
          if (!approveBtn) return null;
          const container = approveBtn.closest('[class*="action"], [class*="approval"], [class*="tool"]');
          const text = container?.textContent?.trim() || approveBtn.textContent?.trim() || 'Ação pendente';
          return { text };
        })()
      `,
      returnByValue: true,
    });
    return (result.value as { text: string } | null);
  } catch {
    return null;
  }
}

// Aprova a ação pendente
export async function approveAction(): Promise<boolean> {
  const client = await getOrReconnect();
  if (!client) return false;

  try {
    await client.Runtime.evaluate({
      expression: `
        (function() {
          const btn = document.querySelector('[data-testid="approve-button"], button[aria-label*="approve" i], button[aria-label*="aprovar" i]');
          if (btn) { btn.click(); return true; }
          return false;
        })()
      `,
    });
    return true;
  } catch {
    return false;
  }
}

// Rejeita a ação pendente
export async function rejectAction(): Promise<boolean> {
  const client = await getOrReconnect();
  if (!client) return false;

  try {
    await client.Runtime.evaluate({
      expression: `
        (function() {
          const btn = document.querySelector('[data-testid*="reject-button"], button[aria-label*="reject" i], button[aria-label*="rejeitar" i], button[aria-label*="cancel" i]');
          if (btn) { btn.click(); return true; }
          return false;
        })()
      `,
    });
    return true;
  } catch {
    return false;
  }
}

// Toggle de auto-accept em memória (o loop de poll em chat-stream.ts usa este valor)
let autoAcceptEnabled = false;

export function setAutoAccept(enabled: boolean): void {
  autoAcceptEnabled = enabled;
}

export function isAutoAcceptEnabled(): boolean {
  return autoAcceptEnabled;
}
