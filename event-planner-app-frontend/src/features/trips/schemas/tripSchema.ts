import * as yup from "yup";

export const tripSchema = yup.object({
  name: yup.string().required("Name is required"),
  description: yup.string(),
  startDate: yup.string().required(),
  endDate: yup
    .string()
    .required()
    .test(
      "end-after-start",
      "End date must be after start date.",
      function (value) {
        return new Date(value) > new Date(this.parent.startDate);
      },
    ),
  // TODO: Add Location
});

export type TripSchema = yup.InferType<typeof tripSchema>;
