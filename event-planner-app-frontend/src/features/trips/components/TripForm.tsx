import {
  addMilliseconds,
  differenceInMilliseconds,
  format,
  isValid,
  parseISO,
} from "date-fns";
import { FormInput, LocationInput } from "../../../components";
import { isValidationError } from "../../api/utils";
import { tripSchema, type TripSchema } from "../schemas/tripSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface TripFormProps {
  initialData?: Partial<TripSchema>;
  submitAction: (trip: TripSchema) => Promise<void>;
  submitBtnText: string;
  isLoading: boolean;
}

export default function TripForm({
  initialData = {},
  submitAction,
  submitBtnText,
  isLoading,
}: TripFormProps) {
  const [errorMessage, setErrorMessage] = useState("");

  const { register, formState, handleSubmit, setError, setValue, getValues } =
    useForm({
      resolver: yupResolver(tripSchema),
    });

  useEffect(() => {
    const defaultValues: TripSchema = {
      name: "",
      destination: "",
      startDate: "",
      endDate: "",
      description: "",
      latitude: 0,
      longitude: 0,
      ...initialData,
    };

    for (const key of Object.keys(defaultValues)) {
      setValue(key as keyof TripSchema, defaultValues[key as keyof TripSchema]);
    }
  }, [initialData, setValue]);

  const onSubmit = async (formState: TripSchema) => {
    const formattedData = {
      name: formState.name,
      destination: formState.destination,
      description: formState.description,
      latitude: formState.latitude,
      longitude: formState.longitude,
      startDate: format(formState.startDate, "yyyy-MM-dd"),
      endDate: format(formState.endDate, "yyyy-MM-dd"),
    };

    try {
      await submitAction(formattedData);
    } catch (err) {
      if (isValidationError(err)) {
        const serverErrors = err.data.error;

        setErrorMessage(serverErrors.general?.join(", ") ?? "");

        Object.entries(serverErrors).forEach(([key, messages]) => {
          setError(key as keyof TripSchema, {
            type: "server",
            message: messages[0],
          });
        });
      } else {
        toast.error("Sorry! Something went wrong...");
      }
    }
  };

  const onStartChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
      Element
    >,
  ) => {
    const newStartStr = e.target.value;
    const currentStartStr = getValues("startDate");
    const currentEndStr = getValues("endDate");

    const currentStart = parseISO(currentStartStr);
    const currentEnd = parseISO(currentEndStr);
    const nextStart = parseISO(newStartStr);

    if (isValid(currentStart) && isValid(currentEnd) && isValid(nextStart)) {
      const duration = differenceInMilliseconds(currentEnd, currentStart);

      const nextEnd = addMilliseconds(nextStart, duration);

      setValue("endDate", format(nextEnd, "yyyy-MM-dd"));
    }

    setValue("startDate", newStartStr);
  };

  return (
    <form className="form" onSubmit={handleSubmit(onSubmit)}>
      {errorMessage && <p className="errorMessage">{errorMessage}</p>}

      <LocationInput
        label="Destination"
        errorMessage={formState.errors.destination?.message}
        searchTypes={["political"]}
        onPlaceSelect={(place) => {
          if (!place.formatted_address || !place.geometry?.location) return;
          setValue("destination", place.formatted_address);
          setValue("name", `To ${place.name}`);
          setValue("latitude", place.geometry.location.lat());
          setValue("longitude", place.geometry.location.lng());
        }}
      />
      <FormInput
        label="Description"
        {...register("description")}
        errorMessage={formState.errors.description?.message}
      />
      <FormInput
        label="Start Date"
        type="date"
        {...register("startDate")}
        errorMessage={formState.errors.startDate?.message}
        onChange={onStartChange}
      />
      <FormInput
        label="End Date"
        type="date"
        {...register("endDate")}
        errorMessage={formState.errors.endDate?.message}
      />
      <button className="btn-primary mt-2" disabled={isLoading}>
        {submitBtnText}
      </button>
    </form>
  );
}
