import * as yup from "yup";

export const chatMessageSchema = (maxLength: number) =>
  yup.object({
    message: yup
      .string()
      .trim()
      .required("Type a message.")
      .max(maxLength, `Keep it under ${maxLength} characters.`),
  });

export type ChatMessageForm = yup.InferType<
  ReturnType<typeof chatMessageSchema>
>;
