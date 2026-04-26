import { Clock, Tag, Trash } from "lucide-react";
import {
  addMilliseconds,
  differenceInMilliseconds,
  format,
  parseISO,
} from "date-fns";
import { type Event } from "../types";
import { canUserEdit } from "../../users/utils";
import { useState } from "react";
import { EditableSelect, EditableText, TimePicker } from "../../../components";
import { eventCategories } from "../constants";

interface EventCardProps {
  event: Event;
  handleDelete?: (id: number) => Promise<void>;
  handleEdit?: (eventId: number, updatedEvent: Partial<Event>) => Promise<void>;
  role: string;
}

export default function EventCard({
  event,
  handleDelete = async () => {},
  handleEdit = async () => {},
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

  return (
    <div className="card flex-1 hover:shadow-lg transition-shadow border-l-4 border-brand-primary">
      <div className="flex flex-col">
        <div className="flex justify-between items-center ">
          <h3 className="font-bold tracking-tight text-text-primary flex flex-col">
            <span>{eventData.name}</span>
          </h3>

          <EditableSelect
            selectedValue={eventData.category}
            canEdit={canUserEdit(role)}
            defaultElement={
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-brand-secondary/10 text-brand-secondary text-xs font-semibold uppercase">
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
          value={eventData?.description ?? ""}
          canEdit={canUserEdit(role)}
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
                canEdit={canUserEdit(role)}
                selectClassName=" overflow-y-scroll"
                CustomSelect={({ close }) => {
                  const time = format(eventData.startAt, "HH:mm");

                  function onChange(time: string) {
                    const startAt =
                      format(eventData.startAt, "yyyy-MM-dd ") + time;
                    const newStart = new Date(startAt);
                    const oldStart = new Date(eventData.startAt);
                    const oldEnd = new Date(eventData.endAt);

                    const duration = differenceInMilliseconds(oldEnd, oldStart);
                    const newEnd = addMilliseconds(newStart, duration);
                    const endAt = format(newEnd, "yyyy-MM-dd HH:mm");

                    updateEventData({ startAt, endAt });
                    close();
                  }

                  return (
                    <TimePicker value={time} onChange={onChange} scrollToTime />
                  );
                }}
              />
              -
              <EditableSelect
                selectedValue={format(eventData.endAt, "yyyy-MM-dd HH:mm")}
                defaultElement={format(end, "p")}
                canEdit={canUserEdit(role)}
                CustomSelect={({ close }) => {
                  const time = format(eventData.endAt, "HH:mm");

                  function onChange(time: string) {
                    const endAt = format(eventData.endAt, "yyyy-MM-dd ") + time;
                    updateEventData({ endAt });
                    close();
                  }

                  return <TimePicker value={time} onChange={onChange} />;
                }}
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
