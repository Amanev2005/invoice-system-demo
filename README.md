# Invoice System - PostgreSQL Multi-User Edition

Complete invoice management system with PostgreSQL database for multi-user LAN access.

## 🚀 Quick Start

### For End Users (Client Installation)

1. **Download the installer**: `Invoice-System-Setup-1.0.0.exe`
2. **Run the installer** and follow the setup wizard
3. **Launch the application** from desktop or start menu
4. **First login**: Username: `admin`, Password: `admin` (change immediately!)

The application will:
- Automatically start PostgreSQL database
- Initialize the database on first run
- Start the backend server
- Open the application window

### For Developers

#### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- PostgreSQL 15+ (for development)
- Git

#### Development Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd invoice-system
```

2. **Install PostgreSQL** (Development only)
   - Download from: https://www.postgresql.org/download/windows/
   - Install PostgreSQL 15.x
   - Remember the password for 'postgres' user

3. **Setup Backend**
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Create .env file
copy .env.example .env
# Edit .env with your PostgreSQL credentials

# Initialize database
python init_db.py
```

4. **Setup Frontend**
```bash
cd frontend
npm install
npm run build
```

5. **Setup Electron Installer**
```bash
cd electron-installer
npm install
```

6. **Download PostgreSQL Portable** (For bundling)
   - See `POSTGRESQL_SETUP.md` for detailed instructions
   - Extract to `electron-installer/resources/postgresql/`

7. **Start Development Servers**
```bash
# From root directory
START_BOTH_SERVERS.bat
```

## 📦 Building the Installer

### Automated Build (Recommended)

```bash
build-installer.bat
```

This will:
1. Build the frontend
2. Install dependencies
3. Copy resources to electron-installer/resources/
4. Install Python dependencies
5. Build the Electron installer

### Manual Build Steps

```bash
# 1. Build frontend
cd frontend
npm run build

# 2. Install Electron dependencies
cd ../electron-installer
npm install

# 3. Copy resources
node copy-resources.js

# 4. Install Python dependencies in resources
cd resources/backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
deactivate

# 5. Build installer
cd ../..
npm run dist
```

Installer will be in: `electron-installer/dist/`

## 🗄️ Database Migration

If you have existing SQLite data, see `DATA_MIGRATION_GUIDE.md` for migration instructions.

## 🌐 Multi-User LAN Access

### Server Setup (One Machine)

1. Install the application on the server machine
2. Note the server's IP address (e.g., `192.168.1.100`)
3. Configure Windows Firewall to allow port 8000

### Client Setup (Other Machines)

**Option A: Standalone Installation**
- Each machine has its own database (isolated data)
- Install normally on each machine

**Option B: Central Server (Shared Database)**
1. Install on client machines
2. After installation, edit the `.env` file:
   - Location: `C:\Users\<Username>\AppData\Roaming\InvoiceSystem\backend\.env`
   - Update: `DB_HOST=192.168.1.100` (server IP)
3. Restart the application

### Firewall Configuration

On the server machine:
```powershell
# Allow port 8000 for backend API
netsh advfirewall firewall add rule name="Invoice System Backend" dir=in action=allow protocol=TCP localport=8000

# Allow PostgreSQL (if using central database)
netsh advfirewall firewall add rule name="Invoice System PostgreSQL" dir=in action=allow protocol=TCP localport=5432
```

## 📁 Project Structure

