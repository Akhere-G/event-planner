import { useForm } from "react-hook-form";
import { FormInput } from "../../../components";
import { yupResolver } from "@hookform/resolvers/yup";
import { eventSchema, type EventSchema } from "../schemas/eventSchema";
import { useAddEventMutation } from "../service/eventApiSlice";
import { useParams } from "react-router";
import { isValidationError } from "../../api/utils";
import { useState } from "react";

const defaultEventValues = {
  location: "",
  startAt: "",
  endAt: "",
  category: "General",
};

export default function AddEventForm({ date }: { date: string }) {
  const [errorMessage, setErrorMessage] = useState("");

  const { tripId } = useParams();
  const [addEvent, { isLoading }] = useAddEventMutation();
  const { register, formState, handleSubmit, setError, setValue } = useForm({
    resolver: yupResolver(eventSchema),
    defaultValues: defaultEventValues,
  });
  async function onSubmit(formState: EventSchema) {
    const event = {
      ...formState,
      startAt: `${date} ${formState.startAt}`,
      endAt: `${date} ${formState.endAt}`,
    };
    setErrorMessage("");
    try {
      await addEvent({ tripId: Number(tripId), event }).unwrap();
      setValue("location", "");
      setValue("startAt", "");
      setValue("endAt", "");
    } catch (err) {
      if (isValidationError(err)) {
        const serverErrors = err.data.error;

        setErrorMessage(serverErrors.general?.join(", ") ?? "");

        Object.entries(serverErrors).forEach(([k, messages]) => {
          setError(k as keyof EventSchema, {
            type: "server",
            message: messages[0],
          });
        });
      }
    }
  }
  return (
    <>
      <form
        className="flex gap-4 md:items-end flex-col md:flex-row"
        onSubmit={handleSubmit(onSubmit)}
      >
        <FormInput
          label="Location"
          {...register("location")}
          errorMessage={formState.errors.location?.message}
          formClassNames="flex-1"
          tooltipErrors
        />
        <div className="flex gap-4 items-end">
          <FormInput
            type="time"
            label="Start Time"
            {...register("startAt")}
            errorMessage={formState.errors.startAt?.message}
            formClassNames="flex-1 md:flex-[0.15]"
            tooltipErrors
          />
          <FormInput
            type="time"
            label="End Time"
            {...register("endAt")}
            errorMessage={formState.errors.endAt?.message}
            formClassNames="flex-1 md:flex-[0.15]"
            tooltipErrors
          />
        </div>
        <button className="btn-primary h-12" disabled={isLoading}>
          Add
        </button>
      </form>
      {errorMessage && <p className="mt-2 errorMessage">{errorMessage}</p>}
    </>
  );
}
