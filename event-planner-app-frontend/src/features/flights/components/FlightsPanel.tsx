import { useState } from "react";
import { Plus } from "lucide-react";
import { StateGate } from "../../../components";
import type { Trip } from "../../trips/types";
import { canUserEdit } from "../../users/utils";
import { useGetFlightsQuery } from "../flightApiSlice";
import FlightCard from "./FlightCard";
import FlightForm from "./FlightForm";

export default function FlightsPanel({ trip }: { trip: Trip }) {
  const { data, isLoading, error } = useGetFlightsQuery(trip.id);
  const [showForm, setShowForm] = useState(false);
  const canEdit = canUserEdit(trip.role);
  const flights = data?.data ?? [];

  return (
    <StateGate
      loadingStateProps={{ isLoading, message: "Loading flights..." }}
      errorStateProps={{ isError: !!error, message: "Failed to load flights" }}
      emptyStateProps={{
        isEmpty: flights.length === 0 && !showForm,
        message: "No flights added yet",
        actions: canEdit
          ? [{ text: "Add flight", onClick: () => setShowForm(true) }]
          : [],
      }}
    >
      <div className="space-y-4 pb-4">
        {canEdit && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Add Flight
          </button>
        )}

        {showForm && (
          <div className="card p-4">
            <FlightForm
              tripId={trip.id}
              tripStart={trip.startDate}
              members={trip.userMemberships}
              onSuccess={() => setShowForm(false)}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        <div className="space-y-3">
          {flights.map((flight) => (
            <FlightCard
              key={flight.id}
              flight={flight}
              tripId={trip.id}
              tripStart={trip.startDate}
              members={trip.userMemberships}
              canEdit={canEdit}
            />
          ))}
        </div>
      </div>
    </StateGate>
  );
}
