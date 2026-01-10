"use client";

import * as React from "react";
import Link from 'next/link';
import { Plus, Download, Filter, Search } from "lucide-react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { InvoiceList } from "@/app/dashboard/billing/_component/invoice-list";
import { BillingStats } from "@/app/dashboard/billing/_component/billing-stats";

type TabValue = "all" | "salary" | "pending" | "paid" | "draft";

export default function BillingPage() {
    const [activeTab, setActiveTab] = React.useState<TabValue>("all");

    return (
        <DashboardShell title="Logix Accounts & Billing">
            <div className="flex flex-col gap-4">
                {/* Header Actions */}
                <div className="win7-groupbox">
                    <legend>Billing Operations</legend>
                    <div className="win7-p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-xl font-bold font-sans">Billing Overview</h2>
                            <p className="text-xs text-gray-500">Manage invoices, salary slips, and financial reports.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="win7-btn flex items-center gap-1">
                                <Download className="size-3.5" /> Export GSTR-1
                            </button>
                            <Link href="/dashboard/billing/new">
                                <button className="win7-btn flex items-center gap-1">
                                    <Plus className="size-3.5" /> Create Invoice
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Overview */}
                <BillingStats />

                {/* Main Content */}
                <div className="flex flex-col gap-2">
                    {/* Toolbar & Filter */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        {/* Custom Win7 Tabs */}
                        <div className="flex border-b border-[#7f9db9] pl-2 gap-1 select-none w-full md:w-auto overflow-x-auto">
                            {[
                                { id: "all", label: "All Invoices" },
                                { id: "salary", label: "Salary Slips" },
                                { id: "pending", label: "Pending" },
                                { id: "paid", label: "Paid" },
                                { id: "draft", label: "Drafts" },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as TabValue)}
                                    className={`px-3 py-1 border-t border-l border-r rounded-t text-xs font-sans mb-[-1px] z-10 ${activeTab === tab.id
                                            ? "bg-white border-[#7f9db9] border-b-white font-bold pb-1.5"
                                            : "bg-[#ece9d8] border-[#aca899] text-gray-600 hover:bg-[#f5f5f5]"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-gray-400 pointer-events-none" />
                                <input
                                    type="search"
                                    placeholder="Search invoices..."
                                    className="pl-7 pr-2 h-7 w-full border border-[#7f9db9] text-xs outline-none focus:border-blue-500"
                                />
                            </div>
                            <button className="win7-btn h-7 flex items-center gap-1 px-3">
                                <Filter className="size-3.5" /> Filter
                            </button>
                        </div>
                    </div>

                    {/* Tab Content Area */}
                    <div className="bg-white border border-[#7f9db9] p-4 min-h-[400px]">
                        {activeTab === "all" && (
                            <div>
                                <h3 className="font-bold text-[#003399] mb-2 border-b border-[#ece9d8] pb-1">Recent Transactions</h3>
                                <InvoiceList />
                            </div>
                        )}
                        {activeTab === "salary" && (
                            <div>
                                <h3 className="font-bold text-[#003399] mb-2 border-b border-[#ece9d8] pb-1">Salary Statements</h3>
                                <InvoiceList type="SALARY_SLIP" />
                            </div>
                        )}
                        {activeTab === "pending" && <InvoiceList status="PENDING" />}
                        {activeTab === "paid" && <InvoiceList status="PAID" />}
                        {activeTab === "draft" && <InvoiceList status="DRAFT" />}
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
