import { z } from "zod";

export const InvoiceLineItemSchema = z.object({
    description: z.string().min(1, "Description is required"),
    hsnCode: z.string().min(4, "Valid HSN/SAC code required"),
    quantity: z.number().positive(),
    rate: z.number().nonnegative(),
    discount: z.number().default(0),
    cgstRate: z.number().default(0),
    sgstRate: z.number().default(0),
    igstRate: z.number().default(0),
    cessRate: z.number().default(0),
});

export const InvoiceSchema = z.object({
    type: z.enum(["TAX_INVOICE", "BILL_OF_SUPPLY", "DELIVERY_CHALLAN", "EXPORT_INVOICE", "CREDIT_NOTE", "DEBIT_NOTE"]),
    invoiceDate: z.date().default(() => new Date()),
    supplierName: z.string().min(1),
    supplierGstin: z.string().length(15).optional().nullable(),
    supplierAddress: z.string().min(1),
    supplierEmail: z.string().email().optional().nullable(),
    supplierPhone: z.string().optional().nullable(),
    buyerName: z.string().min(1),
    buyerGstin: z.string().length(15).optional().nullable(),
    buyerAddress: z.string().min(1),
    buyerEmail: z.string().email().optional().nullable(),
    placeOfSupply: z.string().min(1),
    jobId: z.string().uuid().optional().nullable(),
    lineItems: z.array(InvoiceLineItemSchema).min(1),
    terms: z.string().optional().nullable(),
    bankAccount: z.string().optional().nullable(),
    bankIfsc: z.string().optional().nullable(),
    bankName: z.string().optional().nullable(),
});
