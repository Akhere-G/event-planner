import {
  addDays,
  addMilliseconds,
  differenceInMilliseconds,
  format,
  isValid,
} from "date-fns";
import type { UseFormGetValues } from "react-hook-form";
import { FormInput, FormTextarea, LocationInput } from "../../../../components";
import type { TripFormValues } from "../../schemas/tripFormSchemas";
import type { FieldGroupProps } from "./fieldTypes";

interface BasicsStepProps extends FieldGroupProps {
  getValues: UseFormGetValues<TripFormValues>;
  initialDestination: string;
  validateOnPlaceSelect: boolean;
}

export default function BasicsStep({
  register,
  setValue,
  getValues,
  errors,
  initialDestination,
  validateOnPlaceSelect,
}: BasicsStepProps) {
  const onStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextStart = new Date(e.target.value);
    const currentStart = new Date(getValues("startDate"));
    const currentEnd = new Date(getValues("endDate"));

    if (isValid(currentStart) && isValid(currentEnd) && isValid(nextStart)) {
      const duration = differenceInMilliseconds(currentEnd, currentStart);
      setValue(
        "endDate",
        format(addMilliseconds(nextStart, duration), "yyyy-MM-dd"),
      );
    } else if (isValid(nextStart)) {
      setValue("endDate", format(addDays(nextStart, 7), "yyyy-MM-dd"));
    }

    setValue("startDate", e.target.value);
  };

  return (
    <>
      <LocationInput
        name="location"
        label="Destination"
        initialValue={initialDestination}
        errorMessage={errors.destination?.message}
        searchTypes={["political"]}
        onPlaceSelect={(place) => {
          if (!place.formatted_address || !place.geometry?.location) return;
          setValue("destination", place.formatted_address, {
            shouldValidate: validateOnPlaceSelect,
          });
          setValue("name", `${place.name} ${new Date().getFullYear()}`);
          setValue("latitude", place.geometry.location.lat());
          setValue("longitude", place.geometry.location.lng());
        }}
      />
      <FormInput
        label="Name"
        {...register("name")}
        errorMessage={errors.name?.message}
      />
      <FormTextarea
        label="Description"
        {...register("description")}
        errorMessage={errors.description?.message}
      />
      <FormInput
        label="Start Date"
        type="date"
        {...register("startDate")}
        errorMessage={errors.startDate?.message}
        onChange={onStartChange}
      />
      <FormInput
        label="End Date"
        type="date"
        {...register("endDate")}
        errorMessage={errors.endDate?.message}
      />
    </>
  );
}
