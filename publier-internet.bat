@echo off
title Poto Timide - Publication Internet (localtunnel)
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
  echo Installez Node.js depuis https://nodejs.org
  pause
  exit /b 1
)

echo.
echo  ============================================
echo   Poto Timide - Lien public Internet
echo  ============================================
echo.
echo  IMPORTANT :
echo  - Lancez d'abord demarrer-serveur.bat (autre fenetre)
echo  - Gardez CETTE fenetre ouverte (sinon : tunnel unavailable)
echo  - L'URL change a chaque lancement
echo  - Sur mobile, si une page "Tunnel Password" s'affiche :
echo    allez sur https://loca.lt et entrez l'IP affichee ci-dessous
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
  for /f "tokens=1" %%b in ("%%a") do echo  IP tunnel (mot de passe loca.lt) : %%b
)

echo.
echo  Alternative plus stable (meme Wi-Fi que le PC) :
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
  for /f "tokens=1" %%b in ("%%a") do echo  http://%%b:8080
)
echo.
echo  Demarrage du tunnel...
echo.

npx --yes localtunnel --port 8080 2>&1 | powershell -NoProfile -Command ^
  "$input | ForEach-Object { $_ | Write-Host; if ($_ -match 'your url is:\s*(https?://\S+)') { Set-Content -Path 'lien-public.txt' -Value $Matches[1].Trim() -Encoding UTF8; Write-Host ''; Write-Host '  >>> Lien enregistre dans lien-public.txt <<<' -ForegroundColor Green } }"

pause