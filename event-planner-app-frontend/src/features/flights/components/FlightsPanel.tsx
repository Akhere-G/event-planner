import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { StateGate } from "../../../components";
import type { Trip } from "../../trips/types";
import { canUserEdit } from "../../users/utils";
import { useGetFlightsQuery } from "../flightApiSlice";
import type { Flight } from "../types";
import { flightCardId } from "../utils";
import FlightCard from "./FlightCard";
import FlightSearchSection from "./FlightSearchSection";

const HIGHLIGHT_DURATION_MS = 3000;

export default function FlightsPanel({ trip }: { trip: Trip }) {
  const { data, isLoading, error } = useGetFlightsQuery(trip.id);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const canEdit = canUserEdit(trip.role);
  const flights = useMemo(() => data?.data ?? [], [data]);
  const [scrollTargetId, setScrollTargetId] = useState<number | null>(null);
  const [highlightedIds, setHighlightedIds] = useState<number[]>([]);

  const handleSaved = (saved: Flight[]) => {
    if (saved.length === 0) return;
    setScrollTargetId(saved[0].id);
    setHighlightedIds(saved.map((flight) => flight.id));
  };

  useEffect(() => {
    if (scrollTargetId === null) return;
    if (!flights.some((flight) => flight.id === scrollTargetId)) return;

    const frame = requestAnimationFrame(() => {
      document
        .getElementById(flightCardId(scrollTargetId))
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      setScrollTargetId(null);
    });

    return () => cancelAnimationFrame(frame);
  }, [flights, scrollTargetId]);

  useEffect(() => {
    if (highlightedIds.length === 0) return;

    const timer = setTimeout(
      () => setHighlightedIds([]),
      HIGHLIGHT_DURATION_MS,
    );
    return () => clearTimeout(timer);
  }, [highlightedIds]);

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
              trip={trip}
              canEdit={canEdit}
              isHighlighted={highlightedIds.includes(flight.id)}
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
            onSaved={handleSaved}
          />
        )}
      </div>
    </StateGate>
  );
}
