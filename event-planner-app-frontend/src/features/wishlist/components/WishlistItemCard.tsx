import {
  Calendar,
  Edit,
  MapPin,
  Trash,
  Copy,
  ExternalLink,
  MoreVertical,
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
  const { openMenu, isMenuOpen, menuContainerRef, openButtonRef } = useMenu({
    closeOnClick: true,
  });

  const handleCopyAddress = () => {
    if (!item.address) return;
    navigator.clipboard.writeText(item.address);
    toast.info("Copied!");
  };

  const handleOpenInMaps = () => {
    if (!item.address) return;

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name)},${encodeURIComponent(item.address)}`,
      "_blank",
    );
  };

  return (
    <div
      className={`p-2.5 rounded-lg border text-xs relative ${
        item.isPromoted
          ? " bg-brand-primary/5 border-brand-primary/20"
          : " border-surface-border bg-surface-muted"
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex justify-between w-full">
          <h4 className="font-semibold text-text-main pr-10">{item.name}</h4>
          <button
            ref={openButtonRef}
            className="p-1 hover:bg-surface-muted rounded transition-colors text-text-secondary"
            onClick={openMenu}
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      <div className="">
        {item.address && (
          <p className="text-text-secondary flex items-center gap-1.5 mt-0.5">
            <MapPin size={10} className="shrink-0 -mb-1/2" />
            <span>{item.address}</span>
          </p>
        )}
        {item.description && (
          <p className="text-[10px] text-text-secondary mt-1 italic">
            "{item.description}"
          </p>
        )}
      </div>
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
              {!item.isPromoted && (
                <button
                  ref={scheduleButtonRef}
                  onClick={(e) => {
                    onScheduleClick();
                    e.stopPropagation();
                  }}
                  title="Schedule Event"
                  className="btn-menu  text-left flex gap-2 items-center"
                >
                  <Calendar size={16} /> Schedule
                </button>
              )}
              <button
                className="btn-menu text-left flex gap-2 items-center"
                title="Edit activity"
                onClick={() => editItem(item)}
                {...editButtonProps}
                ref={editButtonRef}
              >
                <Edit size={16} /> Edit
              </button>
              <button
                onClick={onDeleteClick}
                className="btn-menu text-error text-left flex gap-2 items-center"
              >
                <Trash size={16} />
                Delete
              </button>
            </>
          )}
        </div>
      )}
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
        onScheduleClick={() => {
          openMenu();
        }}
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
