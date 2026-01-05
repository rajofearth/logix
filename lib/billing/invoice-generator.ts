import { prisma } from "../prisma";
import { GST_CONFIG, getFinancialYear } from "./gst-config";
import { InvoiceType } from "@prisma/client";

interface LineItemInput {
    quantity: number;
    rate: number;
    discount?: number;
    cgstRate?: number;
    sgstRate?: number;
    igstRate?: number;
}

export async function generateSequentialNumber(type: InvoiceType): Promise<string> {
    const fy = getFinancialYear();
    const prefix = "LOGIQ";

    // Count invoices of this type in current FY
    const count = await prisma.invoice.count({
        where: {
            type,
            invoiceNumber: {
                contains: `${prefix}/${fy}/`
            }
        }
    });

    const sequence = (count + 1).toString().padStart(4, "0");
    return `${prefix}/${fy}/${type.slice(0, 3)}/${sequence}`;
}

export function calculateLineItemTaxes(item: LineItemInput, isInterState: boolean) {
    const taxableValue = (item.quantity * item.rate) - (item.discount || 0);

    let cgstRate = 0, sgstRate = 0, igstRate = 0;
    let cgstAmount = 0, sgstAmount = 0, igstAmount = 0;

    if (isInterState) {
        igstRate = item.igstRate || GST_CONFIG.STANDARD_RATE;
        igstAmount = (taxableValue * igstRate) / 100;
    } else {
        cgstRate = item.cgstRate || (GST_CONFIG.STANDARD_RATE / 2);
        sgstRate = item.sgstRate || (GST_CONFIG.STANDARD_RATE / 2);
        cgstAmount = (taxableValue * cgstRate) / 100;
        sgstAmount = (taxableValue * sgstRate) / 100;
    }

    return {
        taxableValue,
        cgstRate,
        cgstAmount,
        sgstRate,
        sgstAmount,
        igstRate,
        igstAmount,
        total: taxableValue + cgstAmount + sgstAmount + igstAmount
    };
}

export function amountToWords(amount: number): string {
    // Simple implementation for now, should use a library like 'number-to-words'
    return `Rupees ${amount.toLocaleString('en-IN')} only`;
}
