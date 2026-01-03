"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Receipt, CreditCard, Clock, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
            await new Promise(r => setTimeout(r, 1500));
            setBills(bills.map(b => b.id === id ? { ...b, status: 'paid' } : b));
            toast.success(`Bill ${id} settled successfully!`);

        } catch (error) {
            toast.error(`Payment failed: ${error}`);
        } finally {
            setSettling(null);
        }
    };

    const totalDue = bills.filter(b => b.status === 'due').reduce((acc, curr) => acc + curr.amount, 0);
    const totalPaid = bills.filter(b => b.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
    const outstandingCount = bills.filter(b => b.status === 'due').length;

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent hover:shadow-md hover:scale-[1.01] transition-all duration-300">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-red-500/10">
                                <Clock className="h-4 w-4 text-red-500" />
                            </div>
                            Total Due
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            ₹{totalDue.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent hover:shadow-md hover:scale-[1.01] transition-all duration-300">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-green-500/10">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            </div>
                            Total Settled
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            ₹{totalPaid.toLocaleString()}
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
                            {bills.map((bill, index) => (
                                <TableRow
                                    key={bill.id}
                                    className={cn(
                                        "hover:bg-muted/50 transition-colors duration-200",
                                        "animate-in fade-in-0 slide-in-from-left-2"
                                    )}
                                    style={{
                                        animationDelay: `${index * 50}ms`,
                                        animationFillMode: "backwards",
                                    }}
                                >
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-mono text-sm">{bill.id}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{bill.entity}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-[10px]">
                                            {bill.category}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-bold text-primary">₹{bill.amount.toLocaleString()}</TableCell>
                                    <TableCell className="text-muted-foreground text-xs">{bill.due}</TableCell>
                                    <TableCell className="text-right">
                                        {bill.status === 'due' ? (
                                            <Button
                                                size="sm"
                                                onClick={() => settleBill(bill.id, bill.amount)}
                                                disabled={settling === bill.id}
                                                className="h-8 gap-1.5 transition-all duration-200 active:scale-[0.98]"
                                            >
                                                {settling === bill.id ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <CreditCard className="h-3.5 w-3.5" />
                                                )}
                                                {settling === bill.id ? "Paying..." : "Settle Now"}
                                            </Button>
                                        ) : (
                                            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                                                <CheckCircle className="h-3 w-3 mr-1" />
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
