# Docker Deployment Guide

Antigravity Remote pode ser facilmente deployado com **Docker** e **Docker Compose**.

## 🚀 Quick Start com Docker

### Pré-requisitos
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Deploy em uma linha

```bash
docker-compose up -d
```

Isso vai:
1. ✅ Baixar e iniciar Ollama com DeepSeek Coder
2. ✅ Construir a imagem do Antigravity Remote
3. ✅ Iniciar os servidores
4. ✅ Expor em `https://localhost:3333`

### Acessar a aplicação

```bash
# Cliente (PWA)
http://localhost:5173

# API Server (HTTPS)
https://localhost:3333

# Ollama (para debugging)
http://localhost:11434/api/tags
```

**PIN padrão:** `1234`

## 🎯 Comandos Úteis

### Ver logs
```bash
# Todos os serviços
docker-compose logs -f

# Apenas Antigravity Remote
docker-compose logs -f antigravity-remote

# Apenas Ollama
docker-compose logs -f ollama
```

### Parar serviços
```bash
docker-compose down
```

### Parar e remover dados
```bash
docker-compose down -v
```

### Reconstruir imagem
```bash
docker-compose up -d --build
```

### Executar comando no container
```bash
docker-compose exec antigravity-remote sh
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz:

```env
# Porta do servidor
PORT=3333

# Porta CDP (Antigravity debugger)
CDP_PORT=9222

# PIN de autenticação
AUTH_PIN=1234

# Ollama (configurado automaticamente no docker-compose)
# OLLAMA_URL=http://ollama:11434
# OLLAMA_MODEL=deepseek-coder

# Telegram (opcional)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

### Mudando modelos Ollama

No `docker-compose.yml`, mude:

```yaml
services:
  ollama:
    command: >
      sh -c "ollama serve & 
      sleep 10 && 
      ollama pull mistral && 
      wait"
```

### Alterar PIN

```bash
# Opção 1: Arquivo .env
echo "AUTH_PIN=5678" >> .env

# Opção 2: docker-compose up
docker-compose up -d -e AUTH_PIN=5678
```

## 📊 Monitoramento

### Verificar saúde dos serviços
```bash
docker-compose ps

# Esperado:
# NAME                    STATUS
# antigravity-ollama      Up (healthy)
# antigravity-remote      Up
```

### Ver consumo de recursos
```bash
docker stats
```

### Lipar images/containers não usados
```bash
docker system prune
```

## 🌐 Producão com Reverse Proxy

Para produção com Nginx:

1. Descomente a seção `nginx` no `docker-compose.yml`
2. Crie `nginx.conf`:

```nginx
upstream app {
    server antigravity-remote:3333;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/certs/cert.pem;
    ssl_certificate_key /etc/nginx/certs/key.pem;

    location / {
        proxy_pass https://app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

3. Start:
```bash
docker-compose up -d
```

## 🔒 Segurança

### Mudar PIN padrão
```bash
AUTH_PIN=$(openssl rand -hex 8) docker-compose up -d
```

### Usar certificados válidos (Let's Encrypt)
```bash
# Gerar com Certbot
certbot certonly --standalone -d your-domain.com

# Montar em docker-compose.yml
volumes:
  - /etc/letsencrypt/live/your-domain.com:/app/certs:ro
```

### Ativar CORS restritivo
Edite `server/src/index.ts`:
```typescript
app.use(cors({
  origin: 'https://your-domain.com',
  credentials: true
}));
```

## 🐛 Troubleshooting

### "Connection refused" ao conectar
```bash
# Aguarde Ollama inicializar (até 2 min)
docker-compose logs ollama | grep "listening"
```

### Ollama usando muita memória
```yaml
# Reduza no docker-compose.yml
services:
  ollama:
    environment:
      - OLLAMA_MAX_LOADED_MODELS=1
```

### Certificado auto-assinado warning
Normal em desenvolvimento. Em produção, use Let's Encrypt.

### Port já em uso
```bash
# Windows/Mac
lsof -i :3333
kill -9 <PID>

# Linux
sudo lsof -i :3333
sudo kill -9 <PID>
```

## 📦 Tamanho de Imagens

```
ollama/ollama:latest          ~2.5GB (com modelos)
antigravity-remote:latest     ~500MB (após build)
```

## 🔄 CI/CD Integration

Para GitHub Actions:

```yaml
- name: Build Docker image
  run: docker build -t antigravity-remote:latest .

- name: Start services
  run: docker-compose up -d

- name: Wait for services
  run: sleep 30

- name: Run tests
  run: docker-compose exec -T antigravity-remote npm test
```

## 📚 Recursos

- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Ollama Docker](https://github.com/ollama/ollama/blob/main/docs/docker.md)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

---

**Status:** ✅ Docker setup pronto para production!
