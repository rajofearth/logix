export interface Airport {
  icao: string
  iata: string
  name: string
  city: string
  state?: string
  latitude: number
  longitude: number
}

// Curated set (expand over time). Coordinates are approximate.
export const INDIA_AIRPORTS: Airport[] = [
  { icao: "VIDP", iata: "DEL", name: "Indira Gandhi International Airport", city: "Delhi", latitude: 28.5562, longitude: 77.1 },
  { icao: "VABB", iata: "BOM", name: "Chhatrapati Shivaji Maharaj International Airport", city: "Mumbai", latitude: 19.0896, longitude: 72.8656 },
  { icao: "VOMM", iata: "MAA", name: "Chennai International Airport", city: "Chennai", latitude: 12.9941, longitude: 80.1709 },
  { icao: "VOBL", iata: "BLR", name: "Kempegowda International Airport", city: "Bengaluru", latitude: 13.1986, longitude: 77.7066 },
  { icao: "VECC", iata: "CCU", name: "Netaji Subhas Chandra Bose International Airport", city: "Kolkata", latitude: 22.6547, longitude: 88.4467 },
  { icao: "VOHS", iata: "HYD", name: "Rajiv Gandhi International Airport", city: "Hyderabad", latitude: 17.24, longitude: 78.4294 },
  { icao: "VAAH", iata: "AMD", name: "Sardar Vallabhbhai Patel International Airport", city: "Ahmedabad", latitude: 23.0732, longitude: 72.6347 },
  { icao: "VOCI", iata: "COK", name: "Cochin International Airport", city: "Kochi", latitude: 10.152, longitude: 76.4019 },
  { icao: "VOPN", iata: "PNQ", name: "Pune Airport", city: "Pune", latitude: 18.5822, longitude: 73.9197 },
]



