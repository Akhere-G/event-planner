import { useState } from "react";
import { Search } from "lucide-react";
import { StateGate } from "../../../components";
import type { Trip } from "../../trips/types";
import { canUserEdit } from "../../users/utils";
import { useGetFlightsQuery } from "../flightApiSlice";
import FlightCard from "./FlightCard";
import FlightSearchSection from "./FlightSearchSection";

export default function FlightsPanel({ trip }: { trip: Trip }) {
  const { data, isLoading, error } = useGetFlightsQuery(trip.id);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const canEdit = canUserEdit(trip.role);
  const flights = data?.data ?? [];

  return (
    <StateGate
      loadingStateProps={{ isLoading, message: "Loading flights..." }}
      errorStateProps={{ isError: !!error, message: "Failed to load flights" }}
      emptyStateProps={{
        height: 100,
        isEmpty: flights.length === 0 && !isSearchOpen,
        message: "No flights added yet",
        actions: canEdit
          ? [
              {
                text: "Search for a flight",
                onClick: () => setIsSearchOpen(true),
              },
            ]
          : [],
      }}
    >
      <div className="space-y-4 pb-4">
        {flights.length > 0 && (
          <h2 className="text-sm font-bold text-text-main">
            {flights.length === 1 ? "Saved flight" : "Saved flights"}
          </h2>
        )}
        <div className="space-y-4">
          {flights.map((flight) => (
            <FlightCard
              key={flight.id}
              flight={flight}
              tripId={trip.id}
              canEdit={canEdit}
            />
          ))}
        </div>

        {canEdit && !isSearchOpen && (
          <button
            onClick={() => setIsSearchOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Search size={18} />
            Search for flights
          </button>
        )}

        {canEdit && isSearchOpen && (
          <FlightSearchSection
            trip={trip}
            onClose={() => setIsSearchOpen(false)}
          />
        )}
      </div>
    </StateGate>
  );
}
