@echo off
echo Starting MongoDB...
echo.

REM Try to start MongoDB service
net start MongoDB

if %errorlevel% neq 0 (
    echo MongoDB service not found. Trying to start mongod directly...
    echo.

    REM Try to start mongod directly (assuming it's in PATH or default location)
    mongod --dbpath "C:\data\db" --logpath "C:\data\log\mongod.log" --fork

    if %errorlevel% neq 0 (
        echo Failed to start MongoDB automatically.
        echo.
        echo Please start MongoDB manually:
        echo 1. Open Command Prompt as Administrator
        echo 2. Run: net start MongoDB
        echo    OR
        echo 2. Run: mongod --dbpath "C:\data\db"
        echo.
        echo If MongoDB is not installed, download it from: https://www.mongodb.com/try/download/community
        pause
    ) else (
        echo MongoDB started successfully!
        echo Database path: C:\data\db
        echo Log path: C:\data\log\mongod.log
    )
) else (
    echo MongoDB service started successfully!
)

echo.
echo Press any key to continue...
pause >nul
