import { useState } from "react";
import { useGetWishlistsQuery } from "../services/wishlistApiSlice";
import { canUserEdit } from "../../users/utils";
import { ListPlus } from "lucide-react";
import type { WishlistCategory } from "../types";
import AddCategoryForm from "./AddCategoryForm";
import CategoryCard from "./CategoryCard";

interface WishlistPanelProps {
  itineraryId: number;
  role: string;
  startDate: string;
  endDate: string;
  latitude: number;
  longitude: number;
}

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

  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<
    Record<number, boolean>
  >({});

  const editable = canUserEdit(role);

  const cityBounds = {
    north: latitude + 0.1,
    south: latitude - 0.1,
    east: longitude + 0.1,
    west: longitude - 0.1,
  };

  const toggleCategory = (catId: number) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
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
        <AddCategoryForm
          itineraryId={itineraryId}
          onSuccess={() => setShowCategoryForm(false)}
        />
      )}

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {categories.length === 0 ? (
          <div className="text-center py-8 text-text-secondary text-sm">
            No lists created yet. Create a category to start planning.
          </div>
        ) : (
          categories.map((category: WishlistCategory) => (
            <CategoryCard
              key={category.id}
              category={category}
              itineraryId={itineraryId}
              editable={editable}
              isExpanded={expandedCategories[category.id] ?? true}
              onToggle={() => toggleCategory(category.id)}
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
