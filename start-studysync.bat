@echo off
setlocal
title StudySync - Personalized Student Study Planner

set "ROOT=%~dp0"
set "PHP_PATH=%LOCALAPPDATA%\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe"
if not exist "%PHP_PATH%" set "PHP_PATH=php"
set "BACKEND_PORT=8001"
set "APP_URL=http://127.0.0.1:5173"
set "API_URL=http://127.0.0.1:%BACKEND_PORT%/api/dashboard"

echo Checking StudySync backend...
curl.exe --silent --fail "http://127.0.0.1:%BACKEND_PORT%/" >nul 2>&1
if not errorlevel 1 goto backend_ready

echo Starting PHP API on port %BACKEND_PORT%...
start "StudySync Backend" /min /D "%ROOT%backend" "%PHP_PATH%" -S 127.0.0.1:%BACKEND_PORT% router.php

echo Waiting for the API and database...
for /L %%i in (1,1,20) do (
  curl.exe --silent --fail "http://127.0.0.1:%BACKEND_PORT%/" >nul 2>&1
  if not errorlevel 1 goto backend_ready
  ping -n 2 127.0.0.1 >nul
)

echo StudySync backend did not start. Check PHP and MySQL, then try again.
pause
exit /b 1

:backend_ready
echo Checking StudySync frontend...
curl.exe --silent --fail "%APP_URL%" >nul 2>&1
if not errorlevel 1 goto app_ready

echo Starting StudySync React frontend on port 5173...
start "StudySync Frontend" /D "%ROOT%frontend" cmd.exe /k "npm run dev -- --host 127.0.0.1 --strictPort"

echo Waiting for the web app...
for /L %%i in (1,1,20) do (
  curl.exe --silent --fail "%APP_URL%" >nul 2>&1
  if not errorlevel 1 goto app_ready
  ping -n 2 127.0.0.1 >nul
)

echo StudySync frontend did not start. Check that npm dependencies are installed.
pause
exit /b 1

:app_ready
echo.
echo StudySync is running:
echo Open this link: %APP_URL%
echo The frontend connects to the PHP API automatically.
echo.
start "" "%APP_URL%"
