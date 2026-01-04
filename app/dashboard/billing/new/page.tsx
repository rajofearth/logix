"use client"

import { DashboardPage } from "@/components/dashboard/crm/DashboardPage"
import { InvoiceForm } from '@/app/dashboard/billing/_component/invoice-form'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface InvoiceFormData {
    type: string;
    buyerName: string;
    buyerGstin: string;
    buyerAddress: string;
    placeOfSupply: string;
    lineItems: Array<{
        description: string;
        hsnCode: string;
        quantity: number;
        rate: number;
        discount: number;
    }>;
}

export default function NewInvoicePage() {
    const router = useRouter()

    const handleSubmit = async (data: InvoiceFormData) => {
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
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error'
            toast.error(message)
        }
    }

    return (
        <DashboardPage title="Create New Invoice" className="p-0">
            <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8 max-w-5xl mx-auto w-full">
                <InvoiceForm onSubmit={handleSubmit} />
            </div>
        </DashboardPage>
    )
}
