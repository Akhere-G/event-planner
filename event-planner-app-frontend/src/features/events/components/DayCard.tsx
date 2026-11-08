import type { Day } from "../types";
import { Accordion, ConfirmModal } from "../../../components";
import { formatDateRelative } from "../../../utils/dateFormattors";
import EventList from "./EventList";
import AddEventForm from "./AddEventForm";
import {
  LoaderCircle,
  Map,
  MoreVertical,
  Plane,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useCreateAiTaskMutation } from "../../aiTasks/services/aiTaskApiSlice";
import { useTripAiTasks } from "../../aiTasks/hooks";
import { activeTaskForDay } from "../../aiTasks/utils";
import OptimiseDayDialog from "../../aiTasks/components/OptimiseDayDialog";
import type {
  AiTaskParams,
  AiTaskType,
  OptimiseDayParams,
} from "../../aiTasks/types";
import { useParams } from "react-router";
import { toast } from "sonner";
import { useGetTripQuery } from "../../trips/services/tripsApiSlice";
import useTripEvents from "../hooks/useTripEvents";
import { useDispatch } from "react-redux";
import { setRoutes, toggleDayOpen } from "../../maps/service/mapSlice";
import type { Route } from "../../maps/types";
import AutofillDayForm from "./AutoFillDayForm";
import { useGetPreferencesQuery } from "../../trips/services/preferencesApiSlice";
import { autofillDefaultsFromPreferences } from "../../trips/preferenceUtils";
import { useGetAccommodationsQuery } from "../../accommodations/accomodationApiSlice";
import { useGetFlightsQuery } from "../../flights/flightApiSlice";
import {
  flightDepartureDate,
  flightTitle,
  formatFlightTime,
  getFlightsForDay,
} from "../../flights/utils";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { usePostHog } from "@posthog/react";
import { isApiError } from "../../api/utils";
import { DayViewers, setViewingDay } from "../../realtime";

