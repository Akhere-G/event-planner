import { useForm } from "react-hook-form";
import { FormInput, FormSelect } from "../../../components";
import { inviteSchema, type InviteSchema } from "../schemas/inviteSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { UserRole } from "../../users/types";
import { useCreateInviteMutation } from "../services/inviteApiSlice";
import { useMatch } from "react-router";
import { isValidationError } from "../../api/utils";
import { useState } from "react";

export default function InviteUserForm() {
  const [errorMessage, setErrorMessage] = useState("");

  const params = useMatch("/trips/:tripId")?.params;
  const tripId = Number(params?.tripId);

  const [createInvite] = useCreateInviteMutation();
  const { register, formState, handleSubmit, setError } = useForm({
    resolver: yupResolver(inviteSchema),
  });

  async function onSubmit(invite: InviteSchema) {
    const formattedInvite = {
      ...invite,
      email: invite.email.toLowerCase(),
    };
    try {
      createInvite({ tripId, invite: formattedInvite }).unwrap();
    } catch (err) {
      if (isValidationError(err)) {
        const serverErrors = err.data.error;

        setErrorMessage(serverErrors.general?.join(", ") ?? "");

        Object.entries(serverErrors).forEach(([key, messages]) => {
          setError(key as keyof InviteSchema, {
            type: "server",
            message: messages[0],
          });
        });
      }
    }
  }

  return (
    <form
      className="flex gap-4 md:items-end flex-col md:flex-row mb-3"
      onSubmit={handleSubmit(onSubmit)}
    >
      {errorMessage && <p className="errorMessage">{errorMessage}</p>}
      <FormInput
        label="Email"
        {...register("email")}
        errorMessage={formState.errors.email?.message}
        formClassNames="flex-4/5"
      />
      <FormSelect
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
