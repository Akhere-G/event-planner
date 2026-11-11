import * as yup from "yup";
import { MAX_TRIP_PROMPT_LENGTH } from "../constants";

export const tripPromptSchema = yup.object({
  prompt: yup
    .string()
    .trim()
    .required("Describe the trip you'd like.")
    .max(
      MAX_TRIP_PROMPT_LENGTH,
      `Keep it under ${MAX_TRIP_PROMPT_LENGTH} characters.`,
    ),
});

export type TripPromptValues = yup.InferType<typeof tripPromptSchema>;
