import { useState } from "react";
import { DayList } from "../../events/components";
import { isAdmin } from "../../users/utils";
import type { Trip } from "../types";
import TripSummary from "./TripSummary";
import { TripCalendar } from "../../calendar/components";
import { TripInsights } from "../../ai/components";
import WishlistPanel from "../../wishlist/components/WishlistPanel";

// TODO Add Resizable sections from shadcn
// TODO use tabs from shadcn

type TabOption = "list" | "calendar" | "wishlist" | "tips";
export default function TripDetails(trip: Trip) {
  const [activeTab, setActiveTab] = useState<TabOption>("list");

  const tabs = [
    {
      name: "Tips",
      tab: "tips",
    },
    {
      name: "Wishlists",
      tab: "wishlist",
    },
    {
      name: "List",
      tab: "list",
    },
    {
      name: "Calendar",
      tab: "calendar",
    },
  ];
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
                onClick={() => setActiveTab(tab.tab as TabOption)}
                className={classNames}
              >
                {tab.name}
              </button>
            );
          })}
        </div>

        <div className="w-full">
          {activeTab === "tips" && <TripInsights trip={trip} />}
          {activeTab === "wishlist" && (
            <WishlistPanel
              tripId={trip.id}
              role={trip.role}
              startDate={trip.startDate}
              endDate={trip.endDate}
              latitude={trip.latitude}
              longitude={trip.longitude}
            />
          )}
          {activeTab === "list" && (
            <DayList
              startDate={trip.startDate}
              endDate={trip.endDate}
              events={trip.events}
              role={trip.role}
            />
          )}
          {activeTab === "calendar" && <TripCalendar trip={trip} />}
        </div>
      </div>
    </div>
  );
}
