import { LoaderCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { TripDraft } from "../types";
import { summariseDraft } from "../utils";

interface TripDraftPreviewProps {
  draft: TripDraft;
  isCreating: boolean;
  onCreate: () => void;
  onRefine: () => void;
}

function Section({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section>
      <h4 className="font-semibold text-sm">{title}</h4>
      <p className="text-sm text-text-secondary">{items.join(", ")}</p>
    </section>
  );
}

export default function TripDraftPreview({
  draft,
  isCreating,
  onCreate,
  onRefine,
}: TripDraftPreviewProps) {
  const { trip } = draft;
  const summary = summariseDraft(draft.ops, draft.timezone);

  return (
    <div className="card flex flex-col gap-3" aria-label="Draft trip">
      <div>
        <h3 className="font-semibold">{trip.name}</h3>
        <p className="text-sm text-text-secondary">
          {trip.destination} · {format(parseISO(trip.startDate), "d MMM")} –{" "}
          {format(parseISO(trip.endDate), "d MMM yyyy")}
        </p>
      </div>
      <section>
        <h4 className="font-semibold text-sm">Days</h4>
        <ul className="text-sm text-text-secondary">
          {summary.days.map((day) => (
            <li key={day.date}>
              <span className="text-text-primary">
                {format(parseISO(day.date), "EEE d MMM")}:
              </span>{" "}
              {day.eventNames.join(", ")}
            </li>
          ))}
        </ul>
      </section>
      <Section title="Where to stay" items={summary.accommodations} />
      <Section title="Packing list" items={summary.packingItems} />
      <Section title="Wishlist ideas" items={summary.wishlistItems} />
      <div className="flex gap-2">
        <button
          type="button"
          className="btn-primary flex items-center gap-2"
          disabled={isCreating}
          onClick={onCreate}
        >
          {isCreating && <LoaderCircle size={16} className="animate-spin" />}
          Create trip
        </button>
        <button
          type="button"
          className="btn-secondary"
          disabled={isCreating}
          onClick={onRefine}
        >
          Keep refining
        </button>
      </div>
    </div>
  );
}
