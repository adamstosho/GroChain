# PowerShell script to start MongoDB
Write-Host "Starting MongoDB..." -ForegroundColor Green
Write-Host ""

# Try to start MongoDB service
try {
    Start-Service -Name "MongoDB" -ErrorAction Stop
    Write-Host "✅ MongoDB service started successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ MongoDB service not found or failed to start." -ForegroundColor Red
    Write-Host "Trying to start mongod directly..." -ForegroundColor Yellow
    Write-Host ""

    try {
        # Create data directory if it doesn't exist
        if (!(Test-Path "C:\data\db")) {
            New-Item -ItemType Directory -Path "C:\data\db" -Force
        }
        if (!(Test-Path "C:\data\log")) {
            New-Item -ItemType Directory -Path "C:\data\log" -Force
        }

        # Start mongod
        $mongodProcess = Start-Process -FilePath "mongod" -ArgumentList "--dbpath C:\data\db --logpath C:\data\log\mongod.log" -NoNewWindow -PassThru

        Start-Sleep -Seconds 2

        if (!$mongodProcess.HasExited) {
            Write-Host "✅ MongoDB started successfully!" -ForegroundColor Green
            Write-Host "Database path: C:\data\db" -ForegroundColor Cyan
            Write-Host "Log path: C:\data\log\mongod.log" -ForegroundColor Cyan
            Write-Host "Process ID: $($mongodProcess.Id)" -ForegroundColor Cyan
        } else {
            throw "MongoDB process exited immediately"
        }
    } catch {
        Write-Host "❌ Failed to start MongoDB automatically." -ForegroundColor Red
        Write-Host ""
        Write-Host "Please start MongoDB manually:" -ForegroundColor Yellow
        Write-Host "Option 1 - As Administrator:" -ForegroundColor Cyan
        Write-Host "  net start MongoDB" -ForegroundColor White
        Write-Host ""
        Write-Host "Option 2 - Direct mongod:" -ForegroundColor Cyan
        Write-Host "  mongod --dbpath C:\data\db" -ForegroundColor White
        Write-Host ""
        Write-Host "If MongoDB is not installed:" -ForegroundColor Yellow
        Write-Host "  Download from: https://www.mongodb.com/try/download/community" -ForegroundColor White
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host ""
Write-Host "MongoDB should now be running on localhost:27017" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to exit"

