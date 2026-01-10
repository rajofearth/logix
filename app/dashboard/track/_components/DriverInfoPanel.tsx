"use client";

import * as React from "react";
import { Phone, MessageSquare, FileText, Truck, Package, ScanLine } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PackageVerificationList } from "./PackageVerificationCard";
import type { Delivery } from "../_data/deliveries";

interface PackageVerification {
    id: string;
    phase: "pickup" | "delivery";
    capturedImageUrl: string;
    damagePercentage: number;
    anomalyDetected: boolean;
    threshold: number;
    heatmapImageUrl: string | null;
    passed: boolean;
    createdAt: string;
}

interface DriverInfoPanelProps {
    delivery: Delivery;
    topRightDock?: React.ReactNode;
    threatDetectionPanel?: React.ReactNode;
}

export function DriverInfoPanel({ delivery, topRightDock, threatDetectionPanel }: DriverInfoPanelProps) {
    const [verifications, setVerifications] = React.useState<PackageVerification[]>([]);
    const [loadingVerifications, setLoadingVerifications] = React.useState(false);

    // Fetch package verifications when delivery changes
    React.useEffect(() => {
        async function fetchVerifications() {
            if (!delivery.id) return;

            setLoadingVerifications(true);
            try {
                const response = await fetch(`/api/jobs/${delivery.id}/verifications`);
                if (response.ok) {
                    const data = await response.json();
                    setVerifications(data.verifications || []);
                }
            } catch (error) {
                console.error("Failed to fetch verifications:", error);
            } finally {
                setLoadingVerifications(false);
            }
        }

        fetchVerifications();
    }, [delivery.id]);

    return (
        <div className="absolute bottom-3 left-3 right-3 z-10">
            {topRightDock ? (
                <div className="absolute bottom-full left-0 mb-3 pointer-events-auto">
                    {topRightDock}
                </div>
            ) : null}
            {threatDetectionPanel ? (
                <div className="absolute bottom-full right-0 mb-3 pointer-events-auto max-w-[400px]">
                    {threatDetectionPanel}
                </div>
            ) : null}
            <div className="bg-background/70 backdrop-blur-xl backdrop-saturate-150 border border-white/10 rounded-lg shadow-xl overflow-hidden">
                <Tabs defaultValue="driver" className="w-full">
                    <TabsList className="w-full justify-start rounded-none border-b border-border/50 bg-transparent h-auto p-0">
                        <TabsTrigger
                            value="order"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-xs font-medium"
                        >
                            Order details
                        </TabsTrigger>
                        <TabsTrigger
                            value="driver"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-xs font-medium"
                        >
                            Driver information
                        </TabsTrigger>
                        <TabsTrigger
                            value="package"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-xs font-medium"
                        >
                            <ScanLine className="size-3 mr-1.5" />
                            Package Scan
                        </TabsTrigger>
                        <TabsTrigger
                            value="vehicle"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-xs font-medium"
                        >
                            Vehicle
                        </TabsTrigger>
                        <TabsTrigger
                            value="customer"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-xs font-medium"
                        >
                            Customer information
                        </TabsTrigger>
                        <TabsTrigger
                            value="documents"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-xs font-medium"
                        >
                            Documents
                        </TabsTrigger>
                    </TabsList>

                    {/* Order Details Tab */}
                    <TabsContent value="order" className="p-4 mt-0">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Order ID</p>
                                <p className="text-sm font-semibold">{delivery.id}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Type</p>
                                <p className="text-sm font-semibold">{delivery.type}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Pickup</p>
                                <p className="text-sm font-semibold truncate">{delivery.origin.address}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Drop-off</p>
                                <p className="text-sm font-semibold truncate">{delivery.destination.address}</p>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Driver Information Tab */}
                    <TabsContent value="driver" className="p-4 mt-0">
                        <div className="flex items-start gap-4">
                            {/* Driver Avatar & Name */}
                            <div className="flex items-center gap-3">
                                <Avatar className="size-12 ring-2 ring-border shadow-md">
                                    <AvatarImage src={delivery.driver.avatar} alt={delivery.driver.name} />
                                    <AvatarFallback>{delivery.driver.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-semibold">{delivery.driver.name}</p>
                                    <p className="text-xs text-muted-foreground">{delivery.driver.role}</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 ml-auto">
                                <Button size="sm" className="gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white">
                                    <Phone className="size-3.5" />
                                    Call
                                </Button>
                                <Button size="sm" variant="outline" className="gap-1.5 border-primary text-primary hover:bg-primary/10">
                                    <MessageSquare className="size-3.5" />
                                    Chat
                                </Button>
                            </div>
                        </div>

                        {/* Driver Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 pt-4 border-t border-border/50">
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Experience</p>
                                <p className="text-sm font-semibold">{delivery.driver.experience}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Driver&apos;s license</p>
                                <p className="text-sm font-semibold">{delivery.driver.license}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">ID number</p>
                                <p className="text-sm font-semibold">{delivery.driver.idNumber}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">License class</p>
                                <p className="text-sm font-semibold">{delivery.driver.licenseClass}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Insurance number</p>
                                <p className="text-sm font-semibold">{delivery.driver.insuranceNumber}</p>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Package Verification Tab */}
                    <TabsContent value="package" className="p-4 mt-0">
                        {loadingVerifications ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                            </div>
                        ) : (
                            <PackageVerificationList verifications={verifications} />
                        )}
                    </TabsContent>

                    {/* Vehicle Tab */}
                    <TabsContent value="vehicle" className="p-4 mt-0">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center size-12 rounded-full bg-muted">
                                <Truck className="size-6 text-muted-foreground" />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Vehicle Type</p>
                                    <p className="text-sm font-semibold">Semi Truck</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Plate Number</p>
                                    <p className="text-sm font-semibold">MH-12-AB-1234</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Capacity</p>
                                    <p className="text-sm font-semibold">20 Tons</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Status</p>
                                    <p className="text-sm font-semibold text-emerald-500">Active</p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Customer Information Tab */}
                    <TabsContent value="customer" className="p-4 mt-0">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center size-12 rounded-full bg-muted">
                                <Package className="size-6 text-muted-foreground" />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Customer Name</p>
                                    <p className="text-sm font-semibold">Acme Corporation</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Contact</p>
                                    <p className="text-sm font-semibold">+1 555-0123</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Email</p>
                                    <p className="text-sm font-semibold">contact@acme.com</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Priority</p>
                                    <p className="text-sm font-semibold text-amber-500">High</p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Documents Tab */}
                    <TabsContent value="documents" className="p-4 mt-0">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center size-12 rounded-full bg-muted">
                                <FileText className="size-6 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">No documents uploaded for this delivery.</p>
                            </div>
                            <Button size="sm" variant="outline" className="gap-1.5">
                                <FileText className="size-3.5" />
                                Upload Document
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

