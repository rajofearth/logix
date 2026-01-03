"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Wallet, Users, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const DRIVERS = [
    { name: "Rajesh Kumar", id: "D-102", address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", salary: 25000, status: "pending" },
    { name: "Suresh Raina", id: "D-105", address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", salary: 22000, status: "pending" },
    { name: "Amit Singh", id: "D-110", address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906", salary: 28000, status: "paid" },
];

export function SalaryManagement() {
    const [processing, setProcessing] = useState(false);
    const [payments, setPayments] = useState(DRIVERS);

    const processBatchSalaries = async () => {
        setProcessing(true);
        try {
            const response = await fetch('/api/payments/salary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    driverPayments: payments.filter(d => d.status === 'pending').map(d => ({
                        address: d.address,
                        amount: d.salary
                    }))
                })
            });

            const data = await response.json();
            if (data.success) {
                toast.success(`Batch processed! Tx: ${data.txHash.substring(0, 10)}...`);
                setPayments(payments.map(d => ({ ...d, status: 'paid' })));
            } else {
                toast.error(data.error || "Failed to process salaries");
            }
        } catch (error) {
            toast.error(`Network error ${error}`);
        } finally {
            setProcessing(false);
        }
    };

    const totalPending = payments.filter(d => d.status === 'pending').reduce((acc, curr) => acc + curr.salary, 0);
    const totalSettled = payments.filter(d => d.status === 'paid').reduce((acc, curr) => acc + curr.salary, 0);

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:shadow-md hover:scale-[1.01] transition-all duration-300">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-primary/10">
                                <Users className="h-4 w-4 text-primary" />
                            </div>
                            Total Drivers
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{payments.length}</div>
                    </CardContent>
                </Card>

                <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent hover:shadow-md hover:scale-[1.01] transition-all duration-300">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-orange-500/10">
                                <Wallet className="h-4 w-4 text-orange-500" />
                            </div>
                            Pending Payroll
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">
                            ₹{totalPending.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent hover:shadow-md hover:scale-[1.01] transition-all duration-300">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-green-500/10">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                            </div>
                            Settled This Month
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            ₹{totalSettled.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Payroll Table */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                    <div>
                        <CardTitle>Driver Payroll</CardTitle>
                        <CardDescription>Manage and allot monthly blockchain salaries</CardDescription>
                    </div>
                    <Button
                        onClick={processBatchSalaries}
                        disabled={processing || payments.every(d => d.status === 'paid')}
                        className="transition-all duration-200 active:scale-[0.98] shrink-0"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            "Process Batch Salary"
                        )}
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Driver</TableHead>
                                <TableHead>Wallet Address</TableHead>
                                <TableHead>Amount (LINR)</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.map((driver, index) => (
                                <TableRow
                                    key={driver.id}
                                    className={cn(
                                        "hover:bg-muted/50 transition-colors duration-200",
                                        "animate-in fade-in-0 slide-in-from-left-2"
                                    )}
                                    style={{
                                        animationDelay: `${index * 50}ms`,
                                        animationFillMode: "backwards",
                                    }}
                                >
                                    <TableCell>
                                        <div className="font-medium">{driver.name}</div>
                                        <div className="text-xs text-muted-foreground font-mono">{driver.id}</div>
                                    </TableCell>
                                    <TableCell className="font-mono text-[10px] text-muted-foreground">
                                        {driver.address}
                                    </TableCell>
                                    <TableCell className="font-bold text-primary">₹{driver.salary.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={driver.status === 'paid' ? 'secondary' : 'outline'}
                                            className={cn(
                                                "transition-all duration-200",
                                                driver.status === 'paid'
                                                    ? 'bg-green-500/10 text-green-600 border-green-500/20'
                                                    : 'text-primary border-primary/30'
                                            )}
                                        >
                                            {driver.status === 'paid' ? (
                                                <>
                                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                                    Settled
                                                </>
                                            ) : (
                                                'Scheduled'
                                            )}
                                        </Badge>
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
