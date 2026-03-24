import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getAllSessions,
  getActiveSession,
  setActiveSession,
  deleteSession,
  searchMessages,
  createSession,
} from '../services/history.js';

export function createHistoryRouter(): Router {
  const router = Router();
  router.use(requireAuth);

  // GET /api/history/sessions — lista todas as sessões
  router.get('/sessions', (_req, res) => {
    const sessions = getAllSessions().map((s) => ({
      id: s.id,
      title: s.title,
      startedAt: s.startedAt,
      updatedAt: s.updatedAt,
      messageCount: s.messages.length,
      model: s.model,
      workspacePath: s.workspacePath,
    }));
    res.json({ sessions, activeId: getActiveSession()?.id || null });
  });

  // GET /api/history/sessions/:id — retorna sessão completa com mensagens
  router.get('/sessions/:id', (req, res) => {
    const sessions = getAllSessions();
    const session = sessions.find((s) => s.id === req.params.id);
    if (!session) { res.status(404).json({ error: 'Sessão não encontrada' }); return; }
    res.json(session);
  });

  // POST /api/history/sessions/:id/activate — define sessão como ativa
  router.post('/sessions/:id/activate', (req, res) => {
    const ok = setActiveSession(req.params.id);
    res.json({ success: ok });
  });

  // DELETE /api/history/sessions/:id
  router.delete('/sessions/:id', (req, res) => {
    deleteSession(req.params.id);
    res.json({ success: true });
  });

  // POST /api/history/sessions — cria nova sessão
  router.post('/sessions', (_req, res) => {
    const session = createSession();
    res.json(session);
  });

  // GET /api/history/search?q= — busca em todas as sessões
  router.get('/search', (req, res) => {
    const q = req.query.q as string;
    if (!q?.trim()) { res.json({ results: [] }); return; }
    const results = searchMessages(q);
    res.json({
      results: results.map((r) => ({
        sessionId: r.session.id,
        sessionTitle: r.session.title,
        message: r.message,
      })),
    });
  });

  return router;
}
