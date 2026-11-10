import { useState } from "react";
import {
  useCreateFlightsByNumberMutation,
  useLazySearchByFlightNumberQuery,
} from "../flightApiSlice";
import { saveJourneyWithToast } from "../saveJourney";
import type { Trip } from "../../trips/types";
import type { Flight, FlightNumberSearchParams } from "../types";
import FlightJourneyResults from "./FlightJourneyResults";
import FlightNumberSearchForm from "./FlightNumberSearchForm";

interface FlightNumberSearchProps {
  trip: Trip;
  savedFlights: Flight[];
  onSaved: (flights: Flight[]) => void;
}

export default function FlightNumberSearch({
  trip,
  savedFlights,
  onSaved,
}: FlightNumberSearchProps) {
  const [searchByFlightNumber, result] = useLazySearchByFlightNumberQuery();
  const [createFlightsByNumber] = useCreateFlightsByNumberMutation();
  const [lastSearch, setLastSearch] = useState<FlightNumberSearchParams | null>(
    null,
  );

  const handleSearch = (params: FlightNumberSearchParams) => {
    setLastSearch(params);
    searchByFlightNumber({ tripId: trip.id, ...params }, true);
  };

  const handleSave = async () => {
    if (!lastSearch) return;

    await saveJourneyWithToast(
      () => createFlightsByNumber({ tripId: trip.id, ...lastSearch }).unwrap(),
      onSaved,
    );
  };

  return (
    <>
      <FlightNumberSearchForm
        trip={trip}
        isSearching={result.isFetching}
        onSearch={handleSearch}
      />

      {lastSearch && (
        <FlightJourneyResults
          journeys={result.data?.data ?? []}
          savedFlights={savedFlights}
          isFetching={result.isFetching}
          isError={result.isError}
          isSuccess={result.isSuccess}
          error={result.error}
          emptyMessage="That flight does not operate on this date"
          onSave={handleSave}
        />
      )}
    </>
  );
}
