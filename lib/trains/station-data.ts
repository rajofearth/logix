/**
 * Indian Railway Station Data
 * Major stations with coordinates for map visualization
 */

export interface StationData {
    code: string;
    name: string;
    city: string;
    state: string;
    latitude: number;
    longitude: number;
}

// Major Indian railway stations with coordinates
// This is a curated list of ~150 major stations
// You can expand this list as needed
export const STATIONS: StationData[] = [
    // Delhi NCR
    { code: "NDLS", name: "New Delhi", city: "New Delhi", state: "Delhi", latitude: 28.6425, longitude: 77.2209 },
    { code: "DLI", name: "Delhi Junction", city: "Delhi", state: "Delhi", latitude: 28.6617, longitude: 77.2293 },
    { code: "NZM", name: "Hazrat Nizamuddin", city: "New Delhi", state: "Delhi", latitude: 28.5898, longitude: 77.2515 },
    { code: "ANVT", name: "Anand Vihar Terminal", city: "New Delhi", state: "Delhi", latitude: 28.6514, longitude: 77.3163 },
    { code: "GZB", name: "Ghaziabad Junction", city: "Ghaziabad", state: "Uttar Pradesh", latitude: 28.6618, longitude: 77.4378 },

    // Mumbai
    { code: "CSMT", name: "Chhatrapati Shivaji Maharaj Terminus", city: "Mumbai", state: "Maharashtra", latitude: 18.9398, longitude: 72.8354 },
    { code: "BCT", name: "Mumbai Central", city: "Mumbai", state: "Maharashtra", latitude: 18.9690, longitude: 72.8194 },
    { code: "LTT", name: "Lokmanya Tilak Terminus", city: "Mumbai", state: "Maharashtra", latitude: 19.0675, longitude: 72.8848 },
    { code: "BVI", name: "Borivali", city: "Mumbai", state: "Maharashtra", latitude: 19.2307, longitude: 72.8567 },
    { code: "PNVL", name: "Panvel Junction", city: "Panvel", state: "Maharashtra", latitude: 18.9946, longitude: 73.1166 },

    // Chennai
    { code: "MAS", name: "Chennai Central", city: "Chennai", state: "Tamil Nadu", latitude: 13.0827, longitude: 80.2707 },
    { code: "MS", name: "Chennai Egmore", city: "Chennai", state: "Tamil Nadu", latitude: 13.0772, longitude: 80.2610 },
    { code: "TBM", name: "Tambaram", city: "Chennai", state: "Tamil Nadu", latitude: 12.9261, longitude: 80.1276 },

    // Kolkata
    { code: "HWH", name: "Howrah Junction", city: "Kolkata", state: "West Bengal", latitude: 22.5837, longitude: 88.3429 },
    { code: "SDAH", name: "Sealdah", city: "Kolkata", state: "West Bengal", latitude: 22.5650, longitude: 88.3650 },
    { code: "KOAA", name: "Kolkata Terminal", city: "Kolkata", state: "West Bengal", latitude: 22.5295, longitude: 88.3575 },

    // Bengaluru
    { code: "SBC", name: "KSR Bengaluru City", city: "Bengaluru", state: "Karnataka", latitude: 12.9776, longitude: 77.5705 },
    { code: "YPR", name: "Yesvantpur Junction", city: "Bengaluru", state: "Karnataka", latitude: 13.0290, longitude: 77.5530 },
    { code: "BNCE", name: "Bengaluru Cantonment", city: "Bengaluru", state: "Karnataka", latitude: 12.9909, longitude: 77.5956 },

    // Hyderabad
    { code: "SC", name: "Secunderabad Junction", city: "Hyderabad", state: "Telangana", latitude: 17.4339, longitude: 78.5007 },
    { code: "HYB", name: "Hyderabad Deccan", city: "Hyderabad", state: "Telangana", latitude: 17.3887, longitude: 78.4809 },
    { code: "KCG", name: "Kacheguda", city: "Hyderabad", state: "Telangana", latitude: 17.3857, longitude: 78.4869 },

    // Ahmedabad
    { code: "ADI", name: "Ahmedabad Junction", city: "Ahmedabad", state: "Gujarat", latitude: 23.0274, longitude: 72.6008 },
    { code: "SBIS", name: "Sabarmati Junction", city: "Ahmedabad", state: "Gujarat", latitude: 23.0597, longitude: 72.5968 },

    // Pune
    { code: "PUNE", name: "Pune Junction", city: "Pune", state: "Maharashtra", latitude: 18.5285, longitude: 73.8742 },
    { code: "SNSI", name: "Sainagar Shirdi", city: "Shirdi", state: "Maharashtra", latitude: 19.7644, longitude: 74.4783 },

    // Jaipur
    { code: "JP", name: "Jaipur Junction", city: "Jaipur", state: "Rajasthan", latitude: 26.9201, longitude: 75.7874 },
    { code: "DURG", name: "Jaipur Gandhinagar", city: "Jaipur", state: "Rajasthan", latitude: 26.9088, longitude: 75.7836 },

    // Lucknow
    { code: "LKO", name: "Lucknow Charbagh", city: "Lucknow", state: "Uttar Pradesh", latitude: 26.8326, longitude: 80.9200 },
    { code: "LJN", name: "Lucknow Junction", city: "Lucknow", state: "Uttar Pradesh", latitude: 26.8516, longitude: 80.9491 },

    // Kanpur
    { code: "CNB", name: "Kanpur Central", city: "Kanpur", state: "Uttar Pradesh", latitude: 26.4540, longitude: 80.3526 },

    // Varanasi
    { code: "BSB", name: "Varanasi Junction", city: "Varanasi", state: "Uttar Pradesh", latitude: 25.3152, longitude: 83.0145 },
    { code: "BSBS", name: "Varanasi City", city: "Varanasi", state: "Uttar Pradesh", latitude: 25.3194, longitude: 82.9873 },

    // Patna
    { code: "PNBE", name: "Patna Junction", city: "Patna", state: "Bihar", latitude: 25.6080, longitude: 85.1032 },
    { code: "RJPB", name: "Rajendranagar Terminal", city: "Patna", state: "Bihar", latitude: 25.5985, longitude: 85.0809 },

    // Agra
    { code: "AGC", name: "Agra Cantt", city: "Agra", state: "Uttar Pradesh", latitude: 27.1593, longitude: 78.0081 },
    { code: "AF", name: "Agra Fort", city: "Agra", state: "Uttar Pradesh", latitude: 27.1784, longitude: 78.0018 },

    // Bhopal
    { code: "BPL", name: "Bhopal Junction", city: "Bhopal", state: "Madhya Pradesh", latitude: 23.2689, longitude: 77.4124 },
    { code: "HBJ", name: "Habibganj", city: "Bhopal", state: "Madhya Pradesh", latitude: 23.2301, longitude: 77.4324 },

    // Indore
    { code: "INDB", name: "Indore Junction", city: "Indore", state: "Madhya Pradesh", latitude: 22.7227, longitude: 75.8025 },

    // Nagpur
    { code: "NGP", name: "Nagpur Junction", city: "Nagpur", state: "Maharashtra", latitude: 21.1503, longitude: 79.0831 },

    // Surat
    { code: "ST", name: "Surat", city: "Surat", state: "Gujarat", latitude: 21.2063, longitude: 72.8378 },
    { code: "UDN", name: "Udhna Junction", city: "Surat", state: "Gujarat", latitude: 21.1702, longitude: 72.8502 },

    // Vadodara
    { code: "BRC", name: "Vadodara Junction", city: "Vadodara", state: "Gujarat", latitude: 22.3104, longitude: 73.1812 },

    // Kochi
    { code: "ERS", name: "Ernakulam Junction", city: "Kochi", state: "Kerala", latitude: 9.9816, longitude: 76.2999 },
    { code: "ERN", name: "Ernakulam Town", city: "Kochi", state: "Kerala", latitude: 9.9917, longitude: 76.2716 },

    // Thiruvananthapuram
    { code: "TVC", name: "Thiruvananthapuram Central", city: "Thiruvananthapuram", state: "Kerala", latitude: 8.4886, longitude: 76.9528 },

    // Coimbatore
    { code: "CBE", name: "Coimbatore Junction", city: "Coimbatore", state: "Tamil Nadu", latitude: 11.0019, longitude: 76.9671 },

    // Madurai
    { code: "MDU", name: "Madurai Junction", city: "Madurai", state: "Tamil Nadu", latitude: 9.9195, longitude: 78.1190 },

    // Visakhapatnam
    { code: "VSKP", name: "Visakhapatnam Junction", city: "Visakhapatnam", state: "Andhra Pradesh", latitude: 17.7215, longitude: 83.2897 },

    // Vijayawada
    { code: "BZA", name: "Vijayawada Junction", city: "Vijayawada", state: "Andhra Pradesh", latitude: 16.5180, longitude: 80.6197 },

    // Bhubaneswar
    { code: "BBS", name: "Bhubaneswar", city: "Bhubaneswar", state: "Odisha", latitude: 20.2701, longitude: 85.8245 },

    // Puri
    { code: "PURI", name: "Puri", city: "Puri", state: "Odisha", latitude: 19.8135, longitude: 85.8312 },

    // Guwahati
    { code: "GHY", name: "Guwahati", city: "Guwahati", state: "Assam", latitude: 26.1844, longitude: 91.7486 },
    { code: "KYQ", name: "Kamakhya Junction", city: "Guwahati", state: "Assam", latitude: 26.1697, longitude: 91.7228 },

    // Chandigarh
    { code: "CDG", name: "Chandigarh Junction", city: "Chandigarh", state: "Chandigarh", latitude: 30.6903, longitude: 76.8010 },

    // Amritsar
    { code: "ASR", name: "Amritsar Junction", city: "Amritsar", state: "Punjab", latitude: 31.6382, longitude: 74.8746 },

    // Ludhiana
    { code: "LDH", name: "Ludhiana Junction", city: "Ludhiana", state: "Punjab", latitude: 30.8978, longitude: 75.8577 },

    // Jalandhar
    { code: "JUC", name: "Jalandhar City", city: "Jalandhar", state: "Punjab", latitude: 31.3264, longitude: 75.5705 },

    // Dehradun
    { code: "DDN", name: "Dehradun", city: "Dehradun", state: "Uttarakhand", latitude: 30.3183, longitude: 78.0292 },

    // Haridwar
    { code: "HW", name: "Haridwar Junction", city: "Haridwar", state: "Uttarakhand", latitude: 29.9461, longitude: 78.1656 },

    // Jammu
    { code: "JAT", name: "Jammu Tawi", city: "Jammu", state: "Jammu & Kashmir", latitude: 32.7081, longitude: 74.8720 },

    // Jodhpur
    { code: "JU", name: "Jodhpur Junction", city: "Jodhpur", state: "Rajasthan", latitude: 26.2851, longitude: 73.0216 },

    // Udaipur
    { code: "UDZ", name: "Udaipur City", city: "Udaipur", state: "Rajasthan", latitude: 24.5767, longitude: 73.6885 },

    // Ajmer
    { code: "AII", name: "Ajmer Junction", city: "Ajmer", state: "Rajasthan", latitude: 26.4521, longitude: 74.6256 },

    // Jaisalmer
    { code: "JSM", name: "Jaisalmer", city: "Jaisalmer", state: "Rajasthan", latitude: 26.9124, longitude: 70.9161 },

    // Raipur
    { code: "R", name: "Raipur Junction", city: "Raipur", state: "Chhattisgarh", latitude: 21.2514, longitude: 81.6296 },

    // Bilaspur
    { code: "BSP", name: "Bilaspur Junction", city: "Bilaspur", state: "Chhattisgarh", latitude: 22.0796, longitude: 82.1391 },

    // Ranchi
    { code: "RNC", name: "Ranchi Junction", city: "Ranchi", state: "Jharkhand", latitude: 23.3144, longitude: 85.3264 },

    // Jamshedpur
    { code: "TATA", name: "Tatanagar Junction", city: "Jamshedpur", state: "Jharkhand", latitude: 22.7923, longitude: 86.1900 },

    // Kharagpur
    { code: "KGP", name: "Kharagpur Junction", city: "Kharagpur", state: "West Bengal", latitude: 22.3460, longitude: 87.3239 },

    // Asansol
    { code: "ASN", name: "Asansol Junction", city: "Asansol", state: "West Bengal", latitude: 23.6867, longitude: 86.9520 },

    // Dhanbad
    { code: "DHN", name: "Dhanbad Junction", city: "Dhanbad", state: "Jharkhand", latitude: 23.7957, longitude: 86.4304 },

    // Allahabad
    { code: "ALD", name: "Prayagraj Junction", city: "Prayagraj", state: "Uttar Pradesh", latitude: 25.4344, longitude: 81.8349 },

    // Gorakhpur
    { code: "GKP", name: "Gorakhpur Junction", city: "Gorakhpur", state: "Uttar Pradesh", latitude: 26.7512, longitude: 83.3625 },

    // Gwalior
    { code: "GWL", name: "Gwalior Junction", city: "Gwalior", state: "Madhya Pradesh", latitude: 26.2138, longitude: 78.1795 },

    // Jabalpur
    { code: "JBP", name: "Jabalpur Junction", city: "Jabalpur", state: "Madhya Pradesh", latitude: 23.1688, longitude: 79.9561 },

    // Itarsi
    { code: "ET", name: "Itarsi Junction", city: "Itarsi", state: "Madhya Pradesh", latitude: 22.6171, longitude: 77.7624 },

    // Manmad
    { code: "MMR", name: "Manmad Junction", city: "Manmad", state: "Maharashtra", latitude: 20.2517, longitude: 74.4387 },

    // Nashik
    { code: "NK", name: "Nashik Road", city: "Nashik", state: "Maharashtra", latitude: 19.9309, longitude: 73.8193 },

    // Aurangabad
    { code: "AWB", name: "Aurangabad", city: "Aurangabad", state: "Maharashtra", latitude: 19.8746, longitude: 75.3207 },

    // Solapur
    { code: "SUR", name: "Solapur Junction", city: "Solapur", state: "Maharashtra", latitude: 17.6673, longitude: 75.9132 },

    // Hubli
    { code: "UBL", name: "Hubli Junction", city: "Hubli", state: "Karnataka", latitude: 15.3518, longitude: 75.1391 },

    // Mysuru
    { code: "MYS", name: "Mysuru Junction", city: "Mysuru", state: "Karnataka", latitude: 12.2981, longitude: 76.6424 },

    // Mangalore
    { code: "MAQ", name: "Mangalore Central", city: "Mangalore", state: "Karnataka", latitude: 12.8670, longitude: 74.8430 },
    { code: "MAJN", name: "Mangalore Junction", city: "Mangalore", state: "Karnataka", latitude: 12.8952, longitude: 74.8125 },

    // Goa
    { code: "MAO", name: "Madgaon Junction", city: "Madgaon", state: "Goa", latitude: 15.2843, longitude: 73.9424 },
    { code: "KRMI", name: "Karmali", city: "Karmali", state: "Goa", latitude: 15.4829, longitude: 73.8768 },
    { code: "THVM", name: "Thivim", city: "Thivim", state: "Goa", latitude: 15.5927, longitude: 73.8071 },

    // Tirupati
    { code: "TPTY", name: "Tirupati", city: "Tirupati", state: "Andhra Pradesh", latitude: 13.6333, longitude: 79.4183 },

    // Tiruchirappalli
    { code: "TPJ", name: "Tiruchirappalli Junction", city: "Tiruchirappalli", state: "Tamil Nadu", latitude: 10.8185, longitude: 78.6773 },

    // Salem
    { code: "SA", name: "Salem Junction", city: "Salem", state: "Tamil Nadu", latitude: 11.6517, longitude: 78.1458 },

    // Kollam
    { code: "QLN", name: "Kollam Junction", city: "Kollam", state: "Kerala", latitude: 8.8918, longitude: 76.5977 },

    // Kozhikode
    { code: "CLT", name: "Kozhikode", city: "Kozhikode", state: "Kerala", latitude: 11.2474, longitude: 75.7769 },

    // Kannur
    { code: "CAN", name: "Kannur", city: "Kannur", state: "Kerala", latitude: 11.8685, longitude: 75.3550 },
];

// Create a lookup map for quick access by station code
export const STATION_MAP: Map<string, StationData> = new Map(
    STATIONS.map((station) => [station.code, station])
);

/**
 * Get station by code
 */
export function getStationByCode(code: string): StationData | undefined {
    return STATION_MAP.get(code.toUpperCase());
}

/**
 * Search stations by name or code
 */
export function searchStations(query: string, limit = 10): StationData[] {
    const q = query.toLowerCase();
    return STATIONS.filter(
        (s) =>
            s.code.toLowerCase().includes(q) ||
            s.name.toLowerCase().includes(q) ||
            s.city.toLowerCase().includes(q)
    ).slice(0, limit);
}

/**
 * Get coordinates for a station
 */
export function getStationCoordinates(
    code: string
): { lat: number; lng: number } | null {
    const station = getStationByCode(code);
    if (!station) return null;
    return { lat: station.latitude, lng: station.longitude };
}
