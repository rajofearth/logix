"use client";

import * as React from "react";

// Context to share airport selections between form and map
export const ShipmentFormContext = React.createContext<{
    fromIcao: string | null;
    toIcao: string | null;
    setFromIcao: (icao: string | null) => void;
    setToIcao: (icao: string | null) => void;
}>({
    fromIcao: null,
    toIcao: null,
    setFromIcao: () => {},
    setToIcao: () => {},
});

export const useShipmentForm = () => React.useContext(ShipmentFormContext);
