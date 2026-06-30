@echo off
title Poto Timide - Migration vers Turso
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
  echo ERREUR: Node.js non installe.
  pause
  exit /b 1
)

if not exist ".env" (
  echo Fichier .env manquant. Lancez configurer-turso.bat d'abord.
  pause
  exit /b 1
)

echo Migration des donnees locales vers Turso...
echo.
node migrate-to-turso.js
echo.
pause