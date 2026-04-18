import { Clock, Tag, Trash } from "lucide-react";
import {
  addMilliseconds,
  differenceInMilliseconds,
  format,
  parseISO,
} from "date-fns";
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

const getTimes = (dateStr: string) => {
  const date = format(dateStr, "yyyy-MM-dd");
  const times: { title: string; value: string }[] = [];
  for (let i = 0; i < 24; i++) {
    const time = `${i.toString().padStart(2, "0")}:00`;
    times.push({
      title: time,
      value: `${date} ${time}`,
    });
  }

  return times;
};
export default function EventCard({
  event,
  handleDelete,
  handleEdit,
  role,
}: EventCardProps) {
  const [eventData, setEventData] = useState(event);
  const start = parseISO(eventData.startAt);
  const end = parseISO(eventData.endAt);

  const updateEventData = async (newData: Partial<Event>) => {
    const oldData = eventData;
    try {
      setEventData((prev) => ({ ...prev, ...newData }));
      await handleEdit(event.id, newData);
    } catch {
      setEventData(oldData);
    }
  };

  const times = getTimes(eventData.startAt);

  return (
    <div className="card hover:shadow-lg transition-shadow border-l-4 border-brand-primary">
      <div className="flex flex-col">
        <div className="flex justify-between items-center ">
          <h3 className="font-bold tracking-tight text-text-primary ">
            {eventData.location}
          </h3>

          <EditableSelect
            selectedValue={eventData.category}
            defaultElement={
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-semibold uppercase">
                <Tag size={16} />
                {eventData.category}
              </span>
            }
            setValue={(category) => {
              updateEventData({ category });
            }}
            options={eventCategories}
            selectClassName="flex flex-col items-stretch text-center!"
          />
        </div>

        <EditableText
          value={eventData.description}
          setValue={(description) => {
            updateEventData({ description });
          }}
          textClassName="text-xs text-text-secondary"
          inputClassName="text-xs"
          emptyText="Add notes"
        />

        <div className="mt-2 flex gap-4 justify-between text-xs text-text-secondary">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-brand-primary" />
            <div className="flex gap-1 text-xs!">
              <EditableSelect
                selectedValue={format(eventData.startAt, "yyyy-MM-dd HH:mm")}
                defaultElement={format(start, "p")}
                setValue={(startAt) => {
                  const newStart = new Date(startAt);
                  const oldStart = new Date(eventData.startAt);
                  const oldEnd = new Date(eventData.endAt);

                  const duration = differenceInMilliseconds(oldEnd, oldStart);
                  const newEnd = addMilliseconds(newStart, duration);
                  updateEventData({
                    startAt,
                    endAt: format(newEnd, "yyyy-MM-dd HH:mm"),
                  });
                }}
                options={times}
                selectClassName="max-h-40 overflow-y-scroll grid grid-cols-2 w-24"
              />
              -
              <EditableSelect
                selectedValue={format(eventData.endAt, "yyyy-MM-dd HH:mm")}
                defaultElement={format(end, "p")}
                setValue={(endAt) => {
                  updateEventData({ endAt });
                }}
                options={times}
                selectClassName="max-h-40 overflow-y-scroll grid grid-cols-2 w-24"
              />
            </div>
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
