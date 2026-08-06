import { useState } from "react";
import {
  MapPin,
  Calendar,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  MoreVertical,
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
import useMenu from "../../../hooks/useMenu";
import { canUserEdit } from "../../users/utils";

interface AccommodationCardProps {
  accommodation: Accommodation;
  deleteFuncProps?: { onSuccess?: () => void };
}

// TODO: Add dropdown menu for edit, delete and location actions

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

  const { openMenu, isMenuOpen, menuContainerRef, openButtonRef } = useMenu({
    closeOnClick: true,
  });

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

  const handleCopyAddress = () => {
    if (!accommodation.address) return;
    navigator.clipboard.writeText(accommodation.address);
    toast.info("Copied!");
  };

  const handleOpenInMaps = () => {
    if (!accommodation.address) return;

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(accommodation.name)},${encodeURIComponent(accommodation.address)}`,
      "_blank",
    );
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

  const editable = canUserEdit(trip.role);

  return (
    <div className="card p-4 space-y-3 relative">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex gap- justify-between">
            <h3 className="font-semibold text-text-main text-lg">
              {accommodation.name}
            </h3>
            <button
              ref={openButtonRef}
              className="p-1 hover:bg-surface-muted rounded transition-colors text-text-secondary"
              onClick={openMenu}
            >
              <MoreVertical size={16} />
            </button>
          </div>
          <div className="flex items-center gap-2 text-text-secondary text-sm mt-1">
            <MapPin size={14} className="shrink-0" />
            <span>{accommodation.address}</span>
          </div>
          <div className="flex items-center gap-2 text-text-secondary text-sm mt-1">
            <Calendar size={14} />
            <span>
              {formatDateRange(accommodation.startDate, accommodation.endDate)}
            </span>
          </div>
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

      {isMenuOpen && (
        <div
          ref={menuContainerRef}
          className="absolute top-8 right-2 px-1 bg-surface rounded-md shadow-lg z-10 flex flex-col text-sm min-w-[160px]"
        >
          <button
            onClick={handleCopyAddress}
            className="btn-menu text-left flex gap-2 items-center"
          >
            <Copy size={16} />
            Copy Address
          </button>
          <button
            onClick={handleOpenInMaps}
            className="btn-menu text-left flex gap-2 items-center"
          >
            <ExternalLink size={16} />
            Open in Maps
          </button>
          {editable && (
            <>
              <button
                className="btn-menu text-left flex gap-2 items-center"
                title="Edit activity"
                onClick={() => handleUpdate(accommodation)}
              >
                <Edit2 size={16} /> Edit
              </button>
              <button
                onClick={() => handleDelete(accommodation)}
                className="btn-menu text-error text-left flex gap-2 items-center"
              >
                <Trash2 size={16} />
                Delete
              </button>
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
