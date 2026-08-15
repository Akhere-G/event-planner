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
import { useState } from "react";
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
import { useDispatch, useSelector } from "react-redux";
import {
  setIsMapView,
  setSelectedWishlistItem,
} from "../../maps/service/mapSlice";
import { useParams } from "react-router";
import type { RootState } from "../../../store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import AddItemForm from "./AddItemForm";
import { CITY_RADIUS } from "../../maps/constants";
import { useGetTripQuery } from "../../trips/services/tripsApiSlice";

interface WishlistItemViewProps {
  tripId: number;
  item: WishlistItem;
  editable: boolean;
  onScheduleClick: () => void;
  onDeleteClick: () => void;
  editItem: () => void;
  voteForItem: (payload: VoteForWishlistItemPayload) => void;
  isVoteLoading: boolean;
  userDidUpvote: boolean;
  userDidDownvote: boolean;
}

// TODO: Put schedule button on the bottom right corner

function WishlistItemView({
  tripId,
  item,
  editable,
  onScheduleClick,
  onDeleteClick,
  editItem,
  voteForItem,
  isVoteLoading,
  userDidUpvote,
  userDidDownvote,
}: WishlistItemViewProps) {
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
        <DropdownMenu>
          <DropdownMenuTrigger className="p-1 hover:bg-surface-muted rounded transition-colors text-text-secondary">
            <MoreVertical size={16} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={handleView}
              className="flex gap-2 items-center"
            >
              <Eye size={16} />
              View
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleCopyAddress}
              className="flex gap-2 items-center"
            >
              <Copy size={16} />
              Copy Address
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleOpenInMaps}
              className="flex gap-2 items-center"
            >
              <ExternalLink size={16} />
              Open in Maps
            </DropdownMenuItem>
            {editable && (
              <>
                {!item.isPromoted && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      onScheduleClick();
                      e.stopPropagation();
                    }}
                    className="flex gap-2 items-center"
                  >
                    <Calendar size={16} /> Schedule
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="flex gap-2 items-center"
                  onClick={editItem}
                >
                  <Edit size={16} /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onDeleteClick}
                  className="flex gap-2 items-center text-error"
                >
                  <Trash size={16} />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
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
    </div>
  );
}

interface WishlistItemCardProps {
  item: WishlistItem;
  editable: boolean;
  onEdit?: () => void;
}

export default function WishlistItemCard({
  item,
  editable,
  onEdit,
}: WishlistItemCardProps) {
  const tripId = Number(useParams()?.tripId);
  const { data } = useGetTripQuery(tripId);
  const trip = data?.data;
  const [isEditingWishlistItem, setIsEditingWishlistItem] = useState(false);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [deleteItem, { isLoading: isDeleting }] =
    useDeleteWishlistItemMutation();
  const [promoteItem] = usePromoteWishlistItemMutation();
  const [voteForItem, { isLoading: isVoteLoading }] =
    useVoteForWishlistItemMutation();
  const userId = useSelector((state: RootState) => state.auth.userId);
  const handleDelete = async () => {
    try {
      await deleteItem({
        tripId,
        wishlistId: item.wishlistId,
        itemId: item.id,
      }).unwrap();
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
        wishlistId: item.wishlistId,
        itemId: item.id,
        startAt,
        endAt,
      }).unwrap();

      setIsScheduleModalOpen(false);
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
  const dispatch = useDispatch();

  if (!trip) return null;

  const cityBounds = {
    north: trip.latitude + CITY_RADIUS,
    south: trip.latitude - CITY_RADIUS,
    east: trip.longitude + CITY_RADIUS,
    west: trip.longitude - CITY_RADIUS,
  };

  return (
    <>
      <WishlistItemView
        tripId={tripId}
        item={item}
        editable={editable}
        onScheduleClick={() => {
          setIsScheduleModalOpen(true);
        }}
        onDeleteClick={() => setShowDeleteConfirm(true)}
        editItem={() => setIsEditingWishlistItem(true)}
        voteForItem={voteForItem}
        isVoteLoading={isVoteLoading}
        userDidUpvote={userDidUpvote}
        userDidDownvote={userDidDownvote}
      />

      {isScheduleModalOpen && (
        <PromoteItemModal
          item={item}
          startDate={trip.startDate}
          endDate={trip.endDate}
          onSchedule={handleSchedule}
          open={isScheduleModalOpen}
          onOpenChange={setIsScheduleModalOpen}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmModal
          title="Remove wishlist item"
          confirmText="Remove"
          confirmAction={handleDelete}
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          confirmButtonProps={{ disabled: isDeleting }}
        >
          <p className="py-4 text-sm text-text-secondary">
            Are you sure you want to remove{" "}
            <strong className="text-text-main">{item.name}</strong> from the
            wishlist?
          </p>
        </ConfirmModal>
      )}
      {isEditingWishlistItem && (
        <ConfirmModal
          open={isEditingWishlistItem}
          onOpenChange={setIsEditingWishlistItem}
          title="Edit wishlist item"
          hideButtons
        >
          <AddItemForm
            cityBounds={cityBounds}
            onCancel={() => {
              setIsEditingWishlistItem(false);
            }}
            selectedItem={item}
            tripId={trip.id}
            wishlistId={item.wishlistId}
            onSuccess={() => {
              setIsEditingWishlistItem(false);
              dispatch(setSelectedWishlistItem(null));
              onEdit?.();
            }}
          />
        </ConfirmModal>
      )}
    </>
  );
}
