import { mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { sendPromptToAntigravity } from '../cdp/actions.js';

export const UPLOAD_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../../data/uploads'
);

export function ensureUploadDir(): void {
  if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function injectUploadedFile(
  originalName: string,
  savedPath: string
): Promise<boolean> {
  const message = `[Arquivo enviado pelo mobile: ${originalName}]\nCaminho: ${savedPath}`;
  return sendPromptToAntigravity(message);
}
