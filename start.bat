@echo off
set NODE_DIR=c:\Users\kawe.pinto\Documents\Projetos\plex-voice\node-v20.11.0-win-x64
set PATH=%NODE_DIR%;%~dp0node_modules\.bin;%PATH%
set NODE_EXE=%NODE_DIR%\node.exe
set NPM_CMD=%NODE_DIR%\npm.cmd

echo [Antigravity Remote] Iniciando ambiente...

:: Verifica se o .env existe
if not exist .env ( 
    echo [!] Arquivo .env nao encontrado. Criando um padrao...
    copy .env.example .env
)

:: Inicia o servidor e o cliente simultaneamente
echo [OK] Rodando npm run dev...
call %NPM_CMD% run dev

pause
