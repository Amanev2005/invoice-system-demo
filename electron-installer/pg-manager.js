const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

class PostgreSQLManager {
    constructor(resourcePath) {
        this.pgPath = path.join(resourcePath, 'postgresql', 'bin');

        // Use AppData for data directory to avoid permission issues in Program Files
        const appDataPath = app.getPath('userData');
        this.dataPath = path.join(appDataPath, 'postgresql-data');
        this.logPath = path.join(this.dataPath, 'log');
        this.pgProcess = null;
    }

    configure() {
        try {
            console.log('Configuring PostgreSQL...');
            const confPath = path.join(this.dataPath, 'postgresql.conf');
            const hbaPath = path.join(this.dataPath, 'pg_hba.conf');

            // Configure postgresql.conf
            // We overwrite to ensure consistent minimal configuration, matching setup-postgresql.bat
            const confContent = [
                "port = 5433",
                "listen_addresses = '127.0.0.1'",
                "max_connections = 20",
                "shared_buffers = 128MB",
                "logging_collector = on",
                "log_directory = 'log'",
                "log_filename = 'postgresql-%Y-%m-%d.log'"
            ].join('\n');
            fs.writeFileSync(confPath, confContent);

            // Configure pg_hba.conf
            // Allow local access - simplified to IPv4 only to avoid IPv6 issues
            const hbaContent = [
                "# TYPE  DATABASE        USER            ADDRESS                 METHOD",
                "local   all             all                                     trust",
                "host    all             all             127.0.0.1/32            trust"
            ].join('\n');
            fs.writeFileSync(hbaPath, hbaContent);

            console.log('PostgreSQL configured successfully');
        } catch (err) {
            console.error('Failed to configure PostgreSQL:', err);
            throw err;
        }
    }

