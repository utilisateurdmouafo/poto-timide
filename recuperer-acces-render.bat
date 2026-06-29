@echo off
title Poto Timide - Recuperation acces proprietaire
cd /d "%~dp0"
chcp 65001 >nul

echo.
echo  Restaure vos droits admin sur Render (proprietaire : Dario)
echo  Utilise sync-secret.txt — ne partagez jamais ce fichier.
echo.

where node >nul 2>&1
if errorlevel 1 (
  set NODE_EXE=C:\Program Files\nodejs\node.exe
) else (
  set NODE_EXE=node
)

"%NODE_EXE%" recuperer-acces-render.js
pause