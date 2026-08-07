import * as yup from "yup";

export const accommodationSchema = yup.object({
  name: yup.string().trim().required("Name is required."),
  address: yup.string().trim().required("Address is required."),
  latitude: yup.number().required(),
  longitude: yup.number().required(),
  description: yup.string().trim().optional().default(""),
  startDate: yup
    .string()
    .required("Start date is required.")
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  endDate: yup
    .string()
    .required("End date is required.")
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    .test(
      "is-after",
      "End date cannot be earlier than start date",
      function (value) {
        const { startDate } = this.parent;
        if (!startDate || !value) return true;
        return new Date(value) >= new Date(startDate);
      },
    ),
});

export type AccommodationSchema = yup.InferType<typeof accommodationSchema>;
