import ConfirmModal from "../../../components/ConfirmModal";
import type { Accommodation } from "../types";

interface DeleteAccommodationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accommodation: Accommodation | null;
  onConfirm: () => void;
}

export default function DeleteAccommodationModal({
  open,
  onOpenChange,
  accommodation,
  onConfirm,
}: DeleteAccommodationModalProps) {
  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Accommodation"
      confirmText="Delete Accomodation."
      confirmAction={onConfirm}
    >
      <div className="py-4">
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
