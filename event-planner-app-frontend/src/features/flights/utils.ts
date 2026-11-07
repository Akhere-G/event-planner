import { formatInTimeZone } from "date-fns-tz";
import type { ExpensePrefill } from "../expenses/types";
import type { Flight } from "./types";

export const flightDepartureDate = (flight: Flight) =>
  formatInTimeZone(flight.departAt, flight.departureTimezone, "yyyy-MM-dd");

export const flightArrivalDate = (flight: Flight) =>
  formatInTimeZone(flight.arriveAt, flight.arrivalTimezone, "yyyy-MM-dd");

export const formatFlightTime = (utc: string, timeZone: string) =>
  formatInTimeZone(utc, timeZone, "HH:mm");

export const flightTitle = (flight: Flight) =>
  `${flight.airline}${flight.flightNumber} ${flight.departureAirport} → ${flight.arrivalAirport}`;

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

/** Every flight we show is nonstop; luggage notes follow when Google lists any. */
export const directFlightSummary = (luggage: string[]) =>
  ["Direct flight", ...luggage].join(" · ");
