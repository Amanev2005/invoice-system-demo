@echo off
echo ==========================================
echo      Invoice System - Initial Setup
echo ==========================================
echo.

cd backend

echo [1/4] Creating virtual environment...
python -m venv venv
call venv\Scripts\activate

echo [2/4] Installing dependencies...
pip install -r requirements.txt

echo [3/4] Setting up database...
python manage.py migrate

echo [4/4] Collecting static files...
python manage.py collectstatic --noinput

echo.
echo ==========================================
echo      Setup Complete! You can now run
echo      the application using run_app.bat
echo ==========================================
pause
