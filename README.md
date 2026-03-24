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
- 📱 **PWA**: Instale como app nativo no mobile com suporte offline.

## 🚀 Como Iniciar

### Pré-requisitos
- **Node.js**: v20 ou superior recomendado.
- **Antigravity IDE**: Rodando com a porta de debugging remoto ativa.

### Instalação
```bash
# 1. Instale as dependências
npm install

# 2. Configure o ambiente
cp .env.example .env
# Edite o .env se necessário (AUTH_PIN padrão: 1234)

# 3. Inicie os servidores (Client + Server)
npm run dev
```

### Acesso
- **Desktop:** `http://localhost:5173`
- **Mobile:** `http://<seu-ip>:5173` (Escaneie o QR Code na tela de login)

---

## 📋 Estrutura do Projeto

```
antigravity-remote/
├── server/      # Backend Node.js (Express + WebSocket + CDP)
├── client/      # Frontend Preact (Vite + Tailwind CSS v4)
├── public/      # Assets estáticos e manifesto PWA
├── scripts/     # Scripts de injeção e pontes de comunicação
├── e2e/         # Testes de ponta a ponta (Playwright)
└── README.md
```

## 🛠️ Scripts Disponíveis

- `npm run dev`: Inicia servidor e cliente simultaneamente.
- `npm run build`: Gera o build de produção para ambos.
- `npm run test:e2e`: Executa os testes automatizados de integração.

## 🤖 IA Local (Ollama)

O projeto suporta melhoria de prompts usando o **Ollama**.
1. Instale o [Ollama](https://ollama.ai).
2. Execute `ollama pull deepseek-coder`.
3. O servidor detectará e usará o modelo automaticamente para refinar seus prompts.

---

## 🔐 Segurança e HTTPS

O servidor utiliza certificados auto-assinados para garantir o funcionamento da **Web Speech API** no mobile. Ao acessar pela primeira vez, aceite o aviso de segurança do navegador.

## 📱 PWA (Mobile)

Para uma melhor experiência no celular, instale o Antigravity Remote como um aplicativo:
- **iOS:** Compartilhar -> "Adicionar à Tela de Início".
- **Android:** Menu -> "Instalar Aplicativo".

---

**Desenvolvido para máxima produtividade mobile! 🚀**
