import * as yup from "yup";

export const flightSearchSchema = yup.object({
  origin: yup
    .array()
    .of(yup.string().defined())
    .min(1, "Choose a departure airport.")
    .required("Choose a departure airport."),
  destination: yup
    .array()
    .of(yup.string().defined())
    .min(1, "Choose an arrival airport.")
    .required("Choose an arrival airport."),
  departureDate: yup
    .string()
    .required("Departure date is required.")
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid departure date."),
});

export type FlightSearchSchema = yup.InferType<typeof flightSearchSchema>;
