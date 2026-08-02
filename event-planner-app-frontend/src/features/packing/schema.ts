import * as yup from "yup";

export const packingItemSchema = yup.object({
  name: yup.string().trim().required(),
  category: yup.string().trim().required(),
  isShared: yup.bool().default(false),
});

export type PackingitemSchema = yup.InferType<typeof packingItemSchema>;
