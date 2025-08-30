# GroChain Backend Endpoint Testing PowerShell Script

Write-Host "🚀 GroChain Backend Endpoint Testing" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

function Show-Menu {
    Write-Host "Select a testing option:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Health Check (Recommended first step)" -ForegroundColor Green
    Write-Host "2. Quick Endpoint Test" -ForegroundColor Green
    Write-Host "3. Comprehensive Endpoint Test" -ForegroundColor Green
    Write-Host "4. Individual Endpoint Test" -ForegroundColor Green
    Write-Host "5. Custom URL Testing" -ForegroundColor Green
    Write-Host "6. Exit" -ForegroundColor Red
    Write-Host ""
}

function Test-Health {
    Write-Host ""
    Write-Host "🏥 Running Health Check..." -ForegroundColor Blue
    npm run test:health
    Write-Host ""
    Read-Host "Press Enter to continue"
}

function Test-Quick {
    Write-Host ""
    Write-Host "🧪 Running Quick Endpoint Test..." -ForegroundColor Blue
    npm run test:quick
    Write-Host ""
    Read-Host "Press Enter to continue"
}

function Test-Comprehensive {
    Write-Host ""
    Write-Host "🚀 Running Comprehensive Endpoint Test..." -ForegroundColor Blue
    npm run test:endpoints
    Write-Host ""
    Read-Host "Press Enter to continue"
}

function Test-Individual {
    Write-Host ""
    Write-Host "🎯 Running Individual Endpoint Test..." -ForegroundColor Blue
    npm run test:individual
    Write-Host ""
    Read-Host "Press Enter to continue"
}

function Test-CustomURL {
    Write-Host ""
    $baseUrl = Read-Host "Enter custom base URL (e.g., http://localhost:3000)"
    
    if ([string]::IsNullOrEmpty($baseUrl)) {
        Write-Host "No URL provided, using default." -ForegroundColor Yellow
        $baseUrl = "http://localhost:5000"
    }
    
    Write-Host ""
    Write-Host "🧪 Testing against: $baseUrl" -ForegroundColor Blue
    npm run test:health -- --base-url $baseUrl
    Write-Host ""
    Read-Host "Press Enter to continue"
}

# Main loop
do {
    Show-Menu
    $choice = Read-Host "Enter your choice (1-6)"
    
    switch ($choice) {
        "1" { Test-Health }
        "2" { Test-Quick }
        "3" { Test-Comprehensive }
        "4" { Test-Individual }
        "5" { Test-CustomURL }
        "6" { 
            Write-Host ""
            Write-Host "👋 Goodbye! Happy testing!" -ForegroundColor Green
            break 
        }
        default { 
            Write-Host "Invalid choice. Please try again." -ForegroundColor Red
            Start-Sleep -Seconds 1
        }
    }
    
    Clear-Host
} while ($choice -ne "6")

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
