# Antigravity Remote 🚀

Painel mobile PWA para controlar o seu Antigravity IDE remotamente via Chrome DevTools Protocol (CDP).

## ✨ Funcionalidades Core

- 🎙️ **Voz para Código**: Use o microfone do celular para ditar prompts diretamente ao IDE.
- 💬 **Chat em Tempo Real**: Visualize e interaja com o chat do Antigravity pelo celular.
- 🛠️ **Aprovação Remota**: Aprove ou rejeite ações de ferramentas (como criar arquivos ou rodar comandos) de qualquer lugar.
- 📂 **Explorador de Arquivos**: Navegue pelos arquivos do seu projeto.
- 🌿 **Controle Git**: Monitore o status, faça commits e push/pull sem levantar da cadeira.
- 🪄 **IA Prompt Improve**: Refine seus prompts com **Ollama + DeepSeek Coder** (local, sem custos).
- 🔒 **Acesso Seguro**: Login via PIN com tokens JWT e HTTPS.
- 📱 **PWA**: Instale como app nativo no mobile com offline support.

## 🚀 Quick Start

```bash
# 1. Configure Node.js (portátil incluído)
export PATH="$(pwd)/node-v20.11.0-win-x64:$PATH"

# 2. Inicie os servidores
npm run dev

# 3. Abra no navegador
# 📱 Client:  http://localhost:5173
# 🖥️  Server:  https://localhost:3333
```

**Login com PIN:** `1234`

Mais detalhes: 👉 **[QUICKSTART.md](QUICKSTART.md)**

## 📋 Estrutura do Projeto

```
antigravity-remote/
├── server/
│   ├── src/
│   │   ├── index.ts (Express + CDP + WebSocket)
│   │   ├── config.ts (Configuration management)
│   │   ├── https.ts (Self-signed certificates)
│   │   ├── cdp/ (Chrome Remote Interface)
│   │   ├── routes/ (API endpoints: auth, chat, files, git, improve)
│   │   ├── services/ (Business logic)
│   │   ├── middleware/ (Authentication)
│   │   └── types/ (TypeScript declarations)
│   ├── package.json
│   ├── tsconfig.json
│   └── dist/ (Compiled JavaScript)
│
├── client/
│   ├── src/
│   │   ├── app.tsx (Main app shell)
│   │   ├── main.tsx (Preact entry)
│   │   ├── components/ (UI components)
│   │   ├── hooks/ (Custom hooks)
│   │   ├── styles/ (Tailwind CSS)
│   │   ├── types/ (TypeScript declarations)
│   │   └── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── dist/ (Compiled & minified)
│
├── public/ (PWA assets)
├── node-v20.11.0-win-x64/ (Portable Node.js)
├── package.json (Root monorepo)
├── .env (Configuration - não rastrear)
├── .env.example (Template)
└── .gitignore
```

## 🛠️ Scripts Disponíveis

```bash
# Development
npm run dev              # Ambos os servidores (recomendado)
npm run dev:server      # Apenas servidor (https://localhost:3333)
npm run dev:client      # Apenas cliente (http://localhost:5173)

# Build
npm run build           # Build completo (server + client)
npm run build:server    # Apenas build do servidor
npm run build:client    # Apenas build do cliente

# Testing
bash test.sh           # Validação completa
```

## 🔧 Tecnologias

**Backend:**
- Node.js v20.11.0 (TypeScript)
- Express.js (REST API)
- Chrome Remote Interface (CDP)
- WebSocket (Real-time updates)
- JWT (Authentication)

**Frontend:**
- Preact (UI framework)
- Vite (Build tool)
- Tailwind CSS v4 (Styling)
- PWA Plugin (Service Worker)

**DevOps:**
- npm workspaces (Monorepo)
- Self-signed HTTPS certificates
- Hot Module Reloading (HMR)

## 📚 Documentação

- **[QUICKSTART.md](QUICKSTART.md)** - Guia rápido de inicialização
- **[OLLAMA_SETUP.md](OLLAMA_SETUP.md)** - Configurar Ollama + DeepSeek Coder
- **[DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)** - Deploy com Docker + Docker Compose
- **[CI_CD_PIPELINE.md](CI_CD_PIPELINE.md)** - GitHub Actions CI/CD automation
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Endpoints API completos
- **[BUILD_REPORT.md](BUILD_REPORT.md)** - Relatório de build com fixes
- **[VALIDATION_REPORT.md](VALIDATION_REPORT.md)** - Validação pré-build

## 🔐 Configuração (.env)

```env
# Servidor
PORT=3333              # HTTPS port
CDP_PORT=9222          # Antigravity remote debugging port

# Autenticação
AUTH_PIN=1234          # PIN de login (MUDE ESTE!)

# Ollama (prompt improvement)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=deepseek-coder

# APIs (opcional)
TELEGRAM_BOT_TOKEN=    # Para notificações via Telegram
TELEGRAM_CHAT_ID=      # Chat ID para Telegram
```

