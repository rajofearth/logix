import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { generateSequentialNumber, calculateLineItemTaxes, amountToWords } from "../../../../lib/billing/invoice-generator";
import { isInterState } from "../../../../lib/billing/gst-config";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { referenceInvoiceId, type, lineItems } = body;

        const originalInvoice = await prisma.invoice.findUnique({
            where: { id: referenceInvoiceId }
        });

        if (!originalInvoice) {
            return NextResponse.json({ error: "Reference invoice not found" }, { status: 404 });
        }

        const invoiceNumber = await generateSequentialNumber(type);
        const interState = isInterState(originalInvoice.supplierGstin, originalInvoice.buyerGstin, originalInvoice.placeOfSupply);

        const lineItemsWithTaxes = lineItems.map((item: any) => {
            const taxes = calculateLineItemTaxes(item, interState);
            return {
                ...item,
                ...taxes,
                taxableValue: taxes.taxableValue
            };
        });

        const subtotal = lineItemsWithTaxes.reduce((sum: number, item: any) => sum + Number(item.taxableValue), 0);
        const totalTax = lineItemsWithTaxes.reduce((sum: number, item: any) => sum + (Number(item.cgstAmount) + Number(item.sgstAmount) + Number(item.igstAmount)), 0);
        const grandTotal = subtotal + totalTax;

        const adjustment = await prisma.invoice.create({
            data: {
                invoiceNumber,
                type,
                invoiceDate: new Date(),
                supplierName: originalInvoice.supplierName,
                supplierGstin: originalInvoice.supplierGstin,
                supplierAddress: originalInvoice.supplierAddress,
                buyerName: originalInvoice.buyerName,
                buyerGstin: originalInvoice.buyerGstin,
                buyerAddress: originalInvoice.buyerAddress,
                placeOfSupply: originalInvoice.placeOfSupply,
                referenceInvoiceId,
                subtotal,
                totalTax,
                grandTotal,
                totalInWords: amountToWords(grandTotal),
                status: "ISSUED",
                lineItems: {
                    create: lineItemsWithTaxes
                }
            }
        });

        return NextResponse.json(adjustment);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
