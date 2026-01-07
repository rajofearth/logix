"use client";

import * as React from "react";
import { format } from "date-fns";
import { IconPlaneDeparture, IconPlaneArrival, IconClock, IconSearch, IconPlane } from "@tabler/icons-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { getFlightsForRoute, type FlightOption } from "../_server/actions";

interface FlightSelectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    fromIcao: string;
    toIcao: string;
    onSelectFlight: (flight: FlightOption) => void;
    isUpdating?: boolean;
}

export function FlightSelectionDialog({
    open,
    onOpenChange,
    fromIcao,
    toIcao,
    onSelectFlight,
    isUpdating = false,
}: FlightSelectionDialogProps) {
    const [flights, setFlights] = React.useState<FlightOption[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [selectedFlightIndex, setSelectedFlightIndex] = React.useState<number | null>(null);

    React.useEffect(() => {
        if (open && fromIcao && toIcao) {
            loadFlights();
        }
    }, [open, fromIcao, toIcao]);

    const loadFlights = async () => {
        setIsLoading(true);
        try {
            // Simulate network delay for better UX feeling
            await new Promise(r => setTimeout(r, 600));
            const options = await getFlightsForRoute(fromIcao, toIcao);
            setFlights(options);
            setSelectedFlightIndex(null);
        } catch (error) {
            console.error("Failed to load flights", error);
        } finally {
            setIsLoading(false);
        }
    };

    const selectedFlight = selectedFlightIndex !== null ? flights[selectedFlightIndex] : null;

    const handleConfirm = () => {
        if (selectedFlight) {
            onSelectFlight(selectedFlight);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b bg-muted/20">
                    <DialogTitle>Select Outbound Flight</DialogTitle>
                    <DialogDescription>
                        Choose a flight for route {fromIcao} to {toIcao}.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden relative">
                    {isLoading ? (
                        <div className="p-6 space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
                                    <Skeleton className="size-10 rounded-full" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-4 w-1/3" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <ScrollArea className="h-[400px]">
                            <div className="p-4 space-y-3">
                                {flights.map((flight, index) => {
                                    const isSelected = selectedFlightIndex === index;
                                    const firstLeg = flight.legs[0];
                                    const lastLeg = flight.legs[flight.legs.length - 1];
                                    const isConnecting = flight.legs.length > 1;

                                    const durationHrs = Math.floor(flight.totalDuration / 60);
                                    const durationMins = flight.totalDuration % 60;

                                    return (
                                        <div
                                            key={index}
                                            onClick={() => setSelectedFlightIndex(index)}
                                            className={`
                          cursor-pointer rounded-xl border p-4 transition-all
                          hover:bg-muted/50
                          ${isSelected
                                                    ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary"
                                                    : "bg-card"
                                                }
                        `}
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`
                               flex size-10 items-center justify-center rounded-full
                               ${isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}
                             `}>
                                                        <IconPlane className="size-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold leading-none">{firstLeg.carrier}</h4>
                                                        <p className="text-sm text-muted-foreground mt-1 font-mono">{firstLeg.flightNumber}</p>
                                                        {isConnecting && (
                                                            <p className="text-xs text-orange-500 mt-1">
                                                                {flight.legs.length - 1} stop via {flight.legs.slice(0, -1).map(l => l.to).join(", ")}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-bold block text-lg">${flight.price}</span>
                                                    <span className="text-xs text-muted-foreground">{firstLeg.aircraft}</span>
                                                </div>
                                            </div>

                                            <Separator className="my-3 opacity-50" />

                                            <div className="flex items-center justify-between text-sm">
                                                <div className="grid gap-0.5">
                                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                                        <IconPlaneDeparture className="size-3.5" />
                                                        <span>Departure</span>
                                                    </div>
                                                    <span className="font-medium">
                                                        {format(new Date(firstLeg.departureTime), "HH:mm")}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {format(new Date(firstLeg.departureTime), "MMM d")}
                                                    </span>
                                                </div>

                                                <div className="flex flex-col items-center">
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                                                        <IconClock className="size-3" />
                                                        {durationHrs}h {durationMins}m
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-px w-8 bg-border" />
                                                        {isConnecting ? (
                                                            <div className="flex items-center gap-1">
                                                                {flight.legs.map((_, i) => (
                                                                    <div key={i} className={`size-2 rounded-full ${i === flight.legs.length - 1 ? "bg-green-500" : "bg-orange-500"}`} />
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <IconPlane className="size-3 text-muted-foreground rotate-90" />
                                                        )}
                                                        <div className="h-px w-8 bg-border" />
                                                    </div>
                                                    {isConnecting && (
                                                        <span className="text-xs text-orange-500 mt-1">
                                                            {flight.legs.length - 1} stop
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="grid gap-0.5 text-right">
                                                    <div className="flex items-center justify-end gap-1.5 text-muted-foreground">
                                                        <span>Arrival</span>
                                                        <IconPlaneArrival className="size-3.5" />
                                                    </div>
                                                    <span className="font-medium">
                                                        {format(new Date(lastLeg.arrivalTime), "HH:mm")}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {format(new Date(lastLeg.arrivalTime), "MMM d")}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    )}
                </div>

                <DialogFooter className="p-4 border-t bg-muted/20">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={selectedFlightIndex === null || isUpdating}
                        className="min-w-[120px]"
                    >
                        {isUpdating ? "Updating..." : "Confirm Flight"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
