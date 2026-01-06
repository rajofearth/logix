import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/payments/driver-advance
 * Creates a pending expense request that requires admin approval.
 * No blockchain transaction happens until admin approves via /api/payments/fuel-request PATCH.
 */
export async function POST(req: NextRequest) {
    try {
        const { driverId, amount, reason, payeeAddress, payeeName } = await req.json();

        if (!driverId || !amount) {
            return NextResponse.json({ error: "Missing required parameters (driverId, amount)" }, { status: 400 });
        }

        // Verify driver exists
        const driver = await prisma.driver.findUnique({
            where: { id: driverId },
            select: { id: true, name: true }
        });

        if (!driver) {
            return NextResponse.json({ error: "Driver not found" }, { status: 404 });
        }

        // Create pending expense request - requires admin approval
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const request = await (prisma as any).fuelPaymentRequest.create({
            data: {
                driverId: driverId,
                amount: amount,
                payeeAddress: payeeAddress || 'Company Expense',
                payeeName: payeeName || null,
                transactionNote: reason || 'Driver advance request',
                status: 'pending',
            }
        });

        return NextResponse.json({
            success: true,
            requestId: request.id,
            status: 'pending',
            message: "Expense request submitted. Awaiting admin approval."
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Driver advance request error:", error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
