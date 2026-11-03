import { addMinutes, format } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import type { Flight } from "./types";

const LOCAL_INPUT_FORMAT = "yyyy-MM-dd'T'HH:mm";

/** Converts a `datetime-local` value in the given IANA zone to a UTC ISO string. */
export const localInputToUtc = (value: string, timeZone: string) =>
  fromZonedTime(value, timeZone).toISOString();

/** Converts a UTC ISO string to a `datetime-local` value in the given IANA zone. */
export const utcToLocalInput = (utc: string, timeZone: string) =>
  formatInTimeZone(utc, timeZone, LOCAL_INPUT_FORMAT);

export const flightDepartureDate = (flight: Flight) =>
  formatInTimeZone(flight.departAt, flight.departureTimezone, "yyyy-MM-dd");

export const flightArrivalDate = (flight: Flight) =>
  formatInTimeZone(flight.arriveAt, flight.arrivalTimezone, "yyyy-MM-dd");

export const formatFlightTime = (utc: string, timeZone: string) =>
  formatInTimeZone(utc, timeZone, "HH:mm");

export const flightTitle = (flight: Flight) =>
  `${flight.flightNumber} ${flight.departureAirport} → ${flight.arrivalAirport}`;

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

export const defaultFlightLocalTimes = (date: string) => ({
  depart: format(new Date(`${date}T09:00`), LOCAL_INPUT_FORMAT),
  arrive: format(
    addMinutes(new Date(`${date}T09:00`), 120),
    LOCAL_INPUT_FORMAT,
  ),
});

export const supportedTimeZones = (): string[] =>
  typeof Intl.supportedValuesOf === "function"
    ? Intl.supportedValuesOf("timeZone")
    : [];
