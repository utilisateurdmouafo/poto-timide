@echo off
title Poto Timide - Configuration Turso
cd /d "%~dp0"

echo.
echo  Configuration Turso - utilisateurdmouafo
echo  =======================================
echo.
echo  METHODE SIMPLE (recommandee)
echo  ----------------------------
echo  1. Ouvrez https://app.turso.tech
echo  2. Cliquez "Create Database" et nommez-la : poto-timide
echo  3. Ouvrez la base poto-timide
echo  4. Onglet "Connect" ou "Tokens" :
echo     - Copiez l'URL (libsql://...)
echo     - Creez un token "Full Access" sans expiration
echo  5. Collez dans .env :
echo       TURSO_DATABASE_URL=libsql://...
echo       TURSO_AUTH_TOKEN=eyJ...
echo  6. Lancez migrate-to-turso.bat
echo.
echo  METHODE AUTOMATIQUE (si vous trouvez les API tokens)
echo  ----------------------------------------------------
echo  1. Sur app.turso.tech : menu profil ^> Settings ^> API Tokens
echo  2. Collez le token dans .env : TURSO_API_TOKEN=...
echo  3. Lancez setup-turso-auto.bat
echo.
echo  Puis sur Render : ajoutez TURSO_DATABASE_URL et TURSO_AUTH_TOKEN
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo ERREUR: Node.js non installe.
  pause
  exit /b 1
)

if not exist ".env" (
  if exist ".env.example" (
    copy ".env.example" ".env" >nul
    echo Fichier .env cree depuis .env.example — editez-le avec vos cles Turso.
    echo.
  ) else (
    echo Creez un fichier .env avec TURSO_DATABASE_URL et TURSO_AUTH_TOKEN.
    pause
    exit /b 1
  )
)

notepad ".env"
echo.
echo  Quand .env est rempli, lancez migrate-to-turso.bat
echo.
pause