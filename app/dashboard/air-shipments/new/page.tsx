"use client";

import * as React from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ShipmentForm } from "../_components/ShipmentForm";
import { ShipmentFormMap } from "../_components/ShipmentFormMap";
import { ShipmentFormContext } from "../_context/ShipmentFormContext";

export default function NewShipmentPage() {
    const [fromIcao, setFromIcao] = React.useState<string | null>(null);
    const [toIcao, setToIcao] = React.useState<string | null>(null);

    return (
        <ShipmentFormContext.Provider value={{ fromIcao, toIcao, setFromIcao, setToIcao }}>
            <DashboardShell title="Logix Dashboard - Create Air Shipment">
                <div className="flex flex-col h-full bg-[#ece9d8]">
                    <div className="flex-1 flex overflow-hidden">
                        {/* Left Panel: Form */}
                        <div className="w-full lg:w-[500px] flex flex-col overflow-y-auto border-r border-[#898c95] bg-white p-4">
                            <div className="win7-groupbox">
                                <legend>New Shipment Details</legend>
                                <div className="win7-p-4">
                                    <div className="mb-4">
                                        <h1 className="text-xl font-bold font-sans">Create Air Shipment</h1>
                                        <p className="text-xs text-gray-500">
                                            Create a new air cargo shipment with automatic carrier assignment
                                        </p>
                                    </div>
                                    <ShipmentForm />
                                </div>
                            </div>
                        </div>

                        {/* Right Panel: Map Preview */}
                        <div className="flex-1 overflow-hidden relative bg-[#ece9d8] border-l border-[#898c95]">
                            <div className="absolute inset-0">
                                <ShipmentFormMap fromIcao={fromIcao} toIcao={toIcao} />
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardShell>
        </ShipmentFormContext.Provider>
    );
}
