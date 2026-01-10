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
        <div className="win7-wrapper font-sans text-sm p-4 bg-[#f0f0f0]">
            <menu role="tablist" aria-label="Shipment Steps" className="win7-tabs">
                {STEPS.map((step) => (
                    <button
                        key={step.id}
                        role="tab"
                        aria-selected={step.id === currentStep}
                        aria-controls={`step-${step.id}`}
                        onClick={() => {
                            // Optional: Allow navigation if logic permits, currently restricted to sequential
                            // to avoid validation skipping.
                            // setCurrentStep(step.id); 
                        }}
                        disabled={step.id > currentStep} // Only allow going back
                        className="win7-tab"
                    >
                        <span className="flex items-center gap-1.5 px-1">
                            <step.icon className="size-3.5" />
                            {step.title}
                        </span>
                    </button>
                ))}
            </menu>

            <div role="tabpanel" id={`step-${currentStep}`} className="win7-panel">
                
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
                            <div className="flex justify-between items-center bg-[#ece9d8] p-1 border border-[#aca899] mb-2 rounded-[2px]">
                                <span className="font-bold px-2">Available Trains</span>
                                <button className="win7-btn text-xs px-2 h-6" onClick={handleSearchTrains} disabled={isSearchingTrains}>
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

                        <fieldset className="border border-[#d0d0bf] p-4 rounded-[2px]">
                            <legend className="px-1 text-[#003399]">Summary</legend>
                            <div className="grid gap-2 text-xs">
                                <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">Package:</span> <span className="font-bold">{packageName} ({weightKg}kg)</span></div>
                                <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">Route:</span> <span className="font-bold">{fromStation?.name} → {toStation?.name}</span></div>
                                <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">Train:</span> <span className="font-bold">{selectedTrain?.trainName} ({selectedTrain?.trainNumber})</span></div>
                                <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">Date:</span> <span className="font-bold">{journeyDate}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Time:</span> <span className="font-bold">{selectedTrain?.departure} - {selectedTrain?.arrival}</span></div>
                            </div>
                        </fieldset>
                    </div>
                )}

                {error && (
                    <div className="p-2 border border-red-500 bg-red-100 text-red-600 text-xs mt-4">{error}</div>
                )}

                {/* Footer Actions */}
                <div className="flex justify-between pt-6 mt-4 border-t border-gray-200">
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


            <style jsx>{`
                /* Variables based on design-docs/gui/_variables.scss */
                .win7-wrapper {
                    --w7-bg: #ece9d8;
                    --w7-tab-bg: #fff;
                    --w7-el-bd: #8e8f8f;
                    --w7-el-bd-h: #3c7fb1; 
                    --w7-el-bd-a: #6d91ab;
                    --w7-el-bdr: 3px;
                    --w7-el-grad: linear-gradient(#f2f2f2 45%, #ebebeb 45%, #cfcfcf);
                    --w7-el-grad-h: linear-gradient(#eaf6fd 45%, #bee6fd 45%, #a7d9f5);
                    --w7-el-grad-a: linear-gradient(#e5f4fc, #c4e5f6 30% 50%, #98d1ef 50%, #68b3db); 
                    --w7-tabs-grad: linear-gradient(to bottom, #f2f2f2, #d8d8d8);
                    --w7-input-bd: #7f9db9;
                    --w7-blue: #003399;
                }

                /* TABS */
                menu.win7-tabs {
                    position: relative;
                    margin: 0 0 -1px 0;
                    padding-left: 3px;
                    list-style-type: none;
                    display: flex;
                    z-index: 10;
                }

                .win7-tab {
                    padding: 3px 8px 4px; /* Increased padding slightly for hit area */
                    border: 1px solid #aca899;
                    border-bottom: none;
                    margin-right: -1px; /* Overlap borders */
                    background: linear-gradient(to bottom, #f4f4f4 0%, #e0e0e0 100%);
                    color: #444;
                    font-size: 11px;
                    cursor: pointer;
                    border-radius: 2px 2px 0 0;
                    position: relative;
                    top: 1px;
                }

                .win7-tab:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .win7-tab[aria-selected="true"] {
                    background: var(--w7-tab-bg);
                    border-color: #7f9db9;
                    border-top: 2px solid #ff9933; /* Orange accent or blue? Win7 usually blue/orange. Standard win7 doesn't have orange top but some themes do. Let's stick to standard blue but the image looked clean. Actually the image had a slight highlight. I will use standard active state. */
                    border-top: 1px solid #7f9db9;
                    border-bottom: 2px solid white; /* Hide the panel border */
                    color: #000;
                    font-weight: 600;
                    padding-bottom: 6px;
                    margin-top: -2px;
                    padding-top: 5px;
                    z-index: 20;
                }

                /* PANEL */
                .win7-panel {
                    padding: 16px;
                    background: var(--w7-tab-bg);
                    border: 1px solid #7f9db9;
                    position: relative;
                    z-index: 5;
                    box-shadow: 1px 1px 2px rgba(0,0,0,0.05);
                }

                /* INPUTS */
                input.win7-input, textarea.win7-input {
                    font-family: "Segoe UI", sans-serif;
                    padding: 3px 4px;
                    border: 1px solid;
                    border-color: #abadb3 #dbdfe6 #e3e9ef #e2e3ea;
                    border-radius: 2px;
                    background: #fff;
                    width: 100%;
                    outline: none;
                    transition: border-color 0.2s;
                }
                input.win7-input:hover, textarea.win7-input:hover {
                    border-color: #5794bf #b7d5ea #c7e2f1 #c5daed;
                }
                input.win7-input:focus, textarea.win7-input:focus {
                     border-color: #3d7bad #a4c9e3 #b7d9ed #b5cfe7;
                     box-shadow: 0 0 0 1px rgba(61, 123, 173, 0.2);
                }

                /* BUTTONS */
                .win7-btn {
                    border: 1px solid var(--w7-el-bd);
                    border-radius: var(--w7-el-bdr);
                    background: var(--w7-el-grad);
                    color: black;
                    padding: 4px 12px;
                    min-height: 24px;
                    font-family: inherit;
                    cursor: pointer;
                    box-shadow: inset 0 0 0 1px #fffc;
                }
                .win7-btn:hover:not(:disabled) {
                    border-color: var(--w7-el-bd-h);
                    background: var(--w7-el-grad-h);
                }
                .win7-btn:active:not(:disabled) {
                    border-color: var(--w7-el-bd-a);
                    background: var(--w7-el-grad-a);
                    box-shadow: inset 1px 1px 0 #0003;
                }
                .win7-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    filter: grayscale(1);
                }

            `}</style>
        </div>
    );
}