```
invoice-system/
├── backend/                    # Django backend (development)
│   ├── config/                # Django settings
│   ├── invoices/              # Main app
│   ├── requirements.txt       # Python dependencies
│   ├── gunicorn_config.py     # Production server config
│   ├── init_db.py            # Database initialization
│   └── .env.example          # Environment template
├── frontend/                   # React frontend (development)
│   ├── src/                   # Source code
│   ├── dist/                  # Built files (after npm run build)
│   └── package.json
├── electron-installer/         # Electron packaging
│   ├── resources/             # Bundled resources (created during build)
│   │   ├── backend/          # Copied from ../backend
│   │   ├── frontend/         # Copied from ../frontend/dist
│   │   ├── python/           # Embedded Python
│   │   └── postgresql/       # PostgreSQL binaries
│   ├── main.js               # Electron main process
│   ├── pg-manager.js         # PostgreSQL manager
│   ├── copy-resources.js     # Build script
│   └── package.json
├── START_BOTH_SERVERS.bat     # Development server launcher
├── build-installer.bat        # Automated build script
├── POSTGRESQL_SETUP.md        # PostgreSQL setup guide
└── DATA_MIGRATION_GUIDE.md    # Migration guide
```

## 🔧 Configuration

### Environment Variables (.env)

```env
# Database
DB_ENGINE=postgresql
DB_NAME=invoice_system
DB_USER=invoice_user
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432

# Django
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,*

# Server
SERVER_HOST=0.0.0.0
SERVER_PORT=8000
```

### Production Settings

For production deployment:
- Set `DEBUG=False`
- Use a strong `SECRET_KEY`
- Configure `ALLOWED_HOSTS` with specific IPs/domains
- Use strong PostgreSQL password
- Enable HTTPS (if needed)

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Manual Testing Checklist
- [ ] Fresh installation on clean machine
- [ ] Database initialization
- [ ] Create invoice
- [ ] Edit invoice
- [ ] Delete invoice
- [ ] Generate reports
- [ ] Multi-user access from LAN
- [ ] Data persistence after restart
- [ ] Uninstaller cleanup

## 📝 Features

- ✅ Multi-user PostgreSQL database
- ✅ LAN access support
- ✅ Gunicorn production server
- ✅ Embedded PostgreSQL (no separate installation needed)
- ✅ Automatic database initialization
- ✅ Invoice management (create, edit, delete)
- ✅ Client management
- ✅ Product catalog
- ✅ Payment tracking
- ✅ Reports and analytics
- ✅ Email invoices (PDF)
- ✅ Export to Excel/CSV
- ✅ Statement of Accounts
- ✅ Aging reports

## 🐛 Troubleshooting

### Application won't start
- Check if PostgreSQL port (5432) is available
- Check logs in: `%APPDATA%\InvoiceSystem\logs\`
- Try running as administrator

### Database connection errors
- Verify PostgreSQL is running
- Check `.env` file credentials
- Ensure firewall allows PostgreSQL port

### LAN access not working
- Check Windows Firewall settings
- Verify server IP address is correct
- Ensure both machines are on same network
- Try accessing: `http://SERVER_IP:8000/api/invoices/`

### Build errors
- Ensure PostgreSQL binaries are in `electron-installer/resources/postgresql/`
- Check Node.js and Python versions
- Delete `node_modules` and reinstall: `npm install`
- Delete `venv` and recreate: `python -m venv venv`

## 📄 License

MIT License - See LICENSE.txt

## 🤝 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the setup guides (POSTGRESQL_SETUP.md, DATA_MIGRATION_GUIDE.md)
3. Check application logs
4. Contact support

## 🔄 Updates

To update the application:
1. Download new installer
2. Run installer (it will upgrade existing installation)
3. Database will be preserved

## 🔐 Security Notes

- Change default admin password immediately after first login
- Use strong PostgreSQL passwords
- Keep the application updated
- Regular database backups recommended
- For internet access, use VPN or proper firewall rules

## 📊 Performance Tips

- For best performance with many users, use dedicated PostgreSQL server
- Adjust Gunicorn workers in `gunicorn_config.py` based on CPU cores
- Regular database maintenance (VACUUM, ANALYZE)
- Monitor disk space for database growth

## 🎯 Roadmap

- [ ] Automated database backups
- [ ] User authentication and permissions
- [ ] Mobile app support
- [ ] Cloud synchronization
- [ ] Advanced reporting
- [ ] Multi-currency support