## 🚀 Como Usar

### 1. Preparar Antigravity
```bash
antigravity --remote-debugging-port=9222
```

### 2. Iniciar Servidores
```bash
npm run dev
```

### 3. Acessar
- **Desktop:** http://localhost:5173
- **Mobile (mesma rede):** http://<seu-ip>:5173
- **QR Code:** Escaneie com câmera do celular

### 4. Login
- PIN padrão: `1234`
- Escaneie QR code ou digite URL manualmente

### 5. Usar
- Enviar prompts via texto ou voz
- Aprovar/rejeitar ações remotamente
- Gerenciar arquivos e Git
- Refinar prompts com Ollama AI (local, sem custos)

## 🤖 Ollama + DeepSeek Coder

O Antigravity Remote usa **Ollama** para melhorar prompts localmente:

- 🚀 **Sem custos** - Roda no seu computador
- 🔒 **Privado** - Nenhum dado sai do seu servidor
- ⚡ **Rápido** - DeepSeek Coder é otimizado
- 📦 **Offline** - Funciona sem internet

**Setup rápido:**
```bash
# Instale Ollama (https://ollama.ai)
ollama pull deepseek-coder

# Pronto! O servidor usa automaticamente
npm run dev
```

📖 Documentação completa: **[OLLAMA_SETUP.md](OLLAMA_SETUP.md)**

## 🌍 Acesso Remoto

### Via Rede Local (Wi-Fi)
```bash
# Acessível em qualquer dispositivo na mesma rede
http://<seu-ip>:5173
```

### Via Cloudflare Tunnel (Internet)
```bash
# Opcional: Configure em .env
TUNNEL_ENABLED=true

# Será gerada uma URL pública segura
https://your-project-name.trycloudflare.com
```

## 📱 PWA (Mobile)

### Instalação
1. Abra http://<seu-ip>:5173 no mobile
2. Menu → "Adicionar à tela inicial" (iOS)
3. Menu → "Instalar app" (Android)
4. Use como app nativo!

### Offline
- Service Worker armazena em cache
- Funciona sem internet após primeira carga
- Sincroniza quando voltar online

## 🧪 Testes

```bash
# Validar instalação
bash test.sh

# Resultados esperados:
# ✓ Node.js v20+ installed
# ✓ npm v10+ installed
# ✓ Server build exists
# ✓ Client build exists
# ✓ TypeScript validates
# ... e mais
```

## 🐳 Docker Deployment

Deploy em uma linha:

```bash
docker-compose up -d
```

Isso inicia:
- Ollama com DeepSeek Coder
- Antigravity Remote server
- Todos rodando e prontos

Mais detalhes: **[DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)**

## 🔄 CI/CD (GitHub Actions)

Push automático de:
- Validação TypeScript
- Build de server + client
- Docker image build
- Tests em docker-compose

Documentação: **[CI_CD_PIPELINE.md](CI_CD_PIPELINE.md)**

## 🐛 Troubleshooting

### "npm: command not found"
```bash
export PATH="$(pwd)/node-v20.11.0-win-x64:$PATH"
```

### "Port already in use"
Edite `.env` e mude `PORT=3334` ou mate o processo anterior.

### "Antigravity not found"
Inicie com: `antigravity --remote-debugging-port=9222`

### "HTTPS certificate warning"
Normal para self-signed cert. Clique "Proceder com risco".

### "Ollama connection refused"
Aguarde 1-2 minutos para Ollama inicializar ou execute:
```bash
ollama serve
```

Veja **[QUICKSTART.md](QUICKSTART.md)** para mais troubleshooting.

## 📈 Status do Projeto

| Fase | Status | Detalhes |
|------|--------|----------|
| **1: Estrutura** | ✅ Completa | Monorepo organizado com workspaces |
| **2: Build** | ✅ Completa | TypeScript compilando, Vite buildando |
| **3: Testing** | ✅ Completa | Servidores iniciando, endpoints documentados |
| **4: Deploy** | 🔄 Em progresso | Preparando para produção |

## 🎯 Próximas Funcionalidades

- [ ] Integração completa com Anthropic Claude
- [ ] Dashboard com gráficos de uso
- [ ] Histórico persistente de prompts
- [ ] Suporte a múltiplas sessões
- [ ] Notifications via WebSocket
- [ ] Backup automático de configs

## 📝 Licença

MIT

## 🙏 Contribuições

Bem-vindo a contribuir! Por favor:
1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push e abra um Pull Request

---

**Desenvolvido para máxima produtividade mobile! 🚀**

Comece agora: `npm run dev`
