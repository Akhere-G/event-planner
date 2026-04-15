import * as yup from "yup";
import { type InferType } from "yup";

export const registerSchema = yup.object({
  username: yup
    .string()
    .required("Username is required.")
    .max(50, "Username must be 50 characters or less."),
  email: yup
    .string()
    .required("Email is required.")
    .max(50, "Email must be 50 characters or less.")
    .email("Not a valid email address."),
  password: yup
    .string()
    .required("Password is required.")
    .max(50, "Password must be 50 characters or less.")
    .min(8, "Password must be 8 characters or more.")
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d).+$/,
      "Password must contain letters and numbers.",
    ),
  repeatPassword: yup
    .string()
    .required("Repeat Password is required.")
    .test("passwords-match", "Passwords must match", function (value) {
      return this.parent.password === value;
    }),
});

export type RegisterSchema = InferType<typeof registerSchema>;

export const loginSchema = yup.object({
  email: yup.string().required("Email is required.").email(),
  password: yup.string().required("Password is required."),
});

export type LoginSchema = InferType<typeof loginSchema>;
