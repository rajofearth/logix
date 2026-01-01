export interface Driver {
    name: string;
    role: string;
    avatar: string;
    experience: string;
    license: string;
    idNumber: string;
    licenseClass: string;
    insuranceNumber: string;
}

export interface DeliveryStatus {
    currentLocation: string;
    lastStop: string;
    distance: string;
    currentSpeed: string;
}

export interface Delivery {
    id: string;
    type: string;
    jobStatus: "pending" | "in_progress" | "completed" | "cancelled";
    image: string;
    origin: {
        address: string;
        detail: string;
        lat: number;
        lng: number;
    };
    destination: {
        address: string;
        detail: string;
        lat: number;
        lng: number;
    };
    driver: Driver;
    status: DeliveryStatus;
    isActive: boolean;
}
