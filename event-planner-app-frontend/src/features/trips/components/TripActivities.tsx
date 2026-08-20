import { useSearchParams } from "react-router";
import { Accordion } from "../../../components";
import { TripCalendar } from "../../calendar/components";
import { DayList } from "../../events/components";
import WishlistPanel from "../../wishlist/components/WishlistPanel";
import type { Trip } from "../types";

type ActivityView = "list" | "calendar";

// TODO: Use tab group

const viewOptions: { name: string; view: ActivityView }[] = [
  { name: "List", view: "list" },
  { name: "Calendar", view: "calendar" },
];

export default function TripActivities({ trip }: { trip: Trip }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const activityView: ActivityView =
    searchParams.get("activityView") === "calendar" ? "calendar" : "list";

  const setActivityView = (view: ActivityView) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("activityView", view);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="card p-0">
        <Accordion
          defaultIsOpen={false}
          TitleComponent={() => (
            <h2 className="text-lg font-semibold text-text-primary">
              Wishlists
            </h2>
          )}
          ContentComponent={() => (
            <div className="px-4">
              <WishlistPanel
                tripId={trip.id}
                role={trip.role}
                startDate={trip.startDate}
                endDate={trip.endDate}
                latitude={trip.latitude}
                longitude={trip.longitude}
              />
            </div>
          )}
        />
      </div>

      <div className="flex items-center">
        {viewOptions.map((option, index) => {
          let classNames =
            "btn-secondary px-4 py-2 border-2 border-surface-border border-l-0 rounded-none active:scale-100";

          if (activityView === option.view) {
            classNames +=
              " brightness-110 bg-brand-primary/10 border-brand-primary/50 text-text-primary font-bold";
          }
          if (index === 0) {
            classNames += " rounded-l-xl border-l-2";
          }
          if (index === viewOptions.length - 1) {
            classNames += " rounded-r-xl!";
          }

          return (
            <button
              key={option.view}
              type="button"
              onClick={() => setActivityView(option.view)}
              className={classNames}
              aria-pressed={activityView === option.view}
            >
              {option.name}
            </button>
          );
        })}
      </div>

      {activityView === "list" ? (
        <DayList role={trip.role} />
      ) : (
        <TripCalendar trip={trip} />
      )}
    </div>
  );
}
