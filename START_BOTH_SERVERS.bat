@echo off
setlocal enabledelayedexpansion
title Invoice System Launcher - STABLE
color 0B

echo ========================================
echo    Invoice System - Starting Servers
echo ========================================
echo.

set "SCRIPT_DIR=%~dp0"
set "BACKEND_DIR=%SCRIPT_DIR%backend"
set "FRONTEND_DIR=%SCRIPT_DIR%frontend"

echo [0/4] Cleaning stale processes...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1
timeout /t 1 /nobreak >nul

echo [1/4] Checking PostgreSQL status...
:CHECK_POSTGRES
netstat -ano | findstr :5432 >nul
if %ERRORLEVEL% NEQ 0 (
    echo [WAIT] Waiting for PostgreSQL service on port 5432...
    timeout /t 3 /nobreak >nul
    goto CHECK_POSTGRES
)
echo [OK] PostgreSQL is active.

echo.
echo [2/4] Initializing Environment...
cd /d "%BACKEND_DIR%"
if not exist "venv\" (
    echo [ERROR] Virtual environment missing!
    pause
    exit /b 1
)

echo [3/4] Database Check...
call venv\Scripts\activate
python init_db.py
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] init_db.py error.
)

echo.
echo [4/4] Launching Services...

echo [START] Launching Backend Server...
start "Invoice Backend" /MIN /D "%BACKEND_DIR%" cmd /c "call venv\Scripts\activate && python manage.py runserver 127.0.0.1:8000"

echo [START] Launching Frontend [Vite]...
start "Invoice Frontend" /MIN /D "%FRONTEND_DIR%" cmd /c "npm run dev"

echo.
echo ========================================
echo    Waiting for services to initialize...
echo ========================================
timeout /t 10 /nobreak >nul

echo [OPEN] Launching browser at http://127.0.0.1:5173
start http://127.0.0.1:5173

echo.
echo ============================================================
echo   SYSTEM IS RUNNING (Minimized)
echo ============================================================
echo.
echo KEEP THIS WINDOW OPEN while working.
echo.
echo [Q] Stop all servers and Exit
echo [R] Restart Frontend (if page is blank)
echo.

:MENU
choice /C QR /N /M "Choose an option [Q/R]: "
if %ERRORLEVEL% EQU 1 goto STOP
if %ERRORLEVEL% EQU 2 goto REFRESH

:REFRESH
echo Refreshing Frontend...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
start "Invoice Frontend" /MIN /D "%FRONTEND_DIR%" cmd /c "npm run dev"
echo Done.
goto MENU

:STOP
echo.
echo Stopping all Invoice System services...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1
echo Done!
timeout /t 2 /nobreak >nul
exit

