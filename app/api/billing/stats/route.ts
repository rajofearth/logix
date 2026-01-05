import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { InvoiceStatus } from "@prisma/client";

export async function GET(_req: NextRequest) {
    try {
        // Fetch all invoices
        const invoices = await prisma.invoice.findMany({
            select: {
                status: true,
                grandTotal: true,
                paidAmount: true
            }
        });

        // Calculate stats
        const totalRevenue = invoices
            .filter(inv => inv.status === InvoiceStatus.PAID)
            .reduce((sum, inv) => sum + Number(inv.grandTotal), 0);

        const pendingAmount = invoices
            .filter(inv => inv.status === InvoiceStatus.PENDING || inv.status === InvoiceStatus.ISSUED)
            .reduce((sum, inv) => sum + (Number(inv.grandTotal) - Number(inv.paidAmount)), 0);

        const pendingCount = invoices.filter(inv =>
            inv.status === InvoiceStatus.PENDING || inv.status === InvoiceStatus.ISSUED
        ).length;

        const draftCount = invoices.filter(inv => inv.status === InvoiceStatus.DRAFT).length;

        // Calculate GST liability (total tax from all paid invoices)
        const paidInvoices = await prisma.invoice.findMany({
            where: { status: InvoiceStatus.PAID },
            select: { totalTax: true }
        });

        const gstLiability = paidInvoices.reduce((sum, inv) => sum + Number(inv.totalTax), 0);

        return NextResponse.json({
            totalRevenue,
            pendingAmount,
            pendingCount,
            draftCount,
            gstLiability
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
