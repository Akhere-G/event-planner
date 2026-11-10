import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormInput } from "../../../components";
import type { Trip } from "../../trips/types";
import {
  flightNumberSearchSchema,
  type FlightNumberSearchSchema,
} from "../schemas/flightSchema";
import type { FlightNumberSearchParams } from "../types";
import { defaultDepartureDate, todayDate } from "../utils";

interface FlightNumberSearchFormProps {
  trip: Trip;
  isSearching: boolean;
  onSearch: (params: FlightNumberSearchParams) => void;
}

export default function FlightNumberSearchForm({
  trip,
  isSearching,
  onSearch,
}: FlightNumberSearchFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FlightNumberSearchSchema>({
    resolver: yupResolver(flightNumberSearchSchema),
    mode: "onSubmit",
    defaultValues: {
      flightCode: "",
      departureDate: defaultDepartureDate(trip),
    },
  });

  return (
    <form
      onSubmit={handleSubmit(onSearch)}
      className="grid gap-6 sm:grid-cols-2"
      aria-label="Search by flight number"
    >
      <FormInput
        label="Flight number"
        placeholder="BA117"
        autoComplete="off"
        {...register("flightCode")}
        errorMessage={errors.flightCode?.message}
      />
      <FormInput
        type="date"
        label="Departure date"
        min={todayDate()}
        {...register("departureDate")}
        errorMessage={errors.departureDate?.message}
      />

      <div className="sm:col-span-2">
        <button type="submit" disabled={isSearching} className="btn-primary">
          {isSearching ? "Searching…" : "Search flight number"}
        </button>
      </div>
    </form>
  );
}
