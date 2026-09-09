import { yupResolver } from "@hookform/resolvers/yup";
import { FormInput, PasswordInput } from "../components";
import { useForm } from "react-hook-form";
import {
  registerSchema,
  type RegisterSchema,
} from "../features/auth/schemas/authSchema";
import { useRegisterUserMutation } from "../features/auth/services/authApiSlice";
import { isValidationError } from "../features/api/utils";
import { Link, useLocation, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { setCredentials } from "../features/auth/services/authSlice";
import { useState } from "react";
import { toast } from "sonner";
import { usePostHog } from "@posthog/react";

export default function Register() {
  const [errorMessage, setErrorMessage] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [registerUser, result] = useRegisterUserMutation();
  const { formState, register, handleSubmit, setError } = useForm({
    resolver: yupResolver(registerSchema),
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const location = useLocation();
  const from = location.state?.from || "/";
  const posthog = usePostHog();

  const onSubmit = async (formData: RegisterSchema) => {
    setErrorMessage("");

    if (!agreedToTerms) {
      toast.error(
        "Please agree to the Terms and Conditions and Privacy Policy before registering.",
      );
      return;
    }

    try {
      const formattedFormData = {
        ...formData,
        email: formData.email.toLowerCase(),
      };
      const result = await registerUser(formattedFormData).unwrap();
      dispatch(setCredentials(result.data.id));
      posthog?.capture("user_registered", {
        user_id: result.data.id,
        email: result.data.email,
        username: result.data.username,
        signup_method: "email",
      });

      navigate(from, { replace: true });
    } catch (err) {
      if (isValidationError(err)) {
        const serverErrors = err.data.error;
        if (typeof serverErrors == "string")
          setErrorMessage(serverErrors ?? "");

        Object.entries(serverErrors).forEach(([key, messages]) => {
          setError(key as keyof RegisterSchema, {
            type: "server",
            message: messages[0],
          });
        });
      } else {
        posthog?.captureException(err);
        toast.error("Sorry! Something went wrong...");
      }
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2 className="title mb-6">Register</h2>
        <form className="form" onSubmit={handleSubmit(onSubmit)}>
          {errorMessage && <p className="errorMessage">{errorMessage}</p>}

          <FormInput
            label="Username"
            {...register("username")}
            errorMessage={formState.errors.username?.message}
          />
          <FormInput
            label="Email"
            {...register("email")}
            errorMessage={formState.errors.email?.message}
          />
          <PasswordInput
            label="Password"
            {...register("password")}
            errorMessage={formState.errors.password?.message}
            data-testId="password"
          />
          <PasswordInput
            label="Repeat Password"
            {...register("repeatPassword")}
            errorMessage={formState.errors.repeatPassword?.message}
            data-testId="repeatPassword"
          />
          <label className="flex items-start gap-3 text-sm ">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-surface-border text-brand-primary focus:ring-brand-primary"
            />
            <span>
              I agree to the{" "}
              <Link
                to="/terms"
                target="_blank"
                className="font-semibold text-brand-primary underline underline-offset-2"
              >
                Terms and Conditions
              </Link>{" "}
              and{" "}
              <Link
                to="/privacy"
                target="_blank"
                className="font-semibold text-brand-primary underline underline-offset-2"
              >
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          <button className="btn-primary mt-2" disabled={result.isLoading}>
            Register
          </button>
          <Link to="/login">Have an account? Login.</Link>
        </form>
      </div>
    </div>
  );
}
