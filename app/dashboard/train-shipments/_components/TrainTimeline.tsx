"use client";

import * as React from "react";
import {
    IconCircleCheck,
    IconCircleDashed,
    IconTrain,
    IconPackage,
    IconAlertTriangle,
    IconClock,
} from "@tabler/icons-react";

interface TimelineEvent {
    id: string;
    type: string;
    title: string;
    description: string | null;
    stationCode: string | null;
    stationName: string | null;
    occurredAt: Date;
}

interface TrainTimelineProps {
    events: TimelineEvent[];
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
    created: <IconPackage className="size-4" />,
    waiting_for_train: <IconClock className="size-4" />,
    in_transit: <IconTrain className="size-4" />,
    at_station: <IconTrain className="size-4" />,
    delivered: <IconCircleCheck className="size-4" />,
    cancelled: <IconAlertTriangle className="size-4" />,
    delay_update: <IconClock className="size-4" />,
    departed: <IconTrain className="size-4" />,
    arrived_station: <IconTrain className="size-4" />,
};

const EVENT_COLORS: Record<string, string> = {
    created: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    waiting_for_train: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    in_transit: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    at_station: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    delivered: "bg-green-500/10 text-green-500 border-green-500/20",
    cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
    delay_update: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    departed: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    arrived_station: "bg-green-500/10 text-green-500 border-green-500/20",
};

function formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat("en-IN", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(new Date(date));
}

export function TrainTimeline({ events }: TrainTimelineProps) {
    if (events.length === 0) {
        return (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
                <IconCircleDashed className="size-5 mr-2" />
                No events yet
            </div>
        );
    }

    return (
        <div className="relative">
            {events.map((event, index) => (
                <div key={event.id} className="relative flex gap-4 pb-6">
                    {/* Timeline line */}
                    {index < events.length - 1 && (
                        <div className="absolute left-4 top-8 bottom-0 w-px bg-border" />
                    )}

                    {/* Icon */}
                    <div
                        className={`flex size-8 flex-shrink-0 items-center justify-center rounded-full border ${EVENT_COLORS[event.type] || "bg-muted text-muted-foreground border-muted"
                            }`}
                    >
                        {EVENT_ICONS[event.type] || <IconCircleDashed className="size-4" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <p className="font-medium">{event.title}</p>
                                {event.description && (
                                    <p className="text-sm text-muted-foreground mt-0.5">
                                        {event.description}
                                    </p>
                                )}
                                {event.stationName && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        📍 {event.stationName} ({event.stationCode})
                                    </p>
                                )}
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDateTime(event.occurredAt)}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
