import { useForm } from "react-hook-form";
import { FormInput } from "../../../components";
import { inviteSchema, type InviteSchema } from "../schemas/inviteSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { UserRole } from "../../users/types";

export default function InviteUserForm() {
  const { register, formState, handleSubmit } = useForm({
    resolver: yupResolver(inviteSchema),
  });

  async function onSubmit(formState: InviteSchema) {
    console.log(formState);
  }

  return (
    <form
      className="flex gap-4 md:items-end flex-col md:flex-row mb-3"
      onSubmit={handleSubmit(onSubmit)}
    >
      <FormInput
        label="Email"
        {...register("email")}
        errorMessage={formState.errors.email?.message}
        formClassNames="flex-4/5"
      />
      <FormInput
        label="Role"
        {...register("role")}
        errorMessage={formState.errors.role?.message}
        options={Object.values(UserRole).map((role) => ({
          value: role,
          name: role[0].toUpperCase() + role.substring(1),
        }))}
        formClassNames="flex-1/5 min-w-22"
      />
      <button className="btn-primary h-11">Add</button>
    </form>
  );
}
