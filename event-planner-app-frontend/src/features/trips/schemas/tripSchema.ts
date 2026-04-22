import * as yup from "yup";

export const tripSchema = yup.object({
  name: yup.string().trim().required("Name is required."),
  destination: yup.string().trim().required("Destination is required."),
  longitude: yup.number().required("Required."),
  latitude: yup.number().required("Required."),
  description: yup.string().trim().nullable(),
  startDate: yup.string().required("Start date is required."),
  endDate: yup
    .string()
    .required("End date is required.")
    .test(
      "end-after-start",
      "End date must be after start date.",
      function (value) {
        return new Date(value) > new Date(this.parent.startDate);
      },
    ),
});

export type TripSchema = yup.InferType<typeof tripSchema>;
