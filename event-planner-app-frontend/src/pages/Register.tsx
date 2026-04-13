import { yupResolver } from "@hookform/resolvers/yup";
import { FormInput } from "../components";
import { useForm } from "react-hook-form";
import { registerSchema, type RegisterSchema } from "../schemas/authSchema";
import { useRegisterUserMutation } from "../features/auth/authApiSlice";
import { isValidationError } from "../features/api/utils";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { setCredentials } from "../features/auth/authSlice";

export default function Register() {
  const [registerUser, result] = useRegisterUserMutation();
  const { formState, register, handleSubmit, setError } = useForm({
    resolver: yupResolver(registerSchema),
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onSubmit = async (formState: RegisterSchema) => {
    try {
      const payload = await registerUser(formState).unwrap();
      dispatch(setCredentials(payload.data.userId));

      navigate("/trips");
    } catch (err) {
      console.log(err);
      if (isValidationError(err)) {
        console.error(err.data.error);
        const serverErrors = err.data.error;

        Object.entries(serverErrors).forEach(([key, messages]) => {
          setError(key as keyof RegisterSchema, {
            type: "server",
            message: messages[0],
          });
        });
      }
    }
  };

  return (
    <div className="card">
      <h1 className="title">Register</h1>
      <form className="form" onSubmit={handleSubmit(onSubmit)}>
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
        <FormInput
          type="password"
          label="Password"
          {...register("password")}
          errorMessage={formState.errors.password?.message}
        />
        <FormInput
          type="password"
          label="Repeat Password"
          {...register("repeatPassword")}
          errorMessage={formState.errors.repeatPassword?.message}
        />
        <button className="btn-primary" disabled={result.isLoading}>
          Register
        </button>
      </form>
    </div>
  );
}
