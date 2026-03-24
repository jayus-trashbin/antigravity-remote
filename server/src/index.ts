import express from 'express';
import { createServer as createHttpsServer } from 'https';
import { createServer as createHttpServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { config } from './config.js';
import { ensureCerts } from './https.js';
import { connectCDP } from './cdp/core.js';
import { startChatPolling, registerWSClient } from './services/chat-stream.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Rotas
import { createAuthRouter } from './routes/auth.js';
import { createChatRouter } from './routes/chat.js';
import { createFilesRouter } from './routes/files.js';
import { createGitRouter } from './routes/git.js';
import { createImproveRouter } from './routes/improve.js';
import { createHistoryRouter } from './routes/history.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const isDev = process.env.NODE_ENV !== 'production';

let server: any;
if (isDev) {
  server = createHttpServer(app);
  console.log('[server] Rodando em modo HTTP (dev)');
} else {
  const certs = ensureCerts();
  server = createHttpsServer({ cert: certs.cert, key: certs.key }, app);
  console.log('[server] Rodando em modo HTTPS (prod)');
}

const wss = new WebSocketServer({ server });

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-session-token'],
}));
app.use(express.json());

// API Routes
app.use('/api/auth', createAuthRouter());
app.use('/api/chat', createChatRouter());
app.use('/api/files', createFilesRouter());
app.use('/api/git', createGitRouter());
app.use('/api/improve', createImproveRouter());
app.use('/api/history', createHistoryRouter());

// Static Files (Production)
const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get('*', (_req, res, next) => {
  if (_req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDist, 'index.html'));
});

// WebSocket
wss.on('connection', (ws) => {
  console.log('[ws] Novo cliente conectado');
  registerWSClient(ws);
});

// Inicialização
async function start() {
  console.log('--- Antigravity Remote Server ---');
  
  await connectCDP();
  startChatPolling();

  server.listen(config.port, '0.0.0.0', () => {
    const protocol = isDev ? 'http' : 'https';
    console.log(`[server] Porta: ${config.port} (${protocol})`);
    console.log(`[server] URL: ${protocol}://localhost:${config.port}`);
  });
}

start().catch((err) => {
  console.error('[server] Erro fatal na inicialização:', err);
  process.exit(1);
});
