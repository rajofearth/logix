"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Receipt, CreditCard, Clock, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

interface BillSettlementProps {
    encryptedPrivateKey: string;
}

interface SettlementInvoice {
    id: string;
    invoiceNumber: string;
    buyerName: string;
    status: string;
    grandTotal: string | number;
    paidAmount: string | number;
}

export function BillSettlement({ encryptedPrivateKey }: BillSettlementProps) {
    const [invoices, setInvoices] = useState<SettlementInvoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [settling, setSettling] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const targetInvoiceId = searchParams.get('invoiceId');
    const tableRowRefs = React.useRef<{ [key: string]: HTMLTableRowElement | null }>({});

    const fetchInvoices = React.useCallback(async () => {
        try {
            const res = await fetch('/api/billing/invoices?pending=true');
            const data = await res.json();

            if (Array.isArray(data)) {
                setInvoices(data);
            } else {
                console.error("API Error: Expected array but got", data);
                if (data.error) {
                    toast.error(`Invoice fetch error: ${data.error}`);
                }
                setInvoices([]);
            }
        } catch (error) {
            console.error("Failed to fetch pending invoices:", error);
            toast.error("Network error while fetching invoices");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInvoices();
        const interval = setInterval(fetchInvoices, 5000);
        return () => clearInterval(interval);
    }, [fetchInvoices]);

    useEffect(() => {
        if (!loading && targetInvoiceId && tableRowRefs.current[targetInvoiceId]) {
            tableRowRefs.current[targetInvoiceId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [loading, targetInvoiceId]);

    const settleBill = async (id: string, amount: number) => {
        if (!encryptedPrivateKey) {
            toast.error("Please connect your wallet first in the 'Wallet & Security' tab.");
            return;
        }

        setSettling(id);
        try {
            const res = await fetch('/api/payments/escrow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'deposit',
                    amount: amount,
                    reason: `Settlement for invoice ${id}`,
                    invoiceId: id,
                    buyerEncryptedKey: encryptedPrivateKey
                })
            });

            const result = await res.json();
            if (result.success) {
                toast.success(`Invoice ${id} settled successfully! Tx: ${result.txHash.substring(0, 10)}...`);
                await fetchInvoices();
            } else {
                toast.error(`Payment failed: ${result.error || 'Unknown error'}`);
            }

        } catch (error) {
            toast.error(`Payment failed: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setSettling(null);
        }
    };

    const totalDue = Array.isArray(invoices)
        ? invoices.reduce((acc, curr) => acc + Number(curr.grandTotal) - Number(curr.paidAmount), 0)
        : 0;
    const outstandingCount = Array.isArray(invoices) ? invoices.length : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Bill Settlement</h2>
                    <p className="text-muted-foreground text-sm">Review and settle pending operational invoices</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent hover:shadow-md hover:scale-[1.01] transition-all duration-300">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-red-500/10">
                                <Clock className="h-4 w-4 text-red-500" />
                            </div>
                            Total Amount Due
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            ₹{totalDue.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:shadow-md hover:scale-[1.01] transition-all duration-300">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-primary/10">
                                <Receipt className="h-4 w-4 text-primary" />
                            </div>
                            Outstanding Invoices
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{outstandingCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Bills Table */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                    <CardTitle>Pending Invoices</CardTitle>
                    <CardDescription>Direct blockchain settlement for operational partners</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading && invoices.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : invoices.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No pending invoices found.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice #</TableHead>
                                    <TableHead>Entity</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Balance</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.map((invoice, index) => (
                                    <TableRow
                                        key={invoice.id}
                                        ref={el => { tableRowRefs.current[invoice.id] = el; }}
                                        className={cn(
                                            "hover:bg-muted/50 transition-colors duration-200",
                                            "animate-in fade-in-0 slide-in-from-left-2",
                                            invoice.id === targetInvoiceId && "bg-primary/5 border-l-2 border-primary"
                                        )}
                                        style={{
                                            animationDelay: `${index * 50}ms`,
                                            animationFillMode: "backwards",
                                        }}
                                    >
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-mono text-sm">{invoice.invoiceNumber}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{invoice.buyerName}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-[10px]">
                                                {invoice.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>₹{Number(invoice.grandTotal).toLocaleString()}</TableCell>
                                        <TableCell className="font-bold text-primary">₹{(Number(invoice.grandTotal) - Number(invoice.paidAmount)).toLocaleString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                onClick={() => settleBill(invoice.id, Number(invoice.grandTotal) - Number(invoice.paidAmount))}
                                                disabled={settling === invoice.id}
                                                className="h-8 gap-1.5 transition-all duration-200 active:scale-[0.98]"
                                            >
                                                {settling === invoice.id ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <CreditCard className="h-3.5 w-3.5" />
                                                )}
                                                {settling === invoice.id ? "Paying..." : "Settle Now"}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
