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
    { id: 1, title: "Package", icon: IconPackage },
    { id: 2, title: "Route", icon: IconMapPin },
    { id: 3, title: "Train", icon: IconTrain },
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
        <div className="space-y-4 font-sans text-sm">
            {/* Steps Indicator - Win7 Tab Style */}
            <div className="flex border-b border-[#7f9db9] pl-2 gap-1 select-none">
                {STEPS.map((step) => (
                    <div
                        key={step.id}
                        className={`px-3 py-1 border-t border-l border-r rounded-t ${step.id === currentStep
                                ? "bg-white border-[#7f9db9] border-b-white font-bold relative bottom-[-1px] z-10"
                                : "bg-[#ece9d8] border-[#aca899] text-gray-500"
                            }`}
                    >
                        <span className="flex items-center gap-1">
                            <step.icon className="size-3.5" />
                            {step.title}
                        </span>
                    </div>
                ))}
            </div>

            {/* Step Content Container */}
            <div className="bg-white border border-[#7f9db9] border-t-0 p-4 min-h-[300px] relative top-[-1px]">

                {/* Step 1: Package Details */}
                {currentStep === 1 && (
                    <div className="grid gap-4">
                        <h2 className="font-bold text-lg mb-2 text-[#003399]">Package Details</h2>
                        <div className="grid gap-1">
                            <label className="font-bold">Package Name <span className="text-red-500">*</span></label>
                            <input className="win7-input" value={packageName} onChange={e => setPackageName(e.target.value)} placeholder="e.g. Industrial Goods" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-1">
                                <label className="font-bold">Weight (kg) <span className="text-red-500">*</span></label>
                                <input type="number" step="0.1" className="win7-input" value={weightKg} onChange={e => setWeightKg(e.target.value)} />
                            </div>
                            <div className="grid gap-1">
                                <label className="font-bold">Count</label>
                                <input type="number" min="1" className="win7-input" value={packageCount} onChange={e => setPackageCount(e.target.value)} />
                            </div>
                        </div>
                        <div className="grid gap-1">
                            <label className="font-bold">Description</label>
                            <textarea className="win7-input" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
                        </div>
                    </div>
                )}

                {/* Step 2: Route */}
                {currentStep === 2 && (
                    <div className="grid gap-4">
                        <h2 className="font-bold text-lg mb-2 text-[#003399]">Select Route</h2>

                        <div className="grid gap-1 relative">
                            <label className="font-bold">Origin Station <span className="text-red-500">*</span></label>
                            <input
                                className="win7-input"
                                value={fromQuery}
                                onChange={e => { setFromQuery(e.target.value); setFromStation(null); }}
                                placeholder="Search origin..."
                                onFocus={() => fromSuggestions.length > 0 && setShowFromSuggestions(true)}
                            />
                            {showFromSuggestions && fromSuggestions.length > 0 && (
                                <div className="absolute top-[55px] left-0 w-full bg-white border border-[#7f9db9] shadow-lg z-20 max-h-40 overflow-auto">
                                    {fromSuggestions.map(s => (
                                        <div
                                            key={s.code}
                                            className="p-2 hover:bg-[#316ac5] hover:text-white cursor-pointer flex justify-between"
                                            onClick={() => selectFromStation(s)}
                                        >
                                            <span>{s.name}</span>
                                            <span className="font-mono text-xs opacity-70">{s.code}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {fromStation && <p className="text-xs text-green-600">✓ Selected: {fromStation.name}</p>}
                        </div>

                        <div className="grid gap-1 relative">
                            <label className="font-bold">Destination Station <span className="text-red-500">*</span></label>
                            <input
                                className="win7-input"
                                value={toQuery}
                                onChange={e => { setToQuery(e.target.value); setToStation(null); }}
                                placeholder="Search destination..."
                                onFocus={() => toSuggestions.length > 0 && setShowToSuggestions(true)}
                            />
                            {showToSuggestions && toSuggestions.length > 0 && (
                                <div className="absolute top-[55px] left-0 w-full bg-white border border-[#7f9db9] shadow-lg z-20 max-h-40 overflow-auto">
                                    {toSuggestions.map(s => (
                                        <div
                                            key={s.code}
                                            className="p-2 hover:bg-[#316ac5] hover:text-white cursor-pointer flex justify-between"
                                            onClick={() => selectToStation(s)}
                                        >
                                            <span>{s.name}</span>
                                            <span className="font-mono text-xs opacity-70">{s.code}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {toStation && <p className="text-xs text-green-600">✓ Selected: {toStation.name}</p>}
                        </div>
                    </div>
                )}

                {/* Step 3: Date & Train */}
                {currentStep === 3 && (
                    <div className="grid gap-4 h-full flex-col">
                        <h2 className="font-bold text-lg mb-2 text-[#003399]">Select Train</h2>
                        <div className="grid gap-1">
                            <label className="font-bold">Journey Date <span className="text-red-500">*</span></label>
                            <input type="date" className="win7-input" value={journeyDate} onChange={e => setJourneyDate(e.target.value)} />
                        </div>

                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="flex justify-between items-center bg-[#ece9d8] p-1 border border-[#aca899] mb-2">
                                <span className="font-bold px-2">Available Trains</span>
                                <button className="win7-btn text-xs px-2 h-5" onClick={handleSearchTrains} disabled={isSearchingTrains}>
                                    {isSearchingTrains ? "Searching..." : "Search Trains"}
                                </button>
                            </div>

                            <div className="border border-[#7f9db9] bg-white flex-1 overflow-y-auto min-h-[150px] p-1 space-y-1">
                                {isSearchingTrains && <div className="text-center p-4 text-gray-500">Searching...</div>}
                                {!isSearchingTrains && trains.length === 0 && <div className="text-center p-4 text-gray-500">No trains found. Select date and search.</div>}
                                {!isSearchingTrains && trains.map(train => (
                                    <div
                                        key={train.trainNumber}
                                        onClick={() => setSelectedTrain(train)}
                                        className={`p-2 cursor-pointer border ${selectedTrain?.trainNumber === train.trainNumber ? "bg-[#316ac5] text-white border-[#316ac5]" : "hover:bg-[#f5f5f5] border-transparent border-b-gray-100"}`}
                                    >
                                        <div className="flex justify-between font-bold text-sm">
                                            <span>{train.trainName}</span>
                                            <span className="font-mono">{train.trainNumber}</span>
                                        </div>
                                        <div className={`flex justify-between text-xs ${selectedTrain?.trainNumber === train.trainNumber ? "text-white" : "text-gray-500"}`}>
                                            <span>{train.departure} - {train.arrival}</span>
                                            <span>{train.duration}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Confirm */}
                {currentStep === 4 && (
                    <div className="grid gap-4">
                        <h2 className="font-bold text-lg mb-2 text-[#003399]">Confirm Details</h2>

                        <div className="win7-groupbox">
                            <legend>Summary</legend>
                            <div className="win7-p-4 grid gap-2 text-xs">
                                <div className="flex justify-between"><span className="text-gray-500">Package:</span> <span className="font-bold">{packageName} ({weightKg}kg)</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Route:</span> <span className="font-bold">{fromStation?.name} → {toStation?.name}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Train:</span> <span className="font-bold">{selectedTrain?.trainName} ({selectedTrain?.trainNumber})</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Date:</span> <span className="font-bold">{journeyDate}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Time:</span> <span className="font-bold">{selectedTrain?.departure} - {selectedTrain?.arrival}</span></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .win7-input {
                    border: 1px solid #7f9db9;
                    padding: 3px 4px;
                    width: 100%;
                    outline: none;
                }
                .win7-input:focus {
                     border: 1px solid #3399ff;
                }
            `}</style>

            {error && (
                <div className="p-2 border border-red-500 bg-red-100 text-red-600 text-xs">{error}</div>
            )}

            {/* Footer Actions */}
            <div className="flex justify-between pt-4 border-t border-gray-300">
                <button
                    onClick={currentStep === 1 ? () => router.back() : handleBack}
                    disabled={isLoading}
                    className="win7-btn min-w-[80px]"
                >
                    <span className="flex items-center gap-1"><IconChevronLeft className="size-3" /> {currentStep === 1 ? "Cancel" : "Back"}</span>
                </button>

                {currentStep < 4 ? (
                    <button
                        onClick={handleNext}
                        disabled={!canProceed() || isLoading}
                        className="win7-btn min-w-[80px]"
                    >
                        <span className="flex items-center gap-1">Next <IconChevronRight className="size-3" /></span>
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={!canProceed() || isLoading}
                        className="win7-btn min-w-[120px] font-bold"
                    >
                        {isLoading && <IconLoader2 className="size-3 animate-spin inline mr-1" />}
                        Create Shipment
                    </button>
                )}
            </div>
        </div>
    );
}
