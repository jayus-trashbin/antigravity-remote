# Node.js Portátil - Guia de Uso

## ✅ Status de Instalação

- **Node.js**: v20.11.0
- **NPM**: 10.2.4
- **Dependências**: 387 pacotes instalados
- **Sem privilégios admin**: ✓ Funcionando

## 🚀 Como Usar

### Opção 1: Scripts Simples (Recomendado)

Execute os comandos diretamente:

```bash
# Instalar dependências (já feito)
.\npm.bat install

# Executar servidor em desenvolvimento
.\npm.bat run dev

# Build do projeto
.\npm.bat build

# Executar script Node.js direto
.\node.bat seu-script.js

# Rodar comando npm qualquer
.\npm.bat --version
```

### Opção 2: Start Automático

Simplesmente execute:

```bash
.\start.bat
```

Este script:
- Configura automaticamente as variáveis de ambiente
- Cria `.env` se não existir
- Executa `npm run dev`

### Opção 3: PowerShell (Avançado)

```powershell
# Configure PATH
$env:PATH = ".\node;" + $env:PATH

# Execute comandos normalmente
.\node\npm.cmd install
.\node\node.exe seu-script.js
```

## 📋 Estrutura da Instalação

```
gravity-remote/
├── node/                  # Node.js v20 portátil
│   ├── node.exe
│   ├── npm.cmd
│   ├── npx.cmd
│   └── ...
├── node_modules/          # Dependências do projeto (387 pacotes)
├── npm.bat                # Atalho para npm
├── node.bat               # Atalho para node
├── start.bat              # Script de inicialização
├── install-dependencies.bat
├── install.bat
└── ...
```

## 🔧 Arquivos de Configuração

### `npm.bat`
Script portátil que executa npm com Node.js local.

### `node.bat`
Script portátil que executa node com instalação local.

### `start.bat`
Script que inicia o ambiente de desenvolvimento completo.

### `install-dependencies.bat`
Script dedicado para instalar/reinstalar dependências.

## ⚠️ Importante

1. **Não use `npm` do sistema**: Use sempre `.\npm.bat` ou `.\node\npm.cmd`
2. **PATH correto**: Os scripts .bat configuram automaticamente o PATH
3. **Sem privilégios admin**: Esta instalação não requer privilégios administrativos
4. **Portável**: Você pode mover a pasta `gravity-remote` para outro lugar - tudo continuará funcionando

## 🆘 Troubleshooting

### "npm não é reconhecido"
Use `.\npm.bat` em vez de `npm`

### "node não é reconhecido"
Use `.\node.bat` em vez de `node`

### Erro ao instalar dependências
Execute:
```bash
.\install-dependencies.bat
```

### Cache corrompido
```bash
.\node\npm.cmd cache clean --force
.\npm.bat install
```

## 📦 Próximos Passos

1. Configure seu `.env` se necessário:
   ```bash
   copy .env.example .env
   ```

2. Execute o projeto:
   ```bash
   .\start.bat
   ```

## ✨ Recursos

- Node.js v20.11.0 LTS
- NPM 10.2.4
- Portabilidade completa (sem PATH do sistema)
- Sem necessidade de privilégios administrativos
- Funciona em qualquer drive/local

---
**Instalado em**: 23/03/2026
**Versão Node.js**: 20.11.0
**Sem permissões admin**: ✓
