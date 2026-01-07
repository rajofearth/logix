"use client";

import * as React from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ShipmentForm } from "../_components/ShipmentForm";

export default function NewShipmentPage() {
    return (
        <DashboardShell title="Logix Dashboard - Create Air Shipment">
            <div className="max-w-3xl">
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
        </DashboardShell>
    );
}
