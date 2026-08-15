import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../store";
import EventSearchMarker from "./EventSearchMarker";
import { canUserEdit } from "../../users/utils";
import { useParams } from "react-router";
import { useGetTripQuery } from "../../trips/services/tripsApiSlice";
import { clearSearchEvents } from "../service/mapSlice";
import { X } from "lucide-react";
import EventSearchResultList from "./EventSearchResultList";
import { useEffect } from "react";

export default function SearchEventMarkers() {
  const tripId = Number(useParams().tripId);
  const { data } = useGetTripQuery(tripId);
  const trip = data?.data;
  const { searchEvents } = useSelector((state: RootState) => state.map);
  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      dispatch(clearSearchEvents());
    };
  }, [dispatch]);

  if (!trip) return null;
  return (
    <>
      {searchEvents.map((event) => (
        <EventSearchMarker key={event.placeId} event={event} />
      ))}

      {canUserEdit(trip.role) && searchEvents.length > 0 && (
        <div className="absolute bottom-4 w-full px-4 ">
          <button
            onClick={() => dispatch(clearSearchEvents())}
            className="absolute z-2 btn-secondary p-1 right-1 -top-3"
          >
            <X size={20} />
          </button>
          <EventSearchResultList />
        </div>
      )}
    </>
  );
}
