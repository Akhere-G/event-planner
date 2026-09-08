import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { LocationInput, FormInput, FormTextarea } from "../../../components";
import {
  useCreateAccommodationMutation,
  useUpdateAccommodationMutation,
} from "../accomodationApiSlice";
import { isValidationError } from "../../api/utils";
import {
  accommodationSchema,
  type AccommodationSchema,
} from "../schemas/accommodationSchema";
import type { CityBounds } from "../../maps/types";
import type { Accommodation } from "../types";
import { usePostHog } from "@posthog/react";
import { differenceInDays } from "date-fns";

interface AccommodationFormProps {
  tripId: number;
  cityBounds: CityBounds;
  selectedAccommodation: Partial<Accommodation> | null;
  tripStart: string;
  tripEnd: string;
  onSuccess?: () => void;
  onCancel: () => void;
}

export default function AccommodationForm({
  tripId,
  cityBounds,
  selectedAccommodation,
  tripStart,
  tripEnd,
  onSuccess = () => {},
  onCancel,
}: AccommodationFormProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const [updateAccommodation] = useUpdateAccommodationMutation();
  const [createAccommodation] = useCreateAccommodationMutation();
  const posthog = usePostHog();

  const isEditing = !!selectedAccommodation?.id;

  const defaultFormValues: AccommodationSchema = {
    name: selectedAccommodation?.name || "",
    address: selectedAccommodation?.address || "",
    latitude: selectedAccommodation?.latitude ?? 0,
    longitude: selectedAccommodation?.longitude ?? 0,
    description: selectedAccommodation?.description || "",
    startDate: selectedAccommodation?.startDate || tripStart,
    endDate: selectedAccommodation?.endDate || tripEnd,
  };

  const {
    register,
    formState: { errors },
    handleSubmit,
    setError,
    setValue,
  } = useForm<AccommodationSchema>({
    resolver: yupResolver(accommodationSchema),
    defaultValues: defaultFormValues,
    mode: "onSubmit",
  });

  const onSubmit = async (formState: AccommodationSchema) => {
    setErrorMessage("");
    try {
      const basePayload = {
        tripId,
        name: formState.name.trim(),
        address: formState.address.trim(),
        description: formState.description?.trim() || undefined,
        latitude: formState.latitude,
        longitude: formState.longitude,
        startDate: formState.startDate,
        endDate: formState.endDate,
      };

      if (isEditing && selectedAccommodation?.id) {
        await updateAccommodation({
          ...basePayload,
          accommodationId: selectedAccommodation.id,
        }).unwrap();
        toast.success("Accommodation updated!");
      } else {
        await createAccommodation(basePayload).unwrap();
        posthog?.capture("accommodation_created", {
          duration_days: differenceInDays(
            new Date(formState.endDate),
            new Date(formState.startDate),
          ),
          trip_id: tripId,
        });
        toast.success("Accommodation added!");
      }

      onSuccess();
    } catch (err) {
      if (isValidationError(err)) {
        const serverErrors = err.data.error;
        setErrorMessage(serverErrors.general?.join(", ") ?? "");
        Object.entries(serverErrors).forEach(([k, messages]) => {
          setError(k as keyof AccommodationSchema, {
            type: "server",
            message: messages[0],
          });
        });
      } else {
        toast.error("Failed to save accommodation");
      }
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-bold text-text-main">
          {isEditing ? "Update Accommodation" : "New Accommodation"}
        </span>
        <button
          type="button"
          onClick={onCancel}
          className="text-text-secondary hover:text-text-primary p-1 -mr-1"
        >
          <X size={16} />
        </button>
      </div>

      <LocationInput
        cityBounds={cityBounds}
        onPlaceSelect={(place) => {
          setValue("name", place.name || "");
          setValue("address", place.formatted_address || "");
          if (place.geometry?.location) {
            setValue("latitude", place.geometry.location.lat());
            setValue("longitude", place.geometry.location.lng());
          }
        }}
        errorMessage={errors.address?.message}
        searchTypes={["lodging"]}
        {...register("address")}
      />

      <FormInput
        label="Name"
        {...register("name")}
        errorMessage={errors.name?.message}
        formClassNames="w-full"
      />

      <div className="grid sm:grid-cols-2 gap-3">
        <FormInput
          type="date"
          label="Start Date"
          min={tripStart}
          max={tripEnd}
          {...register("startDate")}
          errorMessage={errors.startDate?.message}
          formClassNames="w-full"
        />
        <FormInput
          label="End Date"
          type="date"
          min={tripStart}
          max={tripEnd}
          {...register("endDate")}
          errorMessage={errors.endDate?.message}
          formClassNames="w-full"
        />
      </div>

      <FormTextarea
        label="Description"
        {...register("description")}
        errorMessage={errors.description?.message}
        formClassNames="w-full"
      />

      {errorMessage && (
        <p className="text-xs text-error mt-1">{errorMessage}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary flex-1"
        >
          Cancel
        </button>
        <button type="submit" className="flex-1 btn-primary">
          {isEditing ? "Update" : "Add Accommodation"}
        </button>
      </div>
    </form>
  );
}
