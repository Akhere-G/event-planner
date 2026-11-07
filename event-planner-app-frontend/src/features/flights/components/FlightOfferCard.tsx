import { toast } from "sonner";
import { isApiError } from "../../api/utils";
import { useCreateFlightMutation } from "../flightApiSlice";
import type { FlightOffer, FlightSearchParams } from "../types";
import { directFlightSummary, formatGbp } from "../utils";
import FlightExtras from "./FlightExtras";
import FlightSummary from "./FlightSummary";

interface FlightOfferCardProps {
  offer: FlightOffer;
  search: FlightSearchParams;
  tripId: number;
  isSaved: boolean;
}

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
    <FlightSummary
      testId="flight-offer-card"
      flightCode={`${offer.airline}${offer.flightNumber}`}
      airlineLogo={offer.airlineLogo}
      travelClass={offer.travelClass}
      headerEnd={
        offer.priceGbp != null && (
          <span className="text-lg font-bold text-text-main">
            {formatGbp(offer.priceGbp)}
          </span>
        )
      }
      departure={{
        code: offer.departureAirport,
        city: offer.departureCity,
        airportName: offer.departureAirportName,
        time: offer.departAt,
        timezone: offer.departureTimezone,
      }}
      arrival={{
        code: offer.arrivalAirport,
        city: offer.arrivalCity,
        airportName: offer.arrivalAirportName,
        time: offer.arriveAt,
        timezone: offer.arrivalTimezone,
      }}
      durationMinutes={offer.durationMinutes}
      footer={
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-text-secondary">
              {directFlightSummary(offer.luggage)}
            </p>
            <div className="flex flex-col items-start w-full gap-4">
              <FlightExtras extras={offer.extras} />

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaved || isSaving}
                className="btn-primary self-end rounded-xl px-6 py-3 text-lg  font-bold disabled:opacity-60"
              >
                {isSaved ? "Saved" : isSaving ? "Saving…" : "Save flight"}
              </button>
            </div>
          </div>
        </div>
      }
    />
  );
}
