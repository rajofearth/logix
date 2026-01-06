# Logix Blockchain Startup Script
# Run this to start all blockchain services for production demo

Write-Host @"
 _               _      
| |    ___  __ _(_)_  __
| |   / _ \/ _` | \ \/ /
| |__| (_) | (_| | |>  < 
|_____\___/ \__, |_/_/\_\
            |___/        
"@ -ForegroundColor Cyan

Write-Host "`nStarting blockchain services...`n" -ForegroundColor Green

# Start Hardhat Node
Write-Host "[1/3] Starting Hardhat node..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\contracts'; npm run node"

Start-Sleep -Seconds 5

# Deploy Contracts
Write-Host "[2/3] Deploying contracts..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\contracts'; npm run deploy:local"

Start-Sleep -Seconds 3

# Start ngrok
Write-Host "[3/3] Starting ngrok tunnel..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "ngrok http 8545"

Write-Host "`n" -NoNewline
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  All services started successfully!   " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`n"
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  1. Copy the ngrok HTTPS URL from the ngrok terminal" -ForegroundColor Gray
Write-Host "  2. Update NEXT_PUBLIC_RPC_URL in Vercel if the URL changed" -ForegroundColor Gray
Write-Host "  3. Connect wallet in the app using a Hardhat private key" -ForegroundColor Gray
Write-Host "`n"
Write-Host "Contract Addresses (fixed):" -ForegroundColor White
Write-Host "  Token:  0x5FbDB2315678afecb367f032d93F642f64180aa3" -ForegroundColor Gray
Write-Host "  Escrow: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9" -ForegroundColor Gray
Write-Host "`n"
Write-Host "Test Account (Account #0):" -ForegroundColor White
Write-Host "  Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" -ForegroundColor Gray
Write-Host "  Key:     0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" -ForegroundColor Gray

Read-Host "`nPress Enter to close this window"
