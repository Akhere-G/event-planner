import type {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";
import type { TripFormValues } from "../../schemas/tripFormSchemas";

export interface FieldGroupProps {
  register: UseFormRegister<TripFormValues>;
  setValue: UseFormSetValue<TripFormValues>;
  errors: FieldErrors<TripFormValues>;
  control: Control<TripFormValues>;
}

export function toggleInList(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}
