import { useState } from "react";
import type { PackingItem } from "../types";
import {
  useUpdatePackingItemMutation,
  useDeletePackingItemMutation,
} from "../services/packingApiSlice";
import {
  Check,
  Trash2,
  Edit2,
  X,
  CheckSquare,
  Square,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { isApiError } from "../../api/utils";

export default function PackingItemCard({
  packingItem,
  tripId,
}: {
  packingItem: PackingItem;
  tripId: number;
}) {
  const [updatePackingItem, { isLoading: isUpdating }] =
    useUpdatePackingItemMutation();
  const [deletePackingItem, { isLoading: isDeleting }] =
    useDeletePackingItemMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(packingItem.name);
  const [editCategory, setEditCategory] = useState(packingItem.category);

  const handleToggleCheck = async () => {
    try {
      await updatePackingItem({
        tripId,
        itemId: packingItem.id,
        updates: { isChecked: !packingItem.isChecked },
      }).unwrap();
    } catch (err) {
      if (isApiError(err)) {
        toast.error(err.data.message);
      } else {
        toast.error("Failed to update status");
      }
    }
  };

  const handleDelete = async () => {
    try {
      await deletePackingItem({ tripId, itemId: packingItem.id }).unwrap();
      toast.success("Item removed");
    } catch (err) {
      if (isApiError(err)) {
        toast.error(err.data.message);
      } else {
        toast.error("Failed to delete item");
      }
    }
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) return;
    try {
      await updatePackingItem({
        tripId,
        itemId: packingItem.id,
        updates: { name: editName.trim(), category: editCategory.trim() },
      }).unwrap();
      setIsEditing(false);
      toast.success("Item updated");
    } catch (err) {
      if (isApiError(err)) {
        toast.error(err.data.message);
      } else {
        toast.error("Failed to save changes");
      }
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 p-3 bg-surface rounded-xl border border-brand-primary/50 shadow-sm">
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="form-input h-10 text-sm flex-1 min-w-0"
          placeholder="Item name"
          autoFocus
        />
        <input
          type="text"
          value={editCategory}
          onChange={(e) => setEditCategory(e.target.value)}
          className="form-input h-10 text-sm w-32 md:w-40"
          placeholder="Category"
        />
        <button
          type="button"
          onClick={handleSaveEdit}
          disabled={isUpdating}
          className="p-2.5 rounded-lg bg-brand-primary text-text-inverse hover:brightness-110 flex-shrink-0"
        >
          <Check className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => {
            setIsEditing(false);
            setEditName(packingItem.name);
            setEditCategory(packingItem.category);
          }}
          className="p-2.5 rounded-lg bg-surface-muted text-text-secondary hover:text-text-primary flex-shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${
        packingItem.isChecked
          ? "bg-surface-muted/50 border-surface-border opacity-75"
          : "bg-surface border-surface-border hover:border-brand-primary/30 shadow-xs"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          type="button"
          onClick={handleToggleCheck}
          disabled={isUpdating}
          className="text-brand-primary hover:scale-105 transition-transform flex-shrink-0 cursor-pointer"
          aria-label={
            packingItem.isChecked ? "Mark incomplete" : "Mark complete"
          }
        >
          {packingItem.isChecked ? (
            <CheckSquare className="w-5.5 h-5.5 text-brand-primary fill-brand-primary/20" />
          ) : (
            <Square className="w-5.5 h-5.5 text-text-secondary/60 hover:text-brand-primary" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <span
            className={`text-sm font-medium transition-all block truncate ${
              packingItem.isChecked
                ? "line-through text-text-secondary"
                : "text-text-primary"
            }`}
          >
            {packingItem.name}
          </span>
          {packingItem.isChecked && packingItem.checkedBy?.username && (
            <span className="flex items-center gap-1 text-xs text-text-secondary mt-0.5">
              <User className="w-3 h-3" />
              <span>Checked by {packingItem.checkedBy.username}</span>
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface-muted border border-surface-border text-text-secondary capitalize hidden sm:inline-block">
          {packingItem.category}
        </span>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="p-1.5 text-text-secondary hover:text-brand-primary hover:bg-surface-muted rounded-lg transition-colors opacity-80 sm:opacity-0 sm:group-hover:opacity-100"
          title="Edit item"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-1.5 text-text-secondary hover:text-error hover:bg-error/10 rounded-lg transition-colors opacity-80 sm:opacity-0 sm:group-hover:opacity-100"
          title="Delete item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
