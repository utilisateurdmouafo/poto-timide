@echo off
title Poto Timide - Deploiement + restauration donnees
cd /d "%~dp0"
chcp 65001 >nul

echo.
echo  1. Deploiement du code sur Render (git push)
echo  2. Synchronisation des donnees locales vers le serveur
echo.

where git >nul 2>&1
if errorlevel 1 (
  set GIT_EXE=C:\Program Files\Git\bin\git.exe
) else (
  set GIT_EXE=git
)

"%GIT_EXE%" add -A
"%GIT_EXE%" -c user.email="deploy@poto-timide.local" -c user.name="Poto Timide" commit -m "Mise a jour Poto Timide" 2>nul
"%GIT_EXE%" push origin main
if errorlevel 1 (
  echo Echec du push Git.
  pause
  exit /b 1
)

echo.
echo Attente du deploiement Render (~1 min)...
timeout /t 60 /nobreak >nul

if exist "C:\Program Files\nodejs\node.exe" (
  "C:\Program Files\nodejs\node.exe" sync-vers-render.js
) else (
  node sync-vers-render.js
)

echo.
pause