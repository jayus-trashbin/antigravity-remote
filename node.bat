@echo off
REM Script portátil para rodar node usando instalação local
setlocal enabledelayedexpansion

set NODE_DIR=%~dp0node
set PATH=%NODE_DIR%;%~dp0node_modules\.bin;%PATH%

REM Executa node com os argumentos passados
%NODE_DIR%\node.exe %*

endlocal
