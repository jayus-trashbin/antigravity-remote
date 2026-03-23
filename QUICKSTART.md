# 🚀 QUICK START GUIDE

## 📦 Projeto: Antigravity Remote PWA

Painel mobile PWA para controlar o Antigravity IDE remotamente via Chrome DevTools Protocol (CDP).

---

## ✅ Pré-requisitos

- [x] Node.js v20+ (portátil em `node-v20.11.0-win-x64/`)
- [x] npm v10+ (incluído no Node.js)
- [x] Antigravity IDE rodando
- [x] Conexão de rede (local ou via Cloudflare tunnel)

---

## 🚀 Iniciar em 3 Passos

### Passo 1: Preparar Ambiente
```bash
# Configure o PATH para usar o Node.js portátil
export PATH="$(pwd)/node-v20.11.0-win-x64:$PATH"

# Verifique a instalação
node --version    # deve retornar v20.11.0
npm --version     # deve retornar 10.2.4
```

### Passo 2: Iniciar Servidores
```bash
# Ambos os servidores juntos (recomendado)
npm run dev

# OU iniciar separadamente em terminais diferentes:
npm run dev:server  # Terminal 1: Servidor em https://localhost:3333
npm run dev:client  # Terminal 2: Cliente em http://localhost:5173
```

### Passo 3: Acessar a Aplicação
- **Browser Local:** http://localhost:5173
- **Rede Local:** http://<seu-ip>:5173
- **Servidor:** https://localhost:3333

---

## 🔐 Primeiro Acesso

### Login Padrão
- **PIN:** `1234`
- **Mudança recomendada:** Edite `.env` e altere `AUTH_PIN`

### Fluxo
1. Abra http://localhost:5173 no navegador
2. Escaneie o QR Code com seu celular (mesma rede Wi-Fi)
3. Digite o PIN `1234`
4. Pronto! Você tem acesso ao Antigravity remotamente

---

## 🎯 Funcionalidades

- 🎙️ **Voz para Código** - Ditar prompts via microfone
- 💬 **Chat em Tempo Real** - Ver chat do Antigravity
- 🛠️ **Aprovação Remota** - Aprovar/rejeitar ações de ferramentas
- 📂 **Explorador de Arquivos** - Navegar arquivos do projeto
- 🌿 **Controle Git** - Status, commits, push/pull
- 🪄 **IA Prompt Improve** - Refinar prompts com Claude
- 🔒 **Acesso Seguro** - LOGIN PIN + HTTPS

---

## ⚙️ Configuração (.env)

Edite `.env` na raiz do projeto:

```env
# Portas
PORT=3333              # Servidor HTTPS
CDP_PORT=9222          # Antigravity remote debugging

# Autenticação
AUTH_PIN=1234          # PIN de login (mude este!)

# APIs (opcional)
ANTHROPIC_API_KEY=     # Para prompt improvement
TELEGRAM_BOT_TOKEN=    # Para notificações
TELEGRAM_CHAT_ID=      # Para notificações
```

---

## 🧪 Validar Instalação

```bash
# Executar todos os testes
bash test.sh

# Resultado esperado:
# ✓ Node.js v20+ installed
# ✓ npm v10+ installed
# ✓ Server build exists
# ✓ Client build exists
# ✓ Server TypeScript validates
# ✓ Client TypeScript validates
# ... e mais 8 testes
```

---

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Ambos os servidores + hot reload
npm run dev:server      # Apenas servidor Node.js
npm run dev:client      # Apenas cliente Vite

# Build
npm run build           # Build completo (server + client)
npm run build:server    # Apenas build do servidor
npm run build:client    # Apenas build do cliente
```

---

## 🔍 Endpoints Principais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login com PIN |
| GET | `/api/auth/validate` | Validar token |
| POST | `/api/chat/prompt` | Enviar prompt |
| POST | `/api/chat/approve` | Aprovar ação |
| POST | `/api/chat/reject` | Rejeitar ação |
| POST | `/api/improve` | Melhorar prompt (Claude) |
| GET | `/api/files/list` | Listar arquivos |
| GET | `/api/git/status` | Status do Git |
| WebSocket | `/` | Conectar (wss://localhost:3333) |

Documentação completa: `API_DOCUMENTATION.md`

---

## 🐛 Troubleshooting

### "npm: command not found"
```bash
# Use o Node.js portátil
export PATH="$(pwd)/node-v20.11.0-win-x64:$PATH"
npm --version  # Deve funcionar agora
```

### "Port 3333 already in use"
```bash
# Mude a porta no .env
PORT=3334

# Ou mate o processo anterior
lsof -ti:3333 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3333    # Windows (encontre PID e mate)
```

### "Antigravity not found on port 9222"
```bash
# Inicie Antigravity com a flag correta
antigravity --remote-debugging-port=9222

# Verifique se está rodando
curl http://localhost:9222/list 2>/dev/null | head
```

### "HTTPS certificate warnings"
- Normal para certificado auto-assinado
- Clique em "Aceitar" ou "Proceder com risco"
- Certificado está em `certs/`

### Client mostra erro de conexão
- Verifique se servidor está rodando em localhost:3333
- Verifique o proxy no `client/vite.config.ts`
- Abra DevTools (F12) e veja aba Network

---

## 📱 Mobile & PWA

### Para Instalar no Mobile
1. Abra http://<seu-ip>:5173 no navegador mobile
2. Clique em "Adicionar à Tela Inicial" (iOS) ou "Instalar app" (Android)
3. Use como app nativo

### Offline
- Service Worker armazena files em cache
- Funciona offline após primeira carga
- Dados de chat sincronizam quando voltar online

---

## 🔐 Segurança

- ✅ HTTPS obrigatório (self-signed cert)
- ✅ PIN de autenticação
- ✅ Session tokens com expiração 7 dias
- ✅ Rate limiting: 5 tentativas de login/15min
- ✅ WebSocket seguro (WSS)

**Para produção:**
- [ ] Gere certificado real (Let's Encrypt)
- [ ] Mude PIN padrão em `.env`
- [ ] Configure ANTHROPIC_API_KEY se usar prompt improvement
- [ ] Use Cloudflare tunnel para acesso remoto seguro

---

## 📚 Documentação Adicional

- **API Endpoints:** `API_DOCUMENTATION.md`
- **Relatório de Build:** `BUILD_REPORT.md`
- **Testes Phase 3:** `TESTING_PHASE_3.md`
- **Validação Pré-build:** `VALIDATION_REPORT.md`
- **Arquitetura:** Ver diretórios `server/` e `client/`

---

## 📞 Suporte

Se encontrar problemas:

1. **Verifique os logs:**
   ```bash
   # Servidor
   npm run dev:server
   # Procure por [error] ou [cdp] na saída

   # Cliente
   # Abra DevTools (F12) → Console
   ```

2. **Execute o teste:**
   ```bash
   bash test.sh
   ```

3. **Consulte a documentação:**
   - `TESTING_PHASE_3.md` - Troubleshooting
   - `API_DOCUMENTATION.md` - Endpoints
   - `BUILD_REPORT.md` - Build issues

---

## 🚀 Próximas Tarefas

- [ ] Conectar ao Antigravity com CDP
- [ ] Testar chat em tempo real
- [ ] Testar prompt improvement com Claude
- [ ] Deploy para produção
- [ ] Configurar Cloudflare tunnel
- [ ] Teste PWA em mobile

---

**Tudo pronto para usar! 🎉**

Comece com: `npm run dev`
