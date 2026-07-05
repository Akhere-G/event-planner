import { useState } from "react";
import {
  useGetWishlistsQuery,
  useCreateCategoryMutation,
  useCreateWishlistItemMutation,
  useDeleteWishlistItemMutation,
  usePromoteWishlistItemMutation,
} from "../services/wishlistApiSlice";
import { canUserEdit } from "../../users/utils";
import { LocationInput } from "../../../components";
import {
  Plus,
  Trash,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  X,
  ListPlus,
} from "lucide-react";
import { toast } from "sonner";
import type { WishlistCategory, WishlistItem } from "../types";
import { isFetchBaseQueryError } from "../../api/utils";

interface WishlistPanelProps {
  itineraryId: number;
  role: string;
  startDate: string;
  endDate: string;
  latitude: number;
  longitude: number;
}

// TODO: Refactor into smaller components

export default function WishlistPanel({
  itineraryId,
  role,
  startDate,
  endDate,
  latitude,
  longitude,
}: WishlistPanelProps) {
  const { data: response, isLoading } = useGetWishlistsQuery(itineraryId);
  const categories = response?.data || [];

  const [createCategory] = useCreateCategoryMutation();
  const [createItem] = useCreateWishlistItemMutation();
  const [deleteItem] = useDeleteWishlistItemMutation();
  const [promoteItem] = usePromoteWishlistItemMutation();

  const [newCategoryName, setNewCategoryName] = useState("");
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<
    Record<number, boolean>
  >({});

  const [activeCategoryForNewItem, setActiveCategoryForNewItem] = useState<
    number | null
  >(null);
  const [itemName, setItemName] = useState("");
  const [itemAddress, setItemAddress] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemLat, setItemLat] = useState<number | undefined>(undefined);
  const [itemLng, setItemLng] = useState<number | undefined>(undefined);
  const [itemPlaceId, setItemPlaceId] = useState<string | undefined>(undefined);

  const [activeItemForPromotion, setActiveItemForPromotion] =
    useState<WishlistItem | null>(null);
  const [promoDate, setPromoDate] = useState("");
  const [promoStartTime, setPromoStartTime] = useState("10:00");
  const [promoEndTime, setPromoEndTime] = useState("11:00");

  const editable = canUserEdit(role);

  const toggleCategory = (catId: number) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      await createCategory({
        itineraryId,
        name: newCategoryName.trim(),
      }).unwrap();
      setNewCategoryName("");
      setShowCategoryForm(false);
      toast.success("Wishlist category created!");
    } catch {
      toast.error("Failed to create category");
    }
  };

  const handleCreateItem = async (e: React.FormEvent, categoryId: number) => {
    e.preventDefault();
    if (!itemName.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      await createItem({
        itineraryId,
        categoryId,
        name: itemName.trim(),
        address: itemAddress.trim() || undefined,
        description: itemDesc.trim() || undefined,
        latitude: itemLat,
        longitude: itemLng,
        placeId: itemPlaceId,
      }).unwrap();

      // Clear item fields
      setItemName("");
      setItemAddress("");
      setItemDesc("");
      setItemLat(undefined);
      setItemLng(undefined);
      setItemPlaceId(undefined);
      setActiveCategoryForNewItem(null);
      toast.success("Wishlist item added!");
    } catch (err) {
      if (isFetchBaseQueryError(err)) {
        toast.error(
          (err.data as { message: string }).message ||
            "Failed to add wishlist item",
        );
      }
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    // TODO: Use confirm panel
    if (!window.confirm("Are you sure you want to remove this item?")) return;
    try {
      await deleteItem({ itineraryId, itemId }).unwrap();
      toast.success("Item removed from wishlist.");
    } catch {
      toast.error("Failed to remove item");
    }
  };

  const handlePromoteItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoDate) {
      toast.error("Please select a date.");
      return;
    }

    const startAtStr = `${promoDate}T${promoStartTime}:00Z`;
    const endAtStr = `${promoDate}T${promoEndTime}:00Z`;

    if (new Date(endAtStr) <= new Date(startAtStr)) {
      toast.error("End time must be after start time.");
      return;
    }

    try {
      if (!activeItemForPromotion) {
        return;
      }
      await promoteItem({
        itineraryId,
        itemId: activeItemForPromotion.id,
        startAt: startAtStr,
        endAt: endAtStr,
      }).unwrap();

      setActiveItemForPromotion(null);
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

  const cityBounds = {
    north: latitude + 0.1,
    south: latitude - 0.1,
    east: longitude + 0.1,
    west: longitude - 0.1,
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center text-text-secondary">
        Loading Wishlists...
      </div>
    );
  }

  return (
    <div className="card w-full flex flex-col min-h-[60vh] bg-surface">
      <div className="flex items-center justify-between border-b border-surface-border pb-3 mb-4">
        <div>
          <h2 className="text-xl font-bold text-text-main">Trip Wishlist</h2>
        </div>
        {editable && (
          <button
            onClick={() => setShowCategoryForm(!showCategoryForm)}
            className="btn-secondary px-3 py-1.5 flex items-center gap-1.5 text-xs"
          >
            <ListPlus size={14} />
            Add List
          </button>
        )}
      </div>

      {showCategoryForm && (
        <form
          onSubmit={handleCreateCategory}
          className="mb-4 p-3 bg-surface-muted rounded-xl flex gap-2"
        >
          <input
            type="text"
            placeholder="e.g., Cool Bars, Food Spots"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-lg border border-surface-border bg-surface text-xs focus:ring-1 focus:ring-brand-primary"
            autoFocus
          />
          <button type="submit" className="btn-primary px-3 py-1.5 text-xs">
            Save
          </button>
        </form>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {categories.length === 0 ? (
          <div className="text-center py-8 text-text-secondary text-sm">
            No lists created yet. Create a category to start planning.
          </div>
        ) : (
          categories.map((category: WishlistCategory) => {
            const isExpanded = expandedCategories[category.id] ?? true;
            return (
              <div
                key={category.id}
                className="border border-surface-border rounded-xl overflow-hidden bg-surface"
              >
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between p-3 bg-surface-muted/50 hover:bg-surface-muted transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-text-main text-sm">
                    {category.name} ({category.items?.length || 0})
                  </span>
                  {isExpanded ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>

                {isExpanded && (
                  <div className="p-3 space-y-2 border-t border-surface-border">
                    {editable && activeCategoryForNewItem !== category.id && (
                      <button
                        onClick={() => {
                          setActiveCategoryForNewItem(category.id);
                          setItemName("");
                          setItemAddress("");
                          setItemDesc("");
                          setItemLat(undefined);
                          setItemLng(undefined);
                          setItemPlaceId(undefined);
                        }}
                        className="w-full border border-dashed border-surface-border py-1.5 rounded-lg text-xs font-semibold text-brand-primary flex items-center justify-center gap-1.5 hover:bg-brand-primary/5 transition-colors"
                      >
                        <Plus size={14} /> Add Spot
                      </button>
                    )}

                    {activeCategoryForNewItem === category.id && (
                      <form
                        onSubmit={(e) => handleCreateItem(e, category.id)}
                        className="p-3 bg-surface-muted rounded-lg space-y-2 border border-surface-border"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-text-main">
                            New Spot
                          </span>
                          <button
                            type="button"
                            onClick={() => setActiveCategoryForNewItem(null)}
                            className="text-text-secondary hover:text-text-primary"
                          >
                            <X size={14} />
                          </button>
                        </div>

                        <div className="mb-2">
                          <LocationInput
                            cityBounds={cityBounds}
                            onPlaceSelect={(place) => {
                              setItemName(place.name || "");
                              setItemAddress(place.formatted_address || "");
                              if (place.geometry?.location) {
                                setItemLat(place.geometry.location.lat());
                                setItemLng(place.geometry.location.lng());
                              }
                              setItemPlaceId(place.place_id);
                            }}
                            inputClassNames="text-xs px-2 py-1 h-8 rounded-md"
                            placeholder="Search with Google..."
                          />
                        </div>

                        <input
                          type="text"
                          placeholder="Spot Name (required)"
                          value={itemName}
                          onChange={(e) => setItemName(e.target.value)}
                          className="w-full px-2 py-1 rounded-md border border-surface-border bg-surface text-xs"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Address (optional)"
                          value={itemAddress}
                          onChange={(e) => setItemAddress(e.target.value)}
                          className="w-full px-2 py-1 rounded-md border border-surface-border bg-surface text-xs"
                        />
                        <textarea
                          placeholder="Insider tips or description (optional)"
                          value={itemDesc}
                          onChange={(e) => setItemDesc(e.target.value)}
                          className="w-full px-2 py-1 rounded-md border border-surface-border bg-surface text-xs h-12 resize-none"
                        />
                        <button
                          type="submit"
                          className="w-full btn-primary py-1.5 text-xs"
                        >
                          Add to List
                        </button>
                      </form>
                    )}

                    {!category.items || category.items.length === 0 ? (
                      <div className="text-center py-4 text-xs text-text-secondary">
                        No spots here yet.
                      </div>
                    ) : (
                      category.items.map((item: WishlistItem) => (
                        <div
                          key={item.id}
                          className={`p-2.5 rounded-lg border text-xs relative ${
                            item.isPromoted
                              ? "bg-brand-primary/5 border-brand-primary/20 opacity-75"
                              : "border-surface-border bg-surface-muted/30"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-1">
                            <div>
                              <h4 className="font-semibold text-text-main pr-10">
                                {item.name}
                              </h4>
                              {item.address && (
                                <p className=" text-text-secondary flex items-center gap-1 mt-0.5">
                                  <MapPin size={10} className="shrink-0" />
                                  <span className="truncate">
                                    {item.address}
                                  </span>
                                </p>
                              )}
                              {item.description && (
                                <p className="text-[10px] text-text-secondary mt-1 italic">
                                  "{item.description}"
                                </p>
                              )}
                            </div>

                            {editable && (
                              <div className="flex items-center gap-1.5 shrink-0">
                                {!item.isPromoted ? (
                                  <button
                                    onClick={() => {
                                      setActiveItemForPromotion(item);
                                      setPromoDate(startDate);
                                    }}
                                    title="Schedule Event"
                                    className="p-1 rounded bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white transition-colors cursor-pointer"
                                  >
                                    <Calendar size={12} />
                                  </button>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold">
                                    Added
                                  </span>
                                )}
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  title="Delete Spot"
                                  className="p-1 rounded text-text-secondary hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
                                >
                                  <Trash size={12} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {activeItemForPromotion && (
        <div className="backdrop bg-black/50 z-50">
          <div className="card w-full max-w-sm m-4 p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-surface-border pb-2">
              <h3 className="font-bold text-text-main text-sm">
                Schedule Wishlist Spot
              </h3>
              <button
                type="button"
                onClick={() => setActiveItemForPromotion(null)}
                className="text-text-secondary hover:text-text-primary"
              >
                <X size={16} />
              </button>
            </div>
            <div>
              <p className="text-xs text-text-secondary mb-2">
                Set times to place{" "}
                <strong>{activeItemForPromotion.name}</strong> onto your
                itinerary.
              </p>
            </div>

            <form onSubmit={handlePromoteItem} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Choose Date
                </label>
                <input
                  type="date"
                  min={startDate}
                  max={endDate}
                  value={promoDate}
                  onChange={(e) => setPromoDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-surface-border text-xs focus:ring-1 focus:ring-brand-primary bg-surface"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={promoStartTime}
                    onChange={(e) => setPromoStartTime(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-surface-border text-xs focus:ring-1 focus:ring-brand-primary bg-surface"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={promoEndTime}
                    onChange={(e) => setPromoEndTime(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-surface-border text-xs focus:ring-1 focus:ring-brand-primary bg-surface"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveItemForPromotion(null)}
                  className="flex-1 btn-secondary py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary py-2 text-xs"
                >
                  Schedule Spot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
