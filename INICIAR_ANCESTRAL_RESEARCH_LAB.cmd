@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Nao foi possivel localizar o Node.js.
  echo Abra este projeto pelo Codex ou instale o Node.js 20 ou superior.
  pause
  exit /b 1
)

start "" "http://localhost:4173"
echo.
echo Ancestral Research Lab iniciado.
echo Mantenha esta janela aberta durante o uso.
echo Para parar, pressione Ctrl+C ou feche esta janela.
echo.
node scripts\server.mjs

if errorlevel 1 (
  echo.
  echo Nao foi possivel iniciar. Verifique se outra copia ja esta aberta.
  pause
)
