import { useState } from "react";
import { MoreVertical, Plane, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmModal } from "../../../components";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { formatInTimeZone } from "date-fns-tz";
import { isApiError } from "../../api/utils";
import { useDeleteFlightMutation } from "../flightApiSlice";
import type { Flight } from "../types";
import {
  flightDurationMinutes,
  formatDuration,
  formatFlightTime,
} from "../utils";

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

  return (
    <div className="card p-4 space-y-2" data-testid="flight-card">
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-center gap-2">
          <Plane size={16} className="text-brand-primary shrink-0" />
          <h3 className="font-semibold text-text-main">
            {flight.airline}{flight.flightNumber}
          </h3>
        </div>
        {canEdit && (
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Flight actions"
              className="p-1 hover:bg-surface-muted rounded transition-colors text-text-secondary"
            >
              <MoreVertical size={16} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setIsDeleteOpen(true)}
                className="flex gap-2 items-center text-error"
              >
                <Trash2 size={16} />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="flex items-center gap-3 text-text-main">
        <div>
          <p className="text-lg font-bold">{flight.departureAirport}</p>
          <p className="text-xs text-text-secondary">
            Scheduled departure time
          </p>
          <p className="text-xs text-text-secondary">
            {formatInTimeZone(
              flight.departAt,
              flight.departureTimezone,
              "EEE d MMM",
            )}{" "}
            · {formatFlightTime(flight.departAt, flight.departureTimezone)}
          </p>
        </div>
        <span className="text-xs text-text-secondary">
          {formatDuration(flightDurationMinutes(flight))}
        </span>
        <div>
          <p className="text-lg font-bold">{flight.arrivalAirport}</p>
          <p className="text-xs text-text-secondary">
            Scheduled arrival time
          </p>
          <p className="text-xs text-text-secondary">
            {formatInTimeZone(
              flight.arriveAt,
              flight.arrivalTimezone,
              "EEE d MMM",
            )}{" "}
            · {formatFlightTime(flight.arriveAt, flight.arrivalTimezone)}
          </p>
        </div>
      </div>

      {flight.notes && (
        <p className="text-sm text-text-secondary">{flight.notes}</p>
      )}

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
              {flight.airline}{flight.flightNumber} {flight.departureAirport} →{" "}
              {flight.arrivalAirport}
            </p>
          </div>
          <p className="text-text-secondary text-sm mt-3">
            This action cannot be undone.
          </p>
        </div>
      </ConfirmModal>
    </div>
  );
}
