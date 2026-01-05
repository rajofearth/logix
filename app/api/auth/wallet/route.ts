import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest) {
    try {
        const admin = await prisma.adminUser.findFirst();

        if (!admin) {
            return NextResponse.json({ address: null, encryptedKey: null });
        }

        return NextResponse.json({
            address: admin.walletAddress,
            encryptedKey: admin.encryptedWalletKey
        });

    } catch {
        return NextResponse.json({ error: "Failed to fetch wallet info" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { address, encryptedKey } = await req.json();

        // Check if admin exists
        let admin = await prisma.adminUser.findFirst();

        if (!admin) {
            // Create default admin if not exists
            admin = await prisma.adminUser.create({
                data: {
                    name: "Admin User",
                    email: "admin@logix.com",
                    emailVerified: true
                }
            });
        }

        await prisma.adminUser.update({
            where: { id: admin.id },
            data: {
                walletAddress: address,
                encryptedWalletKey: encryptedKey
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Wallet update error:", error);
        return NextResponse.json({ error: "Failed to update wallet info" }, { status: 500 });
    }
}
