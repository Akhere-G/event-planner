import { differenceInMinutes, format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import type { ExpensePrefill } from "../expenses/types";
import type { Trip } from "../trips/types";
import type {
  Flight,
  FlightJourney,
  FlightLegCode,
  FlightOffer,
} from "./types";

export const todayDate = () => format(new Date(), "yyyy-MM-dd");

/** Searches start on the trip's first day, or today once the trip has begun. */
export const defaultDepartureDate = (trip: Trip) =>
  trip.startDate >= todayDate() ? trip.startDate : todayDate();

export const flightDepartureDate = (flight: Flight) =>
  formatInTimeZone(flight.departAt, flight.departureTimezone, "yyyy-MM-dd");

export const flightArrivalDate = (flight: Flight) =>
  formatInTimeZone(flight.arriveAt, flight.arrivalTimezone, "yyyy-MM-dd");

export const formatFlightTime = (utc: string, timeZone: string) =>
  formatInTimeZone(utc, timeZone, "HH:mm");

export const flightTitle = (flight: Flight) =>
  `${flight.airline}${flight.flightNumber} ${flight.departureAirport} → ${flight.arrivalAirport}`;

export const flightCardId = (flightId: number) => `flight-card-${flightId}`;

const placeLabel = (
  code: string,
  city?: string | null,
  name?: string | null,
) => {
  const place = city ? `${city} (${code})` : code;
  return name ? `${place}, ${name}` : place;
};

const endpointLine = (
  label: string,
  utc: string,
  timeZone: string,
  place: string,
) =>
  `${label}: ${formatInTimeZone(utc, timeZone, "EEE d MMM yyyy, HH:mm")} · ${place}`;

/** Plain text a user can paste into a message to share the flight. */
export const flightDetailsText = (flight: Flight) => {
  const lines = [
    flightTitle(flight),
    endpointLine(
      "Departs",
      flight.departAt,
      flight.departureTimezone,
      placeLabel(
        flight.departureAirport,
        flight.departureCity,
        flight.departureAirportName,
      ),
    ),
    endpointLine(
      "Arrives",
      flight.arriveAt,
      flight.arrivalTimezone,
      placeLabel(
        flight.arrivalAirport,
        flight.arrivalCity,
        flight.arrivalAirportName,
      ),
    ),
    `Duration: ${formatDuration(flightDurationMinutes(flight))}`,
  ];
  if (flight.travelClass) lines.push(`Class: ${flight.travelClass}`);
  if (flight.notes) lines.push(`Notes: ${flight.notes}`);
  return lines.join("\n");
};

/** What the Add expense form starts with for a flight that has no expense. */
export const flightExpensePrefill = (flight: Flight): ExpensePrefill => ({
  flightId: flight.id,
  description: `${flight.airline}${flight.flightNumber} · ${flight.departureAirport} → ${flight.arrivalAirport}`,
  category: "transport",
  spentOn: flightDepartureDate(flight),
});

/** A flight appears on the day it departs, and on the day it lands if that differs. */
export const getFlightsForDay = (flights: Flight[], date: string) =>
  flights.filter(
    (flight) =>
      flightDepartureDate(flight) === date ||
      flightArrivalDate(flight) === date,
  );

export const flightDurationMinutes = (flight: Flight) =>
  Math.round(
    (new Date(flight.arriveAt).getTime() -
      new Date(flight.departAt).getTime()) /
      60000,
  );

export const formatDuration = (minutes: number) =>
  `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;

export const formatGbp = (amount: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(amount);

/** Every saved flight is a single nonstop leg; luggage notes follow when listed. */
export const directFlightSummary = (luggage: string[]) =>
  ["Direct flight", ...luggage].join(" · ");

const stopsLabel = (stops: number) => {
  if (stops === 0) return "Direct flight";
  return stops === 1 ? "1 stop" : `${stops} stops`;
};

export const connectorLabel = (stops: number) =>
  stops === 0 ? "Non-stop" : stopsLabel(stops);

/** Where the plane changes, e.g. "Via Beijing (PEK)"; empty for a nonstop flight. */
export const journeyVia = (journey: FlightJourney) => {
  const stopovers = journey.legs
    .slice(0, -1)
    .map(
      (leg) =>
        `${leg.arrivalCity ?? leg.arrivalAirport} (${leg.arrivalAirport})`,
    );
  return stopovers.length > 0 ? `Via ${stopovers.join(", ")}` : "";
};

export const journeyFlightCodes = (journey: FlightJourney) =>
  journey.legs.map((leg) => `${leg.airline}${leg.flightNumber}`).join(" + ");

export const journeySummary = (journey: FlightJourney) =>
  [stopsLabel(journey.stops), ...journey.legs[0].luggage].join(" · ");

export const journeyLegCodes = (journey: FlightJourney): FlightLegCode[] =>
  journey.legs.map(({ airline, flightNumber }) => ({ airline, flightNumber }));

export const journeyKey = (journey: FlightJourney) =>
  journey.legs
    .map((leg) => `${leg.airline}${leg.flightNumber}@${leg.departAt}`)
    .join("|");

export const layoverMinutes = (arriving: FlightOffer, departing: FlightOffer) =>
  differenceInMinutes(
    new Date(departing.departAt),
    new Date(arriving.arriveAt),
  );

export const isLegSaved = (flights: Flight[], leg: FlightOffer) =>
  flights.some(
    (flight) =>
      flight.airline === leg.airline &&
      flight.flightNumber === leg.flightNumber &&
      new Date(flight.departAt).getTime() === new Date(leg.departAt).getTime(),
  );

export const isJourneySaved = (flights: Flight[], journey: FlightJourney) =>
  journey.legs.every((leg) => isLegSaved(flights, leg));
