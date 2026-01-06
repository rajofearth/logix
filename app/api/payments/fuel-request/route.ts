import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = "nodejs";

type FuelRequestDto = {
    id: string;
    driverId: string;
    driverName: string;
    amount: number;
    payeeAddress: string;
    payeeName: string | null;
    transactionNote: string | null;
    status: string;
    createdAt: string;
    processedAt: string | null;
};

/**
 * GET /api/payments/fuel-request
 * Returns all fuel payment requests (for admin dashboard)
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const requests = await (prisma as any).fuelPaymentRequest.findMany({
            where: status ? { status: status as 'pending' | 'approved' | 'rejected' } : undefined,
            orderBy: { createdAt: 'desc' },
            include: {
                driver: {
                    select: { name: true }
                }
            }
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dto: FuelRequestDto[] = requests.map((r: any) => ({
            id: r.id,
            driverId: r.driverId,
            driverName: r.driver.name,
            amount: Number(r.amount),
            payeeAddress: r.payeeAddress,
            payeeName: r.payeeName,
            transactionNote: r.transactionNote,
            status: r.status,
            createdAt: r.createdAt.toISOString(),
            processedAt: r.processedAt?.toISOString() || null,
        }));

        return NextResponse.json(dto);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

/**
 * PATCH /api/payments/fuel-request
 * Approve or reject a fuel payment request
 */
export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { requestId, action } = body as { requestId: string; action: 'approve' | 'reject' };

        if (!requestId || !action) {
            return NextResponse.json({ error: "requestId and action are required" }, { status: 400 });
        }

        if (action !== 'approve' && action !== 'reject') {
            return NextResponse.json({ error: "action must be 'approve' or 'reject'" }, { status: 400 });
        }

        // Find the request
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const request = await (prisma as any).fuelPaymentRequest.findUnique({
            where: { id: requestId },
            include: { driver: { select: { name: true } } }
        });

        if (!request) {
            return NextResponse.json({ error: "Fuel payment request not found" }, { status: 404 });
        }

        if (request.status !== 'pending') {
            return NextResponse.json({ error: "Request already processed" }, { status: 400 });
        }

        const newStatus = action === 'approve' ? 'approved' : 'rejected';

        if (action === 'approve') {
            // Create invoice and update request in a transaction
            const result = await prisma.$transaction(async (tx) => {
                // Generate invoice number
                const invoiceNumber = `FUEL-${Date.now()}-${request.id.substring(0, 4)}`;

                // Create the invoice
                const invoice = await tx.invoice.create({
                    data: {
                        invoiceNumber,
                        invoiceDate: new Date(),
                        type: 'TAX_INVOICE',
                        status: 'PAID',
                        supplierName: request.payeeName || 'Fuel Station',
                        supplierAddress: request.payeeAddress,
                        buyerName: `Driver: ${request.driver.name}`,
                        buyerAddress: 'Driver Location',
                        placeOfSupply: 'Local',
                        subtotal: request.amount,
                        totalTax: 0,
                        grandTotal: request.amount,
                        totalInWords: `${request.amount} INR`,
                        paidAmount: request.amount,
                        lineItems: {
                            create: {
                                description: request.transactionNote || 'Fuel Payment',
                                hsnCode: '2710',
                                quantity: 1,
                                rate: request.amount,
                                taxableValue: request.amount,
                            }
                        }
                    }
                });

                // Update the request
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const updatedRequest = await (tx as any).fuelPaymentRequest.update({
                    where: { id: requestId },
                    data: {
                        status: newStatus,
                        processedAt: new Date(),
                        invoiceId: invoice.id,
                    }
                });

                return { request: updatedRequest, invoice };
            });

            return NextResponse.json({
                success: true,
                message: "Fuel payment request approved and invoice created",
                requestId: result.request.id,
                invoiceId: result.invoice.id,
                invoiceNumber: result.invoice.invoiceNumber,
            });
        } else {
            // Just reject the request
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const updatedRequest = await (prisma as any).fuelPaymentRequest.update({
                where: { id: requestId },
                data: {
                    status: newStatus,
                    processedAt: new Date(),
                }
            });

            return NextResponse.json({
                success: true,
                message: "Fuel payment request rejected",
                requestId: updatedRequest.id,
            });
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("Fuel request PATCH error:", error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
