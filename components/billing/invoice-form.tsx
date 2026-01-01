"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash, Calculator, Save } from "lucide-react"

export function InvoiceForm({ initialData, onSubmit }: { initialData?: any, onSubmit: (data: any) => void }) {
    const [formData, setFormData] = useState(initialData || {
        type: "TAX_INVOICE",
        buyerName: "",
        buyerGstin: "",
        buyerAddress: "",
        placeOfSupply: "",
        lineItems: [{ description: "", hsnCode: "9965", quantity: 1, rate: 0, discount: 0 }]
    })

    const addLineItem = () => {
        setFormData({
            ...formData,
            lineItems: [...formData.lineItems, { description: "", hsnCode: "9965", quantity: 1, rate: 0, discount: 0 }]
        })
    }

    const removeLineItem = (index: number) => {
        const newItems = formData.lineItems.filter((_: any, i: number) => i !== index)
        setFormData({ ...formData, lineItems: newItems })
    }

    const updateLineItem = (index: number, field: string, value: any) => {
        const newItems = [...formData.lineItems]
        newItems[index] = { ...newItems[index], [field]: value }
        setFormData({ ...formData, lineItems: newItems })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Select the type of document and buyer details.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Document Type</Label>
                        <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="TAX_INVOICE">Tax Invoice</SelectItem>
                                <SelectItem value="BILL_OF_SUPPLY">Bill of Supply</SelectItem>
                                <SelectItem value="DELIVERY_CHALLAN">Delivery Challan</SelectItem>
                                <SelectItem value="EXPORT_INVOICE">Export Invoice</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Place of Supply (State)</Label>
                        <Input
                            placeholder="e.g. Maharashtra"
                            value={formData.placeOfSupply}
                            onChange={(e) => setFormData({ ...formData, placeOfSupply: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Buyer Name</Label>
                        <Input
                            placeholder="Recipient Company Name"
                            value={formData.buyerName}
                            onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Buyer GSTIN</Label>
                        <Input
                            placeholder="15-digit GSTIN"
                            value={formData.buyerGstin}
                            onChange={(e) => setFormData({ ...formData, buyerGstin: e.target.value })}
                        />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <Label>Buyer Address</Label>
                        <Input
                            placeholder="Full Billing Address"
                            value={formData.buyerAddress}
                            onChange={(e) => setFormData({ ...formData, buyerAddress: e.target.value })}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Line Items</CardTitle>
                        <CardDescription>Add services or goods being invoiced.</CardDescription>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                        <Plus className="h-4 w-4 mr-2" /> Add Row
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {formData.lineItems.map((item: any, index: number) => (
                            <div key={index} className="grid grid-cols-12 gap-2 items-end border-b pb-4 last:border-0 last:pb-0">
                                <div className="col-span-4 space-y-2">
                                    <Label className="text-xs">Description</Label>
                                    <Input value={item.description} onChange={(e) => updateLineItem(index, 'description', e.target.value)} />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label className="text-xs">HSN/SAC</Label>
                                    <Input value={item.hsnCode} onChange={(e) => updateLineItem(index, 'hsnCode', e.target.value)} />
                                </div>
                                <div className="col-span-1 space-y-2">
                                    <Label className="text-xs">Qty</Label>
                                    <Input type="number" value={item.quantity} onChange={(e) => updateLineItem(index, 'quantity', Number(e.target.value))} />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label className="text-xs">Rate</Label>
                                    <Input type="number" value={item.rate} onChange={(e) => updateLineItem(index, 'rate', Number(e.target.value))} />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label className="text-xs">Discount</Label>
                                    <Input type="number" value={item.discount} onChange={(e) => updateLineItem(index, 'discount', Number(e.target.value))} />
                                </div>
                                <div className="col-span-1">
                                    <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeLineItem(index)}>
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
                <Button type="button" variant="outline">Preview</Button>
                <Button type="submit">
                    <Save className="h-4 w-4 mr-2" /> Create Invoice
                </Button>
            </div>
        </form>
    )
}
