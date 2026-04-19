import * as yup from "yup";

export const inviteSchema = yup.object({
  email: yup
    .string()
    .email("Not a valid email.")
    .required("Email is required."),
  role: yup.string().oneOf(["admin", "editor", "viewer"]),
});

export type InviteSchema = yup.InferType<typeof inviteSchema>;
