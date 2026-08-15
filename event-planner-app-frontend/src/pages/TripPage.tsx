import { useParams } from "react-router";
import { useGetTripQuery } from "../features/trips/services/tripsApiSlice";
import { StateGate } from "../components";
import { isFetchBaseQueryError } from "../features/api/utils";
import { TripDetails, TripMap } from "../features/trips/components";
import { useState } from "react";
import ViewUsersModal from "../features/modal/components/ViewUsersModal";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../components/ui/resizable";
import type { Trip } from "../features/trips/types";
import { useBreakpoint } from "../hooks/useBreakpoint";

export default function TripPage() {
  const { tripId } = useParams();
  const { data, isLoading, isError, error } = useGetTripQuery(Number(tripId));
  const [showUsersModal, setShowUsersModal] = useState(false);

  const breakpoint = useBreakpoint();

  const isMobile = ["xs", "sm"].includes(breakpoint);
  return (
    <StateGate
      containerClasses="container"
      loadingStateProps={{ isLoading }}
      errorStateProps={{
        isError:
          isError && !(isFetchBaseQueryError(error) && error.status === 404),
        showReload: true,
      }}
      emptyStateProps={{
        isEmpty: isFetchBaseQueryError(error) && error.status === 404,
        message: "This trip could not be found.",
      }}
    >
      {isMobile ? (
        <MobileLayout trip={data!.data} />
      ) : (
        <DesktopLayout trip={data!.data} />
      )}
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
