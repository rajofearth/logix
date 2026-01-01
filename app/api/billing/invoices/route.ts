import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { InvoiceSchema } from "../../../../lib/billing/validation-schemas";
import { generateSequentialNumber, calculateLineItemTaxes, amountToWords } from "../../../../lib/billing/invoice-generator";
import { isInterState } from "../../../../lib/billing/gst-config";

// Forced Cache Refresh - ID: 999

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type");
        const status = searchParams.get("status");

        const invoices = await prisma.invoice.findMany({
            where: {
                ...(type && { type: type as any }),
                ...(status && { status: status as any }),
            },
            include: {
                lineItems: true
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return NextResponse.json(invoices);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validated = InvoiceSchema.parse({
            ...body,
            invoiceDate: body.invoiceDate ? new Date(body.invoiceDate) : new Date()
        });

        const invoiceNumber = await generateSequentialNumber(validated.type as any);
        const interState = isInterState(validated.supplierGstin ?? null, validated.buyerGstin ?? null, validated.placeOfSupply);

        const lineItemsWithTaxes = validated.lineItems.map(item => {
            const taxes = calculateLineItemTaxes(item, interState);
            return {
                ...item,
                ...taxes,
                taxableValue: taxes.taxableValue
            };
        });

        const subtotal = lineItemsWithTaxes.reduce((sum, item) => sum + Number(item.taxableValue), 0);
        const totalTax = lineItemsWithTaxes.reduce((sum, item) => sum + (Number(item.cgstAmount) + Number(item.sgstAmount) + Number(item.igstAmount)), 0);
        const grandTotal = subtotal + totalTax;

        const invoice = await prisma.invoice.create({
            data: {
                ...validated,
                invoiceNumber,
                subtotal,
                totalTax,
                grandTotal,
                totalInWords: amountToWords(grandTotal),
                status: "ISSUED",
                lineItems: {
                    create: lineItemsWithTaxes
                }
            },
            include: {
                lineItems: true
            }
        });

        return NextResponse.json(invoice);
    } catch (error: any) {
        console.error("Invoice creation failed:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
