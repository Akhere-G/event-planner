import { yupResolver } from "@hookform/resolvers/yup";
import { FormInput } from "../components";
import { useForm } from "react-hook-form";
import { registerSchema, type RegisterSchema } from "../schemas/authSchema";

export default function Register() {
  const { formState, register, handleSubmit } = useForm({
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = (formState: RegisterSchema) => {
    alert("registering user" + JSON.stringify(formState, null, 2));
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
        <button className="btn-primary">Register</button>
      </form>
    </div>
  );
}
