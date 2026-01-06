"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
    IconChevronLeft,
    IconChevronRight,
    IconLoader2,
    IconPackage,
    IconMapPin,
    IconCalendar,
    IconTrain,
    IconCheck,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { searchStations, type StationData } from "@/lib/trains";
import {
    searchTrains,
    createTrainShipment,
    type CreateTrainShipmentInput,
} from "../_server/actions";

interface TrainOption {
    trainNumber: string;
    trainName: string;
    departure: string;
    arrival: string;
    duration: string;
    runningDays: string;
    availableClasses: string[];
}

const STEPS = [
    { id: 1, title: "Package Details", icon: IconPackage },
    { id: 2, title: "Route", icon: IconMapPin },
    { id: 3, title: "Date & Train", icon: IconTrain },
    { id: 4, title: "Confirm", icon: IconCheck },
];

export function TrainShipmentForm() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = React.useState(1);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isSearchingTrains, setIsSearchingTrains] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // Step 1: Package details
    const [packageName, setPackageName] = React.useState("");
    const [weightKg, setWeightKg] = React.useState("");
    const [packageCount, setPackageCount] = React.useState("1");
    const [description, setDescription] = React.useState("");

    // Step 2: Route
    const [fromQuery, setFromQuery] = React.useState("");
    const [toQuery, setToQuery] = React.useState("");
    const [fromStation, setFromStation] = React.useState<StationData | null>(null);
    const [toStation, setToStation] = React.useState<StationData | null>(null);
    const [fromSuggestions, setFromSuggestions] = React.useState<StationData[]>([]);
    const [toSuggestions, setToSuggestions] = React.useState<StationData[]>([]);
    const [showFromSuggestions, setShowFromSuggestions] = React.useState(false);
    const [showToSuggestions, setShowToSuggestions] = React.useState(false);

    // Step 3: Date & Train
    const [journeyDate, setJourneyDate] = React.useState("");
    const [trains, setTrains] = React.useState<TrainOption[]>([]);
    const [selectedTrain, setSelectedTrain] = React.useState<TrainOption | null>(null);
    const [coachType, setCoachType] = React.useState("");

    // Search stations
    React.useEffect(() => {
        if (fromQuery.length >= 2) {
            const results = searchStations(fromQuery, 5);
            setFromSuggestions(results);
            setShowFromSuggestions(true);
        } else {
            setFromSuggestions([]);
            setShowFromSuggestions(false);
        }
    }, [fromQuery]);

    React.useEffect(() => {
        if (toQuery.length >= 2) {
            const results = searchStations(toQuery, 5);
            setToSuggestions(results);
            setShowToSuggestions(true);
        } else {
            setToSuggestions([]);
            setShowToSuggestions(false);
        }
    }, [toQuery]);

    // Search trains when route is selected
    const handleSearchTrains = async () => {
        if (!fromStation || !toStation) return;

        setIsSearchingTrains(true);
        setError(null);
        try {
            const result = await searchTrains(fromStation.code, toStation.code);
            if (result.success) {
                setTrains(result.data);
                if (result.data.length === 0) {
                    setError("No trains found for this route");
                }
            } else {
                setError(result.error);
            }
        } catch {
            setError("Failed to search trains");
        } finally {
            setIsSearchingTrains(false);
        }
    };

    const selectFromStation = (station: StationData) => {
        setFromStation(station);
        setFromQuery(`${station.name} (${station.code})`);
        setShowFromSuggestions(false);
    };

    const selectToStation = (station: StationData) => {
        setToStation(station);
        setToQuery(`${station.name} (${station.code})`);
        setShowToSuggestions(false);
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return packageName.trim() && weightKg && parseFloat(weightKg) > 0;
            case 2:
                return fromStation && toStation;
            case 3:
                return journeyDate && selectedTrain;
            case 4:
                return true;
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (currentStep === 2 && fromStation && toStation) {
            handleSearchTrains();
        }
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        if (!fromStation || !toStation || !selectedTrain || !journeyDate) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Parse times - assuming format HH:MM
            const dateObj = new Date(journeyDate);
            const [depHours, depMinutes] = selectedTrain.departure.split(":").map(Number);
            const [arrHours, arrMinutes] = selectedTrain.arrival.split(":").map(Number);

            const scheduledDep = new Date(dateObj);
            scheduledDep.setHours(depHours || 0, depMinutes || 0, 0, 0);

            const scheduledArr = new Date(dateObj);
            scheduledArr.setHours(arrHours || 0, arrMinutes || 0, 0, 0);
            // If arrival is before departure, it's next day
            if (scheduledArr < scheduledDep) {
                scheduledArr.setDate(scheduledArr.getDate() + 1);
            }

            const input: CreateTrainShipmentInput = {
                packageName: packageName.trim(),
                weightKg: parseFloat(weightKg),
                packageCount: parseInt(packageCount) || 1,
                description: description.trim() || undefined,
                trainNumber: selectedTrain.trainNumber,
                trainName: selectedTrain.trainName,
                coachType: coachType || undefined,
                fromStationCode: fromStation.code,
                fromStationName: fromStation.name,
                toStationCode: toStation.code,
                toStationName: toStation.name,
                journeyDate: dateObj,
                scheduledDep,
                scheduledArr,
            };

            const result = await createTrainShipment(input);

            if (result.success) {
                router.push(`/dashboard/train-shipments/${result.shipmentId}`);
            } else {
                setError(result.error);
            }
        } catch {
            setError("Failed to create shipment");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Progress steps */}
            <div className="flex items-center justify-between">
                {STEPS.map((step, index) => (
                    <React.Fragment key={step.id}>
                        <div
                            className={`flex items-center gap-2 ${step.id === currentStep
                                    ? "text-primary"
                                    : step.id < currentStep
                                        ? "text-green-500"
                                        : "text-muted-foreground"
                                }`}
                        >
                            <div
                                className={`flex size-8 items-center justify-center rounded-full border-2 ${step.id === currentStep
                                        ? "border-primary bg-primary/10"
                                        : step.id < currentStep
                                            ? "border-green-500 bg-green-500/10"
                                            : "border-muted"
                                    }`}
                            >
                                {step.id < currentStep ? (
                                    <IconCheck className="size-4" />
                                ) : (
                                    <step.icon className="size-4" />
                                )}
                            </div>
                            <span className="hidden sm:inline text-sm font-medium">
                                {step.title}
                            </span>
                        </div>
                        {index < STEPS.length - 1 && (
                            <div
                                className={`flex-1 h-0.5 mx-2 ${step.id < currentStep ? "bg-green-500" : "bg-muted"
                                    }`}
                            />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Step content */}
            <div className="rounded-lg border bg-card p-6">
                {/* Step 1: Package Details */}
                {currentStep === 1 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                                <IconPackage className="size-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold">Package Details</h2>
                                <p className="text-sm text-muted-foreground">
                                    Enter information about your shipment
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="packageName">
                                    Package Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="packageName"
                                    placeholder="e.g., Industrial Equipment"
                                    value={packageName}
                                    onChange={(e) => setPackageName(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="weightKg">
                                        Weight (kg) <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="weightKg"
                                        type="number"
                                        step="0.1"
                                        min="0.1"
                                        placeholder="e.g., 500"
                                        value={weightKg}
                                        onChange={(e) => setWeightKg(e.target.value)}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="packageCount">Number of Packages</Label>
                                    <Input
                                        id="packageCount"
                                        type="number"
                                        min="1"
                                        placeholder="1"
                                        value={packageCount}
                                        onChange={(e) => setPackageCount(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description (optional)</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Additional details about the cargo..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Route */}
                {currentStep === 2 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                                <IconMapPin className="size-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold">Select Route</h2>
                                <p className="text-sm text-muted-foreground">
                                    Choose origin and destination stations
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-6">
                            {/* From station */}
                            <div className="relative grid gap-2">
                                <Label htmlFor="fromStation">
                                    Origin Station <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="fromStation"
                                    placeholder="Search station... (e.g., NDLS, Mumbai)"
                                    value={fromQuery}
                                    onChange={(e) => {
                                        setFromQuery(e.target.value);
                                        setFromStation(null);
                                    }}
                                    onFocus={() => fromSuggestions.length > 0 && setShowFromSuggestions(true)}
                                />
                                {showFromSuggestions && fromSuggestions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-lg border bg-popover shadow-lg">
                                        {fromSuggestions.map((station) => (
                                            <button
                                                key={station.code}
                                                type="button"
                                                className="w-full px-4 py-2 text-left hover:bg-accent transition-colors first:rounded-t-lg last:rounded-b-lg"
                                                onClick={() => selectFromStation(station)}
                                            >
                                                <span className="font-medium">{station.name}</span>
                                                <span className="text-muted-foreground ml-2">
                                                    ({station.code})
                                                </span>
                                                <span className="text-xs text-muted-foreground ml-2">
                                                    {station.city}, {station.state}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {fromStation && (
                                    <p className="text-xs text-green-500">
                                        ✓ {fromStation.name} ({fromStation.code})
                                    </p>
                                )}
                            </div>

                            {/* To station */}
                            <div className="relative grid gap-2">
                                <Label htmlFor="toStation">
                                    Destination Station <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="toStation"
                                    placeholder="Search station... (e.g., BCT, Chennai)"
                                    value={toQuery}
                                    onChange={(e) => {
                                        setToQuery(e.target.value);
                                        setToStation(null);
                                    }}
                                    onFocus={() => toSuggestions.length > 0 && setShowToSuggestions(true)}
                                />
                                {showToSuggestions && toSuggestions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-lg border bg-popover shadow-lg">
                                        {toSuggestions.map((station) => (
                                            <button
                                                key={station.code}
                                                type="button"
                                                className="w-full px-4 py-2 text-left hover:bg-accent transition-colors first:rounded-t-lg last:rounded-b-lg"
                                                onClick={() => selectToStation(station)}
                                            >
                                                <span className="font-medium">{station.name}</span>
                                                <span className="text-muted-foreground ml-2">
                                                    ({station.code})
                                                </span>
                                                <span className="text-xs text-muted-foreground ml-2">
                                                    {station.city}, {station.state}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {toStation && (
                                    <p className="text-xs text-green-500">
                                        ✓ {toStation.name} ({toStation.code})
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Date & Train */}
                {currentStep === 3 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                                <IconCalendar className="size-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold">Select Date & Train</h2>
                                <p className="text-sm text-muted-foreground">
                                    Choose your journey date and preferred train
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="journeyDate">
                                    Journey Date <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="journeyDate"
                                    type="date"
                                    value={journeyDate}
                                    onChange={(e) => setJourneyDate(e.target.value)}
                                    min={new Date().toISOString().split("T")[0]}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="coachType">Coach Type (optional)</Label>
                                <Input
                                    id="coachType"
                                    placeholder="e.g., SL, 3A, 2A, 1A, GEN"
                                    value={coachType}
                                    onChange={(e) => setCoachType(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Train list */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>Available Trains</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSearchTrains}
                                    disabled={isSearchingTrains}
                                >
                                    {isSearchingTrains && (
                                        <IconLoader2 className="size-4 mr-2 animate-spin" />
                                    )}
                                    Refresh
                                </Button>
                            </div>

                            {isSearchingTrains ? (
                                <div className="flex items-center justify-center py-8">
                                    <IconLoader2 className="size-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : trains.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    {error || "No trains available. Try refreshing."}
                                </div>
                            ) : (
                                <div className="grid gap-2 max-h-64 overflow-y-auto">
                                    {trains.map((train) => (
                                        <button
                                            key={train.trainNumber}
                                            type="button"
                                            className={`w-full p-3 rounded-lg border text-left transition-colors ${selectedTrain?.trainNumber === train.trainNumber
                                                    ? "border-primary bg-primary/5"
                                                    : "hover:border-muted-foreground/50"
                                                }`}
                                            onClick={() => setSelectedTrain(train)}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium">{train.trainName}</span>
                                                <span className="font-mono text-sm text-muted-foreground">
                                                    {train.trainNumber}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span>{train.departure} → {train.arrival}</span>
                                                <span>{train.duration}</span>
                                                <span>{train.runningDays}</span>
                                            </div>
                                            {train.availableClasses.length > 0 && (
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    Classes: {train.availableClasses.join(", ")}
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 4: Confirmation */}
                {currentStep === 4 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10">
                                <IconCheck className="size-5 text-green-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold">Confirm Shipment</h2>
                                <p className="text-sm text-muted-foreground">
                                    Review your shipment details before creating
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            {/* Package summary */}
                            <div className="rounded-lg border p-4">
                                <h3 className="font-medium mb-2">Package</h3>
                                <div className="grid gap-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Name</span>
                                        <span>{packageName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Weight</span>
                                        <span>{weightKg} kg</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Packages</span>
                                        <span>{packageCount}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Route summary */}
                            <div className="rounded-lg border p-4">
                                <h3 className="font-medium mb-2">Route</h3>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="font-medium">{fromStation?.name}</span>
                                    <span className="text-muted-foreground">({fromStation?.code})</span>
                                    <span className="mx-2">→</span>
                                    <span className="font-medium">{toStation?.name}</span>
                                    <span className="text-muted-foreground">({toStation?.code})</span>
                                </div>
                            </div>

                            {/* Train summary */}
                            <div className="rounded-lg border p-4">
                                <h3 className="font-medium mb-2">Train</h3>
                                <div className="grid gap-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Train</span>
                                        <span>
                                            {selectedTrain?.trainName} ({selectedTrain?.trainNumber})
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Date</span>
                                        <span>{journeyDate}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Time</span>
                                        <span>
                                            {selectedTrain?.departure} → {selectedTrain?.arrival}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Duration</span>
                                        <span>{selectedTrain?.duration}</span>
                                    </div>
                                    {coachType && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Coach</span>
                                            <span>{coachType}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                    <p className="text-sm text-destructive">{error}</p>
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-between">
                <Button
                    type="button"
                    variant="outline"
                    onClick={currentStep === 1 ? () => router.back() : handleBack}
                    disabled={isLoading}
                >
                    <IconChevronLeft className="size-4 mr-2" />
                    {currentStep === 1 ? "Cancel" : "Back"}
                </Button>

                {currentStep < 4 ? (
                    <Button
                        type="button"
                        onClick={handleNext}
                        disabled={!canProceed() || isLoading}
                    >
                        Next
                        <IconChevronRight className="size-4 ml-2" />
                    </Button>
                ) : (
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!canProceed() || isLoading}
                    >
                        {isLoading && <IconLoader2 className="size-4 mr-2 animate-spin" />}
                        Create Shipment
                    </Button>
                )}
            </div>
        </div>
    );
}