export default function DayCard({
  day,
  canEdit,
}: {
  canEdit: boolean;
  day: Day;
}) {
  const tripId = Number(useParams()?.tripId);
  const { data: tripData } = useGetTripQuery(tripId);
  const { events: tripEvents } = useTripEvents(tripId);
  const { data } = useGetAccommodationsQuery(tripId);
  const accommodations = data?.data ?? [];
  const { data: flightsData } = useGetFlightsQuery(tripId);
  const dayFlights = getFlightsForDay(flightsData?.data ?? [], day.date);

  const dispatch = useDispatch();
  const posthog = usePostHog();

  const [createAiTask, { isLoading: isQueueing }] = useCreateAiTaskMutation();
  const { tasks: aiTasks } = useTripAiTasks(tripId, canEdit);
  const activeFill = activeTaskForDay(aiTasks, "fill_day", day.date);
  const activeOptimise = activeTaskForDay(aiTasks, "optimise_day", day.date);

  const [isFillMenuOpen, setIsFillMenuOpen] = useState(false);
  const [isOptimiseOpen, setIsOptimiseOpen] = useState(false);

  const { data: preferencesData } = useGetPreferencesQuery(tripId, {
    skip: !canEdit,
  });

  const isOpen = day.isOpen;

  const handleToggleOpen = () => {
    dispatch(toggleDayOpen(day.date));
    setViewingDay(isOpen ? null : day.date);
  };


  /** Starts the AI in the background; the result arrives as a proposal to review. */
  const queueTask = async <T extends AiTaskType>(
    type: T,
    params: AiTaskParams[T],
    closeForm: () => void,
  ) => {
    try {
      await createAiTask({ tripId, type, params }).unwrap();
      closeForm();
      toast.success(
        "On it. You can keep using the app, and we'll let you know when it's ready.",
      );
    } catch (err) {
      if (isApiError(err)) {
        toast.error(err.data.message);
      } else {
        posthog?.captureException(err);
        toast.error("Could not start the AI task.");
      }
    }
  };

  const viewAllRoutes = () => {
    if (!day.events.length) return;
    const routes: Route[] = [];
    const date = new Date(day.date);
    const accom = accommodations.find(
      (accom) =>
        new Date(accom.startDate) <= date && date <= new Date(accom.endDate),
    );
    if (accom) {
      routes.push({
        from: accom,
        to: day.events[0],
        mode: google.maps.TravelMode.TRANSIT,
      });
    }
    day.events.forEach(
      (event, i) =>
        i !== day.events.length - 1 &&
        routes.push({
          from: event,
          to: day.events[i + 1],
          mode: google.maps.TravelMode.TRANSIT,
        }),
    );
    if (accom) {
      routes.push({
        from: day.events[day.events.length - 1],
        to: accom,
        mode: google.maps.TravelMode.TRANSIT,
      });
    }
    dispatch(setRoutes(routes));
    posthog?.capture("day_routes_viewed", { trip_id: tripId });
  };

  const runningLabel = activeFill
    ? "Filling in…"
    : activeOptimise
      ? "Optimising…"
      : null;

  return (
    <div className="relative">
      <Accordion
        open={isOpen}
        TitleComponent={() => (
          <div className="flex justify-between gap-2 items-center w-full relative">
            <div className="flex flex-col items-start">
              <span className="text-[0.65rem] font-bold uppercase tracking-widest text-brand-primary/80 ">
                Day {day.day}
              </span>

              <h3 className="text-xl font-semibold tracking-tight text-text-primary">
                {formatDateRelative(day.date)}
              </h3>
              <DayViewers date={day.date} />
              {runningLabel && (
                <span
                  role="status"
                  className="mt-1 flex items-center gap-1 rounded-full bg-brand-primary/10 px-2 py-0.5 text-xs font-semibold text-brand-primary"
                >
                  <LoaderCircle className="animate-spin" size={12} />
                  {runningLabel}
                </span>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger
                onClick={(e) => e.stopPropagation()}
                className="btn p-2 -mr-4 -mt-8 text-sm"
              >
                <MoreVertical size={16} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={viewAllRoutes}
                  disabled={!day.events.length}
                  className="flex gap-2 items-center"
                >
                  <Map className="text-brand-primary" size={18} />
                  View all routes
                </DropdownMenuItem>
                {canEdit && (
                  <>
                    <DropdownMenuItem
                      onClick={(e) => {
                        setIsFillMenuOpen(true);
                        e.stopPropagation();
                      }}
                      disabled={!!activeFill}
                      className="flex gap-2 items-center"
                    >
                      <Sparkles className="text-brand-primary" size={18} />
                      Fill in day
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        setIsOptimiseOpen(true);
                        e.stopPropagation();
                      }}
                      disabled={!!activeOptimise}
                      className="flex gap-2 items-center"
                    >
                      <Wand2 className="text-brand-primary" size={18} />
                      Optimise day
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        ContentComponent={() => (
          <div className="px-4 ">
            {dayFlights.length > 0 && (
              <ul className="flex flex-col gap-2 pb-3" aria-label="Flights">
                {dayFlights.map((flight) => {
                  const departs = flightDepartureDate(flight) === day.date;
                  return (
                    <li
                      key={flight.id}
                      className="flex items-center gap-2 rounded-md bg-surface-muted px-3 py-2 text-sm text-text-main"
                    >
                      <Plane
                        size={14}
                        className="text-brand-primary shrink-0"
                      />
                      <span className="font-semibold">
                        {flightTitle(flight)}
                      </span>
                      <span className="text-text-secondary">
                        {departs
                          ? `departs ${formatFlightTime(flight.departAt, flight.departureTimezone)}`
                          : `arrives ${formatFlightTime(flight.arriveAt, flight.arrivalTimezone)}`}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
            <EventList events={day.events} />
            {canEdit && <AddEventForm date={day.date} />}
          </div>
        )}
        onOpenChange={handleToggleOpen}
      />

      {isFillMenuOpen && (
        <ConfirmModal
          open={isFillMenuOpen}
          onOpenChange={setIsFillMenuOpen}
          title={`Fill Day ${day.day}`}
          confirmText="Fill"
          confirmAction={() => {}}
          confirmBtnClasses="bg-brand-primary h-11 px-4"
          confirmButtonProps={{
            type: "submit",
            form: "autofill-itinerary-form",
            disabled: isQueueing,
          }}
        >
          <div className="p-4">
            <AutofillDayForm
              defaults={autofillDefaultsFromPreferences(preferencesData?.data)}
              onSubmit={(autoFillData) =>
                queueTask(
                  "fill_day",
                  { ...autoFillData, date: day.date },
                  () => setIsFillMenuOpen(false),
                )
              }
            />
          </div>
        </ConfirmModal>
      )}

      {isOptimiseOpen && tripData?.data && (
        <OptimiseDayDialog
          open={isOptimiseOpen}
          onOpenChange={setIsOptimiseOpen}
          tripStart={tripData.data.startDate}
          tripEnd={tripData.data.endDate}
          initialDate={day.date}
          events={tripEvents}
          tasks={aiTasks}
          isSubmitting={isQueueing}
          defaultPace={
            autofillDefaultsFromPreferences(preferencesData?.data).pace
          }
          onSubmit={(params: OptimiseDayParams) =>
            queueTask("optimise_day", params, () => setIsOptimiseOpen(false))
          }
        />
      )}
    </div>
  );
}
