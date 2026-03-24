@echo off
REM Script portátil para rodar npm usando instalação local
setlocal enabledelayedexpansion

set NODE_DIR=%~dp0node
set PATH=%NODE_DIR%;%~dp0node_modules\.bin;%PATH%

REM Executa npm com os argumentos passados
%NODE_DIR%\npm.cmd %*

endlocal
