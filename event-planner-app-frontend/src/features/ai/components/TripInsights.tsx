import { RefreshCcw, Sparkles, X } from "lucide-react";
import { useState } from "react";
import type { Trip } from "../../trips/types";
import { useGetTripInsightsQuery } from "../services/aiApiSlice";
import { StateGate } from "../../../components";
import TripInsightCard from "./TripInsightCard";

export default function TripInsights({ trip }: { trip: Trip }) {
  const { data, refetch, isLoading, isFetching, isError } =
    useGetTripInsightsQuery({
      tripId: trip.id,
    });
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div
        className={`grid transition-all duration-500 ease-in-out
          ${isFetching ? "opacity-75 pointer-events-none" : ""}
          ${expanded ? "grid-rows-[1fr] opacity-100 mb-4 translate-y-0" : "grid-rows-[0fr] opacity-0 translate-y-full"}`}
      >
        <div className="overflow-hidden min-h-0">
          <header className="flex justify-between items-center w-full mb-2">
            <h3 className="flex gap-2 items-center title text-text-canvas">
              <Sparkles className="text-purple-800" size={20} />
              Insights
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => refetch()}
                aria-label="Get insights"
                className="btn-secondary p-2"
              >
                <RefreshCcw size={20} />
              </button>
              <button
                className="btn-secondary p-2"
                onClick={() => setExpanded(false)}
                aria-label="Close insights"
              >
                <X size={20} />
              </button>
            </div>
          </header>
          <StateGate
            loadingStateProps={{ isLoading }}
            errorStateProps={{ isError }}
            emptyStateProps={{
              isEmpty: !data?.data.length,
              message: "No insights found. Try again.",
              height: 80,
            }}
            containerClasses="w-full"
          >
            <div className="flex flex-col gap-4">
              {data?.data.map((insight) => (
                <TripInsightCard key={insight.title} insight={insight} />
              ))}
            </div>
          </StateGate>
        </div>
      </div>
      <div
        className={`transition-all duration-500 ${expanded ? "grid-rows-[0fr] opacity-0 w-0 " : "grid-rows-[1fr] opacity-100 w-10"}`}
      >
        <button
          onClick={() => setExpanded(true)}
          className="btn-primary rounded-full w-10 h-10 border-surface-border shadow-md flex items-center justify-center p-0"
        >
          <Sparkles size={20} />
        </button>
      </div>
    </>
  );
}
