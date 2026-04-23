import { useForm } from "react-hook-form";
import { FormInput, LocationInput } from "../../../components";
import { yupResolver } from "@hookform/resolvers/yup";
import { eventSchema, type EventSchema } from "../schemas/eventSchema";
import { useAddEventMutation } from "../service/eventApiSlice";
import { useParams } from "react-router";
import { isValidationError } from "../../api/utils";
import { useState } from "react";

export default function AddEventForm({ date }: { date: string }) {
  const [errorMessage, setErrorMessage] = useState("");

  const { tripId } = useParams();
  const [addEvent, { isLoading }] = useAddEventMutation();
  const { register, formState, handleSubmit, setError, setValue } = useForm({
    resolver: yupResolver(eventSchema),
  });

  const addressInputProps = register("address");
  const [key, setKey] = useState(0);

  async function onSubmit(formState: EventSchema) {
    const event = {
      ...formState,
      startAt: `${date} ${formState.startAt}`,
      endAt: `${date} ${formState.endAt}`,
    };
    setErrorMessage("");
    try {
      await addEvent({ tripId: Number(tripId), event }).unwrap();
      setValue("address", "");
      setValue("name", "");
      setValue("longitude", 0);
      setValue("latitude", 0);
      setValue("startAt", "");
      setValue("endAt", "");
      setKey((prev) => prev + 1);
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
        className="flex gap-4 lg:items-end flex-col lg:flex-row mb-2"
        onSubmit={handleSubmit(onSubmit)}
      >
        <LocationInput
          key={key}
          label="Address"
          {...addressInputProps}
          errorMessage={formState.errors.address?.message}
          classNames="flex-1"
          onPlaceSelect={(place) => {
            setValue("address", place.formatted_address ?? "");
            setValue("name", place.name ?? "");
            setValue("latitude", place.geometry?.location?.lat() ?? 0);
            setValue("longitude", place.geometry?.location?.lng() ?? 0);
          }}
        />
        <div className="flex gap-4 items-end">
          <FormInput
            type="time"
            label="Start Time"
            {...register("startAt")}
            errorMessage={formState.errors.startAt?.message}
            formClassNames="flex-1 lg:flex-[0.15]"
          />

          <FormInput
            type="time"
            label="End Time"
            {...register("endAt")}
            errorMessage={formState.errors.endAt?.message}
            formClassNames="flex-1 lg:flex-[0.15]"
          />
        </div>
        <button className="btn-primary h-12 mt-2" disabled={isLoading}>
          Add
        </button>
      </form>
      {errorMessage && <p className="mt-2 errorMessage">{errorMessage}</p>}
    </>
  );
}
