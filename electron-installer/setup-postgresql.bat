@echo off
REM Setup PostgreSQL Portable
echo Configuring PostgreSQL...

cd resources\postgresql

REM Initialize database cluster
REM Initialize database cluster
echo Initializing database cluster...
if exist "data\PG_VERSION" (
    echo Database already initialized. Skipping initdb.
    goto :config
)
bin\initdb.exe -D data -U postgres -E UTF8 --locale=C

:config

REM Create postgresql.conf for embedded use
echo Configuring PostgreSQL settings...
echo port = 5433 > data\postgresql.conf
echo listen_addresses = 'localhost' >> data\postgresql.conf
echo max_connections = 20 >> data\postgresql.conf
echo shared_buffers = 128MB >> data\postgresql.conf
echo logging_collector = on >> data\postgresql.conf
echo log_directory = 'log' >> data\postgresql.conf
echo log_filename = 'postgresql-%%Y-%%m-%%d.log' >> data\postgresql.conf

REM Create pg_hba.conf for local access
echo # TYPE  DATABASE        USER            ADDRESS                 METHOD > data\pg_hba.conf
echo local   all             all                                     trust >> data\pg_hba.conf
echo host    all             all             127.0.0.1/32            trust >> data\pg_hba.conf
echo host    all             all             ::1/128                 trust >> data\pg_hba.conf

cd ..\..

echo PostgreSQL configured successfully!
