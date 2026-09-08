import type { Trip } from "../../trips/types";
import { useGetTripInsightsQuery } from "../services/aiApiSlice";
import { StateGate } from "../../../components";
import TripInsightCard from "./TripInsightCard";
import { useEffect } from "react";
import { usePostHog } from "@posthog/react";
export default function TripInsights({ trip }: { trip: Trip }) {
  const { data, isLoading, isError } = useGetTripInsightsQuery({
    tripId: trip.id,
  });
  const posthog = usePostHog();

  useEffect(() => {
    posthog?.capture("insights_page_viewed", {
      trip_id: trip.id,
    });
  }, [posthog, trip.id]);

  return (
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
  );
}
