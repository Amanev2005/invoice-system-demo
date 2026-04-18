@echo off
echo ============================================
echo   Fix PostgreSQL User Password
echo ============================================
echo.
echo This will reset the password for invoice_user
echo.
pause

echo.
echo Resetting password for 'invoice_user'...
.\electron-installer\resources\postgresql\bin\psql.exe -U postgres -c "ALTER USER invoice_user WITH PASSWORD 'invoice_password';"

echo.
echo Granting all privileges...
.\electron-installer\resources\postgresql\bin\psql.exe -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE invoice_system TO invoice_user;"

echo.
echo Granting schema privileges...
.\electron-installer\resources\postgresql\bin\psql.exe -U postgres -d invoice_system -c "GRANT ALL ON SCHEMA public TO invoice_user;"

echo.
echo ============================================
echo   Password Reset Complete!
echo ============================================
echo.
echo Now test with: cd backend ; python init_db.py
echo.
pause
