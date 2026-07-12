import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { LocationInput, FormInput } from "../../../components";
import {
  useCreateAccommodationMutation,
  useUpdateAccommodationMutation,
} from "../apiSlice";
import { isValidationError } from "../../api/utils";
import {
  accommodationSchema,
  type AccommodationSchema,
} from "../schemas/accommodationSchema";
import type { CityBounds } from "../../maps/types";
import type { Accommodation } from "../types";

interface AccommodationFormProps {
  tripId: number;
  cityBounds: CityBounds;
  onSuccess?: () => void;
  onCancel: () => void;
  selectedAccommodation: Accommodation | null;
  tripStart: string;
  tripEnd: string;
  isEditing: boolean;
}

export default function AccommodationForm({
  tripId,
  cityBounds,
  onSuccess = () => {},
  onCancel,
  selectedAccommodation,
  tripStart,
  tripEnd,
  isEditing,
}: AccommodationFormProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const [updateAccommodation] = useUpdateAccommodationMutation();
  const [createAccommodation] = useCreateAccommodationMutation();
  const [key, setKey] = useState(0);

  const {
    register,
    formState: { errors },
    handleSubmit,
    setError,
    setValue,
    reset,
  } = useForm({
    resolver: yupResolver(accommodationSchema),
    defaultValues: selectedAccommodation
      ? {
          name: selectedAccommodation.name,
          address: selectedAccommodation.address,
          latitude: selectedAccommodation.latitude,
          longitude: selectedAccommodation.longitude,
          description: selectedAccommodation.description || "",
          startDate: selectedAccommodation.startDate,
          endDate: selectedAccommodation.endDate,
        }
      : {
          name: "",
          address: "",
          description: "",
          startDate: tripStart,
          endDate: tripEnd,
        },
    mode: "onSubmit",
  });

  const onSubmit = async (formState: AccommodationSchema) => {
    setErrorMessage("");
    try {
      if (isEditing && selectedAccommodation) {
        await updateAccommodation({
          ...formState,
          accommodationId: selectedAccommodation.id,
          tripId,
          name: formState.name.trim(),
          address: formState.address.trim(),
          description: formState.description?.trim() || undefined,
        }).unwrap();
        toast.success("Accommodation updated!");
      } else {
        await createAccommodation({
          ...formState,
          tripId,
          name: formState.name.trim(),
          address: formState.address.trim(),
          description: formState.description?.trim() || undefined,
        }).unwrap();
        toast.success("Accommodation added!");
      }

      onSuccess();
      reset();
      setKey((prev) => prev + 1);
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
    <form onSubmit={handleSubmit(onSubmit)} className="card space-y-3">
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

      <div className="mb-2">
        <LocationInput
          key={key}
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
      </div>

      <FormInput
        label="Name"
        {...register("name")}
        errorMessage={errors.name?.message}
        formClassNames="w-full"
      />

      <FormInput
        label="Address"
        {...register("address")}
        errorMessage={errors.address?.message}
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

      <FormInput
        label="Description"
        textarea
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
