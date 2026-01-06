import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { decryptKey } from '@/lib/crypto';

// Hardcoded for demo/local node
// Hardcoded defaults for demo/local node if env not set
const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const ESCROW_ADDRESS = process.env.NEXT_PUBLIC_ESCROW_ADDRESS || "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
const LOCAL_RPC = process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545";

const ERC20_ABI = [
    "function transfer(address to, uint256 amount) public returns (bool)",
    "function approve(address spender, uint256 amount) public returns (bool)",
    "function balanceOf(address account) public view returns (uint256)"
];

const ESCROW_ABI = [
    "function deposit(uint256 amount, string calldata reason) external",
    "function release(address to, uint256 amount, string calldata reason) external",
    "function batchRelease(address[] calldata tos, uint256[] calldata amounts) external"
];

export async function POST(req: NextRequest) {
    try {
        const { action, buyerEncryptedKey, amount, reason, releases, invoiceId } = await req.json();

        const provider = new ethers.JsonRpcProvider(LOCAL_RPC);
        const privateKey = decryptKey(buyerEncryptedKey || process.env.ADMIN_ENCRYPTED_KEY);
        const wallet = new ethers.Wallet(privateKey, provider);

        const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, wallet);
        const escrowContract = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, wallet);

        if (action === "deposit") {
            const amountInWei = ethers.parseUnits(amount.toString(), 18);

            console.log(`Approving ${amount} LINR...`);
            const approveTx = await tokenContract.approve(ESCROW_ADDRESS, amountInWei);
            await approveTx.wait();

            console.log(`Depositing ${amount} LINR to escrow...`);
            const depositTx = await escrowContract.deposit(amountInWei, reason);
            await depositTx.wait();

            // Record payment to invoice if invoiceId provided
            if (invoiceId) {
                try {
                    await fetch(`${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/api/payments/invoice-payment`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            invoiceId,
                            amount,
                            transactionHash: depositTx.hash,
                            payerAddress: wallet.address
                        })
                    });
                } catch (paymentError) {
                    console.error('Failed to record payment:', paymentError);
                    // Don't fail the whole transaction if payment recording fails
                }
            }

            return NextResponse.json({ success: true, txHash: depositTx.hash });
        }

        if (action === "release") {
            const { to, amount: releaseAmount } = releases[0];
            const releaseAmountInWei = ethers.parseUnits(releaseAmount.toString(), 18);

            console.log(`Releasing ${releaseAmount} LINR to ${to}...`);
            const releaseTx = await escrowContract.release(to, releaseAmountInWei, reason);
            await releaseTx.wait();

            // Record payment to invoice if invoiceId provided
            if (invoiceId) {
                try {
                    await fetch(`${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/api/payments/invoice-payment`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            invoiceId,
                            amount: releaseAmount,
                            transactionHash: releaseTx.hash,
                            payerAddress: wallet.address
                        })
                    });
                } catch (paymentError) {
                    console.error('Failed to record payment:', paymentError);
                }
            }

            return NextResponse.json({ success: true, txHash: releaseTx.hash });
        }

        if (action === "batchRelease") {
            const tos = releases.map((r: { to: string }) => r.to);
            const amounts = releases.map((r: { amount: string | number }) => ethers.parseUnits(r.amount.toString(), 18));

            console.log(`Batch releasing to ${tos.length} addresses...`);
            const batchTx = await escrowContract.batchRelease(tos, amounts);
            await batchTx.wait();

            return NextResponse.json({ success: true, txHash: batchTx.hash });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Escrow error:", error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
