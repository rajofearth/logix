"use client"

import React, { useEffect, useState, useCallback } from "react"
import { Eye, CreditCard } from "lucide-react"
import Link from "next/link"

interface Invoice {
    id: string;
    invoiceNumber: string;
    invoiceDate: string;
    type: string;
    buyerName: string;
    grandTotal: number;
    paidAmount: number;
    status: string;
}

export function InvoiceList({ type, status }: { type?: string; status?: string }) {
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [loading, setLoading] = useState(true)

    const fetchInvoices = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (type) params.append("type", type);
            if (status) params.append("status", status);

            const res = await fetch(`/api/billing/invoices?${params.toString()}`)
            const data = await res.json()
            setInvoices(data)
        } catch (error) {
            console.error("Failed to fetch invoices:", error)
        } finally {
            setLoading(false)
        }
    }, [type, status])

    useEffect(() => {
        fetchInvoices()
        const interval = setInterval(fetchInvoices, 5000)
        return () => clearInterval(interval)
    }, [fetchInvoices])

    if (loading && invoices.length === 0) {
        return (
            <div className="p-8 text-center" style={{ color: '#838383', font: 'var(--w7-font)' }}>
                Loading invoices...
            </div>
        )
    }

    if (invoices.length === 0) {
        return (
            <div className="p-8 text-center" style={{ color: '#838383', font: 'var(--w7-font)' }}>
                No invoices found.
            </div>
        )
    }

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
        <table className="win7-table">
            <thead>
                <tr>
                    <th>Invoice #</th>
                    <th>Date</th>
                    <th>Buyer</th>
                    <th>Amount</th>
                    <th>Paid</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {invoices.map((invoice) => (
                    <tr key={invoice.id}>
                        <td style={{ fontWeight: 500 }}>{invoice.invoiceNumber}</td>
                        <td>{new Date(invoice.invoiceDate).toLocaleDateString()}</td>
                        <td>{invoice.buyerName}</td>
                        <td>₹{Number(invoice.grandTotal).toLocaleString()}</td>
                        <td style={Number(invoice.paidAmount) > 0 ? { color: '#006400', fontWeight: 500 } : {}}>
                            ₹{Number(invoice.paidAmount).toLocaleString()}
                        </td>
                        <td>
                            <span style={getStatusBadgeStyle(invoice.status)}>
                                {invoice.status}
                            </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px', alignItems: 'center' }}>
                                {(invoice.status === 'ISSUED' || invoice.status === 'PENDING') && (
                                    <Link href="/dashboard/payments">
                                        <button className="win7-btn" style={{ minHeight: '20px', padding: '2px 8px', fontSize: '10px', display: 'inline-flex', alignItems: 'center' }}>
                                            <CreditCard className="mr-1" style={{ width: '12px', height: '12px' }} />
                                            Pay
                                        </button>
                                    </Link>
                                )}
                                <Link href={`/dashboard/billing/${invoice.id}`}>
                                    <button className="win7-btn win7-btn-ghost" style={{ minWidth: '24px', minHeight: '20px', padding: '2px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Eye style={{ width: '14px', height: '14px' }} />
                                    </button>
                                </Link>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}


