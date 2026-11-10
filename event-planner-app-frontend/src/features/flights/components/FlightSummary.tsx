import { useState, type ReactNode } from "react";
import { Plane } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { connectorLabel, formatDuration, formatFlightTime } from "../utils";

export interface FlightEndpoint {
  code: string;
  city?: string | null;
  airportName?: string | null;
  /** UTC ISO timestamp. */
  time: string;
  timezone: string;
}

interface FlightSummaryProps {
  flightCode: string;
  airlineLogo?: string | null;
  travelClass?: string | null;
  headerEnd?: ReactNode;
  departure: FlightEndpoint;
  arrival: FlightEndpoint;
  durationMinutes: number;
  /** Stops between departure and arrival; 0 for a nonstop flight. */
  stops?: number;
  /** Where a journey with stops changes planes, e.g. "Via Beijing (PEK)". */
  via?: string;
  footer?: ReactNode;
  id?: string;
  testId?: string;
  isHighlighted?: boolean;
}

function AirlineLogo({ src }: { src?: string | null }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span className="flex h-9 w-12 shrink-0 items-center justify-center rounded bg-brand-primary/10">
        <Plane size={18} className="text-brand-primary" />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      className="h-9 w-auto max-w-16 shrink-0 rounded"
      onError={() => setFailed(true)}
    />
  );
}

function Endpoint({
  endpoint,
  align,
}: {
  endpoint: FlightEndpoint;
  align: "left" | "right";
}) {
  return (
    <div className={align === "right" ? "text-right" : ""}>
      <p className="text-sm text-text-secondary">
        {formatInTimeZone(endpoint.time, endpoint.timezone, "EEE, d MMM")}
      </p>
      <p className="text-3xl font-extrabold tabular-nums text-text-main">
        {formatFlightTime(endpoint.time, endpoint.timezone)}
      </p>
      <p className="mt-2 font-bold">
        <span className="text-brand-primary">{endpoint.code}</span>{" "}
        {endpoint.city && (
          <span className="text-text-main">{endpoint.city}</span>
        )}
      </p>
      {endpoint.airportName && (
        <p className="text-sm text-text-secondary">{endpoint.airportName}</p>
      )}
    </div>
  );
}

function Connector({
  durationMinutes,
  stops,
}: {
  durationMinutes: number;
  stops: number;
}) {
  return (
    <div className="flex min-w-16 flex-col items-center gap-1">
      <span className="text-sm text-text-secondary">
        {formatDuration(durationMinutes)}
      </span>
      <div className="flex w-full items-center">
        <span className="size-1.5 shrink-0 rounded-full border border-surface-border" />
        <span className="h-px flex-1 bg-surface-border" />
        <span className="mx-1 flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-primary/10">
          <Plane size={18} className="text-brand-primary" />
        </span>
        <span className="h-px flex-1 bg-surface-border" />
        <span className="size-1.5 shrink-0 rounded-full border border-surface-border" />
      </div>
      <span
        className={
          stops > 0
            ? "text-xs font-semibold text-brand-primary"
            : "text-xs text-text-secondary"
        }
      >
        {connectorLabel(stops)}
      </span>
    </div>
  );
}

export default function FlightSummary({
  flightCode,
  airlineLogo,
  travelClass,
  headerEnd,
  departure,
  arrival,
  durationMinutes,
  stops = 0,
  via,
  footer,
  id,
  testId,
  isHighlighted = false,
}: FlightSummaryProps) {
  return (
    <div
      id={id}
      className={`card overflow-hidden p-0 transition-shadow ${isHighlighted ? "ring-2 ring-brand-primary" : ""}`}
      data-testid={testId}
    >
      <div className="space-y-6 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-4">
            <AirlineLogo src={airlineLogo} />
            <h3 className="truncate text-2xl font-bold text-text-main sm:text-lg">
              {flightCode}
            </h3>
            {travelClass && (
              <span className="shrink-0 rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold text-text-secondary">
                {travelClass}
              </span>
            )}
          </div>
          {headerEnd}
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
          <Endpoint endpoint={departure} align="left" />
          <Connector durationMinutes={durationMinutes} stops={stops} />
          <Endpoint endpoint={arrival} align="right" />
        </div>
        {via && <p className="text-sm text-text-secondary">{via}</p>}
      </div>

      {footer && (
        <div className="border-t border-surface-border px-5 py-4 sm:px-6">
          {footer}
        </div>
      )}
    </div>
  );
}
