@echo off
echo ======================================
echo   WebFlow Proxy Server
echo ======================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting proxy server...
echo Access at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

call npm start
