import * as yup from "yup";

export const eventSchema = yup.object({
  location: yup.string().trim().required("Required."),

  startAt: yup
    .string()
    .required("Required.")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"),

  endAt: yup
    .string()
    .required("Required.")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format")

    .test("is-after", "Set after start", function (value) {
      const { startAt } = this.parent;
      if (!startAt || !value) return true;
      return value > startAt;
    }),

  category: yup.string().default("General"),
});

export type EventSchema = yup.InferType<typeof eventSchema>;
