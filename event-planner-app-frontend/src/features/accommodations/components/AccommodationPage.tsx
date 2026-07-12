import { useState } from "react";
import { Plus } from "lucide-react";
import {
  useGetAccommodationsQuery,
  useDeleteAccommodationMutation,
} from "../apiSlice";
import AccommodationForm from "./AccommodationForm";
import AccommodationCard from "./AccommodationCard";
import UpdateAccommodationModal from "./UpdateAccommodationModal";
import DeleteAccommodationModal from "./DeleteAccommodationModal";
import StateGate from "../../../components/StateGate";
import type { Accommodation } from "../types";
import type { CityBounds } from "../../maps/types";
import { toast } from "sonner";
import { isApiError } from "../../api/utils";
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
  const [deleteAccommodation] = useDeleteAccommodationMutation();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedAccommodation, setSelectedAccommodation] =
    useState<Accommodation | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [accommodationToDelete, setAccommodationToDelete] =
    useState<Accommodation | null>(null);

  const accommodations = accommodationsData?.data || [];

  const handleUpdate = (accommodation: Accommodation) => {
    setSelectedAccommodation(accommodation);
    setIsUpdateModalOpen(true);
  };

  const handleDelete = (accommodation: Accommodation) => {
    setAccommodationToDelete(accommodation);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (accommodationToDelete) {
      try {
        await deleteAccommodation({
          tripId,
          accommodationId: accommodationToDelete.id,
        }).unwrap();
        setIsDeleteModalOpen(false);
        setAccommodationToDelete(null);
        toast.success("Successfully deleted accommodation.");
      } catch (err) {
        console.error("Failed to delete accommodation:", err);
        if (isApiError(err)) {
          return toast.error(err.data.message);
        }
        toast.error("Could not delete accommodation.");
      }
    }
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
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>

        <UpdateAccommodationModal
          isOpen={isUpdateModalOpen}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setSelectedAccommodation(null);
          }}
          accommodation={selectedAccommodation}
          tripId={tripId}
          cityBounds={cityBounds}
          tripStart={trip.startDate}
          tripEnd={trip.endDate}
        />

        <DeleteAccommodationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setAccommodationToDelete(null);
          }}
          accommodation={accommodationToDelete}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </StateGate>
  );
}
