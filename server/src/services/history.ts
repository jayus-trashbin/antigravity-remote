import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), '../../../data');
const HISTORY_FILE = join(DATA_DIR, 'history.json');
const MAX_SESSIONS = 50;
const MAX_MESSAGES_PER_SESSION = 500;

export interface StoredMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  status: 'complete' | 'streaming' | 'error';
  tokens?: number;
}

export interface ChatSession {
  id: string;
  startedAt: number;
  updatedAt: number;
  title: string; // primeiras 60 chars da primeira mensagem do user
  messages: StoredMessage[];
  workspacePath?: string;
  model?: string;
}

interface HistoryStore {
  sessions: ChatSession[];
  activeSessionId: string | null;
}

function ensureDataDir(): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function load(): HistoryStore {
  ensureDataDir();
  if (!existsSync(HISTORY_FILE)) return { sessions: [], activeSessionId: null };
  try {
    return JSON.parse(readFileSync(HISTORY_FILE, 'utf-8')) as HistoryStore;
  } catch {
    return { sessions: [], activeSessionId: null };
  }
}

function save(store: HistoryStore): void {
  ensureDataDir();
  // Limitar sessões
  if (store.sessions.length > MAX_SESSIONS) {
    store.sessions = store.sessions
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, MAX_SESSIONS);
  }
  writeFileSync(HISTORY_FILE, JSON.stringify(store, null, 2));
}

export function createSession(model?: string, workspacePath?: string): ChatSession {
  const store = load();
  const session: ChatSession = {
    id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    startedAt: Date.now(),
    updatedAt: Date.now(),
    title: 'Nova conversa',
    messages: [],
    model,
    workspacePath,
  };
  store.sessions.unshift(session);
  store.activeSessionId = session.id;
  save(store);
  return session;
}

export function getActiveSession(): ChatSession | null {
  const store = load();
  if (!store.activeSessionId) return null;
  return store.sessions.find((s) => s.id === store.activeSessionId) || null;
}

export function setActiveSession(id: string): boolean {
  const store = load();
  const exists = store.sessions.some((s) => s.id === id);
  if (!exists) return false;
  store.activeSessionId = id;
  save(store);
  return true;
}

export function getAllSessions(): ChatSession[] {
  return load().sessions.sort((a, b) => b.updatedAt - a.updatedAt);
}

export function appendMessage(sessionId: string, msg: StoredMessage): void {
  const store = load();
  const session = store.sessions.find((s) => s.id === sessionId);
  if (!session) return;

  // Atualizar mensagem existente (streaming) ou adicionar nova
  const idx = session.messages.findIndex((m) => m.id === msg.id);
  if (idx >= 0) {
    session.messages[idx] = msg;
  } else {
    if (session.messages.length >= MAX_MESSAGES_PER_SESSION) {
      session.messages.shift(); // remove mais antiga
    }
    session.messages.push(msg);

    // Atualizar título com a primeira mensagem do user
    if (msg.role === 'user' && session.title === 'Nova conversa') {
      session.title = msg.content.slice(0, 60) + (msg.content.length > 60 ? '…' : '');
    }
  }

  session.updatedAt = Date.now();
  save(store);
}

export function deleteSession(id: string): void {
  const store = load();
  store.sessions = store.sessions.filter((s) => s.id !== id);
  if (store.activeSessionId === id) {
    store.activeSessionId = store.sessions[0]?.id || null;
  }
  save(store);
}

export function searchMessages(query: string): Array<{ session: ChatSession; message: StoredMessage }> {
  const store = load();
  const results: Array<{ session: ChatSession; message: StoredMessage }> = [];
  const lower = query.toLowerCase();

  for (const session of store.sessions) {
    for (const msg of session.messages) {
      if (msg.content.toLowerCase().includes(lower)) {
        results.push({ session, message: msg });
      }
    }
  }

  return results.slice(0, 50); // limitar resultados
}
