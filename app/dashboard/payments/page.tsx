"use client";

import * as React from "react";
import { PaymentPortal } from '@/app/dashboard/payments/_components/PaymentPortal';
import { BlockExplorer } from '@/app/dashboard/payments/_components/BlockExplorer';
import { SalaryManagement } from '@/app/dashboard/payments/_components/SalaryManagement';
import { BillSettlement } from '@/app/dashboard/payments/_components/BillSettlement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldCheck, Zap, History, Users, CreditCard } from 'lucide-react';
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
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
        <DashboardShell title="Financial Transactions">
            <div className="flex flex-col h-full bg-[#ece9d8] p-4">
                {/* Header */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="size-8 bg-green-600 flex items-center justify-center border-2 border-white shadow-md">
                        <span className="text-white font-bold text-lg">$</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold font-sans">Payment Platform</h2>
                        <p className="text-xs text-gray-500">
                            Secure blockchain-powered transactions
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="flex-1 flex flex-col"
                >
                    <TabsList className="bg-[#ece9d8] p-0 h-auto justify-start border-b border-[#aca899] mb-4 gap-1 w-full rounded-none">
                        <TabsTrigger
                            value="portal"
                            className={cn(
                                "rounded-t-sm border border-[#aca899] border-b-0 px-4 py-1.5 transition-all text-xs",
                                "data-[state=active]:bg-white data-[state=active]:font-bold data-[state=active]:mb-[-1px] data-[state=active]:pb-2 data-[state=active]:z-10",
                                "data-[state=inactive]:bg-[#e0dfd6] data-[state=inactive]:text-gray-600 hover:bg-[#f5f5f5]"
                            )}
                        >
                            <ShieldCheck className="h-3.5 w-3.5 mr-2" />
                            <span className="hidden sm:inline">Wallet & Security</span>
                            <span className="sm:hidden">Wallet</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="salary"
                            className={cn(
                                "rounded-t-sm border border-[#aca899] border-b-0 px-4 py-1.5 transition-all text-xs",
                                "data-[state=active]:bg-white data-[state=active]:font-bold data-[state=active]:mb-[-1px] data-[state=active]:pb-2 data-[state=active]:z-10",
                                "data-[state=inactive]:bg-[#e0dfd6] data-[state=inactive]:text-gray-600 hover:bg-[#f5f5f5]"
                            )}
                        >
                            <Users className="h-3.5 w-3.5 mr-2" />
                            <span className="hidden sm:inline">Salary Management</span>
                            <span className="sm:hidden">Salary</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="bills"
                            className={cn(
                                "rounded-t-sm border border-[#aca899] border-b-0 px-4 py-1.5 transition-all text-xs",
                                "data-[state=active]:bg-white data-[state=active]:font-bold data-[state=active]:mb-[-1px] data-[state=active]:pb-2 data-[state=active]:z-10",
                                "data-[state=inactive]:bg-[#e0dfd6] data-[state=inactive]:text-gray-600 hover:bg-[#f5f5f5]"
                            )}
                        >
                            <CreditCard className="h-3.5 w-3.5 mr-2" />
                            <span className="hidden sm:inline">Bill Settlement</span>
                            <span className="sm:hidden">Bills</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="explorer"
                            className={cn(
                                "rounded-t-sm border border-[#aca899] border-b-0 px-4 py-1.5 transition-all text-xs",
                                "data-[state=active]:bg-white data-[state=active]:font-bold data-[state=active]:mb-[-1px] data-[state=active]:pb-2 data-[state=active]:z-10",
                                "data-[state=inactive]:bg-[#e0dfd6] data-[state=inactive]:text-gray-600 hover:bg-[#f5f5f5]"
                            )}
                        >
                            <Zap className="h-3.5 w-3.5 mr-2" />
                            <span className="hidden sm:inline">Live Explorer</span>
                            <span className="sm:hidden">Explorer</span>
                        </TabsTrigger>
                    </TabsList>

                    <ScrollArea className="flex-1 bg-white border border-[#898c95] p-4 shadow-inner">
                        <TabsContent value="portal" className="mt-0">
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

                        <TabsContent value="salary" className="mt-0">
                            <SalaryManagement walletAddress={walletAddress} />
                        </TabsContent>

                        <TabsContent value="bills" className="mt-0">
                            <BillSettlement encryptedPrivateKey={encryptedPrivateKey} />
                        </TabsContent>

                        <TabsContent value="explorer" className="mt-0">
                            <BlockExplorer walletAddress={walletAddress} />
                        </TabsContent>

                        {/* Feature Cards as Win7 Info Panels */}
                        <div className="mt-8 grid gap-4 md:grid-cols-3">
                            <div className="win7-groupbox">
                                <legend>Security</legend>
                                <div className="win7-p-4 flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4 text-blue-600" />
                                        <h3 className="font-bold text-xs">Escrow Protected</h3>
                                    </div>
                                    <p className="text-xs text-gray-600">
                                        Funds are held in high-security smart contracts and released only upon completion.
                                    </p>
                                </div>
                            </div>

                            <div className="win7-groupbox">
                                <legend>Speed</legend>
                                <div className="win7-p-4 flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <Zap className="h-4 w-4 text-orange-600" />
                                        <h3 className="font-bold text-xs">Instant Settlement</h3>
                                    </div>
                                    <p className="text-xs text-gray-600">
                                        Blockchain tech ensures sub-second processing for advances and bills.
                                    </p>
                                </div>
                            </div>

                            <div className="win7-groupbox">
                                <legend>Compliance</legend>
                                <div className="win7-p-4 flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <History className="h-4 w-4 text-amber-600" />
                                        <h3 className="font-bold text-xs">Immutable Audit</h3>
                                    </div>
                                    <p className="text-xs text-gray-600">
                                        Every payment creates a cryptographic proof tied to your GST invoices.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </Tabs>
            </div>
        </DashboardShell>
    );
}
