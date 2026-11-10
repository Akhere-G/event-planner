import { useState } from "react";
import {
  useCreateFlightMutation,
  useLazySearchFlightsQuery,
} from "../flightApiSlice";
import { saveJourneyWithToast } from "../saveJourney";
import type { Flight, FlightJourney, FlightSearchParams } from "../types";
import { journeyLegCodes } from "../utils";
import FlightJourneyResults from "./FlightJourneyResults";
import FlightSearchForm from "./FlightSearchForm";
import type { Trip } from "../../trips/types";

interface RouteSearchProps {
  trip: Trip;
  savedFlights: Flight[];
}

export default function RouteSearch({ trip, savedFlights }: RouteSearchProps) {
  const [searchFlights, result] = useLazySearchFlightsQuery();
  const [createFlight] = useCreateFlightMutation();
  const [lastSearch, setLastSearch] = useState<FlightSearchParams | null>(null);

  const handleSearch = (params: FlightSearchParams) => {
    setLastSearch(params);
    searchFlights({ tripId: trip.id, ...params }, true);
  };

  const handleSave = async (journey: FlightJourney) => {
    if (!lastSearch) return;

    await saveJourneyWithToast(() =>
      createFlight({
        tripId: trip.id,
        ...lastSearch,
        legs: journeyLegCodes(journey),
      }).unwrap(),
    );
  };

  return (
    <>
      <FlightSearchForm
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
          emptyMessage="No flights found for this route and date"
          onSave={handleSave}
        />
      )}
    </>
  );
}
