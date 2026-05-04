/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Trip } from "../../trips/types";
import withDragAndDrop, {
  type DragFromOutsideItemArgs,
  type EventInteractionArgs,
} from "react-big-calendar/lib/addons/dragAndDrop";
import { enGB } from "date-fns/locale/en-GB";
import {
  Calendar,
  dateFnsLocalizer,
  Views,
  type View,
  type Event as CalendarEvent,
} from "react-big-calendar";
import {
  format,
  getDay,
  isSameDay,
  parse,
  startOfWeek,
  startOfDay,
  addMilliseconds,
  setHours,
  setMinutes,
  isBefore,
  isAfter,
} from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { useBreakpoint } from "../../../hooks/useBreakpoint";
import { useEffect, useMemo, useState } from "react";
import CustomToolbar from "./CustomToolbar";
import CalendarCard from "./CalendarCard";
import EventModal from "./EventModal";
import type { Event } from "../../events/types";
import { useUpdateEvent } from "../../trips/hooks";
import { toast } from "sonner";
import CalendarEventList from "./CalendarEventList";

const locales = { "en-GB": enGB };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const DnDCalendar = (withDragAndDrop as any).default
  ? (withDragAndDrop as any).default(Calendar)
  : withDragAndDrop(Calendar);

export default function TripCalendar({ trip }: { trip: Trip }) {
  const [tripEvents, setTripEvents] = useState(trip.events);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [draggedEvent, setDraggedEvent] = useState<Event | null>(null);
  const [currentDate, setCurrentDate] = useState(
    trip.events.length > 0
      ? new Date(trip.events[0].startAt)
      : new Date(trip.startDate),
  );
  const [view, setView] = useState<View>(Views.MONTH);
  const { handleEdit } = useUpdateEvent({ tripId: trip.id });
  const breakpoint = useBreakpoint();
  const isMobile = ["xs", "sm", "md"].includes(breakpoint);

  useEffect(() => {
    async function syncTripEvents() {
      setTripEvents(trip.events);
    }
    syncTripEvents();
  }, [trip.events]);

  const events = useMemo(() => {
    if (!isMobile || view !== Views.MONTH) {
      return tripEvents.map((event) => ({
        id: event.id,
        title: event.name,
        start: new Date(event.startAt),
        end: new Date(event.endAt),
        allDay: false,
        resource: event,
      }));
    }

    const groupedEvents = new Map<number, number>();

    tripEvents.forEach((event) => {
      const dayTimestamp = startOfDay(new Date(event.startAt)).getTime();
      groupedEvents.set(
        dayTimestamp,
        (groupedEvents.get(dayTimestamp) || 0) + 1,
      );
    });

    return Array.from(groupedEvents.entries()).map(([timestamp, count]) => ({
      id: `summary-${timestamp}`,
      title: `${count} events`,
      start: new Date(timestamp),
      end: new Date(timestamp),
      allDay: true,
      isSummary: true,
      resource: count,
    }));
  }, [tripEvents, isMobile, view]);

  const getDayClasses = (date: Date) => {
    const isSelected = isSameDay(date, currentDate);
    const isToday = isSameDay(date, new Date());
    const isCurrentMonth = date.getMonth() === currentDate.getMonth();

    let bgClass = isCurrentMonth ? "bg-surface" : "bg-surface-muted!";

    const tripDay =
      isSameDay(date, trip.startDate) ||
      isSameDay(date, trip.endDate) ||
      (isAfter(date, trip.startDate) && isBefore(date, trip.endDate));
    if (isToday) {
      bgClass = "!font-bold bg-blue-200! dark:bg-blue-600/50!";
    } else if (isSelected) {
      bgClass = "bg-brand-primary/20! dark:!bg-brand-primary/50";
    } else if (!tripDay) {
      bgClass = "bg-surface-muted/50! cursor-not-allowed!";
    }

    return `transition-all duration-150 cursor-pointer relative ${bgClass} hover:bg-brand-primary/20`;
  };

  const handleEventClick = (calendarEvent: any) => {
    if (calendarEvent.isSummary) return;

    setSelectedEvent(calendarEvent.resource);
  };

  function onDropFromOutside(day: DragFromOutsideItemArgs) {
    if (!draggedEvent) return;

    const startAt = new Date(draggedEvent.startAt);
    const endAt = new Date(draggedEvent.endAt);

    let newStartAt = new Date(day.start);

    if (isBefore(newStartAt, trip.startDate)) {
      toast.error("Cannot move event to before the trip start date!");
      return;
    }

    if (isAfter(newStartAt, trip.endDate)) {
      toast.error("Cannot move event to after the trip end date!");
      return;
    }

    newStartAt = setHours(newStartAt, startAt.getHours());
    newStartAt = setMinutes(newStartAt, startAt.getMinutes());

    const newEndAt = addMilliseconds(
      newStartAt,
      endAt.getTime() - startAt.getTime(),
    );

    const prev = tripEvents;
    try {
      const startAt = format(newStartAt, "yyyy-MM-dd HH:mm");
      const endAt = format(newEndAt, "yyyy-MM-dd HH:mm");

      setTripEvents((prev) =>
        prev.map((e) =>
          e.id === draggedEvent.id ? { ...e, startAt, endAt } : e,
        ),
      );

      handleEdit(draggedEvent.id, {
        startAt,
        endAt,
      });
    } catch (err) {
      console.error(err);
      toast.error("Could not edit event.");
      setTripEvents(prev);
    } finally {
      setDraggedEvent(null);
    }
  }

  const onEventDrop = async ({
    event,
    start,
    end,
  }: EventInteractionArgs<CalendarEvent>) => {
    const newStart = new Date(start as Date);
    const newEnd = new Date(end as Date);
    const eventItem = event.resource as Event;

    if ("isSummary" in event) return;

    const formattedStart = format(newStart, "yyyy-MM-dd HH:mm:ss");
    const formattedEnd = format(newEnd, "yyyy-MM-dd HH:mm:ss");

    if (isBefore(newStart, trip.startDate)) {
      toast.error("Cannot move event to before the trip start date!");
      return;
    }

    if (isAfter(newStart, trip.endDate)) {
      toast.error("Cannot move event to after the trip end date!");
      return;
    }

    const prevEvents = tripEvents;
    try {
      setTripEvents(
        tripEvents.map((e) =>
          e.id === eventItem.id
            ? {
                ...e,
                startAt: formattedStart,
                endAt: formattedEnd,
              }
            : e,
        ),
      );

      await handleEdit(eventItem.id, {
        startAt: formattedStart,
        endAt: formattedEnd,
      });
    } catch {
      toast.error("Could not edit event.");
      setTripEvents(prevEvents);
    }
  };

  const eventsForSelectedDay = tripEvents.filter((t) =>
    isSameDay(new Date(t.startAt), currentDate),
  );

  return (
    <div className="md:w-[calc(50vw-3rem)]">
      <div className="card h-120 lg:h-150">
        <DnDCalendar
          localizer={localizer}
          events={events}
          date={currentDate}
          view={view}
          views={[Views.MONTH, Views.WEEK, Views.DAY]}
          popup={!isMobile}
          selectable
          onEventDrop={onEventDrop}
          onSelectEvent={handleEventClick}
          onNavigate={setCurrentDate}
          onDropFromOutside={onDropFromOutside}
          handleDragStart={(event: any) => {
            setDraggedEvent(event.resource);
          }}
          onDrillDown={(date: Date) => {
            setCurrentDate(date);
            if (!isMobile) setView(Views.DAY);
          }}
          onSelectSlot={({ start, action }: any) => {
            if (action === "click") setCurrentDate(new Date(start));
          }}
          dayPropGetter={(date: Date) => ({
            className: getDayClasses(date),
          })}
          eventPropGetter={(event: any) => ({
            className: event.isSummary
              ? "!bg-transparent !border-none !shadow-none p-0 m-0 hover:!bg-transparent !pointer-events-none" // Hide container for dots
              : "!border-none !shadow-sm !rounded-md !px-1 !py-1 !text-xs !font-medium transition-all !bg-brand-primary !text-text-inverse",
          })}
          components={{
            toolbar: () => (
              <CustomToolbar
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                view={view}
                setView={setView}
                isMobile={isMobile}
              />
            ),
            event: ({ title, event }: any) => {
              if (event.isSummary) {
                return (
                  <div className="flex flex-wrap justify-center items-center gap-0.5 w-full mt-1 pointer-events-none">
                    {new Array(event.resource).fill(1).map((_, i) => (
                      <span
                        key={i}
                        className="h-2 w-2 rounded-full bg-brand-primary shadow-sm"
                      />
                    ))}
                  </div>
                );
              }

              return (
                <CalendarCard
                  title={title}
                  event={event}
                  isMobile={isMobile}
                  view={view}
                />
              );
            },
          }}
        />
      </div>
      <div className="grid gap-4 mt-4">
        <CalendarEventList
          events={eventsForSelectedDay}
          currentDate={currentDate}
          setSelectedEvent={(event: Event) => setSelectedEvent(event)}
          setDraggedEvent={setDraggedEvent}
        />
      </div>
      {selectedEvent && (
        <EventModal
          isOpen={!!selectedEvent}
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
