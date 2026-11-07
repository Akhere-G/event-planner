import { useState } from "react";
import { Edit2, MoreVertical, Plane, Trash2 } from "lucide-react";
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
import type { User } from "../../users/types";
import { useDeleteFlightMutation } from "../flightApiSlice";
import type { Flight } from "../types";
import {
  flightDurationMinutes,
  formatDuration,
  formatFlightTime,
} from "../utils";
import FlightForm from "./FlightForm";

interface FlightCardProps {
  flight: Flight;
  tripId: number;
  tripStart: string;
  members: User[];
  canEdit: boolean;
}

export default function FlightCard({
  flight,
  tripId,
  tripStart,
  members,
  canEdit,
}: FlightCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteFlight] = useDeleteFlightMutation();

  const travellerNames = flight.travellers
    .map((id) => members.find((member) => member.id === id)?.username)
    .filter(Boolean);

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

  if (isEditing) {
    return (
      <div className="card p-4">
        <FlightForm
          key={flight.id}
          tripId={tripId}
          tripStart={tripStart}
          members={members}
          flight={flight}
          onSuccess={() => setIsEditing(false)}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="card p-4 space-y-2" data-testid="flight-card">
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-center gap-2">
          <Plane size={16} className="text-brand-primary shrink-0" />
          <h3 className="font-semibold text-text-main">
            {flight.flightNumber} · {flight.airline}
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
                onClick={() => setIsEditing(true)}
                className="flex gap-2 items-center"
              >
                <Edit2 size={16} />
                Edit
              </DropdownMenuItem>
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
            {formatInTimeZone(
              flight.arriveAt,
              flight.arrivalTimezone,
              "EEE d MMM",
            )}{" "}
            · {formatFlightTime(flight.arriveAt, flight.arrivalTimezone)}
          </p>
        </div>
      </div>

      <p className="text-xs text-text-secondary">
        {[
          flight.bookingRef && `Ref ${flight.bookingRef}`,
          flight.seat && `Seat ${flight.seat}`,
          flight.terminal && `Terminal ${flight.terminal}`,
          flight.gate && `Gate ${flight.gate}`,
          travellerNames.length > 0 && travellerNames.join(", "),
        ]
          .filter(Boolean)
          .join(" · ")}
      </p>
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
              {flight.flightNumber} {flight.departureAirport} →{" "}
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
