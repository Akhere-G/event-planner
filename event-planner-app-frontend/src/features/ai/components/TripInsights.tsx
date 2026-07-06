import type { Trip } from "../../trips/types";
import { useGetTripInsightsQuery } from "../services/aiApiSlice";
import { StateGate } from "../../../components";
import TripInsightCard from "./TripInsightCard";
export default function TripInsights({ trip }: { trip: Trip }) {
  const { data, isLoading, isError } = useGetTripInsightsQuery({
    tripId: trip.id,
  });

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
