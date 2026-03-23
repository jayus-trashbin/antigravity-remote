# Configuração do Ollama para Antigravity Remote

O Antigravity Remote agora usa **Ollama** com o modelo **DeepSeek Coder** para melhorar prompts localmente, sem depender de APIs externas.

## ✨ Benefícios

- ✅ **Sem custos** - Roda localmente, sem chamadas de API pagas
- ✅ **Privacidade** - Seus prompts ficam no seu computador
- ✅ **Offline** - Funciona sem internet (após modelo baixado)
- ✅ **Rápido** - DeepSeek Coder é otimizado para código
- ✅ **Flexível** - Troque de modelo facilmente

## 📋 Pré-requisitos

- **RAM**: Mínimo 8GB (recomendado 16GB+)
- **GPU** (opcional): NVIDIA/AMD aceleração disponível

## 🚀 Instalação

### 1. Instale o Ollama

**macOS/Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Windows:**
- Baixe em https://ollama.ai/download/windows
- Execute o instalador

### 2. Puxe o modelo DeepSeek Coder

```bash
ollama pull deepseek-coder
```

Isso baixará ~6GB. Primeira execução pode levar alguns minutos.

### 3. Inicie o Ollama

O Ollama começa automaticamente após instalação. Verifique se está rodando em `http://localhost:11434`:

```bash
curl http://localhost:11434/api/tags
```

Deve retornar a lista de modelos disponíveis.

## 🔧 Configuração (Opcional)

Adicione ao `.env` se não usar valores padrão:

```env
# Padrão: http://localhost:11434
OLLAMA_URL=http://localhost:11434

# Padrão: deepseek-coder
# Outras opções: mistral, neural-chat, llama2, dolphin-mixtral
OLLAMA_MODEL=deepseek-coder
```

## 🧪 Teste

Com o servidor rodando, teste o endpoint:

```bash
TOKEN="seu_token_aqui"

curl -k -X POST https://localhost:3333/api/improve \
  -H "x-session-token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "create a function to sort an array",
    "mode": "detailed"
  }'
```

Resposta esperada:
```json
{
  "original": "create a function to sort an array",
  "improved": "Create a TypeScript function that sorts an array of numbers in ascending order...",
  "model": "deepseek-coder"
}
```

## 🎯 Modelos Alternativos

Se quiser experimentar outros modelos:

```bash
# Rápido, bom para chat
ollama pull mistral

# Otimizado para código
ollama pull neural-chat

# Versátil
ollama pull llama2

# Excelente qualidade (maior)
ollama pull dolphin-mixtral
```

Depois atualize no `.env`:
```env
OLLAMA_MODEL=mistral
```

## ⚙️ Performance

### Se estiver lento:

1. **Aumente quantidade de threads:**
   ```bash
   OLLAMA_NUM_THREAD=8 ollama serve
   ```

2. **Use GPU (se tiver NVIDIA):**
   - Ollama detecta automaticamente
   - Verifique com: `nvidia-smi`

3. **Reduza tamanho do modelo:**
   ```bash
   # Versão menor de DeepSeek
   ollama pull deepseek-coder:7b-gguf
   ```

### Se tiver OOM (falta de memória):

```bash
# Limite memória
OLLAMA_MAX_LOADED_MODELS=1 ollama serve
```

## 🐛 Troubleshooting

### Erro: "Connection refused"
- Ollama não está rodando
- Execute: `ollama serve`

### Erro: "Model not found"
- Puxe o modelo: `ollama pull deepseek-coder`

### Lentidão extrema
- Verifique RAM disponível: `free -h` (Linux) ou Gerenciador de Tarefas (Windows)
- CPU: `top` (Linux) ou Task Manager (Windows)

### Modelo errado sendo usado
- Verifique `.env`:
  ```bash
  grep OLLAMA_MODEL .env
  ```

## 📚 Documentação

- [Ollama Oficial](https://ollama.ai)
- [DeepSeek Coder](https://github.com/deepseek-ai/deepseek-coder)
- [Modelos disponíveis](https://ollama.ai/library)

## 🎮 Exemplo de Uso Prático

**Original:**
```
fix the login bug
```

**DeepSeek Coder (modo technical):**
```
Review the authentication flow in src/auth/login.ts. 
The issue likely occurs in the JWT token validation.
Check: 1) token expiry check, 2) signature verification, 3) scope validation.
Provide test case demonstrating the fix.
```

---

**Status:** ✅ Ollama está pronto para uso!
