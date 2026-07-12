import { useState } from "react";
import {
  MapPin,
  Calendar,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Accommodation } from "../types";
import { formatDateRange } from "../../../utils/dateFormattors";
import UpdateAccommodationModal from "./UpdateAccommodationModal";
import DeleteAccommodationModal from "./DeleteAccommodationModal";
import { useDeleteAccommodationMutation } from "../apiSlice";
import { isApiError } from "../../api/utils";
import { toast } from "sonner";
import { useParams } from "react-router";
import { useGetTripQuery } from "../../trips/services/tripsApiSlice";
import { getCityBounds } from "../../maps/utils";

interface AccommodationCardProps {
  accommodation: Accommodation;
  deleteFuncProps?: { onSuccess?: () => void };
}

export default function AccommodationCard({
  accommodation,
  deleteFuncProps,
}: AccommodationCardProps) {
  const params = useParams();
  const tripId = Number(params.tripId);
  const { data } = useGetTripQuery(tripId);
  const trip = data?.data || null;
  const [isExpanded, setIsExpanded] = useState(false);
  const [deleteAccommodation] = useDeleteAccommodationMutation();
  const [selectedAccommodation, setSelectedAccommodation] =
    useState<Accommodation | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [accommodationToDelete, setAccommodationToDelete] =
    useState<Accommodation | null>(null);

  const shouldShowExpand =
    accommodation.description && accommodation.description.length > 100;

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
        if (deleteFuncProps?.onSuccess) {
          deleteFuncProps.onSuccess();
        }
      } catch (err) {
        console.error("Failed to delete accommodation:", err);
        if (isApiError(err)) {
          return toast.error(err.data.message);
        }
        toast.error("Could not delete accommodation.");
      }
    }
  };

  if (!trip) {
    return;
  }

  const cityBounds = getCityBounds(trip);

  return (
    <div className="card p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-text-main text-lg">
            {accommodation.name}
          </h3>
          <div className="flex items-center gap-2 text-text-secondary text-sm mt-1">
            <MapPin size={14} />
            <span>{accommodation.address}</span>
          </div>
          <div className="flex items-center gap-2 text-text-secondary text-sm mt-1">
            <Calendar size={14} />
            <span>
              {formatDateRange(accommodation.startDate, accommodation.endDate)}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleUpdate(accommodation)}
            className="p-2 hover:bg-surface-muted rounded-md text-text-secondary hover:text-text-primary transition-colors"
            title="Update"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => handleDelete(accommodation)}
            className="p-2 hover:bg-surface-muted rounded-md text-text-secondary hover:text-error transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {accommodation.description && (
        <div className="text-sm text-text-secondary">
          {shouldShowExpand && !isExpanded ? (
            <>
              <p>{accommodation.description.slice(0, 100)}...</p>
              <button
                onClick={() => setIsExpanded(true)}
                className="text-brand-primary hover:underline mt-1 flex items-center gap-1"
              >
                <ChevronDown size={14} />
                Show more
              </button>
            </>
          ) : (
            <>
              <p>{accommodation.description}</p>
              {shouldShowExpand && (
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-brand-primary hover:underline mt-1 flex items-center gap-1"
                >
                  <ChevronUp size={14} />
                  Show less
                </button>
              )}
            </>
          )}
        </div>
      )}

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
  );
}
