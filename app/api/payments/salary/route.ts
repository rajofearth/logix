import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { decryptKey } from '@/lib/crypto';

// Hardcoded for demo/local node
const LOCAL_RPC = "http://127.0.0.1:8545";
const TOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const ERC20_ABI = [
    "function transfer(address to, uint256 amount) public returns (bool)",
    "function batchMint(address[] recipients, uint256[] amounts) public"
];

// In a real app, this would be the admin/company account
const ADMIN_ENCRYPTED_KEY = process.env.ADMIN_ENCRYPTED_KEY;

export async function POST(req: NextRequest) {
    try {
        const { driverPayments } = await req.json(); // Array of { address, amount }

        if (!driverPayments || !Array.isArray(driverPayments)) {
            return NextResponse.json({ error: "Invalid payment data" }, { status: 400 });
        }

        const provider = new ethers.JsonRpcProvider(LOCAL_RPC);

        // For demo, we use the first Hardhat account (Account 0) as Admin
        // If not in env, we use the known local key for Account 0
        const adminKey = ADMIN_ENCRYPTED_KEY
            ? decryptKey(ADMIN_ENCRYPTED_KEY)
            : "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

        const wallet = new ethers.Wallet(adminKey, provider);
        const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, wallet);

        const addresses = driverPayments.map(p => p.address);
        const amounts = driverPayments.map(p => ethers.parseEther(p.amount.toString()));

        // Use batchMint for demo to ensure admin has enough funds or just transfer in loop
        // For real salary, we'd use a special Salary contract or batch transfer

        const tx = await tokenContract.batchMint(addresses, amounts);
        await tx.wait();

        return NextResponse.json({
            success: true,
            txHash: tx.hash,
            count: driverPayments.length,
            message: `Processed ${driverPayments.length} salary payments`
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Salary API Error:", error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
