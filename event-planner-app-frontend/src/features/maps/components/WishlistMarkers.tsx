import { useParams } from "react-router";
import { useGetWishlistsQuery } from "../../wishlist/services/wishlistApiSlice";
import type { WishlistItem } from "../../wishlist/types";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../store";
import WishlistMarker from "./WishlistMarker";
import { getWishlistColor } from "../../wishlist/utils";
import { setSelectedWishlistItem } from "../service/mapSlice";
import { X } from "lucide-react";
import WishlistItemCard from "../../wishlist/components/WishlistItemCard";
import { canUserEdit } from "../../users/utils";
import { useGetTripQuery } from "../../trips/services/tripsApiSlice";

export default function WishlistMarkers() {
  const tripId = Number(useParams().tripId);
  const { data } = useGetTripQuery(tripId);
  const trip = data?.data;
  const dispatch = useDispatch();
  const { selectedWishlistItem, hiddenWishlistIds } = useSelector(
    (state: RootState) => state.map,
  );
  const { data: wishlistsResponse } = useGetWishlistsQuery(tripId);
  const wishlists = wishlistsResponse?.data ?? [];

  const wishlistIndexById: Record<number, number> = {};
  wishlists.forEach((w, i) => {
    wishlistIndexById[w.id] = i;
  });

  const mappableWishlistItems: WishlistItem[] = wishlists
    .filter((w) => !hiddenWishlistIds.includes(w.id))
    .flatMap((w) =>
      w.items
        .filter(
          (item) =>
            !item.isPromoted && item.latitude != null && item.longitude != null,
        )
        .map((item) => ({ ...item, wishlistId: w.id })),
    );

  if (!trip) return null;

  return (
    <>
      {mappableWishlistItems.map((item) => (
        <WishlistMarker
          key={item.id}
          item={item}
          position={{ lat: item.latitude!, lng: item.longitude! }}
          color={getWishlistColor(wishlistIndexById[item.wishlistId] ?? 0)}
          onSelect={(item) => dispatch(setSelectedWishlistItem(item))}
          selected={selectedWishlistItem?.id === item.id}
        />
      ))}

      {selectedWishlistItem && (
        <div className={`z-2 absolute bottom-0 px-2 md:px-4 pb-5 w-full`}>
          <button
            onClick={() => dispatch(setSelectedWishlistItem(null))}
            className="z-1 absolute btn-secondary bg-canvas p-1 right-1 -top-3 md:-top-4"
          >
            <X size={20} />
          </button>
          <WishlistItemCard
            item={selectedWishlistItem}
            key={selectedWishlistItem.id}
            editable={canUserEdit(trip.role)}
            onEdit={() => dispatch(setSelectedWishlistItem(null))}
          />
        </div>
      )}
    </>
  );
}
