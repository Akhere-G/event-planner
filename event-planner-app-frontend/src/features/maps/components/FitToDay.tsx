import { useState } from "react";
import { Maximize, X } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import { useMap } from "@vis.gl/react-google-maps";
import { fitToBounds } from "../../maps/utils";
import { getDayColor } from "../../events/utils";
import { useGetWishlistsQuery } from "../../wishlist/services/wishlistApiSlice";
import { useParams } from "react-router";
import type { Wishlist } from "../../wishlist/types";
import { getWishlistColor } from "../../wishlist/utils";

export default function FitToDay() {
  const [expanded, setExpanded] = useState(false);

  const { days, hiddenWishlistIds, showWishlist } = useSelector(
    (state: RootState) => state.map,
  );
  const params = useParams();
  const tripId = Number(params.tripId);
  const { data } = useGetWishlistsQuery(tripId);
  const wishlists = data?.data ?? [];
  const map = useMap();

  const selectedEvents = days
    .filter((day) => day.show)
    .flatMap((day) => day.events);

  const fitToAll = () => {
    if (map) fitToBounds({ map, events: selectedEvents });
  };

  const fitToDay = (date: string) => {
    const selectedEvents = days.find((day) => day.date === date)?.events;
    if (!selectedEvents) {
      console.error("Could not find events for this date");
      return;
    }
    if (map) fitToBounds({ map, events: selectedEvents });
  };

  const fitToWishlist = (wishlist: Wishlist) => {
    const itemsWithLocations = wishlist.items.filter(
      (i) => i.latitude && i.longitude && !i.isPromoted,
    );
    if (map)
      fitToBounds({
        map,
        events: itemsWithLocations as { latitude: number; longitude: number }[],
      });
  };

  const daysWithEvents = days.filter(
    (day) => day.events.length > 0 && day.show,
  );

  const wishlistButtons = wishlists
    .filter((list) => !hiddenWishlistIds.includes(list.id))
    .map((wishlist, index) => (
      <button
        key={wishlist.id}
        onClick={() => fitToWishlist(wishlist)}
        className={`m-0 mb-2 w-full flex items-center gap-2 text-sm cursor-pointer border-2 px-3 py-1`}
        style={{ color: getWishlistColor(index) }}
      >
        <span
          className="inline-block w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: getWishlistColor(index) }}
        />
        <span className="whitespace-nowrap">{wishlist.name}</span>
      </button>
    ));

  const showWishlistButtons = wishlistButtons.length > 0 && showWishlist;

  if (daysWithEvents.length === 0 && wishlists.length === 0) return;

  return (
    <div className="rounded-xl shadow-md max-h-[45vh] overflow-y-scroll">
      {expanded ? (
        <div className="card rounded-xl w-44 overflow-x-clip">
          <div className="flex items-center justify-between gap-2 mb-2 ">
            <h3 className="">Fit to day</h3>
            <button
              className="btn shadow-md p-0 translate-x-3 -translate-y-4"
              onClick={() => setExpanded(false)}
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {daysWithEvents.map((day) => (
              <button
                key={day.date}
                className="m-0 w-full flex items-center gap-2 text-sm cursor-pointer border-2 px-3 py-1"
                style={{ color: getDayColor(day.day - 1) }}
                onClick={() => fitToDay(day.date)}
              >
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: getDayColor(day.day - 1) }}
                />
                <span className="whitespace-nowrap">Day {day.day}</span>
              </button>
            ))}
            {daysWithEvents.length > 0 && (
              <button
                className="m-0 w-full flex items-center gap-2 text-sm cursor-pointer border-2 px-3 py-1"
                onClick={fitToAll}
              >
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-text-primary" />
                <span>All</span>
              </button>
            )}
          </div>
          {showWishlistButtons && (
            <div className="">
              <h4 className="mt-2 mb-2">Wishlists</h4>
              {wishlistButtons}
            </div>
          )}
        </div>
      ) : (
        <button
          className="bg-brand-secondary text-text-inverse btn-secondary p-2"
          onClick={() => setExpanded(true)}
        >
          <Maximize size={20} />
        </button>
      )}
    </div>
  );
}
