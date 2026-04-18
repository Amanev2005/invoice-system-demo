@echo off
title PostgreSQL Setup for Invoice System
color 0A

echo ========================================
echo    PostgreSQL Database Setup
echo ========================================
echo.

echo This script will create the PostgreSQL user and database for the Invoice System.
echo.
echo You will need:
echo   1. PostgreSQL installed and running
echo   2. The 'postgres' superuser password
echo.
pause

echo.
echo [1/3] Creating PostgreSQL user 'invoice_user'...
echo.

psql -U postgres -c "CREATE USER invoice_user WITH PASSWORD 'invoice_password';"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Note: User may already exist, continuing...
)

echo.
echo [2/3] Creating database 'invoice_system'...
echo.

psql -U postgres -c "CREATE DATABASE invoice_system OWNER invoice_user;"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Note: Database may already exist, continuing...
)

echo.
echo [3/3] Granting privileges...
echo.

psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE invoice_system TO invoice_user;"

echo.
echo ========================================
echo    PostgreSQL Setup Complete!
echo ========================================
echo.
echo Database credentials:
echo   Database: invoice_system
echo   User: invoice_user
echo   Password: invoice_password
echo   Host: localhost
echo   Port: 5432
echo.
echo You can now run: python init_db.py
echo.
pause
