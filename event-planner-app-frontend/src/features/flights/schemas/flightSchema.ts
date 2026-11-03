import * as yup from "yup";
import { fromZonedTime } from "date-fns-tz";

const iata = (label: string) =>
  yup
    .string()
    .trim()
    .uppercase()
    .required(`${label} airport is required.`)
    .matches(/^[A-Z]{3}$/, "Use a 3-letter IATA code, e.g. LHR.");

const timeZone = (label: string) =>
  yup
    .string()
    .trim()
    .required(`${label} timezone is required.`)
    .test(
      "is-timezone",
      "Use an IANA timezone, e.g. Europe/London.",
      (value) => {
        if (!value) return false;
        try {
          new Intl.DateTimeFormat("en", { timeZone: value });
          return true;
        } catch {
          return false;
        }
      },
    );

const localDateTime = (label: string) =>
  yup
    .string()
    .required(`${label} time is required.`)
    .matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Invalid date and time.");

export const flightSchema = yup.object({
  airline: yup.string().trim().required("Airline is required."),
  flightNumber: yup
    .string()
    .trim()
    .uppercase()
    .required("Flight number is required.")
    .matches(
      /^[A-Z0-9]{2,3}\s?\d{1,4}[A-Z]?$/,
      "Flight number must look like BA117.",
    ),
  departureAirport: iata("Departure"),
  arrivalAirport: iata("Arrival").test(
    "differs",
    "Arrival airport must differ from departure.",
    function (value) {
      return !value || value !== this.parent.departureAirport?.toUpperCase();
    },
  ),
  departureTimezone: timeZone("Departure"),
  arrivalTimezone: timeZone("Arrival"),
  departAt: localDateTime("Departure"),
  arriveAt: localDateTime("Arrival").test(
    "after-departure",
    "Arrival must be after departure.",
    function (value) {
      const { departAt, departureTimezone, arrivalTimezone } = this.parent;
      if (!value || !departAt || !departureTimezone || !arrivalTimezone) {
        return true;
      }
      try {
        const arrive = fromZonedTime(value, arrivalTimezone).getTime();
        const depart = fromZonedTime(departAt, departureTimezone).getTime();
        // Invalid timezones are reported by their own field tests.
        return Number.isNaN(arrive) || Number.isNaN(depart) || arrive > depart;
      } catch {
        return true;
      }
    },
  ),
  bookingRef: yup.string().trim().max(32).default(""),
  seat: yup.string().trim().max(16).default(""),
  notes: yup.string().trim().max(1000).default(""),
  travellers: yup.array(yup.number().required()).default([]),
});

export type FlightSchema = yup.InferType<typeof flightSchema>;
