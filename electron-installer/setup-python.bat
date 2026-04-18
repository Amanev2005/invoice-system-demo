@echo off
REM Setup Python Embeddable Package
echo Configuring Python...

cd resources\python

REM Enable site-packages by modifying python311._pth
echo python311.zip > python311._pth
echo . >> python311._pth
echo.>> python311._pth
echo import site >> python311._pth

REM Download get-pip.py
echo Downloading pip installer...
powershell -Command "& {Invoke-WebRequest -Uri 'https://bootstrap.pypa.io/get-pip.py' -OutFile 'get-pip.py'}"

REM Install pip
echo Installing pip...
python.exe get-pip.py

REM Install requirements
echo Installing Python dependencies...
python.exe -m pip install -r ..\..\..\backend\requirements.txt

REM Cleanup
del get-pip.py

cd ..\..

echo Python configured successfully!
