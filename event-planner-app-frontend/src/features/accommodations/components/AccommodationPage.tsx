import { useState } from "react";
import { Plus } from "lucide-react";
import { useGetAccommodationsQuery } from "../apiSlice";
import AccommodationForm from "./AccommodationForm";
import AccommodationCard from "./AccommodationCard";
import StateGate from "../../../components/StateGate";
import type { CityBounds } from "../../maps/types";
import type { Trip } from "../../trips/types";

interface AccommodationPageProps {
  cityBounds: CityBounds;
  trip: Trip;
}

export default function AccommodationPage({
  cityBounds,
  trip,
}: AccommodationPageProps) {
  const { id: tripId } = trip;
  const {
    data: accommodationsData,
    isLoading,
    error,
  } = useGetAccommodationsQuery(tripId);
  const [showAddForm, setShowAddForm] = useState(false);

  const accommodations = accommodationsData?.data || [];

  return (
    <StateGate
      loadingStateProps={{
        isLoading,
        message: "Loading accommodations...",
      }}
      errorStateProps={{
        isError: !!error,
        message: "Failed to load accommodations",
      }}
      emptyStateProps={{
        isEmpty: accommodations.length === 0 && !showAddForm,
        message: "No accommodations added yet",
        action: { text: "Add accom?", onClick: () => setShowAddForm(true) },
      }}
    >
      <div className="space-y-4">
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Add Accommodation
          </button>
        )}

        {showAddForm && (
          <AccommodationForm
            key="new"
            tripId={tripId}
            cityBounds={cityBounds}
            selectedAccommodation={null}
            onSuccess={() => setShowAddForm(false)}
            onCancel={() => setShowAddForm(false)}
            tripStart={trip.startDate}
            tripEnd={trip.endDate}
          />
        )}

        <div className="space-y-3">
          {accommodations.map((accommodation) => (
            <AccommodationCard
              key={accommodation.id}
              accommodation={accommodation}
            />
          ))}
        </div>
      </div>
    </StateGate>
  );
}
