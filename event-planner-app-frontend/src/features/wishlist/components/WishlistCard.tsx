import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Plus,
  Trash,
} from "lucide-react";
import AddItemForm from "./AddItemForm";
import WishlistItemCard from "./WishlistItemCard";
import type { Wishlist, WishlistItem, WishlistItemVote } from "../types";
import type { CityBounds } from "../../maps/types";
import { ConfirmModal, EditableText } from "../../../components";
import { canUserEdit } from "../../users/utils";
import {
  useDeleteWishlistMutation,
  useUpdateWishlistMutation,
} from "../services/wishlistApiSlice";
import { isFetchBaseQueryError, type APIError } from "../../api/utils";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";

const sumVotes = (votes: WishlistItemVote[]) =>
  votes.reduce((prev, curr) => prev + (curr.isThumbsUp ? 1 : -1), 0);

interface WishlistCardProps {
  wishlist: Wishlist;
  tripId: number;
  editable: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  cityBounds: CityBounds;
  startDate: string;
  endDate: string;
  role: string;
}

export default function WishlistCard({
  wishlist,
  tripId,
  editable,
  isExpanded,
  onToggle,
  cityBounds,
  startDate,
  endDate,
  role,
}: WishlistCardProps) {
  const [name, setName] = useState(wishlist.name);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [updateWishlist] = useUpdateWishlistMutation();
  const [selectedItem, setSelectedItem] = useState<null | WishlistItem>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteWishlist, { isLoading: isDeleteLoading }] =
    useDeleteWishlistMutation();
  const updateWishlistName = async (name: string) => {
    const oldName = wishlist.name;
    try {
      setName(name);

      await updateWishlist({ name, tripId, wishlistId: wishlist.id }).unwrap();
    } catch (err) {
      if (isFetchBaseQueryError(err)) {
        const error = err as APIError;
        toast.error(error.data.message);
      } else {
        toast.error("Could not update wishlist name.");
      }

      setName(oldName);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteWishlist({ tripId, wishlistId: wishlist.id }).unwrap();
    } catch (err) {
      if (isFetchBaseQueryError(err)) {
        const error = err as APIError;

        toast.error(error.data.message);
      } else {
        toast.error("Could not delete wishlist");
      }
    }
  };

  const editItem = (item: WishlistItem) => {
    setSelectedItem(item);
    setIsAddingItem(true);
  };

  const items = [...wishlist.items];
  items.sort((a, b) => sumVotes(b.votes) - sumVotes(a.votes));
  return (
    <div className="relative border border-surface-border rounded-xl bg-surface">
      <div
        className={`w-full p-2 bg-surface-muted/50 rounded-xl flex items-center justify-between ${isExpanded ? "rounded-b-none!" : ""}`}
      >
        <div className="flex items-center gap-2 ">
          <button className="p-1" onClick={onToggle}>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <EditableText
            value={name}
            canEdit={canUserEdit(role)}
            setValue={updateWishlistName}
            textClassName="text-xs text-text-secondary"
            inputClassName="text-xs"
            emptyText="Change name"
          />
        </div>

        {editable && (
          <DropdownMenu>
            <DropdownMenuTrigger className="p-2">
              <MoreVertical size={16} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                disabled={isDeleteLoading}
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center gap-2 text-error"
              >
                <Trash size={16} /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {isExpanded && (
        <div className="p-3 space-y-2 border-t border-surface-border">
          {editable && !isAddingItem && (
            <button
              onClick={() => setIsAddingItem(true)}
              className="w-full border border-dashed border-surface-border py-1.5 rounded-lg text-xs font-semibold text-brand-primary flex items-center justify-center gap-1.5 hover:bg-brand-primary/5 transition-colors"
            >
              <Plus size={14} /> Add activity
            </button>
          )}

          {isAddingItem && (
            <AddItemForm
              tripId={tripId}
              wishlistId={wishlist.id}
              cityBounds={cityBounds}
              onSuccess={() => setIsAddingItem(false)}
              onCancel={() => {
                setIsAddingItem(false);
                setSelectedItem(null);
              }}
              selectedItem={selectedItem}
            />
          )}

          {!wishlist.items || wishlist.items.length === 0 ? (
            <div className="text-center py-4 text-xs text-text-secondary">
              No activities added yet.
            </div>
          ) : (
            items.map((item) => (
              <WishlistItemCard
                wishlistId={wishlist.id}
                key={item.id}
                item={item}
                tripId={tripId}
                editable={editable}
                startDate={startDate}
                endDate={endDate}
                editItem={editItem}
              />
            ))
          )}
        </div>
      )}

      {isDeleteModalOpen && (
        <ConfirmModal
          closeModal={() => setIsDeleteModalOpen(false)}
          confirmAction={confirmDelete}
          title={`Delete wishlist ${wishlist.name}?`}
        />
      )}
    </div>
  );
}
