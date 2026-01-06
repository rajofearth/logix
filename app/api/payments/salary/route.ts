import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { decryptKey } from '@/lib/crypto';
import { prisma } from '@/lib/prisma';

// Hardcoded for demo/local node
const LOCAL_RPC = process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545";
const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const ERC20_ABI = [
    "function transfer(address to, uint256 amount) public returns (bool)",
    "function batchMint(address[] recipients, uint256[] amounts) public"
];



export async function GET() {
    try {
        const drivers = await prisma.driver.findMany({
            include: {
                salaryPayments: {
                    orderBy: { paidAt: 'desc' },
                    take: 1
                }
            }
        });

        const formattedDrivers = drivers.map(d => ({
            id: d.id,
            name: d.name,
            address: d.walletAddress || "0x0000000000000000000000000000000000000000",
            salary: Number(d.baseSalary),
            status: d.salaryPayments.length > 0 ? 'paid' : 'pending'
        }));

        return NextResponse.json(formattedDrivers);
    } catch (error: unknown) {
        console.error("Salary GET Error:", error);
        return NextResponse.json({ error: "Failed to fetch drivers" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { driverPayments } = await req.json(); // Array of { id, address, amount }

        if (!driverPayments || !Array.isArray(driverPayments)) {
            return NextResponse.json({ error: "Invalid payment data" }, { status: 400 });
        }

        const provider = new ethers.JsonRpcProvider(LOCAL_RPC);

        // Fetch persisted wallet from AdminUser
        const admin = await prisma.adminUser.findFirst();
        if (!admin || !admin.walletAddress || !admin.encryptedWalletKey) {
            return NextResponse.json({ error: "Wallet not connected. Please connect in Payments > Wallet & Security." }, { status: 400 });
        }

        const adminKey = decryptKey(admin.encryptedWalletKey);
        console.log("Decrypted key length:", adminKey?.length, "Starts with 0x:", adminKey?.startsWith('0x'));

        if (!adminKey || adminKey.length === 0) {
            return NextResponse.json({ error: "Failed to decrypt wallet key. Please reconnect your wallet." }, { status: 400 });
        }

        const wallet = new ethers.Wallet(adminKey, provider);
        const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, wallet);

        const validPayments = driverPayments.filter(p =>
            p.address &&
            p.address !== "0x0000000000000000000000000000000000000000" &&
            ethers.isAddress(p.address)
        );

        if (validPayments.length === 0) {
            return NextResponse.json({ error: "No drivers with valid wallet addresses found" }, { status: 400 });
        }

        const addresses = validPayments.map(p => p.address);
        const amounts = validPayments.map(p => ethers.parseEther(p.amount.toString()));

        console.log(`Processing batch salary for ${addresses.length} valid drivers...`);
        const tx = await tokenContract.batchMint(addresses, amounts);
        await tx.wait();

        // Store payment records in database only for valid ones
        await prisma.$transaction(
            validPayments.map(p => prisma.salaryPayment.create({
                data: {
                    driverId: p.id,
                    amount: p.amount,
                    transactionHash: tx.hash,
                    status: "PAID"
                }
            }))
        );

        // Generate SALARY_SLIP Invoices for each payment
        await prisma.$transaction(
            validPayments.map(p => prisma.invoice.create({
                data: {
                    invoiceNumber: `SAL-${Date.now()}-${p.id.substring(0, 4)}`, // Simple unique number
                    invoiceDate: new Date(),
                    type: "SALARY_SLIP",
                    status: "PAID",
                    supplierName: "Logix Logistics", // Placeholder - could come from CompanyGSTConfig
                    supplierAddress: "Admin Office",
                    buyerName: `Driver: ${p.id.substring(0, 8)}...`, // Or fetch actual name if available in payload
                    buyerAddress: p.address,
                    placeOfSupply: "Local",
                    subtotal: p.amount,
                    totalTax: 0,
                    grandTotal: p.amount,
                    totalInWords: `${p.amount} LINR`,
                    paidAmount: p.amount,
                    paymentTransactions: {
                        create: {
                            amount: p.amount,
                            transactionHash: tx.hash,
                            paymentMethod: "CRYPTO_SALARY",
                            payerAddress: admin.walletAddress!
                        }
                    },
                    lineItems: {
                        create: {
                            description: "Monthly Salary Payment (LINR)",
                            hsnCode: "9999", // Service code
                            quantity: 1,
                            rate: p.amount,
                            taxableValue: p.amount,
                            // invoiceId handled by nested create
                        }
                    }
                }
            }))
        );

        return NextResponse.json({
            success: true,
            txHash: tx.hash,
            count: validPayments.length,
            message: `Processed ${validPayments.length} salary payments. Skipped ${driverPayments.length - validPayments.length} invalid addresses.`
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Salary API Error:", error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
