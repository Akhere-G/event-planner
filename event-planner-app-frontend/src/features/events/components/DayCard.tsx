import { useEffect, useRef, useState } from "react";
import type { Day } from "../types";
import { Accordion } from "../../../components";
import { formatDateRelative } from "../../../utils/dateFormattors";
import EventList from "./EventList";
import AddEventForm from "./AddEventForm";
import {
  Copy,
  LoaderCircle,
  MoreVertical,
  Sparkles,
  Wand2,
} from "lucide-react";
import {
  useOptimiseEventsMutation,
  useSuggestEventsMutation,
} from "../../ai/services/aiApiSlice";
import { useParams } from "react-router";
import { toast } from "sonner";
import { useGetTripQuery } from "../../trips/services/tripsApiSlice";

export default function DayCard({
  defaultIsOpen,
  day,
  canEdit,
}: {
  defaultIsOpen: boolean;
  canEdit: boolean;
  day: Day;
}) {
  const tripId = Number(useParams()?.tripId);
  const { isFetching } = useGetTripQuery(tripId);
  const [suggestEvents, { isLoading: isSuggestLoading }] =
    useSuggestEventsMutation();
  const [optimiseEvents, { isLoading: isOptimiseLoading }] =
    useOptimiseEventsMutation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuContainer = useRef<HTMLDivElement>(null);

  const getSuggestions = async () => {
    try {
      await suggestEvents({ tripId, date: day.date }).unwrap();
    } catch {
      toast.error("Could not get suggestions.");
    }
  };

  const getOptimisedEvents = async () => {
    try {
      await optimiseEvents({ tripId, date: day.date }).unwrap();
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

  const isSuggestBtnDisabled = isSuggestLoading || isFetching;
  const isOptimiseBtnDisabled = isOptimiseLoading || isFetching;

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
              className="z-1 flex flex-col gap-2 absolute top-full right-0 card p-0 text-sm"
            >
              <button
                onClick={() => {
                  const text = day.events
                    .map((e) => `${e.startAt} - ${e.name} (${e.address})`)
                    .join("\n");

                  navigator.clipboard.writeText(text);
                  toast.success("Itinerary copied to clipboard!");
                }}
                className="flex gap-2 btn-menu"
              >
                <Copy className="text-info" size={18} />
                Copy Events
              </button>
              <button
                onClick={getSuggestions}
                disabled={isSuggestBtnDisabled}
                className="flex gap-2 btn-menu"
              >
                {isSuggestBtnDisabled ? (
                  <LoaderCircle className="animate-spin" size={18} />
                ) : (
                  <Sparkles className="text-brand-primary" size={18} />
                )}
                Fill in day
              </button>
              <button
                onClick={getOptimisedEvents}
                disabled={isOptimiseBtnDisabled}
                className="flex gap-2 btn-menu"
              >
                {isOptimiseBtnDisabled ? (
                  <LoaderCircle className="animate-spin" size={18} />
                ) : (
                  <Wand2 className="text-brand-primary" size={18} />
                )}
                Optimise day
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
}
