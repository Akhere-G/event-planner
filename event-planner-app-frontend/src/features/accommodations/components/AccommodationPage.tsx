import { useState } from "react";
import { Plus } from "lucide-react";
import { useGetAccommodationsQuery } from "../apiSlice";
import AccommodationForm from "./AccommodationForm";
import AccommodationCard from "./AccommodationCard";
import StateGate from "../../../components/StateGate";
import type { CityBounds } from "../../maps/types";
import type { Trip } from "../../trips/types";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../store";
import { setSelectedAccommodation } from "../../maps/service/mapSlice";

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
  const selectedAccommodation = useSelector(
    (state: RootState) => state.map.selectedAccommodation,
  );
  const dispatch = useDispatch();
  const [showAddForm, setShowAddForm] = useState(false);

  const accommodations = accommodationsData?.data || [];

  const showForm = showAddForm || !!selectedAccommodation;

  const closeForm = () => {
    setShowAddForm(false);
    dispatch(setSelectedAccommodation(null));
  };
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
        isEmpty: accommodations.length === 0 && !showForm,
        message: "No accommodations added yet",
        action: { text: "Add accom?", onClick: () => setShowAddForm(true) },
      }}
    >
      <div className="space-y-4">
        {!showForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Add Accommodation
          </button>
        )}

        {showForm && (
          <AccommodationForm
            key="new"
            tripId={tripId}
            cityBounds={cityBounds}
            selectedAccommodation={
              selectedAccommodation
                ? {
                    ...selectedAccommodation,
                    startDate: trip.startDate,
                    endDate: trip.endDate,
                    id: -1,
                    itineraryId: trip.id,
                  }
                : null
            }
            onSuccess={closeForm}
            onCancel={closeForm}
            tripStart={trip.startDate}
            tripEnd={trip.endDate}
            isEditing={false}
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
