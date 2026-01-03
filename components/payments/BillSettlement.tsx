"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Receipt, CreditCard, Clock, FileText, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const DUE_BILLS = [
    { id: "INV-2024-001", entity: "Reliance Logistics", amount: 15000, due: "2024-03-25", status: "due", category: "Vendor" },
    { id: "INV-2024-002", entity: "Adani Warehouse", amount: 8500, due: "2024-03-24", status: "due", category: "Storage" },
    { id: "INV-2024-003", entity: "Toll Services", amount: 1200, due: "2024-03-22", status: "paid", category: "Misc" },
];

export function BillSettlement() {
    const [bills, setBills] = useState(DUE_BILLS);
    const [settling, setSettling] = useState<string | null>(null);

    const settleBill = async (id: string, _amount: number) => {
        setSettling(id);
        try {
            // For demo, we just simulate a transfer or escrow release
            // In reality, this would call /api/payments/transfer or /api/payments/escrow
            await new Promise(r => setTimeout(r, 1500));

            setBills(bills.map(b => b.id === id ? { ...b, status: 'paid' } : b));
            toast.success(`Bill ${id} settled successfully!`);

        } catch (error) {
            toast.error(`Payment failed: ${error}`);
        } finally {
            setSettling(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Bill Settlement</h2>
                    <p className="text-muted-foreground">Review and settle pending operational invoices</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-red-500/20 bg-red-500/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Clock className="h-4 w-4 text-red-500" />
                            Total Due
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            ₹{bills.filter(b => b.status === 'due').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-green-500/20 bg-green-500/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Total Settled
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            ₹{bills.filter(b => b.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Receipt className="h-4 w-4 text-blue-500" />
                            Outstanding Invoices
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{bills.filter(b => b.status === 'due').length}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Pending Bills</CardTitle>
                    <CardDescription>Direct blockchain settlement for operational partners</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice ID</TableHead>
                                <TableHead>Entity</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bills.map((bill) => (
                                <TableRow key={bill.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        {bill.id}
                                    </TableCell>
                                    <TableCell>{bill.entity}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-[10px]">
                                            {bill.category}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-bold text-blue-600">₹{bill.amount.toLocaleString()}</TableCell>
                                    <TableCell className="text-muted-foreground text-xs">{bill.due}</TableCell>
                                    <TableCell className="text-right">
                                        {bill.status === 'due' ? (
                                            <Button
                                                size="sm"
                                                onClick={() => settleBill(bill.id, bill.amount)}
                                                disabled={settling === bill.id}
                                                className="bg-blue-600 hover:bg-blue-700 h-8 gap-1.5"
                                            >
                                                <CreditCard className="h-3.5 w-3.5" />
                                                {settling === bill.id ? "Paying..." : "Settle Now"}
                                            </Button>
                                        ) : (
                                            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                                                Paid
                                            </Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