    async initCluster() {
        const initPromise = new Promise((resolve, reject) => {
            console.log('Initializing database cluster...');
            const initdb = path.join(this.pgPath, 'initdb.exe');

            // Ensure clean state: remove data directory if it exists
            if (fs.existsSync(this.dataPath)) {
                try {
                    console.log('Cleaning up existing data directory...');
                    fs.rmSync(this.dataPath, { recursive: true, force: true });
                } catch (err) {
                    console.warn('Failed to clean data directory:', err);
                }
            }

            // Ensure data directory parent exists
            if (!fs.existsSync(path.dirname(this.dataPath))) {
                fs.mkdirSync(path.dirname(this.dataPath), { recursive: true });
            }

            let output = '';
            let errorOutput = '';

            const initProcess = spawn(initdb, [
                '-D', this.dataPath,
                '--no-locale',
                '-E', 'UTF8',
                '-U', 'postgres'
            ]);

            initProcess.stdout.on('data', (data) => {
                output += data.toString();
                console.log(`initdb stdout: ${data}`);
            });

            initProcess.stderr.on('data', (data) => {
                errorOutput += data.toString();
                console.error(`initdb stderr: ${data}`);
            });

            initProcess.on('exit', (code) => {
                if (code === 0) {
                    console.log('Database cluster initialized');
                    try {
                        this.configure();
                        resolve();
                    } catch (err) {
                        reject(new Error(`Failed to configure PostgreSQL: ${err.message}`));
                    }
                } else {
                    reject(new Error(`initdb failed with code ${code}\nStderr: ${errorOutput}\nStdout: ${output}`));
                }
            });

            initProcess.on('error', (err) => {
                reject(new Error(`Failed to spawn initdb: ${err.message}`));
            });
        });

        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Database cluster initialization timed out (60s)')), 60000);
        });

        return Promise.race([initPromise, timeoutPromise]);
    }


    async stopExistingInstance() {
        return new Promise((resolve) => {
            console.log('Attempting to stop any existing PostgreSQL instance...');

            const pgCtl = path.join(this.pgPath, 'pg_ctl.exe');

            // Try to stop using pg_ctl first (graceful)
            const stopProcess = spawn(pgCtl, [
                'stop',
                '-D', this.dataPath,
                '-m', 'immediate'  // Use immediate mode to force shutdown
            ]);

            let output = '';
            let stderrOutput = '';
            stopProcess.stdout.on('data', (data) => {
                output += data.toString();
                console.log(`pg_ctl stop: ${data}`);
            });

            stopProcess.stderr.on('data', (data) => {
                stderrOutput += data.toString();
                console.log(`pg_ctl stop stderr: ${data}`);
            });

            stopProcess.on('exit', (code) => {
                console.log(`pg_ctl stop exited with code ${code}`);

                // Check if nothing was running
                const nothingRunning = stderrOutput.includes('no server running') ||
                    stderrOutput.includes('PID file') ||
                    code === 0;

                // If pg_ctl stop failed AND something was actually running, try taskkill as backup
                if (code !== 0 && !nothingRunning) {
                    console.log('pg_ctl stop failed, trying taskkill...');
                    const cleanup = spawn('taskkill', ['/F', '/IM', 'postgres.exe']);

                    cleanup.on('exit', (killCode) => {
                        // Only wait if we actually killed something
                        if (killCode === 0) {
                            setTimeout(resolve, 2000);
                        } else {
                            resolve(); // Nothing to kill
                        }
                    });

                    cleanup.on('error', () => {
                        resolve();
                    });
                } else if (code === 0) {
                    // Successfully stopped, wait for cleanup
                    setTimeout(resolve, 2000);
                } else {
                    // Nothing was running, continue immediately
                    resolve();
                }
            });

            stopProcess.on('error', (err) => {
                console.log(`pg_ctl stop error: ${err.message}`);
                // If pg_ctl itself fails, try taskkill
                const cleanup = spawn('taskkill', ['/F', '/IM', 'postgres.exe']);
                cleanup.on('exit', () => setTimeout(resolve, 2000));
                cleanup.on('error', () => setTimeout(resolve, 2000));
            });
        });
    }


    async start() {
        const startPromise = new Promise(async (resolve, reject) => {
            console.log('Starting PostgreSQL...');

            // Ensure log directory exists
            if (!fs.existsSync(this.logPath)) {
                fs.mkdirSync(this.logPath, { recursive: true });
            }

            // Attempt cleanup first
            await this.stopExistingInstance();

            const pgCtl = path.join(this.pgPath, 'pg_ctl.exe');

            this.pgProcess = spawn(pgCtl, [
                'start',
                '-D', this.dataPath,
                '-l', path.join(this.logPath, 'postgresql.log'),
                '-w',  // Wait for startup to complete
                '-t', '30' // Use native pg_ctl timeout as well
            ]);

            this.pgProcess.on('exit', (code) => {
                if (code === 0) {
                    console.log('PostgreSQL started successfully');
                    resolve();
                } else {
                    // Try to read the log file to get more info
                    let logContent = '';
                    try {
                        const logFile = path.join(this.logPath, 'postgresql.log');
                        if (fs.existsSync(logFile)) {
                            logContent = fs.readFileSync(logFile, 'utf8');
                            // Get last 15 lines
                            const lines = logContent.split('\n');
                            logContent = lines.slice(-15).join('\n');
                        }
                    } catch (e) {
                        logContent = `Could not read log file: ${e.message}`;
                    }

                    reject(new Error(`PostgreSQL failed to start with code ${code}\n\nLog tail:\n${logContent}`));
                }
            });

            this.pgProcess.on('error', (err) => {
                reject(err);
            });
        });

        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('PostgreSQL startup timed out (60s)')), 60000);
        });

        return Promise.race([startPromise, timeoutPromise]);
    }

    async stop() {
        return new Promise((resolve, reject) => {
            if (!this.pgProcess) {
                resolve();
                return;
            }

            console.log('Stopping PostgreSQL...');

            const pgCtl = path.join(this.pgPath, 'pg_ctl.exe');

            const stopProcess = spawn(pgCtl, [
                'stop',
                '-D', this.dataPath,
                '-m', 'fast'
            ]);

            stopProcess.on('exit', (code) => {
                console.log('PostgreSQL stopped');
                this.pgProcess = null;
                resolve();
            });

            stopProcess.on('error', (err) => {
                reject(err);
            });
        });
    }

    async isRunning() {
        return new Promise((resolve) => {
            const pgCtl = path.join(this.pgPath, 'pg_ctl.exe');

            const statusProcess = spawn(pgCtl, [
                'status',
                '-D', this.dataPath
            ]);

            statusProcess.on('exit', (code) => {
                resolve(code === 0);
            });

            statusProcess.on('error', () => {
                resolve(false);
            });
        });
    }

    async initialize() {
        const initPromise = new Promise((resolve, reject) => {
            console.log('Initializing database and user...');
            const psql = path.join(this.pgPath, 'psql.exe');
            const commonArgs = ['-h', '127.0.0.1', '-p', '5433', '-U', 'postgres'];

            // 1. Create database
            console.log('Creating database...');
            const createDb = spawn(psql, [
                ...commonArgs,
                '-c', 'CREATE DATABASE invoice_db;'
            ]);

            createDb.on('exit', (code) => {
                // Ignore code 1 if DB already exists
                if (code !== 0 && code !== 1) {
                    console.warn(`Database creation exited with code ${code}`);
                }

                // 2. Create user
                console.log('Creating user...');
                const createUser = spawn(psql, [
                    ...commonArgs,
                    '-c', "CREATE USER invoice_user WITH PASSWORD 'invoice123';"
                ]);

                createUser.on('exit', (userCode) => {
                    // Ignore code 1 if user already exists
                    if (userCode !== 0 && userCode !== 1) {
                        console.warn(`User creation exited with code ${userCode}`);
                    }

                    // 3. Grant database privileges
                    console.log('Granting database privileges...');
                    const grantPrivileges = spawn(psql, [
                        ...commonArgs,
                        '-c', 'GRANT ALL PRIVILEGES ON DATABASE invoice_db TO invoice_user;'
                    ]);

                    grantPrivileges.on('exit', (grantCode) => {
                        if (grantCode !== 0 && grantCode !== 1) {
                            console.warn(`Grant privileges exited with code ${grantCode}`);
                        }

                        // 4. Grant schema privileges (Required for PG 15+)
                        console.log('Granting schema privileges...');
                        const grantSchema = spawn(psql, [
                            ...commonArgs,
                            '-d', 'invoice_db',
                            '-c', 'GRANT ALL ON SCHEMA public TO invoice_user;'
                        ]);

                        grantSchema.on('exit', (schemaCode) => {
                            if (schemaCode === 0 || schemaCode === 1) {
                                console.log('Database initialized successfully');
                                resolve();
                            } else {
                                reject(new Error(`Failed to grant schema privileges, code ${schemaCode}`));
                            }
                        });

                        grantSchema.on('error', (err) => {
                            console.error('Grant schema privileges error:', err);
                            reject(err);
                        });
                    });

                    grantPrivileges.on('error', (err) => {
                        console.error('Grant privileges error:', err);
                        reject(err);
                    });
                });

                createUser.on('error', (err) => {
                    console.error('Create user error:', err);
                    reject(err);
                });
            });

            createDb.on('error', (err) => {
                console.error('Create database error:', err);
                reject(err);
            });
        });

        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('PostgreSQL command initialization timed out (60s)')), 60000);
        });

        return Promise.race([initPromise, timeoutPromise]);
    }
}

module.exports = PostgreSQLManager;
