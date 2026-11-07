import { Plane } from "lucide-react";
import { toast } from "sonner";
import { formatInTimeZone } from "date-fns-tz";
import { isApiError } from "../../api/utils";
import { useCreateFlightMutation } from "../flightApiSlice";
import type { FlightOffer, FlightSearchParams } from "../types";
import { formatDuration, formatFlightTime } from "../utils";

interface FlightOfferCardProps {
  offer: FlightOffer;
  search: FlightSearchParams;
  tripId: number;
  isSaved: boolean;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);

export default function FlightOfferCard({
  offer,
  search,
  tripId,
  isSaved,
}: FlightOfferCardProps) {
  const [createFlight, { isLoading: isSaving }] = useCreateFlightMutation();

  const handleSave = async () => {
    try {
      await createFlight({
        tripId,
        ...search,
        airline: offer.airline,
        flightNumber: offer.flightNumber,
      }).unwrap();
      toast.success("Flight saved.");
    } catch (err) {
      if (isApiError(err)) toast.error(err.data.message);
      else toast.error("Could not save this flight.");
    }
  };

  return (
    <div className="card p-4 space-y-2" data-testid="flight-offer-card">
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-center gap-2">
          {offer.airlineLogo ? (
            <img src={offer.airlineLogo} alt="" className="h-6 w-6" />
          ) : (
            <Plane size={16} className="text-brand-primary shrink-0" />
          )}
          <h3 className="font-semibold text-text-main">
            {offer.airline}
            {offer.flightNumber}
          </h3>
        </div>
        {offer.price != null && (
          <span className="font-semibold text-text-main">
            {formatPrice(offer.price)}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 text-text-main">
        <div>
          <p className="text-lg font-bold">{offer.departureAirport}</p>
          <p className="text-xs text-text-secondary">
            {formatInTimeZone(
              offer.departAt,
              offer.departureTimezone,
              "EEE d MMM",
            )}{" "}
            · {formatFlightTime(offer.departAt, offer.departureTimezone)}
          </p>
        </div>
        <span className="text-xs text-text-secondary">
          {formatDuration(offer.durationMinutes)}
        </span>
        <div>
          <p className="text-lg font-bold">{offer.arrivalAirport}</p>
          <p className="text-xs text-text-secondary">
            {formatInTimeZone(
              offer.arriveAt,
              offer.arrivalTimezone,
              "EEE d MMM",
            )}{" "}
            · {formatFlightTime(offer.arriveAt, offer.arrivalTimezone)}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaved || isSaving}
        className="btn-secondary px-4 py-1 rounded-md disabled:opacity-60"
      >
        {isSaved ? "Saved" : isSaving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
