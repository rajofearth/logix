# Production Demo Setup with ngrok

This guide explains how to expose your local Hardhat blockchain to the internet using ngrok, allowing your Vercel-deployed app to connect to it.

## Architecture

```
┌─────────────────┐     ┌─────────────┐     ┌──────────────────┐
│  Vercel App     │────▶│   ngrok     │────▶│  Local Hardhat   │
│  (Production)   │     │   Tunnel    │     │  Node (8545)     │
└─────────────────┘     └─────────────┘     └──────────────────┘
```

## Quick Start

```bash
# Terminal 1: Start Hardhat node
cd contracts && npm run node

# Terminal 2: Deploy contracts
cd contracts && npm run deploy:local

# Terminal 3: Start ngrok tunnel
ngrok http 8545
```

Copy the ngrok HTTPS URL (e.g., `https://abc123.ngrok-free.app`) and update your Vercel environment variable.

## Important Notes

### Contract Addresses are Deterministic

When you restart Hardhat and redeploy, the contract addresses **stay the same** because:
- Hardhat uses deterministic deployment
- Same deploy script = same addresses
- No need to update token/escrow addresses

**Fixed addresses** (as long as you use the same deploy script):
```
TOKEN_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
ESCROW_ADDRESS=0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
```

### ngrok URL Changes

With ngrok free tier, the URL changes every restart. You have two options:

**Option A: Manual Update (Free)**
1. Start ngrok: `ngrok http 8545`
2. Copy the HTTPS URL
3. Update `NEXT_PUBLIC_RPC_URL` in Vercel Dashboard
4. Trigger a redeploy (or the app picks it up on refresh)

**Option B: Reserved Domain (ngrok Paid)**
```bash
ngrok http 8545 --domain=your-reserved-domain.ngrok-free.app
```
This gives you a stable URL that never changes.

## Vercel Environment Variables

Set these in your Vercel project settings:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_RPC_URL` | Your ngrok HTTPS URL |
| `NEXT_PUBLIC_TOKEN_ADDRESS` | `0x5FbDB2315678afecb367f032d93F642f64180aa3` |
| `NEXT_PUBLIC_ESCROW_ADDRESS` | `0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9` |
| `NEXT_PUBLIC_LOGIX_SALT` | Your encryption salt |

## Startup Workflow

Every time you want to run the demo:

### Step 1: Start Services

```bash
# Terminal 1 - Hardhat Node
cd contracts && npm run node

# Terminal 2 - Deploy (wait for node to start)
cd contracts && npm run deploy:local

# Terminal 3 - ngrok
ngrok http 8545
```

### Step 2: Update Vercel (if URL changed)

1. Go to [Vercel Dashboard](https://vercel.com) → Your Project → Settings → Environment Variables
2. Update `NEXT_PUBLIC_RPC_URL` with the new ngrok URL
3. Redeploy: Go to Deployments → Click "..." on latest → Redeploy

### Step 3: Connect Wallet

In the production app:
1. Go to Payments → Wallet & Security
2. Enter a Hardhat private key
3. Click Connect

## Automation Script (Optional)

Create a startup script to run everything:

**Windows (`start-blockchain.bat`):**
```batch
@echo off
start "Hardhat Node" cmd /k "cd contracts && npm run node"
timeout /t 5
start "Deploy" cmd /k "cd contracts && npm run deploy:local"
timeout /t 3
start "ngrok" cmd /k "ngrok http 8545"
echo.
echo Blockchain services started!
echo Copy the ngrok URL and update Vercel if needed.
pause
```

**PowerShell (`start-blockchain.ps1`):**
```powershell
Write-Host "Starting Hardhat node..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd contracts; npm run node"

Start-Sleep -Seconds 5
Write-Host "Deploying contracts..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd contracts; npm run deploy:local"

Start-Sleep -Seconds 3
Write-Host "Starting ngrok..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "ngrok http 8545"

Write-Host "`nAll services started!" -ForegroundColor Cyan
Write-Host "Copy the ngrok HTTPS URL and update Vercel NEXT_PUBLIC_RPC_URL if changed." -ForegroundColor Yellow
```

## Security Considerations

> ⚠️ **Warning**: Exposing your Hardhat node via ngrok makes it publicly accessible!

- Anyone with the URL can interact with your blockchain
- Use only for demos, not production
- The test accounts have known private keys
- Consider adding ngrok authentication for extra security:
  ```bash
  ngrok http 8545 --basic-auth="user:password"
  ```

## Troubleshooting

### App shows "Node Offline"

1. Check if Hardhat node is running
2. Check if ngrok is running
3. Verify the ngrok URL matches Vercel's `NEXT_PUBLIC_RPC_URL`
4. Make sure you're using the **HTTPS** ngrok URL, not HTTP

### Wallet won't connect

1. ngrok might have restarted - check for new URL
2. Hardhat node might have restarted - redeploy contracts
3. Try disconnecting and reconnecting wallet

### Transactions fail

1. Make sure contracts are deployed after node restart
2. Verify the connected account has LINR balance
3. Check browser console for detailed errors
