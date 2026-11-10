import { Fragment, useState } from "react";
import {
  formatDuration,
  formatGbp,
  isJourneySaved,
  journeySummary,
  layoverMinutes,
} from "../utils";
import type { Flight, FlightJourney, FlightOffer } from "../types";
import FlightExtras from "./FlightExtras";
import FlightSummary from "./FlightSummary";

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

function Layover({
  arriving,
  departing,
}: {
  arriving: FlightOffer;
  departing: FlightOffer;
}) {
  const place = arriving.arrivalCity ?? arriving.arrivalAirport;

  return (
    <p className="text-center text-sm text-text-secondary">
      Layover · {formatDuration(layoverMinutes(arriving, departing))} in {place}{" "}
      ({arriving.arrivalAirport})
    </p>
  );
}

export default function FlightJourneyCard({
  journey,
  savedFlights,
  onSave,
}: FlightJourneyCardProps) {
  const [isSaving, setIsSaving] = useState(false);
  const isSaved = isJourneySaved(savedFlights, journey);
  const lastIndex = journey.legs.length - 1;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(journey);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-2" data-testid="flight-journey-card">
      {journey.legs.map((leg, index) => (
        <Fragment key={`${leg.airline}${leg.flightNumber}${leg.departAt}`}>
          {index > 0 && (
            <Layover arriving={journey.legs[index - 1]} departing={leg} />
          )}
          <FlightSummary
            flightCode={`${leg.airline}${leg.flightNumber}`}
            airlineLogo={leg.airlineLogo}
            travelClass={leg.travelClass}
            headerEnd={
              index === 0 &&
              journey.priceGbp != null && (
                <span className="text-lg font-bold text-text-main">
                  {formatGbp(journey.priceGbp)}
                </span>
              )
            }
            departure={{
              code: leg.departureAirport,
              city: leg.departureCity,
              airportName: leg.departureAirportName,
              time: leg.departAt,
              timezone: leg.departureTimezone,
            }}
            arrival={{
              code: leg.arrivalAirport,
              city: leg.arrivalCity,
              airportName: leg.arrivalAirportName,
              time: leg.arriveAt,
              timezone: leg.arrivalTimezone,
            }}
            durationMinutes={leg.durationMinutes}
            footer={
              index === lastIndex && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <p className="text-sm text-text-secondary">
                      {journeySummary(journey)}
                    </p>
                    <div className="flex w-full flex-col items-start gap-4">
                      <FlightExtras extras={leg.extras} />
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaved || isSaving}
                        className="btn-primary self-end rounded-xl px-6 py-3 text-lg font-bold disabled:opacity-60"
                      >
                        {saveLabel(journey, isSaved, isSaving)}
                      </button>
                    </div>
                  </div>
                </div>
              )
            }
          />
        </Fragment>
      ))}
    </div>
  );
}
