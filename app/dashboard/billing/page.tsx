import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { SiteHeader } from '@/components/dashboard/site-header'
import {
    SidebarInset,
    SidebarProvider,
} from '@/components/ui/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Download, Filter, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InvoiceList } from "@/app/dashboard/billing/_component/invoice-list"
import { BillingStats } from "@/app/dashboard/billing/_component/billing-stats"
import Link from 'next/link'

export default function BillingPage() {
    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader title="Invoices & Billing" />
                <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8 space-y-6">
                    {/* Header Actions */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Billing Overview</h2>
                            <p className="text-muted-foreground">Manage your GST invoices, delivery challans, and financial reports.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                                <Download className="mr-2 h-4 w-4" />
                                Export GSTR-1
                            </Button>
                            <Button size="sm" asChild>
                                <Link href="/dashboard/billing/new">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Invoice
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <BillingStats />

                    {/* Main Content */}
                    <Tabs defaultValue="all" className="w-full">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                            <TabsList>
                                <TabsTrigger value="all">All Invoices</TabsTrigger>
                                <TabsTrigger value="salary">Salary Slips</TabsTrigger>
                                <TabsTrigger value="pending">Pending</TabsTrigger>
                                <TabsTrigger value="paid">Paid</TabsTrigger>
                                <TabsTrigger value="draft">Drafts</TabsTrigger>
                            </TabsList>
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search invoices..."
                                        className="pl-8 h-9"
                                    />
                                </div>
                                <Button variant="ghost" size="sm" className="h-9">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Filter
                                </Button>
                            </div>
                        </div>

                        <TabsContent value="all" className="mt-0 space-y-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Recent Transactions</CardTitle>
                                    <CardDescription>View and manage all your logistics billing documents.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <InvoiceList />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="salary" className="mt-0 space-y-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Salary Statements</CardTitle>
                                    <CardDescription>Monthly salary slips generated from blockchain payments.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <InvoiceList type="SALARY_SLIP" />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="pending" className="mt-0">
                            <Card>
                                <CardContent className="p-0">
                                    <InvoiceList status="PENDING" />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="paid" className="mt-0">
                            <Card>
                                <CardContent className="p-0">
                                    <InvoiceList status="PAID" />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="draft" className="mt-0">
                            <Card>
                                <CardContent className="p-0">
                                    <InvoiceList status="DRAFT" />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
