@echo off
title Poto Timide - Serveur Node.js + SQLite
cd /d "%~dp0"

echo.
echo  Poto Timide - Installation et demarrage
echo  ======================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo ERREUR: Node.js n'est pas installe.
  echo Telechargez-le sur https://nodejs.org
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo Installation des dependances...
  call npm install
  if errorlevel 1 (
    echo Echec npm install
    pause
    exit /b 1
  )
)

echo.
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
  for /f "tokens=1" %%b in ("%%a") do (
    echo  PC      : http://localhost:8080
    echo  Mobile  : http://%%b:8080
    echo.
  )
)

echo  Identifiants : nom du poto + mot de passe 1234
echo  Premiere connexion : changement de mot de passe obligatoire
echo  Ctrl+C pour arreter
echo.

node server.js