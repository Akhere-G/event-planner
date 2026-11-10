import type { Expense } from "../expenses/types";

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
  /** What the flight costs; absent when it has none (or the user deleted it). */
  expense?: Expense | null;
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

/** One leg of a journey: a single nonstop flight we found. */
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

/** A bookable trip: a nonstop flight, or several legs flown in order. */
export interface FlightJourney {
  legs: FlightOffer[];
  priceGbp?: number | null;
  purchaseUrl?: string | null;
  stops: number;
  totalDurationMinutes: number;
}

export interface FlightSearchParams {
  origin: string[];
  destination: string[];
  departureDate: string;
}

export interface SearchFlightsPayload extends FlightSearchParams {
  tripId: number;
}

/** A flight number such as "BA117", and the day it departs. */
export interface FlightNumberSearchParams {
  flightCode: string;
  departureDate: string;
}

export interface SearchByFlightNumberPayload extends FlightNumberSearchParams {
  tripId: number;
}

export interface CreateFlightsByNumberPayload extends FlightNumberSearchParams {
  tripId: number;
  notes?: string | null;
}

export interface SearchAirportsPayload {
  tripId: number;
  q: string;
  lat?: number;
  lng?: number;
}

export interface FlightLegCode {
  airline: string;
  flightNumber: string;
}

export interface CreateFlightPayload extends FlightSearchParams {
  tripId: number;
  legs: FlightLegCode[];
  notes?: string | null;
}

export interface DeleteFlightPayload {
  tripId: number;
  flightId: number;
}
