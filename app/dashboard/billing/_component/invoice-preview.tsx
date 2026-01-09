"use client"

interface InvoiceLineItem {
    description: string;
    hsnCode: string;
    quantity: number;
    rate: number;
    taxableValue: number;
}

interface Invoice {
    type: string;
    supplierGstin?: string | null;
    supplierName: string;
    supplierAddress: string;
    buyerName: string;
    buyerGstin?: string | null;
    buyerAddress: string;
    invoiceNumber: string;
    invoiceDate: string;
    placeOfSupply: string;
    subtotal: number;
    totalTax: number;
    grandTotal: number;
    lineItems: InvoiceLineItem[];
}

export function InvoicePreview({ invoice }: { invoice: Invoice }) {
    if (!invoice) return null;

    const isInter = invoice.supplierGstin?.slice(0, 2) !== invoice.buyerGstin?.slice(0, 2);

    return (
        <div className="max-w-[21cm] mx-auto bg-white p-[1cm] text-black shadow-lg print:shadow-none min-h-[29.7cm] flex flex-col font-sans">
            {/* Header */}
            <div className="flex justify-between border-b-2 border-black pb-4">
                <div>
                    <h1 className="text-2xl font-bold uppercase">{invoice.type.replace('_', ' ')}</h1>
                    <p className="text-sm font-semibold opacity-70">Taxable Document</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold">LOGIQ Logistics</h2>
                    <p className="text-xs">GSTIN: {invoice.supplierGstin || 'PENDING'}</p>
                </div>
            </div>

            {/* Billing Info */}
            <div className="grid grid-cols-2 gap-8 my-8 text-sm">
                <div className="space-y-1">
                    <p className="font-bold border-b border-black pb-1 mb-2 uppercase text-xs">Supplier Details</p>
                    <p className="font-bold">{invoice.supplierName}</p>
                    <p className="whitespace-pre-wrap opacity-80">{invoice.supplierAddress}</p>
                </div>
                <div className="space-y-1">
                    <p className="font-bold border-b border-black pb-1 mb-2 uppercase text-xs">Bill To</p>
                    <p className="font-bold">{invoice.buyerName}</p>
                    <p className="text-xs font-semibold">GSTIN: {invoice.buyerGstin}</p>
                    <p className="whitespace-pre-wrap opacity-80">{invoice.buyerAddress}</p>
                </div>
            </div>

            {/* Document Details */}
            <div className="grid grid-cols-3 gap-4 mb-8 bg-zinc-50 p-3 rounded border text-xs">
                <div>
                    <p className="opacity-60 uppercase font-bold text-[10px]">Invoice Number</p>
                    <p className="font-bold">{invoice.invoiceNumber}</p>
                </div>
                <div>
                    <p className="opacity-60 uppercase font-bold text-[10px]">Invoice Date</p>
                    <p className="font-bold">{new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                </div>
                <div>
                    <p className="opacity-60 uppercase font-bold text-[10px]">Place of Supply</p>
                    <p className="font-bold">{invoice.placeOfSupply}</p>
                </div>
            </div>

            {/* Line Items */}
            <div className="flex-1">
                <table className="win7-table w-full text-xs print:win7-table" style={{ font: 'var(--w7-font)' }}>
                    <thead>
                        <tr>
                            <th style={{ width: '32px' }}>#</th>
                            <th>Description</th>
                            <th style={{ width: '80px', textAlign: 'center' }}>HSN/SAC</th>
                            <th style={{ width: '48px', textAlign: 'center' }}>Qty</th>
                            <th style={{ width: '96px', textAlign: 'right' }}>Rate</th>
                            <th style={{ width: '112px', textAlign: 'right' }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.lineItems.map((item, i: number) => (
                            <tr key={i}>
                                <td style={{ textAlign: 'center' }}>{i + 1}</td>
                                <td>{item.description}</td>
                                <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>{item.hsnCode}</td>
                                <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                <td style={{ textAlign: 'right' }}>{Number(item.rate).toLocaleString()}</td>
                                <td style={{ textAlign: 'right', fontWeight: 600 }}>{Number(item.taxableValue).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end mt-8">
                <div className="w-64 space-y-2 text-sm">
                    <div className="flex justify-between border-b pb-1">
                        <span className="opacity-60">Subtotal</span>
                        <span>₹{Number(invoice.subtotal).toLocaleString()}</span>
                    </div>
                    {isInter ? (
                        <div className="flex justify-between border-b pb-1">
                            <span className="opacity-60">IGST (18%)</span>
                            <span>₹{Number(invoice.totalTax).toLocaleString()}</span>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between border-b pb-1 text-xs">
                                <span className="opacity-60">CGST (9%)</span>
                                <span>₹{(Number(invoice.totalTax) / 2).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between border-b pb-1 text-xs">
                                <span className="opacity-60">SGST (9%)</span>
                                <span>₹{(Number(invoice.totalTax) / 2).toLocaleString()}</span>
                            </div>
                        </>
                    )}
                    <div className="flex justify-between text-lg font-bold pt-2 border-t-2 border-zinc-200">
                        <span>Total</span>
                        <span>₹{Number(invoice.grandTotal).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-zinc-200 grid grid-cols-2 gap-8 text-xs italic opacity-60">
                <div>
                    <p className="font-bold mb-1">Terms & Conditions</p>
                    <p>1. Prices inclusive of GST as applicable.</p>
                    <p>2. Payment due within 15 days of invoice date.</p>
                    <p>3. This is a computer-generated document and requires no signature.</p>
                </div>
                <div className="text-right">
                    <p className="font-bold mb-1">Company Seal/Signature</p>
                    <div className="h-16 w-32 border border-zinc-200 ml-auto rounded mt-2 flex items-center justify-center text-[10px]">
                        Digitally Signed
                    </div>
                </div>
            </div>
        </div>
    )
}
