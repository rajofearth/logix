"use client";

import * as React from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { TrainShipmentForm } from "../_components/TrainShipmentForm";

export default function NewTrainShipmentPage() {
    return (
        <DashboardShell title="Logix Dashboard - Create Train Shipment">
            <div className="max-w-3xl">
                <div className="win7-groupbox">
                    <legend>New Shipment Details</legend>
                    <div className="win7-p-4">
                        <div className="mb-4">
                            <h1 className="text-xl font-bold font-sans">Create Train Shipment</h1>
                            <p className="text-xs text-gray-500">
                                Book cargo transport on Indian Railways with real-time tracking
                            </p>
                        </div>
                        <TrainShipmentForm />
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
