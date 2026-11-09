// Place suggestions are biased towards this point, so nearby places come first.
// Currently Delhi NCR. Change lat/lon to your own city if you like.
export const PLACE_SEARCH_BIAS = { lat: 28.6139, lon: 77.209 }

export const MAX_SEARCH_PASSENGERS = 6

// Vehicle types, and how many PASSENGER seats each can offer (the driver is not counted).
// These are the same limits the backend enforces.
export const VEHICLE_TYPES = [
  { value: 'car', label: 'Car' },
  { value: 'bike', label: 'Bike or scooter' },
  { value: 'auto', label: 'Auto-rickshaw' },
  { value: 'van', label: 'Van' },
]
export const MAX_PASSENGERS = { bike: 1, auto: 3, car: 7, van: 12 }