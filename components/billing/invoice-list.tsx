"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Download, MoreHorizontal } from "lucide-react"
import Link from "next/link"

export function InvoiceList() {
    const [invoices, setInvoices] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/billing/invoices")
            .then(res => res.json())
            .then(data => {
                setInvoices(data)
                setLoading(false)
            })
    }, [])

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading invoices...</div>

    if (invoices.length === 0) return <div className="p-8 text-center text-muted-foreground">No invoices found.</div>

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                        <TableCell>{new Date(invoice.invoiceDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                            <span className="text-xs font-semibold uppercase opacity-70">
                                {invoice.type.replace("_", " ")}
                            </span>
                        </TableCell>
                        <TableCell>{invoice.buyerName}</TableCell>
                        <TableCell>₹{Number(invoice.grandTotal).toLocaleString()}</TableCell>
                        <TableCell>
                            <Badge variant={invoice.status === 'ISSUED' ? 'default' : 'secondary'}>
                                {invoice.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href={`/dashboard/billing/${invoice.id}`}>
                                        <Eye className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button variant="ghost" size="icon">
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
