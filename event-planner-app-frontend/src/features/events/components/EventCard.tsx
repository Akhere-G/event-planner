import { Clock, Tag, Trash } from "lucide-react";
import { format, parseISO } from "date-fns";
import { type Event } from "../types"; // Adjust path as needed

interface EventCardProps {
  event: Event;
  handleDelete: (id: number) => void;
}

export default function EventCard({ event, handleDelete }: EventCardProps) {
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
            <Tag size={16} />
            {event.category}
          </span>
        </div>

        <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
          {event.description}
        </p>

        <div className="flex gap-4 justify-between text-xs text-text-secondary">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-brand-primary" />
            <span>
              {format(start, "p")} - {format(end, "p")}
            </span>
          </div>

          <button
            className="p-0 group"
            aria-label="delete event"
            onClick={() => handleDelete(event.id)}
          >
            <Trash
              size={16}
              className="group-hover:hover:stroke-error duration-300"
              aria-hidden
            />
          </button>
        </div>
      </div>
    </div>
  );
}
