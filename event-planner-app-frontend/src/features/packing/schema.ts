import * as yup from "yup";

export const packingItemSchema = yup.object({
  name: yup.string().trim().required("Item name is required"),
  category: yup.string().trim().required("Category is required"),
  isShared: yup.bool().default(false),
});

export type PackingitemSchema = yup.InferType<typeof packingItemSchema>;
