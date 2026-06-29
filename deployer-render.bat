@echo off
title Poto Timide - Deploiement cloud Render (gratuit)
cd /d "%~dp0"
chcp 65001 >nul

echo.
echo  ====================================================
echo   Poto Timide - Acces 24h/24 sans PC (Render gratuit)
echo  ====================================================
echo.
echo  Votre app sera en ligne sur une URL du type :
echo  https://poto-timide.onrender.com
echo.
echo  Limites gratuites Render :
echo  - Le site dort apres 15 min sans visite (~30 s au reveil)
echo  - Donnees conservees tant que vous ne redeployez pas
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo ERREUR : installez Node.js depuis https://nodejs.org
  pause
  exit /b 1
)

where git >nul 2>&1
if errorlevel 1 (
  echo Git n'est pas installe. Installation en cours...
  winget install --id Git.Git -e --accept-source-agreements --accept-package-agreements
  if errorlevel 1 (
    echo Echec installation Git. Installez-le : https://git-scm.com
    pause
    exit /b 1
  )
  echo Relancez ce script apres installation de Git.
  pause
  exit /b 0
)

if not exist ".git" (
  echo Initialisation du depot Git local...
  git init
  git branch -M main
)

echo.
echo  Etape 1 - Compte GitHub (gratuit)
echo  ---------------------------------
echo  1. Allez sur https://github.com/new
echo  2. Nom du depot : poto-timide
echo  3. Cochez "Private" si vous voulez
echo  4. NE cochez PAS "Add README"
echo  5. Cliquez "Create repository"
echo.
set /p GITHUB_USER=Votre identifiant GitHub : 
if "%GITHUB_USER%"=="" (
  echo Identifiant requis.
  pause
  exit /b 1
)

echo.
echo  Etape 2 - Envoi du code sur GitHub
echo  ----------------------------------
git add .
git commit -m "Poto Timide - pret pour Render" 2>nul
if errorlevel 1 (
  git commit -m "Poto Timide - mise a jour Render" --allow-empty
)
git remote remove origin 2>nul
git remote add origin https://github.com/%GITHUB_USER%/poto-timide.git
echo.
echo  GitHub va demander vos identifiants (ou un token).
echo  Token : GitHub ^> Settings ^> Developer settings ^> Personal access tokens
echo.
git push -u origin main
if errorlevel 1 (
  echo.
  echo  Echec du push. Verifiez que le depot GitHub existe et vos acces.
  pause
  exit /b 1
)

echo.
echo  Etape 3 - Deploiement sur Render (gratuit)
echo  ------------------------------------------
echo  1. Allez sur https://dashboard.render.com
echo  2. Connectez-vous avec GitHub
echo  3. Cliquez "New +" puis "Blueprint"
echo  4. Selectionnez le depot poto-timide
echo  5. Render lit render.yaml et deploie automatiquement
echo  6. Attendez 3-5 min : votre URL apparait en haut du dashboard
echo.
echo  Identifiants app : nom du poto + mot de passe 1234
echo.
echo  Termine cote preparation ! Suivez l'etape 3 sur Render.
pause