import type { TripInsight } from "../types";

export default function TripInsightCard({ insight }: { insight: TripInsight }) {
  return (
    <div className="card">
      <h3 className="text-brand-primary text-sm">{insight.title}</h3>
      <p className="text-xs">{insight.content}</p>
    </div>
  );
}
