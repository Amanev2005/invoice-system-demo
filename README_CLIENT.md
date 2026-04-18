# Invoice System - Client Deployment Guide

## System Requirements

- **Operating System**: Windows 10 or later
- **Python**: 3.8 or higher
- **Node.js**: 16.x or higher
- **PostgreSQL**: 12 or higher
- **RAM**: Minimum 4GB
- **Disk Space**: Minimum 2GB free space

---

## Installation Steps

### 1. Install Prerequisites

**PostgreSQL:**
1. Download from https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the password you set for the `postgres` user

**Python:**
1. Download from https://www.python.org/downloads/
2. **IMPORTANT**: Check "Add Python to PATH" during installation
3. Install with default settings

**Node.js:**
1. Download from https://nodejs.org/
2. Install with default settings

### 2. Extract Package

Extract the `invoice-system.zip` to your desired location (e.g., `C:\invoice-system`)

### 3. Configure Database

1. Open pgAdmin (installed with PostgreSQL)
2. Connect to PostgreSQL server
3. Create a new database named `invoice_db`
4. Create a user named `invoice_user` with password `invoice123`
5. Grant all privileges on `invoice_db` to `invoice_user`

**OR** use the provided script:
- Run `backend\setup_postgres.bat` and follow the prompts

### 4. Configure Application

1. Open `backend\.env` in a text editor
2. Update the database credentials if different from defaults:
   ```
   DB_NAME=invoice_db
   DB_USER=invoice_user
   DB_PASSWORD=invoice123
   DB_HOST=localhost
   DB_PORT=5432
   ```
3. Save and close the file

### 5. Run Installation

1. Double-click `INSTALL.bat`
2. Wait for installation to complete
3. The script will install all dependencies and initialize the database

---

## Starting the Application

### First Time

1. Double-click `START.bat`
2. Wait for both servers to start (backend and frontend)
3. The application will open automatically in your browser
4. Login with:
   - **Username**: `admin`
   - **Password**: `admin`
5. **IMPORTANT**: Change the admin password immediately after first login

### Subsequent Starts

Simply double-click `START.bat` whenever you want to use the application.

---

## Accessing from Other Devices (LAN)

1. Find your computer's IP address:
   - Open Command Prompt
   - Type: `ipconfig`
   - Look for "IPv4 Address" (e.g., 192.168.1.100)

2. On other devices on the same network:
   - Open browser
   - Go to: `http://YOUR_IP:5173`
   - Example: `http://192.168.1.100:5173`

---

## Backup and Restore

### Automatic Backups

The system automatically backs up the database every day at 2:00 AM.
Backups are stored in: `backend\backups\`
Old backups (>30 days) are automatically deleted.

### Manual Backup

1. Double-click `BACKUP.bat`
2. Backup will be created in `backend\backups\`
3. Backup filename format: `backup_YYYYMMDD_HHMMSS.sql`

### Restore from Backup

1. Open Command Prompt in the `backend` folder
2. Run:
   ```
   python manage.py restore_db backups\backup_YYYYMMDD_HHMMSS.sql --confirm
   ```
3. Replace `backup_YYYYMMDD_HHMMSS.sql` with your actual backup filename

---

## Troubleshooting

### Application Won't Start

**Problem**: "Python is not installed or not in PATH"
- **Solution**: Reinstall Python and check "Add Python to PATH"

**Problem**: "Node.js is not installed or not in PATH"
- **Solution**: Reinstall Node.js

**Problem**: Database connection error
- **Solution**: 
  1. Check PostgreSQL is running (Services → postgresql-x64-XX)
  2. Verify credentials in `backend\.env`
  3. Ensure database `invoice_db` exists

### Can't Access from Other Devices

**Problem**: "This site can't be reached" from other devices
- **Solution**:
  1. Check Windows Firewall settings
  2. Allow ports 5173 and 8000
  3. Ensure all devices are on the same network

### Backup Fails

**Problem**: "pg_dump: command not found"
- **Solution**: Add PostgreSQL bin folder to PATH
  - Default location: `C:\Program Files\PostgreSQL\XX\bin`

---

## Support

For technical support, contact:
- Email: support@example.com
- Phone: +XX-XXXXXXXXXX

---

## Security Recommendations

1. **Change Default Password**: Change admin password immediately after first login
2. **Regular Backups**: Keep backups in a secure location
3. **Firewall**: Only allow necessary ports (5173, 8000, 5432)
4. **Updates**: Keep the system updated with latest security patches
5. **Access Control**: Create separate user accounts for each staff member

---

## License

This software is licensed to: [CLIENT NAME]
License expires: [DATE] (if applicable)
