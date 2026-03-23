import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as git from '../services/git.js';

export function createGitRouter(): Router {
  const router = Router();

  router.get('/status', requireAuth, async (_req, res) => {
    try {
      const status = await git.getStatus();
      res.json(status);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  router.get('/diff', requireAuth, async (req, res) => {
    const file = req.query.file as string | undefined;
    res.json({ diff: await git.getDiff(file) });
  });

  router.post('/stage', requireAuth, async (req, res) => {
    const { file, all } = req.body as { file?: string; all?: boolean };
    if (all) await git.stageAll();
    else if (file) await git.stageFile(file);
    else { res.status(400).json({ error: 'file ou all obrigatório' }); return; }
    res.json({ success: true });
  });

  router.post('/commit', requireAuth, async (req, res) => {
    const { message } = req.body as { message: string };
    if (!message) { res.status(400).json({ error: 'message obrigatório' }); return; }
    await git.commit(message);
    res.json({ success: true });
  });

  router.post('/push', requireAuth, async (_req, res) => {
    await git.push();
    res.json({ success: true });
  });

  router.post('/pull', requireAuth, async (_req, res) => {
    await git.pull();
    res.json({ success: true });
  });

  router.get('/branch', requireAuth, async (_req, res) => {
    try {
      const branch = await git.getBranch();
      res.json({ branch });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  return router;
}
