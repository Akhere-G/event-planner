import { useState } from "react";
import { Layers3, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../store";
import {
  setDays,
  toggleWishlist,
  toggleWishlistId,
} from "../../maps/service/mapSlice";
import { getDayColor } from "../../events/utils";
import type { Day } from "../../events/types";
import type { Wishlist } from "../../wishlist/types";
import { getWishlistColor } from "../../wishlist/utils";

export function DayFilter({
  days,
  setDays,
  showWishlist,
  onToggleWishlist,
  wishlists,
  hiddenWishlistIds,
  onToggleWishlistId,
}: {
  days: Day[];
  setDays: (days: Day[]) => void;
  showWishlist: boolean;
  onToggleWishlist: () => void;
  wishlists: Wishlist[];
  hiddenWishlistIds: number[];
  onToggleWishlistId: (id: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const daysWithEvents = days.filter((day) => day.events.length > 0);

  const allChecked = daysWithEvents.every((day) => day.show);
  const noneChecked = daysWithEvents.every((day) => !day.show);

  const toggleDay = (date: string) => {
    setDays(
      days.map((day) =>
        day.date === date ? { ...day, show: !day.show } : day,
      ),
    );
  };

  const selectAllDays = () => {
    setDays(days.map((day) => ({ ...day, show: true })));
  };

  const deselectAllDays = () => {
    setDays(days.map((day) => ({ ...day, show: false })));
  };

  console.log("here");
  return (
    <div className="rounded-xl bg-surface shadow-md">
      {expanded ? (
        <div className="card bg-brand-secondary text-text-inverse rounded-xl w-44">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="">Filter</h3>
            <button
              className="p-0 translate-x-3 -translate-y-4"
              onClick={() => setExpanded(false)}
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {daysWithEvents.map((day) => (
              <label
                key={day.date}
                className="w-fit flex items-center justify-between gap-2  text-sm cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="p-0 m-0 h-4 w-4 shrink-0"
                  checked={day.show}
                  onChange={() =>
                    toggleDay(new Date(day.date).toISOString().substring(0, 10))
                  }
                />
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: getDayColor(day.day - 1) }}
                />
                <span className="whitespace-nowrap">Day {day.day}</span>
              </label>
            ))}
            <label className="w-fit flex items-center justify-between gap-2  text-sm cursor-pointer">
              <input
                type="checkbox"
                className="p-0 m-0 h-4 w-4 shrink-0"
                checked={allChecked}
                onChange={selectAllDays}
              />
              <span className="whitespace-nowrap">Select All</span>
            </label>
            <label className="w-fit flex items-center justify-between gap-2  text-sm cursor-pointer">
              <input
                type="checkbox"
                className="p-0 m-0 h-4 w-4 shrink-0"
                checked={noneChecked}
                onChange={deselectAllDays}
              />
              <span className="whitespace-nowrap">Deselect All</span>
            </label>

            <div className="mt-1 pt-1 border-t border-white/20 flex flex-col gap-1">
              <label className="w-fit flex items-center justify-between gap-2  text-sm cursor-pointer">
                <input
                  type="checkbox"
                  className="p-0 m-0 h-4 w-4 shrink-0"
                  checked={showWishlist}
                  onChange={onToggleWishlist}
                />
                <span className="whitespace-nowrap">Wishlists</span>
              </label>

              {showWishlist && wishlists.length > 0 && (
                <div className="ml-4 flex flex-col gap-1">
                  {wishlists.map((wishlist, index) => {
                    const color = getWishlistColor(index);
                    const isVisible = !hiddenWishlistIds.includes(wishlist.id);
                    return (
                      <label
                        key={wishlist.id}
                        className="w-fit flex items-center justify-between gap-2  text-sm cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="p-0 m-0 h-4 w-4 shrink-0"
                          checked={isVisible}
                          onChange={() => onToggleWishlistId(wishlist.id)}
                        />
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="whitespace-nowrap truncate max-w-[80px]">
                          {wishlist.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <button
          className="btn-secondary bg-brand-secondary text-text-inverse p-2"
          onClick={() => setExpanded(true)}
        >
          <Layers3 size={20} />
        </button>
      )}
    </div>
  );
}

export default function DayFilterConnected({
  wishlists,
}: {
  wishlists: Wishlist[];
}) {
  const { days, showWishlist, hiddenWishlistIds } = useSelector(
    (state: RootState) => state.map,
  );
  const dispatch = useDispatch();
  return (
    <DayFilter
      days={days}
      setDays={(days) => dispatch(setDays(days))}
      showWishlist={showWishlist}
      onToggleWishlist={() => dispatch(toggleWishlist())}
      wishlists={wishlists}
      hiddenWishlistIds={hiddenWishlistIds}
      onToggleWishlistId={(id) => dispatch(toggleWishlistId(id))}
    />
  );
}
