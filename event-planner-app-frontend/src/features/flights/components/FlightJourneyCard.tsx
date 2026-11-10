import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Flight, FlightJourney } from "../types";
import {
  formatGbp,
  isJourneySaved,
  journeyFlightCodes,
  journeySummary,
  journeyVia,
} from "../utils";
import FlightSummary from "./FlightSummary";
import JourneyDetails from "./JourneyDetails";

interface FlightJourneyCardProps {
  journey: FlightJourney;
  savedFlights: Flight[];
  onSave: (journey: FlightJourney) => Promise<void>;
}

const saveLabel = (
  journey: FlightJourney,
  isSaved: boolean,
  isSaving: boolean,
) => {
  if (isSaved) return "Saved";
  if (isSaving) return "Saving…";
  return journey.legs.length > 1
    ? `Save ${journey.legs.length} flights`
    : "Save flight";
};

export default function FlightJourneyCard({
  journey,
  savedFlights,
  onSave,
}: FlightJourneyCardProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const detailsId = useId();
  const isSaved = isJourneySaved(savedFlights, journey);
  const first = journey.legs[0];
  const last = journey.legs[journey.legs.length - 1];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(journey);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FlightSummary
      testId="flight-journey-card"
      flightCode={journeyFlightCodes(journey)}
      airlineLogo={first.airlineLogo}
      travelClass={first.travelClass}
      headerEnd={
        journey.priceGbp != null && (
          <span className="text-lg font-bold text-text-main">
            {formatGbp(journey.priceGbp)}
          </span>
        )
      }
      departure={{
        code: first.departureAirport,
        city: first.departureCity,
        airportName: first.departureAirportName,
        time: first.departAt,
        timezone: first.departureTimezone,
      }}
      arrival={{
        code: last.arrivalAirport,
        city: last.arrivalCity,
        airportName: last.arrivalAirportName,
        time: last.arriveAt,
        timezone: last.arrivalTimezone,
      }}
      durationMinutes={journey.totalDurationMinutes}
      stops={journey.stops}
      via={journeyVia(journey)}
      footer={
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setIsExpanded((expanded) => !expanded)}
            aria-expanded={isExpanded}
            aria-controls={detailsId}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
          >
            {isExpanded ? "Hide" : "Show"} flight
            {journey.legs.length > 1 && " & layover"} details
            <ChevronDown
              size={16}
              className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
            />
          </button>

          <div id={detailsId} hidden={!isExpanded}>
            {isExpanded && <JourneyDetails journey={journey} />}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-text-secondary">
              {journeySummary(journey)}
            </p>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaved || isSaving}
              className="btn-primary rounded-xl px-6 py-3 text-lg font-bold disabled:opacity-60"
            >
              {saveLabel(journey, isSaved, isSaving)}
            </button>
          </div>
        </div>
      }
    />
  );
}
