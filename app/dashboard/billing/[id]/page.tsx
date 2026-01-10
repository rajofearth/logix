"use client"

import React, { use, useEffect, useState } from "react"
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { InvoicePreview } from "@/app/dashboard/billing/_component/invoice-preview"
import { Printer, Download, Share2, CreditCard, ArrowLeft } from "lucide-react"
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

    if (loading) {
        return (
            <div className="p-8 text-center" style={{ color: '#838383', font: 'var(--w7-font)' }}>
                Loading invoice...
            </div>
        )
    }
    if (!invoice) {
        return (
            <div className="p-8 text-center" style={{ color: '#838383', font: 'var(--w7-font)' }}>
                Invoice not found
            </div>
        )
    }

    return (
        <DashboardShell title={`Invoice ${invoice.invoiceNumber}`}>
            <div className="flex flex-col lg:flex-row gap-4" style={{ minHeight: 'calc(100vh - 120px)' }}>
                {/* Main Preview Area */}
                <div className="flex-1 p-4 md:p-8 overflow-auto" style={{ background: 'var(--w7-surface)' }}>
                    <InvoicePreview invoice={invoice} />
                </div>

                {/* Actions Sidebar */}
                <div className="w-full lg:w-80 win7-groupbox" style={{ alignSelf: 'flex-start' }}>
                    <legend>Document Actions</legend>
                    <div className="space-y-2 mb-4">
                        <p style={{ font: 'var(--w7-font)', fontSize: '10px', color: '#666' }}>Manage this invoice and its distribution.</p>
                    </div>

                    {/* Back Button */}
                    <div className="mb-4">
                        <Link href="/dashboard/billing">
                            <button className="win7-btn w-full justify-start" style={{ display: 'flex', alignItems: 'center' }}>
                                <ArrowLeft className="mr-2" style={{ width: '14px', height: '14px' }} /> Back to Invoices
                            </button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        <button className="win7-btn w-full justify-start" onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center' }}>
                            <Printer className="mr-2" style={{ width: '14px', height: '14px' }} /> Print Document
                        </button>
                        <button className="win7-btn w-full justify-start" style={{ display: 'flex', alignItems: 'center' }}>
                            <Download className="mr-2" style={{ width: '14px', height: '14px' }} /> Download PDF
                        </button>
                        <button className="win7-btn w-full justify-start" style={{ display: 'flex', alignItems: 'center' }}>
                            <Share2 className="mr-2" style={{ width: '14px', height: '14px' }} /> Share with Buyer
                        </button>
                    </div>

                    <div className="pt-6 border-t" style={{ borderColor: '#cfcfcf', marginTop: '16px' }}>
                        <h4 style={{ font: 'var(--w7-font)', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: '#666', marginBottom: '12px' }}>Details</h4>
                        <div className="space-y-3">
                            <div>
                                <p style={{ font: 'var(--w7-font)', fontSize: '10px', textTransform: 'uppercase', color: '#666', marginBottom: '4px' }}>Status</p>
                                <StatusBadge status={invoice.status} />
                            </div>
                            {invoice.status !== 'PAID' && (
                                <Link href={`/dashboard/payments?tab=bills&invoiceId=${invoice.id}`} className="block">
                                    <button className="win7-btn w-full default" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <CreditCard className="mr-2" style={{ width: '14px', height: '14px' }} /> Settle Payment
                                    </button>
                                </Link>
                            )}
                            <div>
                                <p style={{ font: 'var(--w7-font)', fontSize: '10px', textTransform: 'uppercase', color: '#666', marginBottom: '4px' }}>Created At</p>
                                <p style={{ font: 'var(--w7-font)', fontSize: '11px', fontWeight: 500 }}>{new Date(invoice.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardShell>
    )
}

function StatusBadge({ status }: { status: string }) {
    const getStatusBadgeStyle = (status: string): React.CSSProperties => {
        const baseStyle: React.CSSProperties = {
            display: 'inline-block',
            padding: '1px 6px',
            fontSize: '10px',
            font: 'var(--w7-font)',
            border: '1px solid var(--w7-el-bd)',
            borderRadius: 'var(--w7-el-bdr)',
            background: 'var(--w7-el-grad)',
            color: '#222',
            boxShadow: 'var(--w7-el-sd)',
        }
        
        if (status === 'PAID') {
            return {
                ...baseStyle,
                background: 'linear-gradient(#d4edda 45%, #c3e6cb 45%, #b1dfbb)',
                borderColor: '#28a745',
                color: '#155724',
            }
        } else if (status === 'ISSUED' || status === 'PENDING') {
            return {
                ...baseStyle,
                background: 'linear-gradient(#bee5eb 45%, #abdde5 45%, #98d5df)',
                borderColor: '#17a2b8',
                color: '#0c5460',
            }
        } else if (status === 'DRAFT') {
            return {
                ...baseStyle,
                background: 'var(--w7-el-grad)',
                borderColor: 'var(--w7-el-bd)',
                color: '#666',
            }
        } else {
            return baseStyle
        }
    }

    return (
        <span style={getStatusBadgeStyle(status)}>
            {status}
        </span>
    )
}
