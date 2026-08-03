import {
  Calendar,
  Edit,
  MapPin,
  Trash,
  Copy,
  ExternalLink,
} from "lucide-react";
import React, { useState } from "react";
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
  editItem: (item: WishlistItem) => void;
  editButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  editButtonRef?: React.Ref<HTMLButtonElement>;
}

// TODO: Add dropdown menu for edit, delete and location actions

function WishlistItemView({
  item,
  editable,
  onScheduleClick,
  onDeleteClick,
  scheduleButtonRef,
  editItem,
  editButtonProps,
  editButtonRef,
}: WishlistItemViewProps) {
  return (
    <div
      className={`p-2.5 rounded-lg border text-xs relative ${
        item.isPromoted
          ? "bg-brand-primary/5 border-brand-primary/20 opacity-85"
          : "border-surface-border bg-surface-muted"
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <div>
          <h4 className="font-semibold text-text-main pr-10">{item.name}</h4>
        </div>

        {editable && (
          <div className="flex items-center gap-1 shrink-0">
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
              className="ml-1 p-1 rounded text-text-secondary hover:text-info hover:bg-info/25 transition-colors cursor-pointer"
              title="Edit activity"
              onClick={() => editItem(item)}
              {...editButtonProps}
              ref={editButtonRef}
            >
              <Edit size={12} />
            </button>
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

      <div className="">
        {item.address && (
          <p className="text-text-secondary flex items-center gap-1.5 mt-0.5">
            <MapPin size={10} className="shrink-0 -mb-1/2" />
            <span>{item.address}</span>
            <button
              title="Copy Address"
              className="btn p-0.5 hover:bg-text-primary/10 rounded transition-colors text-text-primary"
              onClick={() => {
                navigator.clipboard.writeText(item.address!);
                toast.info("Copied!");
              }}
            >
              <Copy size={10} />
            </button>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name)},${encodeURIComponent(item.address)}`}
              target="_blank"
              rel="noreferrer"
              className="btn p-0.5 hover:bg-brand-primary/10 rounded transition-colors text-brand-primary"
              title="Open in Google Maps"
            >
              <ExternalLink size={10} />
            </a>
          </p>
        )}
        {item.description && (
          <p className="text-[10px] text-text-secondary mt-1 italic">
            "{item.description}"
          </p>
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
  editItem: (item: WishlistItem) => void;
  editButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  editButtonRef?: React.Ref<HTMLButtonElement>;
}

export default function WishlistItemCard({
  item,
  tripId,
  wishlistId,
  editable,
  startDate,
  endDate,
  editItem,
  editButtonProps,
  editButtonRef,
}: WishlistItemCardProps) {
  const { isMenuOpen, openMenu, closeMenu, openButtonRef } = useMenu();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [deleteItem, { isLoading: isDeleting }] =
    useDeleteWishlistItemMutation();
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
        editItem={editItem}
        editButtonProps={editButtonProps}
        editButtonRef={editButtonRef}
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
