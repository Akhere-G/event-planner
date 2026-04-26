import { useParams } from "react-router";
import { useGetTripQuery } from "../../trips/services/tripsApiSlice";
import type { EventSearchResult } from "../types";
import SearchEventCard from "./SearchEventCard";
import { StateGate } from "../../../components";
import { useMemo } from "react";
import { addDays, format } from "date-fns";
import { formatDateRelative } from "../../../utils/dateFormattors";
import { useAddEventMutation } from "../service/eventApiSlice";
import type { EventSchema } from "../schemas/eventSchema";
import { isFetchBaseQueryError } from "../../api/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMap } from "@vis.gl/react-google-maps";

interface Option {
  title: string;
  value: string;
}

export default function SearchEvents({
  searchEvents,
  index,
  onEventAdded,
  setIndex,
}: {
  searchEvents: EventSearchResult[];
  index: number;
  setIndex: (index: number) => void;
  onEventAdded: (event: EventSchema) => void;
}) {
  const { tripId } = useParams();
  const { data, isLoading, isError } = useGetTripQuery(Number(tripId));
  const [addEvent, { isLoading: isAddEventLoading }] = useAddEventMutation();

  const map = useMap();

  let dates: Option[] = [];

  dates = useMemo(() => {
    if (!data?.data) return [];
    const dates: Option[] = [];

    let current = new Date(data.data.startDate);
    const end = new Date(data.data.endDate);

    while (current <= end) {
      const value = format(current, "yyyy-MM-dd");
      const title = formatDateRelative(current);
      dates.push({ title, value });
      current = addDays(current, 1);
    }
    return dates;
  }, [data]);

  const handleSave = async (event: EventSchema) => {
    try {
      await addEvent({ tripId: Number(tripId), event }).unwrap();
      onEventAdded(event);
    } catch (err) {
      if (isFetchBaseQueryError(err)) {
        console.error(err);
        // TODO: Add notification
      }
    }
  };
  if (searchEvents.length === 0) return;

  const currentEvent = searchEvents[index];

  const prevSearchResult = () => {
    const newIndex = (index - 1 + searchEvents.length) % searchEvents.length;
    const event = searchEvents[newIndex];

    map?.panTo({ lat: event.latitude, lng: event.longitude });
    setIndex(newIndex);
  };
  const nextSearchResult = () => {
    const newIndex = (index + 1) % searchEvents.length;
    const event = searchEvents[newIndex];

    map?.panTo({ lat: event.latitude, lng: event.longitude });
    setIndex(newIndex);
  };
  return (
    <StateGate loadingStateProps={{ isLoading }} errorStateProps={{ isError }}>
      <div className="relative">
        <div className="card p-1  text-xs flex items-center justify-center gap-1 absolute bottom-full rounded-md mb-2">
          <button onClick={prevSearchResult} className="btn-secondary p-1">
            <ChevronLeft size={12} />
          </button>
          {index + 1} of {searchEvents.length}
          <button onClick={nextSearchResult} className="btn-secondary p-1">
            <ChevronRight size={12} />
          </button>
        </div>
        <SearchEventCard
          event={currentEvent}
          dates={dates}
          handleSave={handleSave}
          isLoading={isAddEventLoading}
        />
      </div>
    </StateGate>
  );
}
