import { useForm } from "react-hook-form";
import { FormInput } from "../components";
import { useLoginUserMutation } from "../features/auth/services/authApiSlice";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  loginSchema,
  type LoginSchema,
} from "../features/auth/schemas/authSchema";
import { isValidationError } from "../features/api/utils";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router";
import { setCredentials } from "../features/auth/services/authSlice";

export default function Login() {
  const [errorMessage, setErrorMessage] = useState("");
  const [loginUser, result] = useLoginUserMutation();
  const { register, handleSubmit, formState, setError } = useForm({
    resolver: yupResolver(loginSchema),
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (formData: LoginSchema) => {
    setErrorMessage("");
    try {
      const result = await loginUser(formData).unwrap();
      dispatch(setCredentials(result.data.userId));
      navigate("/");
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
          <FormInput
            errorMessage={formState.errors.password?.message}
            label="Password"
            type="password"
            {...register("password")}
          />
          <button className="btn-primary mt-2" disabled={result.isLoading}>
            Login
          </button>
          <Link to="/register">New here? Create an Account.</Link>
        </form>
      </div>
    </div>
  );
}
