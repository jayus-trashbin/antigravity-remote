import dotenv from 'dotenv';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../../.env') });

const DATA_FILE = join(dirname(fileURLToPath(import.meta.url)), '../../data/config.json');

interface AppConfig {
  port: number;
  cdpPort: number;
  pin: string;
  autoAccept: boolean;
  improveModel: string;
  improveMode: 'detailed' | 'concise' | 'technical' | 'creative';
  telegramBotToken: string;
  telegramChatId: string;
  tunnelEnabled: boolean;
}

function loadConfig(): AppConfig {
  const defaults: AppConfig = {
    port: Number(process.env.PORT) || 3333,
    cdpPort: Number(process.env.CDP_PORT) || 9222,
    pin: process.env.MOBILE_PIN || '1234',
    autoAccept: false,
    improveModel: process.env.IMPROVE_MODEL || 'claude-haiku-4-5-20251001',
    improveMode: 'detailed',
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
    telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
    tunnelEnabled: false,
  };

  if (!existsSync(DATA_FILE)) return defaults;

  try {
    const saved = JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
    return { ...defaults, ...saved };
  } catch {
    return defaults;
  }
}

export async function saveConfig(partial: Partial<AppConfig>) {
  const current = loadConfig();
  const updated = { ...current, ...partial };
  const dir = join(dirname(DATA_FILE));
  if (!existsSync(dir)) {
    const { mkdirSync } = await import('fs');
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2));
}

export const config = loadConfig();
export const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
