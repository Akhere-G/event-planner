/** Details shared by a flight we found (offer) and one that was saved. */
export interface FlightDetails {
  departureAirportName: string | null;
  departureCity: string | null;
  arrivalAirportName: string | null;
  arrivalCity: string | null;
  airlineLogo?: string | null;
  travelClass?: string | null;
  luggage: string[];
  extras: string[];
  purchaseUrl?: string | null;
  priceGbp?: number | null;
}

export interface Flight extends FlightDetails {
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

export interface FlightOffer extends FlightDetails {
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTimezone: string;
  arrivalTimezone: string;
  departAt: string;
  arriveAt: string;
  durationMinutes: number;
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
