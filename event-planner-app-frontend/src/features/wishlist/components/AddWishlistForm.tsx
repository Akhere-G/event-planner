import { useState } from "react";
import { toast } from "sonner";
import { isApiError, isFetchBaseQueryError } from "../../api/utils";
import { useCreateWishlistMutation } from "../services/wishlistApiSlice";
import { usePostHog } from "@posthog/react";

interface AddWishlistFormProps {
  tripId: number;
  onSuccess?: () => void;
}

export default function AddWishlistForm({
  tripId,
  onSuccess = () => {},
}: AddWishlistFormProps) {
  const [name, setName] = useState("");
  const [createWishlist] = useCreateWishlistMutation();
  const posthog = usePostHog();

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await createWishlist({ tripId, name: name.trim() }).unwrap();
      posthog?.capture("wishlist_created", {
        name: name.trim(),
        trip_id: tripId,
      });
      setName("");
      toast.success("Wishlist created!");
      onSuccess();
    } catch (err) {
      if (isFetchBaseQueryError(err)) {
        posthog?.captureException(err, {
          feature: "wishlist_creation",
          action: "wishlist_created",
        });
      }
      toast.error(isApiError(err) ? err.data.message : "Failed to create wishlist");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 p-3 bg-surface-muted rounded-xl flex gap-2"
    >
      <input
        type="text"
        placeholder="e.g., Cool Bars, Restaurants, sightseeing"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1 px-3 py-1.5 rounded-lg border border-surface-border bg-surface text-xs focus:ring-1 focus:ring-brand-primary"
        autoFocus
      />
      <button type="submit" className="btn-primary px-3 py-1.5 text-xs">
        Save
      </button>
    </form>
  );
}
