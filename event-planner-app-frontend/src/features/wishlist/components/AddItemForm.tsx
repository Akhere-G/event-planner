import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { LocationInput } from "../../../components";
import {
  useCreateWishlistItemMutation,
  useUpdateWishlistItemMutation,
} from "../services/wishlistApiSlice";
import { isFetchBaseQueryError } from "../../api/utils";
import type { CityBounds } from "../../maps/types";
import type { WishlistItem } from "../types";
import { usePostHog } from "@posthog/react";

interface AddItemFormProps {
  tripId: number;
  wishlistId: number;
  cityBounds: CityBounds;
  onSuccess?: () => void;
  onCancel: () => void;
  selectedItem: WishlistItem | null;
}

export default function AddItemForm({
  tripId,
  wishlistId,
  cityBounds,
  onSuccess = () => {},
  onCancel,
  selectedItem,
}: AddItemFormProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState<string | undefined>("");
  const [description, setDescription] = useState<string | undefined>("");
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [placeId, setPlaceId] = useState<string | undefined>(undefined);
  const [updateItem] = useUpdateWishlistItemMutation();

  const [createItem] = useCreateWishlistItemMutation();
  const posthog = usePostHog();

  const formId = `additemform-${wishlistId}`;

  useEffect(() => {
    function setInitialState() {
      if (!selectedItem) {
        return;
      }
      setName(selectedItem.name);
      setAddress(selectedItem.address);
      setDescription(selectedItem.description);
      setLatitude(selectedItem.latitude);
      setLongitude(selectedItem.longitude);
      setPlaceId(selectedItem.placeId);
    }

    setInitialState();

    const el = document.getElementById(formId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedItem, formId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      if (selectedItem) {
        await updateItem({
          itemId: selectedItem.id,
          tripId,
          wishlistId,
          name,
          address,
          description,
          latitude,
          longitude,
          placeId,
        }).unwrap();
        toast.success("Wishlist item updated!");
      } else {
        await createItem({
          tripId,
          wishlistId,
          name: name.trim(),
          address: address?.trim() || undefined,
          description: description?.trim() || undefined,
          latitude,
          longitude,
          placeId,
        }).unwrap();
        posthog?.capture("wishlist_item_created", {
          trip_id: tripId,
        });

        toast.success("Wishlist item added!");
      }

      onSuccess();
    } catch (err) {
      if (isFetchBaseQueryError(err)) {
        toast.error(
          (err.data as { message: string }).message ||
            "Failed to add wishlist item",
        );
      }
    }
  };

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      className="p-3 bg-surface-muted rounded-lg space-y-2 border border-surface-border"
    >
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-bold text-text-main">
          {selectedItem ? "Update Activity" : "New Activity"}
        </span>
        <button
          type="button"
          onClick={onCancel}
          className="text-text-secondary hover:text-text-primary p-2 -mr-2"
        >
          <X size={14} />
        </button>
      </div>

      <div className="mb-2">
        <LocationInput
          name="location"
          cityBounds={cityBounds}
          onPlaceSelect={(place) => {
            setName(place.name || "");
            setAddress(place.formatted_address || "");
            if (place.geometry?.location) {
              setLatitude(place.geometry.location.lat());
              setLongitude(place.geometry.location.lng());
            }
            setPlaceId(place.place_id);
          }}
          className="text-xs px-2 py-1 h-8 rounded-md bg-surface"
          placeholder="Search with Google..."
        />
      </div>

      <input
        type="text"
        placeholder="Activity Name (required)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-2 py-1 rounded-md text-xs"
        required
      />
      <input
        type="text"
        placeholder="Address (optional)"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="w-full px-2 py-1 rounded-md text-xs"
      />
      <textarea
        placeholder="Insider tips or description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full px-2 py-1 rounded-md text-xs h-12 resize-none"
      />
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary flex-1"
        >
          Cancel
        </button>
        <button type="submit" className="flex-1 btn-primary py-1.5">
          {selectedItem ? "Update Item" : "Add to List"}
        </button>
      </div>
    </form>
  );
}
