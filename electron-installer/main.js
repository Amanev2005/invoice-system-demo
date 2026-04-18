const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const PostgreSQLManager = require('./pg-manager');
const BackendManager = require('./backend-manager');

// Capture original console methods immediately
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// Setup simple file logging
let logFile;
function getLogFile() {
    if (!logFile) {
        try {
            logFile = path.join(app.getPath('userData'), 'main.log');
        } catch (e) {
            return null;
        }
    }
    return logFile;
}

function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp}: ${message}\n`;
    const file = getLogFile();
    if (file) {
        try {
            fs.appendFileSync(file, logMessage);
        } catch (e) {
            // Ignore logging errors
        }
    }
    if (originalConsoleLog) {
        originalConsoleLog(message);
    }
}

// Redirect console to file
console.log = (...args) => {
    log(args.map(a => String(a)).join(' '));
};
console.error = (...args) => {
    const errorMsg = args.map(a => String(a)).join(' ');
    const timestamp = new Date().toISOString();
    const file = getLogFile();
    if (file) {
        try {
            fs.appendFileSync(file, `${timestamp}: ERROR: ${errorMsg}\n`);
        } catch (e) { }
    }
    if (originalConsoleError) {
        originalConsoleError('ERROR:', errorMsg);
    }
};

let mainWindow;
let pgManager;
let backendManager;
let isFirstRun = false;

// Determine if running in development or production
const isDev = !app.isPackaged;

// Get resource paths
const getResourcePath = () => {
    if (isDev) {
        return path.join(__dirname, 'resources');
    } else {
        return process.resourcesPath;
    }
};

// Check if this is the first run
function checkFirstRun() {
    const appDataPath = app.getPath('userData');
    const dataDir = path.join(appDataPath, 'postgresql-data');
    // Check if data directory exists and has content (PG_VERSION is a standard file)
    return !fs.existsSync(dataDir) || !fs.existsSync(path.join(dataDir, 'PG_VERSION'));
}



// Create the main window
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'icon.ico'),
        title: 'Invoice System'
    });

    // Remove menu in production
    if (!isDev) {
        Menu.setApplicationMenu(null);
    }

    // Load the frontend
    const frontendPath = path.join(getResourcePath(), 'app', 'frontend', 'index.html');

    if (fs.existsSync(frontendPath)) {
        mainWindow.loadFile(frontendPath);
    } else {
        // Fallback to localhost if file doesn't exist
        mainWindow.loadURL('http://localhost:5173');
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Show loading window
function showLoadingWindow() {
    log('Showing loading window...');
    const loadingWindow = new BrowserWindow({
        width: 400,
        height: 300,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false // Required for simple ipcRenderer usage in loading.html
        }
    });

    loadingWindow.loadFile(path.join(__dirname, 'loading.html'));

    loadingWindow.on('closed', () => {
        log('Loading window closed');
    });

    return loadingWindow;
}

function updateStatus(window, message) {
    log(`Status Update: ${message}`);
    if (window && !window.isDestroyed()) {
        window.webContents.send('update-status', message);
    }
}

// Initialize application
async function initializeApp() {
    log('Starting application initialization...');
    const loadingWindow = showLoadingWindow();

    try {
        const resourcePath = getResourcePath();
        log(`Resource path: ${resourcePath}`);

        isFirstRun = checkFirstRun();
        log(`First run detection: ${isFirstRun}`);

        // Initialize PostgreSQL Manager
        pgManager = new PostgreSQLManager(resourcePath);

        // If first run, initialize cluster first
        if (isFirstRun) {
            updateStatus(loadingWindow, 'Initializing database cluster...');
            await pgManager.initCluster();
        }

        // Check if PostgreSQL is already running
        const isRunning = await pgManager.isRunning();
        log(`PostgreSQL running state: ${isRunning}`);

        if (!isRunning) {
            updateStatus(loadingWindow, 'Starting database...');
            await pgManager.start();
        }

        // Initialize database on every startup (it's idempotent)
        updateStatus(loadingWindow, 'Verifying database setup...');
        await pgManager.initialize();

        // Initialize Backend Manager
        backendManager = new BackendManager(resourcePath);

        // Always ensure migrations are up to date
        updateStatus(loadingWindow, 'Checking migrations...');
        await backendManager.runMigrations();

        // Only create superuser on real first run or if it's needed
        if (isFirstRun) {
            updateStatus(loadingWindow, 'Creating admin user...');
            await backendManager.createSuperuser();
        }

        // Start backend server
        updateStatus(loadingWindow, 'Starting application...');
        await backendManager.start();

        // Close loading window and create main window
        log('Initialization complete, launching main window');
        loadingWindow.close();
        createWindow();

        // Show first-run message
        if (isFirstRun) {
            setTimeout(() => {
                if (mainWindow && !mainWindow.isDestroyed()) {
                    dialog.showMessageBox(mainWindow, {
                        type: 'info',
                        title: 'Welcome to Invoice System',
                        message: 'First Time Setup Complete!',
                        detail: 'Default login credentials:\nUsername: admin\nPassword: admin\n\nPlease change your password after logging in.',
                        buttons: ['OK']
                    });
                }
            }, 2000);
        }

    } catch (error) {
        log(`CRITICAL INITIALIZATION ERROR: ${error.stack || error.message}`);

        if (loadingWindow && !loadingWindow.isDestroyed()) {
            loadingWindow.close();
        }

        dialog.showErrorBox(
            'Initialization Error',
            `Failed to start the application:\n\n${error.message}\n\nPlease check the logs in AppData for more details.`
        );

        app.quit();
    }
}

// Cleanup on quit
async function cleanup() {
    console.log('Cleaning up...');

    if (backendManager) {
        await backendManager.stop();
    }

    if (pgManager) {
        await pgManager.stop();
    }
}

// App event handlers
app.on('ready', initializeApp);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

app.on('before-quit', async (event) => {
    event.preventDefault();
    await cleanup();
    app.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    dialog.showErrorBox('Error', `An error occurred: ${error.message}`);
});
