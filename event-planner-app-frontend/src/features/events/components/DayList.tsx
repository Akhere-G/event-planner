import { useEffect, useMemo, useRef, useState } from "react";
import type { Day, Event } from "../types";
import { Accordion } from "../../../components";
import { formatDateRelative } from "../../../utils/dateFormattors";
import { makeDays } from "../utils";
import EventList from "./EventList";
import AddEventForm from "./AddEventForm";
import { canUserEdit } from "../../users/utils";
import { isAfter, isBefore, isSameDay, startOfToday } from "date-fns";
import { LoaderCircle, MoreVertical, Sparkles } from "lucide-react";
import { useSuggestEventsMutation } from "../../ai/services/aiApiSlice";
import { useParams } from "react-router";
import { toast } from "sonner";
import { useGetTripQuery } from "../../trips/services/tripsApiSlice";

export default function DayList({
  startDate,
  endDate,
  events,
  role,
}: {
  events: Event[];
  startDate: string;
  endDate: string;
  role: string;
}) {
  const days = useMemo(
    () => makeDays(events, startDate, endDate),
    [events, startDate, endDate],
  );
  const today = useMemo(() => startOfToday(), []);

  const isTripActive = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return (
      isSameDay(today, start) ||
      isSameDay(today, end) ||
      (isAfter(today, start) && isBefore(today, end))
    );
  }, [startDate, endDate, today]);

  const checkDefaultOpen = (index: number, dayDate: string) => {
    if (isTripActive) {
      return isSameDay(new Date(dayDate), today);
    }
    return index === 0;
  };

  return (
    <div className="flex flex-col gap-4">
      {days.map((day, index) => (
        <div key={day.date} className="card p-0 ">
          <DayCard
            defaultIsOpen={checkDefaultOpen(index, day.date)}
            day={day}
            canEdit={canUserEdit(role)}
          />
        </div>
      ))}
    </div>
  );
}

const DayCard = ({
  defaultIsOpen,
  day,
  canEdit,
}: {
  defaultIsOpen: boolean;
  canEdit: boolean;
  day: Day;
}) => {
  const tripId = Number(useParams()?.tripId);
  const { isFetching } = useGetTripQuery(tripId);
  const [suggestEvents, { isLoading }] = useSuggestEventsMutation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuContainer = useRef<HTMLDivElement>(null);

  const getSuggestions = async () => {
    try {
      await suggestEvents({ tripId, date: day.date }).unwrap();
    } catch {
      toast.error("Could not get suggestions.");
    }
  };
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!menuContainer.current?.contains(e.currentTarget as Node)) {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      window.addEventListener("click", handleClick);
    }

    return () => window.removeEventListener("click", handleClick);
  }, [isMenuOpen]);

  const isDisabled = isLoading || isFetching;
  return (
    <Accordion
      defaultIsOpen={defaultIsOpen}
      TitleComponent={() => (
        <div className="flex justify-between gap-2 items-center w-full relative">
          <div className="flex flex-col items-start">
            <span className="text-[0.65rem] font-bold uppercase tracking-widest text-brand-primary/80 ">
              Day {day.day}
            </span>

            <h3 className="text-xl font-semibold tracking-tight text-text-primary">
              {formatDateRelative(day.date)}
            </h3>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen((prev) => !prev);
            }}
            className="btn p-2 text-sm"
          >
            <MoreVertical />
          </button>
          {isMenuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="z-1 flex gap-2 absolute top-full right-0 card p-0 text-sm"
            >
              <button
                onClick={getSuggestions}
                disabled={isDisabled}
                className="flex gap-2 btn-menu"
              >
                {isDisabled ? (
                  <LoaderCircle className="animate-spin" size={18} />
                ) : (
                  <Sparkles className="text-brand-primary" size={18} />
                )}
                Fill in day
              </button>
            </div>
          )}
        </div>
      )}
      ContentComponent={() => (
        <div className="px-4 ">
          <EventList events={day.events} />
          {canEdit && <AddEventForm date={day.date} />}
        </div>
      )}
    />
  );
};
