import { Fragment } from "react";
import type { FlightJourney, FlightOffer } from "../types";
import {
  connectorLabel,
  formatDuration,
  formatFlightTime,
  layoverMinutes,
} from "../utils";

function LegEndpoint({
  time,
  code,
  city,
  align,
}: {
  time: string;
  code: string;
  city?: string | null;
  align: "left" | "right";
}) {
  return (
    <p className={align === "right" ? "text-right" : ""}>
      <span className="tabular-nums text-text-main">{time}</span>{" "}
      <span className="font-semibold text-brand-primary">{code}</span>{" "}
      {city && <span className="text-text-main">{city}</span>}
    </p>
  );
}

function LegDetails({ leg }: { leg: FlightOffer }) {
  return (
    <div className="space-y-2 rounded-lg bg-surface-muted p-4">
      <p className="text-sm font-bold text-text-main">
        {leg.airline}
        {leg.flightNumber}
      </p>
      <div className="flex items-center justify-between gap-3 text-sm">
        <LegEndpoint
          time={formatFlightTime(leg.departAt, leg.departureTimezone)}
          code={leg.departureAirport}
          city={leg.departureCity}
          align="left"
        />
        <LegEndpoint
          time={formatFlightTime(leg.arriveAt, leg.arrivalTimezone)}
          code={leg.arrivalAirport}
          city={leg.arrivalCity}
          align="right"
        />
      </div>
      <p className="text-xs text-text-secondary">
        {formatDuration(leg.durationMinutes)} · {connectorLabel(0)}
      </p>
      {leg.extras.length > 0 && (
        <p className="text-xs text-text-secondary">{leg.extras.join(" · ")}</p>
      )}
    </div>
  );
}

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
      {formatDuration(layoverMinutes(arriving, departing))} layover · {place} (
      {arriving.arrivalAirport})
    </p>
  );
}

export default function JourneyDetails({
  journey,
}: {
  journey: FlightJourney;
}) {
  return (
    <div className="space-y-3" data-testid="journey-details">
      {journey.legs.map((leg, index) => (
        <Fragment key={`${leg.airline}${leg.flightNumber}${leg.departAt}`}>
          {index > 0 && (
            <Layover arriving={journey.legs[index - 1]} departing={leg} />
          )}
          <LegDetails leg={leg} />
        </Fragment>
      ))}
    </div>
  );
}
