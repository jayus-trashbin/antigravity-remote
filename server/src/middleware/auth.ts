import { Request, Response, NextFunction } from 'express';
import { createHash, randomBytes } from 'crypto';
import { config } from '../config.js';

const sessions = new Map<string, number>();
const loginAttempts = new Map<string, { count: number; lockUntil: number }>();

export function generateToken(): string {
  return randomBytes(32).toString('hex');
}

export function createSession(token: string): void {
  const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 dias
  sessions.set(token, expiry);
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
    sessions.delete(token);
    res.status(401).json({ error: 'Token inválido ou expirado' });
    return;
  }

  next();
}
