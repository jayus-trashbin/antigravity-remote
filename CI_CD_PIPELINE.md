# CI/CD Pipeline

Antigravity Remote usa **GitHub Actions** para automação de testes, build e deployment.

## 🔄 Fluxo de CI/CD

```
┌─────────────┐
│ Push Code   │
└──────┬──────┘
       │
       v
┌──────────────────────┐
│ Validate             │ ← TypeScript check, linting
│ - TS compilation     │
│ - Type checking      │
└──────────┬───────────┘
           │
           v
┌──────────────────────┐
│ Build                │ ← Compile server + client
│ - Server build       │
│ - Client build (Vite)│
└──────────┬───────────┘
           │
           v
┌──────────────────────┐
│ Docker Build         │ (apenas se merge em master/tag)
│ - Build image        │
│ - Push to registry   │
└──────────┬───────────┘
           │
           v
┌──────────────────────┐
│ Test Docker          │ ← Start compose, test endpoints
│ - docker-compose up  │
│ - Health checks      │
└──────────┬───────────┘
           │
           v
┌──────────────────────┐
│ Deploy (manual)      │ ← Trigger manual se necessário
│ - Production         │
│ - Staging            │
└──────────────────────┘
```

## 📋 Jobs Automáticos

### 1. **Validate** ✅
Roda em: `push` ou `pull_request`

Valida:
- TypeScript (server e client)
- Imports e tipos
- Linting (se configurado)

```bash
# Comandos rodados:
cd server && tsc --noEmit
cd client && tsc --noEmit
```

### 2. **Build** 🏗️
Roda em: `push` ou `pull_request` (depois de Validate)

Compila:
- Server (`server/dist/`)
- Client com Vite (`client/dist/`)
- PWA manifest e service worker

### 3. **Docker** 🐳
Roda em: `push` em `master` ou tags `v*`

Constrói e faz push:
- Imagem Docker otimizada multi-stage
- Para `ghcr.io/<seu-usuario>/antigravity-remote:latest`
- Tags: `master`, `vX.Y.Z`, commit SHA

### 4. **Test Docker** 🧪
Roda em: Após Docker build bem-sucedido

Testa:
- `docker-compose up -d`
- Health check dos serviços
- Endpoints responsivos

### 5. **Release** 🚀
Roda em: Tag `v*` (ex: `v1.0.0`)

Cria:
- GitHub Release
- Changelog automático
- Link para Docker image

## 📊 Status Badges

Adicione ao README:

```markdown
![CI/CD](https://github.com/YOUR_USER/antigravity-remote/workflows/CI%2FCD%20Pipeline/badge.svg)
```

## 🚀 Triggering Workflows

### Automático
```bash
# Roda Validate + Build
git push origin feature-branch

# Roda tudo + Docker
git push origin master

# Roda tudo + Release
git tag v1.0.0
git push origin v1.0.0
```

### Manual (se configurado)
```bash
# Via GitHub UI:
# Actions → CI/CD Pipeline → Run workflow
```

## 🔐 Secrets Necessários

Configure em: `Settings → Secrets and variables → Actions`

```
GITHUB_TOKEN     # Automático, não precisa configurar
DOCKER_USERNAME  # (opcional, se usar Docker Hub)
DOCKER_PASSWORD  # (opcional, se usar Docker Hub)
```

## 📈 Monitorar Pipeline

### Via GitHub
1. Vá em `Actions` no repositório
2. Clique na workflow em execução
3. Veja status de cada job

### Via CLI
```bash
# Listar runs
gh run list --workflow=ci-cd.yml

# Ver logs de um run
gh run view <run-id> --log

# Re-run um workflow
gh run rerun <run-id>
```

## 🛠️ Customizar Pipeline

### Adicionar job novo

No `.github/workflows/ci-cd.yml`:

```yaml
  lint:
    name: ESLint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
```

### Adicionar notificação

```yaml
  notify:
    runs-on: ubuntu-latest
    if: failure()
    steps:
      - name: Send Slack notification
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
```

### Deployndo para staging

Adicione job:

```yaml
  deploy-staging:
    needs: test-docker
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to staging
        run: |
          # Seu script de deploy
```

## 📊 Otimizações

### Cache de node_modules
```yaml
- uses: actions/setup-node@v3
  with:
    cache: 'npm'  # Cacheia automaticamente
```

### Artefatos
```yaml
- uses: actions/upload-artifact@v3
  with:
    name: build
    path: server/dist
    retention-days: 1
```

### Docker cache
```yaml
cache-from: type=registry,ref=ghcr.io/.../build-cache
cache-to: type=registry,ref=ghcr.io/.../build-cache,mode=max
```

## 🔔 Notificações

### Slack
1. Crie webhook em Slack
2. Adicione secret `SLACK_WEBHOOK`
3. Configure job:

```yaml
- name: Notify Slack
  if: always()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "Build ${{ job.status }}"
      }
```

### Email
GitHub envia notificações padrão. Configure em `Watching` → `Custom`

## 📝 Variáveis Úteis

```yaml
github.ref           # refs/heads/master
github.ref_name      # master
github.sha           # commit SHA
github.run_number    # run ID
github.actor         # username
github.event_name    # push, pull_request, etc
```

## 🐛 Troubleshooting

### Workflow não roda
- Verificar `.github/workflows/ci-cd.yml` está correto
- Verificar `on:` triggers
- Verificar branch protection rules

### Job falha
- Clicar em job no Actions
- Ver output dos steps
- Verificar logs completos

### Cache não funciona
- Limpar cache: `Settings → Actions → General → Clear cache`
- Re-run workflow

## 📚 Recursos

- [GitHub Actions Docs](https://docs.github.com/actions)
- [Actions Setup Node](https://github.com/actions/setup-node)
- [Docker Build Action](https://github.com/docker/build-push-action)
- [Act - Run locally](https://github.com/nektos/act)

---

**Status:** ✅ CI/CD pipeline configurado e pronto!
