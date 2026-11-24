@echo off
cd /d "%~dp0"
where node >nul 2>nul || (echo Install Node.js 22 or newer first. & pause & exit /b 1)
if exist dist\build-manifest.json (
  node scripts\local-server.mjs --dist
) else (
  if not exist node_modules\three\build\three.module.js call npm.cmd install --no-audit --no-fund
  if errorlevel 1 exit /b 1
  node scripts\local-server.mjs
)
pause
