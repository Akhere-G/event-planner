import { Check, Plus, Star, Tag as TagIcon } from "lucide-react";
import { Accordion, EditableSelect } from "../../../components";
import type { EventSearchResult, Tag } from "../types";
import type { RootState } from "../../../store";
import { useDispatch, useSelector } from "react-redux";
import { isFetchBaseQueryError } from "../../api/utils";
import { updateSearchEvents } from "../../maps/service/mapSlice";
import { useParams } from "react-router";
import { formatDateRelative } from "../../../utils/dateFormattors";
import type { EventSchema } from "../../events/schemas/eventSchema";
import { useAddEventMutation } from "../../events/service/eventApiSlice";
import { toast } from "sonner";

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
  const {
    address,
    name,
    latitude,
    longitude,
    category,
    tags,
    rating,
    totalReviews,
    photos,
  } = event;

  return (
    <div className="card border-l-4 border-brand-primary">
      <div className="flex flex-col">
        <header className="truncate font-bold tracking-tight text-text-primary flex flex-col lg:flex-row gap-2 w-full  lg:items-center lg:justify-between">
          <h3 className="text-sm lg:text-md truncate  p-0! m-0!">{name}</h3>
          <div className="text-xs lg:text-sm flex justify-between items-center gap-2">
            <span className="text-warning flex gap-1 items-center">
              <Star fill="var(--color-warning)" size={14} />
              {rating}
              <span className="text-text-secondary">({totalReviews})</span>
            </span>
            <span className="text-xs  flex items-center gap-1 px-2 py-1 rounded-full bg-brand-secondary/10 text-brand-secondary font-semibold uppercase">
              <TagIcon size={16} />
              {category}
            </span>
          </div>
        </header>

        <p className="text-sm text-text-secondary h-9 line-clamp-2">
          {address}
        </p>
        {tags.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-2">
            {tags.map((tag) => (
              <TagChip key={tag.text} {...tag} />
            ))}
          </div>
        )}

        <Accordion
          TitleComponent={({ isOpen }) => (
            <p className="text-xs text-text-secondary">
              {isOpen ? "Show Less" : "Show More"}
            </p>
          )}
          headerStyles="p-0! pt-2!"
          contentStyles="p-0 pb-2!"
          ContentComponent={() => (
            <div>
              {photos.map((photo) => (
                <div className="w-full h-60 overflow-y-scroll flex gap-2">
                  <img
                    className="rounded-md w-full h-full object-cover "
                    src={photo.url}
                    alt="Place photo"
                  />
                </div>
              ))}
            </div>
          )}
        />

        <div className="flex justify-end">
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
                  category,
                  latitude,
                  longitude,
                  name,
                  startAt: `${date} 12:00`,
                  endAt: `${date} 13:00`,
                })
              }
              selectClassName={`top-auto bottom-0 right-0 left-auto grid grid-cols-4 w-40`}
              selectedValue=""
              showEditIcon={false}
              defaultElement={
                <div
                  tabIndex={0}
                  role="button"
                  className="group btn-secondary px-3 py-1 rounded-md flex gap-2 items-center w-min"
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
      updateSearchEvents((e) =>
        e.placeId === currentEvent.placeId ? { ...e, isAdded: true } : e,
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
        toast.error("Cannot add event.");
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

export function TagChip({ color, text }: Tag) {
  return (
    <div
      style={{ backgroundColor: color }}
      className="rounded-full text-text-inverse font-bold px-3 py-0.5 text-xs"
    >
      {text}
    </div>
  );
}
