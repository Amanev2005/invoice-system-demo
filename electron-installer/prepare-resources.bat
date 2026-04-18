@echo off
REM Prepare Embedded Resources for Electron Installer
echo ========================================
echo Preparing Embedded Resources
echo ========================================
echo.

REM Create resources directory
if not exist "resources" mkdir resources
if not exist "resources\python" mkdir resources\python
if not exist "resources\postgresql" mkdir resources\postgresql

echo [1/6] Downloading Python embeddable package...
echo This may take a few minutes...
powershell -Command "& {Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.11.8/python-3.11.8-embed-amd64.zip' -OutFile 'resources\python.zip'}"
if errorlevel 1 (
    echo ERROR: Failed to download Python
    pause
    exit /b 1
)

echo [2/6] Extracting Python...
powershell -Command "& {Expand-Archive -Path 'resources\python.zip' -DestinationPath 'resources\python' -Force}"
del resources\python.zip

echo [3/6] Configuring Python...
call setup-python.bat

echo [4/6] Downloading PostgreSQL portable...
echo This may take several minutes (80 MB)...
powershell -Command "& {Invoke-WebRequest -Uri 'https://get.enterprisedb.com/postgresql/postgresql-15.5-1-windows-x64-binaries.zip' -OutFile 'resources\postgresql.zip'}"
if errorlevel 1 (
    echo ERROR: Failed to download PostgreSQL
    pause
    exit /b 1
)

echo [5/6] Extracting PostgreSQL...
powershell -Command "& {Expand-Archive -Path 'resources\postgresql.zip' -DestinationPath 'resources\postgresql-temp' -Force}"
move resources\postgresql-temp\pgsql\* resources\postgresql\
rmdir /s /q resources\postgresql-temp
del resources\postgresql.zip

echo [6/6] Configuring PostgreSQL...
call setup-postgresql.bat

echo.
echo ========================================
echo Resources Prepared Successfully!
echo ========================================
echo.
echo Python: resources\python
echo PostgreSQL: resources\postgresql
echo.
echo Next step: Run build-installer.bat
pause
