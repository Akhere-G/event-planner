import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { StateGate } from "../../../components";
import { isApiError } from "../../api/utils";
import type { Trip } from "../../trips/types";
import {
  useCreateFlightMutation,
  useGetFlightsQuery,
  useLazySearchFlightsQuery,
} from "../flightApiSlice";
import type { FlightJourney, FlightSearchParams } from "../types";
import { journeyKey, journeyLegCodes } from "../utils";
import FlightJourneyCard from "./FlightJourneyCard";
import FlightSearchForm from "./FlightSearchForm";

interface FlightSearchSectionProps {
  trip: Trip;
  onClose: () => void;
}

export default function FlightSearchSection({
  trip,
  onClose,
}: FlightSearchSectionProps) {
  const [searchFlights, result] = useLazySearchFlightsQuery();
  const [createFlight] = useCreateFlightMutation();
  const { data: savedData } = useGetFlightsQuery(trip.id);
  const [lastSearch, setLastSearch] = useState<FlightSearchParams | null>(null);

  const savedFlights = savedData?.data ?? [];
  const journeys = result.data?.data ?? [];

  const handleSearch = (params: FlightSearchParams) => {
    setLastSearch(params);
    searchFlights({ tripId: trip.id, ...params }, true);
  };

  const handleSave = async (journey: FlightJourney) => {
    if (!lastSearch) return;

    try {
      await createFlight({
        tripId: trip.id,
        ...lastSearch,
        legs: journeyLegCodes(journey),
      }).unwrap();
      toast.success(
        journey.legs.length > 1 ? "Flights saved." : "Flight saved.",
      );
    } catch (err) {
      if (isApiError(err)) toast.error(err.data.message);
      else toast.error("Could not save this flight.");
    }
  };

  return (
    <div className="card p-4 space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm font-bold text-text-main">Search flights</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close flight search"
          className="text-text-secondary hover:text-text-primary p-1 -mr-1"
        >
          <X size={16} />
        </button>
      </div>

      <FlightSearchForm
        trip={trip}
        isSearching={result.isFetching}
        onSearch={handleSearch}
      />

      {lastSearch && (
        <StateGate
          loadingStateProps={{
            isLoading: result.isFetching,
            message: "Searching for flights...",
          }}
          errorStateProps={{
            isError: result.isError,
            message: isApiError(result.error)
              ? result.error.data.message
              : "Failed to search for flights",
          }}
          emptyStateProps={{
            height: 100,
            isEmpty: result.isSuccess && journeys.length === 0,
            message: "No flights found for this route and date",
          }}
        >
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-text-main">
              {journeys.length === 1 ? "Search result" : "Search results"}
            </h2>
            {journeys.map((journey) => (
              <FlightJourneyCard
                key={journeyKey(journey)}
                journey={journey}
                savedFlights={savedFlights}
                onSave={handleSave}
              />
            ))}
          </div>
        </StateGate>
      )}
    </div>
  );
}
