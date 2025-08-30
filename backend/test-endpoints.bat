@echo off
echo 🚀 GroChain Backend Endpoint Testing
echo ======================================
echo.

:menu
echo Select a testing option:
echo.
echo 1. Health Check (Recommended first step)
echo 2. Quick Endpoint Test
echo 3. Comprehensive Endpoint Test
echo 4. Individual Endpoint Test
echo 5. Custom URL Testing
echo 6. Exit
echo.
set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto health
if "%choice%"=="2" goto quick
if "%choice%"=="3" goto comprehensive
if "%choice%"=="4" goto individual
if "%choice%"=="5" goto custom
if "%choice%"=="6" goto exit
echo Invalid choice. Please try again.
goto menu

:health
echo.
echo 🏥 Running Health Check...
npm run test:health
echo.
pause
goto menu

:quick
echo.
echo 🧪 Running Quick Endpoint Test...
npm run test:quick
echo.
pause
goto menu

:comprehensive
echo.
echo 🚀 Running Comprehensive Endpoint Test...
npm run test:endpoints
echo.
pause
goto menu

:individual
echo.
echo 🎯 Running Individual Endpoint Test...
npm run test:individual
echo.
pause
goto menu

:custom
echo.
set /p baseurl="Enter custom base URL (e.g., http://localhost:3000): "
if "%baseurl%"=="" (
    echo No URL provided, using default.
    set baseurl=http://localhost:5000
)
echo.
echo 🧪 Testing against: %baseurl%
npm run test:health -- --base-url %baseurl%
echo.
pause
goto menu

:exit
echo.
echo 👋 Goodbye! Happy testing!
pause
exit
