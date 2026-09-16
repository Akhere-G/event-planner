import { useParams } from "react-router";
import { useGetTripQuery } from "../features/trips/services/tripsApiSlice";
import { StateGate } from "../components";
import { isFetchBaseQueryError } from "../features/api/utils";
import { TripDetails, TripMap } from "../features/trips/components";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import ViewUsersModal from "../features/modal/components/ViewUsersModal";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../components/ui/resizable";
import type { Trip } from "../features/trips/types";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { setDays } from "../features/maps/service/mapSlice";
import { getDaysWithFilter } from "../features/events/utils";
import { format, isAfter, isBefore, isSameDay, startOfToday } from "date-fns";
import { usePostHog } from "@posthog/react";

function getDefaultOpenDate(startDate: string, endDate: string) {
  const today = startOfToday();
  const tripStart = new Date(startDate);
  const tripEnd = new Date(endDate);

  if (
    isSameDay(today, tripStart) ||
    isSameDay(today, tripEnd) ||
    (isAfter(today, tripStart) && isBefore(today, tripEnd))
  ) {
    return format(today, "yyyy-MM-dd");
  }

  return format(tripStart, "yyyy-MM-dd");
}

export default function TripPage() {
  const { tripId } = useParams();
  const { data, isLoading, isError, error } = useGetTripQuery(Number(tripId));
  const [showUsersModal, setShowUsersModal] = useState(false);
  const dispatch = useDispatch();

  const breakpoint = useBreakpoint();

  const isMobile = ["xs", "sm"].includes(breakpoint);
  const posthog = usePostHog();

  useEffect(() => {
    posthog?.capture("trip_viewed", {
      trip_id: tripId,
    });
  }, [posthog, tripId]);

  useEffect(() => {
    if (data?.data) {
      const { events, startDate, endDate } = data.data;
      const defaultOpenDate = getDefaultOpenDate(startDate, endDate);
      dispatch(
        setDays(getDaysWithFilter(events, startDate, endDate, defaultOpenDate)),
      );
    }
  }, [data, dispatch]);

  useEffect(() => {
    if (data?.data) {
      const trip = data.data;
      posthog?.group("trip", String(trip.id), {
        name: trip.name,
        destination: trip.destination,
        member_count: trip.userMemberships.length,
        created_at: trip.createdAt,
      });
    }
  }, [posthog, data]);

  return (
    <StateGate
      containerClasses="container"
      loadingStateProps={{ isLoading }}
      errorStateProps={{
        isError:
          isError &&
          !(
            isFetchBaseQueryError(error) &&
            typeof error.status === "number" &&
            [404, 401].includes(error.status)
          ),
        showReload: true,
      }}
      emptyStateProps={{
        isEmpty:
          isFetchBaseQueryError(error) &&
          (error.status === 404 || error.status === 401),
        message:
          isFetchBaseQueryError(error) && error?.status === 404
            ? "This trip could not be found."
            : "You are not part of this trip.",
      }}
    >
      {data && isMobile && <MobileLayout trip={data.data} />}{" "}
      {data && !isMobile && <DesktopLayout trip={data.data} />}
      {showUsersModal && (
        <ViewUsersModal open={true} onOpenChange={setShowUsersModal} />
      )}
    </StateGate>
  );
}

function DesktopLayout({ trip }: { trip: Trip }) {
  return (
    <div className="hidden md:flex relative overflow-x-clip ">
      <div
        className={`flex-1 z-1 max-h-screen absolute w-full md:shadow-[20px_0_30px_-10px_rgba(0,0,0,0.3)] transition-transform duration-300 md:max-w-[50%] md:static  `}
      >
        <div className="container  h-[93.5vh] 2xl:h-[96vh] overflow-y-scroll ">
          <TripDetails {...trip} />
        </div>
      </div>
      <div
        className={`flex-1 overflow-clip absolute w-full transition-transform duration-300 md:static  `}
      >
        <TripMap trip={trip} />
      </div>
    </div>
  );
}
function MobileLayout({ trip }: { trip: Trip }) {
  return (
    <div className="flex flex-col h-screen">
      <ResizablePanelGroup orientation="vertical">
        <ResizablePanel defaultSize={50} minSize={0} maxSize="92vh">
          <div className="h-full">
            <TripMap trip={trip} />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="h-full overflow-y-auto bg-surface">
            <TripDetails {...trip} />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
