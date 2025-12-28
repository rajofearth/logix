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
    image: string;
    origin: {
        address: string;
        detail: string;
    };
    destination: {
        address: string;
        detail: string;
    };
    driver: Driver;
    status: DeliveryStatus;
    isActive: boolean;
}

export const deliveries: Delivery[] = [
    {
        id: "ST-202500458",
        type: "Medical Supplies",
        image: "/truck.png",
        origin: {
            address: "1000 W Fulton Market, Chicago",
            detail: "Rd. Santa Ana, Illinois 85486",
        },
        destination: {
            address: "225 E Chicago Ave, Chicago",
            detail: "Rd. Inglewood, Maine 98380",
        },
        driver: {
            name: "Philip Osborne",
            role: "Driver",
            avatar: "/driver1.jpg",
            experience: "12 years",
            license: "CDL",
            idNumber: "2415-63-7867",
            licenseClass: "A, D",
            insuranceNumber: "987-34-2415",
        },
        status: {
            currentLocation: "Route I-75",
            lastStop: "6h ago",
            distance: "120/180 mi",
            currentSpeed: "76 mph",
        },
        isActive: true,
    },
    {
        id: "ST-202500459",
        type: "Electronics Components",
        image: "/truck.png",
        origin: {
            address: "222 W Merchandise Mart Plaza",
            detail: "Rd. Santa Ana, Illinois 85486",
        },
        destination: {
            address: "1200 N North Branch St, Chicago",
            detail: "Rd. Inglewood, Maine 98380",
        },
        driver: {
            name: "Sarah Mitchell",
            role: "Driver",
            avatar: "/driver2.jpg",
            experience: "8 years",
            license: "CDL",
            idNumber: "3521-78-4532",
            licenseClass: "A, B",
            insuranceNumber: "654-21-8790",
        },
        status: {
            currentLocation: "Route I-90",
            lastStop: "2h ago",
            distance: "45/120 mi",
            currentSpeed: "62 mph",
        },
        isActive: false,
    },
    {
        id: "ST-202500460",
        type: "Food & Beverages",
        image: "/truck.png",
        origin: {
            address: "500 W Madison St, Chicago",
            detail: "Rd. Downtown, Illinois 60661",
        },
        destination: {
            address: "800 S Michigan Ave, Chicago",
            detail: "Rd. Loop District, Illinois 60605",
        },
        driver: {
            name: "Mike Thompson",
            role: "Driver",
            avatar: "/driver3.jpg",
            experience: "15 years",
            license: "CDL",
            idNumber: "1987-45-6321",
            licenseClass: "A, C, D",
            insuranceNumber: "321-67-9854",
        },
        status: {
            currentLocation: "Route 41",
            lastStop: "1h ago",
            distance: "8/25 mi",
            currentSpeed: "45 mph",
        },
        isActive: false,
    },
    {
        id: "ST-202500461",
        type: "Industrial Equipment",
        image: "/truck.png",
        origin: {
            address: "333 W 35th St, Chicago",
            detail: "Rd. South Side, Illinois 60616",
        },
        destination: {
            address: "2300 S Throop St, Chicago",
            detail: "Rd. Pilsen, Illinois 60608",
        },
        driver: {
            name: "James Wilson",
            role: "Driver",
            avatar: "/driver4.jpg",
            experience: "20 years",
            license: "CDL",
            idNumber: "4455-22-1188",
            licenseClass: "A",
            insuranceNumber: "112-23-3445",
        },
        status: {
            currentLocation: "Route 55",
            lastStop: "30m ago",
            distance: "15/40 mi",
            currentSpeed: "55 mph",
        },
        isActive: false,
    },
];
