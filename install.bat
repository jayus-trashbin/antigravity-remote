@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"
set NODE_DIR=%~dp0node
set PATH=%NODE_DIR%;%PATH%

echo NODE_DIR: %NODE_DIR%
echo Testing Node:
%NODE_DIR%\node.exe --version

%NODE_DIR%\npm.cmd install

pause
