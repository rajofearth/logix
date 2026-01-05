import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { InvoiceStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
    try {
        const { invoiceId, amount, transactionHash, payerAddress } = await req.json();

        if (!invoiceId || !amount || !transactionHash) {
            return NextResponse.json(
                { error: 'Missing required fields: invoiceId, amount, transactionHash' },
                { status: 400 }
            );
        }

        // Get the invoice
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { paymentTransactions: true }
        });

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        // Calculate new paid amount
        const paymentAmount = Number(amount);
        const currentPaid = Number(invoice.paidAmount);
        const newPaidAmount = currentPaid + paymentAmount;
        const grandTotal = Number(invoice.grandTotal);

        // Determine new status
        let newStatus = invoice.status;
        if (newPaidAmount >= grandTotal) {
            newStatus = InvoiceStatus.PAID;
        } else if (newPaidAmount > 0 && invoice.status === InvoiceStatus.PENDING) {
            // Keep as PENDING if partially paid
            newStatus = InvoiceStatus.PENDING;
        }

        // Create payment transaction and update invoice in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create payment record
            const paymentTransaction = await tx.paymentTransaction.create({
                data: {
                    invoiceId,
                    amount: paymentAmount,
                    transactionHash,
                    payerAddress: payerAddress || null,
                    paymentMethod: 'ESCROW'
                }
            });

            // Update invoice
            const updatedInvoice = await tx.invoice.update({
                where: { id: invoiceId },
                data: {
                    paidAmount: newPaidAmount,
                    status: newStatus
                },
                include: {
                    paymentTransactions: true,
                    lineItems: true
                }
            });

            // Create audit log
            await tx.invoiceAuditLog.create({
                data: {
                    invoiceId,
                    action: 'PAYMENT_RECORDED',
                    details: {
                        amount: paymentAmount,
                        transactionHash,
                        payerAddress,
                        previousPaidAmount: currentPaid,
                        newPaidAmount,
                        previousStatus: invoice.status,
                        newStatus
                    }
                }
            });

            return { paymentTransaction, invoice: updatedInvoice };
        });

        return NextResponse.json({
            success: true,
            payment: result.paymentTransaction,
            invoice: result.invoice
        });

    } catch (error: unknown) {
        console.error('Payment recording error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
