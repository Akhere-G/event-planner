import { useForm } from "react-hook-form";
import { FormInput, PasswordInput } from "../components";
import { useLoginUserMutation } from "../features/auth/services/authApiSlice";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  loginSchema,
  type LoginSchema,
} from "../features/auth/schemas/authSchema";
import { isValidationError } from "../features/api/utils";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router";
import { setCredentials } from "../features/auth/services/authSlice";
import { toast } from "sonner";

export default function Login() {
  const [errorMessage, setErrorMessage] = useState("");
  const [loginUser, result] = useLoginUserMutation();
  const { register, handleSubmit, formState, setError } = useForm({
    resolver: yupResolver(loginSchema),
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const location = useLocation();
  const from = location.state?.from || "/";

  const onSubmit = async (formData: LoginSchema) => {
    setErrorMessage("");
    try {
      const formattedFormData = {
        ...formData,
        email: formData.email.toLowerCase(),
      };
      const result = await loginUser(formattedFormData).unwrap();
      dispatch(setCredentials(result.data.userId));

      navigate(from, { replace: true });
    } catch (err) {
      if (isValidationError(err)) {
        const serverErrors = err.data.error;

        setErrorMessage(serverErrors.general?.join(", ") ?? "");

        Object.entries(serverErrors).forEach(([k, messages]) => {
          setError(k as keyof LoginSchema, {
            type: "server",
            message: messages[0],
          });
        });
      } else {
        toast.error("Sorry! Something went wrong...");
      }
    }
  };
  return (
    <div className="container">
      <div className="card">
        <h2 className="title mb-6">Login</h2>
        <form className="form" onSubmit={handleSubmit(onSubmit)}>
          {errorMessage && <p className="errorMessage">{errorMessage}</p>}

          <FormInput
            label="Email"
            errorMessage={formState.errors.email?.message}
            {...register("email")}
          />
          <PasswordInput
            errorMessage={formState.errors.password?.message}
            label="Password"
            {...register("password")}
          />
          <button className="btn-primary mt-2" disabled={result.isLoading}>
            Login
          </button>
          <Link to="/register" state={{ from }}>
            New here? Create an Account.
          </Link>
        </form>
      </div>
    </div>
  );
}
