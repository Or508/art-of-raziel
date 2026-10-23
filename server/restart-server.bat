@echo off
echo Checking for running Node.js processes on port 5000...
echo.

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    echo Found process %%a using port 5000. Stopping...
    taskkill /F /PID %%a >nul 2>&1
    if errorlevel 1 (
        echo Could not stop process automatically. Please stop it manually:
        echo 1. Open Task Manager (Ctrl+Shift+Esc)
        echo 2. Find Node.js process (PID: %%a)
        echo 3. End the process
        echo 4. Then run: npm start
        pause
        exit
    )
    timeout /t 2 /nobreak >nul
)

echo Starting server...
node app.js
pause
