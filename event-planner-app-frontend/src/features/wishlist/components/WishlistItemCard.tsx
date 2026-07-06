import { Calendar, MapPin, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useDeleteWishlistItemMutation,
  usePromoteWishlistItemMutation,
} from "../services/wishlistApiSlice";
import { isFetchBaseQueryError } from "../../api/utils";
import PromoteItemModal from "./PromoteItemModal";
import ConfirmModal from "../../../components/ConfirmModal";
import type { WishlistItem } from "../types";
import useMenu from "../../../hooks/useMenu";

interface WishlistItemViewProps {
  item: WishlistItem;
  editable: boolean;
  onScheduleClick: () => void;
  onDeleteClick: () => void;
  scheduleButtonRef: React.Ref<HTMLButtonElement>;
}

function WishlistItemView({
  item,
  editable,
  onScheduleClick,
  onDeleteClick,
  scheduleButtonRef,
}: WishlistItemViewProps) {
  return (
    <div
      className={`p-2.5 rounded-lg border text-xs relative ${
        item.isPromoted
          ? "bg-brand-primary/5 border-brand-primary/20 opacity-75"
          : "border-surface-border bg-surface-muted/30"
      }`}
    >
      <div className="flex justify-between items-start gap-1">
        <div>
          <h4 className="font-semibold text-text-main pr-10">{item.name}</h4>
          {item.address && (
            <p className=" text-text-secondary flex items-center gap-1 mt-0.5">
              <MapPin size={10} className="shrink-0" />
              <span className="truncate">{item.address}</span>
            </p>
          )}
          {item.description && (
            <p className="text-[10px] text-text-secondary mt-1 italic">
              "{item.description}"
            </p>
          )}
        </div>

        {editable && (
          <div className="flex items-center gap-1.5 shrink-0">
            {!item.isPromoted ? (
              <button
                ref={scheduleButtonRef}
                onClick={onScheduleClick}
                title="Schedule Event"
                className="p-1 rounded bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white transition-colors cursor-pointer"
              >
                <Calendar size={12} />
              </button>
            ) : (
              <span className="px-1.5 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold">
                Added
              </span>
            )}
            <button
              onClick={onDeleteClick}
              title="Delete activity"
              className="p-1 rounded text-text-secondary hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
            >
              <Trash size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface WishlistItemCardProps {
  item: WishlistItem;
  tripId: number;
  wishlistId: number;
  editable: boolean;
  startDate: string;
  endDate: string;
}

export default function WishlistItemCard({
  item,
  tripId,
  wishlistId,
  editable,
  startDate,
  endDate,
}: WishlistItemCardProps) {
  const { isMenuOpen, openMenu, closeMenu, openButtonRef } = useMenu();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [deleteItem, { isLoading: isDeleting }] = useDeleteWishlistItemMutation();
  const [promoteItem] = usePromoteWishlistItemMutation();

  const handleDelete = async () => {
    try {
      await deleteItem({ tripId, wishlistId, itemId: item.id }).unwrap();
      toast.success("Item removed from wishlist.");
      setShowDeleteConfirm(false);
    } catch {
      toast.error("Failed to remove item");
    }
  };

  const handleSchedule = async (startAt: string, endAt: string) => {
    try {
      await promoteItem({
        tripId,
        wishlistId,
        itemId: item.id,
        startAt,
        endAt,
      }).unwrap();

      closeMenu();
      toast.success("Successfully scheduled event!");
    } catch (err) {
      if (isFetchBaseQueryError(err)) {
        toast.error(
          (err.data as { message: string }).message ||
            "Failed to schedule event.",
        );
      }
    }
  };

  return (
    <>
      <WishlistItemView
        item={item}
        editable={editable}
        onScheduleClick={openMenu}
        onDeleteClick={() => setShowDeleteConfirm(true)}
        scheduleButtonRef={openButtonRef}
      />

      {isMenuOpen && (
        <PromoteItemModal
          item={item}
          startDate={startDate}
          endDate={endDate}
          onSchedule={handleSchedule}
          closeMenu={closeMenu}
          isMenuOpen={isMenuOpen}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmModal
          title="Remove wishlist item"
          confirmText="Remove"
          confirmAction={handleDelete}
          closeModal={() => setShowDeleteConfirm(false)}
          confirmButtonProps={{ disabled: isDeleting }}
        >
          <p className="p-4 text-sm text-text-secondary">
            Are you sure you want to remove{" "}
            <strong className="text-text-main">{item.name}</strong> from the
            wishlist?
          </p>
        </ConfirmModal>
      )}
    </>
  );
}
