import * as yup from "yup";

const departureDate = yup
  .string()
  .required("Departure date is required.")
  .matches(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid departure date.");

export const flightSearchSchema = yup.object({
  origin: yup
    .array()
    .of(yup.string().defined())
    .min(1, "Required.")
    .required("Required."),
  destination: yup
    .array()
    .of(yup.string().defined())
    .min(1, "Required.")
    .required("Required."),
  departureDate,
});

export type FlightSearchSchema = yup.InferType<typeof flightSearchSchema>;

/** An airline code has two characters, at least one of them a letter. */
const FLIGHT_CODE =
  /^(?=[A-Za-z0-9]?[A-Za-z])[A-Za-z0-9]{2}\s?\d{1,4}[A-Za-z]?$/;

export const flightNumberSearchSchema = yup.object({
  flightCode: yup
    .string()
    .trim()
    .required("Flight number is required.")
    .matches(FLIGHT_CODE, "Enter a flight number like BA117."),
  departureDate,
});

export type FlightNumberSearchSchema = yup.InferType<
  typeof flightNumberSearchSchema
>;
