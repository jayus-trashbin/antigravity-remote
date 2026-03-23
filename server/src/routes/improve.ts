import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { improvePrompt } from '../services/improve.ts';

export function createImproveRouter(): Router {
  const router = Router();

  router.post('/', requireAuth, async (req, res) => {
    const { prompt, mode, context } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt vazio' });

    try {
      const result = await improvePrompt({ prompt, mode, context });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  return router;
}
