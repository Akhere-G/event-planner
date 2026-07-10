import { useState } from "react";
import { DayList } from "../../events/components";
import { isAdmin } from "../../users/utils";
import type { Trip } from "../types";
import TripSummary from "./TripSummary";
import { TripCalendar } from "../../calendar/components";
import { TripInsights } from "../../ai/components";
import WishlistPanel from "../../wishlist/components/WishlistPanel";

// TODO Add Resizable sections from shadcn

export default function TripDetails(trip: Trip) {
  const [activeTab, setActiveTab] = useState<
    "list" | "calendar" | "wishlist" | "tips"
  >("list");

  return (
    <div className="flex flex-col gap-6">
      <div className="card">
        <TripSummary trip={trip} showActions={isAdmin(trip.role)} />
      </div>
      <div>
        <div className="ml-auto w-full mb-4 flex items-center">
          <button
            onClick={() => setActiveTab("tips")}
            className={`btn-secondary px-4 py-2 border-2 border-surface-border rounded-r-none rounded-l-xl active:scale-100 flex items-center gap-1.5 cursor-pointer ${activeTab === "tips" ? "brightness-110 bg-brand-primary/10 border-brand-primary/50 text-brand-primary font-bold" : ""}`}
          >
            Tips
          </button>
          <button
            className={`btn-secondary px-4 py-2 border-2 border-surface-border border-l-0 rounded-none active:scale-100 cursor-pointer ${activeTab === "wishlist" ? "brightness-110 bg-brand-primary/10 border-brand-primary/50 text-brand-primary font-bold" : ""}`}
            onClick={() => setActiveTab("wishlist")}
          >
            Wishlist
          </button>
          <button
            onClick={() => setActiveTab("list")}
            className={`btn-secondary px-4 py-2 border-2 border-surface-border border-l-0 rounded-none active:scale-100 cursor-pointer ${activeTab === "list" ? "brightness-110 bg-brand-primary/10 border-brand-primary/50 text-brand-primary font-bold" : ""}`}
          >
            List
          </button>
          <button
            onClick={() => setActiveTab("calendar")}
            className={`btn-secondary px-4 py-2 border-2 border-surface-border border-l-0 rounded-l-none rounded-r-xl active:scale-100 flex items-center gap-1.5 cursor-pointer ${activeTab === "calendar" ? "brightness-110 bg-brand-primary/10 border-brand-primary/50 text-brand-primary font-bold" : ""}`}
          >
            Calendar
          </button>
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
