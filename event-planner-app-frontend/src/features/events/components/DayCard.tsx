import type { AutofillConfig, Day } from "../types";
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
import {
  usePreviewEventSuggestionsMutation,
  usePreviewOptimisedEventsMutation,
} from "../../ai/services/aiApiSlice";
import { ChangePreviewModal } from "../../ai/components";
import type { ChangeOp } from "../../ai/types";
import { useParams } from "react-router";
import { toast } from "sonner";
import { useGetTripQuery } from "../../trips/services/tripsApiSlice";
import { useDispatch } from "react-redux";
import { setRoutes, toggleDayOpen } from "../../maps/service/mapSlice";
import type { Route } from "../../maps/types";
import AutofillDayForm from "./AutoFillDayForm";
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
  const { data: tripData, isFetching } = useGetTripQuery(tripId);
  const { data } = useGetAccommodationsQuery(tripId);
  const accommodations = data?.data ?? [];
  const { data: flightsData } = useGetFlightsQuery(tripId);
  const dayFlights = getFlightsForDay(flightsData?.data ?? [], day.date);

  const dispatch = useDispatch();
  const posthog = usePostHog();

  const [previewSuggestions, { isLoading: isSuggestLoading }] =
    usePreviewEventSuggestionsMutation();
  const [previewOptimised, { isLoading: isOptimiseLoading }] =
    usePreviewOptimisedEventsMutation();

  const [isFillMenuOpen, setIsFillMenuOpen] = useState(false);
  const [preview, setPreview] = useState<{
    kind: "fill" | "optimise";
    ops: ChangeOp[];
  } | null>(null);

  const isOpen = day.isOpen;

  const handleToggleOpen = () => {
    dispatch(toggleDayOpen(day.date));
    setViewingDay(isOpen ? null : day.date);
  };

  interface Autofill extends AutofillConfig {
    date: string;
  }
  const getSuggestions = async (autoFillData: Autofill) => {
    try {
      const { data } = await previewSuggestions({
        tripId,
        body: autoFillData,
      }).unwrap();
      setIsFillMenuOpen(false);
      if (!data.ops.length) {
        toast.info("No suggestions found for this day. Try different options.");
        return;
      }
      setPreview({ kind: "fill", ops: data.ops });
    } catch (err) {
      if (isApiError(err)) {
        toast.error(err.data.message);
      } else {
        posthog?.captureException(err);
        toast.error("Could not get suggestions.");
      }
    }
  };

  const getOptimisedEvents = async () => {
    try {
      const { data } = await previewOptimised({
        tripId,
        date: day.date,
      }).unwrap();
      if (!data.ops.length) {
        toast.info("There is nothing to optimise for this day.");
        return;
      }
      setPreview({ kind: "optimise", ops: data.ops });
    } catch (err) {
      if (isApiError(err)) {
        toast.error(err.data.message);
      } else {
        posthog?.captureException(err);
        toast.error("Could not optimise events.");
      }
    }
  };

  const handlePreviewApplied = () => {
    posthog?.capture(
      preview?.kind === "fill"
        ? "ai_fill_days_generated"
        : "ai_optimise_events_used",
      { trip_id: tripId },
    );
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

  const isSuggestBtnDisabled = isSuggestLoading || isFetching;
  const isOptimiseBtnDisabled = isOptimiseLoading || isFetching;

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
                      disabled={isSuggestBtnDisabled}
                      className="flex gap-2 items-center"
                    >
                      {isSuggestBtnDisabled ? (
                        <LoaderCircle className="animate-spin" size={18} />
                      ) : (
                        <Sparkles className="text-brand-primary" size={18} />
                      )}
                      Fill in day
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={getOptimisedEvents}
                      disabled={isOptimiseBtnDisabled}
                      className="flex gap-2 items-center"
                    >
                      {isOptimiseBtnDisabled ? (
                        <LoaderCircle className="animate-spin" size={18} />
                      ) : (
                        <Wand2 className="text-brand-primary" size={18} />
                      )}
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

      {preview && tripData?.data && (
        <ChangePreviewModal
          open
          onOpenChange={(open) => !open && setPreview(null)}
          tripId={tripId}
          timezone={tripData.data.timezone}
          ops={preview.ops}
          events={tripData.data.events ?? []}
          title={
            preview.kind === "fill"
              ? `Fill Day ${day.day}: review suggestions`
              : `Optimise Day ${day.day}: review changes`
          }
          onApplied={handlePreviewApplied}
        />
      )}

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
            disabled: isSuggestLoading,
          }}
        >
          <div className="p-4">
            <AutofillDayForm
              onSubmit={(autoFillData) =>
                getSuggestions({ ...autoFillData, date: day.date })
              }
            />
          </div>
        </ConfirmModal>
      )}
    </div>
  );
}
