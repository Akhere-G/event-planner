import { StateGate } from "../../../components";
import { isApiError } from "../../api/utils";
import type { Flight, FlightJourney } from "../types";
import { journeyKey } from "../utils";
import FlightJourneyCard from "./FlightJourneyCard";

interface FlightJourneyResultsProps {
  journeys: FlightJourney[];
  savedFlights: Flight[];
  isFetching: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: unknown;
  emptyMessage: string;
  onSave: (journey: FlightJourney) => Promise<void>;
}

export default function FlightJourneyResults({
  journeys,
  savedFlights,
  isFetching,
  isError,
  isSuccess,
  error,
  emptyMessage,
  onSave,
}: FlightJourneyResultsProps) {
  return (
    <StateGate
      loadingStateProps={{
        isLoading: isFetching,
        message: "Searching for flights...",
      }}
      errorStateProps={{
        isError,
        message: isApiError(error)
          ? error.data.message
          : "Failed to search for flights",
      }}
      emptyStateProps={{
        height: 100,
        isEmpty: isSuccess && journeys.length === 0,
        message: emptyMessage,
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
            onSave={onSave}
          />
        ))}
      </div>
    </StateGate>
  );
}
