import { Router, Request, Response } from 'express';
import { validatePin, requireAuth } from '../middleware/auth.js';
import { startTunnel, getTunnelUrl, isTunnelRunning } from '../services/tunnel.js';

export function createAuthRouter(): Router {
  const router = Router();

  // POST /api/auth/login  — body: { pin: string }
  router.post('/login', (req: Request, res: Response) => {
    const { pin } = req.body as { pin: string };
    const ip = req.ip || '0.0.0.0';

    if (!pin) {
      res.status(400).json({ error: 'PIN obrigatório' });
      return;
    }

    const token = validatePin(pin, ip);
    if (!token) {
      res.status(401).json({ error: 'PIN incorreto ou IP bloqueado' });
      return;
    }

    res.json({ token });
  });

  // GET /api/auth/validate — valida se o token ainda é válido
  router.get('/validate', requireAuth, (_req, res) => {
    res.json({ valid: true });
  });

  router.get('/tunnel', requireAuth, (_req, res) => {
    res.json({
      running: isTunnelRunning(),
      url: getTunnelUrl()
    });
  });

  router.post('/tunnel/start', requireAuth, (_req, res) => {
    startTunnel();
    res.json({ success: true });
  });

  return router;
}
