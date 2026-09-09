import { useForm } from "react-hook-form";
import { FormInput, LocationInput } from "../../../components";
import { yupResolver } from "@hookform/resolvers/yup";
import { updateEventSchema, type EventSchema } from "../schemas/eventSchema";
import { useUpdateEventMutation } from "../service/eventApiSlice";
import { useParams } from "react-router";
import { isValidationError } from "../../api/utils";
import { useEffect, useState } from "react";
import { useGetTripQuery } from "../../trips/services/tripsApiSlice";
import { toast } from "sonner";
import { getCityBounds } from "../../maps/utils";
import type { Event } from "../types";
import { usePostHog } from "@posthog/react";

export default function UpdateEventFormView({
  initialEvent,
  onClose,
}: {
  initialEvent: Event;
  onClose: () => void;
}) {
  const [errorMessage, setErrorMessage] = useState("");

  const tripId = Number(useParams()?.tripId);

  const { data } = useGetTripQuery(Number(tripId));
  const trip = data?.data;

  const [updateEvent, { isLoading: isUpdateLoading }] =
    useUpdateEventMutation();

  const { register, formState, handleSubmit, setError, setValue } = useForm({
    resolver: yupResolver(updateEventSchema),
  });
  const posthog = usePostHog();
  const addressInputProps = register("address");
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (!initialEvent) return;
    setValue("address", initialEvent.address);
    setValue("name", initialEvent.name);
    setValue("longitude", initialEvent.longitude);
    setValue("latitude", initialEvent.latitude);
    setValue("startAt", initialEvent.startAt);
    setValue("endAt", initialEvent.endAt);
  }, [initialEvent, setValue]);

  async function onSubmit(formState: EventSchema) {
    if (!trip) return;
    setErrorMessage("");
    try {
      await updateEvent({
        tripId: Number(tripId),
        eventId: initialEvent.id,
        updatedEvent: formState,
        timezone: trip.timezone,
      }).unwrap();
      setValue("address", "");
      setValue("name", "");
      setValue("longitude", 0);
      setValue("latitude", 0);
      setValue("startAt", "");
      setValue("endAt", "");
      setKey((prev) => prev + 1);
      onClose();
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
      } else {
        posthog?.captureException(err);

        toast.error("Sorry! Something went wrong...");
      }
    }
  }

  if (!trip) return null;

  const cityBounds = getCityBounds(trip);

  return (
    <>
      <form
        className="flex gap-4 px-1 flex-col"
        onSubmit={handleSubmit(onSubmit)}
      >
        <LocationInput
          key={key}
          initialValue={initialEvent.address}
          label="Address"
          {...addressInputProps}
          errorMessage={formState.errors.address?.message}
          formClassNames="flex-1"
          cityBounds={cityBounds}
          onPlaceSelect={(place) => {
            setValue("address", place.formatted_address ?? "");
            setValue("name", place.name ?? "");
            setValue("latitude", place.geometry?.location?.lat() ?? 0);
            setValue("longitude", place.geometry?.location?.lng() ?? 0);
          }}
        />

        <FormInput
          label="Name"
          {...register("name")}
          errorMessage={formState.errors.name?.message}
          formClassNames="flex-1 lg:flex-[0.15]"
        />
        <div className="flex gap-4 flex-col lg:items-end lg:flex-row">
          <FormInput
            type="datetime-local"
            label="Start Time"
            {...register("startAt")}
            errorMessage={formState.errors.startAt?.message}
            formClassNames="flex-1 "
          />

          <FormInput
            type="datetime-local"
            label="End Time"
            {...register("endAt")}
            errorMessage={formState.errors.endAt?.message}
            formClassNames="flex-1"
          />
        </div>
        <button className="btn-primary h-12 mt-2" disabled={isUpdateLoading}>
          Update
        </button>
      </form>
      {errorMessage && <p className="mt-2 errorMessage">{errorMessage}</p>}
    </>
  );
}
