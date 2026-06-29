@echo off
title Poto Timide - Sync donnees vers Render
cd /d "%~dp0"
chcp 65001 >nul

echo.
echo  ====================================================
echo   Poto Timide - Synchronisation locale vers Render
echo  ====================================================
echo.
echo  Envoie la base SQLite locale vers :
echo  https://poto-timide.onrender.com
echo.
echo  Methode 1 (recommandee) : fichier sync-secret.txt
echo  Methode 2 (secours)     : dario / 1234 via login admin
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo ERREUR : installez Node.js depuis https://nodejs.org
  pause
  exit /b 1
)

node sync-vers-render.js
set EXIT_CODE=%ERRORLEVEL%

echo.
if %EXIT_CODE% neq 0 (
  echo  La synchronisation a echoue.
) else (
  echo  Synchronisation terminee.
)
pause
exit /b %EXIT_CODE%