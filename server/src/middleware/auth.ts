import { Request, Response, NextFunction } from 'express';
import { createHash, randomBytes } from 'crypto';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config.js';

const SESSION_FILE = join(dirname(fileURLToPath(import.meta.url)), '../../../data/sessions.json');
let sessions = new Map<string, number>();
const loginAttempts = new Map<string, { count: number; lockUntil: number }>();

function saveSessions() {
  try {
    const obj = Object.fromEntries(sessions);
    writeFileSync(SESSION_FILE, JSON.stringify(obj, null, 2));
  } catch (e) {
    console.error('[auth] Erro ao salvar sessões:', e);
  }
}

function loadSessions() {
  if (!existsSync(SESSION_FILE)) return;
  try {
    const obj = JSON.parse(readFileSync(SESSION_FILE, 'utf-8'));
    sessions = new Map(Object.entries(obj));
    // Limpar expirados
    const now = Date.now();
    for (const [token, expiry] of sessions) {
      if ((expiry as number) < now) sessions.delete(token);
    }
  } catch (e) {
    console.error('[auth] Erro ao carregar sessões:', e);
  }
}

loadSessions();

export function generateToken(): string {
  return randomBytes(32).toString('hex');
}

export function createSession(token: string): void {
  const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 dias
  sessions.set(token, expiry);
  saveSessions();
}

export function validatePin(pin: string, ip: string): string | null {
  const now = Date.now();
  const attempts = loginAttempts.get(ip) || { count: 0, lockUntil: 0 };

  if (attempts.lockUntil > now) {
    return null; // IP bloqueado
  }

  const hashedInput = createHash('sha256').update(pin).digest('hex');
  const hashedConfig = createHash('sha256').update(config.pin).digest('hex');

  if (hashedInput !== hashedConfig) {
    attempts.count += 1;
    if (attempts.count >= 5) {
      attempts.lockUntil = now + 15 * 60 * 1000; // 15 min
    }
    loginAttempts.set(ip, attempts);
    return null;
  }

  loginAttempts.delete(ip);
  const token = generateToken();
  createSession(token);
  console.log(`[auth] Login bem-sucedido para IP: ${ip}, token gerado: ${token.substring(0, 8)}...`);
  return token;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers['x-session-token'] as string || req.query.token as string;

  if (!token) {
    res.status(401).json({ error: 'Token ausente' });
    return;
  }

  const expiry = sessions.get(token);
  if (!expiry || expiry < Date.now()) {
    console.log(`[auth] Token inválido ou expirado: ${token.substring(0, 8)}...`);
    sessions.delete(token);
    saveSessions();
    res.status(401).json({ error: 'Token inválido ou expirado' });
    return;
  }

  console.log(`[auth] Token validado: ${token.substring(0, 8)}...`);
  next();
}
