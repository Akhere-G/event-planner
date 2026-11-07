import { useState } from "react";
import { MoreVertical, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmModal } from "../../../components";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { isApiError } from "../../api/utils";
import { useDeleteFlightMutation } from "../flightApiSlice";
import type { Flight } from "../types";
import {
  directFlightSummary,
  flightDurationMinutes,
  formatGbp,
} from "../utils";
import FlightExtras from "./FlightExtras";
import FlightSummary from "./FlightSummary";

interface FlightCardProps {
  flight: Flight;
  tripId: number;
  canEdit: boolean;
}

export default function FlightCard({
  flight,
  tripId,
  canEdit,
}: FlightCardProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteFlight] = useDeleteFlightMutation();

  const handleDelete = async () => {
    try {
      await deleteFlight({ tripId, flightId: flight.id }).unwrap();
      setIsDeleteOpen(false);
      toast.success("Flight deleted.");
    } catch (err) {
      console.error("Failed to delete flight:", err);
      if (isApiError(err)) return toast.error(err.data.message);
      toast.error("Could not delete flight.");
    }
  };

  const hasFooter =
    flight.luggage.length > 0 ||
    flight.extras.length > 0 ||
    !!flight.purchaseUrl ||
    !!flight.notes;

  return (
    <>
      <FlightSummary
        testId="flight-card"
        flightCode={`${flight.airline}${flight.flightNumber}`}
        airlineLogo={flight.airlineLogo}
        travelClass={flight.travelClass}
        headerEnd={
          <div className="flex items-center gap-3">
            {flight.priceGbp != null && (
              <span className="text-xl font-bold text-text-main">
                {formatGbp(flight.priceGbp)}
              </span>
            )}
            {canEdit && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="Flight actions"
                  className="rounded p-1 text-text-secondary transition-colors hover:bg-surface-muted"
                >
                  <MoreVertical size={20} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setIsDeleteOpen(true)}
                    className="flex items-center gap-2 text-error"
                  >
                    <Trash2 size={16} />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        }
        departure={{
          code: flight.departureAirport,
          city: flight.departureCity,
          airportName: flight.departureAirportName,
          time: flight.departAt,
          timezone: flight.departureTimezone,
        }}
        arrival={{
          code: flight.arrivalAirport,
          city: flight.arrivalCity,
          airportName: flight.arrivalAirportName,
          time: flight.arriveAt,
          timezone: flight.arrivalTimezone,
        }}
        durationMinutes={flightDurationMinutes(flight)}
        footer={
          hasFooter && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-text-secondary">
                  {directFlightSummary(flight.luggage)}
                </p>
                {flight.purchaseUrl && (
                  <a
                    href={flight.purchaseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary rounded-xl px-5 py-2 font-semibold"
                  >
                    Book flight
                  </a>
                )}
              </div>
              {flight.notes && (
                <p className="text-sm text-text-secondary">{flight.notes}</p>
              )}
              <FlightExtras extras={flight.extras} />
            </div>
          )
        }
      />

      <ConfirmModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Flight"
        confirmText="Delete Flight"
        confirmAction={handleDelete}
      >
        <div className="py-4">
          <p className="text-text-main mb-2">
            Are you sure you want to delete this flight?
          </p>
          <div className="bg-surface-muted p-3 rounded-md">
            <p className="font-semibold text-text-main">
              {flight.airline}
              {flight.flightNumber} {flight.departureAirport} →{" "}
              {flight.arrivalAirport}
            </p>
          </div>
          <p className="text-text-secondary text-sm mt-3">
            This action cannot be undone.
          </p>
        </div>
      </ConfirmModal>
    </>
  );
}
