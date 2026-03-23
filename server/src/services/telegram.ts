import { config } from '../config.js';

async function sendMessage(text: string): Promise<void> {
  if (!config.telegramBotToken || !config.telegramChatId) return;

  const url = `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: config.telegramChatId,
      text,
      parse_mode: 'Markdown',
    }),
  }).catch((err) => {
    console.error('[telegram] Erro ao enviar:', (err as Error).message);
  });
}

export async function notifyTaskComplete(summary: string): Promise<void> {
  await sendMessage(`✅ *Tarefa concluída*\n${summary}`);
}

export async function notifyNeedsInput(action: string): Promise<void> {
  await sendMessage(`⏸ *Aguardando aprovação*\n\`${action}\``);
}

export async function notifyError(error: string): Promise<void> {
  await sendMessage(`❌ *Erro detectado*\n${error}`);
}
