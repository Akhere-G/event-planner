export interface Flight {
  id: number;
  itineraryId: number;
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTimezone: string;
  arrivalTimezone: string;
  departureLatitude: number;
  departureLongitude: number;
  arrivalLatitude: number;
  arrivalLongitude: number;
  departAt: string;
  arriveAt: string;
  notes?: string | null;
}

export interface Airport {
  code: string;
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

/** A city and the airports that serve it. */
export interface AirportPlace {
  label: string;
  airports: Airport[];
  distanceKm?: number | null;
}

export interface FlightOffer {
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTimezone: string;
  arrivalTimezone: string;
  departAt: string;
  arriveAt: string;
  durationMinutes: number;
  price?: number | null;
  airlineLogo?: string | null;
}

export interface FlightSearchParams {
  origin: string[];
  destination: string[];
  departureDate: string;
}

export interface SearchFlightsPayload extends FlightSearchParams {
  tripId: number;
}

export interface SearchAirportsPayload {
  tripId: number;
  q: string;
  lat?: number;
  lng?: number;
}

export interface CreateFlightPayload extends FlightSearchParams {
  tripId: number;
  airline: string;
  flightNumber: string;
  notes?: string | null;
}

export interface DeleteFlightPayload {
  tripId: number;
  flightId: number;
}
