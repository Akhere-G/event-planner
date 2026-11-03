export interface Flight {
  id: number;
  itineraryId: number;
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTimezone: string;
  arrivalTimezone: string;
  departAt: string;
  arriveAt: string;
  bookingRef?: string | null;
  seat?: string | null;
  notes?: string | null;
  travellers: number[];
  status?: string | null;
  statusUpdatedAt?: string | null;
  terminal?: string | null;
  gate?: string | null;
}

export interface FlightInput {
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTimezone: string;
  arrivalTimezone: string;
  departAt: string;
  arriveAt: string;
  bookingRef?: string | null;
  seat?: string | null;
  notes?: string | null;
  travellers: number[];
}

export interface CreateFlightPayload extends FlightInput {
  tripId: number;
}

export interface UpdateFlightPayload extends Partial<FlightInput> {
  tripId: number;
  flightId: number;
}

export interface DeleteFlightPayload {
  tripId: number;
  flightId: number;
}
