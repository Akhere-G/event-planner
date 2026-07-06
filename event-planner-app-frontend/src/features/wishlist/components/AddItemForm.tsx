import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { LocationInput } from "../../../components";
import { useCreateWishlistItemMutation } from "../services/wishlistApiSlice";
import { isFetchBaseQueryError } from "../../api/utils";
import type { CityBounds } from "../../maps/types";

interface AddItemFormProps {
  itineraryId: number;
  categoryId: number;
  cityBounds: CityBounds;
  onSuccess?: () => void;
  onCancel: () => void;
}

export default function AddItemForm({
  itineraryId,
  categoryId,
  cityBounds,
  onSuccess = () => {},
  onCancel,
}: AddItemFormProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [placeId, setPlaceId] = useState<string | undefined>(undefined);

  const [createItem] = useCreateWishlistItemMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      await createItem({
        itineraryId,
        categoryId,
        name: name.trim(),
        address: address.trim() || undefined,
        description: description.trim() || undefined,
        latitude,
        longitude,
        placeId,
      }).unwrap();

      toast.success("Wishlist item added!");
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
      onSubmit={handleSubmit}
      className="p-3 bg-surface-muted rounded-lg space-y-2 border border-surface-border"
    >
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-bold text-text-main">New Activity</span>
        <button
          type="button"
          onClick={onCancel}
          className="text-text-secondary hover:text-text-primary"
        >
          <X size={14} />
        </button>
      </div>

      <div className="mb-2">
        <LocationInput
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
          inputClassNames="text-xs px-2 py-1 h-8 rounded-md"
          placeholder="Search with Google..."
        />
      </div>

      <input
        type="text"
        placeholder="Activity Name (required)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-2 py-1 rounded-md border border-surface-border bg-surface text-xs"
        required
      />
      <input
        type="text"
        placeholder="Address (optional)"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="w-full px-2 py-1 rounded-md border border-surface-border bg-surface text-xs"
      />
      <textarea
        placeholder="Insider tips or description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full px-2 py-1 rounded-md border border-surface-border bg-surface text-xs h-12 resize-none"
      />
      <button type="submit" className="w-full btn-primary py-1.5 text-xs">
        Add to List
      </button>
    </form>
  );
}
