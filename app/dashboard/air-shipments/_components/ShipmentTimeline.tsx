"use client";

import { IconCircleCheck, IconPackage, IconPlane, IconAlertTriangle } from "@tabler/icons-react";
import type { ShipmentEventData } from "../_hooks/useShipmentStream";

interface ShipmentTimelineProps {
    events: Array<{
        id: string;
        type: string;
        title: string;
        description: string | null;
        locationName: string | null;
        occurredAt: Date | string;
    }>;
    liveEvents?: ShipmentEventData[];
}

const EVENT_ICONS: Record<string, typeof IconPackage> = {
    created: IconPackage,
    carrier_update: IconPlane,
    pickup_started: IconPackage,
    pickup_completed: IconCircleCheck,
    air_departed: IconPlane,
    air_arrived: IconPlane,
    customs_clearance: IconCircleCheck,
    out_for_delivery: IconPackage,
    delivered: IconCircleCheck,
    exception: IconAlertTriangle,
};

const EVENT_COLORS: Record<string, string> = {
    created: "bg-blue-500",
    carrier_update: "bg-yellow-500",
    pickup_started: "bg-blue-500",
    pickup_completed: "bg-green-500",
    air_departed: "bg-purple-500",
    air_arrived: "bg-purple-500",
    customs_clearance: "bg-blue-500",
    out_for_delivery: "bg-yellow-500",
    delivered: "bg-green-500",
    exception: "bg-red-500",
};

function formatDateTime(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(d);
}

export function ShipmentTimeline({ events, liveEvents = [] }: ShipmentTimelineProps) {
    // Merge and dedupe events
    const allEvents = [
        ...liveEvents.map((e) => ({
            ...e,
            occurredAt: e.occurredAt,
        })),
        ...events,
    ];

    // Deduplicate by ID
    const uniqueEvents = allEvents.filter(
        (event, index, self) => index === self.findIndex((e) => e.id === event.id)
    );

    // Sort by occurredAt descending (newest first)
    const sortedEvents = uniqueEvents.sort(
        (a, b) =>
            new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    );

    if (sortedEvents.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-8">
                No events yet
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

            <div className="space-y-4">
                {sortedEvents.map((event, index) => {
                    const Icon = EVENT_ICONS[event.type] || IconPackage;
                    const color = EVENT_COLORS[event.type] || "bg-gray-500";

                    return (
                        <div key={event.id} className="relative pl-10">
                            {/* Icon */}
                            <div
                                className={`absolute left-0 flex size-8 items-center justify-center rounded-full ${color}`}
                            >
                                <Icon className="size-4 text-white" />
                            </div>

                            {/* Content */}
                            <div className="rounded-lg border bg-card p-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="font-medium text-sm">{event.title}</p>
                                        {event.description && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {event.description}
                                            </p>
                                        )}
                                        {event.locationName && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                📍 {event.locationName}
                                            </p>
                                        )}
                                    </div>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                        {formatDateTime(event.occurredAt)}
                                    </span>
                                </div>
                                {index === 0 && (
                                    <div className="mt-2">
                                        <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-500">
                                            Latest
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
