import { useState } from "react";
import { isAdmin } from "../../users/utils";
import type { Trip } from "../types";
import TripSummary from "./TripSummary";
import { TripInsights } from "../../ai/components";
import TripActivities from "./TripActivities";
import AccommodationPage from "../../accommodations/components/AccommodationPage";

// TODO Add Resizable sections from shadcn

type TabOption = "activities" | "tips" | "accommodation";

const tabs: { name: string; tab: TabOption }[] = [
  { name: "Activities", tab: "activities" },
  { name: "Tips", tab: "tips" },
  { name: "Accommodation", tab: "accommodation" },
];

export default function TripDetails(trip: Trip) {
  const [activeTab, setActiveTab] = useState<TabOption>("activities");

  return (
    <div className="flex flex-col gap-6">
      <div className="card">
        <TripSummary trip={trip} showActions={isAdmin(trip.role)} />
      </div>
      <div>
        <div className="ml-auto w-full mb-4 flex items-center">
          {tabs.map((tab, i) => {
            let classNames =
              "btn-secondary px-4 py-2 border-2 border-surface-border border-l-0 rounded-none active:scale-100 ";

            if (activeTab === tab.tab) {
              classNames +=
                " brightness-110 bg-brand-primary/10 border-brand-primary/50 text-text-primary font-bold";
            }
            if (i === 0) {
              classNames += " rounded-l-xl border-l-2";
            }

            if (i === tabs.length - 1) {
              classNames += " rounded-r-xl!";
            }
            return (
              <button
                key={tab.name}
                type="button"
                onClick={() => setActiveTab(tab.tab)}
                className={classNames}
                aria-pressed={activeTab === tab.tab}
              >
                {tab.name}
              </button>
            );
          })}
        </div>

        <div className="w-full">
          {activeTab === "activities" && <TripActivities trip={trip} />}
          {activeTab === "tips" && <TripInsights trip={trip} />}
          {activeTab === "accommodation" && (
            <AccommodationPage
              trip={trip}
              cityBounds={{
                north: trip.latitude + 0.1,
                south: trip.latitude - 0.1,
                east: trip.longitude + 0.1,
                west: trip.longitude - 0.1,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
