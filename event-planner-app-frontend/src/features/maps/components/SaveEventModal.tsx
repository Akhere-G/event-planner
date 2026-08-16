import { useState } from "react";
import { ConfirmModal, FormInput } from "../../../components";
import type { EventSearchResult } from "../types";
import type { EventSchema } from "../../events/schemas/eventSchema";
import type { CreateWishlistItemPayload, Wishlist } from "../../wishlist/types";
import { toast } from "sonner";

export default function SaveEventModal({
  open,
  event,
  dates,
  wishlists,
  isLoading,
  onOpenChange,
  onSaveEvent,
  onSaveWishlist,
}: {
  open: boolean;
  event: EventSearchResult;
  dates: { title: string; value: string }[];
  wishlists: Wishlist[];
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveEvent: (event: EventSchema) => Promise<void>;
  onSaveWishlist: (
    payload: Omit<CreateWishlistItemPayload, "tripId">,
  ) => Promise<void>;
}) {
  const [selectedDate, setSelectedDate] = useState("");
  const [startAt, setStartAt] = useState("12:00");
  const [endAt, setEndAt] = useState("13:00");
  const [selectedWishlist, setSelectedWishlist] = useState<Wishlist | null>(
    null,
  );
  const [errors, setErrors] = useState({
    startAt: "",
    endAt: "",
    general: "",
  });

  const confirmText = selectedDate
    ? `Save to ${new Date(selectedDate).toLocaleDateString()}`
    : selectedWishlist
      ? `Save to ${selectedWishlist.name}`
      : "Select date or wishlist";

  const isDisabled = (!selectedDate && !selectedWishlist) || isLoading;

  const handleSave = async () => {
    setErrors({ startAt: "", endAt: "", general: "" });

    if (selectedDate) {
      if (endAt < startAt) {
        setErrors((prev) => ({
          ...prev,
          endAt: "must be after Start At",
        }));
        return;
      }

      await onSaveEvent({
        name: event.name,
        address: event.address,
        category: event.category,
        latitude: event.latitude,
        longitude: event.longitude,
        startAt: `${selectedDate} ${startAt}`,
        endAt: `${selectedDate} ${endAt}`,
      });
      toast.success("Added to itinerary.");
      onOpenChange(false);
    } else if (selectedWishlist) {
      await onSaveWishlist({
        name: event.name,
        address: event.address,
        latitude: event.latitude,
        longitude: event.longitude,
        wishlistId: selectedWishlist.id,
        placeId: event.placeId,
      });
      toast.success("Added to wishlist.");
      onOpenChange(false);
    }
  };

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      confirmAction={handleSave}
      title={`Save ${event.name}`}
      confirmBtnClasses="btn-primary flex-1"
      confirmText={confirmText}
      confirmButtonProps={{ disabled: isDisabled }}
    >
      <div className="p-4 space-y-4">
        <div>
          <h4 className="mb-4">Save to date</h4>
          <div className="flex flex-wrap gap-2">
            {dates.map((date) => (
              <button
                key={date.value}
                onClick={() => {
                  setSelectedDate(date.value);
                  setSelectedWishlist(null);
                }}
                className={`border-2 border-brand-primary text-brand-primary font-bold px-6 py-2 flex-1/4 hover:bg-brand-primary hover:text-text-primary ${
                  date.value === selectedDate
                    ? "bg-brand-primary text-text-primary"
                    : ""
                }`}
              >
                {date.title}
              </button>
            ))}
          </div>
          <div className="flex mt-4 gap-2">
            <FormInput
              type="time"
              name="startAt"
              label="Start At"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              errorMessage={errors.startAt}
              formClassNames="flex-1"
            />
            <FormInput
              type="time"
              name="endAt"
              label="End At"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              errorMessage={errors.endAt}
              formClassNames="flex-1"
            />
          </div>
        </div>

        <hr />

        <div>
          <h4 className="mb-4">Save to wishlist</h4>
          <div className="flex flex-wrap gap-2">
            {wishlists.map((wishlist) => (
              <button
                key={wishlist.id}
                onClick={() => {
                  setSelectedWishlist(wishlist);
                  setSelectedDate("");
                }}
                className={`border-2 border-brand-primary text-brand-primary font-bold px-6 py-2 hover:bg-brand-primary hover:text-text-primary ${
                  wishlist === selectedWishlist
                    ? "bg-brand-primary text-text-primary"
                    : ""
                }`}
              >
                {wishlist.name}
              </button>
            ))}
          </div>
        </div>

        {errors.general && (
          <p className="text-error text-sm">{errors.general}</p>
        )}
      </div>
    </ConfirmModal>
  );
}
