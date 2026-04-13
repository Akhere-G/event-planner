import * as yup from "yup";
import { type InferType } from "yup";

export const registerSchema = yup.object({
  username: yup.string().required().max(50),
  email: yup.string().required().max(50).email(),
  password: yup
    .string()
    .required()
    .max(50)
    .min(8)
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d).+$/,
      "Password must contain letters and numbers.",
    ),
  repeatPassword: yup
    .string()
    .required()
    .test("passwords-match", "Passwords must match", function (value) {
      return this.parent.password === value;
    }),
});

export type RegisterSchema = InferType<typeof registerSchema>;
