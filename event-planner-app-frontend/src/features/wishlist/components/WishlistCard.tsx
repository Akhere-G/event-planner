import { useState } from "react";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import AddItemForm from "./AddItemForm";
import WishlistItemCard from "./WishlistItemCard";
import type { Wishlist } from "../types";
import type { CityBounds } from "../../maps/types";
import { EditableText } from "../../../components";
import { canUserEdit } from "../../users/utils";
import { useUpdateWishlistMutation } from "../services/wishlistApiSlice";
import { isFetchBaseQueryError, type APIError } from "../../api/utils";
import { toast } from "sonner";

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

  return (
    <div className="border border-surface-border rounded-xl overflow-hidden bg-surface">
      <div className="w-full p-2 bg-surface-muted/50 ">
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
              onCancel={() => setIsAddingItem(false)}
            />
          )}

          {!wishlist.items || wishlist.items.length === 0 ? (
            <div className="text-center py-4 text-xs text-text-secondary">
              No activities added yet.
            </div>
          ) : (
            wishlist.items.map((item) => (
              <WishlistItemCard
                wishlistId={wishlist.id}
                key={item.id}
                item={item}
                tripId={tripId}
                editable={editable}
                startDate={startDate}
                endDate={endDate}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
