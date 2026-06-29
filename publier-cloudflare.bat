@echo off
title Poto Timide - Publication Internet (Cloudflare)
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
  echo Installez Node.js depuis https://nodejs.org
  pause
  exit /b 1
)

echo.
echo  ============================================
echo   Poto Timide - Lien public (Cloudflare)
echo  ============================================
echo.
echo  1. Lancez demarrer-serveur.bat dans une autre fenetre
echo  2. Gardez CETTE fenetre ouverte
echo  3. L'URL s'affiche ci-dessous (trycloudflare.com)
echo.
echo  Plus stable que localtunnel, sans mot de passe tunnel.
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
  for /f "tokens=1" %%b in ("%%a") do echo  Meme Wi-Fi (encore plus stable) : http://%%b:8080
)
echo.
echo  Demarrage du tunnel Cloudflare...
echo.

npx --yes cloudflared tunnel --url http://localhost:8080 2>&1 | powershell -NoProfile -Command ^
  "$input | ForEach-Object { $_ | Write-Host; if ($_ -match 'https://[a-z0-9-]+\.trycloudflare\.com') { Set-Content -Path 'lien-public.txt' -Value $Matches[0].Trim() -Encoding UTF8; Write-Host ''; Write-Host '  >>> Lien enregistre dans lien-public.txt <<<' -ForegroundColor Green } }"

pause