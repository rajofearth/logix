"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Wallet, Users, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

// Mock driver data
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
        } catch (_error) {
            toast.error("Network error");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-purple-500/5 border-purple-500/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Users className="h-4 w-4 text-purple-500" />
                            Total Drivers
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{payments.length}</div>
                    </CardContent>
                </Card>

                <Card className="bg-blue-500/5 border-blue-500/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Wallet className="h-4 w-4 text-blue-500" />
                            Pending Payroll
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            ₹{payments.filter(d => d.status === 'pending').reduce((acc, curr) => acc + curr.salary, 0).toLocaleString()}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-green-500/5 border-green-500/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            Settled This Month
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            ₹{payments.filter(d => d.status === 'paid').reduce((acc, curr) => acc + curr.salary, 0).toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Driver Payroll</CardTitle>
                        <CardDescription>Manage and allot monthly blockchain salaries</CardDescription>
                    </div>
                    <Button
                        onClick={processBatchSalaries}
                        disabled={processing || payments.every(d => d.status === 'paid')}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        {processing ? "Processing..." : "Process Batch Salary"}
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
                            {payments.map((driver) => (
                                <TableRow key={driver.id}>
                                    <TableCell>
                                        <div className="font-medium">{driver.name}</div>
                                        <div className="text-xs text-muted-foreground">{driver.id}</div>
                                    </TableCell>
                                    <TableCell className="font-mono text-[10px]">{driver.address}</TableCell>
                                    <TableCell className="font-bold">₹{driver.salary.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Badge variant={driver.status === 'paid' ? 'secondary' : 'outline'} className={driver.status === 'paid' ? 'bg-green-500/10 text-green-600' : 'text-blue-500'}>
                                            {driver.status === 'paid' ? 'Settled' : 'Scheduled'}
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
