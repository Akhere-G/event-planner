import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useGetAccommodationsQuery } from "../accomodationApiSlice";
import AccommodationForm from "./AccommodationForm";
import AccommodationCard from "./AccommodationCard";
import StateGate from "../../../components/StateGate";
import type { CityBounds } from "../../maps/types";
import type { Trip } from "../../trips/types";
import { useDispatch } from "react-redux";
import { setSelectedAccommodation } from "../../maps/service/mapSlice";
import { usePostHog } from "@posthog/react";

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

  const dispatch = useDispatch();
  const [showAddForm, setShowAddForm] = useState(false);

  const accommodations = accommodationsData?.data || [];

  const showForm = showAddForm;

  const posthog = usePostHog();

  useEffect(() => {
    posthog?.capture("accommodation_page_viewed", {
      trip_id: trip.id,
    });
  }, [posthog, trip.id]);

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
        actions: [{ text: "Add accom?", onClick: () => setShowAddForm(true) }],
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
            tripId={tripId}
            cityBounds={cityBounds}
            onSuccess={closeForm}
            onCancel={closeForm}
            selectedAccommodation={null}
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
