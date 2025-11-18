@echo off
REM VitalSoft Quick Start Script for Windows
REM This script starts WAMP64 and opens the setup wizard

echo.
echo ========================================
echo    VitalSoft - Quick Start
echo ========================================
echo.

REM Check if WAMP64 is installed
if not exist "C:\wamp64\wampmanager.exe" (
    echo ERROR: WAMP64 not found at C:\wamp64\
    echo Please install WAMP64 first
    echo https://www.wampserver.com/en/
    pause
    exit /b 1
)

echo [1/3] Starting WAMP64 services...
REM Start WAMP64
start "" "C:\wamp64\wampmanager.exe"

echo [2/3] Waiting for services to start (10 seconds)...
timeout /t 10 /nobreak

echo [3/3] Opening setup wizard...
REM Open default browser with setup wizard
start "" "http://localhost/webdev/setup/setup_database.php"

echo.
echo ========================================
echo   WAMP64 is starting!
echo ========================================
echo.
echo   Setup Wizard will open automatically
echo   If not, visit: http://localhost/webdev/setup/setup_database.php
echo.
echo   Login Page: http://localhost/webdev/html/login.html
echo.
echo   Demo Credentials:
echo   - Admin:     admin / admin123
echo   - Doctor:    doctor / doctor123
echo   - Pharmacist: pharmacist / pharma123
echo   - Patient:   patient / patient123
echo.
echo ========================================
echo.
pause
