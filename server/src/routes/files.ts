import { Router } from 'express';
import multer from 'multer';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { requireAuth } from '../middleware/auth.js';
import { UPLOAD_DIR, ensureUploadDir, injectUploadedFile } from '../services/uploads.js';
import { getWorkspacePath } from '../services/git.js';

const upload = multer({ dest: UPLOAD_DIR });

export function createFilesRouter(): Router {
  const router = Router();
  ensureUploadDir();

  router.get('/list', requireAuth, (req, res) => {
    const subPath = (req.query.path as string) || '';
    const fullPath = join(getWorkspacePath(), subPath);
    try {
      const entries = readdirSync(fullPath).map((name) => {
        const stat = statSync(join(fullPath, name));
        return { name, isDir: stat.isDirectory(), size: stat.size, modified: stat.mtimeMs };
      });
      res.json({ path: subPath, entries });
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  router.post('/upload', requireAuth, upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });

    const success = await injectUploadedFile(req.file.originalname, req.file.path);
    res.json({
      success,
      file: {
        originalName: req.file.originalname,
        size: req.file.size,
        path: req.file.path,
      },
    });
  });

  return router;
}
