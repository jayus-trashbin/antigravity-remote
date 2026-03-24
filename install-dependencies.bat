@echo off
REM Script portátil de instalação de dependências
setlocal enabledelayedexpansion

set NODE_DIR=%~dp0node
set PATH=%NODE_DIR%;%~dp0node_modules\.bin;%PATH%

echo ========================================
echo Node.js Portable Installation
echo ========================================
echo Node.js Version:
%NODE_DIR%\node.exe --version
echo NPM Version:
%NODE_DIR%\npm.cmd --version
echo.
echo Instalando dependências do projeto...
echo ========================================
echo.

%NODE_DIR%\npm.cmd install

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo [SUCCESS] Dependências instaladas!
    echo ========================================
    echo.
    echo Você pode usar os seguintes comandos:
    echo   .\npm.bat install
    echo   .\npm.bat run dev
    echo   .\npm.bat build
    echo   .\node.bat seu-script.js
    echo.
    echo OU simplesmente execute:
    echo   .\start.bat
) else (
    echo.
    echo [ERROR] Falha na instalação!
)

endlocal
pause
