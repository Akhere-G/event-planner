import { MapPin, Clock, Tag } from "lucide-react";
import { format, parseISO } from "date-fns";
import { type Event } from "../types"; // Adjust path as needed

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const start = parseISO(event.startAt);
  const end = parseISO(event.endAt);

  return (
    <div className="card hover:shadow-lg transition-shadow border-l-4 border-brand-primary">
      <div className="flex flex-col">
        <div className="flex justify-between items-start">
          <h3 className="font-bold tracking-tight text-text-primary">
            {event.location}
          </h3>
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-semibold uppercase">
            <Tag size={14} />
            {event.category}
          </span>
        </div>

        <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
          {event.description}
        </p>

        <div className="flex items-center gap-2">
          <Clock size={14} className="text-brand-primary" />
          <span>
            {format(start, "p")} - {format(end, "p")}
          </span>
        </div>
      </div>
    </div>
  );
}
