# Hardhat Deployment & Blockchain Integration Guide

This guide explains how to deploy the LogixINR token and Escrow contracts using Hardhat, configure wallets, and troubleshoot common issues.

## Quick Start

```bash
# Terminal 1: Start local blockchain
cd contracts && npm run node

# Terminal 2: Deploy contracts (after node is running)
cd contracts && npm run deploy:local
```

## Prerequisites

- Node.js v18+ installed
- Dependencies installed in both root and contracts folders:
  ```bash
  pnpm install              # Root project
  cd contracts && npm install  # Contracts
  ```

## Contract Addresses (Local Development)

When deploying to a fresh Hardhat node, contracts are deployed to **deterministic addresses**:

| Contract | Address |
|----------|---------|
| LogixINR Token | `0x5FbDB2315678afecb367f032d93F642f64180aa3` |
| Escrow | `0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9` |

> **Note**: These addresses are deterministic for the default deploy script. If you modify the deployment order or add contracts before these, addresses will change.

## Environment Variables

Add these to your root `.env` file:

```env
# Blockchain Configuration
NEXT_PUBLIC_RPC_URL="http://127.0.0.1:8545"
NEXT_PUBLIC_TOKEN_ADDRESS="0x5FbDB2315678afecb367f032d93F642f64180aa3"
NEXT_PUBLIC_ESCROW_ADDRESS="0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"

# Encryption salt for wallet keys (must match between client and server)
NEXT_PUBLIC_LOGIX_SALT="logix-salt"
```

## Wallet Configuration

### Default Hardhat Accounts

The Hardhat node provides 20 pre-funded accounts with 10,000 ETH each. Use these for testing:

| Role | Account | Address | Private Key |
|------|---------|---------|-------------|
| Admin/Buyer | #0 | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` |
| Buyer | #1 | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d` |
| Driver | #2 | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a` |

> ⚠️ **WARNING**: These keys are publicly known. Never use them on mainnet or any live network!

### Connecting Wallet in the App

1. Navigate to **Dashboard > Payments > Wallet & Security**
2. Enter a Hardhat private key (e.g., Account #0's key above)
3. Click **Connect Wallet**
4. Your LINR balance should appear

## NPM Scripts (in `contracts/` folder)

| Command | Description |
|---------|-------------|
| `npm run node` | Start local Hardhat blockchain |
| `npm run deploy:local` | Deploy contracts to localhost |

## Deployment Details

The deploy script (`contracts/scripts/deploy-local.js`) performs:

1. Deploys **LogixINR** ERC-20 token contract
2. Deploys **Escrow** contract with token address
3. Mints **5,000,000 LINR** to Buyer (Account #1)
4. Mints **100,000 LINR** to Driver (Account #2)

## Troubleshooting

### Error: `BAD_DATA` or `value="0x"` when calling `balanceOf`

**Cause**: The token address in your code doesn't match the deployed contract.

**Solution**: 
1. Check the Hardhat terminal for the actual deployed address
2. Update `NEXT_PUBLIC_TOKEN_ADDRESS` in `.env`
3. Or update the fallback address in the payment route files

### Error: `WARNING: Calling an account which is not a contract`

**Cause**: Same as above - wrong contract address.

**Solution**: Ensure all payment routes use the correct contract addresses. Check these files:
- `app/dashboard/payments/_components/PaymentPortal.tsx`
- `app/api/payments/salary/route.ts`
- `app/api/payments/escrow/route.ts`
- `app/api/payments/transfer/route.ts`
- `app/api/payments/driver-advance/route.ts`

### Error: `invalid private key (argument="privateKey", value="[REDACTED]")`

**Cause**: Wallet encryption/decryption key mismatch.

**Solution**:
1. Disconnect wallet in the UI
2. Reconnect with a fresh Hardhat private key
3. Ensure `lib/crypto.ts` salt matches `NEXT_PUBLIC_LOGIX_SALT` in `.env`

### Node appears offline / Connection refused

**Cause**: Hardhat node not running or wrong RPC URL.

**Solution**:
```bash
cd contracts && npm run node
```
Ensure `NEXT_PUBLIC_RPC_URL` is `http://127.0.0.1:8545`

### Addresses change after restarting Hardhat node

**This is expected behavior**. Hardhat resets its blockchain state on restart.

**Solution**:
1. After restarting the node, redeploy: `cd contracts && npm run deploy:local`
2. The addresses should remain the same (deterministic deployment)
3. Reconnect your wallet in the app

## Development Workflow

1. **Start blockchain** (keep this terminal open):
   ```bash
   cd contracts && npm run node
   ```

2. **Deploy contracts** (separate terminal):
   ```bash
   cd contracts && npm run deploy:local
   ```

3. **Start Next.js dev server**:
   ```bash
   pnpm dev
   ```

4. **Connect wallet** in the Payments page using a Hardhat account key

5. **Test features**: Salary payments, bill settlements, transfers, etc.

## Files Overview

| File | Purpose |
|------|---------|
| `contracts/contracts/LogixINR.sol` | ERC-20 token with mint/burn capabilities |
| `contracts/contracts/Escrow.sol` | Escrow contract for secure payments |
| `contracts/scripts/deploy-local.js` | Local deployment script |
| `lib/crypto.ts` | Wallet key encryption/decryption |
| `app/api/auth/wallet/route.ts` | Wallet connect/disconnect API |
| `app/api/payments/*/route.ts` | Payment processing APIs |

## Production Demo (with ngrok)

To expose your local Hardhat node to a Vercel-deployed app:

1. See [NGROK_SETUP.md](./NGROK_SETUP.md) for detailed instructions
2. Or run the startup script: `.\start-blockchain.ps1`

This allows your production app to connect to your local blockchain for demos.
