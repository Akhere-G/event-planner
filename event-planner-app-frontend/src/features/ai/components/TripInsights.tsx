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
    /* 
      We apply a delay to the width transition only when unexpanding (closing).
      This keeps the container full-width until the height has finished collapsing.
    */
    <div
      className={`transition-all duration-500 ease-in-out flex flex-col
        ${expanded ? "w-full mb-4" : "w-10 mb-0"}`}
      style={{
        transitionDelay: expanded ? "0ms" : "width 500ms, margin 500ms",
      }}
    >
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out
          ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden min-h-0">
          <header className="flex justify-between items-center w-full mb-4">
            <h3 className="flex gap-2 items-center title text-text-canvas whitespace-nowrap">
              <Sparkles className="text-purple-800" size={20} />
              Insights
            </h3>
            <div className="flex gap-2">
              <button onClick={() => refetch()} className="btn-secondary p-2">
                <RefreshCcw
                  size={20}
                  className={isFetching ? "animate-spin" : ""}
                />
              </button>
              <button
                className="btn-secondary p-2"
                onClick={() => setExpanded(false)}
              >
                <X size={20} />
              </button>
            </div>
          </header>

          <StateGate
            loadingStateProps={{ isLoading }}
            errorStateProps={{ isError }}
            emptyStateProps={{ isEmpty: !data?.data.length }}
          >
            <div className="flex flex-col gap-4">
              {data?.data.map((insight) => (
                <TripInsightCard key={insight.title} insight={insight} />
              ))}
            </div>
          </StateGate>
        </div>
      </div>

      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="btn-primary rounded-full w-10 h-10 shadow-md flex items-center justify-center p-0 flex-shrink-0"
        >
          {isLoading ? (
            <RefreshCcw size={20} className="animate-spin" />
          ) : (
            <Sparkles size={20} />
          )}
        </button>
      )}
    </div>
  );
}
