import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { decryptKey } from '@/lib/crypto';

// Hardcoded for demo/local node
const LOCAL_RPC = "http://127.0.0.1:8545";
const TOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const ERC20_ABI = [
    "function transfer(address to, uint256 amount) public returns (bool)",
    "function balanceOf(address account) public view returns (uint256)"
];

export async function POST(req: NextRequest) {
    try {
        const { fromEncryptedKey, toAddress, amount } = await req.json();

        if (!fromEncryptedKey || !toAddress || !amount) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const provider = new ethers.JsonRpcProvider(LOCAL_RPC);
        const privateKey = decryptKey(fromEncryptedKey);
        const wallet = new ethers.Wallet(privateKey, provider);

        const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, wallet);

        const amountWei = ethers.parseEther(amount.toString());
        const tx = await tokenContract.transfer(toAddress, amountWei);
        await tx.wait();

        return NextResponse.json({
            success: true,
            txHash: tx.hash,
            message: `Successfully transferred ${amount} LINR`
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Transfer API Error:", error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
