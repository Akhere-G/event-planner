import ConfirmModal from "../../../components/ConfirmModal";
import AccommodationForm from "./AccommodationForm";
import type { Accommodation } from "../types";
import type { CityBounds } from "../../maps/types";

interface UpdateAccommodationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accommodation: Accommodation | null;
  tripId: number;
  cityBounds: CityBounds;
  tripStart: string;
  tripEnd: string;
}

export default function UpdateAccommodationModal({
  open,
  onOpenChange,
  accommodation,
  tripId,
  cityBounds,
  tripStart,
  tripEnd,
}: UpdateAccommodationModalProps) {
  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Update Accommodation"
      hideButtons
    >
      {accommodation && (
        <AccommodationForm
          key={accommodation.id}
          tripId={tripId}
          cityBounds={cityBounds}
          selectedAccommodation={accommodation}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
          tripStart={tripStart}
          tripEnd={tripEnd}
        />
      )}
    </ConfirmModal>
  );
}
