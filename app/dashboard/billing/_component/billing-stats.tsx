"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Receipt, Clock, AlertCircle } from "lucide-react"

interface BillingStatsData {
    totalRevenue: number;
    pendingAmount: number;
    pendingCount: number;
    gstLiability: number;
    draftCount: number;
}

export function BillingStats() {
    const [stats, setStats] = useState<BillingStatsData | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/billing/stats')
            const data = await res.json()
            setStats(data)
        } catch (error) {
            console.error("Failed to fetch billing stats:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStats()
        const interval = setInterval(fetchStats, 5000)
        return () => clearInterval(interval)
    }, [])

    if (loading && !stats) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map(i => (
                    <Card key={i} className="animate-pulse bg-muted/20 h-24" />
                ))}
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹{stats?.totalRevenue?.toLocaleString() || '0'}</div>
                    <p className="text-xs text-muted-foreground">From paid invoices</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹{stats?.pendingAmount?.toLocaleString() || '0'}</div>
                    <p className="text-xs text-muted-foreground">{stats?.pendingCount || 0} invoices awaiting payment</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">GST Liability</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹{stats?.gstLiability?.toLocaleString() || '0'}</div>
                    <p className="text-xs text-muted-foreground">Est. GSTR-1 for next filing</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Draft Documents</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats?.draftCount || 0}</div>
                    <p className="text-xs text-muted-foreground">Ready for generation</p>
                </CardContent>
            </Card>
        </div>
    )
}
