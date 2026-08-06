import {
  Calendar,
  Edit,
  MapPin,
  Trash,
  Copy,
  ExternalLink,
  MoreVertical,
  Eye,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import {
  useDeleteWishlistItemMutation,
  usePromoteWishlistItemMutation,
  useVoteForWishlistItemMutation,
} from "../services/wishlistApiSlice";
import { isFetchBaseQueryError } from "../../api/utils";
import PromoteItemModal from "./PromoteItemModal";
import ConfirmModal from "../../../components/ConfirmModal";
import type { VoteForWishlistItemPayload, WishlistItem } from "../types";
import useMenu from "../../../hooks/useMenu";
import { useDispatch, useSelector } from "react-redux";
import {
  setIsMapView,
  setSelectedWishlistItem,
} from "../../maps/service/mapSlice";
import { useParams } from "react-router";
import type { RootState } from "../../../store";

interface WishlistItemViewProps {
  tripId: number;
  item: WishlistItem;
  editable: boolean;
  onScheduleClick: () => void;
  onDeleteClick: () => void;
  scheduleButtonRef: React.Ref<HTMLButtonElement>;
  editItem: (item: WishlistItem) => void;
  editButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  editButtonRef?: React.Ref<HTMLButtonElement>;
  voteForItem: (payload: VoteForWishlistItemPayload) => void;
  isVoteLoading: boolean;
  userDidUpvote: boolean;
  userDidDownvote: boolean;
}

// TODO: Add dropdown menu for edit, delete and location actions

function WishlistItemView({
  tripId,

  item,
  editable,
  onScheduleClick,
  onDeleteClick,
  scheduleButtonRef,
  editItem,
  editButtonProps,
  editButtonRef,
  voteForItem,
  isVoteLoading,
  userDidUpvote,
  userDidDownvote,
}: WishlistItemViewProps) {
  const { openMenu, isMenuOpen, menuContainerRef, openButtonRef } = useMenu({
    closeOnClick: true,
  });

  const dispatch = useDispatch();

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

  const handleView = () => {
    dispatch(setSelectedWishlistItem(item));
    dispatch(setIsMapView(true));
  };

  return (
    <div
      className={`p-2.5 rounded-lg border text-xs relative ${
        item.isPromoted
          ? " bg-surface-muted border border-brand-primary/20"
          : " border-surface-border bg-surface-muted"
      }`}
    >
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

      <div className="flex gap-2 mt-2">
        <button
          className={`p-1 group hover:bg-success/5 hover:text-success flex items-center gap-1 transition-colors duration-300 ${userDidUpvote ? "bg-success/5 text-success" : ""}`}
          onClick={() =>
            voteForItem({
              tripId,
              wishlistId: item.wishlistId,
              wishlistItemId: item.id,
              vote: 1,
            })
          }
          disabled={isVoteLoading}
        >
          <ThumbsUp
            size={16}
            className="group-hover:text-success transition-colors duration-300 "
          />{" "}
          {item.votes.reduce(
            (prev, curr) => prev + (curr.isThumbsUp ? 1 : 0),
            0,
          )}
        </button>

        <button
          className={`p-1 group hover:bg-error/5 hover:text-error flex items-center gap-1 transition-colors duration-300 ${userDidDownvote ? "bg-error/5 text-error" : ""}`}
          onClick={() =>
            voteForItem({
              tripId,
              wishlistId: item.wishlistId,
              wishlistItemId: item.id,
              vote: -1,
            })
          }
          disabled={isVoteLoading}
        >
          <ThumbsDown
            size={16}
            className="group-hover:text-error transition-colors duration-300"
          />{" "}
          {item.votes.reduce(
            (prev, curr) => prev + (!curr.isThumbsUp ? 1 : 0),
            0,
          )}
        </button>
      </div>
      {isMenuOpen && (
        <div
          ref={menuContainerRef}
          className="absolute top-8 right-2 px-1 bg-surface rounded-md shadow-lg z-10 flex flex-col text-sm min-w-[160px]"
        >
          <button
            onClick={handleView}
            className="btn-menu text-left flex gap-2 items-center"
          >
            <Eye size={16} />
            View
          </button>
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
  wishlistId,
  editable,
  startDate,
  endDate,
  editItem,
  editButtonProps,
  editButtonRef,
}: WishlistItemCardProps) {
  const tripId = Number(useParams()?.tripId);
  const { isMenuOpen, openMenu, closeMenu, openButtonRef } = useMenu();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [deleteItem, { isLoading: isDeleting }] =
    useDeleteWishlistItemMutation();
  const [promoteItem] = usePromoteWishlistItemMutation();
  const [voteForItem, { isLoading: isVoteLoading }] =
    useVoteForWishlistItemMutation();
  const userId = useSelector((state: RootState) => state.auth.userId);
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

  const userDidUpvote = item.votes.some(
    (vote) => vote.user.id === userId && vote.isThumbsUp,
  );
  const userDidDownvote = item.votes.some(
    (vote) => vote.user.id === userId && !vote.isThumbsUp,
  );

  return (
    <>
      <WishlistItemView
        tripId={tripId}
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
        voteForItem={voteForItem}
        isVoteLoading={isVoteLoading}
        userDidUpvote={userDidUpvote}
        userDidDownvote={userDidDownvote}
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
