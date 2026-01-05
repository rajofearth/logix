import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { generateSequentialNumber, calculateLineItemTaxes, amountToWords } from "../../../../lib/billing/invoice-generator";
import { isInterState } from "../../../../lib/billing/gst-config";
import { InvoiceType } from "@prisma/client";

interface LineItemInput {
    description: string;
    hsnCode: string;
    quantity: number;
    rate: number;
    discount?: number;
    cgstRate?: number;
    sgstRate?: number;
    igstRate?: number;
    cessRate?: number;
}

interface LineItemWithTaxes extends LineItemInput {
    taxableValue: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
}

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

        const invoiceNumber = await generateSequentialNumber(type as InvoiceType);
        const interState = isInterState(originalInvoice.supplierGstin, originalInvoice.buyerGstin, originalInvoice.placeOfSupply);

        const lineItemsWithTaxes: LineItemWithTaxes[] = (lineItems as LineItemInput[]).map((item) => {
            const taxes = calculateLineItemTaxes(item, interState);
            return {
                ...item,
                ...taxes,
                taxableValue: taxes.taxableValue
            };
        });

        const subtotal = lineItemsWithTaxes.reduce((sum: number, item) => sum + Number(item.taxableValue), 0);
        const totalTax = lineItemsWithTaxes.reduce((sum: number, item) => sum + (Number(item.cgstAmount) + Number(item.sgstAmount) + Number(item.igstAmount)), 0);
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
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
