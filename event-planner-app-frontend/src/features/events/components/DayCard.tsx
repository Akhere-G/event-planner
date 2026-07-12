import type { AutofillConfig, Day } from "../types";
import { Accordion, ConfirmModal } from "../../../components";
import { formatDateRelative } from "../../../utils/dateFormattors";
import EventList from "./EventList";
import AddEventForm from "./AddEventForm";
import { LoaderCircle, Map, MoreVertical, Sparkles, Wand2 } from "lucide-react";
import {
  useOptimiseEventsMutation,
  useSuggestEventsMutation,
} from "../../ai/services/aiApiSlice";
import { useParams } from "react-router";
import { toast } from "sonner";
import { useGetTripQuery } from "../../trips/services/tripsApiSlice";
import { useDispatch } from "react-redux";
import { setRoutes } from "../../maps/service/mapSlice";
import type { Route } from "../../maps/types";
import useMenu from "../../../hooks/useMenu";
import AutofillDayForm from "./AutoFillDayForm";
import { useGetAccommodationsQuery } from "../../accommodations/apiSlice";

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
  const { data } = useGetAccommodationsQuery(tripId);
  const accommodations = data?.data ?? [];

  const [suggestEvents, { isLoading: isSuggestLoading }] =
    useSuggestEventsMutation();
  const [optimiseEvents, { isLoading: isOptimiseLoading }] =
    useOptimiseEventsMutation();
  const dispatch = useDispatch();

  const { openButtonRef, isMenuOpen, toggleMenu, menuContainerRef } = useMenu({
    closeOnClick: true,
  });

  const {
    openButtonRef: openFillButtonRef,
    isMenuOpen: isFillMenuOpen,
    openMenu: openFillMenu,
    menuContainerRef: fillMenuContainerRef,
    closeMenu: closeFillMenu,
  } = useMenu({
    closeOnClick: true,
  });

  interface Autofill extends AutofillConfig {
    date: string;
  }
  const getSuggestions = async (autoFillData: Autofill) => {
    try {
      await suggestEvents({ tripId, body: autoFillData }).unwrap();
      closeFillMenu();
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
  };

  const isSuggestBtnDisabled = isSuggestLoading || isFetching;
  const isOptimiseBtnDisabled = isOptimiseLoading || isFetching;

  return (
    <div className="relative">
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
              ref={openButtonRef}
              onClick={(e) => {
                e.stopPropagation();
                toggleMenu();
              }}
              className="btn p-2 -mr-4 -mt-8 text-sm"
            >
              <MoreVertical size={16} />
            </button>
          </div>
        )}
        ContentComponent={() => (
          <div className="px-4 ">
            <EventList events={day.events} />
            {canEdit && <AddEventForm date={day.date} />}
          </div>
        )}
      />
      {isMenuOpen && (
        <div
          ref={menuContainerRef}
          className="z-1 flex flex-col gap-2 absolute top-8 right-6 card p-0 text-sm"
        >
          <button
            onClick={viewAllRoutes}
            disabled={!day.events.length}
            className="flex gap-2 btn-menu"
          >
            <Map className="text-brand-primary" size={18} />
            View all routes
          </button>

          <button
            onClick={(e) => {
              openFillMenu();
              e.stopPropagation();
            }}
            disabled={isSuggestBtnDisabled}
            className="flex gap-2 btn-menu"
            ref={openFillButtonRef}
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

      {isFillMenuOpen && (
        <ConfirmModal
          closeModal={closeFillMenu}
          title={`Fill Day ${day.day}`}
          confirmText="Fill"
          modalRef={fillMenuContainerRef}
          confirmAction={() => {}}
          confirmBtnClasses="bg-brand-primary"
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

      {isFillMenuOpen && <p>Hello</p>}
    </div>
  );
}
