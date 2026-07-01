@echo off
cd /d "%~dp0"
echo Import Finance poto_vitran.xlsx vers la base locale...
node import-finance-vitran.js
if errorlevel 1 pause & exit /b 1
echo.
echo OK. Lancez sync-vers-render.bat pour publier sur Render.
pause