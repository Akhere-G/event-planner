import { useState } from "react";
import { EmptyState, Accordion } from "../../../components";
import type { PackingItem as PackingItemType } from "../types";
import PackingItemCard from "./PackingItem";
import PackingItemForm from "./PackingItemForm";
import type { PackingitemSchema } from "../schema";
import { useAddPackingItemMutation } from "../services/packingApiSlice";
import { Plus, Tag } from "lucide-react";
import { usePostHog } from "@posthog/react";

export default function PackingItems({
  packingItems,
  isShared = false,
  tripId,
}: {
  packingItems: PackingItemType[];
  isShared?: boolean;
  tripId: number;
}) {
  const [addPackingItem, { isLoading }] = useAddPackingItemMutation();
  const [showAddForm, setShowAddForm] = useState(false);
  const posthog = usePostHog();
  async function submitAction(packingItem: PackingitemSchema) {
    await addPackingItem({
      packingItem: { ...packingItem, isShared },
      tripId,
    }).unwrap();
    posthog?.capture("packing_item_created", {
      trip_id: tripId,
    });
    setShowAddForm(false);
  }

  const groupedCategories = packingItems.reduce<
    Record<string, PackingItemType[]>
  >((acc, item) => {
    const rawCat = item.category ? item.category.trim() : "Misc";
    const cat = rawCat.charAt(0).toUpperCase() + rawCat.slice(1);
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(item);
    return acc;
  }, {});

  const categoryNames = Object.keys(groupedCategories);

  return (
    <div className="flex flex-col gap-6">
      {showAddForm ? (
        <PackingItemForm
          isShared={isShared}
          submitAction={submitAction}
          isLoading={isLoading}
          onCancel={() => setShowAddForm(false)}
        />
      ) : (
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Add {isShared ? "Group Item" : "Personal Item"}</span>
          </button>
        </div>
      )}

      {packingItems.length === 0 ? (
        <EmptyState
          message={
            isShared
              ? "No group gear items added yet"
              : "No personal items in your checklist"
          }
          action={{
            text: `Add a ${isShared ? "group" : "personal"} item`,
            onClick: () => setShowAddForm(true),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
          {categoryNames.map((category) => {
            const items = groupedCategories[category];
            const checkedCount = items.filter((i) => i.isChecked).length;
            const isAllChecked = checkedCount === items.length;

            return (
              <div
                key={category}
                className="card flex flex-col bg-surface border border-surface-border rounded-xl shadow-xs overflow-hidden p-0"
              >
                <Accordion
                  defaultIsOpen={true}
                  headerStyles="px-4 py-3"
                  contentStyles="px-4"
                  TitleComponent={() => (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Tag className="w-5 h-5 text-brand-primary" />
                        <h3 className="font-semibold text-text-primary text-base">
                          {category}
                        </h3>
                      </div>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                          isAllChecked
                            ? "bg-success/15 text-success"
                            : "bg-surface-muted text-text-secondary"
                        }`}
                      >
                        {checkedCount} / {items.length} packed
                      </span>
                    </div>
                  )}
                  ContentComponent={() => (
                    <div className="flex flex-col gap-2">
                      {items.map((item) => (
                        <PackingItemCard
                          key={item.id}
                          packingItem={item}
                          tripId={tripId}
                        />
                      ))}
                    </div>
                  )}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
