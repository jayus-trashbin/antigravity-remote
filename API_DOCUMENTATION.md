# 📋 ENDPOINTS API - Antigravity Remote

## 🔐 Autenticação

### POST /api/auth/login
Login com PIN para obter session token.

**Request:**
```json
{
  "pin": "1234"
}
```

**Response (Success - 200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Error - 401):**
```json
{
  "error": "PIN incorreto ou IP bloqueado"
}
```

---

### GET /api/auth/validate
Valida se o token atual ainda é válido.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "valid": true
}
```

---

### GET /api/auth/settings
Obtém configurações atuais da sessão.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "port": 3333,
  "cdpPort": 9222,
  "autoAccept": false,
  "improveMode": "detailed",
  "tunnelEnabled": false
}
```

---

### POST /api/auth/settings
Atualiza configurações.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "autoAccept": true,
  "improveMode": "concise"
}
```

**Response (Success - 200):**
```json
{
  "success": true
}
```

---

## 💬 Chat

### GET /api/chat/status
Obtém status atual do chat do Antigravity.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "connected": true,
  "messages": 15,
  "lastUpdate": "2026-03-23T20:15:00.000Z"
}
```

---

### POST /api/chat/prompt
Envia um prompt para o Antigravity IDE.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "prompt": "Create a TypeScript function that validates email addresses"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "messageId": "msg_12345"
}
```

---

### POST /api/chat/approve
Aprova a ação pendente do agente.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "success": true,
  "action": "approved"
}
```

---

### POST /api/chat/reject
Rejeita a ação pendente do agente.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "success": true,
  "action": "rejected"
}
```

---

## 🤖 Prompt Improvement (Claude AI)

### POST /api/improve
Melhora um prompt usando Claude AI.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "prompt": "make a function",
  "mode": "detailed"
}
```

**Response (Success - 200):**
```json
{
  "original": "make a function",
  "improved": "Create a TypeScript function that takes a string parameter and returns the number of vowels in that string. The function should handle both uppercase and lowercase letters.",
  "mode": "detailed"
}
```

**Modes:**
- `detailed` - Adiciona contexto e melhores práticas
- `concise` - Versão curta e direta
- `technical` - Jargão técnico e padrões avançados
- `creative` - Abordagem criativa e inovadora

---

## 📂 Files

### GET /api/files/list
Lista arquivos do projeto.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `path` (optional): Caminho relativo para listar

**Response (Success - 200):**
```json
{
  "path": ".",
  "files": [
    {
      "name": "package.json",
      "type": "file",
      "size": 1024,
      "modified": "2026-03-23T20:00:00.000Z"
    },
    {
      "name": "src",
      "type": "directory",
      "size": 4096
    }
  ]
}
```

---

### POST /api/files/upload
Faz upload de arquivo.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: arquivo binário
- `path` (optional): caminho destino

**Response (Success - 200):**
```json
{
  "success": true,
  "filename": "archive.zip",
  "size": 2048576
}
```

---

### GET /api/files/download
Baixa um arquivo.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `path`: caminho do arquivo

**Response:**
- File binary (Content-Type: application/octet-stream)

---

## 🌿 Git

### GET /api/git/status
Obtém status do repositório Git.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "branch": "main",
  "ahead": 0,
  "behind": 0,
  "staged": ["package.json"],
  "unstaged": ["README.md"],
  "untracked": ["build/"]
}
```

---

### POST /api/git/commit
Faz commit das mudanças.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "message": "Add new feature"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "hash": "abc123def456...",
  "author": "Dev Bot"
}
```

---

### POST /api/git/push
Faz push para repositório remoto.

**Headers:**
```
Authorization: Bearer <token>
```

**Request (optional):**
```json
{
  "branch": "main"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "pushed": 5
}
```

---

## 🔌 WebSocket

### Connection: wss://localhost:3333/

Conecta-se ao WebSocket para receber updates em tempo real.

**After Connection:**
```javascript
ws.send(JSON.stringify({ type: 'subscribe', channel: 'chat' }))
```

**Receives:**
```json
{
  "type": "chat:update",
  "data": {
    "messages": [...],
    "pendingAction": null,
    "status": "idle"
  }
}
```

**Message Types:**
- `chat:update` - Atualização do chat
- `action:pending` - Ação aguardando aprovação
- `cdp:connected` - CDP conectado ao Antigravity
- `cdp:disconnected` - CDP desconectado

---

## 🔒 Authentication Token

Tokens são JWTs válidos por 7 dias.

**Format:**
```
Bearer <jwt_token>
```

**Header Required:**
```
Authorization: Bearer eyJhbGc...
```

**Token Expiry:** 7 dias (604.800 segundos)

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "error": "Descrição do erro"
}
```

### 401 Unauthorized
```json
{
  "error": "Token inválido ou ausente"
}
```

### 403 Forbidden
```json
{
  "error": "Permissão negada"
}
```

### 500 Internal Server Error
```json
{
  "error": "Erro interno do servidor",
  "details": "..."
}
```

---

## 📊 Rate Limiting

- Login: 5 tentativas por IP a cada 15 minutos
- API Geral: 100 requisições por minuto por token

---

## 🧪 Testing with cURL

```bash
# Login
TOKEN=$(curl -s -k -X POST https://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"pin":"1234"}' | jq -r '.token')

# Validate Token
curl -s -k -X GET https://localhost:3333/api/auth/validate \
  -H "Authorization: Bearer $TOKEN"

# Send Prompt
curl -s -k -X POST https://localhost:3333/api/chat/prompt \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Create a hello world function"}'

# Improve Prompt
curl -s -k -X POST https://localhost:3333/api/improve \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"hello world","mode":"detailed"}'
```

---

## 🔍 Testing with JavaScript

```javascript
const token = 'your_token_here';
const API_URL = 'https://localhost:3333';

// Login
async function login(pin) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin })
  });
  const data = await res.json();
  return data.token;
}

// Send Prompt
async function sendPrompt(token, prompt) {
  const res = await fetch(`${API_URL}/api/chat/prompt`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt })
  });
  return res.json();
}

// WebSocket
const ws = new WebSocket('wss://localhost:3333');
ws.onopen = () => {
  console.log('Connected');
  ws.send(JSON.stringify({ type: 'subscribe', channel: 'chat' }));
};
ws.onmessage = (event) => {
  console.log('Update:', JSON.parse(event.data));
};
```

---

## 📝 Notes

- Todos os endpoints requerem HTTPS (self-signed cert será gerado)
- PIN padrão: 1234 (mudar em .env)
- WebSocket funciona apenas após autenticação
- CDP conecta ao Antigravity na porta 9222
- Certificados auto-assinados em `certs/` (primeiro run)
