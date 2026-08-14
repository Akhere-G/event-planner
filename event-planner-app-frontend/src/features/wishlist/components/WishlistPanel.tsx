import { useState } from "react";
import { useGetWishlistsQuery } from "../services/wishlistApiSlice";
import { canUserEdit } from "../../users/utils";
import { ListPlus } from "lucide-react";
import type { Wishlist } from "../types";
import AddWishlistForm from "./AddWishlistForm";
import WishlistCard from "./WishlistCard";
import { getCityBounds } from "../../maps/utils";

interface WishlistPanelProps {
  tripId: number;
  role: string;
  startDate: string;
  endDate: string;
  latitude: number;
  longitude: number;
}

export default function WishlistPanel({
  tripId,
  role,
  startDate,
  endDate,
  latitude,
  longitude,
}: WishlistPanelProps) {
  const { data: response, isLoading } = useGetWishlistsQuery(tripId);
  const wishlists = response?.data || [];

  const [showWishlistForm, setShowWishlistForm] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<
    Record<number, boolean>
  >({});

  const editable = canUserEdit(role);

  const cityBounds = getCityBounds({ latitude, longitude });

  const toggleWishlist = (catId: number) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: prev[catId] !== undefined ? !prev[catId] : false,
    }));
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center text-text-secondary">
        Loading Wishlists...
      </div>
    );
  }

  return (
    <div className=" w-full flex flex-col min-h-[60vh] bg-surface">
      <div
        className={`flex items-center justify-between ${editable ? "border-b pb-3 mb-4 " : ""} border-surface-border`}
      >
        {editable && (
          <button
            onClick={() => setShowWishlistForm(!showWishlistForm)}
            className="btn-secondary px-3 py-1.5 flex items-center gap-1.5 text-xs"
          >
            <ListPlus size={14} />
            Add List
          </button>
        )}
      </div>

      {showWishlistForm && (
        <AddWishlistForm
          tripId={tripId}
          onSuccess={() => setShowWishlistForm(false)}
        />
      )}

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {wishlists.length === 0 ? (
          <div className="text-center py-8 text-text-secondary text-sm">
            No lists created yet. Create a wishlist to start planning.
          </div>
        ) : (
          wishlists.map((wishlist: Wishlist) => (
            <WishlistCard
              role={role}
              key={wishlist.id}
              wishlist={wishlist}
              tripId={tripId}
              editable={editable}
              isExpanded={expandedCategories[wishlist.id] ?? true}
              onToggle={() => toggleWishlist(wishlist.id)}
              cityBounds={cityBounds}
              startDate={startDate}
              endDate={endDate}
            />
          ))
        )}
      </div>
    </div>
  );
}
