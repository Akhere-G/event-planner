import * as yup from "yup";
import { TEMPLATE_REGIONS } from "../constants";

export const cloneTemplateSchema = yup.object({
  startDate: yup
    .string()
    .required("Start date is required.")
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Start date must be a valid date."),
});

export type CloneTemplateSchema = yup.InferType<typeof cloneTemplateSchema>;

export const publishTemplateSchema = yup.object({
  title: yup.string().trim().max(255, "Title is too long.").default(""),
  description: yup
    .string()
    .trim()
    .max(2000, "Description is too long.")
    .default(""),
  region: yup
    .string()
    .oneOf<string>([...TEMPLATE_REGIONS], "Choose a region.")
    .required("Choose a region."),
});

export type PublishTemplateSchema = yup.InferType<typeof publishTemplateSchema>;
