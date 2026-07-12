import { useRef } from "react";
import ConfirmModal from "../../../components/ConfirmModal";
import AccommodationForm from "./AccommodationForm";
import type { Accommodation } from "../types";
import type { CityBounds } from "../../maps/types";

interface UpdateAccommodationModalProps {
  isOpen: boolean;
  onClose: () => void;
  accommodation: Accommodation | null;
  tripId: number;
  cityBounds: CityBounds;
  tripStart: string;
  tripEnd: string;
}

export default function UpdateAccommodationModal({
  isOpen,
  onClose,
  accommodation,
  tripId,
  cityBounds,
  tripStart,
  tripEnd,
}: UpdateAccommodationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  return (
    <ConfirmModal
      closeModal={onClose}
      title="Update Accommodation"
      confirmText=""
      confirmAction={undefined}
      confirmBtnClasses=""
      modalRef={modalRef}
      hideButtons
    >
      {accommodation && (
        <AccommodationForm
          key={accommodation.id}
          tripId={tripId}
          cityBounds={cityBounds}
          selectedAccommodation={accommodation}
          onSuccess={onClose}
          onCancel={onClose}
          tripStart={tripStart}
          tripEnd={tripEnd}
        />
      )}
    </ConfirmModal>
  );
}
