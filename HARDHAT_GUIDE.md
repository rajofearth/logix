# Hardhat Deployment & Wallet Configuration Guide

This guide explains how to deploy the LogixINR and Escrow contracts using Hardhat and how to configure the environment variables for different roles.

## Prerequisites

- Node.js installed
- Dependencies installed (`npm install` in root and `contracts` folder)
- A running Hardhat node (for local development)

## Wallet Configuration

The application uses three main roles for development: **Admin**, **Buyer**, and **Driver**.
The private keys for these roles are **encrypted** in the `.env` file using a salt.

### Default Development Accounts (Localhost)

For local development with `npx hardhat node`, we use the default pre-funded accounts:

| Role | Account Index | Address | Encrypted Key (in `.env`) |
|------|---------------|---------|---------------------------|
| Admin | 0 | `0xf39...2266` | `ADMIN_ENCRYPTED_KEY` |
| Buyer | 1 | `0x709...79C8` | `BUYER_ENCRYPTED_KEY` |
| Driver | 2 | `0x3C4...5e32` | `DRIVER_ENCRYPTED_KEY` |

These keys have already been added to your `.env` file.

### Generating New Keys

If you need to generate new encrypted keys (e.g., for a different environment), you can use the `generate_keys.js` script in the root directory:

```bash
node generate_keys.js
```

Then update the values in `.env`.

## Deployment

We have created a robust deployment script that deploys contracts, mints initial tokens, and exports deployment data.

### 1. Start Local Blockchain

Open a terminal and run:

```bash
cd contracts
npx hardhat node
```

### 2. Deploy Contracts

In a **separate terminal**, run:

```bash
cd contracts
npx hardhat run contracts/scripts/deploy.js --network localhost
```

This script will:
1. Deploy `LogixINR` and `Escrow` contracts.
2. Mint **5,000,000 LINR** to the **Buyer**.
3. Mint **100,000 LINR** to the **Driver**.
4. Save the deployment details to `contracts/deployments.json`.

### 3. Update Environment Variables

After deployment, check the output for the new contract addresses (or look at `contracts/deployments.json`).
Update the following variables in your root `.env` file if they have changed:

```env
NEXT_PUBLIC_TOKEN_ADDRESS="<new_token_address>"
NEXT_PUBLIC_ESCROW_ADDRESS="<new_escrow_address>"
NEXT_PUBLIC_RPC_URL="http://127.0.0.1:8545"
```

## detailed Deployment Script (`contracts/scripts/deploy.js`)

The specific logic for deployment and minting is located in `contracts/contracts/scripts/deploy.js`. You can modify the initial minting amounts or added logic there.
