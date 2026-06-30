@echo off
title Poto Timide - Setup Turso automatique
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
  echo ERREUR: Node.js non installe.
  pause
  exit /b 1
)

node setup-turso-auto.js
echo.
pause