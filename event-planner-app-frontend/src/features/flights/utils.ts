import { formatInTimeZone } from "date-fns-tz";
import type { Flight } from "./types";

export const flightDepartureDate = (flight: Flight) =>
  formatInTimeZone(flight.departAt, flight.departureTimezone, "yyyy-MM-dd");

export const flightArrivalDate = (flight: Flight) =>
  formatInTimeZone(flight.arriveAt, flight.arrivalTimezone, "yyyy-MM-dd");

export const formatFlightTime = (utc: string, timeZone: string) =>
  formatInTimeZone(utc, timeZone, "HH:mm");

export const flightTitle = (flight: Flight) =>
  `${flight.airline}${flight.flightNumber} ${flight.departureAirport} → ${flight.arrivalAirport}`;

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
