import { useState } from "react";
import { DayList } from "../../events/components";
import { isAdmin } from "../../users/utils";
import type { Trip } from "../types";
import TripSummary from "./TripSummary";
import { TripCalendar } from "../../calendar/components";
import { TripInsights } from "../../ai/components";
import WishlistPanel from "../../wishlist/components/WishlistPanel";

export default function TripDetails(trip: Trip) {
  const [activeTab, setActiveTab] = useState<"list" | "calendar" | "wishlist">(
    "list",
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="card">
        <TripSummary trip={trip} showActions={isAdmin(trip.role)} />
      </div>
      <div>
        <div className="flex flex-wrap items-center justify-start gap-x-4 gap-y-2 mb-4 px-4">
          <TripInsights trip={trip} />
          <h1 className="bg-canvas  mb-2 title text-text-canvas">Plans</h1>
          <div className="ml-auto flex items-center">
            <button
              onClick={() => setActiveTab("list")}
              className={`btn-secondary px-4 py-2 border-2 border-surface-border rounded-r-none rounded-l-xl active:scale-100 cursor-pointer ${activeTab === "list" ? "brightness-110 bg-brand-primary/10 border-brand-primary/50 text-brand-primary font-bold" : ""}`}
            >
              List
            </button>
            <button
              onClick={() => setActiveTab("calendar")}
              className={`btn-secondary px-4 py-2 border-2 border-surface-border border-l-0 rounded-none active:scale-100 cursor-pointer ${activeTab === "calendar" ? "brightness-110 bg-brand-primary/10 border-brand-primary/50 text-brand-primary font-bold" : ""}`}
            >
              Calendar
            </button>
            <button
              onClick={() => setActiveTab("wishlist")}
              className={`btn-secondary px-4 py-2 border-2 border-surface-border border-l-0 rounded-l-none rounded-r-xl active:scale-100 flex items-center gap-1.5 cursor-pointer ${activeTab === "wishlist" ? "brightness-110 bg-brand-primary/10 border-brand-primary/50 text-brand-primary font-bold" : ""}`}
            >
              Wishlist
            </button>
          </div>
        </div>
        <div className="w-full">
          {activeTab === "list" && (
            <DayList
              startDate={trip.startDate}
              endDate={trip.endDate}
              events={trip.events}
              role={trip.role}
            />
          )}
          {activeTab === "calendar" && <TripCalendar trip={trip} />}
          {activeTab === "wishlist" && (
            <WishlistPanel
              itineraryId={trip.id}
              role={trip.role}
              startDate={trip.startDate}
              endDate={trip.endDate}
              latitude={trip.latitude}
              longitude={trip.longitude}
            />
          )}
        </div>
      </div>
    </div>
  );
}
