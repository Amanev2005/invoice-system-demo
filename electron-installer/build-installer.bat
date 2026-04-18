@echo off
REM ============================================================
REM  Invoice System - Single EXE Installer Builder
REM  Output: electron-installer\dist\Invoice System-Setup-*.exe
REM ============================================================
setlocal enabledelayedexpansion
echo.
echo ============================================================
echo   Invoice System - Build Installer
echo ============================================================
echo.

REM ---- STEP 0: Check Prerequisites ----
echo [0/4] Checking prerequisites...

REM Check Node.js
where node >nul 2>&1
if errorlevel 1 (
    echo.
    echo  ERROR: Node.js is not installed or not in PATH.
    echo  Please install Node.js from https://nodejs.org/ and try again.
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do set NODE_VER=%%v
echo  Node.js : !NODE_VER!

REM Check npm
where npm >nul 2>&1
if errorlevel 1 (
    echo.
    echo  ERROR: npm is not found. Please reinstall Node.js.
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('npm --version') do set NPM_VER=%%v
echo  npm     : v!NPM_VER!

REM Check embedded Python resources
if not exist "%~dp0resources\python\python.exe" (
    echo.
    echo  ERROR: Embedded Python not found at:
    echo         %~dp0resources\python\python.exe
    echo.
    echo  Please run prepare-resources.bat first to download
    echo  and configure the embedded Python and PostgreSQL.
    echo.
    pause
    exit /b 1
)
echo  Python  : OK (embedded found)

REM Check embedded PostgreSQL resources
if not exist "%~dp0resources\postgresql\bin\postgres.exe" (
    echo.
    echo  ERROR: Embedded PostgreSQL not found at:
    echo         %~dp0resources\postgresql\bin\postgres.exe
    echo.
    echo  Please run prepare-resources.bat first.
    echo.
    pause
    exit /b 1
)
echo  PostgreSQL: OK (embedded found)
echo.

REM ---- STEP 1: Build Frontend ----
echo [1/4] Building frontend (React/Vite)...
echo  Working directory: %~dp0..\frontend
echo.

cd /d "%~dp0..\frontend"
call npm run build
if errorlevel 1 (
    echo.
    echo  ERROR: Frontend build failed!
    echo  Check the error above and fix it before retrying.
    echo.
    pause
    exit /b 1
)
echo.
echo  Frontend build complete.
echo.

REM ---- STEP 2: Install Electron Dependencies ----
echo [2/4] Installing Electron dependencies...
echo  Working directory: %~dp0
echo.

cd /d "%~dp0"
call npm install
if errorlevel 1 (
    echo.
    echo  ERROR: npm install failed in electron-installer!
    echo.
    pause
    exit /b 1
)
echo.
echo  Electron dependencies installed.
echo.

REM ---- STEP 3: Clean Previous Build ----
echo [3/4] Cleaning previous build output...
if exist "%~dp0dist" (
    echo  Removing old dist folder...
    rmdir /s /q "%~dp0dist"
    echo  Old dist removed.
) else (
    echo  No previous dist folder found, skipping.
)
echo.

REM ---- STEP 4: Build EXE Installer ----
echo [4/4] Building single EXE installer with electron-builder...
echo  This may take several minutes depending on the resource size.
echo  Target: Windows x64 NSIS installer
echo.

cd /d "%~dp0"
call npm run build
if errorlevel 1 (
    echo.
    echo  ERROR: electron-builder failed!
    echo  Check the error above. Common issues:
    echo    - Missing icon.ico
    echo    - Missing frontend/dist (step 1 failed silently)
    echo    - Insufficient disk space
    echo.
    pause
    exit /b 1
)

REM ---- Done ----
echo.
echo ============================================================
echo   Build Complete!
echo ============================================================
echo.
echo   Installer location: electron-installer\dist\
echo.

if exist "%~dp0dist\*.exe" (
    echo   Output file(s):
    for %%f in ("%~dp0dist\*.exe") do (
        echo     %%~nxf
        echo     Size: %%~zf bytes
    )
) else (
    echo   WARNING: No .exe found in dist\ - check build logs above.
)

echo.
echo   To deploy: Copy the .exe to your client machine and run it.
echo   The installer includes all dependencies (Python + PostgreSQL).
echo.
pause
