"use client"

import { use, useEffect, useState } from "react"
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { SiteHeader } from '@/components/dashboard/site-header'
import { InvoicePreview } from "@/app/dashboard/billing/_component/invoice-preview"
import { Button } from "@/components/ui/button"
import { Printer, Download, Share2, CreditCard } from "lucide-react"
import Link from "next/link"

interface Invoice {
    id: string;
    invoiceNumber: string;
    status: string;
    createdAt: string;
    type: string;
    supplierGstin?: string | null;
    supplierName: string;
    supplierAddress: string;
    buyerName: string;
    buyerGstin?: string | null;
    buyerAddress: string;
    invoiceDate: string;
    placeOfSupply: string;
    subtotal: number;
    totalTax: number;
    grandTotal: number;
    lineItems: Array<{
        description: string;
        hsnCode: string;
        quantity: number;
        rate: number;
        taxableValue: number;
    }>;
}

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [invoice, setInvoice] = useState<Invoice | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`/api/billing/invoices/${id}`)
            .then(res => res.json())
            .then(data => {
                setInvoice(data)
                setLoading(false)
            })
    }, [id])

    if (loading) return <div>Loading...</div>
    if (!invoice) return <div>Invoice not found</div>

    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader title={`Invoice ${invoice.invoiceNumber}`} />
                <div className="flex flex-1 flex-col lg:flex-row bg-zinc-100 dark:bg-zinc-900">
                    {/* Main Preview Area */}
                    <div className="flex-1 p-4 md:p-8 overflow-auto">
                        <InvoicePreview invoice={invoice} />
                    </div>

                    {/* Actions Sidebar */}
                    <div className="w-full lg:w-80 bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 p-6 space-y-6">
                        <div className="space-y-2">
                            <h3 className="font-bold">Document Actions</h3>
                            <p className="text-xs text-muted-foreground">Manage this invoice and its distribution.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                            <Button className="w-full justify-start" variant="outline" onClick={() => window.print()}>
                                <Printer className="mr-2 h-4 w-4" /> Print Document
                            </Button>
                            <Button className="w-full justify-start" variant="outline">
                                <Download className="mr-2 h-4 w-4" /> Download PDF
                            </Button>
                            <Button className="w-full justify-start" variant="outline">
                                <Share2 className="mr-2 h-4 w-4" /> Share with Buyer
                            </Button>
                        </div>

                        <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
                            <h4 className="text-xs font-bold uppercase opacity-50">Details</h4>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-[10px] uppercase opacity-60">Status</p>
                                    <Badge>{invoice.status}</Badge>
                                </div>
                                {invoice.status !== 'PAID' && (
                                    <Button className="w-full bg-primary hover:bg-primary/90" asChild>
                                        <Link href={`/dashboard/payments?tab=bills&invoiceId=${invoice.id}`}>
                                            <CreditCard className="mr-2 h-4 w-4" /> Settle Payment
                                        </Link>
                                    </Button>
                                )}
                                <div>
                                    <p className="text-[10px] uppercase opacity-60">Created At</p>
                                    <p className="text-sm font-medium">{new Date(invoice.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}

function Badge({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary text-primary-foreground">
            {children}
        </span>
    )
}
