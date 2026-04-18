import { Clock, Tag, Trash } from "lucide-react";
import { format, parseISO } from "date-fns";
import { eventCategories, type Event } from "../types"; // Adjust path as needed
import { canUserEdit } from "../../users/utils";
import { useState } from "react";
import { EditableSelect, EditableText } from "../../../components";

interface EventCardProps {
  event: Event;
  handleDelete: (id: number) => Promise<void>;
  handleEdit: (eventId: number, updatedEvent: Partial<Event>) => Promise<void>;
  role: string;
}

export default function EventCard({
  event,
  handleDelete,
  handleEdit,
  role,
}: EventCardProps) {
  const [eventData, setEventData] = useState(event);
  const start = parseISO(eventData.startAt);
  const end = parseISO(eventData.endAt);

  const updateEventData = (newData: Partial<Event>) =>
    setEventData((prev) => ({ ...prev, ...newData }));

  return (
    <div className="card hover:shadow-lg transition-shadow border-l-4 border-brand-primary">
      <div className="flex flex-col">
        <div className="flex justify-between items-center ">
          <h3 className="font-bold tracking-tight text-text-primary ">
            {eventData.location}
          </h3>

          <EditableSelect
            defaultElement={
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-semibold uppercase">
                <Tag size={16} />
                {eventData.category}
              </span>
            }
            setValue={(category) => {
              handleEdit(event.id, { category });
              updateEventData({ category });
            }}
            options={eventCategories}
          />
        </div>

        <EditableText
          value={eventData.description}
          setValue={(description) => {
            handleEdit(event.id, { description });
            updateEventData({ description });
          }}
          textClassName="text-xs text-text-secondary"
          inputClassName="text-xs"
          emptyText="Add notes"
        />

        <div className="mt-2 flex gap-4 justify-between text-xs text-text-secondary">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-brand-primary" />
            <span>
              {format(start, "p")} - {format(end, "p")}
            </span>
          </div>

          {canUserEdit(role) && (
            <button
              className="p-0 group"
              aria-label="delete event"
              onClick={() => handleDelete(eventData.id)}
            >
              <Trash
                size={16}
                className="group-hover:hover:stroke-error duration-300"
                aria-hidden
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
