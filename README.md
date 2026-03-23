# Antigravity Remote 🚀

Painel mobile PWA para controlar o seu Antigravity IDE remotamente via Chrome DevTools Protocol (CDP).

## Funcionalidades Core
- 🎙️ **Voz para Código**: Use o microfone do celular para ditar prompts diretamente ao IDE.
- 💬 **Chat em Tempo Real**: Visualize e interaja com o chat do Antigravity pelo celular.
- 🛠️ **Aprovação Remota**: Aprove ou rejeite ações de ferramentas (como criar arquivos ou rodar comandos) de qualquer lugar.
- 📂 **Explorador de Arquivos**: Navegue pelos arquivos do seu projeto.
- 🌿 **Controle Git**: Monitore o status, faça commits e push/pull sem levantar da cadeira.
- 🪄 **IA Prompt Improve**: Refine seus prompts com Claude antes de enviá-los.
- 🔒 **Acesso Seguro**: Login via PIN e opção de Cloudflare Tunnel.

## Como Configurar

### 1. Requisitos
- Node.js v20+
- Antigravity IDE rodando com a flag:
  ```bash
  antigravity --remote-debugging-port=9222
  ```

### 2. Instalação
```bash
npm install
```

### 3. Configuração
Crie um arquivo `.env` na raiz (use `.env.example` como base):
```env
PORT=3333
CDP_PORT=9222
AUTH_PIN=1234
ANTHROPIC_API_KEY=sua_chave
```

### 4. Execução
```bash
npm run dev
```
Escaneie o QR Code exibido no terminal ou no console do navegador para abrir o painel no celular.

## Tecnologias
- **Backend**: Node.js, TypeScript, Express, WebSocket, CDP.
- **Frontend**: Preact, Vite, Tailwind CSS v4, PWA.
- **IA**: Anthropic SDK.

---
Desenvolvido para máxima produtividade mobile.
