"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Wallet, Users, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DriverPayment {
    id: string;
    name: string;
    address: string;
    salary: number;
    status: 'paid' | 'pending';
}

interface SalaryManagementProps {
    walletAddress: string;
}

export function SalaryManagement({ walletAddress }: SalaryManagementProps) {
    const [processing, setProcessing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [payments, setPayments] = useState<DriverPayment[]>([]);

    const fetchDrivers = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/payments/salary');
            const data = await response.json();
            if (Array.isArray(data)) {
                setPayments(data);
            } else {
                toast.error(data.error || "Failed to fetch drivers");
            }
        } catch (error) {
            console.error("Fetch drivers error:", error);
            toast.error("Network error while fetching drivers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrivers();
        const interval = setInterval(fetchDrivers, 5000);
        return () => clearInterval(interval);
    }, []);

    const processBatchSalaries = async () => {
        if (!walletAddress) {
            toast.error("Please connect your wallet in the 'Wallet & Security' tab first.");
            return;
        }

        const pendingPayments = payments.filter(d => d.status === 'pending');
        if (pendingPayments.length === 0) {
            toast.info("No pending salaries to process");
            return;
        }

        setProcessing(true);
        try {
            const response = await fetch('/api/payments/salary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    driverPayments: pendingPayments.map(d => ({
                        id: d.id,
                        address: d.address,
                        amount: d.salary
                    }))
                })
            });

            const data = await response.json();
            if (data.success) {
                toast.success(`Batch processed! Tx: ${data.txHash.substring(0, 10)}...`);
                await fetchDrivers(); // Refresh data from backend
            } else {
                toast.error(data.error || "Failed to process salaries");
            }
        } catch (error) {
            toast.error(`Network error: ${error instanceof Error ? error.message : String(error)}`);
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
                    <div className="flex items-center gap-4">
                        <div>
                            <CardTitle>Driver Payroll</CardTitle>
                            <CardDescription>
                                {walletAddress ? (
                                    <span className="text-green-600 flex items-center gap-1">
                                        <Wallet className="h-3 w-3" />
                                        Paying from: {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
                                    </span>
                                ) : (
                                    <span className="text-destructive flex items-center gap-1">
                                        <Wallet className="h-3 w-3" />
                                        Wallet Not Connected
                                    </span>
                                )}
                            </CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={fetchDrivers}
                            disabled={loading}
                            className="h-8 w-8"
                        >
                            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                        </Button>
                    </div>
                    <Button
                        onClick={processBatchSalaries}
                        disabled={processing || loading || !walletAddress || payments.length === 0 || payments.every(d => d.status === 'paid')}
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
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : payments.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No drivers found in the system.
                        </div>
                    ) : (
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
                                            <div className="text-[10px] text-muted-foreground font-mono truncate w-24">{driver.id}</div>
                                        </TableCell>
                                        <TableCell className="font-mono text-[10px] text-muted-foreground">
                                            {driver.address === "0x0000000000000000000000000000000000000000" ? (
                                                <span className="text-destructive font-sans">Missing Wallet</span>
                                            ) : (
                                                driver.address
                                            )}
                                        </TableCell>
                                        <TableCell className="font-bold text-primary">₹{driver.salary.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={driver.status === 'paid' ? 'secondary' : 'outline'}
                                                className={cn(
                                                    "transition-all duration-200",
                                                    driver.status === 'paid'
                                                        ? 'bg-green-500/10 text-green-600 border-green-500/20'
                                                        : (driver.address === "0x0000000000000000000000000000000000000000"
                                                            ? 'bg-destructive/10 text-destructive border-destructive/20'
                                                            : 'text-primary border-primary/30')
                                                )}
                                            >
                                                {driver.status === 'paid' ? (
                                                    <>
                                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                                        Settled
                                                    </>
                                                ) : (
                                                    driver.address === "0x0000000000000000000000000000000000000000" ? 'Action Required' : 'Scheduled'
                                                )}
                                            </Badge>
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
