@echo off
title Poto Timide - Sauvegarde locale
cd /d "%~dp0"
chcp 65001 >nul

set BACKUP_DIR=backups
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

for /f "usebackq delims=" %%i in (`powershell -NoProfile -Command "Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'"`) do set STAMP=%%i

if exist "data\poto-timide.db" (
  copy /Y "data\poto-timide.db" "%BACKUP_DIR%\poto-timide_%STAMP%.db" >nul
  echo Sauvegarde : %BACKUP_DIR%\poto-timide_%STAMP%.db
) else (
  echo ERREUR : base locale introuvable
)

if exist "sync-secret.txt" (
  copy /Y "sync-secret.txt" "%BACKUP_DIR%\sync-secret_%STAMP%.txt" >nul
  echo Sauvegarde : %BACKUP_DIR%\sync-secret_%STAMP%.txt
)

echo.
echo Conservez aussi vos acces GitHub et Render dans un endroit sur.
pause