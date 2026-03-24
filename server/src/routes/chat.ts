import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { sendPromptToAntigravity, approveAction, rejectAction, setAutoAccept, isAutoAcceptEnabled } from '../cdp/actions.js';
import { getChatSnapshot, setActiveModel } from '../cdp/chat.js';

export function createChatRouter(): Router {
  const router = Router();

  // Enviar prompt
  router.post('/prompt', requireAuth, async (req, res) => {
    const { prompt } = req.body as { prompt: string };
    if (!prompt) return res.status(400).json({ error: 'Prompt vazio' });

    const success = await sendPromptToAntigravity(prompt);
    res.json({ success });
  });

  // Snapshot do chat
  router.get('/snapshot', requireAuth, async (_req, res) => {
    const snapshot = await getChatSnapshot();
    if (!snapshot) return res.status(503).json({ error: 'CDP não conectado' });
    res.json(snapshot);
  });

  // Mudar modelo
  router.post('/model', requireAuth, async (req, res) => {
    const { model } = req.body as { model: string };
    if (!model) return res.status(400).json({ error: 'Modelo não especificado' });

    const success = await setActiveModel(model);
    res.json({ success });
  });

  // Aprovar ação
  router.post('/approve', requireAuth, async (_req, res) => {
    const success = await approveAction();
    res.json({ success });
  });

  // Rejeitar ação
  router.post('/reject', requireAuth, async (_req, res) => {
    const success = await rejectAction();
    res.json({ success });
  });

  // Auto-accept config
  router.get('/auto-accept', requireAuth, (_req, res) => {
    res.json({ enabled: isAutoAcceptEnabled() });
  });

  router.post('/auto-accept', requireAuth, (req, res) => {
    const { enabled } = req.body as { enabled: boolean };
    setAutoAccept(enabled);
    res.json({ success: true, enabled: isAutoAcceptEnabled() });
  });

  return router;
}
