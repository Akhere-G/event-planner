import { useState } from "react";
import { X } from "lucide-react";
import { StateGate } from "../../../components";
import { isApiError } from "../../api/utils";
import type { Trip } from "../../trips/types";
import {
  useGetFlightsQuery,
  useLazySearchFlightsQuery,
} from "../flightApiSlice";
import type { Flight, FlightOffer, FlightSearchParams } from "../types";
import FlightOfferCard from "./FlightOfferCard";
import FlightSearchForm from "./FlightSearchForm";

interface FlightSearchSectionProps {
  trip: Trip;
  onClose: () => void;
}

const isSameFlight = (flight: Flight, offer: FlightOffer) =>
  flight.airline === offer.airline &&
  flight.flightNumber === offer.flightNumber &&
  new Date(flight.departAt).getTime() === new Date(offer.departAt).getTime();

export default function FlightSearchSection({
  trip,
  onClose,
}: FlightSearchSectionProps) {
  const [searchFlights, result] = useLazySearchFlightsQuery();
  const { data: savedData } = useGetFlightsQuery(trip.id);
  const [lastSearch, setLastSearch] = useState<FlightSearchParams | null>(null);

  const savedFlights = savedData?.data ?? [];
  const offers = result.data?.data ?? [];

  const handleSearch = (params: FlightSearchParams) => {
    setLastSearch(params);
    searchFlights({ tripId: trip.id, ...params }, true);
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
            isEmpty: result.isSuccess && offers.length === 0,
            message: "No nonstop flights found for this route and date",
          }}
        >
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-text-main">
              {offers.length === 1 ? "Search result" : "Search results"}
            </h2>
            {offers.map((offer) => (
              <FlightOfferCard
                key={`${offer.airline}${offer.flightNumber}${offer.departAt}`}
                offer={offer}
                search={lastSearch}
                tripId={trip.id}
                isSaved={savedFlights.some((flight) =>
                  isSameFlight(flight, offer),
                )}
              />
            ))}
          </div>
        </StateGate>
      )}
    </div>
  );
}
