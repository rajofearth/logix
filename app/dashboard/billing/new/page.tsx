"use client"

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { SiteHeader } from '@/components/dashboard/site-header'
import { InvoiceForm } from '@/components/billing/invoice-form'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function NewInvoicePage() {
    const router = useRouter()

    const handleSubmit = async (data: any) => {
        try {
            const res = await fetch('/api/billing/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            if (!res.ok) throw new Error('Failed to create invoice')

            const invoice = await res.json()
            toast.success('Invoice created successfully')
            router.push(`/dashboard/billing/${invoice.id}`)
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader title="Create New Invoice" />
                <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8 max-w-5xl mx-auto w-full">
                    <InvoiceForm onSubmit={handleSubmit} />
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
