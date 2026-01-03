"use client";

import { PaymentPortal } from '@/components/payments/PaymentPortal';
import { BlockExplorer } from '@/components/payments/BlockExplorer';
import { SalaryManagement } from '@/components/payments/SalaryManagement';
import { BillSettlement } from '@/components/payments/BillSettlement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldCheck, Zap, History, Users, CreditCard } from 'lucide-react';

export default function PaymentsPage() {
    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Payment Platform
                    </h2>
                    <p className="text-muted-foreground">
                        Secure blockchain-powered transactions for buyers and drivers.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="portal" className="space-y-4">
                <TabsList className="bg-muted/50 p-1">
                    <TabsTrigger value="portal" className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        Wallet & Security
                    </TabsTrigger>
                    <TabsTrigger value="salary" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Salary Management
                    </TabsTrigger>
                    <TabsTrigger value="bills" className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Bill Settlement
                    </TabsTrigger>
                    <TabsTrigger value="explorer" className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Live Explorer
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="portal" className="space-y-4">
                    <PaymentPortal />
                </TabsContent>

                <TabsContent value="salary" className="space-y-4">
                    <SalaryManagement />
                </TabsContent>

                <TabsContent value="bills" className="space-y-4">
                    <BillSettlement />
                </TabsContent>

                <TabsContent value="explorer" className="space-y-4">
                    <BlockExplorer />
                </TabsContent>
            </Tabs>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-6 rounded-2xl border bg-card text-card-foreground shadow-sm bg-gradient-to-br from-blue-500/5 to-transparent">
                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 text-blue-500">
                        <ShieldCheck className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold mb-2">Escrow Protected</h3>
                    <p className="text-xs text-muted-foreground">
                        Funds are held in high-security smart contracts and released only upon milestone completion or driver pickup.
                    </p>
                </div>
                <div className="p-6 rounded-2xl border bg-card text-card-foreground shadow-sm bg-gradient-to-br from-purple-500/5 to-transparent">
                    <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 text-purple-500">
                        <Zap className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold mb-2">Instant Settlement</h3>
                    <p className="text-xs text-muted-foreground">
                        Blockchain tech ensures sub-second processing for driver advances and supplier micro-bill batches.
                    </p>
                </div>
                <div className="p-6 rounded-2xl border bg-card text-card-foreground shadow-sm bg-gradient-to-br from-emerald-500/5 to-transparent">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-500">
                        <History className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold mb-2">Immutable Audit</h3>
                    <p className="text-xs text-muted-foreground">
                        Every payment creates a cryptographic proof tied to your GST invoices for seamless compliance.
                    </p>
                </div>
            </div>
        </div>
    );
}
