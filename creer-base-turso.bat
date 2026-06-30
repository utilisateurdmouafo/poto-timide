@echo off
title Poto Timide - Creer la base Turso
cd /d "%~dp0"

echo.
echo  Creer la base Turso pour Poto Timide
echo  ====================================
echo.
echo  Etapes dans le navigateur qui va s'ouvrir :
echo.
echo  1. Cliquez "Create Database"
echo  2. Nom : poto-timide
echo  3. Region : choisissez la plus proche (ex: Frankfurt)
echo  4. Ouvrez la base creee
echo  5. Allez dans "Connect" ou "Tokens"
echo  6. Copiez :
echo     - Database URL  (libsql://poto-timide-....turso.io)
echo     - Token           (commence par eyJ...)
echo  7. Collez dans le fichier .env
echo  8. Lancez migrate-to-turso.bat
echo.

start https://app.turso.tech

if not exist ".env" (
  if exist ".env.example" copy ".env.example" ".env" >nul
)

notepad ".env"
echo.
pause