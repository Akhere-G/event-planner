import { useEffect, useState } from "react";
import { StateGate } from "../../../components";
import type { Trip } from "../../trips/types";
import {
  useGetPackingItemsQuery,
  useGeneratePackingItemsMutation,
} from "../services/packingApiSlice";
import PackingItems from "./PackingItems";
import {
  Sparkles,
  UserCheck,
  Users,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { isApiError } from "../../api/utils";
import { usePostHog } from "@posthog/react";
import useLoadAnonTrip from "../../trips/hooks/useLoadAnonTrip";

type PackingSubTab = "personal" | "shared";

export default function PackingPage({ trip }: { trip: Trip }) {
  const { data, isLoading, isError } = useGetPackingItemsQuery({
    tripId: trip.id,
  });
  const [generatePackingItems, { isLoading: isGenerating }] =
    useGeneratePackingItemsMutation();
  const posthog = usePostHog();
  const { anonTrip } = useLoadAnonTrip();

  const [activeTab, setActiveTab] = useState<PackingSubTab>(
    anonTrip ? "personal" : "shared",
  );

  const packingItems = data?.data ?? [];

  const userPackingItems = packingItems.filter((item) => !item.isShared);
  const groupPackingItems = packingItems.filter((item) => item.isShared);

  const totalItems = packingItems.length;
  const checkedItems = packingItems.filter((item) => item.isChecked).length;
  const progressPercent =
    totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  useEffect(() => {
    posthog?.capture("packing_page_viewed", {
      trip_id: trip.id,
    });
  }, [posthog, trip.id]);

  const handleGenerateAI = async () => {
    try {
      await generatePackingItems({ tripId: trip.id }).unwrap();
      posthog?.capture("packing_items_generated", {
        trip_id: trip.id,
      });
      toast.success("Smart generated customised packing recommendations!");
    } catch (err) {
      if (isApiError(err)) {
        toast.error(err.data.message);
      } else {
        toast.error("Failed to generate packing recommendations");
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <StateGate
        loadingStateProps={{ isLoading }}
        errorStateProps={{ isError }}
      >
        <div className="card flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-surface border border-surface-border rounded-xl shadow-xs">
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-text-primary tracking-tight">
                Packing Checklist
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary font-semibold">
                {checkedItems} / {totalItems} Packed
              </span>
            </div>
            <p className="text-sm text-text-secondary">
              Organise your trip gear.
            </p>

            {totalItems > 0 && (
              <div className="w-full max-w-md bg-surface-muted rounded-full h-2.5 mt-1 overflow-hidden border border-surface-border">
                <div
                  className="bg-brand-primary h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm font-medium shadow-sm hover:scale-[1.02] transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-text-inverse" />
                  <span>Building packing list...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-text-inverse" />
                  <span>Smart generate</span>
                </>
              )}
            </button>
          </div>
        </div>

        {totalItems === 0 && !isGenerating && (
          <div className="card p-6 md:p-8 bg-linear-to-r from-brand-primary/10 via-surface to-brand-secondary/10 border border-brand-primary/20 rounded-xl text-center flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-primary/20 flex items-center justify-center text-brand-primary">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="max-w-xl flex flex-col gap-1">
              <h3 className="text-lg font-bold text-text-primary">
                Get Ready for {trip.destination}!
              </h3>
              <p className="text-sm text-text-secondary">
                Let's us build your packing list for you
              </p>
            </div>
            <button
              type="button"
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="btn-primary flex items-center gap-2 px-6 py-3 text-sm font-semibold shadow-md hover:scale-105 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              <span>Generate Custom Packing List</span>
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 border-b border-surface-border pb-1">
          {!anonTrip && (
            <button
              type="button"
              onClick={() => setActiveTab("personal")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-xl transition-all cursor-pointer border-b-2 ${
                activeTab === "personal"
                  ? "border-brand-primary text-brand-primary bg-brand-primary/5"
                  : "border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-muted/50"
              }`}
            >
              <UserCheck className="w-5 h-5" />
              <span>My Items</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-surface-muted text-text-secondary">
                {userPackingItems.length}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab("shared")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-xl transition-all cursor-pointer border-b-2 ${
              activeTab === "shared"
                ? "border-brand-primary text-brand-primary bg-brand-primary/5"
                : "border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-muted/50"
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Group Gear</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-surface-muted text-text-secondary">
              {groupPackingItems.length}
            </span>
          </button>

          {progressPercent === 100 && totalItems > 0 && (
            <div className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-success bg-success/10 px-3 py-1 rounded-full border border-success/20">
              <CheckCircle2 className="w-4 h-4" />
              <span>100% Fully Packed!</span>
            </div>
          )}
        </div>

        <div className="mt-2">
          {activeTab === "personal" && (
            <PackingItems packingItems={userPackingItems} tripId={trip.id} />
          )}

          {activeTab === "shared" && (
            <PackingItems
              packingItems={groupPackingItems}
              tripId={trip.id}
              isShared
            />
          )}
        </div>
      </StateGate>
    </div>
  );
}
