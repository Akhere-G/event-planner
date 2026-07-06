import { useState } from "react";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import AddItemForm from "./AddItemForm";
import WishlistItemCard from "./WishlistItemCard";
import type { WishlistCategory } from "../types";
import type { CityBounds } from "../../maps/types";

interface CategoryCardProps {
  category: WishlistCategory;
  itineraryId: number;
  editable: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  cityBounds: CityBounds;
  startDate: string;
  endDate: string;
}

export default function CategoryCard({
  category,
  itineraryId,
  editable,
  isExpanded,
  onToggle,
  cityBounds,
  startDate,
  endDate,
}: CategoryCardProps) {
  const [isAddingItem, setIsAddingItem] = useState(false);

  return (
    <div className="border border-surface-border rounded-xl overflow-hidden bg-surface">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 bg-surface-muted/50 hover:bg-surface-muted transition-colors cursor-pointer rounded-none"
      >
        <span className="font-semibold text-text-main text-sm">
          {category.name} ({category.items?.length || 0})
        </span>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

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
              itineraryId={itineraryId}
              categoryId={category.id}
              cityBounds={cityBounds}
              onSuccess={() => setIsAddingItem(false)}
              onCancel={() => setIsAddingItem(false)}
            />
          )}

          {!category.items || category.items.length === 0 ? (
            <div className="text-center py-4 text-xs text-text-secondary">
              No activities added yet.
            </div>
          ) : (
            category.items.map((item) => (
              <WishlistItemCard
                key={item.id}
                item={item}
                itineraryId={itineraryId}
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
