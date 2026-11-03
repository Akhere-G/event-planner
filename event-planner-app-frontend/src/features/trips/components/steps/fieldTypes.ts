import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import type { TripFormValues } from "../../schemas/tripFormSchemas";

export interface FieldGroupProps {
  register: UseFormRegister<TripFormValues>;
  watch: UseFormWatch<TripFormValues>;
  setValue: UseFormSetValue<TripFormValues>;
  errors: FieldErrors<TripFormValues>;
}

export function toggleInList(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}
