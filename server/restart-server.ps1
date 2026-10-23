# Script to restart the server
Write-Host "Checking for running Node.js processes on port 5000..." -ForegroundColor Yellow

# Find process using port 5000
$process = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($process) {
    Write-Host "Found process $process using port 5000. Attempting to stop..." -ForegroundColor Yellow
    try {
        Stop-Process -Id $process -Force -ErrorAction Stop
        Write-Host "Process stopped successfully!" -ForegroundColor Green
        Start-Sleep -Seconds 2
    } catch {
        Write-Host "Could not stop process automatically. Please stop it manually:" -ForegroundColor Red
        Write-Host "1. Open Task Manager (Ctrl+Shift+Esc)" -ForegroundColor Yellow
        Write-Host "2. Find Node.js process (PID: $process)" -ForegroundColor Yellow
        Write-Host "3. End the process" -ForegroundColor Yellow
        Write-Host "4. Then run: npm start" -ForegroundColor Yellow
        exit
    }
} else {
    Write-Host "No process found on port 5000." -ForegroundColor Green
}

Write-Host "Starting server..." -ForegroundColor Green
Set-Location $PSScriptRoot
node app.js
