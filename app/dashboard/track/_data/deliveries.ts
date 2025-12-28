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
    client: {
        name: string;
        company: string;
        avatar: string;
    };
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
        client: {
            name: "Nesko din",
            company: "Horizon Medical Group",
            avatar: "/avatar1.jpg",
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
        client: {
            name: "Mark Chen",
            company: "Innovate Tech, LLC",
            avatar: "/avatar2.jpg",
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
        client: {
            name: "Sarah Johnson",
            company: "Fresh Foods Inc.",
            avatar: "/avatar3.jpg",
        },
        isActive: false,
    },
];
