import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

// Forced Cache Refresh - ID: 999

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const invoice = await prisma.invoice.findUnique({
            where: { id: params.id },
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
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await req.json();
        const invoice = await prisma.invoice.update({
            where: { id: params.id },
            data: body
        });
        return NextResponse.json(invoice);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const invoice = await prisma.invoice.update({
            where: { id: params.id },
            data: { status: "VOIDED" }
        });
        return NextResponse.json(invoice);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
