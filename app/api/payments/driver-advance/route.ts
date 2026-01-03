import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { decryptKey } from '@/lib/crypto';

// Hardcoded for demo/local node
const TOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const ESCROW_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const LOCAL_RPC = "http://127.0.0.1:8545";

const ERC20_ABI = [
    "function transfer(address to, uint256 amount) public returns (bool)",
    "function approve(address spender, uint256 amount) public returns (bool)",
    "function allowance(address owner, address spender) public view returns (uint256)"
];

const ESCROW_ABI = [
    "function deposit(uint256 amount, string calldata reason) external"
];

export async function POST(req: NextRequest) {
    try {
        const { driverEncryptedKey, amount, reason } = await req.json();

        if (!driverEncryptedKey || !amount) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        const provider = new ethers.JsonRpcProvider(LOCAL_RPC);
        const privateKey = decryptKey(driverEncryptedKey);
        const wallet = new ethers.Wallet(privateKey, provider);

        const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, wallet);
        const escrowContract = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, wallet);

        const amountInWei = ethers.parseUnits(amount.toString(), 18);

        // 1. Approve escrow to spend tokens
        console.log(`Approving ${amount} LINR for escrow...`);
        const approveTx = await tokenContract.approve(ESCROW_ADDRESS, amountInWei);
        await approveTx.wait();

        // 2. Deposit to escrow
        console.log(`Depositing ${amount} LINR to escrow for: ${reason}`);
        const depositTx = await escrowContract.deposit(amountInWei, reason);
        await depositTx.wait();

        return NextResponse.json({
            success: true,
            txHash: depositTx.hash,
            message: "Driver advance deposited to escrow"
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Payment error:", error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
