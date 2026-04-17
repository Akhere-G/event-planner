import * as yup from "yup";

export const eventSchema = yup.object({
  location: yup.string().trim().required("Required."),

  startTime: yup
    .string()
    .required("Required.")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"),

  endTime: yup
    .string()
    .required("Required.")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format")

    .test("is-after", "Must be after start", function (value) {
      const { startTime } = this.parent;
      if (!startTime || !value) return true;
      return value > startTime;
    }),

  category: yup.string().default("General"),
});

export type EventSchema = yup.InferType<typeof eventSchema>;
