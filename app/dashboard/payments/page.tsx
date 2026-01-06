"use client";

import * as React from "react";
import { PaymentPortal } from '@/app/dashboard/payments/_components/PaymentPortal';
import { BlockExplorer } from '@/app/dashboard/payments/_components/BlockExplorer';
import { SalaryManagement } from '@/app/dashboard/payments/_components/SalaryManagement';
import { BillSettlement } from '@/app/dashboard/payments/_components/BillSettlement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldCheck, Zap, History, Users, CreditCard } from 'lucide-react';

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import { useSearchParams } from 'next/navigation';

export default function PaymentsPage() {
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = React.useState(searchParams.get('tab') || "portal");
    const [walletAddress, setWalletAddress] = React.useState<string>("");
    const [encryptedPrivateKey, setEncryptedPrivateKey] = React.useState<string>("");

    React.useEffect(() => {
        const loadWallet = async () => {
            try {
                const res = await fetch('/api/auth/wallet');
                const data = await res.json();
                if (data.address && data.encryptedKey) {
                    setWalletAddress(data.address);
                    setEncryptedPrivateKey(data.encryptedKey);
                }
            } catch (error) {
                console.error("Failed to load wallet on page init:", error);
            }
        };
        loadWallet();
    }, []);

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader title="Payments" />
                <div className="flex flex-1 flex-col overflow-hidden">
                    <ScrollArea className="flex-1">
                        <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
                            {/* Header */}
                            <div className="space-y-1">
                                <h2 className="text-2xl md:text-3xl font-bold tracking-tight bg-linear-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent">
                                    Payment Platform
                                </h2>
                                <p className="text-muted-foreground text-sm md:text-base">
                                    Secure blockchain-powered transactions for buyers and drivers.
                                </p>
                            </div>

                            {/* Tabs */}
                            <Tabs
                                value={activeTab}
                                onValueChange={setActiveTab}
                                className="space-y-6"
                            >
                                <TabsList className="bg-muted/50 p-1 h-auto flex-wrap gap-1">
                                    <TabsTrigger
                                        value="portal"
                                        className={cn(
                                            "flex items-center gap-2 transition-all duration-200",
                                            "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                                            "data-[state=active]:shadow-sm"
                                        )}
                                    >
                                        <ShieldCheck className="h-4 w-4" />
                                        <span className="hidden sm:inline">Wallet & Security</span>
                                        <span className="sm:hidden">Wallet</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="salary"
                                        className={cn(
                                            "flex items-center gap-2 transition-all duration-200",
                                            "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                                            "data-[state=active]:shadow-sm"
                                        )}
                                    >
                                        <Users className="h-4 w-4" />
                                        <span className="hidden sm:inline">Salary Management</span>
                                        <span className="sm:hidden">Salary</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="bills"
                                        className={cn(
                                            "flex items-center gap-2 transition-all duration-200",
                                            "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                                            "data-[state=active]:shadow-sm"
                                        )}
                                    >
                                        <CreditCard className="h-4 w-4" />
                                        <span className="hidden sm:inline">Bill Settlement</span>
                                        <span className="sm:hidden">Bills</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="explorer"
                                        className={cn(
                                            "flex items-center gap-2 transition-all duration-200",
                                            "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                                            "data-[state=active]:shadow-sm"
                                        )}
                                    >
                                        <Zap className="h-4 w-4" />
                                        <span className="hidden sm:inline">Live Explorer</span>
                                        <span className="sm:hidden">Explorer</span>
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent
                                    value="portal"
                                    className="space-y-4 animate-in fade-in-0 slide-in-from-right-2 duration-300"
                                >
                                    <PaymentPortal
                                        address={walletAddress}
                                        onConnect={(addr, encKey) => {
                                            setWalletAddress(addr);
                                            setEncryptedPrivateKey(encKey);
                                        }}
                                        onDisconnect={async () => {
                                            try {
                                                await fetch('/api/auth/wallet', { method: 'DELETE' });
                                            } catch (e) {
                                                console.error('Failed to disconnect wallet:', e);
                                            }
                                            setWalletAddress("");
                                            setEncryptedPrivateKey("");
                                        }}
                                    />
                                </TabsContent>

                                <TabsContent
                                    value="salary"
                                    className="space-y-4 animate-in fade-in-0 slide-in-from-right-2 duration-300"
                                >
                                    <SalaryManagement walletAddress={walletAddress} />
                                </TabsContent>

                                <TabsContent
                                    value="bills"
                                    className="space-y-4 animate-in fade-in-0 slide-in-from-right-2 duration-300"
                                >
                                    <BillSettlement encryptedPrivateKey={encryptedPrivateKey} />
                                </TabsContent>

                                <TabsContent
                                    value="explorer"
                                    className="space-y-4 animate-in fade-in-0 slide-in-from-right-2 duration-300"
                                >
                                    <BlockExplorer walletAddress={walletAddress} />
                                </TabsContent>
                            </Tabs>
                            {/* ... existing feature cards ... */}

                            {/* Feature Cards */}
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <div className="group p-6 rounded-2xl border bg-card text-card-foreground shadow-sm bg-linear-to-br from-primary/5 to-transparent hover:shadow-md hover:scale-[1.02] transition-all duration-300 cursor-default">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform duration-300">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-semibold mb-2">Escrow Protected</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Funds are held in high-security smart contracts and released only upon milestone completion or driver pickup.
                                    </p>
                                </div>
                                <div className="group p-6 rounded-2xl border bg-card text-card-foreground shadow-sm bg-linear-to-br from-orange-500/5 to-transparent hover:shadow-md hover:scale-[1.02] transition-all duration-300 cursor-default">
                                    <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center mb-4 text-orange-500 group-hover:scale-110 transition-transform duration-300">
                                        <Zap className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-semibold mb-2">Instant Settlement</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Blockchain tech ensures sub-second processing for driver advances and supplier micro-bill batches.
                                    </p>
                                </div>
                                <div className="group p-6 rounded-2xl border bg-card text-card-foreground shadow-sm bg-linear-to-br from-amber-500/5 to-transparent hover:shadow-md hover:scale-[1.02] transition-all duration-300 cursor-default md:col-span-2 lg:col-span-1">
                                    <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 text-amber-500 group-hover:scale-110 transition-transform duration-300">
                                        <History className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-semibold mb-2">Immutable Audit</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Every payment creates a cryptographic proof tied to your GST invoices for seamless compliance.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
