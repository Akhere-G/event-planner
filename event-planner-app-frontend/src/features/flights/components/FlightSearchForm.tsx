import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormInput } from "../../../components";
import type { Trip } from "../../trips/types";
import { useSearchAirportsQuery } from "../flightApiSlice";
import {
  flightSearchSchema,
  type FlightSearchSchema,
} from "../schemas/flightSchema";
import type { AirportPlace, FlightSearchParams } from "../types";
import AirportInput from "./AirportInput";

/** An autofilled airport must be near the trip, so "Paris" doesn't become Paris, Texas. */
const MAX_AUTOFILL_DISTANCE_KM = 200;

interface FlightSearchFormProps {
  trip: Trip;
  isSearching: boolean;
  onSearch: (params: FlightSearchParams) => void;
}

const placeCodes = (place: AirportPlace) =>
  place.airports.map((airport) => airport.code);

export default function FlightSearchForm({
  trip,
  isSearching,
  onSearch,
}: FlightSearchFormProps) {
  const today = format(new Date(), "yyyy-MM-dd");
  const [originLabel, setOriginLabel] = useState<string | null>(null);
  // `undefined` until the user picks or clears the arrival, so autofill applies.
  const [destinationChoice, setDestinationChoice] = useState<
    AirportPlace | null | undefined
  >(undefined);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FlightSearchSchema>({
    resolver: yupResolver(flightSearchSchema),
    mode: "onSubmit",
    defaultValues: {
      origin: [],
      destination: [],
      departureDate: trip.startDate >= today ? trip.startDate : today,
    },
  });

  const destinationCity = trip.destination.split(",")[0].trim();
  const { data: destinationMatches } = useSearchAirportsQuery(
    {
      tripId: trip.id,
      q: destinationCity,
      lat: trip.latitude,
      lng: trip.longitude,
    },
    { skip: !destinationCity },
  );
  const autofill = destinationMatches?.data.find(
    (place) => (place.distanceKm ?? Infinity) <= MAX_AUTOFILL_DISTANCE_KM,
  );

  const destinationPlace =
    destinationChoice === undefined ? (autofill ?? null) : destinationChoice;

  useEffect(() => {
    if (autofill && destinationChoice === undefined) {
      setValue("destination", placeCodes(autofill));
    }
  }, [autofill, destinationChoice, setValue]);

  return (
    <form
      onSubmit={handleSubmit((form) =>
        onSearch({
          origin: form.origin as string[],
          destination: form.destination as string[],
          departureDate: form.departureDate,
        }),
      )}
      className="grid gap-6 sm:grid-cols-3"
      aria-label="Search flights"
    >
      <AirportInput
        tripId={trip.id}
        name="origin"
        label="Departing from"
        selectedLabel={originLabel}
        errorMessage={errors.origin?.message}
        onSelect={(place) => {
          setValue("origin", placeCodes(place), { shouldValidate: true });
          setOriginLabel(place.label);
        }}
        onClear={() => {
          setValue("origin", []);
          setOriginLabel(null);
        }}
      />
      <AirportInput
        tripId={trip.id}
        name="destination"
        label="Arriving at"
        selectedLabel={destinationPlace?.label ?? null}
        bias={{ lat: trip.latitude, lng: trip.longitude }}
        errorMessage={errors.destination?.message}
        onSelect={(place) => {
          setDestinationChoice(place);
          setValue("destination", placeCodes(place), { shouldValidate: true });
        }}
        onClear={() => {
          setDestinationChoice(null);
          setValue("destination", []);
        }}
      />
      <FormInput
        type="date"
        label="Departure date"
        min={today}
        {...register("departureDate")}
        errorMessage={errors.departureDate?.message}
      />

      <div className="sm:col-span-3">
        <button type="submit" disabled={isSearching} className="btn-primary">
          {isSearching ? "Searching…" : "Search flights"}
        </button>
      </div>
    </form>
  );
}
