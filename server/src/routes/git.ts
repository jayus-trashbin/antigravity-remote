import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as git from '../services/git.js';

export function createGitRouter(): Router {
  const router = Router();
  router.use(requireAuth);

  router.get('/status', async (_req, res) => {
    try {
      res.json(await git.getStatus());
    } catch (err) { res.status(500).json({ error: (err as Error).message }); }
  });

  router.get('/diff', async (req, res) => {
    try {
      const file = req.query.file as string | undefined;
      res.json({ diff: await git.getDiff(file) });
    } catch (err) { res.status(500).json({ error: (err as Error).message }); }
  });

  router.post('/stage', async (req, res) => {
    const { file, all } = req.body as { file?: string; all?: boolean };
    try {
      if (all) await git.stageAll();
      else if (file) await git.stageFile(file);
      else { res.status(400).json({ error: 'file ou all obrigatório' }); return; }
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: (err as Error).message }); }
  });

  router.post('/unstage', async (req, res) => {
    const { file } = req.body as { file: string };
    try {
      if (!file) { res.status(400).json({ error: 'file obrigatório' }); return; }
      await git.unstageFile(file);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: (err as Error).message }); }
  });

  router.post('/discard', async (req, res) => {
    const { file } = req.body as { file: string };
    try {
      if (!file) { res.status(400).json({ error: 'file obrigatório' }); return; }
      await git.discardFile(file);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: (err as Error).message }); }
  });

  router.post('/commit', async (req, res) => {
    const { message } = req.body as { message: string };
    try {
      if (!message) { res.status(400).json({ error: 'message obrigatório' }); return; }
      await git.commit(message);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: (err as Error).message }); }
  });

  router.post('/push', async (_req, res) => {
    try {
      await git.push();
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: (err as Error).message }); }
  });

  router.post('/pull', async (_req, res) => {
    try {
      await git.pull();
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: (err as Error).message }); }
  });

  router.get('/branch', async (_req, res) => {
    try {
      res.json({ branch: await git.getBranch() });
    } catch (err) { res.status(500).json({ error: (err as Error).message }); }
  });

  router.get('/log', async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 10;
    try {
      res.json(await git.getCommitLog(limit));
    } catch (err) { res.status(500).json({ error: (err as Error).message }); }
  });

  return router;
}
