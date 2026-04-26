import { Check, Plus } from "lucide-react";
import { EditableSelect } from "../../../components";
import type { EventSchema } from "../schemas/eventSchema";
import type { EventSearchResult } from "../types";
import type { RootState } from "../../../store";
import { useDispatch, useSelector } from "react-redux";
import { useAddEventMutation } from "../service/eventApiSlice";
import { isFetchBaseQueryError } from "../../api/utils";
import { setSearchEvents } from "../../maps/service/mapSlice";
import { useParams } from "react-router";
import { formatDateRelative } from "../../../utils/dateFormattors";

interface SearchEventCardProps {
  event: EventSearchResult;
  handleSave: (event: EventSchema) => Promise<void>;
  dates: { title: string; value: string }[];
  isLoading: boolean;
}

export function EventSearchResultCard({
  event,
  handleSave,
  dates,
  isLoading,
}: SearchEventCardProps) {
  const { address, name, latitude, longitude } = event;

  return (
    <div className="card flex-1 hover:shadow-lg transition-shadow border-l-4 border-brand-primary">
      <div className="flex flex-col">
        <h3 className="text-sm truncate font-bold tracking-tight text-text-primary flex flex-col">
          <span className="truncate">{name}</span>
        </h3>

        <p className="text-sm text-text-secondary">{address}</p>

        <div className="mt-2 flex gap-4 justify-between text-xs text-text-secondary">
          {/*
            <div className="flex items-center gap-2">
            <Clock size={16} className="text-brand-primary" />
            <div className="flex gap-1 text-xs!"></div>
          </div>
          */}

          <div className="mt-2">
            {event.isAdded ? (
              <span className="text-xs flex gap-2 bg-brand-primary px-3 py-1 rounded-full">
                <Check size={16} />
                Added
              </span>
            ) : (
              <EditableSelect
                options={dates}
                isLoading={isLoading}
                canEdit
                setValue={(date) =>
                  handleSave({
                    address,
                    category: "general",
                    latitude,
                    longitude,
                    name,
                    startAt: `${date} 12:00`,
                    endAt: `${date} 13:00`,
                  })
                }
                selectClassName={`top-auto bottom-0 right-auto left-0 grid grid-cols-4 w-40`}
                selectedValue=""
                defaultElement={
                  <div
                    tabIndex={0}
                    role="button"
                    className="group btn-secondary flex gap-2"
                  >
                    <Plus size={16} aria-hidden />
                    Add
                  </div>
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EventSearchResultCardConnected() {
  const { tripId } = useParams();
  const { searchEvents, searchIndex, days } = useSelector(
    (state: RootState) => state.map,
  );
  const dispatch = useDispatch();

  const [addEvent, { isLoading: isAddEventLoading }] = useAddEventMutation();

  const currentEvent = searchEvents[searchIndex];

  const updateSearchResults = () => {
    dispatch(
      setSearchEvents(
        searchEvents.map((e) =>
          e.placeId === currentEvent.placeId ? { ...e, isAdded: true } : e,
        ),
      ),
    );
  };

  const handleSave = async (event: EventSchema) => {
    try {
      await addEvent({ tripId: Number(tripId), event }).unwrap();
      updateSearchResults();
    } catch (err) {
      if (isFetchBaseQueryError(err)) {
        console.error(err);
        // TODO: Add notification
      }
    }
  };

  const dates = days.map((day) => ({
    title: formatDateRelative(day.date),
    value: day.date,
  }));

  return (
    <EventSearchResultCard
      event={currentEvent}
      dates={dates}
      handleSave={handleSave}
      isLoading={isAddEventLoading}
    />
  );
}
