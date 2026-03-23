# E2E Testing with Playwright

Antigravity Remote inclui testes E2E (End-to-End) automatizados com Playwright.

## 🚀 Quick Start

```bash
# Certificar que os servidores estão rodando
npm run dev

# Em outro terminal, rodar os testes
npx playwright test e2e/tests.spec.ts --reporter=list
```

## ✅ Test Results

Todos os 9 testes passam com sucesso:

```
✓ should navigate to login page          (10.5s)
✓ should show form inputs                (6.3s)
✓ should authenticate with PIN           (391ms)
✓ should validate token                  (22ms)
✓ should fetch files                     (14ms)
✓ should fetch git status                (365ms)
✓ should reject invalid PIN              (7ms)
✓ should handle chat endpoint            (14ms)
✓ should verify server headers           (9ms)

Total: 9 passed (22.8s)
```

## 📊 O que os Testes Cobrem

| Teste | O que verifica |
|-------|----------------|
| **Login Page** | Página carrega corretamente com título "Antigravity Remote" |
| **Form Inputs** | Campos de input existem no formulário de login |
| **PIN Authentication** | POST `/api/auth/login` retorna token válido |
| **Token Validation** | Token é validado corretamente via `GET /api/auth/validate` |
| **Files Listing** | `GET /api/files/list` retorna lista de arquivos |
| **Git Status** | `GET /api/git/status` retorna branch atual |
| **Invalid PIN** | PIN incorreto é rejeitado (401) |
| **Chat Endpoint** | `POST /api/chat/prompt` é acessível e responde |
| **Security Headers** | Headers HTTP corretos (X-Powered-By, CORS) |

## 🎯 Recursos Testados

- ✅ Client (Preact) carrega sem erros
- ✅ Autenticação com PIN
- ✅ Geração de JWT tokens
- ✅ Validação de tokens
- ✅ File browsing API
- ✅ Git integration API
- ✅ Chat API endpoints
- ✅ CORS/Security headers

## 🔧 Configuração

### playwright.config.ts

```typescript
- Timeout: 30s por teste
- Reporter: lista + HTML
- Navegador: Chromium
- Ignore HTTPS errors: false (self-signed certs OK)
```

### Rodando testes específicos

```bash
# Um teste específico
npx playwright test -g "should authenticate with PIN"

# Com modo headless (padrão)
npx playwright test

# Com navegador visível
npx playwright test --headed

# Debug mode
npx playwright test --debug

# Gerar relatório HTML
npx playwright show-report
```

## 📈 CI/CD Integration

Os testes rodam automaticamente no GitHub Actions:

```yaml
- name: Run E2E tests
  run: npx playwright test --reporter=github
```

## 🐛 Troubleshooting

### "Playwright browsers not installed"
```bash
npx playwright install --with-deps
```

### "Connection refused"
Certifique que os servidores estão rodando:
```bash
npm run dev
```

### "SSL_PROTOCOL_ERROR"
Normal para self-signed certs. Playwright ignora automaticamente.

### "Test timeout"
Aumente timeout em `playwright.config.ts`:
```typescript
test.setTimeout(60000); // 60s
```

## 📚 Estrutura dos Testes

```
e2e/
└── tests.spec.ts      # Suite de 9 testes E2E
```

## 🎬 Artifacts

Quando um teste falha, Playwright gera:
- Screenshots (último estado da página)
- Videos (gravação do teste)
- Traces (timeline detalhada)

Localizados em `test-results/`

## 🚀 Próximos Passos

1. **Adicionar testes de UI** - Click em botões, preenchimento de formulários
2. **Testes de performance** - Tempo de carregamento, animações
3. **Testes de mobile** - Responsive design
4. **Visual regression** - Comparar screenshots
5. **Testes de acessibilidade** - WCAG compliance

## 📝 Script NPM (Recomendado)

Adicione ao `package.json`:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:report": "playwright show-report"
  }
}
```

Depois use:
```bash
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:report
```

---

**Status:** ✅ E2E testing totalmente funcional e integrado!
