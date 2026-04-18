@echo off
echo Running database migrations...
cd backend
python manage.py makemigrations invoices
python manage.py migrate invoices
echo.
echo Migrations completed successfully!
pause
