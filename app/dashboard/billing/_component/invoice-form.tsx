"use client"

import { useState } from "react"
import { Plus, Trash, Save, ArrowLeft, Eye } from "lucide-react"
import Link from "next/link"
import { InvoicePreview } from "./invoice-preview"

interface LineItem {
    description: string;
    hsnCode: string;
    quantity: number;
    rate: number;
    discount: number;
}

interface FormData {
    type: string;
    buyerName: string;
    buyerGstin: string;
    buyerAddress: string;
    placeOfSupply: string;
    lineItems: LineItem[];
}

export function InvoiceForm({ initialData, onSubmit }: { initialData?: FormData, onSubmit: (data: FormData) => void }) {
    const [formData, setFormData] = useState<FormData>(initialData || {
        type: "TAX_INVOICE",
        buyerName: "",
        buyerGstin: "",
        buyerAddress: "",
        placeOfSupply: "",
        lineItems: [{ description: "", hsnCode: "9965", quantity: 1, rate: 0, discount: 0 }]
    })

    const [showPreview, setShowPreview] = useState(false)

    const addLineItem = () => {
        setFormData({
            ...formData,
            lineItems: [...formData.lineItems, { description: "", hsnCode: "9965", quantity: 1, rate: 0, discount: 0 }]
        })
    }

    const removeLineItem = (index: number) => {
        const newItems = formData.lineItems.filter((_, i: number) => i !== index)
        setFormData({ ...formData, lineItems: newItems })
    }

    const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
        const newItems = [...formData.lineItems]
        newItems[index] = { ...newItems[index], [field]: value }
        setFormData({ ...formData, lineItems: newItems })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
    }

    const handlePreview = () => {
        setShowPreview(true)
    }

    const closePreview = () => {
        setShowPreview(false)
    }

    // Transform form data to invoice preview format
    const previewInvoice = {
        type: formData.type,
        supplierGstin: "27AABCU9603R1ZN", // Default GSTIN for preview
        supplierName: "LOGIQ Logistics",
        supplierAddress: "123 Business Street, Mumbai, Maharashtra - 400001",
        buyerName: formData.buyerName,
        buyerGstin: formData.buyerGstin,
        buyerAddress: formData.buyerAddress,
        invoiceNumber: "PREVIEW-001",
        invoiceDate: new Date().toISOString(),
        placeOfSupply: formData.placeOfSupply,
        subtotal: formData.lineItems.reduce((sum, item) => sum + (item.rate * item.quantity - item.discount), 0),
        totalTax: formData.lineItems.reduce((sum, item) => sum + ((item.rate * item.quantity - item.discount) * 0.18), 0),
        grandTotal: formData.lineItems.reduce((sum, item) => sum + ((item.rate * item.quantity - item.discount) * 1.18), 0),
        lineItems: formData.lineItems.map(item => ({
            description: item.description,
            hsnCode: item.hsnCode,
            quantity: item.quantity,
            rate: item.rate,
            taxableValue: (item.rate * item.quantity) - item.discount
        }))
    }

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <div className="mb-4">
                <Link href="/dashboard/billing">
                    <button className="win7-btn" style={{ display: 'flex', alignItems: 'center' }}>
                        <ArrowLeft className="mr-2" style={{ width: '14px', height: '14px' }} /> Back to Invoices
                    </button>
                </Link>
            </div>

            {/* Preview Modal */}
            {showPreview && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-50"
                    style={{
                        zIndex: 1000,
                        backdropFilter: 'blur(6px)',
                        WebkitBackdropFilter: 'blur(6px)',
                        backgroundColor: 'rgba(0, 0, 0, 0.25)',
                    }}
                >
                    <div className="bg-white border-2 border-gray-400 shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
                        <div className="flex items-center justify-between p-2 bg-gray-100 border-b border-gray-400">
                            <h3 className="font-bold text-sm" style={{ font: 'var(--w7-font)' }}>Invoice Preview</h3>
                            <button
                                onClick={closePreview}
                                className="win7-btn"
                                style={{ minWidth: '24px', minHeight: '20px', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-4">
                            <InvoicePreview invoice={previewInvoice} />
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <fieldset className="win7-groupbox">
                    <legend>Basic Information</legend>
                    <div className="space-y-4">
                        <p style={{ font: 'var(--w7-font)', fontSize: '10px', color: '#666', marginBottom: '12px' }}>Select the type of document and buyer details.</p>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label style={{ font: 'var(--w7-font)', fontSize: '11px', color: '#000', display: 'block', marginBottom: '4px' }}>Document Type</label>
                                <select
                                    className="win7-input"
                                    value={formData.type || "TAX_INVOICE"}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    style={{ width: '100%' }}
                                >
                                    <option value="TAX_INVOICE">Tax Invoice</option>
                                    <option value="BILL_OF_SUPPLY">Bill of Supply</option>
                                    <option value="DELIVERY_CHALLAN">Delivery Challan</option>
                                    <option value="EXPORT_INVOICE">Export Invoice</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label style={{ font: 'var(--w7-font)', fontSize: '11px', color: '#000', display: 'block', marginBottom: '4px' }}>Place of Supply (State)</label>
                                <input
                                    className="win7-input"
                                    placeholder="e.g. Maharashtra"
                                    value={formData.placeOfSupply}
                                    onChange={(e) => setFormData({ ...formData, placeOfSupply: e.target.value })}
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div className="space-y-2">
                                <label style={{ font: 'var(--w7-font)', fontSize: '11px', color: '#000', display: 'block', marginBottom: '4px' }}>Buyer Name</label>
                                <input
                                    className="win7-input"
                                    placeholder="Recipient Company Name"
                                    value={formData.buyerName}
                                    onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div className="space-y-2">
                                <label style={{ font: 'var(--w7-font)', fontSize: '11px', color: '#000', display: 'block', marginBottom: '4px' }}>Buyer GSTIN</label>
                                <input
                                    className="win7-input"
                                    placeholder="15-digit GSTIN"
                                    value={formData.buyerGstin}
                                    onChange={(e) => setFormData({ ...formData, buyerGstin: e.target.value })}
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label style={{ font: 'var(--w7-font)', fontSize: '11px', color: '#000', display: 'block', marginBottom: '4px' }}>Buyer Address</label>
                                <input
                                    className="win7-input"
                                    placeholder="Full Billing Address"
                                    value={formData.buyerAddress}
                                    onChange={(e) => setFormData({ ...formData, buyerAddress: e.target.value })}
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </div>
                    </div>
                </fieldset>

                <fieldset className="win7-groupbox">
                    <legend>Line Items</legend>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p style={{ font: 'var(--w7-font)', fontSize: '10px', color: '#666' }}>Add services or goods being invoiced.</p>
                            <button type="button" className="win7-btn" onClick={addLineItem} style={{ display: 'flex', alignItems: 'center' }}>
                                <Plus className="mr-2" style={{ width: '14px', height: '14px' }} /> Add Row
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.lineItems.map((item, index: number) => (
                                <div key={index} className="grid grid-cols-12 gap-2 items-end border-b pb-4 last:border-0 last:pb-0" style={{ borderColor: '#cfcfcf' }}>
                                    <div className="col-span-4 space-y-2">
                                        <label style={{ font: 'var(--w7-font)', fontSize: '10px', color: '#666', display: 'block' }}>Description</label>
                                        <input
                                            className="win7-input"
                                            value={item.description}
                                            onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <label style={{ font: 'var(--w7-font)', fontSize: '10px', color: '#666', display: 'block' }}>HSN/SAC</label>
                                        <input
                                            className="win7-input"
                                            value={item.hsnCode}
                                            onChange={(e) => updateLineItem(index, 'hsnCode', e.target.value)}
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                    <div className="col-span-1 space-y-2">
                                        <label style={{ font: 'var(--w7-font)', fontSize: '10px', color: '#666', display: 'block' }}>Qty</label>
                                        <input
                                            className="win7-input"
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => updateLineItem(index, 'quantity', Number(e.target.value))}
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <label style={{ font: 'var(--w7-font)', fontSize: '10px', color: '#666', display: 'block' }}>Rate</label>
                                        <input
                                            className="win7-input"
                                            type="number"
                                            value={item.rate}
                                            onChange={(e) => updateLineItem(index, 'rate', Number(e.target.value))}
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <label style={{ font: 'var(--w7-font)', fontSize: '10px', color: '#666', display: 'block' }}>Discount</label>
                                        <input
                                            className="win7-input"
                                            type="number"
                                            value={item.discount}
                                            onChange={(e) => updateLineItem(index, 'discount', Number(e.target.value))}
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                    <div className="col-span-1 flex items-end justify-center">
                                        <button type="button" className="win7-btn win7-btn-ghost" onClick={() => removeLineItem(index)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '24px', minHeight: '20px', padding: '2px' }}>
                                            <Trash style={{ width: '14px', height: '14px' }} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </fieldset>

                <div className="flex justify-end gap-3 mt-6">
                    <button type="button" className="win7-btn" onClick={handlePreview} style={{ display: 'flex', alignItems: 'center' }}>
                        <Eye className="mr-2" style={{ width: '14px', height: '14px' }} /> Preview
                    </button>
                    <button type="submit" className="win7-btn default" style={{ display: 'flex', alignItems: 'center' }}>
                        <Save className="mr-2" style={{ width: '14px', height: '14px' }} /> Create Invoice
                    </button>
                </div>
            </form>
        </div>
    )
}
