import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

// Forced Cache Refresh - ID: 999

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const invoice = await prisma.invoice.findUnique({
            where: { id },
            include: {
                lineItems: true,
                auditLogs: true,
                adjustments: true
            }
        });

        if (!invoice) {
            return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
        }

        return NextResponse.json(invoice);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const body = await req.json();
        const invoice = await prisma.invoice.update({
            where: { id },
            data: body
        });
        return NextResponse.json(invoice);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const invoice = await prisma.invoice.update({
            where: { id },
            data: { status: "VOIDED" }
        });
        return NextResponse.json(invoice);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
