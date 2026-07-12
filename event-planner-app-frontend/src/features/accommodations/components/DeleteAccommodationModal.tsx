import ConfirmModal from "../../../components/ConfirmModal";
import type { Accommodation } from "../types";

interface DeleteAccommodationModalProps {
  isOpen: boolean;
  onClose: () => void;
  accommodation: Accommodation | null;
  onConfirm: () => void;
}

export default function DeleteAccommodationModal({
  isOpen,
  onClose,
  accommodation,
  onConfirm,
}: DeleteAccommodationModalProps) {
  if (!isOpen) return null;

  return (
    <ConfirmModal
      closeModal={onClose}
      title="Delete Accommodation"
      confirmText="Delete Accomodation."
      confirmAction={onConfirm}
    >
      <div className="p-4">
        <p className="text-text-main mb-2">
          Are you sure you want to delete this accommodation?
        </p>
        {accommodation && (
          <div className="bg-surface-muted p-3 rounded-md">
            <p className="font-semibold text-text-main">{accommodation.name}</p>
            <p className="text-sm text-text-secondary">
              {accommodation.address}
            </p>
          </div>
        )}
        <p className="text-text-secondary text-sm mt-3">
          This action cannot be undone.
        </p>
      </div>
    </ConfirmModal>
  );
}
