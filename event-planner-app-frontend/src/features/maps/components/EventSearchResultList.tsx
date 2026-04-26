import type { EventSearchResult } from "../types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMap } from "@vis.gl/react-google-maps";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../store";
import { setSearchIndex } from "../../maps/service/mapSlice";
import EventSearchResultCard from "./EventSearchResult";

export function EventSearchResultList({
  searchEvents,
  index,
  setIndex,
}: {
  searchEvents: EventSearchResult[];
  index: number;
  setIndex: (index: number) => void;
}) {
  const map = useMap();

  if (searchEvents.length === 0) return;

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
      <EventSearchResultCard />
    </div>
  );
}

export default function EventSearchResultListConnected() {
  const { searchEvents, searchIndex } = useSelector(
    (state: RootState) => state.map,
  );
  const dispatch = useDispatch();

  return (
    <EventSearchResultList
      searchEvents={searchEvents}
      index={searchIndex}
      setIndex={(index) => dispatch(setSearchIndex(index))}
    />
  );
}
