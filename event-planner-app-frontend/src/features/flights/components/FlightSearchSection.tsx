import { useState } from "react";
import { Hash, Route, X } from "lucide-react";
import { ToggleButton } from "../../../components";
import type { Trip } from "../../trips/types";
import type { Flight } from "../types";
import { useGetFlightsQuery } from "../flightApiSlice";
import FlightNumberSearch from "./FlightNumberSearch";
import RouteSearch from "./RouteSearch";

type SearchMode = "route" | "number";

interface FlightSearchSectionProps {
  trip: Trip;
  onClose: () => void;
  onSaved: (flights: Flight[]) => void;
}

export default function FlightSearchSection({
  trip,
  onClose,
  onSaved,
}: FlightSearchSectionProps) {
  const [mode, setMode] = useState<SearchMode>("route");
  const { data: savedData } = useGetFlightsQuery(trip.id);
  const savedFlights = savedData?.data ?? [];

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

      <div className="grid grid-cols-2 gap-3">
        <ToggleButton
          label="By route"
          value="route"
          icon={Route}
          isSelected={mode === "route"}
          onClick={() => setMode("route")}
        />
        <ToggleButton
          label="By flight number"
          value="number"
          icon={Hash}
          isSelected={mode === "number"}
          onClick={() => setMode("number")}
        />
      </div>

      {mode === "route" ? (
        <RouteSearch
          trip={trip}
          savedFlights={savedFlights}
          onSaved={onSaved}
        />
      ) : (
        <FlightNumberSearch
          trip={trip}
          savedFlights={savedFlights}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}
